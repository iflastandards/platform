#!/usr/bin/env node

/**
 * Simple demo script for admin portal integration
 * Starts admin-portal and newtest site, then opens them in browser
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

function log(message, color = 'blue') {
  console.log(`${colors[color]}[DEMO]${colors.reset} ${message}`);
}

function success(message) {
  console.log(`${colors.green}[SUCCESS]${colors.reset} ${message}`);
}

function error(message) {
  console.log(`${colors.red}[ERROR]${colors.reset} ${message}`);
}

function warning(message) {
  console.log(`${colors.yellow}[WARNING]${colors.reset} ${message}`);
}

// Check if URL is accessible
async function checkUrl(url, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch (e) {
      // URL not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.stdout.write('.');
  }
  return false;
}

// Open URL in Chrome specifically
async function openBrowser(url) {
  const platform = process.platform;
  let command;

  if (platform === 'darwin') {
    command = `open -a "Google Chrome" "${url}"`;
  } else if (platform === 'win32') {
    command = `start chrome "${url}"`;
  } else {
    // Linux
    command = `google-chrome "${url}" || chromium-browser "${url}" || chromium "${url}"`;
  }

  try {
    await execAsync(command);
  } catch (e) {
    warning(`Could not open Chrome automatically. Please visit: ${url}`);
    // Fallback to default browser
    try {
      if (platform === 'darwin') {
        await execAsync(`open "${url}"`);
      } else if (platform === 'win32') {
        await execAsync(`start "${url}"`);
      } else {
        await execAsync(`xdg-open "${url}"`);
      }
    } catch (e2) {
      warning(`Could not open any browser. Please manually visit: ${url}`);
    }
  }
}

async function main() {
  log('Starting admin portal integration demo...');
  
  // Clean up any existing processes
  log('Cleaning up existing processes...');
  try {
    await execAsync('pnpm ports:kill');
  } catch (e) {
    // Ignore errors - ports might not be in use
  }

  warning('This will start two development servers:');
  warning('  • Admin Portal: http://localhost:3007');
  warning('  • newtest Site: http://localhost:3008/newtest/');
  console.log();

  // Start admin portal
  log('Starting admin portal...');
  const adminProcess = spawn('nx', ['serve', 'admin-portal'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  // Start newtest site
  log('Starting newtest site...');
  const newtestProcess = spawn('nx', ['start', 'newtest'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, DOCS_ENV: 'local' }
  });

  // Handle cleanup on exit
  const cleanup = () => {
    log('Cleaning up processes...');
    adminProcess.kill();
    newtestProcess.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Wait for admin portal to be ready
  log('Waiting for admin portal to start...');
  const adminReady = await checkUrl('http://localhost:3007');
  console.log(); // New line after dots

  if (!adminReady) {
    error('Admin portal failed to start after 30 seconds');
    cleanup();
    return;
  }
  success('Admin portal is ready at http://localhost:3007');

  // Wait for newtest site to be ready
  log('Waiting for newtest site to start...');
  const newtestReady = await checkUrl('http://localhost:3008/newtest/');
  console.log(); // New line after dots

  if (!newtestReady) {
    error('newtest site failed to start after 30 seconds');
    cleanup();
    return;
  }
  success('newtest site is ready at http://localhost:3008/newtest/');

  // Open browsers
  log('Opening browsers...');
  await openBrowser('http://localhost:3008/newtest/');
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
  await openBrowser('http://localhost:3007');

  success('Demo started successfully!');
  console.log();
  log('🎯 DEMO INSTRUCTIONS:');
  console.log(`  ${colors.green}1.${colors.reset} Visit the newtest site: ${colors.blue}http://localhost:3008/newtest/${colors.reset}`);
  console.log(`  ${colors.green}2.${colors.reset} Look for the ${colors.yellow}'Manage Site'${colors.reset} button in the top-right navbar`);
  console.log(`  ${colors.green}3.${colors.reset} Click it to open the admin portal for this site`);
  console.log(`  ${colors.green}4.${colors.reset} Sign in with GitHub to access site management`);
  console.log();
  log('🔧 TESTING WORKFLOW:');
  console.log(`  ${colors.green}•${colors.reset} The navbar integration allows seamless admin access`);
  console.log(`  ${colors.green}•${colors.reset} Authentication is handled by NextAuth v5`);
  console.log(`  ${colors.green}•${colors.reset} Site owner gets automatic admin privileges`);
  console.log();
  warning('Press Ctrl+C to stop the demo and clean up processes');

  // Keep processes running
  await new Promise(() => {}); // Run forever until interrupted
}

main().catch(error);