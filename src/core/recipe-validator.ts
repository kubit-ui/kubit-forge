import type { Recipe } from '../types/index.js';

export class RecipeValidator {
  validate(recipe: Recipe): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!recipe.name) {
      errors.push('Recipe must have a name');
    }
    if (!recipe.version) {
      errors.push('Recipe must have a version');
    }
    if (!recipe.steps || recipe.steps.length === 0) {
      errors.push('Recipe must have steps');
    }

    return { errors, valid: errors.length === 0 };
  }
}
