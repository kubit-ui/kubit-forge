# Configuration Templates

This directory contains centralized templates for CLI default configurations.

## Structure

- **`defaults.ts`**: Defines all default configuration constants
  - `PROJECT_DEFAULTS`: Default values for project configuration (nodeVersion, devPort, packageManager)
  - `PATHS_DEFAULTS`: Default values for paths (src, dist, envExample, envLocal)
  - `QUALITY_DEFAULTS`: Default values for quality tools (lint, format, typecheck, unitTest)
  - `QUALITY_MINIMAL`: Minimal quality configuration (all disabled)
  - `PLUGIN_DEFAULTS`: Default plugin configuration
  - `AVAILABLE_PLUGINS`: List of available plugins
  - Type constants: `PACKAGE_MANAGERS`, `STACKS`, `LANGUAGES`, `PROJECT_TYPES`

- **`config-templates.ts`**: Configuration loader and builder
  - `ConfigTemplateLoader`: Class with static methods to build configurations
    - `buildDefault()`: Builds a complete configuration with defaults
    - `buildProjectConfig()`: Builds only the project section
    - `buildPathsConfig()`: Builds only the paths section
    - `buildQualityConfig()`: Builds only the quality section
    - `buildPluginsConfig()`: Builds only the plugins section
    - `mergeWithDefaults()`: Merges partial configuration with defaults

## Usage

### Import templates

```typescript
import {
  ConfigTemplateLoader,
  PROJECT_DEFAULTS,
  PATHS_DEFAULTS,
  QUALITY_DEFAULTS,
  AVAILABLE_PLUGINS,
  PACKAGE_MANAGERS,
} from '../templates/config/index.js';
```

### Build complete configuration

```typescript
const config = ConfigTemplateLoader.buildDefault({
  name: 'my-app',
  stack: 'react',
  language: 'ts',
  packageManager: 'pnpm',
});
```

### Use individual default values

```typescript
// Instead of hardcoding values
const devPort = 5173; // ❌ Avoid

// Use templates
const devPort = PROJECT_DEFAULTS.devPort; // ✅ Correct
```

### Build partial configuration

```typescript
const projectConfig = ConfigTemplateLoader.buildProjectConfig({
  name: 'my-app',
  stack: 'react',
});

const pathsConfig = ConfigTemplateLoader.buildPathsConfig();
```

### Merge with existing configuration

```typescript
const config = ConfigTemplateLoader.mergeWithDefaults(partialConfig, {
  name: 'my-app',
  minimal: true,
});
```

## Benefits

1. **Centralization**: All default values in one place
2. **Maintainability**: Changes in defaults propagate automatically
3. **Consistency**: Same values throughout the application
4. **Type Safety**: TypeScript ensures correct types
5. **Reusability**: Easy to use in multiple commands

## Files using these templates

- `utils/config-loader.ts`: Auto-detection of configuration
- `utils/interactive-config.ts`: Interactive configuration wizard
- `commands/init.ts`: Initial configuration generation
- `commands/dev.ts`: Use of default devPort
