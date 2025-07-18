#!/usr/bin/env node

/**
 * Nx test runner that separates typecheck, lint, and test execution
 * This ensures tests run independently of typecheck/lint for better performance
 */

const { execSync } = require('child_process');
const { ensureDaemon } = require('./ensure-nx-daemon');
const args = process.argv.slice(2);

console.log('\n🧪 Running Nx tests...\n');

// Ensure nx daemon is running for better performance
ensureDaemon();

try {
  // Run tests with vitest configuration optimized for nx
  const command = `nx affected --target=test --parallel=3 ${args.join(' ')}`;
  execSync(command, {
    stdio: 'inherit',
    env: {
      ...process.env,
      // Use the nx-optimized vitest config
      VITEST_CONFIG: 'vitest.config.nx.ts'
    }
  });
  console.log('\n✅ Tests completed successfully\n');
  process.exit(0);
} catch (error) {
  console.log('\n❌ Tests failed\n');
  process.exit(1);
}