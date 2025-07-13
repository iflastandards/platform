#!/usr/bin/env node

/**
 * Explains the relaxed linting and TypeScript rules for test files
 */

const chalk = require('chalk').default || require('chalk');
const path = require('path');

console.log(chalk.blue.bold('\n📋 Test File Linting Rules\n'));

console.log(chalk.cyan('Test files have relaxed linting and TypeScript rules to allow for:'));
console.log();

const testPatterns = [
  '**/*.test.{js,jsx,ts,tsx}',
  '**/*.spec.{js,jsx,ts,tsx}',
  '**/tests/**/*.{js,jsx,ts,tsx}',
  '**/test/**/*.{js,jsx,ts,tsx}',
  '**/__tests__/**/*.{js,jsx,ts,tsx}',
  '**/e2e/**/*.{js,jsx,ts,tsx}',
];

console.log(chalk.yellow('📁 Test file patterns:'));
testPatterns.forEach(pattern => {
  console.log(`   - ${pattern}`);
});
console.log();

const relaxedRules = [
  {
    rule: '@typescript-eslint/no-explicit-any',
    value: 'off',
    reason: 'Allow any types for mocking and test data'
  },
  {
    rule: '@typescript-eslint/ban-ts-comment',
    value: 'off',
    reason: 'Allow @ts-ignore for testing edge cases'
  },
  {
    rule: 'no-console',
    value: 'off',
    reason: 'Allow console logs for debugging tests'
  },
  {
    rule: 'max-lines-per-function',
    value: 'off',
    reason: 'Test suites can be long'
  },
  {
    rule: '@typescript-eslint/no-empty-function',
    value: 'off',
    reason: 'Allow empty functions in mocks'
  },
  {
    rule: 'strict type checking',
    value: 'disabled',
    reason: 'tsconfig.test.json disables strict mode for tests'
  }
];

console.log(chalk.yellow('🎯 Relaxed rules for test files:'));
console.log();

relaxedRules.forEach(({ rule, value, reason }) => {
  console.log(chalk.green(`  ✓ ${rule}: ${value}`));
  console.log(chalk.gray(`    → ${reason}`));
  console.log();
});

console.log(chalk.cyan('💡 Tips:'));
console.log('  - Production code still uses strict linting');
console.log('  - Use these relaxed rules responsibly in tests');
console.log('  - Consider adding test-specific ESLint disable comments for one-off cases');
console.log();

console.log(chalk.blue('📖 Configuration files:'));
console.log(`  - ESLint: ${path.relative(process.cwd(), 'eslint.config.mjs')}`);
console.log(`  - TypeScript (tests): ${path.relative(process.cwd(), 'tsconfig.test.json')}`);
console.log();