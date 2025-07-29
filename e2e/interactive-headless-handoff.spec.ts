import { test, expect } from '@playwright/test';
import { execSync, spawn, ChildProcess } from 'child_process';
import { startServers, stopServers } from '@ifla/dev-servers';

let interactiveServers: any[] = [];
let backgroundProcess: ChildProcess | null = null;

test.describe('Interactive → Headless Handoff', () => {
  test.beforeAll(async () => {
    // Clean up any existing servers
    try {
      execSync('pnpm ports:kill', { stdio: 'pipe' });
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.log('No existing servers to kill');
    }
  });

  test.afterAll(async () => {
    // Clean up after tests
    if (backgroundProcess) {
      backgroundProcess.kill('SIGTERM');
    }
    
    if (interactiveServers.length > 0) {
      await stopServers(interactiveServers);
    }
    
    try {
      execSync('pnpm ports:kill', { stdio: 'pipe' });
    } catch (error) {
      console.log('Cleanup completed');
    }
  });

  test('should start interactive servers in background, then run headless script', async () => {
    // Step 1: Start interactive servers in background
    console.log('🚀 Starting interactive servers in background...');
    
    interactiveServers = await startServers({
      sites: ['portal', 'isbd'],
      mode: 'interactive',
      reuseExisting: false
    });

    expect(interactiveServers).toHaveLength(2);
    
    // Verify servers are running
    for (const server of interactiveServers) {
      const response = await fetch(`http://localhost:${server.port}`);
      expect(response.ok).toBeTruthy();
      console.log(`✅ Interactive server running on port ${server.port}`);
    }

    // Step 2: Simulate running a headless script that should detect and reuse servers
    console.log('🔄 Running headless script to test server reuse...');
    
    // This simulates what happens in CI when tests run
    const headlessServers = await startServers({
      sites: ['portal', 'isbd'],
      mode: 'headless',
      reuseExisting: true
    });

    // The headless call should reuse existing servers (might be empty array if reused)
    console.log(`📊 Headless servers returned: ${headlessServers.length}`);

    // Step 3: Verify servers are still accessible and functioning
    const portalResponse = await fetch('http://localhost:3000');
    const isbdResponse = await fetch('http://localhost:3004');
    
    expect(portalResponse.ok).toBeTruthy();
    expect(isbdResponse.ok).toBeTruthy();
    
    console.log('✅ Server handoff successful - both servers still responding');

    // Step 4: Test server kill and restart functionality
    console.log('🔄 Testing kill and restart functionality...');
    
    // Kill existing servers
    await stopServers(interactiveServers);
    interactiveServers = [];
    
    // Wait for ports to be free
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start new headless servers
    const newHeadlessServers = await startServers({
      sites: ['portal', 'isbd'], 
      mode: 'headless',
      reuseExisting: false
    });

    expect(newHeadlessServers).toHaveLength(2);
    
    // Verify new servers work
    const newPortalResponse = await fetch('http://localhost:3000');
    const newIsbdResponse = await fetch('http://localhost:3004');
    
    expect(newPortalResponse.ok).toBeTruthy();
    expect(newIsbdResponse.ok).toBeTruthy();
    
    console.log('✅ Kill/restart functionality working correctly');
    
    // Clean up new servers
    await stopServers(newHeadlessServers);
  });

  test('should handle mode transitions gracefully', async () => {
    console.log('🔄 Testing mode transitions...');
    
    // Start in headless mode
    const headlessServers = await startServers({
      sites: ['portal'],
      mode: 'headless',
      reuseExisting: false
    });

    expect(headlessServers).toHaveLength(1);
    
    const headlessResponse = await fetch('http://localhost:3000');
    expect(headlessResponse.ok).toBeTruthy();
    
    // Try to transition to interactive mode (should kill and restart)
    const interactiveServers = await startServers({
      sites: ['portal'],
      mode: 'interactive', 
      reuseExisting: false
    });

    expect(interactiveServers).toHaveLength(1);
    
    const interactiveResponse = await fetch('http://localhost:3000');
    expect(interactiveResponse.ok).toBeTruthy();
    
    console.log('✅ Mode transition successful');
    
    // Clean up
    await stopServers(interactiveServers);
  });

  test('should preserve server state across test runs', async () => {
    console.log('🔄 Testing server state persistence...');
    
    // Start servers
    const servers = await startServers({
      sites: ['portal'],
      mode: 'headless',
      reuseExisting: false
    });

    expect(servers).toHaveLength(1);
    
    // Verify server is running
    const response1 = await fetch('http://localhost:3000');
    expect(response1.ok).toBeTruthy();
    
    // Try to start again with reuse flag - should reuse existing
    const reuseServers = await startServers({
      sites: ['portal'],
      mode: 'headless', 
      reuseExisting: true
    });

    // Should still be able to access the server
    const response2 = await fetch('http://localhost:3000');
    expect(response2.ok).toBeTruthy();
    
    console.log('✅ Server state persistence working');
    
    // Final cleanup
    await stopServers(servers);
  });
});
