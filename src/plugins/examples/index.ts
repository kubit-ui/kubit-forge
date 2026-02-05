/**
 * Example Plugins
 *
 * Collection of example plugins demonstrating different plugin capabilities
 */

// Re-export types for convenience
export type { Plugin, PluginContext, CommandResult } from '../../types/index.js';
export { generatorPlugin } from './generator-plugin.js';
export { helloPlugin } from './hello-plugin.js';

export { providerPlugin } from './provider-plugin.js';
