import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../types/index.js';

import { MonorepoManager } from '../utils/monorepo-manager.js';
import { ProjectDetector } from '../utils/project-detector.js';

interface DependencyInfo {
  total: number;
  production: number;
  development: number;
  outdated: number;
}

interface BuildInfo {
  hasDistFolder: boolean;
  distSize?: number;
  lastBuildTime?: Date;
}

interface GitInfo {
  hasGit: boolean;
  branch?: string;
  uncommittedChanges?: number;
}

export async function infoCommand(
  ctx: PluginContext,
  options: { detailed?: boolean; json?: boolean } = {}
): Promise<CommandResult> {
  const detector = new ProjectDetector(ctx.cwd);
  const projectInfo = await detector.detect();

  // Collect dependency information
  const dependencies = await collectDependencyInfo(ctx.cwd);

  // Collect build information
  const buildInfo = await collectBuildInfo(ctx.cwd);

  // Collect git information
  const gitInfo = await collectGitInfo(ctx);

  // Collect monorepo information
  const monorepoManager = new MonorepoManager(ctx.logger, ctx.cwd);
  const monorepoInfo = await monorepoManager.getMonorepoInfo();

  const info = {
    build: buildInfo,
    dependencies,
    environment: {
      arch: process.arch,
      cwd: ctx.cwd,
      hasEnvExample: existsSync(join(ctx.cwd, ctx.config.paths?.envExample || '.env.example')),
      hasEnvLocal: existsSync(join(ctx.cwd, ctx.config.paths?.envLocal || '.env.local')),
      node: process.version,
      platform: process.platform,
    },
    git: gitInfo,
    health: calculateHealthScore(dependencies, buildInfo),
    monorepo: monorepoInfo
      ? {
          isMonorepo: true,
          packages: monorepoInfo.packages.length,
          tool: monorepoInfo.tool,
          workspaces: monorepoInfo.workspaces,
        }
      : { isMonorepo: false },
    paths: ctx.config.paths,
    plugins: {
      enabled: ctx.config.plugins?.enabled || [],
    },
    project: {
      bundler: projectInfo.bundler,
      devPort: ctx.config.project.devPort,
      isMonorepo: projectInfo.isMonorepo,
      language: ctx.config.project.language,
      monorepoTool: projectInfo.monorepoTool,
      name: ctx.config.project.name,
      nodeVersion: ctx.config.project.nodeVersion,
      packageManager: ctx.config.project.packageManager,
      stack: ctx.config.project.stack,
      type: ctx.config.project.type,
    },
    quality: ctx.config.quality,
  };

  // Display info
  if (options.json) {
    ctx.logger.json(info);
  } else {
    displayProjectInfo(ctx, info, options.detailed || false);
  }

  return {
    data: info,
    message: 'Project information',
    status: 'ok',
  };
}

async function collectDependencyInfo(cwd: string): Promise<DependencyInfo> {
  const packageJsonPath = join(cwd, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return { development: 0, outdated: 0, production: 0, total: 0 };
  }

  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const production = Object.keys(pkg.dependencies || {}).length;
  const development = Object.keys(pkg.devDependencies || {}).length;

  return {
    development,
    outdated: 0, // Would require npm outdated check
    production,
    total: production + development,
  };
}

async function collectBuildInfo(cwd: string): Promise<BuildInfo> {
  const distPath = join(cwd, 'dist');

  if (!existsSync(distPath)) {
    return { hasDistFolder: false };
  }

  try {
    const stats = statSync(distPath);
    return {
      distSize: 0, // Would require recursive directory size calculation
      hasDistFolder: true,
      lastBuildTime: stats.mtime,
    };
  } catch {
    return { hasDistFolder: false };
  }
}

async function collectGitInfo(ctx: PluginContext): Promise<GitInfo> {
  const gitPath = join(ctx.cwd, '.git');

  if (!existsSync(gitPath)) {
    return { hasGit: false };
  }

  try {
    // Get current branch
    const branchResult = await ctx.runner.run('git', ['branch', '--show-current'], {
      silent: true,
    });
    const branch = branchResult.status === 'ok' ? branchResult.output?.trim() : undefined;

    // Get uncommitted changes
    const statusResult = await ctx.runner.run('git', ['status', '--porcelain'], { silent: true });
    const uncommittedChanges =
      statusResult.status === 'ok' ? (statusResult.output?.split('\n').length || 0) - 1 : 0;

    return {
      branch,
      hasGit: true,
      uncommittedChanges,
    };
  } catch {
    return { hasGit: true };
  }
}

function calculateHealthScore(dependencies: DependencyInfo, buildInfo: BuildInfo): number {
  let score = 100;

  // Penalize for too many dependencies
  if (dependencies.total > 100) {
    score -= 10;
  }
  if (dependencies.total > 200) {
    score -= 20;
  }

  // Penalize for outdated dependencies
  if (dependencies.outdated > 10) {
    score -= 15;
  }

  // Bonus for having a build
  if (buildInfo.hasDistFolder) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

function displayProjectInfo(ctx: PluginContext, info: any, detailed: boolean): void {
  ctx.logger.info('');
  ctx.logger.info('═'.repeat(60));
  ctx.logger.info('Project Information');
  ctx.logger.info('═'.repeat(60));
  ctx.logger.info('');

  // Project basics
  ctx.logger.info('Project:');
  ctx.logger.info(`  Name: ${info.project.name}`);
  ctx.logger.info(`  Stack: ${info.project.stack}`);
  ctx.logger.info(`  Language: ${info.project.language}`);
  ctx.logger.info(`  Package Manager: ${info.project.packageManager}`);
  ctx.logger.info(`  Bundler: ${info.project.bundler || 'N/A'}`);
  ctx.logger.info('');

  // Environment
  ctx.logger.info('Environment:');
  ctx.logger.info(`  Node: ${info.environment.node} (required: >=${info.project.nodeVersion})`);
  ctx.logger.info(`  Platform: ${info.environment.platform}`);
  ctx.logger.info(`  Architecture: ${info.environment.arch}`);
  ctx.logger.info('');

  // Dependencies
  ctx.logger.info('Dependencies:');
  ctx.logger.info(`  Total: ${info.dependencies.total}`);
  ctx.logger.info(`  Production: ${info.dependencies.production}`);
  ctx.logger.info(`  Development: ${info.dependencies.development}`);
  if (info.dependencies.outdated > 0) {
    ctx.logger.warn(`  Outdated: ${info.dependencies.outdated}`);
  }
  ctx.logger.info('');

  // Git
  if (info.git.hasGit) {
    ctx.logger.info('Git:');
    if (info.git.branch) {
      ctx.logger.info(`  Branch: ${info.git.branch}`);
    }
    if (info.git.uncommittedChanges !== undefined) {
      const status =
        info.git.uncommittedChanges === 0 ? 'Clean' : `${info.git.uncommittedChanges} changes`;
      ctx.logger.info(`  Status: ${status}`);
    }
    ctx.logger.info('');
  }

  // Build
  if (info.build.hasDistFolder) {
    ctx.logger.info('Build:');
    ctx.logger.info('  Status: Built');
    if (info.build.lastBuildTime) {
      ctx.logger.info(`  Last Build: ${new Date(info.build.lastBuildTime).toLocaleString()}`);
    }
    ctx.logger.info('');
  }

  // Health score
  const healthIcon = info.health >= 80 ? '✔' : info.health >= 60 ? '⚠' : '✖';
  ctx.logger.info(`Health Score: ${healthIcon} ${info.health}/100`);
  ctx.logger.info('');

  // Detailed information
  if (detailed) {
    ctx.logger.info('Quality Settings:');
    ctx.logger.info(`  Format: ${info.quality?.format ? 'Enabled' : 'Disabled'}`);
    ctx.logger.info(`  Lint: ${info.quality?.lint ? 'Enabled' : 'Disabled'}`);
    ctx.logger.info(`  Typecheck: ${info.quality?.typecheck ? 'Enabled' : 'Disabled'}`);
    ctx.logger.info(`  Unit Tests: ${info.quality?.unitTest ? 'Enabled' : 'Disabled'}`);
    ctx.logger.info('');

    if (info.plugins.enabled.length > 0) {
      ctx.logger.info('Plugins:');
      for (const plugin of info.plugins.enabled) {
        ctx.logger.info(`  - ${plugin}`);
      }
      ctx.logger.info('');
    }

    ctx.logger.info('Paths:');
    ctx.logger.info(`  Source: ${info.paths?.src || 'src'}`);
    ctx.logger.info(`  Output: ${info.paths?.dist || 'dist'}`);
    ctx.logger.info(`  Public: ${info.paths?.public || 'public'}`);
    ctx.logger.info('');
  }

  ctx.logger.info('═'.repeat(60));
}
