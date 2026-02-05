import { existsSync } from 'fs';
import { join } from 'path';

import type {
  Plugin,
  PluginContext,
  CommandRegistration,
  TaskRegistration,
  GeneratorRegistration,
  ProviderRegistration,
  Logger,
  CommandResult,
  TaskResult,
} from '../types/index.js';
import type { PluginMetadata } from './plugin-dependency-resolver.js';

import { PluginDependencyResolver } from './plugin-dependency-resolver.js';
import { PluginRegistry } from './plugin-registry.js';
import { SandboxManager } from './plugin-sandbox.js';
import { PluginValidator } from './plugin-validator.js';
import { PluginVersionManager } from './plugin-version-manager.js';

export interface PluginLoadOptions {
  validate?: boolean;
  skipSecurityCheck?: boolean;
  useSandbox?: boolean;
  checkDependencies?: boolean;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private commands: Map<string, CommandRegistration> = new Map();
  private tasks: Map<string, TaskRegistration> = new Map();
  private generators: Map<string, GeneratorRegistration> = new Map();
  private providers: Map<string, ProviderRegistration[]> = new Map();
  private logger: Logger;
  private cwd: string;
  private validator: PluginValidator;
  private registry: PluginRegistry;
  private sandboxManager: SandboxManager;
  private versionManager: PluginVersionManager;
  private dependencyResolver: PluginDependencyResolver;

  constructor(logger: Logger, cwd: string) {
    this.logger = logger;
    this.cwd = cwd;
    this.validator = new PluginValidator();
    this.registry = new PluginRegistry(logger);
    this.sandboxManager = new SandboxManager(logger);
    this.versionManager = new PluginVersionManager(logger);
    this.dependencyResolver = new PluginDependencyResolver(logger);
  }

  /**
   * Load plugins from config or auto-detect
   */
  async loadPlugins(
    pluginNames: string[],
    ctx: PluginContext,
    options: PluginLoadOptions = {}
  ): Promise<void> {
    // Resolve dependencies first
    if (options.checkDependencies !== false) {
      const resolution = this.dependencyResolver.resolve(pluginNames);

      if (resolution.errors.length > 0) {
        this.logger.error('Plugin dependency resolution failed:');
        resolution.errors.forEach((err) => this.logger.error(`  - ${err}`));
        throw new Error('Cannot load plugins due to dependency errors');
      }

      if (resolution.warnings.length > 0) {
        resolution.warnings.forEach((warn) => this.logger.warn(warn));
      }

      // Use resolved load order
      pluginNames = resolution.loadOrder;
      this.logger.debug(`Plugin load order: ${pluginNames.join(' -> ')}`);
    }

    // Load plugins in order
    for (const pluginName of pluginNames) {
      try {
        await this.loadPlugin(pluginName, ctx, options);
      } catch (error) {
        this.logger.warn(
          `Failed to load plugin '${pluginName}': ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Load a single plugin
   */
  private async loadPlugin(
    pluginName: string,
    ctx: PluginContext,
    options: PluginLoadOptions = {}
  ): Promise<void> {
    // Try to resolve plugin
    let pluginModule: { default?: Plugin; [key: string]: unknown };

    try {
      // Try as npm package
      const pluginPath = join(this.cwd, 'node_modules', pluginName);
      if (existsSync(pluginPath)) {
        pluginModule = await import(pluginPath);
      } else {
        // Try as local path
        pluginModule = await import(pluginName);
      }
    } catch {
      throw new Error(`Cannot resolve plugin '${pluginName}'`);
    }

    const plugin = (pluginModule.default || pluginModule) as Plugin;

    if (!plugin.name || !plugin.version) {
      throw new Error(`Invalid plugin '${pluginName}': missing name or version`);
    }

    // Register version
    this.versionManager.registerInstalled(plugin.name, plugin.version);

    // Check version compatibility
    const versionCheck = this.versionManager.checkCompatibility(plugin.name);
    if (!versionCheck.compatible) {
      this.logger.error(`Plugin '${plugin.name}' version compatibility check failed:`);
      versionCheck.issues.forEach((issue) => this.logger.error(`  - ${issue}`));
      throw new Error(`Plugin '${plugin.name}' is not compatible`);
    }

    if (versionCheck.warnings.length > 0) {
      versionCheck.warnings.forEach((warn) => this.logger.warn(warn));
    }

    // Validate plugin if requested
    if (options.validate !== false) {
      const validation = this.validator.validate(plugin);

      if (!validation.valid) {
        throw new Error(
          `Plugin '${plugin.name}' validation failed:\n${validation.errors.join('\n')}`
        );
      }

      // Show warnings
      if (validation.warnings.length > 0) {
        for (const warning of validation.warnings) {
          this.logger.warn(`Plugin '${plugin.name}': ${warning}`);
        }
      }

      // Check security issues
      if (!options.skipSecurityCheck && validation.securityIssues.length > 0) {
        this.logger.warn(`\nSecurity notice for plugin '${plugin.name}':`);
        for (const issue of validation.securityIssues) {
          this.logger.warn(`  - ${issue}`);
        }

        const securityLevel = this.validator.getSecurityLevel(plugin);
        if (securityLevel === 'dangerous') {
          this.logger.warn(
            '\nThis plugin requires dangerous permissions. Only install if you trust the source.'
          );
        }
      }
    }

    // Store plugin
    this.plugins.set(plugin.name, plugin);

    // Call onLoad hook
    if (plugin.onLoad) {
      await plugin.onLoad(ctx);
    }

    // Register commands
    if (plugin.registerCommands) {
      const commands = plugin.registerCommands();
      for (const cmd of commands) {
        this.commands.set(cmd.name, cmd);
        this.logger.debug(`Registered command '${cmd.name}' from plugin '${plugin.name}'`);
      }
    }

    // Register tasks
    if (plugin.registerTasks) {
      const tasks = plugin.registerTasks();
      for (const task of tasks) {
        this.tasks.set(task.name, task);
        this.logger.debug(`Registered task '${task.name}' from plugin '${plugin.name}'`);
      }
    }

    // Register generators
    if (plugin.registerGenerators) {
      const generators = plugin.registerGenerators();
      for (const gen of generators) {
        this.generators.set(gen.kind, gen);
        this.logger.debug(`Registered generator '${gen.kind}' from plugin '${plugin.name}'`);
      }
    }

    // Register providers
    if (plugin.registerProviders) {
      const providers = plugin.registerProviders();
      for (const provider of providers) {
        if (!this.providers.has(provider.command)) {
          this.providers.set(provider.command, []);
        }
        this.providers.get(provider.command)!.push(provider);
        this.logger.debug(
          `Registered provider for '${provider.command}' from plugin '${plugin.name}'`
        );
      }
    }

    this.logger.debug(`Loaded plugin '${plugin.name}' v${plugin.version}`);
  }

  /**
   * Get all loaded plugins
   */
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get command by name
   */
  getCommand(name: string): CommandRegistration | undefined {
    return this.commands.get(name);
  }

  /**
   * Get all commands
   */
  getCommands(): CommandRegistration[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get task by name
   */
  getTask(name: string): TaskRegistration | undefined {
    return this.tasks.get(name);
  }

  /**
   * Get all tasks
   */
  getTasks(): TaskRegistration[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get generator by kind
   */
  getGenerator(kind: string): GeneratorRegistration | undefined {
    return this.generators.get(kind);
  }

  /**
   * Get all generators
   */
  getGenerators(): GeneratorRegistration[] {
    return Array.from(this.generators.values());
  }

  /**
   * Get best provider for a command
   */
  getProvider(command: string, ctx: PluginContext): ProviderRegistration | undefined {
    const providers = this.providers.get(command) || [];

    // Filter providers that can handle this context
    const capable = providers.filter((p) => p.canHandle(ctx));

    if (capable.length === 0) {
      return undefined;
    }

    // Sort by priority (highest first)
    capable.sort((a, b) => b.priority - a.priority);

    return capable[0];
  }

  /**
   * Call beforeCommand hooks
   */
  async callBeforeCommand(command: string, ctx: PluginContext): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.beforeCommand) {
        await plugin.beforeCommand(command, ctx);
      }
    }
  }

  /**
   * Call afterCommand hooks
   */
  async callAfterCommand(command: string, ctx: PluginContext, result: unknown): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.afterCommand) {
        await plugin.afterCommand(command, ctx, result as CommandResult);
      }
    }
  }

  /**
   * Call beforeTask hooks
   */
  async callBeforeTask(task: string, ctx: PluginContext): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.beforeTask) {
        await plugin.beforeTask(task, ctx);
      }
    }
  }

  /**
   * Call afterTask hooks
   */
  async callAfterTask(task: string, ctx: PluginContext, result: unknown): Promise<void> {
    for (const plugin of this.plugins.values()) {
      if (plugin.afterTask) {
        await plugin.afterTask(task, ctx, result as TaskResult);
      }
    }
  }

  /**
   * Search for plugins in registry
   */
  async searchPlugins(query: string, options?: { verified?: boolean; category?: string }) {
    return this.registry.search(query, options);
  }

  /**
   * Get plugin info from registry
   */
  async getPluginInfo(name: string) {
    return this.registry.getInfo(name);
  }

  /**
   * Get featured plugins
   */
  async getFeaturedPlugins() {
    return this.registry.getFeatured();
  }

  /**
   * Check if plugin is loaded
   */
  isLoaded(pluginName: string): boolean {
    return this.plugins.has(pluginName);
  }

  /**
   * Get loaded plugin by name
   */
  getPlugin(pluginName: string): Plugin | undefined {
    return this.plugins.get(pluginName);
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginName: string): Promise<void> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      return;
    }

    // Remove registered commands
    if (plugin.registerCommands) {
      const commands = plugin.registerCommands();
      for (const cmd of commands) {
        this.commands.delete(cmd.name);
      }
    }

    // Remove registered tasks
    if (plugin.registerTasks) {
      const tasks = plugin.registerTasks();
      for (const task of tasks) {
        this.tasks.delete(task.name);
      }
    }

    // Remove registered generators
    if (plugin.registerGenerators) {
      const generators = plugin.registerGenerators();
      for (const gen of generators) {
        this.generators.delete(gen.kind);
      }
    }

    // Remove registered providers
    if (plugin.registerProviders) {
      const providers = plugin.registerProviders();
      for (const provider of providers) {
        const list = this.providers.get(provider.command);
        if (list) {
          const index = list.indexOf(provider);
          if (index !== -1) {
            list.splice(index, 1);
          }
        }
      }
    }

    // Remove plugin
    this.plugins.delete(pluginName);
    this.logger.debug(`Unloaded plugin '${pluginName}'`);
  }

  /**
   * Get plugin statistics
   */
  getStats() {
    return {
      commands: this.commands.size,
      dependencies: this.dependencyResolver.getStats(),
      generators: this.generators.size,
      plugins: this.plugins.size,
      providers: Array.from(this.providers.values()).reduce((sum, list) => sum + list.length, 0),
      tasks: this.tasks.size,
      versions: this.versionManager.getStats(),
    };
  }

  /**
   * Get version manager
   */
  getVersionManager(): PluginVersionManager {
    return this.versionManager;
  }

  /**
   * Get dependency resolver
   */
  getDependencyResolver(): PluginDependencyResolver {
    return this.dependencyResolver;
  }

  /**
   * Get sandbox manager
   */
  getSandboxManager(): SandboxManager {
    return this.sandboxManager;
  }

  /**
   * Register plugin metadata for dependency resolution
   */
  registerPluginMetadata(metadata: PluginMetadata): void {
    this.dependencyResolver.register(metadata);
  }

  /**
   * Check plugin updates
   */
  async checkUpdates(): Promise<Array<{ name: string; current: string; latest: string }>> {
    const updates: Array<{ name: string; current: string; latest: string }> = [];

    for (const plugin of this.plugins.values()) {
      try {
        const info = await this.registry.getInfo(plugin.name);
        if (info && info.version) {
          this.versionManager.setLatest(plugin.name, info.version);

          if (this.versionManager.hasUpdate(plugin.name)) {
            updates.push({
              current: plugin.version,
              latest: info.version,
              name: plugin.name,
            });
          }
        }
      } catch {
        // Ignore errors for individual plugins
      }
    }

    return updates;
  }
}
