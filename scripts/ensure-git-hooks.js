#!/usr/bin/env node
/**
 * Ensures all Husky git hooks are properly installed
 * This is needed because Husky v9 changed how hooks are installed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Ensuring git hooks are properly installed...\n');

const huskyDir = path.join(process.cwd(), '.husky');
const gitHooksDir = path.join(process.cwd(), '.git/hooks');

// Check if .husky directory exists
if (!fs.existsSync(huskyDir)) {
  console.error('❌ .husky directory not found');
  process.exit(1);
}

// Get all hook files from .husky directory
const hookFiles = fs.readdirSync(huskyDir)
  .filter(file => {
    const filePath = path.join(huskyDir, file);
    return fs.statSync(filePath).isFile() && 
           file !== '_' && 
           !file.includes('.');
  });

console.log(`Found ${hookFiles.length} hook(s) in .husky directory:\n`);

// Create symlinks for each hook
let created = 0;
let updated = 0;
let skipped = 0;

hookFiles.forEach(hook => {
  const huskyHookPath = path.join(huskyDir, hook);
  const gitHookPath = path.join(gitHooksDir, hook);
  
  try {
    // Check if hook already exists
    if (fs.existsSync(gitHookPath)) {
      const stats = fs.lstatSync(gitHookPath);
      if (stats.isSymbolicLink()) {
        const linkTarget = fs.readlinkSync(gitHookPath);
        const expectedTarget = path.relative(gitHooksDir, huskyHookPath);
        
        if (linkTarget === expectedTarget) {
          console.log(`✅ ${hook}: Already properly linked`);
          skipped++;
          return;
        } else {
          console.log(`🔄 ${hook}: Updating symlink`);
          fs.unlinkSync(gitHookPath);
          updated++;
        }
      } else {
        console.log(`⚠️  ${hook}: Removing non-symlink file`);
        fs.unlinkSync(gitHookPath);
        updated++;
      }
    }
    
    // Create symlink
    const relativeHuskyPath = path.relative(gitHooksDir, huskyHookPath);
    fs.symlinkSync(relativeHuskyPath, gitHookPath);
    console.log(`✅ ${hook}: Created symlink`);
    created++;
    
  } catch (error) {
    console.error(`❌ ${hook}: Failed to create symlink - ${error.message}`);
  }
});

console.log(`
Summary:
- Created: ${created} new hook(s)
- Updated: ${updated} existing hook(s)
- Skipped: ${skipped} already correct hook(s)
`);

// Verify installation
console.log('🔍 Verifying installation...\n');

hookFiles.forEach(hook => {
  const gitHookPath = path.join(gitHooksDir, hook);
  if (fs.existsSync(gitHookPath) && fs.lstatSync(gitHookPath).isSymbolicLink()) {
    console.log(`✅ ${hook} is properly installed`);
  } else {
    console.log(`❌ ${hook} is NOT properly installed`);
  }
});

console.log('\n✨ Git hooks setup complete!');