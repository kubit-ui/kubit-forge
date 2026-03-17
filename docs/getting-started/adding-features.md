# Add Command - Feature Installation

## Overview

The `add` command is one of the most powerful features in Kubit Forge. It allows you to add tools, libraries, and features to your existing project with zero configuration. No manual setup, no copying config files - just run one command and you're ready to go.

## Quick Start

```bash
# Add a single feature
kubit-forge add eslint

# Add multiple features at once
kubit-forge add vitest playwright testing-library

# Interactive mode - select features from a menu
kubit-forge add
```

## How It Works

When you run `kubit-forge add <feature>`:

1. **Detects your project** - Analyzes package.json and existing setup
2. **Installs dependencies** - Adds required packages
3. **Creates configuration files** - Generates optimal config files
4. **Updates scripts** - Adds convenient npm scripts
5. **Provides guidance** - Shows next steps and usage examples

## Available Features

### Testing Tools

#### Vitest

Modern, fast unit testing framework.

```bash
kubit-forge add vitest
```

**What you get:**

- `vitest` package installed
- `vitest.config.ts` created
- Test scripts added to package.json
- Example test file generated
- Coverage configuration

**Usage:**

```bash
npm test              # Run tests
npm test:watch        # Watch mode
npm test:coverage     # With coverage
```

#### Playwright

End-to-end testing for web applications.

```bash
kubit-forge add playwright
```

**What you get:**

- `@playwright/test` installed
- `playwright.config.ts` created
- Browser binaries downloaded
- Example E2E test created
- CI-ready configuration

**Usage:**

```bash
npm test:e2e          # Run E2E tests
npm test:e2e:ui       # UI mode
npm test:e2e:debug    # Debug mode
```

#### Testing Library

Simple and complete testing utilities for React.

```bash
kubit-forge add testing-library
```

**What you get:**

- `@testing-library/react` installed
- `@testing-library/jest-dom` installed
- Test setup file configured
- Custom matchers enabled
- User-centric testing approach

### Code Quality

#### ESLint

JavaScript/TypeScript linter.

```bash
kubit-forge add eslint
```

**What you get:**

- `eslint` and plugins installed
- `eslint.config.js` created
- Integration with TypeScript
- React-specific rules (if applicable)
- Scripts added to package.json

**Configuration includes:**

- TypeScript ESLint parser
- React plugin (for React projects)
- Import sorting
- Accessibility rules
- Best practice rules

**Usage:**

```bash
npm run lint          # Check for issues
npm run lint:fix      # Auto-fix issues
```

#### Prettier

Code formatter for consistent style.

```bash
kubit-forge add prettier
```

**What you get:**

- `prettier` installed
- `.prettierrc` created
- `.prettierignore` generated
- ESLint integration (if ESLint exists)
- Format scripts added

**Configuration:**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80
}
```

**Usage:**

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### Development Tools

#### Storybook

Component development and documentation.

```bash
kubit-forge add storybook
```

**What you get:**

- `@storybook/react-vite` installed
- `.storybook/` directory created
- Example stories generated
- TypeScript support enabled
- Vite integration configured

**Usage:**

```bash
npm run storybook     # Start Storybook
npm run build-storybook  # Build static site
```

#### Husky

Git hooks made easy.

```bash
kubit-forge add husky
```

**What you get:**

- `husky` installed
- `.husky/` directory created
- Pre-commit hook configured
- Pre-push hook configured
- Lint-staged integration (if installed)

**Hooks configured:**

- `pre-commit`: Runs linting and formatting
- `pre-push`: Runs tests
- `commit-msg`: Validates commit messages (if commitlint installed)

#### Lint-staged

Run linters on staged files only.

```bash
kubit-forge add lint-staged
```

**What you get:**

- `lint-staged` installed
- Configuration in package.json
- Integration with Husky
- Optimized file patterns

**Configuration:**

```json
{
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

#### Commitlint

Enforce conventional commit messages.

```bash
kubit-forge add commitlint
```

**What you get:**

- `@commitlint/cli` installed
- Conventional config enabled
- Husky hook configured
- Commit message validation

**Enforced format:**

```
type(scope?): subject

Examples:
feat: add user authentication
fix(api): resolve timeout issue
docs: update README
```

#### Changesets

Version management and changelogs.

```bash
kubit-forge add changesets
```

**What you get:**

- `@changesets/cli` installed
- `.changeset/` directory created
- Configuration file generated
- Release scripts added

**Usage:**

```bash
npm run changeset           # Create changeset
npm run changeset:version   # Update versions
npm run changeset:publish   # Publish packages
```

### Styling Solutions

#### Bernova

Design system with ready-to-use design tokens.

```bash
kubit-forge add bernova
```

**What you get:**

- `bernova` package installed
- Design tokens imported
- Theme configuration
- CSS compilation setup
- Example component with Bernova

**Features:**

- Design tokens (colors, spacing, typography)
- CSS variable generation
- Theme customization
- SCSS/CSS output

#### Styled Components

CSS-in-JS styling solution.

```bash
kubit-forge add styled-components
```

**What you get:**

- `styled-components` installed
- TypeScript types included
- Babel plugin configured (if needed)
- Theme provider setup
- Example styled component

#### Tailwind CSS

Utility-first CSS framework.

```bash
kubit-forge add tailwindcss
```

**What you get:**

- `tailwindcss` installed
- `tailwind.config.js` created
- PostCSS configuration
- Base styles imported
- Content paths configured

### Routing

#### React Router

Client-side routing for React.

```bash
kubit-forge add react-router
```

**What you get:**

- `react-router-dom` installed
- Router setup example
- TypeScript types
- Route configuration example
- Navigation components

### State Management

#### Zustand

Simple, fast state management.

```bash
kubit-forge add zustand
```

**What you get:**

- `zustand` package installed
- TypeScript store example
- Persist middleware configured
- DevTools integration

#### Redux Toolkit

Official Redux toolset.

```bash
kubit-forge add redux-toolkit
```

**What you get:**

- `@reduxjs/toolkit` installed
- `react-redux` installed
- Store configuration
- Slice example
- TypeScript types

### Data Fetching

#### React Query

Powerful data synchronization library.

```bash
kubit-forge add react-query
```

**What you get:**

- `@tanstack/react-query` installed
- Query client setup
- DevTools configured
- TypeScript support
- Example query hook

#### Axios

Promise-based HTTP client.

```bash
kubit-forge add axios
```

**What you get:**

- `axios` installed
- Base configuration
- Interceptors setup
- Error handling example
- TypeScript types

### Form Handling

#### React Hook Form

Performant form library.

```bash
kubit-forge add react-hook-form
```

**What you get:**

- `react-hook-form` installed
- Validation example
- TypeScript types
- Integration examples

#### Zod

TypeScript-first schema validation.

```bash
kubit-forge add zod
```

**What you get:**

- `zod` package installed
- Schema examples
- Form integration (if react-hook-form exists)
- TypeScript inference

### Build & Bundle

#### Vite PWA

Progressive Web App support.

```bash
kubit-forge add vite-pwa
```

**What you get:**

- `vite-plugin-pwa` installed
- PWA configuration
- Service worker setup
- Manifest generation
- Offline support

## Command Options

### Dry Run

Preview what would be installed without making changes:

```bash
kubit-forge add vitest --dry-run
```

### Skip Installation

Add configuration files without installing packages:

```bash
kubit-forge add eslint --skip-install
```

### Custom Configuration

Override default configuration:

```bash
kubit-forge add prettier --config ./my-prettier-config.json
```

### Force Reinstall

Reinstall even if already present:

```bash
kubit-forge add vitest --force
```

## Common Workflows

### Complete Testing Setup

```bash
# Unit testing
kubit-forge add vitest

# Component testing
kubit-forge add testing-library

# E2E testing
kubit-forge add playwright

# Coverage reporting
kubit-forge add vitest --coverage
```

### Code Quality Stack

```bash
# Linting and formatting
kubit-forge add eslint prettier

# Git hooks
kubit-forge add husky lint-staged

# Commit conventions
kubit-forge add commitlint
```

### Component Development Stack

```bash
# UI documentation
kubit-forge add storybook

# Styling
kubit-forge add styled-components

# or
kubit-forge add tailwindcss

# Testing
kubit-forge add testing-library
```

### Full Stack Setup

```bash
# Routing
kubit-forge add react-router

# State management
kubit-forge add zustand

# Data fetching
kubit-forge add react-query axios

# Forms
kubit-forge add react-hook-form zod

# Testing
kubit-forge add vitest testing-library playwright
```

## Creating Custom Add Modules

You can extend the `add` command with custom modules:

### Module Structure

```typescript
// .kubit/add-modules/my-tool.ts
export default {
  name: 'my-tool',
  description: 'My custom tool',

  dependencies: {
    'my-tool': '^1.0.0',
  },

  devDependencies: {
    '@types/my-tool': '^1.0.0',
  },

  files: {
    'my-tool.config.ts': `
      export default {
        // configuration
      };
    `,
  },

  scripts: {
    'my-tool': 'my-tool run',
  },

  postInstall: async (ctx) => {
    console.log('Custom setup complete!');
  },
};
```

### Register Custom Module

```bash
kubit-forge add:register ./my-add-module.ts
```

## Troubleshooting

### Dependency Conflicts

If you encounter peer dependency warnings:

```bash
# Force installation
kubit-forge add vitest --force

# Or use legacy peer deps
npm config set legacy-peer-deps true
kubit-forge add vitest
```

### Configuration Conflicts

If a config file already exists:

```bash
# Backup and overwrite
kubit-forge add eslint --overwrite

# Merge with existing
kubit-forge add eslint --merge
```

### Version Mismatches

Specify exact versions:

```bash
kubit-forge add typescript@5.3.0
```

## Best Practices

1. **Add tools incrementally** - Don't add everything at once
2. **Test after each addition** - Ensure new tools work as expected
3. **Review generated configs** - Customize to your needs
4. **Keep tools updated** - Use `kubit-forge upgrade` regularly
5. **Document custom configs** - Add comments to configuration files

## FAQ

### Q: Can I add multiple features at once?

**A:** Yes! `kubit-forge add vitest playwright testing-library`

### Q: Will it overwrite my existing configuration?

**A:** By default, no. Use `--overwrite` flag if you want to replace existing configs.

### Q: Can I undo an add operation?

**A:** Use `kubit-forge remove <feature>` to uninstall and clean up.

### Q: Does it work with all package managers?

**A:** Yes, it automatically detects yarn, npm, or pnpm.

## Related Documentation

- [Development Commands](./DEVELOPMENT-COMMANDS.md) - Run tests, linting, formatting
- [Project Initialization](./PROJECT-INITIALIZATION.md) - Create new projects
- [Configuration](./CONFIGURATION.md) - Configure Kubit Forge

---

**Need help?** Open an issue on [GitHub](https://github.com/kubit-ui/kubit-forge/issues).
