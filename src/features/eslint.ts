import type { Feature } from '../types/index.js';

export const eslintFeature: Feature = {
  category: 'quality',
  configFiles: [
    {
      backup: true,
      content: {
        env: {
          browser: true,
          es2021: true,
          node: true,
        },
        extends: [
          'eslint:recommended',
          'plugin:@typescript-eslint/recommended',
          'plugin:react/recommended',
          'plugin:react-hooks/recommended',
        ],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
        plugins: ['@typescript-eslint', 'react', 'react-hooks'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'warn',
          '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
          'react/prop-types': 'off',
          'react/react-in-jsx-scope': 'off',
        },
        settings: {
          react: {
            version: 'detect',
          },
        },
      },
      path: '.eslintrc.json',
    },
    {
      content: `dist
node_modules
*.config.js
*.config.ts
coverage
.turbo
`,
      path: '.eslintignore',
    },
  ],
  description: 'ESLint for code quality and consistency',
  devDependencies: [
    'eslint@^8.57.0',
    '@typescript-eslint/eslint-plugin@^6.21.0',
    '@typescript-eslint/parser@^6.21.0',
    'eslint-plugin-react@^7.33.2',
    'eslint-plugin-react-hooks@^4.6.0',
  ],
  instructions: `
ESLint has been installed and configured!

Next steps:
1. Run 'pnpm lint' to check your code
2. Run 'pnpm lint:fix' to auto-fix issues
3. Configure your IDE to show ESLint errors
4. Customize rules in .eslintrc.json
`,

  name: 'eslint',

  scripts: {
    lint: 'eslint . --ext .ts,.tsx,.js,.jsx',
    'lint:fix': 'eslint . --ext .ts,.tsx,.js,.jsx --fix',
  },

  tags: ['linting', 'code-quality', 'javascript', 'typescript'],

  version: '1.0.0',
};
