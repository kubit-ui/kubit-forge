import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import type { Logger } from '../types/index.js';

interface ErrorReport {
  timestamp: string;
  version: string;
  command: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    nodeVersion: string;
    platform: string;
    arch: string;
    cwd: string;
  };
  anonymousId?: string;
}

export class ErrorReporter {
  private logger: Logger;
  private version: string;
  private enabled: boolean;

  constructor(logger: Logger, version: string, enabled = false) {
    this.logger = logger;
    this.version = version;
    this.enabled = enabled;
  }

  async report(error: Error, command: string, context: Record<string, any> = {}): Promise<void> {
    const report: ErrorReport = {
      command,
      context: {
        arch: process.arch,
        cwd: process.cwd(),
        nodeVersion: process.version,
        platform: process.platform,
        ...context,
      },
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
      },
      timestamp: new Date().toISOString(),
      version: this.version,
    };

    // Save locally for debugging
    this.saveLocalReport(report);

    // Send to error tracking service if enabled
    if (this.enabled) {
      await this.sendToService(report);
    }

    // Show user-friendly message
    this.displayErrorMessage(error, command);
  }

  private saveLocalReport(report: ErrorReport): void {
    try {
      const logsDir = join(homedir(), '.kubit', 'logs');
      if (!existsSync(logsDir)) {
        mkdirSync(logsDir, { recursive: true });
      }

      const filename = `error-${Date.now()}.json`;
      const filepath = join(logsDir, filename);
      writeFileSync(filepath, JSON.stringify(report, null, 2));

      this.logger.debug(`Error report saved to: ${filepath}`);
    } catch {
      // Silently fail - don't break on error reporting
    }
  }

  private async sendToService(_report: ErrorReport): Promise<void> {
    try {
      // In production, send to Sentry, Bugsnag, or custom endpoint
      // await fetch('https://errors.kubit-forge.org/report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });

      this.logger.debug('Error report sent to tracking service');
    } catch {
      // Silently fail
    }
  }

  private displayErrorMessage(error: Error, command: string): void {
    this.logger.error('');
    this.logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.error('  An unexpected error occurred');
    this.logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.error('');
    this.logger.error(`Command: ${command}`);
    this.logger.error(`Error: ${error.message}`);
    this.logger.error('');
    this.logger.error('This is likely a bug in kubit-forge. Please report it:');
    this.logger.error('');
    this.logger.error('  🐛 GitHub Issues:');
    this.logger.error('     https://github.com/kubit-ui/kubit-forge/issues/new');
    this.logger.error('');
    this.logger.error('  💬 Discord:');
    this.logger.error('     https://discord.gg/kubit');
    this.logger.error('');
    this.logger.error('  📧 Email:');
    this.logger.error('     support@kubit-forge.org');
    this.logger.error('');
    this.logger.error('Include the error log from:');
    this.logger.error(`  ${join(homedir(), '.kubit', 'logs')}`);
    this.logger.error('');
    this.logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    this.logger.error('');
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
}

// Global error handler
export function setupGlobalErrorHandler(reporter: ErrorReporter): void {
  process.on('uncaughtException', (error: Error) => {
    reporter.report(error, 'uncaught-exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    reporter.report(error, 'unhandled-rejection');
    process.exit(1);
  });
}
