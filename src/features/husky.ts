import type { Feature } from '../types/index.js';

export const huskyFeature: Feature = {
  category: 'git',
  configFiles: [
    {
      content: `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`,
      path: '.husky/pre-commit',
    },
    {
      content: `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit \${1}
`,
      path: '.husky/commit-msg',
    },
    {
      backup: true,
      content: {
        '*.{json,css,md}': ['prettier --write'],
        '*.{ts,tsx,js,jsx}': ['eslint --fix', 'prettier --write'],
      },
      path: '.lintstagedrc.json',
    },
    {
      backup: true,
      content: `module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
};
`,
      path: 'commitlint.config.js',
    },
  ],
  description: 'Husky + Lint-staged + Commitlint for Git hooks',
  devDependencies: [
    'husky@^9.0.10',
    'lint-staged@^15.2.2',
    '@commitlint/cli@^18.6.1',
    '@commitlint/config-conventional@^18.6.2',
  ],
  hooks: {
    async afterInstall(ctx) {
      ctx.logger.info('Initializing Husky...');
      // Would run: npx husky install
    },
  },

  instructions: `
Husky, Lint-staged, and Commitlint have been installed!

Next steps:
1. Run 'pnpm prepare' to initialize Husky
2. Make a commit to test the hooks
3. Use conventional commit format: feat: add new feature
4. Customize lint-staged rules in .lintstagedrc.json

Commit types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code refactoring
- test: Tests
- chore: Maintenance
`,

  name: 'husky',

  scripts: {
    prepare: 'husky install',
  },

  tags: ['git-hooks', 'husky', 'lint-staged', 'commitlint'],

  version: '1.0.0',
};
