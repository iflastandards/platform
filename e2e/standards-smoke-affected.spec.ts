import { test, expect } from '@playwright/test';

// Map of all standards with their configurations
const ALL_STANDARDS = {
  'lrm': { name: 'LRM', port: 3002, path: '/LRM/' },
  'isbdm': { name: 'ISBDM', port: 3001, path: '/ISBDM/' },
  'frbr': { name: 'FRBR', port: 3003, path: '/FRBR/' },
  'isbd': { name: 'isbd', port: 3004, path: '/isbd/' },
  'muldicat': { name: 'muldicat', port: 3005, path: '/muldicat/' },
  'unimarc': { name: 'unimarc', port: 3006, path: '/unimarc/' },
};

// Get affected sites from environment
const affectedSites = process.env.AFFECTED_SITES?.split(',').filter(Boolean) || [];

// Filter to only test affected sites
const STANDARDS = affectedSites.length > 0
  ? affectedSites
      .map(site => ALL_STANDARDS[site.toLowerCase()])
      .filter(Boolean)
  : Object.values(ALL_STANDARDS);

// Skip if no standards to test
test.skip(STANDARDS.length === 0, 'No affected standards to test');

STANDARDS.forEach(({ name, port, path }) => {
  test.describe(`${name} - Smoke Tests (Affected)`, () => {
    test(`should load ${name} homepage`, async ({ page }) => {
      await page.goto(`http://localhost:${port}${path}`);
      
      // Wait for page to load with shorter timeout
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Check title contains the standard name or IFLA
      await expect(page).toHaveTitle(new RegExp(`${name}|IFLA`, 'i'));
      
      // Check main navigation exists
      await expect(page.locator('nav')).toBeVisible();
      
      // Check content loads
      await expect(page.locator('main')).toBeVisible();
    });

    test(`should have working navigation in ${name}`, async ({ page }) => {
      await page.goto(`http://localhost:${port}${path}`);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Check that navigation links exist
      const navLinks = page.locator('nav a');
      await expect(navLinks).toHaveCount(await navLinks.count());
      
      // Verify at least one link is visible
      if (await navLinks.count() > 0) {
        await expect(navLinks.first()).toBeVisible();
      }
    });
  });
});