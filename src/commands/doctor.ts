import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import semver from 'semver';

import type { CommandResult, PluginContext, DoctorResult, DoctorCheck } from '../types/index.js';

import { ProjectDetector } from '../utils/project-detector.js';

export interface DoctorCommandOptions {
  json?: boolean;
}

export async function doctorCommand(
  ctx: PluginContext,
  options: DoctorCommandOptions = {}
): Promise<CommandResult> {
  ctx.logger.step('🔍 Running comprehensive diagnostics...\n');

  const checks: DoctorCheck[] = [];
  const startTime = Date.now();

  // Detect project information
  let projectInfo;
  try {
    const detector = new ProjectDetector(ctx.cwd);
    projectInfo = await detector.detect();

    ctx.logger.info('📦 Project Information:');
    ctx.logger.info(`   Stack: ${projectInfo.stack}`);
    ctx.logger.info(`   Language: ${projectInfo.language}`);
    ctx.logger.info(`   Package Manager: ${projectInfo.packageManager}`);
    ctx.logger.info(`   Bundler: ${projectInfo.bundler}`);
    ctx.logger.info('');
  } catch {
    ctx.logger.warn('Could not detect project information (not in a project directory?)\n');
  }

  // System checks
  checks.push(await checkNodeVersion(ctx));
  checks.push(await checkPackageManager(ctx));
  checks.push(await checkGit(ctx));

  // Project checks
  checks.push(await checkPackageJson(ctx));
  checks.push(await checkConfig(ctx));
  checks.push(await checkDependencies(ctx));

  // Environment checks
  checks.push(await checkEnvFiles(ctx));

  // Config checks
  if (ctx.config.project.language === 'ts') {
    checks.push(await checkTypeScript(ctx));
  }

  // Additional checks if project info is available
  if (projectInfo) {
    checks.push(await checkESLint(ctx, projectInfo));
    checks.push(await checkPrettier(ctx, projectInfo));
    checks.push(await checkTests(ctx, projectInfo));
    checks.push(await checkSecurity(ctx));
  }

  const duration = Date.now() - startTime;

  // Determine overall status
  const hasErrors = checks.some((c) => c.status === 'error');
  const hasWarnings = checks.some((c) => c.status === 'warning');
  const status = hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok';

  // Generate simple recommendations
  const recommendations: string[] = [];
  for (const check of checks) {
    if (check.status !== 'ok' && check.solution) {
      recommendations.push(check.solution);
    }
  }

  const result: DoctorResult = {
    checks,
    recommendations: recommendations.length > 0 ? recommendations : undefined,
    status,
  };

  // Display results
  if (options.json) {
    ctx.logger.json(result);
  } else {
    displayDoctorResults(result, ctx);
  }

  return {
    data: result,
    message: `Doctor completed in ${duration}ms`,
    status,
    timings: { doctor: duration },
  };
}

async function checkNodeVersion(ctx: PluginContext): Promise<DoctorCheck> {
  const currentVersion = process.version;
  const requiredVersion = ctx.config.project.nodeVersion || '20';

  const valid = semver.satisfies(currentVersion, `>=${requiredVersion}.0.0`);

  return {
    category: 'system',
    message: valid
      ? `Node.js ${currentVersion} (required: >=${requiredVersion})`
      : `Node.js ${currentVersion} detected, required >=${requiredVersion}`,
    name: 'Node.js version',
    solution: valid
      ? undefined
      : `Install Node.js ${requiredVersion} or higher and restart your terminal`,
    status: valid ? 'ok' : 'error',
  };
}

async function checkPackageManager(ctx: PluginContext): Promise<DoctorCheck> {
  const pm = ctx.config.project.packageManager;
  const result = await ctx.runner.run(pm, ['--version'], { silent: true });

  return {
    category: 'system',
    message:
      result.status === 'ok' ? `${pm} is available` : `${pm} is not installed or not in PATH`,
    name: 'Package manager',
    solution: result.status === 'ok' ? undefined : `Install ${pm}: npm install -g ${pm}`,
    status: result.status === 'ok' ? 'ok' : 'error',
  };
}

async function checkGit(ctx: PluginContext): Promise<DoctorCheck> {
  const result = await ctx.runner.run('git', ['--version'], { silent: true });

  return {
    category: 'system',
    message: result.status === 'ok' ? 'Git is available' : 'Git is not installed',
    name: 'Git',
    solution: result.status === 'ok' ? undefined : 'Install Git for version control',
    status: result.status === 'ok' ? 'ok' : 'warning',
  };
}

async function checkPackageJson(ctx: PluginContext): Promise<DoctorCheck> {
  const packageJsonPath = join(ctx.cwd, 'package.json');
  const exists = existsSync(packageJsonPath);

  return {
    category: 'project',
    message: exists ? 'package.json found' : 'package.json not found',
    name: 'package.json',
    solution: exists ? undefined : 'Run: npm init or create a new project with kubit-forge init',
    status: exists ? 'ok' : 'error',
  };
}

async function checkConfig(ctx: PluginContext): Promise<DoctorCheck> {
  const configPath = join(ctx.cwd, 'kubit.config.toml');
  const exists = existsSync(configPath);

  return {
    category: 'config',
    message: exists ? 'Configuration file found' : 'No kubit.config.toml (using auto-detection)',
    name: 'kubit.config.toml',
    solution: exists ? undefined : 'Consider creating kubit.config.toml for explicit configuration',
    status: exists ? 'ok' : 'warning',
  };
}

async function checkDependencies(ctx: PluginContext): Promise<DoctorCheck> {
  const nodeModulesPath = join(ctx.cwd, 'node_modules');
  const exists = existsSync(nodeModulesPath);

  return {
    category: 'dependencies',
    message: exists ? 'Dependencies installed' : 'Dependencies not installed',
    name: 'Dependencies',
    solution: exists ? undefined : `Run: ${ctx.config.project.packageManager} install`,
    status: exists ? 'ok' : 'warning',
  };
}

async function checkEnvFiles(ctx: PluginContext): Promise<DoctorCheck> {
  const envExamplePath = join(ctx.cwd, ctx.config.paths?.envExample || '.env.example');
  const envLocalPath = join(ctx.cwd, ctx.config.paths?.envLocal || '.env.local');

  const hasExample = existsSync(envExamplePath);
  const hasLocal = existsSync(envLocalPath);

  if (!hasExample && !hasLocal) {
    return {
      category: 'env',
      message: 'No environment files configured',
      name: 'Environment files',
      status: 'ok',
    };
  }

  if (hasExample && !hasLocal) {
    return {
      category: 'env',
      message: '.env.example found but .env.local missing',
      name: 'Environment files',
      solution: 'Run: kubit-forge env init',
      status: 'warning',
    };
  }

  return {
    category: 'env',
    message: 'Environment files configured',
    name: 'Environment files',
    status: 'ok',
  };
}

async function checkTypeScript(ctx: PluginContext): Promise<DoctorCheck> {
  const tsconfigPath = join(ctx.cwd, 'tsconfig.json');
  const exists = existsSync(tsconfigPath);

  return {
    category: 'config',
    message: exists ? 'tsconfig.json found' : 'tsconfig.json not found',
    name: 'TypeScript config',
    solution: exists ? undefined : 'Create tsconfig.json for TypeScript support',
    status: exists ? 'ok' : 'warning',
  };
}

async function checkESLint(_ctx: PluginContext, projectInfo: any): Promise<DoctorCheck> {
  if (!projectInfo.hasESLint) {
    return {
      category: 'quality',
      message: 'ESLint not configured',
      name: 'ESLint',
      solution: 'Run: kubit-forge add eslint',
      status: 'warning',
    };
  }

  const message =
    projectInfo.eslintVersion === 'v8'
      ? `ESLint ${projectInfo.eslintVersion} (consider upgrading to v9)`
      : `ESLint ${projectInfo.eslintVersion || 'configured'}`;

  return {
    category: 'quality',
    message,
    name: 'ESLint',
    solution:
      projectInfo.eslintVersion === 'v8'
        ? 'Run: kubit-forge migrate eslint-legacy-to-flat'
        : undefined,
    status: 'ok',
  };
}

async function checkPrettier(_ctx: PluginContext, projectInfo: any): Promise<DoctorCheck> {
  return {
    category: 'quality',
    message: projectInfo.hasPrettier ? 'Prettier configured' : 'Prettier not configured',
    name: 'Prettier',
    solution: projectInfo.hasPrettier ? undefined : 'Run: kubit-forge add prettier',
    status: projectInfo.hasPrettier ? 'ok' : 'warning',
  };
}

async function checkTests(_ctx: PluginContext, projectInfo: any): Promise<DoctorCheck> {
  if (!projectInfo.hasTests) {
    return {
      category: 'quality',
      message: 'No test framework configured',
      name: 'Testing',
      solution: 'Run: kubit-forge add vitest',
      status: 'warning',
    };
  }

  const message =
    projectInfo.testFramework === 'jest'
      ? `${projectInfo.testFramework} (consider migrating to Vitest)`
      : `${projectInfo.testFramework} configured`;

  return {
    category: 'quality',
    message,
    name: 'Testing',
    solution:
      projectInfo.testFramework === 'jest' ? 'Run: kubit-forge migrate jest-to-vitest' : undefined,
    status: 'ok',
  };
}

async function checkSecurity(ctx: PluginContext): Promise<DoctorCheck> {
  const gitignorePath = join(ctx.cwd, '.gitignore');
  const envPath = join(ctx.cwd, '.env');

  if (existsSync(envPath) && existsSync(gitignorePath)) {
    const gitignore = readFileSync(gitignorePath, 'utf-8');
    if (!gitignore.includes('.env')) {
      return {
        category: 'security',
        message: '.env file exists but not in .gitignore',
        name: 'Security',
        solution: 'Add .env to .gitignore to prevent committing secrets',
        status: 'error',
      };
    }
  }

  return {
    category: 'security',
    message: 'No obvious security issues detected',
    name: 'Security',
    status: 'ok',
  };
}

function displayDoctorResults(result: DoctorResult, ctx: PluginContext): void {
  ctx.logger.info('');
  ctx.logger.info('═'.repeat(60));
  ctx.logger.info('Diagnostics Results:');
  ctx.logger.info('═'.repeat(60));
  ctx.logger.info('');

  // Group checks by category
  const categories = ['system', 'project', 'dependencies', 'config', 'env', 'quality', 'security'];

  for (const category of categories) {
    const categoryChecks = result.checks.filter((c) => c.category === category);
    if (categoryChecks.length === 0) {
      continue;
    }

    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    ctx.logger.info(`${categoryName}:`);

    for (const check of categoryChecks) {
      const icon =
        check.status === 'ok'
          ? '✔'
          : check.status === 'warning'
            ? '⚠'
            : check.status === 'error'
              ? '✖'
              : 'ℹ';
      const color =
        check.status === 'ok'
          ? 'success'
          : check.status === 'warning'
            ? 'warn'
            : check.status === 'error'
              ? 'error'
              : 'info';

      if (color === 'success') {
        ctx.logger.success(`  ${icon} ${check.name}: ${check.message}`);
      } else if (color === 'warn') {
        ctx.logger.warn(`  ${icon} ${check.name}: ${check.message}`);
      } else if (color === 'error') {
        ctx.logger.error(`  ${icon} ${check.name}: ${check.message}`);
      } else {
        ctx.logger.info(`  ${icon} ${check.name}: ${check.message}`);
      }

      if (check.solution) {
        ctx.logger.info(`     → ${check.solution}`);
      }
    }
    ctx.logger.info('');
  }

  if (result.recommendations && result.recommendations.length > 0) {
    ctx.logger.info('💡 Recommendations:');
    for (const rec of result.recommendations) {
      ctx.logger.info(`   • ${rec}`);
    }
    ctx.logger.info('');
  }

  ctx.logger.info('═'.repeat(60));
  if (result.status === 'ok') {
    ctx.logger.success('✨ All checks passed! Your project is in great shape!');
  } else if (result.status === 'warning') {
    ctx.logger.warn('⚠️  Some warnings found. Consider addressing them.');
  } else {
    ctx.logger.error('❌ Some checks failed. Please fix the errors above.');
  }
  ctx.logger.info('═'.repeat(60));
}
