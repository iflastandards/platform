/**
 * Admin Homepage Smoke Tests
 * Quick tests to verify the public admin homepage loads correctly
 * Only tests publicly accessible content - no authentication required
 */

import { test, expect, smokeTest } from '../utils/tagged-test';

test.describe('Admin Homepage Smoke Tests @smoke @admin @ui @critical', () => {
  const adminUrl = process.env.ADMIN_BASE_URL || process.env.ADMIN_URL || 'https://admin-iflastandards-preview.onrender.com';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to admin homepage (public, no auth required)
    await page.goto(adminUrl);
  });

  smokeTest('should load admin homepage', async ({ page }) => {
    // Check for admin portal title
    await expect(page).toHaveTitle(/IFLA Admin Portal/);
    
    // Check for main heading
    await expect(page.locator('h1:has-text("IFLA Standards Management Toolkit")')).toBeVisible({ timeout: 5000 });
    
    // Verify footer is present
    await expect(page.locator('footer')).toBeVisible();
    
    // Check for platform statistics
    await expect(page.locator('text=Live Platform Statistics')).toBeVisible();
  });

  smokeTest('should have working sign in functionality', async ({ page }) => {
    // Check for Sign In button
    const signInButton = page.locator('text=Sign In');
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();
    
    // Check for Request Invitation button
    const requestButton = page.locator('text=Request Invitation');
    await expect(requestButton).toBeVisible();
    await expect(requestButton).toBeEnabled();
    
    // Check for invitation-only message
    await expect(page.locator('text=Access by invitation only')).toBeVisible();
  });

  smokeTest('should display platform statistics', async ({ page }) => {
    // Check for platform statistics that show the system is working
    await expect(page.locator('text=Active Standards')).toBeVisible();
    await expect(page.locator('text=Total Elements')).toBeVisible();
    await expect(page.locator('text=73').locator('..').locator('text=Languages')).toBeVisible();
    
    // Check for standards overview
    await expect(page.locator('text=Standards Overview')).toBeVisible();
    
    // Check for at least one standard (use first() to avoid strict mode issues)
    await expect(page.locator('h4:has-text("ISBD")').first()).toBeVisible();
  });

  smokeTest('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Main content should still be visible and readable
    await expect(page.locator('h1:has-text("IFLA Standards Management Toolkit")')).toBeVisible();
    
    // Sign In button should still be accessible
    await expect(page.locator('text=Sign In')).toBeVisible();
    
    // Statistics should be visible (might stack vertically)
    await expect(page.locator('text=Active Standards')).toBeVisible();
  });
});