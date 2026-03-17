/**
 * Add Command
 *
 * Add features to existing projects
 */

import type { Command } from 'commander';

import type { PluginContext } from '../types/index.js';

import { FeatureManager } from '../core/feature-manager.js';
import { allFeatures } from '../features/index.js';

export function registerAddCommand(program: Command, ctx: PluginContext): void {
  const add = program.command('add').description('Add features to your project');

  const featureManager = new FeatureManager(ctx.logger, ctx.cwd);

  // Register all features
  for (const feature of allFeatures) {
    featureManager.registerFeature(feature);
  }

  // add:list - List available features
  add
    .command('list')
    .alias('ls')
    .description('List available features')
    .option('-c, --category <category>', 'Filter by category')
    .action(async (options: { category?: string }) => {
      ctx.logger.step('Available Features');

      const features = featureManager.listFeatures();
      const filtered = options.category
        ? features.filter((f) => f.category === options.category)
        : features;

      if (filtered.length === 0) {
        ctx.logger.info('No features found');
        return;
      }

      // Group by category
      const byCategory = filtered.reduce(
        (acc, feature) => {
          if (!acc[feature.category]) {
            acc[feature.category] = [];
          }
          acc[feature.category].push(feature);
          return acc;
        },
        {} as Record<string, typeof features>
      );

      ctx.logger.info('');
      for (const [category, categoryFeatures] of Object.entries(byCategory)) {
        ctx.logger.info(`📦 ${category.toUpperCase()}`);
        for (const feature of categoryFeatures) {
          ctx.logger.info(`  • ${feature.name} - ${feature.description}`);
        }
        ctx.logger.info('');
      }

      ctx.logger.success(`${filtered.length} features available`);
    });

  // add:info - Get feature information
  add
    .command('info')
    .description('Get detailed information about a feature')
    .argument('<feature>', 'Feature name')
    .action(async (featureName: string) => {
      ctx.logger.step(`Feature Information: ${featureName}`);

      const feature = featureManager.getFeature(featureName);

      if (!feature) {
        ctx.logger.error(`Feature '${featureName}' not found`);
        return;
      }

      ctx.logger.info('');
      ctx.logger.info(`Name: ${feature.name}`);
      ctx.logger.info(`Version: ${feature.version}`);
      ctx.logger.info(`Description: ${feature.description}`);
      ctx.logger.info(`Category: ${feature.category}`);

      if (feature.tags && feature.tags.length > 0) {
        ctx.logger.info(`Tags: ${feature.tags.join(', ')}`);
      }

      if (feature.devDependencies && feature.devDependencies.length > 0) {
        ctx.logger.info('\nDependencies:');
        feature.devDependencies.forEach((dep) => ctx.logger.info(`  - ${dep}`));
      }

      if (feature.configFiles && feature.configFiles.length > 0) {
        ctx.logger.info('\nConfig Files:');
        feature.configFiles.forEach((file) => ctx.logger.info(`  - ${file.path}`));
      }

      if (feature.scripts) {
        ctx.logger.info('\nScripts:');
        Object.entries(feature.scripts).forEach(([name, cmd]) => {
          ctx.logger.info(`  - ${name}: ${cmd}`);
        });
      }

      ctx.logger.info('');
    });

  // add:detect - Detect installed features
  add
    .command('detect')
    .description('Detect which features are already installed')
    .action(async () => {
      ctx.logger.step('Detecting installed features...');

      const features = featureManager.listFeatures();
      const results = await Promise.all(features.map((f) => featureManager.detectFeature(f.name)));

      ctx.logger.info('');
      for (const result of results) {
        const statusIcon =
          result.status === 'configured' ? '✓' : result.status === 'installed' ? '⚠' : '✗';
        const statusText =
          result.status === 'configured'
            ? 'Configured'
            : result.status === 'installed'
              ? 'Installed'
              : 'Not installed';

        ctx.logger.info(`  [${statusIcon}] ${result.name} - ${statusText}`);

        if (result.issues && result.issues.length > 0) {
          result.issues.forEach((issue) => ctx.logger.warn(`      ${issue}`));
        }
      }
      ctx.logger.info('');
    });

  // add <feature> - Install a feature
  add
    .command('install')
    .alias('i')
    .description('Install a feature')
    .argument('<feature>', 'Feature name')
    .option('-d, --dry-run', 'Simulate installation without making changes')
    .option('-f, --force', 'Force reinstall even if already installed')
    .action(async (featureName: string, options: { dryRun?: boolean; force?: boolean }) => {
      ctx.logger.step(`Installing feature: ${featureName}`);

      if (options.dryRun) {
        ctx.logger.warn('DRY RUN MODE - No changes will be made');
      }

      try {
        const result = await featureManager.installFeature(featureName, ctx, options);

        if (!result.success) {
          ctx.logger.error('Installation failed:');
          result.errors?.forEach((error) => ctx.logger.error(`  - ${error}`));
          return;
        }

        ctx.logger.info('');
        ctx.logger.success('Installation Summary:');

        if (result.filesCreated.length > 0) {
          ctx.logger.info(`Files created: ${result.filesCreated.length}`);
          result.filesCreated.forEach((file) => ctx.logger.info(`  - ${file}`));
        }

        if (result.filesModified.length > 0) {
          ctx.logger.info(`Files modified: ${result.filesModified.length}`);
          result.filesModified.forEach((file) => ctx.logger.info(`  - ${file}`));
        }

        if (result.scriptsAdded.length > 0) {
          ctx.logger.info(`Scripts added: ${result.scriptsAdded.length}`);
          result.scriptsAdded.forEach((script) => ctx.logger.info(`  - ${script}`));
        }

        if (result.dependenciesInstalled.length > 0) {
          ctx.logger.info(`Dependencies: ${result.dependenciesInstalled.length}`);
        }

        if (result.instructions) {
          ctx.logger.info(result.instructions);
        }

        ctx.logger.info('');
        ctx.logger.success(`Feature '${featureName}' installed successfully!`);
      } catch (error) {
        ctx.logger.error('Failed to install feature', error as Error);
      }
    });

  // add:rollback - Rollback a feature
  add
    .command('rollback')
    .description('Rollback a feature installation')
    .argument('<feature>', 'Feature name')
    .action(async (featureName: string) => {
      ctx.logger.step(`Rolling back feature: ${featureName}`);

      try {
        const success = await featureManager.rollbackFeature(featureName);

        if (success) {
          ctx.logger.success(`Feature '${featureName}' rolled back successfully`);
        } else {
          ctx.logger.error(`Failed to rollback feature '${featureName}'`);
        }
      } catch (error) {
        ctx.logger.error('Failed to rollback feature', error as Error);
      }
    });

  // add:categories - List feature categories
  add
    .command('categories')
    .description('List all feature categories')
    .action(() => {
      ctx.logger.step('Feature Categories');

      const categories = [
        { description: 'Code quality and testing tools', name: 'quality' },
        { description: 'Development tools and utilities', name: 'tooling' },
        { description: 'Routing solutions', name: 'routing' },
        { description: 'State management libraries', name: 'state' },
        { description: 'UI libraries and frameworks', name: 'ui' },
        { description: 'Git hooks and workflows', name: 'git' },
        { description: 'Deployment tools', name: 'deployment' },
        { description: 'Documentation tools', name: 'documentation' },
      ];

      ctx.logger.info('');
      for (const cat of categories) {
        ctx.logger.info(`  ${cat.name}`);
        ctx.logger.info(`    ${cat.description}`);
        ctx.logger.info('');
      }
    });
}
