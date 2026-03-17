import { existsSync, rmSync, readdirSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { Logger } from '../../types/index.js';

import { ErrorReporter, setupGlobalErrorHandler } from '../../utils/error-reporter.js';

describe('ErrorReporter', () => {
  let errorReporter: ErrorReporter;
  let mockLogger: Logger;
  const testLogsDir = join(homedir(), '.kubit', 'logs');

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

    errorReporter = new ErrorReporter(mockLogger, '4.0.0', false);
  });

  afterEach(() => {
    // Cleanup test logs
    if (existsSync(testLogsDir)) {
      rmSync(testLogsDir, { force: true, recursive: true });
    }
  });

  describe('initialization', () => {
    it('should create error reporter instance', () => {
      expect(errorReporter).toBeDefined();
      expect(errorReporter.isEnabled()).toBe(false);
    });

    it('should be disabled by default', () => {
      expect(errorReporter.isEnabled()).toBe(false);
    });
  });

  describe('enable/disable', () => {
    it('should enable error reporting', () => {
      errorReporter.enable();
      expect(errorReporter.isEnabled()).toBe(true);
    });

    it('should disable error reporting', () => {
      errorReporter.enable();
      errorReporter.disable();
      expect(errorReporter.isEnabled()).toBe(false);
    });
  });

  describe('report', () => {
    it('should save error report locally', async () => {
      const error = new Error('Test error');
      await errorReporter.report(error, 'test-command');

      expect(existsSync(testLogsDir)).toBe(true);
      const files = readdirSync(testLogsDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files[0]).toMatch(/^error-\d+\.json$/);
    });

    it('should display user-friendly error message', async () => {
      const error = new Error('Test error');
      await errorReporter.report(error, 'test-command');

      expect(mockLogger.error).toHaveBeenCalled();
      const errorCalls = (mockLogger.error as any).mock.calls;
      const allErrors = errorCalls.map((call: any) => call[0]).join(' ');

      expect(allErrors).toContain('unexpected error');
      expect(allErrors).toContain('test-command');
      expect(allErrors).toContain('Test error');
      expect(allErrors).toContain('GitHub Issues');
    });

    it('should include error details in report', async () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n  at test.ts:1:1';

      await errorReporter.report(error, 'test-command', { foo: 'bar' });

      const files = readdirSync(testLogsDir);
      const reportPath = join(testLogsDir, files[0]);
      const report = JSON.parse(readFileSync(reportPath, 'utf-8'));

      expect(report.command).toBe('test-command');
      expect(report.error.name).toBe('Error');
      expect(report.error.message).toBe('Test error');
      expect(report.error.stack).toContain('test.ts');
      expect(report.context.nodeVersion).toBe(process.version);
      expect(report.context.platform).toBe(process.platform);
      expect(report.context.foo).toBe('bar');
    });

    it('should not send to service when disabled', async () => {
      const error = new Error('Test error');
      await errorReporter.report(error, 'test-command');

      // Should only have debug message for local save
      const debugCalls = (mockLogger.debug as any).mock.calls;
      const debugMessages = debugCalls.map((call: any) => call[0]).join(' ');
      expect(debugMessages).not.toContain('sent to tracking service');
    });

    it('should send to service when enabled', async () => {
      errorReporter.enable();
      const error = new Error('Test error');
      await errorReporter.report(error, 'test-command');

      // Should have debug message for service send
      const debugCalls = (mockLogger.debug as any).mock.calls;
      const debugMessages = debugCalls.map((call: any) => call[0]).join(' ');
      expect(debugMessages).toContain('sent to tracking service');
    });
  });

  describe('setupGlobalErrorHandler', () => {
    it('should setup global error handlers', () => {
      const originalListeners = process.listenerCount('uncaughtException');

      setupGlobalErrorHandler(errorReporter);

      expect(process.listenerCount('uncaughtException')).toBeGreaterThan(originalListeners);
      expect(process.listenerCount('unhandledRejection')).toBeGreaterThan(0);
    });
  });
});
