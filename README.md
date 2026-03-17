# Kubit Forge

> **A world-class, extensible CLI for modern web development with enterprise-grade features**

[![Version](https://img.shields.io/npm/v/kubit-forge.svg)](https://www.npmjs.com/package/kubit-forge)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Yarn](https://img.shields.io/badge/yarn-%3E%3D4.9.1-blue.svg)](https://yarnpkg.com/)

**Kubit Forge** is an open-source, production-ready CLI that empowers developers to build modern web applications with confidence. From zero-config project initialization to AI-powered diagnostics, Kubit Forge provides everything you need to develop, test, and deploy world-class applications.

---

## 📚 Documentation

**[📖 Documentation Index](./docs/INDEX.md)** - Complete documentation hub

### Quick Access

**Getting Started:**

- **[Quick Start Guide](./docs/getting-started/quick-start.md)** - Create your first project
- **[Adding Features](./docs/getting-started/adding-features.md)** - Extend your project

**Core Features:**

- **[Commands](./docs/core/commands.md)** - Daily workflow commands
- **[Configuration](./docs/core/configuration.md)** - Configure your project
- **[Code Generation](./docs/core/code-generation.md)** - Generate components

**Framework & Extensibility:**

- **[Framework Overview](./docs/framework/overview.md)** - Build custom CLIs ⭐
- **[runCLI API](./docs/framework/run-cli-api.md)** - Complete API reference ⭐
- **[Plugin System](./docs/framework/plugins.md)** - Extend functionality
- **[Recipe System](./docs/framework/recipes.md)** - Automate workflows
- **[Plugins vs Recipes](./docs/framework/plugins-vs-recipes.md)** - Understanding the difference

**Advanced Features:**

- **[Doctor](./docs/features/doctor.md)** - AI-powered diagnostics
- **[Security](./docs/features/security.md)** - Security audits & SBOM
- **[Monorepo](./docs/features/monorepo.md)** - Monorepo support

---

## Table of Contents

- [Why Kubit Forge?](#why-kubit-forge)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Commands](#core-commands)
- [Plugin System](#plugin-system)
- [Recipe System](#recipe-system)
- [Monorepo Support](#monorepo-support)
- [Doctor Command](#doctor-command)
- [Smart Dependency Management](#smart-dependency-management)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Why Kubit Forge?

### Built for Modern Development

- **Zero Configuration** - Start building immediately with sensible defaults
- **TypeScript First** - Full type safety and IntelliSense support
- **Lightning Fast** - Powered by Vite for instant HMR and optimized builds
- **Extensible** - Plugin and recipe systems for unlimited customization
- **Enterprise Ready** - Advanced diagnostics and compliance tools

### Developer Experience

- **AI-Powered Diagnostics** - Intelligent issue detection and auto-fix
- **Predictive Analysis** - Prevent problems before they happen
- **Package Manager Agnostic** - Works with npm, yarn, and pnpm
- **Monorepo Support** - First-class support for Turborepo, Nx, pnpm workspaces, and more

---

## Features

### Project Initialization & Scaffolding

**[📖 Full Documentation](./docs/PROJECT-INITIALIZATION.md)**

Create production-ready projects in seconds:

```bash
# React + TypeScript
kubit-forge init react my-app

# Vanilla TypeScript
kubit-forge init vanilla my-app
```

**What you get:**

- TypeScript configuration
- Vite build setup
- OxLint & ESLint with Kubit plugin
- Testing infrastructure
- Git initialization
- Package manager detection

### Template System

Bootstrap projects with pre-configured templates:

```bash
# List available templates
kubit-forge template:list

# Use a template
kubit-forge template:use react-ts-bernova my-app
```

**Available Templates:**

- `react-ts` - React + TypeScript
- `react-ts-bernova` - React + TypeScript + Bernova Design System
- `react-ts-storybook` - React + TypeScript + Storybook
- `vanilla-ts` - Vanilla TypeScript

### Add Command - Feature Installation

**[📖 Full Documentation](./docs/ADD-COMMAND.md)**

Add features to existing projects with zero configuration:

```bash
# Add linting
kubit-forge add oxlint      # OxLint + Kubit rules via jsPlugins (recommended)
kubit-forge add eslint       # ESLint + Kubit plugin
kubit-forge add prettier

# Add testing
kubit-forge add vitest
kubit-forge add playwright
kubit-forge add testing-library

# Add styling
kubit-forge add bernova
kubit-forge add styled-components

# Add development tools
kubit-forge add storybook
kubit-forge add husky
kubit-forge add lint-staged
kubit-forge add commitlint
kubit-forge add changesets

# Add routing
kubit-forge add react-router
```

### Linting

Kubit Forge supports both **OxLint** (Rust-based, fast) and **ESLint**, with automatic detection:

```bash
# The lint command auto-detects which linter to use:
# - .oxlintrc.json present → runs OxLint first, then ESLint if also configured
# - Only eslint.config.js   → runs ESLint
kubit-forge lint
kubit-forge lint --fix
```

**OxLint integration** uses [`jsPlugins`](https://oxc.rs/docs/guide/usage/linter/js-plugins) to load all 10 Kubit rules natively — no ESLint required for those rules. When both are configured, OxLint handles the heavy lifting while ESLint covers rules OxLint doesn't support (Prettier, Perfectionist).

### Development Commands

**[📖 Full Documentation](./docs/DEVELOPMENT-COMMANDS.md)**

Streamlined development workflow:

```bash
# Start development server
kubit-forge dev

# Build for production
kubit-forge build

# Run tests
kubit-forge test

# Lint code (auto-detects OxLint or ESLint)
kubit-forge lint --fix

# Format code
kubit-forge format

# Type check
kubit-forge typecheck

# Run all checks
kubit-forge check
```

### Quality & Diagnostics

**[📖 Full Documentation](./docs/DOCTOR-COMMAND.md)**

```bash
# Show project information
kubit-forge info --detailed

# AI-powered diagnostics
kubit-forge doctor

# Auto-fix issues
kubit-forge doctor --fix

# Predictive analysis
kubit-forge doctor --predictive
```

---

## Plugin System

**[📖 Full Documentation](./docs/framework/plugins.md)** | **[Plugins vs Recipes Guide](./docs/framework/plugins-vs-recipes.md)**

### Core CLI Philosophy

Kubit Forge core is intentionally **lightweight and focused** on essential commands. Advanced features are available as **optional plugins** that you install only when needed.

Extend Kubit Forge with powerful plugins:

### Plugin Commands

```bash
# Search for plugins
kubit-forge plugin:search testing

# Install a plugin
kubit-forge plugin:install @kubit/plugin-analytics

# List installed plugins
kubit-forge plugin:list

# Verify plugin integrity
kubit-forge plugin:verify @kubit/plugin-analytics
```

### Plugin Capabilities

- **Custom Commands** - Add new CLI commands
- **Lifecycle Hooks** - Hook into build, dev, and other events
- **Custom Generators** - Add code generators
- **Configuration Extensions** - Extend project configuration
- **Task Runners** - Add custom task execution

### Creating a Plugin

```typescript
// my-plugin.ts
import { Plugin } from 'kubit-forge';

export default {
  name: 'my-plugin',
  version: '1.0.0',

  commands: {
    'my-command': async (args) => {
      console.log('Running my custom command!');
    },
  },

  hooks: {
    'build:before': async () => {
      console.log('Before build hook');
    },
  },
} satisfies Plugin;
```

---

## Recipe System

**[📖 Full Documentation](./docs/RECIPE-SYSTEM.md)**

Automate complex workflows with declarative recipes:

### Recipe Commands

```bash
# List available recipes
kubit-forge recipe:list

# Run a recipe
kubit-forge recipe:run react-setup

# Add custom recipe
kubit-forge recipe:add ./my-recipe.toml
```

### Built-in Recipes

- **react-setup** - Complete React project setup
- **testing-setup** - Full testing infrastructure
- **ci-cd-setup** - CI/CD pipeline configuration

### Recipe Features

- **DAG-based Execution** - Parallel task execution with dependency resolution
- **Declarative Syntax** - TOML-based configuration
- **Composable** - Combine multiple recipes
- **Idempotent** - Safe to run multiple times

### Example Recipe

```toml
[recipe]
name = "react-setup"
description = "Complete React project setup"
version = "1.0.0"

[[tasks]]
id = "install-deps"
command = "add"
args = ["react", "react-dom"]

[[tasks]]
id = "add-eslint"
command = "add"
args = ["eslint"]
depends_on = ["install-deps"]

[[tasks]]
id = "add-prettier"
command = "add"
args = ["prettier"]
depends_on = ["install-deps"]

[[tasks]]
id = "add-testing"
command = "add"
args = ["vitest"]
depends_on = ["install-deps"]
```

---

## Monorepo Support

**[Full Documentation](./docs/MONOREPO-SUPPORT.md)**

First-class support for monorepo tools:

### Supported Tools

- **Yarn workspaces**
- **pnpm workspaces**
- **npm workspaces**
- **Turborepo**
- **Nx**
- **Lerna**

### Monorepo Commands

```bash
# Initialize monorepo
kubit-forge monorepo:init --tool yarn

# Add package to monorepo
kubit-forge monorepo:add my-package

# List all packages
kubit-forge monorepo:list

# Show monorepo information
kubit-forge monorepo:info
```

### Features

- **Workspace Detection** - Automatic detection of monorepo structure
- **Dependency Management** - Smart dependency resolution
- **Task Orchestration** - Parallel task execution across packages
- **Selective Builds** - Build only affected packages

---

## Doctor Command

**[📖 Full Documentation](./docs/DOCTOR-COMMAND.md)**

AI-powered diagnostics with auto-fix capabilities:

```bash
# Run diagnostics
kubit-forge doctor

# Auto-fix issues
kubit-forge doctor --fix

# Predictive analysis
kubit-forge doctor --predictive
```

### Doctor Capabilities

- **Intelligent Issue Detection** - AI-powered problem identification
- **Auto-fix** - Automatic issue resolution
- **Predictive Analysis** - Prevent issues before they happen
- **Dependency Health Checks** - Verify dependency integrity
- **Configuration Validation** - Validate project configuration
- **Security Vulnerability Detection** - Scan for vulnerabilities
- **Performance Analysis** - Identify performance bottlenecks
- **IDE Integration** - Support for VS Code and other IDEs
- **Personalized Recommendations** - Context-aware suggestions

### Example Output

```
Running diagnostics...

✓ TypeScript configuration is valid
✓ Dependencies are up to date
⚠ ESLint configuration has warnings
  → Auto-fix available: kubit-forge doctor --fix

✓ No security vulnerabilities found
⚠ Performance: Large bundle size detected
  → Recommendation: Enable code splitting

Predictive Analysis:
  → Potential issue: Deprecated dependency detected
  → Action: Update to @package/new-version
```

---

## Smart Dependency Management

**[📖 Full Documentation](./docs/DEPENDENCY_MANAGEMENT.md)**

Intelligent dependency analysis and optimization:

```bash
# Visualize dependency tree
kubit-forge deps:analyze

# Explain why a package is installed
kubit-forge deps:why <package>

# Find and eliminate duplicates
kubit-forge deps:dedupe

# Smart update suggestions
kubit-forge deps:update

# Discover better alternatives
kubit-forge deps:alternatives <package>

# Export dependency report
kubit-forge deps:export --format markdown
```

### Dependency Management Features

- **Visual Dependency Tree** - Interactive tree visualization with filtering
- **Package Origin Analysis** - Understand dependency chains
- **Smart Deduplication** - Eliminate redundant packages automatically
- **Intelligent Updates** - Safety analysis with breaking change detection
- **Alternative Suggestions** - Discover lighter, modern replacements
- **Security Focus** - Highlight vulnerabilities and critical updates
- **Export Reports** - JSON, Markdown, CSV formats for documentation
- **Bundle Optimization** - Reduce package count and bundle size

### Example Workflow

```bash
# 1. Analyze current state
kubit-forge deps:analyze --depth 3

# 2. Check for duplicates
kubit-forge deps:dedupe --dry-run

# 3. Find better alternatives
kubit-forge deps:alternatives moment

# 4. Check for updates
kubit-forge deps:update --security

# 5. Export report
kubit-forge deps:export --format markdown
```

**Learn more:** See [DEPENDENCY_MANAGEMENT.md](docs/DEPENDENCY_MANAGEMENT.md) for complete documentation.

---

## Migrations & Upgrades

**[📖 Full Documentation](./docs/MIGRATIONS-UPGRADES.md)**

Safe upgrades and automated refactoring:

```bash
# Upgrade dependencies
kubit-forge upgrade

# Run migration
kubit-forge migrate <codename>

# List available migrations
kubit-forge migrate:list
```

### Migration Features

- **Automated Refactoring** - Safe code transformations
- **Breaking Change Detection** - Identify breaking changes
- **Rollback Support** - Undo migrations if needed
- **Dry Run** - Preview changes before applying
- **Custom Migrations** - Create organization-specific migrations

---

## Code Generation

**[📖 Full Documentation](./docs/core/code-generation.md)**

Generate code scaffolds with best practices:

```bash
# Generate component
kubit-forge generate component Button

# Generate page
kubit-forge generate page Home

# Generate hook
kubit-forge generate hook useAuth

# Generate service
kubit-forge generate service api

# Generate utility
kubit-forge generate util formatDate

# Generate test
kubit-forge generate test Button
```

### Generator Features

- **TypeScript Support** - Full type safety
- **Best Practices** - Follow industry standards
- **Customizable Templates** - Override default templates
- **Consistent Structure** - Maintain project consistency

---

## Configuration

**[📖 Full Documentation](./docs/CONFIGURATION.md)**

Configure Kubit Forge with `kubit.config.toml`:

```toml
[project]
name = "my-app"
version = "1.0.0"
description = "My awesome app"

[build]
outDir = "dist"
sourcemap = true
minify = true

[dev]
port = 3000
open = true
host = "localhost"

[quality]
lint = true
format = true
typecheck = true
test = true

[plugins]
enabled = ["@kubit/plugin-analytics", "@kubit/plugin-sentry"]

[paths]
src = "./src"
public = "./public"
dist = "./dist"
```

---

## Environment Variables

**[📖 Full Documentation](./docs/ENVIRONMENT-MANAGEMENT.md)**

Manage environment variables securely:

```bash
# Initialize .env file
kubit-forge env init

# Validate environment variables
kubit-forge env validate

# Show environment info
kubit-forge env info
```

---

## Business Integration

Extend Kubit Forge for your organization:

### Enterprise Features

- **Custom Command Registration** - Add organization-specific commands
- **Private Plugin Registry** - Host internal plugins
- **Organization Templates** - Company-specific project templates
- **Compliance Tools** - Custom compliance checks
- **Custom Recipes** - Organization-specific workflows

### Example: Custom Command

```typescript
// .kubit/commands/deploy.ts
export default {
  name: 'deploy',
  description: 'Deploy to company infrastructure',

  async execute(args) {
    // Custom deployment logic
    console.log('Deploying to production...');
  },
};
```

---

## Installation

### Prerequisites

- **Node.js** >= 20.0.0
- **Yarn** >= 4.9.1 (recommended) or npm

### Global Installation

```bash
# Using npm (recommended for global installs)
npm install -g kubit-forge

# Using yarn
yarn add -D kubit-forge
```

### Local Installation

```bash
# Using yarn
yarn add -D kubit-forge

# Using npm
npm install --save-dev kubit-forge
```

### Verify Installation

```bash
kubit-forge --version
kubit-forge --help
```

---

## Quick Start

### 1. Create a New Project

```bash
# Create React app
kubit-forge init react my-app
cd my-app

# Start development server
kubit-forge dev
```

### 2. Add Features

```bash
# Add testing
kubit-forge add vitest

# Add Storybook
kubit-forge add storybook

# Add linting (OxLint recommended for speed)
kubit-forge add oxlint
```

### 3. Run Quality Checks

```bash
# Run all checks
kubit-forge check

# Or run individually
kubit-forge lint
kubit-forge typecheck
kubit-forge test
```

### 4. Build for Production

```bash
kubit-forge build
```

---

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- **Report Bugs** - Open an issue on GitHub
- **Suggest Features** - Share your ideas
- **Submit PRs** - Fix bugs or add features
- **Improve Documentation** - Help others learn
- **Create Plugins** - Extend functionality
- **Share Recipes** - Automate workflows

### Development Setup

```bash
# Clone the repository
git clone https://github.com/kubit-ui/kubit-forge.git
cd kubit-forge

# Install dependencies
yarn install

# Build the project
yarn build

# Link for local development
yarn dev:link

# Run tests
yarn test

# Run linter
yarn lint
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org/)
4. Push to your fork (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new plugin system
fix: resolve build issue
docs: update README
chore: update dependencies
test: add unit tests
```

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## Community

- **GitHub Discussions** - Ask questions and share ideas
- **Discord** - Join our community (coming soon)
- **Twitter** - Follow [@kubit_ui](https://twitter.com/kubit_ui)
- **Blog** - Read about new features and best practices

---

## Roadmap

### Current (v0.x)

- ✅ Core CLI functionality
- ✅ Plugin system
- ✅ Recipe system
- ✅ Monorepo support
- ✅ Doctor command
- ✅ Smart Dependency Management
- ✅ OxLint integration with Kubit jsPlugins

### Upcoming (v1.x)

- 🔄 Visual Studio Code extension
- 🔄 Cloud deployment integrations
- 🔄 Advanced caching strategies
- 🔄 Remote plugin registry
- 🔄 AI-powered code reviews
- 🔄 Performance profiling tools

### Future (v2.x)

- 📋 Multi-language support (Go, Rust, Python)
- 📋 Kubernetes integration
- 📋 Serverless deployment
- 📋 Advanced monitoring and observability

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes.

---

## License

Kubit Forge is [MIT licensed](LICENSE).

---

## Acknowledgments

Built with ❤️ by the Kubit team and [contributors](https://github.com/kubit-ui/kubit-forge/graphs/contributors).

Special thanks to:

- [Vite](https://vitejs.dev/) - Lightning-fast build tool
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Changesets](https://github.com/changesets/changesets) - Version management
- [Yarn Berry](https://yarnpkg.com/) - Modern, fast package manager

---

## Support

- **Documentation** - [docs.kubit-ui.com](https://docs.kubit-ui.com)
- **Issues** - [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues)
- **Discussions** - [GitHub Discussions](https://github.com/kubit-ui/kubit-forge/discussions)
- **Email** - team@kubit-forge.org

---

<div align="center">

**[Website](https://kubit-ui.com)** • **[Documentation](https://docs.kubit-ui.com)** • **[GitHub](https://github.com/kubit-ui/kubit-forge)** • **[NPM](https://www.npmjs.com/package/kubit-forge)**

Made with ❤️ for the open-source community

</div>
