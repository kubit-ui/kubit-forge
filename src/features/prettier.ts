import type { Feature } from '../types/index.js';

export const prettierFeature: Feature = {
  category: 'quality',
  configFiles: [
    {
      backup: true,
      content: {
        arrowParens: 'always',
        endOfLine: 'lf',
        printWidth: 100,
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
      },
      path: '.prettierrc.json',
    },
    {
      content: `dist
node_modules
coverage
.turbo
*.min.js
*.min.css
pnpm-lock.yaml
package-lock.json
yarn.lock
`,
      path: '.prettierignore',
    },
  ],
  description: 'Prettier for code formatting',
  devDependencies: [
    'prettier@^3.2.5',
    'eslint-config-prettier@^9.1.0',
    'eslint-plugin-prettier@^5.1.3',
  ],
  instructions: `
Prettier has been installed and configured!

Next steps:
1. Run 'pnpm format' to format your code
2. Run 'pnpm format:check' to check formatting
3. Configure your IDE to format on save
4. Customize formatting in .prettierrc.json
`,

  name: 'prettier',

  scripts: {
    format: 'prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"',
    'format:check': 'prettier --check "src/**/*.{ts,tsx,js,jsx,json,css,md}"',
  },

  tags: ['formatting', 'code-style', 'prettier'],

  version: '1.0.0',
};
