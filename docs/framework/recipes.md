# Recipe System

## Overview

The Recipe System in Kubit Forge allows you to automate complex workflows using declarative TOML configurations. Recipes are composable, idempotent, and execute tasks in parallel using DAG (Directed Acyclic Graph) based dependency resolution.

## Why Use Recipes?

- **Automation** - Automate repetitive setup tasks
- **Consistency** - Ensure standardized project setup
- **Reproducibility** - Share workflows across teams
- **Parallel Execution** - Tasks run in parallel when possible
- **Dependency Management** - Automatic dependency resolution
- **Idempotent** - Safe to run multiple times

## Quick Start

```bash
# List available recipes
kubit-forge recipe:list

# Run a recipe
kubit-forge recipe:run react-setup

# Run with options
kubit-forge recipe:run testing-setup --coverage

# Add custom recipe
kubit-forge recipe:add ./my-recipe.toml

# Validate recipe
kubit-forge recipe:validate ./my-recipe.toml
```

## Recipe Structure

### Basic Recipe

```toml
[recipe]
name = "basic-setup"
description = "Basic project setup"
version = "1.0.0"
author = "Your Name"

[[tasks]]
id = "install-deps"
command = "add"
args = ["react", "react-dom"]

[[tasks]]
id = "add-typescript"
command = "add"
args = ["typescript"]
depends_on = ["install-deps"]
```

### Complete Recipe Example

```toml
[recipe]
name = "complete-react-setup"
description = "Complete React project setup with testing and quality tools"
version = "2.0.0"
author = "Kubit Team"
tags = ["react", "typescript", "testing"]

# Recipe configuration
[config]
parallel = true           # Enable parallel execution
timeout = 600000         # Global timeout (10 minutes)
continue_on_error = false # Stop on first error

# Environment variables
[env]
NODE_ENV = "development"
CI = "false"

# Task definitions
[[tasks]]
id = "install-react"
description = "Install React and React DOM"
command = "add"
args = ["react", "react-dom"]
timeout = 60000

[[tasks]]
id = "add-typescript"
description = "Add TypeScript support"
command = "add"
args = ["typescript", "@types/react", "@types/react-dom"]
depends_on = ["install-react"]

[[tasks]]
id = "add-vite"
description = "Add Vite build tool"
command = "add"
args = ["vite", "@vitejs/plugin-react"]
depends_on = ["install-react"]

[[tasks]]
id = "add-eslint"
description = "Add ESLint"
command = "add"
args = ["eslint"]
depends_on = ["add-typescript"]

[[tasks]]
id = "add-prettier"
description = "Add Prettier"
command = "add"
args = ["prettier"]
depends_on = []  # Can run in parallel

[[tasks]]
id = "add-vitest"
description = "Add Vitest for testing"
command = "add"
args = ["vitest"]
depends_on = ["add-typescript"]

[[tasks]]
id = "add-testing-library"
description = "Add React Testing Library"
command = "add"
args = ["@testing-library/react", "@testing-library/jest-dom"]
depends_on = ["add-vitest", "install-react"]

[[tasks]]
id = "setup-git-hooks"
description = "Setup Husky and lint-staged"
command = "add"
args = ["husky", "lint-staged"]
depends_on = ["add-eslint", "add-prettier"]

[[tasks]]
id = "create-tests"
description = "Generate example test file"
command = "generate"
args = ["test", "App"]
depends_on = ["add-testing-library"]

# Post-install script
[[tasks]]
id = "final-setup"
description = "Run final setup commands"
command = "exec"
args = ["npm", "run", "prepare"]
depends_on = ["setup-git-hooks"]
```

## Built-in Recipes

### react-setup

Complete React project configuration.

```bash
kubit-forge recipe:run react-setup
```

**Includes:**

- React & React DOM
- TypeScript
- Vite
- ESLint & Prettier
- Testing setup

### testing-setup

Comprehensive testing infrastructure.

```bash
kubit-forge recipe:run testing-setup
```

**Includes:**

- Vitest (unit tests)
- Testing Library (component tests)
- Playwright (E2E tests)
- Coverage configuration

### ci-cd-setup

CI/CD pipeline configuration.

```bash
kubit-forge recipe:run ci-cd-setup
```

**Includes:**

- GitHub Actions workflows
- Pre-commit hooks
- Automated testing
- Build verification

### quality-tools

Code quality and formatting tools.

```bash
kubit-forge recipe:run quality-tools
```

**Includes:**

- ESLint
- Prettier
- Husky
- Lint-staged
- Commitlint

### storybook-setup

Storybook component documentation.

```bash
kubit-forge recipe:run storybook-setup
```

**Includes:**

- Storybook installation
- Configuration
- Example stories
- Add-ons

## Task Types

### Command Task

Execute Kubit Forge commands:

```toml
[[tasks]]
id = "add-package"
command = "add"
args = ["package-name"]
```

### Shell Task

Run shell commands:

```toml
[[tasks]]
id = "custom-script"
command = "exec"
args = ["bash", "-c", "echo 'Hello World'"]
```

### File Task

Create or modify files:

```toml
[[tasks]]
id = "create-config"
command = "file:write"
args = [".env", "API_KEY=your-key-here"]
```

### Generator Task

Run code generators:

```toml
[[tasks]]
id = "create-component"
command = "generate"
args = ["component", "Button"]
```

## Dependency Resolution

### Parallel Execution

Tasks without dependencies run in parallel:

```toml
[[tasks]]
id = "task-a"
command = "add"
args = ["package-a"]

[[tasks]]
id = "task-b"
command = "add"
args = ["package-b"]
# task-a and task-b run in parallel
```

### Sequential Execution

Use `depends_on` for sequential execution:

```toml
[[tasks]]
id = "install-base"
command = "add"
args = ["react"]

[[tasks]]
id = "install-types"
command = "add"
args = ["@types/react"]
depends_on = ["install-base"]
# install-types waits for install-base
```

### Complex Dependencies

Multiple dependencies are supported:

```toml
[[tasks]]
id = "task-a"
command = "add"
args = ["package-a"]

[[tasks]]
id = "task-b"
command = "add"
args = ["package-b"]

[[tasks]]
id = "task-c"
command = "add"
args = ["package-c"]
depends_on = ["task-a", "task-b"]
# task-c waits for both task-a and task-b
```

## Advanced Features

### Conditional Execution

Execute tasks based on conditions:

```toml
[[tasks]]
id = "add-react-router"
command = "add"
args = ["react-router-dom"]
when = { file_exists = "src/pages" }

[[tasks]]
id = "setup-monorepo"
command = "monorepo:init"
args = []
when = { not_exists = "pnpm-workspace.yaml" }
```

### Task Retries

Configure retry behavior:

```toml
[[tasks]]
id = "flaky-task"
command = "exec"
args = ["npm", "install"]
retry = 3
retry_delay = 5000  # 5 seconds
```

### Timeout Configuration

Set task-specific timeouts:

```toml
[[tasks]]
id = "long-running-task"
command = "build"
args = []
timeout = 300000  # 5 minutes
```

### Environment Variables

Pass environment variables to tasks:

```toml
[[tasks]]
id = "build-prod"
command = "build"
args = []
env = { NODE_ENV = "production", API_URL = "https://api.example.com" }
```

### Task Hooks

Execute code before/after tasks:

```toml
[[tasks]]
id = "deploy"
command = "deploy"
args = []

[tasks.hooks]
before = ["npm test", "npm run build"]
after = ["npm run notify"]
```

## Creating Custom Recipes

### Recipe Template

```toml
[recipe]
name = "my-custom-recipe"
description = "Description of what this recipe does"
version = "1.0.0"
author = "Your Name <email@example.com>"
tags = ["custom", "organization"]

[config]
parallel = true
timeout = 300000

# Define your tasks here
[[tasks]]
id = "first-task"
# ... task configuration
```

### Best Practices

1. **Descriptive IDs** - Use clear, descriptive task IDs
2. **Granular Tasks** - Break down into small, focused tasks
3. **Document Dependencies** - Clearly define task dependencies
4. **Handle Errors** - Consider error scenarios
5. **Test Thoroughly** - Test recipes before sharing

### Example: Custom Deployment Recipe

```toml
[recipe]
name = "deploy-to-staging"
description = "Deploy application to staging environment"
version = "1.0.0"

[[tasks]]
id = "run-tests"
description = "Run all tests"
command = "test"
args = []

[[tasks]]
id = "build-app"
description = "Build application"
command = "build"
args = []
depends_on = ["run-tests"]

[[tasks]]
id = "optimize-assets"
description = "Optimize assets"
command = "assets:optimize"
args = []
depends_on = ["build-app"]

[[tasks]]
id = "sync-to-cdn"
description = "Sync assets to CDN"
command = "assets:cdn:sync"
args = ["--provider", "cloudflare"]
depends_on = ["optimize-assets"]

[[tasks]]
id = "deploy"
description = "Deploy to staging"
command = "exec"
args = ["./scripts/deploy.sh", "staging"]
depends_on = ["sync-to-cdn"]
env = { ENVIRONMENT = "staging" }

[[tasks]]
id = "health-check"
description = "Verify deployment"
command = "exec"
args = ["curl", "https://staging.example.com/health"]
depends_on = ["deploy"]
retry = 3
retry_delay = 10000
```

## Recipe Management

### Local Recipes

Store recipes in your project:

```bash
# Create recipes directory
mkdir .kubit/recipes

# Add recipe
kubit-forge recipe:add .kubit/recipes/my-recipe.toml

# Run local recipe
kubit-forge recipe:run my-recipe
```

### Shared Recipes

Share recipes via npm or git:

```bash
# From npm package
kubit-forge recipe:install @myorg/kubit-recipes

# From git repository
kubit-forge recipe:install https://github.com/org/recipes

# List installed recipes
kubit-forge recipe:list --installed
```

### Recipe Registry

Publish recipes to the Kubit registry:

```bash
# Publish recipe
kubit-forge recipe:publish ./my-recipe.toml

# Install from registry
kubit-forge recipe:install my-recipe
```

## Debugging Recipes

### Dry Run

Preview what a recipe will do:

```bash
kubit-forge recipe:run my-recipe --dry-run
```

### Verbose Output

See detailed execution logs:

```bash
kubit-forge recipe:run my-recipe --verbose
```

### Step-by-Step Execution

Run tasks one at a time:

```bash
kubit-forge recipe:run my-recipe --step
```

### Visualize Dependencies

Generate a dependency graph:

```bash
kubit-forge recipe:visualize my-recipe
```

## Error Handling

### Continue on Error

```toml
[config]
continue_on_error = true

[[tasks]]
id = "optional-task"
command = "add"
args = ["optional-package"]
optional = true  # Won't fail recipe if this fails
```

### Error Recovery

```toml
[[tasks]]
id = "risky-task"
command = "exec"
args = ["some-command"]

[tasks.on_error]
command = "exec"
args = ["cleanup-script.sh"]
```

## Performance Optimization

### Parallel Execution

Maximize parallelism:

```toml
[config]
parallel = true
max_parallel = 4  # Limit concurrent tasks
```

### Caching

Enable task result caching:

```toml
[[tasks]]
id = "expensive-task"
command = "build"
args = []
cache = true
cache_key = "build-${git_sha}"
```

## Recipe Examples

### Monorepo Setup

```toml
[recipe]
name = "monorepo-setup"

[[tasks]]
id = "init-pnpm-workspace"
command = "monorepo:init"
args = ["--tool", "pnpm"]

[[tasks]]
id = "add-packages"
command = "monorepo:add"
args = ["packages/app", "packages/lib"]
depends_on = ["init-pnpm-workspace"]

[[tasks]]
id = "setup-changesets"
command = "add"
args = ["@changesets/cli"]
depends_on = ["init-pnpm-workspace"]
```

### E-commerce Stack

```toml
[recipe]
name = "ecommerce-stack"

[[tasks]]
id = "add-routing"
command = "add"
args = ["react-router-dom"]

[[tasks]]
id = "add-state"
command = "add"
args = ["zustand"]

[[tasks]]
id = "add-ui"
command = "add"
args = ["@kubit/react-components"]

[[tasks]]
id = "add-forms"
command = "add"
args = ["react-hook-form", "zod"]

[[tasks]]
id = "add-api"
command = "add"
args = ["@tanstack/react-query", "axios"]
```

## Best Practices

1. **Version Control** - Keep recipes in version control
2. **Documentation** - Document recipe purpose and usage
3. **Testing** - Test recipes in isolated environments
4. **Idempotency** - Ensure recipes can run multiple times safely
5. **Error Messages** - Provide helpful error messages
6. **Timeouts** - Set reasonable timeouts
7. **Logging** - Include descriptive task descriptions

## FAQ

### Q: Can recipes call other recipes?

**A:** Yes, use the `recipe:run` command in a task.

### Q: How do I handle platform-specific tasks?

**A:** Use conditional execution with platform checks.

### Q: Can I use variables in recipes?

**A:** Yes, use environment variables or template syntax.

### Q: Are recipes reusable across projects?

**A:** Yes, publish them to npm or a git repository.

## Optional Pre-Built Recipes

Ready-to-use recipes for advanced workflows.

###  Security & SBOM Workflow

**Recipe**: `security-sbom-workflow`  
**Requires**: `@kubit/plugin-security`

Complete security and SBOM generation for CI/CD.

```bash
# Apply recipe
kubit-forge recipe apply security-sbom-workflow
```

**What it sets up:**

- Automated security audits
- SBOM generation (CycloneDX, SPDX)
- GitHub Actions integration
- Pre-release security checks

###  Doctor Advanced Workflow

**Recipe**: `doctor-advanced-workflow`  
**Requires**: `@kubit/plugin-doctor-advanced`

Advanced diagnostics and auto-fix setup.

```bash
kubit-forge recipe apply doctor-advanced-workflow
```

**Features:**

- Predictive analysis setup
- Auto-fix configuration
- IDE integration
- Custom health checks

###  Testing Setup Workflow

**Recipe**: `testing-setup-workflow`

Complete testing infrastructure.

```bash
kubit-forge recipe apply testing-setup-workflow
```

**Includes:**

- Unit testing (Vitest)
- E2E testing (Playwright)
- Testing Library
- Coverage configuration

###  Monorepo Setup Workflow

**Recipe**: `monorepo-setup-workflow`

Transform project into monorepo.

```bash
kubit-forge recipe apply monorepo-setup-workflow
```

**Sets up:**

- pnpm workspaces
- Turborepo configuration
- Shared configurations
- Root-level scripts

## Related Documentation

- [Plugin System](./plugins.md) - Extend functionality
- [Development Commands](../core/commands.md) - CLI commands
- [Configuration](../core/configuration.md) - Configure Kubit Forge

---

**Need help?** Open an issue on [GitHub](https://github.com/kubit-ui/kubit-forge/issues).
