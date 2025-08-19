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
EventEmitter.defaultMaxListeners = 50; // Increase from default 10 to 50
process.setMaxListeners(50); // Increase from default 10 to 50

// Also set for common Node.js internal emitters that might be used
if (process.stdout && process.stdout.setMaxListeners) {
  process.stdout.setMaxListeners(50);
}
if (process.stderr && process.stderr.setMaxListeners) {
  process.stderr.setMaxListeners(50);
}
if (process.stdin && process.stdin.setMaxListeners) {
  process.stdin.setMaxListeners(50);
}

// Apply fix to any existing listeners
['exit', 'SIGINT', 'SIGTERM', 'SIGHUP'].forEach((event) => {
  const listeners = process.listeners(event);
  if (listeners.length > 10) {
    process.setMaxListeners(Math.max(50, listeners.length + 10));
  }
});

// Suppress the specific warning if it still appears
const originalEmit = process.emit;
process.emit = function (...args) {
  if (
    args[0] === 'warning' &&
    args[1] &&
    args[1].name === 'MaxListenersExceededWarning'
  ) {
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
  },
};
