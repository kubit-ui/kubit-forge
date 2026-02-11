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

import type {
  GlobalOptions,
  KubitConfig,
  PluginContext,
  CommandRegistration,
} from '../types/index.js';

import { PluginManager } from '../core/plugin-manager.js';
import { RecipeEngine } from '../core/recipe-engine.js';
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

  /**
   * Enable recipe commands (recipe:list, recipe:run, recipe:add)
   * @default false
   */
  enableRecipes?: boolean;

  /**
   * Custom commands to register before plugins
   * Use this to add inline commands to your CLI
   */
  commands?: CommandRegistration[];

  /**
   * Callback to setup custom commands before running CLI
   * Provides access to the Commander program instance
   */
  beforeSetup?: (program: Command, ctx: PluginContext) => void | Promise<void>;
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
    beforeSetup,
    commands: customCommands = [],
    configDir: userConfigDir,
    cwd = process.cwd(),
    description = 'Modern development CLI powered by Kubit Forge',
    enableRecipes = false,
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

    // Register custom commands (before plugins)
    if (customCommands.length > 0) {
      registerCustomCommands(program, customCommands, ctx);
    }

    // Call beforeSetup callback
    if (beforeSetup) {
      await beforeSetup(program, ctx);
    }

    // Register commands from plugins
    registerCommands(program, ctx);

    // Register generators as commands
    registerGenerators(program, ctx);

    // Register recipe commands if enabled
    if (enableRecipes) {
      registerRecipeCommands(program, ctx);
    }

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

/**
 * Register custom commands provided in options
 */
function registerCustomCommands(
  program: Command,
  commands: CommandRegistration[],
  ctx: PluginContext
): void {
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
        const result = await cmdReg.action(args, ctx);
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
    ctx.logger.debug(`Registered ${commands.length} custom commands`);
  }
}

/**
 * Register recipe commands (recipe:list, recipe:run, recipe:add)
 */
function registerRecipeCommands(program: Command, ctx: PluginContext): void {
  const recipeEngine = new RecipeEngine(ctx.logger, ctx.cwd, ctx);

  // Note: Recipes will be loaded on-demand when listing or running

  // recipe:list
  program
    .command('recipe:list')
    .description('List available recipes')
    .action(async (_, command) => {
      const globalOpts = command.optsWithGlobals() as GlobalOptions;
      const recipes = recipeEngine.listRecipes();

      if (globalOpts.json) {
        ctx.logger.json(recipes);
      } else {
        if (recipes.length === 0) {
          ctx.logger.info('No recipes available. Add recipes using: recipe:add <path>');
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

  // recipe:run
  program
    .command('recipe:run <name>')
    .description('Run a recipe')
    .option('--dry-run', 'Show what would be done')
    .option('--var <key=value...>', 'Set recipe variables')
    .action(async (name: string, options: any, command: any) => {
      const globalOpts = command.optsWithGlobals() as GlobalOptions;

      // Parse variables
      const variables: Record<string, any> = {};
      if (options.var) {
        for (const varStr of options.var) {
          const [key, value] = varStr.split('=');
          if (key && value) {
            variables[key] = value;
          }
        }
      }

      const result = await recipeEngine.executeRecipe(name, {
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

        if (!result.success) {
          ctx.logger.error('\n❌ Recipe execution failed');
          process.exit(1);
        } else if (result.stepsFailed > 0) {
          ctx.logger.warn('\n⚠ Recipe execution completed with failures');
        } else {
          ctx.logger.success('\n✅ Recipe execution completed successfully');
        }
      }
    });

  // recipe:add
  program
    .command('recipe:add <path>')
    .description('Add a recipe from file or URL')
    .action(async (path: string) => {
      try {
        const recipe = recipeEngine.loadRecipe(path);
        ctx.logger.success(`✅ Recipe added: ${recipe.name} (${recipe.version})`);
        ctx.logger.info(`   ${recipe.description}`);
        if (recipe.author) {
          ctx.logger.info(`   Author: ${recipe.author}`);
        }
        ctx.logger.info(`\n💡 Run with: recipe:run ${recipe.name}`);
      } catch (error) {
        ctx.logger.error('Failed to load recipe', error as Error);
        process.exit(1);
      }
    });

  ctx.logger.debug('Registered recipe commands');
}
