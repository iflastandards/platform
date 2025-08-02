#!/usr/bin/env node

/**
 * Clean typecheck script to resolve flaky typecheck issues
 * Implements strategic recommendations for reliable TypeScript checking
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Clean TypeScript Check - Ensuring Reliable Results\n');

// Parse command line arguments
const args = process.argv.slice(2);
const isCI = args.includes('--ci') || process.env.CI === 'true';
const skipClean = args.includes('--skip-clean');
const all = args.includes('--all');

// Step 1: Clean caches and build artifacts (unless skipped)
if (!skipClean) {
  console.log('📦 Step 1: Cleaning caches and artifacts...');
  
  try {
    // Reset Nx cache
    console.log('  - Resetting Nx cache...');
    execSync('pnpm nx reset', { stdio: 'inherit' });
    
    // Clean TypeScript build info files
    console.log('  - Removing TypeScript build info files...');
    execSync('find . -name "tsconfig.tsbuildinfo" -type f -delete 2>/dev/null || true', { 
      stdio: 'pipe',
      encoding: 'utf8' 
    });
    
    // Clean node_modules/.cache if it exists
    const nodeModulesCache = path.join(process.cwd(), 'node_modules', '.cache');
    if (fs.existsSync(nodeModulesCache)) {
      console.log('  - Cleaning node_modules/.cache...');
      execSync(`rm -rf ${nodeModulesCache}`, { stdio: 'pipe' });
    }
    
    // Clean dist directories
    console.log('  - Cleaning dist directories...');
    execSync('find . -name "dist" -type d -not -path "./node_modules/*" -exec rm -rf {} + 2>/dev/null || true', {
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log('✅ Clean completed\n');
  } catch (error) {
    console.error('⚠️  Clean step encountered errors (continuing):', error.message);
  }
}

// Step 2: Ensure dependencies are in sync
console.log('📦 Step 2: Ensuring dependencies are in sync...');
try {
  if (isCI) {
    console.log('  - CI environment detected, skipping dependency check');
  } else {
    console.log('  - Verifying pnpm lockfile integrity...');
    execSync('pnpm install --frozen-lockfile --ignore-scripts', { 
      stdio: 'pipe',
      encoding: 'utf8' 
    });
    console.log('✅ Dependencies verified\n');
  }
} catch (error) {
  console.error('❌ Dependency check failed:', error.message);
  process.exit(1);
}

// Step 3: Run typecheck with --skip-nx-cache
console.log('🔍 Step 3: Running typecheck with cache disabled...');

let hasErrors = false;
const startTime = Date.now();

try {
  const command = all 
    ? 'pnpm nx run-many --target=typecheck --all --parallel=3 --skip-nx-cache'
    : 'pnpm nx affected --target=typecheck --parallel=3 --skip-nx-cache';
    
  console.log(`  - Command: ${command}`);
  console.log('  - This ensures complete type checking without cache interference\n');
  
  execSync(command, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096',
      // Ensure TypeScript uses fresh state
      TSC_COMPILE_ON_ERROR: 'false'
    }
  });
  
  console.log('\n✅ TypeScript check passed!');
} catch (error) {
  console.log('\n❌ TypeScript check failed');
  hasErrors = true;
}

const duration = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n⏱️  Duration: ${duration}s`);

// Step 4: Provide diagnostic information
if (hasErrors || args.includes('--diagnostics')) {
  console.log('\n📊 Diagnostic Information:');
  
  // Check for TypeScript version consistency
  try {
    const tsVersion = execSync('pnpm tsc --version', { encoding: 'utf8' }).trim();
    console.log(`  - TypeScript version: ${tsVersion}`);
  } catch (e) {
    console.log('  - TypeScript version: Unable to determine');
  }
  
  // Check for .tsbuildinfo files
  try {
    const buildInfoFiles = execSync('find . -name "tsconfig.tsbuildinfo" -type f 2>/dev/null | wc -l', {
      encoding: 'utf8'
    }).trim();
    console.log(`  - Build info files found: ${buildInfoFiles}`);
  } catch (e) {
    console.log('  - Build info files: Unable to count');
  }
  
  // Check Nx daemon status
  try {
    const daemonStatus = execSync('pnpm nx daemon --status', { encoding: 'utf8' });
    console.log(`  - Nx daemon: ${daemonStatus.includes('running') ? 'Running' : 'Not running'}`);
  } catch (e) {
    console.log('  - Nx daemon: Status unknown');
  }
}

// Step 5: Recommendations
if (hasErrors) {
  console.log('\n💡 Troubleshooting Recommendations:');
  console.log('  1. Run with --skip-clean to see if it\'s a cache issue');
  console.log('  2. Check for cyclic dependencies with: pnpm nx graph');
  console.log('  3. Ensure all tsconfig.json files have consistent settings');
  console.log('  4. Try running individual project typechecks to isolate issues');
  console.log('  5. Check for duplicate type definitions in node_modules');
  console.log('\n📚 For persistent issues, run: pnpm typecheck:diagnose');
}

process.exit(hasErrors ? 1 : 0);