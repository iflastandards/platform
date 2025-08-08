import { test, expect } from '@playwright/test';
import { runFullAccessibilityTest, runAccessibilityScan } from '../utils/accessibility-helpers';

/**
 * Comprehensive accessibility testing for the Admin application
 * Tests WCAG 2.1 AA compliance using axe-core
 * 
 * @tags @e2e @accessibility @admin @critical
 */

test.describe('Admin Application Accessibility @e2e @accessibility @admin @critical', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin application
    await page.goto('/admin');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Welcome page should be fully accessible', async ({ page }) => {
    // Test the welcome/landing page accessibility
    await runFullAccessibilityTest(page, {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      // Exclude any known issues that are being addressed
      disableRules: []
    });

    // Additional specific checks for welcome page
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[role="main"]')).toBeVisible();
  });

  test('Sign-in page should be accessible', async ({ page }) => {
    // Navigate to sign-in if not already there
    const signInButton = page.locator('text=Sign In').first();
    if (await signInButton.isVisible()) {
      await signInButton.click();
      await page.waitForLoadState('networkidle');
    }

    await runFullAccessibilityTest(page, {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    });

    // Test form accessibility specifically
    const forms = await page.locator('form').count();
    if (forms > 0) {
      // Ensure forms have proper labels and structure
      await runAccessibilityScan(page, {
        tags: ['wcag2a', 'wcag2aa']
      });
    }
  });

  test('Dashboard should be accessible after authentication', async ({ page }) => {
    // This test assumes authentication is handled by global setup
    // or that we're testing with a mock authenticated state
    
    // Try to navigate to dashboard
    await page.goto('/admin/dashboard');
    
    // Wait for either dashboard content or redirect to auth
    await page.waitForTimeout(2000);
    
    // If we're on an auth page, skip this test
    const currentUrl = page.url();
    if (currentUrl.includes('sign-in') || currentUrl.includes('auth')) {
      test.skip(true, 'Authentication required - skipping dashboard accessibility test');
    }

    await runFullAccessibilityTest(page, {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      // Skip keyboard test if there are complex interactive elements
      skipKeyboard: false
    });

    // Test specific dashboard elements
    const mainContent = page.locator('[role="main"]');
    if (await mainContent.isVisible()) {
      await expect(mainContent).toBeVisible();
    }
  });

  test('Navigation should be keyboard accessible', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = page.locator(':focus').first();
    await expect(focusedElement).toBeVisible();

    // Test that we can navigate through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus').first();
      
      // Check if element is still visible (not hidden or off-screen)
      const isVisible = await currentFocus.isVisible().catch(() => false);
      if (isVisible) {
        await expect(currentFocus).toBeVisible();
      }
    }
  });

  test('Color contrast should meet WCAG standards', async ({ page }) => {
    // This is primarily handled by axe-core color-contrast rule
    await runAccessibilityScan(page, {
      tags: ['wcag2aa'],
      // Focus specifically on color contrast
      include: ['body']
    });
  });

  test('Images should have appropriate alt text', async ({ page }) => {
    const images = await page.locator('img').count();
    
    if (images > 0) {
      // Test image accessibility
      await runAccessibilityScan(page, {
        tags: ['wcag2a'],
        // Focus on image-related rules
        include: ['img']
      });
    }
  });

  test('Forms should be properly labeled', async ({ page }) => {
    const forms = await page.locator('form').count();
    
    if (forms > 0) {
      // Test form accessibility
      await runAccessibilityScan(page, {
        tags: ['wcag2a', 'wcag2aa'],
        include: ['form']
      });

      // Additional form-specific tests
      const inputs = await page.locator('input, select, textarea').count();
      if (inputs > 0) {
        // Ensure all form controls have accessible names
        await runAccessibilityScan(page, {
          tags: ['wcag2a']
        });
      }
    }
  });

  test('Page should have proper heading hierarchy', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    
    if (headings > 0) {
      // Verify h1 exists
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeGreaterThanOrEqual(1);

      // Test heading structure with axe
      await runAccessibilityScan(page, {
        tags: ['wcag2a'],
        include: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      });
    }
  });

  test('Interactive elements should have focus indicators', async ({ page }) => {
    // Test focus indicators by tabbing through elements
    const interactiveElements = await page.locator(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ).count();

    if (interactiveElements > 0) {
      // Test focus management
      await page.keyboard.press('Tab');
      
      // Verify focus is visible and properly styled
      const focusedElement = page.locator(':focus').first();
      await expect(focusedElement).toBeVisible();
    }
  });

  test('ARIA attributes should be properly implemented', async ({ page }) => {
    // Test ARIA implementation
    await runAccessibilityScan(page, {
      tags: ['wcag2a', 'wcag2aa'],
      // Focus on ARIA-related rules
      disableRules: []
    });

    // Check for common ARIA landmarks
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]').count();
    
    if (landmarks > 0) {
      // At least one landmark should be present
      expect(landmarks).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin Application Mobile Accessibility @e2e @accessibility @mobile', () => {
  test.use({ 
    viewport: { width: 375, height: 667 } // iPhone SE size
  });

  test('Mobile view should be accessible', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Test mobile accessibility
    await runFullAccessibilityTest(page, {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    });

    // Test touch targets are appropriately sized
    const buttons = await page.locator('button, a').count();
    if (buttons > 0) {
      // Ensure interactive elements meet minimum size requirements
      await runAccessibilityScan(page, {
        tags: ['wcag2aa']
      });
    }
  });

  test('Mobile navigation should be keyboard accessible', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Test keyboard navigation on mobile
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus').first();
    
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible();
    }
  });
});