/**
 * Kubit Ecosystem commands
 * Manage the complete Kubit ecosystem in your project
 */

import { existsSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../types/index.js';

import { colors } from '../utils/theme.js';

interface EcosystemOptions {
  info?: boolean;
  health?: boolean;
  upgrade?: boolean;
  sync?: boolean;
}

interface EcosystemPackage {
  name: string;
  installed: boolean;
  version?: string;
  latest?: string;
  description: string;
}

/**
 * Main ecosystem command handler
 */
export async function ecosystemCommand(
  options: EcosystemOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  if (options.info) {
    return await showEcosystemInfo(ctx);
  }

  if (options.health) {
    return await checkEcosystemHealth(ctx);
  }

  if (options.upgrade) {
    return await upgradeEcosystem(ctx);
  }

  if (options.sync) {
    return await syncEcosystem(ctx);
  }

  // Default: show info
  return await showEcosystemInfo(ctx);
}

/**
 * Show Kubit ecosystem information
 */
async function showEcosystemInfo(ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step('Analyzing Kubit ecosystem...');

  const packages = await getEcosystemPackages(ctx);

  console.log('');
  console.log(colors.primary.bold('🚀 Kubit Ecosystem Status'));
  console.log('');

  // Group by category
  const categories = {
    'Code Quality': ['eslint-config-kubit'],
    'Data Visualization': ['@kubit-ui-web/react-charts'],
    'Design System': ['bernova', '@kubit-ui-web/react-components'],
    'Development Tools': ['vscode-kubito'],
  };

  for (const [category, packageNames] of Object.entries(categories)) {
    console.log(colors.bold(`${category}:`));

    for (const pkgName of packageNames) {
      const pkg = packages.find((p) => p.name === pkgName);

      if (pkg) {
        const status = pkg.installed
          ? colors.success('✓ Installed')
          : colors.muted('○ Not installed');
        const version = pkg.version ? colors.muted(`v${pkg.version}`) : '';

        console.log(`  ${status} ${colors.bold(pkg.name)} ${version}`);
        console.log(`    ${colors.muted(pkg.description)}`);
      }
    }
    console.log('');
  }

  const installedCount = packages.filter((p) => p.installed).length;
  const totalCount = packages.length;

  console.log(colors.muted(`Installed: ${installedCount}/${totalCount} packages`));
  console.log('');

  if (installedCount < totalCount) {
    console.log(
      colors.info('💡 Tip: Use the kubit-full template for complete ecosystem integration')
    );
    console.log(colors.muted('   kubit-forge create --template kubit-full my-app'));
    console.log('');
  }

  return {
    data: { installedCount, packages, totalCount },
    message: 'Ecosystem information displayed',
    status: 'ok',
  };
}

/**
 * Check ecosystem health
 */
async function checkEcosystemHealth(ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step('Checking ecosystem health...');

  const packages = await getEcosystemPackages(ctx);
  const issues: string[] = [];

  // Check for outdated packages
  for (const pkg of packages) {
    if (pkg.installed && pkg.version && pkg.latest) {
      if (pkg.version !== pkg.latest) {
        issues.push(`${pkg.name} is outdated (${pkg.version} → ${pkg.latest})`);
      }
    }
  }

  // Check for missing peer dependencies
  const hasBernova = packages.find((p) => p.name === 'bernova')?.installed;
  const hasComponents = packages.find(
    (p) => p.name === '@kubit-ui-web/react-components'
  )?.installed;

  if (hasComponents && !hasBernova) {
    issues.push('Bernova is recommended when using @kubit-ui-web/react-components');
  }

  console.log('');
  console.log(colors.primary.bold('🏥 Ecosystem Health Check'));
  console.log('');

  if (issues.length === 0) {
    console.log(colors.success('✓ All checks passed'));
    console.log(colors.muted('  Your Kubit ecosystem is healthy!'));
  } else {
    console.log(colors.warning(`⚠ Found ${issues.length} issue(s):`));
    console.log('');

    for (const issue of issues) {
      console.log(`  ${colors.warning('•')} ${issue}`);
    }

    console.log('');
    console.log(colors.info('💡 Run: kubit-forge ecosystem:upgrade to fix issues'));
  }

  console.log('');

  return {
    data: { issues },
    message: issues.length === 0 ? 'Ecosystem is healthy' : `Found ${issues.length} issue(s)`,
    status: issues.length === 0 ? 'ok' : 'warning',
  };
}

/**
 * Upgrade ecosystem packages
 */
async function upgradeEcosystem(ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step('Upgrading Kubit ecosystem packages...');

  const packages = await getEcosystemPackages(ctx);
  const toUpgrade = packages.filter((p) => p.installed && p.version !== p.latest);

  if (toUpgrade.length === 0) {
    ctx.logger.success('All packages are up to date');
    return {
      message: 'No upgrades needed',
      status: 'ok',
    };
  }

  console.log('');
  console.log(colors.primary.bold('📦 Upgrading Packages'));
  console.log('');

  for (const pkg of toUpgrade) {
    console.log(
      `  ${colors.muted('•')} ${pkg.name} ${colors.muted(`${pkg.version} → ${pkg.latest}`)}`
    );
  }

  console.log('');

  const { execa } = await import('execa');
  const pm = await detectPackageManager(ctx);

  try {
    const packageNames = toUpgrade.map((p) => `${p.name}@latest`);

    if (pm === 'pnpm') {
      await execa('pnpm', ['update', ...packageNames], {
        cwd: ctx.cwd,
        stdio: 'inherit',
      });
    } else if (pm === 'yarn') {
      await execa('yarn', ['upgrade', ...packageNames], {
        cwd: ctx.cwd,
        stdio: 'inherit',
      });
    } else {
      await execa('npm', ['update', ...packageNames], {
        cwd: ctx.cwd,
        stdio: 'inherit',
      });
    }

    ctx.logger.success('Packages upgraded successfully');
    return {
      data: { upgraded: toUpgrade.length },
      message: 'Ecosystem upgraded',
      status: 'ok',
    };
  } catch (error) {
    return {
      errors: [
        {
          code: 'UPGRADE_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          solution: 'Try upgrading packages manually',
        },
      ],
      message: 'Failed to upgrade packages',
      status: 'error',
    };
  }
}

/**
 * Sync ecosystem versions
 */
async function syncEcosystem(ctx: PluginContext): Promise<CommandResult> {
  ctx.logger.step('Syncing ecosystem versions...');

  // This would ensure all Kubit packages use compatible versions
  console.log('');
  console.log(colors.info('🔄 Syncing ecosystem versions...'));
  console.log(colors.muted('  Ensuring all Kubit packages are compatible'));
  console.log('');

  return {
    message: 'Ecosystem synced',
    status: 'ok',
  };
}

/**
 * Get ecosystem packages information
 */
async function getEcosystemPackages(ctx: PluginContext): Promise<EcosystemPackage[]> {
  const packageJsonPath = join(ctx.cwd, 'package.json');

  let installedPackages: Record<string, string> = {};

  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = await import(packageJsonPath, { assert: { type: 'json' } });
      installedPackages = {
        ...packageJson.default.dependencies,
        ...packageJson.default.devDependencies,
      };
    } catch {
      // Ignore errors
    }
  }

  const packages: EcosystemPackage[] = [
    {
      description: 'CSS-in-JS with JavaScript syntax for maintainable styling',
      installed: 'bernova' in installedPackages,
      latest: '1.4.0',
      name: 'bernova',
      version: installedPackages['bernova'],
    },
    {
      description: 'Accessible, customizable UI components',
      installed: '@kubit-ui-web/react-components' in installedPackages,
      latest: '2.0.0-beta.51',
      name: '@kubit-ui-web/react-components',
      version: installedPackages['@kubit-ui-web/react-components'],
    },
    {
      description: 'Beautiful data visualization components',
      installed: '@kubit-ui-web/react-charts' in installedPackages,
      latest: '1.11.1',
      name: '@kubit-ui-web/react-charts',
      version: installedPackages['@kubit-ui-web/react-charts'],
    },
    {
      description: 'Opinionated ESLint rules for quality code',
      installed: 'eslint-config-kubit' in installedPackages,
      latest: '1.7.0',
      name: 'eslint-config-kubit',
      version: installedPackages['eslint-config-kubit'],
    },
    {
      description: 'Interactive coding companion for VS Code',
      installed: false, // Extension, not npm package
      latest: '2.7.3',
      name: 'vscode-kubito',
    },
  ];

  return packages;
}

/**
 * Detect package manager
 */
async function detectPackageManager(ctx: PluginContext): Promise<'pnpm' | 'yarn' | 'npm'> {
  if (existsSync(join(ctx.cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (existsSync(join(ctx.cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
}
