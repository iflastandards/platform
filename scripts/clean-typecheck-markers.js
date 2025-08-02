#!/usr/bin/env node
/**
 * Clean up typecheck marker files from the tmp directory
 * These files are created by the typecheck process to track completion
 * but should be cleaned periodically to avoid accumulation
 */

const fs = require('fs');
const path = require('path');

const tmpDir = path.join(process.cwd(), 'tmp');

// Only proceed if tmp directory exists
if (fs.existsSync(tmpDir)) {
  try {
    const files = fs.readdirSync(tmpDir);
    const typecheckMarkers = files.filter(f => f.startsWith('typecheck-') && f.endsWith('.done'));
    
    if (typecheckMarkers.length > 0) {
      console.log(`Found ${typecheckMarkers.length} typecheck marker files`);
      
      typecheckMarkers.forEach(file => {
        const filePath = path.join(tmpDir, file);
        fs.unlinkSync(filePath);
        console.log(`  Removed: ${file}`);
      });
      
      console.log('✅ Cleanup complete');
    } else {
      console.log('No typecheck marker files found');
    }
    
    // Remove tmp directory if empty
    const remainingFiles = fs.readdirSync(tmpDir);
    if (remainingFiles.length === 0) {
      fs.rmdirSync(tmpDir);
      console.log('Removed empty tmp directory');
    }
  } catch (error) {
    console.error('Error during cleanup:', error.message);
    process.exit(1);
  }
} else {
  console.log('No tmp directory found - nothing to clean');
}