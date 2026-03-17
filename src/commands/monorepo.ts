import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../types/index.js';

import { MonorepoManager } from '../utils/monorepo-manager.js';
import { displaySuccess, displayWelcome } from '../utils/ui-helpers.js';

export interface MonorepoInitOptions {
  tool?: 'pnpm' | 'yarn' | 'npm' | 'turborepo' | 'nx' | 'lerna';
  apps?: string[];
  packages?: string[];
  skipInstall?: boolean;
}

export interface MonorepoAddOptions {
  name: string;
  type: 'app' | 'package';
  template?: 'react' | 'vanilla' | 'library';
  private?: boolean;
}

/**
 * Initialize a monorepo structure
 */
export async function monorepoInitCommand(
  options: MonorepoInitOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  displayWelcome('Initialize Monorepo', 'Setting up monorepo structure with workspaces');

  const tool = options.tool || 'pnpm';

  // Check if already a monorepo
  const manager = new MonorepoManager(ctx.logger, ctx.cwd);
  const isMonorepo = await manager.isMonorepo();

  if (isMonorepo) {
    return {
      errors: [
        {
          code: 'ALREADY_MONOREPO',
          message: 'This directory is already configured as a monorepo',
          solution: 'Use monorepo:add to add new packages',
        },
      ],
      message: 'Already a monorepo',
      status: 'error',
    };
  }

  try {
    ctx.logger.step('Creating monorepo structure...');

    // Create root package.json
    const packageJson = {
      devDependencies: {} as Record<string, string>,
      name: 'monorepo',
      private: true,
      scripts: {
        build: 'turbo run build',
        dev: 'turbo run dev',
        format: 'prettier --write "**/*.{ts,tsx,js,jsx,json,md}"',
        lint: 'turbo run lint',
        test: 'turbo run test',
      },
      version: '1.0.0',
      workspaces: ['apps/*', 'packages/*'],
    };

    // Add tool-specific configuration
    if (tool === 'turborepo' || tool === 'pnpm') {
      packageJson.devDependencies.turbo = '^2.0.0';
      packageJson.devDependencies.prettier = '^3.0.0';
    }

    writeFileSync(join(ctx.cwd, 'package.json'), JSON.stringify(packageJson, null, 2));
    ctx.logger.success('Created package.json');

    // Create pnpm-workspace.yaml for pnpm
    if (tool === 'pnpm') {
      const workspaceYaml = `packages:
  - 'apps/*'
  - 'packages/*'
`;
      writeFileSync(join(ctx.cwd, 'pnpm-workspace.yaml'), workspaceYaml);
      ctx.logger.success('Created pnpm-workspace.yaml');

      // Create .npmrc
      const npmrc = `shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
`;
      writeFileSync(join(ctx.cwd, '.npmrc'), npmrc);
      ctx.logger.success('Created .npmrc');
    }

    // Create turbo.json
    if (tool === 'turborepo' || tool === 'pnpm') {
      const turboConfig = {
        $schema: 'https://turbo.build/schema.json',
        globalDependencies: ['**/.env.*local'],
        pipeline: {
          build: {
            dependsOn: ['^build'],
            outputs: ['dist/**', '.next/**', '!.next/cache/**'],
          },
          dev: {
            cache: false,
            persistent: true,
          },
          lint: {
            dependsOn: ['^build'],
          },
          test: {
            dependsOn: ['build'],
            outputs: ['coverage/**'],
          },
        },
      };

      writeFileSync(join(ctx.cwd, 'turbo.json'), JSON.stringify(turboConfig, null, 2));
      ctx.logger.success('Created turbo.json');
    }

    // Create .gitignore
    if (!existsSync(join(ctx.cwd, '.gitignore'))) {
      const gitignore = `node_modules/
dist/
.turbo/
.next/
.env*.local
coverage/
*.log
.DS_Store
`;
      writeFileSync(join(ctx.cwd, '.gitignore'), gitignore);
      ctx.logger.success('Created .gitignore');
    }

    // Create README.md
    const readme = `# Monorepo

## Structure

\`\`\`
.
├── apps/          # Applications
├── packages/      # Shared packages
└── turbo.json     # Turborepo configuration
\`\`\`

## Getting Started

\`\`\`bash
# Install dependencies
${tool === 'pnpm' ? 'pnpm' : tool === 'yarn' ? 'yarn' : 'npm'} install

# Start development
${tool === 'pnpm' ? 'pnpm' : tool === 'yarn' ? 'yarn' : 'npm run'} dev

# Build all packages
${tool === 'pnpm' ? 'pnpm' : tool === 'yarn' ? 'yarn' : 'npm run'} build

# Run tests
${tool === 'pnpm' ? 'pnpm' : tool === 'yarn' ? 'yarn' : 'npm run'} test
\`\`\`

## Adding Packages

\`\`\`bash
# Add a new app
kubit-forge monorepo:add my-app --type app

# Add a new package
kubit-forge monorepo:add my-package --type package
\`\`\`
`;

    writeFileSync(join(ctx.cwd, 'README.md'), readme);
    ctx.logger.success('Created README.md');

    displaySuccess('Monorepo Initialized', [
      `Tool: ${tool}`,
      'Structure: apps/*, packages/*',
      'Configuration files created',
    ]);

    return {
      data: { tool },
      message: 'Monorepo initialized successfully',
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to initialize monorepo: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error',
    };
  }
}

/**
 * Add a new package to the monorepo
 */
export async function monorepoAddCommand(
  options: MonorepoAddOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  displayWelcome('Add Package to Monorepo', `Creating new ${options.type}: ${options.name}`);

  const manager = new MonorepoManager(ctx.logger, ctx.cwd);

  // Check if in a monorepo
  const isMonorepo = await manager.isMonorepo();
  if (!isMonorepo) {
    return {
      errors: [
        {
          code: 'NOT_MONOREPO',
          message: 'Not in a monorepo',
          solution: 'Run "kubit-forge monorepo:init" first',
        },
      ],
      message: 'Not in a monorepo',
      status: 'error',
    };
  }

  try {
    const result = await manager.createPackage({
      name: options.name,
      private: options.private,
      template: options.template,
      type: options.type,
    });

    if (!result.success) {
      return {
        message: result.error || 'Failed to create package',
        status: 'error',
      };
    }

    displaySuccess('Package Created', [
      `Name: ${options.name}`,
      `Type: ${options.type}`,
      `Path: ${result.path}`,
    ]);

    return {
      data: { path: result.path },
      message: `Package '${options.name}' created successfully`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to add package: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error',
    };
  }
}

/**
 * List all packages in the monorepo
 */
export async function monorepoListCommand(ctx: PluginContext): Promise<CommandResult> {
  const manager = new MonorepoManager(ctx.logger, ctx.cwd);

  const isMonorepo = await manager.isMonorepo();
  if (!isMonorepo) {
    return {
      message: 'Not in a monorepo',
      status: 'error',
    };
  }

  try {
    const packages = await manager.listPackages();

    ctx.logger.info('\n📦 Monorepo Packages:\n');

    if (packages.length === 0) {
      ctx.logger.info('No packages found');
    } else {
      for (const pkg of packages) {
        ctx.logger.info(`  ${pkg.name} (${pkg.version})`);
        ctx.logger.info(`    Path: ${pkg.path}`);
        ctx.logger.info(`    Private: ${pkg.private ? 'Yes' : 'No'}`);
        ctx.logger.info('');
      }
    }

    return {
      data: { packages },
      message: `Found ${packages.length} packages`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to list packages: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error',
    };
  }
}

/**
 * Get monorepo info
 */
export async function monorepoInfoCommand(ctx: PluginContext): Promise<CommandResult> {
  const manager = new MonorepoManager(ctx.logger, ctx.cwd);

  const info = await manager.getMonorepoInfo();

  if (!info) {
    return {
      message: 'Not in a monorepo',
      status: 'error',
    };
  }

  ctx.logger.info('\n🏗️  Monorepo Information:\n');
  ctx.logger.info(`  Tool: ${info.tool}`);
  ctx.logger.info(`  Root: ${info.root}`);
  ctx.logger.info(`  Workspaces: ${info.workspaces.join(', ')}`);
  ctx.logger.info(`  Packages: ${info.packages.length}`);
  ctx.logger.info('');

  return {
    data: info,
    message: 'Monorepo info',
    status: 'ok',
  };
}
