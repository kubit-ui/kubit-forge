import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import type { Logger } from '../types/index.js';

/**
 * Plugin signature information
 */
export interface PluginSignature {
  plugin: string;
  version: string;
  hash: string;
  signature?: string;
  publisher?: string;
  timestamp: string;
  algorithm: 'sha256' | 'sha512';
}

/**
 * Trusted publisher
 */
export interface TrustedPublisher {
  name: string;
  publicKey?: string;
  verified: boolean;
  addedAt: string;
}

/**
 * Verification result
 */
export interface VerificationResult {
  verified: boolean;
  trusted: boolean;
  signature?: PluginSignature;
  issues: string[];
  warnings: string[];
}

/**
 * Plugin verification and signing system
 *
 * Provides supply-chain security without requiring cloud services.
 * Supports local verification, signatures, and trust management.
 */
export class PluginVerification {
  private logger: Logger;
  private trustedPublishers: Map<string, TrustedPublisher>;
  private verifiedPlugins: Map<string, PluginSignature>;

  constructor(logger: Logger) {
    this.logger = logger;
    this.trustedPublishers = new Map();
    this.verifiedPlugins = new Map();

    // Add official Kubit publishers by default
    this.addTrustedPublisher({
      addedAt: new Date().toISOString(),
      name: '@kubit',
      verified: true,
    });
  }

  /**
   * Calculate plugin hash
   */
  calculateHash(pluginPath: string, algorithm: 'sha256' | 'sha512' = 'sha256'): string {
    const content = readFileSync(pluginPath, 'utf-8');
    const hash = createHash(algorithm);
    hash.update(content);
    return hash.digest('hex');
  }

  /**
   * Verify plugin integrity
   */
  async verifyPlugin(pluginName: string, pluginPath: string): Promise<VerificationResult> {
    const result: VerificationResult = {
      issues: [],
      trusted: false,
      verified: false,
      warnings: [],
    };

    // Check if plugin file exists
    if (!existsSync(pluginPath)) {
      result.issues.push(`Plugin file not found: ${pluginPath}`);
      return result;
    }

    // Calculate current hash
    const currentHash = this.calculateHash(pluginPath);

    // Check if we have a stored signature
    const storedSignature = this.verifiedPlugins.get(pluginName);

    if (storedSignature) {
      if (storedSignature.hash === currentHash) {
        result.verified = true;
        result.signature = storedSignature;

        // Check if publisher is trusted
        if (storedSignature.publisher) {
          const publisher = this.trustedPublishers.get(storedSignature.publisher);
          if (publisher?.verified) {
            result.trusted = true;
          }
        }
      } else {
        result.issues.push('Plugin hash mismatch - file may have been modified');
        result.warnings.push('Consider reinstalling the plugin');
      }
    } else {
      result.warnings.push('No signature found for this plugin');
      result.warnings.push('Run: kubit plugin trust <name> to trust this plugin');
    }

    // Check publisher
    const publisher = this.getPublisherFromName(pluginName);
    if (publisher) {
      const trustedPub = this.trustedPublishers.get(publisher);
      if (!trustedPub) {
        result.warnings.push(`Publisher '${publisher}' is not in trusted list`);
      }
    }

    return result;
  }

  /**
   * Sign a plugin (for plugin authors)
   */
  signPlugin(pluginName: string, pluginPath: string, publisher?: string): PluginSignature {
    const hash = this.calculateHash(pluginPath, 'sha256');

    const signature: PluginSignature = {
      algorithm: 'sha256',
      hash,
      plugin: pluginName,
      publisher,
      timestamp: new Date().toISOString(),
      version: this.getPluginVersion(pluginPath),
    };

    this.verifiedPlugins.set(pluginName, signature);
    this.logger.success(`Plugin signed: ${pluginName}`);

    return signature;
  }

  /**
   * Add trusted publisher
   */
  addTrustedPublisher(publisher: TrustedPublisher): void {
    this.trustedPublishers.set(publisher.name, publisher);
    this.logger.debug(`Added trusted publisher: ${publisher.name}`);
  }

  /**
   * Remove trusted publisher
   */
  removeTrustedPublisher(name: string): boolean {
    const removed = this.trustedPublishers.delete(name);
    if (removed) {
      this.logger.info(`Removed trusted publisher: ${name}`);
    }
    return removed;
  }

  /**
   * List trusted publishers
   */
  listTrustedPublishers(): TrustedPublisher[] {
    return Array.from(this.trustedPublishers.values());
  }

  /**
   * Check if publisher is trusted
   */
  isPublisherTrusted(name: string): boolean {
    const publisher = this.trustedPublishers.get(name);
    return publisher?.verified || false;
  }

  /**
   * Generate SBOM (Software Bill of Materials)
   */
  generateSBOM(cwd: string): any {
    const pkgPath = join(cwd, 'package.json');

    if (!existsSync(pkgPath)) {
      throw new Error('package.json not found');
    }

    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

    const sbom = {
      bomFormat: 'CycloneDX',
      components: this.extractComponents(pkg),
      metadata: {
        component: {
          name: pkg.name,
          type: 'application',
          version: pkg.version,
        },
        timestamp: new Date().toISOString(),
        tools: [
          {
            name: 'kubit-forge',
            vendor: 'Kubit',
            version: '3.0.0',
          },
        ],
      },
      specVersion: '1.4',
      version: 1,
    };

    return sbom;
  }

  /**
   * Extract components from package.json
   */
  private extractComponents(pkg: any): any[] {
    const components: any[] = [];

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    for (const [name, version] of Object.entries(allDeps)) {
      components.push({
        name,
        purl: `pkg:npm/${name}@${version}`,
        type: 'library',
        version: (version as string).replace(/^[\^~]/, ''),
      });
    }

    return components;
  }

  /**
   * Get publisher from plugin name
   */
  private getPublisherFromName(pluginName: string): string | null {
    if (pluginName.startsWith('@')) {
      const parts = pluginName.split('/');
      return parts[0];
    }
    return null;
  }

  /**
   * Get plugin version from package
   */
  private getPluginVersion(pluginPath: string): string {
    try {
      const pkgPath = join(pluginPath, '..', 'package.json');
      if (existsSync(pkgPath)) {
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        return pkg.version || '0.0.0';
      }
    } catch {
      // Ignore
    }
    return '0.0.0';
  }

  /**
   * Export signatures for sharing
   */
  exportSignatures(): PluginSignature[] {
    return Array.from(this.verifiedPlugins.values());
  }

  /**
   * Import signatures
   */
  importSignatures(signatures: PluginSignature[]): void {
    for (const sig of signatures) {
      this.verifiedPlugins.set(sig.plugin, sig);
    }
    this.logger.info(`Imported ${signatures.length} signature(s)`);
  }
}
