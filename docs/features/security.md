# Security Plugin

**Optional Plugin for SBOM Generation and Security Audits**

The Security Plugin provides enterprise-grade supply chain security features for projects that need SBOM (Software Bill of Materials) generation and advanced security auditing.

##  Installation

The security plugin is **built-in** but **optional**. Enable it in your configuration:

```toml
# kubit.config.toml
[plugins]
enabled = ["@kubit/plugin-security"]
```

##  Commands

### SBOM Generation

Generate a Software Bill of Materials for your project:

```bash
# Generate SBOM in CycloneDX format (default)
kubit-forge sbom:generate

# Generate in SPDX format
kubit-forge sbom:generate --format spdx

# Generate as XML
kubit-forge sbom:generate --format xml

# Custom output path
kubit-forge sbom:generate --output my-sbom.json
```

**Supported Formats:**

- `cyclonedx` - CycloneDX JSON format (default)
- `spdx` - SPDX JSON format
- `json` - Generic JSON format
- `xml` - CycloneDX XML format

### SBOM Validation

Validate an existing SBOM file:

```bash
# Validate default SBOM file
kubit-forge sbom:validate

# Validate custom file
kubit-forge sbom:validate --file custom-sbom.json
```

### Security Audit

Run security audits on your dependencies:

```bash
# Run security audit
kubit-forge security:audit

# Auto-fix vulnerabilities
kubit-forge security:audit --fix

# Set minimum severity level
kubit-forge security:audit --level critical
```

**Severity Levels:**

- `low` - Show all vulnerabilities
- `moderate` - Show moderate and above
- `high` - Show high and critical only
- `critical` - Show only critical vulnerabilities

### Security Scan

Quick security scan of dependencies:

```bash
kubit-forge security:scan
```

### Security Policy Check

Check licenses and security policies:

```bash
# Standard check
kubit-forge security:check

# Strict mode (fail on any violations)
kubit-forge security:check --strict
```

##  Use Cases

### 1. Enterprise Compliance

Generate SBOM for compliance and auditing:

```bash
# Generate SBOM for compliance team
kubit-forge sbom:generate --format spdx --output compliance/sbom.json

# Validate before submission
kubit-forge sbom:validate --file compliance/sbom.json
```

### 2. CI/CD Integration

Add security checks to your pipeline:

```yaml
# .github/workflows/security.yml
name: Security Audit

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install dependencies
        run: pnpm install

      - name: Security Audit
        run: pnpm kubit-forge security:audit --level high

      - name: Generate SBOM
        run: pnpm kubit-forge sbom:generate

      - name: Upload SBOM
        uses: actions/upload-artifact@v3
        with:
          name: sbom
          path: sbom.json
```

### 3. Regular Security Monitoring

Automated security monitoring:

```bash
#!/bin/bash
# security-check.sh

echo " Running security checks..."

# Run security scan
kubit-forge security:scan

# Run audit with auto-fix
kubit-forge security:audit --fix

# Generate fresh SBOM
kubit-forge sbom:generate --output sbom-$(date +%Y%m%d).json

echo " Security checks completed"
```

### 4. Supply Chain Verification

Verify your supply chain:

```bash
# Generate SBOM
kubit-forge sbom:generate

# Check licenses
kubit-forge security:check

# Audit for vulnerabilities
kubit-forge security:audit --level moderate
```

##  When to Use This Plugin

** Use when you need:**

- SBOM generation for compliance (SOC2, ISO 27001)
- Supply chain security documentation
- Enterprise security auditing
- License compliance checking
- Vulnerability tracking and reporting

** Not needed for:**

- Simple personal projects
- Basic development without compliance requirements
- Projects using only `npm audit` or `pnpm audit`

##  Configuration

No additional configuration required. The plugin uses your project's `package.json` for analysis.

### Optional: Custom Security Policies

You can add security policies to your config:

```toml
# kubit.config.toml
[plugins]
enabled = ["@kubit/plugin-security"]

[security]
minSeverity = "moderate"
allowedLicenses = ["MIT", "Apache-2.0", "BSD-3-Clause"]
```

##  Output Examples

### SBOM Output (CycloneDX)

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "metadata": {
    "timestamp": "2024-01-15T10:30:00Z",
    "component": {
      "type": "application",
      "name": "my-app",
      "version": "1.0.0"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "react",
      "version": "18.2.0",
      "purl": "pkg:npm/react@18.2.0"
    }
  ]
}
```

### Security Audit Output

```
 Running security audit...

 No vulnerabilities found

Dependencies scanned: 245
Time: 3.2s
```

##  Integration with Package Managers

The plugin leverages native package manager audit commands:

- **npm**: Uses `npm audit`
- **pnpm**: Uses `pnpm audit`
- **yarn**: Uses `yarn audit`

This ensures compatibility and accuracy with your existing security tooling.

##  Related Tools

This plugin complements but doesn't replace:

- `npm audit` / `pnpm audit` - For quick checks
- **Snyk** - For advanced vulnerability scanning
- **Dependabot** - For automated updates
- **OWASP Dependency-Check** - For comprehensive scanning

##  Troubleshooting

### SBOM Generation Fails

**Issue**: `package.json not found`

**Solution**: Run from project root directory

```bash
cd /path/to/project
kubit-forge sbom:generate
```

### Audit Command Not Available

**Issue**: Audit command fails

**Solution**: Update your package manager:

```bash
# For npm
npm install -g npm@latest

# For pnpm
pnpm install -g pnpm@latest
```

### Validation Errors

**Issue**: SBOM validation fails

**Solution**: Regenerate SBOM with latest format:

```bash
kubit-forge sbom:generate --format cyclonedx
```

##  Standards Compliance

This plugin generates SBOMs compliant with:

- **CycloneDX 1.4** - OWASP standard for SBOM
- **SPDX 2.3** - Linux Foundation standard
- **ISO/IEC 5230** - OpenChain specification

##  Learn More

- [CycloneDX Specification](https://cyclonedx.org/)
- [SPDX Specification](https://spdx.dev/)
- [NIST SBOM Guidelines](https://www.nist.gov/itl/executive-order-improving-nations-cybersecurity/software-security-supply-chains-software-1)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)

##  Example Workflow

```bash
# 1. Enable plugin
echo '[plugins]' >> kubit.config.toml
echo 'enabled = ["@kubit/plugin-security"]' >> kubit.config.toml

# 2. Generate SBOM
kubit-forge sbom:generate

# 3. Run security audit
kubit-forge security:audit

# 4. Check policies
kubit-forge security:check

# 5. Validate SBOM
kubit-forge sbom:validate
```

---

**Need help?** Open an issue on [GitHub](https://github.com/kubit-ui/kubit-forge/issues) or check the [main documentation](./README.md).
