import { loadTemplate } from './template-loader.js';

export interface FeatureDefinition {
  name: string;
  description: string;
  dependencies: Record<string, string>;
  devDependencies?: Record<string, string>;
  files: Array<{
    path: string;
    content: string;
    mode?: 'create' | 'append' | 'merge';
  }>;
  configChanges?: Array<{
    file: string;
    changes: any;
  }>;
  postInstall?: string[];
}

export const FEATURES: Record<string, FeatureDefinition> = {
  bernova: {
    configChanges: [
      {
        changes: {
          features: { bernova: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {
      bernova: '^1.0.0',
    },
    description: 'Add Bernova - CSS-in-JS with JavaScript syntax',
    devDependencies: {},
    files: [
      {
        content: loadTemplate('bernova.config.json.template'),
        path: 'bernova.config.json',
      },
      {
        content: loadTemplate('bernova-foundations.ts.template'),
        path: 'src/styles/foundations.ts',
      },
      {
        content: loadTemplate('bernova-globalStyles.ts.template'),
        path: 'src/styles/globalStyles.ts',
      },
      {
        content: loadTemplate('bernova-mediaQueries.ts.template'),
        path: 'src/styles/mediaQueries.ts',
      },
      {
        content: loadTemplate('bernova-theme.ts.template'),
        path: 'src/styles/theme.ts',
      },
    ],
    name: 'Bernova',
    postInstall: ['npx bv-config', 'npx bernova'],
  },

  changesets: {
    configChanges: [
      {
        changes: {
          features: { changesets: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {},
    description: 'Add Changesets for version management',
    devDependencies: {
      '@changesets/cli': '^2.27.1',
    },
    files: [
      {
        content: loadTemplate('changesets-config.json.template'),
        path: '.changeset/config.json',
      },
      {
        content: loadTemplate('changesets-readme.md.template'),
        path: '.changeset/README.md',
      },
    ],
    name: 'Changesets',
    postInstall: ['npx changeset init'],
  },

  commitlint: {
    configChanges: [
      {
        changes: {
          features: { commitlint: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {},
    description: 'Add Commitlint for conventional commits',
    devDependencies: {
      '@commitlint/cli': '^19.0.3',
      '@commitlint/config-conventional': '^19.0.3',
    },
    files: [
      {
        content: loadTemplate('commitlint.config.js.template'),
        path: 'commitlint.config.js',
      },
    ],
    name: 'Commitlint',
  },

  cypress: {
    configChanges: [
      {
        changes: {
          features: { cypress: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {},
    description: 'Add Cypress for E2E testing',
    devDependencies: {
      cypress: '^13.6.6',
    },
    files: [
      {
        content: loadTemplate('cypress.config.ts.template'),
        path: 'cypress.config.ts',
      },
      {
        content: loadTemplate('cypress-support-e2e.ts.template'),
        path: 'cypress/support/e2e.ts',
      },
      {
        content: loadTemplate('cypress-support-commands.ts.template'),
        path: 'cypress/support/commands.ts',
      },
    ],
    name: 'Cypress',
  },

  eslint: {
    configChanges: [
      {
        changes: {
          features: { eslint: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {},
    description: 'Add ESLint for code linting',
    devDependencies: {
      '@eslint/js': '^9.0.0',
      eslint: '^9.0.0',
      'typescript-eslint': '^8.0.0',
    },
    files: [
      {
        content: loadTemplate('eslint.config.js.template'),
        path: 'eslint.config.js',
      },
    ],
    name: 'ESLint',
  },

  husky: {
    configChanges: [
      {
        changes: {
          features: { husky: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {},
    description: 'Add Husky for Git hooks',
    devDependencies: {
      husky: '^9.0.11',
    },
    files: [
      {
        content: loadTemplate('husky-pre-commit.template'),
        path: '.husky/pre-commit',
      },
      {
        content: loadTemplate('husky-commit-msg.template'),
        path: '.husky/commit-msg',
      },
    ],
    name: 'Husky',
    postInstall: ['npx husky init'],
  },

  jest: {
    configChanges: [
      {
        changes: {
          features: { jest: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {},
    description: 'Add Jest for unit testing',
    devDependencies: {
      '@testing-library/jest-dom': '^6.4.2',
      '@testing-library/react': '^14.2.1',
      '@testing-library/user-event': '^14.5.2',
      '@types/jest': '^29.5.12',
      'identity-obj-proxy': '^3.0.0',
      jest: '^29.7.0',
      'jest-environment-jsdom': '^29.7.0',
      'ts-jest': '^29.1.2',
    },
    files: [
      {
        content: loadTemplate('jest.config.ts.template'),
        path: 'jest.config.ts',
      },
      {
        content: loadTemplate('jest-setup.ts.template'),
        path: 'src/test/setup.ts',
      },
    ],
    name: 'Jest',
  },

  'lint-staged': {
    configChanges: [
      {
        changes: {
          features: { 'lint-staged': true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {},
    description: 'Add lint-staged to run linters on staged files',
    devDependencies: {
      'lint-staged': '^15.2.2',
    },
    files: [
      {
        content: loadTemplate('lint-staged.config.js.template'),
        path: 'lint-staged.config.js',
      },
    ],
    name: 'Lint-staged',
  },

  playwright: {
    configChanges: [
      {
        changes: {
          features: { playwright: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {},
    description: 'Add Playwright for E2E testing',
    devDependencies: {
      '@playwright/test': '^1.42.1',
      '@types/node': '^20.11.24',
    },
    files: [
      {
        content: loadTemplate('playwright.config.ts.template'),
        path: 'playwright.config.ts',
      },
      {
        content: loadTemplate('playwright-example.spec.ts.template'),
        path: 'e2e/example.spec.ts',
      },
    ],
    name: 'Playwright',
    postInstall: ['npx playwright install'],
  },

  prettier: {
    configChanges: [
      {
        changes: {
          features: { prettier: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {},
    description: 'Add Prettier for code formatting',
    devDependencies: {
      prettier: '^3.2.0',
    },
    files: [
      {
        content: loadTemplate('.prettierrc.template'),
        path: '.prettierrc',
      },
      {
        content: loadTemplate('.prettierignore.template'),
        path: '.prettierignore',
      },
    ],
    name: 'Prettier',
  },

  // Inline templates for features that are simple
  router: {
    configChanges: [
      {
        changes: {
          features: { router: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {
      'react-router-dom': '^6.21.0',
    },
    description: 'Add React Router for navigation',
    devDependencies: {
      '@types/react-router-dom': '^5.3.3',
    },
    files: [
      {
        content: `import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
`,
        path: 'src/router.tsx',
      },
    ],
    name: 'React Router',
  },

  vitest: {
    configChanges: [
      {
        changes: {
          features: { vitest: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {},
    description: 'Add Vitest for testing',
    devDependencies: {
      '@testing-library/jest-dom': '^6.2.0',
      '@testing-library/react': '^14.1.2',
      '@testing-library/user-event': '^14.5.2',
      jsdom: '^24.0.0',
      vitest: '^1.2.0',
    },
    files: [
      {
        content: loadTemplate('vitest.config.ts.template'),
        path: 'vitest.config.ts',
      },
      {
        content: loadTemplate('vitest-setup.ts.template'),
        path: 'src/test/setup.ts',
      },
    ],
    name: 'Vitest',
  },

  zustand: {
    configChanges: [
      {
        changes: {
          features: { zustand: true },
        },
        file: 'kubit.config.toml',
      },
    ],
    dependencies: {
      zustand: '^4.4.7',
    },
    description: 'Add Zustand for state management',
    files: [
      {
        content: `import { create } from 'zustand';

interface ExampleState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useExampleStore = create<ExampleState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
`,
        path: 'src/store/example.ts',
      },
    ],
    name: 'Zustand',
  },
};
