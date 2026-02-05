import type { HookHandler, PluginContext } from '../types/index.js';

interface RegisteredHook {
  handler: HookHandler;
  priority: number;
  pluginName?: string;
}

/**
 * Hook Manager
 * Manages plugin hooks with priority support
 */
export class HookManager {
  private hooks: Map<string, RegisteredHook[]> = new Map();
  private ctx: PluginContext;

  constructor(ctx: PluginContext) {
    this.ctx = ctx;
  }

  /**
   * Register a hook handler
   * @param hookName - Name of the hook (e.g., 'build:before')
   * @param handler - Hook handler function
   * @param priorityOrPluginName - Priority (number) or plugin name (string), default 0
   * @param pluginName - Optional plugin name for debugging (if priority is provided)
   */
  register(
    hookName: string,
    handler: HookHandler,
    priorityOrPluginName: number | string = 0,
    pluginName?: string
  ): void {
    // Handle overloaded parameters
    let priority = 0;
    let actualPluginName: string | undefined;

    if (typeof priorityOrPluginName === 'number') {
      priority = priorityOrPluginName;
      actualPluginName = pluginName;
    } else {
      priority = 0;
      actualPluginName = priorityOrPluginName;
    }
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    const hooks = this.hooks.get(hookName)!;
    hooks.push({ handler, pluginName: actualPluginName, priority });

    // Sort by priority (higher first)
    hooks.sort((a, b) => b.priority - a.priority);

    // Log if verbose mode is enabled (can be checked via environment or config)
    this.ctx.logger.debug(
      `Registered hook '${hookName}' ${actualPluginName ? `from ${actualPluginName}` : ''} (priority: ${priority})`
    );
  }

  /**
   * Unregister a hook handler
   */
  unregister(hookName: string, handler: HookHandler): void {
    const hooks = this.hooks.get(hookName);
    if (!hooks) {
      return;
    }

    const index = hooks.findIndex((h) => h.handler === handler);
    if (index !== -1) {
      hooks.splice(index, 1);
      this.ctx.logger.debug(`Unregistered hook '${hookName}'`);
    }
  }

  /**
   * Trigger a hook
   * Executes all registered handlers for the hook in priority order
   */
  async trigger(hookName: string, ...args: any[]): Promise<void> {
    const hooks = this.hooks.get(hookName);
    if (!hooks || hooks.length === 0) {
      return;
    }

    this.ctx.logger.debug(`Triggering hook '${hookName}' (${hooks.length} handlers)`);

    for (const { handler, pluginName } of hooks) {
      try {
        const result = await handler(...args, this.ctx);

        // Handle skip result
        if (result && typeof result === 'object' && 'skip' in result && result.skip) {
          this.ctx.logger.debug(
            `Hook '${hookName}' ${pluginName ? `from ${pluginName}` : ''} requested skip`
          );
          break;
        }

        // Handle modify result
        if (result && typeof result === 'object' && 'modify' in result) {
          // Modify args for next handler
          if (Array.isArray(result.modify)) {
            args = result.modify;
          }
        }
      } catch (error) {
        this.ctx.logger.error(
          `Error in hook '${hookName}' ${pluginName ? `from ${pluginName}` : ''}`,
          error instanceof Error ? error : new Error(String(error))
        );
        // Continue with other hooks even if one fails
      }
    }
  }

  /**
   * Check if a hook has any registered handlers
   */
  has(hookName: string): boolean {
    const hooks = this.hooks.get(hookName);
    return hooks !== undefined && hooks.length > 0;
  }

  /**
   * List all registered hooks
   */
  list(): string[] {
    return Array.from(this.hooks.keys()).sort();
  }

  /**
   * Get count of handlers for a hook
   */
  count(hookName: string): number {
    const hooks = this.hooks.get(hookName);
    return hooks ? hooks.length : 0;
  }

  /**
   * Clear all hooks
   */
  clear(): void {
    this.hooks.clear();
  }

  /**
   * Clear hooks for a specific hook name
   */
  clearHook(hookName: string): void {
    this.hooks.delete(hookName);
  }

  /**
   * Get debug info about registered hooks
   */
  getDebugInfo(): Record<string, any> {
    const info: Record<string, any> = {};

    for (const [hookName, hooks] of this.hooks.entries()) {
      info[hookName] = hooks.map((h) => ({
        pluginName: h.pluginName || 'anonymous',
        priority: h.priority,
      }));
    }

    return info;
  }
}
