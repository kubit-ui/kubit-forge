/**
 * Bernova Design System commands
 * Manage Bernova CSS-in-JS in your project
 */

import { existsSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../types/index.js';

import { colors } from '../utils/theme.js';

interface BernovaOptions {
  watch?: boolean;
  foundation?: boolean;
  component?: boolean;
  validate?: boolean;
  init?: boolean;
}

/**
 * Main Bernova command handler
 */
export async function bernovaCommand(
  options: BernovaOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  // Check if Bernova is installed
  const hasBernova = await checkBernovaInstalled(ctx);

  if (!hasBernova && !options.init) {
    return {
      errors: [
        {
          code: 'BERNOVA_NOT_FOUND',
          message: 'Bernova package not found in dependencies',
          solution: 'Run: kubit-forge add bernova',
        },
      ],
      message: 'Bernova is not installed in this project',
      status: 'error',
    };
  }

  if (options.init) {
    return await initBernova(ctx);
  }

  if (options.validate) {
    return await validateBernovaConfig(ctx);
  }

  if (options.watch) {
    return await watchBernova(ctx);
  }

  if (options.foundation) {
    return await generateFoundations(ctx);
  }

  if (options.component) {
    return await generateComponents(ctx);
  }

  // Default: generate all
  return await generateAll(ctx);
}

/**
 * Check if Bernova is installed
 */
async function checkBernovaInstalled(ctx: PluginContext): Promise<boolean> {
  const packageJsonPath = join(ctx.cwd, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = await import(packageJsonPath, { assert: { type: 'json' } });
    const deps = {
      ...packageJson.default.dependencies,
      ...packageJson.default.devDependencies,
    };

    return 'bernova' in deps;
  } catch {
    return false;
  }
}

/**
 * Initialize Bernova in project
 */
async function initBernova(ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step('Initializing Bernova...');

  const configPath = join(ctx.cwd, 'bernova.config.json');

  if (existsSync(configPath)) {
    return {
      errors: [
        {
          code: 'ALREADY_INITIALIZED',
          message: 'bernova.config.json already exists',
          solution: 'Remove the existing config file or use --force',
        },
      ],
      message: 'Bernova is already initialized',
      status: 'error',
    };
  }

  // Create default config
  const { writeFileSync } = await import('fs');
  const defaultConfig = {
    fonts: {
      googleFonts: [{ family: 'Inter', weights: [400, 500, 600, 700] }],
    },
    provider: 'bernova',
    reset: true,
    themes: {
      default: {
        components: 'src/styles/theme/theme.ts',
        foundations: 'src/styles/theme/foundations.ts',
        globalStyles: 'src/styles/theme/globalStyles.ts',
        mediaQueries: 'src/styles/theme/mediaQueries.ts',
      },
    },
    tools: {
      cssClassNames: true,
      cssMediaQueries: true,
      cssVariables: true,
    },
  };

  writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  ctx.logger.success('Bernova configuration created');

  return {
    data: { configPath },
    message: 'Bernova initialized successfully',
    status: 'ok',
  };
}

/**
 * Validate Bernova configuration
 */
async function validateBernovaConfig(ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step('Validating Bernova configuration...');

  const configPath = join(ctx.cwd, 'bernova.config.json');

  if (!existsSync(configPath)) {
    return {
      errors: [
        {
          code: 'CONFIG_NOT_FOUND',
          message: 'bernova.config.json not found',
          solution: 'Run: kubit-forge bernova:init',
        },
      ],
      message: 'Bernova configuration not found',
      status: 'error',
    };
  }

  try {
    const config = await import(configPath, { assert: { type: 'json' } });
    const errors: string[] = [];

    // Validate required fields
    if (!config.default.provider) {
      errors.push('Missing required field: provider');
    }

    if (!config.default.themes) {
      errors.push('Missing required field: themes');
    }

    if (errors.length > 0) {
      return {
        errors: errors.map((e) => ({
          code: 'INVALID_CONFIG',
          message: e,
          solution: 'Check bernova.config.json',
        })),
        message: 'Invalid Bernova configuration',
        status: 'error',
      };
    }

    ctx.logger.success('Bernova configuration is valid');
    return {
      message: 'Configuration validated successfully',
      status: 'ok',
    };
  } catch (error) {
    return {
      errors: [
        {
          code: 'PARSE_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          solution: 'Check JSON syntax in bernova.config.json',
        },
      ],
      message: 'Failed to parse Bernova configuration',
      status: 'error',
    };
  }
}

/**
 * Watch mode for Bernova
 */
async function watchBernova(ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step('Starting Bernova in watch mode...');

  const { execa } = await import('execa');

  try {
    await execa('bernova', ['--watch'], {
      cwd: ctx.cwd,
      stdio: 'inherit',
    });

    return {
      message: 'Bernova watch mode started',
      status: 'ok',
    };
  } catch (error) {
    return {
      errors: [
        {
          code: 'WATCH_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          solution: 'Check Bernova installation and configuration',
        },
      ],
      message: 'Failed to start Bernova watch mode',
      status: 'error',
    };
  }
}

/**
 * Generate foundations only
 */
async function generateFoundations(ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step('Generating Bernova foundations...');

  const { execa } = await import('execa');

  try {
    await execa('bernova', ['--foundation'], {
      cwd: ctx.cwd,
      stdio: 'inherit',
    });

    ctx.logger.success('Foundations generated');
    return {
      message: 'Foundations generated successfully',
      status: 'ok',
    };
  } catch (error) {
    return {
      errors: [
        {
          code: 'GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          solution: 'Check Bernova configuration',
        },
      ],
      message: 'Failed to generate foundations',
      status: 'error',
    };
  }
}

/**
 * Generate components only
 */
async function generateComponents(ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step('Generating Bernova components...');

  const { execa } = await import('execa');

  try {
    await execa('bernova', ['--component'], {
      cwd: ctx.cwd,
      stdio: 'inherit',
    });

    ctx.logger.success('Components generated');
    return {
      message: 'Components generated successfully',
      status: 'ok',
    };
  } catch (error) {
    return {
      errors: [
        {
          code: 'GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          solution: 'Check Bernova configuration',
        },
      ],
      message: 'Failed to generate components',
      status: 'error',
    };
  }
}

/**
 * Generate all Bernova styles
 */
async function generateAll(ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step('Generating all Bernova styles...');

  const { execa } = await import('execa');

  try {
    await execa('bernova', [], {
      cwd: ctx.cwd,
      stdio: 'inherit',
    });

    ctx.logger.success('All styles generated');

    console.log('');
    console.log(colors.success('✓ Bernova styles generated successfully'));
    console.log('');
    console.log(colors.muted('Generated files:'));
    console.log(colors.muted('  • src/styles/default/foundations.css'));
    console.log(colors.muted('  • src/styles/default/globalStyles.css'));
    console.log(colors.muted('  • src/styles/default/components.css'));
    console.log('');

    return {
      message: 'All styles generated successfully',
      status: 'ok',
    };
  } catch (error) {
    return {
      errors: [
        {
          code: 'GENERATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          solution: 'Check Bernova installation and configuration',
        },
      ],
      message: 'Failed to generate styles',
      status: 'error',
    };
  }
}
