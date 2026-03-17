import type { Plugin, PluginContext, TaskRegistration } from '../types/index.js';

export const qualityPlugin: Plugin = {
  capabilities: ['shell:run'],
  name: '@kubit/plugin-quality',
  onLoad(ctx: PluginContext) {
    ctx.logger.debug('Quality plugin loaded');
  },

  registerTasks(): TaskRegistration[] {
    return [
      {
        description: 'Run ESLint',
        name: 'lint',
        run: async (ctx) => {
          const pm = ctx.config.project.packageManager;
          return await ctx.runner.run(pm, ['run', 'lint']);
        },
      },
      {
        description: 'Format code with Prettier',
        name: 'format',
        run: async (ctx) => {
          const pm = ctx.config.project.packageManager;
          return await ctx.runner.run(pm, ['run', 'format']);
        },
      },
      {
        description: 'Check code formatting',
        name: 'format:check',
        run: async (ctx) => {
          const pm = ctx.config.project.packageManager;
          return await ctx.runner.run(pm, ['run', 'format:check']);
        },
      },
      {
        description: 'Run TypeScript type checking',
        name: 'typecheck',
        run: async (ctx) => {
          const pm = ctx.config.project.packageManager;
          return await ctx.runner.run(pm, ['run', 'typecheck']);
        },
      },
      {
        description: 'Run unit tests',
        name: 'test',
        run: async (ctx) => {
          const pm = ctx.config.project.packageManager;
          return await ctx.runner.run(pm, ['run', 'test']);
        },
      },
    ];
  },

  version: '1.0.0',
};

export default qualityPlugin;
