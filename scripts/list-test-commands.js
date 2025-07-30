#!/usr/bin/env node

/**
 * Lists all available test commands with descriptions
 * This helps developers discover and understand the new E2E test framework
 */

const fs = require('fs');
const path = require('path');

// Simple console colors without external dependencies
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
};

const color = (text, ...styles) => {
  const codes = styles.map(s => colors[s] || '').join('');
  return `${codes}${text}${colors.reset}`;
};

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);

const testCommands = {
  'Smoke Tests (Fast, <5 min)': {
    'test:e2e:smoke': 'Run all smoke tests',
    'test:e2e:smoke:affected': 'Run smoke tests only for affected projects',
    'test:pre-commit:smoke': 'Pre-commit hook with smoke tests',
  },
  
  'Integration Tests (Medium, <15 min)': {
    'test:e2e:integration': 'Run all integration tests',
    'test:e2e:integration:affected': 'Run integration tests for affected projects',
    'test:pre-push:integration': 'Pre-push hook with integration tests',
  },
  
  'Full E2E Tests (Slow, <20 min)': {
    'test:e2e:full': 'Run complete E2E test suite',
    'test:e2e:full:affected': 'Run full E2E tests for affected projects',
  },
  
  'Tag-Based Tests': {
    'test:e2e:tags': 'Run tests by tag (usage: pnpm test:e2e:tags <tag>)',
    'test:e2e:critical': 'Run only critical tests',
    'test:e2e:auth': 'Run authentication tests',
    'test:e2e:rbac': 'Run RBAC (Role-Based Access Control) tests',
    'test:e2e:perf': 'Run performance tests',
  },
  
  'CI-Specific Commands': {
    'test:ci:quick': 'Quick CI validation (smoke tests only)',
    'test:ci:standard': 'Standard CI validation (smoke + integration)',
    'test:ci:full': 'Full CI validation (all test types)',
    'test:ci:smoke': 'Run smoke tests in CI mode',
    'test:ci:integration': 'Run integration tests in CI mode',
    'test:ci:e2e': 'Run full E2E tests in CI mode',
  },
  
  'Utilities': {
    'test:e2e:categorize': 'Analyze and categorize existing tests',
    'test:e2e:ui': 'Open Playwright UI mode for debugging',
    'test:explain-strategy': 'Explain the testing strategy',
  },
  
  'Legacy/Original Commands': {
    'test:e2e': 'Original E2E test command',
    'test:e2e:legacy': 'Legacy E2E tests',
    'test:e2e:affected': 'Legacy affected E2E tests',
  },
};

console.log(color('\n🧪 Available E2E Test Commands\n', 'bold', 'cyan'));
console.log(color('=' .repeat(60), 'gray'));

for (const [category, commands] of Object.entries(testCommands)) {
  console.log(color(`\n${category}:`, 'bold', 'yellow'));
  
  for (const [command, description] of Object.entries(commands)) {
    if (packageJson.scripts[command]) {
      console.log(
        color(`  pnpm ${command}`, 'green'),
        color('-', 'gray'),
        color(description, 'white')
      );
    } else {
      console.log(
        color(`  pnpm ${command}`, 'red'),
        color('-', 'gray'),
        color(description, 'white'),
        color('(not found)', 'red')
      );
    }
  }
}

console.log(color('\n' + '=' .repeat(60), 'gray'));
console.log(color('\n📚 Quick Start Guide:\n', 'bold', 'cyan'));
console.log(color('1. For development:', 'white'), color('pnpm test:e2e:smoke:affected', 'green'));
console.log(color('2. Before pushing:', 'white'), color('pnpm test:pre-push:integration', 'green'));
console.log(color('3. For debugging:', 'white'), color('pnpm test:e2e:ui', 'green'));
console.log(color('4. Tag-based testing:', 'white'), color('pnpm test:e2e:tags @critical', 'green'));

console.log(color('\n' + '=' .repeat(60), 'gray'));
console.log(color('\n🏷️  Available Tags:\n', 'bold', 'cyan'));
console.log(color('  @smoke        - Quick validation tests', 'white'));
console.log(color('  @integration  - Cross-service tests', 'white'));
console.log(color('  @e2e          - Full end-to-end tests', 'white'));
console.log(color('  @critical     - Must-pass tests', 'white'));
console.log(color('  @auth         - Authentication tests', 'white'));
console.log(color('  @rbac         - Role-based access tests', 'white'));
console.log(color('  @api          - API tests', 'white'));
console.log(color('  @ui           - UI tests', 'white'));
console.log(color('  @performance  - Performance tests', 'white'));
console.log(color('  @slow         - Long-running tests', 'white'));
console.log(color('  @flaky        - Known flaky tests', 'white'));

console.log('\n');