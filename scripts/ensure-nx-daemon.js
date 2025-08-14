#!/usr/bin/env node

/**
 * Ensures the Nx daemon is running before executing commands
 * This improves performance significantly for all Nx operations
 */

// Increase EventEmitter listener limit to handle daemon processes
// NOTE: This is a fallback - main scripts should set this at the very top before any requires
// This ensures it works even if this module is required late in the execution
process.setMaxListeners(0); // 0 = unlimited listeners
const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 50;

// Capture and suppress specific EventEmitter warnings if needed
const originalEmit = process.emit;
process.emit = function (name, data, ...args) {
  if (name === 'warning' && data && data.name === 'MaxListenersExceededWarning') {
    // Suppress the warning - we've already handled it
    return false;
  }
  return originalEmit.apply(process, [name, data, ...args]);
};

const { execSync, spawn } = require('child_process');

// Simple color functions for terminal output
const colors = {
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`
};

// Cache the daemon status to avoid repeated checks
// The daemon persists between script runs, so we can cache this safely
let daemonStatusCache = null;
let lastCheckTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

// Environment variable to track if we've already ensured the daemon in this session
const DAEMON_CHECK_KEY = 'NX_DAEMON_CHECKED';

function isDaemonRunning() {
  // Use cached result if it's recent
  const now = Date.now();
  if (daemonStatusCache !== null && (now - lastCheckTime) < CACHE_DURATION) {
    return daemonStatusCache;
  }

  try {
    const result = execSync('pnpm nx daemon --status', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });
    daemonStatusCache = result.includes('Daemon is running') || result.includes('Process ID');
    lastCheckTime = now;
    return daemonStatusCache;
  } catch (error) {
    daemonStatusCache = false;
    lastCheckTime = now;
    return false;
  }
}

function startDaemon() {
  console.log(colors.yellow('🚀 Starting Nx daemon for better performance...'));
  try {
    // Start daemon in background
    execSync('pnpm nx daemon --start', { 
      stdio: 'inherit',
      detached: true,
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=4096'
      }
    });
    
    // Clear cache to force recheck
    daemonStatusCache = null;
    
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
  // With useDaemonProcess: true in nx.json, Nx will auto-start the daemon
  // We only need to check if it's not running for some reason
  
  // Skip check if we've already verified in this session
  if (process.env[DAEMON_CHECK_KEY] === 'true') {
    return true;
  }
  
  // Check if daemon is running
  if (!isDaemonRunning()) {
    console.log(colors.yellow('⚠️  Nx daemon is not running'));
    const started = startDaemon();
    if (started) {
      process.env[DAEMON_CHECK_KEY] = 'true';
    }
    return started;
  }
  
  // Mark as checked for this session
  process.env[DAEMON_CHECK_KEY] = 'true';
  
  // Silent success - no need to log every time when it's already running
  // This reduces noise in the console output
  if (process.env.VERBOSE === 'true' || process.env.DEBUG === 'true') {
    console.log(colors.green('✅ Nx daemon is already running'));
  }
  
  return true;
}

// Lightweight check function that trusts Nx to manage its own daemon
// Use this instead of ensureDaemon() when you just want Nx to handle it
function trustNxDaemon() {
  // Since nx.json has useDaemonProcess: true, Nx will start the daemon automatically
  // This function is a no-op but provided for backward compatibility
  return true;
}

// If called directly, just ensure daemon is running
if (require.main === module) {
  const daemonStarted = ensureDaemon();
  process.exit(daemonStarted ? 0 : 1);
}

module.exports = { ensureDaemon, isDaemonRunning, startDaemon, trustNxDaemon };