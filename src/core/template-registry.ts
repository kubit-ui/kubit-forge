import type { Logger } from '../types/index.js';

/**
 * Template information from registry
 */
export interface TemplateInfo {
  /** Template name */
  name: string;
  /** Template version */
  version: string;
  /** Description */
  description: string;
  /** Author */
  author: string;
  /** Stack (react, vanilla, etc.) */
  stack: 'react' | 'vanilla' | 'vue' | 'svelte';
  /** Whether this is an official template */
  official: boolean;
  /** Features included */
  features: string[];
  /** Repository URL */
  repository?: string;
  /** Preview URL */
  preview?: string;
  /** Tags */
  tags?: string[];
}

/**
 * Template registry client
 *
 * Manages template discovery and usage.
 */
export class TemplateRegistry {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Search for templates
   *
   * @param query - Search query
   * @param options - Search options
   * @returns Array of matching templates
   */
  async search(
    query: string,
    options: { stack?: string; official?: boolean } = {}
  ): Promise<TemplateInfo[]> {
    this.logger.debug(`Searching templates: ${query}`);

    // Mock templates - All available templates from create command
    const mockTemplates: TemplateInfo[] = [
      {
        author: 'Kubit Team',
        description: 'React app with Kubit UI Components and Design System',
        features: ['React', 'Kubit UI Components', 'Design System', 'TypeScript', 'Vite'],
        name: 'kubit/react-kubit-ui',
        official: true,
        repository: 'https://github.com/kubit-ui/templates',
        stack: 'react',
        tags: ['react', 'kubit-ui', 'design-system', 'components'],
        version: '3.0.0',
      },
      {
        author: 'Kubit Team',
        description: 'Modern React app with TypeScript, Vite and Bernova Design System',
        features: ['TypeScript', 'Vite', 'Bernova Design System', 'Vitest', 'ESLint', 'Prettier'],
        name: 'kubit/react-recommended',
        official: true,
        repository: 'https://github.com/kubit-ui/templates',
        stack: 'react',
        tags: ['react', 'typescript', 'bernova', 'recommended'],
        version: '3.0.0',
      },
      {
        author: 'Kubit Team',
        description: 'React with Bernova Design System and Vitest testing',
        features: ['React', 'Bernova Design System', 'Vitest', 'TypeScript'],
        name: 'kubit/react-minimal',
        official: true,
        repository: 'https://github.com/kubit-ui/templates',
        stack: 'react',
        tags: ['react', 'bernova', 'minimal', 'testing'],
        version: '3.0.0',
      },
      {
        author: 'Kubit Team',
        description: 'Publishable React component library with Bernova',
        features: ['React', 'Component Library', 'Bernova', 'TypeScript', 'Rollup'],
        name: 'kubit/react-lib-bernova',
        official: true,
        repository: 'https://github.com/kubit-ui/templates',
        stack: 'react',
        tags: ['react', 'library', 'bernova', 'components'],
        version: '3.0.0',
      },
      {
        author: 'Kubit Team',
        description: 'Pure TypeScript without frameworks',
        features: ['TypeScript', 'Vite', 'Vitest', 'ESLint'],
        name: 'kubit/vanilla-ts',
        official: true,
        repository: 'https://github.com/kubit-ui/templates',
        stack: 'vanilla',
        tags: ['vanilla', 'typescript', 'no-framework'],
        version: '3.0.0',
      },
      {
        author: 'Kubit Team',
        description: 'Pure JavaScript without frameworks',
        features: ['JavaScript', 'Vite', 'ESLint'],
        name: 'kubit/vanilla-js',
        official: true,
        repository: 'https://github.com/kubit-ui/templates',
        stack: 'vanilla',
        tags: ['vanilla', 'javascript', 'no-framework'],
        version: '3.0.0',
      },
    ];

    let results = mockTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );

    if (options.stack) {
      results = results.filter((t) => t.stack === options.stack);
    }

    if (options.official !== undefined) {
      results = results.filter((t) => t.official === options.official);
    }

    return results;
  }

  /**
   * Get template information
   *
   * @param name - Template name
   * @returns Template info or null
   */
  async getInfo(name: string): Promise<TemplateInfo | null> {
    const results = await this.search(name);
    return results.find((t) => t.name === name) || null;
  }

  /**
   * Get featured templates
   *
   * @returns Array of featured templates
   */
  async getFeatured(): Promise<TemplateInfo[]> {
    return this.search('', { official: true });
  }
}
