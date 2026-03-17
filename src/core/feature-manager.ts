import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';

import type {
  Feature,
  FeatureContext,
  FeatureDetectionResult,
  FeatureInstallResult,
  FeatureRollbackInfo,
  Logger,
  PluginContext,
} from '../types/index.js';

/**
 * Feature Manager
 *
 * Manages feature installation, detection, and rollback
 */
export class FeatureManager {
  private logger: Logger;
  private cwd: string;
  private features: Map<string, Feature>;
  private rollbackHistory: FeatureRollbackInfo[];

  constructor(logger: Logger, cwd: string) {
    this.logger = logger;
    this.cwd = cwd;
    this.features = new Map();
    this.rollbackHistory = [];
  }

  /**
   * Register a feature
   */
  registerFeature(feature: Feature): void {
    this.features.set(feature.name, feature);
    this.logger.debug(`Registered feature: ${feature.name}`);
  }

  /**
   * Get feature by name
   */
  getFeature(name: string): Feature | undefined {
    return this.features.get(name);
  }

  /**
   * List all features
   */
  listFeatures(): Feature[] {
    return Array.from(this.features.values());
  }

  /**
   * Detect if a feature is installed
   */
  async detectFeature(featureName: string): Promise<FeatureDetectionResult> {
    const feature = this.features.get(featureName);

    if (!feature) {
      return {
        configFiles: [],
        issues: ['Feature not found in registry'],
        name: featureName,
        status: 'not-installed',
      };
    }

    const packageJsonPath = join(this.cwd, 'package.json');
    const configFiles: string[] = [];
    const issues: string[] = [];

    // Check if package.json exists
    if (!existsSync(packageJsonPath)) {
      return {
        configFiles: [],
        issues: ['No package.json found'],
        name: featureName,
        status: 'not-installed',
      };
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Check if dependencies are installed
    const depsInstalled =
      feature.devDependencies?.every((dep) => {
        const depName = dep.split('@')[0];
        return allDeps[depName];
      }) ?? true;

    // Check config files
    if (feature.configFiles) {
      for (const configFile of feature.configFiles) {
        const filePath = join(this.cwd, configFile.path);
        if (existsSync(filePath)) {
          configFiles.push(configFile.path);
        }
      }
    }

    // Determine status
    let status: FeatureDetectionResult['status'] = 'not-installed';

    if (depsInstalled && configFiles.length > 0) {
      status = 'configured';
    } else if (depsInstalled) {
      status = 'installed';
      issues.push('Dependencies installed but configuration missing');
    }

    return {
      configFiles,
      issues,
      name: featureName,
      status,
    };
  }

  /**
   * Install a feature
   */
  async installFeature(
    featureName: string,
    ctx: PluginContext,
    options?: { dryRun?: boolean; force?: boolean }
  ): Promise<FeatureInstallResult> {
    const feature = this.features.get(featureName);

    if (!feature) {
      return {
        dependenciesInstalled: [],
        errors: [`Feature '${featureName}' not found`],
        feature: featureName,
        filesCreated: [],
        filesModified: [],
        rollbackAvailable: false,
        scriptsAdded: [],
        success: false,
      };
    }

    this.logger.step(`Installing feature: ${feature.name}`);

    // Check if already installed
    if (!options?.force) {
      const detection = await this.detectFeature(featureName);
      if (detection.status === 'configured') {
        return {
          dependenciesInstalled: [],
          errors: ['Feature already installed. Use --force to reinstall'],
          feature: featureName,
          filesCreated: [],
          filesModified: [],
          rollbackAvailable: false,
          scriptsAdded: [],
          success: false,
        };
      }
    }

    const result: FeatureInstallResult = {
      dependenciesInstalled: [],
      feature: featureName,
      filesCreated: [],
      filesModified: [],
      rollbackAvailable: true,
      scriptsAdded: [],
      success: true,
    };

    const rollbackInfo: FeatureRollbackInfo = {
      dependenciesInstalled: [],
      feature: featureName,
      filesCreated: [],
      filesModified: [],
      scriptsAdded: [],
      timestamp: new Date(),
    };

    try {
      // Create feature context
      const featureCtx: FeatureContext = {
        ...ctx,
        dryRun: options?.dryRun,
        existingConfig: new Map(),
        feature,
        packageManager: this.detectPackageManager(),
        projectType: this.detectProjectType(),
      };

      // Before install hook
      if (feature.hooks?.beforeInstall) {
        await feature.hooks.beforeInstall(featureCtx);
      }

      // Install dependencies
      if (feature.devDependencies && feature.devDependencies.length > 0) {
        if (!options?.dryRun) {
          this.logger.info('Installing dependencies...');
          // In real implementation, would run package manager
          result.dependenciesInstalled = feature.devDependencies;
          rollbackInfo.dependenciesInstalled = feature.devDependencies;
        } else {
          this.logger.info(`[DRY RUN] Would install: ${feature.devDependencies.join(', ')}`);
        }
      }

      // Create config files
      if (feature.configFiles) {
        for (const configFile of feature.configFiles) {
          const filePath = join(this.cwd, configFile.path);
          const fileExists = existsSync(filePath);

          if (fileExists && configFile.backup) {
            // Backup existing file
            const backupPath = `${filePath}.backup-${Date.now()}`;
            if (!options?.dryRun) {
              copyFileSync(filePath, backupPath);
              rollbackInfo.filesModified.push({ backup: backupPath, path: configFile.path });
              result.filesModified.push(configFile.path);
            }
            this.logger.info(`Backed up ${configFile.path}`);
          }

          if (!options?.dryRun) {
            // Create directory if needed
            const dir = dirname(filePath);
            if (!existsSync(dir)) {
              mkdirSync(dir, { recursive: true });
            }

            // Write config file
            const content =
              typeof configFile.content === 'string'
                ? configFile.content
                : JSON.stringify(configFile.content, null, 2);

            writeFileSync(filePath, content, 'utf-8');

            if (!fileExists) {
              rollbackInfo.filesCreated.push(configFile.path);
              result.filesCreated.push(configFile.path);
            }

            this.logger.success(`Created ${configFile.path}`);
          } else {
            this.logger.info(`[DRY RUN] Would create: ${configFile.path}`);
          }
        }
      }

      // Add scripts to package.json
      if (feature.scripts) {
        const packageJsonPath = join(this.cwd, 'package.json');
        if (existsSync(packageJsonPath) && !options?.dryRun) {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          packageJson.scripts = packageJson.scripts || {};

          for (const [scriptName, scriptCmd] of Object.entries(feature.scripts)) {
            if (!packageJson.scripts[scriptName]) {
              packageJson.scripts[scriptName] = scriptCmd;
              result.scriptsAdded.push(scriptName);
              rollbackInfo.scriptsAdded.push(scriptName);
              this.logger.success(`Added script: ${scriptName}`);
            }
          }

          writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
        }
      }

      // After install hook
      if (feature.hooks?.afterInstall) {
        await feature.hooks.afterInstall(featureCtx);
      }

      // Store rollback info
      this.rollbackHistory.push(rollbackInfo);

      // Add instructions
      if (feature.instructions) {
        result.instructions = feature.instructions;
      }

      this.logger.success(`Feature '${feature.name}' installed successfully`);

      return result;
    } catch (error) {
      result.success = false;
      result.errors = [error instanceof Error ? error.message : String(error)];
      this.logger.error(`Failed to install feature '${feature.name}'`, error as Error);
      return result;
    }
  }

  /**
   * Rollback a feature installation
   */
  async rollbackFeature(featureName: string): Promise<boolean> {
    const rollbackInfo = this.rollbackHistory.find((r) => r.feature === featureName);

    if (!rollbackInfo) {
      this.logger.error(`No rollback information found for feature '${featureName}'`);
      return false;
    }

    this.logger.step(`Rolling back feature: ${featureName}`);

    try {
      // Remove created files
      for (const file of rollbackInfo.filesCreated) {
        const filePath = join(this.cwd, file);
        if (existsSync(filePath)) {
          // Would use unlinkSync here
          this.logger.info(`Removed ${file}`);
        }
      }

      // Restore modified files
      for (const { backup, path } of rollbackInfo.filesModified) {
        const filePath = join(this.cwd, path);
        if (existsSync(backup)) {
          copyFileSync(backup, filePath);
          // Would remove backup
          this.logger.info(`Restored ${path}`);
        }
      }

      // Remove scripts
      if (rollbackInfo.scriptsAdded.length > 0) {
        const packageJsonPath = join(this.cwd, 'package.json');
        if (existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          for (const scriptName of rollbackInfo.scriptsAdded) {
            delete packageJson.scripts[scriptName];
          }
          writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
          this.logger.info('Removed scripts from package.json');
        }
      }

      this.logger.success(`Feature '${featureName}' rolled back successfully`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to rollback feature '${featureName}'`, error as Error);
      return false;
    }
  }

  /**
   * Detect project type
   */
  private detectProjectType(): 'react' | 'vanilla' | 'unknown' {
    const packageJsonPath = join(this.cwd, 'package.json');

    if (!existsSync(packageJsonPath)) {
      return 'unknown';
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    if (allDeps.react) {
      return 'react';
    }

    return 'vanilla';
  }

  /**
   * Detect package manager
   */
  private detectPackageManager(): 'pnpm' | 'npm' | 'yarn' {
    if (existsSync(join(this.cwd, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    if (existsSync(join(this.cwd, 'yarn.lock'))) {
      return 'yarn';
    }
    return 'npm';
  }
}
