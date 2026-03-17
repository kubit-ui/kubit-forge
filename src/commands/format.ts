import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext, CommandResult } from '../types/index.js';

export interface FormatOptions {
  check?: boolean;
  write?: boolean;
}

/**
 * Format code with Prettier
 * Detects and runs Prettier with appropriate configuration
 */
export async function formatCommand(
  options: FormatOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  // Trigger format:before hook
  if (ctx.hookManager) {
    await ctx.hookManager.trigger('format:before', options);
  }

  const isCheckMode = options.check || !options.write;

  ctx.logger.step(isCheckMode ? 'Checking code formatting...' : 'Formatting code...');

  // Check if Prettier is configured
  if (!hasPrettierConfig(ctx.cwd)) {
    return {
      message: 'No Prettier configuration found. Run `kubit-forge add prettier` first.',
      status: 'error',
    };
  }

  ctx.logger.info('Using Prettier');

  // Build command args
  const args = buildFormatArgs(options);

  // Execute Prettier
  const result = await ctx.runner.run('prettier', args);

  if (result.status === 'error') {
    return {
      message: isCheckMode ? 'Some files are not formatted correctly' : 'Formatting failed',
      status: 'error',
    };
  }

  ctx.logger.success(
    isCheckMode ? '✓ All files are formatted correctly!' : '✓ Code formatted successfully!'
  );

  // Trigger format:after hook
  if (ctx.hookManager) {
    await ctx.hookManager.trigger('format:after', result);
  }

  return {
    message: 'Formatting completed',
    status: 'ok',
  };
}

function hasPrettierConfig(cwd: string): boolean {
  const configFiles = [
    '.prettierrc',
    '.prettierrc.json',
    '.prettierrc.yml',
    '.prettierrc.yaml',
    '.prettierrc.json5',
    '.prettierrc.js',
    '.prettierrc.cjs',
    '.prettierrc.mjs',
    'prettier.config.js',
    'prettier.config.cjs',
    'prettier.config.mjs',
  ];

  // Check for config files
  if (configFiles.some((file) => existsSync(join(cwd, file)))) {
    return true;
  }

  // Check for prettier key in package.json
  const packageJsonPath = join(cwd, 'package.json');
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    if (packageJson.prettier) {
      return true;
    }
  }

  return false;
}

function buildFormatArgs(options: FormatOptions): string[] {
  const args: string[] = [];

  if (options.check) {
    args.push('--check');
  } else if (options.write !== false) {
    args.push('--write');
  }

  // Add common patterns
  args.push('.');

  return args;
}
