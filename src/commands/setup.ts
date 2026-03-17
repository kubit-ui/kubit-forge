/**
 * Setup command - Initialize package.json and git in existing directory
 */

import enquirer from 'enquirer';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../types/index.js';

import { colors } from '../utils/theme.js';
import {
  displayWelcome,
  displaySuccess,
  displayNextSteps,
  displayInfo,
} from '../utils/ui-helpers.js';

interface SetupOptions {
  skipPrompts?: boolean;
  git?: boolean;
  packageJson?: boolean;
}

interface SetupAnswers {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  packageManager: 'pnpm' | 'npm' | 'yarn';
  type: 'module' | 'commonjs';
  initGit: boolean;
  private: boolean;
}

/**
 * Setup command - Initialize project files
 */
export async function setupCommand(
  options: SetupOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  displayWelcome(
    'Setup Project',
    'Initialize package.json and git repository in current directory'
  );

  try {
    // Check if package.json already exists
    const packageJsonPath = join(ctx.cwd, 'package.json');
    const hasPackageJson = existsSync(packageJsonPath);
    const hasGit = existsSync(join(ctx.cwd, '.git'));

    if (hasPackageJson && !options.skipPrompts) {
      displayInfo('package.json already exists. This will overwrite it.');
      const result = (await enquirer.prompt({
        initial: false,
        message: 'Continue?',
        name: 'proceed',
        type: 'confirm',
      } as never)) as { proceed: boolean };

      if (!result.proceed) {
        return {
          message: 'Setup cancelled',
          status: 'error',
        };
      }
    }

    // Collect answers
    const answers = await collectSetupAnswers(ctx, hasGit);

    // Show summary
    displaySetupSummary(answers);

    // Confirm
    if (!options.skipPrompts) {
      const result = (await enquirer.prompt({
        initial: true,
        message: 'Create files with these settings?',
        name: 'confirmed',
        type: 'confirm',
      } as never)) as { confirmed: boolean };

      if (!result.confirmed) {
        return {
          message: 'Setup cancelled',
          status: 'error',
        };
      }
    }

    // Create package.json
    if (options.packageJson !== false) {
      ctx.logger.step('Creating package.json...');
      const packageJson = generatePackageJson(answers);
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      ctx.logger.success('package.json created');
    }

    // Initialize git
    if (answers.initGit && !hasGit) {
      ctx.logger.step('Initializing git repository...');
      await initializeGit(ctx);

      // Create .gitignore
      ctx.logger.step('Creating .gitignore...');
      const gitignore = generateGitignore(answers.packageManager);
      writeFileSync(join(ctx.cwd, '.gitignore'), gitignore);
      ctx.logger.success('Git repository initialized');
    }

    // Create README.md if it doesn't exist
    const readmePath = join(ctx.cwd, 'README.md');
    if (!existsSync(readmePath)) {
      ctx.logger.step('Creating README.md...');
      const readme = generateReadme(answers);
      writeFileSync(readmePath, readme);
      ctx.logger.success('README.md created');
    }

    // Success
    displaySuccess('Project Setup Complete', [
      `Name: ${answers.name}`,
      `Version: ${answers.version}`,
      `Type: ${answers.type}`,
      `Package Manager: ${answers.packageManager}`,
      `Git: ${answers.initGit ? 'Initialized' : 'Skipped'}`,
    ]);

    displayNextSteps([
      `${answers.packageManager} install`,
      'Add your project dependencies',
      'Start coding!',
    ]);

    return {
      message: 'Project setup complete',
      status: 'ok',
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('User force closed')) {
      return {
        message: 'Setup cancelled',
        status: 'error',
      };
    }

    return {
      message: `Failed to setup project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error',
    };
  }
}

/**
 * Collect setup answers from user
 */
async function collectSetupAnswers(ctx: PluginContext, hasGit: boolean): Promise<SetupAnswers> {
  // Get current directory name as default project name
  const defaultName = ctx.cwd.split('/').pop() || 'my-project';

  const answers = (await enquirer.prompt([
    {
      initial: defaultName,
      message: 'Package name:',
      name: 'name',
      type: 'input',
      validate: (value: string) => {
        if (!value) {
          return 'Package name is required';
        }
        if (!/^[@a-z0-9-/]+$/.test(value)) {
          return 'Package name must be lowercase alphanumeric with hyphens and slashes';
        }
        return true;
      },
    },
    {
      initial: '0.1.0',
      message: 'Version:',
      name: 'version',
      type: 'input',
    },
    {
      initial: '',
      message: 'Description:',
      name: 'description',
      type: 'input',
    },
    {
      initial: '',
      message: 'Author:',
      name: 'author',
      type: 'input',
    },
    {
      choices: [
        { name: 'MIT', value: 'MIT' },
        { name: 'Apache-2.0', value: 'Apache-2.0' },
        { name: 'ISC', value: 'ISC' },
        { name: 'BSD-3-Clause', value: 'BSD-3-Clause' },
        { name: 'Unlicense', value: 'Unlicense' },
        { name: 'UNLICENSED (private)', value: 'UNLICENSED' },
      ],
      initial: 0,
      message: 'License:',
      name: 'license',
      type: 'select',
    },
    {
      choices: [
        { name: 'pnpm (recommended)', value: 'pnpm' },
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
      ],
      initial: 0,
      message: 'Package manager:',
      name: 'packageManager',
      type: 'select',
    },
    {
      choices: [
        { name: 'ES Module (recommended)', value: 'module' },
        { name: 'CommonJS', value: 'commonjs' },
      ],
      initial: 0,
      message: 'Module type:',
      name: 'type',
      type: 'select',
    },
    {
      initial: false,
      message: 'Private package?',
      name: 'private',
      type: 'confirm',
    },
    {
      initial: !hasGit,
      message: 'Initialize git repository?',
      name: 'initGit',
      skip: hasGit,
      type: 'confirm',
    },
  ] as never)) as any;

  return {
    author: answers.author || '',
    description: answers.description || '',
    initGit: hasGit ? false : answers.initGit !== undefined ? answers.initGit : true,
    license: answers.license,
    name: answers.name,
    packageManager: answers.packageManager,
    private: answers.private,
    type: answers.type,
    version: answers.version,
  };
}

/**
 * Display setup summary
 */
function displaySetupSummary(answers: SetupAnswers): void {
  console.log('');
  console.log(colors.primary.bold('Setup Summary:'));
  console.log('');
  console.log(`  ${colors.muted('Name:')} ${colors.bold(answers.name)}`);
  console.log(`  ${colors.muted('Version:')} ${colors.bold(answers.version)}`);
  console.log(`  ${colors.muted('Description:')} ${colors.bold(answers.description || '(none)')}`);
  console.log(`  ${colors.muted('Author:')} ${colors.bold(answers.author || '(none)')}`);
  console.log(`  ${colors.muted('License:')} ${colors.bold(answers.license)}`);
  console.log(`  ${colors.muted('Type:')} ${colors.bold(answers.type)}`);
  console.log(`  ${colors.muted('Package Manager:')} ${colors.bold(answers.packageManager)}`);
  console.log(`  ${colors.muted('Private:')} ${colors.bold(answers.private ? 'Yes' : 'No')}`);
  console.log(`  ${colors.muted('Git:')} ${colors.bold(answers.initGit ? 'Initialize' : 'Skip')}`);
  console.log('');
}

/**
 * Generate package.json content
 */
function generatePackageJson(answers: SetupAnswers): Record<string, unknown> {
  const packageJson: Record<string, unknown> = {
    name: answers.name,
    type: answers.type,
    version: answers.version,
  };

  if (answers.description) {
    packageJson.description = answers.description;
  }

  if (answers.author) {
    packageJson.author = answers.author;
  }

  packageJson.license = answers.license;

  if (answers.private) {
    packageJson.private = true;
  }

  packageJson.scripts = {
    test: 'echo "Error: no test specified" && exit 1',
  };

  packageJson.keywords = [];
  packageJson.dependencies = {};
  packageJson.devDependencies = {};

  return packageJson;
}

/**
 * Generate .gitignore content
 */
function generateGitignore(packageManager: string): string {
  const lockFiles: Record<string, string> = {
    npm: 'package-lock.json',
    pnpm: 'pnpm-lock.yaml',
    yarn: 'yarn.lock',
  };

  return `# Dependencies
node_modules/
${lockFiles[packageManager] || ''}

# Build output
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
.nyc_output/

# Misc
.cache/
.temp/
`;
}

/**
 * Generate README.md content
 */
function generateReadme(answers: SetupAnswers): string {
  return `# ${answers.name}

${answers.description || 'A new project'}

## Installation

\`\`\`bash
${answers.packageManager} install
\`\`\`

## Usage

\`\`\`bash
${answers.packageManager} start
\`\`\`

## License

${answers.license}
`;
}

/**
 * Initialize git repository
 */
async function initializeGit(ctx: PluginContext): Promise<void> {
  const { execa } = await import('execa');

  try {
    await execa('git', ['init'], { cwd: ctx.cwd });
    await execa('git', ['add', '.'], { cwd: ctx.cwd });
    await execa('git', ['commit', '-m', 'Initial commit'], { cwd: ctx.cwd });
  } catch {
    ctx.logger.warn('Failed to initialize git repository');
  }
}
