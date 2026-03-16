# Using Kubit Forge as a CLI Framework

> **Usa Kubit Forge como base para construir tus propios CLIs personalizados**

Kubit Forge no es solo un CLI para proyectos web - es un **framework completo** que puedes usar para construir tus propias herramientas de línea de comandos con todas las capacidades integradas.

>  **Guía Completa:** Para una referencia detallada de todas las opciones disponibles, consulta [RUN-CLI-COMPLETE-GUIDE.md](./RUN-CLI-COMPLETE-GUIDE.md)

**Build your own enterprise-grade CLI powered by Kubit Forge**

Kubit Forge is not just a CLI tool—it's a **complete CLI framework** that you can extend to build your own custom command-line applications. This guide shows you how to leverage Kubit Forge's architecture to create organization-specific CLIs.

---

##  Table of Contents

- [Why Use Kubit as a Framework?](#why-use-kubit-as-a-framework)
- [Core Concepts](#core-concepts)
- [Getting Started](#getting-started)
- [Custom Plugins](#custom-plugins)
- [Custom Recipes](#custom-recipes)
- [Custom Commands](#custom-commands)
- [Configuration](#configuration)
- [Real-World Examples](#real-world-examples)
- [Best Practices](#best-practices)

---

## Why Use Kubit as a Framework?

###  What You Get Out of the Box

When you build on top of Kubit Forge, you inherit:

- **Plugin System** - Modular architecture
- **Recipe Engine** - Workflow automation
- **Command Infrastructure** - CLI framework with Commander.js
- **Configuration Management** - TOML-based config
- **Package Manager Detection** - yarn, npm, pnpm support
- **Logger & UI Helpers** - Beautiful terminal output
- **File System Utilities** - Safe file operations
- **Testing Infrastructure** - Ready to test your CLI
- **TypeScript Support** - Full type safety

###  Perfect For

- **Internal Developer Tools** - Company-specific tooling
- **Framework CLIs** - Build CLIs for your framework
- **Automation Tools** - DevOps and deployment automation
- **Code Generation** - Custom scaffolding tools
- **Enterprise Tooling** - Standardized workflows

---

## Core Concepts

### Architecture Overview

```
Your Custom CLI
 Uses Kubit Core
    Plugin System
    Recipe Engine
    Command Infrastructure
    Utilities

 Your Custom Plugins
    company-plugin.ts
    team-plugin.ts

 Your Custom Recipes
    deploy-workflow.json
    setup-dev-env.json

 Your Custom Commands
     deploy.ts
     provision.ts
```

### Extension Points

1. **Plugins** - Add new commands and functionality
2. **Recipes** - Automate complex workflows
3. **Commands** - Extend or replace core commands
4. **Configuration** - Custom config schemas
5. **Templates** - Project scaffolding

---

## Getting Started

### 1. Install Kubit Forge

```bash
# Add Kubit as dependency
npm install kubit-forge

# Or as dev dependency
npm install -D kubit-forge
```

### 2. Create Your CLI Package

```bash
# Initialize your CLI project
mkdir my-company-cli
cd my-company-cli
npm init -y
npm install kubit-forge commander
```

### 3. Create CLI Entry Point

**`src/cli.ts`** (Using `runCLI` - Recommended )

```typescript
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const cliDir = dirname(fileURLToPath(import.meta.url));
const configDir = join(cliDir, '..');

// Run CLI with automatic plugin/recipe loading
await runCLI({
  name: 'my-company-cli',
  version: '1.0.0',
  description: 'Custom CLI built on Kubit Forge',
  configDir,
  examples: ['my-company-cli deploy --env staging', 'my-company-cli recipe apply deploy-workflow'],
});
```

**What `runCLI` does automatically:**

-  Loads `kubit.config.toml` configuration
-  Initializes plugin system
-  Loads all plugins (from config `[plugins]` section)
-  Loads all recipes (from config `[recipes]` section)
-  Registers all commands from plugins
-  Registers all generators
-  Handles global options (`--verbose`, `--json`, `--dry-run`, etc.)
-  Provides help and version commands
-  Lifecycle hooks (before/after command)

**Alternative: Manual Setup** (Only if you need full control)

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { PluginManager, ConfigLoader, ConsoleLogger, DefaultTaskRunner } from 'kubit-forge';

const program = new Command();
program.name('my-company-cli').description('Custom CLI built on Kubit Forge').version('1.0.0');

// Manual setup
const logger = new ConsoleLogger({});
const configLoader = new ConfigLoader(process.cwd());
const config = await configLoader.load();
const pluginManager = new PluginManager(logger, process.cwd());

const ctx = {
  config,
  cwd: process.cwd(),
  logger,
  pluginManager,
  runner: new DefaultTaskRunner(logger),
};

// Load plugins manually
await pluginManager.loadPlugins(config.plugins?.enabled || [], ctx);

// Add custom commands
program.command('deploy').action(async () => {
  ctx.logger.step('Deploying...');
});

program.parse();
```

### 4. Configure package.json

```json
{
  "name": "@mycompany/cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "mycompany": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/cli.ts",
    "start": "node dist/cli.js"
  },
  "dependencies": {
    "kubit-forge": "^0.0.2"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.0.0"
  }
}
```

### 5. Create kubit.config.toml

**`kubit.config.toml`** - Configuration for your CLI

```toml
[project]
name = "my-company-cli"
version = "1.0.0"

[plugins]
# Your custom plugins (loaded automatically by runCLI)
enabled = [
  "@mycompany/deployment-plugin",
  "@mycompany/monitoring-plugin",
]

# Internal plugins from your repo
internal = [
  "./plugins/company-plugin.js",
  "./plugins/team-plugin.js",
]

[recipes]
# Custom recipe directories (loaded automatically)
directories = [
  "./recipes",
  "./recipes/optional",
]
```

Now your plugins and recipes are loaded automatically! No manual loading code needed.

---

## Custom Plugins

### Creating a Custom Plugin

**`plugins/company-plugin.ts`**

```typescript
import type { Plugin, PluginContext, CommandResult } from 'kubit-forge';

export const companyPlugin: Plugin = {
  name: '@mycompany/deployment-plugin',
  version: '1.0.0',
  description: 'Company-specific deployment workflows',

  // Register custom commands
  registerCommands(): CommandRegistration[] {
    return [
      {
        name: 'deploy:staging',
        description: 'Deploy to staging environment',
        options: [
          {
            flags: '--dry-run',
            description: 'Preview deployment without executing',
          },
        ],
        action: async (args, ctx) => {
          return deployToStaging(args, ctx);
        },
      },
      {
        name: 'deploy:production',
        description: 'Deploy to production environment',
        action: async (args, ctx) => {
          return deployToProduction(args, ctx);
        },
      },
    ];
  },

  // Hook into lifecycle events
  hooks: {
    'build:before': async (ctx) => {
      ctx.logger.info('Running pre-build checks...');
      // Your custom pre-build logic
    },
    'build:after': async (ctx) => {
      ctx.logger.success('Build completed!');
      // Your custom post-build logic
    },
  },
};

async function deployToStaging(args: any, ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step(' Deploying to staging...');

  if (args.dryRun) {
    ctx.logger.info('DRY RUN: Would deploy to staging');
    return { message: 'Dry run completed', status: 'ok' };
  }

  // Your deployment logic here
  // Use Kubit utilities:
  // - ctx.runner.run() for shell commands
  // - ctx.logger for output
  // - ctx.config for configuration

  ctx.logger.success(' Deployed to staging successfully');

  return {
    message: 'Deployment successful',
    status: 'ok',
    data: {
      environment: 'staging',
      url: 'https://staging.mycompany.com',
    },
  };
}

async function deployToProduction(args: any, ctx: PluginContext): Promise<CommandResult> {
  // Similar implementation
  ctx.logger.step(' Deploying to production...');
  // ...
  return { message: 'Deployed to production', status: 'ok' };
}
```

### Loading Custom Plugins

**Option 1: Programmatically**

```typescript
import { createKubitContext } from 'kubit-forge';
import { companyPlugin } from './plugins/company-plugin.js';

const ctx = await createKubitContext({ cwd: process.cwd() });

// Register plugin
ctx.plugins.register(companyPlugin);

// Use plugin commands
await ctx.commands.execute('deploy:staging', { dryRun: true });
```

**Option 2: Via Configuration**

**`kubit.config.toml`**

```toml
[plugins]
enabled = [
  "@mycompany/deployment-plugin",
  "@mycompany/monitoring-plugin",
]

[plugins.config.deployment]
staging_url = "https://staging.mycompany.com"
production_url = "https://mycompany.com"
```

**Option 3: Dynamic Loading**

```typescript
// Load all plugins from directory
await ctx.plugins.loadFromDirectory('./plugins');

// Load from npm package
await ctx.plugins.load('@mycompany/deployment-plugin');
```

---

## Custom Recipes

### Creating Custom Recipes

**`recipes/deploy-workflow.json`**

```json
{
  "name": "deploy-workflow",
  "version": "1.0.0",
  "description": "Complete deployment workflow with validation",
  "author": "MyCompany DevOps Team",
  "tags": ["deployment", "ci-cd", "production"],
  "category": "deployment",
  "requires": {
    "kubitVersion": "^3.0.0",
    "plugins": ["@mycompany/deployment-plugin"],
    "tools": ["git", "docker"]
  },
  "variables": {
    "environment": {
      "type": "string",
      "description": "Target environment (staging, production)",
      "default": "staging"
    },
    "skipTests": {
      "type": "boolean",
      "description": "Skip test execution",
      "default": false
    }
  },
  "steps": [
    {
      "id": "validate-branch",
      "name": "Validate git branch",
      "type": "shell",
      "script": "git branch --show-current | grep -E '^(main|master)$'"
    },
    {
      "id": "run-tests",
      "name": "Run test suite",
      "type": "shell",
      "script": "npm test",
      "condition": "{{ !skipTests }}"
    },
    {
      "id": "build-app",
      "name": "Build application",
      "type": "shell",
      "script": "npm run build"
    },
    {
      "id": "docker-build",
      "name": "Build Docker image",
      "type": "shell",
      "script": "docker build -t mycompany/app:latest ."
    },
    {
      "id": "deploy",
      "name": "Deploy to environment",
      "type": "command",
      "command": "deploy:{{ environment }}"
    },
    {
      "id": "health-check",
      "name": "Verify deployment health",
      "type": "shell",
      "script": "curl -f https://{{ environment }}.mycompany.com/health"
    },
    {
      "id": "notify",
      "name": "Send deployment notification",
      "type": "shell",
      "script": "curl -X POST https://hooks.slack.com/... -d '{\"text\":\"Deployed to {{ environment }}\"}'"
    }
  ]
}
```

### Using Custom Recipes

```bash
# List available recipes (includes custom ones)
mycompany recipe:list

# Apply custom recipe
mycompany recipe apply deploy-workflow \
  --var environment=production \
  --var skipTests=false

# Apply with interactive prompts
mycompany recipe apply deploy-workflow
```

### Recipe in Your CLI

```typescript
// Load recipes from directory
await ctx.recipes.loadFromDirectory('./recipes');

// Execute recipe programmatically
const result = await ctx.recipes.execute('deploy-workflow', {
  variables: {
    environment: 'staging',
    skipTests: false,
  },
});

if (result.status === 'ok') {
  console.log('Deployment successful!');
}
```

---

## Custom Commands

### Extending Core Commands

You can override or extend Kubit's core commands:

```typescript
import { Command } from 'commander';
import { createKubitContext } from 'kubit-forge';

const program = new Command();
const ctx = await createKubitContext({ cwd: process.cwd() });

// Override 'build' command with custom logic
program
  .command('build')
  .description('Build with company-specific optimizations')
  .option('--env <env>', 'Environment', 'production')
  .action(async (options) => {
    ctx.logger.step('Building with company optimizations...');

    // Pre-build: Custom validation
    await validateCompanyStandards(ctx);

    // Use Kubit's build (if available)
    await ctx.commands.execute('build:vite', options);

    // Post-build: Custom processing
    await optimizeForCDN(ctx);
    await generateManifest(ctx);
  });
```

### Creating New Commands

```typescript
program
  .command('provision')
  .description('Provision cloud resources')
  .option('--region <region>', 'AWS region', 'us-east-1')
  .option('--dry-run', 'Preview without creating resources')
  .action(async (options) => {
    const { region, dryRun } = options;

    ctx.logger.step(`Provisioning resources in ${region}...`);

    if (dryRun) {
      ctx.logger.info('DRY RUN mode enabled');
      await showProvisionPlan(ctx, region);
      return;
    }

    // Use Kubit's utilities
    await ctx.runner.run('terraform', ['init']);
    await ctx.runner.run('terraform', ['apply', '-auto-approve']);

    ctx.logger.success('Resources provisioned successfully');
  });
```

---

## Configuration

### Custom Configuration Schema

**`src/config/schema.ts`**

```typescript
import { z } from 'zod';

export const customConfigSchema = z.object({
  company: z.object({
    name: z.string(),
    environment: z.enum(['development', 'staging', 'production']),
    aws: z.object({
      region: z.string(),
      accountId: z.string(),
    }),
    deployment: z.object({
      dockerRegistry: z.string(),
      kubernetesClusters: z.array(z.string()),
    }),
  }),
});

export type CustomConfig = z.infer<typeof customConfigSchema>;
```

### Loading Custom Configuration

**`mycompany.config.toml`**

```toml
[company]
name = "MyCompany"
environment = "production"

[company.aws]
region = "us-east-1"
accountId = "123456789012"

[company.deployment]
dockerRegistry = "registry.mycompany.com"
kubernetesClusters = ["prod-us-east-1", "prod-eu-west-1"]

[plugins]
enabled = [
  "@mycompany/deployment-plugin",
  "@kubit/plugin-security",
]
```

**Reading Configuration:**

```typescript
import { loadConfig } from 'kubit-forge';
import { customConfigSchema } from './config/schema.js';

const config = await loadConfig<CustomConfig>({
  schema: customConfigSchema,
  configFile: 'mycompany.config.toml',
});

// Typed access
console.log(config.company.aws.region); // TypeScript autocomplete!
```

---

## Real-World Examples

###  Ejemplo Rápido

**Crear tu CLI en 5 minutos con `runCLI`:**

```bash
# 1. Setup
mkdir my-cli && cd my-cli
npm init -y
npm install kubit-forge

# 2. Crear CLI (simple!)
cat > src/cli.ts << 'EOF'
#!/usr/bin/env node
import { runCLI } from 'kubit-forge';

await runCLI({
  name: 'mycli',
  version: '1.0.0',
  description: 'My awesome CLI',
});
EOF

# 3. Crear configuración
cat > kubit.config.toml << 'EOF'
[project]
name = "my-cli"

[plugins]
# Tus plugins aquí (se cargan automáticamente)
internal = ["./plugins/my-plugin.js"]
EOF

# 4. Build y usar
npm run build
mycli --help
```

**Así de simple!** `runCLI` hace todo el trabajo pesado automáticamente.

### Example 1: Internal Developer CLI

**`@mycompany/dev-cli`**

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { createKubitContext } from 'kubit-forge';

const program = new Command();
const ctx = await createKubitContext({ cwd: process.cwd() });

program.name('mycompany').description('MyCompany Developer CLI').version('1.0.0');

// Environment setup
program
  .command('env:setup')
  .description('Setup local development environment')
  .action(async () => {
    await ctx.recipes.execute('dev-environment-setup');
  });

// Deploy commands
program
  .command('deploy <env>')
  .description('Deploy to environment')
  .action(async (env) => {
    await ctx.recipes.execute('deploy-workflow', {
      variables: { environment: env },
    });
  });

// Database commands
program
  .command('db:migrate')
  .description('Run database migrations')
  .action(async () => {
    await ctx.runner.run('npm', ['run', 'migrate']);
  });

program.parse();
```

### Example 2: Framework CLI

**`@myframework/cli`**

```typescript
import { Command } from 'commander';
import { createKubitContext } from 'kubit-forge';
import { frameworkPlugin } from './plugins/framework-plugin.js';

const program = new Command();
const ctx = await createKubitContext({ cwd: process.cwd() });

// Register framework plugin
ctx.plugins.register(frameworkPlugin);

program.name('myframework').description('CLI for MyFramework').version('2.0.0');

// Create new project
program
  .command('new <name>')
  .description('Create new MyFramework project')
  .action(async (name) => {
    await ctx.recipes.execute('framework-project-template', {
      variables: { projectName: name },
    });
  });

// Generate code
program
  .command('generate <type> <name>')
  .description('Generate framework code')
  .action(async (type, name) => {
    await ctx.commands.execute(`framework:generate:${type}`, { name });
  });

program.parse();
```

### Example 3: Monorepo Management CLI

```typescript
program
  .command('workspace:add <name>')
  .description('Add new workspace to monorepo')
  .action(async (name) => {
    await ctx.recipes.execute('add-workspace', {
      variables: { workspaceName: name },
    });
  });

program
  .command('workspace:link')
  .description('Link all workspaces')
  .action(async () => {
    await ctx.runner.run('yarn', ['install']);
  });
```

---

## Best Practices

### 1. **Namespace Your Plugins**

```typescript
export const myPlugin: Plugin = {
  name: '@mycompany/my-plugin', //  Namespaced
  // NOT: 'my-plugin'           //  Could conflict
};
```

### 2. **Use Semantic Versioning**

```json
{
  "name": "@mycompany/cli",
  "version": "1.0.0",
  "peerDependencies": {
    "kubit-forge": "^0.0.2"
  }
}
```

### 3. **Document Your Custom Commands**

```typescript
program
  .command('deploy')
  .description('Deploy application to cloud')
  .option('--env <env>', 'Target environment (staging|production)')
  .option('--dry-run', 'Preview without executing')
  .addHelpText(
    'after',
    `
Examples:
  $ mycompany deploy --env staging
  $ mycompany deploy --env production --dry-run
  `
  );
```

### 4. **Validate Configuration**

```typescript
import { z } from 'zod';

const configSchema = z.object({
  apiKey: z.string().min(32),
  endpoint: z.string().url(),
});

// Validate early
const config = configSchema.parse(userConfig);
```

### 5. **Handle Errors Gracefully**

```typescript
try {
  await ctx.runner.run('terraform', ['apply']);
} catch (error) {
  ctx.logger.error('Deployment failed', error);
  ctx.logger.info('Rolling back changes...');
  await ctx.runner.run('terraform', ['destroy']);
  process.exit(1);
}
```

### 6. **Test Your CLI**

```typescript
// tests/cli.test.ts
import { describe, it, expect } from 'vitest';
import { createKubitContext } from 'kubit-forge';

describe('Custom CLI', () => {
  it('should deploy to staging', async () => {
    const ctx = await createKubitContext({ cwd: '/tmp/test' });
    const result = await ctx.commands.execute('deploy:staging', {
      dryRun: true,
    });

    expect(result.status).toBe('ok');
  });
});
```

---

##  Additional Resources

- **[Plugin System](./PLUGIN-SYSTEM.md)** - Deep dive into plugins
- **[Recipe System](./RECIPE-SYSTEM.md)** - Recipe creation guide
- **[Optional Recipes](./RECIPES-OPTIONAL.md)** - Example recipes
- **[Configuration](./CONFIGURATION.md)** - Config management

---

##  Summary

Kubit Forge as a framework gives you:

 **Plugin Architecture** - Modular and extensible  
 **Recipe Engine** - Workflow automation  
 **CLI Infrastructure** - Battle-tested foundation  
 **Type Safety** - Full TypeScript support  
 **Utilities** - Logger, runner, file system helpers  
 **Best Practices** - Industry-standard patterns

**Build your custom CLI in hours, not weeks!** 

---

**Need help?** Open an issue or discussion on [GitHub](https://github.com/kubit-ui/kubit-forge).
