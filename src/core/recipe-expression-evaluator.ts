/**
 * Recipe Expression Evaluator
 *
 * Evaluates conditional expressions in recipes with support for:
 * - Variable comparisons
 * - File existence checks
 * - Dependency checks
 * - Environment variables
 * - Logical operators (AND, OR, NOT)
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import type { RecipeContext } from './recipe-engine.js';

export class RecipeExpressionEvaluator {
  /**
   * Evaluate a condition expression
   *
   * Supported expressions:
   * - Variable checks: $variable, $variable === 'value'
   * - File checks: file.exists('path'), file.contains('path', 'text')
   * - Dependency checks: dep.installed('package'), dep.version('package', '>=1.0.0')
   * - Environment: env.NODE_ENV === 'production'
   * - Logical: condition1 && condition2, condition1 || condition2, !condition
   * - Functions: hasFeature('eslint'), isReact(), isTypeScript()
   */
  static evaluate(expression: string, context: RecipeContext): boolean {
    try {
      // Create safe evaluation context
      const evalContext = this.createEvalContext(context);

      // Parse and evaluate expression
      const result = this.parseExpression(expression, evalContext);

      return Boolean(result);
    } catch (error) {
      context.logger.warn(`Expression evaluation failed: ${expression}`);
      context.logger.debug(`Error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Create evaluation context with helper functions
   */
  private static createEvalContext(context: RecipeContext): Record<string, any> {
    const cwd = context.cwd;
    const variables = context.variables;

    return {
      // Variables
      $: (name: string) => variables.get(name),

      // Dependency operations
      dep: {
        installed: (packageName: string) => {
          const pkgPath = join(cwd, 'package.json');
          if (!existsSync(pkgPath)) {
            return false;
          }
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
          return !!(pkg.dependencies?.[packageName] || pkg.devDependencies?.[packageName]);
        },
        version: (packageName: string, versionRange: string) => {
          // Simplified version check - in production would use semver
          const pkgPath = join(cwd, 'package.json');
          if (!existsSync(pkgPath)) {
            return false;
          }
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
          const version = pkg.dependencies?.[packageName] || pkg.devDependencies?.[packageName];
          return !!version && version.includes(versionRange);
        },
      },

      // Environment
      env: process.env,

      // File operations
      file: {
        contains: (path: string, text: string) => {
          const filePath = join(cwd, path);
          if (!existsSync(filePath)) {
            return false;
          }
          const content = readFileSync(filePath, 'utf-8');
          return content.includes(text);
        },
        exists: (path: string) => existsSync(join(cwd, path)),
        matches: (path: string, pattern: RegExp) => {
          const filePath = join(cwd, path);
          if (!existsSync(filePath)) {
            return false;
          }
          const content = readFileSync(filePath, 'utf-8');
          return pattern.test(content);
        },
      },

      // Helper functions
      hasFeature: (feature: string) => {
        const pkgPath = join(cwd, 'package.json');
        if (!existsSync(pkgPath)) {
          return false;
        }
        const pkgContent = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
        };

        // Check common feature indicators
        const featureMap: Record<string, string[]> = {
          eslint: ['eslint'],
          jest: ['jest'],
          prettier: ['prettier'],
          react: ['react', 'react-dom'],
          storybook: ['@storybook/react', '@storybook/vue'],
          typescript: ['typescript'],
          vitest: ['vitest'],
          vue: ['vue'],
        };

        const packages = featureMap[feature.toLowerCase()] || [feature];
        return packages.some(
          (pkgName) =>
            pkgName in (pkgContent.dependencies || {}) ||
            pkgName in (pkgContent.devDependencies || {})
        );
      },

      isReact: () => {
        const pkgPath = join(cwd, 'package.json');
        if (!existsSync(pkgPath)) {
          return false;
        }
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        return !!(pkg.dependencies?.react || pkg.devDependencies?.react);
      },

      isTypeScript: () => {
        return existsSync(join(cwd, 'tsconfig.json'));
      },

      isVite: () => {
        const pkgPath = join(cwd, 'package.json');
        if (!existsSync(pkgPath)) {
          return false;
        }
        const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
        return !!(pkg.dependencies?.vite || pkg.devDependencies?.vite);
      },

      // Variable access
      ...Object.fromEntries(variables.entries()),
    };
  }

  /**
   * Parse and evaluate expression
   */
  private static parseExpression(expression: string, context: Record<string, any>): any {
    // Handle simple variable access
    if (expression.startsWith('$')) {
      const varName = expression.slice(1);
      return context[varName];
    }

    // Handle logical operators
    if (expression.includes('&&')) {
      const parts = expression.split('&&').map((p) => p.trim());
      return parts.every((part) => this.parseExpression(part, context));
    }

    if (expression.includes('||')) {
      const parts = expression.split('||').map((p) => p.trim());
      return parts.some((part) => this.parseExpression(part, context));
    }

    if (expression.startsWith('!')) {
      return !this.parseExpression(expression.slice(1).trim(), context);
    }

    // Handle comparison operators
    if (expression.includes('===')) {
      const [left, right] = expression.split('===').map((p) => p.trim());
      return this.parseExpression(left, context) === this.evaluateValue(right, context);
    }

    if (expression.includes('!==')) {
      const [left, right] = expression.split('!==').map((p) => p.trim());
      return this.parseExpression(left, context) !== this.evaluateValue(right, context);
    }

    if (expression.includes('>=')) {
      const [left, right] = expression.split('>=').map((p) => p.trim());
      return this.parseExpression(left, context) >= this.evaluateValue(right, context);
    }

    if (expression.includes('<=')) {
      const [left, right] = expression.split('<=').map((p) => p.trim());
      return this.parseExpression(left, context) <= this.evaluateValue(right, context);
    }

    if (expression.includes('>')) {
      const [left, right] = expression.split('>').map((p) => p.trim());
      return this.parseExpression(left, context) > this.evaluateValue(right, context);
    }

    if (expression.includes('<')) {
      const [left, right] = expression.split('<').map((p) => p.trim());
      return this.parseExpression(left, context) < this.evaluateValue(right, context);
    }

    // Handle function calls
    if (expression.includes('(')) {
      return this.evaluateFunctionCall(expression, context);
    }

    // Handle property access
    if (expression.includes('.')) {
      return this.evaluatePropertyAccess(expression, context);
    }

    // Return as-is if it's a literal
    return this.evaluateValue(expression, context);
  }

  /**
   * Evaluate a value (string, number, boolean, or variable)
   */
  private static evaluateValue(value: string, context: Record<string, any>): any {
    value = value.trim();

    // String literal
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }

    // Number
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Boolean
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }

    // Variable
    if (value.startsWith('$')) {
      return context[value.slice(1)];
    }

    // Context property
    return context[value];
  }

  /**
   * Evaluate function call
   */
  private static evaluateFunctionCall(expression: string, context: Record<string, any>): any {
    const match = expression.match(/^(\w+(?:\.\w+)*)\((.*)\)$/);
    if (!match) {
      return false;
    }

    const [, funcPath, argsStr] = match;
    const args = this.parseArguments(argsStr, context);

    // Navigate to function
    const func = this.navigateProperty(funcPath, context);
    if (typeof func !== 'function') {
      return false;
    }

    return func(...args);
  }

  /**
   * Evaluate property access
   */
  private static evaluatePropertyAccess(expression: string, context: Record<string, any>): any {
    return this.navigateProperty(expression, context);
  }

  /**
   * Navigate nested property path
   */
  private static navigateProperty(path: string, context: Record<string, any>): any {
    const parts = path.split('.');
    let current = context;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Parse function arguments
   */
  private static parseArguments(argsStr: string, context: Record<string, any>): any[] {
    if (!argsStr.trim()) {
      return [];
    }

    // Simple argument parsing (doesn't handle nested commas)
    const args = argsStr.split(',').map((arg) => this.evaluateValue(arg, context));
    return args;
  }

  /**
   * Validate expression syntax
   */
  static validate(expression: string): { valid: boolean; error?: string } {
    try {
      // Basic syntax validation
      const balanced = this.checkBalancedParentheses(expression);
      if (!balanced) {
        return { error: 'Unbalanced parentheses', valid: false };
      }

      return { valid: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Invalid expression',
        valid: false,
      };
    }
  }

  /**
   * Check if parentheses are balanced
   */
  private static checkBalancedParentheses(str: string): boolean {
    let count = 0;
    for (const char of str) {
      if (char === '(') {
        count++;
      }
      if (char === ')') {
        count--;
      }
      if (count < 0) {
        return false;
      }
    }
    return count === 0;
  }
}
