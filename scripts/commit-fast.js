#!/usr/bin/env node

/**
 * Fast commit script - essential checks only
 * Performs minimal but critical validations:
 * - Secrets detection (security)
 * - Basic syntax check (prevents broken commits)
 * - Skips comprehensive tests and linting
 * 
 * Use for urgent commits when full validation would take too long
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');

console.log('⚡ Fast Commit - Essential Checks Only\n');

let hasErrors = false;

// Check for staged files
let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
  stagedFiles = output ? output.split('\n').filter(Boolean) : [];
} catch (error) {
  console.log('❌ Error checking staged files');
  process.exit(1);
}

if (stagedFiles.length === 0) {
  console.log('❌ No staged files found. Stage your changes first with: git add <files>');
  process.exit(1);
}

console.log(`📋 Found ${stagedFiles.length} staged files:`);
stagedFiles.forEach(file => console.log(`   - ${file}`));
console.log('');

// 1. CRITICAL: Secrets detection
console.log('🔒 Checking for secrets...');
try {
  execSync('node scripts/check-secrets-staged.js', { stdio: 'inherit' });
  console.log('✅ No secrets detected\n');
} catch (error) {
  console.log('❌ Secrets detected! This is a security risk.');
  console.log('🔧 Fix: Remove sensitive information from your files');
  console.log('💡 Help: Use pnpm check:secrets:fix to attempt automatic fixes\n');
  hasErrors = true;
}

// 2. CRITICAL: Basic TypeScript syntax check (fast)
const tsFiles = stagedFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
if (tsFiles.length > 0) {
  console.log('📝 Checking TypeScript syntax...');
  try {
    // Quick syntax check without full type checking
    execSync('npx tsc --noEmit --skipLibCheck --incremental false', { 
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout
    });
    console.log('✅ TypeScript syntax OK\n');
  } catch (error) {
    console.log('❌ TypeScript syntax errors found');
    console.log('🔧 Fix: Resolve syntax errors in your TypeScript files');
    console.log('💡 Help: Run pnpm typecheck for detailed errors\n');
    hasErrors = true;
  }
}

// 3. OPTIONAL: Basic lint check for critical issues only
const lintableFiles = stagedFiles.filter(f => 
  f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js') || f.endsWith('.jsx')
);

if (lintableFiles.length > 0) {
  console.log('🔍 Checking for critical lint issues...');
  try {
    // Only check for errors, not warnings, and only critical rules
    execSync(`npx eslint ${lintableFiles.map(f => `"${f}"`).join(' ')} --max-warnings 999 --quiet`, { 
      stdio: 'pipe',
      timeout: 20000 // 20 second timeout
    });
    console.log('✅ No critical lint errors\n');
  } catch (error) {
    // Only fail for actual errors, not warnings
    if (error.status === 1) {
      console.log('❌ Critical lint errors found');
      console.log('🔧 Fix: Resolve critical errors in your code');
      console.log('💡 Help: Run pnpm lint for detailed errors\n');
      hasErrors = true;
    } else {
      console.log('⚠️  Some lint warnings found (proceeding anyway)\n');
    }
  }
}

// Summary and commit
if (hasErrors) {
  console.log('❌ Fast commit failed - critical issues found');
  console.log('');
  console.log('🔧 Fix the issues above and try again');
  console.log('💡 For full validation: git commit (normal process)');
  console.log('⚠️  Only use --no-verify in absolute emergencies');
  process.exit(1);
} else {
  console.log('✅ Essential checks passed!');
  console.log('');
  console.log('⚠️  Note: This skipped comprehensive tests and full linting');
  console.log('🔄 Consider running full validation later: pnpm typecheck && pnpm test');
  console.log('');
  
  // Commit with a special environment variable to bypass normal pre-commit
  // but still allow emergency hooks if needed
  try {
    execSync('git commit', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        FAST_COMMIT: '1' // Signal to pre-commit hooks to run minimal checks
      }
    });
    console.log('✅ Fast commit successful!');
  } catch (error) {
    console.log('❌ Commit failed');
    process.exit(1);
  }
}