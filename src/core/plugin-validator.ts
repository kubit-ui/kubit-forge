/**
 * Plugin Validator
 * Validates plugin structure, security, and capabilities
 */

import type { Plugin, PluginCapability } from '../types/index.js';

export interface PluginValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  securityIssues: string[];
}

export class PluginValidator {
  /**
   * Validate a plugin
   */
  validate(plugin: Plugin): PluginValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const securityIssues: string[] = [];

    // Required fields
    if (!plugin.name) {
      errors.push('Plugin must have a name');
    } else {
      // Validate name format
      if (!/^[@a-z0-9-]+\/[a-z0-9-]+$|^[a-z0-9-]+$/.test(plugin.name)) {
        errors.push(
          'Plugin name must be in format "name" or "@scope/name" with lowercase letters, numbers, and hyphens'
        );
      }
    }

    if (!plugin.version) {
      errors.push('Plugin must have a version');
    } else {
      // Validate semver format
      if (!/^\d+\.\d+\.\d+(-[a-z0-9.-]+)?(\+[a-z0-9.-]+)?$/i.test(plugin.version)) {
        errors.push('Plugin version must follow semver format (e.g., 1.0.0)');
      }
    }

    // Validate capabilities
    if (plugin.capabilities) {
      const validCapabilities: PluginCapability[] = [
        'fs:read',
        'fs:write',
        'shell:run',
        'net:localhost',
        'process:env',
      ];

      for (const cap of plugin.capabilities) {
        if (!validCapabilities.includes(cap)) {
          errors.push(`Invalid capability: ${cap}`);
        }

        // Security warnings for dangerous capabilities
        if (cap === 'fs:write') {
          securityIssues.push('Plugin requests file system write access');
        }
        if (cap === 'shell:run') {
          securityIssues.push('Plugin requests shell command execution');
        }
        if (cap === 'process:env') {
          warnings.push('Plugin requests access to environment variables');
        }
      }
    }

    // Validate lifecycle hooks
    const validHooks = [
      'onLoad',
      'onConfigLoaded',
      'onProjectDetected',
      'beforeCommand',
      'afterCommand',
      'beforeTask',
      'afterTask',
    ];

    for (const hook of validHooks) {
      if (hook in plugin && typeof plugin[hook as keyof Plugin] !== 'function') {
        errors.push(`Hook '${hook}' must be a function`);
      }
    }

    // Validate registration methods
    const validRegistrations = [
      'registerCommands',
      'registerTasks',
      'registerGenerators',
      'registerProviders',
    ];

    for (const method of validRegistrations) {
      if (method in plugin && typeof plugin[method as keyof Plugin] !== 'function') {
        errors.push(`Registration method '${method}' must be a function`);
      }
    }

    // Warnings for missing common fields
    if (!plugin.capabilities || plugin.capabilities.length === 0) {
      warnings.push('Plugin does not declare any capabilities');
    }

    return {
      errors,
      securityIssues,
      valid: errors.length === 0,
      warnings,
    };
  }

  /**
   * Check if plugin requires user approval based on capabilities
   */
  requiresApproval(plugin: Plugin): boolean {
    if (!plugin.capabilities) {
      return false;
    }

    const dangerousCapabilities: PluginCapability[] = ['fs:write', 'shell:run'];
    return plugin.capabilities.some((cap) => dangerousCapabilities.includes(cap));
  }

  /**
   * Get security level of plugin
   */
  getSecurityLevel(plugin: Plugin): 'safe' | 'moderate' | 'dangerous' {
    if (!plugin.capabilities || plugin.capabilities.length === 0) {
      return 'safe';
    }

    const dangerousCapabilities: PluginCapability[] = ['fs:write', 'shell:run'];
    const hasDangerous = plugin.capabilities.some((cap) => dangerousCapabilities.includes(cap));

    if (hasDangerous) {
      return 'dangerous';
    }

    const moderateCapabilities: PluginCapability[] = ['process:env', 'net:localhost'];
    const hasModerate = plugin.capabilities.some((cap) => moderateCapabilities.includes(cap));

    if (hasModerate) {
      return 'moderate';
    }

    return 'safe';
  }

  /**
   * Validate command registration
   */
  validateCommand(command: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!command.name || typeof command.name !== 'string') {
      errors.push('Command must have a name (string)');
    }

    if (!command.description || typeof command.description !== 'string') {
      errors.push('Command must have a description (string)');
    }

    if (!command.action || typeof command.action !== 'function') {
      errors.push('Command must have an action (function)');
    }

    if (command.options && !Array.isArray(command.options)) {
      errors.push('Command options must be an array');
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }

  /**
   * Validate task registration
   */
  validateTask(task: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!task.name || typeof task.name !== 'string') {
      errors.push('Task must have a name (string)');
    }

    if (!task.description || typeof task.description !== 'string') {
      errors.push('Task must have a description (string)');
    }

    if (!task.run || typeof task.run !== 'function') {
      errors.push('Task must have a run function');
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }

  /**
   * Validate generator registration
   */
  validateGenerator(generator: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!generator.kind || typeof generator.kind !== 'string') {
      errors.push('Generator must have a kind (string)');
    }

    if (!generator.description || typeof generator.description !== 'string') {
      errors.push('Generator must have a description (string)');
    }

    if (!generator.generate || typeof generator.generate !== 'function') {
      errors.push('Generator must have a generate function');
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }

  /**
   * Validate provider registration
   */
  validateProvider(provider: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!provider.command || typeof provider.command !== 'string') {
      errors.push('Provider must have a command (string)');
    }

    if (typeof provider.priority !== 'number') {
      errors.push('Provider must have a priority (number)');
    }

    if (!provider.canHandle || typeof provider.canHandle !== 'function') {
      errors.push('Provider must have a canHandle function');
    }

    if (!provider.handler || typeof provider.handler !== 'function') {
      errors.push('Provider must have a handler function');
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }
}
