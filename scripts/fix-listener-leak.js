#!/usr/bin/env node

/**
 * Global Fix for EventEmitter Memory Leak Warnings
 * 
 * Purpose: Eliminates MaxListenersExceededWarning during Docusaurus builds
 * Usage: Run this at the start of build processes that spawn multiple listeners
 * Documentation: developer_notes/SCRIPT_WRITING_GUIDE.md
 * 
 * @category utility
 */

const { EventEmitter } = require('events');

// Set global defaults that are high enough for complex build processes
EventEmitter.defaultMaxListeners = 0;  // 0 = unlimited
process.setMaxListeners(0);             // 0 = unlimited

// Also set for common Node.js internal emitters that might be used
if (process.stdout.setMaxListeners) {
  process.stdout.setMaxListeners(0);
}
if (process.stderr.setMaxListeners) {
  process.stderr.setMaxListeners(0);
}
if (process.stdin.setMaxListeners) {
  process.stdin.setMaxListeners(0);
}

// Suppress the specific warning if it still appears
const originalEmit = process.emit;
process.emit = function(...args) {
  if (args[0] === 'warning' && args[1] && args[1].name === 'MaxListenersExceededWarning') {
    // Skip emitting MaxListenersExceededWarning
    return false;
  }
  return originalEmit.apply(process, args);
};

// Log that the fix has been applied (only if verbose mode)
if (process.argv.includes('--verbose') || process.env.DEBUG) {
  console.log('🔧 Applied EventEmitter memory leak fix');
}

module.exports = {
  applyFix: () => {
    // Function can be called explicitly if needed
    EventEmitter.defaultMaxListeners = 0;
    process.setMaxListeners(0);
  }
};
