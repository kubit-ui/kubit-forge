import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import type {
  BundlerAdapter,
  BundlerBuildOptions,
  BundlerCapability,
  BundlerConfigOptions,
  BundlerDevOptions,
  BundlerInstallOptions,
  BundlerInstallResult,
  BundlerPreviewOptions,
  BundlerType,
  BundlerValidationResult,
  CommandResult,
  PluginContext,
} from '../types/index.js';

/**
 * Vite Bundler Adapter
 */
export class ViteAdapter implements BundlerAdapter {
  readonly name: BundlerType = 'vite';
  readonly version = '6.0.3'; // Latest stable version (Feb 2026)
  readonly capabilities: BundlerCapability = {
    assets: true,
    codesplitting: true,
    css: true,
    devServer: true,
    hmr: true,
    minification: true,
    preview: true,
    react: true,
    sourcemaps: true,
    treeshaking: true,
    typescript: true,
  };

  async detect(cwd: string): Promise<boolean> {
    return (
      existsSync(join(cwd, 'vite.config.ts')) ||
      existsSync(join(cwd, 'vite.config.js')) ||
      existsSync(join(cwd, 'vite.config.mts'))
    );
  }

  async install(
    ctx: PluginContext,
    options?: BundlerInstallOptions
  ): Promise<BundlerInstallResult> {
    const { react = false, typescript = true } = options || {};

    const filesCreated: string[] = [];
    const dependenciesInstalled: string[] = [];
    const scriptsAdded: string[] = [];

    try {
      // 1. Create vite config
      const configPath = join(ctx.cwd, typescript ? 'vite.config.ts' : 'vite.config.js');
      const configContent = this.generateConfig({
        minify: true,
        outDir: 'dist',
        port: ctx.config.project.devPort,
        projectName: ctx.config.project.name,
        react,
        sourcemap: true,
        typescript,
      });

      writeFileSync(configPath, configContent, 'utf-8');
      filesCreated.push(configPath);

      // 2. Install dependencies
      const deps = ['vite@^6.0.3'];
      if (react) {
        deps.push('@vitejs/plugin-react@^4.3.4'); // Latest with Vite 6 support
      }
      if (typescript) {
        deps.push('@types/node@^22.10.2'); // Latest LTS types
      }

      dependenciesInstalled.push(...deps);

      // 3. Add scripts to package.json
      const packageJsonPath = join(ctx.cwd, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        packageJson.scripts = packageJson.scripts || {};

        const scripts = {
          build: 'vite build',
          dev: 'vite',
          preview: 'vite preview',
        };

        for (const [name, command] of Object.entries(scripts)) {
          if (!packageJson.scripts[name]) {
            packageJson.scripts[name] = command;
            scriptsAdded.push(name);
          }
        }

        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
      }

      return {
        bundler: 'vite',
        configFile: configPath,
        dependenciesInstalled,
        filesCreated,
        message: 'Vite installed successfully',
        scriptsAdded,
        success: true,
      };
    } catch (error) {
      return {
        bundler: 'vite',
        configFile: '',
        dependenciesInstalled,
        errors: [error instanceof Error ? error.message : String(error)],
        filesCreated,
        scriptsAdded,
        success: false,
      };
    }
  }

  generateConfig(options: BundlerConfigOptions): string {
    const { minify, outDir, port, react, sourcemap, typescript } = options;

    const imports: string[] = ["import { defineConfig } from 'vite'"];
    const plugins: string[] = [];

    if (react) {
      imports.push("import react from '@vitejs/plugin-react'");
      plugins.push('react()');
    }

    const config = `${imports.join('\n')}

export default defineConfig({
  ${plugins.length > 0 ? `plugins: [${plugins.join(', ')}],` : ''}
  server: {
    port: ${port},
    open: true,
    host: true, // Listen on all addresses
    strictPort: false,
    cors: true,
  },
  build: {
    outDir: '${outDir}',
    sourcemap: ${sourcemap},
    minify: ${minify ? "'esbuild'" : 'false'},
    target: 'esnext', // Modern browsers
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  ${typescript ? "resolve: {\n    alias: {\n      '@': '/src',\n    },\n  }," : ''}
  optimizeDeps: {
    include: [${react ? "'react', 'react-dom'" : ''}],
  },
})
`;

    return config;
  }

  async updateConfig(cwd: string, updates: Partial<BundlerConfigOptions>): Promise<void> {
    const configPath = this.getConfigPath(cwd);
    if (!existsSync(configPath)) {
      throw new Error('Vite config not found');
    }

    // For now, just log the update
    // In a real implementation, we would parse and update the config
    console.log('Updating Vite config:', updates);
  }

  async dev(ctx: PluginContext, options: BundlerDevOptions): Promise<CommandResult> {
    const args: string[] = [];

    if (options.port) {
      args.push('--port', options.port.toString());
    }
    if (options.host) {
      args.push('--host', options.host);
    }
    if (options.open) {
      args.push('--open');
    }
    if (options.https) {
      args.push('--https');
    }
    if (options.cors) {
      args.push('--cors');
    }
    if (options.force) {
      args.push('--force');
    }

    return await ctx.runner.run('vite', args);
  }

  async build(ctx: PluginContext, options: BundlerBuildOptions): Promise<CommandResult> {
    const args: string[] = ['build'];

    if (options.mode) {
      args.push('--mode', options.mode);
    }
    if (options.sourcemap) {
      args.push('--sourcemap');
    }
    if (options.minify === false) {
      args.push('--minify', 'false');
    }
    if (options.outDir) {
      args.push('--outDir', options.outDir);
    }
    if (options.watch) {
      args.push('--watch');
    }

    return await ctx.runner.run('vite', args);
  }

  async preview(ctx: PluginContext, options: BundlerPreviewOptions): Promise<CommandResult> {
    const args: string[] = ['preview'];

    if (options.port) {
      args.push('--port', options.port.toString());
    }
    if (options.host) {
      args.push('--host', options.host);
    }
    if (options.open) {
      args.push('--open');
    }
    if (options.https) {
      args.push('--https');
    }

    return await ctx.runner.run('vite', args);
  }

  getConfigPath(cwd: string): string {
    if (existsSync(join(cwd, 'vite.config.ts'))) {
      return join(cwd, 'vite.config.ts');
    }
    if (existsSync(join(cwd, 'vite.config.js'))) {
      return join(cwd, 'vite.config.js');
    }
    if (existsSync(join(cwd, 'vite.config.mts'))) {
      return join(cwd, 'vite.config.mts');
    }
    return join(cwd, 'vite.config.ts');
  }

  async validateConfig(cwd: string): Promise<BundlerValidationResult> {
    const configPath = this.getConfigPath(cwd);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!existsSync(configPath)) {
      errors.push('Vite config file not found');
      return { errors, valid: false, warnings };
    }

    // Check if package.json has vite
    const packageJsonPath = join(cwd, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (!allDeps.vite) {
        errors.push('Vite is not installed in package.json');
      }
    }

    return {
      errors,
      valid: errors.length === 0,
      warnings,
    };
  }
}
