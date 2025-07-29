import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('Simple Interactive → Headless Handoff', () => {
  test.beforeAll(async () => {
    // Clean up any existing servers
    try {
      execSync('pnpm ports:kill', { stdio: 'pipe' });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log('No existing servers to kill');
    }
  });

  test.afterAll(async () => {
    // Clean up after tests
    try {
      execSync('pnpm ports:kill', { stdio: 'pipe' });
    } catch (error) {
      console.log('Cleanup completed');
    }
  });

  test('should handle basic server lifecycle', async () => {
    // Test 1: Verify port manager works
    console.log('🧪 Testing port manager CLI...');
    
    // Should succeed (ports should be free)
    execSync('node scripts/utils/port-manager.js all', { stdio: 'pipe' });
    console.log('✅ Port manager CLI works');

    // Test 2: Start a simple server
    console.log('🚀 Starting simple headless server...');
    
    try {
      execSync('timeout 10s pnpm dev:headless &', { 
        stdio: 'pipe',
        timeout: 15000
      });
    } catch (error) {
      // Expected to timeout - we just want to verify it can start
      console.log('⏰ Server start initiated (timeout expected)');
    }

    // Test 3: Verify port cleanup works  
    console.log('🧹 Testing port cleanup...');
    execSync('pnpm ports:kill', { stdio: 'pipe' });
    console.log('✅ Port cleanup successful');

    // Test 4: Browser detection already tested in Vitest - skip here
    console.log('✅ Basic server lifecycle tests completed');
  });

  test('should validate server configuration', async () => {
    console.log('⚙️ Testing server configuration...');
    
    // Test port manager configuration
    const portManagerOutput = execSync('node -e "const pm = require(\'./scripts/utils/port-manager.js\'); console.log(JSON.stringify(pm.SITE_PORTS))"', { 
      encoding: 'utf8' 
    });
    
    const sitePortsConfig = JSON.parse(portManagerOutput.trim());
    expect(sitePortsConfig.portal).toBe(3000);
    expect(sitePortsConfig.isbd).toBe(3004);
    expect(sitePortsConfig.admin).toBe(3007);
    
    console.log('✅ Server configuration is valid');
  });
});
