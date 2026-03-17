import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext } from '../../types/index.js';
import type { Migration, MigrationResult } from './types.js';

/**
 * Migrates a project from CommonJS to ES Modules
 *
 * This migration updates the project configuration to use ES Modules (ESM)
 * instead of CommonJS (CJS). ESM is the standard module system for JavaScript
 * and provides better tree-shaking, static analysis, and modern tooling support.
 *
 * @remarks
 * The migration performs the following changes:
 * - Sets `"type": "module"` in package.json
 * - Updates TypeScript configuration for ESM
 * - Provides guidance on code changes needed
 *
 * Manual code changes required:
 * - Replace `require()` with `import` statements
 * - Replace `module.exports` with `export` statements
 * - Add `.js` extensions to relative imports
 * - Replace `__dirname` with `import.meta.url`
 * - Replace `__filename` with `import.meta.url`
 *
 * @see https://nodejs.org/api/esm.html
 * @see https://www.typescriptlang.org/docs/handbook/esm-node.html
 */
export const cjsToEsmMigration: Migration = {
  breaking: true,
  codename: 'cjs-to-esm',
  description: 'Migrate from CommonJS to ES Modules',
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

        if (!pkg.type || pkg.type === 'commonjs') {
          pkg.type = 'module';
          writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
          result.changes.push('Set "type": "module" in package.json');
        } else if (pkg.type === 'module') {
          result.warnings.push('Project already uses ES Modules');
        }
      } catch (error) {
        result.errors.push(`Failed to update package.json: ${(error as Error).message}`);
        result.success = false;
      }
    } else {
      result.errors.push('package.json not found');
      result.success = false;
    }

    // Update tsconfig.json
    const tsconfigPath = join(ctx.cwd, 'tsconfig.json');
    if (existsSync(tsconfigPath)) {
      try {
        const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));

        let updated = false;

        // Ensure compilerOptions exists
        if (!tsconfig.compilerOptions) {
          tsconfig.compilerOptions = {};
        }

        // Update module settings
        if (tsconfig.compilerOptions.module !== 'ESNext') {
          tsconfig.compilerOptions.module = 'ESNext';
          updated = true;
        }

        if (tsconfig.compilerOptions.moduleResolution !== 'bundler') {
          tsconfig.compilerOptions.moduleResolution = 'bundler';
          updated = true;
        }

        // Enable ESM-specific options
        if (!tsconfig.compilerOptions.esModuleInterop) {
          tsconfig.compilerOptions.esModuleInterop = true;
          updated = true;
        }

        if (updated) {
          writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
          result.changes.push('Updated tsconfig.json for ES Modules');
        }
      } catch (error) {
        result.errors.push(`Failed to update tsconfig.json: ${(error as Error).message}`);
      }
    } else {
      result.warnings.push('tsconfig.json not found');
    }

    // Add comprehensive migration warnings
    result.warnings.push('MANUAL CODE CHANGES REQUIRED:');
    result.warnings.push('');
    result.warnings.push('1. Update import statements:');
    result.warnings.push('   Before: const foo = require("./foo");');
    result.warnings.push('   After:  import foo from "./foo.js";');
    result.warnings.push('   Note: Add .js extension to relative imports!');
    result.warnings.push('');
    result.warnings.push('2. Update export statements:');
    result.warnings.push('   Before: module.exports = { foo };');
    result.warnings.push('   After:  export { foo }; or export default foo;');
    result.warnings.push('');
    result.warnings.push('3. Replace __dirname and __filename:');
    result.warnings.push('   Before: const dir = __dirname;');
    result.warnings.push('   After:  import { fileURLToPath } from "url";');
    result.warnings.push('           import { dirname } from "path";');
    result.warnings.push('           const __filename = fileURLToPath(import.meta.url);');
    result.warnings.push('           const __dirname = dirname(__filename);');
    result.warnings.push('');
    result.warnings.push('4. Update dynamic imports:');
    result.warnings.push('   Before: const mod = require(dynamicPath);');
    result.warnings.push('   After:  const mod = await import(dynamicPath);');
    result.warnings.push('');
    result.warnings.push('5. Update package.json exports if publishing:');
    result.warnings.push('   Add "exports" field for proper ESM support');
    result.warnings.push('');
    result.warnings.push('6. Update Jest/Vitest configuration:');
    result.warnings.push('   Configure for ESM if using test runners');
    result.warnings.push('');
    result.warnings.push('7. Check dependencies:');
    result.warnings.push('   Ensure all dependencies support ESM');
    result.warnings.push('   Some packages may need "default" import');

    return result;
  },

  name: 'CommonJS to ES Modules',
};
