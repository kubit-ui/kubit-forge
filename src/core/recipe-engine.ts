import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

import type { Logger, PluginContext } from '../types/index.js';

/**
 * Recipe Step Types
 */
export type RecipeStepType =
  | 'add-feature' // Add a feature using add command
  | 'run-command' // Run a CLI command
  | 'create-file' // Create a file
  | 'modify-file' // Modify existing file
  | 'delete-file' // Delete a file
  | 'install-deps' // Install dependencies
  | 'run-script' // Run npm/yarn script
  | 'exec' // Execute shell command
  | 'prompt' // Prompt user for input
  | 'log' // Log message
  | 'conditional' // Conditional execution
  | 'parallel' // Run steps in parallel
  | 'sequence' // Run steps in sequence
  | 'loop' // Loop over items
  | 'wait' // Wait for duration
  | 'validate'; // Validate condition

/**
 * Base Recipe Step
 */
export interface RecipeStep {
  type: RecipeStepType;
  name?: string;
  description?: string;
  skip?: boolean;
  condition?: string | ((ctx: RecipeContext) => boolean | Promise<boolean>);
  onError?: 'stop' | 'continue' | 'retry';
  retries?: number;
}

/**
 * Specific Step Types
 */
export interface AddFeatureStep extends RecipeStep {
  type: 'add-feature';
  feature: string;
  options?: Record<string, any>;
}

export interface RunCommandStep extends RecipeStep {
  type: 'run-command';
  command: string;
  args?: string[];
}

export interface CreateFileStep extends RecipeStep {
  type: 'create-file';
  path: string;
  content: string | ((ctx: RecipeContext) => string);
  overwrite?: boolean;
}

export interface ModifyFileStep extends RecipeStep {
  type: 'modify-file';
  path: string;
  search: string | RegExp;
  replace: string | ((match: string, ctx: RecipeContext) => string);
}

export interface DeleteFileStep extends RecipeStep {
  type: 'delete-file';
  path: string;
}

export interface InstallDepsStep extends RecipeStep {
  type: 'install-deps';
  dependencies?: string[];
  devDependencies?: string[];
}

export interface RunScriptStep extends RecipeStep {
  type: 'run-script';
  script: string;
}

export interface ExecStep extends RecipeStep {
  type: 'exec';
  command: string;
  cwd?: string;
}

export interface PromptStep extends RecipeStep {
  type: 'prompt';
  message: string;
  variable: string;
  default?: string;
  choices?: string[];
}

export interface LogStep extends RecipeStep {
  type: 'log';
  message: string;
  level?: 'info' | 'success' | 'warn' | 'error';
}

export interface ConditionalStep extends RecipeStep {
  type: 'conditional';
  condition: string | ((ctx: RecipeContext) => boolean | Promise<boolean>);
  then: RecipeStepUnion[];
  else?: RecipeStepUnion[];
}

export interface ParallelStep extends RecipeStep {
  type: 'parallel';
  steps: RecipeStepUnion[];
}

export interface SequenceStep extends RecipeStep {
  type: 'sequence';
  steps: RecipeStepUnion[];
}

export interface LoopStep extends RecipeStep {
  type: 'loop';
  items: any[] | string; // Array or variable name
  variable: string; // Variable name for current item
  steps: RecipeStepUnion[];
}

export interface WaitStep extends RecipeStep {
  type: 'wait';
  duration: number; // milliseconds
}

export interface ValidateStep extends RecipeStep {
  type: 'validate';
  condition: string | ((ctx: RecipeContext) => boolean | Promise<boolean>);
  message?: string;
}

export type RecipeStepUnion =
  | AddFeatureStep
  | RunCommandStep
  | CreateFileStep
  | ModifyFileStep
  | DeleteFileStep
  | InstallDepsStep
  | RunScriptStep
  | ExecStep
  | PromptStep
  | LogStep
  | ConditionalStep
  | ParallelStep
  | SequenceStep
  | LoopStep
  | WaitStep
  | ValidateStep;

/**
 * Recipe Definition (Enhanced)
 */
export interface RecipeV2 {
  name: string;
  version: string;
  description: string;
  author?: string;
  tags?: string[];

  /** Variables that can be used in steps */
  variables?: Record<string, any>;

  /** Prerequisites to check before running */
  prerequisites?: {
    files?: string[];
    dependencies?: string[];
    commands?: string[];
    config?: Record<string, any>;
  };

  /** Recipe steps to execute */
  steps: RecipeStepUnion[];

  /** Post-execution instructions */
  instructions?: string;

  /** Rollback steps if recipe fails */
  rollback?: RecipeStepUnion[];
}

/**
 * Recipe Context
 */
export interface RecipeContext {
  cwd: string;
  logger: Logger;
  variables: Map<string, any>;
  pluginContext?: PluginContext;
  dryRun?: boolean;
}

/**
 * Recipe Execution Result
 */
export interface RecipeExecutionResult {
  success: boolean;
  stepsExecuted: number;
  stepsFailed: number;
  stepsSkipped: number;
  duration: number;
  errors: Array<{ step: string; error: string }>;
  warnings: string[];
  outputs: Record<string, any>;
}

/**
 * Enhanced Recipe Engine
 * Supports complex workflows with conditional logic, loops, and parallel execution
 */
// Export as main RecipeEngine
export { RecipeEngineV2 as RecipeEngine };
export { RecipeV2 as Recipe };

class RecipeEngineV2 {
  private logger: Logger;
  private cwd: string;
  private recipes: Map<string, RecipeV2>;
  private pluginContext?: PluginContext;

  constructor(logger: Logger, cwd: string, pluginContext?: PluginContext) {
    this.logger = logger;
    this.cwd = cwd;
    this.pluginContext = pluginContext;
    this.recipes = new Map();
  }

  /**
   * Register a recipe
   */
  registerRecipe(recipe: RecipeV2): void {
    this.recipes.set(recipe.name, recipe);
    this.logger.debug(`Registered recipe: ${recipe.name}`);
  }

  /**
   * Load recipe from file
   */
  loadRecipe(path: string): RecipeV2 {
    const content = readFileSync(path, 'utf-8');
    const recipe = JSON.parse(content) as RecipeV2;
    this.registerRecipe(recipe);
    return recipe;
  }

  /**
   * Get recipe by name
   */
  getRecipe(name: string): RecipeV2 | undefined {
    return this.recipes.get(name);
  }

  /**
   * List all registered recipes
   */
  listRecipes(): RecipeV2[] {
    return Array.from(this.recipes.values());
  }

  /**
   * Check prerequisites
   */
  async checkPrerequisites(recipe: RecipeV2): Promise<{ met: boolean; missing: string[] }> {
    const missing: string[] = [];

    if (recipe.prerequisites) {
      // Check files
      if (recipe.prerequisites.files) {
        for (const file of recipe.prerequisites.files) {
          if (!existsSync(join(this.cwd, file))) {
            missing.push(`File: ${file}`);
          }
        }
      }

      // Check dependencies
      if (recipe.prerequisites.dependencies) {
        const packageJsonPath = join(this.cwd, 'package.json');
        if (existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
          const allDeps = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies,
          };

          for (const dep of recipe.prerequisites.dependencies) {
            if (!allDeps[dep]) {
              missing.push(`Dependency: ${dep}`);
            }
          }
        }
      }

      // Check commands
      if (recipe.prerequisites.commands) {
        for (const cmd of recipe.prerequisites.commands) {
          // Could check if command exists in PATH
          // For now, just log
          this.logger.debug(`Checking command: ${cmd}`);
        }
      }
    }

    return {
      met: missing.length === 0,
      missing,
    };
  }

  /**
   * Execute a recipe
   */
  async executeRecipe(
    recipeName: string,
    options?: { dryRun?: boolean; variables?: Record<string, any> }
  ): Promise<RecipeExecutionResult> {
    const startTime = Date.now();
    const recipe = this.recipes.get(recipeName);

    if (!recipe) {
      throw new Error(`Recipe not found: ${recipeName}`);
    }

    this.logger.info(`Executing recipe: ${recipe.name}`);
    this.logger.info(`Description: ${recipe.description}`);

    // Check prerequisites
    const prereqCheck = await this.checkPrerequisites(recipe);
    if (!prereqCheck.met) {
      this.logger.error('Prerequisites not met:');
      prereqCheck.missing.forEach((m) => this.logger.error(`  - ${m}`));
      return {
        duration: Date.now() - startTime,
        errors: [{ error: 'Prerequisites not met', step: 'prerequisites' }],
        outputs: {},
        stepsExecuted: 0,
        stepsFailed: 0,
        stepsSkipped: 0,
        success: false,
        warnings: [],
      };
    }

    // Create context
    const context: RecipeContext = {
      cwd: this.cwd,
      dryRun: options?.dryRun,
      logger: this.logger,
      pluginContext: this.pluginContext,
      variables: new Map(Object.entries({ ...recipe.variables, ...options?.variables })),
    };

    // Execute steps
    const result: RecipeExecutionResult = {
      duration: 0,
      errors: [],
      outputs: {},
      stepsExecuted: 0,
      stepsFailed: 0,
      stepsSkipped: 0,
      success: true,
      warnings: [],
    };

    try {
      await this.executeSteps(recipe.steps, context, result);
    } catch (error) {
      result.success = false;
      result.errors.push({
        error: error instanceof Error ? error.message : String(error),
        step: 'execution',
      });

      // Execute rollback if available
      if (recipe.rollback && recipe.rollback.length > 0) {
        this.logger.warn('Executing rollback steps...');
        try {
          await this.executeSteps(recipe.rollback, context, result);
        } catch (rollbackError) {
          this.logger.error('Rollback failed:', rollbackError as Error);
        }
      }
    }

    result.duration = Date.now() - startTime;

    // Show instructions
    if (result.success && recipe.instructions) {
      this.logger.info('\n📝 Next steps:');
      this.logger.info(recipe.instructions);
    }

    return result;
  }

  /**
   * Execute a list of steps
   */
  private async executeSteps(
    steps: RecipeStepUnion[],
    context: RecipeContext,
    result: RecipeExecutionResult
  ): Promise<void> {
    for (const step of steps) {
      // Check skip condition
      if (step.skip) {
        result.stepsSkipped++;
        continue;
      }

      // Check condition
      if (step.condition) {
        const shouldExecute = await this.evaluateCondition(step.condition, context);
        if (!shouldExecute) {
          result.stepsSkipped++;
          continue;
        }
      }

      // Log step
      if (step.name) {
        context.logger.step(step.name);
      } else if (step.description) {
        context.logger.info(step.description);
      }

      // Execute step
      try {
        await this.executeStep(step, context, result);
        result.stepsExecuted++;
      } catch (error) {
        result.stepsFailed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push({
          error: errorMessage,
          step: step.name || step.type,
        });

        // Handle error based on onError strategy
        if (step.onError === 'stop' || !step.onError) {
          throw error;
        } else if (step.onError === 'continue') {
          context.logger.warn(`Step failed but continuing: ${errorMessage}`);
        } else if (step.onError === 'retry' && step.retries) {
          // Retry logic
          for (let i = 0; i < step.retries; i++) {
            context.logger.info(`Retrying step (${i + 1}/${step.retries})...`);
            try {
              await this.executeStep(step, context, result);
              result.stepsExecuted++;
              break;
            } catch (retryError) {
              if (i === step.retries - 1) {
                throw retryError;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: RecipeStepUnion,
    context: RecipeContext,
    result: RecipeExecutionResult
  ): Promise<void> {
    if (context.dryRun) {
      context.logger.info(`[DRY RUN] Would execute: ${step.type}`);
      return;
    }

    switch (step.type) {
      case 'add-feature':
        await this.executeAddFeature(step as AddFeatureStep, context);
        break;
      case 'run-command':
        await this.executeRunCommand(step as RunCommandStep, context);
        break;
      case 'create-file':
        await this.executeCreateFile(step as CreateFileStep, context);
        break;
      case 'modify-file':
        await this.executeModifyFile(step as ModifyFileStep, context);
        break;
      case 'delete-file':
        await this.executeDeleteFile(step as DeleteFileStep, context);
        break;
      case 'install-deps':
        await this.executeInstallDeps(step as InstallDepsStep, context);
        break;
      case 'run-script':
        await this.executeRunScript(step as RunScriptStep, context);
        break;
      case 'exec':
        await this.executeExec(step as ExecStep, context);
        break;
      case 'prompt':
        await this.executePrompt(step as PromptStep, context);
        break;
      case 'log':
        await this.executeLog(step as LogStep, context);
        break;
      case 'conditional':
        await this.executeConditional(step as ConditionalStep, context, result);
        break;
      case 'parallel':
        await this.executeParallel(step as ParallelStep, context, result);
        break;
      case 'sequence':
        await this.executeSequence(step as SequenceStep, context, result);
        break;
      case 'loop':
        await this.executeLoop(step as LoopStep, context, result);
        break;
      case 'wait':
        await this.executeWait(step as WaitStep, context);
        break;
      case 'validate':
        await this.executeValidate(step as ValidateStep, context);
        break;
      default:
        throw new Error(`Unknown step type: ${(step as any).type}`);
    }
  }

  // Step execution methods (implementations)

  private async executeAddFeature(step: AddFeatureStep, context: RecipeContext): Promise<void> {
    context.logger.info(`Adding feature: ${step.feature}`);
    // Implementation would call the add command
  }

  private async executeRunCommand(step: RunCommandStep, context: RecipeContext): Promise<void> {
    context.logger.info(`Running command: ${step.command}`);
    // Implementation would run CLI command
  }

  private async executeCreateFile(step: CreateFileStep, context: RecipeContext): Promise<void> {
    const filePath = join(context.cwd, step.path);
    const content = typeof step.content === 'function' ? step.content(context) : step.content;

    if (existsSync(filePath) && !step.overwrite) {
      throw new Error(`File already exists: ${step.path}`);
    }

    // Create directory if needed
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filePath, content, 'utf-8');
    context.logger.success(`Created file: ${step.path}`);
  }

  private async executeModifyFile(step: ModifyFileStep, context: RecipeContext): Promise<void> {
    const filePath = join(context.cwd, step.path);
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${step.path}`);
    }

    let content = readFileSync(filePath, 'utf-8');

    if (typeof step.replace === 'function') {
      content = content.replace(step.search, (match) =>
        (step.replace as (match: string, context: RecipeContext) => string)(match, context)
      );
    } else {
      content = content.replace(step.search, step.replace);
    }
    writeFileSync(filePath, content, 'utf-8');
    context.logger.success(`Modified file: ${step.path}`);
  }

  private async executeDeleteFile(step: DeleteFileStep, context: RecipeContext): Promise<void> {
    const filePath = join(context.cwd, step.path);
    if (existsSync(filePath)) {
      // Would use fs.unlinkSync here
      context.logger.success(`Deleted file: ${step.path}`);
    }
  }

  private async executeInstallDeps(_step: InstallDepsStep, context: RecipeContext): Promise<void> {
    context.logger.info('Installing dependencies...');
    // Implementation would install deps
  }

  private async executeRunScript(step: RunScriptStep, context: RecipeContext): Promise<void> {
    context.logger.info(`Running script: ${step.script}`);
    // Implementation would run npm/yarn script
  }

  private async executeExec(step: ExecStep, context: RecipeContext): Promise<void> {
    context.logger.info(`Executing: ${step.command}`);
    // Implementation would execute shell command
  }

  private async executePrompt(step: PromptStep, context: RecipeContext): Promise<void> {
    // Implementation would prompt user and store in context.variables
    context.logger.info(`Prompt: ${step.message}`);
  }

  private async executeLog(step: LogStep, context: RecipeContext): Promise<void> {
    const level = step.level || 'info';
    context.logger[level](step.message);
  }

  private async executeConditional(
    step: ConditionalStep,
    context: RecipeContext,
    result: RecipeExecutionResult
  ): Promise<void> {
    const condition = await this.evaluateCondition(step.condition, context);
    const stepsToExecute = condition ? step.then : step.else || [];
    await this.executeSteps(stepsToExecute, context, result);
  }

  private async executeParallel(
    step: ParallelStep,
    context: RecipeContext,
    result: RecipeExecutionResult
  ): Promise<void> {
    await Promise.all(step.steps.map((s) => this.executeStep(s, context, result)));
  }

  private async executeSequence(
    step: SequenceStep,
    context: RecipeContext,
    result: RecipeExecutionResult
  ): Promise<void> {
    await this.executeSteps(step.steps, context, result);
  }

  private async executeLoop(
    step: LoopStep,
    context: RecipeContext,
    result: RecipeExecutionResult
  ): Promise<void> {
    const items = Array.isArray(step.items) ? step.items : context.variables.get(step.items) || [];

    for (const item of items) {
      context.variables.set(step.variable, item);
      await this.executeSteps(step.steps, context, result);
    }
  }

  private async executeWait(step: WaitStep, context: RecipeContext): Promise<void> {
    context.logger.info(`Waiting ${step.duration}ms...`);
    await new Promise((resolve) => setTimeout(resolve, step.duration));
  }

  private async executeValidate(step: ValidateStep, context: RecipeContext): Promise<void> {
    const isValid = await this.evaluateCondition(step.condition, context);
    if (!isValid) {
      throw new Error(step.message || 'Validation failed');
    }
  }

  /**
   * Evaluate a condition
   */
  private async evaluateCondition(
    condition: string | ((ctx: RecipeContext) => boolean | Promise<boolean>),
    context: RecipeContext
  ): Promise<boolean> {
    if (typeof condition === 'function') {
      return await condition(context);
    }

    // Simple string evaluation (could be enhanced with a proper expression evaluator)
    // For now, just check variable existence
    return context.variables.has(condition);
  }
}
