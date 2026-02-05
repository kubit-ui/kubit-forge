import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext, CommandResult } from '../types/index.js';

export interface DevOptions {
  port?: number;
  host?: string;
  open?: boolean;
}

/**
 * Start development server
 * Detects and runs the appropriate dev server (Vite, Webpack, etc.)
 */
export async function devCommand(options: DevOptions, ctx: PluginContext): Promise<CommandResult> {
  // Trigger dev:before hook
  if (ctx.hookManager) {
    await ctx.hookManager.trigger('dev:before', options);
  }

  ctx.logger.step('Starting development server...');

  // Detect which dev server to use
  const devServer = detectDevServer(ctx.cwd);

  if (!devServer) {
    return {
      message:
        'No dev server configuration found. Run `kubit-forge add vite` or `kubit-forge add webpack` first.',
      status: 'error',
    };
  }

  ctx.logger.info(`Using ${devServer.name} dev server`);

  // Build command args
  const args = buildDevArgs(devServer, options);

  // Execute dev server
  const result = await ctx.runner.run(devServer.command, args);

  if (result.status === 'error') {
    return {
      message: `Failed to start ${devServer.name} dev server`,
      status: 'error',
    };
  }

  // Trigger dev:ready hook
  const url = `http://${options.host || 'localhost'}:${options.port || ctx.config.project.devPort}`;
  if (ctx.hookManager) {
    await ctx.hookManager.trigger('dev:ready', url);
  }

  // Trigger dev:after hook
  if (ctx.hookManager) {
    await ctx.hookManager.trigger('dev:after', options, result);
  }

  return {
    message: 'Dev server started successfully',
    status: 'ok',
  };
}

interface DevServer {
  name: string;
  command: string;
  configFile: string;
}

function detectDevServer(cwd: string): DevServer | null {
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
      command: 'webpack-dev-server',
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
    if (packageJson.scripts?.dev) {
      return {
        command: 'npm',
        configFile: 'package.json',
        name: 'npm script',
      };
    }
  }

  return null;
}

function buildDevArgs(devServer: DevServer, options: DevOptions): string[] {
  const args: string[] = [];

  // Vite args
  if (devServer.name === 'Vite') {
    if (options.port) {
      args.push('--port', options.port.toString());
    }
    if (options.host) {
      args.push('--host', options.host);
    }
    if (options.open) {
      args.push('--open');
    }
    return args;
  }

  // Webpack args
  if (devServer.name === 'Webpack') {
    if (options.port) {
      args.push('--port', options.port.toString());
    }
    if (options.host) {
      args.push('--host', options.host);
    }
    if (options.open) {
      args.push('--open');
    }
    return args;
  }

  // Next.js args
  if (devServer.name === 'Next.js') {
    args.push('dev');
    if (options.port) {
      args.push('-p', options.port.toString());
    }
    return args;
  }

  // npm script
  if (devServer.name === 'npm script') {
    args.push('run', 'dev');
    return args;
  }

  return args;
}
