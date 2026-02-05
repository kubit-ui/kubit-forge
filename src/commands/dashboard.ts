/**
 * Dashboard Command
 * Launch interactive TUI dashboard
 */

import { render } from 'ink';
import React from 'react';

import type { CommandResult, PluginContext } from '../types/index.js';

export async function dashboardCommand(ctx: PluginContext): Promise<CommandResult> {
  try {
    // Dynamic import to avoid loading React/Ink unless needed
    const { Dashboard } = await import('../dashboard/dashboard.js');

    // Render the dashboard
    const { waitUntilExit } = render(React.createElement(Dashboard, { ctx }));

    // Wait for user to exit
    await waitUntilExit();

    // Check if a template was selected
    const selectedTemplate = (global as any).__selectedTemplate;
    if (selectedTemplate) {
      // Clear the global variable
      delete (global as any).__selectedTemplate;

      // Show message and execute create command
      ctx.logger.info('');
      ctx.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      ctx.logger.success('✨ Template seleccionado correctamente!');
      ctx.logger.info('');
      ctx.logger.info(`📦 Iniciando wizard de creación con template: ${selectedTemplate}`);
      ctx.logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      ctx.logger.info('');

      // Longer delay to ensure terminal is fully ready after Ink cleanup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        // Use execa to run create command in a new process with inherited stdio
        const { execa } = await import('execa');
        const { fileURLToPath } = await import('url');
        const { dirname, join } = await import('path');

        // Get the path to the CLI
        // Since everything is bundled in dist/cli.js, we just need to find that file
        const currentFile = fileURLToPath(import.meta.url);
        const currentDir = dirname(currentFile);
        const cliPath = join(currentDir, 'cli.js');

        ctx.logger.info(`Ejecutando: node ${cliPath} create --template ${selectedTemplate}`);

        await execa('node', [cliPath, 'create', '--template', selectedTemplate], {
          cwd: ctx.cwd,
          stdio: 'inherit',
        });

        return {
          message: 'Project created successfully',
          status: 'ok',
        };
      } catch (error) {
        ctx.logger.error('Failed to run create command', error as Error);
        ctx.logger.info('');
        ctx.logger.info('Por favor, ejecuta manualmente:');
        ctx.logger.info(`  kubit create --template ${selectedTemplate}`);
        ctx.logger.info('');
        return {
          message: 'Failed to create project',
          status: 'error',
        };
      }
    }

    return {
      message: 'Dashboard closed',
      status: 'ok',
    };
  } catch (error) {
    ctx.logger.error('Failed to start dashboard', error as Error);
    ctx.logger.info('\nMake sure you have installed the required dependencies:');
    ctx.logger.info(
      '  npm install ink react ink-spinner ink-select-input ink-text-input ink-gradient ink-big-text'
    );

    return {
      message: 'Dashboard failed to start',
      status: 'error',
    };
  }
}
