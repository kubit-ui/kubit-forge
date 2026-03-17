/**
 * Generate Command - Interactive code generation
 */

import enquirer from 'enquirer';

import type { CommandResult, PluginContext } from '../../types/index.js';

import { displayWelcome } from '../../utils/ui-helpers.js';
import { generateComponent, type ComponentOptions } from './component.js';
import { generateContext, type ContextOptions } from './context.js';
import { generateHook, type HookOptions } from './hook.js';
import { generatePage, type PageOptions } from './page.js';
import { generateService, type ServiceOptions } from './service.js';

export interface GenerateOptions {
  type?: string;
  name?: string;
  skipPrompts?: boolean;
}

const GENERATOR_TYPES = [
  {
    description: 'React component with optional test, story, and styles',
    name: 'Component',
    value: 'component',
  },
  {
    description: 'Page component with routing',
    name: 'Page',
    value: 'page',
  },
  {
    description: 'Custom React hook with tests',
    name: 'Hook',
    value: 'hook',
  },
  {
    description: 'React Context with provider',
    name: 'Context',
    value: 'context',
  },
  {
    description: 'API service with TypeScript types',
    name: 'Service',
    value: 'service',
  },
] as const;

/**
 * Generate command - Interactive wizard
 */
export async function generateCommand(
  options: GenerateOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  displayWelcome('Generate Code', 'Interactive code generation wizard');

  try {
    let generatorType = options.type;
    let name = options.name;

    // Interactive prompts if not provided
    if (!options.skipPrompts) {
      if (!generatorType) {
        const typeResult = (await enquirer.prompt({
          choices: GENERATOR_TYPES.map((t) => ({
            hint: t.description,
            name: t.name,
            value: t.value,
          })),
          message: 'What do you want to generate?',
          name: 'type',
          type: 'select',
        } as never)) as { type: string };
        generatorType = typeResult.type;
      }

      if (!name) {
        const nameResult = (await enquirer.prompt({
          message: `Enter ${generatorType} name:`,
          name: 'name',
          type: 'input',
          validate: (input: string) => {
            if (!input) {
              return 'Name is required';
            }
            if (generatorType === 'component' && !/^[A-Z]/.test(input)) {
              return 'Component name must start with uppercase letter (PascalCase)';
            }
            return true;
          },
        } as never)) as { name: string };
        name = nameResult.name;
      }
    }

    if (!generatorType || !name) {
      return {
        message: 'Generator type and name are required',
        status: 'error',
      };
    }

    // Route to appropriate generator
    switch (generatorType) {
      case 'component':
        return await generateComponent(
          {
            bernova: true,
            css: false,
            name,
            story: false,
            test: true,
            typescript: true,
          } as ComponentOptions,
          ctx
        );

      case 'page':
        return await generatePage(
          {
            auth: false,
            name,
            route: false,
            typescript: true,
          } as PageOptions,
          ctx
        );

      case 'hook':
        return await generateHook(
          {
            name,
            test: true,
            typescript: true,
          } as HookOptions,
          ctx
        );

      case 'context':
        return await generateContext(
          {
            name,
            test: true,
            typescript: true,
          } as ContextOptions,
          ctx
        );

      case 'service':
        return await generateService(
          {
            name,
            test: true,
            typescript: true,
          } as ServiceOptions,
          ctx
        );

      default:
        return {
          message: `Unknown generator type: ${generatorType}`,
          status: 'error',
        };
    }
  } catch (error) {
    return {
      message: `Generation failed: ${(error as Error).message}`,
      status: 'error',
    };
  }
}

export { generateComponent } from './component.js';
export { generateContext } from './context.js';
export { generateHook } from './hook.js';
export { generatePage } from './page.js';
export { generateService } from './service.js';
