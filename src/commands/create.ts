/**
 * Interactive create command - Modern DX for project initialization
 */

import enquirer from 'enquirer';
import { existsSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../types/index.js';

import { colors } from '../utils/theme.js';
import {
  displayWelcome,
  displaySuccess,
  displayNextSteps,
  displayCommands,
} from '../utils/ui-helpers.js';
import { initCommand } from './init.js';

interface CreateOptions {
  name?: string;
  template?: string;
  skipPrompts?: boolean;
}

interface ProjectAnswers {
  name: string;
  template: string;
  features: string[];
  packageManager: 'pnpm' | 'npm' | 'yarn';
  git: boolean;
}

const TEMPLATES = [
  {
    description: '🚀 Complete Kubit Ecosystem: Components + Charts + Bernova + ESLint',
    name: 'Kubit Full Ecosystem (Recommended)',
    value: 'kubit-full',
  },
  {
    description: 'React app with Kubit UI Components and Design System',
    name: 'React + Kubit UI Components',
    value: 'react-kubit-ui',
  },
  {
    description: 'Modern React app with TypeScript, Vite and Bernova Design System',
    name: 'React + TypeScript + Vite + Bernova',
    value: 'react-ts-vite-bernova',
  },
  {
    description: 'React with Bernova Design System and Vitest testing',
    name: 'React + Bernova + Vitest',
    value: 'react-bernova',
  },
  {
    description: 'Publishable React component library with Bernova',
    name: 'React Component Library + Bernova',
    value: 'react-lib-bernova',
  },
  {
    description: 'Pure TypeScript without frameworks',
    name: 'Vanilla TypeScript',
    value: 'vanilla-ts',
  },
  {
    description: 'Pure JavaScript without frameworks',
    name: 'Vanilla JavaScript',
    value: 'vanilla-js',
  },
] as const;

const FEATURES = [
  {
    checked: true,
    name: 'Bernova Design System',
    value: 'bernova',
  },
  {
    checked: true,
    name: 'ESLint + Prettier',
    value: 'quality',
  },
  {
    checked: true,
    name: 'Vitest + Testing Library',
    value: 'testing',
  },
  {
    checked: false,
    name: 'Storybook',
    value: 'storybook',
  },
  {
    checked: false,
    name: 'Playwright E2E',
    value: 'playwright',
  },
  {
    checked: false,
    name: 'Husky + Commitlint',
    value: 'git-hooks',
  },
  {
    checked: false,
    name: 'Docker',
    value: 'docker',
  },
] as const;

/**
 * Interactive create command
 */
export async function createCommand(
  options: CreateOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  displayWelcome('Create New Project', 'Interactive wizard to scaffold your next web application');

  try {
    // Collect answers
    const answers = await collectAnswers(options, ctx);

    // Validate project name
    const targetDir = join(ctx.cwd, answers.name);
    if (existsSync(targetDir)) {
      return {
        errors: [
          {
            code: 'DIR_EXISTS',
            message: `Directory '${answers.name}' already exists`,
            solution: 'Choose a different project name or remove the existing directory',
          },
        ],
        message: `Directory '${answers.name}' already exists`,
        status: 'error',
      };
    }

    // Show summary
    displayProjectSummary(answers);

    // Confirm
    if (!options.skipPrompts) {
      const result = (await enquirer.prompt({
        initial: true,
        message: 'Create project with these settings?',
        name: 'confirmed',
        type: 'confirm',
      } as never)) as { confirmed: boolean };

      if (!result.confirmed) {
        return {
          message: 'Project creation cancelled',
          status: 'error',
        };
      }
    }

    // Create project
    ctx.logger.step('Creating project structure...');

    // Map template to actual template directory
    const { language, stack, templateDir } = parseTemplate(answers.template);

    // Initialize project with the correct template
    const result = await initCommand(
      {
        name: answers.name,
        pm: answers.packageManager,
        stack,
        templateDir,
        ts: language === 'ts',
      },
      ctx
    );

    if (result.status === 'error') {
      return result;
    }

    // Add features
    if (answers.features.length > 0) {
      ctx.logger.step('Adding selected features...');
      await addFeatures(answers.features, answers.name, ctx);
    }

    // Initialize git
    if (answers.git) {
      ctx.logger.step('Initializing git repository...');
      await initializeGit(answers.name, ctx);
    }

    // Success
    displaySuccess('Project Created Successfully', [
      `Name: ${answers.name}`,
      `Template: ${TEMPLATES.find((t) => t.value === answers.template)?.name}`,
      `Package Manager: ${answers.packageManager}`,
      `Features: ${answers.features.length} selected`,
      `Git: ${answers.git ? 'Initialized' : 'Skipped'}`,
    ]);

    displayNextSteps([
      `cd ${answers.name}`,
      `${answers.packageManager} install`,
      `${answers.packageManager} run dev`,
    ]);

    displayCommands('Available Commands', [
      { command: `${answers.packageManager} run dev`, description: 'Start development server' },
      { command: `${answers.packageManager} run build`, description: 'Build for production' },
      { command: `${answers.packageManager} run test`, description: 'Run tests' },
      { command: `${answers.packageManager} run lint`, description: 'Lint code' },
    ]);

    return {
      data: { projectPath: targetDir },
      message: 'Project created successfully',
      status: 'ok',
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('User force closed')) {
      return {
        message: 'Project creation cancelled',
        status: 'error',
      };
    }

    return {
      message: `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error',
    };
  }
}

/**
 * Collect answers from user
 */
async function collectAnswers(options: CreateOptions, ctx: PluginContext): Promise<ProjectAnswers> {
  const prompts: any[] = [];

  // Project name
  if (!options.name) {
    prompts.push({
      initial: 'my-app',
      message: 'Project name:',
      name: 'name',
      type: 'input',
      validate: (value: string) => {
        if (!value) {
          return 'Project name is required';
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Project name must be lowercase alphanumeric with hyphens';
        }
        return true;
      },
    });
  }

  // Template
  if (!options.template) {
    prompts.push({
      choices: TEMPLATES.map((t) => ({
        hint: t.description,
        name: t.name,
        value: t.value,
      })),
      initial: 0,
      message: 'Choose a template:',
      name: 'template',
      type: 'select',
    });
  }

  // Features
  prompts.push({
    choices: FEATURES.map((f) => ({
      enabled: f.checked,
      name: f.name,
      value: f.value,
    })),
    message: 'Select features:',
    name: 'features',
    type: 'multiselect',
  });

  // Package manager
  prompts.push({
    choices: [
      { name: 'pnpm (recommended)', value: 'pnpm' },
      { name: 'npm', value: 'npm' },
      { name: 'yarn', value: 'yarn' },
    ],
    initial: 0,
    message: 'Package manager:',
    name: 'packageManager',
    type: 'select',
  });

  // Git
  prompts.push({
    initial: true,
    message: 'Initialize git repository?',
    name: 'git',
    type: 'confirm',
  });

  ctx.logger.debug(`About to prompt with ${prompts.length} questions`);

  try {
    const answers = (await enquirer.prompt(prompts)) as any;

    ctx.logger.debug('Prompts completed successfully');

    return {
      features: answers.features || [],
      git: answers.git !== undefined ? answers.git : true,
      name: options.name || answers.name,
      packageManager: answers.packageManager || 'pnpm',
      template: options.template || answers.template,
    };
  } catch (error) {
    ctx.logger.error('Failed to collect answers from prompts', error as Error);
    throw error;
  }
}

/**
 * Display project summary
 */
function displayProjectSummary(answers: ProjectAnswers): void {
  console.log('');
  console.log(colors.primary.bold('Project Summary:'));
  console.log('');
  console.log(`  ${colors.muted('Name:')} ${colors.bold(answers.name)}`);
  console.log(
    `  ${colors.muted('Template:')} ${colors.bold(TEMPLATES.find((t) => t.value === answers.template)?.name)}`
  );
  console.log(`  ${colors.muted('Package Manager:')} ${colors.bold(answers.packageManager)}`);
  console.log(
    `  ${colors.muted('Features:')} ${colors.bold(answers.features.length > 0 ? answers.features.join(', ') : 'None')}`
  );
  console.log(`  ${colors.muted('Git:')} ${colors.bold(answers.git ? 'Yes' : 'No')}`);
  console.log('');
}

/**
 * Parse template to stack, language and template directory
 */
function parseTemplate(template: string): {
  language: 'ts' | 'js';
  stack: 'react' | 'vanilla';
  templateDir: string;
} {
  // Map template values to their physical directories
  const templateMap: Record<
    string,
    { language: 'ts' | 'js'; stack: 'react' | 'vanilla'; templateDir: string }
  > = {
    'kubit-full': { language: 'ts', stack: 'react', templateDir: 'kubit-full' },
    'react-bernova': { language: 'ts', stack: 'react', templateDir: 'react-bernova' },
    'react-kubit-ui': { language: 'ts', stack: 'react', templateDir: 'react-kubit-ui' },
    'react-lib-bernova': { language: 'ts', stack: 'react', templateDir: 'react' },
    'react-ts-vite-bernova': { language: 'ts', stack: 'react', templateDir: 'react-bernova' },
    'vanilla-js': { language: 'js', stack: 'vanilla', templateDir: 'vanilla' },
    'vanilla-ts': { language: 'ts', stack: 'vanilla', templateDir: 'vanilla' },
  };

  return templateMap[template] || { language: 'ts', stack: 'react', templateDir: 'react' };
}

/**
 * Add features to project
 */
async function addFeatures(
  features: string[],
  _projectName: string,
  ctx: PluginContext
): Promise<void> {
  // TODO: Implement feature addition
  // This would call the 'add' command for each feature
  for (const feature of features) {
    ctx.logger.debug(`Adding feature: ${feature}`);
  }
}

/**
 * Initialize git repository
 */
async function initializeGit(projectName: string, ctx: PluginContext): Promise<void> {
  const { execa } = await import('execa');
  const projectPath = join(ctx.cwd, projectName);

  try {
    await execa('git', ['init'], { cwd: projectPath });
    await execa('git', ['add', '.'], { cwd: projectPath });
    await execa('git', ['commit', '-m', 'Initial commit'], { cwd: projectPath });
    ctx.logger.success('Git repository initialized');
  } catch {
    ctx.logger.warn('Failed to initialize git repository');
  }
}
