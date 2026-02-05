/**
 * Template Processor - Process templates with variable replacement
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';

import type { Logger } from '../types/index.js';

export interface TemplateVariables {
  projectName: string;
  [key: string]: string | boolean | number;
}

export interface ProcessOptions {
  variables: TemplateVariables;
  skipFiles?: string[];
  binaryExtensions?: string[];
}

/**
 * Template Processor
 *
 * Processes template directories by:
 * 1. Copying files from template to destination
 * 2. Replacing variables in text files
 * 3. Skipping binary files
 */
export class TemplateProcessor {
  private logger: Logger;
  private binaryExtensions = new Set([
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico',
    '.svg',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.mp4',
    '.webm',
    '.wav',
    '.mp3',
    '.zip',
    '.gz',
  ]);

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Process a template directory
   */
  async processTemplate(
    templatePath: string,
    outputPath: string,
    options: ProcessOptions
  ): Promise<void> {
    if (!existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    this.logger.debug(`Processing template: ${templatePath} -> ${outputPath}`);

    // Create output directory
    if (!existsSync(outputPath)) {
      mkdirSync(outputPath, { recursive: true });
    }

    // Process all files in template
    await this.processDirectory(templatePath, outputPath, options);

    this.logger.success('Template processed successfully');
  }

  /**
   * Process a directory recursively
   */
  private async processDirectory(
    sourcePath: string,
    targetPath: string,
    options: ProcessOptions
  ): Promise<void> {
    const entries = readdirSync(sourcePath);

    for (const entry of entries) {
      const sourceFile = join(sourcePath, entry);
      const targetFile = join(targetPath, entry);

      // Skip files
      if (options.skipFiles?.includes(entry)) {
        continue;
      }

      const stats = statSync(sourceFile);

      if (stats.isDirectory()) {
        // Create directory and process recursively
        if (!existsSync(targetFile)) {
          mkdirSync(targetFile, { recursive: true });
        }
        await this.processDirectory(sourceFile, targetFile, options);
      } else {
        // Process file
        await this.processFile(sourceFile, targetFile, options);
      }
    }
  }

  /**
   * Process a single file
   */
  private async processFile(
    sourceFile: string,
    targetFile: string,
    options: ProcessOptions
  ): Promise<void> {
    const ext = sourceFile.substring(sourceFile.lastIndexOf('.'));
    const isBinary = this.binaryExtensions.has(ext) || options.binaryExtensions?.includes(ext);

    if (isBinary) {
      // Copy binary file as-is
      const content = readFileSync(sourceFile);
      const targetDir = dirname(targetFile);
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }
      writeFileSync(targetFile, content);
      this.logger.debug(`Copied binary: ${relative(process.cwd(), targetFile)}`);
    } else {
      // Process text file with variable replacement
      let content = readFileSync(sourceFile, 'utf-8');
      content = this.replaceVariables(content, options.variables);

      const targetDir = dirname(targetFile);
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }
      writeFileSync(targetFile, content, 'utf-8');
      this.logger.debug(`Processed: ${relative(process.cwd(), targetFile)}`);
    }
  }

  /**
   * Replace variables in content
   * Supports: {{variableName}}
   */
  private replaceVariables(content: string, variables: TemplateVariables): string {
    let result = content;

    // Replace {{variableName}} with value
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Validate template structure
   */
  validateTemplate(templatePath: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!existsSync(templatePath)) {
      errors.push(`Template directory not found: ${templatePath}`);
      return { errors, valid: false };
    }

    // Check for required files
    const requiredFiles = ['package.json'];
    for (const file of requiredFiles) {
      const filePath = join(templatePath, file);
      if (!existsSync(filePath)) {
        errors.push(`Required file missing: ${file}`);
      }
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }

  /**
   * Get template metadata
   */
  getTemplateMetadata(templatePath: string): {
    name: string;
    path: string;
    description?: string;
    version?: string;
  } {
    const packageJsonPath = join(templatePath, 'package.json');

    if (!existsSync(packageJsonPath)) {
      return { name: 'unknown', path: templatePath };
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      return {
        description: packageJson.description,
        name: packageJson.name || 'unknown',
        path: templatePath,
        version: packageJson.version,
      };
    } catch {
      return { name: 'unknown', path: templatePath };
    }
  }
}
