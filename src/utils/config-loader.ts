import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { parse as parseToml } from 'smol-toml';

import type { KubitConfig } from '../types/index.js';

import { ConfigTemplateLoader } from '../templates/config/index.js';
import { KubitConfigSchema } from '../types/index.js';

export class ConfigLoader {
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
  }

  /**
   * Load kubit config from project
   * Supports: kubit.config.toml, kubit.config.json
   */
  async load(configPath?: string): Promise<KubitConfig | null> {
    const configFile = configPath ? join(this.cwd, configPath) : this.findConfigFile();

    if (!configFile) {
      return null;
    }

    try {
      const content = readFileSync(configFile, 'utf-8');
      let rawConfig: unknown;

      if (configFile.endsWith('.toml')) {
        rawConfig = parseToml(content);
      } else if (configFile.endsWith('.json')) {
        rawConfig = JSON.parse(content);
      } else {
        throw new Error(`Unsupported config format: ${configFile}`);
      }

      // Validate with Zod
      const config = KubitConfigSchema.parse(rawConfig);
      return config;
    } catch (error) {
      throw new Error(
        `Failed to load config from ${configFile}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Auto-detect project configuration when no config file exists
   */
  async autoDetect(): Promise<Partial<KubitConfig>> {
    const packageJsonPath = join(this.cwd, 'package.json');

    // If no package.json, return minimal default config
    if (!existsSync(packageJsonPath)) {
      const projectName = this.cwd.split('/').pop() || 'my-project';
      return ConfigTemplateLoader.buildDefault({
        minimal: true,
        name: projectName,
      });
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // Detect stack
    let stack: 'react' | 'vanilla' = 'vanilla';
    if (deps.react) {
      stack = 'react';
    }

    // Detect language
    const language = existsSync(join(this.cwd, 'tsconfig.json')) ? 'ts' : 'js';

    // Detect package manager
    let packageManager: 'pnpm' | 'npm' | 'yarn' = 'npm';
    if (existsSync(join(this.cwd, 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    } else if (existsSync(join(this.cwd, 'yarn.lock'))) {
      packageManager = 'yarn';
    } else if (existsSync(join(this.cwd, 'package-lock.json'))) {
      packageManager = 'npm';
    }

    // Build config using templates
    const config = ConfigTemplateLoader.buildDefault({
      language,
      name: packageJson.name || 'my-app',
      packageManager,
      stack,
      type: 'web',
    });

    // Override quality settings based on detected tools
    config.quality = {
      ...config.quality,
      format: true,
      lint: true,
      typecheck: language === 'ts',
      unitTest: !!deps.vitest || !!deps.jest,
    };

    return config;
  }

  private findConfigFile(): string | null {
    const candidates = ['kubit.config.toml', 'kubit.config.json'];

    for (const candidate of candidates) {
      const path = join(this.cwd, candidate);
      if (existsSync(path)) {
        return path;
      }
    }

    return null;
  }
}
