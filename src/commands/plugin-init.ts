import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import type { PluginContext, CommandResult } from '../types/index.js';

import {
  generatePluginPackageJson,
  generatePluginTsConfig,
  generatePluginTsupConfig,
  generatePluginManifest,
  generatePluginIndexTemplate,
  generatePluginReadmeTemplate,
  generatePluginLicenseTemplate,
  generatePluginGitignoreTemplate,
} from '../templates/generators/index.js';

export interface PluginInitOptions {
  name: string;
  description?: string;
  author?: string;
}

export async function pluginInitCommand(
  options: PluginInitOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const pluginName = options.name.startsWith('@kubit/')
    ? options.name
    : `@kubit/plugin-${options.name}`;

  const pluginDir = join(ctx.cwd, pluginName.replace('@kubit/', ''));

  ctx.logger.step(`Creating plugin: ${pluginName}`);

  // Create directory structure
  mkdirSync(join(pluginDir, 'src'), { recursive: true });
  mkdirSync(join(pluginDir, 'dist'), { recursive: true });

  const templateParams = {
    author: options.author || '',
    description: options.description || `Kubit CLI plugin: ${options.name}`,
    name: options.name,
    pluginName,
    year: new Date().getFullYear(),
  };

  // package.json
  const packageJson = generatePluginPackageJson(templateParams);

  writeFileSync(join(pluginDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // tsconfig.json
  const tsconfig = generatePluginTsConfig();
  writeFileSync(join(pluginDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

  // tsup.config.ts
  const tsupConfig = generatePluginTsupConfig();
  writeFileSync(join(pluginDir, 'tsup.config.ts'), tsupConfig);

  // kubit.plugin.json (manifest)
  const manifest = generatePluginManifest(templateParams);
  writeFileSync(join(pluginDir, 'kubit.plugin.json'), JSON.stringify(manifest, null, 2));

  // src/index.ts
  const indexTs = generatePluginIndexTemplate(templateParams);

  writeFileSync(join(pluginDir, 'src', 'index.ts'), indexTs);

  // README.md
  const readme = generatePluginReadmeTemplate(templateParams);

  writeFileSync(join(pluginDir, 'README.md'), readme);

  // LICENSE
  const license = generatePluginLicenseTemplate(templateParams);

  writeFileSync(join(pluginDir, 'LICENSE'), license);

  // .gitignore
  const gitignore = generatePluginGitignoreTemplate();

  writeFileSync(join(pluginDir, '.gitignore'), gitignore);

  ctx.logger.success(`\n✓ Plugin ${pluginName} created successfully!`);
  ctx.logger.info('\nNext steps:');
  ctx.logger.info(`  1. cd ${pluginDir}`);
  ctx.logger.info('  2. npm install');
  ctx.logger.info('  3. npm run dev (watch mode)');
  ctx.logger.info('  4. Implement your plugin in src/index.ts');

  return {
    data: { pluginDir, pluginName },
    message: 'Plugin initialized',
    status: 'ok',
  };
}
