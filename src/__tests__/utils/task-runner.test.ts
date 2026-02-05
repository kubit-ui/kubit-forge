import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { Logger, TaskResult } from '../../types/index.js';

import { DefaultTaskRunner } from '../../utils/task-runner.js';

// Mock execa
vi.mock('execa', () => ({
  execa: vi.fn(),
}));

import { execa } from 'execa';

describe('DefaultTaskRunner', () => {
  let taskRunner: DefaultTaskRunner;
  let mockLogger: Logger;

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

    taskRunner = new DefaultTaskRunner(mockLogger);
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create task runner instance', () => {
      expect(taskRunner).toBeDefined();
    });
  });

  describe('registerTask', () => {
    it('should register a task', () => {
      const task = vi.fn(async () => ({ duration: 100, status: 'ok' as const }));
      taskRunner.registerTask('test-task', task);

      // Task should be registered (we can't directly test the private Map)
      expect(task).not.toHaveBeenCalled();
    });
  });

  describe('run', () => {
    it('should run command successfully', async () => {
      (execa as any).mockResolvedValueOnce({
        all: 'Success output',
        exitCode: 0,
      });

      const result = await taskRunner.run('echo', ['hello']);

      expect(result.status).toBe('ok');
      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(execa).toHaveBeenCalledWith('echo', ['hello'], expect.any(Object));
    });

    it('should handle command failure', async () => {
      (execa as any).mockResolvedValueOnce({
        all: 'Error output',
        exitCode: 1,
      });

      const result = await taskRunner.run('false');

      expect(result.status).toBe('error');
      expect(result.exitCode).toBe(1);
      expect(result.message).toContain('failed with exit code 1');
      expect(result.output).toBe('Error output');
    });

    it('should handle exceptions', async () => {
      (execa as any).mockRejectedValueOnce(new Error('Command not found'));

      const result = await taskRunner.run('nonexistent');

      expect(result.status).toBe('error');
      expect(result.message).toBe('Command not found');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should respect cwd option', async () => {
      (execa as any).mockResolvedValueOnce({
        all: '',
        exitCode: 0,
      });

      await taskRunner.run('ls', [], { cwd: '/tmp' });

      expect(execa).toHaveBeenCalledWith('ls', [], expect.objectContaining({ cwd: '/tmp' }));
    });

    it('should pass environment variables', async () => {
      (execa as any).mockResolvedValueOnce({
        all: '',
        exitCode: 0,
      });

      await taskRunner.run('env', [], { env: { FOO: 'bar' } });

      expect(execa).toHaveBeenCalledWith(
        'env',
        [],
        expect.objectContaining({
          env: expect.objectContaining({ FOO: 'bar' }),
        })
      );
    });

    it('should capture output when requested', async () => {
      (execa as any).mockResolvedValueOnce({
        all: 'Command output',
        exitCode: 0,
      });

      const result = await taskRunner.run('echo', ['test'], { captureOutput: true });

      expect(result.output).toBe('Command output');
    });

    it('should not capture output by default', async () => {
      (execa as any).mockResolvedValueOnce({
        all: 'Command output',
        exitCode: 0,
      });

      const result = await taskRunner.run('echo', ['test']);

      expect(result.output).toBeUndefined();
    });

    it('should not log when silent', async () => {
      (execa as any).mockResolvedValueOnce({
        all: '',
        exitCode: 0,
      });

      await taskRunner.run('echo', ['test'], { silent: true });

      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('should log when not silent', async () => {
      (execa as any).mockResolvedValueOnce({
        all: '',
        exitCode: 0,
      });

      await taskRunner.run('echo', ['test'], { silent: false });

      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Running: echo test'));
    });

    it('should measure duration', async () => {
      (execa as any).mockImplementationOnce(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { all: '', exitCode: 0 };
      });

      const result = await taskRunner.run('sleep', ['0.05']);

      // Allow 1ms tolerance for timing variations
      expect(result.duration).toBeGreaterThanOrEqual(49);
    });
  });

  describe('task registration', () => {
    it('should allow multiple task registrations', () => {
      const task1 = vi.fn(
        async (): Promise<TaskResult> => ({
          duration: 100,
          status: 'ok',
        })
      );
      const task2 = vi.fn(
        async (): Promise<TaskResult> => ({
          duration: 200,
          status: 'ok',
        })
      );

      taskRunner.registerTask('task1', task1);
      taskRunner.registerTask('task2', task2);

      // Tasks registered successfully (can't directly verify private Map)
      expect(task1).not.toHaveBeenCalled();
      expect(task2).not.toHaveBeenCalled();
    });
  });
});
