import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import type { Logger } from '../types/index.js';

export interface PerformanceAudit {
  score: number;
  metrics: PerformanceMetrics;
  checks: AuditCheck[];
  recommendations: string[];
}

export interface PerformanceMetrics {
  buildTime?: number;
  bundleSize: number;
  dependencies: DependencyMetrics;
  codeQuality: CodeQualityMetrics;
}

export interface DependencyMetrics {
  total: number;
  outdated: number;
  vulnerable: number;
  duplicates: number;
}

export interface CodeQualityMetrics {
  lintErrors: number;
  typeErrors: number;
  testCoverage: number;
  complexity: number;
}

export interface AuditCheck {
  category: 'performance' | 'security' | 'quality' | 'dependencies';
  name: string;
  status: 'pass' | 'warn' | 'fail';
  score: number;
  message: string;
  impact: 'low' | 'medium' | 'high';
  solution?: string;
}

export class PerformanceAuditor {
  constructor(
    private readonly cwd: string,
    private readonly logger: Logger
  ) {}

  async audit(): Promise<PerformanceAudit> {
    this.logger.step('Running performance audit...');

    const checks: AuditCheck[] = [];

    // Run all checks
    checks.push(await this.checkBundleSize());
    checks.push(await this.checkDependencies());
    checks.push(await this.checkBuildConfig());
    checks.push(await this.checkCodeSplitting());
    checks.push(await this.checkTreeShaking());
    checks.push(await this.checkSourceMaps());
    checks.push(await this.checkCompression());
    checks.push(await this.checkCaching());
    checks.push(await this.checkLazyLoading());
    checks.push(await this.checkImageOptimization());

    // Calculate overall score
    const totalScore = checks.reduce((sum, check) => sum + check.score, 0);
    const score = Math.round(totalScore / checks.length);

    // Generate metrics
    const metrics = await this.collectMetrics();

    // Generate recommendations
    const recommendations = this.generateRecommendations(checks);

    return {
      checks,
      metrics,
      recommendations,
      score,
    };
  }

  private async checkBundleSize(): Promise<AuditCheck> {
    const distPath = join(this.cwd, 'dist');

    if (!existsSync(distPath)) {
      return {
        category: 'performance',
        impact: 'medium',
        message: 'No build output found',
        name: 'Bundle Size',
        score: 50,
        solution: 'Run build command first',
        status: 'warn',
      };
    }

    // Simplified check - in production would analyze actual bundle
    const packageJsonPath = join(this.cwd, 'package.json');
    const hasSizeLimit = existsSync(packageJsonPath)
      ? readFileSync(packageJsonPath, 'utf-8').includes('size-limit')
      : false;

    if (hasSizeLimit) {
      return {
        category: 'performance',
        impact: 'high',
        message: 'Bundle size monitoring configured',
        name: 'Bundle Size',
        score: 100,
        status: 'pass',
      };
    }

    return {
      category: 'performance',
      impact: 'high',
      message: 'No bundle size monitoring',
      name: 'Bundle Size',
      score: 70,
      solution: 'Add size-limit package to monitor bundle size',
      status: 'warn',
    };
  }

  private async checkDependencies(): Promise<AuditCheck> {
    const packageJsonPath = join(this.cwd, 'package.json');

    if (!existsSync(packageJsonPath)) {
      return {
        category: 'dependencies',
        impact: 'high',
        message: 'No package.json found',
        name: 'Dependencies',
        score: 0,
        status: 'fail',
      };
    }

    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const depCount =
      Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length;

    if (depCount > 100) {
      return {
        category: 'dependencies',
        impact: 'medium',
        message: `Large number of dependencies (${depCount})`,
        name: 'Dependencies',
        score: 60,
        solution: 'Review and remove unused dependencies',
        status: 'warn',
      };
    }

    return {
      category: 'dependencies',
      impact: 'medium',
      message: `${depCount} dependencies (healthy)`,
      name: 'Dependencies',
      score: 100,
      status: 'pass',
    };
  }

  private async checkBuildConfig(): Promise<AuditCheck> {
    const viteConfigPath = join(this.cwd, 'vite.config.ts');
    const webpackConfigPath = join(this.cwd, 'webpack.config.js');

    const hasVite = existsSync(viteConfigPath);
    const hasWebpack = existsSync(webpackConfigPath);

    if (!hasVite && !hasWebpack) {
      return {
        category: 'performance',
        impact: 'medium',
        message: 'No build config found',
        name: 'Build Configuration',
        score: 50,
        status: 'warn',
      };
    }

    if (hasVite) {
      const config = readFileSync(viteConfigPath, 'utf-8');
      const hasOptimizations =
        config.includes('build.target') ||
        config.includes('build.minify') ||
        config.includes('build.rollupOptions');

      if (hasOptimizations) {
        return {
          category: 'performance',
          impact: 'high',
          message: 'Build optimizations configured',
          name: 'Build Configuration',
          score: 100,
          status: 'pass',
        };
      }

      return {
        category: 'performance',
        impact: 'high',
        message: 'Build config could be optimized',
        name: 'Build Configuration',
        score: 70,
        solution: 'Add build.target, minify, and rollupOptions',
        status: 'warn',
      };
    }

    return {
      category: 'performance',
      impact: 'high',
      message: 'Build config present',
      name: 'Build Configuration',
      score: 80,
      status: 'pass',
    };
  }

  private async checkCodeSplitting(): Promise<AuditCheck> {
    const viteConfigPath = join(this.cwd, 'vite.config.ts');

    if (!existsSync(viteConfigPath)) {
      return {
        category: 'performance',
        impact: 'high',
        message: 'Cannot verify code splitting',
        name: 'Code Splitting',
        score: 50,
        status: 'warn',
      };
    }

    const config = readFileSync(viteConfigPath, 'utf-8');
    const hasCodeSplitting =
      config.includes('manualChunks') || config.includes('rollupOptions.output');

    if (hasCodeSplitting) {
      return {
        category: 'performance',
        impact: 'high',
        message: 'Code splitting configured',
        name: 'Code Splitting',
        score: 100,
        status: 'pass',
      };
    }

    return {
      category: 'performance',
      impact: 'high',
      message: 'No code splitting detected',
      name: 'Code Splitting',
      score: 60,
      solution: 'Configure manual chunks in rollupOptions',
      status: 'warn',
    };
  }

  private async checkTreeShaking(): Promise<AuditCheck> {
    const packageJsonPath = join(this.cwd, 'package.json');

    if (!existsSync(packageJsonPath)) {
      return {
        category: 'performance',
        impact: 'medium',
        message: 'Cannot verify tree shaking',
        name: 'Tree Shaking',
        score: 50,
        status: 'warn',
      };
    }

    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    if (pkg.sideEffects === false || Array.isArray(pkg.sideEffects)) {
      return {
        category: 'performance',
        impact: 'medium',
        message: 'Tree shaking enabled',
        name: 'Tree Shaking',
        score: 100,
        status: 'pass',
      };
    }

    return {
      category: 'performance',
      impact: 'medium',
      message: 'Tree shaking not optimized',
      name: 'Tree Shaking',
      score: 70,
      solution: 'Add "sideEffects": false to package.json',
      status: 'warn',
    };
  }

  private async checkSourceMaps(): Promise<AuditCheck> {
    const viteConfigPath = join(this.cwd, 'vite.config.ts');

    if (!existsSync(viteConfigPath)) {
      return {
        category: 'quality',
        impact: 'low',
        message: 'Cannot verify source maps',
        name: 'Source Maps',
        score: 50,
        status: 'warn',
      };
    }

    const config = readFileSync(viteConfigPath, 'utf-8');
    const hasSourceMaps = config.includes('sourcemap');

    if (hasSourceMaps) {
      return {
        category: 'quality',
        impact: 'low',
        message: 'Source maps configured',
        name: 'Source Maps',
        score: 100,
        status: 'pass',
      };
    }

    return {
      category: 'quality',
      impact: 'low',
      message: 'Source maps not configured',
      name: 'Source Maps',
      score: 70,
      solution: 'Enable sourcemap in build config',
      status: 'warn',
    };
  }

  private async checkCompression(): Promise<AuditCheck> {
    // Check for compression plugins or server config
    const viteConfigPath = join(this.cwd, 'vite.config.ts');

    if (existsSync(viteConfigPath)) {
      const config = readFileSync(viteConfigPath, 'utf-8');
      const hasCompression =
        config.includes('vite-plugin-compression') || config.includes('compression');

      if (hasCompression) {
        return {
          category: 'performance',
          impact: 'high',
          message: 'Compression plugin configured',
          name: 'Compression',
          score: 100,
          status: 'pass',
        };
      }
    }

    return {
      category: 'performance',
      impact: 'high',
      message: 'No compression plugin detected',
      name: 'Compression',
      score: 60,
      solution: 'Add vite-plugin-compression for gzip/brotli',
      status: 'warn',
    };
  }

  private async checkCaching(): Promise<AuditCheck> {
    const viteConfigPath = join(this.cwd, 'vite.config.ts');

    if (existsSync(viteConfigPath)) {
      const config = readFileSync(viteConfigPath, 'utf-8');
      const hasCaching =
        config.includes('cacheDir') || config.includes('build.rollupOptions.output.entryFileNames');

      if (hasCaching) {
        return {
          category: 'performance',
          impact: 'medium',
          message: 'Caching configured',
          name: 'Caching Strategy',
          score: 100,
          status: 'pass',
        };
      }
    }

    return {
      category: 'performance',
      impact: 'medium',
      message: 'Caching could be improved',
      name: 'Caching Strategy',
      score: 70,
      solution: 'Configure content hashing for assets',
      status: 'warn',
    };
  }

  private async checkLazyLoading(): Promise<AuditCheck> {
    // Check for dynamic imports in source files
    const srcPath = join(this.cwd, 'src');

    if (!existsSync(srcPath)) {
      return {
        category: 'performance',
        impact: 'high',
        message: 'Cannot verify lazy loading',
        name: 'Lazy Loading',
        score: 50,
        status: 'warn',
      };
    }

    // Simplified check - would need to scan actual source files
    return {
      category: 'performance',
      impact: 'high',
      message: 'Consider lazy loading for routes',
      name: 'Lazy Loading',
      score: 80,
      solution: 'Use dynamic imports for route components',
      status: 'pass',
    };
  }

  private async checkImageOptimization(): Promise<AuditCheck> {
    const viteConfigPath = join(this.cwd, 'vite.config.ts');

    if (existsSync(viteConfigPath)) {
      const config = readFileSync(viteConfigPath, 'utf-8');
      const hasImageOptimization =
        config.includes('vite-plugin-image') || config.includes('imagetools');

      if (hasImageOptimization) {
        return {
          category: 'performance',
          impact: 'medium',
          message: 'Image optimization configured',
          name: 'Image Optimization',
          score: 100,
          status: 'pass',
        };
      }
    }

    return {
      category: 'performance',
      impact: 'medium',
      message: 'No image optimization detected',
      name: 'Image Optimization',
      score: 60,
      solution: 'Add vite-plugin-imagetools for automatic optimization',
      status: 'warn',
    };
  }

  private async collectMetrics(): Promise<PerformanceMetrics> {
    const packageJsonPath = join(this.cwd, 'package.json');
    let depCount = 0;

    if (existsSync(packageJsonPath)) {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      depCount =
        Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length;
    }

    return {
      bundleSize: 0, // Would be calculated from actual bundle
      codeQuality: {
        complexity: 0,
        lintErrors: 0,
        testCoverage: 0,
        typeErrors: 0,
      },
      dependencies: {
        duplicates: 0,
        outdated: 0,
        total: depCount,
        vulnerable: 0,
      },
    };
  }

  private generateRecommendations(checks: AuditCheck[]): string[] {
    const recommendations: string[] = [];
    const failedChecks = checks.filter((c) => c.status === 'fail' || c.status === 'warn');

    // Prioritize by impact
    const highImpact = failedChecks.filter((c) => c.impact === 'high');
    const mediumImpact = failedChecks.filter((c) => c.impact === 'medium');

    for (const check of [...highImpact, ...mediumImpact]) {
      if (check.solution) {
        recommendations.push(`[${check.impact.toUpperCase()}] ${check.name}: ${check.solution}`);
      }
    }

    return recommendations;
  }

  displayAudit(audit: PerformanceAudit): void {
    this.logger.info('');
    this.logger.info('═'.repeat(60));
    this.logger.info('Performance Audit Report');
    this.logger.info('═'.repeat(60));
    this.logger.info('');

    // Overall score
    this.logger.info(`Overall Score: ${audit.score}/100`);
    this.logger.info('');

    // Checks by category
    const categories = ['performance', 'security', 'quality', 'dependencies'] as const;

    for (const category of categories) {
      const categoryChecks = audit.checks.filter((c) => c.category === category);
      if (categoryChecks.length === 0) {
        continue;
      }

      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      this.logger.info(`${categoryName}:`);

      for (const check of categoryChecks) {
        const icon = check.status === 'pass' ? '✔' : check.status === 'warn' ? '⚠' : '✖';
        const color =
          check.status === 'pass' ? 'success' : check.status === 'warn' ? 'warn' : 'error';

        const message = `  ${icon} ${check.name}: ${check.message} (${check.score}/100)`;

        if (color === 'success') {
          this.logger.success(message);
        } else if (color === 'warn') {
          this.logger.warn(message);
        } else {
          this.logger.error(message);
        }

        if (check.solution) {
          this.logger.info(`     → ${check.solution}`);
        }
      }
      this.logger.info('');
    }

    // Recommendations
    if (audit.recommendations.length > 0) {
      this.logger.info('💡 Priority Recommendations:');
      for (const rec of audit.recommendations) {
        this.logger.info(`  • ${rec}`);
      }
      this.logger.info('');
    }

    this.logger.info('═'.repeat(60));

    if (audit.score >= 90) {
      this.logger.success('✨ Excellent performance! Keep up the good work!');
    } else if (audit.score >= 70) {
      this.logger.warn('⚠️  Good performance, but there is room for improvement.');
    } else {
      this.logger.error('❌ Performance needs attention. Please address the issues above.');
    }

    this.logger.info('═'.repeat(60));
  }
}
