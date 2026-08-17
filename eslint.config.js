import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import typescript from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/vendor/**', '**/coverage/**'],
  },
  prettier,
];
