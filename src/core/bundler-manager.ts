import { existsSync } from 'fs';
import { join } from 'path';

import type {
  BundlerAdapter,
  BundlerDetectionResult,
  BundlerInstallResult,
  BundlerMigrationResult,
  BundlerSwitchOptions,
  BundlerType,
  Logger,
  PluginContext,
} from '../types/index.js';

/**
 * Bundler Manager
 *
 * Manages bundler detection, installation, and switching
 */
export class BundlerManager {
  private logger: Logger;
  private adapters: Map<BundlerType, BundlerAdapter>;

  constructor(logger: Logger) {
    this.logger = logger;
    this.adapters = new Map();
  }

  /**
   * Register a bundler adapter
   */
  registerAdapter(adapter: BundlerAdapter): void {
    this.adapters.set(adapter.name, adapter);
    this.logger.debug(`Registered bundler adapter: ${adapter.name}`);
  }

  /**
   * Get bundler adapter by type
   */
  getAdapter(type: BundlerType): BundlerAdapter | undefined {
    return this.adapters.get(type);
  }

  /**
   * List all registered bundlers
   */
  listBundlers(): BundlerType[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Detect which bundler is currently used in the project
   */
  async detectBundler(cwd: string): Promise<BundlerDetectionResult> {
    this.logger.debug('Detecting bundler...');

    // Check each registered adapter
    for (const [type, adapter] of this.adapters.entries()) {
      const detected = await adapter.detect(cwd);
      if (detected) {
        const configPath = adapter.getConfigPath(cwd);
        return {
          bundler: type,
          confidence: 'high',
          configFile: configPath,
          detected: true,
          version: adapter.version,
        };
      }
    }

    // Fallback: check for common config files
    const fallbackDetection = this.detectByConfigFiles(cwd);
    if (fallbackDetection.detected) {
      return fallbackDetection;
    }

    return {
      confidence: 'low',
      detected: false,
    };
  }

  /**
   * Detect bundler by checking for config files
   */
  private detectByConfigFiles(cwd: string): BundlerDetectionResult {
    // Check for Vite
    if (
      existsSync(join(cwd, 'vite.config.ts')) ||
      existsSync(join(cwd, 'vite.config.js')) ||
      existsSync(join(cwd, 'vite.config.mts'))
    ) {
      return {
        bundler: 'vite',
        confidence: 'medium',
        configFile: 'vite.config.ts',
        detected: true,
      };
    }

    // Check for Webpack
    if (existsSync(join(cwd, 'webpack.config.js')) || existsSync(join(cwd, 'webpack.config.ts'))) {
      return {
        bundler: 'webpack',
        confidence: 'medium',
        configFile: 'webpack.config.js',
        detected: true,
      };
    }

    // Check for Rspack
    if (existsSync(join(cwd, 'rspack.config.js')) || existsSync(join(cwd, 'rspack.config.ts'))) {
      return {
        bundler: 'rspack',
        confidence: 'medium',
        configFile: 'rspack.config.js',
        detected: true,
      };
    }

    // Check for Rollup
    if (existsSync(join(cwd, 'rollup.config.js')) || existsSync(join(cwd, 'rollup.config.ts'))) {
      return {
        bundler: 'rollup',
        confidence: 'medium',
        configFile: 'rollup.config.js',
        detected: true,
      };
    }

    // Check for esbuild
    if (existsSync(join(cwd, 'esbuild.config.js'))) {
      return {
        bundler: 'esbuild',
        confidence: 'medium',
        configFile: 'esbuild.config.js',
        detected: true,
      };
    }

    return {
      confidence: 'low',
      detected: false,
    };
  }

  /**
   * Install a bundler
   */
  async installBundler(
    type: BundlerType,
    ctx: PluginContext,
    options?: any
  ): Promise<BundlerInstallResult> {
    const adapter = this.adapters.get(type);

    if (!adapter) {
      return {
        bundler: type,
        configFile: '',
        dependenciesInstalled: [],
        errors: [
          `Bundler '${type}' is not supported. Available: ${this.listBundlers().join(', ')}`,
        ],
        filesCreated: [],
        scriptsAdded: [],
        success: false,
      };
    }

    this.logger.step(`Installing ${type} bundler...`);

    try {
      const result = await adapter.install(ctx, options);

      if (result.success) {
        this.logger.success(`✓ ${type} installed successfully`);
      } else {
        this.logger.error(`Failed to install ${type}`);
      }

      return result;
    } catch (error) {
      return {
        bundler: type,
        configFile: '',
        dependenciesInstalled: [],
        errors: [error instanceof Error ? error.message : String(error)],
        filesCreated: [],
        scriptsAdded: [],
        success: false,
      };
    }
  }

  /**
   * Switch from one bundler to another
   */
  async switchBundler(
    options: BundlerSwitchOptions,
    ctx: PluginContext
  ): Promise<BundlerMigrationResult> {
    const { keepOldConfig = false, migrate = true, to } = options;

    // Detect current bundler
    const detection = await this.detectBundler(ctx.cwd);

    if (!detection.detected) {
      return {
        changes: [],
        fromBundler: 'vite', // default
        manualSteps: ['No bundler detected. Install one first.'],
        rollbackAvailable: false,
        success: false,
        toBundler: to,
      };
    }

    const fromBundler = detection.bundler!;

    if (fromBundler === to) {
      return {
        changes: [],
        fromBundler,
        manualSteps: [`Already using ${to}`],
        rollbackAvailable: false,
        success: true,
        toBundler: to,
      };
    }

    this.logger.step(`Switching from ${fromBundler} to ${to}...`);

    const toAdapter = this.adapters.get(to);
    if (!toAdapter) {
      return {
        changes: [],
        fromBundler,
        manualSteps: [`Bundler '${to}' is not supported`],
        rollbackAvailable: false,
        success: false,
        toBundler: to,
      };
    }

    const changes: BundlerMigrationResult['changes'] = [];

    try {
      // 1. Install new bundler
      this.logger.info(`Installing ${to}...`);
      const installResult = await this.installBundler(to, ctx);

      if (!installResult.success) {
        return {
          changes,
          fromBundler,
          manualSteps: installResult.errors || ['Installation failed'],
          rollbackAvailable: false,
          success: false,
          toBundler: to,
        };
      }

      // Track changes
      installResult.filesCreated.forEach((file) => {
        changes.push({
          action: 'created',
          description: `Created ${file}`,
          path: file,
          type: 'file',
        });
      });

      installResult.dependenciesInstalled.forEach((dep) => {
        changes.push({
          action: 'created',
          description: `Installed ${dep}`,
          path: 'package.json',
          type: 'dependency',
        });
      });

      installResult.scriptsAdded.forEach((script) => {
        changes.push({
          action: 'created',
          description: `Added script: ${script}`,
          path: 'package.json',
          type: 'script',
        });
      });

      // 2. Migrate configuration if supported
      if (migrate && toAdapter.migrate) {
        this.logger.info('Migrating configuration...');
        const migrationResult = await toAdapter.migrate(fromBundler, ctx);

        if (migrationResult.success) {
          changes.push(...migrationResult.changes);
        }
      }

      // 3. Remove old bundler config if not keeping
      if (!keepOldConfig) {
        const fromAdapter = this.adapters.get(fromBundler);
        if (fromAdapter) {
          const oldConfigPath = fromAdapter.getConfigPath(ctx.cwd);
          changes.push({
            action: 'deleted',
            description: `Removed old config: ${oldConfigPath}`,
            path: oldConfigPath,
            type: 'file',
          });
        }
      }

      this.logger.success(`✓ Successfully switched from ${fromBundler} to ${to}`);

      return {
        changes,
        fromBundler,
        rollbackAvailable: true,
        success: true,
        toBundler: to,
      };
    } catch (error) {
      this.logger.error('Failed to switch bundler', error as Error);
      return {
        changes,
        fromBundler,
        manualSteps: [error instanceof Error ? error.message : String(error)],
        rollbackAvailable: false,
        success: false,
        toBundler: to,
      };
    }
  }

  /**
   * Validate bundler configuration
   */
  async validateBundler(type: BundlerType, cwd: string): Promise<boolean> {
    const adapter = this.adapters.get(type);

    if (!adapter) {
      this.logger.error(`Bundler '${type}' is not supported`);
      return false;
    }

    const result = await adapter.validateConfig(cwd);

    if (result.valid) {
      this.logger.success(`✓ ${type} configuration is valid`);
    } else {
      this.logger.error(`${type} configuration has errors:`);
      result.errors.forEach((error) => this.logger.error(`  - ${error}`));
    }

    if (result.warnings.length > 0) {
      this.logger.warn('Warnings:');
      result.warnings.forEach((warning) => this.logger.warn(`  - ${warning}`));
    }

    return result.valid;
  }
}
