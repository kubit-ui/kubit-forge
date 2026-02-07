import chalk from 'chalk';
import { writeFileSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../types/index.js';

import { DependencyAnalyzer } from '../utils/dependency-analyzer.js';

/**
 * deps:analyze - Visual dependency tree
 */
export async function depsAnalyzeCommand(
  ctx: PluginContext,
  options: { depth?: number; filter?: string; json?: boolean } = {}
): Promise<CommandResult> {
  ctx.logger.step('🔍 Analyzing dependency tree...');

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

/**
 * deps:why - Explain why a package is installed
 */
export async function depsWhyCommand(
  ctx: PluginContext,
  packageName: string,
  options: { json?: boolean } = {}
): Promise<CommandResult> {
  if (!packageName) {
    ctx.logger.error('Package name is required');
    return {
      errors: [{ code: 'MISSING_PACKAGE', message: 'Package name required' }],
      status: 'error',
    };
  }

  ctx.logger.step(`🔎 Analyzing why "${packageName}" is installed...`);

  try {
    const analyzer = new DependencyAnalyzer(ctx.cwd, ctx.config.project.packageManager as any);
    const why = await analyzer.whyPackage(packageName);

    if (options.json) {
      ctx.logger.json(why);
      return { data: why, status: 'ok' };
    }

    // Display results
    ctx.logger.info('');
    ctx.logger.info(chalk.bold.cyan(`📦 ${why.name}@${why.version}`));
    ctx.logger.info(chalk.gray(`   Location: ${why.location}`));
    ctx.logger.info('');

    if (why.requestedBy.length === 0) {
      ctx.logger.warn('   ⚠ Not found in dependencies (might be a transitive dependency)');
    } else {
      ctx.logger.info(chalk.bold('   Required by:'));
      for (const req of why.requestedBy) {
        const icon = getTypeIcon(req.type);
        const color = getTypeColor(req.type);
        ctx.logger.info(
          `   ${icon} ${chalk[color](req.name)} (${req.type}) → ${chalk.dim(req.versionRequirement)}`
        );
      }
    }

    ctx.logger.info('');

    return { data: why, status: 'ok' };
  } catch (error) {
    ctx.logger.error('Failed to analyze package', error as Error);
    return {
      errors: [{ code: 'ANALYZE_FAILED', message: (error as Error).message }],
      status: 'error',
    };
  }
}

/**
 * deps:dedupe - Deduplicate and optimize dependencies
 */
export async function depsDedupeCommand(
  ctx: PluginContext,
  options: { dryRun?: boolean; json?: boolean } = {}
): Promise<CommandResult> {
  ctx.logger.step('🧹 Analyzing duplicate dependencies...');

  try {
    const analyzer = new DependencyAnalyzer(ctx.cwd, ctx.config.project.packageManager as any);

    // Find duplicates first
    const duplicates = await analyzer.findDuplicates();

    if (duplicates.length === 0) {
      ctx.logger.success('✓ No duplicate dependencies found! Your project is optimized.');
      return { data: { duplicates: 0 }, status: 'ok' };
    }

    // Display duplicates
    ctx.logger.info('');
    ctx.logger.info(chalk.bold(`Found ${duplicates.length} duplicate dependencies:`));
    ctx.logger.info('');

    for (const dup of duplicates) {
      ctx.logger.warn(`  📦 ${chalk.bold(dup.name)}`);
      ctx.logger.info(`     Versions: ${dup.versions.join(', ')}`);
      ctx.logger.info(chalk.gray(`     Locations: ${dup.locations.length} places`));
      if (dup.potentialSavings > 0) {
        ctx.logger.info(chalk.green(`     Potential savings: ~${dup.potentialSavings}KB`));
      }
      ctx.logger.info('');
    }

    if (options.dryRun) {
      ctx.logger.info(chalk.yellow('🔍 Dry run - no changes made'));
      ctx.logger.info(chalk.dim('   Run without --dry-run to deduplicate'));
      return { data: { duplicates: duplicates.length }, status: 'ok' };
    }

    // Perform deduplication
    ctx.logger.step('🔧 Deduplicating dependencies...');
    const result = await analyzer.deduplicate();

    ctx.logger.success('✓ Deduplication complete!');
    ctx.logger.info(`  Before: ${result.before} packages`);
    ctx.logger.info(`  After:  ${result.after} packages`);
    ctx.logger.info(chalk.green(`  Saved:  ${result.saved}`));

    return {
      data: { after: result.after, before: result.before, saved: result.saved },
      status: 'ok',
    };
  } catch (error) {
    ctx.logger.error('Failed to deduplicate dependencies', error as Error);
    return {
      errors: [{ code: 'ANALYZE_FAILED', message: (error as Error).message }],
      status: 'error',
    };
  }
}

/**
 * deps:update - Smart dependency updates
 */
export async function depsUpdateCommand(
  ctx: PluginContext,
  options: {
    interactive?: boolean;
    breakingChanges?: boolean;
    security?: boolean;
    json?: boolean;
  } = {}
): Promise<CommandResult> {
  ctx.logger.step('🔍 Checking for available updates...');

  try {
    const analyzer = new DependencyAnalyzer(ctx.cwd, ctx.config.project.packageManager as any);
    const updates = await analyzer.getAvailableUpdates();

    if (updates.length === 0) {
      ctx.logger.success('✓ All dependencies are up to date!');
      return { data: { updates: 0 }, status: 'ok' };
    }

    // Filter by options
    let filteredUpdates = updates;
    if (!options.breakingChanges) {
      filteredUpdates = updates.filter((u) => !u.breaking);
    }
    if (options.security) {
      filteredUpdates = filteredUpdates.filter((u) => (u.securityVulnerabilities || 0) > 0);
    }

    if (options.json) {
      ctx.logger.json(filteredUpdates);
      return { data: filteredUpdates, status: 'ok' };
    }

    // Display updates
    ctx.logger.info('');
    ctx.logger.info(chalk.bold(`Found ${filteredUpdates.length} available updates:`));
    ctx.logger.info('');

    for (const update of filteredUpdates) {
      const icon = update.breaking ? '⚠️' : '📦';
      const typeColor = update.type === 'production' ? 'cyan' : 'gray';

      ctx.logger.info(
        `  ${icon} ${chalk.bold(update.name)} ${chalk[typeColor](`(${update.type})`)}`
      );
      ctx.logger.info(`     Current: ${chalk.red(update.current)}`);
      ctx.logger.info(`     Wanted:  ${chalk.yellow(update.wanted)}`);
      ctx.logger.info(`     Latest:  ${chalk.green(update.latest)}`);

      if (update.breaking) {
        ctx.logger.warn('     ⚠ Breaking change - review changelog');
      }

      if (update.securityVulnerabilities && update.securityVulnerabilities > 0) {
        ctx.logger.warn(
          `     🔒 ${update.securityVulnerabilities} security vulnerabilities - update recommended`
        );
      }

      if (update.changelogUrl) {
        ctx.logger.info(chalk.dim(`     ${update.changelogUrl}`));
      }

      ctx.logger.info('');
    }

    // Smart update recommendations
    ctx.logger.info(chalk.bold('💡 Recommendations:'));
    ctx.logger.info('');

    const safeUpdates = filteredUpdates.filter((u) => !u.breaking);
    const breakingUpdates = filteredUpdates.filter((u) => u.breaking);
    const securityUpdates = filteredUpdates.filter((u) => (u.securityVulnerabilities || 0) > 0);

    if (securityUpdates.length > 0) {
      ctx.logger.info(
        chalk.red(`  🔒 ${securityUpdates.length} security updates available - update immediately`)
      );
    }

    if (safeUpdates.length > 0) {
      ctx.logger.info(chalk.green(`  ✓ ${safeUpdates.length} safe updates (no breaking changes)`));
      ctx.logger.info(
        chalk.dim(
          `     Run: ${ctx.config.project.packageManager} update ${safeUpdates.map((u) => u.name).join(' ')}`
        )
      );
    }

    if (breakingUpdates.length > 0) {
      ctx.logger.info(
        chalk.yellow(`  ⚠ ${breakingUpdates.length} breaking changes - review carefully`)
      );
    }

    ctx.logger.info('');

    return {
      data: { breaking: breakingUpdates.length, safe: safeUpdates.length, total: updates.length },
      status: 'ok',
    };
  } catch (error) {
    ctx.logger.error('Failed to check for updates', error as Error);
    return {
      errors: [{ code: 'ANALYZE_FAILED', message: (error as Error).message }],
      status: 'error',
    };
  }
}

/**
 * deps:alternatives - Suggest alternative packages
 */
export async function depsAlternativesCommand(
  ctx: PluginContext,
  packageName: string,
  options: { json?: boolean } = {}
): Promise<CommandResult> {
  if (!packageName) {
    ctx.logger.error('Package name is required');
    return {
      errors: [{ code: 'MISSING_PACKAGE', message: 'Package name required' }],
      status: 'error',
    };
  }

  ctx.logger.step(`🔍 Finding alternatives for "${packageName}"...`);

  try {
    const analyzer = new DependencyAnalyzer(ctx.cwd, ctx.config.project.packageManager as any);
    const alternatives = await analyzer.getAlternatives(packageName);

    if (alternatives.length === 0) {
      ctx.logger.info(`No known alternatives found for "${packageName}"`);
      ctx.logger.info(
        chalk.dim('💡 This might mean the package is already optimal for your use case')
      );
      return { data: { alternatives: 0 }, status: 'ok' };
    }

    if (options.json) {
      ctx.logger.json(alternatives);
      return { data: alternatives, status: 'ok' };
    }

    // Display alternatives
    ctx.logger.info('');
    ctx.logger.info(chalk.bold(`Found ${alternatives.length} alternatives:`));
    ctx.logger.info('');

    for (const alt of alternatives) {
      ctx.logger.info(`  📦 ${chalk.bold.cyan(alt.name)}`);
      ctx.logger.info(`     ${alt.description}`);
      ctx.logger.info('');
      ctx.logger.info(chalk.dim(`     Size: ${alt.size}`));
      ctx.logger.info(chalk.dim(`     Downloads: ${alt.downloads.toLocaleString()}/week`));
      ctx.logger.info(chalk.dim(`     Stars: ⭐ ${alt.stars.toLocaleString()}`));
      ctx.logger.info(
        chalk.dim(`     Maintained: ${alt.maintained ? chalk.green('✓') : chalk.red('✗')}`)
      );
      ctx.logger.info('');
      ctx.logger.info(chalk.yellow(`     Why? ${alt.reason}`));

      if (alt.migrationGuide) {
        ctx.logger.info(chalk.blue(`     📚 Migration guide: ${alt.migrationGuide}`));
      }

      ctx.logger.info('');
    }

    ctx.logger.info(chalk.bold('💡 Tip:'));
    ctx.logger.info(
      chalk.dim('  Consider bundle size, maintenance status, and TypeScript support')
    );
    ctx.logger.info(chalk.dim('  when choosing alternatives.'));
    ctx.logger.info('');

    return { data: alternatives, status: 'ok' };
  } catch (error) {
    ctx.logger.error('Failed to find alternatives', error as Error);
    return {
      errors: [{ code: 'ANALYZE_FAILED', message: (error as Error).message }],
      status: 'error',
    };
  }
}

/**
 * deps:export - Export dependency information
 */
export async function depsExportCommand(
  ctx: PluginContext,
  options: { format?: 'json' | 'markdown' | 'csv'; output?: string } = {}
): Promise<CommandResult> {
  ctx.logger.step('📤 Exporting dependency information...');

  try {
    const analyzer = new DependencyAnalyzer(ctx.cwd, ctx.config.project.packageManager as any);
    const tree = await analyzer.getDependencyTree();
    const duplicates = await analyzer.findDuplicates();
    const updates = await analyzer.getAvailableUpdates();

    const data = {
      duplicates,
      stats: {
        dependencies: tree.dependencies.size,
        devDependencies: tree.devDependencies.size,
        duplicates: duplicates.length,
        updates: updates.length,
      },
      tree: {
        dependencies: Array.from(tree.dependencies.entries()).map(([name, dep]) => ({
          name,
          version: dep.version,
        })),
        devDependencies: Array.from(tree.devDependencies.entries()).map(([name, dep]) => ({
          name,
          version: dep.version,
        })),
      },
      updates,
    };

    const format = options.format || 'json';
    const output = options.output || `deps-report.${format}`;

    let content: string;
    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      case 'markdown':
        content = generateMarkdownReport(data);
        break;
      case 'csv':
        content = generateCsvReport(data);
        break;
      default:
        content = JSON.stringify(data, null, 2);
    }

    const outputPath = join(ctx.cwd, output);
    writeFileSync(outputPath, content, 'utf-8');

    ctx.logger.success(`✓ Report exported to: ${output}`);

    return { data: { output: outputPath }, status: 'ok' };
  } catch (error) {
    ctx.logger.error('Failed to export report', error as Error);
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

function getTypeIcon(type: string): string {
  switch (type) {
    case 'production':
      return '📦';
    case 'development':
      return '🔧';
    case 'peer':
      return '🔗';
    case 'optional':
      return '📎';
    default:
      return '📦';
  }
}

function getTypeColor(type: string): 'cyan' | 'gray' | 'yellow' | 'blue' {
  switch (type) {
    case 'production':
      return 'cyan';
    case 'development':
      return 'gray';
    case 'peer':
      return 'yellow';
    case 'optional':
      return 'blue';
    default:
      return 'cyan';
  }
}

function generateMarkdownReport(data: any): string {
  let md = '# Dependency Report\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += '## Summary\n\n';
  md += `- Total Dependencies: ${data.stats.dependencies}\n`;
  md += `- Dev Dependencies: ${data.stats.devDependencies}\n`;
  md += `- Duplicates: ${data.stats.duplicates}\n`;
  md += `- Available Updates: ${data.stats.updates}\n\n`;

  if (data.duplicates.length > 0) {
    md += '## Duplicates\n\n';
    for (const dup of data.duplicates) {
      md += `### ${dup.name}\n`;
      md += `- Versions: ${dup.versions.join(', ')}\n`;
      md += `- Locations: ${dup.locations.length}\n\n`;
    }
  }

  if (data.updates.length > 0) {
    md += '## Available Updates\n\n';
    for (const update of data.updates) {
      md += `### ${update.name}\n`;
      md += `- Current: ${update.current}\n`;
      md += `- Latest: ${update.latest}\n`;
      md += `- Breaking: ${update.breaking ? 'Yes ⚠️' : 'No'}\n\n`;
    }
  }

  return md;
}

function generateCsvReport(data: any): string {
  let csv = 'Name,Type,Current Version,Latest Version,Breaking\n';

  for (const dep of data.tree.dependencies) {
    const update = data.updates.find((u: any) => u.name === dep.name);
    csv += `${dep.name},production,${dep.version},${update?.latest || dep.version},${update?.breaking || false}\n`;
  }

  for (const dep of data.tree.devDependencies) {
    const update = data.updates.find((u: any) => u.name === dep.name);
    csv += `${dep.name},development,${dep.version},${update?.latest || dep.version},${update?.breaking || false}\n`;
  }

  return csv;
}
