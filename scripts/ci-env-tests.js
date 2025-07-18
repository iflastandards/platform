#!/usr/bin/env node

/**
 * CI Environment-Specific Tests
 * 
 * This script runs ONLY the tests that validate environment-dependent functionality.
 * It assumes all other tests (unit, integration, lint, typecheck) have passed locally.
 * 
 * What it tests:
 * - Environment variables and secrets are present
 * - External services are reachable (API connectivity)
 * - File paths and permissions are correct for CI
 * - Build configuration is appropriate for production
 * 
 * What it does NOT test:
 * - Application functionality (already tested locally)
 * - Code quality (already linted locally)
 * - Type safety (already checked locally)
 * - Unit tests (already passed locally)
 * - Integration tests (already passed locally)
 */

const { execSync } = require('child_process');

console.log('\n🌍 Running CI Environment-Specific Tests...\n');
console.log('ℹ️  These tests ONLY validate environment-dependent functionality');
console.log('ℹ️  All other tests have already passed in pre-commit and pre-push hooks\n');

// Check if we're in CI
if (!process.env.CI) {
  console.log('⚠️  Not in CI environment. These tests only run in CI.');
  console.log('💡 To simulate CI environment, run: CI=true pnpm test:ci:env\n');
  process.exit(0);
}

try {
  // Run only environment-specific tests
  console.log('📋 Testing environment variables...');
  console.log('📋 Testing external service connectivity...');
  console.log('📋 Testing CI-specific paths and permissions...\n');
  
  execSync('vitest run --config vitest.config.ci-env.ts', {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Ensure we're in production mode for CI
      NODE_ENV: 'production'
    }
  });
  
  console.log('\n✅ CI environment tests passed!');
  console.log('✅ The CI environment is properly configured for deployment\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ CI environment tests failed!');
  console.error('❌ This indicates an environment configuration issue, not a code issue\n');
  console.error('Common causes:');
  console.error('- Missing environment variables or secrets');
  console.error('- API tokens not configured in CI');
  console.error('- External services not accessible from CI');
  console.error('- File permissions issues in CI environment\n');
  process.exit(1);
}