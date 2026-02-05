import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext } from '../../types/index.js';
import type { Migration, MigrationResult } from './types.js';

/**
 * Migrates a project from Jest to Vitest
 *
 * This migration replaces Jest with Vitest, a faster and more modern test runner
 * built on top of Vite. Vitest provides:
 * - Native ESM support
 * - Faster execution with Vite's transformation
 * - Compatible API with Jest
 * - Better TypeScript support
 * - Built-in watch mode
 *
 * @remarks
 * The migration performs the following:
 * - Removes Jest dependencies
 * - Adds Vitest dependencies
 * - Creates vitest.config.ts
 * - Updates package.json scripts
 *
 * Manual code changes may be needed:
 * - Replace `jest.mock()` with `vi.mock()`
 * - Replace `jest.fn()` with `vi.fn()`
 * - Update test setup files
 * - Review Jest-specific matchers
 *
 * @see https://vitest.dev/guide/migration.html
 */
export const jestToVitestMigration: Migration = {
  breaking: true,
  codename: 'jest-to-vitest',
  description: 'Migrate from Jest to Vitest',
  async execute(ctx: PluginContext): Promise<MigrationResult> {
    const result: MigrationResult = {
      changes: [],
      errors: [],
      success: true,
      warnings: [],
    };

    // Update package.json
    const pkgPath = join(ctx.cwd, 'package.json');
    if (!existsSync(pkgPath)) {
      result.errors.push('package.json not found');
      result.success = false;
      return result;
    }

    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      let updated = false;

      // Remove Jest dependencies
      const jestDeps = [
        'jest',
        '@types/jest',
        'ts-jest',
        'jest-environment-jsdom',
        '@testing-library/jest-dom',
      ];

      for (const dep of jestDeps) {
        if (pkg.devDependencies?.[dep]) {
          delete pkg.devDependencies[dep];
          updated = true;
        }
      }

      if (updated) {
        result.changes.push('Removed Jest dependencies');
      }

      // Add Vitest dependencies
      if (!pkg.devDependencies) {
        pkg.devDependencies = {};
      }

      pkg.devDependencies.vitest = '^1.2.0';
      pkg.devDependencies['@vitest/ui'] = '^1.2.0';
      pkg.devDependencies['jsdom'] = '^23.0.0';
      result.changes.push('Added Vitest dependencies');

      // Update scripts
      if (pkg.scripts) {
        if (pkg.scripts.test) {
          pkg.scripts.test = pkg.scripts.test.replace(/jest/g, 'vitest run');
          result.changes.push('Updated test script');
        }

        if (pkg.scripts['test:watch']) {
          pkg.scripts['test:watch'] = 'vitest';
          result.changes.push('Updated test:watch script');
        } else {
          pkg.scripts['test:watch'] = 'vitest';
          result.changes.push('Added test:watch script');
        }

        if (pkg.scripts['test:ui']) {
          pkg.scripts['test:ui'] = 'vitest --ui';
        } else {
          pkg.scripts['test:ui'] = 'vitest --ui';
          result.changes.push('Added test:ui script');
        }

        if (pkg.scripts['test:coverage']) {
          pkg.scripts['test:coverage'] = 'vitest run --coverage';
          result.changes.push('Updated test:coverage script');
        }
      }

      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      result.changes.push('Updated package.json scripts');
    } catch (error) {
      result.errors.push(`Failed to update package.json: ${(error as Error).message}`);
      result.success = false;
      return result;
    }

    // Create vitest.config.ts
    const vitestConfig = `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vitest configuration
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  test: {
    // Enable global test APIs (describe, it, expect, etc.)
    globals: true,
    
    // Test environment (jsdom for browser-like environment)
    environment: 'jsdom',
    
    // Setup files to run before tests
    setupFiles: './src/test/setup.ts',
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
        '**/*.test.{ts,tsx}',
      ],
    },
    
    // Include patterns
    include: ['**/*.{test,spec}.{ts,tsx}'],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],
  },
});
`;

    try {
      const configPath = join(ctx.cwd, 'vitest.config.ts');
      writeFileSync(configPath, vitestConfig);
      result.changes.push('Created vitest.config.ts');
    } catch (error) {
      result.errors.push(`Failed to create vitest.config.ts: ${(error as Error).message}`);
    }

    // Add migration warnings
    result.warnings.push('MANUAL CODE CHANGES REQUIRED:');
    result.warnings.push('');
    result.warnings.push('1. Update test imports:');
    result.warnings.push('   Before: import { jest } from "@jest/globals";');
    result.warnings.push('   After:  import { vi } from "vitest";');
    result.warnings.push('');
    result.warnings.push('2. Replace Jest mocking:');
    result.warnings.push('   Before: jest.mock("./module");');
    result.warnings.push('   After:  vi.mock("./module");');
    result.warnings.push('');
    result.warnings.push('3. Replace Jest functions:');
    result.warnings.push('   Before: jest.fn(), jest.spyOn()');
    result.warnings.push('   After:  vi.fn(), vi.spyOn()');
    result.warnings.push('');
    result.warnings.push('4. Update test setup:');
    result.warnings.push('   - Create src/test/setup.ts if needed');
    result.warnings.push('   - Move setupFilesAfterEnv content to setup.ts');
    result.warnings.push('');
    result.warnings.push('5. Remove Jest config files:');
    result.warnings.push('   - Delete jest.config.js/ts');
    result.warnings.push('   - Remove jest section from package.json');
    result.warnings.push('');
    result.warnings.push('6. Update CI/CD:');
    result.warnings.push('   - Replace jest commands with vitest');
    result.warnings.push('   - Update coverage reporting if needed');
    result.warnings.push('');
    result.warnings.push('7. Install dependencies:');
    result.warnings.push('   Run: npm install');
    result.warnings.push('');
    result.warnings.push('8. Run tests to verify:');
    result.warnings.push('   Run: npm test');

    return result;
  },

  name: 'Jest to Vitest',
};
