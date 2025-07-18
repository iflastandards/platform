#!/usr/bin/env node

/**
 * Health check for Nx daemon
 * Can be run periodically to ensure daemon stays healthy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Simple color functions for terminal output
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

// Load configuration
const configPath = path.join(__dirname, '..', '.nxdaemonrc');
let config = {
  autoStart: true,
  ensureRunning: true,
  restartOnFailure: true
};

if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.warn('Failed to load .nxdaemonrc');
  }
}

function getDaemonStatus() {
  try {
    const output = execSync('nx daemon --status', { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    if (output.includes('Daemon is running')) {
      const pidMatch = output.match(/Process ID:\s*(\d+)/);
      const pid = pidMatch ? pidMatch[1] : 'unknown';
      return { running: true, pid, healthy: true };
    }
    
    return { running: false, healthy: false };
  } catch (error) {
    return { running: false, healthy: false, error: error.message };
  }
}

function checkDaemonHealth() {
  const status = getDaemonStatus();
  
  console.log(colors.blue('\n🏥 Nx Daemon Health Check\n'));
  console.log(colors.gray('=' .repeat(40)));
  
  if (status.running) {
    console.log(colors.green('✅ Status: RUNNING'));
    console.log(colors.green(`✅ Process ID: ${status.pid}`));
    
    // Check cache directory
    try {
      const cacheDir = path.join(process.cwd(), '.nx', 'cache');
      if (fs.existsSync(cacheDir)) {
        const stats = fs.statSync(cacheDir);
        console.log(colors.green(`✅ Cache directory exists`));
        console.log(colors.gray(`   Last modified: ${stats.mtime.toLocaleString()}`));
      }
    } catch (e) {
      console.log(colors.yellow('⚠️  Could not check cache directory'));
    }
    
    // Check daemon socket
    try {
      const socketPath = path.join(process.cwd(), '.nx', 'daemon.socket');
      if (fs.existsSync(socketPath)) {
        console.log(colors.green('✅ Daemon socket exists'));
      }
    } catch (e) {
      // Socket might not be accessible
    }
    
  } else {
    console.log(colors.red('❌ Status: NOT RUNNING'));
    if (status.error) {
      console.log(colors.red(`❌ Error: ${status.error}`));
    }
    
    if (config.autoStart && config.ensureRunning) {
      console.log(colors.yellow('\n🔄 Attempting to start daemon...'));
      try {
        execSync('nx daemon --start', { stdio: 'inherit' });
        console.log(colors.green('✅ Daemon started successfully'));
      } catch (e) {
        console.log(colors.red('❌ Failed to start daemon'));
      }
    }
  }
  
  console.log(colors.gray('=' .repeat(40)));
  
  // Performance tips
  console.log(colors.blue('\n💡 Performance Tips:'));
  console.log(colors.gray('• Keep daemon running: pnpm nx:daemon:start'));
  console.log(colors.gray('• Clear cache if issues: pnpm nx:cache:clear'));
  console.log(colors.gray('• Check performance: pnpm nx:performance'));
  console.log(colors.gray('• Monitor operations: pnpm nx:monitor'));
  
  return status.running;
}

// Run health check
const isHealthy = checkDaemonHealth();
process.exit(isHealthy ? 0 : 1);