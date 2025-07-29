import { test, expect, Page } from '@playwright/test';

// Example: Testing multiple documentation sites
test.describe('Multi-Site E2E Tests', () => {
  // Test different sites with their specific ports
  const sites = [
    { name: 'portal', url: 'http://localhost:3000' },
    { name: 'isbd', url: 'http://localhost:3001' },
    { name: 'admin', url: 'http://localhost:3200/admin' },
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

// Example: Server-dependent integration test
test.describe('API Integration Tests', () => {
  test('should fetch data from backend API', async ({ page, request }) => {
    // Start by loading the admin app
    await page.goto('http://localhost:3200/admin');
    
    // Make API request directly
    const apiResponse = await request.get('http://localhost:3200/admin/api/health');
    expect(apiResponse.ok()).toBeTruthy();
    
    const data = await apiResponse.json();
    expect(data).toHaveProperty('status', 'healthy');
    
    // Now test the UI that depends on this API
    await page.goto('http://localhost:3200/admin/dashboard');
    
    // Wait for data to load
    await page.waitForSelector('[data-testid="api-status"]');
    
    // Verify the UI shows the API status
    const statusElement = page.locator('[data-testid="api-status"]');
    await expect(statusElement).toContainText('API: Healthy');
  });
});

// Example: Advanced Chrome DevTools Protocol usage
test.describe('Performance Testing with CDP', () => {
  test('should measure page performance metrics', async ({ page }) => {
    // Enable Chrome DevTools Protocol
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    
    // Navigate to the site
    await page.goto('http://localhost:3000');
    
    // Get performance metrics
    const performanceMetrics = await client.send('Performance.getMetrics');
    
    // Extract specific metrics
    const metrics = performanceMetrics.metrics.reduce((acc, metric) => {
      acc[metric.name] = metric.value;
      return acc;
    }, {} as Record<string, number>);
    
    // Assert performance thresholds
    expect(metrics.DomContentLoaded).toBeLessThan(3000); // 3 seconds
    expect(metrics.FirstMeaningfulPaint).toBeLessThan(2000); // 2 seconds
    
    // Disable CDP
    await client.detach();
  });
});

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