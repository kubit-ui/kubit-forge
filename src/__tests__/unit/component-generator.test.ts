/**
 * Component Generator Tests
 */

import { existsSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import type { PluginContext } from '../../types/index.js';

import { generateComponent } from '../../commands/generate/component.js';
import { ConsoleLogger } from '../../utils/logger.js';

describe('Component Generator', () => {
  let testDir: string;
  let ctx: PluginContext;

  beforeEach(() => {
    testDir = join(tmpdir(), `component-test-${Date.now()}`);
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

  describe('generateComponent', () => {
    it('should generate component with all files', async () => {
      const result = await generateComponent(
        {
          bernova: true,
          css: true,
          name: 'Button',
          story: true,
          test: true,
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('ok');
      expect(result.data?.files).toHaveLength(5);

      const componentDir = join(testDir, 'src', 'components', 'Button');
      expect(existsSync(join(componentDir, 'Button.tsx'))).toBe(true);
      expect(existsSync(join(componentDir, 'Button.test.tsx'))).toBe(true);
      expect(existsSync(join(componentDir, 'Button.stories.tsx'))).toBe(true);
      expect(existsSync(join(componentDir, 'Button.module.css'))).toBe(true);
      expect(existsSync(join(componentDir, 'index.ts'))).toBe(true);
    });

    it('should generate component without optional files', async () => {
      const result = await generateComponent(
        {
          bernova: true,
          css: false,
          name: 'Card',
          story: false,
          test: false,
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('ok');
      expect(result.data?.files).toHaveLength(2); // Component + index

      const componentDir = join(testDir, 'src', 'components', 'Card');
      expect(existsSync(join(componentDir, 'Card.tsx'))).toBe(true);
      expect(existsSync(join(componentDir, 'index.ts'))).toBe(true);
      expect(existsSync(join(componentDir, 'Card.test.tsx'))).toBe(false);
      expect(existsSync(join(componentDir, 'Card.stories.tsx'))).toBe(false);
    });

    it('should validate component name', async () => {
      const result = await generateComponent(
        {
          name: 'invalid-name',
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('error');
      expect(result.message).toContain('PascalCase');
    });

    it('should prevent duplicate components', async () => {
      // Generate first time
      await generateComponent(
        {
          name: 'Button',
          typescript: true,
        },
        ctx
      );

      // Try to generate again
      const result = await generateComponent(
        {
          name: 'Button',
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('error');
      expect(result.message).toContain('already exists');
    });

    it('should generate component with custom path', async () => {
      const result = await generateComponent(
        {
          name: 'CustomButton',
          path: 'src/ui/buttons',
          typescript: true,
        },
        ctx
      );

      expect(result.status).toBe('ok');

      const componentDir = join(testDir, 'src', 'ui', 'buttons', 'CustomButton');
      expect(existsSync(join(componentDir, 'CustomButton.tsx'))).toBe(true);
    });

    it('should generate component content with correct structure', async () => {
      await generateComponent(
        {
          bernova: true,
          name: 'TestComponent',
          typescript: true,
        },
        ctx
      );

      const componentFile = join(
        testDir,
        'src',
        'components',
        'TestComponent',
        'TestComponent.tsx'
      );
      const content = readFileSync(componentFile, 'utf-8');

      expect(content).toContain('export interface TestComponentProps');
      expect(content).toContain('export const TestComponent');
      expect(content).toContain('FC<TestComponentProps>');
      expect(content).toContain('displayName');
    });
  });
});
