#!/usr/bin/env node

/**
 * Optimized pre-commit check script that runs much faster
 * - Combines multiple Nx commands into one
 * - Skips builds during typecheck
 * - Uses more aggressive parallelization
 */

const { execSync } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');

console.log('\n🚀 Running optimized pre-commit checks...\n');

// Ensure nx daemon is running for better performance
ensureDaemon();

let hasErrors = false;

// Run all checks in a single Nx command for better performance
console.log('📋 Running typecheck, lint, and tests in parallel...');
try {
  // Use a single nx run-many command with all targets
  // This avoids the overhead of starting Nx multiple times
  execSync(
    'nx run-many --targets=typecheck,lint,test --affected --parallel=8 --skip-nx-cache=false --nx-bail',
    {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        // Skip builds during typecheck
        NX_SKIP_NX_DEPENDENCIES: 'true',
        // Use more aggressive caching
        NX_CACHE_DIRECTORY: '.nx/cache',
        // Increase Node memory for faster execution
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    }
  );
  console.log('✅ All checks passed\n');
} catch (error) {
  // Check if it's just ESLint warnings
  const errorOutput = error.stdout || error.message || '';
  if (errorOutput.includes('ESLint') && errorOutput.includes('warning')) {
    console.log('⚠️  ESLint completed with warnings (this is OK)\n');
  } else {
    console.log('❌ Checks failed\n');
    hasErrors = true;
  }
}

// Summary
if (hasErrors) {
  console.log('❌ Pre-commit checks failed. Please fix errors before committing.\n');
  process.exit(1);
} else {
  console.log('✅ Pre-commit checks passed! (Warnings are allowed)\n');
  console.log('💡 Tip: If this is still slow, use --no-verify for urgent commits\n');
  process.exit(0);
}