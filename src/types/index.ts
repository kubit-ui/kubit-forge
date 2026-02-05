import { z } from 'zod';

// ============================================================================
// Config Schema
// ============================================================================

export const KubitConfigSchema = z.object({
  commands: z
    .object({
      buildProvider: z.string().optional(),
      devProvider: z.string().optional(),
    })
    .optional(),

  env: z
    .object({
      required: z.array(z.string()).optional(),
      schema: z.string().optional(),
    })
    .optional(),

  kubit: z
    .object({
      cliVersion: z.string().optional(),
    })
    .optional(),

  paths: z
    .object({
      dist: z.string().default('dist'),
      envExample: z.string().default('.env.example'),
      envLocal: z.string().default('.env.local'),
      src: z.string().default('src'),
    })
    .optional(),

  plugins: z
    .object({
      enabled: z.array(z.string()).optional(),
    })
    .optional(),

  project: z.object({
    devPort: z.number().default(5173),
    language: z.enum(['ts', 'js']).default('ts'),
    name: z.string(),
    nodeVersion: z.string().default('20'),
    packageManager: z.enum(['pnpm', 'npm', 'yarn']).default('pnpm'),
    stack: z.enum(['react', 'vanilla']),
    type: z.enum(['web', 'library']).default('web'),
  }),

  quality: z
    .object({
      format: z.boolean().default(true),
      lint: z.boolean().default(true),
      typecheck: z.boolean().default(true),
      unitTest: z.boolean().default(true),
    })
    .optional(),
});

export type KubitConfig = z.infer<typeof KubitConfigSchema>;

// ============================================================================
// Plugin System Types
// ============================================================================

export interface PluginContext {
  config: KubitConfig;
  cwd: string;
  logger: Logger;
  runner: TaskRunner;
  hookManager?: HookManager;
  pluginManager?: any; // Will be typed properly later
}

export interface Plugin {
  name: string;
  version: string;
  capabilities?: PluginCapability[];

  // Lifecycle hooks
  onLoad?(ctx: PluginContext): Promise<void> | void;
  onConfigLoaded?(ctx: PluginContext): Promise<void> | void;
  onProjectDetected?(ctx: PluginContext): Promise<void> | void;

  // Command hooks
  beforeCommand?(command: string, ctx: PluginContext): Promise<void> | void;
  afterCommand?(command: string, ctx: PluginContext, result: CommandResult): Promise<void> | void;

  // Task hooks
  beforeTask?(task: string, ctx: PluginContext): Promise<void> | void;
  afterTask?(task: string, ctx: PluginContext, result: TaskResult): Promise<void> | void;

  // Registration
  registerCommands?(): CommandRegistration[];
  registerTasks?(): TaskRegistration[];
  registerGenerators?(): GeneratorRegistration[];
  registerProviders?(): ProviderRegistration[];
}

export type PluginCapability =
  | 'fs:read'
  | 'fs:write'
  | 'shell:run'
  | 'net:localhost'
  | 'process:env';

// ============================================================================
// Command System Types
// ============================================================================

export interface CommandRegistration {
  name: string;
  description: string;
  options?: CommandOption[];
  action: (args: any, ctx: PluginContext) => Promise<CommandResult>;
}

export interface CommandOption {
  flags: string;
  description: string;
  defaultValue?: any;
}

export interface CommandResult {
  status: 'ok' | 'error' | 'warning' | 'skipped';
  message?: string;
  data?: any;
  errors?: CommandError[];
  timings?: Record<string, number>;
}

export interface CommandError {
  code: string;
  message: string;
  cause?: string;
  solution?: string;
  docsUrl?: string;
}

// ============================================================================
// Task System Types
// ============================================================================

export interface TaskRegistration {
  name: string;
  description: string;
  run: (ctx: PluginContext) => Promise<TaskResult>;
}

export interface TaskResult {
  status: 'ok' | 'error' | 'skipped';
  message?: string;
  duration?: number;
  output?: string;
  exitCode?: number;
}

export interface TaskRunner {
  run(command: string, args?: string[], options?: RunOptions): Promise<TaskResult>;
  runTask(taskName: string): Promise<TaskResult>;
}

export interface RunOptions {
  cwd?: string;
  env?: Record<string, string>;
  silent?: boolean;
  captureOutput?: boolean;
}

// ============================================================================
// Generator System Types
// ============================================================================

export interface GeneratorRegistration {
  kind: string;
  description: string;
  generate: (name: string, options: any, ctx: PluginContext) => Promise<GeneratorResult>;
}

export interface GeneratorResult {
  status: 'ok' | 'error';
  filesCreated?: string[];
  message?: string;
}

// ============================================================================
// Provider System Types
// ============================================================================

export interface ProviderRegistration {
  command: string; // 'dev', 'build', 'preview', etc.
  priority: number; // Higher priority wins
  canHandle: (ctx: PluginContext) => boolean;
  handler: (args: any, ctx: PluginContext) => Promise<CommandResult>;
}

// ============================================================================
// Logger Types
// ============================================================================

export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string, error?: Error): void;
  debug(message: string): void;
  step(message: string): void;
  json(data: any): void;
}

// ============================================================================
// Global Options Types
// ============================================================================

export interface GlobalOptions {
  cwd?: string;
  config?: string;
  json?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  noColor?: boolean;
  dryRun?: boolean;
  yes?: boolean;
  profile?: boolean;
}

// ============================================================================
// Init Command Types
// ============================================================================

export interface InitOptions {
  stack: 'react' | 'vanilla';
  name: string;
  ts?: boolean;
  js?: boolean;
  pm?: 'pnpm' | 'npm' | 'yarn';
  noTest?: boolean;
  router?: boolean;
}

// ============================================================================
// Check Command Types
// ============================================================================

export interface CheckResult {
  status: 'ok' | 'error';
  steps: CheckStep[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
}

export interface CheckStep {
  name: string;
  status: 'ok' | 'error' | 'skipped';
  duration: number;
  message?: string;
  errors?: string[];
}

// ============================================================================
// Doctor Command Types
// ============================================================================

export interface DoctorResult {
  status: 'ok' | 'warning' | 'error';
  checks: DoctorCheck[];
  recommendations?: string[];
}

export interface DoctorCheck {
  category: 'system' | 'project' | 'dependencies' | 'config' | 'env' | 'quality' | 'security';
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  solution?: string;
  details?: any;
}

// ============================================================================
// Env Command Types
// ============================================================================

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  invalid: string[];
  warnings: string[];
}

// ============================================================================
// Plugin Hooks Types
// ============================================================================

export type HookResult = void | Promise<void> | { skip?: boolean; modify?: unknown };

export type HookHandler = (...args: unknown[]) => HookResult;

export interface PluginHooks {
  // Lifecycle hooks
  'plugin:loaded'?: HookHandler;
  'plugin:unloaded'?: HookHandler;

  // Init hooks
  'init:before'?: HookHandler;
  'init:after'?: HookHandler;

  // Build hooks
  'build:before'?: HookHandler;
  'build:after'?: HookHandler;
  'build:error'?: HookHandler;

  // Dev hooks
  'dev:before'?: HookHandler;
  'dev:after'?: HookHandler;
  'dev:ready'?: HookHandler;

  // Test hooks
  'test:before'?: HookHandler;
  'test:after'?: HookHandler;
  'test:error'?: HookHandler;

  // Lint hooks
  'lint:before'?: HookHandler;
  'lint:after'?: HookHandler;

  // Format hooks
  'format:before'?: HookHandler;
  'format:after'?: HookHandler;

  // Check hooks
  'check:before'?: HookHandler;
  'check:after'?: HookHandler;

  // Doctor hooks
  'doctor:before'?: HookHandler;
  'doctor:after'?: HookHandler;

  // Add feature hooks
  'add:before'?: HookHandler;
  'add:after'?: HookHandler;

  // Generate hooks
  'generate:before'?: HookHandler;
  'generate:after'?: HookHandler;

  // Config hooks
  'config:loaded'?: HookHandler;
  'config:validated'?: HookHandler;

  // File hooks
  'file:created'?: HookHandler;
  'file:modified'?: HookHandler;
  'file:deleted'?: HookHandler;

  // Task hooks
  'task:before'?: HookHandler;
  'task:after'?: HookHandler;
  'task:error'?: HookHandler;

  // Custom hooks (plugins can define their own)
  [key: string]: HookHandler | undefined;
}

export interface PluginHookContext {
  hookName: string;
  args: any[];
  ctx: PluginContext;
}

export interface HookManager {
  register(
    hookName: string,
    handler: HookHandler,
    priorityOrPluginName?: number | string,
    pluginName?: string
  ): void;
  unregister(hookName: string, handler: HookHandler): void;
  trigger(hookName: string, ...args: unknown[]): Promise<void>;
  has(hookName: string): boolean;
  list(): string[];
}

// ============================================================================
// Recipe System Types
// ============================================================================

/**
 * Recipe Step Types
 */
export type RecipeStepType =
  | 'command' // Execute CLI command
  | 'shell' // Execute shell command
  | 'file' // File operations
  | 'template' // Process template
  | 'prompt' // Interactive prompt
  | 'condition' // Conditional execution
  | 'loop' // Loop over items
  | 'parallel' // Parallel execution
  | 'plugin' // Execute plugin
  | 'recipe'; // Execute sub-recipe

/**
 * Recipe Step Status
 */
export type RecipeStepStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'rolled-back';

/**
 * File Operation Types
 */
export type FileOperationType = 'create' | 'update' | 'delete' | 'copy' | 'move' | 'append';

/**
 * Recipe Step - Base interface
 */
export interface RecipeStep {
  id: string;
  name: string;
  description?: string;
  type: RecipeStepType;
  condition?: string | ((ctx: RecipeContext) => boolean | Promise<boolean>);
  continueOnError?: boolean;
  rollback?: RecipeRollbackAction;
  timeout?: number;
  retry?: {
    attempts: number;
    delay: number;
  };
}

/**
 * Command Step - Execute CLI command
 */
export interface RecipeCommandStep extends RecipeStep {
  type: 'command';
  command: string;
  args?: Record<string, unknown>;
}

/**
 * Shell Step - Execute shell command
 */
export interface RecipeShellStep extends RecipeStep {
  type: 'shell';
  script: string;
  env?: Record<string, string>;
  cwd?: string;
}

/**
 * File Step - File operations
 */
export interface RecipeFileStep extends RecipeStep {
  type: 'file';
  operation: FileOperationType;
  source?: string;
  target: string;
  content?: string;
  template?: string;
  variables?: Record<string, unknown>;
}

/**
 * Template Step - Process template
 */
export interface RecipeTemplateStep extends RecipeStep {
  type: 'template';
  source: string;
  target: string;
  variables?: Record<string, unknown>;
}

/**
 * Prompt Step - Interactive prompt
 */
export interface RecipePromptStep extends RecipeStep {
  type: 'prompt';
  prompts: Array<{
    name: string;
    type: 'text' | 'confirm' | 'select' | 'multiselect';
    message: string;
    default?: unknown;
    choices?: Array<{ label: string; value: unknown }>;
    validate?: (value: unknown) => boolean | string;
  }>;
  saveAs?: string;
}

/**
 * Condition Step - Conditional execution
 */
export interface RecipeConditionStep extends RecipeStep {
  type: 'condition';
  if: string | ((ctx: RecipeContext) => boolean | Promise<boolean>);
  then: RecipeStep[];
  else?: RecipeStep[];
}

/**
 * Loop Step - Loop over items
 */
export interface RecipeLoopStep extends RecipeStep {
  type: 'loop';
  items: unknown[] | string;
  itemName: string;
  steps: RecipeStep[];
}

/**
 * Parallel Step - Execute steps in parallel
 */
export interface RecipeParallelStep extends RecipeStep {
  type: 'parallel';
  steps: RecipeStep[];
  maxConcurrency?: number;
}

/**
 * Plugin Step - Execute plugin
 */
export interface RecipePluginStep extends RecipeStep {
  type: 'plugin';
  plugin: string;
  action: string;
  args?: Record<string, unknown>;
}

/**
 * Recipe Step - Execute sub-recipe
 */
export interface RecipeRecipeStep extends RecipeStep {
  type: 'recipe';
  recipe: string;
  variables?: Record<string, unknown>;
}

/**
 * Union type for all step types
 */
export type RecipeStepUnion =
  | RecipeCommandStep
  | RecipeShellStep
  | RecipeFileStep
  | RecipeTemplateStep
  | RecipePromptStep
  | RecipeConditionStep
  | RecipeLoopStep
  | RecipeParallelStep
  | RecipePluginStep
  | RecipeRecipeStep;

/**
 * Rollback Action
 */
export interface RecipeRollbackAction {
  type: 'command' | 'shell' | 'file' | 'custom';
  action: string | ((ctx: RecipeContext) => Promise<void>);
  args?: Record<string, unknown>;
}

/**
 * Recipe Definition
 */
export interface Recipe {
  name: string;
  version: string;
  description: string;
  author?: string;
  tags?: string[];
  category?: 'setup' | 'feature' | 'tooling' | 'deployment' | 'maintenance';

  // Requirements
  requires?: {
    kubitVersion?: string;
    nodeVersion?: string;
    plugins?: string[];
    tools?: string[];
  };

  // Variables
  variables?: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      description?: string;
      default?: unknown;
      required?: boolean;
      validate?: string | ((value: unknown) => boolean | string);
    }
  >;

  // Steps
  steps: RecipeStepUnion[];

  // Hooks
  hooks?: {
    beforeRecipe?: (ctx: RecipeContext) => Promise<void> | void;
    afterRecipe?: (ctx: RecipeContext, result: RecipeResult) => Promise<void> | void;
    onError?: (ctx: RecipeContext, error: Error) => Promise<void> | void;
    onRollback?: (ctx: RecipeContext) => Promise<void> | void;
  };
}

/**
 * Recipe Context
 */
export interface RecipeContext extends PluginContext {
  recipe: Recipe;
  variables: Record<string, unknown>;
  state: Record<string, unknown>;
  results: Map<string, RecipeStepResult>;
  rollbackStack: Array<() => Promise<void>>;
}

/**
 * Recipe Step Result
 */
export interface RecipeStepResult {
  stepId: string;
  status: RecipeStepStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  output?: unknown;
  error?: Error;
}

/**
 * Recipe Result
 */
export interface RecipeResult {
  status: 'ok' | 'error' | 'partial';
  message: string;
  steps: RecipeStepResult[];
  totalDuration: number;
  completedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  rolledBack: boolean;
}

/**
 * Recipe Registry Info
 */
export interface RecipeInfo {
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'setup' | 'feature' | 'tooling' | 'deployment' | 'maintenance';
  tags: string[];
  verified: boolean;
  downloads?: number;
  updated?: string;
  requires?: {
    kubitVersion?: string;
    nodeVersion?: string;
    plugins?: string[];
  };
}

// ============================================================================
// Feature System Types
// ============================================================================

/**
 * Feature Category
 */
export type FeatureCategory =
  | 'quality' // Linting, formatting, testing
  | 'tooling' // Development tools
  | 'routing' // Routing solutions
  | 'state' // State management
  | 'ui' // UI libraries
  | 'git' // Git hooks and workflows
  | 'deployment' // Deployment tools
  | 'documentation'; // Documentation tools

/**
 * Feature Status
 */
export type FeatureStatus = 'not-installed' | 'installed' | 'configured' | 'outdated';

/**
 * Config Merge Strategy
 */
export type ConfigMergeStrategy = 'merge' | 'replace' | 'append' | 'skip';

/**
 * Feature Definition
 */
export interface Feature {
  name: string;
  version: string;
  description: string;
  category: FeatureCategory;
  tags?: string[];

  // Requirements
  requires?: {
    nodeVersion?: string;
    packageManager?: 'pnpm' | 'npm' | 'yarn';
    dependencies?: string[];
  };

  // Conflicts
  conflicts?: string[];

  // Installation
  dependencies?: string[];
  devDependencies?: string[];
  peerDependencies?: string[];

  // Configuration files
  configFiles?: FeatureConfigFile[];

  // Scripts to add to package.json
  scripts?: Record<string, string>;

  // Post-install instructions
  instructions?: string;

  // Lifecycle hooks
  hooks?: {
    beforeInstall?: (ctx: FeatureContext) => Promise<void> | void;
    afterInstall?: (ctx: FeatureContext) => Promise<void> | void;
    beforeConfigure?: (ctx: FeatureContext) => Promise<void> | void;
    afterConfigure?: (ctx: FeatureContext) => Promise<void> | void;
  };
}

/**
 * Feature Config File
 */
export interface FeatureConfigFile {
  path: string;
  content: string | Record<string, unknown>;
  mergeStrategy?: ConfigMergeStrategy;
  backup?: boolean;
}

/**
 * Feature Context
 */
export interface FeatureContext extends PluginContext {
  feature: Feature;
  projectType: 'react' | 'vanilla' | 'unknown';
  packageManager: 'pnpm' | 'npm' | 'yarn';
  existingConfig: Map<string, unknown>;
  dryRun?: boolean;
}

/**
 * Feature Detection Result
 */
export interface FeatureDetectionResult {
  name: string;
  status: FeatureStatus;
  version?: string;
  configFiles: string[];
  issues?: string[];
}

/**
 * Feature Installation Result
 */
export interface FeatureInstallResult {
  success: boolean;
  feature: string;
  filesCreated: string[];
  filesModified: string[];
  scriptsAdded: string[];
  dependenciesInstalled: string[];
  rollbackAvailable: boolean;
  instructions?: string;
  errors?: string[];
}

/**
 * Feature Rollback Info
 */
export interface FeatureRollbackInfo {
  feature: string;
  timestamp: Date;
  filesCreated: string[];
  filesModified: Array<{ path: string; backup: string }>;
  scriptsAdded: string[];
  dependenciesInstalled: string[];
}
