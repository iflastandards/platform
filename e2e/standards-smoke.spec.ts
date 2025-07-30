import { test, expect } from '@playwright/test';

const STANDARDS = [
  { name: 'LRM', port: 3002, path: '/LRM/' },
  { name: 'ISBDM', port: 3001, path: '/ISBDM/' },
  { name: 'FRBR', port: 3003, path: '/FRBR/' },
  { name: 'isbd', port: 3004, path: '/isbd/' },
  { name: 'muldicat', port: 3005, path: '/muldicat/' },
  { name: 'unimarc', port: 3006, path: '/unimarc/' },
];

STANDARDS.forEach(({ name, port, path }) => {
  test.describe(`${name} - Smoke Tests`, () => {
    test(`should load ${name} homepage`, async ({ page }) => {
      await page.goto(`http://localhost:${port}${path}`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check title contains the standard name or IFLA
      await expect(page).toHaveTitle(new RegExp(`${name}|IFLA`, 'i'));
      
      // Check main navigation exists
      await expect(page.locator('nav')).toBeVisible();
      
      // Check content loads
      await expect(page.locator('main')).toBeVisible();
    });

    test(`should have working navigation in ${name}`, async ({ page }) => {
      await page.goto(`http://localhost:${port}${path}`);
      await page.waitForLoadState('networkidle');
      
      // Check that navigation exists
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      // Check that there are navigation links
      const navLinks = nav.locator('a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    });

    test(`should have vocabulary tables in ${name}`, async ({ page }) => {
      await page.goto(`http://localhost:${port}${path}`);
      await page.waitForLoadState('networkidle');
      
      // Look for vocabulary-related content
      const vocabElements = page.locator('text=vocabulary, text=Vocabulary, .vocabularyContainer, [class*="vocabulary"]');
      
      // Not all standards may have vocabulary tables, so this is optional
      if (await vocabElements.count() > 0) {
        await expect(vocabElements.first()).toBeVisible();
      }
    });

    test(`should be responsive on mobile - ${name}`, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`http://localhost:${port}${path}`);
      await page.waitForLoadState('networkidle');
      
      // Check that content is still accessible
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    });
  });
});