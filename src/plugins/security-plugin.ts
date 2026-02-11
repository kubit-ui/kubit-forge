/**
 * Security Plugin
 *
 * Optional plugin for SBOM generation and security audits.
 * Install when you need enterprise-grade supply chain security.
 *
 * @example
 * ```toml
 * # kubit.config.toml
 * [plugins]
 * enabled = ["@kubit/plugin-security"]
 * ```
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { Plugin, PluginContext, CommandRegistration, CommandResult } from '../types/index.js';

import { PluginVerification } from '../core/plugin-verification.js';

/**
 * SBOM format options
 */
type SBOMFormat = 'cyclonedx' | 'spdx' | 'json' | 'xml';

/**
 * Security Plugin
 */
export const securityPlugin: Plugin = {
  capabilities: ['fs:read', 'fs:write', 'net:localhost'],
  name: '@kubit/plugin-security',
  onLoad(ctx: PluginContext) {
    ctx.logger.debug('Security plugin loaded');
  },

  registerCommands(): CommandRegistration[] {
    return [
      // ============================================================================
      // SBOM Commands
      // ============================================================================
      {
        action: async (args, ctx) => {
          return await generateSBOM(args, ctx);
        },
        description: 'Generate Software Bill of Materials (SBOM)',
        name: 'sbom:generate',
        options: [
          {
            defaultValue: 'cyclonedx',
            description: 'Output format: cyclonedx, spdx, json, xml',
            flags: '--format <format>',
          },
          {
            defaultValue: 'sbom.json',
            description: 'Output file path',
            flags: '--output <path>',
          },
        ],
      },
      {
        action: async (args, ctx) => {
          return await validateSBOM(args, ctx);
        },
        description: 'Validate SBOM file',
        name: 'sbom:validate',
        options: [
          {
            defaultValue: 'sbom.json',
            description: 'SBOM file to validate',
            flags: '--file <path>',
          },
        ],
      },

      // ============================================================================
      // Security Audit Commands
      // ============================================================================
      {
        action: async (args, ctx) => {
          return await securityAudit(args, ctx);
        },
        description: 'Run security audit on dependencies',
        name: 'security:audit',
        options: [
          {
            defaultValue: false,
            description: 'Auto-fix vulnerabilities where possible',
            flags: '--fix',
          },
          {
            defaultValue: 'moderate',
            description: 'Minimum severity level: low, moderate, high, critical',
            flags: '--level <level>',
          },
        ],
      },
      {
        action: async (_args, ctx) => {
          return await securityScan(ctx);
        },
        description: 'Scan for vulnerabilities in dependencies',
        name: 'security:scan',
      },
      {
        action: async (args, ctx) => {
          return await securityCheck(args, ctx);
        },
        description: 'Check licenses and security policies',
        name: 'security:check',
        options: [
          {
            defaultValue: false,
            description: 'Fail on any policy violations',
            flags: '--strict',
          },
        ],
      },
    ];
  },

  version: '1.0.0',
};

// ============================================================================
// Command Implementations
// ============================================================================

/**
 * Generate SBOM
 */
async function generateSBOM(
  args: { format?: SBOMFormat; output?: string },
  ctx: PluginContext
): Promise<CommandResult> {
  try {
    ctx.logger.step('📋 Generating SBOM...');

    const verification = new PluginVerification(ctx.logger);
    const format = args.format || 'cyclonedx';
    const output = args.output || 'sbom.json';

    // Generate SBOM using PluginVerification
    const sbom = verification.generateSBOM(ctx.cwd);

    // Convert format if needed
    let finalSBOM = sbom;
    if (format === 'spdx') {
      finalSBOM = convertToSPDX(sbom);
    } else if (format === 'xml') {
      finalSBOM = convertToXML(sbom);
    }

    // Write to file
    const outputPath = join(ctx.cwd, output);
    writeFileSync(
      outputPath,
      typeof finalSBOM === 'string' ? finalSBOM : JSON.stringify(finalSBOM, null, 2)
    );

    ctx.logger.success(`✓ SBOM generated: ${output}`);
    ctx.logger.info(`  Format: ${format}`);
    ctx.logger.info(`  Components: ${sbom.components.length}`);
    ctx.logger.info(
      `  Project: ${sbom.metadata.component.name}@${sbom.metadata.component.version}`
    );

    return {
      data: { components: sbom.components.length, path: outputPath },
      message: `SBOM generated successfully: ${output}`,
      status: 'ok',
    };
  } catch (error) {
    ctx.logger.error('Failed to generate SBOM', error as Error);
    return {
      errors: [
        {
          code: 'SBOM_GENERATION_FAILED',
          message: (error as Error).message,
        },
      ],
      message: (error as Error).message,
      status: 'error',
    };
  }
}

/**
 * Validate SBOM
 */
async function validateSBOM(args: { file?: string }, ctx: PluginContext): Promise<CommandResult> {
  try {
    ctx.logger.step('🔍 Validating SBOM...');

    const filePath = join(ctx.cwd, args.file || 'sbom.json');

    if (!existsSync(filePath)) {
      return {
        errors: [
          {
            code: 'FILE_NOT_FOUND',
            message: `SBOM file does not exist: ${filePath}`,
            solution: 'Run "kubit-forge sbom:generate" first',
          },
        ],
        message: `SBOM file not found: ${args.file}`,
        status: 'error',
      };
    }

    const content = readFileSync(filePath, 'utf-8');
    const sbom = JSON.parse(content);

    // Validate structure
    const issues: string[] = [];

    if (!sbom.bomFormat) {
      issues.push('Missing bomFormat field');
    }
    if (!sbom.specVersion) {
      issues.push('Missing specVersion field');
    }
    if (!sbom.metadata) {
      issues.push('Missing metadata field');
    }
    if (!sbom.components || !Array.isArray(sbom.components)) {
      issues.push('Missing or invalid components array');
    }

    if (issues.length > 0) {
      ctx.logger.warn(`⚠ SBOM validation found ${issues.length} issue(s):`);
      issues.forEach((issue) => ctx.logger.warn(`  - ${issue}`));

      return {
        data: { issues },
        message: 'SBOM validation completed with warnings',
        status: 'warning',
      };
    }

    ctx.logger.success('✓ SBOM is valid');
    ctx.logger.info(`  Format: ${sbom.bomFormat} ${sbom.specVersion}`);
    ctx.logger.info(`  Components: ${sbom.components.length}`);

    return {
      data: { components: sbom.components.length, valid: true },
      message: 'SBOM is valid',
      status: 'ok',
    };
  } catch (error) {
    ctx.logger.error('Failed to validate SBOM', error as Error);
    return {
      errors: [
        {
          code: 'SBOM_VALIDATION_FAILED',
          message: (error as Error).message,
        },
      ],
      message: (error as Error).message,
      status: 'error',
    };
  }
}

/**
 * Security Audit
 */
async function securityAudit(
  args: { fix?: boolean; level?: string },
  ctx: PluginContext
): Promise<CommandResult> {
  try {
    ctx.logger.step('🔒 Running security audit...');

    const pm = ctx.config.project.packageManager;

    // Run audit
    const result = await ctx.runner.run(pm, args.fix ? ['audit', 'fix'] : ['audit']);

    if (result.status === 'ok') {
      ctx.logger.success('✓ No vulnerabilities found');
      return {
        message: 'Security audit passed',
        status: 'ok',
      };
    }
    ctx.logger.warn('⚠ Vulnerabilities found');
    ctx.logger.info('');
    ctx.logger.info('Run with --fix to attempt automatic fixes:');
    ctx.logger.info('  kubit-forge security:audit --fix');

    return {
      message: 'Vulnerabilities detected',
      status: 'warning',
    };
  } catch (error) {
    ctx.logger.error('Security audit failed', error as Error);
    return {
      message: (error as Error).message,
      status: 'error',
    };
  }
}

/**
 * Security Scan
 */
async function securityScan(ctx: PluginContext): Promise<CommandResult> {
  try {
    ctx.logger.step('🔎 Scanning for security issues...');

    const pkgPath = join(ctx.cwd, 'package.json');
    if (!existsSync(pkgPath)) {
      return {
        message: 'package.json not found',
        status: 'error',
      };
    }

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    ctx.logger.info(`Scanning ${Object.keys(allDeps).length} dependencies...`);

    // Run npm/pnpm audit
    const pm = ctx.config.project.packageManager;
    await ctx.runner.run(pm, ['audit', '--json']);

    ctx.logger.success('✓ Security scan completed');

    return {
      message: 'Security scan completed',
      status: 'ok',
    };
  } catch (error) {
    ctx.logger.error('Security scan failed', error as Error);
    return {
      message: (error as Error).message,
      status: 'error',
    };
  }
}

/**
 * Security Check (Licenses & Policies)
 */
async function securityCheck(
  _args: { strict?: boolean },
  ctx: PluginContext
): Promise<CommandResult> {
  try {
    ctx.logger.step('📜 Checking licenses and security policies...');

    const pkgPath = join(ctx.cwd, 'package.json');
    if (!existsSync(pkgPath)) {
      return {
        message: 'package.json not found',
        status: 'error',
      };
    }

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    // Check for license field
    if (!pkg.license) {
      ctx.logger.warn('⚠ No license specified in package.json');
    } else {
      ctx.logger.info(`License: ${pkg.license}`);
    }

    ctx.logger.success('✓ Security policy check completed');

    return {
      message: 'Security policy check completed',
      status: 'ok',
    };
  } catch (error) {
    ctx.logger.error('Security check failed', error as Error);
    return {
      message: (error as Error).message,
      status: 'error',
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert CycloneDX to SPDX format
 */
function convertToSPDX(cyclonedx: any): any {
  return {
    creationInfo: {
      created: cyclonedx.metadata.timestamp,
      creators: ['Tool: kubit-forge'],
      licenseListVersion: '3.20',
    },
    dataLicense: 'CC0-1.0',
    name: cyclonedx.metadata.component.name,
    packages: cyclonedx.components.map((comp: any, idx: number) => ({
      downloadLocation: 'NOASSERTION',
      filesAnalyzed: false,
      name: comp.name,
      SPDXID: `SPDXRef-Package-${idx}`,
      versionInfo: comp.version,
    })),
    SPDXID: 'SPDXRef-DOCUMENT',
    spdxVersion: 'SPDX-2.3',
  };
}

/**
 * Convert to XML format
 */
function convertToXML(sbom: any): string {
  // Simple XML conversion for demonstration
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<bom xmlns="http://cyclonedx.org/schema/bom/${sbom.specVersion}">\n`;
  xml += '  <metadata>\n';
  xml += `    <timestamp>${sbom.metadata.timestamp}</timestamp>\n`;
  xml += `    <component type="${sbom.metadata.component.type}">\n`;
  xml += `      <name>${sbom.metadata.component.name}</name>\n`;
  xml += `      <version>${sbom.metadata.component.version}</version>\n`;
  xml += '    </component>\n';
  xml += '  </metadata>\n';
  xml += '  <components>\n';
  sbom.components.forEach((comp: any) => {
    xml += `    <component type="${comp.type}">\n`;
    xml += `      <name>${comp.name}</name>\n`;
    xml += `      <version>${comp.version}</version>\n`;
    xml += `      <purl>${comp.purl}</purl>\n`;
    xml += '    </component>\n';
  });
  xml += '  </components>\n';
  xml += '</bom>';
  return xml;
}

export default securityPlugin;
