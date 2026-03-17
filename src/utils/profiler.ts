import { performance } from 'perf_hooks';

import type { Logger } from '../types/index.js';

interface ProfileMark {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

interface ProfileReport {
  totalDuration: number;
  marks: ProfileMark[];
  summary: {
    slowest: ProfileMark[];
    fastest: ProfileMark[];
    average: number;
  };
}

export class Profiler {
  private marks: Map<string, ProfileMark> = new Map();
  private logger: Logger;
  private enabled: boolean;

  constructor(logger: Logger, enabled = false) {
    this.logger = logger;
    this.enabled = enabled;
  }

  start(name: string, metadata?: Record<string, any>): void {
    if (!this.enabled) {
      return;
    }

    const mark: ProfileMark = {
      metadata,
      name,
      startTime: performance.now(),
    };

    this.marks.set(name, mark);
    this.logger.debug(`⏱️  Started: ${name}`);
  }

  end(name: string): number | undefined {
    if (!this.enabled) {
      return undefined;
    }

    const mark = this.marks.get(name);
    if (!mark) {
      this.logger.warn(`No mark found for: ${name}`);
      return undefined;
    }

    mark.endTime = performance.now();
    mark.duration = mark.endTime - mark.startTime;

    this.logger.debug(`⏱️  Completed: ${name} (${mark.duration.toFixed(2)}ms)`);

    return mark.duration;
  }

  measure(name: string, fn: () => any): any;
  measure(name: string, fn: () => Promise<any>): Promise<any>;
  measure(name: string, fn: () => any): any {
    if (!this.enabled) {
      return fn();
    }

    this.start(name);

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result.finally(() => this.end(name));
      }

      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  getReport(): ProfileReport {
    const marks = Array.from(this.marks.values()).filter((m) => m.duration !== undefined);

    const sorted = [...marks].sort((a, b) => (b.duration || 0) - (a.duration || 0));
    const totalDuration = marks.reduce((sum, m) => sum + (m.duration || 0), 0);
    const average = marks.length > 0 ? totalDuration / marks.length : 0;

    return {
      marks,
      summary: {
        average,
        fastest: sorted.slice(-5).reverse(),
        slowest: sorted.slice(0, 5),
      },
      totalDuration,
    };
  }

  printReport(): void {
    if (!this.enabled) {
      this.logger.info('Profiling is disabled. Enable with --profile flag.');
      return;
    }

    const report = this.getReport();

    this.logger.info('');
    this.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.info('  Performance Profile');
    this.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.info('');
    this.logger.info(`Total Duration: ${report.totalDuration.toFixed(2)}ms`);
    this.logger.info(`Average: ${report.summary.average.toFixed(2)}ms`);
    this.logger.info(`Operations: ${report.marks.length}`);
    this.logger.info('');

    if (report.summary.slowest.length > 0) {
      this.logger.info('Slowest Operations:');
      for (const mark of report.summary.slowest) {
        const duration = mark.duration?.toFixed(2) || '0';
        const percentage = (((mark.duration || 0) / report.totalDuration) * 100).toFixed(1);
        this.logger.info(`  ${mark.name.padEnd(30)} ${duration.padStart(10)}ms (${percentage}%)`);
      }
      this.logger.info('');
    }

    if (report.summary.fastest.length > 0) {
      this.logger.info('Fastest Operations:');
      for (const mark of report.summary.fastest) {
        const duration = mark.duration?.toFixed(2) || '0';
        this.logger.info(`  ${mark.name.padEnd(30)} ${duration.padStart(10)}ms`);
      }
      this.logger.info('');
    }

    this.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.info('');
  }

  reset(): void {
    this.marks.clear();
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  exportJSON(): string {
    return JSON.stringify(this.getReport(), null, 2);
  }

  exportCSV(): string {
    const marks = Array.from(this.marks.values());
    const header = 'name,duration,startTime,endTime\n';
    const rows = marks
      .map((m) => `${m.name},${m.duration || ''},${m.startTime},${m.endTime || ''}`)
      .join('\n');
    return header + rows;
  }
}
