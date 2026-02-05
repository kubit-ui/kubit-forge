import type { Plugin, PluginContext, CommandRegistration } from '../types/index.js';

import { envInitCommand, envValidateCommand, envPrintCommand } from '../commands/env.js';

export const envPlugin: Plugin = {
  async beforeCommand(command: string, ctx: PluginContext) {
    // Validate env before running dev/build if env is configured
    if (['dev', 'build'].includes(command) && ctx.config.env?.required) {
      const result = await envValidateCommand(ctx);
      if (result.status === 'error') {
        ctx.logger.warn('Environment validation failed, but continuing...');
      }
    }
  },
  capabilities: ['fs:read', 'fs:write', 'process:env'],
  name: '@kubit/plugin-env',

  onLoad(ctx: PluginContext) {
    ctx.logger.debug('Env plugin loaded');
  },

  registerCommands(): CommandRegistration[] {
    return [
      {
        action: async (_args, ctx) => {
          return await envInitCommand(ctx);
        },
        description: 'Initialize .env.local from .env.example',
        name: 'env:init',
      },
      {
        action: async (_args, ctx) => {
          return await envValidateCommand(ctx);
        },
        description: 'Validate environment variables',
        name: 'env:validate',
      },
      {
        action: async (_args, ctx) => {
          return await envPrintCommand(ctx);
        },
        description: 'Print environment variables (masked)',
        name: 'env:print',
      },
    ];
  },

  version: '1.0.0',
};

export default envPlugin;
