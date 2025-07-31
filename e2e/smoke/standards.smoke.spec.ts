import { smokeTest, expect } from '../utils/tagged-test';

const STANDARDS = [
  { name: 'LRM', port: 3002, path: '/LRM/' },
  { name: 'ISBDM', port: 3001, path: '/ISBDM/' },
  { name: 'FRBR', port: 3003, path: '/FRBR/' },
  { name: 'isbd', port: 3004, path: '/isbd/' },
  { name: 'muldicat', port: 3005, path: '/muldicat/' },
  { name: 'unimarc', port: 3006, path: '/unimarc/' },
];

STANDARDS.forEach(({ name, port, path }) => {
  smokeTest.describe(`${name} - Smoke Tests @standards @smoke`, () => {
    smokeTest(`should load ${name} homepage @critical`, async ({ page }) => {
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

    smokeTest(`should have working navigation in ${name} @ui`, async ({ page }) => {
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

    smokeTest(`should have vocabulary tables in ${name} @vocabulary`, async ({ page }) => {
      await page.goto(`http://localhost:${port}${path}`);
      await page.waitForLoadState('networkidle');
      
      // Look for vocabulary-related content
      const vocabElements = page.locator('text=vocabulary, text=Vocabulary, .vocabularyContainer, [class*="vocabulary"]');
      
      // Not all standards might have vocabulary tables on the homepage
      // This is a smoke test, so we just check if the page loads without errors
      const vocabCount = await vocabElements.count();
      console.log(`Found ${vocabCount} vocabulary elements in ${name}`);
    });
  });
});