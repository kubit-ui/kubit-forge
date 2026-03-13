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
 * Detects OxLint or ESLint and runs with appropriate configuration.
 * OxLint is preferred when detected (.oxlintrc.json present).
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

  const useOxlint = hasOxlintConfig(ctx.cwd);
  const useEslint = hasESLintConfig(ctx.cwd);

  if (!useOxlint && !useEslint) {
    return {
      message:
        'No linter configuration found. Run `kubit-forge add oxlint` or `kubit-forge add eslint` first.',
      status: 'error',
    };
  }

  let result: CommandResult;

  if (useOxlint) {
    ctx.logger.info('Using OxLint');
    const args = buildOxlintArgs(options, ctx.cwd);
    const runResult = await ctx.runner.run('oxlint', args);

    if (runResult.status === 'error') {
      result = { message: 'OxLint found issues - please fix the errors above', status: 'error' };
    } else {
      ctx.logger.success('✓ OxLint: no issues found');
      result = { message: 'OxLint passed', status: 'ok' };
    }

    // If ESLint is also configured, run it for rules OxLint doesn't cover
    if (useEslint && result.status === 'ok') {
      ctx.logger.info('Running ESLint for additional rules...');
      const eslintArgs = buildESLintArgs(options);
      const eslintResult = await ctx.runner.run('eslint', eslintArgs);

      if (eslintResult.status === 'error') {
        result = { message: 'ESLint found issues - please fix the errors above', status: 'error' };
      } else {
        ctx.logger.success('✓ ESLint: no issues found');
      }
    }
  } else {
    ctx.logger.info('Using ESLint');
    const args = buildESLintArgs(options);
    const runResult = await ctx.runner.run('eslint', args);

    if (runResult.status === 'error') {
      result = { message: 'Linting failed - please fix the errors above', status: 'error' };
    } else {
      ctx.logger.success('✓ No linting errors found!');
      result = { message: 'Linting completed', status: 'ok' };
    }
  }

  // Trigger lint:after hook
  if (ctx.hookManager) {
    await ctx.hookManager.trigger('lint:after', result);
  }

  return result;
}

function hasOxlintConfig(cwd: string): boolean {
  const configFiles = ['.oxlintrc.json', '.oxlintrc.jsonc'];
  return configFiles.some((file) => existsSync(join(cwd, file)));
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

function buildOxlintArgs(options: LintOptions, cwd: string): string[] {
  const args: string[] = ['src'];

  const configPath = existsSync(join(cwd, '.oxlintrc.json')) ? '.oxlintrc.json' : '.oxlintrc.jsonc';

  args.push('-c', configPath);

  if (options.fix) {
    args.push('--fix');
  }

  return args;
}

function buildESLintArgs(options: LintOptions): string[] {
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

  args.push('--ext', '.js,.jsx,.ts,.tsx');

  return args;
}
