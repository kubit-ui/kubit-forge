import type { CommandResult, PluginContext, CheckResult, CheckStep } from '../types/index.js';

import { BundleAnalyzer } from '../utils/bundle-analyzer.js';
import { PerformanceAuditor } from '../utils/performance-auditor.js';

export async function checkCommand(
  ctx: PluginContext,
  options: { changed?: boolean; bundle?: boolean; performance?: boolean } = {}
): Promise<CommandResult> {
  ctx.logger.step('Running quality checks...');

  const steps: CheckStep[] = [];
  const startTime = Date.now();

  // Determine which checks to run
  const checksToRun: Array<{ name: string; enabled: boolean }> = [
    { enabled: ctx.config.quality?.format ?? true, name: 'format:check' },
    { enabled: ctx.config.quality?.lint ?? true, name: 'lint' },
    { enabled: ctx.config.quality?.typecheck ?? true, name: 'typecheck' },
    { enabled: ctx.config.quality?.unitTest ?? true, name: 'test' },
  ];

  // Run each check
  for (const check of checksToRun) {
    if (!check.enabled) {
      steps.push({
        duration: 0,
        message: 'Disabled in configuration',
        name: check.name,
        status: 'skipped',
      });
      continue;
    }

    const stepStartTime = Date.now();
    ctx.logger.step(`Running ${check.name}...`);

    try {
      const result = await runCheck(check.name, ctx, options);
      const duration = Date.now() - stepStartTime;

      steps.push({
        duration,
        errors: result.errors,
        message: result.message,
        name: check.name,
        status: result.status === 'ok' ? 'ok' : 'error',
      });

      if (result.status === 'ok') {
        ctx.logger.success(`${check.name} passed (${duration}ms)`);
      } else {
        ctx.logger.error(`${check.name} failed (${duration}ms)`);
        if (result.errors && result.errors.length > 0) {
          for (const error of result.errors) {
            ctx.logger.error(`  ${error}`);
          }
        }
      }
    } catch (_error) {
      const duration = Date.now() - stepStartTime;
      steps.push({
        duration,
        message: _error instanceof Error ? _error.message : 'Unknown error',
        name: check.name,
        status: 'error',
      });
      ctx.logger.error(`${check.name} failed (${duration}ms)`);
    }
  }

  const totalDuration = Date.now() - startTime;

  // Calculate summary
  const summary = {
    duration: totalDuration,
    failed: steps.filter((s) => s.status === 'error').length,
    passed: steps.filter((s) => s.status === 'ok').length,
    skipped: steps.filter((s) => s.status === 'skipped').length,
    total: steps.length,
  };

  const checkResult: CheckResult = {
    status: summary.failed > 0 ? 'error' : 'ok',
    steps,
    summary,
  };

  // Display summary
  ctx.logger.info('');
  ctx.logger.info('Check Summary:');
  ctx.logger.info(`  Total: ${summary.total}`);
  ctx.logger.info(`  Passed: ${summary.passed}`);
  ctx.logger.info(`  Failed: ${summary.failed}`);
  ctx.logger.info(`  Skipped: ${summary.skipped}`);
  ctx.logger.info(`  Duration: ${summary.duration}ms`);

  if (checkResult.status === 'ok') {
    ctx.logger.success('All checks passed!');
  } else {
    ctx.logger.error('Some checks failed');
  }

  // Run bundle analysis if requested
  if (options.bundle) {
    try {
      const bundleAnalyzer = new BundleAnalyzer(ctx.cwd, ctx.logger);
      const bundleAnalysis = await bundleAnalyzer.analyze();
      bundleAnalyzer.displayAnalysis(bundleAnalysis);
    } catch (error) {
      ctx.logger.warn(`Bundle analysis failed: ${(error as Error).message}`);
    }
  }

  // Run performance audit if requested
  if (options.performance) {
    try {
      const auditor = new PerformanceAuditor(ctx.cwd, ctx.logger);
      const audit = await auditor.audit();
      auditor.displayAudit(audit);
    } catch (error) {
      ctx.logger.warn(`Performance audit failed: ${(error as Error).message}`);
    }
  }

  return {
    data: checkResult,
    message: `Check completed in ${totalDuration}ms`,
    status: checkResult.status,
    timings: { check: totalDuration },
  };
}

async function runCheck(
  name: string,
  ctx: PluginContext,
  options: { changed?: boolean }
): Promise<{ status: 'ok' | 'error'; message?: string; errors?: string[] }> {
  const pm = ctx.config.project.packageManager;

  switch (name) {
    case 'format:check':
      return await runFormatCheck(ctx, pm);
    case 'lint':
      return await runLint(ctx, pm);
    case 'typecheck':
      return await runTypecheck(ctx, pm);
    case 'test':
      return await runTest(ctx, pm, options.changed);
    default:
      return { message: `Unknown check: ${name}`, status: 'error' };
  }
}

async function runFormatCheck(ctx: PluginContext, pm: string): Promise<any> {
  const result = await ctx.runner.run(pm, ['run', 'format:check'], { silent: true });
  return {
    errors: result.output ? [result.output] : undefined,
    message: result.status === 'ok' ? 'Formatting is correct' : 'Formatting issues found',
    status: result.status,
  };
}

async function runLint(ctx: PluginContext, pm: string): Promise<any> {
  const result = await ctx.runner.run(pm, ['run', 'lint'], { silent: true });
  return {
    errors: result.output ? [result.output] : undefined,
    message: result.status === 'ok' ? 'No linting errors' : 'Linting errors found',
    status: result.status,
  };
}

async function runTypecheck(ctx: PluginContext, pm: string): Promise<any> {
  const result = await ctx.runner.run(pm, ['run', 'typecheck'], { silent: true });
  return {
    errors: result.output ? [result.output] : undefined,
    message: result.status === 'ok' ? 'No type errors' : 'Type errors found',
    status: result.status,
  };
}

async function runTest(ctx: PluginContext, pm: string, changed?: boolean): Promise<any> {
  const args = ['run', 'test'];
  if (changed) {
    args.push('--changed');
  }

  const result = await ctx.runner.run(pm, args, { silent: true });
  return {
    errors: result.output ? [result.output] : undefined,
    message: result.status === 'ok' ? 'All tests passed' : 'Some tests failed',
    status: result.status,
  };
}
