/**
 * Global Setup for Integration Tests
 * Starts only the servers required for integration tests
 */

import { chromium, type FullConfig } from '@playwright/test';
import { startServers } from '@ifla/dev-servers';
import { getRequiredSites } from '../scripts/test-server-manager';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up integration test environment...');
  
  // Determine which servers we need for integration tests
  const requiredSites = getRequiredSites('integration:all');
  console.log(`📝 Starting servers for integration tests: ${requiredSites.join(', ')}`);
  
  try {
    // Start servers in headless mode
    const serverInfo = await startServers({
      sites: requiredSites,
      mode: 'headless',
      reuseExisting: true,
    });
    
    console.log(`✅ Started ${Object.keys(serverInfo).length} servers for integration tests`);
    
    // Verify servers are responding
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Health check on key services
    const healthChecks = [
      { name: 'Portal', url: 'http://localhost:3000' },
      { name: 'Admin', url: 'http://localhost:3007' },
      { name: 'ISBDM', url: 'http://localhost:3001/ISBDM/' },
    ];
    
    for (const check of healthChecks) {
      try {
        console.log(`🔍 Health check: ${check.name}...`);
        await page.goto(check.url, { timeout: 15000 });
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        console.log(`✅ ${check.name} health check passed`);
      } catch (error) {
        console.warn(`⚠️  ${check.name} health check failed, but continuing:`, error);
      }
    }
    
    await page.close();
    await context.close();
    await browser.close();
    
    // Store server info for potential cleanup
    process.env.INTEGRATION_TEST_SERVERS = JSON.stringify(Object.keys(serverInfo));
    
  } catch (error) {
    console.error('❌ Failed to set up integration test environment:', error);
    throw error;
  }
}

export default globalSetup;
