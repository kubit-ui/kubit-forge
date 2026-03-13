import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import kubit from '@kubit-ui-web/eslint-plugin-kubit';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  kubit.configs.recommended,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/templates/**'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-use-before-define': 'warn',
      complexity: 'off',
      'no-alert': 'off',
      'no-console': 'off',
      'no-param-reassign': 'off',
      'no-undef': 'off',
      'kubit/no-index-import': 'off',
      'kubit/enforce-named-exports': 'off',
    },
  },
];
