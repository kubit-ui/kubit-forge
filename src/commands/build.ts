import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext, CommandResult } from '../types/index.js';

export interface BuildOptions {
  mode?: 'production' | 'development';
  analyze?: boolean;
  sourcemap?: boolean;
}

/**
 * Build project for production
 * Detects and runs the appropriate build tool (Vite, Webpack, etc.)
 */
export async function buildCommand(
  options: BuildOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  try {
    // Trigger build:before hook
    if (ctx.hookManager) {
      await ctx.hookManager.trigger('build:before', options);
    }

    ctx.logger.step('Building project for production...');

    // Detect which build tool to use
    const buildTool = detectBuildTool(ctx.cwd);

    if (!buildTool) {
      return {
        message:
          'No build configuration found. Run `kubit-forge add vite` or `kubit-forge add webpack` first.',
        status: 'error',
      };
    }

    ctx.logger.info(`Using ${buildTool.name} for build`);

    // Build command args
    const args = buildBuildArgs(buildTool, options);

    // Execute build
    const result = await ctx.runner.run(buildTool.command, args);

    if (result.status === 'error') {
      // Trigger build:error hook
      if (ctx.hookManager) {
        await ctx.hookManager.trigger('build:error', new Error('Build failed'));
      }

      return {
        message: `Build failed with ${buildTool.name}`,
        status: 'error',
      };
    }

    ctx.logger.success('✓ Build completed successfully!');

    // Trigger build:after hook
    if (ctx.hookManager) {
      await ctx.hookManager.trigger('build:after', options, result);
    }

    return {
      message: 'Build completed',
      status: 'ok',
    };
  } catch (error) {
    // Trigger build:error hook
    if (ctx.hookManager) {
      await ctx.hookManager.trigger('build:error', error);
    }
    throw error;
  }
}

interface BuildTool {
  name: string;
  command: string;
  configFile: string;
}

function detectBuildTool(cwd: string): BuildTool | null {
  // Check for Vite
  if (existsSync(join(cwd, 'vite.config.ts')) || existsSync(join(cwd, 'vite.config.js'))) {
    return {
      command: 'vite',
      configFile: 'vite.config',
      name: 'Vite',
    };
  }

  // Check for Webpack
  if (existsSync(join(cwd, 'webpack.config.js')) || existsSync(join(cwd, 'webpack.config.ts'))) {
    return {
      command: 'webpack',
      configFile: 'webpack.config',
      name: 'Webpack',
    };
  }

  // Check for Next.js
  if (existsSync(join(cwd, 'next.config.js')) || existsSync(join(cwd, 'next.config.mjs'))) {
    return {
      command: 'next',
      configFile: 'next.config',
      name: 'Next.js',
    };
  }

  // Check for package.json scripts
  const packageJsonPath = join(cwd, 'package.json');
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    if (packageJson.scripts?.build) {
      return {
        command: 'npm',
        configFile: 'package.json',
        name: 'npm script',
      };
    }
  }

  return null;
}

function buildBuildArgs(buildTool: BuildTool, options: BuildOptions): string[] {
  const args: string[] = [];

  // Vite args
  if (buildTool.name === 'Vite') {
    args.push('build');
    if (options.mode) {
      args.push('--mode', options.mode);
    }
    if (options.sourcemap) {
      args.push('--sourcemap');
    }
    return args;
  }

  // Webpack args
  if (buildTool.name === 'Webpack') {
    if (options.mode) {
      args.push('--mode', options.mode);
    }
    if (options.analyze) {
      args.push('--analyze');
    }
    return args;
  }

  // Next.js args
  if (buildTool.name === 'Next.js') {
    args.push('build');
    return args;
  }

  // npm script
  if (buildTool.name === 'npm script') {
    args.push('run', 'build');
    return args;
  }

  return args;
}
