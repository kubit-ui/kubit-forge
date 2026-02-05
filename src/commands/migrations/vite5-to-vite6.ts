import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext } from '../../types/index.js';
import type { Migration, MigrationResult } from './types.js';

/**
 * Migrates a project from Vite 5 to Vite 6
 *
 * This migration handles the breaking changes introduced in Vite 6, including:
 * - Updating package.json dependencies to Vite 6
 * - Modifying vite.config.ts for new environment API
 * - Updating deprecated configuration options
 *
 * @remarks
 * Vite 6 introduces a new environment API and deprecates some options.
 * This migration automates the basic updates but manual review is recommended.
 *
 * @see https://vitejs.dev/guide/migration.html
 */
export const vite5ToVite6Migration: Migration = {
  breaking: true,
  codename: 'vite5-to-vite6',
  description: 'Migrate from Vite 5 to Vite 6',
  async execute(ctx: PluginContext): Promise<MigrationResult> {
    const result: MigrationResult = {
      changes: [],
      errors: [],
      success: true,
      warnings: [],
    };

    // Update package.json
    const pkgPath = join(ctx.cwd, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

        if (pkg.devDependencies?.vite) {
          pkg.devDependencies.vite = '^6.0.0';
          writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
          result.changes.push('Updated vite to ^6.0.0 in package.json');
        } else {
          result.warnings.push('Vite not found in devDependencies');
        }
      } catch (error) {
        result.errors.push(`Failed to update package.json: ${(error as Error).message}`);
        result.success = false;
      }
    } else {
      result.errors.push('package.json not found');
      result.success = false;
    }

    // Update vite.config.ts
    const configPath = join(ctx.cwd, 'vite.config.ts');
    if (existsSync(configPath)) {
      try {
        let content = readFileSync(configPath, 'utf-8');

        // Vite 6 changes: environment API
        if (content.includes('process.env')) {
          result.warnings.push('Vite 6 uses new environment API. Review process.env usage.');
        }

        // Update deprecated options
        if (content.includes('optimizeDeps.include')) {
          content = content.replace(/optimizeDeps\.include/g, 'optimizeDeps.entries');
          result.changes.push('Updated optimizeDeps.include to optimizeDeps.entries');
        }

        writeFileSync(configPath, content);
        result.changes.push('Updated vite.config.ts for Vite 6');
      } catch (error) {
        result.errors.push(`Failed to update vite.config.ts: ${(error as Error).message}`);
      }
    } else {
      result.warnings.push('vite.config.ts not found');
    }

    // Add general warnings
    result.warnings.push('Run `npm install` to update dependencies');
    result.warnings.push('Review Vite 6 changelog for additional breaking changes');
    result.warnings.push('Test your application thoroughly after migration');

    return result;
  },
  fromVersion: '5.x',
  name: 'Vite 5 to Vite 6',

  toVersion: '6.x',
};
