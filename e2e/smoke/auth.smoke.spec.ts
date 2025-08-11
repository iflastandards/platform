/**
 * Admin Authentication Smoke Tests
 * Quick tests to verify the admin portal shows proper authentication state
 * Only tests publicly accessible content - no actual authentication flows
 */

import { test, expect, smokeTest } from '../utils/tagged-test';

test.describe('Admin Authentication Smoke Tests @smoke @auth @critical', () => {
  const adminUrl = process.env.ADMIN_BASE_URL || process.env.ADMIN_URL || 'https://admin-iflastandards-preview.onrender.com';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to admin portal homepage (public)
    await page.goto(adminUrl);
  });

  smokeTest('should display admin portal with authentication options', async ({ page }) => {
    // Check for admin portal title
    await expect(page).toHaveTitle(/IFLA Admin Portal/);
    
    // Check for main heading
    await expect(page.locator('h1:has-text("IFLA Standards Management Toolkit")')).toBeVisible();
    
    // Check for Sign In button (Clerk component)
    await expect(page.locator('text=Sign In')).toBeVisible({ timeout: 5000 });
    
    // Check for invitation-only message
    await expect(page.locator('text=Access by invitation only')).toBeVisible();
  });

  smokeTest('should show proper access control messaging', async ({ page }) => {
    // Should show access restriction message
    await expect(page.locator('text=invitation only')).toBeVisible();
    
    // Should explain the platform purpose
    await expect(page.locator('text=IFLA review group members, editors, translators')).toBeVisible();
    
    // Should have request invitation option
    await expect(page.locator('text=Request Invitation')).toBeVisible();
  });

  smokeTest('should have functional authentication elements', async ({ page }) => {
    // Sign In button should be present and enabled
    const signInButton = page.locator('text=Sign In');
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();
    
    // Request Invitation button should be present and enabled
    const requestButton = page.locator('text=Request Invitation');
    await expect(requestButton).toBeVisible();
    await expect(requestButton).toBeEnabled();
  });
});