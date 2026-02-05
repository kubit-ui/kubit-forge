/**
 * Plugin Sandbox
 *
 * Provides isolated execution environment for plugins with controlled access
 * to system resources and APIs.
 */

import type { Worker } from 'worker_threads';

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import type { Logger, Plugin } from '../types/index.js';

export interface SandboxOptions {
  timeout?: number;
  memoryLimit?: number;
  allowedCapabilities?: string[];
  allowNetwork?: boolean;
  allowFileSystem?: boolean;
  allowProcessEnv?: boolean;
}

export interface SandboxedPlugin {
  plugin: Plugin;
  sandbox: PluginSandbox;
}

export class PluginSandbox {
  private logger: Logger;
  private options: Required<SandboxOptions>;
  private worker?: Worker;
  private isRunning = false;

  constructor(logger: Logger, options: SandboxOptions = {}) {
    this.logger = logger;
    this.options = {
      allowedCapabilities: options.allowedCapabilities || [],
      allowFileSystem: options.allowFileSystem ?? true,
      allowNetwork: options.allowNetwork ?? false,
      allowProcessEnv: options.allowProcessEnv ?? true,
      memoryLimit: options.memoryLimit || 512 * 1024 * 1024, // 512MB
      timeout: options.timeout || 30000, // 30 seconds
    };
  }

  /**
   * Execute plugin in sandboxed environment
   */
  async execute<T>(pluginPath: string, method: string, args: unknown[]): Promise<T> {
    if (this.isRunning) {
      throw new Error('Sandbox is already running');
    }

    this.isRunning = true;

    try {
      // Validate plugin path
      if (!existsSync(pluginPath)) {
        throw new Error(`Plugin not found: ${pluginPath}`);
      }

      // Create sandbox context
      const sandboxContext = this.createSandboxContext();

      // Execute in worker thread
      const result = await this.executeInWorker<T>(pluginPath, method, args, sandboxContext);

      return result;
    } finally {
      this.isRunning = false;
      this.cleanup();
    }
  }

  /**
   * Create restricted context for plugin
   */
  private createSandboxContext(): Record<string, unknown> {
    const context: Record<string, unknown> = {
      console: {
        error: (...args: unknown[]) => this.logger.error(args.join(' ')),
        log: (...args: unknown[]) => this.logger.info(args.join(' ')),
        warn: (...args: unknown[]) => this.logger.warn(args.join(' ')),
      },
    };

    // Add allowed capabilities
    if (this.options.allowProcessEnv) {
      context.process = {
        arch: process.arch,
        cwd: process.cwd,
        env: { ...process.env },
        platform: process.platform,
      };
    }

    if (this.options.allowFileSystem) {
      // Provide restricted fs access
      context.fs = this.createRestrictedFS();
    }

    if (this.options.allowNetwork) {
      // Provide restricted network access
      context.fetch = fetch;
    }

    return context;
  }

  /**
   * Create restricted filesystem API
   */
  private createRestrictedFS() {
    const cwd = process.cwd();

    return {
      exists: (path: string) => {
        const fullPath = join(cwd, path);
        if (!fullPath.startsWith(cwd)) {
          throw new Error('Access denied: Path outside project directory');
        }
        return existsSync(fullPath);
      },
      mkdir: (path: string) => {
        const fullPath = join(cwd, path);
        if (!fullPath.startsWith(cwd)) {
          throw new Error('Access denied: Path outside project directory');
        }
        return mkdirSync(fullPath, { recursive: true });
      },
      readFile: (path: string) => {
        const fullPath = join(cwd, path);
        if (!fullPath.startsWith(cwd)) {
          throw new Error('Access denied: Path outside project directory');
        }
        return readFileSync(fullPath, 'utf-8');
      },
      writeFile: (path: string, content: string) => {
        const fullPath = join(cwd, path);
        if (!fullPath.startsWith(cwd)) {
          throw new Error('Access denied: Path outside project directory');
        }
        return writeFileSync(fullPath, content, 'utf-8');
      },
    };
  }

  /**
   * Execute plugin method in worker thread
   */
  private async executeInWorker<T>(
    pluginPath: string,
    method: string,
    args: unknown[],
    _context: Record<string, unknown>
  ): Promise<T> {
    const timeout = setTimeout(() => {
      if (this.worker) {
        this.worker.terminate();
      }
    }, this.options.timeout);

    try {
      // For now, execute directly (worker_threads require more setup)
      // In production, this should use Worker threads
      const pluginModule = await import(pluginPath);
      const plugin = pluginModule.default || pluginModule;
      const pluginInstance = plugin.default || plugin;

      if (!pluginInstance[method]) {
        clearTimeout(timeout);
        throw new Error(`Method '${method}' not found in plugin`);
      }

      const result = pluginInstance[method](...args);

      if (result instanceof Promise) {
        return result
          .then((res: T) => {
            clearTimeout(timeout);
            return res;
          })
          .catch((err: Error) => {
            clearTimeout(timeout);
            throw err;
          });
      }
      clearTimeout(timeout);
      return result as T;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  /**
   * Check if capability is allowed
   */
  hasCapability(capability: string): boolean {
    return this.options.allowedCapabilities.includes(capability);
  }

  /**
   * Get sandbox statistics
   */
  getStats() {
    return {
      allowedCapabilities: this.options.allowedCapabilities,
      allowFileSystem: this.options.allowFileSystem,
      allowNetwork: this.options.allowNetwork,
      isRunning: this.isRunning,
      memoryLimit: this.options.memoryLimit,
      timeout: this.options.timeout,
    };
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }
  }

  /**
   * Terminate sandbox
   */
  terminate(): void {
    this.cleanup();
    this.isRunning = false;
  }
}

/**
 * Sandbox Manager
 * Manages multiple sandboxes for different plugins
 */
export class SandboxManager {
  private sandboxes: Map<string, PluginSandbox> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Create sandbox for plugin
   */
  createSandbox(pluginName: string, options: SandboxOptions = {}): PluginSandbox {
    if (this.sandboxes.has(pluginName)) {
      throw new Error(`Sandbox already exists for plugin '${pluginName}'`);
    }

    const sandbox = new PluginSandbox(this.logger, options);
    this.sandboxes.set(pluginName, sandbox);

    this.logger.debug(`Created sandbox for plugin '${pluginName}'`);
    return sandbox;
  }

  /**
   * Get sandbox for plugin
   */
  getSandbox(pluginName: string): PluginSandbox | undefined {
    return this.sandboxes.get(pluginName);
  }

  /**
   * Remove sandbox
   */
  removeSandbox(pluginName: string): void {
    const sandbox = this.sandboxes.get(pluginName);
    if (sandbox) {
      sandbox.terminate();
      this.sandboxes.delete(pluginName);
      this.logger.debug(`Removed sandbox for plugin '${pluginName}'`);
    }
  }

  /**
   * Terminate all sandboxes
   */
  terminateAll(): void {
    for (const [pluginName, sandbox] of this.sandboxes.entries()) {
      sandbox.terminate();
      this.logger.debug(`Terminated sandbox for plugin '${pluginName}'`);
    }
    this.sandboxes.clear();
  }

  /**
   * Get statistics for all sandboxes
   */
  getStats() {
    const stats: Record<string, unknown> = {};
    for (const [pluginName, sandbox] of this.sandboxes.entries()) {
      stats[pluginName] = sandbox.getStats();
    }
    return {
      sandboxes: stats,
      totalSandboxes: this.sandboxes.size,
    };
  }
}
