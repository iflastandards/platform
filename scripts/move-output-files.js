#!/usr/bin/env node

/**
 * Move .output.txt files from root to tmp directory
 * This handles output files created by command overflow in development environments
 */

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const tmpDir = path.join(rootDir, 'tmp');
const outputFile = path.join(rootDir, '.output.txt');

function moveOutputFile() {
  // Check if .output.txt exists in root
  if (!fs.existsSync(outputFile)) {
    console.log('No .output.txt file found in root directory.');
    return;
  }

  // Ensure tmp directory exists
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // Create timestamped filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const targetFile = path.join(tmpDir, `output-${timestamp}.txt`);

  try {
    // Move the file
    fs.renameSync(outputFile, targetFile);
    console.log(`✅ Moved .output.txt to ${path.relative(rootDir, targetFile)}`);
  } catch (error) {
    console.error(`❌ Error moving .output.txt: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  moveOutputFile();
}

module.exports = { moveOutputFile };
