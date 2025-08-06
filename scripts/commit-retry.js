#!/usr/bin/env node

/**
 * Commit retry script for recovering from failed pre-commit hooks
 * Helps users recover from interrupted or failed commits
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../.git/pre-commit-state.json');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (error) {
    console.log(`⚠️  Could not load previous state: ${error.message}`);
  }
  return null;
}

function clearState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      fs.unlinkSync(STATE_FILE);
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
    return output ? output.split('\n').filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function main() {
  console.log('🔄 Git Commit Recovery Tool\n');

  const state = loadState();
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log('❌ No staged files found.');
    console.log('💡 Stage your files first with: git add <files>');
    process.exit(1);
  }

  console.log(`📋 Found ${stagedFiles.length} staged files:`);
  stagedFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');

  if (state) {
    console.log('🔍 Previous commit attempt found:');
    console.log(`   - Time: ${new Date(state.timestamp).toLocaleString()}`);
    console.log(`   - Last step: ${state.currentStep || 'unknown'}`);
    console.log(`   - Status: ${state.failed ? 'failed' : 'incomplete'}`);
    if (state.reason) {
      console.log(`   - Reason: ${state.reason}`);
    }
    console.log('');
  }

  console.log('🚀 Choose your commit strategy:');
  console.log('');
  console.log('1. 🔄 Retry with robust pre-commit checks (recommended)');
  console.log('   - Full validation with progress tracking');
  console.log('   - Better timeout handling');
  console.log('   - Command: git commit (will use robust checks)');
  console.log('');
  console.log('2. ⚡ Fast commit (essential checks only)');
  console.log('   - Secrets detection + basic syntax check');
  console.log('   - Skips comprehensive tests and linting');
  console.log('   - Command: pnpm commit:fast');
  console.log('');
  console.log('3. 🧹 Clear state and exit');
  console.log('   - Removes previous commit state');
  console.log('   - Use if you want to start fresh');
  console.log('');

  // Get user choice from command line args
  const choice = process.argv[2];
  
  if (choice === '1' || choice === 'retry') {
    console.log('🔄 Retrying commit with robust checks...');
    clearState();
    try {
      execSync('git commit', { stdio: 'inherit' });
      console.log('✅ Commit successful!');
    } catch (error) {
      console.log('❌ Commit failed. Try one of the other options.');
      process.exit(1);
    }
  } else if (choice === '2' || choice === 'fast') {
    console.log('⚡ Running fast commit...');
    clearState();
    try {
      execSync('pnpm commit:fast', { stdio: 'inherit' });
      console.log('✅ Fast commit successful!');
    } catch (error) {
      console.log('❌ Fast commit failed. Check for issues in your files.');
      process.exit(1);
    }
  } else if (choice === '3' || choice === 'clear') {
    console.log('🧹 Clearing previous state...');
    clearState();
    console.log('✅ State cleared. You can now run git commit normally.');
  } else {
    console.log('Usage: node scripts/commit-retry.js [1|retry|2|fast|3|clear]');
    console.log('');
    console.log('Or run interactively without arguments and follow the prompts.');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/commit-retry.js retry   # Retry with robust checks');
    console.log('  node scripts/commit-retry.js fast    # Fast commit (essential checks)');
    console.log('  node scripts/commit-retry.js clear   # Clear state');
  }
}

if (require.main === module) {
  main();
}