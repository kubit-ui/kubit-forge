import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { PluginContext, CommandResult } from '../types/index.js';

export interface UpgradeOptions {
  interactive?: boolean;
  from?: string;
  dryRun?: boolean;
  force?: boolean;
}

interface UpgradeStep {
  name: string;
  description: string;
  files: string[];
  execute: (ctx: PluginContext) => Promise<boolean>;
  reversible: boolean;
}

const UPGRADE_STEPS: UpgradeStep[] = [
  {
    description: 'Update ESLint to flat config format',
    async execute(ctx: PluginContext): Promise<boolean> {
      const oldConfig = join(ctx.cwd, '.eslintrc.json');
      const newConfig = join(ctx.cwd, 'eslint.config.js');

      if (!existsSync(oldConfig)) {
        ctx.logger.info('No legacy ESLint config found, skipping');
        return true;
      }

      const flatConfig = `import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
];
`;

      writeFileSync(newConfig, flatConfig);
      ctx.logger.success('Created eslint.config.js (flat config)');
      ctx.logger.warn('Review and delete .eslintrc.json manually if satisfied');

      return true;
    },
    files: ['.eslintrc.json', '.eslintrc.js', 'eslint.config.js'],
    name: 'eslint-config',
    reversible: true,
  },
  {
    description: 'Update Prettier config to latest best practices',
    async execute(ctx: PluginContext): Promise<boolean> {
      const configPath = join(ctx.cwd, '.prettierrc');

      const config = {
        arrowParens: 'always',
        endOfLine: 'lf',
        printWidth: 100,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
      };

      writeFileSync(configPath, JSON.stringify(config, null, 2));
      ctx.logger.success('Updated .prettierrc');

      return true;
    },
    files: ['.prettierrc', '.prettierrc.json', 'prettier.config.js'],
    name: 'prettier-config',
    reversible: true,
  },
  {
    description: 'Update TypeScript config to strict mode and latest features',
    async execute(ctx: PluginContext): Promise<boolean> {
      const tsconfigPath = join(ctx.cwd, 'tsconfig.json');

      if (!existsSync(tsconfigPath)) {
        ctx.logger.info('No tsconfig.json found, skipping');
        return true;
      }

      const existing = JSON.parse(readFileSync(tsconfigPath, 'utf-8'));

      // Merge with strict settings
      const updated = {
        ...existing,
        compilerOptions: {
          ...existing.compilerOptions,
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          forceConsistentCasingInFileNames: true,
          isolatedModules: true,
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          moduleResolution: 'bundler',
          noImplicitOverride: true,
          noUncheckedIndexedAccess: true,
          skipLibCheck: true,
          strict: true,
          target: 'ES2022',
          verbatimModuleSyntax: true,
        },
      };

      writeFileSync(tsconfigPath, JSON.stringify(updated, null, 2));
      ctx.logger.success('Updated tsconfig.json to strict mode');

      return true;
    },
    files: ['tsconfig.json'],
    name: 'tsconfig',
    reversible: true,
  },
  {
    description: 'Update Vite config to latest best practices',
    async execute(ctx: PluginContext): Promise<boolean> {
      const configPath = join(ctx.cwd, 'vite.config.ts');

      if (!existsSync(configPath)) {
        ctx.logger.info('No vite.config.ts found, skipping');
        return true;
      }

      let content = readFileSync(configPath, 'utf-8');

      // Add modern optimizations if not present
      if (!content.includes('build.target')) {
        content = content.replace(
          'export default defineConfig({',
          `export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
  },`
        );
      }

      writeFileSync(configPath, content);
      ctx.logger.success('Updated vite.config.ts');

      return true;
    },
    files: ['vite.config.ts', 'vite.config.js'],
    name: 'vite-config',
    reversible: true,
  },
  {
    description: 'Update package.json scripts and engines',
    async execute(ctx: PluginContext): Promise<boolean> {
      const pkgPath = join(ctx.cwd, 'package.json');

      if (!existsSync(pkgPath)) {
        return true;
      }

      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

      // Update engines
      pkg.engines = {
        ...pkg.engines,
        node: '>=20.0.0',
      };

      // Ensure type: module
      if (!pkg.type) {
        pkg.type = 'module';
      }

      writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
      ctx.logger.success('Updated package.json');

      return true;
    },
    files: ['package.json'],
    name: 'package-json',
    reversible: true,
  },
  {
    description: 'Update .gitignore with modern patterns',
    async execute(ctx: PluginContext): Promise<boolean> {
      const gitignorePath = join(ctx.cwd, '.gitignore');

      const patterns = [
        '# Dependencies',
        'node_modules',
        '',
        '# Build outputs',
        'dist',
        'build',
        '.cache',
        '',
        '# Environment',
        '.env.local',
        '.env.*.local',
        '',
        '# IDE',
        '.vscode/*',
        '!.vscode/extensions.json',
        '.idea',
        '*.swp',
        '*.swo',
        '',
        '# OS',
        '.DS_Store',
        'Thumbs.db',
        '',
        '# Testing',
        'coverage',
        '.nyc_output',
        '',
        '# Logs',
        '*.log',
        'npm-debug.log*',
        'yarn-debug.log*',
        'yarn-error.log*',
      ];

      if (existsSync(gitignorePath)) {
        const existing = readFileSync(gitignorePath, 'utf-8');
        const newPatterns = patterns.filter((p) => !existing.includes(p));

        if (newPatterns.length > 0) {
          writeFileSync(gitignorePath, existing + '\n' + newPatterns.join('\n'));
          ctx.logger.success('Updated .gitignore');
        }
      } else {
        writeFileSync(gitignorePath, patterns.join('\n'));
        ctx.logger.success('Created .gitignore');
      }

      return true;
    },
    files: ['.gitignore'],
    name: 'gitignore',
    reversible: false,
  },
];

export async function upgradeCommand(
  options: UpgradeOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  ctx.logger.step('Analyzing project for upgrades...');

  const applicableSteps: UpgradeStep[] = [];

  for (const step of UPGRADE_STEPS) {
    const hasRelevantFiles = step.files.some((file) => existsSync(join(ctx.cwd, file)));

    if (hasRelevantFiles || step.files.length === 0) {
      applicableSteps.push(step);
    }
  }

  if (applicableSteps.length === 0) {
    ctx.logger.success('Project is up to date!');
    return { message: 'No upgrades needed', status: 'ok' };
  }

  ctx.logger.info(`\nFound ${applicableSteps.length} upgrade(s) available:\n`);

  for (const step of applicableSteps) {
    ctx.logger.info(`  - ${step.name}: ${step.description}`);
  }

  if (options.dryRun) {
    ctx.logger.info('\n[DRY RUN] No changes made');
    return { message: 'Dry run completed', status: 'ok' };
  }

  // Interactive mode
  if (options.interactive) {
    ctx.logger.info('\nInteractive mode: Review each upgrade');
    // In a real implementation, use enquirer to prompt for each step
    ctx.logger.warn('Interactive mode requires manual confirmation (not implemented in this demo)');
  }

  // Execute upgrades
  const results: Array<{ step: string; success: boolean }> = [];

  for (const step of applicableSteps) {
    ctx.logger.step(`\nApplying: ${step.name}`);

    try {
      const success = await step.execute(ctx);
      results.push({ step: step.name, success });

      if (success) {
        ctx.logger.success(`✓ ${step.name} completed`);
      } else {
        ctx.logger.warn(`⚠ ${step.name} skipped`);
      }
    } catch (error) {
      ctx.logger.error(`✗ ${step.name} failed`, error as Error);
      results.push({ step: step.name, success: false });
    }
  }

  const successCount = results.filter((r) => r.success).length;

  ctx.logger.success(
    `\n✓ Upgrade completed: ${successCount}/${applicableSteps.length} steps applied`
  );

  if (successCount < applicableSteps.length) {
    ctx.logger.warn('Some upgrades were skipped or failed. Review the output above.');
  }

  return {
    data: { results },
    message: `Applied ${successCount} upgrades`,
    status: 'ok',
  };
}
