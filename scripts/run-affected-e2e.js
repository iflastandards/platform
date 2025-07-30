#!/usr/bin/env node

/**
 * Helper script to run E2E tests for affected projects
 * Uses environment variables to filter which tests to run
 */

const { execSync } = require('child_process');
const path = require('path');

// Get affected projects from command line or environment
const args = process.argv.slice(2);
const affectedApps = args[0]?.split(',').filter(Boolean) || [];
const affectedSites = args[1]?.split(',').filter(Boolean) || [];

console.log('🎯 Running E2E tests for affected projects...');
if (affectedApps.length > 0) {
  console.log(`   App: ${affectedApps.join(', ')}`);
}
if (affectedSites.length > 0) {
  console.log(`   Site: ${affectedSites.join(', ')}`);
}

// Build environment variables
const env = {
  ...process.env,
  AFFECTED_APPS: affectedApps.join(','),
  AFFECTED_SITES: affectedSites.join(',')
};

// Build test command
let testCommand = 'pnpm exec playwright test --config=playwright.config.pre-push.ts';

// Add specific test patterns based on what's affected
const testPatterns = [];

// Add smoke tests if any site is affected
if (affectedSites.length > 0) {
  // Use the affected smoke test that filters by environment variable
  testPatterns.push('e2e/standards-smoke-affected.spec.ts');
  
  // For portal, also run portal smoke test
  if (affectedSites.includes('portal')) {
    testPatterns.push('e2e/portal-smoke.spec.ts');
  }
}

// Add admin tests if admin is affected
if (affectedApps.includes('admin')) {
  testPatterns.push('e2e/admin/**/*.spec.ts');
  testPatterns.push('e2e/admin-*.spec.ts');
}

// Add portal tests if portal is affected
if (affectedApps.includes('portal') || affectedSites.includes('portal')) {
  testPatterns.push('e2e/portal-*.spec.ts');
  
  // Only add site validation if we're specifically testing portal
  if (affectedApps.includes('portal') && affectedSites.length === 0) {
    testPatterns.push('e2e/site-validation*.spec.ts');
  }
}

// Add specific test patterns to command
if (testPatterns.length > 0) {
  testCommand += ' ' + testPatterns.join(' ');
}

console.log(`\n📝 Running command: ${testCommand}\n`);

// Execute tests
try {
  execSync(testCommand, {
    stdio: 'inherit',
    env
  });
  console.log('\n✅ E2E tests passed for affected projects');
  process.exit(0);
} catch (error) {
  console.log('\n❌ E2E tests failed');
  process.exit(1);
}