import chalk from 'chalk';

import type { Logger } from '../types/index.js';

import { colors, symbols } from './theme.js';

export class ConsoleLogger implements Logger {
  private useColor: boolean;
  private isVerbose: boolean;
  private isQuiet: boolean;
  private useJson: boolean;

  constructor(
    options: {
      noColor?: boolean;
      verbose?: boolean;
      quiet?: boolean;
      json?: boolean;
    } = {}
  ) {
    this.useColor = !options.noColor;
    this.isVerbose = options.verbose || false;
    this.isQuiet = options.quiet || false;
    this.useJson = options.json || false;
  }

  info(message: string): void {
    if (this.isQuiet) {
      return;
    }
    if (this.useJson) {
      console.log(JSON.stringify({ level: 'info', message }));
      return;
    }
    console.log(this.useColor ? colors.info(symbols.info) : 'i', message);
  }

  success(message: string): void {
    if (this.isQuiet) {
      return;
    }
    if (this.useJson) {
      console.log(JSON.stringify({ level: 'success', message }));
      return;
    }
    console.log(this.useColor ? colors.success(symbols.success) : symbols.success, message);
  }

  warn(message: string): void {
    if (this.useJson) {
      console.log(JSON.stringify({ level: 'warning', message }));
      return;
    }
    console.warn(this.useColor ? colors.warning(symbols.warning) : symbols.warning, message);
  }

  error(message: string, error?: Error): void {
    if (this.useJson) {
      console.log(
        JSON.stringify({
          error: error?.message,
          level: 'error',
          message,
          stack: error?.stack,
        })
      );
      return;
    }
    console.error(this.useColor ? colors.error(symbols.error) : symbols.error, message);
    if (error && this.isVerbose) {
      console.error(chalk.gray(error.stack || error.message));
    }
  }

  debug(message: string): void {
    if (!this.isVerbose) {
      return;
    }
    if (this.useJson) {
      console.log(JSON.stringify({ level: 'debug', message }));
      return;
    }
    console.log(this.useColor ? colors.muted(symbols.pointer) : symbols.pointer, message);
  }

  step(message: string): void {
    if (this.isQuiet) {
      return;
    }
    if (this.useJson) {
      console.log(JSON.stringify({ level: 'step', message }));
      return;
    }
    console.log(this.useColor ? colors.primary(symbols.step) : symbols.step, message);
  }

  json(data: any): void {
    console.log(JSON.stringify(data, null, 2));
  }
}
