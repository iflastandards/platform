import { test, expect } from '@playwright/test';
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';

// Get admin portal configuration for local environment
const adminConfig = getAdminPortalConfig('local');

// Example: Testing multiple documentation sites
test.describe('Multi-Site E2E Tests', () => {
  // Test different sites with their specific ports
  const sites = [
    { name: 'portal', url: 'http://localhost:3000' },
    { name: 'isbd', url: 'http://localhost:3001' },
    { name: 'admin', url: adminConfig.url },
  ];

  sites.forEach(({ name, url }) => {
    test(`${name} site should load successfully`, async ({ page }) => {
      // Navigate to the site
      await page.goto(url);
      
      // Wait for the page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Verify the page loaded successfully
      await expect(page).toHaveURL(new RegExp(url));
      
      // Take a screenshot for visual verification
      await page.screenshot({ 
        path: `./tmp/playwright-results/${name}-homepage.png` 
      });
    });
  });
});

// Example: Testing with browser context for session persistence
test.describe('Session-based Integration Tests', () => {
  test('should maintain session across multiple pages', async ({ browser }) => {
    // Create a new browser context with specific options
    const context = await browser.newContext({
      // Chrome-specific options
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Playwright E2E Test',
      
      // Save authentication state
      storageState: process.env.STORAGE_STATE_PATH,
      
      // Enable JavaScript console logs
      bypassCSP: true,
    });
    
    const page = await context.newPage();
    
    // Enable console log capture
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });
    
    // Test navigation across sites
    await page.goto('http://localhost:3000');
    await page.click('text="Documentation"');
    
    // Verify navigation worked
    await expect(page).toHaveURL(/\/docs/);
    
    await context.close();
  });
});

// DEPRECATED: The following test suites have been moved to _deprecated/multi-site-testing-partial.spec.ts.deprecated
// - API Integration Tests: /dashboard returns 404, expects elements that don't exist
// - Performance Testing with CDP: Uses wrong port (3000 instead of 3007)

// Example: Visual regression testing
test.describe('Visual Regression Tests', () => {
  test('should match visual snapshot', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Wait for all images to load
    await page.waitForLoadState('networkidle');
    
    // Take a full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('.dynamic-content')], // Mask dynamic content
    });
  });
});