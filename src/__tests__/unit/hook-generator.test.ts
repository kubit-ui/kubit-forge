/**
 * Hook Generator Tests
 */

import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { PluginContext } from '../../types/index.js';

import { generateHook } from '../../commands/generate/hook.js';
import { ConsoleLogger } from '../../utils/logger.js';

describe('Hook Generator', () => {
  let testDir: string;
  let ctx: PluginContext;

  beforeEach(() => {
    testDir = join(tmpdir(), `hook-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });

    const logger = new ConsoleLogger({ verbose: false });
    ctx = {
      config: {} as any,
      cwd: testDir,
      logger,
      runner: {} as any,
    } as PluginContext;
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { force: true, recursive: true });
    }
  });

  describe('generateHook', () => {
    it('should generate hook with test', async () => {
      const result = await generateHook(
        {
          name: 'useAuth',
          test: true,
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('ok');
      expect(result.data?.files).toHaveLength(2);

      const hooksDir = join(testDir, 'src', 'hooks');
      expect(existsSync(join(hooksDir, 'useAuth.ts'))).toBe(true);
      expect(existsSync(join(hooksDir, 'useAuth.test.ts'))).toBe(true);
    });

    it('should generate hook without test', async () => {
      const result = await generateHook(
        {
          name: 'useCounter',
          test: false,
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('ok');
      expect(result.data?.files).toHaveLength(1);

      const hooksDir = join(testDir, 'src', 'hooks');
      expect(existsSync(join(hooksDir, 'useCounter.ts'))).toBe(true);
      expect(existsSync(join(hooksDir, 'useCounter.test.ts'))).toBe(false);
    });

    it('should validate hook name starts with use', async () => {
      const result = await generateHook(
        {
          name: 'Auth',
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('error');
      expect(result.message).toContain('must start with "use"');
    });

    it('should validate hook name is camelCase', async () => {
      const result = await generateHook(
        {
          name: 'use-auth',
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('error');
      expect(result.message).toContain('camelCase');
    });

    it('should prevent duplicate hooks', async () => {
      await generateHook({ name: 'useAuth', typescript: true }, ctx);

      const result = await generateHook({ name: 'useAuth', typescript: true }, ctx);

      expect(result.status).toBe('error');
      expect(result.message).toContain('already exists');
    });

    it('should generate hook content with correct structure', async () => {
      await generateHook(
        {
          name: 'useData',
          typescript: true,
        },
        ctx
      );

      const hookFile = join(testDir, 'src', 'hooks', 'useData.ts');
      const content = readFileSync(hookFile, 'utf-8');

      expect(content).toContain('export function useData');
      expect(content).toContain('useState');
      expect(content).toContain('useCallback');
    });
  });
});
