/**
 * Context Generator
 *
 * Generates React Context with Provider and custom hook
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../../types/index.js';

export interface ContextOptions {
  name: string;
  path?: string;
  test?: boolean;
  typescript?: boolean;
}

/**
 * Generate a React Context with Provider
 */
export async function generateContext(
  options: ContextOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const { name, path: customPath, test: includeTest = true, typescript = true } = options;

  ctx.logger.step(`Generating context: ${name}`);

  // Validate context name
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return {
      message: 'Context name must be PascalCase (e.g., Auth, Theme, UserSettings)',
      status: 'error',
    };
  }

  // Determine output path
  const contextDir = customPath
    ? join(ctx.cwd, customPath, name)
    : join(ctx.cwd, 'src', 'contexts', name);

  // Check if context already exists
  if (existsSync(contextDir)) {
    return {
      message: `Context already exists: ${contextDir}`,
      status: 'error',
    };
  }

  // Create context directory
  mkdirSync(contextDir, { recursive: true });

  const ext = typescript ? 'tsx' : 'jsx';
  const files: string[] = [];

  try {
    // Generate context file
    const contextFile = join(contextDir, `${name}Context.${ext}`);
    const contextContent = generateContextContent(name, { typescript });
    writeFileSync(contextFile, contextContent, 'utf-8');
    files.push(contextFile);
    ctx.logger.success(`Created ${name}Context.${ext}`);

    // Generate provider file
    const providerFile = join(contextDir, `${name}Provider.${ext}`);
    const providerContent = generateProviderContent(name, { typescript });
    writeFileSync(providerFile, providerContent, 'utf-8');
    files.push(providerFile);
    ctx.logger.success(`Created ${name}Provider.${ext}`);

    // Generate hook file
    const hookFile = join(contextDir, `use${name}.ts`);
    const hookContent = generateHookContent(name, { typescript });
    writeFileSync(hookFile, hookContent, 'utf-8');
    files.push(hookFile);
    ctx.logger.success(`Created use${name}.ts`);

    // Generate test file
    if (includeTest) {
      const testFile = join(contextDir, `${name}Context.test.${ext}`);
      const testContent = generateContextTestContent(name, { typescript });
      writeFileSync(testFile, testContent, 'utf-8');
      files.push(testFile);
      ctx.logger.success(`Created ${name}Context.test.${ext}`);
    }

    // Generate index file
    const indexFile = join(contextDir, 'index.ts');
    const indexContent = `export { ${name}Provider } from './${name}Provider';\nexport { use${name} } from './use${name}';\n`;
    writeFileSync(indexFile, indexContent, 'utf-8');
    files.push(indexFile);
    ctx.logger.success('Created index.ts');

    return {
      data: {
        contextDir,
        files,
      },
      message: `Context ${name} generated successfully`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to generate context: ${(error as Error).message}`,
      status: 'error',
    };
  }
}

/**
 * Generate context content
 */
function generateContextContent(name: string, options: { typescript: boolean }): string {
  const { typescript } = options;

  return `import { createContext } from 'react';

${
  typescript
    ? `export interface ${name}State {
  // Add your state properties here
  value: string;
  isLoading: boolean;
  error: Error | null;
}

export interface ${name}Actions {
  // Add your action methods here
  setValue: (value: string) => void;
  reset: () => void;
}

export interface ${name}ContextValue extends ${name}State, ${name}Actions {}
`
    : ''
}
export const ${name}Context = createContext${typescript ? `<${name}ContextValue | undefined>` : ''}(undefined);

${name}Context.displayName = '${name}Context';
`;
}

/**
 * Generate provider content
 */
function generateProviderContent(name: string, options: { typescript: boolean }): string {
  const { typescript } = options;

  return `import { useState, useMemo${typescript ? ', type ReactNode' : ''} } from 'react';
import { ${name}Context${typescript ? `, type ${name}ContextValue` : ''} } from './${name}Context';

${
  typescript
    ? `export interface ${name}ProviderProps {
  children: ReactNode;
  initialValue?: string;
}
`
    : ''
}
export function ${name}Provider({ children, initialValue = '' }${typescript ? `: ${name}ProviderProps` : ''}) {
  const [value, setValue] = useState${typescript ? '<string>' : ''}(initialValue);
  const [isLoading, setIsLoading] = useState${typescript ? '<boolean>' : ''}(false);
  const [error, setError] = useState${typescript ? '<Error | null>' : ''}(null);

  const reset = () => {
    setValue('');
    setError(null);
  };

  const contextValue${typescript ? `: ${name}ContextValue` : ''} = useMemo(
    () => ({
      value,
      isLoading,
      error,
      setValue,
      reset,
    }),
    [value, isLoading, error]
  );

  return (
    <${name}Context.Provider value={contextValue}>
      {children}
    </${name}Context.Provider>
  );
}

${name}Provider.displayName = '${name}Provider';
`;
}

/**
 * Generate hook content
 */
function generateHookContent(name: string, options: { typescript: boolean }): string {
  const { typescript } = options;

  return `import { useContext } from 'react';
import { ${name}Context${typescript ? `, type ${name}ContextValue` : ''} } from './${name}Context';

/**
 * Hook to use ${name} context
 * 
 * @throws {Error} If used outside ${name}Provider
 * 
 * @example
 * const { value, setValue, reset } = use${name}();
 */
export function use${name}()${typescript ? `: ${name}ContextValue` : ''} {
  const context = useContext(${name}Context);

  if (context === undefined) {
    throw new Error('use${name} must be used within a ${name}Provider');
  }

  return context;
}
`;
}

/**
 * Generate context test content
 */
function generateContextTestContent(name: string, _options: { typescript: boolean }): string {
  return `import { render, screen, renderHook, act } from '@testing-library/react';
import { ${name}Provider } from './${name}Provider';
import { use${name} } from './use${name}';

describe('${name}Context', () => {
  it('should provide context values', () => {
    const { result } = renderHook(() => use${name}(), {
      wrapper: ${name}Provider,
    });

    expect(result.current.value).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should update value', () => {
    const { result } = renderHook(() => use${name}(), {
      wrapper: ${name}Provider,
    });

    act(() => {
      result.current.setValue('test');
    });

    expect(result.current.value).toBe('test');
  });

  it('should reset state', () => {
    const { result } = renderHook(() => use${name}(), {
      wrapper: ${name}Provider,
    });

    act(() => {
      result.current.setValue('test');
      result.current.reset();
    });

    expect(result.current.value).toBe('');
  });

  it('should throw error when used outside provider', () => {
    const { result } = renderHook(() => use${name}());

    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('must be used within a ${name}Provider');
  });

  it('should accept initial value', () => {
    const { result } = renderHook(() => use${name}(), {
      wrapper: ({ children }) => (
        <${name}Provider initialValue="initial">{children}</${name}Provider>
      ),
    });

    expect(result.current.value).toBe('initial');
  });
});
`;
}
