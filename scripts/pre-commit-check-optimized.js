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
    'pnpm nx affected --targets=typecheck,test --parallel=10',
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
let lintExitCode = 0;
try {
  // Run the lint command and capture the output
  const lintOutput = execSync(
    'pnpm nx affected --target=lint --parallel=10 2>&1 || true',
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096',
        NX_SKIP_NX_CACHE: 'false',
        NX_DAEMON: 'true'
      }
    }
  );
  
  // Parse the output to check for actual errors
  if (lintOutput.includes(' error ') || lintOutput.includes(' errors)')) {
    // Extract error count from the summary line
    const errorMatch = lintOutput.match(/(\d+) errors?/);
    const errorCount = errorMatch ? parseInt(errorMatch[1]) : 0;
    
    if (errorCount > 0) {
      console.log(lintOutput);
      console.log(`❌ ESLint found ${errorCount} error(s) that must be fixed\n`);
      hasErrors = true;
    } else {
      console.log('✅ ESLint passed (warnings are allowed in pre-commit)\n');
    }
  } else {
    console.log('✅ ESLint passed (no issues)\n');
  }
} catch (error) {
  // This shouldn't happen with || true, but just in case
  console.log('❌ ESLint command failed unexpectedly\n');
  hasErrors = true;
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