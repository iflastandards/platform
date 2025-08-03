/**
 * Global Setup for Smoke Tests
 * Starts only the servers required for smoke tests
 */

import { chromium, FullConfig } from '@playwright/test';
import { promisify } from 'util';

const execFile = promisify(require('child_process').execFile);

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up smoke test environment...');
  
  try {
    // Start servers using our CLI tool
    console.log('📝 Starting servers for smoke tests...');
    
    const { stdout, stderr } = await execFile('pnpm', [
      'test:servers', 'start', 
      '--test-type', 'smoke:all',
      '--mode', 'headless'
    ], {
      cwd: process.cwd(),
      timeout: 60000 // 1 minute timeout
    });
    
    console.log(stdout);
    if (stderr) console.warn(stderr);
    
    // Wait a moment for servers to be fully ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify servers are responding
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Quick health check on portal (main entry point)
    try {
      console.log('🔍 Performing health check...');
      await page.goto('http://localhost:3000', { timeout: 10000 });
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      console.log('✅ Health check passed');
    } catch (error) {
      console.warn('⚠️  Health check failed, but continuing:', error);
    } finally {
      await page.close();
      await context.close();
      await browser.close();
    }
    
    console.log('✅ Smoke test environment ready!');
    
  } catch (error) {
    console.error('❌ Failed to set up smoke test environment:', error);
    throw error;
  }
}

export default globalSetup;
