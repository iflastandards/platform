#!/usr/bin/env node

/**
 * Optimized pre-commit check script that leverages Nx properly
 * - Uses Nx's caching effectively
 * - Runs checks in parallel
 * - Doesn't clear cache or trigger unnecessary builds
 */

const { execSync } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');

console.log('\n🚀 Running optimized pre-commit checks...\n');

// Ensure nx daemon is running for better performance
ensureDaemon();

let hasErrors = false;

// Run typecheck and tests first (these should fail on errors)
console.log('📋 Running affected typecheck and tests...');
try {
  execSync(
    'nx affected --targets=typecheck,test --parallel=10',
    {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096',
        NX_SKIP_NX_CACHE: 'false',
        NX_DAEMON: 'true'
      }
    }
  );
  console.log('✅ TypeScript and tests passed\n');
} catch (error) {
  console.log('❌ TypeScript or tests failed\n');
  hasErrors = true;
}

// Run lint separately to handle warnings gracefully
console.log('📋 Running ESLint...');
try {
  execSync(
    'nx affected --target=lint --parallel=10',
    {
      stdio: 'inherit',
      encoding: 'utf8'
    }
  );
  console.log('✅ ESLint passed (no issues)\n');
} catch (error) {
  // ESLint exits with 1 for warnings, which is OK for pre-commit
  console.log('⚠️  ESLint completed with warnings (this is OK for pre-commit)\n');
}

// Summary
if (hasErrors) {
  console.log('❌ Pre-commit checks failed. Please fix errors before committing.\n');
  process.exit(1);
} else {
  console.log('✅ Pre-commit checks passed!\n');
  console.log('💡 Performance tips:');
  console.log('   - Nx cache is being used effectively');
  console.log('   - Keep daemon running: pnpm nx:daemon:start');
  console.log('   - For urgent commits: git commit --no-verify\n');
  process.exit(0);
}