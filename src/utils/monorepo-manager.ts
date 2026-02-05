import { glob } from 'fast-glob';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { Logger } from '../types/index.js';

export interface MonorepoPackage {
  name: string;
  path: string;
  version: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export interface MonorepoInfo {
  root: string;
  tool: 'pnpm-workspaces' | 'yarn-workspaces' | 'npm-workspaces' | 'lerna' | 'nx' | 'turborepo';
  workspaces: string[];
  packages: MonorepoPackage[];
}

/**
 * MonorepoManager
 *
 * Utility for managing monorepo operations
 */
export class MonorepoManager {
  private logger: Logger;
  private cwd: string;

  constructor(logger: Logger, cwd: string) {
    this.logger = logger;
    this.cwd = cwd;
  }

  /**
   * Get monorepo information
   */
  async getMonorepoInfo(): Promise<MonorepoInfo | null> {
    const packageJsonPath = join(this.cwd, 'package.json');

    if (!existsSync(packageJsonPath)) {
      return null;
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    let workspaces: string[] = [];
    let tool: MonorepoInfo['tool'] | null = null;

    // Detect monorepo tool and workspaces
    if (existsSync(join(this.cwd, 'pnpm-workspace.yaml'))) {
      tool = 'pnpm-workspaces';
      workspaces = this.parsePnpmWorkspaces();
    } else if (existsSync(join(this.cwd, 'lerna.json'))) {
      tool = 'lerna';
      const lernaConfig = this.parseLernaConfig();
      workspaces = lernaConfig?.packages || [];
    } else if (existsSync(join(this.cwd, 'nx.json'))) {
      tool = 'nx';
      // Nx uses different structure, would need nx.json parsing
      workspaces = ['apps/*', 'libs/*'];
    } else if (existsSync(join(this.cwd, 'turbo.json'))) {
      tool = 'turborepo';
      workspaces = this.getWorkspacesFromPackageJson(packageJson);
    } else if (packageJson.workspaces) {
      tool = existsSync(join(this.cwd, 'yarn.lock')) ? 'yarn-workspaces' : 'npm-workspaces';
      workspaces = this.getWorkspacesFromPackageJson(packageJson);
    }

    if (!tool) {
      return null;
    }

    // Find all packages
    const packages = await this.findPackages(workspaces);

    return {
      packages,
      root: this.cwd,
      tool,
      workspaces,
    };
  }

  /**
   * Find all packages in workspaces
   */
  private async findPackages(workspaces: string[]): Promise<MonorepoPackage[]> {
    const packages: MonorepoPackage[] = [];

    for (const workspace of workspaces) {
      const pattern = join(this.cwd, workspace, 'package.json');
      const packageFiles = await glob(pattern, { absolute: true });

      for (const packageFile of packageFiles) {
        try {
          const packageJson = JSON.parse(readFileSync(packageFile, 'utf-8'));
          const packagePath = packageFile.replace('/package.json', '');

          packages.push({
            dependencies: packageJson.dependencies,
            devDependencies: packageJson.devDependencies,
            name: packageJson.name,
            path: packagePath,
            private: packageJson.private,
            version: packageJson.version,
          });
        } catch (error) {
          this.logger.warn(`Failed to read package.json at ${packageFile}`);
        }
      }
    }

    return packages;
  }

  /**
   * Get workspaces from package.json
   */
  private getWorkspacesFromPackageJson(packageJson: {
    workspaces?: string[] | { packages?: string[] };
  }): string[] {
    if (Array.isArray(packageJson.workspaces)) {
      return packageJson.workspaces;
    }
    if (packageJson.workspaces && typeof packageJson.workspaces === 'object') {
      return (packageJson.workspaces as { packages?: string[] }).packages || [];
    }
    return [];
  }

  /**
   * Parse pnpm-workspace.yaml
   */
  private parsePnpmWorkspaces(): string[] {
    try {
      const workspaceFile = join(this.cwd, 'pnpm-workspace.yaml');
      if (!existsSync(workspaceFile)) {
        return [];
      }

      const content = readFileSync(workspaceFile, 'utf-8');
      const match = content.match(/packages:\s*\n((?:\s+-\s+['"]?[^'"]+['"]?\s*\n?)+)/);
      if (match) {
        return match[1]
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.startsWith('-'))
          .map((line) => line.replace(/^-\s+['"]?/, '').replace(/['"]?\s*$/, ''));
      }
    } catch {
      // Ignore errors
    }
    return [];
  }

  /**
   * Parse lerna.json
   */
  private parseLernaConfig(): { packages?: string[] } | undefined {
    try {
      const lernaFile = join(this.cwd, 'lerna.json');
      if (!existsSync(lernaFile)) {
        return undefined;
      }

      const content = readFileSync(lernaFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  /**
   * Create a new package in the monorepo
   */
  async createPackage(options: {
    name: string;
    type: 'app' | 'package';
    template?: 'react' | 'vanilla' | 'library';
    private?: boolean;
  }): Promise<{ success: boolean; path?: string; error?: string }> {
    const monorepoInfo = await this.getMonorepoInfo();

    if (!monorepoInfo) {
      return { error: 'Not in a monorepo', success: false };
    }

    // Determine target directory
    const targetDir =
      options.type === 'app'
        ? join(this.cwd, 'apps', options.name)
        : join(this.cwd, 'packages', options.name);

    if (existsSync(targetDir)) {
      return { error: `Directory ${targetDir} already exists`, success: false };
    }

    try {
      // Create directory
      mkdirSync(targetDir, { recursive: true });

      // Create package.json
      const packageJson = {
        dependencies: {},
        devDependencies: {},
        main: options.type === 'package' ? './dist/index.js' : undefined,
        name: `@${monorepoInfo.root.split('/').pop()}/${options.name}`,
        private: options.private ?? options.type === 'app',
        scripts:
          options.type === 'app'
            ? {
                build: 'vite build',
                dev: 'vite',
                preview: 'vite preview',
              }
            : {
                build: 'tsup src/index.ts --format cjs,esm --dts',
                dev: 'tsup src/index.ts --format cjs,esm --dts --watch',
              },
        types: options.type === 'package' ? './dist/index.d.ts' : undefined,
        version: '1.0.0',
      };

      writeFileSync(join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2));

      // Create src directory
      const srcDir = join(targetDir, 'src');
      mkdirSync(srcDir, { recursive: true });

      // Create basic index file
      const indexFile = options.template === 'react' ? 'index.tsx' : 'index.ts';
      const indexContent =
        options.template === 'react'
          ? `import React from 'react';\n\nexport const App = () => {\n  return <div>Hello from ${options.name}</div>;\n};\n`
          : `export const ${options.name.replace(/-/g, '_')} = '${options.name}';\n`;

      writeFileSync(join(srcDir, indexFile), indexContent);

      // Create tsconfig.json
      const tsconfig = {
        compilerOptions: {
          outDir: 'dist',
        },
        extends: '../../tsconfig.json',
        include: ['src'],
      };

      writeFileSync(join(targetDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

      this.logger.success(`Created ${options.type} '${options.name}' at ${targetDir}`);

      return { path: targetDir, success: true };
    } catch (error) {
      return {
        error: `Failed to create package: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      };
    }
  }

  /**
   * List all packages in the monorepo
   */
  async listPackages(): Promise<MonorepoPackage[]> {
    const monorepoInfo = await this.getMonorepoInfo();
    return monorepoInfo?.packages || [];
  }

  /**
   * Check if current directory is a monorepo
   */
  async isMonorepo(): Promise<boolean> {
    const info = await this.getMonorepoInfo();
    return info !== null;
  }

  /**
   * Get package by name
   */
  async getPackage(name: string): Promise<MonorepoPackage | null> {
    const packages = await this.listPackages();
    return packages.find((pkg) => pkg.name === name) || null;
  }
}
