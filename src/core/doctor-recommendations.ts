/**
 * Doctor Personalized Recommendations
 *
 * Generate personalized recommendations based on project characteristics
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import type { Logger } from '../types/index.js';
import type { DoctorCheck } from '../types/index.js';

export interface Recommendation {
  id: string;
  category: 'tooling' | 'workflow' | 'architecture' | 'performance' | 'security' | 'quality';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  benefits: string[];
  steps: string[];
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  relatedTo?: string[]; // Related check IDs
}

export interface ProjectProfile {
  stack: string;
  language: string;
  framework?: string;
  size: 'small' | 'medium' | 'large';
  maturity: 'new' | 'growing' | 'mature';
  teamSize: 'solo' | 'small' | 'medium' | 'large';
  hasTests: boolean;
  hasCI: boolean;
  hasDocs: boolean;
}

export class DoctorRecommendations {
  private logger: Logger;
  private cwd: string;

  constructor(logger: Logger, cwd: string) {
    this.logger = logger;
    this.cwd = cwd;
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(checks: DoctorCheck[]): Promise<Recommendation[]> {
    const profile = await this.buildProjectProfile();
    const recommendations: Recommendation[] = [];

    // Generate recommendations based on profile
    recommendations.push(...this.getToolingRecommendations(profile, checks));
    recommendations.push(...this.getWorkflowRecommendations(profile, checks));
    recommendations.push(...this.getArchitectureRecommendations(profile, checks));
    recommendations.push(...this.getPerformanceRecommendations(profile, checks));
    recommendations.push(...this.getSecurityRecommendations(profile, checks));
    recommendations.push(...this.getQualityRecommendations(profile, checks));

    // Sort by priority and relevance
    return this.prioritizeRecommendations(recommendations, checks);
  }

  /**
   * Build project profile
   */
  private async buildProjectProfile(): Promise<ProjectProfile> {
    const profile: ProjectProfile = {
      hasCI: false,
      hasDocs: false,
      hasTests: false,
      language: 'javascript',
      maturity: 'new',
      size: 'small',
      stack: 'unknown',
      teamSize: 'solo',
    };

    try {
      const pkgPath = join(this.cwd, 'package.json');
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
          scripts?: Record<string, string>;
        };

        // Detect language
        if (pkg.devDependencies?.typescript || pkg.dependencies?.typescript) {
          profile.language = 'typescript';
        }

        // Detect framework
        if (pkg.dependencies?.react) {
          profile.framework = 'react';
        } else if (pkg.dependencies?.vue) {
          profile.framework = 'vue';
        } else if (pkg.dependencies?.['@angular/core']) {
          profile.framework = 'angular';
        } else if (pkg.dependencies?.next) {
          profile.framework = 'nextjs';
        }

        // Detect stack
        if (profile.framework) {
          profile.stack = profile.framework;
        } else if (pkg.dependencies?.express) {
          profile.stack = 'node-backend';
        }

        // Detect size
        const depCount =
          Object.keys(pkg.dependencies || {}).length +
          Object.keys(pkg.devDependencies || {}).length;
        if (depCount > 50) {
          profile.size = 'large';
        } else if (depCount > 20) {
          profile.size = 'medium';
        }

        // Detect maturity
        if (pkg.scripts) {
          const scriptCount = Object.keys(pkg.scripts).length;
          if (scriptCount > 10) {
            profile.maturity = 'mature';
          } else if (scriptCount > 5) {
            profile.maturity = 'growing';
          }
        }

        // Detect tests
        profile.hasTests = !!(
          pkg.devDependencies?.jest ||
          pkg.devDependencies?.vitest ||
          pkg.devDependencies?.mocha ||
          pkg.scripts?.test
        );
      }

      // Detect CI
      profile.hasCI =
        existsSync(join(this.cwd, '.github', 'workflows')) ||
        existsSync(join(this.cwd, '.gitlab-ci.yml')) ||
        existsSync(join(this.cwd, '.circleci'));

      // Detect docs
      profile.hasDocs =
        existsSync(join(this.cwd, 'README.md')) || existsSync(join(this.cwd, 'docs'));
    } catch (error) {
      this.logger.debug(`Error building project profile: ${error}`);
    }

    return profile;
  }

  /**
   * Get tooling recommendations
   */
  private getToolingRecommendations(
    profile: ProjectProfile,
    checks: DoctorCheck[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // TypeScript recommendation
    if (profile.language === 'javascript' && profile.size !== 'small') {
      recommendations.push({
        benefits: [
          'Catch errors at compile time',
          'Better IDE support and autocomplete',
          'Improved code maintainability',
          'Self-documenting code',
        ],
        category: 'tooling',
        description: 'Migrate to TypeScript for better type safety and developer experience',
        difficulty: 'medium',
        estimatedTime: '1-2 weeks',
        id: 'adopt-typescript',
        priority: 'high',
        steps: [
          'Install TypeScript: npm install -D typescript',
          'Create tsconfig.json',
          'Rename .js files to .ts gradually',
          'Add type definitions',
        ],
        tags: ['typescript', 'migration', 'type-safety'],
        title: 'Adopt TypeScript',
      });
    }

    // ESLint recommendation
    const hasESLintIssue = checks.some(
      (c) => c.name.toLowerCase().includes('eslint') && c.status !== 'ok'
    );
    if (hasESLintIssue) {
      recommendations.push({
        benefits: [
          'Catch common errors',
          'Enforce code style',
          'Improve code consistency',
          'Better collaboration',
        ],
        category: 'tooling',
        description: 'Configure ESLint for consistent code quality',
        difficulty: 'easy',
        estimatedTime: '1-2 hours',
        id: 'setup-eslint',
        priority: 'high',
        relatedTo: ['eslint'],
        steps: [
          'Install ESLint: npm install -D eslint',
          'Run: npx eslint --init',
          'Configure rules in .eslintrc',
          'Add lint script to package.json',
        ],
        tags: ['eslint', 'linting', 'code-quality'],
        title: 'Set up ESLint',
      });
    }

    // Prettier recommendation
    if (!checks.some((c) => c.name.toLowerCase().includes('prettier'))) {
      recommendations.push({
        benefits: [
          'Consistent code formatting',
          'No more style debates',
          'Faster code reviews',
          'Better git diffs',
        ],
        category: 'tooling',
        description: 'Add Prettier for automatic code formatting',
        difficulty: 'easy',
        estimatedTime: '30 minutes',
        id: 'setup-prettier',
        priority: 'medium',
        steps: [
          'Install Prettier: npm install -D prettier',
          'Create .prettierrc config',
          'Add format script',
          'Set up pre-commit hook',
        ],
        tags: ['prettier', 'formatting', 'code-style'],
        title: 'Set up Prettier',
      });
    }

    return recommendations;
  }

  /**
   * Get workflow recommendations
   */
  private getWorkflowRecommendations(
    profile: ProjectProfile,
    _checks: DoctorCheck[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // CI/CD recommendation
    if (!profile.hasCI && profile.maturity !== 'new') {
      recommendations.push({
        benefits: [
          'Automated testing on every commit',
          'Catch issues early',
          'Faster deployment',
          'Better code quality',
        ],
        category: 'workflow',
        description: 'Automate testing and deployment with CI/CD',
        difficulty: 'medium',
        estimatedTime: '2-4 hours',
        id: 'setup-ci-cd',
        priority: 'high',
        steps: [
          'Choose CI platform (GitHub Actions, GitLab CI, etc.)',
          'Create workflow file',
          'Add test and build jobs',
          'Configure deployment',
        ],
        tags: ['ci-cd', 'automation', 'github-actions'],
        title: 'Set up CI/CD Pipeline',
      });
    }

    // Git hooks recommendation
    if (profile.hasTests) {
      recommendations.push({
        benefits: [
          'Run tests before commit',
          'Enforce code quality',
          'Prevent bad commits',
          'Faster feedback',
        ],
        category: 'workflow',
        description: 'Use Husky for pre-commit and pre-push hooks',
        difficulty: 'easy',
        estimatedTime: '30 minutes',
        id: 'setup-git-hooks',
        priority: 'medium',
        steps: [
          'Install Husky: npm install -D husky',
          'Initialize: npx husky install',
          'Add pre-commit hook',
          'Add pre-push hook',
        ],
        tags: ['git-hooks', 'husky', 'automation'],
        title: 'Set up Git Hooks',
      });
    }

    return recommendations;
  }

  /**
   * Get architecture recommendations
   */
  private getArchitectureRecommendations(
    profile: ProjectProfile,
    _checks: DoctorCheck[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Monorepo recommendation
    if (profile.size === 'large' && profile.maturity === 'mature') {
      recommendations.push({
        benefits: [
          'Better code organization',
          'Shared dependencies',
          'Easier refactoring',
          'Improved collaboration',
        ],
        category: 'architecture',
        description: 'Organize large codebase with monorepo tools',
        difficulty: 'hard',
        estimatedTime: '1-2 weeks',
        id: 'consider-monorepo',
        priority: 'medium',
        steps: [
          'Evaluate monorepo tools (Nx, Turborepo, Lerna)',
          'Plan migration strategy',
          'Set up workspace structure',
          'Migrate gradually',
        ],
        tags: ['monorepo', 'architecture', 'scalability'],
        title: 'Consider Monorepo Structure',
      });
    }

    // Module boundaries recommendation
    if (profile.size !== 'small') {
      recommendations.push({
        benefits: [
          'Better code organization',
          'Reduced coupling',
          'Easier testing',
          'Improved maintainability',
        ],
        category: 'architecture',
        description: 'Establish clear module boundaries and dependencies',
        difficulty: 'medium',
        estimatedTime: '1 week',
        id: 'define-module-boundaries',
        priority: 'medium',
        steps: [
          'Identify logical modules',
          'Define public APIs',
          'Document dependencies',
          'Use linting rules to enforce',
        ],
        tags: ['architecture', 'modules', 'organization'],
        title: 'Define Module Boundaries',
      });
    }

    return recommendations;
  }

  /**
   * Get performance recommendations
   */
  private getPerformanceRecommendations(
    profile: ProjectProfile,
    _checks: DoctorCheck[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Bundle optimization
    if (profile.framework && profile.size !== 'small') {
      recommendations.push({
        benefits: [
          'Faster page loads',
          'Better user experience',
          'Improved SEO',
          'Lower bandwidth costs',
        ],
        category: 'performance',
        description: 'Reduce bundle size for faster load times',
        difficulty: 'medium',
        estimatedTime: '2-3 days',
        id: 'optimize-bundle',
        priority: 'medium',
        steps: [
          'Analyze bundle with webpack-bundle-analyzer',
          'Enable tree-shaking',
          'Use code splitting',
          'Lazy load components',
        ],
        tags: ['performance', 'bundle', 'optimization'],
        title: 'Optimize Bundle Size',
      });
    }

    return recommendations;
  }

  /**
   * Get security recommendations
   */
  private getSecurityRecommendations(
    profile: ProjectProfile,
    checks: DoctorCheck[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Security audit
    const hasSecurityIssue = checks.some((c) => c.category === 'security' && c.status !== 'ok');
    if (hasSecurityIssue || profile.maturity !== 'new') {
      recommendations.push({
        benefits: [
          'Identify vulnerabilities early',
          'Protect user data',
          'Compliance requirements',
          'Peace of mind',
        ],
        category: 'security',
        description: 'Set up automated security scanning',
        difficulty: 'easy',
        estimatedTime: '1-2 hours',
        id: 'regular-security-audits',
        priority: 'high',
        relatedTo: ['security'],
        steps: [
          'Run npm audit regularly',
          'Set up Dependabot',
          'Use Snyk or similar tools',
          'Add security checks to CI',
        ],
        tags: ['security', 'audit', 'dependencies'],
        title: 'Run Regular Security Audits',
      });
    }

    return recommendations;
  }

  /**
   * Get quality recommendations
   */
  private getQualityRecommendations(
    profile: ProjectProfile,
    _checks: DoctorCheck[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Testing recommendation
    if (!profile.hasTests && profile.size !== 'small') {
      recommendations.push({
        benefits: [
          'Catch bugs early',
          'Refactor with confidence',
          'Better documentation',
          'Improved code quality',
        ],
        category: 'quality',
        description: 'Set up unit and integration tests',
        difficulty: 'medium',
        estimatedTime: '1 week',
        id: 'add-testing',
        priority: 'high',
        steps: [
          'Choose testing framework (Jest, Vitest)',
          'Install dependencies',
          'Write first tests',
          'Add to CI pipeline',
        ],
        tags: ['testing', 'quality', 'jest'],
        title: 'Add Automated Testing',
      });
    }

    // Documentation recommendation
    if (!profile.hasDocs && profile.maturity !== 'new') {
      recommendations.push({
        benefits: [
          'Easier onboarding',
          'Better collaboration',
          'Reduced support burden',
          'Knowledge preservation',
        ],
        category: 'quality',
        description: 'Create comprehensive project documentation',
        difficulty: 'easy',
        estimatedTime: '2-3 days',
        id: 'improve-documentation',
        priority: 'medium',
        steps: [
          'Create/update README.md',
          'Document architecture',
          'Add API documentation',
          'Create contributing guide',
        ],
        tags: ['documentation', 'quality', 'onboarding'],
        title: 'Improve Documentation',
      });
    }

    return recommendations;
  }

  /**
   * Prioritize recommendations
   */
  private prioritizeRecommendations(
    recommendations: Recommendation[],
    checks: DoctorCheck[]
  ): Recommendation[] {
    // Create a set of check names for matching
    const issueNames = new Set(
      checks.filter((c) => c.status !== 'ok').map((c) => c.name.toLowerCase())
    );

    // Score recommendations
    const scored = recommendations.map((rec) => {
      let score = 0;

      // Priority score
      if (rec.priority === 'high') {
        score += 100;
      } else if (rec.priority === 'medium') {
        score += 50;
      } else {
        score += 25;
      }

      // Difficulty bonus (easier = higher score)
      if (rec.difficulty === 'easy') {
        score += 30;
      } else if (rec.difficulty === 'medium') {
        score += 15;
      }

      // Related to existing issues
      if (rec.relatedTo) {
        const relatedIssues = rec.relatedTo.filter((id) =>
          Array.from(issueNames).some((name) => name.includes(id.toLowerCase()))
        );
        score += relatedIssues.length * 20;
      }

      return { recommendation: rec, score };
    });

    // Sort by score and return top recommendations
    return scored
      .sort((a, b) => b.score - a.score)
      .map((s) => s.recommendation)
      .slice(0, 10);
  }

  /**
   * Format recommendations for display
   */
  formatRecommendations(recommendations: Recommendation[]): string {
    let output = '\n📋 Personalized Recommendations:\n\n';

    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      const priorityIcon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      const difficultyIcon =
        rec.difficulty === 'easy' ? '⭐' : rec.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐';

      output += `${i + 1}. ${priorityIcon} ${rec.title}\n`;
      output += `   ${rec.description}\n`;
      output += `   Difficulty: ${difficultyIcon} | Time: ${rec.estimatedTime}\n`;
      output += '   Benefits:\n';
      rec.benefits.forEach((benefit) => {
        output += `     • ${benefit}\n`;
      });
      output += '\n';
    }

    return output;
  }
}
