import type { PluginContext } from '../../types/index.js';

/**
 * Result of a migration execution
 */
export interface MigrationResult {
  /** Whether the migration succeeded */
  success: boolean;
  /** List of changes made during migration */
  changes: string[];
  /** Warnings for manual review */
  warnings: string[];
  /** Errors encountered during migration */
  errors: string[];
}

/**
 * Migration definition
 */
export interface Migration {
  /** Human-readable name of the migration */
  name: string;
  /** Unique codename identifier */
  codename: string;
  /** Description of what the migration does */
  description: string;
  /** Source version (optional) */
  fromVersion?: string;
  /** Target version (optional) */
  toVersion?: string;
  /** Whether this is a breaking change */
  breaking: boolean;
  /** Execute the migration */
  execute: (ctx: PluginContext) => Promise<MigrationResult>;
}
