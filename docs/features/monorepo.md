# Monorepo Support

## Overview

Kubit Forge provides first-class support for monorepo management, offering seamless integration with popular monorepo tools like Yarn workspaces, pnpm workspaces, Turborepo, and Nx.

## Quick Start

```bash
# Initialize a monorepo
kubit-forge monorepo:init --tool yarn

# Add a new package
kubit-forge monorepo:add my-package

# List all packages
kubit-forge monorepo:list

# Show monorepo information
kubit-forge monorepo:info
```

## Supported Monorepo Tools

### Yarn Workspaces

The recommended choice for modern monorepos.

```bash
# Initialize yarn monorepo
kubit-forge monorepo:init --tool yarn

# Create workspace structure
kubit-forge monorepo:add packages/ui
kubit-forge monorepo:add packages/core
kubit-forge monorepo:add apps/web
```

**Generated Structure:**

```
monorepo/
 package.json  (with workspaces field)
 packages/
    ui/
       package.json
    core/
        package.json
 apps/
     web/
         package.json
```

**package.json workspaces:**

```json
{
  "workspaces": ["packages/*", "apps/*"]
}
```

### pnpm Workspaces

Workspace support for pnpm users.

```bash
# Initialize Yarn monorepo
kubit-forge monorepo:init --tool yarn
```

**package.json:**

```json
{
  "private": true,
  "workspaces": ["packages/*", "apps/*"]
}
```

### npm Workspaces

Native npm workspace support (npm 7+).

```bash
# Initialize npm monorepo
kubit-forge monorepo:init --tool npm
```

### Turborepo

Advanced caching and pipeline orchestration.

```bash
# Initialize with Turborepo
kubit-forge monorepo:init --tool turborepo

# Run tasks in parallel
kubit-forge monorepo:run build --parallel

# Show cache statistics
kubit-forge monorepo:cache-stats
```

**turbo.json:**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "cache": false
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Nx

Enterprise-scale monorepo tool with smart task scheduling.

```bash
# Initialize with Nx
kubit-forge monorepo:init --tool nx

# Generate application
kubit-forge monorepo:add my-app --type app

# Generate library
kubit-forge monorepo:add my-lib --type lib
```

**nx.json:**

```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test"]
      }
    }
  }
}
```

### Lerna

Legacy monorepo support.

```bash
# Initialize with Lerna
kubit-forge monorepo:init --tool lerna
```

## Monorepo Commands

### Initialize

```bash
# Basic initialization
kubit-forge monorepo:init

# With specific tool
kubit-forge monorepo:init --tool yarn

# With custom structure
kubit-forge monorepo:init --structure custom

# Interactive mode
kubit-forge monorepo:init --interactive
```

### Add Package

```bash
# Add application
kubit-forge monorepo:add apps/web

# Add library
kubit-forge monorepo:add packages/ui

# With template
kubit-forge monorepo:add packages/utils --template typescript-lib

# With dependencies
kubit-forge monorepo:add apps/admin --deps @company/ui,@company/core
```

### List Packages

```bash
# List all packages
kubit-forge monorepo:list

# Show details
kubit-forge monorepo:list --detailed

# Filter by pattern
kubit-forge monorepo:list --filter @company/*

# JSON output
kubit-forge monorepo:list --json
```

**Example Output:**

```
Monorepo Packages (5):

 apps/web (1.0.0)
   Path: apps/web
   Type: application
   Dependencies: @company/ui, @company/core

 apps/admin (1.0.0)
   Path: apps/admin
   Type: application
   Dependencies: @company/ui, @company/auth

 @company/ui (0.1.0)
   Path: packages/ui
   Type: library
   Dependencies: react, styled-components

 @company/core (0.1.0)
   Path: packages/core
   Type: library
   Dependencies: None

 @company/auth (0.1.0)
   Path: packages/auth
   Type: library
   Dependencies: @company/core
```

### Run Commands

```bash
# Run in all packages
kubit-forge monorepo:run build

# Run in specific packages
kubit-forge monorepo:run test --filter @company/ui

# Run in parallel
kubit-forge monorepo:run lint --parallel

# Run with dependencies
kubit-forge monorepo:run build --include-dependencies

# Dry run
kubit-forge monorepo:run build --dry-run
```

### Dependency Management

```bash
# Add dependency to package
kubit-forge monorepo:add-dep lodash --to @company/core

# Add dev dependency
kubit-forge monorepo:add-dep typescript --to @company/ui --dev

# Remove dependency
kubit-forge monorepo:remove-dep lodash --from @company/core

# Update dependencies
kubit-forge monorepo:update-deps

# Dedupe dependencies
kubit-forge monorepo:dedupe
```

### Workspace Graph

```bash
# Show dependency graph
kubit-forge monorepo:graph

# Show affected packages
kubit-forge monorepo:affected --since origin/main

# Show circular dependencies
kubit-forge monorepo:graph --check-circular
```

**Example Graph:**

```
Workspace Dependency Graph:

apps/web
 @company/ui
    @company/core
 @company/auth
     @company/core

apps/admin
 @company/ui
    @company/core
 @company/auth
     @company/core
```

### Information

```bash
# Show monorepo info
kubit-forge monorepo:info

# Show workspace configuration
kubit-forge monorepo:config

# Validate monorepo
kubit-forge monorepo:validate
```

## Monorepo Features

### Workspace Detection

Automatic detection of monorepo structure and configuration.

```typescript
// Detects:
// - pnpm-workspace.yaml
// - package.json workspaces
// - lerna.json
// - nx.json
// - turbo.json
```

### Smart Dependency Resolution

Intelligent handling of internal workspace dependencies.

```json
{
  "name": "@company/web",
  "dependencies": {
    "@company/ui": "workspace:*",
    "@company/core": "workspace:^"
  }
}
```

### Task Orchestration

Parallel and sequential task execution with dependency awareness.

```bash
# Run tasks in topological order
kubit-forge monorepo:run build --topological

# Run affected packages only
kubit-forge monorepo:run test --affected
```

### Selective Builds

Build only packages affected by changes.

```bash
# Build affected since last commit
kubit-forge monorepo:build --since HEAD^

# Build affected since branch
kubit-forge monorepo:build --since origin/main

# Show what would be built
kubit-forge monorepo:build --since origin/main --dry-run
```

### Cache Management

Built-in caching for faster builds (with Turborepo/Nx).

```bash
# Enable cache
kubit-forge monorepo:cache enable

# Clear cache
kubit-forge monorepo:cache clear

# Show cache statistics
kubit-forge monorepo:cache stats
```

### Version Management

Coordinate package versions across workspace.

```bash
# Bump versions
kubit-forge monorepo:version patch

# Publish packages
kubit-forge monorepo:publish

# Create changelog
kubit-forge monorepo:changelog
```

## Configuration

### Monorepo Configuration

```toml
# kubit.config.toml

[monorepo]
enabled = true
tool = "yarn"  # yarn, pnpm, npm, turborepo, nx, lerna
workspaces = ["packages/*", "apps/*"]

[monorepo.yarn]
nodeLinker = "node-modules"

[monorepo.turborepo]
pipeline = true
cache = true
remoteCache = false

[monorepo.nx]
cache = true
defaultProject = "web"
```

### Package Templates

Custom templates for new packages.

```bash
# Create template
kubit-forge monorepo:template create typescript-lib

# Use template
kubit-forge monorepo:add packages/new-lib --template typescript-lib
```

## Best Practices

### 1. Use Workspace Protocol

```json
{
  "dependencies": {
    "@company/shared": "workspace:*"
  }
}
```

### 2. Organize by Type

```
monorepo/
 apps/        # Applications
 packages/    # Shared libraries
 tools/       # Build tools
 configs/     # Shared configs
```

### 3. Centralize Configuration

Share ESLint, TypeScript, and other configs across packages.

```
configs/
 eslint-config/
 tsconfig/
 prettier-config/
```

### 4. Use Build Cache

Enable Turborepo or Nx caching for faster builds.

```bash
kubit-forge monorepo:cache enable
```

### 5. Version Together

Use consistent versioning across related packages.

```bash
kubit-forge monorepo:version minor --all
```

## Examples

### Basic Yarn Monorepo

```bash
# Initialize
kubit-forge monorepo:init --tool yarn

# Add packages
kubit-forge monorepo:add packages/ui
kubit-forge monorepo:add packages/core
kubit-forge monorepo:add apps/web

# Install dependencies
yarn install

# Build all
kubit-forge monorepo:run build
```

### Turborepo with Multiple Apps

```bash
# Initialize with Turborepo
kubit-forge monorepo:init --tool turborepo

# Add applications
kubit-forge monorepo:add apps/web
kubit-forge monorepo:add apps/mobile
kubit-forge monorepo:add apps/admin

# Add shared packages
kubit-forge monorepo:add packages/ui
kubit-forge monorepo:add packages/api-client

# Build with cache
kubit-forge monorepo:run build --parallel
```

### Nx Enterprise Monorepo

```bash
# Initialize with Nx
kubit-forge monorepo:init --tool nx

# Generate applications
kubit-forge monorepo:add apps/web --type app
kubit-forge monorepo:add apps/api --type app

# Generate libraries
kubit-forge monorepo:add libs/shared/ui --type lib
kubit-forge monorepo:add libs/shared/utils --type lib

# Show dependency graph
kubit-forge monorepo:graph

# Build affected
kubit-forge monorepo:run build --affected
```

## Troubleshooting

### Workspace Not Detected

```bash
# Validate configuration
kubit-forge monorepo:validate

# Show detected configuration
kubit-forge monorepo:info
```

### Circular Dependencies

```bash
# Check for circular dependencies
kubit-forge monorepo:graph --check-circular
```

### Cache Issues

```bash
# Clear cache
kubit-forge monorepo:cache clear

# Disable cache temporarily
kubit-forge monorepo:run build --no-cache
```

### Version Conflicts

```bash
# Check version consistency
kubit-forge monorepo:check-versions

# Dedupe dependencies
kubit-forge monorepo:dedupe
```

## Integration with Other Features

### With Doctor Command

```bash
# Check monorepo health
kubit-forge doctor --monorepo
```

### With Dependency Management

```bash
# Analyze monorepo dependencies
kubit-forge deps:analyze --monorepo
```

### With Recipes

```toml
# recipe.toml
[recipe]
name = "monorepo-setup"
description = "Setup complete monorepo structure"

[[tasks]]
id = "init"
command = "monorepo:init"
args = ["--tool", "yarn"]

[[tasks]]
id = "add-packages"
command = "monorepo:add"
args = ["packages/ui"]
depends_on = ["init"]
```

## Related Documentation

- [Configuration](./CONFIGURATION.md) - Configure monorepo settings
- [Dependency Management](./DEPENDENCY_MANAGEMENT.md) - Manage dependencies
- [Recipe System](./RECIPE-SYSTEM.md) - Automate monorepo tasks

---

**Need help?** Run `kubit-forge monorepo --help` or visit [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues).
