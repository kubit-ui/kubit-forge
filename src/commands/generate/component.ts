/**
 * Component Generator
 *
 * Generates React components with optional test, story, and styles
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

import type { CommandResult, PluginContext } from '../../types/index.js';

export interface ComponentOptions {
  name: string;
  path?: string;
  bernova?: boolean;
  test?: boolean;
  story?: boolean;
  css?: boolean;
  typescript?: boolean;
}

/**
 * Generate a React component
 */
export async function generateComponent(
  options: ComponentOptions,
  ctx: PluginContext
): Promise<CommandResult> {
  const {
    bernova = true,
    css: includeCss = false,
    name,
    path: customPath,
    story: includeStory = false,
    test: includeTest = true,
    typescript = true,
  } = options;

  ctx.logger.step(`Generating component: ${name}`);

  // Validate component name
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(name)) {
    return {
      message: 'Component name must be PascalCase (e.g., Button, MyComponent)',
      status: 'error',
    };
  }

  // Determine output path
  const componentDir = customPath
    ? join(ctx.cwd, customPath, name)
    : join(ctx.cwd, 'src', 'components', name);

  // Check if component already exists
  if (existsSync(componentDir)) {
    return {
      message: `Component already exists: ${componentDir}`,
      status: 'error',
    };
  }

  // Create component directory
  mkdirSync(componentDir, { recursive: true });

  const ext = typescript ? 'tsx' : 'jsx';
  const files: string[] = [];

  try {
    // Generate component file
    const componentFile = join(componentDir, `${name}.${ext}`);
    const componentContent = generateComponentContent(name, { bernova, includeCss, typescript });
    writeFileSync(componentFile, componentContent, 'utf-8');
    files.push(componentFile);
    ctx.logger.success(`Created ${name}.${ext}`);

    // Generate test file
    if (includeTest) {
      const testFile = join(componentDir, `${name}.test.${ext}`);
      const testContent = generateTestContent(name, { typescript });
      writeFileSync(testFile, testContent, 'utf-8');
      files.push(testFile);
      ctx.logger.success(`Created ${name}.test.${ext}`);
    }

    // Generate story file
    if (includeStory) {
      const storyFile = join(componentDir, `${name}.stories.${ext}`);
      const storyContent = generateStoryContent(name, { typescript });
      writeFileSync(storyFile, storyContent, 'utf-8');
      files.push(storyFile);
      ctx.logger.success(`Created ${name}.stories.${ext}`);
    }

    // Generate CSS module
    if (includeCss) {
      const cssFile = join(componentDir, `${name}.module.css`);
      const cssContent = generateCssContent(name);
      writeFileSync(cssFile, cssContent, 'utf-8');
      files.push(cssFile);
      ctx.logger.success(`Created ${name}.module.css`);
    }

    // Generate index file
    const indexFile = join(componentDir, 'index.ts');
    const indexContent = `export { ${name} } from './${name}';\nexport type { ${name}Props } from './${name}';\n`;
    writeFileSync(indexFile, indexContent, 'utf-8');
    files.push(indexFile);
    ctx.logger.success('Created index.ts');

    return {
      data: {
        componentDir,
        files,
      },
      message: `Component ${name} generated successfully`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to generate component: ${(error as Error).message}`,
      status: 'error',
    };
  }
}

/**
 * Generate component content
 */
function generateComponentContent(
  name: string,
  options: { bernova: boolean; typescript: boolean; includeCss: boolean }
): string {
  const { bernova, includeCss, typescript } = options;

  if (bernova) {
    return `import type { FC } from 'react';
${includeCss ? `import styles from './${name}.module.css';\n` : ''}
export interface ${name}Props {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
}

export const ${name}: FC<${name}Props> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
}) => {
  return (
    <div 
      className={${includeCss ? `styles.${name.toLowerCase()}` : `'${name.toLowerCase()}'`}}
      data-variant={variant}
      data-size={size}
      data-disabled={disabled}
      onClick={!disabled ? onClick : undefined}
    >
      {children || '${name}'}
    </div>
  );
};

${name}.displayName = '${name}';
`;
  }

  // Non-Bernova component
  return `${typescript ? "import type { FC } from 'react';\n" : "import { FC } from 'react';\n"}
${includeCss ? `import styles from './${name}.module.css';\n` : ''}
${
  typescript
    ? `export interface ${name}Props {
  children?: React.ReactNode;
}\n`
    : ''
}
export const ${name}${typescript ? `: FC<${name}Props>` : ''} = ({ children }) => {
  return (
    <div className={${includeCss ? `styles.${name.toLowerCase()}` : `'${name.toLowerCase()}'`}}>
      {children || '${name}'}
    </div>
  );
};

${name}.displayName = '${name}';
`;
}

/**
 * Generate test content
 */
function generateTestContent(name: string, _options: { typescript: boolean }): string {
  return `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByText('${name}')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    render(<${name}>Custom content</${name}>);
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('applies variant prop', () => {
    const { container } = render(<${name} variant="secondary" />);
    expect(container.firstChild).toHaveAttribute('data-variant', 'secondary');
  });

  it('handles disabled state', () => {
    const { container } = render(<${name} disabled />);
    expect(container.firstChild).toHaveAttribute('data-disabled', 'true');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<${name} onClick={handleClick} />);
    screen.getByText('${name}').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<${name} onClick={handleClick} disabled />);
    screen.getByText('${name}').click();
    expect(handleClick).not.toHaveBeenCalled();
  });
});
`;
}

/**
 * Generate story content
 */
function generateStoryContent(name: string, options: { typescript: boolean }): string {
  const { typescript } = options;

  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta${typescript ? `: Meta<typeof ${name}>` : ''} = {
  title: 'Components/${name}',
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: '${name}',
    variant: 'primary',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    children: '${name}',
    variant: 'secondary',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    children: '${name}',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    children: '${name}',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    children: '${name}',
    disabled: true,
  },
};
`;
}

/**
 * Generate CSS content
 */
function generateCssContent(name: string): string {
  const className = name.toLowerCase();

  return `.${className} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.${className}[data-variant='primary'] {
  background-color: #E60028;
  color: white;
}

.${className}[data-variant='secondary'] {
  background-color: #00A650;
  color: white;
}

.${className}[data-size='small'] {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.${className}[data-size='medium'] {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.${className}[data-size='large'] {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.${className}[data-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}

.${className}:hover:not([data-disabled='true']) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
`;
}
