import type { PluginContext, CommandResult } from '../types/index.js';

import { MIGRATIONS, getAllMigrations, type Migration } from './migrations/index.js';

export interface MigrateOptions {
  dryRun?: boolean;
  force?: boolean;
}

export async function migrateCommand(
  codename: string,
  options: MigrateOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const migration = MIGRATIONS[codename];

  if (!migration) {
    const available = Object.keys(MIGRATIONS).join(', ');
    return {
      message: `Unknown migration: ${codename}. Available: ${available}`,
      status: 'error',
    };
  }

  ctx.logger.step(`Migration: ${migration.name}`);
  ctx.logger.info(migration.description);

  if (migration.breaking) {
    ctx.logger.warn('⚠️  This is a BREAKING migration');
  }

  if (migration.fromVersion && migration.toVersion) {
    ctx.logger.info(`From: ${migration.fromVersion} → To: ${migration.toVersion}`);
  }

  if (options.dryRun) {
    ctx.logger.info('\n[DRY RUN] No changes will be made');
  }

  ctx.logger.info('\nExecuting migration...\n');

  try {
    const result = await migration.execute(ctx);

    if (result.changes.length > 0) {
      ctx.logger.info('Changes made:');
      for (const change of result.changes) {
        ctx.logger.success(`  ✓ ${change}`);
      }
    }

    if (result.warnings.length > 0) {
      ctx.logger.info('\nWarnings:');
      for (const warning of result.warnings) {
        ctx.logger.warn(`  ⚠ ${warning}`);
      }
    }

    if (result.errors.length > 0) {
      ctx.logger.info('\nErrors:');
      for (const error of result.errors) {
        ctx.logger.error(`  ✗ ${error}`);
      }
    }

    if (result.success) {
      ctx.logger.success(`\n✓ Migration '${codename}' completed successfully`);
      return {
        data: result,
        message: 'Migration completed',
        status: 'ok',
      };
    }
    ctx.logger.error(`\n✗ Migration '${codename}' failed`);
    return {
      data: result,
      message: 'Migration failed',
      status: 'error',
    };
  } catch (error) {
    ctx.logger.error('Migration failed with exception', error as Error);
    return {
      message: (error as Error).message,
      status: 'error',
    };
  }
}

export function listMigrations(): Migration[] {
  return getAllMigrations();
}
