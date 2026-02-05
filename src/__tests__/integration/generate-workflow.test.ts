/**
 * Generate Workflow Integration Tests
 *
 * Tests the complete workflow of generating multiple items
 */

import { existsSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { PluginContext } from '../../types/index.js';

import { generateComponent } from '../../commands/generate/component.js';
import { generateContext } from '../../commands/generate/context.js';
import { generateHook } from '../../commands/generate/hook.js';
import { generatePage } from '../../commands/generate/page.js';
import { generateService } from '../../commands/generate/service.js';
import { ConsoleLogger } from '../../utils/logger.js';

describe('Generate Workflow Integration', () => {
  let testDir: string;
  let ctx: PluginContext;

  beforeEach(() => {
    testDir = join(tmpdir(), `workflow-test-${Date.now()}`);
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

  it('should generate complete feature with all artifacts', async () => {
    // 1. Generate service
    const serviceResult = await generateService(
      {
        name: 'userService',
        test: true,
        typescript: true,
      },
      ctx
    );
    expect(serviceResult.status).toBe('ok');

    // 2. Generate context
    const contextResult = await generateContext(
      {
        name: 'User',
        test: true,
        typescript: true,
      },
      ctx
    );
    expect(contextResult.status).toBe('ok');

    // 3. Generate hook
    const hookResult = await generateHook(
      {
        name: 'useUsers',
        test: true,
        typescript: true,
      },
      ctx
    );
    expect(hookResult.status).toBe('ok');

    // 4. Generate component
    const componentResult = await generateComponent(
      {
        css: true,
        name: 'UserCard',
        story: true,
        test: true,
        typescript: true,
      },
      ctx
    );
    expect(componentResult.status).toBe('ok');

    // 5. Generate page
    const pageResult = await generatePage(
      {
        auth: false,
        name: 'Users',
        route: true,
        typescript: true,
      },
      ctx
    );
    expect(pageResult.status).toBe('ok');

    // Verify all files exist
    expect(existsSync(join(testDir, 'src', 'services', 'userService.ts'))).toBe(true);
    expect(existsSync(join(testDir, 'src', 'contexts', 'User', 'UserContext.tsx'))).toBe(true);
    expect(existsSync(join(testDir, 'src', 'hooks', 'useUsers.ts'))).toBe(true);
    expect(existsSync(join(testDir, 'src', 'components', 'UserCard', 'UserCard.tsx'))).toBe(true);
    expect(existsSync(join(testDir, 'src', 'pages', 'Users', 'Users.tsx'))).toBe(true);
  });

  it('should handle multiple components in same session', async () => {
    const components = ['Button', 'Card', 'Input', 'Modal'];

    for (const name of components) {
      const result = await generateComponent(
        {
          name,
          test: true,
          typescript: true,
        },
        ctx
      );
      expect(result.status).toBe('ok');
    }

    // Verify all components exist
    for (const name of components) {
      const componentPath = join(testDir, 'src', 'components', name, `${name}.tsx`);
      expect(existsSync(componentPath)).toBe(true);
    }
  });

  it('should handle mixed generator types', async () => {
    const results = await Promise.all([
      generateComponent({ name: 'Button', typescript: true }, ctx),
      generatePage({ name: 'Home', typescript: true }, ctx),
      generateHook({ name: 'useAuth', typescript: true }, ctx),
    ]);

    results.forEach((result) => {
      expect(result.status).toBe('ok');
    });
  });

  it('should maintain project structure', async () => {
    // Generate various items
    await generateComponent({ name: 'Button', typescript: true }, ctx);
    await generatePage({ name: 'Home', typescript: true }, ctx);
    await generateHook({ name: 'useAuth', typescript: true }, ctx);
    await generateContext({ name: 'Theme', typescript: true }, ctx);
    await generateService({ name: 'apiService', typescript: true }, ctx);

    // Verify structure
    const srcDir = join(testDir, 'src');
    expect(existsSync(join(srcDir, 'components'))).toBe(true);
    expect(existsSync(join(srcDir, 'pages'))).toBe(true);
    expect(existsSync(join(srcDir, 'hooks'))).toBe(true);
    expect(existsSync(join(srcDir, 'contexts'))).toBe(true);
    expect(existsSync(join(srcDir, 'services'))).toBe(true);
  });
});
