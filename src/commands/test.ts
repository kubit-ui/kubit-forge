import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext, CommandResult } from '../types/index.js';

export interface TestOptions {
  watch?: boolean;
  coverage?: boolean;
  ui?: boolean;
  run?: boolean;
}

/**
 * Run tests
 * Detects and runs the appropriate test runner (Jest, Vitest, etc.)
 */
export async function testCommand(
  options: TestOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  try {
    // Trigger test:before hook
    if (ctx.hookManager) {
      await ctx.hookManager.trigger('test:before', options);
    }

    ctx.logger.step('Running tests...');

    // Detect which test runner to use
    const testRunner = detectTestRunner(ctx.cwd);

    if (!testRunner) {
      return {
        message:
          'No test configuration found. Run `kubit-forge add jest` or `kubit-forge add vitest` first.',
        status: 'error',
      };
    }

    ctx.logger.info(`Using ${testRunner.name} test runner`);

    // Build command args
    const args = buildTestArgs(testRunner, options);

    // Execute tests
    const result = await ctx.runner.run(testRunner.command, args);

    if (result.status === 'error') {
      // Trigger test:error hook
      if (ctx.hookManager) {
        await ctx.hookManager.trigger('test:error', new Error('Tests failed'));
      }

      return {
        message: `Tests failed with ${testRunner.name}`,
        status: 'error',
      };
    }

    ctx.logger.success('✓ All tests passed!');

    // Trigger test:after hook
    if (ctx.hookManager) {
      await ctx.hookManager.trigger('test:after', result);
    }

    return {
      message: 'Tests completed',
      status: 'ok',
    };
  } catch (error) {
    // Trigger test:error hook
    if (ctx.hookManager) {
      await ctx.hookManager.trigger('test:error', error);
    }
    throw error;
  }
}

interface TestRunner {
  name: string;
  command: string;
  configFile: string;
}

function detectTestRunner(cwd: string): TestRunner | null {
  // Check for Vitest
  if (existsSync(join(cwd, 'vitest.config.ts')) || existsSync(join(cwd, 'vitest.config.js'))) {
    return {
      command: 'vitest',
      configFile: 'vitest.config',
      name: 'Vitest',
    };
  }

  // Check for Jest
  if (
    existsSync(join(cwd, 'jest.config.ts')) ||
    existsSync(join(cwd, 'jest.config.js')) ||
    existsSync(join(cwd, 'jest.config.json'))
  ) {
    return {
      command: 'jest',
      configFile: 'jest.config',
      name: 'Jest',
    };
  }

  // Check for Playwright
  if (
    existsSync(join(cwd, 'playwright.config.ts')) ||
    existsSync(join(cwd, 'playwright.config.js'))
  ) {
    return {
      command: 'playwright',
      configFile: 'playwright.config',
      name: 'Playwright',
    };
  }

  // Check for Cypress
  if (existsSync(join(cwd, 'cypress.config.ts')) || existsSync(join(cwd, 'cypress.config.js'))) {
    return {
      command: 'cypress',
      configFile: 'cypress.config',
      name: 'Cypress',
    };
  }

  // Check for package.json scripts
  const packageJsonPath = join(cwd, 'package.json');
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    if (packageJson.scripts?.test) {
      return {
        command: 'npm',
        configFile: 'package.json',
        name: 'npm script',
      };
    }
  }

  return null;
}

function buildTestArgs(testRunner: TestRunner, options: TestOptions): string[] {
  const args: string[] = [];

  // Vitest args
  if (testRunner.name === 'Vitest') {
    if (options.watch) {
      args.push('--watch');
    }
    if (options.coverage) {
      args.push('--coverage');
    }
    if (options.ui) {
      args.push('--ui');
    }
    if (options.run) {
      args.push('run');
    }
    return args;
  }

  // Jest args
  if (testRunner.name === 'Jest') {
    if (options.watch) {
      args.push('--watch');
    }
    if (options.coverage) {
      args.push('--coverage');
    }
    return args;
  }

  // Playwright args
  if (testRunner.name === 'Playwright') {
    args.push('test');
    if (options.ui) {
      args.push('--ui');
    }
    return args;
  }

  // Cypress args
  if (testRunner.name === 'Cypress') {
    if (options.run) {
      args.push('run');
    } else {
      args.push('open');
    }
    return args;
  }

  // npm script
  if (testRunner.name === 'npm script') {
    args.push('run', 'test');
    return args;
  }

  return args;
}
