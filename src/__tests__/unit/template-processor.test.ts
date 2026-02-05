/**
 * Template Processor Tests
 */

import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { ConsoleLogger } from '../../utils/logger.js';
import { TemplateProcessor } from '../../utils/template-processor.js';

describe('TemplateProcessor', () => {
  let processor: TemplateProcessor;
  let testDir: string;
  let templateDir: string;
  let outputDir: string;

  beforeEach(() => {
    const logger = new ConsoleLogger({ verbose: false });
    processor = new TemplateProcessor(logger);

    // Create temporary directories
    testDir = join(tmpdir(), `template-test-${Date.now()}`);
    templateDir = join(testDir, 'template');
    outputDir = join(testDir, 'output');

    mkdirSync(templateDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up
    if (existsSync(testDir)) {
      rmSync(testDir, { force: true, recursive: true });
    }
  });

  describe('processTemplate', () => {
    it('should process template with variable replacement', async () => {
      // Create template file
      const templateFile = join(templateDir, 'test.txt');
      writeFileSync(templateFile, 'Hello {{name}}!', 'utf-8');

      // Process template
      await processor.processTemplate(templateDir, outputDir, {
        variables: { name: 'World', projectName: 'test' },
      });

      // Verify output
      const outputFile = join(outputDir, 'test.txt');
      expect(existsSync(outputFile)).toBe(true);
      const content = readFileSync(outputFile, 'utf-8');
      expect(content).toBe('Hello World!');
    });

    it('should process nested directories', async () => {
      // Create nested structure
      const nestedDir = join(templateDir, 'src', 'components');
      mkdirSync(nestedDir, { recursive: true });
      writeFileSync(join(nestedDir, 'Component.tsx'), 'export const {{name}} = () => {};', 'utf-8');

      // Process template
      await processor.processTemplate(templateDir, outputDir, {
        variables: { name: 'Button', projectName: 'test' },
      });

      // Verify output
      const outputFile = join(outputDir, 'src', 'components', 'Component.tsx');
      expect(existsSync(outputFile)).toBe(true);
      const content = readFileSync(outputFile, 'utf-8');
      expect(content).toBe('export const Button = () => {};');
    });

    it('should handle multiple variables', async () => {
      const templateFile = join(templateDir, 'package.json');
      writeFileSync(
        templateFile,
        JSON.stringify({ name: '{{projectName}}', version: '{{version}}' }),
        'utf-8'
      );

      await processor.processTemplate(templateDir, outputDir, {
        variables: {
          projectName: 'my-app',
          version: '1.0.0',
        },
      });

      const outputFile = join(outputDir, 'package.json');
      const content = JSON.parse(readFileSync(outputFile, 'utf-8'));
      expect(content.name).toBe('my-app');
      expect(content.version).toBe('1.0.0');
    });

    it('should copy binary files without modification', async () => {
      // Create a binary-like file
      const binaryFile = join(templateDir, 'image.png');
      const binaryContent = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
      writeFileSync(binaryFile, binaryContent);

      await processor.processTemplate(templateDir, outputDir, {
        variables: { projectName: 'test' },
      });

      const outputFile = join(outputDir, 'image.png');
      expect(existsSync(outputFile)).toBe(true);
      const content = readFileSync(outputFile);
      expect(content).toEqual(binaryContent);
    });
  });

  describe('validateTemplate', () => {
    it('should validate existing template', () => {
      writeFileSync(join(templateDir, 'file.txt'), 'content', 'utf-8');
      writeFileSync(join(templateDir, 'package.json'), '{"name": "test"}', 'utf-8');

      const result = processor.validateTemplate(templateDir);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail for non-existent template', () => {
      const result = processor.validateTemplate(join(testDir, 'nonexistent'));

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getTemplateMetadata', () => {
    it('should extract metadata from template', () => {
      const metadata = processor.getTemplateMetadata(templateDir);

      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('path');
    });
  });
});
