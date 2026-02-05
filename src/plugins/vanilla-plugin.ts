import type { Plugin, PluginContext, CommandResult, ProviderRegistration } from '../types/index.js';

export const vanillaPlugin: Plugin = {
  capabilities: ['fs:read', 'shell:run'],
  name: '@kubit/plugin-vanilla',
  onLoad(ctx: PluginContext) {
    ctx.logger.debug('Vanilla plugin loaded');
  },

  registerProviders(): ProviderRegistration[] {
    return [
      {
        canHandle: (ctx) => ctx.config.project.stack === 'vanilla',
        command: 'dev',
        handler: async (_args, ctx): Promise<CommandResult> => {
          ctx.logger.step('Starting Vanilla development server...');

          const port = ctx.config.project.devPort || 5173;
          const result = await ctx.runner.run('vite', ['dev', '--port', String(port)], {
            env: process.env as Record<string, string>,
          });

          if (result.status === 'ok') {
            ctx.logger.success(`Development server running on http://localhost:${port}`);
          } else {
            ctx.logger.error('Failed to start development server');
          }

          return {
            message: result.message,
            status: result.status === 'skipped' ? 'ok' : result.status,
          };
        },
        priority: 90,
      },
      {
        canHandle: (ctx) => ctx.config.project.stack === 'vanilla',
        command: 'build',
        handler: async (_args, ctx): Promise<CommandResult> => {
          ctx.logger.step('Building Vanilla application for production...');

          const result = await ctx.runner.run('vite', ['build']);

          if (result.status === 'ok') {
            ctx.logger.success('Build completed successfully');
          } else {
            ctx.logger.error('Build failed');
          }

          return {
            message: result.message,
            status: result.status === 'skipped' ? 'ok' : result.status,
          };
        },
        priority: 90,
      },
      {
        canHandle: (ctx) => ctx.config.project.stack === 'vanilla',
        command: 'preview',
        handler: async (_args, ctx): Promise<CommandResult> => {
          ctx.logger.step('Starting preview server...');

          const result = await ctx.runner.run('vite', ['preview']);

          return {
            message: result.message,
            status: result.status === 'skipped' ? 'ok' : result.status,
          };
        },
        priority: 90,
      },
    ];
  },

  version: '1.0.0',
};

export default vanillaPlugin;
