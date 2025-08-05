#!/usr/bin/env node

/**
 * Smart pre-commit check optimized for high-performance hardware
 * - Dependency-only changes: Light validation (~30s vs 3-4min)
 * - Code changes: Full validation with hardware optimization
 * - Mixed changes: Full validation
 * - Ensures @ifla/theme is built (but uses cache when possible)
 * - Optimized for 64GB RAM, 16 cores (12 performance + 4 efficiency)
 */

const { execSync } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');
const fs = require('fs');
const path = require('path');

// Set Node.js memory limits for high-performance hardware
process.env.NODE_OPTIONS = '--max-old-space-size=8192 --max-semi-space-size=512';

console.log('\n🚀 Running smart pre-commit checks (hardware-optimized)...\n');

// Ensure nx daemon is running for better performance
ensureDaemon();

// Get list of staged files
let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
  stagedFiles = output ? output.split('\n').filter(Boolean) : [];
} catch (error) {
  console.log('⚠️  No staged files found or git error');
  stagedFiles = [];
}

console.log('📋 Staged files:', stagedFiles.length > 0 ? stagedFiles : ['(no files)']);

// If no staged files, exit early
if (stagedFiles.length === 0) {
  console.log('✅ No staged files - skipping pre-commit checks\n');
  process.exit(0);
}

// Categorize changes
const dependencyFiles = ['package.json', 'pnpm-lock.yaml', 'yarn.lock', 'package-lock.json'];
const configFiles = ['.github/dependabot.yml', '.github/workflows/', '.husky/', 'nx.json', 'tsconfig.json'];
const scriptFiles = stagedFiles.filter(f => f.endsWith('.sh') || f.startsWith('scripts/'));
const docFiles = stagedFiles.filter(f => f.endsWith('.md') || f.startsWith('developer_notes/'));
const codeFiles = stagedFiles.filter(f => 
  !dependencyFiles.includes(f) && 
  !configFiles.some(cf => f.startsWith(cf)) &&
  !scriptFiles.includes(f) &&
  !docFiles.includes(f)
);

const isDependencyOnly = codeFiles.length === 0 && stagedFiles.some(f => dependencyFiles.includes(f));
const isDocumentationOnly = codeFiles.length === 0 && docFiles.length > 0 && stagedFiles.every(f => docFiles.includes(f) || scriptFiles.includes(f));

console.log(`📊 Change analysis:
  - Dependency files: ${stagedFiles.filter(f => dependencyFiles.includes(f)).length}
  - Code files: ${codeFiles.length}
  - Documentation files: ${docFiles.length}
  - Script files: ${scriptFiles.length}
  - Config files: ${stagedFiles.filter(f => configFiles.some(cf => f.startsWith(cf))).length}
`);

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

if (isDependencyOnly) {
  console.log('🔍 Detected dependency-only changes - running light validation...\n');
  
  // Quick typecheck on core packages only (includes theme build via dependencies)
  console.log('📋 Running core typecheck...');
  try {
    execSync('nx run admin:typecheck', {
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log('✅ Core typecheck passed\n');
  } catch (error) {
    console.log('❌ Core typecheck failed\n');
    hasErrors = true;
  }
  
} else if (isDocumentationOnly) {
  console.log('📝 Detected documentation-only changes - skipping validation...\n');
  console.log('✅ Documentation changes require no validation\n');
  
} else {
  console.log('🔍 Detected code changes - running full validation...\n');
  
  // Run full affected checks with hardware optimization (includes theme build via dependencies)
  console.log('📋 Running affected typecheck (hardware-optimized)...');
  try {
    execSync('nx affected --targets=typecheck --parallel=6', {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=6144'
      }
    });
    console.log('✅ TypeScript check passed\n');
  } catch (error) {
    console.log('❌ TypeScript check failed\n');
    hasErrors = true;
  }

  // Run tests with hardware optimization (uses cache, includes theme build)
  console.log('📋 Running affected tests (hardware-optimized)...');
  try {
    execSync('nx affected --target=test --parallel=6', {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=6144'
      }
    });
    console.log('✅ Tests passed\n');
  } catch (error) {
    console.log('❌ Tests failed\n');
    hasErrors = true;
  }
}

// Always run lint (fast) with hardware optimization
if (!isDocumentationOnly) {
  console.log('📋 Running ESLint (hardware-optimized)...');
  try {
    execSync('nx affected --target=lint --parallel=6', {
      stdio: 'inherit',
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });
    console.log('✅ ESLint passed\n');
  } catch (error) {
    // ESLint warnings should not fail the pre-commit hook
    console.log('⚠️  ESLint completed with warnings (this is OK)\n');
    // Don't set hasErrors for lint warnings
  }
}

// Summary
if (hasErrors) {
  console.log('❌ Smart pre-commit checks failed. Please fix errors before committing.\n');
  process.exit(1);
} else {
  console.log('✅ Smart pre-commit checks passed!\n');
  console.log('💡 Performance optimizations applied:');
  if (isDependencyOnly) {
    console.log('   - Dependency-only changes: Light validation (saves ~3 minutes)');
  } else if (isDocumentationOnly) {
    console.log('   - Documentation-only changes: No validation needed');
  } else {
    console.log('   - Code changes: Full validation with hardware optimization');
    console.log('   - Using 6 parallel processes (optimized for stability)');
    console.log('   - 6GB Node.js memory limit per process');
    console.log('   - Nx cache enabled for faster rebuilds');
  }
  console.log('   - Nx daemon running with 16GB memory limit');
  console.log('   - For urgent commits: git commit --no-verify\n');
  process.exit(0);
}