import { smokeTest, expect } from '../utils/tagged-test';

smokeTest.describe('Portal - Smoke Tests @portal @critical @smoke', () => {
  smokeTest('should load portal homepage', async ({ page, baseURL }) => {
    console.log('Portal test baseURL:', baseURL);
    await page.goto(baseURL || '/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check title contains IFLA
    await expect(page).toHaveTitle(/IFLA/);
    
    // Check main navigation exists
    await expect(page.locator('nav')).toBeVisible();
    
    // Check content loads
    await expect(page.locator('main')).toBeVisible();
  });

  smokeTest('should have working navigation to standards', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check for standards links in navigation
    const standardsLinks = page.locator('a[href*="/LRM/"], a[href*="/ISBDM/"], a[href*="/FRBR/"]');
    await expect(standardsLinks.first()).toBeVisible();
  });

  smokeTest('should have working search functionality', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Look for search input or button
    const searchElement = page.locator('input[type="search"], button[aria-label*="Search"], .search-box');
    if (await searchElement.count() > 0) {
      await expect(searchElement.first()).toBeVisible();
    }
  });

  smokeTest('should be responsive on mobile @ui', async ({ page, baseURL }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseURL || '/');
    await page.waitForLoadState('networkidle');
    
    // Check that content is still accessible
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });
});