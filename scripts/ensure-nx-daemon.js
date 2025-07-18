#!/usr/bin/env node

/**
 * Ensures the Nx daemon is running before executing commands
 * This improves performance significantly for all Nx operations
 */

const { execSync, spawn } = require('child_process');

// Simple color functions for terminal output
const colors = {
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`
};

function isDaemonRunning() {
  try {
    const result = execSync('nx daemon --status', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    return result.includes('Daemon is running') || result.includes('Process ID');
  } catch (error) {
    return false;
  }
}

function startDaemon() {
  console.log(colors.yellow('🚀 Starting Nx daemon for better performance...'));
  try {
    // Start daemon in background
    execSync('nx daemon --start', { 
      stdio: 'inherit',
      detached: true 
    });
    
    // Give it a moment to start
    setTimeout(() => {
      console.log(colors.green('✅ Nx daemon started successfully'));
    }, 1000);
    
    return true;
  } catch (error) {
    console.error(colors.red('❌ Failed to start Nx daemon:'), error.message);
    return false;
  }
}

function ensureDaemon() {
  if (!isDaemonRunning()) {
    console.log(colors.yellow('⚠️  Nx daemon is not running'));
    return startDaemon();
  } else {
    console.log(colors.green('✅ Nx daemon is already running'));
    return true;
  }
}

// If called directly, just ensure daemon is running
if (require.main === module) {
  const daemonStarted = ensureDaemon();
  process.exit(daemonStarted ? 0 : 1);
}

module.exports = { ensureDaemon, isDaemonRunning, startDaemon };