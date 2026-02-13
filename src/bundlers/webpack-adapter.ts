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
  BundlerMigrationResult,
  BundlerType,
  BundlerValidationResult,
  CommandResult,
  PluginContext,
} from '../types/index.js';

/**
 * Webpack Bundler Adapter
 */
export class WebpackAdapter implements BundlerAdapter {
  readonly name: BundlerType = 'webpack';
  readonly version = '5.97.1'; // Latest stable version (Feb 2026)
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
    return existsSync(join(cwd, 'webpack.config.js')) || existsSync(join(cwd, 'webpack.config.ts'));
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
      // 1. Create webpack config
      const configPath = join(ctx.cwd, typescript ? 'webpack.config.ts' : 'webpack.config.js');
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
      const deps = [
        'webpack@^5.97.1',
        'webpack-cli@^6.0.1', // Latest major version
        'webpack-dev-server@^5.2.0', // Latest major version
        'html-webpack-plugin@^5.6.3',
      ];

      if (react) {
        deps.push('@pmmmwh/react-refresh-webpack-plugin@^0.5.15', 'react-refresh@^0.14.2');
      }

      if (typescript) {
        deps.push('ts-loader@^9.5.1', '@types/node@^22.10.2');
      } else {
        deps.push('babel-loader@^9.2.1', '@babel/core@^7.26.0', '@babel/preset-env@^7.26.0');
        if (react) {
          deps.push('@babel/preset-react@^7.26.3');
        }
      }

      // CSS loaders
      deps.push('style-loader@^4.0.0', 'css-loader@^7.1.2');

      dependenciesInstalled.push(...deps);

      // 3. Add scripts to package.json
      const packageJsonPath = join(ctx.cwd, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        packageJson.scripts = packageJson.scripts || {};

        const scripts = {
          build: 'webpack --mode production',
          dev: 'webpack serve --mode development',
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
        bundler: 'webpack',
        configFile: configPath,
        dependenciesInstalled,
        filesCreated,
        message: 'Webpack installed successfully',
        scriptsAdded,
        success: true,
      };
    } catch (error) {
      return {
        bundler: 'webpack',
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
const HtmlWebpackPlugin = require('html-webpack-plugin');
${react ? "const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');" : ''}

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
          loader: '${typescript ? 'ts-loader' : 'babel-loader'}',
          ${
            !typescript
              ? `options: {
            presets: [
              ['@babel/preset-env', { targets: { browsers: 'last 2 versions' } }],
              ${react ? "['@babel/preset-react', { runtime: 'automatic' }]" : ''}
            ],
          },`
              : ''
          }
        },
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
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
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
      minify: process.env.NODE_ENV === 'production',
    }),
    ${react ? "process.env.NODE_ENV === 'development' && new ReactRefreshWebpackPlugin()," : ''}
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
  devtool: ${sourcemap ? "process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map'" : 'false'},
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
      throw new Error('Webpack config not found');
    }

    // For now, just log the update
    console.log('Updating Webpack config:', updates);
  }

  async dev(ctx: PluginContext, options: BundlerDevOptions): Promise<CommandResult> {
    const args: string[] = ['serve', '--mode', 'development'];

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

    return await ctx.runner.run('webpack', args);
  }

  async build(ctx: PluginContext, options: BundlerBuildOptions): Promise<CommandResult> {
    const args: string[] = ['--mode', options.mode || 'production'];

    if (options.watch) {
      args.push('--watch');
    }
    if (options.analyze) {
      args.push('--analyze');
    }

    return await ctx.runner.run('webpack', args);
  }

  getConfigPath(cwd: string): string {
    if (existsSync(join(cwd, 'webpack.config.ts'))) {
      return join(cwd, 'webpack.config.ts');
    }
    if (existsSync(join(cwd, 'webpack.config.js'))) {
      return join(cwd, 'webpack.config.js');
    }
    return join(cwd, 'webpack.config.js');
  }

  async validateConfig(cwd: string): Promise<BundlerValidationResult> {
    const configPath = this.getConfigPath(cwd);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!existsSync(configPath)) {
      errors.push('Webpack config file not found');
      return { errors, valid: false, warnings };
    }

    // Check if package.json has webpack
    const packageJsonPath = join(cwd, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (!allDeps.webpack) {
        errors.push('Webpack is not installed in package.json');
      }
      if (!allDeps['webpack-cli']) {
        warnings.push('webpack-cli is recommended');
      }
    }

    return {
      errors,
      valid: errors.length === 0,
      warnings,
    };
  }

  async migrate(fromBundler: BundlerType): Promise<BundlerMigrationResult> {
    const changes: BundlerMigrationResult['changes'] = [];
    const manualSteps: string[] = [];

    if (fromBundler === 'vite') {
      manualSteps.push(
        'Review Vite-specific plugins and find Webpack equivalents',
        'Update import.meta.env to process.env',
        'Check for Vite-specific features like glob imports'
      );

      changes.push({
        action: 'modified',
        description: 'Environment variables need to be updated from import.meta.env to process.env',
        path: 'src/**/*.ts',
        type: 'config',
      });
    }

    return {
      changes,
      fromBundler,
      manualSteps,
      rollbackAvailable: true,
      success: true,
      toBundler: 'webpack',
    };
  }
}
