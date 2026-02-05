/**
 * Hook Generator
 *
 * Generates custom React hooks with optional tests
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../../types/index.js';

export interface HookOptions {
  name: string;
  path?: string;
  test?: boolean;
  typescript?: boolean;
}

/**
 * Generate a custom React hook
 */
export async function generateHook(
  options: HookOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const { name, path: customPath, test: includeTest = true, typescript = true } = options;

  ctx.logger.step(`Generating hook: ${name}`);

  // Validate hook name
  if (!/^use[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return {
      message: 'Hook name must start with "use" and be camelCase (e.g., useAuth, useLocalStorage)',
      status: 'error',
    };
  }

  // Determine output path
  const hooksDir = customPath ? join(ctx.cwd, customPath) : join(ctx.cwd, 'src', 'hooks');

  // Create hooks directory if it doesn't exist
  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true });
  }

  const ext = typescript ? 'ts' : 'js';
  const files: string[] = [];

  try {
    // Generate hook file
    const hookFile = join(hooksDir, `${name}.${ext}`);

    // Check if hook already exists
    if (existsSync(hookFile)) {
      return {
        message: `Hook already exists: ${hookFile}`,
        status: 'error',
      };
    }

    const hookContent = generateHookContent(name, { typescript });
    writeFileSync(hookFile, hookContent, 'utf-8');
    files.push(hookFile);
    ctx.logger.success(`Created ${name}.${ext}`);

    // Generate test file
    if (includeTest) {
      const testFile = join(hooksDir, `${name}.test.${ext}`);
      const testContent = generateHookTestContent(name, { typescript });
      writeFileSync(testFile, testContent, 'utf-8');
      files.push(testFile);
      ctx.logger.success(`Created ${name}.test.${ext}`);
    }

    return {
      data: {
        files,
        hooksDir,
      },
      message: `Hook ${name} generated successfully`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to generate hook: ${(error as Error).message}`,
      status: 'error',
    };
  }
}

/**
 * Generate hook content
 */
function generateHookContent(name: string, options: { typescript: boolean }): string {
  const { typescript } = options;

  return `import { useState, useEffect, useCallback } from 'react';

${
  typescript
    ? `export interface ${capitalize(name)}Options {
  // Add options here
}

export interface ${capitalize(name)}Return {
  // Add return values here
  value: string;
  setValue: (value: string) => void;
  reset: () => void;
}
`
    : ''
}
/**
 * ${name} - Custom React hook
 * 
 * @example
 * const { value, setValue, reset } = ${name}();
 */
export function ${name}(${typescript ? `options?: ${capitalize(name)}Options` : 'options'})${typescript ? `: ${capitalize(name)}Return` : ''} {
  const [value, setValue] = useState${typescript ? '<string>' : ''}('');

  useEffect(() => {
    // Add side effects here
    console.log('${name} mounted');

    return () => {
      // Cleanup
      console.log('${name} unmounted');
    };
  }, []);

  const reset = useCallback(() => {
    setValue('');
  }, []);

  return {
    value,
    setValue,
    reset,
  };
}
`;
}

/**
 * Generate hook test content
 */
function generateHookTestContent(name: string, _options: { typescript: boolean }): string {
  return `import { renderHook, act } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => ${name}());
    
    expect(result.current.value).toBe('');
  });

  it('should update value', () => {
    const { result } = renderHook(() => ${name}());
    
    act(() => {
      result.current.setValue('test');
    });

    expect(result.current.value).toBe('test');
  });

  it('should reset value', () => {
    const { result } = renderHook(() => ${name}());
    
    act(() => {
      result.current.setValue('test');
      result.current.reset();
    });

    expect(result.current.value).toBe('');
  });

  it('should handle options', () => {
    const { result } = renderHook(() => ${name}({ /* options */ }));
    
    expect(result.current).toBeDefined();
  });
});
`;
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
