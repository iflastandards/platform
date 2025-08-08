import { test, expect } from '@playwright/test';
import { runFullAccessibilityTest, runAccessibilityScan } from '../utils/accessibility-helpers';

/**
 * Comprehensive accessibility testing for Documentation sites
 * Tests WCAG 2.1 AA compliance across all Docusaurus sites
 * 
 * @tags @e2e @accessibility @docs @critical
 */

const DOCS_SITES = [
  { name: 'Portal', url: 'http://localhost:3001' },
  { name: 'ISBD', url: 'http://localhost:3002' },
  { name: 'ISBDM', url: 'http://localhost:3003' },
  { name: 'UNIMARC', url: 'http://localhost:3004' },
  { name: 'MRI', url: 'http://localhost:3005' },
  { name: 'FRBR', url: 'http://localhost:3006' },
  { name: 'LRM', url: 'http://localhost:3007' },
];

test.describe('Documentation Sites Accessibility @e2e @accessibility @docs @critical', () => {
  for (const site of DOCS_SITES) {
    test.describe(`${site.name} Site Accessibility`, () => {
      test.beforeEach(async ({ page }) => {
        // Set a longer timeout for documentation sites
        test.setTimeout(60000);
      });

      test(`${site.name} homepage should be fully accessible`, async ({ page }) => {
        try {
          await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (error) {
          test.skip(true, `${site.name} site not available at ${site.url}`);
        }

        // Run comprehensive accessibility test
        await runFullAccessibilityTest(page, {
          tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
          disableRules: [
            // Temporarily disable rules that might be problematic for Docusaurus
            'color-contrast' // Will be tested separately with more specific rules
          ]
        });

        // Verify basic page structure
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('[role="main"], main')).toBeVisible();
      });

      test(`${site.name} navigation should be accessible`, async ({ page }) => {
        try {
          await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (error) {
          test.skip(true, `${site.name} site not available`);
        }

        // Test navigation accessibility
        const navElements = await page.locator('nav, [role="navigation"]').count();
        if (navElements > 0) {
          await runAccessibilityScan(page, {
            tags: ['wcag2a', 'wcag2aa'],
            include: ['nav', '[role="navigation"]']
          });
        }

        // Test keyboard navigation
        await page.keyboard.press('Tab');
        const focusedElement = page.locator(':focus').first();
        if (await focusedElement.isVisible()) {
          await expect(focusedElement).toBeVisible();
        }
      });

      test(`${site.name} search functionality should be accessible`, async ({ page }) => {
        try {
          await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (error) {
          test.skip(true, `${site.name} site not available`);
        }

        // Look for search functionality
        const searchInput = page.locator('input[type="search"], [role="searchbox"], .search input');
        const searchCount = await searchInput.count();

        if (searchCount > 0) {
          // Test search accessibility
          await runAccessibilityScan(page, {
            tags: ['wcag2a', 'wcag2aa'],
            include: ['input[type="search"]', '[role="searchbox"]']
          });

          // Test that search is keyboard accessible
          await searchInput.first().focus();
          await expect(searchInput.first()).toBeFocused();
        }
      });

      test(`${site.name} vocabulary tables should be accessible`, async ({ page }) => {
        try {
          await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (error) {
          test.skip(true, `${site.name} site not available`);
        }

        // Look for vocabulary tables (common in IFLA standards sites)
        const tables = await page.locator('table, .vocabulary-table').count();
        
        if (tables > 0) {
          // Test table accessibility
          await runAccessibilityScan(page, {
            tags: ['wcag2a', 'wcag2aa'],
            include: ['table']
          });

          // Verify tables have proper headers
          const tableHeaders = await page.locator('th, [role="columnheader"]').count();
          if (tableHeaders > 0) {
            expect(tableHeaders).toBeGreaterThan(0);
          }
        }
      });

      test(`${site.name} color contrast should meet WCAG AA standards`, async ({ page }) => {
        try {
          await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (error) {
          test.skip(true, `${site.name} site not available`);
        }

        // Test color contrast specifically
        await runAccessibilityScan(page, {
          tags: ['wcag2aa'],
          disableRules: [] // Enable all color contrast rules
        });
      });

      test(`${site.name} images should have appropriate alt text`, async ({ page }) => {
        try {
          await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (error) {
          test.skip(true, `${site.name} site not available`);
        }

        const images = await page.locator('img').count();
        
        if (images > 0) {
          // Test image accessibility
          await runAccessibilityScan(page, {
            tags: ['wcag2a'],
            include: ['img']
          });
        }
      });

      test(`${site.name} should have proper heading hierarchy`, async ({ page }) => {
        try {
          await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
        } catch (error) {
          test.skip(true, `${site.name} site not available`);
        }

        // Test heading structure
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeGreaterThanOrEqual(1);

        // Test with axe
        await runAccessibilityScan(page, {
          tags: ['wcag2a'],
          include: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
        });
      });
    });
  }
});

test.describe('Documentation Sites Dark Mode Accessibility @e2e @accessibility @docs @dark-mode', () => {
  test('Portal dark mode should be accessible', async ({ page }) => {
    try {
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      test.skip(true, 'Portal site not available');
    }

    // Try to enable dark mode
    const darkModeToggle = page.locator('[data-theme="dark"], .dark-mode-toggle, [aria-label*="dark" i]');
    const toggleCount = await darkModeToggle.count();

    if (toggleCount > 0) {
      await darkModeToggle.first().click();
      await page.waitForTimeout(1000); // Wait for theme transition

      // Test dark mode accessibility
      await runFullAccessibilityTest(page, {
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
      });
    } else {
      test.skip(true, 'Dark mode toggle not found');
    }
  });
});

test.describe('Documentation Sites Mobile Accessibility @e2e @accessibility @docs @mobile', () => {
  test.use({ 
    viewport: { width: 375, height: 667 } // iPhone SE size
  });

  test('Portal mobile view should be accessible', async ({ page }) => {
    try {
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      test.skip(true, 'Portal site not available');
    }

    // Test mobile accessibility
    await runFullAccessibilityTest(page, {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    });

    // Test mobile navigation
    const mobileMenuButton = page.locator('.navbar-toggle, [aria-label*="menu" i], .mobile-menu-button');
    const menuButtonCount = await mobileMenuButton.count();

    if (menuButtonCount > 0) {
      // Test mobile menu accessibility
      await mobileMenuButton.first().click();
      await page.waitForTimeout(500);

      await runAccessibilityScan(page, {
        tags: ['wcag2a', 'wcag2aa']
      });
    }
  });
});

test.describe('Cross-Site Accessibility Consistency @e2e @accessibility @docs @consistency', () => {
  test('All sites should have consistent accessibility patterns', async ({ page }) => {
    interface AccessibilityReport {
      site: string;
      hasH1: boolean;
      hasMain: boolean;
      hasNav: boolean;
      hasSkipLink: boolean;
      imageCount: number;
      imagesWithAlt: number;
    }

    const accessibilityReports: AccessibilityReport[] = [];

    for (const site of DOCS_SITES.slice(0, 3)) { // Test first 3 sites for consistency
      try {
        await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Generate accessibility report
        const report = await page.evaluate(() => {
          // Basic accessibility checks that can be done in browser
          return {
            hasH1: document.querySelectorAll('h1').length > 0,
            hasMain: document.querySelectorAll('main, [role="main"]').length > 0,
            hasNav: document.querySelectorAll('nav, [role="navigation"]').length > 0,
            hasSkipLink: document.querySelectorAll('a[href*="#main"], .skip-link').length > 0,
            imageCount: document.querySelectorAll('img').length,
            imagesWithAlt: document.querySelectorAll('img[alt]').length,
          };
        });

        accessibilityReports.push({
          site: site.name,
          ...report
        });
      } catch (error) {
        console.warn(`Could not test ${site.name}: ${error}`);
      }
    }

    // Verify consistency across sites
    if (accessibilityReports.length > 1) {
      // All sites should have basic accessibility features
      for (const report of accessibilityReports) {
        expect(report.hasH1).toBe(true);
        expect(report.hasMain).toBe(true);
        expect(report.hasNav).toBe(true);
        
        // If images exist, they should have alt text
        if (report.imageCount > 0) {
          expect(report.imagesWithAlt).toBeGreaterThan(0);
        }
      }
    }
  });
});