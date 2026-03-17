# Feature Templates

Templates for configuration files of features/tools that can be added to projects.

## Contents

### Testing

- `vitest.config.ts.template` - Vitest configuration
- `vitest-setup.ts.template` - Vitest setup
- `jest.config.ts.template` - Jest configuration
- `jest-setup.ts.template` - Jest setup
- `cypress.config.ts.template` - Cypress configuration
- `cypress-support-commands.ts.template` - Cypress custom commands
- `cypress-support-e2e.ts.template` - Cypress E2E setup
- `playwright.config.ts.template` - Playwright configuration
- `playwright-example.spec.ts.template` - Playwright test example

### Code Quality

- `eslint.config.js.template` - ESLint configuration
- `.prettierrc.template` - Prettier configuration
- `.prettierignore.template` - Files ignored by Prettier
- `lint-staged.config.js.template` - lint-staged configuration
- `commitlint.config.js.template` - commitlint configuration

### Git Hooks

- `husky-pre-commit.template` - pre-commit hook
- `husky-commit-msg.template` - commit-msg hook

### Changesets

- `changesets-config.json.template` - Changesets configuration
- `changesets-readme.md.template` - Changesets README

### Bernova (Design System)

- `bernova.config.json.template` - Bernova configuration
- `bernova-foundations.ts.template` - Bernova foundations
- `bernova-globalStyles.ts.template` - Global styles
- `bernova-mediaQueries.ts.template` - Media queries
- `bernova-theme.ts.template` - Bernova theme

## Usage

### Load a template

```typescript
import { loadFeatureTemplate } from '../../templates/features';

const vitestConfig = loadFeatureTemplate('vitest.config.ts.template');
```

### Load multiple templates

```typescript
import { loadFeatureTemplates } from '../../templates/features';

const templates = loadFeatureTemplates(['vitest.config.ts.template', 'vitest-setup.ts.template']);
```

### From commands/add (compatibility)

```typescript
// Still works for compatibility
import { loadTemplate } from './template-loader';

const template = loadTemplate('vitest.config.ts.template');
```

## Conventions

### File names

- Format: `[filename].[extension].template`
- Examples:
  - `vitest.config.ts.template`
  - `.prettierrc.template`
  - `husky-pre-commit.template`

### Content

- Templates can contain placeholders for replacement
- Keep configurations updated with recent versions
- Include explanatory comments when necessary

## Organization

Templates are organized by category:

- **Testing**: Testing tools (Vitest, Jest, Cypress, Playwright)
- **Code Quality**: Linting and formatting (ESLint, Prettier, lint-staged)
- **Git Hooks**: Husky hooks
- **Changesets**: Version management
- **Bernova**: Specific design system

## Migration

These templates were moved from `commands/add/templates/` to this centralized location to:

1. Maintain consistency with other CLI templates
2. Facilitate maintenance
3. Improve code organization
4. Allow reuse in other commands

## See Also

- [Config Templates](../config/README.md)
- [Generator Templates](../generators/README.md)
- [Templates System Overview](../README.md)
