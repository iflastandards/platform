#!/usr/bin/env node

/**
 * Test runner that ensures nx daemon is running before executing tests
 * This wrapper can be used for any test command to guarantee daemon is active
 */

const { execSync } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');

// Ensure nx daemon is running
ensureDaemon();

// Execute the test command
// Skip platform project to avoid redundant test runs
try {
  execSync(
    'pnpm dev:headless && pnpm nx affected --target=test --parallel=3 --skip-nx-cache --exclude=platform',
    {
      stdio: 'inherit',
      env: process.env,
    },
  );
  process.exit(0);
} catch (error) {
  process.exit(1);
}
