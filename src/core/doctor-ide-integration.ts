/**
 * Doctor IDE Integration
 *
 * Generate IDE-compatible diagnostic output for better developer experience
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

import type { Logger } from '../types/index.js';
import type { DoctorCheck } from '../types/index.js';

export interface IDEDiagnostic {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info' | 'hint';
  message: string;
  code?: string;
  source: string;
  relatedInformation?: Array<{
    file: string;
    line: number;
    column: number;
    message: string;
  }>;
}

export interface IDEOutput {
  format: 'vscode' | 'jetbrains' | 'sarif' | 'checkstyle';
  diagnostics: IDEDiagnostic[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
  };
}

export class DoctorIDEIntegration {
  private logger: Logger;
  private cwd: string;

  constructor(logger: Logger, cwd: string) {
    this.logger = logger;
    this.cwd = cwd;
  }

  /**
   * Convert doctor checks to IDE diagnostics
   */
  convertToIDEDiagnostics(checks: DoctorCheck[]): IDEDiagnostic[] {
    const diagnostics: IDEDiagnostic[] = [];

    for (const check of checks) {
      if (check.status === 'ok') {
        continue;
      }

      const diagnostic: IDEDiagnostic = {
        code: `doctor-${check.category}`,
        column: 1,
        file: this.getRelevantFile(check),
        line: 1,
        message: `[${check.category}] ${check.name}: ${check.message}`,
        severity: check.status === 'error' ? 'error' : 'warning',
        source: 'kubit-forge-doctor',
      };

      if (check.solution) {
        diagnostic.relatedInformation = [
          {
            column: 1,
            file: diagnostic.file,
            line: 1,
            message: `Solution: ${check.solution}`,
          },
        ];
      }

      diagnostics.push(diagnostic);
    }

    return diagnostics;
  }

  /**
   * Get relevant file for a check
   */
  private getRelevantFile(check: DoctorCheck): string {
    // Map check categories to relevant files
    const fileMap: Record<string, string> = {
      config: 'kubit.config.js',
      dependency: 'package.json',
      eslint: '.eslintrc.json',
      git: '.gitignore',
      prettier: '.prettierrc',
      security: '.env',
      test: 'package.json',
      typescript: 'tsconfig.json',
    };

    return join(this.cwd, fileMap[check.category] || 'package.json');
  }

  /**
   * Export diagnostics in VS Code format
   */
  exportVSCodeFormat(checks: DoctorCheck[]): IDEOutput {
    const diagnostics = this.convertToIDEDiagnostics(checks);

    return {
      diagnostics,
      format: 'vscode',
      summary: this.getSummary(diagnostics),
    };
  }

  /**
   * Export diagnostics in SARIF format (for GitHub Code Scanning)
   */
  exportSARIFFormat(checks: DoctorCheck[]): string {
    const diagnostics = this.convertToIDEDiagnostics(checks);

    const sarif = {
      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
      runs: [
        {
          results: diagnostics.map((d) => ({
            level: d.severity === 'error' ? 'error' : 'warning',
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: d.file,
                  },
                  region: {
                    startColumn: d.column,
                    startLine: d.line,
                  },
                },
              },
            ],
            message: {
              text: d.message,
            },
            ruleId: d.code || 'doctor-check',
          })),
          tool: {
            driver: {
              informationUri: 'https://github.com/kubit-forge/kubit-forge',
              name: 'Kubit CLI Doctor',
              rules: this.generateSARIFRules(diagnostics),
              version: '1.0.0',
            },
          },
        },
      ],
      version: '2.1.0',
    };

    return JSON.stringify(sarif, null, 2);
  }

  /**
   * Generate SARIF rules
   */
  private generateSARIFRules(diagnostics: IDEDiagnostic[]) {
    const uniqueCodes = [...new Set(diagnostics.map((d) => d.code).filter(Boolean))];

    return uniqueCodes.map((code) => ({
      fullDescription: {
        text: `Kubit CLI Doctor diagnostic for ${code}`,
      },
      help: {
        text: 'Run `kubit-forge doctor --fix` to attempt automatic fixes',
      },
      id: code,
      shortDescription: {
        text: `Doctor check: ${code}`,
      },
    }));
  }

  /**
   * Export diagnostics in Checkstyle format (for Jenkins, SonarQube)
   */
  exportCheckstyleFormat(checks: DoctorCheck[]): string {
    const diagnostics = this.convertToIDEDiagnostics(checks);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<checkstyle version="8.0">\n';

    // Group by file
    const byFile = new Map<string, IDEDiagnostic[]>();
    for (const diagnostic of diagnostics) {
      if (!byFile.has(diagnostic.file)) {
        byFile.set(diagnostic.file, []);
      }
      byFile.get(diagnostic.file)!.push(diagnostic);
    }

    for (const [file, fileDiagnostics] of byFile.entries()) {
      xml += `  <file name="${this.escapeXml(file)}">\n`;

      for (const diagnostic of fileDiagnostics) {
        xml += `    <error line="${diagnostic.line}" `;
        xml += `column="${diagnostic.column}" `;
        xml += `severity="${diagnostic.severity}" `;
        xml += `message="${this.escapeXml(diagnostic.message)}" `;
        xml += `source="${this.escapeXml(diagnostic.source)}" />\n`;
      }

      xml += '  </file>\n';
    }

    xml += '</checkstyle>\n';

    return xml;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Save diagnostics to file
   */
  async saveDiagnostics(
    checks: DoctorCheck[],
    format: 'vscode' | 'sarif' | 'checkstyle',
    outputPath?: string
  ): Promise<string> {
    let content: string;
    let filename: string;

    switch (format) {
      case 'vscode':
        content = JSON.stringify(this.exportVSCodeFormat(checks), null, 2);
        filename = 'doctor-diagnostics.json';
        break;

      case 'sarif':
        content = this.exportSARIFFormat(checks);
        filename = 'doctor-diagnostics.sarif';
        break;

      case 'checkstyle':
        content = this.exportCheckstyleFormat(checks);
        filename = 'doctor-diagnostics.xml';
        break;
    }

    const filePath = outputPath || join(this.cwd, filename);
    writeFileSync(filePath, content, 'utf-8');

    this.logger.success(`Diagnostics saved to: ${filePath}`);
    return filePath;
  }

  /**
   * Generate problem matcher for VS Code tasks
   */
  generateVSCodeProblemMatcher(): string {
    const problemMatcher = {
      fileLocation: ['relative', '${workspaceFolder}'],
      owner: 'kubit-forge-doctor',
      pattern: {
        file: 1,
        message: 3,
        regexp: '^\\[(.+)\\]\\s+(.+):\\s+(.+)$',
        severity: 2,
      },
    };

    return JSON.stringify(problemMatcher, null, 2);
  }

  /**
   * Generate VS Code task configuration
   */
  generateVSCodeTask(): string {
    const task = {
      tasks: [
        {
          command: 'kubit-forge doctor --format=vscode',
          label: 'Kubit Doctor',
          presentation: {
            panel: 'new',
            reveal: 'always',
          },
          problemMatcher: {
            fileLocation: ['relative', '${workspaceFolder}'],
            owner: 'kubit-forge-doctor',
            pattern: {
              column: 3,
              file: 1,
              line: 2,
              message: 5,
              regexp: '^(.+):(\\d+):(\\d+):\\s+(error|warning|info):\\s+(.+)$',
              severity: 4,
            },
          },
          type: 'shell',
        },
      ],
      version: '2.0.0',
    };

    return JSON.stringify(task, null, 2);
  }

  /**
   * Get summary of diagnostics
   */
  private getSummary(diagnostics: IDEDiagnostic[]) {
    return {
      errors: diagnostics.filter((d) => d.severity === 'error').length,
      infos: diagnostics.filter((d) => d.severity === 'info').length,
      warnings: diagnostics.filter((d) => d.severity === 'warning').length,
    };
  }

  /**
   * Print diagnostics in terminal-friendly format
   */
  printDiagnostics(checks: DoctorCheck[]): void {
    const diagnostics = this.convertToIDEDiagnostics(checks);

    for (const diagnostic of diagnostics) {
      const icon = diagnostic.severity === 'error' ? '❌' : '⚠️';
      this.logger.info(
        `${icon} ${diagnostic.file}:${diagnostic.line}:${diagnostic.column} - ${diagnostic.message}`
      );

      if (diagnostic.relatedInformation) {
        for (const info of diagnostic.relatedInformation) {
          this.logger.info(`   💡 ${info.message}`);
        }
      }
    }

    const summary = this.getSummary(diagnostics);
    this.logger.info('');
    this.logger.info(
      `Summary: ${summary.errors} errors, ${summary.warnings} warnings, ${summary.infos} infos`
    );
  }
}
