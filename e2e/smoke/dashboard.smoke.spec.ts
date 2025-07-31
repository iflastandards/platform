/**
 * Dashboard Smoke Tests
 * Quick tests to verify dashboard accessibility and basic functionality
 */

import { test, expect, smokeTest } from '../utils/tagged-test';
import { TestData } from '../fixtures/test-data.fixture';

test.describe('Dashboard Smoke Tests @smoke @dashboard @ui @critical @navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to portal homepage
    await page.goto('/');
  });

  smokeTest('should load portal homepage', async ({ page }) => {
    // Check for essential elements
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });
    
    // Verify navigation is present
    await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    
    // Verify footer is present
    await expect(page.locator('footer')).toBeVisible();
  });

  smokeTest('should have working navigation links', async ({ page }) => {
    // Get all navigation links
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();
    
    // Should have at least some navigation links
    expect(linkCount).toBeGreaterThan(0);
    
    // Test first navigation link
    if (linkCount > 0) {
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute('href');
      
      if (href && !href.startsWith('http') && href !== '#') {
        await firstLink.click();
        // Should navigate without error
        await expect(page).not.toHaveURL(/error|404/);
      }
    }
  });

  smokeTest('should display site selector', async ({ page }) => {
    // Look for site selector dropdown or links
    const siteSelector = page.locator('[data-testid="site-selector"], .site-selector, select:has-text("site"), a:has-text("ISBDM")');
    
    if (await siteSelector.isVisible()) {
      // Site selector is available
      await expect(siteSelector).toBeVisible();
    } else {
      // Check if individual site links are visible
      const isbdmLink = page.locator('a:has-text("ISBDM")');
      await expect(isbdmLink).toBeVisible();
    }
  });

  smokeTest('should have working search functionality', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [role="searchbox"]');
    
    if (await searchInput.isVisible()) {
      // Type in search
      await searchInput.fill('test search query');
      
      // Should accept input
      await expect(searchInput).toHaveValue('test search query');
      
      // Try to submit search (if form exists)
      const searchForm = page.locator('form:has(input[type="search"])');
      if (await searchForm.isVisible()) {
        await searchForm.press('Enter');
        // Should not error
        await expect(page).not.toHaveURL(/error|404/);
      }
    } else {
      // Skip if no search functionality
      test.skip();
    }
  });

  smokeTest('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check for mobile menu button
    const mobileMenuButton = page.locator('button[aria-label*="menu" i], button:has-text("Menu"), [data-testid="mobile-menu"]');
    
    if (await mobileMenuButton.isVisible()) {
      // Click mobile menu
      await mobileMenuButton.click();
      
      // Mobile menu should open
      await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    }
    
    // Content should still be visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});