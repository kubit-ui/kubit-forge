import { mkdirSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { PluginContext, InitOptions } from '../../types/index.js';

import { initCommand } from '../../commands/init.js';

describe('initCommand', () => {
  const testDir = join(process.cwd(), 'test-output');
  let ctx: PluginContext;

  beforeEach(() => {
    // Setup test context
    ctx = {
      config: {} as any,
      cwd: testDir,
      logger: {
        debug: () => {},
        error: () => {},
        info: () => {},
        json: () => {},
        step: () => {},
        success: () => {},
        warn: () => {},
      },
      runner: {} as any,
    };

    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(testDir)) {
      rmSync(testDir, { force: true, recursive: true });
    }
  });

  it('should create a new React project', async () => {
    const options: InitOptions = {
      name: 'test-app',
      pm: 'pnpm',
      stack: 'react',
      ts: true,
    };

    const result = await initCommand(options, ctx);

    expect(result.status).toBe('ok');
    expect(result.message).toContain('created');
    expect(existsSync(join(testDir, 'test-app'))).toBe(true);
  });

  it('should fail if directory already exists', async () => {
    const options: InitOptions = {
      name: 'existing-app',
      pm: 'pnpm',
      stack: 'react',
      ts: true,
    };

    // Create directory first
    mkdirSync(join(testDir, 'existing-app'));

    const result = await initCommand(options, ctx);

    expect(result.status).toBe('error');
    expect(result.message).toContain('already exists');
  });

  it('should create TypeScript project when ts=true', async () => {
    const options: InitOptions = {
      name: 'ts-app',
      pm: 'pnpm',
      stack: 'react',
      ts: true,
    };

    const result = await initCommand(options, ctx);

    expect(result.status).toBe('ok');
    // Check for tsconfig.json or similar
  });

  it('should create JavaScript project when ts=false', async () => {
    const options: InitOptions = {
      name: 'js-app',
      pm: 'npm',
      stack: 'react',
      ts: false,
    };

    const result = await initCommand(options, ctx);

    expect(result.status).toBe('ok');
  });
});
