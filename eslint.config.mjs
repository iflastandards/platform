import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  {
    ignores: [
      'dist/',
      'node_modules/',
      '*.d.ts',
      '**/build/**/',
      'packages/theme/dist/',
      'tmp/',
      '*.min.js',
      'coverage/',
      '**/.docusaurus/',
      '**/dist/',
      '**/build/',
      '**/node_modules/',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/.nx/',
      '**/static/runtime.js',
      '**/.nx/**/*',
      'static/',
      '**/.next/**/*',
      '**/coverage/**/*',
      '**/.docusaurus/**/*',
      '**/dist/**/*',
      '.idea/',
      '.idea/**/*',
      '.vscode/',
      '.vscode/**/*',
    ],
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).filter(([key]) => !key.includes(' ')),
        ),
        ...globals.node,
        // Add back the corrected AudioWorkletGlobalScope
        AudioWorkletGlobalScope: 'readonly',
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': hooksPlugin,
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': 'off', // or "@typescript-eslint/no-unused-vars": "off",
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // Less strict configuration for test files
  {
    files: [
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}',
      '**/tests/**/*.{js,jsx,ts,tsx}',
      '**/test/**/*.{js,jsx,ts,tsx}',
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
      '**/e2e/**/*.{js,jsx,ts,tsx}',
      '**/vitest.*.{js,ts}',
      '**/jest.*.{js,ts}',
      '**/playwright.*.{js,ts}',
      '**/test-*.{js,jsx,ts,tsx}',
      '**/scripts/test-*.{js,jsx,ts,tsx}',
    ],
    rules: {
      // Allow any types in tests for mocking
      '@typescript-eslint/no-explicit-any': 'off',
      
      // Allow unused vars with _ prefix (common in test setups)
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      
      // Relax strict type checking in tests
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      
      // Allow console logs in tests (useful for debugging)
      'no-console': 'off',
      
      // Allow longer functions in tests (test suites can be long)
      'max-lines-per-function': 'off',
      
      // Allow magic numbers in tests
      'no-magic-numbers': 'off',
      
      // Relax import rules for tests
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      
      // Allow empty functions (common in test mocks)
      '@typescript-eslint/no-empty-function': 'off',
      
      // Allow test-specific patterns
      '@typescript-eslint/no-unused-expressions': 'off',
      
      // Relax async requirements in tests
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      
      // Allow type assertions in tests
      '@typescript-eslint/consistent-type-assertions': 'off',
    },
  },
];
