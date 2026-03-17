/**
 * Recipe Command
 *
 * Manage and execute recipes
 */

import type { Command } from 'commander';

import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import type { PluginContext } from '../types/index.js';

import { RecipeEngine } from '../core/recipe-engine.js';
import { RecipeRegistry } from '../core/recipe-registry.js';
import { RecipeRemoteLoader } from '../core/recipe-remote-loader.js';

export function registerRecipeCommand(program: Command, ctx: PluginContext): void {
  const recipe = program.command('recipe').description('Manage and execute recipes');

  const registry = new RecipeRegistry(ctx.logger);

  // recipe:list - List available recipes
  recipe
    .command('list')
    .alias('ls')
    .description('List available recipes')
    .option('-c, --category <category>', 'Filter by category')
    .action(async (options: { category?: string }) => {
      ctx.logger.step('Available Recipes');

      try {
        const recipes = await registry.search('', { category: options.category });

        if (recipes.length === 0) {
          ctx.logger.info('No recipes found');
          return;
        }

        ctx.logger.info('');
        for (const r of recipes) {
          const verifiedBadge = r.verified ? '✓' : ' ';
          ctx.logger.info(`  [${verifiedBadge}] ${r.name} v${r.version}`);
          ctx.logger.info(`      ${r.description}`);
          ctx.logger.info(`      Category: ${r.category} | Downloads: ${r.downloads || 0}/week`);
          if (r.tags && r.tags.length > 0) {
            ctx.logger.info(`      Tags: ${r.tags.join(', ')}`);
          }
          ctx.logger.info('');
        }

        ctx.logger.success(`Found ${recipes.length} recipes`);
      } catch (error) {
        ctx.logger.error('Failed to list recipes', error as Error);
      }
    });

  // recipe:search - Search for recipes
  recipe
    .command('search')
    .description('Search for recipes')
    .argument('[query]', 'Search query', '')
    .option('-c, --category <category>', 'Filter by category')
    .action(async (query: string, options: { category?: string }) => {
      ctx.logger.step(`Searching recipes: ${query || 'all'}`);

      try {
        const results = await registry.search(query, { category: options.category });

        if (results.length === 0) {
          ctx.logger.info('No recipes found');
          return;
        }

        ctx.logger.info('');
        for (const r of results) {
          const verifiedBadge = r.verified ? '✓' : ' ';
          ctx.logger.info(`  [${verifiedBadge}] ${r.name} v${r.version}`);
          ctx.logger.info(`      ${r.description}`);
          ctx.logger.info(`      Category: ${r.category}`);
          ctx.logger.info('');
        }

        ctx.logger.success(`Found ${results.length} recipes`);
      } catch (error) {
        ctx.logger.error('Failed to search recipes', error as Error);
      }
    });

  // recipe:info - Get recipe information
  recipe
    .command('info')
    .description('Get detailed information about a recipe')
    .argument('<name>', 'Recipe name')
    .action(async (name: string) => {
      ctx.logger.step(`Recipe Information: ${name}`);

      try {
        const info = await registry.getInfo(name);

        if (!info) {
          ctx.logger.error(`Recipe '${name}' not found`);
          return;
        }

        ctx.logger.info('');
        ctx.logger.info(`Name: ${info.name}`);
        ctx.logger.info(`Version: ${info.version}`);
        ctx.logger.info(`Description: ${info.description}`);
        ctx.logger.info(`Author: ${info.author}`);
        ctx.logger.info(`Verified: ${info.verified ? 'Yes' : 'No'}`);
        ctx.logger.info(`Category: ${info.category}`);

        if (info.tags && info.tags.length > 0) {
          ctx.logger.info(`Tags: ${info.tags.join(', ')}`);
        }

        if (info.requires) {
          ctx.logger.info('\nRequirements:');
          if (info.requires.kubitVersion) {
            ctx.logger.info(`  Kubit CLI: ${info.requires.kubitVersion}`);
          }
          if (info.requires.nodeVersion) {
            ctx.logger.info(`  Node.js: ${info.requires.nodeVersion}`);
          }
          if (info.requires.plugins && info.requires.plugins.length > 0) {
            ctx.logger.info(`  Plugins: ${info.requires.plugins.join(', ')}`);
          }
        }

        ctx.logger.info(`\nDownloads: ${info.downloads || 0}/week`);
        ctx.logger.info(`Last Updated: ${info.updated || 'Unknown'}`);
        ctx.logger.info('');
      } catch (error) {
        ctx.logger.error('Failed to get recipe info', error as Error);
      }
    });

  // recipe:run - Execute a recipe
  recipe
    .command('run')
    .description('Execute a recipe')
    .argument('<name>', 'Recipe name')
    .option('-d, --dry-run', 'Simulate execution without making changes')
    .option('-v, --variables <json>', 'Variables as JSON string')
    .option('--variables-file <path>', 'Path to JSON file with variables')
    .action(
      async (
        name: string,
        options: { dryRun?: boolean; variables?: string; variablesFile?: string }
      ) => {
        ctx.logger.step(`Executing recipe: ${name}`);

        if (options.dryRun) {
          ctx.logger.warn('DRY RUN MODE - No changes will be made');
        }

        try {
          // Initialize recipe engine
          const recipeEngine = new RecipeEngine(ctx.logger, ctx.cwd, ctx);

          // Load recipe from local examples directory
          const recipePath = join(
            ctx.cwd,
            'app',
            'src',
            'recipes',
            'examples',
            `${name}.recipe.json`
          );

          if (!existsSync(recipePath)) {
            ctx.logger.error(`Recipe '${name}' not found at ${recipePath}`);
            ctx.logger.info('Available recipes:');
            ctx.logger.info('  - conditional-setup');
            ctx.logger.info('  - parametrized-component-generator');
            ctx.logger.info('  - loop-migration');
            ctx.logger.info('  - monorepo-setup');
            ctx.logger.info('  - github-actions-ci');
            ctx.logger.info('  - docker-setup');
            ctx.logger.info('  - testing-setup-complete');
            return;
          }

          // Load recipe
          const recipe = recipeEngine.loadRecipe(recipePath);

          // Parse variables
          let variables: Record<string, unknown> = {};

          if (options.variablesFile) {
            const varFilePath = join(ctx.cwd, options.variablesFile);
            if (existsSync(varFilePath)) {
              const { readFileSync } = await import('fs');
              variables = JSON.parse(readFileSync(varFilePath, 'utf-8'));
            } else {
              ctx.logger.warn(`Variables file not found: ${varFilePath}`);
            }
          }

          if (options.variables) {
            const parsedVars = JSON.parse(options.variables);
            variables = { ...variables, ...parsedVars };
          }

          // Execute recipe
          const result = await recipeEngine.executeRecipe(recipe.name, {
            dryRun: options.dryRun,
            variables,
          });

          // Display results
          ctx.logger.info('');
          ctx.logger.info('Execution Summary:');
          ctx.logger.info(`  Steps executed: ${result.stepsExecuted}`);
          ctx.logger.info(`  Steps failed: ${result.stepsFailed}`);
          ctx.logger.info(`  Steps skipped: ${result.stepsSkipped}`);
          ctx.logger.info(`  Duration: ${result.duration}ms`);

          if (result.errors.length > 0) {
            ctx.logger.info('');
            ctx.logger.error('Errors:');
            result.errors.forEach((err) => {
              ctx.logger.error(`  [${err.step}] ${err.error}`);
            });
          }

          if (result.warnings.length > 0) {
            ctx.logger.info('');
            ctx.logger.warn('Warnings:');
            result.warnings.forEach((warn) => {
              ctx.logger.warn(`  ${warn}`);
            });
          }

          if (result.success) {
            ctx.logger.success('\n✓ Recipe executed successfully!');
          } else {
            ctx.logger.error('\n✗ Recipe execution failed');
            process.exit(1);
          }
        } catch (error) {
          ctx.logger.error('Failed to execute recipe', error as Error);
          process.exit(1);
        }
      }
    );

  // recipe:featured - List featured recipes
  recipe
    .command('featured')
    .description('List featured/recommended recipes')
    .action(async () => {
      ctx.logger.step('Featured Recipes');

      try {
        const featured = await registry.getFeatured();

        if (featured.length === 0) {
          ctx.logger.info('No featured recipes available');
          return;
        }

        ctx.logger.info('');
        for (const r of featured) {
          ctx.logger.info(`  ⭐ ${r.name} v${r.version}`);
          ctx.logger.info(`      ${r.description}`);
          ctx.logger.info(`      ${r.downloads || 0} downloads/week`);
          ctx.logger.info('');
        }

        ctx.logger.success(`${featured.length} featured recipes`);
      } catch (error) {
        ctx.logger.error('Failed to get featured recipes', error as Error);
      }
    });

  // recipe:categories - List recipe categories
  recipe
    .command('categories')
    .description('List all recipe categories')
    .action(() => {
      ctx.logger.step('Recipe Categories');

      const categories = [
        { description: 'Complete project setup and initialization', name: 'setup' },
        { description: 'Add specific features to your project', name: 'feature' },
        { description: 'Development tools and utilities', name: 'tooling' },
        { description: 'CI/CD and deployment configurations', name: 'deployment' },
        { description: 'Project maintenance and updates', name: 'maintenance' },
      ];

      ctx.logger.info('');
      for (const cat of categories) {
        ctx.logger.info(`  ${cat.name}`);
        ctx.logger.info(`    ${cat.description}`);
        ctx.logger.info('');
      }
    });

  // recipe:load - Load recipe from remote source
  recipe
    .command('load')
    .description('Load recipe from remote source (GitHub, URL, NPM)')
    .argument('<source>', 'Recipe source (github:owner/repo/path@ref, https://..., npm:package)')
    .action(async (source: string) => {
      ctx.logger.step(`Loading recipe from: ${source}`);

      try {
        const cacheDir = join(homedir(), '.kubit', 'cache', 'recipes');
        const remoteLoader = new RecipeRemoteLoader(ctx.logger, cacheDir);

        const recipe = await remoteLoader.loadRemote(source);

        ctx.logger.success(`✓ Recipe loaded: ${recipe.name} v${recipe.version}`);
        ctx.logger.info(`Description: ${recipe.description}`);
        ctx.logger.info('\nTo execute this recipe, run:');
        ctx.logger.info(`  kubit-forge recipe:run ${recipe.name}`);
      } catch (error) {
        ctx.logger.error('Failed to load recipe', error as Error);
        ctx.logger.info('\nSupported formats:');
        ctx.logger.info('  - github:owner/repo/path@ref');
        ctx.logger.info('  - https://example.com/recipe.json');
        ctx.logger.info('  - npm:package-name');
        process.exit(1);
      }
    });

  // recipe:cache:info - Show cache information
  recipe
    .command('cache:info')
    .description('Show recipe cache information')
    .action(() => {
      ctx.logger.step('Recipe Cache Information');

      try {
        const cacheDir = join(homedir(), '.kubit', 'cache', 'recipes');
        const remoteLoader = new RecipeRemoteLoader(ctx.logger, cacheDir);

        const stats = remoteLoader.getCacheStats();

        ctx.logger.info('');
        ctx.logger.info(`Cache directory: ${cacheDir}`);
        ctx.logger.info(`Total entries: ${stats.entries}`);
        ctx.logger.info(`Cache size: ${(stats.size / 1024).toFixed(2)} KB`);

        if (stats.entries > 0) {
          const age = Date.now() - stats.oldestEntry;
          const hours = Math.floor(age / (1000 * 60 * 60));
          ctx.logger.info(`Oldest entry: ${hours} hours ago`);
        }

        ctx.logger.info('');
        ctx.logger.info('Cache TTL: 24 hours');
      } catch (error) {
        ctx.logger.error('Failed to get cache info', error as Error);
      }
    });

  // recipe:cache:clear - Clear recipe cache
  recipe
    .command('cache:clear')
    .description('Clear recipe cache')
    .action(() => {
      ctx.logger.step('Clearing recipe cache...');

      try {
        const cacheDir = join(homedir(), '.kubit', 'cache', 'recipes');
        const remoteLoader = new RecipeRemoteLoader(ctx.logger, cacheDir);

        remoteLoader.clearCache();
        ctx.logger.success('✓ Recipe cache cleared');
      } catch (error) {
        ctx.logger.error('Failed to clear cache', error as Error);
      }
    });

  // recipe:validate - Validate recipe file
  recipe
    .command('validate')
    .description('Validate a recipe file')
    .argument('<path>', 'Path to recipe file')
    .action(async (path: string) => {
      ctx.logger.step(`Validating recipe: ${path}`);

      try {
        const recipePath = join(ctx.cwd, path);

        if (!existsSync(recipePath)) {
          ctx.logger.error(`Recipe file not found: ${recipePath}`);
          return;
        }

        const recipeEngine = new RecipeEngine(ctx.logger, ctx.cwd, ctx);
        const recipe = recipeEngine.loadRecipe(recipePath);

        ctx.logger.success('✓ Recipe is valid');
        ctx.logger.info('');
        ctx.logger.info(`Name: ${recipe.name}`);
        ctx.logger.info(`Version: ${recipe.version}`);
        ctx.logger.info(`Description: ${recipe.description}`);
        ctx.logger.info(`Steps: ${recipe.steps.length}`);

        if (recipe.variables) {
          ctx.logger.info(`Variables: ${Object.keys(recipe.variables).length}`);
        }

        if (recipe.prerequisites) {
          ctx.logger.info('Prerequisites: defined');
        }
      } catch (error) {
        ctx.logger.error('Recipe validation failed', error as Error);
        process.exit(1);
      }
    });
}
