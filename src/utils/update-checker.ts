import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import semver from 'semver';

import type { Logger } from '../types/index.js';

interface UpdateCheckCache {
  lastCheck: string;
  latestVersion?: string;
}

export class UpdateChecker {
  private logger: Logger;
  private currentVersion: string;
  private cachePath: string;
  private checkInterval = 24 * 60 * 60 * 1000; // 24 hours

  constructor(logger: Logger, currentVersion: string) {
    this.logger = logger;
    this.currentVersion = currentVersion;
    this.cachePath = join(homedir(), '.kubit', 'update-check.json');
  }

  private loadCache(): UpdateCheckCache | null {
    if (existsSync(this.cachePath)) {
      try {
        return JSON.parse(readFileSync(this.cachePath, 'utf-8'));
      } catch {
        return null;
      }
    }
    return null;
  }

  private saveCache(cache: UpdateCheckCache): void {
    try {
      const dir = join(homedir(), '.kubit');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(this.cachePath, JSON.stringify(cache, null, 2));
    } catch {
      // Silently fail
    }
  }

  private shouldCheck(): boolean {
    const cache = this.loadCache();
    if (!cache) {
      return true;
    }

    const lastCheck = new Date(cache.lastCheck);
    const now = new Date();
    return now.getTime() - lastCheck.getTime() > this.checkInterval;
  }

  async checkForUpdates(silent = true): Promise<string | null> {
    if (!this.shouldCheck() && silent) {
      const cache = this.loadCache();
      return cache?.latestVersion || null;
    }

    try {
      // Fetch latest version from npm registry
      const response = await fetch('https://registry.npmjs.org/@kubit-ui-web/kubit-forge/latest');
      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { version: string };
      const latestVersion = data.version;

      // Save to cache
      this.saveCache({
        lastCheck: new Date().toISOString(),
        latestVersion,
      });

      return latestVersion;
    } catch {
      return null;
    }
  }

  async notifyIfUpdateAvailable(): Promise<void> {
    const latestVersion = await this.checkForUpdates();
    if (!latestVersion) {
      return;
    }

    if (semver.gt(latestVersion, this.currentVersion)) {
      this.logger.info('');
      this.logger.warn('┌─────────────────────────────────────────────────┐');
      this.logger.warn('│                                                 │');
      this.logger.warn(`│   Update available: ${this.currentVersion} → ${latestVersion}   │`);
      this.logger.warn('│                                                 │');
      this.logger.warn('│   Run: npm install -g @kubit-ui-web/kubit-forge@latest │');
      this.logger.warn('│   Or:  pnpm add -g @kubit-ui-web/kubit-forge@latest    │');
      this.logger.warn('│                                                 │');
      this.logger.warn('│   Changelog: https://github.com/kubit-ui/      │');
      this.logger.warn('│              kubit-forge/releases               │');
      this.logger.warn('│                                                 │');
      this.logger.warn('└─────────────────────────────────────────────────┘');
      this.logger.info('');
    }
  }

  async getLatestVersion(): Promise<string | null> {
    return await this.checkForUpdates(false);
  }

  getCurrentVersion(): string {
    return this.currentVersion;
  }

  isUpdateAvailable(latestVersion: string): boolean {
    return semver.gt(latestVersion, this.currentVersion);
  }

  getUpdateCommand(packageManager: 'npm' | 'pnpm' | 'yarn' = 'npm'): string {
    const commands = {
      npm: 'npm install -g @kubit-ui-web/kubit-forge@latest',
      pnpm: 'pnpm add -g @kubit-ui-web/kubit-forge@latest',
      yarn: 'yarn global add @kubit-ui-web/kubit-forge@latest',
    };
    return commands[packageManager];
  }
}
