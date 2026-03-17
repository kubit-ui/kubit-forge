import type { Feature } from '../types/index.js';

export const vitestFeature: Feature = {
  category: 'quality',
  configFiles: [
    {
      backup: true,
      content: `import { defineConfig } from 'vitest/config';
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
`,
      path: 'vitest.config.ts',
    },
    {
      content: `import '@testing-library/jest-dom';

// Add custom matchers
expect.extend({});
`,
      path: 'src/test/setup.ts',
    },
  ],
  description: 'Vitest for unit testing',
  devDependencies: [
    'vitest@^1.2.2',
    '@testing-library/react@^14.2.1',
    '@testing-library/jest-dom@^6.4.2',
    '@testing-library/user-event@^14.5.2',
    'jsdom@^24.0.0',
  ],
  instructions: `
Vitest has been installed and configured!

Next steps:
1. Run 'pnpm test' to run tests in watch mode
2. Run 'pnpm test:ui' for the Vitest UI
3. Run 'pnpm test:coverage' for coverage reports
4. Create your first test in src/__tests__/
`,

  name: 'vitest',

  scripts: {
    test: 'vitest',
    'test:coverage': 'vitest --coverage',
    'test:ui': 'vitest --ui',
  },

  tags: ['testing', 'unit-tests', 'vitest'],

  version: '1.0.0',
};
