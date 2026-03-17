# Simple Command Creation Methods

> **Multiple ways to add commands to your CLI, from simple to powerful**

This guide shows you different methods to create commands in Kubit Forge, ordered by complexity. Choose the method that best fits your needs.

> **New in v0.0.2:** `runCLI` now supports inline commands! See [RUN-CLI-COMPLETE-GUIDE.md](./RUN-CLI-COMPLETE-GUIDE.md) for the complete reference.

---

##  Table of Contents

- [Quick Comparison](#quick-comparison)
- [Method 1: Inline Commands (Simplest)](#method-1-inline-commands-simplest)
- [Method 2: Command Files](#method-2-command-files)
- [Method 3: JSON Commands (Recipe-Style)](#method-3-json-commands-recipe-style)
- [Method 4: Full Plugin (Most Powerful)](#method-4-full-plugin-most-powerful)
- [Best Practices](#best-practices)

---

## Quick Comparison

| Method              | Complexity | Best For                       |
| ------------------- | ---------- | ------------------------------ |
| **Inline Commands** | Simplest   | Quick prototypes, 1-2 commands |
| **Command Files**   | Simple     | Multiple commands, organized   |
| **JSON Commands**   | Simple     | Recipe-like workflow commands  |
| **Full Plugin**     | Complex    | Reusable, shareable, advanced  |

---

## Method 1: Inline Commands (Simplest)

**Perfect for:** Quick commands, prototypes

### Add Commands Directly in Your CLI

**`src/cli.ts`**

```typescript
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';
import { Command } from 'commander';

// Create base CLI
const program = new Command();

// Add your custom commands BEFORE runCLI
program
  .command('deploy')
  .description('Deploy application')
  .option('--env <env>', 'Environment', 'staging')
  .action(async (options) => {
    console.log(`Deploying to ${options.env}...`);
    // Your logic here
  });

program
  .command('test:e2e')
  .description('Run E2E tests')
  .action(async () => {
    console.log('Running E2E tests...');
    // Your logic here
  });

// Then run Kubit CLI (adds its commands)
await runCLI({
  name: 'mycli',
  version: '1.0.0',
  program, // Pass your program with custom commands
});
```

**Usage:**

```bash
mycli deploy --env production
mycli test:e2e
```

---

## Method 2: Command Files

**Perfect for:** Organized code, multiple commands

### Step 1: Create Command Files

**`commands/deploy.ts`**

```typescript
import type { Command } from 'commander';
import type { PluginContext } from 'kubit-forge';

export function registerDeployCommand(program: Command, ctx?: PluginContext) {
  program
    .command('deploy')
    .description('Deploy application')
    .option('--env <env>', 'Environment', 'staging')
    .option('--dry-run', 'Preview without executing')
    .action(async (options) => {
      if (ctx) {
        ctx.logger.step(`Deploying to ${options.env}...`);

        if (options.dryRun) {
          ctx.logger.info('DRY RUN: Would deploy to', options.env);
          return;
        }

        await ctx.runner.run('npm', ['run', 'build']);
        ctx.logger.success('Deployed!');
      } else {
        console.log(`Deploying to ${options.env}...`);
      }
    });
}
```

**`commands/database.ts`**

```typescript
import type { Command } from 'commander';
import type { PluginContext } from 'kubit-forge';

export function registerDatabaseCommands(program: Command, ctx?: PluginContext) {
  // db:migrate
  program
    .command('db:migrate')
    .description('Run database migrations')
    .action(async () => {
      ctx?.logger.step('Running migrations...');
      await ctx?.runner.run('npm', ['run', 'migrate']);
      ctx?.logger.success('Migrations completed!');
    });

  // db:seed
  program
    .command('db:seed')
    .description('Seed database with test data')
    .action(async () => {
      ctx?.logger.step('Seeding database...');
      await ctx?.runner.run('npm', ['run', 'seed']);
      ctx?.logger.success('Database seeded!');
    });

  // db:reset
  program
    .command('db:reset')
    .description('Reset database')
    .action(async () => {
      ctx?.logger.warn('This will delete all data!');
      // Add confirmation logic
      await ctx?.runner.run('npm', ['run', 'db:reset']);
      ctx?.logger.success('Database reset!');
    });
}
```

### Step 2: Load Command Files

**`src/cli.ts`**

```typescript
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';
import { Command } from 'commander';
import { registerDeployCommand } from './commands/deploy.js';
import { registerDatabaseCommands } from './commands/database.js';

const program = new Command();

// Register all your command files
registerDeployCommand(program);
registerDatabaseCommands(program);

await runCLI({
  name: 'mycli',
  version: '1.0.0',
  program,
});
```

**Benefits:**

- Organized by feature
- Easy to test individually
- Simple to maintain
- No plugin boilerplate

---

## Method 3: JSON Commands (Recipe-Style)

**Perfect for:** Shell-based commands, workflow automation

### Define Commands in JSON

**`commands/deploy-commands.json`**

```json
{
  "commands": [
    {
      "name": "deploy:staging",
      "description": "Deploy to staging environment",
      "steps": [
        {
          "name": "Run tests",
          "command": "npm",
          "args": ["test"]
        },
        {
          "name": "Build application",
          "command": "npm",
          "args": ["run", "build"]
        },
        {
          "name": "Deploy to staging",
          "command": "aws",
          "args": ["s3", "sync", "./dist", "s3://my-bucket-staging"]
        }
      ]
    },
    {
      "name": "deploy:production",
      "description": "Deploy to production environment",
      "confirmRequired": true,
      "steps": [
        {
          "name": "Run tests",
          "command": "npm",
          "args": ["test"]
        },
        {
          "name": "Build application",
          "command": "npm",
          "args": ["run", "build", "--", "--mode", "production"]
        },
        {
          "name": "Deploy to production",
          "command": "aws",
          "args": ["s3", "sync", "./dist", "s3://my-bucket-prod"]
        },
        {
          "name": "Invalidate CDN cache",
          "command": "aws",
          "args": ["cloudfront", "create-invalidation", "--distribution-id", "E123456"]
        }
      ]
    }
  ]
}
```

### Load JSON Commands

**`src/load-json-commands.ts`**

```typescript
import { readFileSync } from 'fs';
import type { Command } from 'commander';
import type { PluginContext } from 'kubit-forge';

interface JSONCommand {
  name: string;
  description: string;
  confirmRequired?: boolean;
  steps: {
    name: string;
    command: string;
    args: string[];
  }[];
}

interface CommandFile {
  commands: JSONCommand[];
}

export function loadJSONCommands(program: Command, filePath: string, ctx?: PluginContext) {
  const file = JSON.parse(readFileSync(filePath, 'utf-8')) as CommandFile;

  for (const cmd of file.commands) {
    program
      .command(cmd.name)
      .description(cmd.description)
      .option('--dry-run', 'Preview without executing')
      .action(async (options) => {
        if (cmd.confirmRequired && !options.dryRun) {
          // Add confirmation logic
          ctx?.logger.warn(`WARNING: You are about to run: ${cmd.name}`);
          // In real implementation, use enquirer to confirm
        }

        for (const step of cmd.steps) {
          ctx?.logger.step(step.name);

          if (options.dryRun) {
            ctx?.logger.info(`Would run: ${step.command} ${step.args.join(' ')}`);
            continue;
          }

          await ctx?.runner.run(step.command, step.args);
        }

        ctx?.logger.success(` ${cmd.name} completed`);
      });
  }
}
```

**`src/cli.ts`**

```typescript
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';
import { Command } from 'commander';
import { loadJSONCommands } from './load-json-commands.js';

const program = new Command();

// Load JSON command definitions
loadJSONCommands(program, './commands/deploy-commands.json');
loadJSONCommands(program, './commands/database-commands.json');

await runCLI({
  name: 'mycli',
  version: '1.0.0',
  program,
});
```

**Benefits:**

- Recipe-like simplicity
- No TypeScript needed for commands
- Easy to generate/template
- Perfect for shell-based workflows

---

## Method 4: Full Plugin (Most Powerful)

**Perfect for:** Reusable packages, complex logic, npm distribution

**See:** [Plugin System Documentation](./PLUGIN-SYSTEM.md)

### Quick Plugin Template

**`plugins/my-plugin.ts`**

```typescript
import type { Plugin, CommandRegistration, PluginContext } from 'kubit-forge';

export const myPlugin: Plugin = {
  name: '@mycompany/my-plugin',
  version: '1.0.0',

  registerCommands(): CommandRegistration[] {
    return [
      {
        name: 'my-command',
        description: 'My custom command',
        action: async (args, ctx) => {
          ctx.logger.step('Running my command...');
          // Your logic
          return { message: 'Success', status: 'ok' };
        },
      },
    ];
  },
};
```

---

## Best Practices

### 1. Start Simple, Grow as Needed

```
Start with inline  Move to command files  Convert to plugin when sharing
```

### 2. Use the Right Method

| If you need...   | Use...          |
| ---------------- | --------------- |
| Quick prototype  | Inline commands |
| 5+ commands      | Command files   |
| Shell workflows  | JSON commands   |
| Reusable package | Full plugin     |

### 3. Combine Methods

```typescript
const program = new Command();

// Inline for quick commands
program.command('quick').action(async () => {});

// Files for organized commands
registerDeployCommand(program);

// JSON for workflows
loadJSONCommands(program, './workflows.json');

await runCLI({ name: 'mycli', program });
```

### 4. Use Kubit Context When Possible

```typescript
// Good: Uses Kubit utilities
.action(async (options, ctx) => {
  ctx.logger.step('Deploying...');
  await ctx.runner.run('npm', ['build']);
});

// OK: Direct console
.action(async (options) => {
  console.log('Deploying...');
});
```

---

## Complete Example

**Project Structure:**

```
my-cli/
 src/
    cli.ts
    commands/
        deploy.ts
        database.ts
 workflows/
    deploy-commands.json
    testing-commands.json
 plugins/
    company-plugin.ts
 kubit.config.toml
 package.json
```

**`src/cli.ts`** - Combining all methods:

```typescript
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';
import { Command } from 'commander';
import { registerDeployCommand } from './commands/deploy.js';
import { registerDatabaseCommands } from './commands/database.js';
import { loadJSONCommands } from './load-json-commands.js';

const program = new Command();

// Method 1: Inline quick command
program
  .command('version:bump')
  .description('Bump version')
  .action(async () => {
    console.log('Bumping version...');
  });

// Method 2: Command files
registerDeployCommand(program);
registerDatabaseCommands(program);

// Method 3: JSON workflows
loadJSONCommands(program, './workflows/deploy-commands.json');

// Method 4: Full plugins loaded from config
await runCLI({
  name: 'mycli',
  version: '1.0.0',
  program,
});
```

**`kubit.config.toml`** - Plugin configuration:

```toml
[project]
name = "my-cli"

[plugins]
# Method 4: Full plugins
internal = ["./plugins/company-plugin.js"]
```

---

## Recommendation

**For most use cases:**

1. **Start with inline commands** (Method 1) for prototyping
2. **Move to command files** (Method 2) when you have 3+ commands
3. **Use JSON for workflows** (Method 3) that are mostly shell commands
4. **Create plugins** (Method 4) only when:
   - Sharing with others
   - Publishing to npm
   - Complex logic with hooks
   - Need full lifecycle control

---

## Quick Start Template

**Simplest possible CLI with custom commands:**

```typescript
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';
import { Command } from 'commander';

const program = new Command();

// Add your commands here
program.command('deploy').action(async () => {
  console.log('Deploying...');
});

program.command('test').action(async () => {
  console.log('Testing...');
});

// Load Kubit features + your commands
await runCLI({
  name: 'mycli',
  version: '1.0.0',
  program,
});
```

**That's it!** No plugin boilerplate needed for simple commands. 

---

## See Also

- [Plugin System](./PLUGIN-SYSTEM.md) - Full plugin guide
- [Recipe System](./RECIPE-SYSTEM.md) - Workflow automation
- [Kubit as Framework](./KUBIT-AS-FRAMEWORK.md) - Complete guide

---

**Questions?** Open an issue on [GitHub](https://github.com/kubit-ui/kubit-forge/issues).
