import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

import type { Logger } from '../types/index.js';

interface TelemetryConfig {
  enabled: boolean;
  anonymousId: string;
  lastPrompt?: string;
}

interface TelemetryEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
}

export class Telemetry {
  private config: TelemetryConfig;
  private configPath: string;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.configPath = join(homedir(), '.kubit', 'telemetry.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): TelemetryConfig {
    if (existsSync(this.configPath)) {
      try {
        return JSON.parse(readFileSync(this.configPath, 'utf-8'));
      } catch {
        // Fallback to default
      }
    }

    return {
      anonymousId: this.generateAnonymousId(),
      enabled: false,
    };
  }

  private saveConfig(): void {
    try {
      const dir = join(homedir(), '.kubit');
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch {
      this.logger.debug('Failed to save telemetry config');
    }
  }

  private generateAnonymousId(): string {
    return `kubit_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  async promptConsent(): Promise<boolean> {
    // Check if already prompted recently (within 30 days)
    if (this.config.lastPrompt) {
      const lastPrompt = new Date(this.config.lastPrompt);
      const daysSincePrompt = (Date.now() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSincePrompt < 30) {
        return this.config.enabled;
      }
    }

    this.logger.info('');
    this.logger.info('📊 Help us improve kubit-forge!');
    this.logger.info('');
    this.logger.info('We collect anonymous usage data to understand how kubit-forge is used.');
    this.logger.info('This helps us prioritize features and fix bugs.');
    this.logger.info('');
    this.logger.info('What we collect:');
    this.logger.info('  • Commands used (e.g., "init", "build")');
    this.logger.info('  • Success/failure rates');
    this.logger.info('  • Performance metrics');
    this.logger.info('  • Node version and OS');
    this.logger.info('');
    this.logger.info("What we DON'T collect:");
    this.logger.info('  • Your code or project files');
    this.logger.info('  • Personal information');
    this.logger.info('  • Project names or paths');
    this.logger.info('');
    this.logger.info('You can change this anytime with: kubit telemetry [enable|disable]');
    this.logger.info('');

    // In a real implementation, use enquirer to prompt
    // For now, default to disabled
    this.config.enabled = false;
    this.config.lastPrompt = new Date().toISOString();
    this.saveConfig();

    return this.config.enabled;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  enable(): void {
    this.config.enabled = true;
    this.saveConfig();
    this.logger.success('Telemetry enabled. Thank you for helping improve kubit-forge!');
  }

  disable(): void {
    this.config.enabled = false;
    this.saveConfig();
    this.logger.success('Telemetry disabled.');
  }

  async track(event: string, properties: Record<string, any> = {}): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    const telemetryEvent: TelemetryEvent = {
      event,
      properties: {
        ...properties,
        anonymousId: this.config.anonymousId,
        arch: process.arch,
        cliVersion: '4.0.0', // Should come from package.json
        nodeVersion: process.version,
        platform: process.platform,
      },
      timestamp: new Date().toISOString(),
    };

    // In production, send to analytics service
    // For now, just log in debug mode
    this.logger.debug(`Telemetry: ${JSON.stringify(telemetryEvent)}`);

    // Example: Send to analytics endpoint
    // await fetch('https://analytics.kubit-forge.org/track', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(telemetryEvent),
    // }).catch(() => {
    //   // Silently fail - telemetry should never break the CLI
    // });
  }

  async trackCommand(
    command: string,
    duration: number,
    status: 'ok' | 'error',
    error?: string
  ): Promise<void> {
    await this.track('command_executed', {
      command,
      duration,
      error: error ? 'present' : undefined, // Don't send actual error message
      status,
    });
  }

  async trackPerformance(metric: string, value: number): Promise<void> {
    await this.track('performance_metric', {
      metric,
      value,
    });
  }
}
