/**
 * Plugin Version Manager
 *
 * Manages plugin versions, compatibility checks, and version resolution.
 */

import { satisfies, valid, coerce, gt, lt, eq } from 'semver';

import type { Logger } from '../types/index.js';

export interface PluginVersion {
  name: string;
  version: string;
  installedVersion?: string;
  requiredVersion?: string;
  compatible: boolean;
  updateAvailable?: boolean;
  latestVersion?: string;
}

export interface VersionConstraint {
  plugin: string;
  version: string;
  reason?: string;
}

export interface CompatibilityCheck {
  compatible: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

export class PluginVersionManager {
  private logger: Logger;
  private installedVersions: Map<string, string> = new Map();
  private requiredVersions: Map<string, string> = new Map();
  private latestVersions: Map<string, string> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Register installed plugin version
   */
  registerInstalled(pluginName: string, version: string): void {
    const normalized = this.normalizeVersion(version);
    if (!normalized) {
      this.logger.warn(`Invalid version for plugin '${pluginName}': ${version}`);
      return;
    }

    this.installedVersions.set(pluginName, normalized);
    this.logger.debug(`Registered plugin '${pluginName}' version ${normalized}`);
  }

  /**
   * Set required version for plugin
   */
  setRequired(pluginName: string, versionRange: string): void {
    this.requiredVersions.set(pluginName, versionRange);
    this.logger.debug(`Set required version for '${pluginName}': ${versionRange}`);
  }

  /**
   * Set latest available version
   */
  setLatest(pluginName: string, version: string): void {
    const normalized = this.normalizeVersion(version);
    if (normalized) {
      this.latestVersions.set(pluginName, normalized);
    }
  }

  /**
   * Check if plugin version satisfies requirement
   */
  satisfies(pluginName: string, versionRange: string): boolean {
    const installed = this.installedVersions.get(pluginName);
    if (!installed) {
      return false;
    }

    try {
      return satisfies(installed, versionRange);
    } catch {
      this.logger.warn(`Invalid version range for '${pluginName}': ${versionRange}`);
      return false;
    }
  }

  /**
   * Check compatibility of plugin
   */
  checkCompatibility(pluginName: string): CompatibilityCheck {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    const installed = this.installedVersions.get(pluginName);
    const required = this.requiredVersions.get(pluginName);
    const latest = this.latestVersions.get(pluginName);

    // Check if installed
    if (!installed) {
      issues.push(`Plugin '${pluginName}' is not installed`);
      return { compatible: false, issues, recommendations, warnings };
    }

    // Check required version
    if (required && !this.satisfies(pluginName, required)) {
      issues.push(
        `Plugin '${pluginName}' version ${installed} does not satisfy requirement ${required}`
      );
    }

    // Check for updates
    if (latest && gt(latest, installed)) {
      warnings.push(`Plugin '${pluginName}' has an update available: ${installed} → ${latest}`);
      recommendations.push(`Run: kubit-forge plugin:update ${pluginName}`);
    }

    // Check if version is very old (major version behind)
    if (latest) {
      const installedMajor = parseInt(installed.split('.')[0], 10);
      const latestMajor = parseInt(latest.split('.')[0], 10);

      if (latestMajor > installedMajor + 1) {
        warnings.push(
          `Plugin '${pluginName}' is ${latestMajor - installedMajor} major versions behind`
        );
        recommendations.push(`Consider upgrading to version ${latest}`);
      }
    }

    return {
      compatible: issues.length === 0,
      issues,
      recommendations,
      warnings,
    };
  }

  /**
   * Get plugin version info
   */
  getVersionInfo(pluginName: string): PluginVersion {
    const installed = this.installedVersions.get(pluginName);
    const required = this.requiredVersions.get(pluginName);
    const latest = this.latestVersions.get(pluginName);

    const compatible = required ? this.satisfies(pluginName, required) : true;
    const updateAvailable = installed && latest ? gt(latest, installed) : false;

    return {
      compatible,
      installedVersion: installed,
      latestVersion: latest,
      name: pluginName,
      requiredVersion: required,
      updateAvailable,
      version: installed || 'not-installed',
    };
  }

  /**
   * Get all plugin versions
   */
  getAllVersions(): PluginVersion[] {
    const allPlugins = new Set([
      ...this.installedVersions.keys(),
      ...this.requiredVersions.keys(),
      ...this.latestVersions.keys(),
    ]);

    return Array.from(allPlugins).map((plugin) => this.getVersionInfo(plugin));
  }

  /**
   * Check if update is available
   */
  hasUpdate(pluginName: string): boolean {
    const installed = this.installedVersions.get(pluginName);
    const latest = this.latestVersions.get(pluginName);

    if (!installed || !latest) {
      return false;
    }

    return gt(latest, installed);
  }

  /**
   * Get plugins with updates available
   */
  getUpdatablePlugins(): PluginVersion[] {
    return this.getAllVersions().filter((p) => p.updateAvailable);
  }

  /**
   * Get incompatible plugins
   */
  getIncompatiblePlugins(): PluginVersion[] {
    return this.getAllVersions().filter((p) => !p.compatible);
  }

  /**
   * Resolve version conflicts
   */
  resolveConflicts(constraints: VersionConstraint[]): {
    resolved: Map<string, string>;
    conflicts: string[];
  } {
    const resolved = new Map<string, string>();
    const conflicts: string[] = [];

    // Group constraints by plugin
    const byPlugin = new Map<string, VersionConstraint[]>();
    for (const constraint of constraints) {
      if (!byPlugin.has(constraint.plugin)) {
        byPlugin.set(constraint.plugin, []);
      }
      byPlugin.get(constraint.plugin)!.push(constraint);
    }

    // Resolve each plugin
    for (const [plugin, pluginConstraints] of byPlugin.entries()) {
      if (pluginConstraints.length === 1) {
        // Single constraint, easy
        resolved.set(plugin, pluginConstraints[0].version);
        continue;
      }

      // Multiple constraints, find compatible version
      const versions = pluginConstraints.map((c) => c.version);
      const compatible = this.findCompatibleVersion(versions);

      if (compatible) {
        resolved.set(plugin, compatible);
      } else {
        conflicts.push(
          `Cannot resolve version for '${plugin}': ${versions.join(', ')} are incompatible`
        );
      }
    }

    return { conflicts, resolved };
  }

  /**
   * Find compatible version from multiple constraints
   */
  private findCompatibleVersion(versionRanges: string[]): string | null {
    // Get all installed versions that satisfy all ranges
    const candidates: string[] = [];

    // For simplicity, try to find a version that satisfies all ranges
    // In a real implementation, this would use a proper SAT solver
    for (const range of versionRanges) {
      const normalized = this.normalizeVersion(range);
      if (normalized && candidates.length === 0) {
        candidates.push(normalized);
      }
    }

    // Check if candidate satisfies all ranges
    for (const candidate of candidates) {
      const satisfiesAll = versionRanges.every((range) => {
        try {
          return satisfies(candidate, range);
        } catch {
          return false;
        }
      });

      if (satisfiesAll) {
        return candidate;
      }
    }

    return null;
  }

  /**
   * Normalize version string
   */
  private normalizeVersion(version: string): string | null {
    // Try to parse as valid semver
    if (valid(version)) {
      return version;
    }

    // Try to coerce
    const coerced = coerce(version);
    if (coerced) {
      return coerced.version;
    }

    return null;
  }

  /**
   * Compare two versions
   */
  compare(version1: string, version2: string): number {
    const v1 = this.normalizeVersion(version1);
    const v2 = this.normalizeVersion(version2);

    if (!v1 || !v2) {
      return 0;
    }

    if (gt(v1, v2)) {
      return 1;
    }
    if (lt(v1, v2)) {
      return -1;
    }
    return 0;
  }

  /**
   * Check if version is equal
   */
  isEqual(version1: string, version2: string): boolean {
    const v1 = this.normalizeVersion(version1);
    const v2 = this.normalizeVersion(version2);

    if (!v1 || !v2) {
      return false;
    }

    return eq(v1, v2);
  }

  /**
   * Get version statistics
   */
  getStats() {
    const all = this.getAllVersions();
    return {
      compatible: all.filter((p) => p.compatible).length,
      incompatible: all.filter((p) => !p.compatible).length,
      installed: all.filter((p) => p.installedVersion).length,
      totalPlugins: all.length,
      updatable: all.filter((p) => p.updateAvailable).length,
    };
  }

  /**
   * Clear all version data
   */
  clear(): void {
    this.installedVersions.clear();
    this.requiredVersions.clear();
    this.latestVersions.clear();
  }
}
