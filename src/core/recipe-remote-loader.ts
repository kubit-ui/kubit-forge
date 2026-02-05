/**
 * Recipe Remote Loader
 *
 * Load recipes from remote sources:
 * - GitHub repositories
 * - Direct URLs
 * - NPM packages
 * - Recipe registry
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

import type { Logger } from '../types/index.js';
import type { RecipeV2 } from './recipe-engine.js';

export interface RemoteRecipeSource {
  type: 'github' | 'url' | 'npm' | 'registry';
  location: string;
  ref?: string; // For GitHub: branch, tag, or commit
  path?: string; // Path within repository
}

export interface RecipeCache {
  recipes: Map<string, { recipe: RecipeV2; timestamp: number; source: string }>;
  cacheDir: string;
}

export class RecipeRemoteLoader {
  private logger: Logger;
  private cache: RecipeCache;
  private cacheMaxAge: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor(logger: Logger, cacheDir: string) {
    this.logger = logger;
    this.cache = {
      cacheDir,
      recipes: new Map(),
    };

    // Ensure cache directory exists
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }

    this.loadCacheFromDisk();
  }

  /**
   * Load recipe from remote source
   */
  async loadRemote(source: string | RemoteRecipeSource): Promise<RecipeV2> {
    const parsedSource = typeof source === 'string' ? this.parseSource(source) : source;

    this.logger.info(`Loading recipe from ${parsedSource.type}: ${parsedSource.location}`);

    // Check cache first
    const cached = this.getCached(parsedSource);
    if (cached) {
      this.logger.debug('Using cached recipe');
      return cached;
    }

    // Load based on source type
    let recipe: RecipeV2;

    switch (parsedSource.type) {
      case 'github':
        recipe = await this.loadFromGitHub(parsedSource);
        break;
      case 'url':
        recipe = await this.loadFromURL(parsedSource);
        break;
      case 'npm':
        recipe = await this.loadFromNPM(parsedSource);
        break;
      case 'registry':
        recipe = await this.loadFromRegistry(parsedSource);
        break;
      default:
        throw new Error(`Unsupported source type: ${(parsedSource as RemoteRecipeSource).type}`);
    }

    // Cache the recipe
    this.cacheRecipe(parsedSource, recipe);

    return recipe;
  }

  /**
   * Parse source string into RemoteRecipeSource
   *
   * Supported formats:
   * - github:owner/repo/path@ref
   * - https://example.com/recipe.json
   * - npm:package-name
   * - registry:recipe-name
   */
  private parseSource(source: string): RemoteRecipeSource {
    // GitHub format
    if (source.startsWith('github:')) {
      const parts = source.slice(7).split('@');
      const [location, ref] = parts;
      const pathParts = location.split('/');
      const owner = pathParts[0];
      const repo = pathParts[1];
      const path = pathParts.slice(2).join('/') || 'recipe.json';

      return {
        location: `${owner}/${repo}`,
        path,
        ref: ref || 'main',
        type: 'github',
      };
    }

    // URL format
    if (source.startsWith('http://') || source.startsWith('https://')) {
      return {
        location: source,
        type: 'url',
      };
    }

    // NPM format
    if (source.startsWith('npm:')) {
      return {
        location: source.slice(4),
        type: 'npm',
      };
    }

    // Registry format (default)
    return {
      location: source,
      type: 'registry',
    };
  }

  /**
   * Load recipe from GitHub
   */
  private async loadFromGitHub(source: RemoteRecipeSource): Promise<RecipeV2> {
    const [owner, repo] = source.location.split('/');
    const ref = source.ref || 'main';
    const path = source.path || 'recipe.json';

    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;

    this.logger.debug(`Fetching from GitHub: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch recipe: ${response.statusText}`);
      }

      const content = await response.text();
      const recipe = JSON.parse(content) as RecipeV2;

      return recipe;
    } catch {
      throw new Error(`Failed to load recipe from GitHub: ${source.location}`);
    }
  }

  /**
   * Load recipe from direct URL
   */
  private async loadFromURL(source: RemoteRecipeSource): Promise<RecipeV2> {
    this.logger.debug(`Fetching from URL: ${source.location}`);

    try {
      const response = await fetch(source.location);
      if (!response.ok) {
        throw new Error(`Failed to fetch recipe: ${response.statusText}`);
      }

      const content = await response.text();
      const recipe = JSON.parse(content) as RecipeV2;

      return recipe;
    } catch {
      throw new Error(`Failed to load recipe from URL: ${source.location}`);
    }
  }

  /**
   * Load recipe from NPM package
   */
  private async loadFromNPM(source: RemoteRecipeSource): Promise<RecipeV2> {
    this.logger.debug(`Loading from NPM: ${source.location}`);

    // In production, would use npm registry API or install package
    // For now, simulate by fetching from unpkg
    const url = `https://unpkg.com/${source.location}/recipe.json`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch recipe: ${response.statusText}`);
      }

      const content = await response.text();
      const recipe = JSON.parse(content) as RecipeV2;

      return recipe;
    } catch {
      throw new Error(`Failed to load recipe from NPM: ${source.location}`);
    }
  }

  /**
   * Load recipe from registry
   */
  private async loadFromRegistry(source: RemoteRecipeSource): Promise<RecipeV2> {
    this.logger.debug(`Loading from registry: ${source.location}`);

    // In production, would fetch from actual registry
    const registryUrl = process.env.KUBIT_RECIPE_REGISTRY || 'https://recipes.kubit-forge.org';
    const url = `${registryUrl}/recipes/${source.location}.json`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Recipe not found in registry: ${source.location}`);
      }

      const content = await response.text();
      const recipe = JSON.parse(content) as RecipeV2;

      return recipe;
    } catch (error) {
      throw new Error(
        `Failed to load recipe from registry: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get cached recipe if available and not expired
   */
  private getCached(source: RemoteRecipeSource): RecipeV2 | null {
    const key = this.getCacheKey(source);
    const cached = this.cache.recipes.get(key);

    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    if (age > this.cacheMaxAge) {
      this.cache.recipes.delete(key);
      return null;
    }

    return cached.recipe;
  }

  /**
   * Cache a recipe
   */
  private cacheRecipe(source: RemoteRecipeSource, recipe: RecipeV2): void {
    const key = this.getCacheKey(source);
    this.cache.recipes.set(key, {
      recipe,
      source: JSON.stringify(source),
      timestamp: Date.now(),
    });

    this.saveCacheToDisk();
  }

  /**
   * Generate cache key from source
   */
  private getCacheKey(source: RemoteRecipeSource): string {
    return `${source.type}:${source.location}${source.ref ? `@${source.ref}` : ''}${source.path ? `:${source.path}` : ''}`;
  }

  /**
   * Load cache from disk
   */
  private loadCacheFromDisk(): void {
    const cachePath = join(this.cache.cacheDir, 'recipes-cache.json');
    if (!existsSync(cachePath)) {
      return;
    }

    try {
      const content = readFileSync(cachePath, 'utf-8');
      const data = JSON.parse(content);

      for (const [key, value] of Object.entries(data)) {
        this.cache.recipes.set(
          key,
          value as { recipe: RecipeV2; timestamp: number; source: string }
        );
      }

      this.logger.debug(`Loaded ${this.cache.recipes.size} recipes from cache`);
    } catch {
      this.logger.warn('Failed to load recipe cache from disk');
    }
  }

  /**
   * Save cache to disk
   */
  private saveCacheToDisk(): void {
    const cachePath = join(this.cache.cacheDir, 'recipes-cache.json');
    const data = Object.fromEntries(this.cache.recipes.entries());

    try {
      writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      this.logger.warn('Failed to save recipe cache to disk');
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.recipes.clear();
    this.saveCacheToDisk();
    this.logger.success('Recipe cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { entries: number; size: number; oldestEntry: number } {
    let oldestTimestamp = Date.now();

    for (const entry of this.cache.recipes.values()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
      }
    }

    return {
      entries: this.cache.recipes.size,
      oldestEntry: oldestTimestamp,
      size: JSON.stringify(Object.fromEntries(this.cache.recipes.entries())).length,
    };
  }
}
