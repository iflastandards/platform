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

// 1) Typecheck (affected only), skip dependency builds by bypassing Nx task graph
console.log('📋 Running affected typecheck (fast, no upstream builds)...');
try {
  execSync('node scripts/tsc-affected-fast.js', {
    stdio: 'inherit',
    encoding: 'utf8',
    env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
  });
  console.log('✅ Typecheck passed\n');
} catch (error) {
  console.log('❌ Typecheck failed\n');
  hasErrors = true;
}

// 2) Lint (affected only)
console.log('📋 Running affected lint...');
try {
  execSync('pnpm nx affected --target=lint --parallel=6', {
    stdio: 'inherit',
    encoding: 'utf8',
  });
  console.log('✅ Lint passed\n');
} catch (error) {
  // ESLint v9 flat config can exit non-zero on errors; warnings are fine.
  console.log('❌ Lint failed\n');
  hasErrors = true;
}

// 3) Unit tests (affected only)
console.log('📋 Running affected unit tests...');
try {
  execSync('pnpm nx affected --target=test --parallel=6', {
    stdio: 'inherit',
    encoding: 'utf8',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
    },
  });
  console.log('✅ Tests passed\n');
} catch (error) {
  console.log('❌ Tests failed\n');
  hasErrors = true;
}

// Summary
if (hasErrors) {
  console.log(
    '❌ Pre-commit checks failed. Please fix errors before committing.\n',
  );
  process.exit(1);
} else {
  console.log('✅ Pre-commit checks passed! (Warnings are allowed)\n');
  process.exit(0);
}
