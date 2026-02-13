# Bundler Adapters

This directory contains the bundler adapter implementations for Kubit Forge's pluggable bundler system.

## Architecture

The bundler system follows the **Adapter Pattern** to provide a unified interface for different bundlers:

```
┌─────────────────────────────────────────┐
│         BundlerManager                  │
│  (Orchestrates bundler operations)      │
└─────────────────────────────────────────┘
                  │
                  │ manages
                  ▼
┌─────────────────────────────────────────┐
│       BundlerAdapter Interface          │
│  (Common contract for all bundlers)     │
└─────────────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌────────┐ ┌────────┐
   │  Vite  │ │Webpack │ │ Rspack │
   │Adapter │ │Adapter │ │Adapter │
   └────────┘ └────────┘ └────────┘
```

## Bundler Adapter Interface

Each bundler adapter must implement the `BundlerAdapter` interface:

```typescript
interface BundlerAdapter {
  // Metadata
  readonly name: BundlerType;
  readonly version: string;
  readonly capabilities: BundlerCapability;

  // Detection
  detect(cwd: string): Promise<boolean>;

  // Installation
  install(ctx: PluginContext, options?: BundlerInstallOptions): Promise<BundlerInstallResult>;

  // Configuration
  generateConfig(options: BundlerConfigOptions): string;
  updateConfig(cwd: string, updates: Partial<BundlerConfigOptions>): Promise<void>;

  // Commands
  dev(ctx: PluginContext, options: BundlerDevOptions): Promise<CommandResult>;
  build(ctx: PluginContext, options: BundlerBuildOptions): Promise<CommandResult>;
  preview?(ctx: PluginContext, options: BundlerPreviewOptions): Promise<CommandResult>;

  // Utilities
  getConfigPath(cwd: string): string;
  validateConfig(cwd: string): Promise<BundlerValidationResult>;
  migrate?(fromBundler: BundlerType, ctx: PluginContext): Promise<BundlerMigrationResult>;
}
```

## Available Adapters

### 1. Vite Adapter (`vite-adapter.ts`)

**Status:** ✅ Stable

**Features:**

- Fast HMR
- Zero-config TypeScript
- React support with @vitejs/plugin-react
- Built-in preview server
- ESM-based dev server

**Config Generation:**

```typescript
generateConfig({
  projectName: 'my-app',
  typescript: true,
  react: true,
  port: 3000,
  sourcemap: true,
  minify: true,
  outDir: 'dist',
});
```

### 2. Webpack Adapter (`webpack-adapter.ts`)

**Status:** ✅ Stable

**Features:**

- Industry-standard bundler
- Extensive loader ecosystem
- TypeScript via ts-loader
- React with babel-loader or ts-loader
- HtmlWebpackPlugin integration
- Migration support from Vite

**Config Generation:**

```typescript
generateConfig({
  projectName: 'my-app',
  typescript: true,
  react: true,
  port: 3000,
  sourcemap: true,
  minify: true,
  outDir: 'dist',
});
```

**Migration:**

- Handles Vite → Webpack migration
- Updates environment variables (import.meta.env → process.env)
- Provides manual steps for plugin equivalents

### 3. Rspack Adapter (`rspack-adapter.ts`)

**Status:** ✅ Beta

**Features:**

- Rust-based, extremely fast
- Webpack-compatible API
- Built-in SWC loader (no ts-loader needed)
- React Refresh support
- Lightning CSS for fast CSS processing

**Config Generation:**

```typescript
generateConfig({
  projectName: 'my-app',
  typescript: true,
  react: true,
  port: 3000,
  sourcemap: true,
  minify: true,
  outDir: 'dist',
});
```

## Creating a New Adapter

To add support for a new bundler:

### 1. Create Adapter File

```typescript
// src/bundlers/my-bundler-adapter.ts
import type { BundlerAdapter, ... } from '../types/index.js';

export class MyBundlerAdapter implements BundlerAdapter {
  readonly name = 'my-bundler';
  readonly version = '1.0.0';
  readonly capabilities = {
    hmr: true,
    codesplitting: true,
    treeshaking: true,
    minification: true,
    sourcemaps: true,
    typescript: true,
    react: true,
    css: true,
    assets: true,
    devServer: true,
    preview: false,
  };

  async detect(cwd: string): Promise<boolean> {
    // Check for config file
    return existsSync(join(cwd, 'my-bundler.config.js'));
  }

  async install(ctx: PluginContext, options?: BundlerInstallOptions): Promise<BundlerInstallResult> {
    // Installation logic
    // 1. Create config file
    // 2. Install dependencies
    // 3. Add scripts to package.json
  }

  generateConfig(options: BundlerConfigOptions): string {
    // Generate bundler config
  }

  async updateConfig(cwd: string, updates: Partial<BundlerConfigOptions>): Promise<void> {
    // Update existing config
  }

  async dev(ctx: PluginContext, options: BundlerDevOptions): Promise<CommandResult> {
    // Run dev server
    return await ctx.runner.run('my-bundler', ['serve', ...args]);
  }

  async build(ctx: PluginContext, options: BundlerBuildOptions): Promise<CommandResult> {
    // Run build
    return await ctx.runner.run('my-bundler', ['build', ...args]);
  }

  getConfigPath(cwd: string): string {
    return join(cwd, 'my-bundler.config.js');
  }

  async validateConfig(cwd: string): Promise<BundlerValidationResult> {
    // Validate config
  }
}
```

### 2. Register Adapter

Add to `src/bundlers/index.ts`:

```typescript
export { MyBundlerAdapter } from './my-bundler-adapter.js';
```

### 3. Register in BundlerManager

In `src/commands/bundler.ts`:

```typescript
import { MyBundlerAdapter, ... } from '../bundlers/index.js';

export async function bundlerCommand(...) {
  const bundlerManager = new BundlerManager(ctx.logger);

  bundlerManager.registerAdapter(new ViteAdapter());
  bundlerManager.registerAdapter(new WebpackAdapter());
  bundlerManager.registerAdapter(new RspackAdapter());
  bundlerManager.registerAdapter(new MyBundlerAdapter()); // Add here

  // ...
}
```

### 4. Update Types

Add to `src/types/index.ts`:

```typescript
export type BundlerType = 'vite' | 'webpack' | 'rspack' | 'my-bundler';
```

## Testing

To test a bundler adapter:

```bash
# Create test project
kubit-forge init react test-app --bundler my-bundler

# Test detection
cd test-app
kubit-forge bundler:detect

# Test validation
kubit-forge bundler:validate

# Test dev server
kubit-forge dev

# Test build
kubit-forge build

# Test switching
kubit-forge bundler:switch --to vite
```

## Best Practices

### 1. Config Generation

- Use template literals for config generation
- Support both TypeScript and JavaScript configs
- Include sensible defaults
- Add comments in generated config

### 2. Error Handling

- Provide clear error messages
- Include solutions in error objects
- Validate inputs before processing

### 3. Migration Support

- Implement `migrate()` method when possible
- Document manual steps clearly
- Provide rollback capability

### 4. Dependencies

- Pin major versions
- Include all required dependencies
- Separate dependencies from devDependencies

### 5. Validation

- Check for config file existence
- Verify dependencies in package.json
- Provide warnings for missing optional deps

## Common Patterns

### Config File Detection

```typescript
async detect(cwd: string): Promise<boolean> {
  return (
    existsSync(join(cwd, 'bundler.config.ts')) ||
    existsSync(join(cwd, 'bundler.config.js')) ||
    existsSync(join(cwd, 'bundler.config.mjs'))
  );
}
```

### Dependency Installation

```typescript
const deps = ['bundler@^1.0.0'];
if (typescript) {
  deps.push('ts-loader@^9.0.0');
}
dependenciesInstalled.push(...deps);
```

### Script Addition

```typescript
const scripts = {
  dev: 'bundler serve',
  build: 'bundler build',
};

for (const [name, command] of Object.entries(scripts)) {
  if (!packageJson.scripts[name]) {
    packageJson.scripts[name] = command;
    scriptsAdded.push(name);
  }
}
```

### Command Execution

```typescript
async dev(ctx: PluginContext, options: BundlerDevOptions): Promise<CommandResult> {
  const args: string[] = ['serve'];

  if (options.port) {
    args.push('--port', options.port.toString());
  }
  if (options.host) {
    args.push('--host', options.host);
  }

  return await ctx.runner.run('bundler', args);
}
```

## Troubleshooting

### Adapter Not Detected

- Check `detect()` method logic
- Verify config file paths
- Ensure adapter is registered in BundlerManager

### Installation Fails

- Check dependency versions
- Verify package.json exists
- Ensure write permissions

### Config Generation Issues

- Validate template syntax
- Check for proper escaping
- Test with different options

## Future Enhancements

- [ ] Add Turbopack adapter
- [ ] Add esbuild adapter
- [ ] Add Rollup adapter
- [ ] Add Parcel adapter
- [ ] Improve migration logic
- [ ] Add config parsing/updating
- [ ] Add performance benchmarks
- [ ] Add adapter testing framework

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [Webpack Documentation](https://webpack.js.org/)
- [Rspack Documentation](https://www.rspack.dev/)
- [Bundler Comparison](../../docs/features/bundlers.md)

---

**Questions?** Open an issue on [GitHub](https://github.com/kubit-ui/kubit-forge/issues).
