/**
 * Example Plugin: Custom Provider
 *
 * Demonstrates how to create a plugin that provides custom command handlers
 */

import type { Plugin, PluginContext, CommandResult } from '../../types/index.js';

export const providerPlugin: Plugin = {
  async afterCommand(command: string, ctx: PluginContext, result: CommandResult) {
    if (command === 'build' && result.status === 'ok') {
      ctx.logger.debug('Provider Plugin: Build completed successfully');
    }
  },
  /**
   * Hook into build lifecycle
   */
  async beforeCommand(command: string, ctx: PluginContext) {
    if (command === 'build') {
      ctx.logger.debug('Provider Plugin: Preparing for build');
    }
  },
  capabilities: ['shell:run'],

  name: '@kubit/plugin-provider',

  async onLoad(ctx: PluginContext) {
    ctx.logger.debug('Provider Plugin loaded!');
  },

  /**
   * Register custom providers
   */
  registerProviders() {
    return [
      {
        canHandle: (ctx: PluginContext) => {
          // This provider handles builds for projects with a custom config
          return ctx.config.commands?.buildProvider === 'custom';
        },
        command: 'build',
        handler: async (_args: unknown, ctx: PluginContext): Promise<CommandResult> => {
          ctx.logger.step('Building with custom provider...');

          // Trigger hooks
          if (ctx.hookManager) {
            await ctx.hookManager.trigger('build:before');
          }

          try {
            // Custom build logic
            ctx.logger.info('Running custom build process');
            await new Promise((resolve) => setTimeout(resolve, 2000));

            if (ctx.hookManager) {
              await ctx.hookManager.trigger('build:after');
            }

            return {
              message: 'Build completed with custom provider',
              status: 'ok',
            };
          } catch (error) {
            if (ctx.hookManager) {
              await ctx.hookManager.trigger('build:error', error);
            }

            return {
              message: `Build failed: ${(error as Error).message}`,
              status: 'error',
            };
          }
        },
        priority: 100, // Higher priority than default
      },
      {
        canHandle: (ctx: PluginContext) => {
          // This provider handles dev server for specific stack
          return ctx.config.project.stack === 'react';
        },
        command: 'dev',
        handler: async (_args: unknown, ctx: PluginContext): Promise<CommandResult> => {
          ctx.logger.step('Starting dev server with custom provider...');

          if (ctx.hookManager) {
            await ctx.hookManager.trigger('dev:before');
          }

          try {
            ctx.logger.info('Dev server running on http://localhost:3000');

            if (ctx.hookManager) {
              await ctx.hookManager.trigger('dev:ready');
            }

            return {
              message: 'Dev server started',
              status: 'ok',
            };
          } catch (error) {
            return {
              message: `Dev server failed: ${(error as Error).message}`,
              status: 'error',
            };
          }
        },
        priority: 50,
      },
    ];
  },

  version: '1.0.0',
};

export default providerPlugin;
