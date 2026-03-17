/**
 * Default configuration templates
 * Centralized defaults for project configuration
 */

export interface ProjectDefaults {
  nodeVersion: string;
  devPort: number;
  packageManager: 'pnpm' | 'npm' | 'yarn';
}

export interface PathsDefaults {
  src: string;
  dist: string;
  envExample: string;
  envLocal: string;
}

export interface QualityDefaults {
  lint: boolean;
  format: boolean;
  typecheck: boolean;
  unitTest: boolean;
}

export interface PluginDefaults {
  enabled: string[];
}

/**
 * Default project configuration
 */
export const PROJECT_DEFAULTS: ProjectDefaults = {
  nodeVersion: '20',
  devPort: 5173,
  packageManager: 'pnpm',
};

/**
 * Default paths configuration
 */
export const PATHS_DEFAULTS: PathsDefaults = {
  src: 'src',
  dist: 'dist',
  envExample: '.env.example',
  envLocal: '.env.local',
};

/**
 * Default quality configuration for new projects
 */
export const QUALITY_DEFAULTS: QualityDefaults = {
  lint: true,
  format: true,
  typecheck: true,
  unitTest: true,
};

/**
 * Minimal quality configuration (for auto-detect without tools)
 */
export const QUALITY_MINIMAL: QualityDefaults = {
  lint: false,
  format: false,
  typecheck: false,
  unitTest: false,
};

/**
 * Default plugins configuration
 */
export const PLUGIN_DEFAULTS: PluginDefaults = {
  enabled: [],
};

/**
 * Available plugin choices for interactive config
 */
export const AVAILABLE_PLUGINS = [
  '@kubit/plugin-bernova',
  '@kubit/plugin-storybook',
  '@kubit/plugin-testing-library',
  '@kubit/plugin-playwright',
  '@kubit/plugin-docker',
] as const;

/**
 * Package manager choices
 */
export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn'] as const;

/**
 * Supported stacks
 */
export const STACKS = ['react', 'vanilla'] as const;

/**
 * Supported languages
 */
export const LANGUAGES = ['ts', 'js'] as const;

/**
 * Project types
 */
export const PROJECT_TYPES = ['web', 'library'] as const;
