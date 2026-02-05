import type { Logger } from '../types/index.js';

export type PluginCapability =
  | 'fs:read'
  | 'fs:write'
  | 'fs:delete'
  | 'shell:run'
  | 'net:localhost'
  | 'net:external'
  | 'env:read'
  | 'env:write'
  | 'config:read'
  | 'config:write';

export interface PluginPermissions {
  capabilities: PluginCapability[];
  allowedPaths?: string[];
  allowedCommands?: string[];
  allowedHosts?: string[];
}

export interface PermissionRequest {
  capability: PluginCapability;
  resource?: string;
  reason?: string;
}

export class PluginPermissionManager {
  private logger: Logger;
  private strictMode: boolean;
  private grantedPermissions: Map<string, Set<PluginCapability>>;

  constructor(logger: Logger, strictMode: boolean = false) {
    this.logger = logger;
    this.strictMode = strictMode;
    this.grantedPermissions = new Map();
  }

  /**
   * Register plugin permissions
   */
  registerPlugin(pluginName: string, permissions: PluginPermissions): void {
    const capabilities = new Set(permissions.capabilities);
    this.grantedPermissions.set(pluginName, capabilities);

    this.logger.debug(
      `Registered plugin '${pluginName}' with capabilities: ${permissions.capabilities.join(', ')}`
    );
  }

  /**
   * Check if plugin has permission
   */
  hasPermission(pluginName: string, capability: PluginCapability): boolean {
    const permissions = this.grantedPermissions.get(pluginName);

    if (!permissions) {
      if (this.strictMode) {
        this.logger.warn(
          `Plugin '${pluginName}' not registered. Denying capability: ${capability}`
        );
        return false;
      }
      // In non-strict mode, allow unregistered plugins
      return true;
    }

    return permissions.has(capability);
  }

  /**
   * Request permission (with user prompt in interactive mode)
   */
  async requestPermission(pluginName: string, request: PermissionRequest): Promise<boolean> {
    if (this.hasPermission(pluginName, request.capability)) {
      return true;
    }

    if (this.strictMode) {
      this.logger.error(
        `Permission denied: Plugin '${pluginName}' requested '${request.capability}'`
      );
      if (request.reason) {
        this.logger.info(`Reason: ${request.reason}`);
      }
      return false;
    }

    // In non-strict mode, log warning but allow
    this.logger.warn(
      `Plugin '${pluginName}' using capability '${request.capability}' without explicit permission`
    );

    return true;
  }

  /**
   * Validate file system access
   */
  validateFsAccess(
    pluginName: string,
    path: string,
    operation: 'read' | 'write' | 'delete'
  ): boolean {
    const capability: PluginCapability = `fs:${operation}`;

    if (!this.hasPermission(pluginName, capability)) {
      this.logger.error(
        `Permission denied: Plugin '${pluginName}' cannot ${operation} file: ${path}`
      );
      return false;
    }

    // Check allowed paths if specified
    const permissions = this.grantedPermissions.get(pluginName);
    if (permissions) {
      // In a full implementation, check allowedPaths
      // For now, just check capability
    }

    return true;
  }

  /**
   * Validate shell command execution
   */
  validateShellCommand(pluginName: string, command: string): boolean {
    if (!this.hasPermission(pluginName, 'shell:run')) {
      this.logger.error(`Permission denied: Plugin '${pluginName}' cannot run command: ${command}`);
      return false;
    }

    return true;
  }

  /**
   * Validate network access
   */
  validateNetworkAccess(pluginName: string, host: string): boolean {
    const isLocalhost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('localhost:') ||
      host.startsWith('127.0.0.1:');

    const capability: PluginCapability = isLocalhost ? 'net:localhost' : 'net:external';

    if (!this.hasPermission(pluginName, capability)) {
      this.logger.error(`Permission denied: Plugin '${pluginName}' cannot access: ${host}`);
      return false;
    }

    return true;
  }

  /**
   * Get plugin permissions
   */
  getPluginPermissions(pluginName: string): PluginCapability[] {
    const permissions = this.grantedPermissions.get(pluginName);
    return permissions ? Array.from(permissions) : [];
  }

  /**
   * Get all registered plugins with their permissions
   */
  getAllPermissions(): Map<string, PluginCapability[]> {
    const result = new Map<string, PluginCapability[]>();

    for (const [plugin, capabilities] of this.grantedPermissions.entries()) {
      result.set(plugin, Array.from(capabilities));
    }

    return result;
  }

  /**
   * Revoke permission
   */
  revokePermission(pluginName: string, capability: PluginCapability): void {
    const permissions = this.grantedPermissions.get(pluginName);
    if (permissions) {
      permissions.delete(capability);
      this.logger.debug(`Revoked capability '${capability}' from plugin '${pluginName}'`);
    }
  }

  /**
   * Grant permission
   */
  grantPermission(pluginName: string, capability: PluginCapability): void {
    let permissions = this.grantedPermissions.get(pluginName);
    if (!permissions) {
      permissions = new Set();
      this.grantedPermissions.set(pluginName, permissions);
    }
    permissions.add(capability);
    this.logger.debug(`Granted capability '${capability}' to plugin '${pluginName}'`);
  }

  /**
   * Check for dangerous permissions
   */
  getDangerousPermissions(pluginName: string): PluginCapability[] {
    const dangerous: PluginCapability[] = [
      'fs:delete',
      'fs:write',
      'shell:run',
      'net:external',
      'env:write',
      'config:write',
    ];

    const permissions = this.getPluginPermissions(pluginName);
    return permissions.filter((p) => dangerous.includes(p));
  }

  /**
   * Generate permission report
   */
  generateReport(): string {
    const lines: string[] = ['Plugin Permissions Report', '='.repeat(50), ''];

    for (const [plugin, capabilities] of this.grantedPermissions.entries()) {
      lines.push(`Plugin: ${plugin}`);
      lines.push(`Capabilities: ${Array.from(capabilities).join(', ')}`);

      const dangerous = this.getDangerousPermissions(plugin);
      if (dangerous.length > 0) {
        lines.push(`⚠️  Dangerous: ${dangerous.join(', ')}`);
      }

      lines.push('');
    }

    lines.push(`Strict Mode: ${this.strictMode ? 'ENABLED' : 'DISABLED'}`);

    return lines.join('\n');
  }
}
