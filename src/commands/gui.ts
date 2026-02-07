import { exec } from 'child_process';

import type { CommandResult, PluginContext } from '../types/index.js';

import { GuiServer } from '../gui/server.js';

/**
 * gui - Launch GUI web interface
 */
export async function guiCommand(
  ctx: PluginContext,
  options: { port?: number; host?: string; noOpen?: boolean } = {}
): Promise<CommandResult> {
  ctx.logger.step('🎨 Starting Kubit Forge GUI...');

  try {
    const server = new GuiServer({
      config: ctx.config,
      cwd: ctx.cwd,
      host: options.host,
      logger: ctx.logger,
      open: !options.noOpen,
      port: options.port,
    });

    const url = await server.start();

    // Open browser automatically unless --no-open is specified
    if (!options.noOpen) {
      ctx.logger.step('🌐 Opening browser...');
      await openBrowser(url);
    }

    ctx.logger.info('');
    ctx.logger.info('💡 Tips:');
    ctx.logger.info('  • Use the Overview tab to see project information');
    ctx.logger.info('  • Use the Commands tab to execute common commands');
    ctx.logger.info('  • Use the Configuration tab to edit kubit.config.toml visually');
    ctx.logger.info('');
    ctx.logger.info('Press Ctrl+C to stop the server');
    ctx.logger.info('');

    // Keep the process alive
    return new Promise((resolve) => {
      process.on('SIGINT', async () => {
        ctx.logger.info('\n\n👋 Stopping GUI server...');
        await server.stop();
        resolve({ status: 'ok' });
        process.exit(0);
      });
    });
  } catch (error) {
    ctx.logger.error('Failed to start GUI server', error as Error);
    return {
      errors: [{ code: 'GUI_START_FAILED', message: (error as Error).message }],
      status: 'error',
    };
  }
}

/**
 * visual:config - Open visual configuration editor
 */
export async function visualConfigCommand(
  ctx: PluginContext,
  options: { port?: number; host?: string; noOpen?: boolean } = {}
): Promise<CommandResult> {
  ctx.logger.step('⚙️ Opening Visual Configuration Editor...');

  try {
    const server = new GuiServer({
      config: ctx.config,
      cwd: ctx.cwd,
      host: options.host,
      logger: ctx.logger,
      open: !options.noOpen,
      port: options.port,
    });

    const url = await server.start();
    const configUrl = `${url}#config`; // Direct link to config tab

    // Open browser automatically unless --no-open is specified
    if (!options.noOpen) {
      ctx.logger.step('🌐 Opening configuration editor...');
      await openBrowser(configUrl);
    }

    ctx.logger.info('');
    ctx.logger.info('💡 Configuration Editor:');
    ctx.logger.info('  • Edit project settings visually');
    ctx.logger.info('  • Toggle quality features');
    ctx.logger.info('  • Changes are saved to kubit.config.toml');
    ctx.logger.info('');
    ctx.logger.info('Press Ctrl+C to stop the server');
    ctx.logger.info('');

    // Keep the process alive
    return new Promise((resolve) => {
      process.on('SIGINT', async () => {
        ctx.logger.info('\n\n👋 Stopping configuration editor...');
        await server.stop();
        resolve({ status: 'ok' });
        process.exit(0);
      });
    });
  } catch (error) {
    ctx.logger.error('Failed to start configuration editor', error as Error);
    return {
      errors: [{ code: 'CONFIG_EDITOR_FAILED', message: (error as Error).message }],
      status: 'error',
    };
  }
}

/**
 * Open URL in default browser
 */
async function openBrowser(url: string): Promise<void> {
  const platform = process.platform;
  let command: string;

  switch (platform) {
    case 'darwin': // macOS
      command = `open "${url}"`;
      break;
    case 'win32': // Windows
      command = `start "${url}"`;
      break;
    default: // Linux and others
      command = `xdg-open "${url}"`;
      break;
  }

  return new Promise((resolve) => {
    exec(command, (error) => {
      if (error) {
        // Don't fail if browser can't be opened, user can open manually
        resolve();
      } else {
        setTimeout(resolve, 1000); // Wait a bit for browser to open
      }
    });
  });
}
