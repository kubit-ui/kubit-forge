# Security & SBOM

## Overview

Kubit Forge provides comprehensive security auditing and Software Bill of Materials (SBOM) generation to ensure supply chain security, license compliance, and vulnerability management.

## Quick Start

```bash
# Security audit
kubit-forge security:audit

# Generate SBOM
kubit-forge sbom:generate

# Validate dependencies
kubit-forge sbom:validate

# Check licenses
kubit-forge security:licenses
```

## Security Auditing

### Basic Security Audit

```bash
# Run security audit
kubit-forge security:audit

# Detailed audit
kubit-forge security:audit --detailed

# JSON output
kubit-forge security:audit --json

# Fail on vulnerabilities
kubit-forge security:audit --fail-on-severity moderate
```

**Example Output:**

```
Security Audit Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found 3 vulnerabilities

Critical (1):
  ✗ lodash@4.17.19
    Path: react-app > lodash
    CVE: CVE-2021-23337
    Fix: lodash@4.17.21

High (1):
  ✗ axios@0.21.0
    Path: api-client > axios
    CVE: CVE-2021-3749
    Fix: axios@0.21.4

Moderate (1):
  ⚠ moment@2.29.0
    Path: date-utils > moment
    Issue: Deprecated package
    Recommendation: Use date-fns or dayjs

Total packages scanned: 1,247
Vulnerable packages: 3
Fixable: 2 (run with --fix)
```

### Auto-fix Vulnerabilities

```bash
# Fix all fixable vulnerabilities
kubit-forge security:fix

# Fix specific severity
kubit-forge security:fix --severity high,critical

# Dry run
kubit-forge security:fix --dry-run

# Interactive mode
kubit-forge security:fix --interactive
```

### Continuous Monitoring

```bash
# Enable security monitoring
kubit-forge security:monitor enable

# Show monitoring status
kubit-forge security:monitor status

# Get alerts
kubit-forge security:monitor alerts
```

### Vulnerability Database

```bash
# Update vulnerability database
kubit-forge security:db:update

# Check database version
kubit-forge security:db:version

# Search for CVE
kubit-forge security:cve CVE-2021-23337
```

## SBOM Generation

### Generate SBOM

```bash
# Generate SBOM (default: JSON)
kubit-forge sbom:generate

# Specify format
kubit-forge sbom:generate --format spdx

# Include dev dependencies
kubit-forge sbom:generate --include-dev

# Output to file
kubit-forge sbom:generate --output sbom.json
```

### Supported SBOM Formats

#### JSON Format

```bash
kubit-forge sbom:generate --format json
```

**Example Output:**

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.4",
  "version": 1,
  "metadata": {
    "timestamp": "2024-02-07T12:00:00Z",
    "tools": [
      {
        "vendor": "kubit-forge",
        "name": "kubit-forge",
        "version": "1.0.0"
      }
    ],
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
      "purl": "pkg:npm/react@18.2.0",
      "licenses": [
        {
          "license": {
            "id": "MIT"
          }
        }
      ],
      "hashes": [
        {
          "alg": "SHA-256",
          "content": "abc123..."
        }
      ]
    }
  ]
}
```

#### SPDX Format

```bash
kubit-forge sbom:generate --format spdx
```

**Example Output:**

```
SPDXVersion: SPDX-2.3
DataLicense: CC0-1.0
SPDXID: SPDXRef-DOCUMENT
DocumentName: my-app
DocumentNamespace: https://example.com/my-app
Creator: Tool: kubit-forge-1.0.0

PackageName: react
SPDXID: SPDXRef-Package-react-18.2.0
PackageVersion: 18.2.0
PackageDownloadLocation: https://registry.npmjs.org/react/-/react-18.2.0.tgz
FilesAnalyzed: false
PackageVerificationCode: abc123...
PackageLicenseConcluded: MIT
```

#### CycloneDX Format

```bash
kubit-forge sbom:generate --format cyclonedx
```

#### XML Format

```bash
kubit-forge sbom:generate --format xml
```

### SBOM Validation

```bash
# Validate SBOM
kubit-forge sbom:validate

# Validate specific file
kubit-forge sbom:validate --file sbom.json

# Validate format compliance
kubit-forge sbom:validate --strict
```

### SBOM Comparison

```bash
# Compare two SBOMs
kubit-forge sbom:diff sbom-old.json sbom-new.json

# Show added dependencies
kubit-forge sbom:diff sbom-old.json sbom-new.json --show added

# Show removed dependencies
kubit-forge sbom:diff sbom-old.json sbom-new.json --show removed
```

**Example Output:**

```
SBOM Diff: sbom-old.json → sbom-new.json
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Added (3):
  + react-query@4.0.0
  + zod@3.20.0
  + tailwindcss@3.3.0

Removed (2):
  - moment@2.29.0
  - lodash@4.17.19

Updated (5):
  • react: 17.0.2 → 18.2.0
  • axios: 0.21.0 → 1.3.0
  • typescript: 4.9.0 → 5.0.0

Total changes: 10
```

## License Management

### License Scanning

```bash
# Scan licenses
kubit-forge security:licenses

# Show detailed license info
kubit-forge security:licenses --detailed

# Export licenses
kubit-forge security:licenses --export licenses.json

# Check license compliance
kubit-forge security:licenses --check
```

**Example Output:**

```
License Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

License Distribution:
  MIT: 847 packages (68%)
  Apache-2.0: 234 packages (19%)
  ISC: 98 packages (8%)
  BSD-2-Clause: 45 packages (4%)
  BSD-3-Clause: 23 packages (2%)

Potential Issues:
  ⚠ GPL-3.0: 1 package (may require disclosure)
    - copyleft-lib@1.0.0

  ⚠ Unknown: 3 packages
    - unknown-license@1.0.0
    - no-license@2.0.0
    - custom-license@3.0.0

Recommendations:
  1. Review GPL-3.0 licensed packages
  2. Verify unknown licenses
  3. Update license documentation
```

### License Allowlist

```toml
# kubit.config.toml

[security.licenses]
allowed = [
  "MIT",
  "Apache-2.0",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause"
]

denied = [
  "GPL-3.0",
  "AGPL-3.0"
]

warnUnknown = true
```

### Generate License File

```bash
# Generate LICENSES.txt
kubit-forge security:licenses:generate

# Include full license texts
kubit-forge security:licenses:generate --full-text

# Markdown format
kubit-forge security:licenses:generate --format markdown
```

## Supply Chain Security

### Package Integrity

```bash
# Verify package integrity
kubit-forge security:verify

# Check package signatures
kubit-forge security:verify --signatures

# Verify checksums
kubit-forge security:verify --checksums
```

### Dependency Provenance

```bash
# Show package provenance
kubit-forge security:provenance <package>

# Verify package source
kubit-forge security:provenance <package> --verify

# Show dependency chain
kubit-forge security:provenance <package> --chain
```

### Lock File Analysis

```bash
# Analyze lock file
kubit-forge security:lockfile:analyze

# Check for inconsistencies
kubit-forge security:lockfile:verify

# Show lock file diff
kubit-forge security:lockfile:diff
```

## Compliance

### Generate Compliance Report

```bash
# Full compliance report
kubit-forge security:compliance

# Specific standard
kubit-forge security:compliance --standard soc2

# Export report
kubit-forge security:compliance --export compliance-report.pdf
```

### Supported Standards

- **NIST** - NIST Cybersecurity Framework
- **SOC 2** - Service Organization Control 2
- **ISO 27001** - Information Security Management
- **GDPR** - General Data Protection Regulation
- **HIPAA** - Health Insurance Portability

### Audit Trail

```bash
# Generate audit trail
kubit-forge security:audit-trail

# Show security events
kubit-forge security:events

# Export audit log
kubit-forge security:audit-trail --export audit.json
```

## Configuration

### Security Configuration

```toml
# kubit.config.toml

[security]
audit = true
autoFix = false
failOnVulnerabilities = true
severityThreshold = "moderate"  # none, low, moderate, high, critical

[security.monitoring]
enabled = true
schedule = "0 9 * * *"  # Daily at 9 AM
notifications = true
email = "security@example.com"

[security.vulnerabilities]
ignore = []  # CVE IDs to ignore
retryFailed = true
updateDatabase = true

[security.licenses]
allowed = ["MIT", "Apache-2.0", "ISC"]
denied = ["GPL-3.0", "AGPL-3.0"]
warnUnknown = true
failOnDenied = true

[sbom]
generate = true
format = "json"  # json, spdx, cyclonedx, xml
output = "./sbom.json"
includeDevDependencies = false
includeHashes = true
includeSignatures = true

[sbom.metadata]
supplier = "My Company"
manufacturer = "My Company"
contact = "security@example.com"
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/security.yml
name: Security Audit

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 9 * * *' # Daily

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Security Audit
        run: npx kubit-forge security:audit --fail-on-severity high

      - name: Generate SBOM
        run: npx kubit-forge sbom:generate --output sbom.json

      - name: Upload SBOM
        uses: actions/upload-artifact@v3
        with:
          name: sbom
          path: sbom.json

      - name: License Check
        run: npx kubit-forge security:licenses --check
```

### GitLab CI

```yaml
# .gitlab-ci.yml
security:
  stage: test
  script:
    - kubit-forge security:audit --fail-on-severity high
    - kubit-forge sbom:generate --output sbom.json
  artifacts:
    paths:
      - sbom.json
  only:
    - main
    - merge_requests
```

## Best Practices

### 1. Regular Audits

Run security audits regularly, not just in CI/CD.

```bash
# Daily security check
kubit-forge security:audit
```

### 2. Auto-fix When Possible

Enable auto-fix for low-risk vulnerabilities.

```bash
kubit-forge security:fix --severity low,moderate
```

### 3. Monitor Continuously

Enable continuous security monitoring.

```bash
kubit-forge security:monitor enable
```

### 4. Maintain SBOM

Keep SBOM up-to-date and in version control.

```bash
kubit-forge sbom:generate --output sbom.json
git add sbom.json
```

### 5. Review Licenses

Regularly review and approve licenses.

```bash
kubit-forge security:licenses --check
```

### 6. Document Exceptions

Document why certain vulnerabilities are ignored.

```toml
[security.vulnerabilities]
ignore = [
  # False positive in dev dependency
  "CVE-2021-12345"
]
```

### 7. Verify Integrity

Always verify package integrity.

```bash
kubit-forge security:verify --signatures
```

## Examples

### Complete Security Workflow

```bash
# 1. Update vulnerability database
kubit-forge security:db:update

# 2. Run security audit
kubit-forge security:audit --detailed

# 3. Fix vulnerabilities
kubit-forge security:fix --interactive

# 4. Check licenses
kubit-forge security:licenses --check

# 5. Generate SBOM
kubit-forge sbom:generate --format spdx

# 6. Verify integrity
kubit-forge security:verify

# 7. Generate compliance report
kubit-forge security:compliance --export report.pdf
```

### Dependency Update with Security Check

```bash
# 1. Check current vulnerabilities
kubit-forge security:audit

# 2. Update dependencies
kubit-forge deps:update

# 3. Verify no new vulnerabilities
kubit-forge security:audit

# 4. Update SBOM
kubit-forge sbom:generate

# 5. Compare SBOMs
kubit-forge sbom:diff sbom-old.json sbom-new.json
```

## Troubleshooting

### False Positives

````bash
# Ignore specific CVE
kubit-forge security:audit --ignore CVE-2021-12345

# Or in config
```toml
[security.vulnerabilities]
ignore = ["CVE-2021-12345"]
````

### Database Update Issues

```bash
# Force database update
kubit-forge security:db:update --force

# Use specific database source
kubit-forge security:db:update --source github
```

### SBOM Generation Failures

```bash
# Generate with verbose logging
kubit-forge sbom:generate --verbose

# Skip problematic packages
kubit-forge sbom:generate --skip-errors
```

## Related Documentation

- [Dependency Management](./DEPENDENCY_MANAGEMENT.md) - Manage dependencies
- [Doctor Command](./DOCTOR-COMMAND.md) - Health checks
- [Configuration](./CONFIGURATION.md) - Configure security settings

---

**Need help?** Run `kubit-forge security --help` or visit [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues).
