/**
 * On-Demand Global Setup for Tests
 * 
 * This setup:
 * 1. Does NOT start all servers upfront
 * 2. Lets individual tests request the servers they need
 * 3. Reuses already-running servers
 * 4. Leaves servers running for subsequent tests
 */

import { type FullConfig } from '@playwright/test';
import { getServerStatus } from './utils/server-manager';

async function globalSetup(config: FullConfig) {
  console.log('🎭 Playwright On-Demand Server Setup');
  console.log('📋 Servers will be started as needed by individual tests');
  console.log('♻️  Existing servers will be reused when possible');
  console.log('');
  
  // Show current server status
  await getServerStatus();
  
  console.log('');
  console.log('✅ Ready to run tests with on-demand server management');
  
  // No teardown needed - servers stay running
  return async () => {
    console.log('🎭 Tests complete - servers left running for reuse');
    console.log('💡 Run "pnpm test:servers stop" to stop all servers');
  };
}

export default globalSetup;