/**
 * Doctor Auto-Fix
 *
 * Intelligent auto-fix system that can automatically resolve common issues
 */

import { execSync } from 'child_process';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

import type { Logger } from '../types/index.js';

export interface AutoFixIssue {
  id: string;
  category: 'dependency' | 'config' | 'security' | 'performance' | 'quality';
  severity: 'error' | 'warning' | 'info';
  description: string;
  fixable: boolean;
  autoFixAvailable: boolean;
}

export interface AutoFixResult {
  issue: AutoFixIssue;
  fixed: boolean;
  changes: string[];
  error?: string;
}

export class DoctorAutoFix {
  private logger: Logger;
  private cwd: string;

  constructor(logger: Logger, cwd: string) {
    this.logger = logger;
    this.cwd = cwd;
  }

  /**
   * Detect fixable issues
   */
  async detectIssues(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];

    // Check for missing dependencies
    issues.push(...(await this.detectMissingDependencies()));

    // Check for outdated dependencies
    issues.push(...(await this.detectOutdatedDependencies()));

    // Check for security vulnerabilities
    issues.push(...(await this.detectSecurityIssues()));

    // Check for config issues
    issues.push(...(await this.detectConfigIssues()));

    // Check for code quality issues
    issues.push(...(await this.detectQualityIssues()));

    return issues;
  }

  /**
   * Auto-fix an issue
   */
  async fix(issue: AutoFixIssue): Promise<AutoFixResult> {
    this.logger.debug(`Attempting to fix: ${issue.id}`);

    try {
      switch (issue.category) {
        case 'dependency':
          return await this.fixDependencyIssue(issue);
        case 'config':
          return await this.fixConfigIssue(issue);
        case 'security':
          return await this.fixSecurityIssue(issue);
        case 'performance':
          return await this.fixPerformanceIssue(issue);
        case 'quality':
          return await this.fixQualityIssue(issue);
        default:
          return {
            changes: [],
            error: 'Unknown issue category',
            fixed: false,
            issue,
          };
      }
    } catch (error) {
      return {
        changes: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        fixed: false,
        issue,
      };
    }
  }

  /**
   * Fix multiple issues
   */
  async fixAll(issues: AutoFixIssue[]): Promise<AutoFixResult[]> {
    const results: AutoFixResult[] = [];

    for (const issue of issues) {
      if (issue.autoFixAvailable) {
        const result = await this.fix(issue);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Detect missing dependencies
   */
  private async detectMissingDependencies(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];
    const pkgPath = join(this.cwd, 'package.json');

    if (!existsSync(pkgPath)) {
      return issues;
    }

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        peerDependencies?: Record<string, string>;
      };

      // Check if node_modules exists
      const nodeModulesPath = join(this.cwd, 'node_modules');
      if (!existsSync(nodeModulesPath)) {
        issues.push({
          autoFixAvailable: true,
          category: 'dependency',
          description: 'node_modules directory is missing',
          fixable: true,
          id: 'missing-node-modules',
          severity: 'error',
        });
      }

      // Check for common missing peer dependencies
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      if (allDeps.react && !allDeps['react-dom']) {
        issues.push({
          autoFixAvailable: true,
          category: 'dependency',
          description: 'react-dom is required when using React',
          fixable: true,
          id: 'missing-react-dom',
          severity: 'error',
        });
      }

      if (allDeps.typescript && !allDeps['@types/node']) {
        issues.push({
          autoFixAvailable: true,
          category: 'dependency',
          description: '@types/node is recommended for TypeScript projects',
          fixable: true,
          id: 'missing-types-node',
          severity: 'warning',
        });
      }
    } catch (error) {
      this.logger.debug(`Error detecting missing dependencies: ${error}`);
    }

    return issues;
  }

  /**
   * Detect outdated dependencies
   */
  private async detectOutdatedDependencies(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];

    try {
      // Check for outdated packages (simplified check)
      const pkgPath = join(this.cwd, 'package.json');
      if (!existsSync(pkgPath)) {
        return issues;
      }

      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
        dependencies?: Record<string, string>;
      };

      // Check for very old major versions
      if (pkg.dependencies) {
        for (const [name, version] of Object.entries(pkg.dependencies)) {
          if (version.startsWith('^1.') || version.startsWith('~1.')) {
            issues.push({
              autoFixAvailable: false, // Requires manual review
              category: 'dependency',
              description: `${name} is on a very old version (${version})`,
              fixable: true,
              id: `outdated-${name}`,
              severity: 'warning',
            });
          }
        }
      }
    } catch (error) {
      this.logger.debug(`Error detecting outdated dependencies: ${error}`);
    }

    return issues;
  }

  /**
   * Detect security issues
   */
  private async detectSecurityIssues(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];

    try {
      // Check for .env file in git
      const gitignorePath = join(this.cwd, '.gitignore');
      if (existsSync(gitignorePath)) {
        const gitignore = readFileSync(gitignorePath, 'utf-8');
        if (!gitignore.includes('.env')) {
          issues.push({
            autoFixAvailable: true,
            category: 'security',
            description: '.env files should be in .gitignore',
            fixable: true,
            id: 'env-not-ignored',
            severity: 'error',
          });
        }
      }

      // Check for exposed secrets patterns
      const pkgPath = join(this.cwd, 'package.json');
      if (existsSync(pkgPath)) {
        const content = readFileSync(pkgPath, 'utf-8');
        if (
          content.includes('password') ||
          content.includes('secret') ||
          content.includes('token')
        ) {
          issues.push({
            autoFixAvailable: false,
            category: 'security',
            description: 'Potential secrets found in package.json',
            fixable: false,
            id: 'potential-secrets',
            severity: 'warning',
          });
        }
      }
    } catch (error) {
      this.logger.debug(`Error detecting security issues: ${error}`);
    }

    return issues;
  }

  /**
   * Detect config issues
   */
  private async detectConfigIssues(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];

    try {
      // Check for missing TypeScript config
      const tsconfigPath = join(this.cwd, 'tsconfig.json');
      const pkgPath = join(this.cwd, 'package.json');

      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
        };

        const hasTypeScript = pkg.dependencies?.typescript || pkg.devDependencies?.typescript;

        if (hasTypeScript && !existsSync(tsconfigPath)) {
          issues.push({
            autoFixAvailable: true,
            category: 'config',
            description: 'tsconfig.json is missing for TypeScript project',
            fixable: true,
            id: 'missing-tsconfig',
            severity: 'error',
          });
        }
      }

      // Check for missing ESLint config
      const eslintConfigs = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js'];
      const hasESLintConfig = eslintConfigs.some((config) => existsSync(join(this.cwd, config)));

      if (!hasESLintConfig && existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
          devDependencies?: Record<string, string>;
        };

        if (pkg.devDependencies?.eslint) {
          issues.push({
            autoFixAvailable: true,
            category: 'config',
            description: 'ESLint config is missing',
            fixable: true,
            id: 'missing-eslint-config',
            severity: 'warning',
          });
        }
      }
    } catch (error) {
      this.logger.debug(`Error detecting config issues: ${error}`);
    }

    return issues;
  }

  /**
   * Detect quality issues
   */
  private async detectQualityIssues(): Promise<AutoFixIssue[]> {
    const issues: AutoFixIssue[] = [];

    try {
      // Check for missing README
      const readmePath = join(this.cwd, 'README.md');
      if (!existsSync(readmePath)) {
        issues.push({
          autoFixAvailable: true,
          category: 'quality',
          description: 'README.md is missing',
          fixable: true,
          id: 'missing-readme',
          severity: 'warning',
        });
      }

      // Check for missing LICENSE
      const licensePath = join(this.cwd, 'LICENSE');
      if (!existsSync(licensePath)) {
        issues.push({
          autoFixAvailable: true,
          category: 'quality',
          description: 'LICENSE file is missing',
          fixable: true,
          id: 'missing-license',
          severity: 'info',
        });
      }
    } catch (error) {
      this.logger.debug(`Error detecting quality issues: ${error}`);
    }

    return issues;
  }

  /**
   * Fix dependency issue
   */
  private async fixDependencyIssue(issue: AutoFixIssue): Promise<AutoFixResult> {
    const changes: string[] = [];

    try {
      switch (issue.id) {
        case 'missing-node-modules':
          this.logger.info('Installing dependencies...');
          execSync('npm install', { cwd: this.cwd, stdio: 'inherit' });
          changes.push('Installed dependencies');
          break;

        case 'missing-react-dom':
          this.logger.info('Installing react-dom...');
          execSync('npm install react-dom', { cwd: this.cwd, stdio: 'inherit' });
          changes.push('Installed react-dom');
          break;

        case 'missing-types-node':
          this.logger.info('Installing @types/node...');
          execSync('npm install -D @types/node', { cwd: this.cwd, stdio: 'inherit' });
          changes.push('Installed @types/node');
          break;
      }

      return { changes, fixed: true, issue };
    } catch (error) {
      return {
        changes,
        error: error instanceof Error ? error.message : 'Unknown error',
        fixed: false,
        issue,
      };
    }
  }

  /**
   * Fix config issue
   */
  private async fixConfigIssue(issue: AutoFixIssue): Promise<AutoFixResult> {
    const changes: string[] = [];

    try {
      switch (issue.id) {
        case 'missing-tsconfig': {
          const tsconfigPath = join(this.cwd, 'tsconfig.json');
          const defaultConfig = {
            compilerOptions: {
              esModuleInterop: true,
              forceConsistentCasingInFileNames: true,
              lib: ['ES2020'],
              module: 'ESNext',
              moduleResolution: 'node',
              skipLibCheck: true,
              strict: true,
              target: 'ES2020',
            },
            exclude: ['node_modules', 'dist'],
            include: ['src/**/*'],
          };

          writeFileSync(tsconfigPath, JSON.stringify(defaultConfig, null, 2));
          changes.push('Created tsconfig.json');
          break;
        }

        case 'missing-eslint-config': {
          const eslintConfigPath = join(this.cwd, '.eslintrc.json');
          const defaultConfig = {
            env: {
              es2021: true,
              node: true,
            },
            extends: ['eslint:recommended'],
            parserOptions: {
              ecmaVersion: 'latest',
              sourceType: 'module',
            },
            rules: {},
          };

          writeFileSync(eslintConfigPath, JSON.stringify(defaultConfig, null, 2));
          changes.push('Created .eslintrc.json');
          break;
        }
      }

      return { changes, fixed: true, issue };
    } catch (error) {
      return {
        changes,
        error: error instanceof Error ? error.message : 'Unknown error',
        fixed: false,
        issue,
      };
    }
  }

  /**
   * Fix security issue
   */
  private async fixSecurityIssue(issue: AutoFixIssue): Promise<AutoFixResult> {
    const changes: string[] = [];

    try {
      switch (issue.id) {
        case 'env-not-ignored': {
          const gitignorePath = join(this.cwd, '.gitignore');
          let gitignore = '';

          if (existsSync(gitignorePath)) {
            gitignore = readFileSync(gitignorePath, 'utf-8');
          }

          if (!gitignore.includes('.env')) {
            gitignore += '\n# Environment variables\n.env\n.env.local\n.env.*.local\n';
            writeFileSync(gitignorePath, gitignore);
            changes.push('Added .env to .gitignore');
          }
          break;
        }
      }

      return { changes, fixed: true, issue };
    } catch (error) {
      return {
        changes,
        error: error instanceof Error ? error.message : 'Unknown error',
        fixed: false,
        issue,
      };
    }
  }

  /**
   * Fix performance issue
   */
  private async fixPerformanceIssue(issue: AutoFixIssue): Promise<AutoFixResult> {
    // Placeholder for performance fixes
    return {
      changes: [],
      error: 'Performance fixes not yet implemented',
      fixed: false,
      issue,
    };
  }

  /**
   * Fix quality issue
   */
  private async fixQualityIssue(issue: AutoFixIssue): Promise<AutoFixResult> {
    const changes: string[] = [];

    try {
      switch (issue.id) {
        case 'missing-readme': {
          const readmePath = join(this.cwd, 'README.md');
          const pkgPath = join(this.cwd, 'package.json');
          let projectName = 'My Project';

          if (existsSync(pkgPath)) {
            const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { name?: string };
            projectName = pkg.name || projectName;
          }

          const readme = `# ${projectName}

## Description

Add your project description here.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## License

MIT
`;

          writeFileSync(readmePath, readme);
          changes.push('Created README.md');
          break;
        }

        case 'missing-license': {
          const licensePath = join(this.cwd, 'LICENSE');
          const year = new Date().getFullYear();
          const license = `MIT License

Copyright (c) ${year}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

          writeFileSync(licensePath, license);
          changes.push('Created LICENSE file');
          break;
        }
      }

      return { changes, fixed: true, issue };
    } catch (error) {
      return {
        changes,
        error: error instanceof Error ? error.message : 'Unknown error',
        fixed: false,
        issue,
      };
    }
  }
}
