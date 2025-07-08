#!/usr/bin/env node

/**
 * Simple demo script for admin services integration
 * Starts admin services and portal site, then opens them in browser
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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.stdout.write('.');
  }
  return false;
}

// Open URL in default browser
async function openBrowser(url, preferChrome = false) {
  const platform = process.platform;
  let command;

  try {
    if (platform === 'darwin') {
      if (preferChrome) {
        // Try to open in Chrome specifically
        command = `open -a "Google Chrome" "${url}"`;
      } else {
        // Use default browser
        command = `open "${url}"`;
      }
    } else if (platform === 'win32') {
      // On Windows, use start command
      command = `start "" "${url}"`;
    } else {
      // On Linux, try xdg-open first
      command = `xdg-open "${url}"`;
    }
    
    await execAsync(command);
    log(`Opened ${url} in ${preferChrome ? 'Chrome' : 'default browser'}`);
  } catch (e) {
    // If Chrome isn't available, fall back to default browser
    if (preferChrome && platform === 'darwin') {
      try {
        await execAsync(`open "${url}"`);
        log(`Chrome not found, opened ${url} in default browser`);
      } catch (e2) {
        warning(`Could not open browser automatically. Please manually visit: ${url}`);
      }
    } else if (platform !== 'darwin' && platform !== 'win32') {
      try {
        await execAsync(`google-chrome "${url}" || chromium-browser "${url}" || chromium "${url}" || firefox "${url}"`);
      } catch (e2) {
        warning(`Could not open browser automatically. Please manually visit: ${url}`);
      }
    } else {
      warning(`Could not open browser automatically. Please manually visit: ${url}`);
    }
  }
}

async function main() {
  log('Starting admin services integration demo...');

  // Clean up any existing processes
  log('Cleaning up existing processes...');
  try {
    await execAsync('pnpm ports:kill');
  } catch (e) {
    // Ignore errors - ports might not be in use
  }

  warning('This will start two development servers:');
  warning('  • Admin Services: http://localhost:3007/services');
  warning('  • Portal Site: http://localhost:3000');
  console.log();

  // Start admin services
  log('Starting admin services...');
  const adminProcess = spawn('nx', ['dev', 'admin'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  // Start portal site
  log('Starting portal site...');
  const portalProcess = spawn('nx', ['start', 'portal'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { 
      ...process.env, 
      DOCS_ENV: 'local',
      BROWSER: 'none' // This might prevent auto-opening
    },
  });

  // Handle cleanup on exit
  const cleanup = () => {
    log('Cleaning up processes...');
    adminProcess.kill();
    portalProcess.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Wait for admin services to be ready
  log('Waiting for admin services to start...');
  const adminReady = await checkUrl('http://localhost:3007/services');
  console.log(); // New line after dots

  if (!adminReady) {
    error('Admin services failed to start after 30 seconds');
    cleanup();
    return;
  }
  success('Admin services are ready at http://localhost:3007/services');

  // Wait for portal site to be ready
  log('Waiting for portal site to start...');
  const portalReady = await checkUrl('http://localhost:3000');
  console.log(); // New line after dots

  if (!portalReady) {
    error('Portal site failed to start after 30 seconds');
    cleanup();
    return;
  }
  success('Portal site is ready at http://localhost:3000');

  // Small delay to ensure servers are fully initialized
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Open browser to admin page
  // Note: If the portal server auto-opens a browser tab to '/', we'll open '/admin' in Chrome
  log('Opening browser to admin page...');
  await openBrowser('http://localhost:3000/admin', true); // true = prefer Chrome

  success('Demo started successfully!');
  console.log();
  log('🎯 DEMO INSTRUCTIONS:');
  console.log(
    `  ${colors.green}1.${colors.reset} Visit the portal site: ${colors.blue}http://localhost:3000${colors.reset}`,
  );
  console.log(
    `  ${colors.green}2.${colors.reset} Navigate to the admin section: ${colors.blue}http://localhost:3000/admin${colors.reset}`,
  );
  console.log(
    `  ${colors.green}3.${colors.reset} Click ${colors.yellow}'Login with GitHub'${colors.reset} to authenticate`,
  );
  console.log(
    `  ${colors.green}4.${colors.reset} After login, you'll return to the portal admin interface`,
  );
  console.log();
  log('🔧 AUTHENTICATION FLOW:');
  console.log(
    `  ${colors.green}•${colors.reset} Portal UI at ${colors.blue}http://localhost:3000/admin${colors.reset}`,
  );
  console.log(
    `  ${colors.green}•${colors.reset} Auth services at ${colors.blue}http://localhost:3007/services${colors.reset}`,
  );
  console.log(
    `  ${colors.green}•${colors.reset} GitHub OAuth handled by admin services`,
  );
  console.log(
    `  ${colors.green}•${colors.reset} Session shared between portal and services`,
  );
  console.log();
  warning('Press Ctrl+C to stop the demo and clean up processes');

  // Keep processes running
  await new Promise(() => {}); // Run forever until interrupted
}

main().catch(error);
