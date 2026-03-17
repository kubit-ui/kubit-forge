# Code Generation

## Overview

Kubit Forge includes powerful code generators that create components, pages, tests, and other code scaffolds following best practices and your project's conventions.

## Quick Start

```bash
# Generate a component
kubit-forge generate component Button

# Generate a page
kubit-forge generate page Dashboard

# Generate a hook
kubit-forge generate hook useAuth

# Interactive mode
kubit-forge generate
```

## Available Generators

### Component Generator

Create React/Vue components with associated files.

```bash
# Basic component
kubit-forge generate component Button

# Component with directory
kubit-forge generate component Button --dir src/components/ui

# Component with tests
kubit-forge generate component Button --with-tests

# Component with story
kubit-forge generate component Button --with-story

# Functional component (default)
kubit-forge generate component Button --type functional

# Class component
kubit-forge generate component Button --type class
```

**Generated Files:**

```
src/components/Button/
 Button.tsx
 Button.test.tsx        # if --with-tests
 Button.stories.tsx     # if --with-story
 Button.module.css      # if using CSS Modules
 index.ts
```

**Example Output (Button.tsx):**

```typescript
import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### Page Generator

Create page components with routing setup.

```bash
# Basic page
kubit-forge generate page Dashboard

# Page with layout
kubit-forge generate page Dashboard --layout MainLayout

# Page with route
kubit-forge generate page Dashboard --route /dashboard

# Nested page
kubit-forge generate page admin/Users --route /admin/users
```

**Generated Files:**

```
src/pages/Dashboard/
 Dashboard.tsx
 Dashboard.test.tsx
 index.ts
```

### Hook Generator

Create custom React hooks.

```bash
# Basic hook
kubit-forge generate hook useAuth

# Hook with TypeScript types
kubit-forge generate hook useLocalStorage --typed

# Hook with tests
kubit-forge generate hook useFetch --with-tests
```

**Example Output (useAuth.ts):**

```typescript
import { useState, useEffect } from 'react';

export interface UseAuthReturn {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: Credentials) => {
    // Implementation
  };

  const logout = () => {
    // Implementation
  };

  return {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
```

### Service Generator

Create API service modules.

```bash
# Basic service
kubit-forge generate service api

# Service with endpoints
kubit-forge generate service users --endpoints list,get,create,update,delete

# Service with axios
kubit-forge generate service products --client axios
```

**Example Output (api.service.ts):**

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await apiClient.get(endpoint);
    return response.data;
  },

  post: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  },

  // ... more methods
};
```

### Utility Generator

Create utility functions.

```bash
# Basic utility
kubit-forge generate util formatDate

# Utility with tests
kubit-forge generate util validation --with-tests
```

### Store Generator

Create state management stores.

```bash
# Zustand store
kubit-forge generate store user --library zustand

# Redux slice
kubit-forge generate store products --library redux

# Context provider
kubit-forge generate store theme --library context
```

**Example Output (userStore.ts with Zustand):**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
    }
  )
);
```

### Test Generator

Generate test files for existing components.

```bash
# Generate test for component
kubit-forge generate test Button

# Generate E2E test
kubit-forge generate test Dashboard --type e2e

# Generate integration test
kubit-forge generate test api --type integration
```

### Type Generator

Generate TypeScript types and interfaces.

```bash
# Generate type from API response
kubit-forge generate type User --from-api /api/users

# Generate type from JSON
kubit-forge generate type Config --from-json config.json

# Generate enum
kubit-forge generate type Status --enum pending,active,completed
```

## Generator Options

### Common Options

```bash
# Specify output directory
--dir src/custom/path

# Include tests
--with-tests

# Include Storybook story
--with-story

# Dry run (preview without creating)
--dry-run

# Force overwrite existing files
--force

# Use custom template
--template ./my-template.hbs
```

### TypeScript Options

```bash
# Generate with TypeScript
--typescript

# Generate with strict types
--strict

# Include JSDoc comments
--jsdoc
```

### Styling Options

```bash
# CSS Modules
--style css-modules

# Styled Components
--style styled-components

# Tailwind CSS
--style tailwind

# No styles
--style none
```

## Custom Templates

### Creating Custom Templates

```bash
# Initialize custom template
kubit-forge generate:template component MyComponent
```

**Template Structure:**

```
.kubit/templates/component/
 component.tsx.hbs
 component.test.tsx.hbs
 component.stories.tsx.hbs
 template.config.json
```

**Example Template (component.tsx.hbs):**

```handlebars
import React from 'react';
{{#if styles}}
import styles from './{{name}}.module.css';
{{/if}}

export interface {{name}}Props {
  {{#each props}}
  {{name}}{{#if optional}}?{{/if}}: {{type}};
  {{/each}}
}

export const {{name}}: React.FC<{{name}}Props> = ({
  {{#each props}}
  {{name}}{{#if defaultValue}} = {{defaultValue}}{{/if}},
  {{/each}}
}) => {
  return (
    <div{{#if styles}} className={styles.{{lowercase name}}}{{/if}}>
      {/* Component content */}
    </div>
  );
};
```

**Template Configuration (template.config.json):**

```json
{
  "name": "component",
  "description": "React component with TypeScript",
  "prompts": [
    {
      "type": "input",
      "name": "name",
      "message": "Component name:"
    },
    {
      "type": "confirm",
      "name": "withTests",
      "message": "Include tests?",
      "default": true
    },
    {
      "type": "select",
      "name": "style",
      "message": "Styling solution:",
      "choices": ["css-modules", "styled-components", "tailwind", "none"]
    }
  ],
  "files": [
    {
      "template": "component.tsx.hbs",
      "output": "{{dir}}/{{name}}/{{name}}.tsx"
    },
    {
      "template": "component.test.tsx.hbs",
      "output": "{{dir}}/{{name}}/{{name}}.test.tsx",
      "condition": "{{withTests}}"
    }
  ]
}
```

### Using Custom Templates

```bash
# List custom templates
kubit-forge generate:list-templates

# Use custom template
kubit-forge generate --template custom-component Button
```

## Generator Plugins

Extend generators with plugins:

```typescript
// .kubit/plugins/generator-plugin.ts
export default {
  name: 'custom-generator-plugin',

  generators: {
    'api-client': {
      description: 'Generate API client',

      prompts: [
        {
          type: 'input',
          name: 'serviceName',
          message: 'Service name:',
        },
      ],

      generate: async (answers, ctx) => {
        // Generate files
        await ctx.writeFile(`src/services/${answers.serviceName}.ts`, generateServiceCode(answers));
      },
    },
  },
};
```

## Batch Generation

Generate multiple files at once:

```bash
# Generate from configuration
kubit-forge generate:batch --config generators.json
```

**generators.json:**

```json
{
  "components": [
    { "name": "Button", "withTests": true },
    { "name": "Input", "withTests": true },
    { "name": "Card", "withTests": false }
  ],
  "pages": [
    { "name": "Dashboard", "route": "/dashboard" },
    { "name": "Profile", "route": "/profile" }
  ]
}
```

## AI-Powered Generation

Use AI to generate code from descriptions:

```bash
# Generate from description
kubit-forge generate:ai --prompt "Create a login form component with email and password fields"

# Generate from requirements
kubit-forge generate:ai --from-file requirements.md
```

## Best Practices

### 1. Consistent Naming

```bash
# Good: PascalCase for components
kubit-forge generate component UserProfile

# Good: camelCase for hooks
kubit-forge generate hook useUserProfile

# Good: camelCase for utilities
kubit-forge generate util formatUserName
```

### 2. Include Tests

```bash
# Always generate with tests
kubit-forge generate component Button --with-tests
```

### 3. Use Type Safety

```bash
# Generate with strict TypeScript
kubit-forge generate component Button --typescript --strict
```

### 4. Follow Project Structure

```bash
# Organize by feature
kubit-forge generate component Button --dir src/features/auth/components
```

### 5. Document Components

```bash
# Generate with stories for documentation
kubit-forge generate component Button --with-story
```

## Examples

### Generate Complete Feature

```bash
# Create feature structure
kubit-forge generate page Users --with-tests
kubit-forge generate component UserList --dir src/features/users --with-tests
kubit-forge generate component UserCard --dir src/features/users --with-tests
kubit-forge generate hook useUsers --dir src/features/users --with-tests
kubit-forge generate service users
```

### Generate Form

```bash
kubit-forge generate component LoginForm --with-tests
kubit-forge generate hook useLoginForm
kubit-forge generate util validateLoginForm --with-tests
```

### Generate API Module

```bash
kubit-forge generate service api
kubit-forge generate type ApiResponse
kubit-forge generate util apiClient
kubit-forge generate test api --type integration
```

## Troubleshooting

### Template Not Found

```bash
# List available templates
kubit-forge generate:list-templates

# Use default template
kubit-forge generate component Button --template default
```

### File Already Exists

```bash
# Force overwrite
kubit-forge generate component Button --force

# Or rename
kubit-forge generate component ButtonNew
```

### Invalid Name

```bash
# Valid component names
kubit-forge generate component MyComponent  #  PascalCase
kubit-forge generate component my-component #  kebab-case not allowed
```

## Related Documentation

- [Add Command](./ADD-COMMAND.md) - Add features
- [Development Commands](./DEVELOPMENT-COMMANDS.md) - Build and test
- [Configuration](./CONFIGURATION.md) - Configure generators

---

**Need help?** Run `kubit-forge generate --help` or visit [GitHub](https://github.com/kubit-ui/kubit-forge/issues).
