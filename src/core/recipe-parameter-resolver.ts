/**
 * Recipe Parameter Resolver
 *
 * Resolves parameters and variables in recipes with support for:
 * - Template strings with variable interpolation
 * - Default values
 * - Type validation
 * - Required parameters
 * - Computed values
 */

import type { Logger } from '../types/index.js';
import type { RecipeContext } from './recipe-engine.js';

export interface RecipeParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required?: boolean;
  default?: unknown;
  validate?: (value: unknown) => boolean | string;
  choices?: unknown[];
  prompt?: {
    message: string;
    type?: 'input' | 'select' | 'multiselect' | 'confirm';
  };
}

export interface RecipeParameterDefinition {
  parameters: RecipeParameter[];
  computed?: Record<string, (vars: Map<string, unknown>) => unknown>;
}

export class RecipeParameterResolver {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Resolve parameters from definition and provided values
   */
  async resolve(
    definition: RecipeParameterDefinition,
    providedValues: Record<string, unknown>,
    _context: RecipeContext
  ): Promise<Map<string, unknown>> {
    const resolved = new Map<string, unknown>();

    // First pass: resolve provided and default values
    for (const param of definition.parameters) {
      let value = providedValues[param.name];

      // Use default if not provided
      if (value === undefined && param.default !== undefined) {
        value = param.default;
      }

      // Check if required
      if (value === undefined && param.required) {
        throw new Error(`Required parameter missing: ${param.name}`);
      }

      // Validate type
      if (value !== undefined) {
        const validationType = this.validateType(value, param.type);
        if (!validationType.valid) {
          throw new Error(
            `Invalid type for parameter '${param.name}': expected ${param.type}, got ${validationType.actualType}`
          );
        }
      }

      // Validate with custom validator
      if (value !== undefined && param.validate) {
        const validation = param.validate(value);
        if (validation !== true) {
          throw new Error(
            `Validation failed for parameter '${param.name}': ${typeof validation === 'string' ? validation : 'Invalid value'}`
          );
        }
      }

      // Check choices
      if (value !== undefined && param.choices && param.choices.length > 0) {
        if (!param.choices.includes(value)) {
          throw new Error(
            `Invalid value for parameter '${param.name}': must be one of ${param.choices.join(', ')}`
          );
        }
      }

      if (value !== undefined) {
        resolved.set(param.name, value);
      }
    }

    // Second pass: resolve computed values
    if (definition.computed) {
      for (const [name, compute] of Object.entries(definition.computed)) {
        try {
          const value = compute(resolved);
          resolved.set(name, value);
        } catch (error) {
          this.logger.warn(
            `Failed to compute parameter '${name}': ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }

    return resolved;
  }

  /**
   * Interpolate template string with variables
   *
   * Supports:
   * - ${variable} - Variable interpolation
   * - ${variable || 'default'} - Default values
   * - ${variable.property} - Property access
   * - ${variable ? 'yes' : 'no'} - Ternary operator
   */
  interpolate(template: string, variables: Map<string, unknown>): string {
    return template.replace(/\$\{([^}]+)\}/g, (match, expression) => {
      try {
        const value = this.evaluateExpression(expression.trim(), variables);
        return String(value ?? '');
      } catch (error) {
        this.logger.warn(
          `Failed to interpolate expression '${expression}': ${error instanceof Error ? error.message : String(error)}`
        );
        return match;
      }
    });
  }

  /**
   * Evaluate expression in template
   */
  private evaluateExpression(expression: string, variables: Map<string, unknown>): unknown {
    // Handle ternary operator: condition ? true : false
    if (expression.includes('?') && expression.includes(':')) {
      const parts = expression.split('?');
      const condition = this.evaluateExpression(parts[0].trim(), variables);
      const [trueValue, falseValue] = parts[1].split(':').map((p) => p.trim());
      return condition
        ? this.evaluateExpression(trueValue, variables)
        : this.evaluateExpression(falseValue, variables);
    }

    // Handle OR operator: value || default
    if (expression.includes('||')) {
      const parts = expression.split('||').map((p) => p.trim());
      for (const part of parts) {
        const value = this.evaluateExpression(part, variables);
        if (value) {
          return value;
        }
      }
      return null;
    }

    // Handle property access: variable.property
    if (expression.includes('.')) {
      const parts = expression.split('.');
      let current: unknown = variables.get(parts[0]);

      for (let i = 1; i < parts.length; i++) {
        if (current === null || current === undefined) {
          return undefined;
        }
        if (typeof current === 'object') {
          current = (current as Record<string, unknown>)[parts[i]];
        } else {
          return undefined;
        }
      }

      return current;
    }

    // Handle string literals
    if (
      (expression.startsWith('"') && expression.endsWith('"')) ||
      (expression.startsWith("'") && expression.endsWith("'"))
    ) {
      return expression.slice(1, -1);
    }

    // Handle number literals
    if (!isNaN(Number(expression))) {
      return Number(expression);
    }

    // Handle boolean literals
    if (expression === 'true') {
      return true;
    }
    if (expression === 'false') {
      return false;
    }
    if (expression === 'null') {
      return null;
    }
    if (expression === 'undefined') {
      return undefined;
    }

    // Variable lookup
    return variables.get(expression);
  }

  /**
   * Validate value type
   */
  private validateType(
    value: unknown,
    expectedType: string
  ): { valid: boolean; actualType: string } {
    const actualType = Array.isArray(value) ? 'array' : typeof value;

    switch (expectedType) {
      case 'string':
        return { actualType, valid: typeof value === 'string' };
      case 'number':
        return { actualType, valid: typeof value === 'number' };
      case 'boolean':
        return { actualType, valid: typeof value === 'boolean' };
      case 'array':
        return { actualType, valid: Array.isArray(value) };
      case 'object':
        return { actualType, valid: typeof value === 'object' && !Array.isArray(value) };
      default:
        return { actualType, valid: true };
    }
  }

  /**
   * Prompt user for missing parameters
   */
  async promptForParameters(
    parameters: RecipeParameter[],
    providedValues: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const values = { ...providedValues };

    for (const param of parameters) {
      // Skip if already provided
      if (values[param.name] !== undefined) {
        continue;
      }

      // Skip if not required and no prompt
      if (!param.required && !param.prompt) {
        continue;
      }

      // Use default if available
      if (param.default !== undefined) {
        values[param.name] = param.default;
        continue;
      }

      // Prompt user
      if (param.prompt) {
        this.logger.info(`\nParameter: ${param.name}`);
        if (param.description) {
          this.logger.info(`Description: ${param.description}`);
        }

        // In production, would use enquirer or similar for interactive prompts
        // For now, just log what would be prompted
        this.logger.info(`Would prompt: ${param.prompt.message}`);

        // Simulate default value for demo
        if (param.type === 'boolean') {
          values[param.name] = false;
        } else if (param.type === 'number') {
          values[param.name] = 0;
        } else if (param.type === 'array') {
          values[param.name] = [];
        } else if (param.type === 'object') {
          values[param.name] = {};
        } else {
          values[param.name] = '';
        }
      }
    }

    return values;
  }

  /**
   * Get parameter summary
   */
  getSummary(parameters: RecipeParameter[], values: Map<string, unknown>): string {
    const lines: string[] = ['Parameters:'];

    for (const param of parameters) {
      const value = values.get(param.name);
      const status = value !== undefined ? '✓' : param.required ? '✗' : '-';
      const valueStr =
        value !== undefined
          ? JSON.stringify(value)
          : param.default !== undefined
            ? `(default: ${JSON.stringify(param.default)})`
            : '(not set)';

      lines.push(`  [${status}] ${param.name}: ${valueStr}`);
      if (param.description) {
        lines.push(`      ${param.description}`);
      }
    }

    return lines.join('\n');
  }
}
