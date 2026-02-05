import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext } from '../../types/index.js';
import type { Migration, MigrationResult } from './types.js';

/**
 * Migrates a project from React 18 to React 19
 *
 * This migration updates React dependencies and provides guidance on
 * breaking changes and deprecated APIs in React 19.
 *
 * @remarks
 * React 19 introduces several breaking changes including:
 * - Removal of legacy context API
 * - Changes to concurrent features
 * - Updated lifecycle methods
 * - New JSX transform requirements
 *
 * This migration handles dependency updates and provides warnings for
 * manual code changes that may be required.
 *
 * @see https://react.dev/blog/2024/04/25/react-19
 */
export const react18ToReact19Migration: Migration = {
  breaking: true,
  codename: 'react18-to-react19',
  description: 'Migrate from React 18 to React 19',
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

      // Update React dependencies
      if (pkg.dependencies?.react) {
        pkg.dependencies.react = '^19.0.0';
        pkg.dependencies['react-dom'] = '^19.0.0';
        updated = true;
        result.changes.push('Updated react and react-dom to ^19.0.0');
      }

      // Update TypeScript types
      if (pkg.devDependencies?.['@types/react']) {
        pkg.devDependencies['@types/react'] = '^19.0.0';
        pkg.devDependencies['@types/react-dom'] = '^19.0.0';
        updated = true;
        result.changes.push('Updated @types/react and @types/react-dom to ^19.0.0');
      }

      if (updated) {
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      } else {
        result.warnings.push('React not found in dependencies');
      }
    } catch (error) {
      result.errors.push(`Failed to update package.json: ${(error as Error).message}`);
      result.success = false;
      return result;
    }

    // Add breaking change warnings
    result.warnings.push('BREAKING CHANGES in React 19:');
    result.warnings.push('');
    result.warnings.push('1. Legacy Context API removed:');
    result.warnings.push('   - Replace contextTypes with Context.Provider/Consumer');
    result.warnings.push('   - Use useContext hook instead');
    result.warnings.push('');
    result.warnings.push('2. Deprecated lifecycle methods removed:');
    result.warnings.push('   - componentWillMount → useEffect');
    result.warnings.push('   - componentWillReceiveProps → getDerivedStateFromProps');
    result.warnings.push('   - componentWillUpdate → getSnapshotBeforeUpdate');
    result.warnings.push('');
    result.warnings.push('3. String refs deprecated:');
    result.warnings.push('   - Replace string refs with callback refs or useRef');
    result.warnings.push('');
    result.warnings.push('4. Update third-party libraries:');
    result.warnings.push('   - Ensure all React libraries support React 19');
    result.warnings.push('   - Check react-router, redux, etc. compatibility');
    result.warnings.push('');
    result.warnings.push('5. Run tests thoroughly after migration');
    result.warnings.push('');
    result.warnings.push('Run `npm install` to update dependencies');

    return result;
  },
  fromVersion: '18.x',
  name: 'React 18 to React 19',

  toVersion: '19.x',
};
