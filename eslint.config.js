import eslintConfigKubit from 'eslint-config-kubit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default eslintConfigKubit({
  isReact: false,
  tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
  ignores: ['**/dist/**', '**/node_modules/**', '**/templates/**'],
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
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/no-empty-object-type': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-magic-numbers': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-use-before-define': 'warn',
        complexity: 'off',
        'no-alert': 'off',
        'no-console': 'off',
        'no-undef': 'off',
        'no-param-reassign': 'off',
        'unused-imports/no-unused-imports': 'off', // fix
        '@kubit-ui-web/no-index-import/no-index-import': 'off', // fix
        '@typescript-eslint/no-empty-function': 'off', // fix
        'no-duplicate-imports': 'off', // fix,
        '@typescript-eslint/explicit-module-boundary-types': 'off', // fix
        '@typescript-eslint/no-non-null-assertion': 'off', // fix
        'consistent-return': 'off', // fix
      },
    },
  ],
});
