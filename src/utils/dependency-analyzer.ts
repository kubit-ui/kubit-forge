import { execa } from 'execa';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import semver from 'semver';

export interface DependencyNode {
  name: string;
  version: string;
  required?: string;
  resolved?: string;
  dependencies?: Map<string, DependencyNode>;
  dev?: boolean;
  location?: string;
  peerDependencies?: string[];
  optional?: boolean;
}

export interface DependencyTree {
  name: string;
  version: string;
  dependencies: Map<string, DependencyNode>;
  devDependencies: Map<string, DependencyNode>;
}

export interface DependencyWhy {
  name: string;
  version: string;
  requestedBy: Array<{
    name: string;
    type: 'production' | 'development' | 'peer' | 'optional';
    versionRequirement: string;
  }>;
  installedVersion: string;
  location: string;
}

export interface DuplicateInfo {
  name: string;
  versions: string[];
  locations: string[];
  potentialSavings: number;
}

export interface UpdateInfo {
  name: string;
  current: string;
  wanted: string;
  latest: string;
  breaking: boolean;
  type: 'production' | 'development';
  securityVulnerabilities?: number;
  changelogUrl?: string;
}

export interface AlternativePackage {
  name: string;
  description: string;
  downloads: number;
  stars: number;
  maintained: boolean;
  size: string;
  reason: string;
  migrationGuide?: string;
}

export class DependencyAnalyzer {
  constructor(
    private cwd: string,
    private packageManager: 'npm' | 'yarn' | 'pnpm' = 'pnpm'
  ) {}

  /**
   * Get the full dependency tree
   */
  async getDependencyTree(): Promise<DependencyTree> {
    const packageJsonPath = join(this.cwd, 'package.json');
    if (!existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }

    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    let treeData: any;

    try {
      switch (this.packageManager) {
        case 'pnpm':
          treeData = await this.getPnpmTree();
          break;
        case 'yarn':
          treeData = await this.getYarnTree();
          break;
        case 'npm':
          treeData = await this.getNpmTree();
          break;
      }
    } catch (error) {
      // Fallback to package.json parsing
      treeData = this.parsePackageJson(pkg);
    }

    return treeData;
  }

  /**
   * Find why a package is installed
   */
  async whyPackage(packageName: string): Promise<DependencyWhy> {
    const packageJsonPath = join(this.cwd, 'package.json');
    if (!existsSync(packageJsonPath)) {
      throw new Error('package.json not found');
    }

    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const requestedBy: DependencyWhy['requestedBy'] = [];

    // Check direct dependencies
    if (pkg.dependencies && pkg.dependencies[packageName]) {
      requestedBy.push({
        name: pkg.name,
        type: 'production',
        versionRequirement: pkg.dependencies[packageName],
      });
    }

    if (pkg.devDependencies && pkg.devDependencies[packageName]) {
      requestedBy.push({
        name: pkg.name,
        type: 'development',
        versionRequirement: pkg.devDependencies[packageName],
      });
    }

    if (pkg.peerDependencies && pkg.peerDependencies[packageName]) {
      requestedBy.push({
        name: pkg.name,
        type: 'peer',
        versionRequirement: pkg.peerDependencies[packageName],
      });
    }

    if (pkg.optionalDependencies && pkg.optionalDependencies[packageName]) {
      requestedBy.push({
        name: pkg.name,
        type: 'optional',
        versionRequirement: pkg.optionalDependencies[packageName],
      });
    }

    // Get installed version from node_modules
    const installedVersion = await this.getInstalledVersion(packageName);
    const location = join(this.cwd, 'node_modules', packageName);

    // If not direct, check transitive dependencies
    if (requestedBy.length === 0) {
      const transitiveReasons = await this.findTransitiveDependencies(packageName);
      requestedBy.push(...transitiveReasons);
    }

    return {
      installedVersion,
      location,
      name: packageName,
      requestedBy,
      version: installedVersion,
    };
  }

  /**
   * Find duplicate dependencies
   */
  async findDuplicates(): Promise<DuplicateInfo[]> {
    const duplicates: Map<string, DuplicateInfo> = new Map();

    try {
      let result: any;

      switch (this.packageManager) {
        case 'pnpm':
          result = await execa('pnpm', ['list', '--json', '--depth', 'Infinity'], {
            cwd: this.cwd,
          });
          break;
        case 'npm':
          result = await execa('npm', ['list', '--json', '--all'], {
            cwd: this.cwd,
          });
          break;
        case 'yarn':
          result = await execa('yarn', ['list', '--json'], { cwd: this.cwd });
          break;
      }

      const data = JSON.parse(result.stdout);
      this.analyzeDuplicatesFromTree(data, duplicates);
    } catch (error) {
      // Fallback: scan node_modules manually
      return this.scanNodeModulesForDuplicates();
    }

    return Array.from(duplicates.values()).filter((d) => d.versions.length > 1);
  }

  /**
   * Get available updates
   */
  async getAvailableUpdates(): Promise<UpdateInfo[]> {
    const updates: UpdateInfo[] = [];
    const packageJsonPath = join(this.cwd, 'package.json');

    if (!existsSync(packageJsonPath)) {
      return updates;
    }

    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Check production dependencies
    if (pkg.dependencies) {
      for (const [name, version] of Object.entries(pkg.dependencies)) {
        const updateInfo = await this.checkPackageUpdates(name, version as string, 'production');
        if (updateInfo) {
          updates.push(updateInfo);
        }
      }
    }

    // Check dev dependencies
    if (pkg.devDependencies) {
      for (const [name, version] of Object.entries(pkg.devDependencies)) {
        const updateInfo = await this.checkPackageUpdates(name, version as string, 'development');
        if (updateInfo) {
          updates.push(updateInfo);
        }
      }
    }

    return updates;
  }

  /**
   * Get alternative packages
   */
  async getAlternatives(packageName: string): Promise<AlternativePackage[]> {
    const alternatives: AlternativePackage[] = [];

    // Database of known alternatives (extensible)
    const knownAlternatives: Record<string, AlternativePackage[]> = {
      axios: [
        {
          description: 'Modern fetch API with better defaults',
          downloads: 1000000,
          maintained: true,
          name: 'ky',
          reason: 'Smaller bundle, modern API, better TypeScript support',
          size: '11.2 kB',
          stars: 12000,
        },
        {
          description: 'Minimal HTTP client',
          downloads: 500000,
          maintained: true,
          name: 'redaxios',
          reason: 'Axios API with smaller footprint',
          size: '0.8 kB',
          stars: 4000,
        },
      ],
      lodash: [
        {
          description: 'Utility functions with better tree-shaking',
          downloads: 8000000,
          maintained: true,
          name: 'lodash-es',
          reason: 'ES modules version for better tree-shaking',
          size: '24 kB',
          stars: 58000,
        },
        {
          description: 'Modern utility library',
          downloads: 2000000,
          maintained: true,
          name: 'remeda',
          reason: 'TypeScript-first, tree-shakeable, smaller API surface',
          size: '12 kB',
          stars: 3000,
        },
      ],
      moment: [
        {
          description: 'Modern date library',
          downloads: 15000000,
          maintained: true,
          migrationGuide: 'https://date-fns.org/v2.29.3/docs/Getting-Started',
          name: 'date-fns',
          reason: 'Tree-shakeable, smaller bundle size, no locale loading required',
          size: '76.9 kB',
          stars: 32000,
        },
        {
          description: 'Immutable date library',
          downloads: 10000000,
          maintained: true,
          name: 'dayjs',
          reason: '2kB alternative with same API as moment',
          size: '6.5 kB',
          stars: 45000,
        },
      ],
      'node-sass': [
        {
          description: 'Pure JavaScript Sass compiler',
          downloads: 8000000,
          maintained: true,
          name: 'sass',
          reason: 'Official Sass implementation, better maintained, no native dependencies',
          size: '3.8 MB',
          stars: 3000,
        },
      ],
      request: [
        {
          description: 'Promise-based HTTP client',
          downloads: 30000000,
          maintained: true,
          name: 'axios',
          reason: 'request is deprecated, axios is the modern replacement',
          size: '13 kB',
          stars: 103000,
        },
        {
          description: 'Minimal HTTP client',
          downloads: 50000000,
          maintained: true,
          name: 'node-fetch',
          reason: 'Brings fetch API to Node.js',
          size: '18 kB',
          stars: 8000,
        },
      ],
    };

    // Check if we have alternatives for this package
    if (knownAlternatives[packageName]) {
      alternatives.push(...knownAlternatives[packageName]);
    }

    // Try to fetch from npm registry (for additional suggestions)
    try {
      const similar = await this.searchSimilarPackages(packageName);
      alternatives.push(...similar);
    } catch {
      // Ignore errors from npm registry
    }

    return alternatives;
  }

  /**
   * Deduplicate dependencies
   */
  async deduplicate(): Promise<{
    before: number;
    after: number;
    saved: string;
  }> {
    const beforeCount = await this.countTotalDependencies();

    try {
      switch (this.packageManager) {
        case 'pnpm':
          await execa('pnpm', ['dedupe'], { cwd: this.cwd });
          break;
        case 'npm':
          await execa('npm', ['dedupe'], { cwd: this.cwd });
          break;
        case 'yarn':
          await execa('yarn', ['dedupe'], { cwd: this.cwd });
          break;
      }
    } catch (error) {
      throw new Error(`Failed to deduplicate: ${error}`, { cause: error });
    }

    const afterCount = await this.countTotalDependencies();
    const saved = `${((1 - afterCount / beforeCount) * 100).toFixed(1)}%`;

    return { after: afterCount, before: beforeCount, saved };
  }

  // ========== Private Helper Methods ==========

  private async getPnpmTree(): Promise<DependencyTree> {
    const result = await execa('pnpm', ['list', '--json', '--depth', 'Infinity'], {
      cwd: this.cwd,
    });
    const data = JSON.parse(result.stdout);
    return this.parsePnpmTree(data[0]);
  }

  private async getYarnTree(): Promise<DependencyTree> {
    const result = await execa('yarn', ['list', '--json'], { cwd: this.cwd });
    const lines = result.stdout.split('\n').filter(Boolean);
    const data = JSON.parse(lines[lines.length - 1]);
    return this.parseYarnTree(data);
  }

  private async getNpmTree(): Promise<DependencyTree> {
    const result = await execa('npm', ['list', '--json', '--all'], {
      cwd: this.cwd,
    });
    const data = JSON.parse(result.stdout);
    return this.parseNpmTree(data);
  }

  private parsePackageJson(pkg: any): DependencyTree {
    const dependencies = new Map<string, DependencyNode>();
    const devDependencies = new Map<string, DependencyNode>();

    if (pkg.dependencies) {
      for (const [name, version] of Object.entries(pkg.dependencies)) {
        dependencies.set(name, {
          name,
          version: String(version).replace(/^[\^~]/, ''),
          required: String(version),
        });
      }
    }

    if (pkg.devDependencies) {
      for (const [name, version] of Object.entries(pkg.devDependencies)) {
        devDependencies.set(name, {
          name,
          version: String(version).replace(/^[\^~]/, ''),
          required: String(version),
          dev: true,
        });
      }
    }

    return {
      dependencies,
      devDependencies,
      name: pkg.name,
      version: pkg.version,
    };
  }

  private parsePnpmTree(data: any): DependencyTree {
    const tree: DependencyTree = {
      dependencies: new Map(),
      devDependencies: new Map(),
      name: data.name,
      version: data.version,
    };

    if (data.dependencies) {
      for (const [name, dep] of Object.entries(data.dependencies)) {
        tree.dependencies.set(name, this.parseDependencyNode(dep));
      }
    }

    if (data.devDependencies) {
      for (const [name, dep] of Object.entries(data.devDependencies)) {
        tree.devDependencies.set(name, this.parseDependencyNode(dep));
      }
    }

    return tree;
  }

  private parseYarnTree(data: any): DependencyTree {
    return this.parsePnpmTree(data); // Similar structure
  }

  private parseNpmTree(data: any): DependencyTree {
    return this.parsePnpmTree(data); // Similar structure
  }

  private parseDependencyNode(dep: any): DependencyNode {
    const node: DependencyNode = {
      dependencies: new Map(),
      name: dep.from || '',
      required: dep.required,
      resolved: dep.resolved,
      version: dep.version || '',
    };

    if (dep.dependencies) {
      for (const [name, childDep] of Object.entries(dep.dependencies)) {
        node.dependencies!.set(name, this.parseDependencyNode(childDep));
      }
    }

    return node;
  }

  private async getInstalledVersion(packageName: string): Promise<string> {
    try {
      const pkgPath = join(this.cwd, 'node_modules', packageName, 'package.json');
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        return pkg.version;
      }
    } catch {
      // Ignore
    }
    return 'unknown';
  }

  private async findTransitiveDependencies(
    packageName: string
  ): Promise<DependencyWhy['requestedBy']> {
    const requestedBy: DependencyWhy['requestedBy'] = [];
    const tree = await this.getDependencyTree();

    const searchInTree = (deps: Map<string, DependencyNode>, parentName: string) => {
      for (const [name, node] of deps.entries()) {
        if (node.dependencies) {
          if (node.dependencies.has(packageName)) {
            requestedBy.push({
              name: parentName + ' → ' + name,
              type: 'production',
              versionRequirement: node.dependencies.get(packageName)?.version || '*',
            });
          }
          searchInTree(node.dependencies, parentName + ' → ' + name);
        }
      }
    };

    searchInTree(tree.dependencies, tree.name);
    searchInTree(tree.devDependencies, tree.name);

    return requestedBy;
  }

  private analyzeDuplicatesFromTree(data: any, duplicates: Map<string, DuplicateInfo>) {
    const seen = new Map<string, Set<string>>();

    const traverse = (node: any, path: string) => {
      if (!node.dependencies) {
        return;
      }

      for (const [name, dep] of Object.entries(node.dependencies as any)) {
        const version = (dep as any).version;
        if (!seen.has(name)) {
          seen.set(name, new Set());
        }
        seen.get(name)!.add(version);

        if (!duplicates.has(name)) {
          duplicates.set(name, {
            locations: [],
            name,
            potentialSavings: 0,
            versions: [],
          });
        }

        const info = duplicates.get(name)!;
        if (!info.versions.includes(version)) {
          info.versions.push(version);
        }
        if (!info.locations.includes(path)) {
          info.locations.push(path);
        }

        traverse(dep, `${path} → ${name}@${version}`);
      }
    };

    traverse(data, data.name);
  }

  private async scanNodeModulesForDuplicates(): Promise<DuplicateInfo[]> {
    // Simplified fallback - in real implementation would scan node_modules
    return [];
  }

  private async checkPackageUpdates(
    name: string,
    currentVersion: string,
    type: 'production' | 'development'
  ): Promise<UpdateInfo | null> {
    try {
      // Clean version string
      const cleanVersion = currentVersion.replace(/^[\^~]/, '');

      // Get package info from registry
      const result = await execa('npm', ['view', name, 'version', '--json'], {
        cwd: this.cwd,
      });
      const latest = result.stdout.replace(/"/g, '');

      // Determine wanted version (respects semver range)
      const wanted = semver.maxSatisfying([latest], currentVersion) || latest;

      // Check if breaking change
      const breaking = semver.major(latest) > semver.major(cleanVersion);

      // Only return if there's an update available
      if (semver.gt(latest, cleanVersion)) {
        return {
          breaking,
          changelogUrl: `https://www.npmjs.com/package/${name}?activeTab=versions`,
          current: cleanVersion,
          latest,
          name,
          type,
          wanted,
        };
      }
    } catch {
      // Ignore errors (package might not be in registry)
    }

    return null;
  }

  private async searchSimilarPackages(_packageName: string): Promise<AlternativePackage[]> {
    // This would query npm registry API for similar packages
    // Simplified implementation
    return [];
  }

  private async countTotalDependencies(): Promise<number> {
    try {
      const result = await execa('find', ['node_modules', '-type', 'd', '-maxdepth', '1'], {
        cwd: this.cwd,
      });
      return result.stdout.split('\n').length - 2; // Exclude node_modules itself and empty line
    } catch {
      return 0;
    }
  }
}
