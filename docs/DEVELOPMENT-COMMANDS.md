# Development Commands

## Overview

Kubit Forge provides a comprehensive set of commands for your daily development workflow. These commands are designed to work seamlessly with your existing tools and configuration.

## Quick Reference

```bash
# Development
kubit-forge dev              # Start dev server
kubit-forge build            # Production build
kubit-forge preview          # Preview production build

# Testing
kubit-forge test             # Run tests
kubit-forge test:watch       # Watch mode
kubit-forge test:coverage    # With coverage

# Code Quality
kubit-forge lint             # Lint code
kubit-forge lint --fix       # Auto-fix issues
kubit-forge format           # Format code
kubit-forge typecheck        # Type checking
kubit-forge check            # Run all checks

# Information
kubit-forge info             # Project info
kubit-forge doctor           # Diagnostics
```

## Development Server

### Start Development Server

```bash
kubit-forge dev
```

**Features:**

- ⚡ Lightning-fast HMR (Hot Module Replacement)
- 🔄 Automatic browser refresh
- 📦 On-demand compilation
- 🔥 Error overlay
- 🌐 Network access support

**Options:**

```bash
# Custom port
kubit-forge dev --port 8080

# Custom host
kubit-forge dev --host 0.0.0.0

# Open browser automatically
kubit-forge dev --open

# HTTPS mode
kubit-forge dev --https

# Clear cache before starting
kubit-forge dev --force
```

**Example Output:**

```
  VITE v5.0.0  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h to show help
```

### Environment Variables

```bash
# Development mode
NODE_ENV=development kubit-forge dev

# Custom API URL
API_URL=http://localhost:3000 kubit-forge dev
```

## Building for Production

### Production Build

```bash
kubit-forge build
```

**Features:**

- 🗜️ Code minification
- 📦 Bundle optimization
- 🌳 Tree-shaking
- 💾 Asset optimization
- 📊 Bundle analysis

**Output:**

```
vite v5.0.0 building for production...
✓ 1247 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.29 kB
dist/assets/index-b8d3c9f2.css   15.23 kB │ gzip:  4.12 kB
dist/assets/index-d4f7e8a1.js   142.45 kB │ gzip: 45.78 kB
✓ built in 3.24s
```

**Options:**

```bash
# Watch mode
kubit-forge build --watch

# Analyze bundle
kubit-forge build --analyze

# Custom output directory
kubit-forge build --outDir custom-dist

# Skip minification (for debugging)
kubit-forge build --no-minify

# Generate source maps
kubit-forge build --sourcemap
```

### Preview Production Build

Test production build locally:

```bash
kubit-forge preview
```

Starts a local server with the production build.

**Options:**

```bash
# Custom port
kubit-forge preview --port 4173

# Open browser
kubit-forge preview --open
```

## Testing

### Run Tests

```bash
# Run all tests
kubit-forge test

# Run specific test file
kubit-forge test src/components/Button.test.tsx

# Run tests matching pattern
kubit-forge test --pattern Button
```

**Options:**

```bash
# Watch mode - rerun on changes
kubit-forge test --watch

# Update snapshots
kubit-forge test --update

# Run in UI mode (if supported)
kubit-forge test --ui

# Run only changed files
kubit-forge test --changed

# Fail fast - stop on first failure
kubit-forge test --bail
```

### Test Coverage

```bash
# Generate coverage report
kubit-forge test --coverage

# Coverage with threshold
kubit-forge test --coverage --threshold 80

# Coverage for specific files
kubit-forge test --coverage src/utils/
```

**Coverage Output:**

```
 Test Files  24 passed (24)
      Tests  156 passed (156)
   Duration  2.34s

 % Coverage report from v8
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   85.23 |    78.45 |   90.12 |   85.67 |
 components/        |   92.45 |    85.23 |   95.67 |   93.12 |
  Button.tsx        |   95.67 |    89.34 |   100.0 |   96.23 |
  Input.tsx         |   89.23 |    81.12 |   91.34 |   90.01 |
 utils/             |   78.01 |    71.67 |   84.89 |   77.23 |
  formatDate.ts     |   81.23 |    75.45 |   88.90 |   82.34 |
--------------------|---------|----------|---------|---------|
```

### E2E Tests

```bash
# Run Playwright tests
kubit-forge test:e2e

# Run in UI mode
kubit-forge test:e2e --ui

# Run specific browser
kubit-forge test:e2e --project chromium

# Debug mode
kubit-forge test:e2e --debug
```

## Code Quality

### Linting

```bash
# Check for linting errors
kubit-forge lint

# Auto-fix issues
kubit-forge lint --fix

# Lint specific files
kubit-forge lint src/components/

# Show warnings too
kubit-forge lint --max-warnings 0
```

**Example Output:**

```
✓ No linting errors found

  Checked 145 files
  0 errors, 3 warnings

Warnings:
  src/App.tsx
    12:5  warning  'useState' is defined but never used  @typescript-eslint/no-unused-vars
```

### Formatting

```bash
# Format all files
kubit-forge format

# Check formatting without fixing
kubit-forge format --check

# Format specific files/directories
kubit-forge format src/components/

# Write formatted output
kubit-forge format --write
```

**Supported File Types:**

- JavaScript/TypeScript (`.js`, `.ts`, `.jsx`, `.tsx`)
- JSON (`.json`)
- Markdown (`.md`)
- CSS/SCSS (`.css`, `.scss`)
- HTML (`.html`)

### Type Checking

```bash
# Run TypeScript type checker
kubit-forge typecheck

# Watch mode
kubit-forge typecheck --watch

# Show all errors (no truncation)
kubit-forge typecheck --verbose
```

**Example Output:**

```
Type checking...

src/components/Button.tsx:23:15 - error TS2339:
  Property 'onClick' does not exist on type 'ButtonProps'.

src/utils/api.ts:45:23 - error TS2322:
  Type 'string' is not assignable to type 'number'.

Found 2 errors in 2 files.
```

### Run All Checks

Run linting, formatting, and type checking together:

```bash
kubit-forge check

# Continue on error
kubit-forge check --no-bail

# Specific checks only
kubit-forge check --skip-tests
```

**Output:**

```
Running checks...

✓ Linting passed
✓ Formatting check passed
✓ Type checking passed
⚠ Tests passed with warnings

All checks completed successfully!
```

## Information Commands

### Project Information

```bash
# Show project details
kubit-forge info

# Detailed output
kubit-forge info --detailed

# JSON output
kubit-forge info --json
```

**Example Output:**

```
📦 Project: my-awesome-app
📝 Version: 1.0.0
⚛️  Stack: React + TypeScript
📦 Package Manager: pnpm
🔧 Node Version: v20.10.0
📁 Root: /Users/dev/my-app

Dependencies: 42
DevDependencies: 28
Scripts: 15
```

### Version Information

```bash
# Kubit Forge version
kubit-forge --version

# Full system info
kubit-forge --info
```

## Environment Commands

### Environment Management

```bash
# Initialize .env file
kubit-forge env init

# Validate environment variables
kubit-forge env validate

# Show environment info (safe values only)
kubit-forge env info

# Generate .env.example
kubit-forge env generate-example
```

## Asset Commands

### Asset Optimization

```bash
# Optimize all assets
kubit-forge assets:optimize

# Optimize with custom quality
kubit-forge assets:optimize --quality 85

# Optimize specific types
kubit-forge assets:optimize --images
kubit-forge assets:optimize --fonts
kubit-forge assets:optimize --icons
```

### Compress Assets

```bash
# Compress with gzip and brotli
kubit-forge assets:compress

# Specific algorithm
kubit-forge assets:compress --algorithm gzip
kubit-forge assets:compress --algorithm brotli
```

### CDN Sync

```bash
# Sync to CDN
kubit-forge assets:cdn:sync

# Specific provider
kubit-forge assets:cdn:sync --provider cloudflare
kubit-forge assets:cdn:sync --provider s3
```

## Dependency Commands

### Dependency Analysis

```bash
# Analyze dependencies
kubit-forge deps:analyze

# Why is package installed?
kubit-forge deps:why lodash

# Find duplicates
kubit-forge deps:dedupe

# Check for updates
kubit-forge deps:update --dry-run

# Find alternatives
kubit-forge deps:alternatives moment
```

## Workflow Examples

### Daily Development

```bash
# Morning routine
kubit-forge doctor               # Check project health
kubit-forge dev                  # Start dev server

# Before committing
kubit-forge check                # Run all checks
kubit-forge test                 # Run tests
git add .
git commit -m "feat: new feature"
```

### Pre-Deployment

```bash
# Full quality check
kubit-forge check
kubit-forge test --coverage
kubit-forge doctor

# Build for production
kubit-forge build

# Preview build
kubit-forge preview

# Optimize assets
kubit-forge assets:optimize
```

### Debugging

```bash
# Clear caches
kubit-forge dev --force

# Verbose output
kubit-forge build --verbose

# Debug tests
kubit-forge test --verbose --bail
```

## Configuration

Commands respect configuration in `kubit.config.toml`:

```toml
[dev]
port = 3000
host = "localhost"
open = true

[build]
outDir = "dist"
sourcemap = true
minify = true

[test]
coverage = true
threshold = 80
```

## Scripting & Automation

### Use in Scripts

```bash
#!/bin/bash
# deploy.sh

echo "Running checks..."
kubit-forge check || exit 1

echo "Building..."
kubit-forge build || exit 1

echo "Optimizing assets..."
kubit-forge assets:optimize

echo "Deploying..."
# deployment commands...
```

### CI/CD Integration

```yaml
# .github/workflows/ci.yml
- name: Run checks
  run: kubit-forge check

- name: Run tests
  run: kubit-forge test --coverage

- name: Build
  run: kubit-forge build
```

## Command Aliases

Short aliases for common commands:

```bash
kb dev     # kubit-forge dev
kb build   # kubit-forge build
kb test    # kubit-forge test
kb check   # kubit-forge check
```

## Exit Codes

Commands exit with standard codes:

- `0` - Success
- `1` - Error
- `2` - Warning (if configured)

## Related Documentation

- [Configuration](./CONFIGURATION.md) - Configure commands
- [Doctor Command](./DOCTOR-COMMAND.md) - Diagnostics
- [Visual GUI](./VISUAL-GUI.md) - Run commands visually

---

**Need help?** Run `kubit-forge <command> --help` or visit [GitHub](https://github.com/kubit-ui/kubit-forge/issues).
