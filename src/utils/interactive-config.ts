import { prompt } from 'enquirer';

import type { KubitConfig } from '../types/index.js';

import {
  ConfigTemplateLoader,
  PACKAGE_MANAGERS,
  AVAILABLE_PLUGINS,
} from '../templates/config/index.js';

export interface ConfigWizardOptions {
  existing?: Partial<KubitConfig>;
  minimal?: boolean;
}

export class ConfigWizard {
  async run(options: ConfigWizardOptions = {}): Promise<KubitConfig> {
    console.log('');
    console.log('🎨 Kubit Configuration Wizard');
    console.log('');

    // Project basics
    const projectAnswers = await prompt<{
      name: string;
      type: 'web' | 'library';
      stack: 'react' | 'vanilla';
      language: 'ts' | 'js';
      packageManager: 'pnpm' | 'npm' | 'yarn';
    }>([
      {
        initial: options.existing?.project?.name || 'my-app',
        message: 'Project name:',
        name: 'name',
        type: 'input',
      },
      {
        choices: ['web', 'library'],
        initial: options.existing?.project?.type || 'web',
        message: 'Project type:',
        name: 'type',
        type: 'select',
      } as never,
      {
        choices: ['react', 'vanilla'],
        message: 'Choose your stack:',
        name: 'stack',
        type: 'select',
      } as never,
      {
        choices: [
          { name: 'TypeScript', value: 'ts' },
          { name: 'JavaScript', value: 'js' },
        ],
        message: 'Choose your language:',
        name: 'language',
        type: 'select',
      } as never,
      {
        choices: [...PACKAGE_MANAGERS],
        message: 'Choose your package manager:',
        name: 'packageManager',
        type: 'select',
      } as never,
    ]);

    // Quality tools
    const qualityAnswers = await prompt<{
      lint: boolean;
      format: boolean;
      typecheck: boolean;
      unitTest: boolean;
    }>([
      {
        initial: options.existing?.quality?.lint ?? true,
        message: 'Enable linting (ESLint)?',
        name: 'lint',
        type: 'confirm',
      },
      {
        initial: options.existing?.quality?.format ?? true,
        message: 'Enable formatting (Prettier)?',
        name: 'format',
        type: 'confirm',
      },
      {
        initial: projectAnswers.language === 'ts',
        message: 'Enable type checking?',
        name: 'typecheck',
        type: 'confirm',
      },
      {
        initial: options.existing?.quality?.unitTest ?? true,
        message: 'Enable unit testing (Vitest)?',
        name: 'unitTest',
        type: 'confirm',
      },
    ] as any);

    // Plugins
    const pluginAnswers = await prompt<{ plugins: string[] }>({
      choices: [...AVAILABLE_PLUGINS],
      initial: options.existing?.plugins?.enabled || [],
      message: 'Select plugins to install:',
      name: 'plugins',
      type: 'multiselect',
    } as any);

    // Build configuration using templates
    const config = ConfigTemplateLoader.buildDefault({
      language: projectAnswers.language,
      name: projectAnswers.name,
      packageManager: projectAnswers.packageManager,
      stack: projectAnswers.stack,
      type: projectAnswers.type,
    });

    // Override with user selections
    config.quality = {
      format: qualityAnswers.format,
      lint: qualityAnswers.lint,
      typecheck: qualityAnswers.typecheck,
      unitTest: qualityAnswers.unitTest,
    };

    config.plugins = {
      enabled: pluginAnswers.plugins,
    };

    console.log('');
    console.log('✅ Configuration complete!');
    console.log('');

    return config;
  }

  async updateExisting(current: KubitConfig): Promise<KubitConfig> {
    const { section } = await prompt<{ section: string }>({
      choices: ['Project settings', 'Quality tools', 'Plugins', 'Paths', 'All settings'],
      message: 'What would you like to update?',
      name: 'section',
      type: 'select',
    });

    switch (section) {
      case 'All settings':
        return this.run({ existing: current });
      // Add specific section updates
      default:
        return current;
    }
  }
}
