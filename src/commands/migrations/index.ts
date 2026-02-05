/**
 * Migration registry
 *
 * This module exports all available migrations for the kubit-forge.
 * Each migration is a self-contained module that handles a specific
 * breaking change or major version upgrade.
 *
 * @module migrations
 */

import type { Migration } from './types.js';

import { cjsToEsmMigration } from './cjs-to-esm.js';
import { eslintLegacyToFlatMigration } from './eslint-legacy-to-flat.js';
import { jestToVitestMigration } from './jest-to-vitest.js';
import { react18ToReact19Migration } from './react18-to-react19.js';
import { vite5ToVite6Migration } from './vite5-to-vite6.js';

/**
 * Registry of all available migrations
 *
 * Migrations are indexed by their codename for easy lookup.
 * Each migration is a complete, self-contained transformation
 * that can be executed independently.
 *
 * @example
 * ```typescript
 * const migration = MIGRATIONS['vite5-to-vite6'];
 * const result = await migration.execute(ctx);
 * ```
 */
export const MIGRATIONS: Record<string, Migration> = {
  'cjs-to-esm': cjsToEsmMigration,
  'eslint-legacy-to-flat': eslintLegacyToFlatMigration,
  'jest-to-vitest': jestToVitestMigration,
  'react18-to-react19': react18ToReact19Migration,
  'vite5-to-vite6': vite5ToVite6Migration,
};

/**
 * Get all available migrations
 *
 * @returns Array of all registered migrations
 */
export function getAllMigrations(): Migration[] {
  return Object.values(MIGRATIONS);
}

/**
 * Get a migration by its codename
 *
 * @param codename - The unique identifier for the migration
 * @returns The migration if found, undefined otherwise
 */
export function getMigration(codename: string): Migration | undefined {
  return MIGRATIONS[codename];
}

/**
 * Get all migration codenames
 *
 * @returns Array of all migration codenames
 */
export function getMigrationCodenames(): string[] {
  return Object.keys(MIGRATIONS);
}

/**
 * Check if a migration exists
 *
 * @param codename - The codename to check
 * @returns True if the migration exists
 */
export function hasMigration(codename: string): boolean {
  return codename in MIGRATIONS;
}

// Re-export types for convenience
export type { Migration, MigrationResult } from './types.js';
