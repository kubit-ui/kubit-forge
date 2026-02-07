# Smart Dependency Management

> Intelligent dependency analysis, optimization, and management for modern web projects

## Overview

Kubit Forge's Smart Dependency Management system provides powerful tools to understand, optimize, and manage your project dependencies. From visualizing dependency trees to suggesting better alternatives, these commands help you maintain a healthy and efficient dependency graph.

## Commands

### `deps:analyze` - Visual Dependency Tree

Analyze and visualize your project's dependency tree with an interactive, hierarchical view.

```bash
# Basic analysis
kubit-forge deps:analyze

# Control depth
kubit-forge deps:analyze --depth 3

# Filter by package name
kubit-forge deps:analyze --filter react

# JSON output
kubit-forge deps:analyze --json
```

**Features:**

- 📊 Tree-style visualization with unicode characters
- 🔍 Filter dependencies by name
- 📏 Control visualization depth
- 📦 Separate production and dev dependencies
- 📈 Summary statistics (total, production, development)

**Output Example:**

```
kubit-react-components@1.0.0

📦 Dependencies:
├── react@19.2.4
│   └── loose-envify@1.0.0
├── react-dom@19.2.4
│   ├── loose-envify@1.0.0
│   └── scheduler@0.24.0
└── styled-components@6.1.8
    └── ...

🔧 Dev Dependencies:
├── typescript@5.9.3
├── vite@7.3.1
└── vitest@4.0.18

📊 Summary:
  Total packages: 156
  Production: 89
  Development: 67
```

---

### `deps:why` - Package Origin Investigation

Understand why a specific package is installed and what depends on it.

```bash
# Check why a package is installed
kubit-forge deps:why lodash

# JSON output for automation
kubit-forge deps:why react --json
```

**Features:**

- 🔎 Shows which packages require this dependency
- 📍 Displays installation location
- 🔗 Identifies dependency type (production, development, peer, optional)
- 📋 Lists version requirements from each dependent

**Output Example:**

```
🔎 Analyzing why "lodash" is installed...

📦 lodash@4.17.21
   Location: /Users/project/node_modules/lodash

   Required by:
   📦 webpack-cli (production) → ^4.17.0
   🔧 eslint-plugin-react (development) → ^4.17.15
   🔗 my-app → project → babel-preset-react-app (production) → ^4.17.11
```

---

### `deps:dedupe` - Dependency Deduplication

Find and eliminate duplicate dependencies to reduce bundle size and installation time.

```bash
# Preview duplicates (dry run)
kubit-forge deps:dedupe --dry-run

# Deduplicate dependencies
kubit-forge deps:dedupe
```

**Features:**

- 🧹 Identifies duplicate packages with different versions
- 💾 Shows potential space savings
- 📍 Lists all locations of duplicates
- ⚡ Automatic deduplication across package manager
- 🔒 Safe operations with rollback support

**Output Example:**

```
🧹 Analyzing duplicate dependencies...

Found 3 duplicate dependencies:

  📦 chalk
     Versions: 4.1.2, 5.0.1, 5.6.2
     Locations: 12 places
     Potential savings: ~850KB

  📦 semver
     Versions: 7.5.4, 7.7.3
     Locations: 8 places
     Potential savings: ~200KB

🔧 Deduplicating dependencies...
✓ Deduplication complete!
  Before: 326 packages
  After:  298 packages
  Saved:  8.6%
```

---

### `deps:update` - Smart Dependency Updates

Intelligently check for available updates with safety analysis and recommendations.

```bash
# Check for safe updates only
kubit-forge deps:update

# Include breaking changes
kubit-forge deps:update --breaking

# Security updates only
kubit-forge deps:update --security

# Interactive mode (future)
kubit-forge deps:update --interactive
```

**Features:**

- 🔍 Scans for available updates
- ⚠️ Identifies breaking changes
- 🔒 Highlights security vulnerabilities
- 📊 Shows current vs wanted vs latest versions
- 🔗 Provides changelog links
- 💡 Smart recommendations based on update type

**Output Example:**

```
🔍 Checking for available updates...

Found 8 available updates:

  ⚠️ react (production)
     Current: 18.2.0
     Wanted:  18.3.1
     Latest:  19.2.4
     ⚠ Breaking change - review changelog
     https://www.npmjs.com/package/react?activeTab=versions

  📦 typescript (development)
     Current: 5.3.3
     Wanted:  5.6.3
     Latest:  5.9.3

  📦 vite (development)
     Current: 5.0.10
     Wanted:  5.4.11
     Latest:  7.3.1
     🔒 2 security vulnerabilities - update recommended

💡 Recommendations:

  🔒 3 security updates available - update immediately
  ✓ 4 safe updates (no breaking changes)
     Run: pnpm update typescript vite eslint prettier
  ⚠ 1 breaking changes - review carefully
```

---

### `deps:alternatives` - Package Alternative Suggestions

Discover better, lighter, or more modern alternatives to your current dependencies.

```bash
# Find alternatives for a package
kubit-forge deps:alternatives axios

# Get alternatives for outdated packages
kubit-forge deps:alternatives moment
```

**Features:**

- 🔍 Curated database of known alternatives
- 📊 Comparison metrics (size, downloads, stars)
- ✅ Maintenance status
- 💡 Migration rationale
- 📚 Migration guide links
- 🎯 TypeScript support indicators

**Built-in Alternative Database:**

- `axios` → `ky`, `redaxios`
- `moment` → `date-fns`, `dayjs`
- `lodash` → `lodash-es`, `remeda`
- `node-sass` → `sass`
- `request` → `axios`, `node-fetch`
- And more...

**Output Example:**

```
🔍 Finding alternatives for "moment"...

Found 2 alternatives:

  📦 date-fns
     Modern date library

     Size: 76.9 kB
     Downloads: 15,000,000/week
     Stars: ⭐ 32,000
     Maintained: ✓

     Why? Tree-shakeable, smaller bundle size, no locale loading required
     📚 Migration guide: https://date-fns.org/v2.29.3/docs/Getting-Started

  📦 dayjs
     Immutable date library

     Size: 6.5 kB
     Downloads: 10,000,000/week
     Stars: ⭐ 45,000
     Maintained: ✓

     Why? 2kB alternative with same API as moment

💡 Tip:
  Consider bundle size, maintenance status, and TypeScript support
  when choosing alternatives.
```

---

### `deps:export` - Dependency Report Export

Export comprehensive dependency information in various formats for documentation or CI/CD.

```bash
# Export as JSON
kubit-forge deps:export

# Export as Markdown
kubit-forge deps:export --format markdown

# Export as CSV
kubit-forge deps:export --format csv

# Custom output path
kubit-forge deps:export --format markdown --output docs/dependencies.md
```

**Supported Formats:**

- **JSON** - Machine-readable, ideal for automation
- **Markdown** - Human-readable documentation
- **CSV** - Spreadsheet analysis

**Export Contents:**

- Complete dependency tree
- Duplicate packages
- Available updates
- Summary statistics
- Breaking change indicators

**Output Example (Markdown):**

```markdown
# Dependency Report

Generated: 2026-02-07T08:45:00.000Z

## Summary

- Total Dependencies: 89
- Dev Dependencies: 67
- Duplicates: 3
- Available Updates: 8

## Duplicates

### chalk

- Versions: 4.1.2, 5.0.1, 5.6.2
- Locations: 12

## Available Updates

### react

- Current: 18.2.0
- Latest: 19.2.4
- Breaking: Yes ⚠️
```

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Dependency Health Check

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2

      - name: Install Kubit Forge
        run: pnpm add -g kubit-forge

      - name: Check for duplicates
        run: kubit-forge deps:dedupe --dry-run

      - name: Security updates
        run: kubit-forge deps:update --security

      - name: Export report
        run: kubit-forge deps:export --format markdown --output report.md

      - name: Upload report
        uses: actions/upload-artifact@v3
        with:
          name: dependency-report
          path: report.md
```

---

## Best Practices

### 1. Regular Audits

```bash
# Weekly dependency health check
kubit-forge deps:analyze
kubit-forge deps:dedupe --dry-run
kubit-forge deps:update --security
```

### 2. Before Major Updates

```bash
# Understand your dependency graph
kubit-forge deps:analyze --depth 3

# Check what will be affected
kubit-forge deps:why <package>

# Preview updates
kubit-forge deps:update --breaking
```

### 3. Bundle Size Optimization

```bash
# Find duplicates
kubit-forge deps:dedupe

# Explore alternatives
kubit-forge deps:alternatives lodash
kubit-forge deps:alternatives moment

# Export for analysis
kubit-forge deps:export --format csv
```

### 4. Security Maintenance

```bash
# Regular security checks
kubit-forge deps:update --security

# Automated in CI/CD
kubit-forge deps:export --json | jq '.updates[] | select(.securityVulnerabilities > 0)'
```

---

## Configuration

Add to your `kubit.config.toml`:

```toml
[dependencies]
# Auto-check for updates
autoCheck = true

# Warn on duplicates
warnDuplicates = true

# Alert on security issues
alertSecurity = true

# Maximum duplicate threshold
maxDuplicates = 5

# Preferred package manager
packageManager = "pnpm"
```

---

## Advanced Usage

### Combining Commands

```bash
# Full dependency health check
kubit-forge deps:analyze && \
kubit-forge deps:dedupe --dry-run && \
kubit-forge deps:update --security && \
kubit-forge deps:export --format markdown
```

### Scripting

```bash
#!/bin/bash
# dependency-health.sh

echo "🔍 Analyzing dependencies..."
kubit-forge deps:analyze --json > analysis.json

DUPLICATES=$(kubit-forge deps:dedupe --dry-run --json | jq '.duplicates')
if [ "$DUPLICATES" -gt 5 ]; then
  echo "⚠️ Warning: $DUPLICATES duplicates found!"
  exit 1
fi

echo "✓ Dependency health check passed"
```

---

## Troubleshooting

### Command Not Found

```bash
# Ensure Kubit Forge is installed
pnpm add -g kubit-forge

# Verify installation
kubit-forge --version
```

### Slow Analysis

```bash
# Reduce depth for large projects
kubit-forge deps:analyze --depth 1

# Filter to specific packages
kubit-forge deps:analyze --filter react
```

### Lock File Issues

```bash
# Regenerate lock file
rm pnpm-lock.yaml
pnpm install

# Then run analysis
kubit-forge deps:analyze
```

---

## Comparison with Other Tools

| Feature        | Kubit Forge | npm ls | yarn why | pnpm list |
| -------------- | ----------- | ------ | -------- | --------- |
| Visual tree    | ✅          | ✅     | ❌       | ✅        |
| Why installed  | ✅          | ❌     | ✅       | ❌        |
| Deduplication  | ✅          | ✅     | ✅       | ✅        |
| Smart updates  | ✅          | ❌     | ❌       | ❌        |
| Alternatives   | ✅          | ❌     | ❌       | ❌        |
| Export reports | ✅          | ❌     | ❌       | ❌        |
| Security focus | ✅          | ✅     | ❌       | ✅        |

---

## Contributing

Want to add more package alternatives? Edit `src/utils/dependency-analyzer.ts`:

```typescript
const knownAlternatives: Record<string, AlternativePackage[]> = {
  'your-package': [
    {
      name: 'better-alternative',
      description: 'Modern replacement',
      downloads: 1000000,
      stars: 5000,
      maintained: true,
      size: '10 kB',
      reason: 'Smaller, faster, better TypeScript support',
    },
  ],
};
```

---

## Roadmap

- [ ] Interactive update mode
- [ ] Vulnerability database integration
- [ ] Bundle impact analysis
- [ ] Automatic PR creation for updates
- [ ] Custom alternative suggestions via config
- [ ] Workspace/monorepo support
- [ ] Historical dependency tracking
- [ ] Cost analysis (npm registry costs)

---

## Related Commands

- `kubit-forge doctor` - Overall project health check
- `kubit-forge info` - Project information including dependencies
- `kubit-forge audit:sbom` - Generate Software Bill of Materials

---

## Learn More

- [NPM Dependency Management](https://docs.npmjs.com/cli/v9/commands/npm-dedupe)
- [PNPM Workspace](https://pnpm.io/workspaces)
- [Yarn Berry](https://yarnpkg.com/features/protocols)
- [Bundle Size Best Practices](https://web.dev/bundlesize/)

---

Made with ❤️ by the Kubit team
