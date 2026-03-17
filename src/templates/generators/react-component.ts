/**
 * React Component Templates
 */

export interface ComponentTemplateParams {
  name: string;
  route?: string;
}

/**
 * Generate React component file content
 */
export function generateComponentTemplate(params: ComponentTemplateParams): string {
  const { name } = params;

  return `export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${name}({ className, children }: ${name}Props) {
  return (
    <div className={className}>
      <h2>${name}</h2>
      {children}
    </div>
  );
}
`;
}

/**
 * Generate component index file
 */
export function generateComponentIndexTemplate(params: ComponentTemplateParams): string {
  const { name } = params;

  return `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`;
}

/**
 * Generate component test file
 */
export function generateComponentTestTemplate(params: ComponentTemplateParams): string {
  const { name } = params;

  return `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders without crashing', () => {
    render(<${name} />);
    expect(screen.getByText('${name}')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<${name}>Test Content</${name}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<${name} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
`;
}

/**
 * Generate Storybook story file
 */
export function generateComponentStoryTemplate(params: ComponentTemplateParams): string {
  const { name } = params;

  return `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
  argTypes: {
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {},
};

export const WithChildren: Story = {
  args: {
    children: 'Custom content',
  },
};
`;
}
