# Doctor Command - AI-Powered Diagnostics

## Overview

The Doctor Command is an AI-powered diagnostic tool that analyzes your project, identifies issues, and provides intelligent recommendations. It can automatically fix common problems and predict potential issues before they become critical.

## Why Use Doctor?

- **Intelligent Detection** - AI-powered issue identification
- **Auto-Fix** - Automatically resolve common problems
- **Predictive Analysis** - Prevent issues before they happen
- **Comprehensive Checks** - Covers configuration, dependencies, security, and performance
- **IDE Integration** - Works with VS Code and other editors
- **Actionable Recommendations** - Clear, contextualized suggestions

## Quick Start

```bash
# Run basic diagnostics
kubit-forge doctor

# Auto-fix detected issues
kubit-forge doctor --fix

# Predictive analysis
kubit-forge doctor --predictive

# Detailed report
kubit-forge doctor --detailed

# Check specific category
kubit-forge doctor --category security

# Export report
kubit-forge doctor --export report.json
```

## Diagnostic Categories

### Configuration Validation

Checks project configuration files for errors and best practices.

**Checks:**

- ✅ TypeScript configuration validity
- ✅ ESLint rules consistency
- ✅ Prettier configuration
- ✅ Vite/build configuration
- ✅ Package.json scripts
- ✅ tsconfig.json issues

**Example Output:**

```
⚠ Configuration Issues (2 found)

  ✓ TypeScript configuration is valid
  ⚠ ESLint: Missing recommended rules
    → Auto-fix: kubit-forge doctor --fix

  ⚠ Vite: Build target outdated (es2015 → es2020)
    → Recommendation: Update vite.config.ts
```

### Dependency Health

Analyzes project dependencies for issues.

**Checks:**

- ✅ Outdated packages
- ✅ Security vulnerabilities
- ✅ Duplicate dependencies
- ✅ Missing peer dependencies
- ✅ Unused dependencies
- ✅ License compatibility

**Example Output:**

```
⚠ Dependency Issues (4 found)

  ⚠ Security: 2 vulnerabilities found
    → react-dom@17.0.2 (high severity)
    → axios@0.21.1 (moderate severity)
    → Action: kubit-forge deps:update --security

  ⚠ Outdated: 12 packages have updates available
    → Major updates: 3 packages
    → Minor updates: 5 packages
    → Patch updates: 4 packages
    → Action: kubit-forge deps:update

  ⚠ Duplicates: 3 duplicate packages detected
    → lodash@4.17.21 (appears 3 times)
    → Action: kubit-forge deps:dedupe
```

### Security Scan

Comprehensive security analysis.

**Checks:**

- ✅ Known vulnerabilities (CVE database)
- ✅ Malicious packages
- ✅ License violations
- ✅ Exposed secrets in code
- ✅ Insecure dependencies
- ✅ Supply chain risks

**Example Output:**

```
✗ Security Issues (3 found)

  ✗ HIGH: Prototype pollution in lodash@4.17.15
    → CVE-2020-8203
    → Fix: Update to lodash@4.17.21

  ⚠ MEDIUM: Exposed API key in .env.example
    → File: .env.example:3
    → Action: Remove or use placeholder

  ⚠ LOW: Permissive CORS configuration
    → File: src/server.ts:12
    → Recommendation: Restrict allowed origins
```

### Performance Analysis

Identifies performance bottlenecks.

**Checks:**

- ✅ Bundle size analysis
- ✅ Large dependencies
- ✅ Unoptimized images
- ✅ Missing code splitting
- ✅ Build performance
- ✅ Development server speed

**Example Output:**

```
⚠ Performance Issues (3 found)

  ⚠ Large bundle size: 2.4 MB (recommended < 500 KB)
    → Largest chunks:
      - vendor.js: 1.8 MB
      - main.js: 600 KB
    → Recommendation: Enable code splitting

  ⚠ Unoptimized images: 15 images > 500 KB
    → Total size: 8.2 MB
    → Action: kubit-forge assets:optimize

  ✓ No blocking resources found
```

### Code Quality

Analyzes code quality and best practices.

**Checks:**

- ✅ Linting errors
- ✅ Type errors
- ✅ Unused code
- ✅ Code complexity
- ✅ Test coverage
- ✅ Documentation coverage

**Example Output:**

```
⚠ Code Quality Issues (5 found)

  ⚠ ESLint: 23 errors, 45 warnings
    → Action: kubit-forge lint --fix

  ⚠ TypeScript: 12 type errors
    → Most common: implicit any (8 occurrences)
    → Action: kubit-forge typecheck

  ⚠ Test Coverage: 45% (recommended > 80%)
    → Uncovered files: 23
    → Action: Add more tests
```

### IDE Integration

Checks IDE setup and configuration.

**Checks:**

- ✅ VS Code extensions
- ✅ Editor settings
- ✅ Debugger configuration
- ✅ Workspace recommendations
- ✅ Task configuration

**Example Output:**

```
⚠ IDE Setup (2 recommendations)

  ⚠ Missing recommended VS Code extensions:
    → ESLint
    → Prettier
    → TypeScript Vue Plugin
    → Action: Install recommended extensions

  ✓ Debugger configuration is valid
  ✓ Workspace settings are optimal
```

### Git & Version Control

Analyzes version control setup.

**Checks:**

- ✅ .gitignore completeness
- ✅ Large files in repository
- ✅ Commit message format
- ✅ Branch protection
- ✅ Git hooks setup

**Example Output:**

```
⚠ Version Control Issues (2 found)

  ⚠ .gitignore: Missing important patterns
    → Missing: node_modules/.cache
    → Missing: .env.local
    → Action: kubit-forge doctor --fix

  ⚠ Large files in repository:
    → dist/bundle.js: 3.2 MB
    → Action: Add to .gitignore
```

## Auto-Fix Capabilities

### What Can Be Auto-Fixed?

- ✅ Configuration syntax errors
- ✅ Missing configuration files
- ✅ Outdated dependencies (with confirmation)
- ✅ ESLint/Prettier issues
- ✅ .gitignore patterns
- ✅ Package.json scripts
- ✅ TypeScript configuration
- ✅ Missing type definitions

### Running Auto-Fix

```bash
# Auto-fix all issues
kubit-forge doctor --fix

# Fix specific category
kubit-forge doctor --fix --category configuration

# Preview fixes without applying
kubit-forge doctor --fix --dry-run

# Interactive fix (confirm each fix)
kubit-forge doctor --fix --interactive
```

### Example Auto-Fix Session

```
Running auto-fix...

✓ Fixed: ESLint configuration (added missing rules)
✓ Fixed: Added .gitignore patterns
✓ Fixed: Updated TypeScript target to es2020
⚠ Skipped: Dependency updates (requires confirmation)
  → Run: kubit-forge deps:update

Auto-fix complete: 3 fixed, 1 skipped
```

## Predictive Analysis

Identifies potential future issues based on patterns and trends.

```bash
kubit-forge doctor --predictive
```

### Predictions Include:

- **Deprecated Dependencies** - Packages scheduled for deprecation
- **Breaking Changes** - Upcoming major version updates
- **Performance Degradation** - Growing bundle size trends
- **Security Risks** - Potential vulnerability patterns
- **Maintenance Issues** - Abandoned dependencies

**Example Output:**

```
🔮 Predictive Analysis

  ⚠ Deprecated Dependency Alert
    → moment.js is in maintenance mode
    → Recommendation: Migrate to date-fns or dayjs
    → Effort: 2-3 hours
    → Priority: Medium

  ⚠ Upcoming Breaking Change
    → react-router@7 will be released soon
    → Current version: react-router@6.4.0
    → Breaking changes: Route API redesign
    → Action: Review migration guide

  ⚠ Bundle Size Trend
    → Bundle size increased 15% in last month
    → Current: 1.2 MB (from 1.0 MB)
    → Recommendation: Implement code splitting
```

## Advanced Features

### Custom Diagnostic Rules

Create custom rules for your organization:

```typescript
// .kubit/doctor-rules/custom-rule.ts
export default {
  name: 'enforce-company-standards',
  category: 'configuration',

  async check(ctx) {
    const packageJson = ctx.readPackageJson();

    // Check for required company metadata
    if (!packageJson.repository?.url?.includes('github.com/company')) {
      return {
        level: 'warning',
        message: 'Repository URL must use company GitHub org',
        fix: async () => {
          packageJson.repository.url = 'https://github.com/company/...';
          ctx.writePackageJson(packageJson);
        },
      };
    }

    return { level: 'success', message: 'Company standards met' };
  },
};
```

### Integration with CI/CD

```yaml
# .github/workflows/health-check.yml
name: Health Check

on: [push, pull_request]

jobs:
  doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g kubit-forge
      - run: kubit-forge doctor --ci --strict
```

### Scheduled Reports

```bash
# Generate daily reports
kubit-forge doctor --export daily-report.json
```

### Email Notifications

```toml
# kubit.config.toml
[doctor]
notifications = true
email = "team@company.com"
schedule = "0 9 * * 1"  # Every Monday at 9am

[doctor.thresholds]
security = "none"        # Fail on any security issue
performance = "warning"  # Alert on performance warnings
```

## Command Options

### Categories

```bash
# Check all categories (default)
kubit-forge doctor

# Specific category
kubit-forge doctor --category security
kubit-forge doctor --category performance
kubit-forge doctor --category dependencies
```

### Output Formats

```bash
# Human-readable (default)
kubit-forge doctor

# JSON export
kubit-forge doctor --export report.json --format json

# Markdown report
kubit-forge doctor --export HEALTH.md --format markdown

# HTML report
kubit-forge doctor --export report.html --format html
```

### Severity Levels

```bash
# Show only errors
kubit-forge doctor --severity error

# Show warnings and errors
kubit-forge doctor --severity warning

# Show everything
kubit-forge doctor --severity info
```

### Filtering

```bash
# Exclude specific checks
kubit-forge doctor --exclude security.license-check

# Include only specific checks
kubit-forge doctor --include config.*,deps.*
```

## Example Workflows

### Daily Health Check

```bash
#!/bin/bash
# health-check.sh

echo "Running daily health check..."

# Run doctor
kubit-forge doctor --export report.json

# Check exit code
if [ $? -ne 0 ]; then
  echo "❌ Health check failed!"
  # Send notification
  curl -X POST slack-webhook-url -d "@report.json"
  exit 1
fi

echo "✓ Health check passed!"
```

### Pre-Release Checklist

```bash
#!/bin/bash
# pre-release.sh

echo "Running pre-release checks..."

# Security scan
kubit-forge doctor --category security --strict

# Performance check
kubit-forge doctor --category performance

# Dependency audit
kubit-forge deps:analyze

# Generate SBOM
kubit-forge sbom:generate

echo "✓ Pre-release checks complete!"
```

### Onboarding New Developers

```bash
#!/bin/bash
# onboard.sh

echo "Setting up development environment..."

# Check system requirements
kubit-forge doctor --category ide

# Auto-fix common issues
kubit-forge doctor --fix

# Install recommended tools
kubit-forge doctor --install-recommendations

echo "✓ Environment ready!"
```

## Troubleshooting

### False Positives

```bash
# Ignore specific warnings
kubit-forge doctor --ignore-pattern "Missing license file"

# Configure in kubit.config.toml
[doctor.ignore]
patterns = [
  "Missing license file",
  "Bundle size warning for vendor.js"
]
```

### Performance Issues

```bash
# Skip expensive checks
kubit-forge doctor --skip-expensive

# Limit depth of analysis
kubit-forge doctor --depth 1
```

### Custom Checks Not Running

```bash
# Verify custom rules
kubit-forge doctor --list-rules

# Debug custom rule
kubit-forge doctor --debug --rule custom-rule-name
```

## Best Practices

1. **Regular Scans** - Run doctor command regularly (daily/weekly)
2. **CI Integration** - Add to CI/CD pipeline
3. **Auto-Fix Safely** - Review auto-fix changes before committing
4. **Monitor Trends** - Track issues over time
5. **Team Adoption** - Share reports with team
6. **Custom Rules** - Create organization-specific rules
7. **Predictive Mode** - Use predictive analysis for long-term planning

## Performance Tips

- Run in CI with caching enabled
- Use `--skip-expensive` for quick checks
- Filter by category for faster analysis
- Export reports for offline analysis

## Related Documentation

- [Dependency Management](./DEPENDENCY-MANAGEMENT.md) - Manage dependencies
- [Security & SBOM](./SECURITY-SBOM.md) - Security features
- [Configuration](./CONFIGURATION.md) - Configure doctor behavior

---

**Need help?** Open an issue on [GitHub](https://github.com/kubit-ui/kubit-forge/issues).
