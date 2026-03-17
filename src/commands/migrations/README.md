# Migrations

This directory contains all available migrations for kubit-forge. Each migration is a self-contained module that handles a specific breaking change or major version upgrade.

## Structure

```
migrations/
├── types.ts                    # Shared types for all migrations
├── index.ts                    # Migration registry
├── vite5-to-vite6.ts          # Vite 5 → 6 migration
├── eslint-legacy-to-flat.ts   # ESLint legacy → flat config
├── react18-to-react19.ts      # React 18 → 19 migration
├── cjs-to-esm.ts              # CommonJS → ES Modules
└── jest-to-vitest.ts          # Jest → Vitest migration
```

## Adding a New Migration

1. Create a new file: `src/commands/migrations/your-migration.ts`

2. Implement the migration:

```typescript
import type { PluginContext } from '../../types/index.js';
import type { Migration, MigrationResult } from './types.js';

/**
 * Your migration description
 *
 * Detailed explanation of what this migration does,
 * what breaking changes it handles, and any manual
 * steps required.
 *
 * @remarks
 * Additional context, links to documentation, etc.
 *
 * @see https://link-to-docs
 */
export const yourMigration: Migration = {
  name: 'Human Readable Name',
  codename: 'your-migration-codename',
  description: 'Brief description',
  fromVersion: '1.x', // optional
  toVersion: '2.x', // optional
  breaking: true,

  async execute(ctx: PluginContext): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      changes: [],
      warnings: [],
      errors: [],
    };

    // Your migration logic here
    // - Update files
    // - Modify configuration
    // - Add warnings for manual steps

    return result;
  },
};
```

3. Register in `index.ts`:

```typescript
import { yourMigration } from './your-migration.js';

export const MIGRATIONS: Record<string, Migration> = {
  // ... existing migrations
  'your-migration-codename': yourMigration,
};
```

## Migration Guidelines

### Documentation

- **Always include comprehensive TSDoc comments**
- Explain what the migration does
- List breaking changes
- Provide links to official documentation
- Include examples if helpful

### Implementation

- **Be idempotent**: Running twice should be safe
- **Validate before modifying**: Check files exist
- **Handle errors gracefully**: Catch and report errors
- **Provide clear feedback**: Use changes, warnings, and errors arrays
- **Don't be destructive**: Warn before deleting, offer backups

### User Experience

- **Clear messages**: Explain what changed and why
- **Actionable warnings**: Tell users exactly what to do manually
- **Show file paths**: Help users find what needs review
- **Group related warnings**: Keep output organized
- **Success indicators**: Use ✓ for changes, ⚠ for warnings, ✗ for errors

## Example Migration Flow

```typescript
async execute(ctx: PluginContext): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    changes: [],
    warnings: [],
    errors: [],
  };

  // 1. Validate prerequisites
  const pkgPath = join(ctx.cwd, 'package.json');
  if (!existsSync(pkgPath)) {
    result.errors.push('package.json not found');
    result.success = false;
    return result;
  }

  // 2. Make changes
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    // Update dependencies
    if (pkg.dependencies?.['old-package']) {
      pkg.dependencies['new-package'] = '^2.0.0';
      delete pkg.dependencies['old-package'];

      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      result.changes.push('Updated package.json dependencies');
    }
  } catch (error) {
    result.errors.push(`Failed to update: ${(error as Error).message}`);
    result.success = false;
  }

  // 3. Add manual step warnings
  result.warnings.push('Run `npm install` to update dependencies');
  result.warnings.push('Review breaking changes in CHANGELOG');
  result.warnings.push('Update imports in your code');

  return result;
}
```

## Testing Migrations

Before committing a migration:

1. **Test on a real project**
2. **Test with --dry-run**
3. **Test error cases** (missing files, invalid config, etc.)
4. **Verify warnings are helpful**
5. **Check idempotency** (run twice)

## Available Migrations

### vite5-to-vite6

Migrates from Vite 5 to Vite 6, handling new environment API and deprecated options.

### eslint-legacy-to-flat

Converts legacy `.eslintrc.*` to new flat config format (`eslint.config.js`).

### react18-to-react19

Updates React dependencies and provides guidance on breaking changes in React 19.

### cjs-to-esm

Migrates from CommonJS to ES Modules, updating package.json and tsconfig.json.

### jest-to-vitest

Replaces Jest with Vitest, including dependencies, config, and scripts.

## Best Practices

✅ **DO**:

- Write comprehensive documentation
- Handle edge cases
- Provide clear, actionable warnings
- Test thoroughly
- Be idempotent
- Show what changed

❌ **DON'T**:

- Make silent changes
- Delete files without warning
- Assume file structure
- Skip error handling
- Write vague warnings
- Break on second run

## Questions?

See the main [PHASE2.md](../../../PHASE2.md) documentation for more context on migrations.
