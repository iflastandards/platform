/**
 * Test Helper for On-Demand Server Management
 * 
 * Provides test fixtures that automatically start required servers
 */

import { test as base } from '@playwright/test';
import { ensureServersRunning, getRequiredServersForTest } from './server-manager';

// Extend the base test with server management
export const test = base.extend({
  // Auto-start servers based on test file path
  serverAutoStart: [async ({ }, use, testInfo) => {
    const testPath = testInfo.file || testInfo.titlePath.join('/');
    const requiredServers = getRequiredServersForTest(testPath);
    
    if (requiredServers.length > 0) {
      console.log(`📋 Test requires servers: ${requiredServers.join(', ')}`);
      await ensureServersRunning(requiredServers);
    }
    
    await use();
  }, { auto: true }],
});

// Helper to explicitly request specific servers
export async function withServers(servers: string[], testFn: () => Promise<void>) {
  await ensureServersRunning(servers);
  await testFn();
}

// Re-export expect for convenience
export { expect } from '@playwright/test';