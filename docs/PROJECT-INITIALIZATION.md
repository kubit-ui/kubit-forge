# Project Initialization & Templates

## Overview

Kubit Forge provides powerful scaffolding capabilities to bootstrap production-ready projects in seconds. With zero configuration required, you can start building immediately with sensible defaults and best practices baked in.

## Quick Start

### Basic Initialization

```bash
# Create a React + TypeScript project
kubit-forge init react my-app

# Create a Vanilla TypeScript project
kubit-forge init vanilla my-app

# Interactive mode (prompts for options)
kubit-forge init
```

### What You Get

Every initialized project includes:

- ✅ **TypeScript Configuration** - Full type safety with tsconfig.json
- ✅ **Vite Build Setup** - Lightning-fast HMR and optimized builds
- ✅ **ESLint & Prettier** - Code quality and formatting tools
- ✅ **Testing Infrastructure** - Vitest configuration ready to use
- ✅ **Git Initialization** - .gitignore and repository setup
- ✅ **Package Manager Detection** - Automatically uses npm, yarn, or pnpm

## Available Templates

### Official Templates

#### 1. React + TypeScript (`react`)

Modern React application with TypeScript support.

```bash
kubit-forge init react my-app
```

**Includes:**

- React 19+
- TypeScript 5+
- Vite for building
- ESLint configuration
- Prettier formatting
- Basic folder structure

**Project Structure:**

```
my-app/
├── src/
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── public/
├── index.html
├── tsconfig.json
├── vite.config.ts
└── package.json
```

#### 2. React + Bernova Design System (`react-bernova`)

React app integrated with Bernova design system.

```bash
kubit-forge init react-bernova my-app
```

**Includes:**

- Everything from `react` template
- Bernova design system pre-configured
- Design tokens
- Theme provider setup
- Styled components examples

#### 3. React + Kubit UI Components (`react-kubit-ui`)

React app with Kubit UI component library.

```bash
kubit-forge init react-kubit-ui my-app
```

**Includes:**

- Everything from `react` template
- Kubit React Components library
- Pre-configured theme
- Component examples

#### 4. Vanilla TypeScript (`vanilla`)

Lightweight TypeScript project without framework.

```bash
kubit-forge init vanilla my-app
```

**Includes:**

- TypeScript configuration
- Vite build setup
- Basic HTML/CSS/TS structure
- Module bundling

#### 5. Full Kubit Stack (`kubit-full`)

Complete setup with all Kubit tools integrated.

```bash
kubit-forge init kubit-full my-app
```

**Includes:**

- React + TypeScript
- Kubit UI Components
- Bernova design tokens
- Storybook
- Testing setup (Vitest + Testing Library)
- CI/CD configuration
- Documentation setup

## Template Commands

### List Available Templates

```bash
kubit-forge template:list
```

Shows all available templates with descriptions.

### Use a Specific Template

```bash
kubit-forge template:use <template-name> <project-name>
```

Example:

```bash
kubit-forge template:use react-ts-storybook my-app
```

## Advanced Options

### Custom Configuration During Init

```bash
# Specify package manager
kubit-forge init react my-app --package-manager pnpm

# Skip Git initialization
kubit-forge init react my-app --no-git

# Skip dependency installation
kubit-forge init react my-app --no-install

# Use specific TypeScript version
kubit-forge init react my-app --typescript-version 5.3.0
```

### Directory Structure

All templates follow a consistent structure:

```
project-root/
├── src/                    # Source code
│   ├── components/        # (React templates)
│   ├── styles/           # Stylesheets
│   ├── utils/            # Utility functions
│   └── App.tsx           # Main application
├── public/                # Static assets
├── tests/                # Test files (if included)
├── .vscode/              # VS Code settings (optional)
├── .editorconfig         # Editor configuration
├── .prettierrc           # Prettier configuration
├── eslint.config.js      # ESLint configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

## Custom Templates

### Creating a Custom Template

1. Create a template directory structure
2. Add a `template.toml` configuration file
3. Register the template with Kubit Forge

**Example template.toml:**

```toml
[template]
name = "my-custom-template"
description = "My organization's custom template"
version = "1.0.0"
author = "Your Team"

[features]
typescript = true
react = true
testing = true
storybook = false

[dependencies]
react = "^19.0.0"
"react-dom" = "^19.0.0"

[scripts]
dev = "vite"
build = "vite build"
test = "vitest"
```

### Using Custom Templates

```bash
# From local directory
kubit-forge init --template ./path/to/template my-app

# From Git repository
kubit-forge init --template https://github.com/org/template my-app

# From npm package
kubit-forge init --template @myorg/template my-app
```

## Integration with CI/CD

### GitHub Actions

Generated projects include basic GitHub Actions workflows:

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm test
      - run: npm run build
```

### Pre-commit Hooks

Projects include Husky setup for:

- Linting on commit
- Type checking
- Test execution
- Commit message validation

## Best Practices

### Project Naming

✅ **Good:**

- `my-app`
- `awesome-dashboard`
- `company-portal`

❌ **Avoid:**

- `MyApp` (use kebab-case)
- `my app` (no spaces)
- `test` (reserved names)

### Post-Initialization Steps

1. **Review configuration files** - Adjust settings for your needs
2. **Set up environment variables** - Use `kubit-forge env init`
3. **Configure linting rules** - Customize ESLint config
4. **Add more features** - Use `kubit-forge add <feature>`
5. **Initialize version control** - Commit initial setup

### Recommended Workflow

```bash
# 1. Initialize project
kubit-forge init react my-app
cd my-app

# 2. Add additional features
kubit-forge add vitest
kubit-forge add storybook
kubit-forge add husky

# 3. Configure environment
kubit-forge env init

# 4. Start development
kubit-forge dev

# 5. Make first commit
git add .
git commit -m "feat: initial project setup"
```

## Troubleshooting

### Common Issues

#### "Directory already exists"

```bash
# Solution: Use a different name or remove the existing directory
rm -rf my-app
kubit-forge init react my-app
```

#### "Package manager not found"

```bash
# Solution: Install the package manager or specify a different one
npm install -g pnpm
# or
kubit-forge init react my-app --package-manager npm
```

#### "Permission denied"

```bash
# Solution: Run with appropriate permissions or change directory ownership
sudo chown -R $USER:$USER my-app
```

## Performance Tips

- Use **pnpm** for faster installation and better disk efficiency
- Enable **caching** in CI/CD pipelines
- Use **shallow clones** when cloning template repositories
- Skip git initialization if adding to existing repository

## Next Steps

After initialization:

1. **Explore the codebase** - Understand the generated structure
2. **Read configuration files** - Learn about available options
3. **Add features** - Use `kubit-forge add` command (see [ADD-COMMAND.md](./ADD-COMMAND.md))
4. **Start developing** - Run `kubit-forge dev`
5. **Set up testing** - Write your first tests

## Related Documentation

- [Add Command](./ADD-COMMAND.md) - Add features to existing projects
- [Configuration](./CONFIGURATION.md) - Configure your project
- [Development Commands](./DEVELOPMENT-COMMANDS.md) - Build, test, and run your project
- [Code Generation](./CODE-GENERATION.md) - Generate components and code scaffolds

## Examples

### Monorepo Setup

```bash
# Create monorepo root
mkdir my-monorepo && cd my-monorepo
pnpm init

# Initialize workspace packages
kubit-forge init react packages/web-app
kubit-forge init react packages/admin-panel
kubit-forge init vanilla packages/shared-utils
```

### Enterprise Setup

```bash
# Create enterprise project with all features
kubit-forge init kubit-full enterprise-app
cd enterprise-app

# Add enterprise features
kubit-forge add changesets
kubit-forge add commitlint
kubit-forge add lint-staged
kubit-forge add storybook

# Configure CI/CD
kubit-forge recipe:run ci-cd-setup
```

---

**Need help?** Open an issue on [GitHub](https://github.com/kubit-ui/kubit-forge/issues) or check our [FAQ](../README.md#support).
