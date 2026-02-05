/**
 * Page Generator
 *
 * Generates page components with optional routing
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../../types/index.js';

export interface PageOptions {
  name: string;
  path?: string;
  route?: boolean;
  auth?: boolean;
  typescript?: boolean;
}

/**
 * Generate a page component
 */
export async function generatePage(
  options: PageOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const { auth = false, name, path: customPath, route = false } = options;

  ctx.logger.step(`Generating page: ${name}`);

  // Validate page name
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return {
      message: 'Page name must be PascalCase (e.g., Dashboard, UserProfile)',
      status: 'error',
    };
  }

  // Determine output path
  const pageDir = customPath
    ? join(ctx.cwd, customPath, name)
    : join(ctx.cwd, 'src', 'pages', name);

  // Check if page already exists
  if (existsSync(pageDir)) {
    return {
      message: `Page already exists: ${pageDir}`,
      status: 'error',
    };
  }

  // Create page directory
  mkdirSync(pageDir, { recursive: true });

  const ext = 'tsx';
  const files: string[] = [];

  try {
    // Generate page component
    const pageFile = join(pageDir, `${name}.${ext}`);
    const pageContent = generatePageContent(name, { auth });
    writeFileSync(pageFile, pageContent, 'utf-8');
    files.push(pageFile);
    ctx.logger.success(`Created ${name}.${ext}`);

    // Generate route file if requested
    if (route) {
      const routeFile = join(pageDir, 'route.ts');
      const routeContent = generateRouteContent(name, { auth });
      writeFileSync(routeFile, routeContent, 'utf-8');
      files.push(routeFile);
      ctx.logger.success('Created route.ts');
    }

    // Generate test file
    const testFile = join(pageDir, `${name}.test.${ext}`);
    const testContent = generateTestContent(name, { typescript: true });
    writeFileSync(testFile, testContent, 'utf-8');
    files.push(testFile);
    ctx.logger.success(`Created ${name}.test.${ext}`);

    return {
      data: {
        files,
        pageDir,
      },
      message: `Page ${name} generated successfully`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to generate page: ${(error as Error).message}`,
      status: 'error',
    };
  }
}

/**
 * Generate page content
 */
function generatePageContent(name: string, options: { auth: boolean }): string {
  const { auth } = options;

  const authCheck = auth
    ? `
  // Check authentication
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
`
    : '';

  return `import type { FC } from 'react';
import { Container, Text } from '@kubit-ui-web/react-components';${
    auth
      ? "\nimport { Navigate } from 'react-router-dom';\nimport { useAuth } from '@/hooks/useAuth';"
      : ''
  }

export interface ${name}Props {
  // Add props here
}

export const ${name}: FC<${name}Props> = () => {${authCheck}
  return (
    <Container>
      <Text variant="heading1">${name}</Text>
      <Text variant="body">
        This is the ${name} page.
      </Text>
    </Container>
  );
};

${name}.displayName = '${name}';
`;
}

/**
 * Generate route content
 */
function generateRouteContent(name: string, options: { auth: boolean }): string {
  const { auth } = options;
  const routePath = `/${name.toLowerCase()}`;

  return `import type { RouteObject } from 'react-router-dom';
import { ${name} } from './${name}';${auth ? "\nimport { ProtectedRoute } from '@/components/ProtectedRoute';" : ''}

export const ${name.toLowerCase()}Route: RouteObject = {
  path: '${routePath}',
  element: ${auth ? `<ProtectedRoute><${name} /></ProtectedRoute>` : `<${name} />`},
};
`;
}

/**
 * Generate page test content
 */
function generateTestContent(name: string, _options: { typescript: boolean }): string {
  return `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByText('${name}')).toBeInTheDocument();
  });

  it('displays page content', () => {
    render(<${name} />);
    expect(screen.getByText(/This is the ${name} page/i)).toBeInTheDocument();
  });
});
`;
}
