import type { Logger } from '../types/index.js';

/**
 * Kubit Specification Version
 *
 * Defines the formal specification for kubit-forge ecosystem.
 * This allows third-party tooling, IDE plugins, and dashboards.
 */
export const KUBIT_SPEC_VERSION = '1.0.0';

/**
 * Configuration specification
 */
export interface ConfigSpec {
  version: string;
  schema: {
    kubit: {
      cliVersion: string;
    };
    project: {
      name: string;
      type: 'web' | 'library';
      stack: 'react' | 'vanilla';
      language: 'ts' | 'js';
      packageManager: 'pnpm' | 'npm' | 'yarn';
    };
    quality?: {
      lint: boolean;
      format: boolean;
      typecheck: boolean;
      unitTest: boolean;
    };
    plugins?: {
      enabled: string[];
    };
    extends?: string[];
  };
  inheritance: {
    priority: ['flags', 'config', 'presets', 'defaults'];
  };
}

/**
 * Plugin manifest specification
 */
export interface PluginManifestSpec {
  name: string;
  version: string;
  kubitVersion: string;
  capabilities: string[];
  commands?: string[];
  generators?: string[];
  tasks?: string[];
  hooks?: string[];
  signature?: string;
  publisher?: string;
}

/**
 * Task contract specification
 */
export interface TaskContractSpec {
  name: string;
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
}

/**
 * JSON output contract for commands
 */
export interface CommandOutputSpec {
  status: 'ok' | 'error' | 'warning';
  message: string;
  data?: any;
  timestamp: string;
  version: string;
  spec: string;
}

/**
 * Kubit Spec validator
 */
export class KubitSpec {
  private version: string;

  constructor(_logger: Logger, version: string = KUBIT_SPEC_VERSION) {
    // Logger available for future use
    this.version = version;
  }

  /**
   * Validate configuration against spec
   */
  validateConfig(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.project) {
      errors.push('Missing required section: project');
    }

    if (!config.project?.name) {
      errors.push('Missing required field: project.name');
    }

    if (config.project?.type && !['web', 'library'].includes(config.project.type)) {
      errors.push(`Invalid project.type: ${config.project.type}`);
    }

    if (config.project?.stack && !['react', 'vanilla'].includes(config.project.stack)) {
      errors.push(`Invalid project.stack: ${config.project.stack}`);
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }

  /**
   * Validate plugin manifest against spec
   */
  validatePluginManifest(manifest: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!manifest.name) {
      errors.push('Missing required field: name');
    }

    if (!manifest.version) {
      errors.push('Missing required field: version');
    }

    if (!manifest.kubitVersion) {
      errors.push('Missing required field: kubitVersion');
    }

    if (!Array.isArray(manifest.capabilities)) {
      errors.push('Missing or invalid field: capabilities (must be array)');
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }

  /**
   * Validate task contract against spec
   */
  validateTaskContract(task: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!task.name) {
      errors.push('Missing required field: name');
    }

    if (!task.inputs) {
      errors.push('Missing required field: inputs');
    }

    if (!task.outputs) {
      errors.push('Missing required field: outputs');
    }

    if (typeof task.cacheable !== 'boolean') {
      errors.push('Missing or invalid field: cacheable (must be boolean)');
    }

    return {
      errors,
      valid: errors.length === 0,
    };
  }

  /**
   * Get spec information
   */
  getSpecInfo() {
    return {
      configSpec: this.getConfigSpec(),
      outputContractSpec: this.getOutputContractSpec(),
      pluginManifestSpec: this.getPluginManifestSpec(),
      taskContractSpec: this.getTaskContractSpec(),
      version: this.version,
    };
  }

  private getConfigSpec(): any {
    return {
      inheritance: {
        priority: ['flags', 'config', 'presets', 'defaults'],
      },
      schema: {
        extends: [],
        kubit: {
          cliVersion: '^3.0.0',
        },
        plugins: {
          enabled: [],
        },
        project: {
          language: 'ts | js',
          name: 'string',
          packageManager: 'pnpm | npm | yarn',
          stack: 'react | vanilla',
          type: 'web | library',
        },
        quality: {
          format: true,
          lint: true,
          typecheck: true,
          unitTest: true,
        },
      },
      version: this.version,
    };
  }

  private getPluginManifestSpec(): PluginManifestSpec {
    return {
      capabilities: ['fs:read', 'fs:write'],
      commands: ['command-name'],
      generators: ['generator-kind'],
      hooks: ['before:dev', 'after:build'],
      kubitVersion: '^3.0.0',
      name: '@scope/plugin-name',
      publisher: 'optional-publisher',
      signature: 'optional-signature',
      tasks: ['task-name'],
      version: '1.0.0',
    };
  }

  private getTaskContractSpec(): TaskContractSpec {
    return {
      cacheable: true,
      inputs: {
        config: ['tsconfig.json'],
        dependencies: ['typescript'],
        env: ['NODE_ENV'],
        files: ['src/**/*.ts'],
      },
      name: 'task-name',
      outputs: {
        artifacts: ['build-info.json'],
        files: ['dist/**/*'],
      },
      parallel: false,
    };
  }

  private getOutputContractSpec(): CommandOutputSpec {
    return {
      data: {},
      message: 'Command completed successfully',
      spec: this.version,
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '3.0.0',
    };
  }

  /**
   * Explain spec for a specific area
   */
  explainSpec(area: 'config' | 'plugin' | 'task' | 'output'): string {
    switch (area) {
      case 'config':
        return this.explainConfigSpec();
      case 'plugin':
        return this.explainPluginSpec();
      case 'task':
        return this.explainTaskSpec();
      case 'output':
        return this.explainOutputSpec();
      default:
        return 'Unknown spec area';
    }
  }

  private explainConfigSpec(): string {
    return `
Kubit Config Specification v${this.version}

Configuration follows a strict hierarchy:
1. CLI flags (highest priority)
2. Project config (kubit.config.toml)
3. Presets (via extends)
4. Defaults (lowest priority)

Required fields:
- project.name: Project name
- project.type: "web" or "library"
- project.stack: "react" or "vanilla"

Optional fields:
- quality.*: Quality check settings
- plugins.enabled: List of enabled plugins
- extends: Config presets to inherit from
`;
  }

  private explainPluginSpec(): string {
    return `
Kubit Plugin Manifest Specification v${this.version}

Required fields:
- name: Plugin name (scoped recommended)
- version: Semantic version
- kubitVersion: Compatible CLI version
- capabilities: Array of required capabilities

Optional fields:
- commands: Custom commands provided
- generators: Code generators provided
- tasks: Build tasks provided
- hooks: Lifecycle hooks used
- signature: Plugin signature for verification
- publisher: Publisher identity
`;
  }

  private explainTaskSpec(): string {
    return `
Kubit Task Contract Specification v${this.version}

Tasks must declare:
- name: Unique task identifier
- inputs: What affects the task (files, config, env, deps)
- outputs: What the task produces
- cacheable: Whether results can be cached

This enables:
- Intelligent caching
- Parallel execution
- Reproducible builds
- DAG optimization
`;
  }

  private explainOutputSpec(): string {
    return `
Kubit Command Output Specification v${this.version}

All commands with --json must output:
{
  "status": "ok" | "error" | "warning",
  "message": "Human-readable message",
  "data": { /* command-specific data */ },
  "timestamp": "ISO 8601 timestamp",
  "version": "CLI version",
  "spec": "Spec version"
}

This enables:
- IDE integration
- CI/CD tooling
- Dashboard creation
- Automated workflows
`;
  }
}
