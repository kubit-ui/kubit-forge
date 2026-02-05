/**
 * React App Template with Bernova Design System
 */

export interface ReactAppBernovaOptions {
  name: string;
  typescript: boolean;
  testing: boolean;
  storybook: boolean;
}

/**
 * Generate package.json for React app with Bernova
 */
export function generatePackageJson(options: ReactAppBernovaOptions): string {
  const { name, typescript, testing } = options;

  const dependencies: Record<string, string> = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    '@kubit-ui-web/react-components': '^latest',
    '@kubit-ui-web/kubit-tokens': '^latest',
  };

  const devDependencies: Record<string, string> = {
    '@vitejs/plugin-react': '^4.2.1',
    vite: '^5.0.0',
    eslint: '^8.56.0',
    'eslint-plugin-react': '^7.33.2',
    'eslint-plugin-react-hooks': '^4.6.0',
    prettier: '^3.2.0',
  };

  if (typescript) {
    dependencies['@types/react'] = '^18.2.0';
    dependencies['@types/react-dom'] = '^18.2.0';
    devDependencies['typescript'] = '^5.3.3';
    devDependencies['@typescript-eslint/eslint-plugin'] = '^6.19.0';
    devDependencies['@typescript-eslint/parser'] = '^6.19.0';
  }

  if (testing) {
    devDependencies['vitest'] = '^1.2.0';
    devDependencies['@testing-library/react'] = '^14.1.2';
    devDependencies['@testing-library/jest-dom'] = '^6.2.0';
    devDependencies['@testing-library/user-event'] = '^14.5.2';
    devDependencies['jsdom'] = '^24.0.0';
  }

  const scripts: Record<string, string> = {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview',
    lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
    format: 'prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"',
  };

  if (testing) {
    scripts.test = 'vitest';
    scripts['test:ui'] = 'vitest --ui';
    scripts['test:coverage'] = 'vitest --coverage';
  }

  const packageJson = {
    name,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts,
    dependencies,
    devDependencies,
  };

  return JSON.stringify(packageJson, null, 2);
}

/**
 * Generate main App component with Bernova
 */
export function generateAppComponent(typescript: boolean): string {
  const typeAnnotation = typescript ? ': React.FC' : '';

  return `import { KubitProvider } from '@kubit-ui-web/react-components';
import { Button, Text, Container } from '@kubit-ui-web/react-components';
import { bernovaTheme } from './theme/bernova';

const App${typeAnnotation} = () => {
  return (
    <KubitProvider theme={bernovaTheme}>
      <Container>
        <Text variant="heading1">Welcome to Your Bernova App</Text>
        <Text variant="body">
          Start building amazing user interfaces with Bernova Design System
        </Text>
        <Button variant="primary" onClick={() => alert('Hello Bernova!')}>
          Get Started
        </Button>
      </Container>
    </KubitProvider>
  );
};

export default App;
`;
}

/**
 * Generate Bernova theme configuration
 */
export function generateBernovaTheme(typescript: boolean): string {
  return `import type { Theme } from '@kubit-ui-web/react-components';

export const bernovaTheme${typescript ? ': Theme' : ''} = {
  // Bernova theme configuration
  // This will be populated by bernova CLI or manually configured
  colors: {
    primary: '#E60028',
    secondary: '#00A650',
    background: '#FFFFFF',
    text: '#000000',
  },
  typography: {
    fontFamily: 'SantanderHeadline, Arial, sans-serif',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};
`;
}

/**
 * Generate vite.config with Bernova optimizations
 */
export function generateViteConfig(_typescript: boolean): string {
  return `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: ['@kubit-ui-web/react-components', '@kubit-ui-web/kubit-tokens'],
  },
});
`;
}

/**
 * Generate index.html with Bernova fonts
 */
export function generateIndexHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
    
    <!-- Bernova Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

/**
 * Generate main entry point
 */
export function generateMain(typescript: boolean): string {
  const ext = typescript ? 'tsx' : 'jsx';

  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.${ext}';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')${typescript ? '!' : ''}).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

/**
 * Generate global CSS with Bernova reset
 */
export function generateGlobalCSS(): string {
  return `/* Bernova Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(0, 0, 0, 0.87);
  background-color: #ffffff;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
`;
}

/**
 * Generate README with Bernova instructions
 */
export function generateReadme(name: string, typescript: boolean, testing: boolean): string {
  return `# ${name}

React application built with **Bernova Design System** by Kubit.

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
\`\`\`

## 🎨 Bernova Design System

This project uses [Kubit React Components](https://github.com/kubit-ui/kubit-react-components) with Bernova theme.

### Available Components

- Button
- Text
- Container
- Input
- Card
- Modal
- And many more...

### Theme Configuration

Edit \`src/theme/bernova.${typescript ? 'ts' : 'js'}\` to customize your theme:

\`\`\`${typescript ? 'typescript' : 'javascript'}
export const bernovaTheme = {
  colors: {
    primary: '#E60028',
    secondary: '#00A650',
    // ... more colors
  },
  typography: {
    fontFamily: 'SantanderHeadline, Arial, sans-serif',
  },
};
\`\`\`

## 📦 Scripts

- \`pnpm dev\` - Start development server
- \`pnpm build\` - Build for production
- \`pnpm preview\` - Preview production build
- \`pnpm lint\` - Lint code with ESLint
- \`pnpm format\` - Format code with Prettier
${testing ? '- `pnpm test` - Run tests with Vitest\n- `pnpm test:ui` - Run tests with UI\n- `pnpm test:coverage` - Generate coverage report' : ''}

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety${typescript ? '' : ' (optional)'}
- **Vite** - Build tool
- **Bernova** - Design system
- **Kubit Components** - Component library
${testing ? '- **Vitest** - Testing framework\n- **Testing Library** - React testing utilities' : ''}

## 📚 Documentation

- [Kubit React Components](https://github.com/kubit-ui/kubit-react-components)
- [Bernova Design System](https://bernova.design)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.

## 📄 License

MIT
`;
}

/**
 * Generate complete React app structure with Bernova
 */
export function generateReactAppBernova(options: ReactAppBernovaOptions) {
  const { typescript } = options;
  const ext = typescript ? 'tsx' : 'jsx';

  return {
    'package.json': generatePackageJson(options),
    'vite.config.ts': generateViteConfig(typescript),
    'index.html': generateIndexHtml(options.name),
    'README.md': generateReadme(options.name, typescript, options.testing),
    [`src/App.${ext}`]: generateAppComponent(typescript),
    [`src/main.${ext}`]: generateMain(typescript),
    'src/index.css': generateGlobalCSS(),
    [`src/theme/bernova.${typescript ? 'ts' : 'js'}`]: generateBernovaTheme(typescript),
    'public/vite.svg': '', // Placeholder
  };
}
