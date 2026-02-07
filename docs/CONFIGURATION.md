# Configuration

## Overview

Kubit Forge uses a TOML-based configuration file (`kubit.config.toml`) for project settings. This provides a declarative, type-safe way to configure your project.

## Configuration File

### Location

```
project-root/
├── kubit.config.toml    # Main configuration
├── .kubit/              # Custom configurations
│   ├── plugins/
│   ├── recipes/
│   └── templates/
```

### Basic Structure

```toml
# kubit.config.toml

[project]
name = "my-app"
version = "1.0.0"
description = "My awesome application"
stack = "react"          # react, vue, vanilla, svelte
language = "typescript"  # typescript, javascript
packageManager = "pnpm"  # pnpm, npm, yarn

[dev]
port = 3000
host = "localhost"
open = true
https = false
hmr = true

[build]
outDir = "dist"
sourcemap = false
minify = true
target = "es2020"
analyze = false

[quality]
lint = true
format = true
typecheck = true
test = true

[test]
coverage = true
threshold = 80
watch = false

[plugins]
enabled = [
  "@kubit/plugin-analytics",
  "@kubit/plugin-sentry"
]

[paths]
src = "./src"
public = "./public"
dist = "./dist"
tests = "./tests"
```

## Configuration Sections

### Project Settings

```toml
[project]
name = "my-awesome-app"
version = "1.0.0"
description = "A world-class application"
author = "Your Name <email@example.com>"
license = "MIT"
repository = "https://github.com/user/repo"
stack = "react"
language = "typescript"
packageManager = "pnpm"
```

**Fields:**

- `name` - Project name (required)
- `version` - Semantic version
- `description` - Project description
- `author` - Author information
- `license` - License type
- `repository` - Git repository URL
- `stack` - Framework (react/vue/vanilla/svelte)
- `language` - Language (typescript/javascript)
- `packageManager` - Package manager (pnpm/npm/yarn)

### Development Server

```toml
[dev]
port = 3000
host = "localhost"
open = true
https = false
strictPort = false
cors = true
hmr = true

[dev.proxy]
"/api" = "http://localhost:4000"
"/ws" = { target = "ws://localhost:4000", ws = true }
```

**Fields:**

- `port` - Dev server port (default: 3000)
- `host` - Host address (default: localhost)
- `open` - Auto-open browser
- `https` - Enable HTTPS
- `strictPort` - Exit if port is in use
- `cors` - Enable CORS
- `hmr` - Hot Module Replacement
- `proxy` - Proxy configuration

### Build Configuration

```toml
[build]
outDir = "dist"
sourcemap = false
minify = true
target = "es2020"
analyze = false
emptyOutDir = true
cssCodeSplit = true
chunkSizeWarningLimit = 500

[build.rollup]
external = ["react", "react-dom"]
```

**Fields:**

- `outDir` - Output directory
- `sourcemap` - Generate source maps
- `minify` - Minify output
- `target` - JavaScript target
- `analyze` - Bundle analysis
- `emptyOutDir` - Clean before build
- `cssCodeSplit` - Split CSS files
- `chunkSizeWarningLimit` - Bundle size warning

### Quality Settings

```toml
[quality]
lint = true
format = true
typecheck = true
test = true

[quality.eslint]
fix = true
cache = true
maxWarnings = 0

[quality.prettier]
write = true
check = false

[quality.typescript]
noEmit = true
incremental = true
```

### Testing Configuration

```toml
[test]
coverage = true
threshold = 80
watch = false
ui = false
bail = false

[test.coverage]
provider = "v8"
reporter = ["text", "html", "lcov"]
include = ["src/**/*.{ts,tsx}"]
exclude = ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"]
```

### Plugin Configuration

```toml
[plugins]
enabled = [
  "@kubit/plugin-analytics",
  "@kubit/plugin-sentry"
]

disabled = [
  "@kubit/plugin-old-feature"
]

[plugins.analytics]
apiKey = "your-api-key"
environment = "production"
enabled = true

[plugins.sentry]
dsn = "your-sentry-dsn"
environment = "production"
tracesSampleRate = 0.1
```

### Asset Optimization

```toml
[assets]
optimize = true

[assets.images]
quality = 85
formats = ["webp", "avif"]
sizes = [640, 1024, 1920]

[assets.fonts]
subsetting = true
formats = ["woff2"]

[assets.icons]
optimize = true
removeMetadata = true

[assets.cdn]
provider = "cloudflare"
bucket = "my-assets"
domain = "cdn.example.com"
```

### Security & SBOM

```toml
[security]
audit = true
failOnVulnerabilities = true
severityThreshold = "moderate"

[sbom]
generate = true
format = "json"
output = "./sbom.json"
includeDevDependencies = false
```

### Doctor Configuration

```toml
[doctor]
autoFix = false
predictive = true
categories = ["all"]
schedule = "0 9 * * 1"  # Every Monday at 9am

[doctor.notifications]
enabled = false
email = "team@example.com"

[doctor.thresholds]
security = "none"
performance = "warning"
```

### GUI Settings

```toml
[gui]
enabled = true
port = 3456
host = "localhost"
autoOpen = true
theme = "dark"

[gui.security]
auth = false
allowExternal = false
```

### Environment Variables

```toml
[env]
NODE_ENV = "development"
API_URL = "http://localhost:4000"
PUBLIC_API_KEY = "public-key"

[env.production]
NODE_ENV = "production"
API_URL = "https://api.example.com"
```

### Paths Configuration

```toml
[paths]
root = "."
src = "./src"
public = "./public"
dist = "./dist"
tests = "./tests"
cache = "./.cache"
temp = "./.temp"
```

### Monorepo Settings

```toml
[monorepo]
enabled = true
tool = "pnpm"  # pnpm, yarn, npm, turborepo, nx
workspaces = ["packages/*", "apps/*"]

[monorepo.turborepo]
pipeline = true
cache = true

[monorepo.nx]
cache = true
```

## Environment-Specific Configuration

### Multiple Environments

```toml
# Default configuration
[build]
sourcemap = false
minify = true

# Development overrides
[build.development]
sourcemap = true
minify = false

# Production overrides
[build.production]
sourcemap = false
minify = true
analyze = true
```

### Using Environment Variables

```toml
[api]
# Use environment variable with fallback
baseUrl = "${API_URL:-http://localhost:3000}"
apiKey = "${API_KEY}"
```

## Validation

### Schema Validation

Kubit Forge validates configuration on load:

```bash
# Validate configuration
kubit-forge config:validate

# Show configuration
kubit-forge config:show

# Export configuration
kubit-forge config:export config.json
```

### Type Safety

TypeScript types for configuration:

```typescript
import type { KubitConfig } from 'kubit-forge';

const config: KubitConfig = {
  project: {
    name: 'my-app',
    stack: 'react',
    language: 'typescript',
  },
  // ... rest of config
};
```

## Advanced Features

### Configuration Inheritance

```toml
# kubit.config.base.toml
[project]
packageManager = "pnpm"

[quality]
lint = true
format = true

# kubit.config.toml
extends = "./kubit.config.base.toml"

[project]
name = "my-app"  # Overrides/extends base
```

### Conditional Configuration

```toml
[build]
minify = true

# Only in CI environment
[build.ci]
minify = true
sourcemap = false
analyze = true
```

### Dynamic Configuration

Use JavaScript for dynamic config:

```javascript
// kubit.config.js
export default {
  project: {
    name: process.env.PROJECT_NAME || 'my-app',
  },
  build: {
    minify: process.env.NODE_ENV === 'production',
  },
};
```

## Configuration Presets

### React + TypeScript Preset

```toml
extends = "@kubit/config-react-ts"

[project]
name = "my-react-app"
```

### Enterprise Preset

```toml
extends = "@kubit/config-enterprise"

[security]
failOnVulnerabilities = true

[doctor]
autoFix = false
predictive = true
```

## Best Practices

### 1. Use Version Control

```bash
# Commit configuration
git add kubit.config.toml
git commit -m "chore: update configuration"

# Ignore sensitive data
echo "kubit.config.local.toml" >> .gitignore
```

### 2. Environment Variables for Secrets

```toml
# DON'T: Hard-code secrets
[api]
apiKey = "sk_live_abcdef123456"

# DO: Use environment variables
[api]
apiKey = "${API_KEY}"
```

### 3. Document Custom Settings

```toml
[custom]
# Feature flag for new navigation
# TODO: Remove after rollout (2024-Q2)
newNavigation = false
```

### 4. Keep It Simple

Start with minimal configuration and add as needed.

### 5. Use Presets

Leverage community presets for common setups.

## Migration

### From package.json

Migrate scripts and config to kubit.config.toml:

```bash
kubit-forge migrate:config
```

### From Other Tools

```bash
# From Vite
kubit-forge migrate:from-vite

# From Create React App
kubit-forge migrate:from-cra
```

## Troubleshooting

### Configuration Not Loading

```bash
# Validate configuration
kubit-forge config:validate

# Check syntax errors
kubit-forge config:lint
```

### Conflicting Settings

```bash
# Show resolved configuration
kubit-forge config:show --resolved
```

### Environment Variables Not Working

```bash
# Debug environment
kubit-forge env info
```

## Examples

### Minimal Configuration

```toml
[project]
name = "my-app"
stack = "react"
```

### Full-Featured Application

```toml
[project]
name = "enterprise-app"
version = "1.0.0"
stack = "react"
language = "typescript"
packageManager = "pnpm"

[dev]
port = 3000
open = true
https = true

[build]
outDir = "dist"
sourcemap = true
minify = true
analyze = true

[quality]
lint = true
format = true
typecheck = true
test = true

[test]
coverage = true
threshold = 85

[plugins]
enabled = [
  "@kubit/plugin-analytics",
  "@kubit/plugin-sentry",
  "@kubit/plugin-monitoring"
]

[security]
audit = true
failOnVulnerabilities = true

[assets]
optimize = true

[assets.cdn]
provider = "cloudflare"
domain = "cdn.example.com"
```

### Monorepo Configuration

```toml
[project]
name = "monorepo"
packageManager = "pnpm"

[monorepo]
enabled = true
tool = "turborepo"
workspaces = ["packages/*", "apps/*"]

[monorepo.turborepo]
pipeline = true
cache = true

[build]
outDir = "dist"
```

## Related Documentation

- [Visual GUI](./VISUAL-GUI.md) - Edit configuration visually
- [Doctor Command](./DOCTOR-COMMAND.md) - Validate configuration
- [Plugin System](./PLUGIN-SYSTEM.md) - Plugin configuration

---

**Need help?** Check [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues) or run `kubit-forge config --help`.
