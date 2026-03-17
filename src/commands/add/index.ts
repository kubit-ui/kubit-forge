import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext, CommandResult } from '../../types/index.js';

import { FEATURES, type FeatureDefinition } from './features.js';

export interface AddOptions {
  dryRun?: boolean;
  force?: boolean;
}

export type { FeatureDefinition };

// Note: FEATURES is now imported from ./features.ts
// All feature definitions and templates are in separate files for easy modification

export async function addCommand(
  feature: string,
  options: AddOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const featureDef = FEATURES[feature];

  if (!featureDef) {
    return {
      message: `Unknown feature: ${feature}. Available: ${Object.keys(FEATURES).join(', ')}`,
      status: 'error',
    };
  }

  // Check if package.json exists, if not create it
  const packageJsonPath = join(ctx.cwd, 'package.json');
  if (!existsSync(packageJsonPath)) {
    ctx.logger.warn('No package.json found. Creating one...');

    const defaultPackageJson = {
      dependencies: {},
      devDependencies: {},
      name: ctx.cwd.split('/').pop() || 'my-project',
      private: true,
      scripts: {
        build: 'vite build',
        dev: 'vite',
        preview: 'vite preview',
      },
      type: 'module',
      version: '0.1.0',
    };

    writeFileSync(packageJsonPath, JSON.stringify(defaultPackageJson, null, 2) + '\n');
    ctx.logger.success('Created package.json');
  }

  ctx.logger.step(`Adding ${featureDef.name}...`);
  ctx.logger.info(featureDef.description);

  // Check if already installed
  const configPath = join(ctx.cwd, 'kubit.config.toml');
  if (existsSync(configPath)) {
    const configContent = readFileSync(configPath, 'utf-8');
    if (configContent.includes(`${feature} = true`) && !options.force) {
      ctx.logger.warn(`Feature '${feature}' is already installed. Use --force to reinstall.`);
      return { message: 'Feature already installed', status: 'ok' };
    }
  }

  const plan: string[] = [];

  // Plan dependencies
  const allDeps = {
    ...featureDef.dependencies,
    ...featureDef.devDependencies,
  };
  if (Object.keys(allDeps).length > 0) {
    plan.push(`Install dependencies: ${Object.keys(allDeps).join(', ')}`);
  }

  // Plan file changes
  for (const file of featureDef.files) {
    const filePath = join(ctx.cwd, file.path);
    const exists = existsSync(filePath);
    const action = exists ? (file.mode === 'append' ? 'append' : 'overwrite') : 'create';
    plan.push(`${action}: ${file.path}`);
  }

  // Plan config changes
  if (featureDef.configChanges) {
    for (const change of featureDef.configChanges) {
      plan.push(`Update config: ${change.file}`);
    }
  }

  // Show plan
  ctx.logger.info('\nPlan:');
  for (const item of plan) {
    ctx.logger.info(`  - ${item}`);
  }

  if (options.dryRun) {
    ctx.logger.info('\n[DRY RUN] No changes made');
    return { message: 'Dry run completed', status: 'ok' };
  }

  // Execute: Install dependencies
  if (Object.keys(featureDef.dependencies).length > 0) {
    ctx.logger.step('Installing dependencies...');
    const deps = Object.entries(featureDef.dependencies).map(
      ([name, version]) => `${name}@${version}`
    );
    const result = await ctx.runner.run(ctx.config.project.packageManager, ['add', ...deps]);
    if (result.status !== 'ok') {
      return { message: 'Failed to install dependencies', status: 'error' };
    }
  }

  if (featureDef.devDependencies && Object.keys(featureDef.devDependencies).length > 0) {
    ctx.logger.step('Installing dev dependencies...');
    const deps = Object.entries(featureDef.devDependencies).map(
      ([name, version]) => `${name}@${version}`
    );
    const addFlag = ctx.config.project.packageManager === 'npm' ? 'install' : 'add';
    const devFlag = ctx.config.project.packageManager === 'npm' ? '--save-dev' : '-D';
    const result = await ctx.runner.run(ctx.config.project.packageManager, [
      addFlag,
      devFlag,
      ...deps,
    ]);
    if (result.status !== 'ok') {
      return { message: 'Failed to install dev dependencies', status: 'error' };
    }
  }

  // Execute: Create/modify files
  for (const file of featureDef.files) {
    const filePath = join(ctx.cwd, file.path);
    const dir = join(filePath, '..');

    ctx.logger.step(`Creating ${file.path}...`);

    // Ensure directory exists
    await ctx.runner.run('mkdir', ['-p', dir]);

    if (file.mode === 'append' && existsSync(filePath)) {
      const existing = readFileSync(filePath, 'utf-8');
      writeFileSync(filePath, existing + '\n' + file.content);
    } else {
      writeFileSync(filePath, file.content);
    }

    // Add kubit marker
    const marker = `\n// Added by kubit-forge add ${feature}\n`;
    if (!file.content.includes('Added by kubit-forge')) {
      const content = readFileSync(filePath, 'utf-8');
      writeFileSync(filePath, marker + content);
    }
  }

  // Execute: Update config
  if (featureDef.configChanges) {
    for (const change of featureDef.configChanges) {
      const configPath = join(ctx.cwd, change.file);
      if (existsSync(configPath)) {
        let content = readFileSync(configPath, 'utf-8');

        // Simple TOML append (not a full parser)
        if (!content.includes('[features]')) {
          content += '\n[features]\n';
        }
        if (!content.includes(`${feature} = true`)) {
          content += `${feature} = true\n`;
        }

        writeFileSync(configPath, content);
        ctx.logger.success(`Updated ${change.file}`);
      }
    }
  }

  // Execute: Post-install commands
  if (featureDef.postInstall) {
    for (const cmd of featureDef.postInstall) {
      ctx.logger.step(`Running: ${cmd}`);
      const [command, ...args] = cmd.split(' ');
      await ctx.runner.run(command, args);
    }
  }

  ctx.logger.success(`\n✓ ${featureDef.name} added successfully!`);

  return {
    data: { feature, files: featureDef.files.map((f) => f.path) },
    message: `Feature '${feature}' added successfully`,
    status: 'ok',
  };
}

export function listFeatures(): string[] {
  return Object.keys(FEATURES);
}

export function getFeatureInfo(feature: string): FeatureDefinition | undefined {
  return FEATURES[feature];
}
