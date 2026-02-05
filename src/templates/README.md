# Templates System

Centralized template system for configurations and code generation.

## Structure

```
templates/
├── config/              # Configuration templates
│   ├── defaults.ts      # Default configuration constants
│   ├── config-templates.ts  # Config loader and builder
│   ├── index.ts         # Exports
│   └── README.md        # Documentation
│
├── generators/          # Code generation templates
│   ├── react-component.ts   # React component templates
│   ├── react-page.ts        # React page templates
│   ├── react-hook.ts        # React hook templates
│   ├── plugin.ts            # Plugin templates
│   ├── index.ts             # Exports
│   └── README.md            # Documentation
│
└── features/            # Feature/tool templates
    ├── *.template       # Configuration files (23 templates)
    ├── template-loader.ts   # Template loader
    ├── index.ts         # Exports
    └── README.md        # Documentation
```

## Purpose

### 1. Configuration Templates (`config/`)

Centralizes all default configuration values for the project:

- Node versions
- Development ports
- Package managers
- File paths
- Quality configuration (lint, format, test)

**Used by:**

- `utils/config-loader.ts`
- `utils/interactive-config.ts`
- `commands/init.ts`
- `commands/dev.ts`

### 2. Generator Templates (`generators/`)

Centralizes all generated code templates:

- React components
- React pages
- Custom hooks
- Plugins
- Tests
- Storybook stories

**Used by:**

- `commands/generate.ts`
- `commands/plugin-init.ts`

### 3. Feature Templates (`features/`)

Centralizes configuration files for features/tools:

- Testing (Vitest, Jest, Cypress, Playwright)
- Code Quality (ESLint, Prettier, lint-staged)
- Git Hooks (Husky)
- Changesets
- Design Systems (Bernova)

**Used by:**

- `commands/add/index.ts`

## System Benefits

### ✅ Centralization

- Single place for each template type
- Easy to find and modify

### ✅ Consistency

- All generated files follow the same pattern
- Same default values throughout the application

### ✅ Maintainability

- Changes propagate automatically
- No duplicated code

### ✅ Separation of Concerns

- Commands orchestrate, templates generate
- Business logic separated from templates

### ✅ Testability

- Templates can be tested in isolation
- Easy to verify generated output

### ✅ Type Safety

- TypeScript ensures correct types
- Well-defined interfaces

## Quick Usage

### Configuration

```typescript
import { ConfigTemplateLoader, PROJECT_DEFAULTS } from './templates/config';

// Get defaults
const port = PROJECT_DEFAULTS.devPort; // 5173

// Build complete configuration
const config = ConfigTemplateLoader.buildDefault({
  name: 'my-app',
  stack: 'react',
  language: 'ts',
});
```

### Generators

```typescript
import {
  generateComponentTemplate,
  generatePageTemplate,
  generatePluginIndexTemplate,
} from './templates/generators';

// Generate component
const component = generateComponentTemplate({ name: 'Button' });

// Generate page
const page = generatePageTemplate({ name: 'Home', route: '/home' });

// Generate plugin
const plugin = generatePluginIndexTemplate({
  pluginName: '@kubit/plugin-example',
  name: 'example',
  description: 'Example plugin',
  author: 'John Doe',
  year: 2024,
});
```

### Features

```typescript
import { loadFeatureTemplate, loadFeatureTemplates } from './templates/features';

// Load a template
const vitestConfig = loadFeatureTemplate('vitest.config.ts.template');

// Load multiple templates
const templates = loadFeatureTemplates(['vitest.config.ts.template', 'eslint.config.js.template']);
```

## Conventions

### File Names

- `kebab-case.ts` for template files
- Grouped by type (react-\*, plugin, etc.)

### Function Names

- `generate[Type]Template` for generators
- `build[Type]Config` for configuration

### Parameters

- Interfaces with `TemplateParams` or `Options` suffix
- Always typed with TypeScript

### Return Types

- `string` for text templates
- Objects for JSON/configuration

### Documentation

- JSDoc on all exported functions
- README.md in each subdirectory

## Extension

To add new templates:

1. **Create template file** in the appropriate directory
2. **Define interface** for parameters
3. **Implement generator** functions
4. **Export** in `index.ts`
5. **Document** in README.md
6. **Use** in corresponding commands

### Example

```typescript
// templates/generators/react-context.ts
export interface ContextTemplateParams {
  name: string;
}

export function generateContextTemplate(params: ContextTemplateParams): string {
  const { name } = params;
  return `// Template code here`;
}

// templates/generators/index.ts
export * from './react-context.js';

// commands/generate.ts
import { generateContextTemplate } from '../templates/generators';
const code = generateContextTemplate({ name: 'Auth' });
```

## Metrics

### Files Created

- **Config templates**: 3 files + README
- **Generator templates**: 4 files + README
- **Total**: 9 files (~1000 lines)

### Impact on Commands

- **Code reduction**: 30-60% in refactored commands
- **Better readability**: Shorter and clearer commands
- **Less duplication**: Reusable templates

## See Also

- [Config Templates README](./config/README.md)
- [Generator Templates README](./generators/README.md)
- [REFACTOR_SUMMARY.md](../../../REFACTOR_SUMMARY.md)
