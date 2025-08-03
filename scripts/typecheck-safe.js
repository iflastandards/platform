#!/usr/bin/env node

/**
 * Run typecheck with increased EventEmitter max listeners to prevent warnings
 */

const { spawn } = require('child_process');
const EventEmitter = require('events');

// Increase max listeners globally
EventEmitter.defaultMaxListeners = 20;
process.setMaxListeners(20);

// Get command arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node typecheck-safe.js <nx-command> [args...]');
  process.exit(1);
}

// Spawn the nx command with suppressed warnings
const child = spawn('pnpm', args, {
  stdio: ['inherit', 'inherit', 'pipe'], // Pipe stderr to filter warnings
  env: {
    ...process.env,
    NODE_OPTIONS: (process.env.NODE_OPTIONS || '') + ' --max-old-space-size=4096'
  }
});

// Filter stderr to remove MaxListeners warnings
child.stderr.on('data', (data) => {
  const output = data.toString();
  // Only show stderr that's not MaxListeners warnings
  if (!output.includes('MaxListenersExceededWarning')) {
    process.stderr.write(data);
  }
});

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (error) => {
  console.error('Error:', error);
  process.exit(1);
});