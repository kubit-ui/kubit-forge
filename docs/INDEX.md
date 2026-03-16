# Kubit Forge Documentation Index

Welcome to Kubit Forge - a modern CLI framework for building powerful command-line tools.

---

## Documentation Structure

### Getting Started

Start here if you're new to Kubit Forge.

- **[Quick Start](./getting-started/quick-start.md)** - Create your first project
  - Available templates
  - Project initialization
  - Configuration basics

- **[Adding Features](./getting-started/adding-features.md)** - Extend your project
  - Testing tools (Vitest, Playwright)
  - Code quality (ESLint, Prettier)
  - UI libraries (Bernova, Tailwind)
  - Development tools (Storybook, Husky)

---

### Core Features

Essential CLI functionality.

- **[Commands](./core/commands.md)** - Daily development workflow
  - Dev server
  - Production builds
  - Testing
  - Linting and formatting
  - Type checking

- **[Configuration](./core/configuration.md)** - Configure Kubit Forge
  - `kubit.config.toml` reference
  - Environment variables
  - Build options
  - Plugin configuration

- **[Code Generation](./core/code-generation.md)** - Generate components and scaffolds
  - Component generation
  - Page generation
  - Custom generators
  - Templates

---

### Framework & Extensibility

Build your own CLIs and extend functionality.

- **[Framework Overview](./framework/overview.md)** - Using Kubit as a CLI framework
  - Building custom CLIs
  - Custom plugins and recipes
  - Enterprise use cases
  - Framework architecture

- **[runCLI API Reference](./framework/run-cli-api.md)** - Complete runCLI documentation
  - All available options
  - Custom commands
  - Recipe support
  - Advanced hooks
  - Complete examples

- **[Creating Commands](./framework/creating-commands.md)** - Different ways to create commands
  - Inline commands
  - Command files
  - JSON commands
  - Full plugins

- **[Plugin System](./framework/plugins.md)** - Extend with plugins
  - Using plugins
  - Creating plugins
  - Internal (local) plugins
  - Plugin API reference
  - Publishing plugins

- **[Recipe System](./framework/recipes.md)** - Automate workflows
  - Creating recipes
  - DAG-based execution
  - Optional pre-built recipes
  - Best practices

- **[Plugins vs Recipes](./framework/plugins-vs-recipes.md)** - Understanding the difference
  - When to use plugins
  - When to use recipes
  - Comparison matrix

---

### Advanced Features

Specialized functionality for advanced use cases.

- **[Doctor](./features/doctor.md)** - AI-powered diagnostics
  - Health checks
  - Issue detection
  - Auto-fix capabilities
  - Predictive analysis
  - IDE integration

- **[Security](./features/security.md)** - Security plugin
  - SBOM generation
  - Security audits
  - Vulnerability scanning
  - Compliance reporting

- **[Environment Management](./features/environment.md)** - Manage environment variables
  - .env file management
  - Validation
  - Security best practices

- **[Migrations](./features/migrations.md)** - Upgrade and migrate projects
  - Safe upgrades
  - Automated refactoring
  - Breaking change detection

- **[Monorepo Support](./features/monorepo.md)** - Working with monorepos
  - Yarn, Turborepo, Nx support
  - Workspace management
  - Monorepo commands

---

## Quick Navigation

### By Role

#### **Beginners**

1. [Quick Start](./getting-started/quick-start.md)
2. [Adding Features](./getting-started/adding-features.md)
3. [Commands](./core/commands.md)

#### **Developers**

1. [Commands](./core/commands.md)
2. [Code Generation](./core/code-generation.md)
3. [Doctor](./features/doctor.md)
4. [Configuration](./core/configuration.md)

#### **Teams & Organizations**

1. [Framework Overview](./framework/overview.md)
2. [Recipe System](./framework/recipes.md)
3. [Plugin System](./framework/plugins.md)
4. [Monorepo Support](./features/monorepo.md)

#### **CLI Framework Builders**

1. [Framework Overview](./framework/overview.md)
2. [runCLI API Reference](./framework/run-cli-api.md)
3. [Creating Commands](./framework/creating-commands.md)
4. [Plugin System](./framework/plugins.md)
5. [Plugins vs Recipes](./framework/plugins-vs-recipes.md)

#### **DevOps & Security**

1. [Security](./features/security.md)
2. [Doctor](./features/doctor.md)
3. [Monorepo Support](./features/monorepo.md)

---

### By Task

#### **Starting a New Project**

1. [Quick Start](./getting-started/quick-start.md)
2. [Adding Features](./getting-started/adding-features.md)
3. [Configuration](./core/configuration.md)

#### **Daily Development**

- [Dev server](./core/commands.md#development-server)
- [Generate code](./core/code-generation.md)
- [Run tests](./core/commands.md#testing)

#### **Building a Custom CLI**

1. [Framework Overview](./framework/overview.md)
2. [runCLI API](./framework/run-cli-api.md)
3. [Creating Commands](./framework/creating-commands.md)
4. [Plugin System](./framework/plugins.md)

#### **Maintenance**

- [Check project health](./features/doctor.md)
- [Auto-fix issues](./features/doctor.md#doctor-advanced-plugin-optional)
- [Security audit](./features/security.md)

#### **Working with Monorepos**

1. [Monorepo Support](./features/monorepo.md)
2. [Recipe System](./framework/recipes.md)
3. [Configuration](./core/configuration.md)

---

## Quick Command Reference

```bash
# Project initialization
kubit-forge init <template> <name>
kubit-forge create <template> <name>

# Add features
kubit-forge add <feature>

# Development
kubit-forge dev
kubit-forge build
kubit-forge test
kubit-forge preview

# Quality checks
kubit-forge lint
kubit-forge format
kubit-forge typecheck
kubit-forge doctor

# Code generation
kubit-forge generate <type> <name>

# Recipe execution
kubit-forge recipe:list
kubit-forge recipe:run <recipe>
kubit-forge recipe:add <path>

# Plugin management
kubit-forge plugin:install <plugin>
kubit-forge plugin:list

# Optional Plugin Commands
kubit-forge doctor:fix              # Doctor Advanced
kubit-forge doctor:predictive       # Doctor Advanced
kubit-forge security:audit          # Security Plugin
kubit-forge sbom:generate           # Security Plugin
```

---

## External Resources

### Official Links

- **Website**: [kubit-ui.com](https://kubit-ui.com)
- **GitHub**: [github.com/kubit-ui/kubit-forge](https://github.com/kubit-ui/kubit-forge)
- **NPM**: [npmjs.com/package/kubit-forge](https://www.npmjs.com/package/kubit-forge)

### Community

- **GitHub Discussions**: Ask questions and share ideas
- **GitHub Issues**: Report bugs and request features
- **Twitter**: [@kubit_ui](https://twitter.com/kubit_ui)

---

## Getting Help

1. Check relevant documentation above
2. Use browser search (Cmd/Ctrl + F)
3. Try `kubit-forge doctor`
4. [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues)
5. [GitHub Discussions](https://github.com/kubit-ui/kubit-forge/discussions)

---

## Contributing

Want to contribute? See:

- [Contributing Guide](../CONTRIBUTING.md)
- [Code of Conduct](../CODE_OF_CONDUCT.md)
- [Open Issues](https://github.com/kubit-ui/kubit-forge/issues)

---

**Made with love by the Kubit team**
