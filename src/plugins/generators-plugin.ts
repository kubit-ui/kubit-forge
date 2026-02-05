import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

import type {
  Plugin,
  PluginContext,
  GeneratorRegistration,
  GeneratorResult,
} from '../types/index.js';

export const generatorsPlugin: Plugin = {
  capabilities: ['fs:write'],
  name: '@kubit/plugin-generators',
  onLoad(ctx: PluginContext) {
    ctx.logger.debug('Generators plugin loaded');
  },

  registerGenerators(): GeneratorRegistration[] {
    return [
      {
        description: 'Generate a React/Vanilla component',
        generate: async (name, options, ctx) => {
          return generateComponent(name, options, ctx);
        },
        kind: 'component',
      },
      {
        description: 'Generate a page component',
        generate: async (name, options, ctx) => {
          return generatePage(name, options, ctx);
        },
        kind: 'page',
      },
      {
        description: 'Generate a custom React hook',
        generate: async (name, options, ctx) => {
          return generateHook(name, options, ctx);
        },
        kind: 'hook',
      },
    ];
  },

  version: '1.0.0',
};

function generateComponent(name: string, _options: any, ctx: PluginContext): GeneratorResult {
  const isReact = ctx.config.project.stack === 'react';
  const isTs = ctx.config.project.language === 'ts';
  const ext = isTs ? 'tsx' : 'jsx';

  const componentDir = join(ctx.cwd, ctx.config.paths?.src || 'src', 'components', name);
  const componentFile = join(componentDir, `${name}.${ext}`);
  const styleFile = join(componentDir, `${name}.module.css`);
  const testFile = join(componentDir, `${name}.test.${ext}`);

  if (existsSync(componentFile)) {
    return {
      message: `Component ${name} already exists`,
      status: 'error',
    };
  }

  try {
    mkdirSync(componentDir, { recursive: true });

    // Component file
    const componentContent = isReact
      ? generateReactComponent(name, isTs)
      : generateVanillaComponent(name, isTs);

    writeFileSync(componentFile, componentContent);

    // Style file
    const styleContent = `.${name.toLowerCase()} {
  /* Add your styles here */
}
`;
    writeFileSync(styleFile, styleContent);

    // Test file
    const testContent = isReact ? generateReactTest(name, isTs) : generateVanillaTest(name, isTs);

    writeFileSync(testFile, testContent);

    // Index file
    const indexFile = join(componentDir, `index.${isTs ? 'ts' : 'js'}`);
    writeFileSync(indexFile, `export { ${name} } from './${name}';\n`);

    return {
      filesCreated: [componentFile, styleFile, testFile, indexFile],
      message: `Component ${name} created successfully`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to generate component: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error',
    };
  }
}

function generatePage(name: string, _options: any, ctx: PluginContext): GeneratorResult {
  const isTs = ctx.config.project.language === 'ts';
  const ext = isTs ? 'tsx' : 'jsx';

  const pageDir = join(ctx.cwd, ctx.config.paths?.src || 'src', 'pages');
  const pageFile = join(pageDir, `${name}.${ext}`);

  if (existsSync(pageFile)) {
    return {
      message: `Page ${name} already exists`,
      status: 'error',
    };
  }

  try {
    mkdirSync(pageDir, { recursive: true });

    const pageContent = `import styles from './${name}.module.css';

export function ${name}() {
  return (
    <div className={styles.${name.toLowerCase()}}>
      <h1>${name} Page</h1>
      <p>This is the ${name} page.</p>
    </div>
  );
}
`;

    writeFileSync(pageFile, pageContent);

    const styleFile = join(pageDir, `${name}.module.css`);
    const styleContent = `.${name.toLowerCase()} {
  padding: 2rem;
}
`;
    writeFileSync(styleFile, styleContent);

    return {
      filesCreated: [pageFile, styleFile],
      message: `Page ${name} created successfully`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to generate page: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error',
    };
  }
}

function generateHook(name: string, _options: any, ctx: PluginContext): GeneratorResult {
  const isTs = ctx.config.project.language === 'ts';
  const ext = isTs ? 'ts' : 'js';

  const hooksDir = join(ctx.cwd, ctx.config.paths?.src || 'src', 'hooks');
  const hookFile = join(hooksDir, `${name}.${ext}`);

  if (existsSync(hookFile)) {
    return {
      message: `Hook ${name} already exists`,
      status: 'error',
    };
  }

  try {
    mkdirSync(hooksDir, { recursive: true });

    const hookContent = `import { useState, useEffect } from 'react';

export function ${name}() {
  const [value, setValue] = useState${isTs ? '<any>' : ''}(null);

  useEffect(() => {
    // Add your hook logic here
  }, []);

  return value;
}
`;

    writeFileSync(hookFile, hookContent);

    return {
      filesCreated: [hookFile],
      message: `Hook ${name} created successfully`,
      status: 'ok',
    };
  } catch (error) {
    return {
      message: `Failed to generate hook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 'error',
    };
  }
}

function generateReactComponent(name: string, isTs: boolean): string {
  return `import styles from './${name}.module.css';

${isTs ? 'interface ' + name + 'Props {\n  // Add your props here\n}\n\n' : ''}export function ${name}(${isTs ? 'props: ' + name + 'Props' : ''}) {
  return (
    <div className={styles.${name.toLowerCase()}}>
      <h2>${name}</h2>
    </div>
  );
}
`;
}

function generateVanillaComponent(name: string, _isTs: boolean): string {
  return `import styles from './${name}.module.css';

export function ${name}() {
  const element = document.createElement('div');
  element.className = styles.${name.toLowerCase()};
  element.innerHTML = '<h2>${name}</h2>';
  return element;
}
`;
}

function generateReactTest(name: string, _isTs: boolean): string {
  return `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name} />);
    expect(screen.getByText('${name}')).toBeInTheDocument();
  });
});
`;
}

function generateVanillaTest(name: string, _isTs: boolean): string {
  return `import { describe, it, expect } from 'vitest';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('creates element correctly', () => {
    const element = ${name}();
    expect(element).toBeDefined();
    expect(element.tagName).toBe('DIV');
  });
});
`;
}

export default generatorsPlugin;
