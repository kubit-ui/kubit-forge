import type { Feature } from '../types/index.js';

import { eslintFeature } from './eslint.js';
import { huskyFeature } from './husky.js';
import { prettierFeature } from './prettier.js';
import { vitestFeature } from './vitest.js';

// Re-export individual features
export { eslintFeature, prettierFeature, vitestFeature, huskyFeature };

// React Router Feature
export const reactRouterFeature: Feature = {
  category: 'routing',
  configFiles: [
    {
      content: `import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
]);
`,
      path: 'src/router/index.tsx',
    },
    {
      content: `export const HomePage = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to your app!</p>
    </div>
  );
};
`,
      path: 'src/pages/HomePage.tsx',
    },
  ],
  dependencies: ['react-router-dom@^6.22.0'],
  description: 'React Router for client-side routing',
  instructions: `
React Router has been installed!

Next steps:
1. Import and use the router in your App.tsx:
   import { RouterProvider } from 'react-router-dom';
   import { router } from './router';
   
   <RouterProvider router={router} />

2. Add more routes in src/router/index.tsx
3. Create page components in src/pages/
`,

  name: 'react-router',

  tags: ['routing', 'react-router', 'navigation'],

  version: '1.0.0',
};

// Zustand Feature
export const zustandFeature: Feature = {
  category: 'state',
  configFiles: [
    {
      content: `import { create } from 'zustand';

interface AppState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
`,
      path: 'src/store/index.ts',
    },
  ],
  dependencies: ['zustand@^4.5.0'],
  description: 'Zustand for state management',
  instructions: `
Zustand has been installed!

Next steps:
1. Use the store in your components:
   import { useAppStore } from './store';
   
   const count = useAppStore((state) => state.count);
   const increment = useAppStore((state) => state.increment);

2. Create more stores in src/store/
3. Check Zustand docs for advanced patterns
`,

  name: 'zustand',

  tags: ['state-management', 'zustand', 'store'],

  version: '1.0.0',
};

// Storybook Feature
export const storybookFeature: Feature = {
  category: 'documentation',
  configFiles: [
    {
      content: `import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
};

export default config;
`,
      path: '.storybook/main.ts',
    },
    {
      content: `import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
`,
      path: '.storybook/preview.ts',
    },
  ],
  description: 'Storybook for component documentation',
  devDependencies: [
    '@storybook/react@^7.6.17',
    '@storybook/react-vite@^7.6.17',
    '@storybook/addon-essentials@^7.6.17',
    '@storybook/addon-interactions@^7.6.17',
    '@storybook/addon-a11y@^7.6.17',
  ],
  instructions: `
Storybook has been installed!

Next steps:
1. Run 'pnpm storybook' to start Storybook
2. Create stories for your components:
   MyComponent.stories.tsx
3. Visit http://localhost:6006
4. Build static Storybook with 'pnpm build-storybook'
`,

  name: 'storybook',

  scripts: {
    'build-storybook': 'storybook build',
    storybook: 'storybook dev -p 6006',
  },

  tags: ['storybook', 'components', 'documentation', 'ui'],

  version: '1.0.0',
};

// Playwright Feature
export const playwrightFeature: Feature = {
  category: 'quality',
  configFiles: [
    {
      content: `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
`,
      path: 'playwright.config.ts',
    },
    {
      content: `import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Home/);
});
`,
      path: 'e2e/example.spec.ts',
    },
  ],
  description: 'Playwright for E2E testing',
  devDependencies: ['@playwright/test@^1.41.2'],
  instructions: `
Playwright has been installed!

Next steps:
1. Run 'pnpm test:e2e' to run E2E tests
2. Run 'pnpm test:e2e:ui' for the Playwright UI
3. Create tests in e2e/ directory
4. Run 'npx playwright codegen' to generate tests
`,

  name: 'playwright',

  scripts: {
    'test:e2e': 'playwright test',
    'test:e2e:ui': 'playwright test --ui',
  },

  tags: ['testing', 'e2e', 'playwright'],

  version: '1.0.0',
};

// All features registry
export const allFeatures: Feature[] = [
  eslintFeature,
  prettierFeature,
  vitestFeature,
  huskyFeature,
  reactRouterFeature,
  zustandFeature,
  storybookFeature,
  playwrightFeature,
];
