/**
 * Example Plugin: Hello World
 *
 * A simple plugin that demonstrates basic plugin structure
 */

import type { Plugin, PluginContext, CommandResult } from '../../types/index.js';

export const helloPlugin: Plugin = {
  /**
   * Hook: After any command
   */
  async afterCommand(command: string, ctx: PluginContext, result: CommandResult) {
    ctx.logger.debug(`Hello Plugin: Command '${command}' finished with status: ${result.status}`);
  },
  /**
   * Hook: Before any command
   */
  async beforeCommand(command: string, ctx: PluginContext) {
    ctx.logger.debug(`Hello Plugin: About to run command '${command}'`);
  },
  capabilities: ['fs:read'],

  name: '@kubit/plugin-hello',

  /**
   * Called when plugin is loaded
   */
  async onLoad(ctx: PluginContext) {
    ctx.logger.debug('Hello Plugin loaded!');

    // Register a hook
    if (ctx.hookManager) {
      ctx.hookManager.register(
        'build:before',
        async () => {
          ctx.logger.info('👋 Hello from Hello Plugin!');
        },
        10, // priority
        '@kubit/plugin-hello'
      );
    }
  },

  /**
   * Register custom commands
   */
  registerCommands() {
    return [
      {
        action: async (args: { name: string }, ctx: PluginContext): Promise<CommandResult> => {
          ctx.logger.info(`👋 Hello, ${args.name}!`);
          ctx.logger.info('This message comes from the Hello Plugin');

          return {
            message: `Greeted ${args.name}`,
            status: 'ok',
          };
        },
        description: 'Say hello from the plugin',
        name: 'hello',
        options: [
          {
            defaultValue: 'World',
            description: 'Name to greet',
            flags: '-n, --name <name>',
          },
        ],
      },
    ];
  },

  /**
   * Register custom tasks
   */
  registerTasks() {
    return [
      {
        description: 'A sample task from hello plugin',
        name: 'hello:task',
        run: async (ctx: PluginContext) => {
          ctx.logger.step('Running hello task...');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          ctx.logger.success('Hello task completed!');

          return {
            duration: 1000,
            message: 'Task completed',
            status: 'ok',
          };
        },
      },
    ];
  },

  version: '1.0.0',
};

export default helloPlugin;
