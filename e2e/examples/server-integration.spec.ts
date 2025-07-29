import { test, expect } from '@playwright/test';
import { addBasePath } from '@ifla/theme/utils';

// Example: Testing admin app with API dependencies
test.describe('Server-Dependent Integration Tests', () => {
  // Helper to make authenticated API requests
  async function authenticatedRequest(page, endpoint: string, options = {}) {
    // Get auth token from localStorage or cookies
    const token = await page.evaluate(() => localStorage.getItem('auth-token'));
    
    const response = await page.request.fetch(addBasePath(endpoint), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    return response;
  }
  
  test.beforeEach(async ({ page }) => {
    // Mock authentication for tests
    await page.goto('http://localhost:3200/admin');
    
    // Set up authentication state
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'test-token');
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user',
        email: 'test@example.com',
        roles: ['admin'],
      }));
    });
  });
  
  test('should load vocabularies from API and display in UI', async ({ page }) => {
    // First, verify the API is working
    const apiResponse = await page.request.get(
      'http://localhost:3200/admin/api/vocabularies'
    );
    expect(apiResponse.ok()).toBeTruthy();
    
    const vocabularies = await apiResponse.json();
    expect(Array.isArray(vocabularies)).toBeTruthy();
    
    // Now test the UI that displays this data
    await page.goto('http://localhost:3200/admin/vocabularies');
    
    // Wait for the vocabularies to load
    await page.waitForSelector('[data-testid="vocabulary-list"]', {
      state: 'visible',
      timeout: 10000,
    });
    
    // Verify vocabularies are displayed
    const vocabularyCards = page.locator('[data-testid="vocabulary-card"]');
    const count = await vocabularyCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify each vocabulary has required elements
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = vocabularyCards.nth(i);
      await expect(card.locator('[data-testid="vocabulary-title"]')).toBeVisible();
      await expect(card.locator('[data-testid="vocabulary-description"]')).toBeVisible();
    }
  });
  
  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and return an error
    await page.route('**/api/vocabularies', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });
    
    // Navigate to the page
    await page.goto('http://localhost:3200/admin/vocabularies');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Failed to load vocabularies'
    );
    
    // Should show retry button
    const retryButton = page.locator('[data-testid="retry-button"]');
    await expect(retryButton).toBeVisible();
    
    // Remove the route intercept
    await page.unroute('**/api/vocabularies');
    
    // Click retry and verify it loads
    await retryButton.click();
    await page.waitForSelector('[data-testid="vocabulary-list"]');
  });
  
  test('should create a new vocabulary via API', async ({ page }) => {
    await page.goto('http://localhost:3200/admin/vocabularies/new');
    
    // Fill in the form
    await page.fill('[data-testid="vocabulary-name"]', 'Test Vocabulary');
    await page.fill('[data-testid="vocabulary-description"]', 'Test Description');
    await page.selectOption('[data-testid="vocabulary-type"]', 'concept-scheme');
    
    // Submit the form
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/vocabularies') && response.request().method() === 'POST'
    );
    
    await page.click('[data-testid="submit-button"]');
    
    const response = await responsePromise;
    expect(response.status()).toBe(201);
    
    // Verify redirect to vocabularies list
    await page.waitForURL('**/vocabularies');
    
    // Verify the new vocabulary appears in the list
    await expect(
      page.locator('[data-testid="vocabulary-card"]:has-text("Test Vocabulary")')
    ).toBeVisible();
  });
  
  test('should handle real-time updates via WebSocket', async ({ page, context }) => {
    // Open two pages to simulate multiple users
    const page1 = page;
    const page2 = await context.newPage();
    
    // Navigate both pages to vocabularies
    await page1.goto('http://localhost:3200/admin/vocabularies');
    await page2.goto('http://localhost:3200/admin/vocabularies');
    
    // Wait for WebSocket connection
    await page1.waitForTimeout(1000);
    
    // Create a vocabulary in page1
    await page1.click('[data-testid="create-vocabulary-button"]');
    await page1.fill('[data-testid="quick-create-name"]', 'Real-time Test');
    await page1.click('[data-testid="quick-create-submit"]');
    
    // Verify it appears in page2 without refresh
    await expect(
      page2.locator('[data-testid="vocabulary-card"]:has-text("Real-time Test")')
    ).toBeVisible({ timeout: 5000 });
    
    await page2.close();
  });
});

// Example: Testing build output with static server
test.describe('Production Build Tests', () => {
  // These tests would run against built sites served statically
  test('should serve built documentation sites correctly', async ({ page }) => {
    // Assuming you've built and are serving the site
    const builtSiteUrl = process.env.BUILT_SITE_URL || 'http://localhost:5000';
    
    await page.goto(builtSiteUrl);
    
    // Verify static assets load correctly
    const response = await page.request.get(`${builtSiteUrl}/img/logo.svg`);
    expect(response.status()).toBe(200);
    
    // Verify JavaScript bundles load
    const jsFiles = await page.locator('script[src]').evaluateAll(
      scripts => scripts.map(s => s.src)
    );
    
    for (const jsFile of jsFiles) {
      const jsResponse = await page.request.get(jsFile);
      expect(jsResponse.status()).toBe(200);
    }
    
    // Verify CSS loads
    const cssFiles = await page.locator('link[rel="stylesheet"]').evaluateAll(
      links => links.map(l => l.href)
    );
    
    for (const cssFile of cssFiles) {
      const cssResponse = await page.request.get(cssFile);
      expect(cssResponse.status()).toBe(200);
    }
  });
});