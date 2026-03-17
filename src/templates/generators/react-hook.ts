/**
 * React Hook Templates
 */

export interface HookTemplateParams {
  name: string;
}

/**
 * Generate React hook file content
 */
export function generateHookTemplate(params: HookTemplateParams): string {
  const { name } = params;

  return `import { useState, useEffect } from 'react';

export function ${name}() {
  const [value, setValue] = useState<unknown>(null);

  useEffect(() => {
    // Hook logic here
  }, []);

  return { value, setValue };
}
`;
}

/**
 * Generate hook test file
 */
export function generateHookTestTemplate(params: HookTemplateParams): string {
  const { name } = params;

  return `import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('initializes with null value', () => {
    const { result } = renderHook(() => ${name}());
    expect(result.current.value).toBeNull();
  });

  it('updates value', () => {
    const { result } = renderHook(() => ${name}());
    
    act(() => {
      result.current.setValue('test');
    });
    
    expect(result.current.value).toBe('test');
  });
});
`;
}
