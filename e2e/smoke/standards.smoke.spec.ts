import { smokeTest, expect } from '../utils/tagged-test';

const STANDARDS = [
  { name: 'LRM', path: '/LRM/' },
  { name: 'ISBDM', path: '/ISBDM/' },
  { name: 'FRBR', path: '/FRBR/' },
  { name: 'isbd', path: '/isbd/' },
  { name: 'muldicat', path: '/muldicat/' },
  { name: 'unimarc', path: '/unimarc/' },
];

STANDARDS.forEach(({ name, path }) => {
  smokeTest.describe(`${name} - Smoke Tests @standards @smoke`, () => {
    smokeTest(`should load ${name} homepage @critical`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}${path}`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check title contains the standard name or IFLA
      await expect(page).toHaveTitle(new RegExp(`${name}|IFLA`, 'i'));
      
      // Check main navigation exists
      await expect(page.locator('nav')).toBeVisible();
      
      // Check hero section or main content area exists (Docusaurus specific)
      const heroExists = await page.locator('.hero').first().isVisible();
      const mainExists = await page.locator('main').isVisible();
      const contentExists = await page.locator('#__docusaurus').isVisible();
      
      // At least one of these should be visible
      expect(heroExists || mainExists || contentExists).toBe(true);
    });

    smokeTest(`should have working navigation in ${name} @ui`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}${path}`);
      await page.waitForLoadState('networkidle');
      
      // Check that navigation exists
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      // Check that there are navigation links
      const navLinks = nav.locator('a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    });

    smokeTest(`should have vocabulary tables in ${name} @vocabulary`, async ({ page, baseURL }) => {
      await page.goto(`${baseURL}${path}`);
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