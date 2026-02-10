# runCLI() - Zero-Config CLI Creation

## Overview

`runCLI()` is the main entry point for creating kubit-forge-based CLIs. It provides a complete CLI runtime with zero boilerplate.

## Features

- ✅ **Zero Configuration** - Works out of the box
- ✅ **Auto Plugin Loading** - Loads plugins from `kubit.config.toml`
- ✅ **Auto Command Registration** - Registers all commands from plugins
- ✅ **Auto Generator Registration** - Registers all generators as commands
- ✅ **Global Options** - Provides standard CLI options (`--verbose`, `--json`, etc.)
- ✅ **Lifecycle Hooks** - Calls `beforeCommand` and `afterCommand` hooks
- ✅ **Custom Banners** - Support for custom CLI banners
- ✅ **Help Examples** - Add custom examples to help text

## Basic Usage

### Minimal CLI

```typescript
#!/usr/bin/env node
// src/index.ts
import { runCLI } from 'kubit-forge';

await runCLI({
  name: 'my-cli',
  version: '1.0.0',
  description: 'My awesome CLI',
});
```

That's it! Your CLI is ready with:

- All commands from plugins loaded automatically
- All generators exposed as `generate:*` commands
- Help text, version flag, and global options

### With Custom Banner

```typescript
import { runCLI } from 'kubit-forge';

await runCLI({
  name: 'my-cli',
  version: '1.0.0',
  description: 'My awesome CLI',
  banner: (version) => `
╔═══════════════════════════════════════╗
║     My CLI v${version.padEnd(24)}║
║        Powered by Kubit Forge        ║
╚═══════════════════════════════════════╝
  `,
  examples: ['my-cli build', 'my-cli generate component Button', 'my-cli --help'],
});
```

### For Bundled CLIs

If your CLI bundles plugins internally (like `@gruposantander/mb-ui-cli`), use `configDir`:

```typescript
import { runCLI } from 'kubit-forge';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get CLI directory
const cliDir = dirname(fileURLToPath(import.meta.url));
const configDir = join(cliDir, '..'); // Go up to root

await runCLI({
  configDir, // ← Explicitly specify config directory
  name: 'mb-cli',
  version: '16.0.0',
  description: 'Model Bank Development CLI',
});
```

This loads `kubit.config.toml` from the CLI's installation directory instead of the user's project directory.

## Configuration File

Your CLI needs a `kubit.config.toml`:

```toml
[project]
name = "my-cli"
stack = "vanilla"
type = "library"

[plugins]
# External plugins from npm
enabled = [
  "@my-org/my-plugin"
]

# Internal plugins (local paths)
internal = [
  "./dist/plugins/core"
]
```

## API Reference

### RunCLIOptions

```typescript
interface RunCLIOptions {
  /**
   * Working directory (defaults to process.cwd())
   */
  cwd?: string;

  /**
   * Path to config file (defaults to kubit.config.toml)
   */
  configPath?: string;

  /**
   * CLI version (for --version flag)
   */
  version?: string;

  /**
   * CLI name (for help text)
   */
  name?: string;

  /**
   * CLI description (for help text)
   */
  description?: string;

  /**
   * Custom banner function
   */
  banner?: (version: string) => string;

  /**
   * Additional examples for help text
   */
  examples?: string[];

  /**
   * Directory where kubit.config.toml is located
   * If not provided, defaults to process.cwd()
   */
  configDir?: string;
}
```

## How It Works

When you call `runCLI()`:

1. **Loads Configuration** - Reads `kubit.config.toml` using `ConfigLoader`
2. **Creates Plugin Context** - Initializes `PluginManager`, `ConsoleLogger`, `TaskRunner`
3. **Loads Plugins** - Loads external (`plugins.enabled`) and internal (`plugins.internal`) plugins
4. **Registers Commands** - Auto-registers all commands from `plugin.registerCommands()`
5. **Registers Generators** - Auto-registers all generators from `plugin.registerGenerators()` as `generate:*` commands
6. **Parses Arguments** - Uses Commander.js to parse CLI arguments
7. **Executes Command** - Runs the command with lifecycle hooks

## Global Options

All CLIs created with `runCLI()` get these global options for free:

```bash
--cwd <path>          Working directory
--config <path>       Path to config file
--json                Output as JSON
--verbose             Verbose output
--quiet               Minimal output
--no-color            Disable colors
--dry-run             Show what would be done
--yes                 Skip confirmations
--profile             Show timing information
-v, --version         Display version
-h, --help            Display help
```

## Example: Enterprise CLI

```typescript
// src/index.ts
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const cliDir = dirname(fileURLToPath(import.meta.url));
const configDir = join(cliDir, '..');

await runCLI({
  configDir,
  name: 'enterprise-cli',
  version: '2.0.0',
  description: 'Enterprise Development CLI',
  banner: (version) => `
╔══════════════════════════════════════════╗
║  Enterprise CLI v${version.padEnd(23)}║
║    Powered by Kubit Forge               ║
╚══════════════════════════════════════════╝
  `,
  examples: [
    'enterprise-cli build --prod',
    'enterprise-cli generate component Button',
    'enterprise-cli test --watch',
    'enterprise-cli deploy --environment staging',
  ],
});
```

```toml
# kubit.config.toml
[project]
name = "enterprise-cli"
stack = "vanilla"
type = "library"

[plugins]
internal = [
  "./dist/plugins/company-standards",
  "./dist/plugins/deployment",
  "./dist/plugins/security"
]
```

Now your CLI has all commands from those plugins available automatically!

## Migration from Manual Setup

### Before (Manual)

```typescript
// ❌ ~200 lines of boilerplate
import { Command } from 'commander';
import { PluginManager, ConfigLoader } from 'kubit-forge';

const program = new Command();
program.name('my-cli').version('1.0.0');

// Setup global options
program.option('--verbose', '...');
program.option('--json', '...');
// ... 10 more options

// Load config manually
const loader = new ConfigLoader();
const config = await loader.load();

// Initialize plugins manually
const manager = new PluginManager(logger, cwd);
await manager.loadInternalPlugins(config.plugins.internal, ctx);

// Register commands manually
const commands = manager.getCommands();
for (const cmd of commands) {
  const command = program.command(cmd.name);
  // ... register options, action, etc.
}

program.parse();
```

### After (runCLI)

```typescript
// ✅ 6 lines, same functionality
import { runCLI } from 'kubit-forge';

await runCLI({
  name: 'my-cli',
  version: '1.0.0',
});
```

## See Also

- [Internal Plugins](./PLUGINS_INTERNAL.md)
- [Plugin Development](./PLUGIN_DEVELOPMENT.md)
- [Configuration](./CONFIGURATION.md)
