// @ts-check
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/max-len': [
        'error',
        {
          code: 100,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
      camelcase: ['error', { properties: 'never', ignoreDestructuring: true }],
    },
  },
);
