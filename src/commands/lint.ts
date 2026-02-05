import { existsSync } from 'fs';
import { join } from 'path';

import type { PluginContext, CommandResult } from '../types/index.js';

export interface LintOptions {
  fix?: boolean;
  cache?: boolean;
  quiet?: boolean;
}

/**
 * Run linter
 * Detects and runs ESLint with appropriate configuration
 */
export async function lintCommand(
  options: LintOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  // Trigger lint:before hook
  if (ctx.hookManager) {
    await ctx.hookManager.trigger('lint:before', options);
  }

  ctx.logger.step('Running linter...');

  // Check if ESLint is configured
  if (!hasESLintConfig(ctx.cwd)) {
    return {
      message: 'No ESLint configuration found. Run `kubit-forge add eslint` first.',
      status: 'error',
    };
  }

  ctx.logger.info('Using ESLint');

  // Build command args
  const args = buildLintArgs(options);

  // Execute ESLint
  const result = await ctx.runner.run('eslint', args);

  if (result.status === 'error') {
    return {
      message: 'Linting failed - please fix the errors above',
      status: 'error',
    };
  }

  ctx.logger.success('✓ No linting errors found!');

  // Trigger lint:after hook
  if (ctx.hookManager) {
    await ctx.hookManager.trigger('lint:after', result);
  }

  return {
    message: 'Linting completed',
    status: 'ok',
  };
}

function hasESLintConfig(cwd: string): boolean {
  const configFiles = [
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
    '.eslintrc.js',
    '.eslintrc.cjs',
    '.eslintrc.json',
    '.eslintrc.yml',
    '.eslintrc.yaml',
    '.eslintrc',
  ];

  return configFiles.some((file) => existsSync(join(cwd, file)));
}

function buildLintArgs(options: LintOptions): string[] {
  const args: string[] = ['.'];

  if (options.fix) {
    args.push('--fix');
  }

  if (options.cache) {
    args.push('--cache');
  }

  if (options.quiet) {
    args.push('--quiet');
  }

  // Add common patterns
  args.push('--ext', '.js,.jsx,.ts,.tsx');

  return args;
}
