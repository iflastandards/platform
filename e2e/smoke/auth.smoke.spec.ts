/**
 * Authentication Smoke Tests
 * Quick tests to verify critical auth functionality
 */

import { test, expect, smokeTest } from '../utils/tagged-test';
import { TestData } from '../fixtures/test-data.fixture';

test.describe('Authentication Smoke Tests @smoke @auth @critical', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin portal
    await page.goto('/admin');
  });

  smokeTest('should display login page', async ({ page }) => {
    // Check for Clerk authentication elements
    await expect(page.locator('text=Sign in')).toBeVisible({ timeout: 5000 });
    
    // Verify critical elements are present
    await expect(page.locator('input[type="email"], input[name="identifier"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  smokeTest('should redirect unauthenticated users', async ({ page }) => {
    // Try to access protected route
    await page.goto('/admin/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/sign-in|login/);
  });

  smokeTest('should show error for invalid credentials', async ({ page }) => {
    // Enter invalid credentials
    await page.fill('input[type="email"], input[name="identifier"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=/incorrect|invalid|error/i')).toBeVisible({ timeout: 5000 });
  });

  smokeTest('should have working forgot password link', async ({ page }) => {
    // Look for forgot password link
    const forgotPasswordLink = page.locator('a[href*="forgot"], a:has-text("Forgot"), button:has-text("Forgot")');
    
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
      
      // Should navigate to password reset
      await expect(page).toHaveURL(/forgot|reset/);
      await expect(page.locator('input[type="email"], input[name="identifier"]')).toBeVisible();
    } else {
      // Skip if no forgot password link
      test.skip();
    }
  });
});