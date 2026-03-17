/**
 * Plugin Templates
 */

export interface PluginTemplateParams {
  pluginName: string;
  name: string;
  description: string;
  author: string;
  year: number;
}

/**
 * Generate plugin package.json
 */
export function generatePluginPackageJson(params: PluginTemplateParams) {
  const { pluginName, description, author } = params;

  return {
    name: pluginName,
    version: '0.1.0',
    description: description || `Kubit CLI plugin: ${params.name}`,
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    type: 'module',
    keywords: ['kubit-forge', 'plugin'],
    author: author || '',
    license: 'MIT',
    peerDependencies: {
      'kubit-forge': '^1.0.0',
    },
    devDependencies: {
      'kubit-forge': '^1.0.0',
      typescript: '^5.3.3',
      tsup: '^8.0.1',
    },
    scripts: {
      build: 'tsup',
      dev: 'tsup --watch',
      prepublishOnly: 'npm run build',
    },
    files: ['dist', 'README.md', 'LICENSE'],
  };
}

/**
 * Generate plugin tsconfig.json
 */
export function generatePluginTsConfig() {
  return {
    extends: '../../tsconfig.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src',
      declaration: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };
}

/**
 * Generate plugin tsup.config.ts
 */
export function generatePluginTsupConfig(): string {
  return `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2022',
});
`;
}

/**
 * Generate plugin manifest (kubit.plugin.json)
 */
export function generatePluginManifest(params: PluginTemplateParams) {
  const { pluginName, name, description, author } = params;

  return {
    name: pluginName,
    version: '0.1.0',
    description: description || `Kubit CLI plugin: ${name}`,
    author: author || '',
    capabilities: ['fs:read', 'fs:write', 'shell:run'],
    hooks: ['before:dev', 'after:build'],
    commands: [],
    generators: [],
    providers: [],
  };
}

/**
 * Generate plugin index.ts
 */
export function generatePluginIndexTemplate(params: PluginTemplateParams): string {
  const { pluginName } = params;

  return `import type { Plugin, PluginContext } from 'kubit-forge';

export const plugin: Plugin = {
  name: '${pluginName}',
  version: '0.1.0',

  async setup(ctx: PluginContext) {
    ctx.logger.info('Plugin ${pluginName} loaded');

    // Register hooks
    // ctx.hooks.on('before:dev', async () => {
    //   ctx.logger.step('Running before:dev hook');
    // });

    // Register commands
    // ctx.commands.register({
    //   name: 'my-command',
    //   description: 'My custom command',
    //   async execute(args, ctx) {
    //     ctx.logger.success('Command executed!');
    //     return { status: 'ok', message: 'Success' };
    //   },
    // });

    // Register generators
    // ctx.generators.register({
    //   name: 'my-generator',
    //   description: 'Generate something',
    //   async generate(name, options, ctx) {
    //     ctx.logger.step(\`Generating \${name}...\`);
    //     return { status: 'ok', message: 'Generated' };
    //   },
    // });
  },

  async teardown(ctx: PluginContext) {
    ctx.logger.debug('Plugin ${pluginName} unloaded');
  },
};

export default plugin;
`;
}

/**
 * Generate plugin README.md
 */
export function generatePluginReadmeTemplate(params: PluginTemplateParams): string {
  const { pluginName, name, description } = params;

  return `# ${pluginName}

${description || 'A Kubit CLI plugin'}

## Installation

\`\`\`bash
npm install ${pluginName}
\`\`\`

## Usage

Add to your \`kubit.config.toml\`:

\`\`\`toml
[plugins]
enabled = ["${pluginName}"]
\`\`\`

## Features

- Feature 1
- Feature 2

## Configuration

\`\`\`toml
[plugins.config.${name}]
option1 = "value1"
\`\`\`

## API

### Commands

- \`kubit my-command\` - Description

### Generators

- \`kubit generate my-generator <name>\` - Description

### Hooks

- \`before:dev\` - Runs before dev server starts
- \`after:build\` - Runs after build completes

## License

MIT
`;
}

/**
 * Generate plugin LICENSE
 */
export function generatePluginLicenseTemplate(params: PluginTemplateParams): string {
  const { author, year } = params;

  return `MIT License

Copyright (c) ${year} ${author || 'Plugin Author'}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

/**
 * Generate plugin .gitignore
 */
export function generatePluginGitignoreTemplate(): string {
  return `node_modules
dist
*.log
.DS_Store
`;
}
