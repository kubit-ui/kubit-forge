# Plugin System

## Overview

The Kubit Forge Plugin System allows you to extend the CLI with custom commands, hooks, generators, and configurations. Build reusable extensions that can be shared across projects or published to npm.

## Why Use Plugins?

- **Extensibility** - Add custom commands without modifying core
- **Reusability** - Share functionality across projects
- **Organization Standards** - Enforce company-specific workflows
- **Community Ecosystem** - Use community-built plugins
- **Type Safety** - Full TypeScript support

## Quick Start

### Using Plugins

```bash
# Search for plugins
kubit-forge plugin:search analytics

# Install a plugin
kubit-forge plugin:install @kubit/plugin-analytics

# List installed plugins
kubit-forge plugin:list

# Update a plugin
kubit-forge plugin:update @kubit/plugin-analytics

# Remove a plugin
kubit-forge plugin:remove @kubit/plugin-analytics

# Verify plugin integrity
kubit-forge plugin:verify @kubit/plugin-analytics
```

### Creating Your First Plugin

```bash
# Initialize plugin structure
kubit-forge plugin:init my-plugin

# Publish to npm
cd my-plugin
npm publish
```

## Internal (Local) Plugins

You can use plugins without publishing to npm. Perfect for **company-specific tools**, **monorepos**, or **development**.

### Configuration

```toml
# kubit.config.toml
[plugins]
# External plugins from npm
enabled = ["@kubit/plugin-analytics"]

# Internal plugins (local file paths)
internal = [
  "./src/plugins/my-plugin",
  "./plugins/custom-commands"
]
```

### Creating an Internal Plugin

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

### Benefits

-  **No npm publish required** - Keep plugins private
-  **Monorepo friendly** - Share plugins across packages
-  **Fast development** - Develop alongside your app
-  **Enterprise use cases** - Company-specific functionality

### Example: Enterprise CLI

```toml
# kubit.config.toml
[project]
name = "enterprise-cli"

[plugins]
enabled = ["@kubit-ui/plugin-react"]

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

## Plugin Structure

### Basic Plugin

```typescript
// my-plugin.ts
import { Plugin } from 'kubit-forge';

export default {
  name: 'my-plugin',
  version: '1.0.0',
  description: 'My awesome plugin',

  // Custom commands
  commands: {
    hello: async (args, ctx) => {
      console.log('Hello from my plugin!');
    },
  },

  // Lifecycle hooks
  hooks: {
    'build:before': async (ctx) => {
      console.log('Running before build...');
    },
  },
} satisfies Plugin;
```

### Full Plugin Example

```typescript
// advanced-plugin.ts
import { Plugin, PluginContext } from 'kubit-forge';

export default {
  // Plugin metadata
  name: 'advanced-plugin',
  version: '2.0.0',
  description: 'Advanced plugin with all features',
  author: 'Your Name <email@example.com>',

  // Dependencies
  requires: {
    'kubit-forge': '>=0.1.0',
  },

  peerPlugins: {
    '@kubit/plugin-typescript': '>=1.0.0',
  },

  // Custom commands
  commands: {
    // Simple command
    greet: async (args: string[], ctx: PluginContext) => {
      const name = args[0] || 'World';
      console.log(`Hello, ${name}!`);
    },

    // Command with options
    deploy: async (args, ctx) => {
      const options = ctx.parseArgs(args, {
        environment: { type: 'string', default: 'staging' },
        dryRun: { type: 'boolean', default: false },
      });

      console.log(`Deploying to ${options.environment}`);

      if (!options.dryRun) {
        // Actual deployment logic
        await deployToServer(options.environment);
      }
    },

    // Command with subcommands
    db: {
      migrate: async (args, ctx) => {
        await runMigrations();
      },
      seed: async (args, ctx) => {
        await seedDatabase();
      },
      reset: async (args, ctx) => {
        await resetDatabase();
      },
    },
  },

  // Lifecycle hooks
  hooks: {
    // Before build
    'build:before': async (ctx) => {
      console.log('Preparing build...');
      await cleanBuildDir();
    },

    // After build
    'build:after': async (ctx) => {
      console.log('Build complete!');
      await generateSitemap();
    },

    // Before dev server starts
    'dev:before': async (ctx) => {
      console.log('Starting dev server...');
    },

    // After dev server starts
    'dev:after': async (ctx) => {
      console.log(`Dev server running at ${ctx.devServerUrl}`);
    },

    // Before tests run
    'test:before': async (ctx) => {
      await setupTestDatabase();
    },

    // After tests complete
    'test:after': async (ctx) => {
      await teardownTestDatabase();
    },

    // Plugin initialization
    init: async (ctx) => {
      console.log('Plugin initialized');
    },
  },

  // Code generators
  generators: {
    component: {
      description: 'Generate a React component',
      prompts: [
        {
          type: 'input',
          name: 'name',
          message: 'Component name:',
        },
        {
          type: 'confirm',
          name: 'typescript',
          message: 'Use TypeScript?',
          default: true,
        },
      ],
      files: [
        {
          path: 'src/components/{{name}}.{{typescript ? "tsx" : "jsx"}}',
          template: `
import React from 'react';

export interface {{name}}Props {
  // Props here
}

export const {{name}}: React.FC<{{name}}Props> = (props) => {
  return (
    <div>{{name}} Component</div>
  );
};
          `,
        },
      ],
    },
  },

  // Configuration extensions
  configSchema: {
    myPlugin: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', default: true },
        apiKey: { type: 'string' },
        timeout: { type: 'number', default: 5000 },
      },
    },
  },

  // Setup function (runs on plugin install)
  setup: async (ctx: PluginContext) => {
    console.log('Setting up plugin...');

    // Install dependencies
    await ctx.installDependencies({
      dependencies: {
        'my-lib': '^1.0.0',
      },
      devDependencies: {
        '@types/my-lib': '^1.0.0',
      },
    });

    // Create configuration file
    await ctx.writeFile(
      '.mypluginrc',
      JSON.stringify(
        {
          version: '1.0.0',
        },
        null,
        2
      )
    );

    console.log('Plugin setup complete!');
  },

  // Teardown function (runs on plugin remove)
  teardown: async (ctx: PluginContext) => {
    console.log('Cleaning up plugin...');
    await ctx.removeFile('.mypluginrc');
  },
} satisfies Plugin;
```

## Plugin API

### PluginContext

The context object provides utilities for plugin development:

```typescript
interface PluginContext {
  // Project information
  projectRoot: string;
  packageJson: PackageJson;
  config: KubitConfig;

  // File operations
  writeFile(path: string, content: string): Promise<void>;
  readFile(path: string): Promise<string>;
  removeFile(path: string): Promise<void>;
  fileExists(path: string): boolean;

  // Package manager operations
  installDependencies(deps: Dependencies): Promise<void>;
  removeDependencies(names: string[]): Promise<void>;
  getInstalledVersion(name: string): string | null;

  // Command execution
  exec(command: string, options?: ExecOptions): Promise<ExecResult>;
  spawn(command: string, args: string[]): ChildProcess;

  // Logging
  logger: Logger;

  // Utilities
  parseArgs(args: string[], schema: ArgsSchema): ParsedArgs;
  prompt(questions: PromptQuestion[]): Promise<PromptAnswers>;
}
```

### Available Hooks

Plugins can hook into various lifecycle events:

| Hook            | Description              | Timing         |
| --------------- | ------------------------ | -------------- |
| `init`          | Plugin initialization    | On plugin load |
| `build:before`  | Before build starts      | Pre-build      |
| `build:after`   | After build completes    | Post-build     |
| `dev:before`    | Before dev server starts | Pre-dev        |
| `dev:after`     | After dev server starts  | Post-dev       |
| `test:before`   | Before tests run         | Pre-test       |
| `test:after`    | After tests complete     | Post-test      |
| `lint:before`   | Before linting           | Pre-lint       |
| `lint:after`    | After linting            | Post-lint      |
| `deploy:before` | Before deployment        | Pre-deploy     |
| `deploy:after`  | After deployment         | Post-deploy    |

## Plugin Configuration

### plugin.config.json

```json
{
  "name": "@myorg/kubit-plugin-custom",
  "version": "1.0.0",
  "description": "Custom plugin for our organization",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["kubit-forge", "plugin"],
  "kubitPlugin": {
    "compatible": ">=0.1.0",
    "category": "deployment",
    "tags": ["ci-cd", "automation"]
  }
}
```

### Enable/Disable Plugins

In `kubit.config.toml`:

```toml
[plugins]
enabled = [
  "@kubit/plugin-analytics",
  "@myorg/custom-plugin"
]

disabled = [
  "@kubit/plugin-old-feature"
]

[plugins.analytics]
apiKey = "your-api-key"
enabled = true

[plugins.custom]
environment = "production"
```

## Publishing Plugins

### npm Package Setup

```json
{
  "name": "@myorg/kubit-plugin-awesome",
  "version": "1.0.0",
  "description": "Awesome plugin for Kubit Forge",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "keywords": ["kubit-forge", "plugin", "awesome"],
  "peerDependencies": {
    "kubit-forge": ">=0.1.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### Publishing Steps

```bash
# 1. Build plugin
npm run build

# 2. Test locally
npm link
cd /path/to/test-project
npm link @myorg/kubit-plugin-awesome
kubit-forge plugin:verify @myorg/kubit-plugin-awesome

# 3. Publish to npm
npm publish

# 4. Install in projects
kubit-forge plugin:install @myorg/kubit-plugin-awesome
```

## Official Plugins

### @kubit/plugin-analytics

Track project usage and performance metrics.

```bash
kubit-forge plugin:install @kubit/plugin-analytics
```

### @kubit/plugin-sentry

Error tracking and monitoring integration.

```bash
kubit-forge plugin:install @kubit/plugin-sentry
```

### @kubit/plugin-vercel

Deployment to Vercel platform.

```bash
kubit-forge plugin:install @kubit/plugin-vercel
```

### @kubit/plugin-docker

Docker container generation and management.

```bash
kubit-forge plugin:install @kubit/plugin-docker
```

## Plugin Examples

### Analytics Plugin

```typescript
export default {
  name: 'analytics',

  commands: {
    'analytics:track': async (args, ctx) => {
      const event = args[0];
      await sendAnalyticsEvent(event, ctx.config.analytics);
    },
  },

  hooks: {
    'build:after': async (ctx) => {
      await sendAnalyticsEvent('build_complete', {
        duration: ctx.buildDuration,
        size: ctx.bundleSize,
      });
    },
  },
} satisfies Plugin;
```

### Deployment Plugin

```typescript
export default {
  name: 'deploy',

  commands: {
    deploy: async (args, ctx) => {
      const target = args[0] || 'production';

      // Pre-deployment checks
      await ctx.exec('npm test');
      await ctx.exec('npm run build');

      // Deploy
      console.log(`Deploying to ${target}...`);
      await deployToServer(target, ctx.config);

      console.log(' Deployment successful!');
    },
  },
} satisfies Plugin;
```

### Custom Generator Plugin

```typescript
export default {
  name: 'generators',

  generators: {
    'api-route': {
      description: 'Generate an API route',
      prompts: [
        {
          type: 'input',
          name: 'path',
          message: 'Route path (e.g., /api/users):',
        },
        {
          type: 'select',
          name: 'method',
          message: 'HTTP method:',
          choices: ['GET', 'POST', 'PUT', 'DELETE'],
        },
      ],
      files: [
        {
          path: 'src/routes/{{path}}.ts',
          template: `
export async function {{method}}(req, res) {
  // Implementation
  res.json({ message: 'Success' });
}
          `,
        },
      ],
    },
  },
} satisfies Plugin;
```

## Best Practices

### 1. Follow Naming Convention

 **Good:**

- `@org/kubit-plugin-feature`
- `kubit-plugin-utility`

 **Avoid:**

- `my-cool-plugin`
- `plugin-for-kubit`

### 2. Version Compatibility

Always specify compatible Kubit Forge versions:

```typescript
export default {
  requires: {
    'kubit-forge': '>=0.1.0 <2.0.0',
  },
} satisfies Plugin;
```

### 3. Error Handling

Provide helpful error messages:

```typescript
commands: {
  'deploy': async (args, ctx) => {
    try {
      await deploy();
    } catch (error) {
      ctx.logger.error('Deployment failed:', error.message);
      ctx.logger.info('Try running: kubit-forge doctor');
      process.exit(1);
    }
  },
}
```

### 4. Configuration Validation

Validate plugin configuration:

```typescript
setup: async (ctx) => {
  const config = ctx.config.plugins?.myPlugin;

  if (!config?.apiKey) {
    throw new Error('API key is required. Set it in kubit.config.toml');
  }
};
```

### 5. Documentation

Include comprehensive README with:

- Installation instructions
- Configuration options
- Usage examples
- API reference

## Troubleshooting

### Plugin Not Found

```bash
# Verify plugin is installed
npm ls @org/kubit-plugin-name

# Reinstall
kubit-forge plugin:install @org/kubit-plugin-name
```

### Plugin Conflicts

```bash
# Check for conflicting plugins
kubit-forge plugin:list --conflicts

# Disable conflicting plugin
kubit-forge plugin:disable @org/conflicting-plugin
```

### Version Mismatch

```bash
# Check compatibility
kubit-forge plugin:verify @org/plugin-name

# Update plugin
kubit-forge plugin:update @org/plugin-name
```

## Security

### Plugin Verification

Kubit Forge verifies plugins for:

- Valid signature
- No malicious code patterns
- Dependency security
- License compliance

```bash
# Verify before install
kubit-forge plugin:verify @org/plugin-name --strict
```

### Trusted Sources

Only install plugins from:

-  Official @kubit scope
-  Verified organizations
-  Open source with reviews
-  Unknown sources

## Related Documentation

- [Recipe System](./RECIPE-SYSTEM.md) - Automate workflows
- [Configuration](./CONFIGURATION.md) - Configure plugins
- [Development Commands](./DEVELOPMENT-COMMANDS.md) - CLI commands

---

**Need help?** Open an issue on [GitHub](https://github.com/kubit-ui/kubit-forge/issues).
