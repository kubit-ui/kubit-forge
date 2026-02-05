/**
 * React Page Templates
 */

export interface PageTemplateParams {
  name: string;
  route: string;
}

/**
 * Generate React page file content
 */
export function generatePageTemplate(params: PageTemplateParams): string {
  const { name, route } = params;

  return `import { useEffect } from 'react';

export function ${name}Page() {
  useEffect(() => {
    document.title = '${name}';
  }, []);

  return (
    <div className="page-container">
      <h1>${name} Page</h1>
      <p>Route: ${route}</p>
    </div>
  );
}
`;
}

/**
 * Generate page index file
 */
export function generatePageIndexTemplate(params: PageTemplateParams): string {
  const { name } = params;

  return `export { ${name}Page } from './${name}Page';
`;
}

/**
 * Generate page test file
 */
export function generatePageTestTemplate(params: PageTemplateParams): string {
  const { name } = params;

  return `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${name}Page } from './${name}Page';

describe('${name}Page', () => {
  it('renders page title', () => {
    render(<${name}Page />);
    expect(screen.getByText('${name} Page')).toBeInTheDocument();
  });

  it('sets document title', () => {
    render(<${name}Page />);
    expect(document.title).toBe('${name}');
  });
});
`;
}
