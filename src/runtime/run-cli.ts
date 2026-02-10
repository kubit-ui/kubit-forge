/**
 * Run CLI - Main entry point for kubit-forge-based CLIs
 *
 * This function provides a complete CLI runtime that:
 * - Loads configuration from kubit.config.toml
 * - Initializes plugin system
 * - Registers all commands, tasks, and generators
 * - Handles global options and lifecycle hooks
 * - Provides a complete CLI experience out-of-the-box
 */

import { Command } from 'commander';

import type { GlobalOptions, KubitConfig, PluginContext } from '../types/index.js';

import { PluginManager } from '../core/plugin-manager.js';
import { ConfigLoader } from '../utils/config-loader.js';
import { ConsoleLogger } from '../utils/logger.js';
import { DefaultTaskRunner } from '../utils/task-runner.js';

export interface RunCLIOptions {
  /**
   * Working directory (defaults to process.cwd())
   */
  cwd?: string;

  /**
   * Directory where kubit.config.toml is located
   * If not provided, defaults to process.cwd()
   */
  configDir?: string;

  /**
   * Path to config file (defaults to kubit.config.toml)
   */
  configPath?: string;

  /**
   * CLI version (for --version flag)
   */
  version?: string;

  /**
   * CLI name (for help text)
   */
  name?: string;

  /**
   * CLI description (for help text)
   */
  description?: string;

  /**
   * Custom banner function
   */
  banner?: (version: string) => string;

  /**
   * Additional examples for help text
   */
  examples?: string[];
}

/**
 * Run a kubit-forge-based CLI
 *
 * @example
 * ```typescript
 * // src/index.ts
 * #!/usr/bin/env node
 * import { runCLI } from 'kubit-forge';
 * import { fileURLToPath } from 'url';
 * import { dirname, join } from 'path';
 *
 * const cliDir = dirname(fileURLToPath(import.meta.url));
 * const configDir = join(cliDir, '..');
 *
 * await runCLI({
 *   configDir,
 *   name: 'my-cli',
 *   version: '1.0.0',
 *   description: 'My awesome CLI',
 * });
 * ```
 */
export async function runCLI(options: RunCLIOptions = {}): Promise<void> {
  const {
    banner,
    configDir: userConfigDir,
    cwd = process.cwd(),
    description = 'Modern development CLI powered by Kubit Forge',
    examples = [],
    name = 'kubit',
    version = '1.0.0',
  } = options;

  // Create program
  const program = new Command();

  // Configure CLI
  program
    .name(name)
    .version(version, '-v, --version', 'Display version number')
    .description(description);

  // Add banner if provided
  if (banner) {
    program.addHelpText('beforeAll', () => banner(version));
  }

  // Setup global options
  setupGlobalOptions(program);

  // Determine config directory (defaults to cwd)
  const configDir = userConfigDir || cwd;

  try {
    // Load configuration
    const configLoader = new ConfigLoader(configDir);
    const config = await loadConfig(configLoader);

    // Initialize plugin context
    const globalOpts = program.opts() as GlobalOptions;
    const ctx = await createContext(config, cwd, configDir, globalOpts);

    // Load plugins
    await loadPlugins(config, ctx);

    // Register commands from plugins
    registerCommands(program, ctx);

    // Register generators as commands
    registerGenerators(program, ctx);

    // Add examples to help
    if (examples.length > 0) {
      program.addHelpText('after', () => {
        let text = '\nExamples:\n';
        for (const example of examples) {
          text += `  $ ${example}\n`;
        }
        return text;
      });
    }

    // Parse and execute
    program.parse();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

/**
 * Setup global options on the program
 */
function setupGlobalOptions(program: Command): void {
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
}

/**
 * Load configuration with proper error handling
 */
async function loadConfig(configLoader: ConfigLoader): Promise<KubitConfig> {
  try {
    const config = await configLoader.load();
    if (!config) {
      // Return minimal default config
      return {
        project: {
          name: 'my-project',
          stack: 'vanilla',
        },
      } as KubitConfig;
    }
    return config;
  } catch (error) {
    // Config validation failed, return minimal config
    console.warn('Warning: Failed to load kubit.config.toml, using defaults');
    return {
      project: {
        name: 'my-project',
        stack: 'vanilla',
      },
    } as KubitConfig;
  }
}

/**
 * Create plugin context
 */
async function createContext(
  config: KubitConfig,
  userCwd: string,
  configDir: string,
  globalOpts: GlobalOptions
): Promise<PluginContext> {
  const logger = new ConsoleLogger(globalOpts);
  const runner = new DefaultTaskRunner(logger);
  const pluginManager = new PluginManager(logger, configDir);

  return {
    config,
    cwd: userCwd,
    logger,
    pluginManager,
    runner,
  };
}

/**
 * Load all plugins (external and internal)
 */
async function loadPlugins(config: KubitConfig, ctx: PluginContext): Promise<void> {
  const { pluginManager } = ctx;

  // Load external plugins from npm
  if (config.plugins?.enabled && config.plugins.enabled.length > 0) {
    await pluginManager.loadPlugins(config.plugins.enabled, ctx);
  }

  // Load internal plugins from file paths
  if (config.plugins?.internal && config.plugins.internal.length > 0) {
    await pluginManager.loadInternalPlugins(config.plugins.internal, ctx);
  }
}

/**
 * Register all commands from loaded plugins
 */
function registerCommands(program: Command, ctx: PluginContext): void {
  const commands = ctx.pluginManager.getCommands();

  for (const cmdReg of commands) {
    const cmd = program.command(cmdReg.name).description(cmdReg.description);

    // Add options
    if (cmdReg.options) {
      for (const opt of cmdReg.options) {
        cmd.option(opt.flags, opt.description, opt.defaultValue);
      }
    }

    // Add action
    cmd.action(async (args: any) => {
      try {
        // Call beforeCommand hooks
        await ctx.pluginManager.callBeforeCommand(cmdReg.name, ctx);

        // Execute command
        const result = await cmdReg.action(args, ctx);

        // Call afterCommand hooks
        await ctx.pluginManager.callAfterCommand(cmdReg.name, ctx, result);

        if (result?.status === 'error') {
          process.exit(1);
        }
      } catch (error) {
        console.error('Command failed:', error);
        process.exit(1);
      }
    });
  }

  if (commands.length > 0) {
    ctx.logger.debug(`Registered ${commands.length} commands`);
  }
}

/**
 * Register all generators as commands
 */
function registerGenerators(program: Command, ctx: PluginContext): void {
  const generators = ctx.pluginManager.getGenerators();

  for (const genReg of generators) {
    const cmd = program
      .command(`generate:${genReg.kind}`)
      .description(genReg.description || `Generate ${genReg.kind}`);

    // Add common generator options
    cmd
      .option('--name <name>', 'Name of the generated item')
      .option('--path <path>', 'Path where to generate')
      .option('--force', 'Overwrite existing files');

    // Add custom options if provided
    if (genReg.options) {
      for (const opt of genReg.options) {
        cmd.option(opt.flags, opt.description, opt.defaultValue);
      }
    }

    cmd.action(async (options: any) => {
      try {
        const result = await genReg.generate(options.name || '', options, ctx);
        if (result?.status === 'error') {
          console.error('Generation failed:', result.message);
          process.exit(1);
        }
      } catch (error) {
        console.error('Generator failed:', error);
        process.exit(1);
      }
    });
  }

  if (generators.length > 0) {
    ctx.logger.debug(`Registered ${generators.length} generators`);
  }
}
