/**
 * Page Generator Tests
 */

import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { PluginContext } from '../../types/index.js';

import { generatePage } from '../../commands/generate/page.js';
import { ConsoleLogger } from '../../utils/logger.js';

describe('Page Generator', () => {
  let testDir: string;
  let ctx: PluginContext;

  beforeEach(() => {
    testDir = join(tmpdir(), `page-test-${Date.now()}`);
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

  describe('generatePage', () => {
    it('should generate page with all files', async () => {
      const result = await generatePage(
        {
          auth: false,
          name: 'Dashboard',
          route: true,
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('ok');
      expect(result.data?.files).toHaveLength(3); // Page + Test + Route

      const pageDir = join(testDir, 'src', 'pages', 'Dashboard');
      expect(existsSync(join(pageDir, 'Dashboard.tsx'))).toBe(true);
      expect(existsSync(join(pageDir, 'Dashboard.test.tsx'))).toBe(true);
      expect(existsSync(join(pageDir, 'route.ts'))).toBe(true);
    });

    it('should generate page without route', async () => {
      const result = await generatePage(
        {
          name: 'Settings',
          route: false,
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('ok');

      const pageDir = join(testDir, 'src', 'pages', 'Settings');
      expect(existsSync(join(pageDir, 'Settings.tsx'))).toBe(true);
      expect(existsSync(join(pageDir, 'route.ts'))).toBe(false);
    });

    it('should validate page name', async () => {
      const result = await generatePage(
        {
          name: 'invalid-page',
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('error');
      expect(result.message).toContain('PascalCase');
    });

    it('should prevent duplicate pages', async () => {
      await generatePage({ name: 'Home', typescript: true }, ctx);

      const result = await generatePage({ name: 'Home', typescript: true }, ctx);

      expect(result.status).toBe('error');
      expect(result.message).toContain('already exists');
    });

    it('should generate page content with correct structure', async () => {
      await generatePage(
        {
          name: 'Profile',
          typescript: true,
        },
        ctx
      );

      const pageFile = join(testDir, 'src', 'pages', 'Profile', 'Profile.tsx');
      const content = readFileSync(pageFile, 'utf-8');

      expect(content).toContain('export interface ProfileProps');
      expect(content).toContain('export const Profile');
      expect(content).toContain('FC<ProfileProps>');
    });
  });
});
