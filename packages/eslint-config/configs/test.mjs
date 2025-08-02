/**
 * Test-specific ESLint configuration
 * Relaxed rules for test files to allow common testing patterns
 */
export default [
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
      '**/test-utils/**/*.{js,jsx,ts,tsx}',
      '**/testing/**/*.{js,jsx,ts,tsx}',
    ],
    rules: {
      // TypeScript relaxations
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      
      // General relaxations
      'no-console': 'off',
      'no-debugger': 'warn', // Allow but warn
      'no-unused-expressions': 'off',
      'no-empty': 'off',
      'no-empty-function': 'off',
      
      // Unused imports/vars - common in tests
      'unused-imports/no-unused-imports': 'off',
      'unused-imports/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      
      // React relaxations for test files
      'react/no-children-prop': 'off',
      'react/no-unescaped-entities': 'off',
      'react/display-name': 'off',
      'react/jsx-no-bind': 'off',
      'react-hooks/rules-of-hooks': 'off', // Hooks in test utilities
      'react-hooks/exhaustive-deps': 'off',
      
      // Allow test-specific patterns
      'prefer-const': 'off', // let is common in tests
      'prefer-template': 'off',
      'no-restricted-syntax': 'off',
      'no-await-in-loop': 'off', // Common in E2E tests
      'no-loop-func': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'complexity': 'off',
    },
  },
  
  // Test setup files
  {
    files: [
      '**/jest.setup.{js,ts}',
      '**/vitest.setup.{js,ts}',
      '**/test-setup.{js,ts}',
      '**/setupTests.{js,ts}',
      '**/playwright.setup.{js,ts}',
    ],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  
  // E2E specific
  {
    files: ['**/e2e/**/*.{js,ts}', '**/*.e2e.{js,ts}', '**/*.e2e-spec.{js,ts}'],
    rules: {
      'no-await-in-loop': 'off', // Sequential operations are common
      'no-restricted-syntax': 'off',
      'jest/expect-expect': 'off', // Playwright has different assertions
      'jest/no-done-callback': 'off',
    },
  },
];