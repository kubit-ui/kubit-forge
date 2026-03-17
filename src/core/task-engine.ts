import type { Logger } from '../types/index.js';

/**
 * Task definition with inputs/outputs for caching
 */
export interface Task {
  name: string;
  description: string;
  inputs: {
    files?: string[];
    config?: string[];
    env?: string[];
    dependencies?: string[];
  };
  outputs: {
    files?: string[];
    artifacts?: string[];
  };
  cacheable: boolean;
  parallel?: boolean;
  dependsOn?: string[];
  execute: () => Promise<TaskResult>;
}

/**
 * Task execution result
 */
export interface TaskResult {
  success: boolean;
  cached?: boolean;
  duration?: number;
  outputs?: string[];
  error?: string;
}

/**
 * Task graph node
 */
interface TaskNode {
  task: Task;
  dependencies: Set<string>;
  dependents: Set<string>;
}

/**
 * Task execution engine with DAG and intelligent caching
 *
 * Features:
 * - DAG-based task execution
 * - Parallel execution where possible
 * - Input/output tracking for cache
 * - Task contracts for reproducibility
 */
export class TaskEngine {
  private logger: Logger;
  private tasks: Map<string, TaskNode>;
  private executed: Set<string>;
  private results: Map<string, TaskResult>;

  constructor(logger: Logger) {
    this.logger = logger;
    this.tasks = new Map();
    this.executed = new Set();
    this.results = new Map();
  }

  /**
   * Register a task
   */
  registerTask(task: Task): void {
    const node: TaskNode = {
      dependencies: new Set(task.dependsOn || []),
      dependents: new Set(),
      task,
    };

    this.tasks.set(task.name, node);

    // Update dependents
    for (const dep of node.dependencies) {
      const depNode = this.tasks.get(dep);
      if (depNode) {
        depNode.dependents.add(task.name);
      }
    }
  }

  /**
   * Get task execution order (topological sort)
   */
  getExecutionOrder(taskNames: string[]): string[] {
    const order: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (name: string) => {
      if (visited.has(name)) {
        return;
      }
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }

      visiting.add(name);

      const node = this.tasks.get(name);
      if (!node) {
        throw new Error(`Task not found: ${name}`);
      }

      // Visit dependencies first
      for (const dep of node.dependencies) {
        visit(dep);
      }

      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    for (const name of taskNames) {
      visit(name);
    }

    return order;
  }

  /**
   * Get task graph as adjacency list
   */
  getTaskGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};

    for (const [name, node] of this.tasks) {
      graph[name] = Array.from(node.dependencies);
    }

    return graph;
  }

  /**
   * Get tasks that can run in parallel
   */
  getParallelBatches(taskNames: string[]): string[][] {
    const order = this.getExecutionOrder(taskNames);
    const batches: string[][] = [];
    const completed = new Set<string>();

    while (completed.size < order.length) {
      const batch: string[] = [];

      for (const name of order) {
        if (completed.has(name)) {
          continue;
        }

        const node = this.tasks.get(name)!;
        const task = node.task;

        // Check if all dependencies are completed
        const depsCompleted = Array.from(node.dependencies).every((dep) => completed.has(dep));

        if (depsCompleted && task.parallel !== false) {
          batch.push(name);
        }
      }

      if (batch.length === 0) {
        // No parallel tasks, take first available
        for (const name of order) {
          if (!completed.has(name)) {
            const node = this.tasks.get(name)!;
            const depsCompleted = Array.from(node.dependencies).every((dep) => completed.has(dep));
            if (depsCompleted) {
              batch.push(name);
              break;
            }
          }
        }
      }

      if (batch.length === 0) {
        throw new Error('Unable to schedule tasks (possible circular dependency)');
      }

      batches.push(batch);
      batch.forEach((name) => completed.add(name));
    }

    return batches;
  }

  /**
   * Execute tasks in optimal order
   */
  async executeTasks(taskNames: string[]): Promise<Map<string, TaskResult>> {
    this.executed.clear();
    this.results.clear();

    const batches = this.getParallelBatches(taskNames);

    this.logger.info(`Executing ${taskNames.length} task(s) in ${batches.length} batch(es)`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      if (batch.length === 1) {
        this.logger.step(`[${i + 1}/${batches.length}] Running: ${batch[0]}`);
      } else {
        this.logger.step(`[${i + 1}/${batches.length}] Running ${batch.length} tasks in parallel`);
      }

      // Execute batch in parallel
      const promises = batch.map((name) => this.executeTask(name));
      const results = await Promise.all(promises);

      // Store results
      batch.forEach((name, idx) => {
        this.results.set(name, results[idx]);
      });
    }

    return this.results;
  }

  /**
   * Execute a single task
   */
  private async executeTask(name: string): Promise<TaskResult> {
    const node = this.tasks.get(name);
    if (!node) {
      throw new Error(`Task not found: ${name}`);
    }

    const task = node.task;
    const startTime = Date.now();

    try {
      this.logger.debug(`Executing task: ${name}`);

      const result = await task.execute();
      const duration = Date.now() - startTime;

      this.executed.add(name);

      return {
        ...result,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      return {
        duration,
        error: (error as Error).message,
        success: false,
      };
    }
  }

  /**
   * Explain why a task would run or be cached
   */
  explainTask(name: string): string {
    const node = this.tasks.get(name);
    if (!node) {
      return `Task '${name}' not found`;
    }

    const task = node.task;
    let explanation = `Task: ${task.name}\n`;
    explanation += `Description: ${task.description}\n\n`;

    explanation += 'Inputs:\n';
    if (task.inputs.files?.length) {
      explanation += `  Files: ${task.inputs.files.join(', ')}\n`;
    }
    if (task.inputs.config?.length) {
      explanation += `  Config: ${task.inputs.config.join(', ')}\n`;
    }
    if (task.inputs.env?.length) {
      explanation += `  Env: ${task.inputs.env.join(', ')}\n`;
    }
    if (task.inputs.dependencies?.length) {
      explanation += `  Dependencies: ${task.inputs.dependencies.join(', ')}\n`;
    }

    explanation += '\nOutputs:\n';
    if (task.outputs.files?.length) {
      explanation += `  Files: ${task.outputs.files.join(', ')}\n`;
    }
    if (task.outputs.artifacts?.length) {
      explanation += `  Artifacts: ${task.outputs.artifacts.join(', ')}\n`;
    }

    explanation += `\nCacheable: ${task.cacheable ? 'Yes' : 'No'}\n`;
    explanation += `Parallel: ${task.parallel !== false ? 'Yes' : 'No'}\n`;

    if (node.dependencies.size > 0) {
      explanation += `\nDependencies: ${Array.from(node.dependencies).join(', ')}\n`;
    }

    if (node.dependents.size > 0) {
      explanation += `Dependents: ${Array.from(node.dependents).join(', ')}\n`;
    }

    return explanation;
  }

  /**
   * List all registered tasks
   */
  listTasks(): Array<{ name: string; description: string; cacheable: boolean }> {
    return Array.from(this.tasks.values()).map((node) => ({
      cacheable: node.task.cacheable,
      description: node.task.description,
      name: node.task.name,
    }));
  }

  /**
   * Get task statistics
   */
  getStats() {
    const total = this.tasks.size;
    const executed = this.executed.size;
    const successful = Array.from(this.results.values()).filter((r) => r.success).length;
    const cached = Array.from(this.results.values()).filter((r) => r.cached).length;

    return {
      cached,
      cacheHitRate: executed > 0 ? (cached / executed) * 100 : 0,
      executed,
      successful,
      total,
    };
  }
}
