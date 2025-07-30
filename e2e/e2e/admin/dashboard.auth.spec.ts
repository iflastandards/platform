import { e2eTest as test, expect } from '../../utils/tagged-test';

/**
 * Example authenticated test that uses pre-authenticated state
 * These tests run in the chromium-admin project with admin user context
 */
test.describe('Admin Dashboard - Authenticated Tests @admin @auth @e2e', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard - should already be authenticated
    await page.goto('/dashboard');
  });

  test('should access admin dashboard as authenticated user', async ({ page }) => {
    // Should be able to see dashboard content without logging in
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verify user is authenticated by checking for user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should have admin-specific features visible', async ({ page }) => {
    // Check for admin-only features
    await expect(page.locator('[data-testid="admin-panel"]')).toBeVisible();
    
    // Verify can navigate to admin sections
    await page.click('[data-testid="users-link"]');
    await expect(page).toHaveURL(/.*\/users/);
  });

  test('should maintain session across navigation', async ({ page }) => {
    // Navigate to different pages
    await page.click('[data-testid="settings-link"]');
    await expect(page).toHaveURL(/.*\/settings/);
    
    // Should still be authenticated
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Navigate back to dashboard
    await page.click('[data-testid="dashboard-link"]');
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Session should persist
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });
});