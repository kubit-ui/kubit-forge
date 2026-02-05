import { existsSync, mkdirSync, writeFileSync, cpSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import type { CommandResult, PluginContext, InitOptions } from '../types/index.js';

import { PROJECT_DEFAULTS, PATHS_DEFAULTS } from '../templates/config/index.js';
import {
  displayWelcome,
  displaySuccess,
  displayNextSteps,
  displayCommands,
} from '../utils/ui-helpers.js';

// Get the directory where kubit-forge is installed
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// When running from source (tests): src/commands -> src -> package root
// When compiled (production): dist -> package root
// Check if we're in src/commands or dist
const CLI_ROOT =
  __dirname.includes('/src/commands') || __dirname.includes('\\src\\commands')
    ? join(__dirname, '..', '..') // src/commands -> src -> root
    : join(__dirname, '..'); // dist -> root

export async function initCommand(
  options: InitOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const { name, pm = 'pnpm', stack, ts = true } = options;
  const targetDir = join(ctx.cwd, name);

  displayWelcome(
    'Initialize Project',
    `Creating a new ${stack} project with ${ts ? 'TypeScript' : 'JavaScript'}`
  );

  ctx.logger.step(`Setting up project: ${name}`);

  // Check if directory exists
  if (existsSync(targetDir)) {
    return {
      errors: [
        {
          code: 'DIR_EXISTS',
          message: `Directory '${name}' already exists`,
          solution: 'Choose a different project name or remove the existing directory',
        },
      ],
      message: `Directory '${name}' already exists`,
      status: 'error',
    };
  }

  try {
    // Create project directory
    mkdirSync(targetDir, { recursive: true });

    // Copy template from CLI installation directory
    const templateDir = join(CLI_ROOT, 'templates', stack);

    if (!existsSync(templateDir)) {
      return {
        errors: [
          {
            code: 'TEMPLATE_NOT_FOUND',
            message: `Template directory not found: ${templateDir}`,
            solution: 'Ensure kubit-forge is properly installed with templates',
          },
        ],
        message: `Template for '${stack}' not found at ${templateDir}`,
        status: 'error',
      };
    }

    cpSync(templateDir, targetDir, { recursive: true });

    // Create kubit.config.toml
    const config = generateConfig(name, stack, ts ? 'ts' : 'js', pm);
    writeFileSync(join(targetDir, 'kubit.config.toml'), config);

    displaySuccess('Project Created Successfully', [
      `Project directory: ${name}`,
      `Stack: ${stack}`,
      `Language: ${ts ? 'TypeScript' : 'JavaScript'}`,
      `Package Manager: ${pm}`,
    ]);

    displayNextSteps([`cd ${name}`, `${pm} install`, `${pm} run dev`]);

    displayCommands('Available Commands', [
      { command: `${pm} run dev`, description: 'Start development server' },
      { command: `${pm} run build`, description: 'Build for production' },
      { command: `${pm} run test`, description: 'Run tests' },
      { command: `${pm} run lint`, description: 'Lint code' },
    ]);

    return {
      data: { projectPath: targetDir },
      message: `Project '${name}' created successfully`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error',
    };
  }
}

function generateConfig(
  name: string,
  stack: 'react' | 'vanilla',
  language: 'ts' | 'js',
  pm: 'pnpm' | 'npm' | 'yarn'
): string {
  // Use templates for default values
  const projectDefaults = PROJECT_DEFAULTS;
  const pathsDefaults = PATHS_DEFAULTS;

  return `[kubit]
cliVersion = "^1.0.0"

[project]
name = "${name}"
type = "web"
stack = "${stack}"
language = "${language}"
packageManager = "${pm}"
nodeVersion = "${projectDefaults.nodeVersion}"
devPort = ${projectDefaults.devPort}

[paths]
src = "${pathsDefaults.src}"
dist = "${pathsDefaults.dist}"
envExample = "${pathsDefaults.envExample}"
envLocal = "${pathsDefaults.envLocal}"

[quality]
lint = true
format = true
typecheck = ${language === 'ts'}
unitTest = true

[plugins]
enabled = [
  "@kubit/plugin-${stack}",
  "@kubit/plugin-quality",
  "@kubit/plugin-env",
  "@kubit/plugin-generators"
]
`;
}
