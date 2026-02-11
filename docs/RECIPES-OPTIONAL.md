# Optional Recipes

**Pre-configured workflows and setups for advanced use cases**

Optional recipes provide ready-to-use configurations for common workflows that complement the core CLI functionality and optional plugins.

## 📦 Available Recipes

### 🔒 Security & SBOM Workflow

**Recipe**: `security-sbom-workflow`  
**Requires**: `@kubit/plugin-security`

Complete security and SBOM generation workflow for CI/CD pipelines.

**Features:**

- Automated security audits
- SBOM generation (CycloneDX, SPDX, XML)
- GitHub Actions integration
- Security check in prerelease
- Compliance reporting

**Usage:**

```bash
# Apply recipe
kubit-forge recipe apply security-sbom-workflow

# With custom variables
kubit-forge recipe apply security-sbom-workflow \
  --var sbomFormat=spdx \
  --var auditLevel=high
```

**Variables:**

- `sbomFormat` - SBOM format (cyclonedx, spdx, json, xml) - default: `cyclonedx`
- `auditLevel` - Minimum severity (low, moderate, high, critical) - default: `moderate`

**What it sets up:**

- ✅ Security plugin installation and configuration
- ✅ GitHub Actions workflow for security audits
- ✅ npm scripts for security commands
- ✅ Prerelease security hooks
- ✅ SBOM in .gitignore

---

### 🏥 Doctor Advanced Workflow

**Recipe**: `doctor-advanced-workflow`  
**Requires**: `@kubit/plugin-doctor-advanced`

Advanced diagnostics with auto-fix, predictive analysis, and IDE integration.

**Features:**

- Auto-fix for common issues
- Predictive issue detection
- GitHub Code Scanning integration (SARIF)
- VS Code tasks integration
- Export to multiple formats

**Usage:**

```bash
# Apply recipe
kubit-forge recipe apply doctor-advanced-workflow

# Enable auto-fix in CI
kubit-forge recipe apply doctor-advanced-workflow \
  --var enableAutoFix=true \
  --var exportFormat=sarif
```

**Variables:**

- `enableAutoFix` - Enable auto-fix in CI - default: `false`
- `exportFormat` - Export format (json, vscode, sarif, checkstyle) - default: `sarif`

**What it sets up:**

- ✅ Doctor advanced plugin installation
- ✅ GitHub Actions workflow with diagnostics
- ✅ SARIF export for Code Scanning
- ✅ VS Code tasks for doctor commands
- ✅ npm scripts for advanced features

---

### 🧪 Complete Testing Setup

**Recipe**: `testing-complete-setup`  
**Requires**: None (installs all dependencies)

Professional testing setup with Vitest, React Testing Library, and coverage.

**Features:**

- Vitest with React support
- Coverage with thresholds
- React Testing Library
- GitHub Actions CI integration
- Codecov integration
- Optional Playwright for E2E

**Usage:**

```bash
# Apply recipe
kubit-forge recipe apply testing-complete-setup

# With E2E testing
kubit-forge recipe apply testing-complete-setup \
  --var coverageThreshold=90 \
  --var includeE2E=true
```

**Variables:**

- `coverageThreshold` - Minimum coverage (%) - default: `80`
- `includeE2E` - Include Playwright - default: `false`

**What it sets up:**

- ✅ Vitest + React Testing Library
- ✅ Coverage configuration with thresholds
- ✅ Example test files
- ✅ GitHub Actions test workflow
- ✅ Codecov integration
- ✅ (Optional) Playwright E2E setup

---

### 🏢 Turborepo Monorepo Setup

**Recipe**: `monorepo-turborepo-setup`  
**Requires**: pnpm

Complete Turborepo monorepo with caching and pipeline configuration.

**Features:**

- Turborepo with build pipelines
- Workspace structure
- Shared TypeScript configs
- Build caching
- CI/CD integration
- Optional remote caching

**Usage:**

```bash
# Apply recipe
kubit-forge recipe apply monorepo-turborepo-setup

# With custom workspaces
kubit-forge recipe apply monorepo-turborepo-setup \
  --var workspaces='["apps/web","apps/api","packages/ui"]' \
  --var enableRemoteCache=true
```

**Variables:**

- `workspaces` - Array of workspace paths - default: `["apps/web", "packages/ui", "packages/utils"]`
- `enableRemoteCache` - Enable remote caching - default: `false`

**What it sets up:**

- ✅ Turborepo installation and config
- ✅ pnpm workspace configuration
- ✅ Workspace directory structure
- ✅ Shared TypeScript configs
- ✅ Build pipelines (build, test, lint, dev)
- ✅ GitHub Actions with Turbo
- ✅ (Optional) Remote cache setup

---

## 🎯 When to Use Recipes

### ✅ Use recipes when:

- Setting up new projects with specific workflows
- Implementing best practices quickly
- Standardizing team configurations
- Integrating CI/CD pipelines
- Need reproducible setups

### ❌ Don't use recipes if:

- You have custom requirements
- Simple projects without CI/CD
- Learning/experimental projects
- Need full control over configuration

---

## 🚀 Quick Start

### 1. List available recipes

```bash
kubit-forge recipe list
```

### 2. View recipe details

```bash
kubit-forge recipe show security-sbom-workflow
```

### 3. Apply a recipe

```bash
kubit-forge recipe apply security-sbom-workflow
```

### 4. Apply with variables

```bash
kubit-forge recipe apply testing-complete-setup \
  --var coverageThreshold=90 \
  --var includeE2E=true
```

---

## 📋 Recipe Structure

Recipes are JSON files with the following structure:

```json
{
  "name": "recipe-name",
  "version": "1.0.0",
  "description": "Recipe description",
  "author": "Author",
  "tags": ["tag1", "tag2"],
  "category": "category",
  "requires": {
    "kubitVersion": "^3.0.0",
    "plugins": ["@kubit/plugin-name"],
    "tools": ["git", "pnpm"]
  },
  "variables": {
    "varName": {
      "type": "string|boolean|number|array",
      "description": "Variable description",
      "default": "default-value"
    }
  },
  "steps": [
    {
      "id": "step-id",
      "name": "Step name",
      "type": "shell|file",
      "script": "command to run",
      "condition": "{{ variable }}"
    }
  ]
}
```

---

## 🎨 Creating Custom Recipes

### 1. Create recipe file

```bash
# Create in your project
mkdir -p .kubit/recipes
touch .kubit/recipes/my-workflow.json
```

### 2. Define recipe structure

```json
{
  "name": "my-workflow",
  "version": "1.0.0",
  "description": "My custom workflow",
  "steps": [
    {
      "id": "install-deps",
      "name": "Install dependencies",
      "type": "shell",
      "script": "pnpm add -D my-package"
    }
  ]
}
```

### 3. Apply custom recipe

```bash
kubit-forge recipe apply .kubit/recipes/my-workflow.json
```

---

## 🔄 Recipe Combinations

Recipes can be combined for complete setups:

```bash
# Enterprise setup
kubit-forge recipe apply security-sbom-workflow
kubit-forge recipe apply doctor-advanced-workflow
kubit-forge recipe apply testing-complete-setup

# Monorepo setup
kubit-forge recipe apply monorepo-turborepo-setup
kubit-forge recipe apply testing-complete-setup
```

---

## 📚 Example Workflows

### Enterprise Project Setup

```bash
# 1. Initialize project
kubit-forge init my-app --stack react

# 2. Apply security workflow
kubit-forge recipe apply security-sbom-workflow \
  --var sbomFormat=spdx \
  --var auditLevel=high

# 3. Apply testing setup
kubit-forge recipe apply testing-complete-setup \
  --var coverageThreshold=90 \
  --var includeE2E=true

# 4. Apply doctor workflow
kubit-forge recipe apply doctor-advanced-workflow \
  --var exportFormat=sarif
```

### Monorepo Project Setup

```bash
# 1. Initialize monorepo
kubit-forge monorepo:init my-monorepo

# 2. Setup Turborepo
kubit-forge recipe apply monorepo-turborepo-setup \
  --var workspaces='["apps/web","apps/api","packages/ui"]'

# 3. Add testing
kubit-forge recipe apply testing-complete-setup
```

### Compliance-Focused Setup

```bash
# 1. Security first
kubit-forge recipe apply security-sbom-workflow \
  --var sbomFormat=cyclonedx \
  --var auditLevel=critical

# 2. Advanced diagnostics
kubit-forge recipe apply doctor-advanced-workflow \
  --var exportFormat=sarif

# 3. Comprehensive testing
kubit-forge recipe apply testing-complete-setup \
  --var coverageThreshold=95
```

---

## 🆘 Troubleshooting

### Recipe not found

**Issue**: Recipe not found in registry

**Solution**: Check recipe name or use full path

```bash
kubit-forge recipe list  # See available recipes
kubit-forge recipe apply /path/to/recipe.json
```

### Variable type mismatch

**Issue**: Invalid variable type

**Solution**: Check recipe schema

```bash
kubit-forge recipe show <recipe-name>  # See required variables
```

### Step failed

**Issue**: Recipe step failed to execute

**Solution**: Check requirements and permissions

```bash
# Check requirements
kubit-forge doctor

# Retry with verbose output
kubit-forge recipe apply <recipe> --verbose
```

---

## 🔗 Related Documentation

- [Core Recipes](./RECIPES.md)
- [Plugin System](./PLUGIN-SYSTEM.md)
- [Security Plugin](./PLUGIN-SECURITY.md)
- [Doctor Advanced Plugin](./PLUGIN-DOCTOR-ADVANCED.md)

---

**Need a custom recipe?** Open an issue or submit a PR with your recipe at [GitHub](https://github.com/kubit-ui/kubit-forge/issues).
