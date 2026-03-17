import type { Logger } from '../types/index.js';

/**
 * Plugin information from registry
 */
export interface PluginInfo {
  /** Plugin name (npm package name) */
  name: string;
  /** Current version */
  version: string;
  /** Short description */
  description: string;
  /** Author name */
  author: string;
  /** Homepage URL */
  homepage?: string;
  /** Repository URL */
  repository?: string;
  /** Whether this is a verified plugin */
  verified: boolean;
  /** Required kubit-forge version */
  kubitVersion?: string;
  /** Plugin category */
  category: 'quality' | 'generator' | 'framework' | 'tooling' | 'utility';
  /** Download count (weekly) */
  downloads?: number;
  /** Last update date */
  updated?: string;
  /** Required capabilities */
  capabilities?: string[];
  /** Tags for search */
  tags?: string[];
}

/**
 * Plugin registry client
 *
 * Manages plugin discovery, search, and metadata retrieval.
 * Uses npm registry as source of truth with optional curated index.
 */
export class PluginRegistry {
  private logger: Logger;

  constructor(logger: Logger, _registryUrl: string = 'https://registry.npmjs.org') {
    this.logger = logger;
  }

  /**
   * Search for plugins matching query
   *
   * @param query - Search query
   * @param options - Search options
   * @returns Array of matching plugins
   */
  async search(
    query: string,
    options: { verified?: boolean; category?: string } = {}
  ): Promise<PluginInfo[]> {
    this.logger.debug(`Searching plugins: ${query}`);

    // In production, this would query npm registry or curated index
    // For now, return mock data
    const mockPlugins: PluginInfo[] = [
      {
        author: 'Kubit Team',
        capabilities: ['fs:write', 'shell:run'],
        category: 'tooling',
        description: 'Bernova Design System integration for Kubit projects',
        downloads: 15000,
        kubitVersion: '^2.0.0',
        name: '@kubit/plugin-bernova',
        tags: ['css', 'bernova', 'design-system', 'styling'],
        verified: true,
        version: '1.2.0',
      },
      {
        author: 'Kubit Team',
        capabilities: ['fs:write', 'shell:run', 'net:localhost'],
        category: 'tooling',
        description: 'Storybook integration with hot reload',
        downloads: 12000,
        kubitVersion: '^2.0.0',
        name: '@kubit/plugin-storybook',
        tags: ['storybook', 'components', 'ui'],
        verified: true,
        version: '2.0.1',
      },
      {
        author: 'Kubit Team',
        capabilities: ['fs:read', 'fs:write'],
        category: 'utility',
        description: 'Internationalization support with i18next',
        downloads: 8000,
        kubitVersion: '^2.0.0',
        name: '@kubit/plugin-i18n',
        tags: ['i18n', 'translation', 'localization'],
        verified: true,
        version: '1.5.0',
      },
    ];

    // Filter by query
    let results = mockPlugins.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
    );

    // Apply filters
    if (options.verified !== undefined) {
      results = results.filter((p) => p.verified === options.verified);
    }

    if (options.category) {
      results = results.filter((p) => p.category === options.category);
    }

    return results;
  }

  /**
   * Get detailed information about a plugin
   *
   * @param name - Plugin name
   * @returns Plugin information or null if not found
   */
  async getInfo(name: string): Promise<PluginInfo | null> {
    this.logger.debug(`Fetching plugin info: ${name}`);

    // In production, query npm registry
    // For now, return mock data
    const mockPlugin: PluginInfo = {
      author: 'Plugin Author',
      capabilities: ['fs:read'],
      category: 'utility',
      description: 'Plugin description',
      downloads: 1000,
      homepage: `https://github.com/kubit-ui/${name}`,
      kubitVersion: '^2.0.0',
      name,
      repository: `https://github.com/kubit-ui/${name}`,
      tags: ['utility'],
      updated: new Date().toISOString(),
      verified: false,
      version: '1.0.0',
    };

    return mockPlugin;
  }

  /**
   * Check if a plugin is verified
   *
   * @param name - Plugin name
   * @returns True if verified
   */
  async isVerified(name: string): Promise<boolean> {
    const info = await this.getInfo(name);
    return info?.verified || false;
  }

  /**
   * Get compatible plugins for current kubit-forge version
   *
   * @param kubitVersion - Current kubit-forge version
   * @returns Array of compatible plugins
   */
  async getCompatible(_kubitVersion: string): Promise<PluginInfo[]> {
    // In production, filter by semver compatibility
    return this.search('', {});
  }

  /**
   * Get featured/recommended plugins
   *
   * @returns Array of featured plugins
   */
  async getFeatured(): Promise<PluginInfo[]> {
    return this.search('', { verified: true });
  }
}
