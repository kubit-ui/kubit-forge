import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { PluginContext } from '../../types/index.js';

import { HookManager } from '../../core/hook-manager.js';

describe('HookManager', () => {
  let hookManager: HookManager;
  let mockContext: PluginContext;

  beforeEach(() => {
    mockContext = {
      config: {} as any,
      cwd: '/test/project',
      logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        json: vi.fn(),
        step: vi.fn(),
        success: vi.fn(),
        warn: vi.fn(),
      } as any,
      runner: {} as any,
    };

    hookManager = new HookManager(mockContext);
  });

  describe('register', () => {
    it('should register a hook', () => {
      const handler = vi.fn();

      hookManager.register('build:before', handler);

      expect(hookManager.has('build:before')).toBe(true);
      expect(hookManager.count('build:before')).toBe(1);
    });

    it('should register multiple hooks for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      hookManager.register('build:before', handler1);
      hookManager.register('build:before', handler2);

      expect(hookManager.count('build:before')).toBe(2);
    });

    it('should register hooks with priority', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      hookManager.register('build:before', handler1, 10);
      hookManager.register('build:before', handler2, 5);

      expect(hookManager.count('build:before')).toBe(2);
    });

    it('should register hook with plugin name', () => {
      const handler = vi.fn();

      hookManager.register('build:before', handler, 0, 'my-plugin');

      const debugInfo = hookManager.getDebugInfo();
      expect(debugInfo['build:before']).toBeDefined();
      expect(debugInfo['build:before'][0].pluginName).toBe('my-plugin');
    });
  });

  describe('trigger', () => {
    it('should trigger registered hooks', async () => {
      const handler = vi.fn();

      hookManager.register('build:before', handler);
      await hookManager.trigger('build:before', { mode: 'production' });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ mode: 'production' }, mockContext);
    });

    it('should trigger hooks in priority order', async () => {
      const callOrder: number[] = [];
      const handler1 = vi.fn(() => {
        callOrder.push(1);
      });
      const handler2 = vi.fn(() => {
        callOrder.push(2);
      });
      const handler3 = vi.fn(() => {
        callOrder.push(3);
      });

      hookManager.register('build:before', handler1, 5);
      hookManager.register('build:before', handler2, 10); // Highest priority
      hookManager.register('build:before', handler3, 0);

      await hookManager.trigger('build:before');

      expect(callOrder).toEqual([2, 1, 3]); // Priority order: 10, 5, 0
    });

    it('should not fail if no hooks registered', async () => {
      await expect(hookManager.trigger('build:before')).resolves.not.toThrow();
    });

    it('should handle async hooks', async () => {
      const handler = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      hookManager.register('build:before', handler);
      await hookManager.trigger('build:before');

      expect(handler).toHaveBeenCalled();
    });

    it('should stop execution when hook returns skip', async () => {
      const handler1 = vi.fn(() => ({ skip: true }));
      const handler2 = vi.fn();

      hookManager.register('build:before', handler1, 10);
      hookManager.register('build:before', handler2, 5);

      await hookManager.trigger('build:before');

      expect(handler1).toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });

    it('should continue execution on error', async () => {
      const handler1 = vi.fn(() => {
        throw new Error('Test error');
      });
      const handler2 = vi.fn();

      hookManager.register('build:before', handler1, 10);
      hookManager.register('build:before', handler2, 5);

      await hookManager.trigger('build:before');

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
      expect(mockContext.logger.error).toHaveBeenCalled();
    });
  });

  describe('unregister', () => {
    it('should unregister a hook', () => {
      const handler = vi.fn();

      hookManager.register('build:before', handler);
      expect(hookManager.has('build:before')).toBe(true);

      hookManager.unregister('build:before', handler);
      expect(hookManager.count('build:before')).toBe(0);
    });

    it('should not fail when unregistering non-existent hook', () => {
      const handler = vi.fn();

      expect(() => {
        hookManager.unregister('build:before', handler);
      }).not.toThrow();
    });
  });

  describe('has', () => {
    it('should return true for registered hooks', () => {
      const handler = vi.fn();

      hookManager.register('build:before', handler);

      expect(hookManager.has('build:before')).toBe(true);
    });

    it('should return false for unregistered hooks', () => {
      expect(hookManager.has('build:before')).toBe(false);
    });
  });

  describe('list', () => {
    it('should list all registered hook names', () => {
      const handler = vi.fn();

      hookManager.register('build:before', handler);
      hookManager.register('build:after', handler);
      hookManager.register('test:before', handler);

      const hooks = hookManager.list();

      expect(hooks).toContain('build:before');
      expect(hooks).toContain('build:after');
      expect(hooks).toContain('test:before');
      expect(hooks).toHaveLength(3);
    });

    it('should return empty array when no hooks registered', () => {
      const hooks = hookManager.list();

      expect(hooks).toEqual([]);
    });
  });

  describe('count', () => {
    it('should return correct count of handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      hookManager.register('build:before', handler1);
      hookManager.register('build:before', handler2);

      expect(hookManager.count('build:before')).toBe(2);
    });

    it('should return 0 for unregistered hooks', () => {
      expect(hookManager.count('build:before')).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all hooks', () => {
      const handler = vi.fn();

      hookManager.register('build:before', handler);
      hookManager.register('build:after', handler);

      hookManager.clear();

      expect(hookManager.list()).toHaveLength(0);
    });
  });

  describe('clearHook', () => {
    it('should clear specific hook', () => {
      const handler = vi.fn();

      hookManager.register('build:before', handler);
      hookManager.register('build:after', handler);

      hookManager.clearHook('build:before');

      expect(hookManager.has('build:before')).toBe(false);
      expect(hookManager.has('build:after')).toBe(true);
    });
  });

  describe('getDebugInfo', () => {
    it('should return debug information', () => {
      const handler = vi.fn();

      hookManager.register('build:before', handler, 10, 'my-plugin');
      hookManager.register('build:before', handler, 5, 'other-plugin');

      const debugInfo = hookManager.getDebugInfo();

      expect(debugInfo['build:before']).toBeDefined();
      expect(debugInfo['build:before']).toHaveLength(2);
      expect(debugInfo['build:before'][0].priority).toBe(10);
      expect(debugInfo['build:before'][0].pluginName).toBe('my-plugin');
      expect(debugInfo['build:before'][1].priority).toBe(5);
      expect(debugInfo['build:before'][1].pluginName).toBe('other-plugin');
    });
  });
});
