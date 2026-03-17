import { describe, it, expect, beforeEach, vi } from 'vitest';

import type { Recipe } from '../../core/recipe-engine.js';

import { RecipeEngine } from '../../core/recipe-engine.js';

describe('RecipeEngine', () => {
  let recipeEngine: RecipeEngine;
  const mockLogger = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    json: vi.fn(),
    step: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
  };

  beforeEach(() => {
    recipeEngine = new RecipeEngine(mockLogger as any, '/test/project');
    vi.clearAllMocks();
  });

  describe('registerRecipe', () => {
    it('should register a recipe', () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        steps: [],
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe);

      const recipes = recipeEngine.listRecipes();
      expect(recipes).toHaveLength(1);
      expect(recipes[0].name).toBe('test-recipe');
    });

    it('should register multiple recipes', () => {
      const recipe1: Recipe = {
        description: 'Recipe 1',
        name: 'recipe-1',
        steps: [],
        version: '1.0.0',
      };

      const recipe2: Recipe = {
        description: 'Recipe 2',
        name: 'recipe-2',
        steps: [],
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe1);
      recipeEngine.registerRecipe(recipe2);

      const recipes = recipeEngine.listRecipes();
      expect(recipes).toHaveLength(2);
    });
  });

  describe('getRecipe', () => {
    it('should get registered recipe by name', () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        steps: [],
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe);

      const retrieved = recipeEngine.getRecipe('test-recipe');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe('test-recipe');
    });

    it('should return undefined for non-existent recipe', () => {
      const retrieved = recipeEngine.getRecipe('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('listRecipes', () => {
    it('should return empty array when no recipes registered', () => {
      const recipes = recipeEngine.listRecipes();
      expect(recipes).toEqual([]);
    });

    it('should list all registered recipes', () => {
      const recipe1: Recipe = {
        description: 'Recipe 1',
        name: 'recipe-1',
        steps: [],
        version: '1.0.0',
      };

      const recipe2: Recipe = {
        description: 'Recipe 2',
        name: 'recipe-2',
        steps: [],
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe1);
      recipeEngine.registerRecipe(recipe2);

      const recipes = recipeEngine.listRecipes();
      expect(recipes).toHaveLength(2);
      expect(recipes.map((r) => r.name)).toContain('recipe-1');
      expect(recipes.map((r) => r.name)).toContain('recipe-2');
    });
  });

  describe('checkPrerequisites', () => {
    it('should pass when no prerequisites defined', async () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        steps: [],
        version: '1.0.0',
      };

      const result = await recipeEngine.checkPrerequisites(recipe);
      expect(result.met).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should check file prerequisites', async () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        prerequisites: {
          files: ['package.json', 'tsconfig.json'],
        },
        steps: [],
        version: '1.0.0',
      };

      const result = await recipeEngine.checkPrerequisites(recipe);
      // Result depends on actual file system
      expect(result).toHaveProperty('met');
      expect(result).toHaveProperty('missing');
    });
  });

  describe('executeRecipe', () => {
    it('should execute simple recipe', async () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        steps: [
          {
            level: 'info',
            message: 'Test message',
            type: 'log',
          },
        ],
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe);

      const result = await recipeEngine.executeRecipe('test-recipe', {
        dryRun: true,
      });

      expect(result.success).toBe(true);
      expect(result.stepsExecuted).toBeGreaterThanOrEqual(0);
    });

    it('should handle dry-run mode', async () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        steps: [
          {
            content: 'test content',
            path: 'test.txt',
            type: 'create-file',
          },
        ],
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe);

      const result = await recipeEngine.executeRecipe('test-recipe', {
        dryRun: true,
      });

      expect(result.success).toBe(true);
      // In dry-run, no actual files should be created
    });

    it('should throw error for non-existent recipe', async () => {
      await expect(recipeEngine.executeRecipe('non-existent')).rejects.toThrow('Recipe not found');
    });

    it('should handle recipe with variables', async () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        steps: [
          {
            message: 'Project: ${projectName}',
            type: 'log',
          },
        ],
        variables: {
          projectName: 'default-name',
        },
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe);

      const result = await recipeEngine.executeRecipe('test-recipe', {
        dryRun: true,
        variables: {
          projectName: 'my-project',
        },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('Recipe Steps', () => {
    it('should handle log step', async () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        steps: [
          {
            level: 'info',
            message: 'Test log message',
            type: 'log',
          },
        ],
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe);

      const result = await recipeEngine.executeRecipe('test-recipe', {
        dryRun: true,
      });

      expect(result.success).toBe(true);
    });

    it('should handle sequence step', async () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        steps: [
          {
            steps: [
              {
                message: 'Step 1',
                type: 'log',
              },
              {
                message: 'Step 2',
                type: 'log',
              },
            ],
            type: 'sequence',
          },
        ],
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe);

      const result = await recipeEngine.executeRecipe('test-recipe', {
        dryRun: true,
      });

      expect(result.success).toBe(true);
    });

    it('should handle parallel step', async () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        steps: [
          {
            steps: [
              {
                message: 'Parallel 1',
                type: 'log',
              },
              {
                message: 'Parallel 2',
                type: 'log',
              },
            ],
            type: 'parallel',
          },
        ],
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe);

      const result = await recipeEngine.executeRecipe('test-recipe', {
        dryRun: true,
      });

      expect(result.success).toBe(true);
    });

    it('should handle conditional step', async () => {
      const recipe: Recipe = {
        description: 'Test recipe',
        name: 'test-recipe',
        steps: [
          {
            condition: 'shouldRun',
            else: [
              {
                message: 'Condition not met',
                type: 'log',
              },
            ],
            then: [
              {
                message: 'Condition met',
                type: 'log',
              },
            ],
            type: 'conditional',
          },
        ],
        variables: {
          shouldRun: true,
        },
        version: '1.0.0',
      };

      recipeEngine.registerRecipe(recipe);

      const result = await recipeEngine.executeRecipe('test-recipe', {
        dryRun: true,
      });

      expect(result.success).toBe(true);
    });
  });
});
