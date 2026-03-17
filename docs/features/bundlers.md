# Bundler System

## Overview

Kubit Forge features a **pluggable bundler system** that allows you to choose and switch between different bundlers for your project. This gives you the flexibility to use the bundler that best fits your needs, whether it's Vite for speed, Webpack for compatibility, or Rspack for performance.

## Supported Bundlers

| Bundler | Version | Speed | Maturity | Best For |
| Bundler | Version | Speed | Maturity | Best For |
|---------|---------|-------|----------|----------|
| **Vite** | 6.0.3 | ⚡⚡⚡ | Stable | Modern projects, fast HMR |
| **Webpack** | 5.97.1 | ⚡ | Very Mature | Legacy projects, complex configs |
| **Rspack** | 1.1.7 | ⚡⚡⚡ | Stable | Webpack compatibility + speed |
| **Turbopack** | Coming Soon | ⚡⚡⚡ | Beta | Next.js projects |
| **esbuild** | Coming Soon | ⚡⚡⚡ | Stable | Libraries, simple builds |
| **Rollup** | Coming Soon | ⚡⚡ | Stable | Libraries |

## Quick Start

### Create Project with Specific Bundler

```bash
# Create with Vite (default)
kubit-forge init react my-app

# Create with Webpack
kubit-forge init react my-app --bundler webpack

# Create with Rspack
kubit-forge init react my-app --bundler rspack
```

### List Available Bundlers

```bash
kubit-forge bundler:list
```

**Output:**

```
Available Bundlers

  vite
    Version: 6.0.3
    Capabilities: hmr, codesplitting, treeshaking, minification, sourcemaps, typescript, react, css, assets, devServer, preview

  webpack
    Version: 5.97.1
    Capabilities: hmr, codesplitting, treeshaking, minification, sourcemaps, typescript, react, css, assets, devServer

  rspack
    Version: 1.1.7
    Capabilities: hmr, codesplitting, treeshaking, minification, sourcemaps, typescript, react, css, assets, devServer
```

### Detect Current Bundler

```bash
kubit-forge bundler:detect
```

**Output:**

```
✓ Bundler detected:
  Type: vite
  Version: 6.0.3
  Config: vite.config.ts
  Confidence: high
```

### Switch Bundler

```bash
# Switch from Vite to Webpack
kubit-forge bundler:switch --to webpack

# Switch with migration (default)
kubit-forge bundler:switch --to webpack --migrate

# Switch and keep old config
kubit-forge bundler:switch --to rspack --keep-old-config

# Force switch (skip confirmations)
kubit-forge bundler:switch --to webpack --force
```

**Output:**

```
✓ Successfully switched from vite to webpack

Changes made:
  + Created webpack.config.ts
  + Installed webpack@^5.97.1
  + Installed webpack-cli@^6.0.1
  + Installed webpack-dev-server@^5.2.0
  + Added script: dev
  + Added script: build
  ~ Environment variables need to be updated from import.meta.env to process.env

Manual steps required:
  1. Review Vite-specific plugins and find Webpack equivalents
  2. Update import.meta.env to process.env
  3. Check for Vite-specific features like glob imports

Next steps:
  1. Run: yarn install
  2. Run: yarn dev
```

### Validate Bundler Configuration

```bash
kubit-forge bundler:validate
```

**Output:**

```
✓ vite configuration is valid
```

### Show Bundler Information

```bash
kubit-forge bundler:info
```

**Output:**

```
Bundler Information

  Name: vite
  Version: 6.0.3
  Config: vite.config.ts

Capabilities:
  ✓ hmr
  ✓ codesplitting
  ✓ treeshaking
  ✓ minification
  ✓ sourcemaps
  ✓ typescript
  ✓ react
  ✓ css
  ✓ assets
  ✓ devServer
  ✓ preview
```

## Bundler Comparison

### Vite

**Pros:**

- ⚡ Extremely fast HMR
- 🎯 Zero config for most projects
- 📦 Built-in TypeScript support
- 🔥 Modern ESM-based dev server
- 🎨 Great DX (Developer Experience)

**Cons:**

- 🆕 Relatively new (less ecosystem)
- 🔧 Less flexible than Webpack for complex configs

**Best for:**

- New projects
- Modern web apps
- Fast iteration

**Example config:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

### Webpack

**Pros:**

- 🏆 Industry standard
- 🔧 Extremely configurable
- 📚 Huge ecosystem of loaders/plugins
- 🛡️ Battle-tested in production
- 🔄 Great for complex builds

**Cons:**

- 🐌 Slower than modern bundlers
- 📝 Complex configuration
- 🔧 Requires more setup

**Best for:**

- Legacy projects
- Complex build requirements
- Micro-frontends
- Projects with custom loaders

**Example config:**

```javascript
// webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
  },
};
```

### Rspack

**Pros:**

- ⚡⚡⚡ Extremely fast (Rust-based)
- 🔄 Webpack-compatible API
- 📦 Built-in loaders (no ts-loader needed)
- 🎯 Modern architecture
- 🔥 Fast HMR

**Cons:**

- 📚 Smaller ecosystem than Webpack
- 🔧 Some Webpack plugins not supported yet
- 📖 Less documentation than mature bundlers

**Best for:**

- Migrating from Webpack
- Large projects needing speed
- Projects wanting Webpack compatibility + performance

**Example config:**

```javascript
// rspack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true,
              },
            },
          },
        },
      },
    ],
  },
  devServer: {
    port: 3000,
    hot: true,
  },
};
```

## Migration Guide

### Vite → Webpack

**Key Changes:**

1. **Environment Variables:**

   ```typescript
   // Vite
   import.meta.env.VITE_API_URL;

   // Webpack
   process.env.REACT_APP_API_URL;
   ```

2. **Static Assets:**

   ```typescript
   // Vite
   import logo from './logo.svg';

   // Webpack (same, but different handling)
   import logo from './logo.svg';
   ```

3. **Glob Imports:**

   ```typescript
   // Vite
   const modules = import.meta.glob('./modules/*.ts');

   // Webpack
   const context = require.context('./modules', false, /\.ts$/);
   ```

### Webpack → Vite

**Key Changes:**

1. **Environment Variables:**

   ```typescript
   // Webpack
   process.env.REACT_APP_API_URL;

   // Vite
   import.meta.env.VITE_API_URL;
   ```

2. **Config Simplification:**
   - Remove most loaders (built-in)
   - Simpler plugin system
   - Less configuration needed

3. **Dev Server:**
   - Much faster startup
   - Instant HMR
   - ESM-based

### Webpack → Rspack

**Key Changes:**

1. **Built-in Loaders:**

   ```javascript
   // Webpack
   use: 'ts-loader';

   // Rspack
   use: 'builtin:swc-loader';
   ```

2. **Performance:**
   - 5-10x faster builds
   - Faster HMR
   - Less memory usage

3. **Compatibility:**
   - Most Webpack configs work as-is
   - Some plugins need alternatives
   - Check Rspack docs for compatibility

## Configuration

### Project Config

The bundler is specified in `kubit.config.toml`:

```toml
[project]
name = "my-app"
bundler = "vite"  # or "webpack", "rspack"
```

### Bundler-Specific Config

Each bundler has its own config file:

- **Vite:** `vite.config.ts` or `vite.config.js`
- **Webpack:** `webpack.config.ts` or `webpack.config.js`
- **Rspack:** `rspack.config.ts` or `rspack.config.js`

## Advanced Usage

### Custom Bundler Adapter

You can create custom bundler adapters:

```typescript
// src/bundlers/my-bundler-adapter.ts
import type { BundlerAdapter } from 'kubit-forge';

export class MyBundlerAdapter implements BundlerAdapter {
  readonly name = 'my-bundler';
  readonly version = '1.0.0';
  readonly capabilities = {
    hmr: true,
    codesplitting: true,
    // ... other capabilities
  };

  async detect(cwd: string): Promise<boolean> {
    // Detection logic
  }

  async install(ctx: PluginContext): Promise<BundlerInstallResult> {
    // Installation logic
  }

  // ... implement other methods
}
```

### Register Custom Adapter

```typescript
// kubit.config.ts
import { MyBundlerAdapter } from './bundlers/my-bundler-adapter';

export default {
  bundlers: {
    adapters: [new MyBundlerAdapter()],
  },
};
```

## Troubleshooting

### Bundler Not Detected

```bash
# Check if config file exists
ls -la | grep config

# Manually specify bundler
kubit-forge bundler:switch --to vite
```

### Migration Issues

```bash
# Validate configuration
kubit-forge bundler:validate

# Check for errors
kubit-forge doctor
```

### Performance Issues

```bash
# Check bundler info
kubit-forge bundler:info

# Consider switching to faster bundler
kubit-forge bundler:switch --to rspack
```

## FAQ

### Q: Can I use multiple bundlers in the same project?

A: No, only one bundler can be active at a time. However, you can switch between bundlers easily.

### Q: Will switching bundlers break my project?

A: The migration system tries to handle common cases, but manual adjustments may be needed. Always commit your changes before switching.

### Q: Which bundler should I choose?

A:

- **New projects:** Vite (fastest DX)
- **Legacy projects:** Webpack (most compatible)
- **Large projects:** Rspack (speed + compatibility)

### Q: Can I customize the bundler config?

A: Yes! Each bundler has its own config file that you can modify directly.

### Q: How do I add bundler-specific plugins?

A: Edit the bundler's config file directly and add plugins according to the bundler's documentation.

## Related Documentation

- [Commands](../core/commands.md)
- [Configuration](../core/configuration.md)
- [Plugin System](../framework/plugins.md)

---

**Need help?** Run `kubit-forge bundler:list --help` or visit [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues).
