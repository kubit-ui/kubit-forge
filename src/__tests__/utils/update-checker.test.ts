import { existsSync, rmSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { Logger } from '../../types/index.js';

import { UpdateChecker } from '../../utils/update-checker.js';

// Mock fetch
global.fetch = vi.fn();

describe('UpdateChecker', () => {
  let updateChecker: UpdateChecker;
  let mockLogger: Logger;
  const testCachePath = join(homedir(), '.kubit', 'update-check.json');

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      json: vi.fn(),
      step: vi.fn(),
      success: vi.fn(),
      warn: vi.fn(),
    };

    updateChecker = new UpdateChecker(mockLogger, '4.0.0');
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup test cache
    if (existsSync(testCachePath)) {
      rmSync(testCachePath, { force: true });
    }
  });

  describe('initialization', () => {
    it('should create update checker instance', () => {
      expect(updateChecker).toBeDefined();
      expect(updateChecker.getCurrentVersion()).toBe('4.0.0');
    });
  });

  describe('checkForUpdates', () => {
    it('should fetch latest version from npm registry', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({ version: '4.1.0' }),
        ok: true,
      });

      const latestVersion = await updateChecker.checkForUpdates(false);
      expect(latestVersion).toBe('4.1.0');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://registry.npmjs.org/@kubit-ui-web/kubit-forge/latest'
      );
    });

    it('should return null on fetch error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const latestVersion = await updateChecker.checkForUpdates(false);
      expect(latestVersion).toBeNull();
    });

    it('should return null on non-ok response', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      const latestVersion = await updateChecker.checkForUpdates(false);
      expect(latestVersion).toBeNull();
    });

    it('should cache the result', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({ version: '4.1.0' }),
        ok: true,
      });

      await updateChecker.checkForUpdates(false);

      // Second call should use cache
      const cachedVersion = await updateChecker.checkForUpdates(true);
      expect(cachedVersion).toBe('4.1.0');
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  describe('isUpdateAvailable', () => {
    it('should return true when newer version available', () => {
      expect(updateChecker.isUpdateAvailable('4.1.0')).toBe(true);
      expect(updateChecker.isUpdateAvailable('5.0.0')).toBe(true);
    });

    it('should return false when same version', () => {
      expect(updateChecker.isUpdateAvailable('4.0.0')).toBe(false);
    });

    it('should return false when older version', () => {
      expect(updateChecker.isUpdateAvailable('3.9.0')).toBe(false);
    });
  });

  describe('notifyIfUpdateAvailable', () => {
    it('should show notification when update available', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({ version: '4.1.0' }),
        ok: true,
      });

      await updateChecker.notifyIfUpdateAvailable();

      expect(mockLogger.warn).toHaveBeenCalled();
      const warnCalls = (mockLogger.warn as any).mock.calls;
      const allWarnings = warnCalls.map((call: any) => call[0]).join(' ');
      expect(allWarnings).toContain('4.0.0');
      expect(allWarnings).toContain('4.1.0');
    });

    it('should not show notification when no update available', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({ version: '4.0.0' }),
        ok: true,
      });

      await updateChecker.notifyIfUpdateAvailable();

      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should not crash on fetch error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(updateChecker.notifyIfUpdateAvailable()).resolves.not.toThrow();
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });
  });

  describe('getUpdateCommand', () => {
    it('should return npm command by default', () => {
      const command = updateChecker.getUpdateCommand();
      expect(command).toBe('npm install -g @kubit-ui-web/kubit-forge@latest');
    });

    it('should return pnpm command', () => {
      const command = updateChecker.getUpdateCommand('pnpm');
      expect(command).toBe('pnpm add -g @kubit-ui-web/kubit-forge@latest');
    });

    it('should return yarn command', () => {
      const command = updateChecker.getUpdateCommand('yarn');
      expect(command).toBe('yarn global add @kubit-ui-web/kubit-forge@latest');
    });
  });

  describe('getLatestVersion', () => {
    it('should fetch latest version', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({ version: '4.2.0' }),
        ok: true,
      });

      const version = await updateChecker.getLatestVersion();
      expect(version).toBe('4.2.0');
    });
  });
});
