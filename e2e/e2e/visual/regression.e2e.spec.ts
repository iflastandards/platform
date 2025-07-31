import { e2eTest, expect } from '../../utils/tagged-test';

// Enhanced visual regression testing with multiple viewports
const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'mobile', width: 375, height: 667 },
  { name: 'mobile-large', width: 414, height: 896 }
];

const testPages = [
  { path: '/', name: 'portal-home' },
  { path: '/ISBDM/', name: 'isbdm-home' },
  { path: '/ISBDM/docs/intro', name: 'isbdm-intro' },
  { path: '/LRM/', name: 'lrm-home' },
  { path: '/FRBR/', name: 'frbr-home' }
];

e2eTest.describe('Enhanced Visual Regression Testing @visual @slow @e2e', () => {
  for (const viewport of viewports) {
    e2eTest.describe(`${viewport.name} viewport (${viewport.width}x${viewport.height})`, () => {
      e2eTest.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
      });

      for (const testPage of testPages) {
        e2eTest(`should render ${testPage.name} consistently on ${viewport.name}`, async ({ page }) => {
          // Navigate to page
          await page.goto(testPage.path);
          await page.waitForLoadState('networkidle');
          
          // Wait for fonts and images to load
          await page.waitForTimeout(1000);
          
          // Hide dynamic content that changes between runs
          await page.addStyleTag({
            content: `
              .theme-last-updated, 
              .footer__copyright,
              [class*="buildTime"],
              [class*="timestamp"] {
                visibility: hidden !important;
              }
            `
          });

          // Take full page screenshot
          await expect(page).toHaveScreenshot(`${testPage.name}-${viewport.name}.png`, {
            fullPage: true,
            animations: 'disabled',
            mask: [
              // Mask any dynamic elements
              page.locator('.theme-last-updated'),
              page.locator('[class*="timestamp"]')
            ],
          });
        });
      }

      e2eTest(`should handle dark mode correctly on ${viewport.name} @ui`, async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Click dark mode toggle if available
        const darkModeToggle = page.locator('button[aria-label*="dark"], button[aria-label*="theme"]');
        if (await darkModeToggle.count() > 0) {
          await darkModeToggle.click();
          await page.waitForTimeout(500); // Wait for transition
          
          // Take screenshot in dark mode
          await expect(page).toHaveScreenshot(`portal-dark-${viewport.name}.png`, {
            fullPage: false, // Just viewport for dark mode
            animations: 'disabled'
          });
        }
      });
    });
  }

  e2eTest('should capture interaction states @ui', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test hover states
    const navLink = page.locator('nav a').first();
    await navLink.hover();
    await page.waitForTimeout(300); // Wait for hover animation
    
    await expect(navLink).toHaveScreenshot('nav-link-hover.png', {
      animations: 'disabled'
    });
    
    // Test focus states
    await navLink.focus();
    await expect(navLink).toHaveScreenshot('nav-link-focus.png', {
      animations: 'disabled'
    });
  });

  e2eTest('should validate print styles', async ({ page }) => {
    await page.goto('/ISBDM/docs/intro');
    await page.waitForLoadState('networkidle');
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    
    await expect(page).toHaveScreenshot('print-preview.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});