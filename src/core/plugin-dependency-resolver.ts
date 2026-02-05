/**
 * Plugin Dependency Resolver
 *
 * Resolves plugin dependencies, checks compatibility, and determines load order.
 */

import type { Logger } from '../types/index.js';

export interface PluginDependency {
  name: string;
  version: string;
  optional?: boolean;
  reason?: string;
}

export interface PluginMetadata {
  name: string;
  version: string;
  dependencies?: PluginDependency[];
  peerDependencies?: PluginDependency[];
  conflicts?: string[];
}

export interface DependencyGraph {
  nodes: Map<string, PluginMetadata>;
  edges: Map<string, Set<string>>;
}

export interface ResolutionResult {
  loadOrder: string[];
  errors: string[];
  warnings: string[];
  missing: PluginDependency[];
  conflicts: Array<{ plugin: string; conflictsWith: string }>;
}

export class PluginDependencyResolver {
  private logger: Logger;
  private plugins: Map<string, PluginMetadata> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Register plugin metadata
   */
  register(metadata: PluginMetadata): void {
    this.plugins.set(metadata.name, metadata);
    this.logger.debug(`Registered plugin metadata: ${metadata.name}@${metadata.version}`);
  }

  /**
   * Resolve dependencies and determine load order
   */
  resolve(pluginNames: string[]): ResolutionResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missing: PluginDependency[] = [];
    const conflicts: Array<{ plugin: string; conflictsWith: string }> = [];

    // Build dependency graph
    const graph = this.buildDependencyGraph(pluginNames);

    // Check for missing dependencies
    for (const pluginName of pluginNames) {
      const metadata = this.plugins.get(pluginName);
      if (!metadata) {
        // Plugin metadata not registered - it might not be installed
        // This is a warning, not an error, to allow CLI to work without plugins
        warnings.push(`Plugin '${pluginName}' not found (not installed or not registered)`);
        continue;
      }

      // Check required dependencies
      if (metadata.dependencies) {
        for (const dep of metadata.dependencies) {
          if (!this.plugins.has(dep.name)) {
            if (dep.optional) {
              warnings.push(
                `Optional dependency '${dep.name}' for '${pluginName}' is not installed`
              );
            } else {
              errors.push(`Required dependency '${dep.name}' for '${pluginName}' is not installed`);
              missing.push(dep);
            }
          }
        }
      }

      // Check peer dependencies
      if (metadata.peerDependencies) {
        for (const peer of metadata.peerDependencies) {
          if (!this.plugins.has(peer.name)) {
            warnings.push(`Peer dependency '${peer.name}' for '${pluginName}' is not installed`);
            if (!peer.optional) {
              missing.push(peer);
            }
          }
        }
      }

      // Check conflicts
      if (metadata.conflicts) {
        for (const conflict of metadata.conflicts) {
          if (this.plugins.has(conflict)) {
            errors.push(`Plugin '${pluginName}' conflicts with '${conflict}'`);
            conflicts.push({ conflictsWith: conflict, plugin: pluginName });
          }
        }
      }
    }

    // Detect circular dependencies
    const circular = this.detectCircularDependencies(graph);
    if (circular.length > 0) {
      errors.push(`Circular dependencies detected: ${circular.join(' -> ')}`);
    }

    // Calculate load order using topological sort
    let loadOrder: string[] = [];
    if (errors.length === 0) {
      try {
        loadOrder = this.topologicalSort(graph);
      } catch (error) {
        errors.push(
          `Failed to resolve load order: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return {
      conflicts,
      errors,
      loadOrder,
      missing,
      warnings,
    };
  }

  /**
   * Build dependency graph
   */
  private buildDependencyGraph(pluginNames: string[]): DependencyGraph {
    const nodes = new Map<string, PluginMetadata>();
    const edges = new Map<string, Set<string>>();

    const visited = new Set<string>();
    const queue = [...pluginNames];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) {
        continue;
      }

      visited.add(current);
      const metadata = this.plugins.get(current);

      if (!metadata) {
        continue;
      }

      nodes.set(current, metadata);

      // Add edges for dependencies
      if (metadata.dependencies) {
        for (const dep of metadata.dependencies) {
          if (!edges.has(current)) {
            edges.set(current, new Set());
          }
          edges.get(current)!.add(dep.name);

          // Add dependency to queue
          if (!visited.has(dep.name)) {
            queue.push(dep.name);
          }
        }
      }

      // Add edges for peer dependencies
      if (metadata.peerDependencies) {
        for (const peer of metadata.peerDependencies) {
          if (!edges.has(current)) {
            edges.set(current, new Set());
          }
          edges.get(current)!.add(peer.name);

          if (!visited.has(peer.name)) {
            queue.push(peer.name);
          }
        }
      }
    }

    return { edges, nodes };
  }

  /**
   * Detect circular dependencies
   */
  private detectCircularDependencies(graph: DependencyGraph): string[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const dependencies = graph.edges.get(node) || new Set();
      for (const dep of dependencies) {
        if (!visited.has(dep)) {
          if (dfs(dep)) {
            return true;
          }
        } else if (recursionStack.has(dep)) {
          // Found cycle
          return true;
        }
      }

      recursionStack.delete(node);
      path.pop();
      return false;
    };

    for (const node of graph.nodes.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) {
          return path;
        }
      }
    }

    return [];
  }

  /**
   * Topological sort to determine load order
   */
  private topologicalSort(graph: DependencyGraph): string[] {
    const inDegree = new Map<string, number>();
    const result: string[] = [];

    // Initialize in-degree
    for (const node of graph.nodes.keys()) {
      inDegree.set(node, 0);
    }

    // Calculate in-degree
    for (const dependencies of graph.edges.values()) {
      for (const dep of dependencies) {
        if (graph.nodes.has(dep)) {
          inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
        }
      }
    }

    // Queue nodes with in-degree 0
    const queue: string[] = [];
    for (const [node, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(node);
      }
    }

    // Process queue
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const dependencies = graph.edges.get(current) || new Set();
      for (const dep of dependencies) {
        if (!graph.nodes.has(dep)) {
          continue;
        }

        const newDegree = (inDegree.get(dep) || 0) - 1;
        inDegree.set(dep, newDegree);

        if (newDegree === 0) {
          queue.push(dep);
        }
      }
    }

    // Check if all nodes were processed
    if (result.length !== graph.nodes.size) {
      throw new Error('Circular dependency detected');
    }

    return result.reverse(); // Reverse to get correct load order
  }

  /**
   * Get dependency tree for a plugin
   */
  getDependencyTree(pluginName: string): DependencyTree {
    const metadata = this.plugins.get(pluginName);
    if (!metadata) {
      return { dependencies: [], name: pluginName, version: 'unknown' };
    }

    const tree: DependencyTree = {
      dependencies: [],
      name: metadata.name,
      version: metadata.version,
    };

    if (metadata.dependencies) {
      for (const dep of metadata.dependencies) {
        const depTree = this.getDependencyTree(dep.name);
        tree.dependencies.push(depTree);
      }
    }

    return tree;
  }

  /**
   * Get all dependencies (flat list)
   */
  getAllDependencies(pluginName: string): Set<string> {
    const dependencies = new Set<string>();
    const visited = new Set<string>();

    const traverse = (name: string) => {
      if (visited.has(name)) {
        return;
      }

      visited.add(name);
      const metadata = this.plugins.get(name);

      if (!metadata) {
        return;
      }

      if (metadata.dependencies) {
        for (const dep of metadata.dependencies) {
          dependencies.add(dep.name);
          traverse(dep.name);
        }
      }

      if (metadata.peerDependencies) {
        for (const peer of metadata.peerDependencies) {
          dependencies.add(peer.name);
          traverse(peer.name);
        }
      }
    };

    traverse(pluginName);
    return dependencies;
  }

  /**
   * Check if plugin can be safely unloaded
   */
  canUnload(pluginName: string): { canUnload: boolean; blockedBy: string[] } {
    const blockedBy: string[] = [];

    // Check if any loaded plugin depends on this one
    for (const [name] of this.plugins.entries()) {
      if (name === pluginName) {
        continue;
      }

      const deps = this.getAllDependencies(name);
      if (deps.has(pluginName)) {
        blockedBy.push(name);
      }
    }

    return {
      blockedBy,
      canUnload: blockedBy.length === 0,
    };
  }

  /**
   * Get plugins that depend on a specific plugin
   */
  getDependents(pluginName: string): string[] {
    const dependents: string[] = [];

    for (const [name] of this.plugins.entries()) {
      if (name === pluginName) {
        continue;
      }

      const metadata = this.plugins.get(name);
      if (!metadata) {
        continue;
      }

      if (metadata.dependencies) {
        const hasDep = metadata.dependencies.some((dep) => dep.name === pluginName);
        if (hasDep) {
          dependents.push(name);
        }
      }

      if (metadata.peerDependencies) {
        const hasPeer = metadata.peerDependencies.some((peer) => peer.name === pluginName);
        if (hasPeer) {
          dependents.push(name);
        }
      }
    }

    return dependents;
  }

  /**
   * Clear all registered plugins
   */
  clear(): void {
    this.plugins.clear();
  }

  /**
   * Get statistics
   */
  getStats() {
    let totalDeps = 0;
    let totalPeerDeps = 0;
    let totalConflicts = 0;

    for (const metadata of this.plugins.values()) {
      totalDeps += metadata.dependencies?.length || 0;
      totalPeerDeps += metadata.peerDependencies?.length || 0;
      totalConflicts += metadata.conflicts?.length || 0;
    }

    return {
      totalConflicts: totalConflicts,
      totalDependencies: totalDeps,
      totalPeerDependencies: totalPeerDeps,
      totalPlugins: this.plugins.size,
    };
  }
}

export interface DependencyTree {
  name: string;
  version: string;
  dependencies: DependencyTree[];
}
