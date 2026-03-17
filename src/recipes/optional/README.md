# Optional Recipes

This directory contains **optional recipes** for advanced workflows and setups.

## 📦 Available Recipes

| Recipe                     | Category | Requires                      | Description                       |
| -------------------------- | -------- | ----------------------------- | --------------------------------- |
| `security-sbom-workflow`   | Security | @kubit/plugin-security        | Complete security & SBOM workflow |
| `doctor-advanced-workflow` | Quality  | @kubit/plugin-doctor-advanced | Advanced diagnostics workflow     |
| `testing-complete-setup`   | Testing  | -                             | Professional testing setup        |
| `monorepo-turborepo-setup` | Monorepo | pnpm                          | Turborepo monorepo configuration  |

## 🚀 Usage

```bash
# List all recipes
kubit-forge recipe list

# Show recipe details
kubit-forge recipe show security-sbom-workflow

# Apply a recipe
kubit-forge recipe apply security-sbom-workflow

# Apply with variables
kubit-forge recipe apply testing-complete-setup \
  --var coverageThreshold=90 \
  --var includeE2E=true
```

## 📖 Documentation

See [RECIPES-OPTIONAL.md](../../../docs/RECIPES-OPTIONAL.md) for complete documentation.

## 🎯 Philosophy

These recipes follow the same philosophy as optional plugins:

- **Optional**: Only install what you need
- **Modular**: Mix and match recipes
- **Best practices**: Industry-standard configurations
- **CI/CD ready**: GitHub Actions integration
- **Customizable**: Variables for flexibility

## 🔗 Related

- [Core Recipes](../)
- [Plugin Security](../../plugins/security-plugin.ts)
- [Plugin Doctor Advanced](../../plugins/doctor-advanced-plugin.ts)
