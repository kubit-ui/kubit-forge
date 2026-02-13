/**
 * Configuration template loader and builder
 * Provides utilities to build configurations from templates
 */

import type { KubitConfig } from '../../types/index.js';
import {
  PROJECT_DEFAULTS,
  PATHS_DEFAULTS,
  QUALITY_DEFAULTS,
  QUALITY_MINIMAL,
  PLUGIN_DEFAULTS,
  type ProjectDefaults,
  type PathsDefaults,
  type QualityDefaults,
  type PluginDefaults,
} from './defaults.js';

export interface ConfigTemplateOptions {
  name?: string;
  type?: 'web' | 'library';
  stack?: 'react' | 'vanilla';
  language?: 'ts' | 'js';
  packageManager?: 'pnpm' | 'npm' | 'yarn';
  nodeVersion?: string;
  devPort?: number;
  minimal?: boolean;
}

export class ConfigTemplateLoader {
  /**
   * Build a complete default configuration
   */
  static buildDefault(options: ConfigTemplateOptions = {}): KubitConfig {
    return {
      kubit: {
        cliVersion: '^4.0.0',
      },
      project: this.buildProjectConfig(options),
      paths: this.buildPathsConfig(),
      quality: this.buildQualityConfig(options),
      plugins: this.buildPluginsConfig(),
    };
  }

  /**
   * Build project configuration with defaults
   */
  static buildProjectConfig(options: ConfigTemplateOptions = {}): KubitConfig['project'] {
    return {
      bundler: 'vite',
      devPort: options.devPort || PROJECT_DEFAULTS.devPort,
      language: options.language || 'js',
      name: options.name || 'my-project',
      nodeVersion: options.nodeVersion || PROJECT_DEFAULTS.nodeVersion,
      packageManager: options.packageManager || PROJECT_DEFAULTS.packageManager,
      stack: options.stack || 'vanilla',
      type: options.type || 'web',
    };
  }

  /**
   * Build paths configuration with defaults
   */
  static buildPathsConfig(overrides?: Partial<PathsDefaults>): KubitConfig['paths'] {
    return {
      ...PATHS_DEFAULTS,
      ...overrides,
    };
  }

  /**
   * Build quality configuration with defaults
   */
  static buildQualityConfig(options: ConfigTemplateOptions = {}): KubitConfig['quality'] {
    const baseDefaults = options.minimal ? QUALITY_MINIMAL : QUALITY_DEFAULTS;

    return {
      ...baseDefaults,
      // Auto-adjust typecheck based on language
      typecheck: options.language === 'ts' ? baseDefaults.typecheck : false,
    };
  }

  /**
   * Build plugins configuration with defaults
   */
  static buildPluginsConfig(plugins?: string[]): KubitConfig['plugins'] {
    return {
      enabled: plugins || PLUGIN_DEFAULTS.enabled,
    };
  }

  /**
   * Get project defaults
   */
  static getProjectDefaults(): ProjectDefaults {
    return { ...PROJECT_DEFAULTS };
  }

  /**
   * Get paths defaults
   */
  static getPathsDefaults(): PathsDefaults {
    return { ...PATHS_DEFAULTS };
  }

  /**
   * Get quality defaults
   */
  static getQualityDefaults(minimal = false): QualityDefaults {
    return minimal ? { ...QUALITY_MINIMAL } : { ...QUALITY_DEFAULTS };
  }

  /**
   * Get plugin defaults
   */
  static getPluginDefaults(): PluginDefaults {
    return { ...PLUGIN_DEFAULTS };
  }

  /**
   * Merge partial config with defaults
   */
  static mergeWithDefaults(
    partial: Partial<KubitConfig>,
    options: ConfigTemplateOptions = {}
  ): KubitConfig {
    const defaults = this.buildDefault(options);

    return {
      kubit: partial.kubit || defaults.kubit,
      project: { ...defaults.project, ...(partial.project || {}) } as KubitConfig['project'],
      paths: { ...defaults.paths, ...(partial.paths || {}) } as KubitConfig['paths'],
      quality: { ...defaults.quality, ...(partial.quality || {}) } as KubitConfig['quality'],
      plugins: { ...defaults.plugins, ...(partial.plugins || {}) } as KubitConfig['plugins'],
    };
  }
}
