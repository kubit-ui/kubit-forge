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
  BundlerType,
  BundlerValidationResult,
  CommandResult,
  PluginContext,
} from '../types/index.js';

/**
 * Rspack Bundler Adapter
 * Rspack is a fast Rust-based bundler compatible with Webpack
 */
export class RspackAdapter implements BundlerAdapter {
  readonly name: BundlerType = 'rspack';
  readonly version = '1.1.7'; // Latest stable version (Feb 2026)
  readonly capabilities: BundlerCapability = {
    assets: true,
    codesplitting: true,
    css: true,
    devServer: true,
    hmr: true,
    minification: true,
    preview: false,
    react: true,
    sourcemaps: true,
    treeshaking: true,
    typescript: true,
  };

  async detect(cwd: string): Promise<boolean> {
    return (
      existsSync(join(cwd, 'rspack.config.js')) ||
      existsSync(join(cwd, 'rspack.config.ts')) ||
      existsSync(join(cwd, 'rspack.config.mjs'))
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
      // 1. Create rspack config
      const configPath = join(ctx.cwd, typescript ? 'rspack.config.ts' : 'rspack.config.js');
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
      const deps = ['@rspack/core@^1.1.7', '@rspack/cli@^1.1.7'];

      if (react) {
        deps.push('@rspack/plugin-react-refresh@^1.0.0');
      }

      if (typescript) {
        deps.push('@types/node@^22.10.2');
      }

      dependenciesInstalled.push(...deps);

      // 3. Add scripts to package.json
      const packageJsonPath = join(ctx.cwd, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        packageJson.scripts = packageJson.scripts || {};

        const scripts = {
          build: 'rspack build',
          dev: 'rspack serve',
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
        bundler: 'rspack',
        configFile: configPath,
        dependenciesInstalled,
        filesCreated,
        message: 'Rspack installed successfully',
        scriptsAdded,
        success: true,
      };
    } catch (error) {
      return {
        bundler: 'rspack',
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

    const config = `const path = require('path');
const rspack = require('@rspack/core');
${react ? "const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');" : ''}

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/index.${typescript ? 'tsx' : 'jsx'}',
  output: {
    path: path.resolve(__dirname, '${outDir}'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    assetModuleFilename: 'assets/[name].[hash:8][ext]',
    clean: true,
    publicPath: '/',
  },
  resolve: {
    extensions: [${typescript ? "'.ts', '.tsx', " : ''}'.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  module: {
    rules: [
      {
        test: /\\.(${typescript ? 'ts|tsx|' : ''}js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: '${typescript ? 'typescript' : 'ecmascript'}',
                ${typescript ? 'tsx: true,' : ''}
                ${react ? 'jsx: true,' : ''}
              },
              transform: {
                react: {
                  runtime: 'automatic',
                  ${react ? "development: process.env.NODE_ENV === 'development'," : ''}
                  refresh: ${react ? "process.env.NODE_ENV === 'development'" : 'false'},
                },
              },
            },
          },
        },
      },
      {
        test: /\\.css$/,
        use: [
          {
            loader: 'builtin:lightningcss-loader',
            options: {
              targets: 'defaults',
            },
          },
        ],
        type: 'css',
      },
      {
        test: /\\.(png|svg|jpg|jpeg|gif|webp|avif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new rspack.HtmlRspackPlugin({
      template: './index.html',
      inject: true,
      minify: process.env.NODE_ENV === 'production',
    }),
    ${react ? "process.env.NODE_ENV === 'development' && new ReactRefreshPlugin()," : ''}
  ].filter(Boolean),
  devServer: {
    port: ${port},
    hot: true,
    open: true,
    historyApiFallback: true,
    compress: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  devtool: ${sourcemap ? "process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-source-map'" : 'false'},
  optimization: {
    minimize: ${minify},
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          priority: 10,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
  experiments: {
    css: true,
  },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
};
`;

    return config;
  }

  async updateConfig(cwd: string, updates: Partial<BundlerConfigOptions>): Promise<void> {
    const configPath = this.getConfigPath(cwd);
    if (!existsSync(configPath)) {
      throw new Error('Rspack config not found');
    }

    console.log('Updating Rspack config:', updates);
  }

  async dev(ctx: PluginContext, options: BundlerDevOptions): Promise<CommandResult> {
    const args: string[] = ['serve'];

    if (options.port) {
      args.push('--port', options.port.toString());
    }
    if (options.host) {
      args.push('--host', options.host);
    }
    if (options.open) {
      args.push('--open');
    }

    return await ctx.runner.run('rspack', args);
  }

  async build(ctx: PluginContext, options: BundlerBuildOptions): Promise<CommandResult> {
    const args: string[] = ['build'];

    if (options.mode) {
      args.push('--mode', options.mode);
    }
    if (options.watch) {
      args.push('--watch');
    }

    return await ctx.runner.run('rspack', args);
  }

  getConfigPath(cwd: string): string {
    if (existsSync(join(cwd, 'rspack.config.ts'))) {
      return join(cwd, 'rspack.config.ts');
    }
    if (existsSync(join(cwd, 'rspack.config.js'))) {
      return join(cwd, 'rspack.config.js');
    }
    if (existsSync(join(cwd, 'rspack.config.mjs'))) {
      return join(cwd, 'rspack.config.mjs');
    }
    return join(cwd, 'rspack.config.js');
  }

  async validateConfig(cwd: string): Promise<BundlerValidationResult> {
    const configPath = this.getConfigPath(cwd);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!existsSync(configPath)) {
      errors.push('Rspack config file not found');
      return { errors, valid: false, warnings };
    }

    const packageJsonPath = join(cwd, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (!allDeps['@rspack/core']) {
        errors.push('@rspack/core is not installed in package.json');
      }
      if (!allDeps['@rspack/cli']) {
        warnings.push('@rspack/cli is recommended');
      }
    }

    return {
      errors,
      valid: errors.length === 0,
      warnings,
    };
  }
}
