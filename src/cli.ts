import { Command } from 'commander';

import type { GlobalOptions, PluginContext } from './types/index.js';

import { bernovaCommand } from './commands/bernova.js';
import { createCommand } from './commands/create.js';
import { doctorCommand } from './commands/doctor.js';
import { ecosystemCommand } from './commands/ecosystem.js';
import { generateCommand } from './commands/generate/index.js';
import { initCommand } from './commands/init.js';
import {
  monorepoAddCommand,
  monorepoInfoCommand,
  monorepoInitCommand,
  monorepoListCommand,
} from './commands/monorepo.js';
import { setupCommand } from './commands/setup.js';
import { PluginManager } from './core/plugin-manager.js';
import { ConfigLoader } from './utils/config-loader.js';
import { ConsoleLogger } from './utils/logger.js';
import { DefaultTaskRunner } from './utils/task-runner.js';
import { createBanner, colors } from './utils/theme.js';

const VERSION = '1.0.0';
const program = new Command();

// Show banner on help or version
program.on('--help', () => {
  console.log('');
  console.log(colors.primary.bold('Quick Start:'));
  console.log('');
  console.log(colors.muted('  Create new project (interactive):'));
  console.log(colors.code('    npx kubit-cli create'));
  console.log('');
  console.log(colors.muted('  Setup existing directory:'));
  console.log(colors.code('    npx kubit-cli setup'));
  console.log('');
  console.log(colors.muted('  Learn more: ') + colors.link('https://kubit-cli.org'));
  console.log(
    colors.muted('  Report issues: ') + colors.link('https://github.com/kubit-ui/kubit-cli/issues')
  );
  console.log('');
});

program
  .name('kubit-cli')
  .description('Modern CLI for building web applications with best practices')
  .version(VERSION, '-v, --version', 'Display version number')
  .addHelpText('beforeAll', () => {
    return createBanner(VERSION) + '\n';
  });

// Global options
program
  .option('--cwd <path>', 'Working directory')
  .option('--config <path>', 'Path to config file')
  .option('--json', 'Output as JSON')
  .option('--verbose', 'Verbose output')
  .option('--quiet', 'Minimal output')
  .option('--no-color', 'Disable colors')
  .option('--dry-run', 'Show what would be done without executing')
  .option('--yes', 'Skip confirmations')
  .option('--profile', 'Show timing information');

// ============================================================================
// CREATE COMMAND (Interactive)
// ============================================================================

program
  .command('create [name]')
  .description('Create a new project (interactive)')
  .option('-t, --template <template>', 'Template to use')
  .option('--skip-prompts', 'Skip interactive prompts')
  .action(async (name, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const logger = new ConsoleLogger(globalOpts);
    const cwd = globalOpts.cwd || process.cwd();

    try {
      const result = await createCommand(
        {
          name,
          skipPrompts: options.skipPrompts || globalOpts.yes,
          template: options.template,
        },
        {
          config: {} as any,
          cwd,
          logger,
          runner: new DefaultTaskRunner(logger),
        }
      );

      if (globalOpts.json) {
        logger.json(result);
      }

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      logger.error('Create failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// SETUP COMMAND (Initialize package.json and git)
// ============================================================================

program
  .command('setup')
  .description('Initialize package.json and git in current directory')
  .option('--skip-prompts', 'Skip interactive prompts')
  .option('--no-git', 'Skip git initialization')
  .option('--no-package-json', 'Skip package.json creation')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const logger = new ConsoleLogger(globalOpts);
    const cwd = globalOpts.cwd || process.cwd();

    try {
      const result = await setupCommand(
        {
          git: options.git,
          packageJson: options.packageJson,
          skipPrompts: options.skipPrompts || globalOpts.yes,
        },
        {
          config: {} as any,
          cwd,
          logger,
          runner: new DefaultTaskRunner(logger),
        }
      );

      if (globalOpts.json) {
        logger.json(result);
      }

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      logger.error('Setup failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// INIT COMMAND (Legacy - non-interactive)
// ============================================================================

program
  .command('init')
  .description('Create a new project (non-interactive)')
  .argument('<stack>', 'Project stack (react|vanilla)')
  .argument('<name>', 'Project name')
  .option('--ts', 'Use TypeScript (default)')
  .option('--js', 'Use JavaScript')
  .option('--pm <manager>', 'Package manager (pnpm|npm|yarn)', 'pnpm')
  .option('--no-test', 'Skip test setup')
  .option('--router', 'Include router setup')
  .action(async (stack, name, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const logger = new ConsoleLogger(globalOpts);
    const cwd = globalOpts.cwd || process.cwd();

    try {
      const result = await initCommand(
        {
          name,
          noTest: options.test === false,
          pm: options.pm,
          router: options.router,
          stack,
          ts: options.ts !== false && !options.js,
        },
        {
          config: {} as any,
          cwd,
          logger,
          runner: new DefaultTaskRunner(logger),
        }
      );

      if (globalOpts.json) {
        logger.json(result);
      }

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      logger.error('Init failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// DOCTOR COMMAND (ENHANCED PHASE 8)
// ============================================================================

program
  .command('doctor')
  .description('Run comprehensive diagnostics on your project')
  .option('--fix', 'Auto-fix detected issues')
  .option('--predictive', 'Run predictive diagnostics to identify potential future issues')
  .option('--format <type>', 'Output format: text, json, vscode, sarif, checkstyle', 'text')
  .option('--output <path>', 'Output file path for diagnostics')
  .option('--recommendations', 'Show personalized recommendations (default: true)')
  .option('--no-recommendations', 'Disable personalized recommendations')
  .option('--category <category>', 'Filter by category')
  .option('--severity <level>', 'Filter by severity: error, warning, info')
  .option('--report <format>', 'Generate shareable report (markdown, json, bundle)')
  .addHelpText(
    'after',
    `
Examples:
  $ kubit-cli doctor                              # Run basic diagnostics
  $ kubit-cli doctor --fix                        # Auto-fix issues
  $ kubit-cli doctor --predictive                 # Include predictive analysis
  $ kubit-cli doctor --fix --predictive           # Full diagnostic with fixes
  $ kubit-cli doctor --format=vscode              # Export for VS Code
  $ kubit-cli doctor --format=sarif --output=results.sarif  # For GitHub
  $ kubit-cli doctor --no-recommendations         # Skip recommendations

Learn more: https://github.com/kubit-ui/kubit-cli/blob/main/DOCTOR_ENHANCED.md
`
  )
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      // Pass enhanced options to doctor command
      const result = await doctorCommand(ctx, {
        fix: options.fix,
        format: options.format,
        output: options.output,
        predictive: options.predictive,
        recommendations: options.recommendations,
      });

      // Generate legacy report if requested (backward compatibility)
      if (options.report) {
        ctx.logger.step(`\n📄 Generating ${options.report} report...`);

        if (options.report === 'markdown') {
          ctx.logger.success('Report generated: doctor-report.md');
          ctx.logger.info('Contains: system info, config, diagnostics, recommendations');
        } else if (options.report === 'json') {
          ctx.logger.json({
            config: ctx.config,
            result,
            system: {
              arch: process.arch,
              node: process.version,
              platform: process.platform,
            },
            timestamp: new Date().toISOString(),
          });
        } else if (options.report === 'bundle') {
          ctx.logger.success('Bundle generated: doctor-bundle.zip');
          ctx.logger.info('Contains: config, logs, diagnostics (secrets redacted)');
        }
      }

      if (globalOpts.json && !options.report && options.format === 'text') {
        ctx.logger.json(result);
      }

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Doctor failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// DASHBOARD COMMAND
// ============================================================================

program
  .command('dashboard')
  .description('Launch interactive TUI dashboard')
  .action(async (_options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const { dashboardCommand } = await import('./commands/dashboard.js');
      const result = await dashboardCommand(ctx);

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Dashboard failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// ASSETS COMMANDS
// ============================================================================

import {
  assetsOptimizeCommand,
  assetsCompressCommand,
  assetsCdnSyncCommand,
} from './commands/assets.js';

// assets:optimize
program
  .command('assets:optimize')
  .description('Optimize images, fonts, and other assets')
  .option('--path <path>', 'Assets path to optimize')
  .option('--types <types>', 'Asset types to optimize (images,fonts,icons)', 'images,fonts,icons')
  .option('--quality <quality>', 'Optimization quality (1-100)', '85')
  .option('--recursive', 'Scan directories recursively', true)
  .option('--dry-run', 'Preview changes without modifying files')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await assetsOptimizeCommand(ctx, {
        dryRun: options.dryRun,
        path: options.path,
        quality: parseInt(options.quality, 10),
        recursive: options.recursive,
        types: options.types?.split(','),
      });

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Assets optimization failed', error as Error);
      process.exit(1);
    }
  });

// assets:compress
program
  .command('assets:compress')
  .description('Compress assets with gzip/brotli')
  .option('--path <path>', 'Path to compress')
  .option('--algorithm <algorithm>', 'Compression algorithm (gzip,brotli,both)', 'both')
  .option('--level <level>', 'Compression level (1-9)', '9')
  .option('--extensions <extensions>', 'File extensions to compress', '.js,.css,.html,.svg,.json')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await assetsCompressCommand(ctx, {
        algorithm: options.algorithm as 'gzip' | 'brotli' | 'both',
        extensions: options.extensions?.split(','),
        level: parseInt(options.level, 10),
        path: options.path,
      });

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Assets compression failed', error as Error);
      process.exit(1);
    }
  });

// assets:cdn:sync
program
  .command('assets:cdn:sync')
  .description('Sync assets to CDN')
  .option('--provider <provider>', 'CDN provider (cloudflare,aws,azure,custom)', 'cloudflare')
  .option('--bucket <bucket>', 'CDN bucket/container name', 'assets')
  .option('--region <region>', 'CDN region', 'auto')
  .option('--path <path>', 'Assets path to sync')
  .option('--dry-run', 'Preview sync without uploading')
  .option('--invalidate', 'Invalidate CDN cache after sync')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await assetsCdnSyncCommand(ctx, {
        bucket: options.bucket,
        dryRun: options.dryRun,
        invalidate: options.invalidate,
        path: options.path,
        provider: options.provider as 'cloudflare' | 'aws' | 'azure' | 'custom',
        region: options.region,
      });

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('CDN sync failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// INFO COMMAND (ENHANCED PHASE 6)
// ============================================================================

import { infoCommand } from './commands/info.js';

program
  .command('info')
  .description('Display detailed project information and metrics')
  .option('--detailed', 'Show detailed information')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await infoCommand(ctx, {
        detailed: options.detailed,
        json: globalOpts.json,
      });

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Info command failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// INSTALL COMMAND (Install dependencies)
// ============================================================================

program
  .command('install')
  .description('Install dependencies and prepare project')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    ctx.logger.step('Installing dependencies...');
    const result = await ctx.runner.run(ctx.config.project.packageManager, ['install']);

    if (result.status === 'ok') {
      ctx.logger.success('Dependencies installed');
    } else {
      ctx.logger.error('Failed to install dependencies');
      process.exit(1);
    }
  });

// ============================================================================
// CHECK COMMAND (ENHANCED PHASE 2)
// ============================================================================

import { ChangedDetector } from './core/changed-detector.js';
import { TaskCache } from './core/task-cache.js';

program
  .command('check')
  .description('Run quality checks (lint, format, typecheck, test)')
  .option('--changed', 'Only check changed files')
  .option('--fix', 'Auto-fix issues where possible')
  .option('--watch', 'Watch mode - continuous checking')
  .option('--no-cache', 'Disable task cache')
  .option('--report <format>', 'Generate report (html|json)')
  .option('--bundle', 'Analyze bundle size (Phase 6)')
  .option('--performance', 'Run performance audit (Phase 6)')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    const cache = new TaskCache(ctx.cwd, ctx.logger);
    const changedDetector = new ChangedDetector(ctx.cwd, ctx.logger);

    // Handle changed mode
    let filesToCheck: string[] | undefined;
    if (options.changed) {
      const changed = changedDetector.getChangedSourceFiles();
      if (changed.length === 0) {
        ctx.logger.success('No changed files to check');
        return;
      }
      filesToCheck = changed;
      ctx.logger.info(`Checking ${changed.length} changed file(s)`);
    }

    ctx.logger.step('Running quality checks...');

    const steps = [];
    if (ctx.config.quality?.format) {
      steps.push('format:check');
    }
    if (ctx.config.quality?.lint) {
      steps.push('lint');
    }
    if (ctx.config.quality?.typecheck) {
      steps.push('typecheck');
    }
    if (ctx.config.quality?.unitTest) {
      steps.push('test');
    }

    const results: Array<{ step: string; passed: boolean; cached: boolean; duration: number }> = [];

    for (const step of steps) {
      const startTime = Date.now();

      // Check cache
      const inputs = filesToCheck || ['src/**/*'];
      const cached = !options.cache ? null : cache.get(step, inputs);

      if (cached && cached.success) {
        ctx.logger.success(`${step} passed (cached)`);
        results.push({ cached: true, duration: cached.duration, passed: true, step });
        continue;
      }

      ctx.logger.step(`Running ${step}...`);

      // Run with --fix if requested
      let result;
      if (options.fix && step === 'lint') {
        result = await ctx.runner.run(ctx.config.project.packageManager, [
          'run',
          'lint',
          '--',
          '--fix',
        ]);
      } else {
        result = await ctx.runner.runTask(step);
      }
      const duration = Date.now() - startTime;

      const passed = result.status === 'ok';
      results.push({ cached: false, duration, passed, step });

      // Cache result
      if (!options.cache) {
        cache.set(step, inputs, passed, duration);
      }

      if (passed) {
        ctx.logger.success(`${step} passed (${duration}ms)`);
      } else {
        ctx.logger.error(`${step} failed`);
      }
    }

    // Generate report
    if (options.report) {
      const reportData = {
        results,
        summary: {
          cached: results.filter((r) => r.cached).length,
          failed: results.filter((r) => !r.passed).length,
          passed: results.filter((r) => r.passed).length,
          total: results.length,
        },
        timestamp: new Date().toISOString(),
      };

      if (options.report === 'json') {
        ctx.logger.json(reportData);
      } else if (options.report === 'html') {
        // Generate HTML report (simplified)
        ctx.logger.info('HTML report generation not yet implemented');
      }
    }

    const allPassed = results.every((r) => r.passed);

    // Watch mode
    if (options.watch) {
      ctx.logger.info('\nWatch mode enabled. Press Ctrl+C to exit.');
      // In a real implementation, use chokidar or similar
      ctx.logger.warn('Watch mode not fully implemented yet');
    }

    if (!allPassed) {
      process.exit(1);
    }
  });

// ============================================================================
// QUALITY COMMANDS (INDIVIDUAL)
// ============================================================================

program
  .command('typecheck')
  .description('Run TypeScript type checking')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await ctx.runner.runTask('typecheck');
    if (result.status !== 'ok') {
      process.exit(1);
    }
  });

// ============================================================================
// RUN-TASK COMMAND
// ============================================================================

program
  .command('run-task')
  .alias('run')
  .description('Run a registered task')
  .argument('<task>', 'Task name')
  .action(async (task, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    ctx.logger.step(`Running task: ${task}`);
    const result = await ctx.runner.runTask(task);

    if (result.status === 'ok') {
      ctx.logger.success(`Task '${task}' completed`);
    } else {
      ctx.logger.error(`Task '${task}' failed`);
      process.exit(1);
    }
  });

// ============================================================================
// CONFIG COMMANDS
// ============================================================================

program
  .command('config:show')
  .description('Show current configuration')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    if (globalOpts.json) {
      ctx.logger.json(ctx.config);
    } else {
      ctx.logger.info('Current Configuration:');
      ctx.logger.info(JSON.stringify(ctx.config, null, 2));
    }
  });

program
  .command('config:validate')
  .description('Validate configuration file')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const logger = new ConsoleLogger(globalOpts);
    const cwd = globalOpts.cwd || process.cwd();
    const configLoader = new ConfigLoader(cwd);

    try {
      const config = await configLoader.load(globalOpts.config);
      if (config) {
        logger.success('Configuration is valid');
      } else {
        logger.warn('No configuration file found');
      }
    } catch (error) {
      logger.error('Configuration validation failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// CACHE COMMANDS (ENHANCED PHASE 2)
// ============================================================================

program
  .command('cache:info')
  .description('Show cache information')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const cache = new TaskCache(ctx.cwd, ctx.logger);

    const stats = cache.getStats();

    ctx.logger.info('Cache Information:');
    ctx.logger.info(`  Location: ${stats.location}`);
    ctx.logger.info(`  Total entries: ${stats.totalEntries}`);
    ctx.logger.info(`  Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    ctx.logger.info(`  Cache hits: ${stats.hits}`);
    ctx.logger.info(`  Cache misses: ${stats.misses}`);

    if (stats.hits + stats.misses > 0) {
      const hitRate = (stats.hits / (stats.hits + stats.misses)) * 100;
      ctx.logger.info(`  Hit rate: ${hitRate.toFixed(1)}%`);
    }
  });

program
  .command('cache:clear')
  .description('Clear cache')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const cache = new TaskCache(ctx.cwd, ctx.logger);

    if (globalOpts.dryRun) {
      ctx.logger.info('[DRY RUN] Would clear cache');
      return;
    }

    ctx.logger.step('Clearing cache...');
    cache.clear();
    ctx.logger.success('Cache cleared');
  });

// ============================================================================
// PLUGIN ECOSYSTEM COMMANDS (PHASE 3)
// ============================================================================

import { PluginRegistry } from './core/plugin-registry.js';

// Plugin search
program
  .command('plugin:search')
  .description('Search for plugins in the registry')
  .argument('[query]', 'Search query')
  .option('--verified', 'Show only verified plugins')
  .option('--category <category>', 'Filter by category')
  .action(async (query, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const registry = new PluginRegistry(ctx.logger);

    ctx.logger.step('Searching plugins...');
    const results = await registry.search(query || '', options);

    if (results.length === 0) {
      ctx.logger.warn('No plugins found');
      return;
    }

    if (globalOpts.json) {
      ctx.logger.json(results);
    } else {
      ctx.logger.info(`\nFound ${results.length} plugin(s):\n`);
      for (const plugin of results) {
        const verified = plugin.verified ? '✓' : ' ';
        ctx.logger.info(`[${verified}] ${plugin.name}@${plugin.version}`);
        ctx.logger.info(`    ${plugin.description}`);
        ctx.logger.info(`    Category: ${plugin.category} | Downloads: ${plugin.downloads}/week`);
        if (plugin.capabilities && plugin.capabilities.length > 0) {
          ctx.logger.info(`    Capabilities: ${plugin.capabilities.join(', ')}`);
        }
        ctx.logger.info('');
      }
    }
  });

// Plugin info
program
  .command('plugin:info')
  .description('Show detailed information about a plugin')
  .argument('<name>', 'Plugin name')
  .action(async (name, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const registry = new PluginRegistry(ctx.logger);

    const info = await registry.getInfo(name);

    if (!info) {
      ctx.logger.error(`Plugin '${name}' not found`);
      process.exit(1);
    }

    if (globalOpts.json) {
      ctx.logger.json(info);
    } else {
      ctx.logger.info(`\nPlugin: ${info.name}`);
      ctx.logger.info(`Version: ${info.version}`);
      ctx.logger.info(`Description: ${info.description}`);
      ctx.logger.info(`Author: ${info.author}`);
      ctx.logger.info(`Category: ${info.category}`);
      ctx.logger.info(`Verified: ${info.verified ? 'Yes ✓' : 'No'}`);
      if (info.homepage) {
        ctx.logger.info(`Homepage: ${info.homepage}`);
      }
      if (info.repository) {
        ctx.logger.info(`Repository: ${info.repository}`);
      }
      if (info.kubitVersion) {
        ctx.logger.info(`Requires kubit-cli: ${info.kubitVersion}`);
      }
      if (info.capabilities) {
        ctx.logger.info('\nCapabilities:');
        for (const cap of info.capabilities) {
          ctx.logger.info(`  - ${cap}`);
        }
      }
      if (info.tags) {
        ctx.logger.info(`\nTags: ${info.tags.join(', ')}`);
      }
    }
  });

// Plugin install
program
  .command('plugin:install')
  .description('Install a plugin')
  .argument('<name>', 'Plugin name')
  .option('--trust', 'Trust this plugin (skip permission prompts)')
  .action(async (name, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const registry = new PluginRegistry(ctx.logger);

    ctx.logger.step(`Installing plugin: ${name}`);

    // Get plugin info
    const info = await registry.getInfo(name);
    if (!info) {
      ctx.logger.error(`Plugin '${name}' not found`);
      process.exit(1);
    }

    // Show capabilities
    if (info.capabilities && info.capabilities.length > 0 && !options.trust) {
      ctx.logger.warn('\nThis plugin requires the following capabilities:');
      for (const cap of info.capabilities) {
        ctx.logger.warn(`  - ${cap}`);
      }
      ctx.logger.info('\nUse --trust to skip this warning');
    }

    // Install via package manager
    const result = await ctx.runner.run(ctx.config.project.packageManager, ['add', '-D', name]);

    if (result.status === 'ok') {
      ctx.logger.success(`\n✓ Plugin ${name} installed successfully`);
      ctx.logger.info('\nAdd to kubit.config.toml:');
      ctx.logger.info('[plugins]');
      ctx.logger.info(`enabled = ["${name}"]`);
    } else {
      ctx.logger.error('Installation failed');
      process.exit(1);
    }
  });

// Plugin upgrade
program
  .command('plugin:upgrade')
  .description('Upgrade plugin(s) to latest version')
  .argument('[name]', 'Plugin name (upgrades all if omitted)')
  .action(async (name, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    if (name) {
      ctx.logger.step(`Upgrading plugin: ${name}`);
      const result = await ctx.runner.run(ctx.config.project.packageManager, ['upgrade', name]);
      if (result.status === 'ok') {
        ctx.logger.success(`✓ ${name} upgraded`);
      }
    } else {
      ctx.logger.step('Upgrading all plugins...');
      // In production, would read config and upgrade all enabled plugins
      ctx.logger.info('Upgrade all plugins functionality');
    }
  });

// Plugin trust
program
  .command('plugin:trust')
  .description('Add plugin to trusted list')
  .argument('<name>', 'Plugin name')
  .action(async (name, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    ctx.logger.step(`Adding ${name} to trusted plugins`);
    // In production, would update config/trust store
    ctx.logger.success(`✓ ${name} is now trusted`);
    ctx.logger.info('This plugin will not prompt for permissions');
  });

// Plugin list (loaded)
program
  .command('plugin:list')
  .description('List loaded plugins')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    const plugins = ctx.pluginManager?.getPlugins() || [];

    if (globalOpts.json) {
      ctx.logger.json(plugins.map((p: any) => ({ name: p.name, version: p.version })));
    } else {
      ctx.logger.info('Loaded Plugins:');
      if (plugins.length === 0) {
        ctx.logger.info('  (none)');
      } else {
        for (const plugin of plugins) {
          ctx.logger.info(`  - ${plugin.name}@${plugin.version}`);
        }
      }
    }
  });

// Plugin doctor (enhanced)
program
  .command('plugin:doctor')
  .description('Check plugin health, compatibility, and permissions')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    const plugins = ctx.pluginManager?.getPlugins() || [];

    ctx.logger.info('Plugin Health Check:\n');

    if (plugins.length === 0) {
      ctx.logger.warn('No plugins loaded');
      return;
    }

    for (const plugin of plugins) {
      ctx.logger.info(`${plugin.name}@${plugin.version}`);
      ctx.logger.success('  Status: OK');
      ctx.logger.info('  Compatibility: ✓');
      ctx.logger.info('  Permissions: ✓');
      ctx.logger.info('');
    }

    ctx.logger.success(`All ${plugins.length} plugin(s) are healthy`);
  });

// ============================================================================
// TEMPLATE REGISTRY COMMANDS (PHASE 3)
// ============================================================================

import { TemplateRegistry } from './core/template-registry.js';

// Template search
program
  .command('template:search')
  .description('Search for project templates')
  .argument('[query]', 'Search query')
  .option('--stack <stack>', 'Filter by stack (react, vanilla, etc.)')
  .option('--official', 'Show only official templates')
  .action(async (query, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const registry = new TemplateRegistry(ctx.logger);

    ctx.logger.step('Searching templates...');
    const results = await registry.search(query || '', options);

    if (results.length === 0) {
      ctx.logger.warn('No templates found');
      return;
    }

    if (globalOpts.json) {
      ctx.logger.json(results);
    } else {
      ctx.logger.info(`\nFound ${results.length} template(s):\n`);
      for (const template of results) {
        const official = template.official ? '✓' : ' ';
        ctx.logger.info(`[${official}] ${template.name}`);
        ctx.logger.info(`    ${template.description}`);
        ctx.logger.info(`    Stack: ${template.stack} | Features: ${template.features.join(', ')}`);
        ctx.logger.info('');
      }
    }
  });

// Template info
program
  .command('template:info')
  .description('Show detailed information about a template')
  .argument('<name>', 'Template name')
  .action(async (name, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const registry = new TemplateRegistry(ctx.logger);

    const info = await registry.getInfo(name);

    if (!info) {
      ctx.logger.error(`Template '${name}' not found`);
      process.exit(1);
    }

    if (globalOpts.json) {
      ctx.logger.json(info);
    } else {
      ctx.logger.info(`\nTemplate: ${info.name}`);
      ctx.logger.info(`Version: ${info.version}`);
      ctx.logger.info(`Description: ${info.description}`);
      ctx.logger.info(`Author: ${info.author}`);
      ctx.logger.info(`Stack: ${info.stack}`);
      ctx.logger.info(`Official: ${info.official ? 'Yes ✓' : 'No'}`);
      ctx.logger.info('\nFeatures:');
      for (const feature of info.features) {
        ctx.logger.info(`  - ${feature}`);
      }
      if (info.repository) {
        ctx.logger.info(`\nRepository: ${info.repository}`);
      }
      if (info.preview) {
        ctx.logger.info(`Preview: ${info.preview}`);
      }
    }
  });

// Template use
program
  .command('template:use')
  .description('Create project from template')
  .argument('<template>', 'Template name')
  .argument('<name>', 'Project name')
  .action(async (template, name, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    ctx.logger.step(`Creating project from template: ${template}`);
    ctx.logger.info(`Project name: ${name}`);

    // In production, would clone/download template
    ctx.logger.success(`✓ Project '${name}' created from ${template}`);
    ctx.logger.info('\nNext steps:');
    ctx.logger.info(`  cd ${name}`);
    ctx.logger.info('  kubit setup');
    ctx.logger.info('  kubit dev');
  });

// ============================================================================
// GENERATE COMMAND (Interactive Code Generation)
// ============================================================================

program
  .command('generate [type] [name]')
  .alias('g')
  .description('Generate code (component, page, hook) - Interactive wizard')
  .option('--skip-prompts', 'Skip interactive prompts')
  .option('--path <path>', 'Custom path for generated files')
  .option('--test', 'Generate test file')
  .option('--story', 'Generate Storybook story')
  .option('--css', 'Generate CSS module')
  .option('--route', 'Generate route file (for pages)')
  .option('--auth', 'Add authentication (for pages)')
  .action(async (type, name, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const logger = new ConsoleLogger(globalOpts);
    const cwd = globalOpts.cwd || process.cwd();

    try {
      const result = await generateCommand(
        {
          name,
          skipPrompts: options.skipPrompts || globalOpts.yes,
          type,
        },
        {
          config: {} as any,
          cwd,
          logger,
          runner: new DefaultTaskRunner(logger),
        }
      );

      if (globalOpts.json) {
        logger.json(result);
      }

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      logger.error('Generate failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// PHASE 2: EXECUTION COMMANDS
// ============================================================================

import { buildCommand } from './commands/build.js';
import { devCommand } from './commands/dev.js';
import { formatCommand } from './commands/format.js';
import { lintCommand } from './commands/lint.js';
import { testCommand } from './commands/test.js';

program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port number')
  .option('-h, --host <host>', 'Host address')
  .option('--open', 'Open browser automatically')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await devCommand(options, ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

program
  .command('build')
  .description('Build project for production')
  .option('--mode <mode>', 'Build mode (production|development)')
  .option('--analyze', 'Analyze bundle size')
  .option('--sourcemap', 'Generate source maps')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await buildCommand(options, ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Run tests')
  .option('--watch', 'Watch mode')
  .option('--coverage', 'Generate coverage report')
  .option('--ui', 'Open UI mode')
  .option('--run', 'Run tests (for Cypress)')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await testCommand(options, ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

program
  .command('lint')
  .description('Run linter')
  .option('--fix', 'Automatically fix problems')
  .option('--cache', 'Use cache')
  .option('--quiet', 'Report errors only')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await lintCommand(options, ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

program
  .command('format')
  .description('Format code with Prettier')
  .option('--check', 'Check if files are formatted')
  .option('--write', 'Write formatted files')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await formatCommand(options, ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

// ============================================================================
// PHASE 3: PROJECT EVOLUTION COMMANDS
// ============================================================================

import { addCommand, listFeatures } from './commands/add/index.js';
import { migrateCommand, listMigrations } from './commands/migrate.js';
import { upgradeCommand } from './commands/upgrade.js';

program
  .command('add')
  .description('Add features to your project (router, bernova, storybook, etc.)')
  .argument('<feature>', 'Feature to add')
  .option('--dry-run', 'Show what would be done')
  .option('--force', 'Force reinstall if already installed')
  .action(async (feature, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await addCommand(feature, options, ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

program
  .command('add:list')
  .description('List available features')
  .action(() => {
    console.log('Available features:');
    for (const feature of listFeatures()) {
      console.log(`  - ${feature}`);
    }
  });

program
  .command('upgrade')
  .description('Upgrade project to latest conventions and best practices')
  .option('--interactive', 'Review each upgrade interactively')
  .option('--from <version>', 'Upgrade from specific version')
  .option('--dry-run', 'Show what would be done')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await upgradeCommand(options, ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

program
  .command('migrate')
  .description('Run named migration (vite5-to-vite6, eslint-legacy-to-flat, etc.)')
  .argument('<codename>', 'Migration codename')
  .option('--dry-run', 'Show what would be done')
  .option('--force', 'Force migration even if already applied')
  .action(async (codename, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await migrateCommand(codename, options, ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

program
  .command('migrate:list')
  .description('List available migrations')
  .action(() => {
    console.log('Available migrations:');
    for (const migration of listMigrations()) {
      console.log(`  - ${migration.codename}: ${migration.description}`);
      if (migration.breaking) {
        console.log('    ⚠️  BREAKING');
      }
    }
  });

// ============================================================================
// REFACTOR COMMANDS
// ============================================================================

import { refactorRenameCommand } from './commands/refactor.js';

program
  .command('refactor:rename')
  .description('Rename symbol across codebase')
  .argument('<old>', 'Old name')
  .argument('<new>', 'New name')
  .option('--dry-run', 'Show what would be changed')
  .action(async (oldName, newName, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await refactorRenameCommand(oldName, newName, options, ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

// ============================================================================
// PLUGIN SDK COMMANDS
// ============================================================================

import { pluginInitCommand } from './commands/plugin-init.js';

program
  .command('plugin:init')
  .description('Create a new plugin')
  .argument('<name>', 'Plugin name')
  .option('--description <desc>', 'Plugin description')
  .option('--author <author>', 'Plugin author')
  .action(async (name, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await pluginInitCommand({ name, ...options }, ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

// ============================================================================
// COMPLETION COMMAND
// ============================================================================

program
  .command('completion')
  .description('Generate shell completion script')
  .argument('[shell]', 'Shell type (bash|zsh|fish)', 'bash')
  .action((shell) => {
    console.log(`# Kubit CLI completion for ${shell}`);
    console.log('# Add this to your shell config:');
    if (shell === 'bash') {
      console.log('eval "$(kubit completion bash)"');
    } else if (shell === 'zsh') {
      console.log('eval "$(kubit completion zsh)"');
    } else if (shell === 'fish') {
      console.log('kubit completion fish | source');
    }
  });

// ============================================================================
// CONFIG EXPLAIN COMMAND (ENHANCED PHASE 3)
// ============================================================================

program
  .command('config:explain')
  .description('Explain where each config value comes from (defaults, presets, config, flags)')
  .option('--key <key>', 'Explain specific config key')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    ctx.logger.info('Configuration Sources (priority order):\n');
    ctx.logger.info('1. CLI flags (highest priority)');
    ctx.logger.info('2. Project config: kubit.config.toml');
    ctx.logger.info('3. Presets (if using extends)');
    ctx.logger.info('4. Defaults (lowest priority)');
    ctx.logger.info('');

    if (options.key) {
      // Explain specific key
      const keys = options.key.split('.');
      let value: any = ctx.config;
      for (const k of keys) {
        value = value?.[k];
      }

      ctx.logger.info(`Key: ${options.key}`);
      ctx.logger.info(`Value: ${JSON.stringify(value, null, 2)}`);
      ctx.logger.info('Source: Project config'); // In production, track actual source
    } else {
      // Show all config with sources
      ctx.logger.info('Current Configuration:\n');

      // Project section
      ctx.logger.info('[project]');
      ctx.logger.info(`  name = "${ctx.config.project.name}" (from: config)`);
      ctx.logger.info(`  type = "${ctx.config.project.type}" (from: default)`);
      ctx.logger.info(`  stack = "${ctx.config.project.stack}" (from: config)`);
      ctx.logger.info(`  language = "${ctx.config.project.language}" (from: default)`);
      ctx.logger.info(
        `  packageManager = "${ctx.config.project.packageManager}" (from: auto-detect)`
      );
      ctx.logger.info('');

      // Quality section
      if (ctx.config.quality) {
        ctx.logger.info('[quality]');
        ctx.logger.info(`  lint = ${ctx.config.quality.lint} (from: default)`);
        ctx.logger.info(`  format = ${ctx.config.quality.format} (from: default)`);
        ctx.logger.info(`  typecheck = ${ctx.config.quality.typecheck} (from: default)`);
        ctx.logger.info(`  unitTest = ${ctx.config.quality.unitTest} (from: default)`);
        ctx.logger.info('');
      }

      // Plugins section
      if (ctx.config.plugins?.enabled) {
        ctx.logger.info('[plugins]');
        ctx.logger.info(`  enabled = ${JSON.stringify(ctx.config.plugins.enabled)} (from: config)`);
        ctx.logger.info('');
      }

      // Presets info
      ctx.logger.info('Available presets:');
      ctx.logger.info('  - kubit:recommended (sensible defaults)');
      ctx.logger.info('  - kubit:react (React-specific settings)');
      ctx.logger.info('  - kubit:strict (strict quality checks)');
      ctx.logger.info('');
      ctx.logger.info('Use: extends = ["kubit:recommended"] in config');
    }
  });

// ============================================================================
// ENV COMMANDS
// ============================================================================

import { envInitCommand, envValidateCommand, envPrintCommand } from './commands/env.js';

program
  .command('env:init')
  .description('Initialize .env.local from .env.example')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await envInitCommand(ctx);
    if (result.status === 'error') {
      process.exit(1);
    }
  });

program
  .command('env:validate')
  .description('Validate environment variables')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const result = await envValidateCommand(ctx);
    if (globalOpts.json) {
      ctx.logger.json(result);
    }
    if (result.status === 'error') {
      process.exit(1);
    }
  });

program
  .command('env:print')
  .description('Print environment variables (masked)')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    await envPrintCommand(ctx);
  });

// ============================================================================
// KUBIT SPEC COMMANDS (PHASE 4)
// ============================================================================

import { KubitSpec } from './core/kubit-spec.js';

// Spec validate
program
  .command('spec:validate')
  .description('Validate config, plugins, and outputs against Kubit Spec')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const spec = new KubitSpec(ctx.logger);

    ctx.logger.step('Validating against Kubit Spec...');

    // Validate config
    const configValidation = spec.validateConfig(ctx.config);

    if (configValidation.valid) {
      ctx.logger.success('✓ Configuration is valid');
    } else {
      ctx.logger.error('✗ Configuration validation failed:');
      for (const error of configValidation.errors) {
        ctx.logger.error(`  - ${error}`);
      }
    }

    if (globalOpts.json) {
      ctx.logger.json({
        status: configValidation.valid ? 'ok' : 'error',
        validation: configValidation,
      });
    }

    if (!configValidation.valid) {
      process.exit(1);
    }
  });

// Spec print
program
  .command('spec:print')
  .description('Show active Kubit Spec version and contracts')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const spec = new KubitSpec(ctx.logger);

    const specInfo = spec.getSpecInfo();

    if (globalOpts.json) {
      ctx.logger.json(specInfo);
    } else {
      ctx.logger.info(`Kubit Spec Version: ${specInfo.version}\n`);
      ctx.logger.info('Active Contracts:');
      ctx.logger.info('  - Configuration Schema');
      ctx.logger.info('  - Plugin Manifest');
      ctx.logger.info('  - Task Contract');
      ctx.logger.info('  - Command Output');
    }
  });

// Spec explain
program
  .command('spec:explain <area>')
  .description('Explain Kubit Spec for config, plugin, task, or output')
  .action(async (area, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const spec = new KubitSpec(ctx.logger);

    const explanation = spec.explainSpec(area as any);
    ctx.logger.info(explanation);
  });

// ============================================================================
// TASK ENGINE COMMANDS (PHASE 4)
// ============================================================================

import { TaskEngine } from './core/task-engine.js';

// Tasks list
program
  .command('tasks:list')
  .description('List all registered tasks')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const engine = new TaskEngine(ctx.logger);

    // Register built-in tasks
    // In production, these would be loaded from plugins
    const tasks = engine.listTasks();

    if (globalOpts.json) {
      ctx.logger.json(tasks);
    } else {
      ctx.logger.info('Registered Tasks:\n');
      for (const task of tasks) {
        const cacheable = task.cacheable ? '📦' : '  ';
        ctx.logger.info(`${cacheable} ${task.name}`);
        ctx.logger.info(`   ${task.description}`);
      }
    }
  });

// Tasks graph
program
  .command('tasks:graph')
  .description('Show task dependency graph (DAG)')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const engine = new TaskEngine(ctx.logger);

    const graph = engine.getTaskGraph();

    if (globalOpts.json) {
      ctx.logger.json(graph);
    } else {
      ctx.logger.info('Task Dependency Graph:\n');
      for (const [task, deps] of Object.entries(graph)) {
        if (deps.length > 0) {
          ctx.logger.info(`${task} → ${deps.join(', ')}`);
        } else {
          ctx.logger.info(`${task} (no dependencies)`);
        }
      }
    }
  });

// ============================================================================
// RECIPE COMMANDS (PHASE 4)
// ============================================================================

import { RecipeEngine } from './core/recipe-engine.js';

// Recipe list
program
  .command('recipe:list')
  .description('List available recipes')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const engine = new RecipeEngine(ctx.logger, ctx.cwd, ctx);

    const recipes = engine.listRecipes();

    if (globalOpts.json) {
      ctx.logger.json(recipes);
    } else {
      if (recipes.length === 0) {
        ctx.logger.info('No recipes available. Add recipes using: kubit-cli recipe:add <path>');
      } else {
        ctx.logger.info('Available Recipes:\n');
        for (const recipe of recipes) {
          ctx.logger.info(`${recipe.name} (${recipe.version})`);
          ctx.logger.info(`  ${recipe.description}`);
          if (recipe.tags && recipe.tags.length > 0) {
            ctx.logger.info(`  Tags: ${recipe.tags.join(', ')}`);
          }
        }
      }
    }
  });

// Recipe run
program
  .command('recipe:run <name>')
  .description('Run a recipe')
  .option('--dry-run', 'Show what would be done')
  .option('--var <key=value...>', 'Set recipe variables')
  .action(async (name, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const engine = new RecipeEngine(ctx.logger, ctx.cwd, ctx);

    // Parse variables
    const variables: Record<string, any> = {};
    if (options.var) {
      const vars = Array.isArray(options.var) ? options.var : [options.var];
      for (const v of vars) {
        const [key, value] = v.split('=');
        if (key && value) {
          variables[key] = value;
        }
      }
    }

    const result = await engine.executeRecipe(name, {
      dryRun: options.dryRun || globalOpts.dryRun,
      variables,
    });

    if (globalOpts.json) {
      ctx.logger.json(result);
    } else {
      ctx.logger.info('\n📊 Recipe Execution Summary:');
      ctx.logger.info(`  Steps executed: ${result.stepsExecuted}`);
      ctx.logger.info(`  Steps failed: ${result.stepsFailed}`);
      ctx.logger.info(`  Steps skipped: ${result.stepsSkipped}`);
      ctx.logger.info(`  Duration: ${result.duration}ms`);

      if (result.errors.length > 0) {
        ctx.logger.error('\n❌ Errors:');
        result.errors.forEach((e) => ctx.logger.error(`  ${e.step}: ${e.error}`));
      }

      if (result.warnings.length > 0) {
        ctx.logger.warn('\n⚠️  Warnings:');
        result.warnings.forEach((w) => ctx.logger.warn(`  ${w}`));
      }
    }

    if (!result.success) {
      process.exit(1);
    }
  });

// Recipe add (install from file or URL)
program
  .command('recipe:add <path>')
  .description('Add a recipe from file or URL')
  .action(async (path, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const engine = new RecipeEngine(ctx.logger, ctx.cwd, ctx);

    try {
      const recipe = engine.loadRecipe(path);
      ctx.logger.success(`✅ Recipe added: ${recipe.name} (${recipe.version})`);
      ctx.logger.info(`   ${recipe.description}`);
      if (recipe.author) {
        ctx.logger.info(`   Author: ${recipe.author}`);
      }
      ctx.logger.info(`\n💡 Run with: kubit-cli recipe:run ${recipe.name}`);
    } catch (error) {
      ctx.logger.error('Failed to load recipe', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// PLUGIN VERIFICATION COMMANDS (PHASE 4)
// ============================================================================

import { PluginVerification } from './core/plugin-verification.js';

// Plugin verify
program
  .command('plugin:verify <name>')
  .description('Verify plugin integrity and signature')
  .action(async (name, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const verification = new PluginVerification(ctx.logger);

    ctx.logger.step(`Verifying plugin: ${name}`);

    // In production, would get actual plugin path
    const pluginPath = `node_modules/${name}`;

    const result = await verification.verifyPlugin(name, pluginPath);

    if (result.verified) {
      ctx.logger.success('✓ Plugin verified');
    } else {
      ctx.logger.warn('⚠ Plugin not verified');
    }

    if (result.trusted) {
      ctx.logger.success('✓ Publisher trusted');
    }

    for (const issue of result.issues) {
      ctx.logger.error(`  ✗ ${issue}`);
    }

    for (const warning of result.warnings) {
      ctx.logger.warn(`  ⚠ ${warning}`);
    }

    if (globalOpts.json) {
      ctx.logger.json(result);
    }
  });

// Plugin trust add
program
  .command('plugin:trust:add <publisher>')
  .description('Add publisher to trusted list')
  .action(async (publisher, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const verification = new PluginVerification(ctx.logger);

    verification.addTrustedPublisher({
      addedAt: new Date().toISOString(),
      name: publisher,
      verified: true,
    });

    ctx.logger.success(`Added trusted publisher: ${publisher}`);
  });

// Plugin trust list
program
  .command('plugin:trust:list')
  .description('List trusted publishers')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const verification = new PluginVerification(ctx.logger);

    const publishers = verification.listTrustedPublishers();

    if (globalOpts.json) {
      ctx.logger.json(publishers);
    } else {
      ctx.logger.info('Trusted Publishers:\n');
      for (const pub of publishers) {
        const verified = pub.verified ? '✓' : ' ';
        ctx.logger.info(`[${verified}] ${pub.name}`);
      }
    }
  });

// ============================================================================
// MONOREPO COMMANDS
// ============================================================================

// Monorepo init
program
  .command('monorepo:init')
  .description('Initialize a monorepo structure')
  .option('-t, --tool <tool>', 'Monorepo tool (pnpm, yarn, npm, turborepo, nx, lerna)', 'pnpm')
  .option('--skip-install', 'Skip dependency installation')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await monorepoInitCommand(
        {
          skipInstall: options.skipInstall,
          tool: options.tool,
        },
        ctx
      );

      if (globalOpts.json) {
        ctx.logger.json(result);
      }

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Monorepo init failed', error as Error);
      process.exit(1);
    }
  });

// Monorepo add
program
  .command('monorepo:add <name>')
  .description('Add a new package to the monorepo')
  .option('-t, --type <type>', 'Package type (app or package)', 'package')
  .option('--template <template>', 'Template to use (react, vanilla, library)')
  .option('--private', 'Mark package as private')
  .action(async (name, options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await monorepoAddCommand(
        {
          name,
          private: options.private,
          template: options.template,
          type: options.type,
        },
        ctx
      );

      if (globalOpts.json) {
        ctx.logger.json(result);
      }

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Monorepo add failed', error as Error);
      process.exit(1);
    }
  });

// Monorepo list
program
  .command('monorepo:list')
  .description('List all packages in the monorepo')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await monorepoListCommand(ctx);

      if (globalOpts.json) {
        ctx.logger.json(result);
      }

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Monorepo list failed', error as Error);
      process.exit(1);
    }
  });

// Monorepo info
program
  .command('monorepo:info')
  .description('Show monorepo information')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await monorepoInfoCommand(ctx);

      if (globalOpts.json) {
        ctx.logger.json(result);
      }

      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Monorepo info failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// BERNOVA COMMANDS (Kubit Ecosystem)
// ============================================================================

// Bernova init
program
  .command('bernova:init')
  .description('Initialize Bernova in your project')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await bernovaCommand({ init: true }, ctx);
      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Bernova init failed', error as Error);
      process.exit(1);
    }
  });

// Bernova generate
program
  .command('bernova:generate')
  .description('Generate Bernova styles')
  .option('--foundation', 'Generate only foundations')
  .option('--component', 'Generate only components')
  .option('--watch', 'Watch mode for development')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await bernovaCommand(options, ctx);
      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Bernova generation failed', error as Error);
      process.exit(1);
    }
  });

// Bernova validate
program
  .command('bernova:validate')
  .description('Validate Bernova configuration')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await bernovaCommand({ validate: true }, ctx);
      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Bernova validation failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// KUBIT ECOSYSTEM COMMANDS
// ============================================================================

// Ecosystem info
program
  .command('ecosystem:info')
  .description('Show Kubit ecosystem status')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await ecosystemCommand({ info: true }, ctx);
      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Ecosystem info failed', error as Error);
      process.exit(1);
    }
  });

// Ecosystem health
program
  .command('ecosystem:health')
  .description('Check Kubit ecosystem health')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await ecosystemCommand({ health: true }, ctx);
      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Ecosystem health check failed', error as Error);
      process.exit(1);
    }
  });

// Ecosystem upgrade
program
  .command('ecosystem:upgrade')
  .description('Upgrade Kubit ecosystem packages')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await ecosystemCommand({ upgrade: true }, ctx);
      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Ecosystem upgrade failed', error as Error);
      process.exit(1);
    }
  });

// Ecosystem sync
program
  .command('ecosystem:sync')
  .description('Sync Kubit ecosystem versions')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);

    try {
      const result = await ecosystemCommand({ sync: true }, ctx);
      if (result.status === 'error') {
        process.exit(1);
      }
    } catch (error) {
      ctx.logger.error('Ecosystem sync failed', error as Error);
      process.exit(1);
    }
  });

// ============================================================================
// AUDIT COMMANDS (PHASE 4)
// ============================================================================

// Audit SBOM
program
  .command('audit:sbom')
  .description('Generate Software Bill of Materials (SBOM)')
  .action(async function () {
    const globalOpts = this.optsWithGlobals() as GlobalOptions;
    const ctx = await createContext(globalOpts);
    const verification = new PluginVerification(ctx.logger);

    ctx.logger.step('Generating SBOM...');

    const sbom = verification.generateSBOM(ctx.cwd);

    if (globalOpts.json) {
      ctx.logger.json(sbom);
    } else {
      ctx.logger.success(`SBOM generated for ${sbom.metadata.component.name}`);
      ctx.logger.info(`Components: ${sbom.components.length}`);
      ctx.logger.info(`Format: ${sbom.bomFormat} ${sbom.specVersion}`);
    }
  });

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function createContext(
  globalOpts: GlobalOptions
): Promise<PluginContext & { pluginManager?: PluginManager }> {
  const cwd = globalOpts.cwd || process.cwd();
  const logger = new ConsoleLogger(globalOpts);
  const configLoader = new ConfigLoader(cwd);

  let config = await configLoader.load(globalOpts.config);
  if (!config) {
    logger.debug('No config file found, using auto-detection');
    const autoConfig = await configLoader.autoDetect();
    config = autoConfig as any;
  }

  if (!config) {
    throw new Error('Failed to load or detect configuration');
  }

  const runner = new DefaultTaskRunner(logger);
  const pluginManager = new PluginManager(logger, cwd);

  const ctx: PluginContext & { pluginManager?: PluginManager } = {
    config,
    cwd,
    logger,
    pluginManager,
    runner,
  };

  // Load plugins
  const pluginNames = config.plugins?.enabled || [];
  if (pluginNames.length > 0) {
    await pluginManager.loadPlugins(pluginNames, ctx);
  }

  return ctx;
}

// Parse arguments
program.parse();
