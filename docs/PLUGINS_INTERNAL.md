# Internal Plugins Support

## Overview

Kubit Forge now supports loading **internal (local) plugins** from file paths in addition to npm packages.

## Configuration

Add internal plugins to your `kubit.config.toml`:

```toml
[plugins]
# External plugins from npm
enabled = [
  "@some-org/kubit-plugin-feature"
]

# Internal plugins (local file paths)
internal = [
  "./src/plugins/my-plugin",
  "./plugins/custom-commands"
]
```

## Usage

### 1. Create an Internal Plugin

```typescript
// src/plugins/my-plugin/index.ts
import type { Plugin, PluginContext, CommandRegistration } from 'kubit-forge';

const plugin: Plugin = {
  name: '@myorg/my-plugin',
  version: '1.0.0',

  onLoad: async (ctx: PluginContext) => {
    ctx.logger.info('My Plugin loaded');
  },

  registerCommands: (): CommandRegistration[] => {
    return [
      {
        name: 'my-command',
        description: 'My custom command',
        action: async (args, ctx) => {
          ctx.logger.success('Command executed!');
          return { status: 'ok' };
        },
      },
    ];
  },
};

export default plugin;
```

### 2. Load Plugins

```typescript
import { PluginManager, ConfigLoader } from 'kubit-forge';

const configLoader = new ConfigLoader();
const config = await configLoader.load();

const pluginManager = new PluginManager(logger, cwd);

// Load external plugins
if (config.plugins?.enabled) {
  await pluginManager.loadPlugins(config.plugins.enabled, ctx);
}

// Load internal plugins
if (config.plugins?.internal) {
  await pluginManager.loadInternalPlugins(config.plugins.internal, ctx);
}

// Access registered commands
const commands = pluginManager.getCommands();
for (const [name, cmd] of commands) {
  console.log(`Command: ${name}`);
}
```

## API

### `PluginManager.loadInternalPlugins()`

```typescript
async loadInternalPlugins(
  pluginPaths: string[],
  ctx: PluginContext
): Promise<void>
```

Loads internal plugins from file paths relative to `cwd`.

**Parameters:**

- `pluginPaths`: Array of relative file paths to plugin modules
- `ctx`: Plugin context with config, logger, etc.

**Example:**

```typescript
await pluginManager.loadInternalPlugins(['./src/plugins/custom', './plugins/enterprise'], ctx);
```

## Benefits

### ✅ **No npm publish required**

Keep internal plugins private without publishing to npm

### ✅ **Monorepo friendly**

Share plugins across packages in a monorepo

### ✅ **Development workflow**

Develop plugins alongside your application

### ✅ **Enterprise use cases**

Company-specific functionality without external dependencies

## Plugin Structure

Internal plugins follow the same interface as external plugins:

```typescript
interface Plugin {
  name: string;
  version: string;

  // Lifecycle hooks
  onLoad?(ctx: PluginContext): Promise<void> | void;
  onConfigLoaded?(ctx: PluginContext): Promise<void> | void;

  // Registration
  registerCommands?(): CommandRegistration[];
  registerTasks?(): TaskRegistration[];
  registerGenerators?(): GeneratorRegistration[];
  registerProviders?(): ProviderRegistration[];
}
```

## Example: Enterprise CLI

```toml
# kubit.config.toml
[project]
name = "enterprise-cli"
type = "web"

[plugins]
# Public plugins
enabled = [
  "@kubit-ui/plugin-react"
]

# Company-specific plugins
internal = [
  "./src/plugins/company-standards",
  "./src/plugins/deployment",
  "./src/plugins/security-checks"
]
```

```typescript
// src/plugins/company-standards/index.ts
export default {
  name: '@company/standards',
  version: '1.0.0',

  registerCommands: () => [
    {
      name: 'validate:standards',
      description: 'Validate code against company standards',
      action: async (args, ctx) => {
        // Custom validation logic
        return { status: 'ok' };
      },
    },
  ],
};
```

## Migration Guide

### Before (Manual Loading)

```typescript
// ❌ Manual plugin loading
const plugin = await import('./plugins/my-plugin');
await plugin.default.onLoad(ctx);
const commands = plugin.default.registerCommands();
// Manual command registration...
```

### After (Kubit Forge)

```toml
# ✅ Declarative configuration
[plugins]
internal = ["./plugins/my-plugin"]
```

```typescript
// ✅ Automatic loading by PluginManager
const config = await configLoader.load();
await pluginManager.loadInternalPlugins(config.plugins.internal, ctx);
```

## See Also

- [Plugin System](./PLUGINS.md)
- [Creating Plugins](./PLUGIN_DEVELOPMENT.md)
- [Plugin API Reference](./API_PLUGINS.md)
