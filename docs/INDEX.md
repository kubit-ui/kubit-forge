# Kubit Forge Documentation Index

Welcome to the Kubit Forge documentation. This index will help you find the information you need quickly.

## Getting Started

- **[README](../README.md)** - Project overview and quick start guide
- **[Installation & Setup](../README.md#installation)** - How to install Kubit Forge
- **[Quick Start](../README.md#quick-start)** - Get up and running in minutes

## Core Features

### Project Management

- **[Project Initialization](./PROJECT-INITIALIZATION.md)** - Create new projects with templates
  - Available templates
  - Custom templates
  - Configuration options
  - Best practices

- **[Add Command](./ADD-COMMAND.md)** - Add features to existing projects
  - Testing tools (Vitest, Playwright, Testing Library)
  - Code quality (ESLint, Prettier)
  - Development tools (Storybook, Husky)
  - Styling solutions (Bernova, Styled Components, Tailwind)
  - And much more...

- **[Development Commands](./DEVELOPMENT-COMMANDS.md)** - Build, test, and run your project
  - Dev server
  - Production builds
  - Testing
  - Linting and formatting
  - Type checking

### Extensibility

- **[Plugin System](./PLUGIN-SYSTEM.md)** - Extend Kubit Forge with plugins
  - Using plugins
  - Creating plugins
  - Plugin API reference
  - Publishing plugins

- **[Recipe System](./RECIPE-SYSTEM.md)** - Automate workflows with recipes
  - Built-in recipes
  - Creating custom recipes
  - DAG-based execution
  - Best practices

### Quality & Diagnostics

- **[Doctor Command](./DOCTOR-COMMAND.md)** - AI-powered project diagnostics
  - Configuration validation
  - Dependency health
  - Security scanning
  - Performance analysis
  - Auto-fix capabilities
  - Predictive analysis

- **[Smart Dependency Management](./DEPENDENCY-MANAGEMENT.md)** - Intelligent dependency tools
  - Dependency analysis
  - Duplicate detection
  - Smart updates
  - Alternative suggestions
  - Security focus

### User Interfaces

- **[Visual GUI](./VISUAL-GUI.md)** - Web-based project management
  - Project overview
  - Visual configuration editor
  - Command palette
  - Plugin manager
  - File explorer

- **[Interactive Dashboard](./INTERACTIVE-DASHBOARD.md)** - Terminal-based UI (TUI)
  - Real-time project status
  - Live logs
  - System metrics
  - Keyboard navigation

### Optimization & Deployment

- **[Asset Optimization](./ASSET-OPTIMIZATION.md)** - Optimize images, fonts, and icons
  - Image optimization
  - Font subsetting
  - CDN synchronization
  - Compression

- **[Security & SBOM](./SECURITY-SBOM.md)** - Security audits and SBOM generation
  - Software Bill of Materials
  - Vulnerability scanning
  - License compliance
  - Security reports

### Code Generation

- **[Code Generation](./CODE-GENERATION.md)** - Generate components and scaffolds
  - Component generation
  - Page generation
  - Custom generators
  - Templates

### Configuration

- **[Configuration](./CONFIGURATION.md)** - Configure Kubit Forge
  - kubit.config.toml reference
  - Environment variables
  - Build options
  - Plugin configuration

### Advanced Topics

- **[Monorepo Support](./MONOREPO-SUPPORT.md)** - Working with monorepos
  - Supported tools (pnpm, Turborepo, Nx)
  - Monorepo commands
  - Workspace management

- **[Migrations & Upgrades](./MIGRATIONS-UPGRADES.md)** - Upgrade and migrate projects
  - Safe upgrades
  - Automated refactoring
  - Breaking change detection

- **[Environment Management](./ENVIRONMENT-MANAGEMENT.md)** - Manage environment variables
  - .env file management
  - Validation
  - Security best practices

## Command Reference

### Quick Command List

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

# Plugin management
kubit-forge plugin:install <plugin>
kubit-forge plugin:list
kubit-forge plugin:verify <plugin>

# Recipe execution
kubit-forge recipe:list
kubit-forge recipe apply <recipe>

# Dependency analysis
kubit-forge deps:analyze

# Code generation
kubit-forge generate <type> <name>

# Environment management
kubit-forge env:init
kubit-forge env:validate

# Monorepo
kubit-forge monorepo:init
kubit-forge monorepo:list

# Migrations
kubit-forge migrate <codename>

# Information
kubit-forge info
kubit-forge --version
kubit-forge --help

# Optional Plugin Commands (requires plugin installation)
kubit-forge sbom:generate          # @kubit/plugin-security
kubit-forge security:audit          # @kubit/plugin-security
kubit-forge doctor:fix              # @kubit/plugin-doctor-advanced
kubit-forge doctor:predictive       # @kubit/plugin-doctor-advanced
```

## Use Cases

### By Role

#### 🆕 **Beginners**

1. Start with [Quick Start](../README.md#quick-start)
2. Use [Visual GUI](./VISUAL-GUI.md) for easier navigation
3. Try [Add Command](./ADD-COMMAND.md) to add features
4. Read [Project Initialization](./PROJECT-INITIALIZATION.md)

#### 👨‍💻 **Developers**

1. [Development Commands](./DEVELOPMENT-COMMANDS.md) - Daily workflow
2. [Doctor Command](./DOCTOR-COMMAND.md) - Maintain code quality
3. [Code Generation](./CODE-GENERATION.md) - Speed up development
4. [Plugin System](./PLUGIN-SYSTEM.md) - Extend functionality

#### 🏢 **Teams & Organizations**

1. [Recipe System](./RECIPE-SYSTEM.md) - Standardize workflows
2. [Plugin System](./PLUGIN-SYSTEM.md) - Custom tooling
3. [Monorepo Support](./MONOREPO-SUPPORT.md) - Manage multiple projects
4. [Configuration](./CONFIGURATION.md) - Enforce standards

#### 🔒 **DevOps & Security**

1. [Security & SBOM](./SECURITY-SBOM.md) - Security compliance
2. [Doctor Command](./DOCTOR-COMMAND.md) - Automated checks
3. [Asset Optimization](./ASSET-OPTIMIZATION.md) - Performance
4. [Dependency Management](./DEPENDENCY-MANAGEMENT.md) - Vulnerability scanning

### By Task

#### 🚀 **Starting a New Project**

1. [Project Initialization](./PROJECT-INITIALIZATION.md)
2. [Add Command](./ADD-COMMAND.md)
3. [Configuration](./CONFIGURATION.md)

#### 🔧 **Maintaining an Existing Project**

1. [Doctor Command](./DOCTOR-COMMAND.md)
2. [Migrations & Upgrades](./MIGRATIONS-UPGRADES.md)
3. [Doctor Advanced Plugin](./PLUGIN-DOCTOR-ADVANCED.md) - Auto-fix

#### 🎨 **Optimizing Performance**

1. [Doctor Command](./DOCTOR-COMMAND.md) - Performance analysis
2. Use native tools: `pnpm why`, `npx depcheck`
3. [Optional Recipes](./RECIPES-OPTIONAL.md) - Testing setup

#### 🤝 **Team Collaboration**

1. [Recipe System](./RECIPE-SYSTEM.md)
2. [Optional Recipes](./RECIPES-OPTIONAL.md)
3. [Configuration](./CONFIGURATION.md)

## Troubleshooting

### Common Issues

- **Installation Problems** - See [Installation Guide](../README.md#installation)
- **Command Not Found** - Check [Command Reference](#quick-command-list)
- **Configuration Errors** - See [Configuration](./CONFIGURATION.md)
- **Dependency Issues** - Use [Doctor Command](./DOCTOR-COMMAND.md)

### Getting Help

- 📖 **Documentation** - You're here!
- 🐛 **Report Issues** - [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues)
- 💬 **Discussions** - [GitHub Discussions](https://github.com/kubit-ui/kubit-forge/discussions)
- 📧 **Email** - team@kubit-forge.org

## Contributing

Want to contribute to Kubit Forge?

- Read [Contributing Guide](../README.md#contributing)
- Check [Code of Conduct](../CODE_OF_CONDUCT.md)
- Browse [Open Issues](https://github.com/kubit-ui/kubit-forge/issues)

## Additional Resources

- **[Changelog](../CHANGELOG.md)** - Version history
- **[Migration Guide](../MIGRATION.md)** - Upgrade between versions
- **[License](../LICENSE)** - MIT License
- **[Security Policy](../SECURITY.md)** - Report security issues

## API Reference

For developers extending Kubit Forge:

- [Plugin API](./PLUGIN-SYSTEM.md#plugin-api)
- [Recipe API](./RECIPE-SYSTEM.md#recipe-structure)
- [CLI API](./DEVELOPMENT-COMMANDS.md)

## Examples

Check out example projects and configurations:

- Example recipes in [Recipe System](./RECIPE-SYSTEM.md#recipe-examples)
- Example plugins in [Plugin System](./PLUGIN-SYSTEM.md#plugin-examples)
- Example configurations in [Configuration](./CONFIGURATION.md)

---

**Quick Links:**
[Website](https://kubit-ui.com) •
[GitHub](https://github.com/kubit-ui/kubit-forge) •
[NPM](https://www.npmjs.com/package/kubit-forge) •
[Discord](#) •
[Twitter](https://twitter.com/kubit_ui)

Made with ❤️ by the Kubit team
