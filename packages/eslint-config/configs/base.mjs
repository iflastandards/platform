import globals from 'globals';
import { ignorePatterns } from '../utils/ignore-patterns.mjs';

/**
 * Base ESLint configuration for all JavaScript/TypeScript files
 * This provides the foundation that all other configs build upon
 */
export default [
  // Global ignores
  {
    ignores: ignorePatterns,
  },

  // Base configuration for all JS/TS files
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // Basic JavaScript rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      curly: ['error', 'all'],

      // Ignore unused 'error' variables (common in catch blocks)
      'no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_|^error$|^err$',
          argsIgnorePattern: '^_|^error$|^err$',
          caughtErrors: 'none',
        },
      ],

      // Code quality
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-return-await': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',

      // Best practices
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'error',
      'spaced-comment': ['error', 'always', { exceptions: ['-', '+', '*'] }],
      'no-else-return': ['error', { allowElseIf: false }],

      // ES6+
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
      'prefer-destructuring': ['error', { object: true, array: false }],
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'no-useless-constructor': 'error',
    },
  },

  // Relaxed rules for config files
  {
    files: [
      '*.config.{js,mjs,ts}',
      '**/*.config.{js,mjs,ts}',
      '**/playwright.config*.{js,ts}',
      '**/vitest.config*.{js,ts}',
      '**/jest.config*.{js,ts}',
      'eslint.config.{js,mjs}',
    ],
    rules: {
      'no-console': 'off',
      'prefer-template': 'off',
    },
  },

  // Relaxed rules for scripts
  {
    files: ['scripts/**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'off',
      'prefer-template': 'off',
    },
  },
];
