#!/usr/bin/env node

/**
 * Validates that test files are properly placed according to our testing strategy
 * This helps ensure tests run at the correct phase (pre-commit, pre-push, CI)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
};

// Test file patterns and their expected characteristics
const testPatterns = {
  unit: {
    pattern: '**/*.{test,spec}.{ts,tsx,js,jsx}',
    excludePatterns: [
      '**/*.integration.test.*',
      '**/*.e2e.test.*',
      '**/e2e/**',
      '**/tests/deployment/**',
      '**/node_modules/**',
    ],
    phase: 'pre-commit',
    description: 'Unit tests'
  },
  integration: {
    pattern: '**/*.integration.test.{ts,tsx,js,jsx}',
    excludePatterns: ['**/node_modules/**'],
    phase: 'pre-push',
    description: 'Integration tests'
  },
  e2e: {
    pattern: '**/e2e/**/*.{test,spec,e2e}.{ts,tsx,js,jsx}',
    excludePatterns: ['**/node_modules/**'],
    phase: 'pre-push (smart trigger)',
    description: 'E2E tests'
  },
  environment: {
    pattern: '**/tests/deployment/**/*.test.{ts,tsx,js,jsx}',
    excludePatterns: ['**/node_modules/**'],
    phase: 'CI only',
    description: 'Environment tests'
  }
};

// Common misplacement patterns to check
const misplacementChecks = [
  {
    check: (filePath, content) => {
      return content.includes('process.env.') && 
             !filePath.includes('tests/deployment') &&
             !content.includes('process.env.NODE_ENV');
    },
    message: 'Contains environment variable checks - should be in tests/deployment/'
  },
  {
    check: (filePath, content) => {
      return content.includes('fetch(') && 
             content.includes('http') &&
             !filePath.includes('.integration.test') &&
             !filePath.includes('tests/deployment') &&
             !filePath.includes('/e2e/');
    },
    message: 'Makes real HTTP calls - should be an integration or E2E test'
  },
  {
    check: (filePath, content) => {
      return (content.includes('createTestDatabase') || 
              content.includes('TestDatabase')) &&
             !filePath.includes('.integration.test');
    },
    message: 'Uses test database - should be an integration test'
  },
  {
    check: (filePath, content) => {
      return content.includes('playwright') && !filePath.includes('/e2e/');
    },
    message: 'Uses Playwright - should be in e2e/ directory'
  }
];

function validateTestPlacement() {
  console.log(colors.blue('\n🔍 Validating test placement...\n'));
  
  let hasIssues = false;
  const results = {};

  // Check each test type
  Object.entries(testPatterns).forEach(([type, config]) => {
    const files = glob.sync(config.pattern, {
      ignore: config.excludePatterns
    });
    
    results[type] = {
      count: files.length,
      phase: config.phase,
      description: config.description,
      issues: []
    };

    // Check for misplaced tests
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      misplacementChecks.forEach(check => {
        if (check.check(file, content)) {
          hasIssues = true;
          results[type].issues.push({
            file,
            issue: check.message
          });
        }
      });
    });
  });

  // Check for env tests that don't skip in local
  const envTests = glob.sync(testPatterns.environment.pattern, {
    ignore: testPatterns.environment.excludePatterns
  });
  
  envTests.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (!content.includes('if (!process.env.CI)')) {
      hasIssues = true;
      results.environment.issues.push({
        file,
        issue: 'Environment test must check for CI environment'
      });
    }
  });

  // Report results
  console.log(colors.blue('Test Distribution by Phase:'));
  console.log('─'.repeat(60));
  
  Object.entries(results).forEach(([type, data]) => {
    const statusIcon = data.issues.length > 0 ? '❌' : '✅';
    console.log(`${statusIcon} ${data.description}: ${data.count} files (${data.phase})`);
    
    if (data.issues.length > 0) {
      data.issues.forEach(issue => {
        console.log(colors.yellow(`   ⚠️  ${path.relative(process.cwd(), issue.file)}`));
        console.log(colors.yellow(`      ${issue.issue}`));
      });
    }
  });

  console.log('─'.repeat(60));

  // Summary
  if (hasIssues) {
    console.log(colors.red('\n❌ Test placement issues found!'));
    console.log('\nRefer to developer_notes/TEST_PLACEMENT_GUIDE.md for correct placement.');
    process.exit(1);
  } else {
    console.log(colors.green('\n✅ All tests are properly placed!'));
    console.log('\nTest phases:');
    console.log('  • Pre-commit: Unit tests only (< 60s)');
    console.log('  • Pre-push: Integration + E2E tests (< 180s)');
    console.log('  • CI: Environment tests only');
  }
}

// Run validation
validateTestPlacement();