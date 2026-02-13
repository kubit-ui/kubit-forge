import chalk from 'chalk';

import type {
  BundlerSwitchOptions,
  BundlerType,
  CommandResult,
  PluginContext,
} from '../types/index.js';

import { RspackAdapter, ViteAdapter, WebpackAdapter } from '../bundlers/index.js';
import { BundlerManager } from '../core/bundler-manager.js';

/**
 * Bundler command - Manage project bundlers
 */

export interface BundlerCommandOptions {
  subcommand: 'list' | 'detect' | 'switch' | 'validate' | 'info';
  to?: BundlerType;
  keepOldConfig?: boolean;
  migrate?: boolean;
  force?: boolean;
}

export async function bundlerCommand(
  options: BundlerCommandOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const bundlerManager = new BundlerManager(ctx.logger);

  // Register bundler adapters
  bundlerManager.registerAdapter(new ViteAdapter());
  bundlerManager.registerAdapter(new WebpackAdapter());
  bundlerManager.registerAdapter(new RspackAdapter());

  const { subcommand } = options;

  switch (subcommand) {
    case 'list':
      return await listBundlers(bundlerManager, ctx);

    case 'detect':
      return await detectBundler(bundlerManager, ctx);

    case 'switch':
      return await switchBundler(bundlerManager, options, ctx);

    case 'validate':
      return await validateBundler(bundlerManager, ctx);

    case 'info':
      return await bundlerInfo(bundlerManager, ctx);

    default:
      return {
        message: `Unknown subcommand: ${subcommand}. Use: list, detect, switch, validate, info`,
        status: 'error',
      };
  }
}

/**
 * List available bundlers
 */
async function listBundlers(
  bundlerManager: BundlerManager,
  ctx: PluginContext
): Promise<CommandResult> {
  ctx.logger.step('Available Bundlers');

  const bundlers = bundlerManager.listBundlers();

  console.log('');
  bundlers.forEach((bundler) => {
    const adapter = bundlerManager.getAdapter(bundler);
    if (adapter) {
      console.log(chalk.cyan(`  ${bundler}`));
      console.log(chalk.gray(`    Version: ${adapter.version}`));
      console.log(
        chalk.gray(
          `    Capabilities: ${Object.entries(adapter.capabilities)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(', ')}`
        )
      );
      console.log('');
    }
  });

  return {
    data: { bundlers },
    message: `${bundlers.length} bundlers available`,
    status: 'ok',
  };
}

/**
 * Detect current bundler
 */
async function detectBundler(
  bundlerManager: BundlerManager,
  ctx: PluginContext
): Promise<CommandResult> {
  ctx.logger.step('Detecting bundler...');

  const detection = await bundlerManager.detectBundler(ctx.cwd);

  if (detection.detected) {
    console.log('');
    console.log(chalk.green('✓ Bundler detected:'));
    console.log(chalk.cyan(`  Type: ${detection.bundler}`));
    if (detection.version) {
      console.log(chalk.gray(`  Version: ${detection.version}`));
    }
    if (detection.configFile) {
      console.log(chalk.gray(`  Config: ${detection.configFile}`));
    }
    console.log(chalk.gray(`  Confidence: ${detection.confidence}`));
    console.log('');

    return {
      data: detection,
      message: `Detected ${detection.bundler}`,
      status: 'ok',
    };
  }

  console.log('');
  console.log(chalk.yellow('⚠ No bundler detected'));
  console.log(chalk.gray('  Run: kubit-forge bundler:switch --to vite'));
  console.log('');

  return {
    message: 'No bundler detected',
    status: 'warning',
  };
}

/**
 * Switch bundler
 */
async function switchBundler(
  bundlerManager: BundlerManager,
  options: BundlerCommandOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const { force, keepOldConfig, migrate, to } = options;

  if (!to) {
    return {
      errors: [
        {
          code: 'MISSING_BUNDLER',
          message: 'Target bundler is required',
          solution: 'Use: kubit-forge bundler:switch --to <bundler>',
        },
      ],
      message: 'Target bundler is required',
      status: 'error',
    };
  }

  const switchOptions: BundlerSwitchOptions = {
    force: force || false,
    keepOldConfig: keepOldConfig || false,
    migrate: migrate !== false, // default true
    to,
  };

  const result = await bundlerManager.switchBundler(switchOptions, ctx);

  if (result.success) {
    console.log('');
    console.log(
      chalk.green(`✓ Successfully switched from ${result.fromBundler} to ${result.toBundler}`)
    );
    console.log('');

    if (result.changes.length > 0) {
      console.log(chalk.cyan('Changes made:'));
      result.changes.forEach((change) => {
        const icon = change.action === 'created' ? '+' : change.action === 'deleted' ? '-' : '~';
        console.log(chalk.gray(`  ${icon} ${change.description}`));
      });
      console.log('');
    }

    if (result.manualSteps && result.manualSteps.length > 0) {
      console.log(chalk.yellow('Manual steps required:'));
      result.manualSteps.forEach((step, index) => {
        console.log(chalk.gray(`  ${index + 1}. ${step}`));
      });
      console.log('');
    }

    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray(`  1. Run: ${ctx.config.project.packageManager} install`));
    console.log(chalk.gray(`  2. Run: ${ctx.config.project.packageManager} run dev`));
    console.log('');

    return {
      data: result,
      message: `Switched to ${to}`,
      status: 'ok',
    };
  }

  console.log('');
  console.log(chalk.red('✗ Failed to switch bundler'));
  if (result.manualSteps) {
    result.manualSteps.forEach((step) => {
      console.log(chalk.gray(`  - ${step}`));
    });
  }
  console.log('');

  return {
    data: result,
    message: 'Failed to switch bundler',
    status: 'error',
  };
}

/**
 * Validate bundler configuration
 */
async function validateBundler(
  bundlerManager: BundlerManager,
  ctx: PluginContext
): Promise<CommandResult> {
  ctx.logger.step('Validating bundler configuration...');

  const detection = await bundlerManager.detectBundler(ctx.cwd);

  if (!detection.detected || !detection.bundler) {
    return {
      message: 'No bundler detected',
      status: 'error',
    };
  }

  const isValid = await bundlerManager.validateBundler(detection.bundler, ctx.cwd);

  return {
    message: isValid ? 'Configuration is valid' : 'Configuration has errors',
    status: isValid ? 'ok' : 'error',
  };
}

/**
 * Show bundler information
 */
async function bundlerInfo(
  bundlerManager: BundlerManager,
  ctx: PluginContext
): Promise<CommandResult> {
  const detection = await bundlerManager.detectBundler(ctx.cwd);

  if (!detection.detected || !detection.bundler) {
    console.log('');
    console.log(chalk.yellow('⚠ No bundler detected'));
    console.log('');
    return {
      message: 'No bundler detected',
      status: 'warning',
    };
  }

  const adapter = bundlerManager.getAdapter(detection.bundler);
  if (!adapter) {
    return {
      message: 'Bundler adapter not found',
      status: 'error',
    };
  }

  console.log('');
  console.log(chalk.cyan('Bundler Information'));
  console.log('');
  console.log(chalk.gray(`  Name: ${chalk.white(detection.bundler)}`));
  console.log(chalk.gray(`  Version: ${chalk.white(adapter.version)}`));
  console.log(chalk.gray(`  Config: ${chalk.white(detection.configFile || 'N/A')}`));
  console.log('');

  console.log(chalk.cyan('Capabilities:'));
  Object.entries(adapter.capabilities).forEach(([key, value]) => {
    const icon = value ? chalk.green('✓') : chalk.red('✗');
    console.log(chalk.gray(`  ${icon} ${key}`));
  });
  console.log('');

  return {
    data: { adapter: detection.bundler, capabilities: adapter.capabilities },
    message: 'Bundler information retrieved',
    status: 'ok',
  };
}
