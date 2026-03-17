# runCLI - Complete Guide

> **The simplest way to build a CLI with Kubit Forge**

`runCLI` is a powerful utility that handles all the heavy lifting of setting up a Kubit Forge-based CLI. It automatically loads configuration, initializes plugins, registers commands, and provides a complete CLI experience out-of-the-box.

---

## Table of Contents

- [Quick Start](#quick-start)
- [All Available Options](#all-available-options)
- [Option Details](#option-details)
  - [Basic Options](#basic-options)
  - [Custom Commands](#custom-commands)
  - [Recipe Support](#recipe-support)
  - [Advanced Hooks](#advanced-hooks)
- [Complete Examples](#complete-examples)
- [Comparison Matrix](#comparison-matrix)
- [Best Practices](#best-practices)
- [Migration Guide](#migration-guide)

---

## Quick Start

**Minimal setup (3 lines!):**

```typescript
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';

await runCLI({
  name: 'mycli',
  version: '1.0.0',
});
```

**That's it!** Your CLI is ready with:

- Plugin system
- Configuration loading
- Global options (`--verbose`, `--json`, `--dry-run`, etc.)
- Help and version commands
- Lifecycle hooks

---

##  All Available Options

```typescript
interface RunCLIOptions {
  // Basic Configuration
  cwd?: string;
  configDir?: string;
  configPath?: string;
  version?: string;
  name?: string;
  description?: string;

  // UI Customization
  banner?: (version: string) => string;
  examples?: string[];

  // Feature Flags
  enableRecipes?: boolean;

  // Custom Extension Points
  commands?: CommandRegistration[];
  beforeSetup?: (program: Command, ctx: PluginContext) => void | Promise<void>;
}
```

---

## Option Details

### Basic Options

#### `name`

**Type:** `string`  
**Default:** `'kubit'`

The name of your CLI (shown in help text and version).

```typescript
await runCLI({
  name: 'my-company-cli',
  version: '2.0.0',
});
```

```bash
$ my-company-cli --version
my-company-cli version 2.0.0
```

---

#### `version`

**Type:** `string`  
**Default:** `'1.0.0'`

Version number for your CLI.

```typescript
await runCLI({
  name: 'mycli',
  version: '1.2.3',
});
```

---

#### `description`

**Type:** `string`  
**Default:** `'Modern development CLI powered by Kubit Forge'`

Description shown in help text.

```typescript
await runCLI({
  name: 'deploy-tool',
  version: '1.0.0',
  description: 'Deploy your apps to any cloud provider',
});
```

---

#### `cwd`

**Type:** `string`  
**Default:** `process.cwd()`

Working directory for the CLI.

```typescript
await runCLI({
  cwd: '/path/to/project',
  name: 'mycli',
});
```

---

#### `configDir`

**Type:** `string`  
**Default:** `process.cwd()`

Directory where `kubit.config.toml` is located.

```typescript
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configDir = join(__dirname, '..');

await runCLI({
  configDir,
  name: 'mycli',
});
```

---

#### `configPath`

**Type:** `string`  
**Default:** `'kubit.config.toml'`

Custom path to configuration file.

```typescript
await runCLI({
  configPath: './config/my-cli.toml',
  name: 'mycli',
});
```

---

#### `banner`

**Type:** `(version: string) => string`  
**Default:** `undefined`

Custom banner function shown before help text.

```typescript
await runCLI({
  name: 'mycli',
  version: '1.0.0',
  banner: (version) => `

   MyCLI v${version.padEnd(20)}
   The Ultimate Dev Tool       

  `,
});
```

---

#### `examples`

**Type:** `string[]`  
**Default:** `[]`

Example commands shown in help text.

```typescript
await runCLI({
  name: 'deploy',
  examples: [
    'deploy --env staging',
    'deploy --env production --region us-east-1',
    'deploy rollback --version 1.2.3',
  ],
});
```

**Output:**

```bash
$ deploy --help

Examples:
  $ deploy --env staging
  $ deploy --env production --region us-east-1
  $ deploy rollback --version 1.2.3
```

---

### Custom Commands

#### `commands`

**Type:** `CommandRegistration[]`  
**Default:** `[]`

Register inline commands without creating a plugin.

**Simple command:**

```typescript
await runCLI({
  name: 'mycli',
  commands: [
    {
      name: 'hello',
      description: 'Say hello',
      action: async (args, ctx) => {
        ctx.logger.info('Hello, World!');
        return { status: 'ok', message: 'Done' };
      },
    },
  ],
});
```

**Command with options:**

```typescript
await runCLI({
  name: 'deploy',
  commands: [
    {
      name: 'deploy',
      description: 'Deploy your application',
      options: [
        {
          flags: '--env <environment>',
          description: 'Target environment',
          defaultValue: 'staging',
        },
        {
          flags: '--region <region>',
          description: 'AWS region',
        },
      ],
      action: async (args, ctx) => {
        ctx.logger.info(`Deploying to ${args.env} in ${args.region}...`);

        // Your deployment logic here
        await ctx.runner.run('npm', ['run', 'build']);
        await ctx.runner.run('aws', ['s3', 'sync', './dist', `s3://bucket-${args.env}`]);

        ctx.logger.success(' Deployment complete!');
        return { status: 'ok', message: 'Deployed successfully' };
      },
    },
  ],
});
```

**Multiple commands:**

```typescript
await runCLI({
  name: 'mycli',
  commands: [
    {
      name: 'start',
      description: 'Start the server',
      action: async (args, ctx) => {
        ctx.logger.info('Starting server...');
        await ctx.runner.run('npm', ['run', 'dev']);
        return { status: 'ok' };
      },
    },
    {
      name: 'build',
      description: 'Build for production',
      action: async (args, ctx) => {
        ctx.logger.info('Building...');
        await ctx.runner.run('npm', ['run', 'build']);
        return { status: 'ok' };
      },
    },
    {
      name: 'test',
      description: 'Run tests',
      action: async (args, ctx) => {
        ctx.logger.info('Running tests...');
        await ctx.runner.run('npm', ['test']);
        return { status: 'ok' };
      },
    },
  ],
});
```

---

### Recipe Support

#### `enableRecipes`

**Type:** `boolean`  
**Default:** `false`

Enable recipe commands (`recipe:list`, `recipe:run`, `recipe:add`).

```typescript
await runCLI({
  name: 'mycli',
  enableRecipes: true,
});
```

**Provides these commands automatically:**

```bash
# List all available recipes
$ mycli recipe:list

# Run a recipe
$ mycli recipe:run my-workflow --var env=production

# Add a recipe from file or URL
$ mycli recipe:add ./recipes/deploy.json
$ mycli recipe:add https://example.com/recipes/ci-setup.json
```

**Example with recipes:**

**`kubit.config.toml`**

```toml
[project]
name = "my-app"

[recipes]
paths = ["./recipes"]
```

**`recipes/deploy.json`**

```json
{
  "name": "deploy-workflow",
  "version": "1.0.0",
  "description": "Complete deployment workflow",
  "steps": [
    {
      "name": "Run tests",
      "command": "npm",
      "args": ["test"]
    },
    {
      "name": "Build",
      "command": "npm",
      "args": ["run", "build"]
    },
    {
      "name": "Deploy",
      "command": "aws",
      "args": ["s3", "sync", "./dist", "s3://my-bucket"]
    }
  ]
}
```

```bash
$ mycli recipe:list
Available Recipes:

deploy-workflow (1.0.0)
  Complete deployment workflow

$ mycli recipe:run deploy-workflow
 Recipe execution completed successfully
```

---

### Advanced Hooks

#### `beforeSetup`

**Type:** `(program: Command, ctx: PluginContext) => void | Promise<void>`  
**Default:** `undefined`

Hook to customize the Commander program before registering plugins.

**Use cases:**

- Add custom commands with full Commander API
- Modify program configuration
- Add middleware
- Setup custom help formatting

**Example 1: Add custom commands**

```typescript
await runCLI({
  name: 'mycli',
  beforeSetup: (program, ctx) => {
    // Add a command with subcommands
    const docker = program.command('docker').description('Docker utilities');

    docker
      .command('build')
      .option('--tag <tag>', 'Docker image tag')
      .action(async (options) => {
        ctx.logger.info(`Building Docker image with tag: ${options.tag}`);
        await ctx.runner.run('docker', ['build', '-t', options.tag, '.']);
      });

    docker
      .command('push')
      .option('--tag <tag>', 'Docker image tag')
      .action(async (options) => {
        ctx.logger.info(`Pushing Docker image: ${options.tag}`);
        await ctx.runner.run('docker', ['push', options.tag]);
      });
  },
});
```

**Example 2: Custom help formatting**

```typescript
await runCLI({
  name: 'mycli',
  beforeSetup: (program, ctx) => {
    program.configureHelp({
      sortSubcommands: true,
      sortOptions: true,
    });

    program.addHelpText('afterAll', () => {
      return '\n Tip: Use --verbose for detailed output\n';
    });
  },
});
```

**Example 3: Add middleware**

```typescript
await runCLI({
  name: 'mycli',
  beforeSetup: (program, ctx) => {
    // Hook to run before any command
    program.hook('preAction', async (thisCommand, actionCommand) => {
      ctx.logger.debug(`Running command: ${actionCommand.name()}`);

      // Check prerequisites
      const hasDocker = await ctx.runner.run('which', ['docker']);
      if (!hasDocker.status === 'ok') {
        ctx.logger.error('Docker is required but not installed');
        process.exit(1);
      }
    });
  },
});
```

---

## Complete Examples

### Example 1: Simple CLI with Custom Commands

```typescript
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';

await runCLI({
  name: 'simple-cli',
  version: '1.0.0',
  description: 'A simple CLI tool',

  commands: [
    {
      name: 'greet',
      description: 'Greet someone',
      options: [
        {
          flags: '--name <name>',
          description: 'Name to greet',
          defaultValue: 'World',
        },
      ],
      action: async (args, ctx) => {
        ctx.logger.info(`Hello, ${args.name}!`);
        return { status: 'ok' };
      },
    },
  ],

  examples: ['simple-cli greet', 'simple-cli greet --name Alice'],
});
```

---

### Example 2: Full-Featured CLI with Recipes and Plugins

```typescript
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configDir = join(__dirname, '..');

await runCLI({
  // Basic config
  name: 'devtool',
  version: '2.1.0',
  description: 'Complete development toolkit',
  configDir,

  // Enable recipes
  enableRecipes: true,

  // Custom banner
  banner: (version) => `

   DevTool v${version.padEnd(23)}
   Your Complete Dev Companion     

  `,

  // Inline commands
  commands: [
    {
      name: 'serve',
      description: 'Start development server',
      options: [
        {
          flags: '--port <port>',
          description: 'Port number',
          defaultValue: '3000',
        },
      ],
      action: async (args, ctx) => {
        ctx.logger.info(`Starting server on port ${args.port}...`);
        await ctx.runner.run('npm', ['run', 'dev', '--', '--port', args.port]);
        return { status: 'ok' };
      },
    },
  ],

  // Advanced setup
  beforeSetup: (program, ctx) => {
    // Add complex command groups
    const db = program.command('db').description('Database utilities');

    db.command('migrate')
      .description('Run migrations')
      .action(async () => {
        ctx.logger.info('Running migrations...');
        await ctx.runner.run('npm', ['run', 'migrate']);
      });

    db.command('seed')
      .description('Seed database')
      .action(async () => {
        ctx.logger.info('Seeding database...');
        await ctx.runner.run('npm', ['run', 'seed']);
      });
  },

  // Examples
  examples: [
    'devtool serve --port 8080',
    'devtool db migrate',
    'devtool recipe:run deploy-workflow',
  ],
});
```

**`kubit.config.toml`**

```toml
[project]
name = "devtool"
type = "web"

[plugins]
# Load your custom plugins
internal = ["./plugins/custom-plugin.js"]

# Load external plugins
enabled = ["@kubit/plugin-security"]
```

---

### Example 3: CLI Framework for Company Tools

```typescript
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configDir = join(__dirname, '..');

await runCLI({
  name: 'company-cli',
  version: '3.0.0',
  description: 'Company internal development tools',
  configDir,

  enableRecipes: true,

  banner: (version) => `
 Company CLI v${version}

  `,

  commands: [
    // Quick deployment
    {
      name: 'deploy',
      description: 'Deploy to environment',
      options: [
        {
          flags: '--env <env>',
          description: 'Target environment (dev|staging|prod)',
        },
        {
          flags: '--service <service>',
          description: 'Service to deploy',
        },
      ],
      action: async (args, ctx) => {
        if (!['dev', 'staging', 'prod'].includes(args.env)) {
          ctx.logger.error('Invalid environment');
          return { status: 'error', message: 'Invalid environment' };
        }

        ctx.logger.info(`Deploying ${args.service} to ${args.env}...`);

        // Company-specific deployment logic
        await ctx.runner.run('./scripts/deploy.sh', [args.env, args.service]);

        ctx.logger.success(' Deployment complete!');
        return { status: 'ok' };
      },
    },

    // Environment setup
    {
      name: 'env:setup',
      description: 'Setup development environment',
      action: async (args, ctx) => {
        ctx.logger.info('Setting up development environment...');

        // Install dependencies
        await ctx.runner.run('npm', ['install']);

        // Setup local databases
        await ctx.runner.run('docker-compose', ['up', '-d']);

        // Run migrations
        await ctx.runner.run('npm', ['run', 'migrate']);

        ctx.logger.success(' Environment ready!');
        return { status: 'ok' };
      },
    },
  ],

  beforeSetup: (program, ctx) => {
    // Add authentication check for production deployments
    program.hook('preAction', async (thisCommand, actionCommand) => {
      const opts = actionCommand.opts();

      if (opts.env === 'prod') {
        ctx.logger.warn(' Production deployment requires authentication');

        // Check if user is authenticated
        const auth = await ctx.runner.run('./scripts/check-auth.sh');
        if (auth.status !== 'ok') {
          ctx.logger.error('Authentication failed');
          process.exit(1);
        }
      }
    });
  },

  examples: [
    'company-cli deploy --env staging --service api',
    'company-cli env:setup',
    'company-cli recipe:run ci-setup',
  ],
});
```

---

## Comparison Matrix

| Feature             | Manual Setup | `runCLI` (Basic) | `runCLI` (Full) |
| ------------------- | ------------ | ---------------- | --------------- |
| **Lines of Code**   | ~100+        | 3-5              | 20-50           |
| **Plugin Loading**  | Manual       | Auto             | Auto            |
| **Config Loading**  | Manual       | Auto             | Auto            |
| **Global Options**  | Manual       | Auto             | Auto            |
| **Lifecycle Hooks** | Manual       | Auto             | Auto            |
| **Custom Commands** | Yes          | Via plugins      | Inline          |
| **Recipe Support**  | Manual       | Disabled         | Enabled         |
| **Advanced Hooks**  | Yes          | No               | `beforeSetup`   |
| **Flexibility**     | High         | Medium           | High            |
| **Simplicity**      | Low          | High             | Medium          |

---

## Best Practices

### 1. Start Simple, Add Complexity as Needed

```typescript
//  GOOD: Start with minimal config
await runCLI({
  name: 'mycli',
  version: '1.0.0',
});

//  BAD: Over-engineering from the start
await runCLI({
  name: 'mycli',
  version: '1.0.0',
  commands: [...100 commands],
  beforeSetup: (program) => {
    // Complex setup not needed yet
  },
});
```

### 2. Use Plugins for Reusable Logic

```typescript
//  GOOD: Use inline commands for one-off tasks
await runCLI({
  commands: [
    {
      name: 'quick-fix',
      action: async (args, ctx) => {
        // One-time script
      },
    },
  ],
});

//  BETTER: Create plugin for reusable commands
// plugins/deploy-plugin.ts
export const deployPlugin = {
  name: 'deploy',
  registerCommands() {
    return [
      /* reusable commands */
    ];
  },
};
```

### 3. Keep Configuration in `kubit.config.toml`

```typescript
//  GOOD: Minimal TypeScript, config in TOML
await runCLI({
  name: 'mycli',
  configDir: './config',
});

// kubit.config.toml
// [plugins]
// internal = ["./plugins/custom.js"]

//  BAD: Everything hardcoded
await runCLI({
  commands: [
    /* 50 commands hardcoded */
  ],
});
```

### 4. Use `enableRecipes` for Workflows

```typescript
//  GOOD: Enable recipes for complex workflows
await runCLI({
  enableRecipes: true,
});

// Define workflows in JSON
// recipes/deploy-workflow.json

//  BAD: Complex workflows in inline commands
await runCLI({
  commands: [
    {
      name: 'deploy',
      action: async () => {
        // 200 lines of deployment logic
      },
    },
  ],
});
```

### 5. Use `beforeSetup` Only for Advanced Cases

```typescript
//  GOOD: Simple commands don't need beforeSetup
await runCLI({
  commands: [{ name: 'test', action: async () => {} }],
});

//  GOOD: beforeSetup for complex Commander features
await runCLI({
  beforeSetup: (program) => {
    // Only when you need full Commander API
    program.configureHelp({ ... });
    program.hook('preAction', ...);
  },
});
```

---

##  Migration Guide

### From Manual Commander Setup

**Before:**

```typescript
import { Command } from 'commander';
import { PluginManager, ConfigLoader } from 'kubit-forge';

const program = new Command();
const config = await new ConfigLoader(process.cwd()).load();
const pluginManager = new PluginManager(logger, process.cwd());

await pluginManager.loadPlugins(config.plugins.enabled, ctx);

const commands = pluginManager.getCommands();
for (const cmd of commands) {
  program.command(cmd.name).action(cmd.action);
}

program.parse();
```

**After:**

```typescript
import { runCLI } from 'kubit-forge';

await runCLI({
  name: 'mycli',
  version: '1.0.0',
});
```

### From Individual Command Files

**Before:**

```typescript
// cli.ts
import { deploy } from './commands/deploy.js';
import { test } from './commands/test.js';

program.command('deploy').action(deploy);
program.command('test').action(test);
```

**After:**

```typescript
await runCLI({
  commands: [
    {
      name: 'deploy',
      description: 'Deploy app',
      action: async (args, ctx) => {
        // deploy logic
      },
    },
    {
      name: 'test',
      description: 'Run tests',
      action: async (args, ctx) => {
        // test logic
      },
    },
  ],
});
```

---

## Related Documentation

- [KUBIT-AS-FRAMEWORK.md](./KUBIT-AS-FRAMEWORK.md) - Using Kubit Forge as a CLI framework
- [SIMPLE-COMMANDS.md](./SIMPLE-COMMANDS.md) - Different ways to create commands
- [PLUGINS-VS-RECIPES.md](./PLUGINS-VS-RECIPES.md) - When to use plugins vs recipes
- [RECIPES-OPTIONAL.md](./RECIPES-OPTIONAL.md) - Working with recipes

---

## Summary

**`runCLI` provides three levels of usage:**

### Level 1: Zero Config (Plugins Only)

```typescript
await runCLI({ name: 'mycli', version: '1.0.0' });
```

 Perfect for plugin-based CLIs

### Level 2: Inline Commands

```typescript
await runCLI({
  name: 'mycli',
  commands: [
    /* custom commands */
  ],
  enableRecipes: true,
});
```

 Perfect for simple CLIs with a few custom commands

### Level 3: Full Control

```typescript
await runCLI({
  name: 'mycli',
  commands: [
    /* ... */
  ],
  enableRecipes: true,
  beforeSetup: (program, ctx) => {
    /* advanced setup */
  },
});
```

 Perfect for complex CLIs needing full Commander API

**Choose the level that fits your needs!**
