import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

import type { Logger } from '../types/index.js';

export interface ChangedFiles {
  all: string[];
  staged: string[];
  unstaged: string[];
  untracked: string[];
}

export class ChangedDetector {
  private cwd: string;
  private logger: Logger;

  constructor(cwd: string, logger: Logger) {
    this.cwd = cwd;
    this.logger = logger;
  }

  /**
   * Check if directory is a git repository
   */
  isGitRepo(): boolean {
    return existsSync(join(this.cwd, '.git'));
  }

  /**
   * Get changed files since a reference (branch, commit, tag)
   */
  getChangedSince(ref: string = 'HEAD'): string[] {
    if (!this.isGitRepo()) {
      this.logger.debug('Not a git repository, cannot detect changes');
      return [];
    }

    try {
      const output = execSync(`git diff --name-only ${ref}`, {
        cwd: this.cwd,
        encoding: 'utf-8',
      });

      return output
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);
    } catch (error) {
      this.logger.debug(`Failed to get changed files: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Get all changed files (staged, unstaged, untracked)
   */
  getAllChanged(): ChangedFiles {
    if (!this.isGitRepo()) {
      return { all: [], staged: [], unstaged: [], untracked: [] };
    }

    try {
      // Staged files
      const staged = execSync('git diff --cached --name-only', {
        cwd: this.cwd,
        encoding: 'utf-8',
      })
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      // Unstaged files
      const unstaged = execSync('git diff --name-only', {
        cwd: this.cwd,
        encoding: 'utf-8',
      })
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      // Untracked files
      const untracked = execSync('git ls-files --others --exclude-standard', {
        cwd: this.cwd,
        encoding: 'utf-8',
      })
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const all = [...new Set([...staged, ...unstaged, ...untracked])];

      return { all, staged, unstaged, untracked };
    } catch (error) {
      this.logger.debug(`Failed to get changed files: ${(error as Error).message}`);
      return { all: [], staged: [], unstaged: [], untracked: [] };
    }
  }

  /**
   * Get changed files matching patterns
   */
  getChangedMatching(patterns: string[]): string[] {
    const changed = this.getAllChanged();

    return changed.all.filter((file) => {
      return patterns.some((pattern) => {
        // Simple glob matching
        const regex = new RegExp(
          pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.')
        );
        return regex.test(file);
      });
    });
  }

  /**
   * Get changed TypeScript/JavaScript files
   */
  getChangedSourceFiles(): string[] {
    return this.getChangedMatching([
      '*.ts',
      '*.tsx',
      '*.js',
      '*.jsx',
      'src/**/*.ts',
      'src/**/*.tsx',
      'src/**/*.js',
      'src/**/*.jsx',
    ]);
  }

  /**
   * Get changed test files
   */
  getChangedTestFiles(): string[] {
    return this.getChangedMatching([
      '*.test.ts',
      '*.test.tsx',
      '*.test.js',
      '*.test.jsx',
      '*.spec.ts',
      '*.spec.tsx',
      '*.spec.js',
      '*.spec.jsx',
      '**/__tests__/**/*',
    ]);
  }

  /**
   * Check if specific files have changed
   */
  hasChanged(files: string[]): boolean {
    const changed = this.getAllChanged();
    return files.some((file) => changed.all.includes(file));
  }

  /**
   * Get files changed in last N commits
   */
  getChangedInLastCommits(count: number = 1): string[] {
    if (!this.isGitRepo()) {
      return [];
    }

    try {
      const output = execSync(`git diff --name-only HEAD~${count}`, {
        cwd: this.cwd,
        encoding: 'utf-8',
      });

      return output
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);
    } catch (error) {
      this.logger.debug(`Failed to get changed files: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Get affected files by dependencies
   * (files that import changed files)
   */
  getAffectedFiles(changedFiles: string[]): string[] {
    // This is a simplified version
    // A full implementation would parse imports and build a dependency graph
    const affected = new Set(changedFiles);

    // For now, if any file in a directory changes, consider all files affected
    for (const file of changedFiles) {
      const dir = file.split('/').slice(0, -1).join('/');
      if (dir) {
        // Add files in same directory as potentially affected
        // In a real implementation, use proper import analysis
        affected.add(`${dir}/*`);
      }
    }

    return Array.from(affected);
  }

  /**
   * Get branch name
   */
  getCurrentBranch(): string | null {
    if (!this.isGitRepo()) {
      return null;
    }

    try {
      return execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: this.cwd,
        encoding: 'utf-8',
      }).trim();
    } catch {
      return null;
    }
  }

  /**
   * Check if working directory is clean
   */
  isClean(): boolean {
    const changed = this.getAllChanged();
    return changed.all.length === 0;
  }
}
