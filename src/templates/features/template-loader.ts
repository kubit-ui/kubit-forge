import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find templates root - when bundled, __dirname points to dist directory
const TEMPLATES_ROOT =
  __dirname.includes('/dist') || __dirname.includes('\\dist')
    ? __dirname.split(/[/\\]dist/)[0] + '/dist/templates/features'
    : __dirname;

/**
 * Load a feature template file from the templates directory
 */
export function loadFeatureTemplate(templateName: string): string {
  const templatePath = join(TEMPLATES_ROOT, templateName);
  return readFileSync(templatePath, 'utf-8');
}

/**
 * Load multiple feature templates
 */
export function loadFeatureTemplates(templateNames: string[]): Record<string, string> {
  const templates: Record<string, string> = {};
  for (const name of templateNames) {
    templates[name] = loadFeatureTemplate(name);
  }
  return templates;
}
