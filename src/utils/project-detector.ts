import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface ProjectInfo {
  stack: 'react' | 'vue' | 'angular' | 'svelte' | 'vanilla' | 'unknown';
  language: 'typescript' | 'javascript';
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun';
  bundler: 'vite' | 'webpack' | 'parcel' | 'rollup' | 'esbuild' | 'none';
  hasESLint: boolean;
  eslintVersion?: 'v8' | 'v9';
  hasPrettier: boolean;
  hasTests: boolean;
  testFramework?: 'vitest' | 'jest' | 'mocha' | 'ava';
  hasBernova: boolean;
  hasStorybook: boolean;
  hasTypeScript: boolean;
  nodeVersion?: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  isMonorepo: boolean;
  monorepoTool?:
    | 'pnpm-workspaces'
    | 'yarn-workspaces'
    | 'npm-workspaces'
    | 'lerna'
    | 'nx'
    | 'turborepo';
  workspaces?: string[];
}

export class ProjectDetector {
  constructor(private cwd: string) {}

  async detect(): Promise<ProjectInfo> {
    const packageJsonPath = join(this.cwd, 'package.json');

    if (!existsSync(packageJsonPath)) {
      throw new Error('No package.json found. This does not appear to be a Node.js project.');
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const monorepoInfo = this.detectMonorepo(packageJson);

    return {
      bundler: this.detectBundler(deps),
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      eslintVersion: this.detectESLintVersion(deps),
      hasBernova: this.detectBernova(deps),
      hasESLint: this.detectESLint(),
      hasPrettier: this.detectPrettier(deps),
      hasStorybook: this.detectStorybook(deps),
      hasTests: this.detectTests(),
      hasTypeScript: this.detectTypeScript(),
      isMonorepo: monorepoInfo.isMonorepo,
      language: this.detectLanguage(),
      monorepoTool: monorepoInfo.tool,
      nodeVersion: packageJson.engines?.node,
      packageManager: this.detectPackageManager(),
      stack: this.detectStack(deps),
      testFramework: this.detectTestFramework(deps),
      workspaces: monorepoInfo.workspaces,
    };
  }

  private detectStack(deps: Record<string, string>): ProjectInfo['stack'] {
    if (deps.react) {
      return 'react';
    }
    if (deps.vue) {
      return 'vue';
    }
    if (deps['@angular/core']) {
      return 'angular';
    }
    if (deps.svelte) {
      return 'svelte';
    }
    return 'vanilla';
  }

  private detectLanguage(): 'typescript' | 'javascript' {
    return existsSync(join(this.cwd, 'tsconfig.json')) ? 'typescript' : 'javascript';
  }

  private detectPackageManager(): ProjectInfo['packageManager'] {
    if (existsSync(join(this.cwd, 'pnpm-lock.yaml'))) {
      return 'pnpm';
    }
    if (existsSync(join(this.cwd, 'yarn.lock'))) {
      return 'yarn';
    }
    if (existsSync(join(this.cwd, 'bun.lockb'))) {
      return 'bun';
    }
    return 'npm';
  }

  private detectBundler(deps: Record<string, string>): ProjectInfo['bundler'] {
    if (deps.vite) {
      return 'vite';
    }
    if (deps.webpack) {
      return 'webpack';
    }
    if (deps.parcel) {
      return 'parcel';
    }
    if (deps.rollup) {
      return 'rollup';
    }
    if (deps.esbuild) {
      return 'esbuild';
    }
    return 'none';
  }

  private detectESLint(): boolean {
    const configs = [
      'eslint.config.js',
      'eslint.config.mjs',
      'eslint.config.cjs',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.json',
      '.eslintrc.yml',
      '.eslintrc.yaml',
    ];
    return configs.some((config) => existsSync(join(this.cwd, config)));
  }

  private detectESLintVersion(deps: Record<string, string>): 'v8' | 'v9' | undefined {
    const eslintVersion = deps.eslint;
    if (!eslintVersion) {
      return undefined;
    }

    const version = eslintVersion.replace(/[^0-9.]/g, '');
    const major = parseInt(version.split('.')[0], 10);

    return major >= 9 ? 'v9' : 'v8';
  }

  private detectPrettier(deps: Record<string, string>): boolean {
    return !!deps.prettier || existsSync(join(this.cwd, '.prettierrc'));
  }

  private detectTests(): boolean {
    const configs = [
      'vitest.config.ts',
      'vitest.config.js',
      'jest.config.js',
      'jest.config.ts',
      'mocha.opts',
      'ava.config.js',
    ];
    return configs.some((config) => existsSync(join(this.cwd, config)));
  }

  private detectTestFramework(
    deps: Record<string, string>
  ): ProjectInfo['testFramework'] | undefined {
    if (deps.vitest) {
      return 'vitest';
    }
    if (deps.jest) {
      return 'jest';
    }
    if (deps.mocha) {
      return 'mocha';
    }
    if (deps.ava) {
      return 'ava';
    }
    return undefined;
  }

  private detectBernova(deps: Record<string, string>): boolean {
    return !!deps['@kubit-ui-web/react-components'] || !!deps['@kubit-ui-web/kubit-tokens'];
  }

  private detectStorybook(deps: Record<string, string>): boolean {
    return !!deps['@storybook/react'] || !!deps['@storybook/vue'] || !!deps.storybook;
  }

  private detectTypeScript(): boolean {
    return existsSync(join(this.cwd, 'tsconfig.json'));
  }

  private detectMonorepo(packageJson: {
    workspaces?: string[] | { packages?: string[] };
    [key: string]: unknown;
  }): {
    isMonorepo: boolean;
    tool?: ProjectInfo['monorepoTool'];
    workspaces?: string[];
  } {
    let isMonorepo = false;
    let tool: ProjectInfo['monorepoTool'] | undefined;
    let workspaces: string[] | undefined;

    // Check for pnpm workspaces
    if (existsSync(join(this.cwd, 'pnpm-workspace.yaml'))) {
      isMonorepo = true;
      tool = 'pnpm-workspaces';
      workspaces = this.parsePnpmWorkspaces();
    }

    // Check for Lerna
    if (existsSync(join(this.cwd, 'lerna.json'))) {
      isMonorepo = true;
      tool = 'lerna';
      const lernaConfig = this.parseLernaConfig();
      if (lernaConfig?.packages) {
        workspaces = lernaConfig.packages;
      }
    }

    // Check for Nx
    if (existsSync(join(this.cwd, 'nx.json'))) {
      isMonorepo = true;
      tool = 'nx';
    }

    // Check for Turborepo
    if (existsSync(join(this.cwd, 'turbo.json'))) {
      isMonorepo = true;
      tool = 'turborepo';
    }

    // Check for npm/yarn workspaces in package.json
    if (packageJson.workspaces) {
      isMonorepo = true;
      if (!tool) {
        const pm = this.detectPackageManager();
        tool = pm === 'yarn' ? 'yarn-workspaces' : 'npm-workspaces';
      }

      if (Array.isArray(packageJson.workspaces)) {
        workspaces = packageJson.workspaces;
      } else if (packageJson.workspaces && typeof packageJson.workspaces === 'object') {
        const ws = packageJson.workspaces as { packages?: string[] };
        workspaces = ws.packages;
      }
    }

    return { isMonorepo, tool, workspaces };
  }

  private parsePnpmWorkspaces(): string[] | undefined {
    try {
      const workspaceFile = join(this.cwd, 'pnpm-workspace.yaml');
      if (!existsSync(workspaceFile)) {
        return undefined;
      }

      const content = readFileSync(workspaceFile, 'utf-8');
      // Simple YAML parsing for packages array
      const match = content.match(/packages:\s*\n((?:\s+-\s+['"]?[^'"]+['"]?\s*\n?)+)/);
      if (match) {
        const packages = match[1]
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.startsWith('-'))
          .map((line) => line.replace(/^-\s+['"]?/, '').replace(/['"]?\s*$/, ''));
        return packages;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

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
}
