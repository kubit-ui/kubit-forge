import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext } from '../../types/index.js';
import type { Migration, MigrationResult } from './types.js';

/**
 * Migrates ESLint configuration from legacy format to flat config
 *
 * This migration handles the transition from the legacy `.eslintrc.*` format
 * to the new flat config format (`eslint.config.js`) introduced in ESLint 9.
 *
 * @remarks
 * The flat config format is the future of ESLint configuration and provides:
 * - Better performance
 * - Simpler configuration structure
 * - Native TypeScript support
 * - More predictable behavior
 *
 * This migration creates a new flat config file with sensible defaults for
 * TypeScript and React projects. Manual review and adjustment may be needed
 * for complex configurations.
 *
 * @see https://eslint.org/docs/latest/use/configure/configuration-files-new
 */
export const eslintLegacyToFlatMigration: Migration = {
  breaking: true,
  codename: 'eslint-legacy-to-flat',
  description: 'Migrate from legacy .eslintrc to flat config',
  async execute(ctx: PluginContext): Promise<MigrationResult> {
    const result: MigrationResult = {
      changes: [],
      errors: [],
      success: true,
      warnings: [],
    };

    // Check for legacy config files
    const oldConfigs = [
      '.eslintrc',
      '.eslintrc.json',
      '.eslintrc.js',
      '.eslintrc.yml',
      '.eslintrc.yaml',
    ];

    let foundOldConfig = false;
    for (const config of oldConfigs) {
      if (existsSync(join(ctx.cwd, config))) {
        foundOldConfig = true;
        result.warnings.push(`Found legacy config: ${config}`);
      }
    }

    if (!foundOldConfig) {
      result.warnings.push('No legacy ESLint config found');
      return result;
    }

    // Create flat config with comprehensive setup
    const flatConfig = `import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

/**
 * ESLint flat configuration
 * @see https://eslint.org/docs/latest/use/configure/configuration-files-new
 */
export default [
  // Base JavaScript recommended rules
  js.configs.recommended,

  // TypeScript and React configuration
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { 
          jsx: true 
        },
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,
      
      // React recommended rules
      ...reactPlugin.configs.recommended.rules,
      
      // React Hooks rules
      ...reactHooksPlugin.configs.recommended.rules,
      
      // Custom overrides
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      '@typescript-eslint/no-explicit-any': 'warn', // Allow any but warn
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
    settings: {
      react: {
        version: 'detect', // Automatically detect React version
      },
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist',
      'build',
      'node_modules',
      '*.config.js',
      'coverage',
      '.cache',
    ],
  },
];
`;

    try {
      const newConfigPath = join(ctx.cwd, 'eslint.config.js');
      writeFileSync(newConfigPath, flatConfig);
      result.changes.push('Created eslint.config.js (flat config)');

      // Add instructions for cleanup
      result.warnings.push('Review and delete old ESLint config files manually:');
      for (const config of oldConfigs) {
        if (existsSync(join(ctx.cwd, config))) {
          result.warnings.push(`  - ${config}`);
        }
      }

      result.warnings.push('Update package.json scripts to use new config');
      result.warnings.push('Install required dependencies if missing:');
      result.warnings.push('  npm install -D @eslint/js @typescript-eslint/eslint-plugin');
      result.warnings.push(
        '  @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks'
      );
    } catch (error) {
      result.errors.push(`Failed to create flat config: ${(error as Error).message}`);
      result.success = false;
    }

    return result;
  },

  name: 'ESLint Legacy to Flat Config',
};
