import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { Logger } from '../../types/index.js';

import { Profiler } from '../../utils/profiler.js';

describe('Profiler', () => {
  let profiler: Profiler;
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

    profiler = new Profiler(mockLogger, true);
  });

  describe('initialization', () => {
    it('should create profiler instance', () => {
      expect(profiler).toBeDefined();
      expect(profiler.isEnabled()).toBe(true);
    });

    it('should be disabled when created with false', () => {
      const disabledProfiler = new Profiler(mockLogger, false);
      expect(disabledProfiler.isEnabled()).toBe(false);
    });
  });

  describe('enable/disable', () => {
    it('should enable profiling', () => {
      profiler.disable();
      profiler.enable();
      expect(profiler.isEnabled()).toBe(true);
    });

    it('should disable profiling', () => {
      profiler.disable();
      expect(profiler.isEnabled()).toBe(false);
    });
  });

  describe('start/end', () => {
    it('should start and end a mark', () => {
      profiler.start('test-operation');
      const duration = profiler.end('test-operation');

      expect(duration).toBeGreaterThanOrEqual(0);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Started: test-operation')
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Completed: test-operation')
      );
    });

    it('should return undefined for non-existent mark', () => {
      const duration = profiler.end('non-existent');
      expect(duration).toBeUndefined();
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('No mark found'));
    });

    it('should not track when disabled', () => {
      profiler.disable();
      profiler.start('test-operation');
      const duration = profiler.end('test-operation');

      expect(duration).toBeUndefined();
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('should include metadata', () => {
      profiler.start('test-operation', { foo: 'bar' });
      profiler.end('test-operation');

      const report = profiler.getReport();
      expect(report.marks[0].metadata).toEqual({ foo: 'bar' });
    });
  });

  describe('measure', () => {
    it('should measure synchronous function', () => {
      const result = profiler.measure('sync-test', () => {
        return 42;
      });

      expect(result).toBe(42);
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Started: sync-test'));
    });

    it('should measure async function', async () => {
      const result = await profiler.measure('async-test', async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'done';
      });

      expect(result).toBe('done');
      const report = profiler.getReport();
      expect(report.marks[0].duration).toBeGreaterThanOrEqual(8);
    });

    it('should handle errors in measured function', () => {
      expect(() => {
        profiler.measure('error-test', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      // Should still end the mark
      const report = profiler.getReport();
      expect(report.marks[0].duration).toBeDefined();
    });

    // it('should not measure when disabled', () => {
    //   profiler.disable();
    //   const result = profiler.measure('disabled-test', () => 42);

    //   expect(result).toBe(42);
    //   expect(mockLogger.debug).not.toHaveBeenCalled();
    // });
  });

  describe('getReport', () => {
    it('should return empty report initially', () => {
      const report = profiler.getReport();

      expect(report.totalDuration).toBe(0);
      expect(report.marks).toHaveLength(0);
      expect(report.summary.average).toBe(0);
    });

    it('should calculate total duration', () => {
      profiler.start('op1');
      profiler.end('op1');
      profiler.start('op2');
      profiler.end('op2');

      const report = profiler.getReport();
      expect(report.totalDuration).toBeGreaterThan(0);
      expect(report.marks).toHaveLength(2);
    });

    it('should calculate average duration', () => {
      profiler.start('op1');
      profiler.end('op1');
      profiler.start('op2');
      profiler.end('op2');

      const report = profiler.getReport();
      expect(report.summary.average).toBeGreaterThan(0);
      expect(report.summary.average).toBe(report.totalDuration / 2);
    });

    it('should sort slowest operations', () => {
      profiler.measure('fast', () => {});
      profiler.measure('slow', () => {
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Busy wait
        }
      });

      const report = profiler.getReport();
      expect(report.summary.slowest[0].name).toBe('slow');
    });

    it('should sort fastest operations', () => {
      profiler.measure('fast', () => {});
      profiler.measure('slow', () => {
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Busy wait
        }
      });

      const report = profiler.getReport();
      expect(report.summary.fastest[0].name).toBe('fast');
    });
  });

  describe('printReport', () => {
    it('should print report when enabled', () => {
      profiler.start('test');
      profiler.end('test');

      profiler.printReport();

      expect(mockLogger.info).toHaveBeenCalled();
      const infoCalls = (mockLogger.info as any).mock.calls;
      const allInfo = infoCalls.map((call: any) => call[0]).join(' ');

      expect(allInfo).toContain('Performance Profile');
      expect(allInfo).toContain('Total Duration');
      expect(allInfo).toContain('Average');
    });

    it('should show message when disabled', () => {
      profiler.disable();
      profiler.printReport();

      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('disabled'));
    });
  });

  describe('reset', () => {
    it('should clear all marks', () => {
      profiler.start('test');
      profiler.end('test');

      profiler.reset();

      const report = profiler.getReport();
      expect(report.marks).toHaveLength(0);
    });
  });

  describe('export', () => {
    it('should export to JSON', () => {
      profiler.start('test');
      profiler.end('test');

      const json = profiler.exportJSON();
      const parsed = JSON.parse(json);

      expect(parsed.marks).toHaveLength(1);
      expect(parsed.totalDuration).toBeGreaterThan(0);
    });

    it('should export to CSV', () => {
      profiler.start('test1');
      profiler.end('test1');
      profiler.start('test2');
      profiler.end('test2');

      const csv = profiler.exportCSV();

      expect(csv).toContain('name,duration,startTime,endTime');
      expect(csv).toContain('test1');
      expect(csv).toContain('test2');
    });
  });
});
