import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  // Global ignores - applies to all configurations
  {
    ignores: [
      // Build outputs and generated files
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.docusaurus/**',
      '**/coverage/**',
      '**/tmp/**',
      '**/output/**',
      '**/playwright-report/**',
      '**/test-results/**',
      
      // Dependencies and caches
      '**/node_modules/**',
      '**/.nx/**',
      '**/.pnpm/**',
      
      // IDE and system files
      '**/.vscode/**',
      '**/.idea/**',
      '**/.DS_Store',
      
      // Static and runtime files
      '**/static/runtime.js',
      '**/*.min.js',
      '**/*.d.ts',
      
      // Config file timestamps
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      
      // Environment files
      '**/.env*',
    ],
  },
  
  // Base configuration for all TypeScript/JavaScript files
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
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        // Remove strict project requirement to avoid parsing errors
        // project: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports
      'no-unused-vars': 'off',
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
  },
  
  // React-specific configuration
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': hooksPlugin,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in modern React
      'react/prop-types': 'off', // Using TypeScript instead
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  
  // Next.js specific configuration
  {
    files: ['apps/admin/**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Next.js specific rules can go here
      '@typescript-eslint/no-var-requires': 'off', // Next.js config files use require
    },
  },
  
  // Tools and converters configuration
  {
    files: ['tools/**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  
  // Test files - very relaxed rules
  {
    files: [
      '**/*.test.{js,jsx,ts,tsx}',
      '**/*.spec.{js,jsx,ts,tsx}',
      '**/tests/**/*.{js,jsx,ts,tsx}',
      '**/test/**/*.{js,jsx,ts,tsx}',
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
      '**/e2e/**/*.{js,jsx,ts,tsx}',
      '**/__mocks__/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      // Relax rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      // Turn off unused imports/vars for test files - common in tests
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-console': 'off',
      // React-specific relaxations for test files
      'react/no-children-prop': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
  
  // Config files - minimal rules
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
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'unused-imports/no-unused-imports': 'warn',
    },
  },
  
  // Scripts - relaxed rules for build/dev scripts
  {
    files: ['scripts/**/*.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off', // Scripts need console output
      'unused-imports/no-unused-imports': 'warn',
    },
  },
];
