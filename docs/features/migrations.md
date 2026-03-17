# Migrations & Upgrades

## Overview

Kubit Forge provides safe, automated migration and upgrade tools to keep your project up-to-date with the latest dependencies, frameworks, and best practices while minimizing breaking changes.

## Quick Start

```bash
# Check for available upgrades
kubit-forge upgrade:check

# Upgrade dependencies
kubit-forge upgrade

# Run migration
kubit-forge migrate <migration-name>

# List available migrations
kubit-forge migrate:list
```

## Dependency Upgrades

### Check for Updates

```bash
# Check all dependencies
kubit-forge upgrade:check

# Check production only
kubit-forge upgrade:check --prod

# Check dev dependencies
kubit-forge upgrade:check --dev

# Show breaking changes
kubit-forge upgrade:check --breaking
```

**Example Output:**

```
Available Updates


Major (Breaking Changes):
  react: 17.0.2  18.2.0
     Breaking: Automatic batching changes
     Breaking: Strict mode improvements
     Guide: https://react.dev/blog/2022/03/08/react-18-upgrade-guide

  webpack: 4.46.0  5.89.0
     Breaking: Module federation changes
     Breaking: Node polyfills removed
     Guide: https://webpack.js.org/migrate/5/

Minor (New Features):
  typescript: 5.0.4  5.3.3
     New: Decorator metadata
     New: const type parameters

  eslint: 8.50.0  8.56.0
     New: Flat config support

Patch (Bug Fixes):
  axios: 1.5.0  1.6.7
     Fix: Security vulnerability CVE-2023-45857

  lodash: 4.17.20  4.17.21
     Fix: Prototype pollution

Total updates: 47 (12 major, 18 minor, 17 patch)
```

### Upgrade Dependencies

```bash
# Interactive upgrade
kubit-forge upgrade --interactive

# Upgrade all
kubit-forge upgrade --all

# Upgrade to latest
kubit-forge upgrade --latest

# Upgrade specific package
kubit-forge upgrade react

# Upgrade to specific version
kubit-forge upgrade react@18.2.0

# Dry run
kubit-forge upgrade --dry-run
```

### Safe Upgrade Mode

Upgrade with automatic rollback on test failure.

```bash
# Safe upgrade with tests
kubit-forge upgrade --safe

# With specific test command
kubit-forge upgrade --safe --test "npm run test"

# Rollback on failure
kubit-forge upgrade --safe --rollback
```

**Process:**

1. Create backup/snapshot
2. Upgrade dependencies
3. Run tests
4. If tests fail  rollback
5. If tests pass  commit changes

### Breaking Change Detection

```bash
# Detect breaking changes
kubit-forge upgrade:breaking

# Show impact analysis
kubit-forge upgrade:breaking --impact

# Show migration path
kubit-forge upgrade:breaking --guide
```

**Example Output:**

```
Breaking Change Analysis: react 1718


Impact: HIGH
Affected files: 23
Migration required: YES

Breaking Changes:
1. Automatic Batching
   - All state updates are batched
   - May affect timing-dependent code
   - Action: Review event handlers

2. ReactDOM.render deprecated
   - Use createRoot() instead
   - Code locations found: 3 files
   - Action: Run migration 'react-18-root-api'

3. IE Support Dropped
   - No longer supports Internet Explorer
   - Action: Update browserslist

Migration Steps:
1. kubit-forge migrate react-18-root-api
2. kubit-forge migrate react-18-types
3. Update tests for new behavior
4. Review changelog: https://react.dev/blog/...

Estimated effort: 2-4 hours
```

## Migrations

### List Migrations

```bash
# List all migrations
kubit-forge migrate:list

# Filter by status
kubit-forge migrate:list --status pending

# Filter by category
kubit-forge migrate:list --category framework

# Show details
kubit-forge migrate:list --detailed
```

**Example Output:**

```
Available Migrations


Framework Updates:
   react-18-root-api       Migrate to React 18 root API
   react-18-types          Update React 18 TypeScript types
   nextjs-13-app-router    Migrate to Next.js App Router
   vite-5-migration        Upgrade to Vite 5

Configuration:
   eslint-flat-config      Migrate to ESLint flat config
   typescript-5-config     Update TypeScript 5 config

Deprecations:
   remove-moment           Replace moment.js with date-fns
   remove-lodash           Replace lodash with native methods

Custom:
   company-auth-v2         Migrate to company auth v2

Legend:  Completed |  Pending |  Failed
```

### Run Migration

```bash
# Run specific migration
kubit-forge migrate react-18-root-api

# Run all pending
kubit-forge migrate --all

# Dry run
kubit-forge migrate react-18-root-api --dry-run

# Interactive mode
kubit-forge migrate react-18-root-api --interactive

# Skip backups
kubit-forge migrate react-18-root-api --no-backup
```

**Migration Process:**

```
Running migration: react-18-root-api


1. Creating backup...                              
2. Analyzing codebase...                           
   Found 3 files to migrate

3. Applying transformations...
    src/index.tsx - Updated ReactDOM.render
    src/App.test.tsx - Updated test setup
    src/utils/render.tsx - Updated test utility

4. Updating dependencies...                        
   Updated: react@18.2.0, react-dom@18.2.0

5. Running tests...                                
   All tests passed (23/23)

6. Updating documentation...                       

Migration completed successfully!

Next steps:
  • Review changes: git diff
  • Update environment: npm install
  • Test thoroughly
  • Commit changes: git commit -am "Migrate to React 18"
```

### Rollback Migration

```bash
# Rollback last migration
kubit-forge migrate:rollback

# Rollback specific migration
kubit-forge migrate:rollback react-18-root-api

# Rollback to specific point
kubit-forge migrate:rollback --to migration-id

# Force rollback
kubit-forge migrate:rollback --force
```

### Migration Status

```bash
# Show migration status
kubit-forge migrate:status

# Show migration history
kubit-forge migrate:history

# Show failed migrations
kubit-forge migrate:failed
```

## Code Transformations

### Automated Refactoring

```bash
# Run codemod
kubit-forge codemod <transform>

# List available codemods
kubit-forge codemod:list

# Custom codemod
kubit-forge codemod --file ./my-transform.ts
```

### Built-in Codemods

#### React Class to Function Components

```bash
kubit-forge codemod react-class-to-function
```

**Before:**

```typescript
class Button extends React.Component<Props> {
  render() {
    return <button>{this.props.children}</button>;
  }
}
```

**After:**

```typescript
const Button: React.FC<Props> = ({ children }) => {
  return <button>{children}</button>;
};
```

#### PropTypes to TypeScript

```bash
kubit-forge codemod proptypes-to-typescript
```

**Before:**

```javascript
import PropTypes from 'prop-types';

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
```

**After:**

```typescript
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
}
```

#### CommonJS to ESM

```bash
kubit-forge codemod cjs-to-esm
```

**Before:**

```javascript
const React = require('react');
module.exports = Button;
```

**After:**

```javascript
import React from 'react';
export default Button;
```

### Custom Transformations

Create custom transformations using AST manipulation:

```typescript
// .kubit/transforms/my-transform.ts
import { Transform } from 'kubit-forge';

export const transform: Transform = {
  name: 'my-custom-transform',
  description: 'Custom code transformation',

  transform(source, { j, root }) {
    // Find all console.log statements
    root
      .find(j.CallExpression, {
        callee: {
          object: { name: 'console' },
          property: { name: 'log' },
        },
      })
      // Replace with custom logger
      .replaceWith((path) => {
        return j.callExpression(j.identifier('logger.debug'), path.value.arguments);
      });

    return root.toSource();
  },
};
```

## Version Management

### Semantic Versioning

```bash
# Bump version
kubit-forge version patch
kubit-forge version minor
kubit-forge version major

# Pre-release version
kubit-forge version prerelease --preid beta

# Custom version
kubit-forge version 2.0.0
```

### Changelog Generation

```bash
# Generate changelog
kubit-forge changelog

# From specific version
kubit-forge changelog --from v1.0.0

# To specific version
kubit-forge changelog --to v2.0.0

# Custom format
kubit-forge changelog --format markdown
```

**Example Changelog:**

```markdown
# Changelog

## [2.0.0] - 2024-02-07

### Breaking Changes

- Migrated to React 18
- Dropped IE support
- Updated minimum Node version to 20

### Added

- New plugin system
- Recipe system
- Visual GUI

### Changed

- Improved performance
- Updated dependencies
- Enhanced error messages

### Fixed

- Fixed memory leak in dev server
- Fixed TypeScript errors
- Fixed broken tests

### Migration

Run `kubit-forge migrate react-18-root-api` to migrate
```

## Configuration

### Upgrade Configuration

```toml
# kubit.config.toml

[upgrade]
autoCheck = true
checkInterval = "weekly"  # daily, weekly, monthly
allowBreaking = false
allowPrerelease = false

[upgrade.notifications]
enabled = true
email = "dev@example.com"
slack = "https://hooks.slack.com/..."

[upgrade.filters]
ignore = [
  "deprecated-package"  # Don't upgrade
]

maxMajor = 1  # Only upgrade to next major version
onlyPatch = false
onlySecurity = false

[migration]
autoBackup = true
backupDir = ".kubit/backups"
runTests = true
testCommand = "npm test"
rollbackOnFail = true

[migration.transforms]
enabled = [
  "react-class-to-function",
  "proptypes-to-typescript"
]
```

## Best Practices

### 1. Review Changes Before Upgrading

```bash
# Always check what will change
kubit-forge upgrade:check --breaking
```

### 2. Use Dry Run First

```bash
# Preview changes
kubit-forge upgrade --dry-run
```

### 3. Upgrade One Major at a Time

```bash
# Don't skip major versions
kubit-forge upgrade react@17  # First
kubit-forge upgrade react@18  # Then
```

### 4. Test After Upgrades

```bash
# Use safe mode
kubit-forge upgrade --safe
```

### 5. Keep Dependencies Updated

```bash
# Regular updates prevent dependency hell
kubit-forge upgrade:check
```

### 6. Document Migrations

```bash
# Generate migration documentation
kubit-forge migrate react-18-root-api --docs
```

### 7. Use Version Control

Always commit before upgrading:

```bash
git add .
git commit -m "Pre-upgrade checkpoint"
kubit-forge upgrade
```

## Examples

### Complete Upgrade Workflow

```bash
# 1. Check current state
kubit-forge doctor

# 2. Create backup
git add .
git commit -m "Checkpoint before upgrade"

# 3. Check available updates
kubit-forge upgrade:check --breaking

# 4. Review breaking changes
kubit-forge upgrade:breaking react

# 5. Dry run
kubit-forge upgrade react --dry-run

# 6. Upgrade with safety
kubit-forge upgrade react --safe

# 7. Run migration
kubit-forge migrate react-18-root-api

# 8. Test thoroughly
npm test

# 9. Commit changes
git add .
git commit -m "Upgrade to React 18"
```

### Framework Migration

```bash
# Migrate from CRA to Vite
kubit-forge migrate cra-to-vite

# Migrate from Webpack to Vite
kubit-forge migrate webpack-to-vite

# Migrate from Jest to Vitest
kubit-forge migrate jest-to-vitest
```

### Batch Updates

```bash
# Update all patch versions
kubit-forge upgrade --level patch

# Update all minor versions
kubit-forge upgrade --level minor

# Update security patches only
kubit-forge upgrade --security-only
```

## Troubleshooting

### Upgrade Failures

```bash
# Check what failed
kubit-forge upgrade:status

# Rollback
kubit-forge upgrade:rollback

# Try again with verbose logging
kubit-forge upgrade --verbose
```

### Migration Errors

```bash
# Check migration status
kubit-forge migrate:status

# View error details
kubit-forge migrate:failed --details

# Rollback failed migration
kubit-forge migrate:rollback

# Retry with manual intervention
kubit-forge migrate <name> --interactive
```

### Dependency Conflicts

```bash
# Check for conflicts
kubit-forge deps:analyze --conflicts

# Resolve conflicts
kubit-forge deps:resolve

# Force resolution
kubit-forge upgrade --force-resolution
```

### Test Failures After Upgrade

```bash
# Identify what broke
kubit-forge doctor --after-upgrade

# View test diff
git diff HEAD~1 -- **/*.test.*

# Rollback if needed
kubit-forge upgrade:rollback
```

## CI/CD Integration

### Automated Dependency Updates

```yaml
# .github/workflows/auto-upgrade.yml
name: Auto Upgrade

on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 9 AM

jobs:
  upgrade:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Check for updates
        run: npx kubit-forge upgrade:check --json > updates.json

      - name: Upgrade dependencies
        run: npx kubit-forge upgrade --safe --level patch

      - name: Create Pull Request
        if: success()
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: automated dependency updates'
          body: |
            Automated dependency updates by Kubit Forge

            Run `kubit-forge migrate:list` to check for required migrations.
```

## Related Documentation

- [Dependency Management](./DEPENDENCY_MANAGEMENT.md) - Manage dependencies
- [Doctor Command](./DOCTOR-COMMAND.md) - Health checks
- [Development Commands](./DEVELOPMENT-COMMANDS.md) - Build and test

---

**Need help?** Run `kubit-forge upgrade --help` or visit [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues).
