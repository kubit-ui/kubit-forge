import chalk from 'chalk';

import type { CommandResult, PluginContext } from '../types/index.js';

import { DependencyAnalyzer } from '../utils/dependency-analyzer.js';

/**
 * deps:analyze - Basic dependency information
 *
 * For advanced features, use native package manager tools:
 * - pnpm why <package>
 * - pnpm dedupe
 * - npx npm-check-updates
 * - npx depcheck
 */
export async function depsAnalyzeCommand(
  ctx: PluginContext,
  options: { depth?: number; filter?: string; json?: boolean } = {}
): Promise<CommandResult> {
  ctx.logger.step('🔍 Analyzing dependencies...');

  try {
    const analyzer = new DependencyAnalyzer(ctx.cwd, ctx.config.project.packageManager as any);
    const tree = await analyzer.getDependencyTree();

    if (options.json) {
      const treeObject = {
        dependencies: Object.fromEntries(tree.dependencies),
        devDependencies: Object.fromEntries(tree.devDependencies),
        name: tree.name,
        version: tree.version,
      };
      ctx.logger.json(treeObject);
      return { data: treeObject, status: 'ok' };
    }

    // Display tree visually
    displayDependencyTree(ctx, tree, options);

    // Summary statistics
    const totalDeps = tree.dependencies.size + tree.devDependencies.size;
    ctx.logger.info('');
    ctx.logger.info(chalk.bold('📊 Summary:'));
    ctx.logger.info(`  Total packages: ${totalDeps}`);
    ctx.logger.info(`  Production: ${tree.dependencies.size}`);
    ctx.logger.info(`  Development: ${tree.devDependencies.size}`);
    ctx.logger.info('');

    // Helpful suggestions for other tools
    ctx.logger.info(chalk.dim('💡 For more advanced dependency management:'));
    ctx.logger.info(
      chalk.dim(
        `  • ${ctx.config.project.packageManager} why <package>  - Why is package installed`
      )
    );
    if (ctx.config.project.packageManager === 'pnpm') {
      ctx.logger.info(chalk.dim('  • pnpm dedupe                  - Deduplicate dependencies'));
    }
    ctx.logger.info(chalk.dim('  • npx npm-check-updates        - Check for updates'));
    ctx.logger.info(chalk.dim('  • npx depcheck                 - Find unused dependencies'));

    return {
      data: { dependencies: tree.dependencies.size, total: totalDeps },
      status: 'ok',
    };
  } catch (error) {
    ctx.logger.error('Failed to analyze dependencies', error as Error);
    return {
      errors: [{ code: 'ANALYZE_FAILED', message: (error as Error).message }],
      status: 'error',
    };
  }
}

// ========== Helper Functions ==========

function displayDependencyTree(ctx: PluginContext, tree: any, options: any): void {
  const maxDepth = options.depth || 2;
  const filter = options.filter;

  ctx.logger.info('');
  ctx.logger.info(chalk.bold.cyan(`${tree.name}@${tree.version}`));
  ctx.logger.info('');

  if (tree.dependencies.size > 0) {
    ctx.logger.info(chalk.bold('📦 Dependencies:'));
    displayDependencies(ctx, tree.dependencies, '', 0, maxDepth, filter);
    ctx.logger.info('');
  }

  if (tree.devDependencies.size > 0) {
    ctx.logger.info(chalk.bold('🔧 Dev Dependencies:'));
    displayDependencies(ctx, tree.devDependencies, '', 0, maxDepth, filter);
    ctx.logger.info('');
  }
}

function displayDependencies(
  ctx: PluginContext,
  deps: Map<string, any>,
  prefix: string,
  depth: number,
  maxDepth: number,
  filter?: string
): void {
  if (depth >= maxDepth) {
    return;
  }

  const entries = Array.from(deps.entries());
  const filtered = filter ? entries.filter(([name]) => name.includes(filter)) : entries;

  for (let i = 0; i < filtered.length; i++) {
    const [name, dep] = filtered[i];
    const isLast = i === filtered.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');

    ctx.logger.info(`${prefix}${connector}${chalk.cyan(name)}@${chalk.gray(dep.version)}`);

    if (dep.dependencies && dep.dependencies.size > 0) {
      displayDependencies(ctx, dep.dependencies, nextPrefix, depth + 1, maxDepth, filter);
    }
  }
}
