# Environment Management

## Overview

Kubit Forge provides comprehensive environment variable management with validation, security best practices, and seamless integration across different environments (development, staging, production).

## Quick Start

```bash
# Initialize .env file
kubit-forge env init

# Validate environment variables
kubit-forge env validate

# Show environment info
kubit-forge env info

# Generate .env.example
kubit-forge env:example
```

## Environment Files

### Initialize Environment

```bash
# Create .env file
kubit-forge env init

# Interactive setup
kubit-forge env init --interactive

# From template
kubit-forge env init --template production

# Multiple environments
kubit-forge env init --env development,staging,production
```

**Generated Files:**

```
project/
├── .env                    # Local development (gitignored)
├── .env.example            # Template for team
├── .env.development        # Development config
├── .env.staging           # Staging config
├── .env.production        # Production config
└── .env.test              # Test config
```

### Environment File Structure

**.env:**

```bash
# Application
NODE_ENV=development
APP_NAME=my-app
APP_URL=http://localhost:3000
PORT=3000

# Database
DATABASE_URL=postgresql://localhost:5432/myapp
DATABASE_POOL_SIZE=10

# API Keys (DO NOT COMMIT)
API_KEY=your-api-key-here
API_SECRET=your-api-secret-here

# External Services
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG.xxx

# Features
FEATURE_NEW_DASHBOARD=true
FEATURE_ANALYTICS=false

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=debug
```

**.env.example:**

```bash
# Application
NODE_ENV=development
APP_NAME=my-app
APP_URL=http://localhost:3000
PORT=3000

# Database
DATABASE_URL=postgresql://localhost:5432/myapp
DATABASE_POOL_SIZE=10

# API Keys
API_KEY=your-api-key-here
API_SECRET=your-api-secret-here

# External Services
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
SENDGRID_API_KEY=

# Features
FEATURE_NEW_DASHBOARD=true
FEATURE_ANALYTICS=false

# Monitoring
SENTRY_DSN=
LOG_LEVEL=debug
```

## Validation

### Environment Schema

Define validation schema in configuration:

```toml
# kubit.config.toml

[env]
validateOnStart = true
required = ["NODE_ENV", "DATABASE_URL", "API_KEY"]

[env.schema]
NODE_ENV = { type = "string", enum = ["development", "staging", "production"] }
PORT = { type = "number", min = 1000, max = 65535 }
DATABASE_URL = { type = "url", protocol = ["postgresql", "mysql"] }
API_KEY = { type = "string", min = 32 }
FEATURE_NEW_DASHBOARD = { type = "boolean" }
LOG_LEVEL = { type = "string", enum = ["debug", "info", "warn", "error"] }
```

### Validate Environment

```bash
# Validate current environment
kubit-forge env validate

# Validate specific file
kubit-forge env validate --file .env.production

# Strict validation
kubit-forge env validate --strict

# Show validation details
kubit-forge env validate --detailed
```

**Example Output:**

```
Environment Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ NODE_ENV: "development" (valid)
✓ PORT: 3000 (valid number, 1000-65535)
✓ DATABASE_URL: "postgresql://..." (valid URL)
✗ API_KEY: Too short (16 chars, minimum 32)
⚠ API_SECRET: Missing (optional)
✗ STRIPE_SECRET_KEY: Invalid format
✓ FEATURE_NEW_DASHBOARD: true (valid boolean)

Errors: 2
Warnings: 1
Valid: 5

Required variables missing: 0
```

### TypeScript Type Generation

Generate TypeScript types from environment schema:

```bash
# Generate types
kubit-forge env:types

# Custom output
kubit-forge env:types --output src/types/env.d.ts
```

**Generated env.d.ts:**

```typescript
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'staging' | 'production';
    APP_NAME: string;
    APP_URL: string;
    PORT: number;
    DATABASE_URL: string;
    DATABASE_POOL_SIZE?: number;
    API_KEY: string;
    API_SECRET?: string;
    STRIPE_PUBLIC_KEY: string;
    STRIPE_SECRET_KEY: string;
    SENDGRID_API_KEY?: string;
    FEATURE_NEW_DASHBOARD: boolean;
    FEATURE_ANALYTICS: boolean;
    SENTRY_DSN?: string;
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  }
}
```

## Security

### Sensitive Variables

Mark and protect sensitive environment variables:

```toml
[env.security]
sensitive = [
  "API_SECRET",
  "DATABASE_URL",
  "STRIPE_SECRET_KEY",
  "SENDGRID_API_KEY",
  "SENTRY_DSN"
]

redactInLogs = true
requireEncryption = true
```

### Encryption

Encrypt sensitive values:

```bash
# Encrypt .env file
kubit-forge env encrypt

# Decrypt .env file
kubit-forge env decrypt --key ${ENCRYPTION_KEY}

# Rotate encryption key
kubit-forge env rotate-key
```

**Encrypted .env.enc:**

```bash
# Application (plaintext)
NODE_ENV=production
APP_NAME=my-app

# Encrypted values
API_KEY=ENC[AES256:base64encodedvalue]
DATABASE_URL=ENC[AES256:base64encodedvalue]
STRIPE_SECRET_KEY=ENC[AES256:base64encodedvalue]
```

### Secret Detection

Detect accidentally committed secrets:

```bash
# Scan for secrets
kubit-forge env scan

# Scan specific files
kubit-forge env scan --files "src/**/*.ts"

# Check git history
kubit-forge env scan --git-history
```

**Example Output:**

```
Secret Detection Scan
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✗ src/config.ts:12
  Hardcoded API key detected
  const API_KEY = "sk_live_abc123xyz";

✗ src/utils/stripe.ts:5
  Stripe secret key in code
  stripe.secretKey = "sk_test_xyz789";

⚠ .env
  Committed to git (should be in .gitignore)

Found 2 secrets, 1 warning
Action: Remove secrets and use environment variables
```

## Environment Information

### Show Environment

```bash
# Show all environment variables
kubit-forge env info

# Filter by prefix
kubit-forge env info --filter APP_

# Show only required
kubit-forge env info --required

# Export as JSON
kubit-forge env info --json

# Mask sensitive values
kubit-forge env info --mask
```

**Example Output:**

```
Environment Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Application:
  NODE_ENV: development
  APP_NAME: my-app
  APP_URL: http://localhost:3000
  PORT: 3000

Database:
  DATABASE_URL: postgresql://localhost:5432/myapp (sensitive)
  DATABASE_POOL_SIZE: 10

API Keys:
  API_KEY: ******************************** (masked)
  API_SECRET: (not set)

External Services:
  STRIPE_PUBLIC_KEY: pk_test_***************
  STRIPE_SECRET_KEY: ******************************** (masked)
  SENDGRID_API_KEY: (not set)

Features:
  FEATURE_NEW_DASHBOARD: enabled
  FEATURE_ANALYTICS: disabled

Monitoring:
  SENTRY_DSN: (not set)
  LOG_LEVEL: debug

Total variables: 15
Required: 8/8 present
Optional: 7/7
Sensitive: 5 (masked)
```

## Environment Synchronization

### Generate Example File

```bash
# Generate .env.example from .env
kubit-forge env:example

# Include descriptions
kubit-forge env:example --with-descriptions

# Include defaults
kubit-forge env:example --with-defaults
```

### Compare Environments

```bash
# Compare .env with .env.example
kubit-forge env diff

# Compare specific files
kubit-forge env diff .env.development .env.production

# Show missing variables
kubit-forge env diff --missing
```

**Example Output:**

```
Environment Diff: .env → .env.example
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Missing in .env.example:
  + NEW_FEATURE_FLAG
  + DEBUG_MODE

Missing in .env:
  - DEPRECATED_API_KEY
  - OLD_CONFIG_VALUE

Different values:
  PORT: 3000 → 8080
  LOG_LEVEL: debug → info

Recommendation: Update .env.example
```

### Sync Environments

```bash
# Sync .env with .env.example
kubit-forge env sync

# Interactive sync
kubit-forge env sync --interactive

# Force sync
kubit-forge env sync --force
```

## Multi-Environment Support

### Switch Environments

```bash
# Load specific environment
kubit-forge env use development
kubit-forge env use staging
kubit-forge env use production

# Show current environment
kubit-forge env current
```

### Environment Templates

```bash
# Create template
kubit-forge env template create production

# Use template
kubit-forge env init --template production

# List templates
kubit-forge env template list
```

## Configuration

### Environment Configuration

```toml
# kubit.config.toml

[env]
# Validation
validateOnStart = true
strict = true
required = ["NODE_ENV", "DATABASE_URL", "API_KEY"]

# File locations
envFile = ".env"
exampleFile = ".env.example"
envDir = "./"

# Security
redactInLogs = true
maskSensitive = true
requireEncryption = false

[env.schema]
# Define variable types and validation
NODE_ENV = { type = "string", enum = ["development", "staging", "production"] }
PORT = { type = "number", min = 1000, max = 65535, default = 3000 }
DATABASE_URL = { type = "url", required = true }
API_KEY = { type = "string", min = 32, required = true }
FEATURE_FLAGS = { type = "boolean", default = false }

[env.security]
sensitive = [
  "PASSWORD",
  "SECRET",
  "KEY",
  "TOKEN",
  "PRIVATE"
]
scanOnCommit = true
```

## Best Practices

### 1. Never Commit Secrets

```bash
# Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Commit example file only
git add .env.example
```

### 2. Use Environment-Specific Files

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

### 3. Validate on Startup

```typescript
// src/index.ts
import { validateEnv } from 'kubit-forge';

validateEnv({
  required: ['DATABASE_URL', 'API_KEY'],
  types: {
    PORT: 'number',
    FEATURE_FLAG: 'boolean',
  },
});
```

### 4. Use Type-Safe Access

```typescript
// Use generated types
const port: number = process.env.PORT;
const nodeEnv: 'development' | 'production' = process.env.NODE_ENV;
```

### 5. Document Variables

```bash
# .env.example with descriptions
# Database connection string (required)
DATABASE_URL=postgresql://localhost:5432/myapp

# API key for external service (required)
API_KEY=your-key-here

# Feature flag for new dashboard (optional, default: false)
FEATURE_NEW_DASHBOARD=false
```

### 6. Use Prefix Convention

```bash
# Prefix by category
APP_NAME=my-app
APP_VERSION=1.0.0

DB_HOST=localhost
DB_PORT=5432

API_KEY=xxx
API_ENDPOINT=https://api.example.com
```

### 7. Regular Audits

```bash
# Weekly audit
kubit-forge env scan
kubit-forge env validate
kubit-forge env diff
```

## Examples

### Complete Environment Setup

```bash
# 1. Initialize environment
kubit-forge env init --interactive

# 2. Generate example file
kubit-forge env:example --with-descriptions

# 3. Validate configuration
kubit-forge env validate --strict

# 4. Generate TypeScript types
kubit-forge env:types

# 5. Scan for secrets
kubit-forge env scan

# 6. Add to version control
git add .env.example
git commit -m "Add environment configuration"
```

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml
steps:
  - name: Validate Environment
    run: kubit-forge env validate --file .env.production --strict

  - name: Check for Secrets
    run: kubit-forge env scan

  - name: Deploy with Environment
    env:
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
      API_KEY: ${{ secrets.API_KEY }}
    run: npm run deploy
```

## Troubleshooting

### Missing Variables

```bash
# Check which are missing
kubit-forge env validate --detailed

# Show all required
kubit-forge env info --required
```

### Type Errors

```bash
# Regenerate types
kubit-forge env:types --force

# Validate types
kubit-forge env validate --strict
```

### Secret Detection Failures

```bash
# Clear git history of secrets
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

## Related Documentation

- [Configuration](./CONFIGURATION.md) - Project configuration
- [Security & SBOM](./SECURITY-SBOM.md) - Security practices
- [Development Commands](./DEVELOPMENT-COMMANDS.md) - Build and deploy

---

**Need help?** Run `kubit-forge env --help` or visit [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues).
