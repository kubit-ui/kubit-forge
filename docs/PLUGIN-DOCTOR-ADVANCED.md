# Doctor Advanced Plugin

**Optional Plugin for Advanced Diagnostics**

Extends the basic `doctor` command with powerful features like auto-fix, predictive analysis, IDE integration, and personalized recommendations.

## 📦 Installation

The plugin is **built-in** but **optional**. Enable it in your configuration:

```toml
# kubit.config.toml
[plugins]
enabled = ["@kubit/plugin-doctor-advanced"]
```

## 🚀 Commands

### Auto-Fix

Automatically fix detected issues:

```bash
# Run diagnostics and auto-fix issues
kubit-forge doctor:fix

# Preview what would be fixed (dry-run)
kubit-forge doctor:fix --dry-run
```

**What can be auto-fixed:**

- Missing configuration files (.gitignore, .prettierrc)
- Basic ESLint configuration issues
- Package.json fields (license, repository)
- Environment setup (.env files)

**Safety features:**

- Always shows what will be changed
- Dry-run mode to preview
- Backup created before major changes
- Rollback capability

### Predictive Diagnostics

Identify potential future issues before they happen:

```bash
kubit-forge doctor:predictive
```

**Analyzes:**

- Dependency deprecation trends
- Security vulnerability patterns
- Performance degradation indicators
- Code smell progression
- Breaking changes in dependencies

**Output example:**

```
🔮 Running predictive diagnostics...

🔴 Using deprecated Node.js crypto API
   Risk Score: 72%
   Category: security
   Prevention:
     • Review crypto usage in codebase
     • Update to Web Crypto API
     • Run security audit

🟡 Dependency @types/react may become deprecated
   Risk Score: 45%
   Category: dependencies
   Prevention:
     • Monitor React 19 types integration
     • Plan migration to built-in types
```

### IDE Integration

Export diagnostics in IDE-compatible formats:

```bash
# Export as JSON
kubit-forge doctor:export --format json

# Export for VS Code
kubit-forge doctor:export --format vscode --output .vscode/diagnostics.json

# Export SARIF for GitHub Code Scanning
kubit-forge doctor:export --format sarif --output results.sarif

# Export Checkstyle XML
kubit-forge doctor:export --format checkstyle --output checkstyle.xml
```

**Supported formats:**

- `json` - Standard JSON format
- `vscode` - VS Code problems format
- `sarif` - SARIF 2.1.0 (GitHub, GitLab)
- `checkstyle` - Checkstyle XML format

### Personalized Recommendations

Get context-aware recommendations for your project:

```bash
kubit-forge doctor:recommendations
```

**Recommendation engine analyzes:**

- Project size and complexity
- Technology stack and versions
- Code quality metrics
- Team velocity patterns
- Industry best practices

**Output example:**

```
💡 Generating personalized recommendations...

🔴 Enable code splitting for better performance
   Impact: ⭐⭐⭐ | Effort: medium | Category: performance
   Steps:
     1. Configure React.lazy() for route components
     2. Use dynamic imports for heavy libraries
     3. Set up Vite code splitting

🟡 Add Git hooks for code quality
   Impact: ⭐⭐ | Effort: low | Category: quality
   Steps:
     1. Install husky
     2. Add pre-commit hook for linting
     3. Add pre-push hook for tests
```

## 📋 Use Cases

### 1. CI/CD Integration with Auto-Fix

Automatically fix simple issues in CI:

```yaml
# .github/workflows/doctor.yml
name: Doctor

on: [push, pull_request]

jobs:
  doctor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Doctor with Auto-Fix
        run: pnpm kubit-forge doctor:fix

      - name: Commit fixes
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'fix: auto-fix doctor issues'
```

### 2. Predictive Monitoring

Weekly scheduled predictive analysis:

```yaml
# .github/workflows/predictive.yml
name: Predictive Analysis

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  predict:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Predictive Diagnostics
        run: pnpm kubit-forge doctor:predictive
```

### 3. VS Code Integration

Export diagnostics for VS Code problems panel:

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Doctor: Export for VS Code",
      "type": "shell",
      "command": "pnpm kubit-forge doctor:export --format vscode --output .vscode/diagnostics.json",
      "problemMatcher": []
    }
  ]
}
```

### 4. GitHub Code Scanning

Export SARIF for GitHub:

```yaml
# .github/workflows/code-scanning.yml
name: Code Scanning

on: [push]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Generate SARIF
        run: pnpm kubit-forge doctor:export --format sarif --output results.sarif

      - name: Upload to GitHub
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: results.sarif
```

## 🎯 When to Use This Plugin

**✅ Use when you need:**

- Automated issue fixing in development/CI
- Proactive issue detection (predictive)
- IDE integration (VS Code, IntelliJ, etc.)
- Code scanning integration (GitHub, GitLab)
- Advanced project insights and recommendations

**❌ Not needed for:**

- Simple projects with manual checks
- Teams satisfied with basic `doctor` command
- Projects without CI/CD automation

## 🔧 Configuration

### Plugin Options

```toml
# kubit.config.toml
[plugins]
enabled = ["@kubit/plugin-doctor-advanced"]

[doctor]
# Auto-fix configuration
autofix.enabled = true
autofix.backup = true
autofix.rules = ["gitignore", "prettier", "eslint"]

# Predictive configuration
predictive.enabled = true
predictive.riskThreshold = 60
predictive.categories = ["security", "dependencies", "performance"]

# Recommendations configuration
recommendations.maxResults = 5
recommendations.prioritize = "impact" # or "effort"
```

## 🆚 Comparison with Basic Doctor

| Feature             | Basic Doctor | Advanced Plugin |
| ------------------- | ------------ | --------------- |
| System checks       | ✅           | ✅              |
| Config validation   | ✅           | ✅              |
| Auto-fix            | ❌           | ✅              |
| Predictive analysis | ❌           | ✅              |
| IDE integration     | ❌           | ✅ (4 formats)  |
| Recommendations     | Basic        | Personalized    |
| CI/CD optimized     | ✅           | ✅✅            |

## 📊 Performance Impact

- **Auto-fix**: +200ms average
- **Predictive**: +800ms average
- **Export**: +100ms average
- **Recommendations**: +300ms average

All operations are optimized and run in parallel where possible.

## 🔒 Safety & Reliability

### Auto-Fix Safety

- **Dry-run mode**: Preview changes first
- **Backups**: Automatic before destructive changes
- **Rollback**: Undo capability
- **Whitelisting**: Only safe fixes enabled by default

### Predictive Analysis

- **Historical data**: Based on real patterns
- **Risk scoring**: Transparent calculation
- **False positives**: Tunable thresholds
- **Privacy**: All analysis is local

## 🐛 Troubleshooting

### Auto-Fix Not Working

**Issue**: Changes not being applied

**Solution**:

```bash
# Check if files are write-protected
ls -la <file>

# Run with verbose logging
kubit-forge doctor:fix --verbose
```

### Predictive Analysis Errors

**Issue**: "Not enough data" message

**Solution**: Predictive analysis requires:

- Git history (50+ commits)
- package.json with dependencies
- At least 1 month of commit history

### Export Format Not Recognized

**Issue**: IDE doesn't recognize exported format

**Solution**:

```bash
# Verify format syntax
kubit-forge doctor:export --format vscode --output diagnostics.json

# Check IDE plugin is installed
# For VS Code: Install "Problem Matchers" extension
```

## 🎓 Learn More

- [Basic Doctor Command](./DOCTOR-COMMAND.md)
- [Plugin System](./PLUGIN-SYSTEM.md)
- [CI/CD Integration Guide](./CI-CD.md)
- [IDE Integration Guide](./IDE-INTEGRATION.md)

## 📝 Example Workflow

```bash
# 1. Enable plugin
echo '[plugins]' >> kubit.config.toml
echo 'enabled = ["@kubit/plugin-doctor-advanced"]' >> kubit.config.toml

# 2. Run basic diagnostics first
kubit-forge doctor

# 3. Auto-fix issues (dry-run first)
kubit-forge doctor:fix --dry-run
kubit-forge doctor:fix

# 4. Run predictive analysis
kubit-forge doctor:predictive

# 5. Get personalized recommendations
kubit-forge doctor:recommendations

# 6. Export for your IDE
kubit-forge doctor:export --format vscode
```

## 🤝 Contributing

Found a bug or have a feature request for the Doctor Advanced plugin?

- [Report an issue](https://github.com/kubit-ui/kubit-forge/issues)
- [Contribute improvements](https://github.com/kubit-ui/kubit-forge/blob/main/CONTRIBUTING.md)

---

**Need help?** Run `kubit-forge doctor:fix --help` or visit the [main documentation](./README.md).
