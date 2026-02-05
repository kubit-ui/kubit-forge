import { existsSync, rmSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { Logger } from '../../types/index.js';

import { Telemetry } from '../../utils/telemetry.js';

describe('Telemetry', () => {
  let telemetry: Telemetry;
  let mockLogger: Logger;
  const testConfigPath = join(homedir(), '.kubit', 'telemetry.json');

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

    telemetry = new Telemetry(mockLogger);
  });

  afterEach(() => {
    // Cleanup test config
    if (existsSync(testConfigPath)) {
      rmSync(testConfigPath, { force: true });
    }
  });

  describe('initialization', () => {
    it('should create telemetry instance', () => {
      expect(telemetry).toBeDefined();
      expect(telemetry.isEnabled()).toBe(false);
    });

    it('should be disabled by default', () => {
      expect(telemetry.isEnabled()).toBe(false);
    });
  });

  describe('enable/disable', () => {
    it('should enable telemetry', () => {
      telemetry.enable();
      expect(telemetry.isEnabled()).toBe(true);
      expect(mockLogger.success).toHaveBeenCalledWith(expect.stringContaining('enabled'));
    });

    it('should disable telemetry', () => {
      telemetry.enable();
      telemetry.disable();
      expect(telemetry.isEnabled()).toBe(false);
      expect(mockLogger.success).toHaveBeenCalledWith(expect.stringContaining('disabled'));
    });

    it('should persist enabled state', () => {
      telemetry.enable();

      // Create new instance to test persistence
      const newTelemetry = new Telemetry(mockLogger);
      expect(newTelemetry.isEnabled()).toBe(true);
    });
  });

  describe('tracking', () => {
    it('should not track when disabled', async () => {
      await telemetry.track('test_event', { foo: 'bar' });
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('should track when enabled', async () => {
      telemetry.enable();
      await telemetry.track('test_event', { foo: 'bar' });
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('test_event'));
    });

    it('should include anonymous ID in events', async () => {
      telemetry.enable();
      await telemetry.track('test_event', { foo: 'bar' });

      const debugCall = (mockLogger.debug as any).mock.calls[0][0];
      expect(debugCall).toContain('anonymousId');
    });

    it('should include system info in events', async () => {
      telemetry.enable();
      await telemetry.track('test_event');

      const debugCall = (mockLogger.debug as any).mock.calls[0][0];
      expect(debugCall).toContain('nodeVersion');
      expect(debugCall).toContain('platform');
      expect(debugCall).toContain('arch');
    });
  });

  describe('trackCommand', () => {
    it('should track command execution', async () => {
      telemetry.enable();
      await telemetry.trackCommand('init', 1234, 'ok');

      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('command_executed'));
    });

    it('should track command errors without details', async () => {
      telemetry.enable();
      await telemetry.trackCommand('build', 5678, 'error', 'Some error');

      const debugCall = (mockLogger.debug as any).mock.calls[0][0];
      expect(debugCall).toContain('error');
      expect(debugCall).toContain('present');
      expect(debugCall).not.toContain('Some error'); // Should not leak error message
    });
  });

  describe('trackPerformance', () => {
    it('should track performance metrics', async () => {
      telemetry.enable();
      await telemetry.trackPerformance('build_time', 1234);

      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('performance_metric'));
    });
  });

  describe('promptConsent', () => {
    it('should default to disabled', async () => {
      const result = await telemetry.promptConsent();
      expect(result).toBe(false);
    });

    it('should save last prompt timestamp', async () => {
      await telemetry.promptConsent();
      // Calling again should return same result without re-prompting
      const result = await telemetry.promptConsent();
      expect(result).toBe(false);
    });
  });
});
