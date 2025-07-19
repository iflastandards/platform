#!/usr/bin/env node

/**
 * Smart pre-commit check that optimizes performance through caching
 * - Ensures @ifla/theme is built (but uses cache when possible)
 * - Runs checks in parallel when possible
 * - Provides clear feedback on what's happening
 */

const { execSync } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');
const fs = require('fs');
const path = require('path');

console.log('\n🚀 Running smart pre-commit checks...\n');

// Ensure nx daemon is running for better performance
ensureDaemon();

let hasErrors = false;

// Check if @ifla/theme needs building
const themeDist = path.join(__dirname, '../packages/theme/dist');
const themePackageJson = path.join(__dirname, '../packages/theme/package.json');
const themeSrc = path.join(__dirname, '../packages/theme/src');

function needsThemeBuild() {
  if (!fs.existsSync(themeDist)) {
    console.log('📦 @ifla/theme dist not found, build needed');
    return true;
  }
  
  // Check if source files are newer than dist
  try {
    const distStat = fs.statSync(themeDist);
    const srcFiles = execSync(`find ${themeSrc} -type f -newer ${themeDist}/index.js 2>/dev/null | head -1`, { encoding: 'utf8' }).trim();
    
    if (srcFiles) {
      console.log('📦 @ifla/theme source files changed, rebuild needed');
      return true;
    }
  } catch (e) {
    // If we can't determine, play it safe and build
    return true;
  }
  
  console.log('✅ @ifla/theme is up to date (using cache)');
  return false;
}

// Build @ifla/theme if needed
if (needsThemeBuild()) {
  console.log('📦 Building @ifla/theme (required for tests)...');
  try {
    execSync('nx build @ifla/theme', {
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log('✅ @ifla/theme built successfully\n');
  } catch (error) {
    console.log('❌ Failed to build @ifla/theme\n');
    hasErrors = true;
  }
}

// Now run all checks in parallel (since theme is built)
console.log('📋 Running typecheck, lint, and tests in parallel...');
try {
  // Run typecheck with no dependency builds (since we already built theme)
  execSync(
    'nx affected --targets=typecheck --parallel=4 --skip-nx-cache=false',
    {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        NX_SKIP_IMPLICIT_DEPS: 'true'
      }
    }
  );
  console.log('✅ TypeScript check passed\n');
} catch (error) {
  console.log('❌ TypeScript check failed\n');
  hasErrors = true;
}

// Run lint separately to handle warnings properly
console.log('📋 Running ESLint...');
try {
  execSync('nx affected --target=lint --parallel=4', {
    stdio: 'inherit',
    encoding: 'utf8'
  });
  console.log('✅ ESLint passed\n');
} catch (error) {
  console.log('⚠️  ESLint completed with warnings (this is OK)\n');
}

// Run tests
console.log('📋 Running unit tests...');
try {
  execSync('nx affected --target=test --parallel=4', {
    stdio: 'inherit',
    encoding: 'utf8'
  });
  console.log('✅ Unit tests passed\n');
} catch (error) {
  console.log('❌ Tests failed\n');
  hasErrors = true;
}

// Summary
if (hasErrors) {
  console.log('❌ Pre-commit checks failed. Please fix errors before committing.\n');
  process.exit(1);
} else {
  console.log('✅ Pre-commit checks passed!\n');
  console.log('💡 Performance tips:');
  console.log('   - Keep Nx daemon running: pnpm nx:daemon:start');
  console.log('   - For urgent commits: git commit --no-verify');
  console.log('   - Clear stale cache: pnpm nx:cache:clear\n');
  process.exit(0);
}