#!/usr/bin/env node

/**
 * Run tests for a specific site with its own server
 */

// Increase EventEmitter listener limit to handle server processes
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

const { execSync } = require('child_process');
const path = require('path');

// Site configurations
const siteConfigs = {
  'portal': { port: 3000, command: 'nx run portal:start:robust' },
  'isbdm': { port: 3001, command: 'nx run isbdm:start:robust' },
  'lrm': { port: 3002, command: 'nx run lrm:start:robust' },
  'frbr': { port: 3003, command: 'nx run frbr:start:robust' },
  'isbd': { port: 3004, command: 'nx run isbd:start:robust' },
  'muldicat': { port: 3005, command: 'nx run muldicat:start:robust' },
  'unimarc': { port: 3006, command: 'nx run unimarc:start:robust' },
  'admin': { port: 3007, command: 'nx run admin:dev' }
};

const site = process.argv[2];
const testType = process.argv[3] || 'smoke';

if (!site || !siteConfigs[site.toLowerCase()]) {
  console.error('Usage: node run-site-tests.js <site> [test-type]');
  console.error('Available sites:', Object.keys(siteConfigs).join(', '));
  process.exit(1);
}

const config = siteConfigs[site.toLowerCase()];
console.log(`🧪 Running ${testType} tests for ${site}...`);

// Enhanced execSync wrapper to ensure proper EventEmitter limits
function safeExecSync(command, options = {}) {
  const defaultOptions = {
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    ...options
  };
  
  // Set EventEmitter limits in the current process
  if (typeof process.setMaxListeners === 'function') {
    process.setMaxListeners(0);
  }
  
  return execSync(command, defaultOptions);
}

// Kill the port first
console.log(`🧹 Cleaning port ${config.port}...`);
try {
  safeExecSync(`lsof -ti:${config.port} | xargs kill -9`, { stdio: 'pipe' });
} catch (e) {
  // Port might not be in use
}

// Start the server
console.log(`🚀 Starting ${site} server on port ${config.port}...`);
const serverProcess = require('child_process').spawn('pnpm', ['exec', ...config.command.split(' ')], {
  detached: false,
  stdio: 'pipe',
  env: {
    ...process.env,
    NODE_OPTIONS: '--max-old-space-size=4096'
  }
});

// Wait for server to be ready
console.log(`⏳ Waiting for server to be ready...`);
const maxAttempts = site === 'admin' ? 60 : 30; // Admin takes much longer to start
let ready = false;

for (let i = 0; i < maxAttempts; i++) {
  try {
    // For admin, check the health endpoint with basePath
    const checkUrl = site === 'admin' 
      ? `http://localhost:${config.port}/admin/api/health`
      : `http://localhost:${config.port}`;
    
    safeExecSync(`curl -s -o /dev/null -w "%{http_code}" ${checkUrl} | grep -q "200\\|301\\|302"`, {
      stdio: 'pipe'
    });
    ready = true;
    break;
  } catch (e) {
    if (i % 5 === 0 && i > 0) {
      console.log(`  Still waiting... (${i}/${maxAttempts})`);
    }
    safeExecSync('sleep 1', { stdio: 'pipe' });
  }
}

if (!ready) {
  console.error(`❌ Server failed to start on port ${config.port}`);
  serverProcess.kill();
  process.exit(1);
}

console.log(`✅ Server ready on port ${config.port}`);

// Run tests with SKIP_SERVER_SETUP to prevent global setup
let testCommand = `SKIP_SERVER_SETUP=true AFFECTED_SITES="${site}" pnpm exec playwright test --config=playwright.config.pre-push.ts `;

// Add appropriate test files based on test type
if (testType === 'smoke') {
  if (site === 'portal') {
    testCommand += 'e2e/portal-smoke.spec.ts';
  } else {
    // Use the existing standards-smoke.spec.ts but filter tests using grep
    testCommand += `e2e/standards-smoke.spec.ts --grep "${site.toUpperCase()}"`;
  }
} else if (testType === 'e2e') {
  if (site === 'admin') {
    testCommand += 'e2e/admin/**/*.spec.ts e2e/admin-*.spec.ts';
  } else if (site === 'portal') {
    // For portal E2E, only run portal-specific tests and portal validation
    testCommand += `e2e/portal-*.spec.ts e2e/site-validation.spec.ts --grep "portal"`;
  }
} else if (testType === 'validation') {
  testCommand += `e2e/site-validation*.spec.ts --grep "${site}"`;
}

console.log(`📝 Running: ${testCommand}`);

// Run tests
let exitCode = 0;
try {
  safeExecSync(testCommand, { 
    stdio: 'inherit', 
    timeout: 600000 // 10 minutes timeout
  });
  console.log(`✅ ${site} tests passed`);
} catch (error) {
  console.log(`❌ ${site} tests failed`);
  exitCode = 1;
}

// Clean up
console.log(`🧹 Cleaning up ${site} server...`);
serverProcess.kill();

// Kill the port again to be sure
try {
  safeExecSync(`lsof -ti:${config.port} | xargs kill -9`, { stdio: 'pipe' });
} catch (e) {
  // Ignore
}

process.exit(exitCode);