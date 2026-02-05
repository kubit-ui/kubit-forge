# Kubit Forge

> **A world-class, extensible CLI for modern web development with enterprise-grade features**

[![Version](https://img.shields.io/npm/v/@kubit-ui-web/kubit-forge.svg)](https://www.npmjs.com/package/@kubit-ui-web/kubit-forge)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-orange.svg)](https://pnpm.io/)

**Kubit Forge** is an open-source, production-ready CLI that empowers developers to build modern web applications with confidence. From zero-config project initialization to AI-powered diagnostics, Kubit Forge provides everything you need to develop, test, and deploy world-class applications.

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
- [Interactive Dashboard](#interactive-dashboard)
- [Asset Optimization](#asset-optimization)
- [Security & SBOM](#security--sbom)
- [Doctor Command](#doctor-command)
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
- **Enterprise Ready** - SBOM generation, security audits, and compliance tools

### Developer Experience

- **Interactive Dashboard** - Beautiful TUI for project management
- **AI-Powered Diagnostics** - Intelligent issue detection and auto-fix
- **Predictive Analysis** - Prevent problems before they happen
- **Package Manager Agnostic** - Works with npm, yarn, and pnpm
- **Monorepo Support** - First-class support for Turborepo, Nx, pnpm workspaces, and more

---

## Features

### Project Initialization & Scaffolding

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
- ESLint & Prettier
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

Add features to existing projects with zero configuration:

```bash
# Add linting
kubit-forge add eslint
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

### Development Commands

Streamlined development workflow:

```bash
# Start development server
kubit-forge dev

# Build for production
kubit-forge build

# Run tests
kubit-forge test

# Lint code
kubit-forge lint --fix

# Format code
kubit-forge format

# Type check
kubit-forge typecheck

# Run all checks
kubit-forge check
```

### Quality & Diagnostics

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
import { Plugin } from '@kubit-ui-web/kubit-forge';

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

First-class support for monorepo tools:

### Supported Tools

- **pnpm workspaces**
- **yarn workspaces**
- **npm workspaces**
- **Turborepo**
- **Nx**
- **Lerna**

### Monorepo Commands

```bash
# Initialize monorepo
kubit-forge monorepo:init --tool pnpm

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

## Interactive Dashboard

Launch a beautiful TUI dashboard for project management:

```bash
kubit-forge dashboard
```

### Dashboard Features

- **Real-time Project Status** - Live updates on project health
- **Command Execution** - Run commands from the UI
- **Live Logs** - Stream logs in real-time
- **Plugin Management** - Visual plugin control
- **System Metrics** - CPU, memory, uptime monitoring
- **Keyboard Navigation** - Intuitive controls (1-5 for views, q to quit)

### Views

1. **Overview** - Project status and quick actions
2. **Commands** - Execute common commands
3. **Plugins** - Manage installed plugins
4. **Logs** - View real-time logs
5. **System** - System metrics and information

---

## Asset Optimization

Optimize and deploy assets with ease:

### Asset Commands

```bash
# Optimize images, fonts, and icons
kubit-forge assets:optimize --quality 85

# Compress assets
kubit-forge assets:compress --algorithm both

# Sync to CDN
kubit-forge assets:cdn:sync --provider cloudflare
```

### Supported CDN Providers

- **Cloudflare**
- **AWS S3**
- **Azure Blob Storage**
- **Custom providers** (via plugin)

### Optimization Features

- **Image Optimization** - WebP, AVIF conversion
- **Font Subsetting** - Reduce font file sizes
- **Icon Optimization** - SVG minification
- **Compression** - Gzip and Brotli compression
- **Cache Busting** - Automatic versioning

---

## Security & SBOM

Generate Software Bill of Materials and security audits:

### SBOM Commands

```bash
# Generate SBOM
kubit-forge sbom:generate --format json

# Validate dependencies
kubit-forge sbom:validate

# Security audit
kubit-forge security:audit
```

### Supported Formats

- **JSON** - Standard JSON format
- **XML** - XML format
- **SPDX** - Software Package Data Exchange
- **CycloneDX** - OWASP CycloneDX format

### Security Features

- **Dependency Scanning** - Identify vulnerable dependencies
- **License Compliance** - Check license compatibility
- **Supply Chain Security** - Verify package integrity
- **Automated Reporting** - Generate compliance reports

---

## Doctor Command

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

## Migrations & Upgrades

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
- **pnpm** >= 10.0.0 (recommended) or npm/yarn

### Global Installation

```bash
# Using pnpm (recommended)
pnpm add -g @kubit-ui-web/kubit-forge

# Using npm
npm install -g @kubit-ui-web/kubit-forge

# Using yarn
yarn global add @kubit-ui-web/kubit-forge
```

### Local Installation

```bash
# Using pnpm
pnpm add -D @kubit-ui-web/kubit-forge

# Using npm
npm install --save-dev @kubit-ui-web/kubit-forge

# Using yarn
yarn add -D @kubit-ui-web/kubit-forge
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

# Add linting
kubit-forge add eslint prettier
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
pnpm install

# Build the project
pnpm build

# Link for local development
pnpm dev:link

# Run tests
pnpm test

# Run linter
pnpm lint
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
- ✅ Interactive dashboard
- ✅ Asset optimization
- ✅ SBOM generation
- ✅ Doctor command

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
- [pnpm](https://pnpm.io/) - Fast, disk-efficient package manager

---

## Support

- **Documentation** - [docs.kubit-ui.com](https://docs.kubit-ui.com)
- **Issues** - [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues)
- **Discussions** - [GitHub Discussions](https://github.com/kubit-ui/kubit-forge/discussions)
- **Email** - team@kubit-forge.org

---

<div align="center">

**[Website](https://kubit-ui.com)** • **[Documentation](https://docs.kubit-ui.com)** • **[GitHub](https://github.com/kubit-ui/kubit-forge)** • **[NPM](https://www.npmjs.com/package/@kubit-ui-web/kubit-forge)**

Made with ❤️ for the open-source community

</div>
