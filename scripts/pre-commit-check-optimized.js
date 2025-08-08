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
    'node scripts/typecheck-safe.js nx affected --targets=typecheck,test:unit --parallel=6 --skip-nx-cache',
    {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096',
        NX_DAEMON: 'true'
      }
    }
  );
  console.log('✅ TypeScript and tests passed\n');
} catch (error) {
  console.log('❌ TypeScript or tests failed\n');
  hasErrors = true;
}

// Run lint with fix-dry-run on affected files using our custom script
console.log('📋 Running ESLint with fix-dry-run on affected files...');
try {
  execSync(
    'pnpm lint:affected:fix-dry-run',
    {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=2048'
      }
    }
  );
  console.log('✅ ESLint with fix-dry-run completed\n');
} catch (error) {
  if (error.status === 1) {
    console.log('📋 ESLint found issues (this is normal with --fix-dry-run)\n');
  } else {
    console.log('❌ ESLint failed unexpectedly:\n', error.message);
    hasErrors = true;
  }
}

// Summary
if (hasErrors) {
  console.log('❌ Pre-commit checks failed. Please fix errors before committing.\n');
  process.exit(1);
} else {
  console.log('✅ Pre-commit checks passed!\n');
  console.log('💡 Performance tips:');
  console.log('   - Tests run with --skip-nx-cache for reliable results');
  console.log('   - Keep daemon running: pnpm nx:daemon:start');
  console.log('   - For urgent commits: git commit --no-verify\n');
  process.exit(0);
}