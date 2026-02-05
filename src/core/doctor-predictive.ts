/**
 * Doctor Predictive Diagnostics
 *
 * Predict potential issues before they occur based on project patterns
 */

import { existsSync, readFileSync, statSync, readdirSync } from 'fs';
import { join } from 'path';

import type { Logger } from '../types/index.js';

export interface PredictiveIssue {
  id: string;
  type: 'potential' | 'trend' | 'risk';
  category: 'performance' | 'security' | 'maintainability' | 'scalability';
  severity: 'low' | 'medium' | 'high';
  description: string;
  likelihood: number; // 0-100
  impact: number; // 0-100
  preventionSteps: string[];
  indicators: string[];
}

export interface ProjectMetrics {
  fileCount: number;
  totalSize: number;
  dependencyCount: number;
  devDependencyCount: number;
  scriptCount: number;
  configFiles: string[];
  lastModified: Date;
}

export class DoctorPredictive {
  private logger: Logger;
  private cwd: string;

  constructor(logger: Logger, cwd: string) {
    this.logger = logger;
    this.cwd = cwd;
  }

  /**
   * Analyze project and predict potential issues
   */
  async predictIssues(): Promise<PredictiveIssue[]> {
    const issues: PredictiveIssue[] = [];

    // Collect project metrics
    const metrics = await this.collectMetrics();

    // Predict based on different aspects
    issues.push(...(await this.predictPerformanceIssues(metrics)));
    issues.push(...(await this.predictSecurityIssues(metrics)));
    issues.push(...(await this.predictMaintainabilityIssues(metrics)));
    issues.push(...(await this.predictScalabilityIssues(metrics)));

    // Sort by risk score (likelihood * impact)
    return issues.sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact);
  }

  /**
   * Collect project metrics
   */
  private async collectMetrics(): Promise<ProjectMetrics> {
    const metrics: ProjectMetrics = {
      configFiles: [],
      dependencyCount: 0,
      devDependencyCount: 0,
      fileCount: 0,
      lastModified: new Date(0),
      scriptCount: 0,
      totalSize: 0,
    };

    try {
      // Count files and size
      const srcPath = join(this.cwd, 'src');
      if (existsSync(srcPath)) {
        const { count, lastModified, size } = this.countFiles(srcPath);
        metrics.fileCount = count;
        metrics.totalSize = size;
        metrics.lastModified = lastModified;
      }

      // Analyze package.json
      const pkgPath = join(this.cwd, 'package.json');
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
          scripts?: Record<string, string>;
        };

        metrics.dependencyCount = Object.keys(pkg.dependencies || {}).length;
        metrics.devDependencyCount = Object.keys(pkg.devDependencies || {}).length;
        metrics.scriptCount = Object.keys(pkg.scripts || {}).length;
      }

      // Detect config files
      const configPatterns = [
        'tsconfig.json',
        '.eslintrc.*',
        '.prettierrc',
        'jest.config.*',
        'vite.config.*',
        'webpack.config.*',
      ];

      for (const pattern of configPatterns) {
        if (pattern.includes('*')) {
          const base = pattern.split('*')[0];
          const files = readdirSync(this.cwd).filter((f) => f.startsWith(base));
          metrics.configFiles.push(...files);
        } else if (existsSync(join(this.cwd, pattern))) {
          metrics.configFiles.push(pattern);
        }
      }
    } catch (error) {
      this.logger.debug(`Error collecting metrics: ${error}`);
    }

    return metrics;
  }

  /**
   * Count files recursively
   */
  private countFiles(
    dir: string,
    count = 0,
    size = 0,
    lastModified = new Date(0)
  ): { count: number; size: number; lastModified: Date } {
    try {
      const files = readdirSync(dir);

      for (const file of files) {
        const filePath = join(dir, file);
        const stats = statSync(filePath);

        if (stats.isDirectory()) {
          if (file !== 'node_modules' && file !== '.git') {
            const result = this.countFiles(filePath, count, size, lastModified);
            count = result.count;
            size = result.size;
            lastModified = result.lastModified > lastModified ? result.lastModified : lastModified;
          }
        } else {
          count++;
          size += stats.size;
          lastModified = stats.mtime > lastModified ? stats.mtime : lastModified;
        }
      }
    } catch (error) {
      this.logger.debug(`Error counting files in ${dir}: ${error}`);
    }

    return { count, lastModified, size };
  }

  /**
   * Predict performance issues
   */
  private async predictPerformanceIssues(metrics: ProjectMetrics): Promise<PredictiveIssue[]> {
    const issues: PredictiveIssue[] = [];

    // Large bundle size risk
    if (metrics.dependencyCount > 50) {
      issues.push({
        category: 'performance',
        description: 'High number of dependencies may lead to large bundle sizes',
        id: 'large-bundle-risk',
        impact: 70,
        indicators: [`${metrics.dependencyCount} dependencies detected`],
        likelihood: Math.min(metrics.dependencyCount / 2, 100),
        preventionSteps: [
          'Audit dependencies regularly',
          'Use tree-shaking',
          'Consider code splitting',
          'Remove unused dependencies',
        ],
        severity: 'medium',
        type: 'risk',
      });
    }

    // Memory usage risk
    if (metrics.totalSize > 50 * 1024 * 1024) {
      // 50MB
      issues.push({
        category: 'performance',
        description: 'Large codebase may cause memory issues in development',
        id: 'memory-usage-risk',
        impact: 50,
        indicators: [`Total size: ${(metrics.totalSize / 1024 / 1024).toFixed(2)}MB`],
        likelihood: 60,
        preventionSteps: ['Optimize large files', 'Use lazy loading', 'Consider micro-frontends'],
        severity: 'medium',
        type: 'risk',
      });
    }

    // Build time risk
    if (metrics.fileCount > 500) {
      issues.push({
        category: 'performance',
        description: 'Growing file count may slow down build times',
        id: 'slow-build-risk',
        impact: 40,
        indicators: [`${metrics.fileCount} files in project`],
        likelihood: 70,
        preventionSteps: [
          'Use incremental builds',
          'Optimize build configuration',
          'Consider build caching',
        ],
        severity: 'low',
        type: 'trend',
      });
    }

    return issues;
  }

  /**
   * Predict security issues
   */
  private async predictSecurityIssues(metrics: ProjectMetrics): Promise<PredictiveIssue[]> {
    const issues: PredictiveIssue[] = [];

    // Dependency vulnerability risk
    if (metrics.dependencyCount > 30) {
      issues.push({
        category: 'security',
        description: 'More dependencies increase vulnerability surface area',
        id: 'dependency-vulnerability-risk',
        impact: 90,
        indicators: [
          `${metrics.dependencyCount} production dependencies`,
          `${metrics.devDependencyCount} dev dependencies`,
        ],
        likelihood: 80,
        preventionSteps: [
          'Run npm audit regularly',
          'Keep dependencies updated',
          'Use Dependabot or similar tools',
          'Review dependency licenses',
        ],
        severity: 'high',
        type: 'risk',
      });
    }

    // Outdated dependencies risk
    const pkgPath = join(this.cwd, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
          dependencies?: Record<string, string>;
        };

        let oldVersionCount = 0;
        if (pkg.dependencies) {
          for (const version of Object.values(pkg.dependencies)) {
            if (version.includes('^0.') || version.includes('~0.')) {
              oldVersionCount++;
            }
          }
        }

        if (oldVersionCount > 0) {
          issues.push({
            category: 'security',
            description: 'Pre-1.0 dependencies may have breaking changes or security issues',
            id: 'outdated-dependencies-risk',
            impact: 70,
            indicators: [`${oldVersionCount} pre-1.0 dependencies`],
            likelihood: 60,
            preventionSteps: [
              'Review and update pre-1.0 dependencies',
              'Check for stable alternatives',
              'Monitor changelogs',
            ],
            severity: 'medium',
            type: 'potential',
          });
        }
      } catch (error) {
        this.logger.debug(`Error analyzing dependencies: ${error}`);
      }
    }

    return issues;
  }

  /**
   * Predict maintainability issues
   */
  private async predictMaintainabilityIssues(metrics: ProjectMetrics): Promise<PredictiveIssue[]> {
    const issues: PredictiveIssue[] = [];

    // Configuration complexity
    if (metrics.configFiles.length > 10) {
      issues.push({
        category: 'maintainability',
        description: 'Many configuration files can make the project harder to maintain',
        id: 'config-complexity-risk',
        impact: 40,
        indicators: [`${metrics.configFiles.length} configuration files`],
        likelihood: 50,
        preventionSteps: [
          'Consolidate configurations where possible',
          'Document configuration decisions',
          'Use configuration presets',
        ],
        severity: 'low',
        type: 'trend',
      });
    }

    // Missing documentation risk
    const readmePath = join(this.cwd, 'README.md');
    const docsPath = join(this.cwd, 'docs');

    if (!existsSync(readmePath) && !existsSync(docsPath)) {
      issues.push({
        category: 'maintainability',
        description: 'Lack of documentation will make onboarding and maintenance difficult',
        id: 'documentation-gap-risk',
        impact: 60,
        indicators: ['No README.md found', 'No docs directory found'],
        likelihood: 90,
        preventionSteps: [
          'Create comprehensive README',
          'Document architecture decisions',
          'Add inline code comments',
          'Create API documentation',
        ],
        severity: 'medium',
        type: 'potential',
      });
    }

    // Test coverage risk
    const hasTests =
      existsSync(join(this.cwd, '__tests__')) ||
      existsSync(join(this.cwd, 'test')) ||
      existsSync(join(this.cwd, 'tests'));

    if (!hasTests && metrics.fileCount > 20) {
      issues.push({
        category: 'maintainability',
        description: 'Growing codebase without tests increases regression risk',
        id: 'test-coverage-risk',
        impact: 80,
        indicators: ['No test directory found', `${metrics.fileCount} files without tests`],
        likelihood: 85,
        preventionSteps: [
          'Set up testing framework',
          'Write unit tests for critical paths',
          'Add integration tests',
          'Set up CI/CD with test coverage',
        ],
        severity: 'high',
        type: 'potential',
      });
    }

    return issues;
  }

  /**
   * Predict scalability issues
   */
  private async predictScalabilityIssues(metrics: ProjectMetrics): Promise<PredictiveIssue[]> {
    const issues: PredictiveIssue[] = [];

    // Monolithic architecture risk
    if (metrics.fileCount > 300 && !existsSync(join(this.cwd, 'packages'))) {
      issues.push({
        category: 'scalability',
        description: 'Large monolithic structure may hinder team scalability',
        id: 'monolith-scalability-risk',
        impact: 65,
        indicators: [`${metrics.fileCount} files in single structure`],
        likelihood: 70,
        preventionSteps: [
          'Consider modular architecture',
          'Evaluate monorepo structure',
          'Define clear module boundaries',
          'Use dependency injection',
        ],
        severity: 'medium',
        type: 'trend',
      });
    }

    // Build system scalability
    if (metrics.fileCount > 200 && !metrics.configFiles.some((f) => f.includes('cache'))) {
      issues.push({
        category: 'scalability',
        description: 'Build times will increase without caching strategy',
        id: 'build-scalability-risk',
        impact: 50,
        indicators: ['No caching configuration detected'],
        likelihood: 60,
        preventionSteps: [
          'Implement build caching',
          'Use incremental compilation',
          'Optimize build pipeline',
        ],
        severity: 'low',
        type: 'potential',
      });
    }

    return issues;
  }

  /**
   * Get risk score for an issue
   */
  getRiskScore(issue: PredictiveIssue): number {
    return (issue.likelihood * issue.impact) / 100;
  }

  /**
   * Get priority recommendations
   */
  getPriorityRecommendations(issues: PredictiveIssue[]): PredictiveIssue[] {
    return issues
      .filter((issue) => this.getRiskScore(issue) > 50)
      .sort((a, b) => this.getRiskScore(b) - this.getRiskScore(a))
      .slice(0, 5);
  }
}
