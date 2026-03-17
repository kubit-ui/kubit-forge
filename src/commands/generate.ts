import { writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../types/index.js';

import {
  generateComponentTemplate,
  generateComponentIndexTemplate,
  generateComponentTestTemplate,
  generateComponentStoryTemplate,
  generatePageTemplate,
  generatePageIndexTemplate,
  generatePageTestTemplate,
  generateHookTemplate,
} from '../templates/generators/index.js';

export interface GenerateOptions {
  path?: string;
  withTest?: boolean;
  withStory?: boolean;
  route?: string;
  from?: string;
}

const BUILT_IN_GENERATORS = {
  component: generateComponent,
  'export-index': generateExportIndex,
  hook: generateHook,
  page: generatePage,
};

export async function generateCommand(
  kind: string,
  name: string,
  options: GenerateOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  // Try built-in generators first
  const builtInGenerator = BUILT_IN_GENERATORS[kind as keyof typeof BUILT_IN_GENERATORS];

  if (builtInGenerator) {
    return builtInGenerator(name, options, ctx);
  }

  // No plugin generators available yet
  const available = Object.keys(BUILT_IN_GENERATORS);

  return {
    message: `No generator found for '${kind}'. Available: ${available.join(', ')}`,
    status: 'error',
  };
}

function generateComponent(
  name: string,
  options: GenerateOptions,
  ctx: PluginContext
): CommandResult {
  const componentDir = join(ctx.cwd, options.path || 'src/components', name);

  if (existsSync(componentDir)) {
    return {
      message: `Component ${name} already exists`,
      status: 'error',
    };
  }

  mkdirSync(componentDir, { recursive: true });

  const componentFile = generateComponentTemplate({ name });
  const indexFile = generateComponentIndexTemplate({ name });

  writeFileSync(join(componentDir, `${name}.tsx`), componentFile);
  writeFileSync(join(componentDir, 'index.ts'), indexFile);

  const filesCreated = [join(componentDir, `${name}.tsx`), join(componentDir, 'index.ts')];

  // Generate test if requested
  if (options.withTest) {
    const testFile = generateComponentTestTemplate({ name });
    writeFileSync(join(componentDir, `${name}.test.tsx`), testFile);
    filesCreated.push(join(componentDir, `${name}.test.tsx`));
    ctx.logger.success('Test file created');
  }

  // Generate story if requested
  if (options.withStory) {
    const storyFile = generateComponentStoryTemplate({ name });
    writeFileSync(join(componentDir, `${name}.stories.tsx`), storyFile);
    filesCreated.push(join(componentDir, `${name}.stories.tsx`));
    ctx.logger.success('Story file created');
  }

  ctx.logger.success(`Component ${name} created at ${componentDir}`);

  return {
    data: { filesCreated, path: componentDir },
    message: `Component ${name} generated`,
    status: 'ok',
  };
}

function generatePage(name: string, options: GenerateOptions, ctx: PluginContext): CommandResult {
  const pageDir = join(ctx.cwd, options.path || 'src/pages', name);

  if (existsSync(pageDir)) {
    return {
      message: `Page ${name} already exists`,
      status: 'error',
    };
  }

  mkdirSync(pageDir, { recursive: true });

  const route = options.route || `/${name.toLowerCase()}`;

  const pageFile = generatePageTemplate({ name, route });
  const indexFile = generatePageIndexTemplate({ name, route });

  writeFileSync(join(pageDir, `${name}Page.tsx`), pageFile);
  writeFileSync(join(pageDir, 'index.ts'), indexFile);

  const filesCreated = [join(pageDir, `${name}Page.tsx`), join(pageDir, 'index.ts')];

  // Generate test
  if (options.withTest) {
    const testFile = generatePageTestTemplate({ name, route });
    writeFileSync(join(pageDir, `${name}Page.test.tsx`), testFile);
    filesCreated.push(join(pageDir, `${name}Page.test.tsx`));
  }

  ctx.logger.success(`Page ${name} created at ${pageDir}`);
  ctx.logger.info(`Route: ${route}`);

  return {
    data: { filesCreated, path: pageDir, route },
    message: `Page ${name} generated`,
    status: 'ok',
  };
}

function generateHook(name: string, options: GenerateOptions, ctx: PluginContext): CommandResult {
  const hooksDir = join(ctx.cwd, options.path || 'src/hooks');
  const hookFile = join(hooksDir, `${name}.ts`);

  if (existsSync(hookFile)) {
    return {
      message: `Hook ${name} already exists`,
      status: 'error',
    };
  }

  mkdirSync(hooksDir, { recursive: true });

  const hookContent = generateHookTemplate({ name });

  writeFileSync(hookFile, hookContent);

  ctx.logger.success(`Hook ${name} created at ${hookFile}`);

  return {
    data: { path: hookFile },
    message: `Hook ${name} generated`,
    status: 'ok',
  };
}

function generateExportIndex(
  _name: string,
  options: GenerateOptions,
  ctx: PluginContext
): CommandResult {
  const targetDir = join(ctx.cwd, options.path || 'src/components');

  if (!existsSync(targetDir)) {
    return {
      message: `Directory ${targetDir} does not exist`,
      status: 'error',
    };
  }

  const entries = readdirSync(targetDir, { withFileTypes: true });
  const exports: string[] = [];

  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      exports.push(`export * from './${entry.name}';`);
    }
  }

  const indexPath = join(targetDir, 'index.ts');
  writeFileSync(indexPath, exports.join('\n') + '\n');

  ctx.logger.success(`Export index created at ${indexPath}`);
  ctx.logger.info(`Exported ${exports.length} modules`);

  return {
    data: { exports: exports.length, path: indexPath },
    message: `Export index generated with ${exports.length} exports`,
    status: 'ok',
  };
}
