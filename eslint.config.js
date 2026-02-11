import eslintConfigKubit from 'eslint-config-kubit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default eslintConfigKubit({
  ignores: ['**/dist/**', '**/node_modules/**', '**/templates/**'],
  isReact: false,
  overrides: [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      rules: {
        '@/no-restricted-syntax': [
          'warn',
          {
            message: "Enums are not allowed. Use 'as const' objects instead.",
            selector: 'TSEnumDeclaration',
          },
        ],
        '@kubit-ui-web/no-index-import/no-index-import': 'error',
        '@kubit-ui-web/no-index-import/no-index-import': 'off', // fix
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off', // fix
        '@typescript-eslint/no-empty-function': 'off', // fix
        '@typescript-eslint/no-empty-object-type': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off', // fix
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-use-before-define': 'warn',
        complexity: 'off',
        'consistent-return': 'off', // fix
        'no-alert': 'off',
        'no-console': 'off',
        'no-duplicate-imports': 'off', // fix,
        'no-param-reassign': 'off',
        'no-undef': 'off',
        'unused-imports/no-unused-imports': 'off', // fix
      },
    },
  ],
  tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
});
