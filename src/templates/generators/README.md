# Generator Templates

This directory contains templates for code generation (components, pages, hooks, plugins, etc.).

## Structure

### React Component Templates (`react-component.ts`)

- `generateComponentTemplate()`: Generates the React component file
- `generateComponentIndexTemplate()`: Generates the component's index.ts
- `generateComponentTestTemplate()`: Generates the test with Vitest
- `generateComponentStoryTemplate()`: Generates the Storybook story

### React Page Templates (`react-page.ts`)

- `generatePageTemplate()`: Generates the React page file
- `generatePageIndexTemplate()`: Generates the page's index.ts
- `generatePageTestTemplate()`: Generates the page test

### React Hook Templates (`react-hook.ts`)

- `generateHookTemplate()`: Generates the React custom hook
- `generateHookTestTemplate()`: Generates the hook test

### Plugin Templates (`plugin.ts`)

- `generatePluginPackageJson()`: Generates plugin's package.json
- `generatePluginTsConfig()`: Generates plugin's tsconfig.json
- `generatePluginTsupConfig()`: Generates plugin's tsup.config.ts
- `generatePluginManifest()`: Generates kubit.plugin.json (manifest)
- `generatePluginIndexTemplate()`: Generates plugin's src/index.ts
- `generatePluginReadmeTemplate()`: Generates plugin's README.md
- `generatePluginLicenseTemplate()`: Generates plugin's LICENSE
- `generatePluginGitignoreTemplate()`: Generates plugin's .gitignore

## Usage

### Import templates

```typescript
import {
  generateComponentTemplate,
  generateComponentTestTemplate,
  generatePageTemplate,
  generateHookTemplate,
  generatePluginPackageJson,
} from '../templates/generators/index.js';
```

### Generate React component

```typescript
const componentFile = generateComponentTemplate({ name: 'Button' });
const testFile = generateComponentTestTemplate({ name: 'Button' });
const storyFile = generateComponentStoryTemplate({ name: 'Button' });
```

### Generate React page

```typescript
const pageFile = generatePageTemplate({
  name: 'Home',
  route: '/home',
});
const testFile = generatePageTestTemplate({
  name: 'Home',
  route: '/home',
});
```

### Generate hook

```typescript
const hookFile = generateHookTemplate({ name: 'useCounter' });
const testFile = generateHookTestTemplate({ name: 'useCounter' });
```

### Generate plugin

```typescript
const templateParams = {
  pluginName: '@kubit/plugin-example',
  name: 'example',
  description: 'Example plugin',
  author: 'John Doe',
  year: 2024,
};

const packageJson = generatePluginPackageJson(templateParams);
const indexTs = generatePluginIndexTemplate(templateParams);
const readme = generatePluginReadmeTemplate(templateParams);
```

## Benefits

### 1. Separation of Concerns

- Generation logic separated from templates
- Cleaner and more maintainable commands

### 2. Reusability

- Templates can be used in multiple commands
- Easy to extend with new generators

### 3. Consistency

- All generated files follow the same pattern
- Changes in templates propagate automatically

### 4. Testability

- Templates can be tested in isolation
- Easy to verify generated output

### 5. Maintainability

- Code format changes in one place
- No hardcoded strings in commands

## Commands using these templates

- `commands/generate.ts`: Uses component, page, and hook templates
- `commands/plugin-init.ts`: Uses plugin templates

## Extension

To add new templates:

1. Create new file in `templates/generators/` (e.g., `react-context.ts`)
2. Define parameter interface
3. Create generator functions
4. Export in `index.ts`
5. Use in corresponding commands

### Example of new template

```typescript
// templates/generators/react-context.ts
export interface ContextTemplateParams {
  name: string;
}

export function generateContextTemplate(params: ContextTemplateParams): string {
  const { name } = params;

  return `import { createContext, useContext } from 'react';

interface ${name}ContextValue {
  // Define context value type
}

const ${name}Context = createContext<${name}ContextValue | null>(null);

export function use${name}() {
  const context = useContext(${name}Context);
  if (!context) {
    throw new Error('use${name} must be used within ${name}Provider');
  }
  return context;
}

export function ${name}Provider({ children }: { children: React.ReactNode }) {
  // Provider implementation
  return (
    <${name}Context.Provider value={{}}>
      {children}
    </${name}Context.Provider>
  );
}
`;
}
```

## Conventions

1. **Function names**: `generate[Type]Template`
2. **Parameters**: Interface with `TemplateParams` suffix
3. **Return type**: `string` for text templates, objects for JSON
4. **Format**: Use template literals for multi-line code
5. **Indentation**: Maintain correct indentation in output
