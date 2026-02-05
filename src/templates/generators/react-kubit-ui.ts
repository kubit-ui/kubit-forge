import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TemplateOptions {
  projectName: string;
  packageManager: string;
  targetDir: string;
}

export function generateReactKubitUITemplate(options: TemplateOptions): void {
  const { projectName, packageManager, targetDir } = options;

  // Create directories
  mkdirSync(join(targetDir, 'src'), { recursive: true });
  mkdirSync(join(targetDir, 'src/components'), { recursive: true });
  mkdirSync(join(targetDir, 'src/styles'), { recursive: true });
  mkdirSync(join(targetDir, 'src/test'), { recursive: true });
  mkdirSync(join(targetDir, 'public'), { recursive: true });

  // package.json
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
      lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
      'lint:fix': 'eslint . --ext ts,tsx --fix',
      format: 'prettier --write "src/**/*.{ts,tsx,json,css}"',
      'format:check': 'prettier --check "src/**/*.{ts,tsx,json,css}"',
      typecheck: 'tsc --noEmit',
      test: 'vitest',
      'test:ui': 'vitest --ui',
      'test:coverage': 'vitest --coverage',
    },
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      '@kubit-ui-web/react-components': '^2.0.0-beta.48',
      '@kubit-ui-web/design-system': '^2.0.0-beta.5',
    },
    devDependencies: {
      '@types/react': '^18.3.12',
      '@types/react-dom': '^18.3.1',
      '@vitejs/plugin-react': '^5.1.2',
      '@testing-library/react': '^16.3.2',
      '@testing-library/jest-dom': '^6.9.1',
      '@testing-library/user-event': '^14.6.1',
      '@vitest/ui': '^4.0.18',
      '@vitest/coverage-v8': '^4.0.18',
      vitest: '^4.0.18',
      jsdom: '^27.4.0',
      typescript: '^5.9.3',
      'typescript-eslint': '^8.54.0',
      eslint: '^9.39.2',
      'eslint-plugin-react-hooks': '^5.1.0',
      'eslint-plugin-react-refresh': '^0.4.16',
      prettier: '^3.8.1',
      vite: '^8.0.0-beta.10',
    },
  };

  writeFileSync(join(targetDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // tsconfig.json
  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      noUncheckedSideEffectImports: true,
    },
    include: ['src'],
  };

  writeFileSync(join(targetDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

  // vite.config.ts
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
`;

  writeFileSync(join(targetDir, 'vite.config.ts'), viteConfig);

  // vitest.config.ts
  const vitestConfig = `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.test.{ts,tsx}',
      ],
    },
  },
});
`;

  writeFileSync(join(targetDir, 'vitest.config.ts'), vitestConfig);

  // eslint.config.js
  const eslintConfig = `import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
);
`;

  writeFileSync(join(targetDir, 'eslint.config.js'), eslintConfig);

  // .prettierrc
  const prettierrc = {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 100,
    arrowParens: 'always',
  };

  writeFileSync(join(targetDir, '.prettierrc'), JSON.stringify(prettierrc, null, 2));

  // .gitignore
  const gitignore = `# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Misc
.cache/
.temp/
`;

  writeFileSync(join(targetDir, '.gitignore'), gitignore);

  // kubit.config.toml
  const kubitConfig = `[kubit]
cliVersion = "^1.0.0"

[project]
name = "${projectName}"
type = "web"
stack = "react"
language = "ts"
packageManager = "${packageManager}"
nodeVersion = "20"
devPort = 3000

[paths]
src = "src"
dist = "dist"
envExample = ".env.example"
envLocal = ".env.local"

[quality]
lint = true
format = true
typecheck = true
unitTest = true

[plugins]
enabled = [
  "@kubit/plugin-react",
  "@kubit/plugin-quality",
  "@kubit/plugin-env",
  "@kubit/plugin-generators"
]
`;

  writeFileSync(join(targetDir, 'kubit.config.toml'), kubitConfig);

  // README.md
  const readme = `# ${projectName}

React application built with Kubit UI Components and Design System.

## Features

- ⚛️ React 18
- 🎨 Kubit UI Components
- 🎭 Kubit Design System (Bernova)
- 📦 Vite
- 🔷 TypeScript
- ✅ Vitest + Testing Library
- 🎯 ESLint + Prettier

## Getting Started

### Install dependencies

\`\`\`bash
${packageManager} install
\`\`\`

### Development

\`\`\`bash
${packageManager} run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

\`\`\`bash
${packageManager} run build
\`\`\`

### Test

\`\`\`bash
${packageManager} run test
\`\`\`

### Lint

\`\`\`bash
${packageManager} run lint
${packageManager} run format
\`\`\`

## Project Structure

\`\`\`
src/
├── components/     # React components
├── styles/         # Global styles
├── test/          # Test utilities
├── App.tsx        # Main app component
└── main.tsx       # Entry point
\`\`\`

## Using Kubit UI Components

### Setup Provider

The app is already configured with the Kubit Design System Provider:

\`\`\`tsx
import { Provider, KUBIT_VARIANTS } from '@kubit-ui-web/design-system';
import { StylesProvider, Button } from '@kubit-ui-web/react-components';

function App() {
  const { ButtonSizeType, ButtonVariantType } = KUBIT_VARIANTS;

  return (
    <StylesProvider bernovaProvider={Provider}>
      <Button 
        variant={ButtonVariantType.PRIMARY} 
        size={ButtonSizeType.LARGE}
      >
        Click me
      </Button>
    </StylesProvider>
  );
}
\`\`\`

### Available Components

Import components from \`@kubit-ui-web/react-components\`:

- Button
- Input
- Text
- Card
- Modal
- And many more...

### Using Variants

Import variants from \`KUBIT_VARIANTS\`:

\`\`\`tsx
import { KUBIT_VARIANTS } from '@kubit-ui-web/design-system';

const { 
  ButtonVariantType, 
  ButtonSizeType,
  TextVariantType,
  InputVariantType 
} = KUBIT_VARIANTS;
\`\`\`

## Learn More

- [Kubit UI Components](https://www.kubit-ui.com/)
- [Kubit Design System](https://github.com/kubit-ui/kubit-react-components)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
`;

  writeFileSync(join(targetDir, 'README.md'), readme);

  // index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

  writeFileSync(join(targetDir, 'index.html'), indexHtml);

  // src/main.tsx
  const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  writeFileSync(join(targetDir, 'src/main.tsx'), mainTsx);

  // src/App.tsx
  const appTsx = `import { Provider, KUBIT_VARIANTS } from '@kubit-ui-web/design-system';
import { StylesProvider, Button, Text } from '@kubit-ui-web/react-components';
import { ExampleComponent } from './components/ExampleComponent';
import './styles/App.css';

function App() {
  const { ButtonSizeType, ButtonVariantType, TextVariantType } = KUBIT_VARIANTS;

  return (
    <StylesProvider bernovaProvider={Provider}>
      <div className="app">
        <header className="app-header">
          <Text variant={TextVariantType.HEADING_H1} as="h1">
            Welcome to ${projectName}
          </Text>
          <Text variant={TextVariantType.PARAGRAPH_MEDIUM}>
            Built with Kubit UI Components
          </Text>
        </header>
        
        <main className="app-main">
          <section className="hero">
            <Text variant={TextVariantType.HEADING_H2} as="h2">
              Get Started
            </Text>
            <Text variant={TextVariantType.PARAGRAPH_MEDIUM}>
              Edit <code>src/App.tsx</code> and save to reload.
            </Text>
            
            <div className="button-group">
              <Button 
                variant={ButtonVariantType.PRIMARY} 
                size={ButtonSizeType.LARGE}
                onClick={() => alert('Primary button clicked!')}
              >
                Primary Button
              </Button>
              <Button 
                variant={ButtonVariantType.SECONDARY} 
                size={ButtonSizeType.LARGE}
                onClick={() => alert('Secondary button clicked!')}
              >
                Secondary Button
              </Button>
            </div>
          </section>
          
          <ExampleComponent title="Kubit UI Example" />
          
          <section className="links">
            <Text variant={TextVariantType.HEADING_H3} as="h3">
              Learn More
            </Text>
            <ul>
              <li>
                <a href="https://www.kubit-ui.com/" target="_blank" rel="noopener noreferrer">
                  Kubit UI Documentation
                </a>
              </li>
              <li>
                <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
                  React Documentation
                </a>
              </li>
              <li>
                <a href="https://vite.dev/" target="_blank" rel="noopener noreferrer">
                  Vite Documentation
                </a>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </StylesProvider>
  );
}

export default App;
`;

  writeFileSync(join(targetDir, 'src/App.tsx'), appTsx);

  // src/App.test.tsx
  const appTestTsx = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders welcome message', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
  });
  
  it('renders buttons', () => {
    render(<App />);
    expect(screen.getByText('Primary Button')).toBeInTheDocument();
    expect(screen.getByText('Secondary Button')).toBeInTheDocument();
  });
});
`;

  writeFileSync(join(targetDir, 'src/App.test.tsx'), appTestTsx);

  // src/styles/index.css
  const indexCss = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  min-height: 100vh;
  display: flex;
  place-items: center;
}

#root {
  width: 100%;
  margin: 0 auto;
  text-align: center;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}

button:hover {
  border-color: #646cff;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  
  button {
    background-color: #f9f9f9;
  }
}
`;

  writeFileSync(join(targetDir, 'src/styles/index.css'), indexCss);

  // src/styles/App.css
  const appCss = `.app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  margin-bottom: 3rem;
  text-align: center;
}

.app-header h1 {
  margin-bottom: 1rem;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.hero {
  padding: 2rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  text-align: center;
}

.hero h2 {
  margin-bottom: 1rem;
}

.hero code {
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  font-family: 'Courier New', monospace;
}

.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.links {
  padding: 2rem;
  text-align: center;
}

.links h3 {
  margin-bottom: 1rem;
}

.links ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.links a {
  color: #646cff;
  text-decoration: none;
  transition: color 0.2s;
}

.links a:hover {
  color: #535bf2;
}

@media (prefers-color-scheme: light) {
  .links a {
    color: #747bff;
  }
  
  .links a:hover {
    color: #535bf2;
  }
}
`;

  writeFileSync(join(targetDir, 'src/styles/App.css'), appCss);

  // src/test/setup.ts
  const setupTs = `import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
`;

  writeFileSync(join(targetDir, 'src/test/setup.ts'), setupTs);

  // src/components/ExampleComponent.tsx
  const exampleComponentTsx = `import { useState } from 'react';
import { KUBIT_VARIANTS } from '@kubit-ui-web/design-system';
import { Button, Input, Text } from '@kubit-ui-web/react-components';

interface ExampleComponentProps {
  title?: string;
}

export function ExampleComponent({ title = 'Example Component' }: ExampleComponentProps) {
  const { ButtonSizeType, ButtonVariantType, TextVariantType, InputVariantType } = KUBIT_VARIANTS;
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (value.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    }
  };

  return (
    <div style={{ padding: '2rem', border: '1px solid #333', borderRadius: '8px' }}>
      <Text variant={TextVariantType.HEADING_H3} as="h2">
        {title}
      </Text>
      
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
        <Input
          variant={InputVariantType.DEFAULT}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter some text..."
        />
        <Button 
          variant={ButtonVariantType.PRIMARY}
          size={ButtonSizeType.MEDIUM}
          onClick={handleSubmit} 
          disabled={!value.trim()}
        >
          Submit
        </Button>
      </div>
      
      {submitted && (
        <Text 
          variant={TextVariantType.PARAGRAPH_MEDIUM} 
          style={{ marginTop: '1rem', color: 'green' }}
        >
          ✓ Submitted: {value}
        </Text>
      )}
      
      <div style={{ marginTop: '2rem' }}>
        <Text variant={TextVariantType.PARAGRAPH_SMALL} style={{ color: '#888' }}>
          💡 This component uses Kubit UI Components with proper variants and styling.
        </Text>
      </div>
    </div>
  );
}
`;

  writeFileSync(join(targetDir, 'src/components/ExampleComponent.tsx'), exampleComponentTsx);

  // src/components/ExampleComponent.test.tsx
  const exampleComponentTestTsx = `import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExampleComponent } from './ExampleComponent';

describe('ExampleComponent', () => {
  it('renders with default title', () => {
    render(<ExampleComponent />);
    expect(screen.getByText('Example Component')).toBeInTheDocument();
  });
  
  it('renders with custom title', () => {
    render(<ExampleComponent title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });
  
  it('handles input change', () => {
    render(<ExampleComponent />);
    const input = screen.getByPlaceholderText('Enter some text...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input).toHaveValue('test');
  });
});
`;

  writeFileSync(
    join(targetDir, 'src/components/ExampleComponent.test.tsx'),
    exampleComponentTestTsx
  );

  // public/vite.svg
  const viteSvg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="31.88" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 257"><defs><linearGradient id="IconifyId1813088fe1fbc01fb466" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"></stop><stop offset="100%" stop-color="#BD34FE"></stop></linearGradient><linearGradient id="IconifyId1813088fe1fbc01fb467" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"></stop><stop offset="8.333%" stop-color="#FFDD35"></stop><stop offset="100%" stop-color="#FFA800"></stop></linearGradient></defs><path fill="url(#IconifyId1813088fe1fbc01fb466)" d="M255.153 37.938L134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"></path><path fill="url(#IconifyId1813088fe1fbc01fb467)" d="M185.432.063L96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028l72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"></path></svg>`;

  writeFileSync(join(targetDir, 'public/vite.svg'), viteSvg);
}
