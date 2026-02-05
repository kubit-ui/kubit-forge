import { config as loadEnv } from 'dotenv';
import { existsSync, readFileSync, copyFileSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext, EnvValidationResult } from '../types/index.js';

export async function envInitCommand(ctx: PluginContext): Promise<CommandResult> {
  const envExamplePath = join(ctx.cwd, ctx.config.paths?.envExample || '.env.example');
  const envLocalPath = join(ctx.cwd, ctx.config.paths?.envLocal || '.env.local');

  if (!existsSync(envExamplePath)) {
    return {
      errors: [
        {
          code: 'ENV_EXAMPLE_NOT_FOUND',
          message: '.env.example file not found',
          solution: 'Create a .env.example file with your environment variables',
        },
      ],
      message: '.env.example not found',
      status: 'error',
    };
  }

  if (existsSync(envLocalPath)) {
    ctx.logger.warn('.env.local already exists');
    return {
      message: '.env.local already exists',
      status: 'ok',
    };
  }

  try {
    copyFileSync(envExamplePath, envLocalPath);
    ctx.logger.success('.env.local created from .env.example');
    ctx.logger.info('Please update .env.local with your actual values');

    return {
      message: '.env.local created',
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to create .env.local: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error',
    };
  }
}

export async function envValidateCommand(ctx: PluginContext): Promise<CommandResult> {
  const envLocalPath = join(ctx.cwd, ctx.config.paths?.envLocal || '.env.local');

  if (!existsSync(envLocalPath)) {
    return {
      errors: [
        {
          code: 'ENV_LOCAL_NOT_FOUND',
          message: '.env.local file not found',
          solution: 'Run: kubit-forge env init',
        },
      ],
      message: '.env.local not found',
      status: 'error',
    };
  }

  // Load environment variables
  const result = loadEnv({ path: envLocalPath });

  if (result.error) {
    return {
      message: `Failed to load .env.local: ${result.error.message}`,
      status: 'error',
    };
  }

  const validation = validateEnv(ctx);

  if (!validation.valid) {
    ctx.logger.error('Environment validation failed');

    if (validation.missing.length > 0) {
      ctx.logger.error(`Missing required variables: ${validation.missing.join(', ')}`);
    }

    if (validation.invalid.length > 0) {
      ctx.logger.error(`Invalid variables: ${validation.invalid.join(', ')}`);
    }

    return {
      data: validation,
      message: 'Environment validation failed',
      status: 'error',
    };
  }

  if (validation.warnings.length > 0) {
    for (const warning of validation.warnings) {
      ctx.logger.warn(warning);
    }
  }

  ctx.logger.success('Environment validation passed');

  return {
    data: validation,
    message: 'Environment is valid',
    status: 'ok',
  };
}

export async function envPrintCommand(ctx: PluginContext): Promise<CommandResult> {
  const envLocalPath = join(ctx.cwd, ctx.config.paths?.envLocal || '.env.local');

  if (!existsSync(envLocalPath)) {
    return {
      message: '.env.local not found',
      status: 'error',
    };
  }

  const content = readFileSync(envLocalPath, 'utf-8');
  const lines = content.split('\n');

  ctx.logger.info('Environment variables:');
  ctx.logger.info('');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key] = trimmed.split('=');
      if (key) {
        // Mask values for security
        ctx.logger.info(`  ${key}=***`);
      }
    }
  }

  return {
    message: 'Environment variables printed',
    status: 'ok',
  };
}

function validateEnv(ctx: PluginContext): EnvValidationResult {
  const required = ctx.config.env?.required || [];
  const missing: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  for (const key of required) {
    const value = process.env[key];

    if (!value) {
      missing.push(key);
    } else if (value.includes('REPLACE_ME') || value.includes('YOUR_')) {
      warnings.push(`${key} appears to be a placeholder value`);
    }
  }

  return {
    invalid,
    missing,
    valid: missing.length === 0 && invalid.length === 0,
    warnings,
  };
}
