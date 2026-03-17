/**
 * Plugin Command
 *
 * Manage plugins: list, search, install, uninstall
 */

import type { Command } from 'commander';

import type { PluginContext } from '../types/index.js';

export function registerPluginCommand(program: Command, ctx: PluginContext): void {
  const plugin = program.command('plugin').description('Manage plugins');

  // plugin:list - List installed plugins
  plugin
    .command('list')
    .alias('ls')
    .description('List installed plugins')
    .action(async () => {
      ctx.logger.step('Installed Plugins');

      if (!ctx.pluginManager) {
        ctx.logger.warn('Plugin manager not available');
        return;
      }

      const plugins = ctx.pluginManager.getPlugins();

      if (plugins.length === 0) {
        ctx.logger.info('No plugins installed');
        return;
      }

      ctx.logger.info('');
      for (const p of plugins) {
        ctx.logger.info(`  ${p.name} v${p.version}`);
        if (p.capabilities && p.capabilities.length > 0) {
          ctx.logger.info(`    Capabilities: ${p.capabilities.join(', ')}`);
        }
      }

      ctx.logger.info('');
      const stats = ctx.pluginManager.getStats();
      ctx.logger.info(`Total: ${stats.plugins} plugins`);
      ctx.logger.info(`  - ${stats.commands} commands`);
      ctx.logger.info(`  - ${stats.tasks} tasks`);
      ctx.logger.info(`  - ${stats.generators} generators`);
      ctx.logger.info(`  - ${stats.providers} providers`);
    });

  // plugin:search - Search for plugins
  plugin
    .command('search')
    .description('Search for plugins in registry')
    .argument('[query]', 'Search query', '')
    .option('-v, --verified', 'Only show verified plugins')
    .option('-c, --category <category>', 'Filter by category')
    .action(async (query: string, options: { verified?: boolean; category?: string }) => {
      ctx.logger.step(`Searching plugins: ${query || 'all'}`);

      if (!ctx.pluginManager) {
        ctx.logger.warn('Plugin manager not available');
        return;
      }

      try {
        const results = await ctx.pluginManager.searchPlugins(query, {
          category: options.category,
          verified: options.verified,
        });

        if (results.length === 0) {
          ctx.logger.info('No plugins found');
          return;
        }

        ctx.logger.info('');
        for (const p of results) {
          const verifiedBadge = p.verified ? '✓' : ' ';
          ctx.logger.info(`  [${verifiedBadge}] ${p.name} v${p.version}`);
          ctx.logger.info(`      ${p.description}`);
          ctx.logger.info(`      Category: ${p.category} | Downloads: ${p.downloads || 0}/week`);
          if (p.tags && p.tags.length > 0) {
            ctx.logger.info(`      Tags: ${p.tags.join(', ')}`);
          }
          ctx.logger.info('');
        }

        ctx.logger.success(`Found ${results.length} plugins`);
      } catch (error) {
        ctx.logger.error('Failed to search plugins', error as Error);
      }
    });

  // plugin:info - Get plugin information
  plugin
    .command('info')
    .description('Get detailed information about a plugin')
    .argument('<name>', 'Plugin name')
    .action(async (name: string) => {
      ctx.logger.step(`Plugin Information: ${name}`);

      if (!ctx.pluginManager) {
        ctx.logger.warn('Plugin manager not available');
        return;
      }

      try {
        const info = await ctx.pluginManager.getPluginInfo(name);

        if (!info) {
          ctx.logger.error(`Plugin '${name}' not found`);
          return;
        }

        ctx.logger.info('');
        ctx.logger.info(`Name: ${info.name}`);
        ctx.logger.info(`Version: ${info.version}`);
        ctx.logger.info(`Description: ${info.description}`);
        ctx.logger.info(`Author: ${info.author}`);
        ctx.logger.info(`Verified: ${info.verified ? 'Yes' : 'No'}`);
        ctx.logger.info(`Category: ${info.category}`);

        if (info.homepage) {
          ctx.logger.info(`Homepage: ${info.homepage}`);
        }

        if (info.repository) {
          ctx.logger.info(`Repository: ${info.repository}`);
        }

        if (info.kubitVersion) {
          ctx.logger.info(`Required Kubit CLI: ${info.kubitVersion}`);
        }

        if (info.capabilities && info.capabilities.length > 0) {
          ctx.logger.info(`Capabilities: ${info.capabilities.join(', ')}`);
        }

        if (info.tags && info.tags.length > 0) {
          ctx.logger.info(`Tags: ${info.tags.join(', ')}`);
        }

        ctx.logger.info(`Downloads: ${info.downloads || 0}/week`);
        ctx.logger.info(`Last Updated: ${info.updated || 'Unknown'}`);
        ctx.logger.info('');
      } catch (error) {
        ctx.logger.error('Failed to get plugin info', error as Error);
      }
    });

  // plugin:featured - List featured plugins
  plugin
    .command('featured')
    .description('List featured/recommended plugins')
    .action(async () => {
      ctx.logger.step('Featured Plugins');

      if (!ctx.pluginManager) {
        ctx.logger.warn('Plugin manager not available');
        return;
      }

      try {
        const featured = await ctx.pluginManager.getFeaturedPlugins();

        if (featured.length === 0) {
          ctx.logger.info('No featured plugins available');
          return;
        }

        ctx.logger.info('');
        for (const p of featured) {
          ctx.logger.info(`  ⭐ ${p.name} v${p.version}`);
          ctx.logger.info(`      ${p.description}`);
          ctx.logger.info(`      ${p.downloads || 0} downloads/week`);
          ctx.logger.info('');
        }

        ctx.logger.success(`${featured.length} featured plugins`);
      } catch (error) {
        ctx.logger.error('Failed to get featured plugins', error as Error);
      }
    });

  // plugin:commands - List commands from plugins
  plugin
    .command('commands')
    .description('List all commands registered by plugins')
    .action(async () => {
      ctx.logger.step('Plugin Commands');

      if (!ctx.pluginManager) {
        ctx.logger.warn('Plugin manager not available');
        return;
      }

      const commands = ctx.pluginManager.getCommands();

      if (commands.length === 0) {
        ctx.logger.info('No plugin commands available');
        return;
      }

      ctx.logger.info('');
      for (const cmd of commands) {
        ctx.logger.info(`  ${cmd.name}`);
        ctx.logger.info(`    ${cmd.description}`);
      }

      ctx.logger.info('');
      ctx.logger.success(`${commands.length} commands available`);
    });

  // plugin:generators - List generators from plugins
  plugin
    .command('generators')
    .description('List all generators registered by plugins')
    .action(async () => {
      ctx.logger.step('Plugin Generators');

      if (!ctx.pluginManager) {
        ctx.logger.warn('Plugin manager not available');
        return;
      }

      const generators = ctx.pluginManager.getGenerators();

      if (generators.length === 0) {
        ctx.logger.info('No plugin generators available');
        return;
      }

      ctx.logger.info('');
      for (const gen of generators) {
        ctx.logger.info(`  ${gen.kind}`);
        ctx.logger.info(`    ${gen.description}`);
      }

      ctx.logger.info('');
      ctx.logger.success(`${generators.length} generators available`);
    });

  // plugin:check-updates - Check for plugin updates
  plugin
    .command('check-updates')
    .description('Check for available plugin updates')
    .action(async () => {
      ctx.logger.step('Checking for plugin updates...');

      if (!ctx.pluginManager) {
        ctx.logger.warn('Plugin manager not available');
        return;
      }

      try {
        const updates = await ctx.pluginManager.checkUpdates();

        if (updates.length === 0) {
          ctx.logger.success('All plugins are up to date!');
          return;
        }

        ctx.logger.info('');
        ctx.logger.info('Updates available:');
        for (const update of updates) {
          ctx.logger.info(`  ${update.name}: ${update.current} → ${update.latest}`);
        }

        ctx.logger.info('');
        ctx.logger.warn(`${updates.length} plugin(s) can be updated`);
        ctx.logger.info('Run: kubit-forge plugin:update <name> to update');
      } catch (error) {
        ctx.logger.error('Failed to check updates', error as Error);
      }
    });

  // plugin:versions - Show version information
  plugin
    .command('versions')
    .description('Show version information for all plugins')
    .action(() => {
      ctx.logger.step('Plugin Versions');

      if (!ctx.pluginManager) {
        ctx.logger.warn('Plugin manager not available');
        return;
      }

      const versionManager = ctx.pluginManager.getVersionManager();
      const versions = versionManager.getAllVersions();

      if (versions.length === 0) {
        ctx.logger.info('No plugins installed');
        return;
      }

      ctx.logger.info('');
      for (const v of versions) {
        const status = v.compatible ? '✓' : '✗';
        const update = v.updateAvailable ? ' (update available)' : '';

        ctx.logger.info(`  [${status}] ${v.name}`);
        ctx.logger.info(`      Installed: ${v.installedVersion || 'not installed'}`);

        if (v.requiredVersion) {
          ctx.logger.info(`      Required: ${v.requiredVersion}`);
        }

        if (v.latestVersion) {
          ctx.logger.info(`      Latest: ${v.latestVersion}${update}`);
        }

        ctx.logger.info('');
      }

      const stats = versionManager.getStats();
      ctx.logger.info(`Total: ${stats.totalPlugins} plugins`);
      ctx.logger.info(`  - Compatible: ${stats.compatible}`);
      ctx.logger.info(`  - Incompatible: ${stats.incompatible}`);
      ctx.logger.info(`  - Updates available: ${stats.updatable}`);
    });

  // plugin:dependencies - Show plugin dependencies
  plugin
    .command('dependencies')
    .description('Show plugin dependency tree')
    .argument('[name]', 'Plugin name (shows all if not specified)')
    .action((name?: string) => {
      ctx.logger.step(name ? `Dependencies for: ${name}` : 'All Plugin Dependencies');

      if (!ctx.pluginManager) {
        ctx.logger.warn('Plugin manager not available');
        return;
      }

      const resolver = ctx.pluginManager.getDependencyResolver();

      if (name) {
        // Show dependency tree for specific plugin
        const tree = resolver.getDependencyTree(name);

        interface TreeNode {
          name: string;
          version: string;
          dependencies?: TreeNode[];
        }

        const printTree = (node: TreeNode, indent = 0): void => {
          const prefix = '  '.repeat(indent);
          ctx.logger.info(`${prefix}${node.name}@${node.version}`);

          if (node.dependencies && node.dependencies.length > 0) {
            for (const dep of node.dependencies) {
              printTree(dep, indent + 1);
            }
          }
        };

        ctx.logger.info('');
        printTree(tree);
        ctx.logger.info('');

        // Show dependents
        const dependents = resolver.getDependents(name);
        if (dependents.length > 0) {
          ctx.logger.info('Plugins that depend on this:');
          for (const dep of dependents) {
            ctx.logger.info(`  - ${dep}`);
          }
        }
      } else {
        // Show stats
        const stats = resolver.getStats();
        ctx.logger.info('');
        ctx.logger.info(`Total plugins: ${stats.totalPlugins}`);
        ctx.logger.info(`Total dependencies: ${stats.totalDependencies}`);
        ctx.logger.info(`Total peer dependencies: ${stats.totalPeerDependencies}`);
        ctx.logger.info(`Total conflicts: ${stats.totalConflicts}`);
      }
    });

  // plugin:validate - Validate plugin compatibility
  plugin
    .command('validate')
    .description('Validate plugin compatibility and dependencies')
    .argument('[names...]', 'Plugin names to validate')
    .action((names: string[]) => {
      ctx.logger.step('Validating plugins...');

      if (!ctx.pluginManager) {
        ctx.logger.warn('Plugin manager not available');
        return;
      }

      const pluginsToValidate =
        names.length > 0
          ? names
          : ctx.pluginManager.getPlugins().map((p: { name: string }) => p.name);

      if (pluginsToValidate.length === 0) {
        ctx.logger.info('No plugins to validate');
        return;
      }

      const resolver = ctx.pluginManager.getDependencyResolver();
      const result = resolver.resolve(pluginsToValidate);

      ctx.logger.info('');

      if (result.errors.length > 0) {
        ctx.logger.error('Validation errors:');
        result.errors.forEach((err: string) => ctx.logger.error(`  - ${err}`));
      }

      if (result.warnings.length > 0) {
        ctx.logger.warn('\nWarnings:');
        result.warnings.forEach((warn: string) => ctx.logger.warn(`  - ${warn}`));
      }

      if (result.missing.length > 0) {
        ctx.logger.warn('\nMissing dependencies:');
        result.missing.forEach((dep: { name: string; version: string; optional?: boolean }) => {
          ctx.logger.warn(`  - ${dep.name}@${dep.version}${dep.optional ? ' (optional)' : ''}`);
        });
      }

      if (result.conflicts.length > 0) {
        ctx.logger.error('\nConflicts:');
        result.conflicts.forEach((conflict: { plugin: string; conflictsWith: string }) => {
          ctx.logger.error(`  - ${conflict.plugin} conflicts with ${conflict.conflictsWith}`);
        });
      }

      if (result.loadOrder.length > 0) {
        ctx.logger.info('\nRecommended load order:');
        ctx.logger.info(`  ${result.loadOrder.join(' → ')}`);
      }

      ctx.logger.info('');

      if (result.errors.length === 0) {
        ctx.logger.success('✓ All plugins are valid!');
      } else {
        ctx.logger.error('✗ Validation failed');
        process.exit(1);
      }
    });
}
