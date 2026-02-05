import type { Logger, RecipeInfo } from '../types/index.js';

export class RecipeRegistry {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async search(query: string, options?: { category?: string }): Promise<RecipeInfo[]> {
    this.logger.debug(`Searching recipes: ${query}`);

    const mockRecipes: RecipeInfo[] = [
      {
        author: 'Kubit Team',
        category: 'setup',
        description: 'Complete React app setup with routing, state management, and testing',
        downloads: 5000,
        name: 'react-app-complete',
        requires: {
          kubitVersion: '^2.0.0',
          nodeVersion: '>=18',
        },
        tags: ['react', 'router', 'redux', 'testing'],
        verified: true,
        version: '1.0.0',
      },
      {
        author: 'Kubit Team',
        category: 'tooling',
        description: 'Add Storybook with automatic story generation',
        downloads: 3000,
        name: 'storybook-setup',
        tags: ['storybook', 'components', 'documentation'],
        verified: true,
        version: '1.2.0',
      },
      {
        author: 'Kubit Team',
        category: 'deployment',
        description: 'GitHub Actions CI/CD pipeline with testing and deployment',
        downloads: 4500,
        name: 'ci-cd-github',
        tags: ['ci', 'cd', 'github-actions', 'deployment'],
        verified: true,
        version: '2.0.0',
      },
    ];

    let results = mockRecipes.filter(
      (r) =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.description.toLowerCase().includes(query.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
    );

    if (options?.category) {
      results = results.filter((r) => r.category === options.category);
    }

    return results;
  }

  async getInfo(name: string): Promise<RecipeInfo | null> {
    this.logger.debug(`Fetching recipe info: ${name}`);
    const results = await this.search(name);
    return results.find((r) => r.name === name) || null;
  }

  async getFeatured(): Promise<RecipeInfo[]> {
    return this.search('', {});
  }
}
