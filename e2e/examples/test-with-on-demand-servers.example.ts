/**
 * Example: How to write tests with on-demand server management
 */

import { test, expect, withServers } from '../utils/test-with-server';

// Example 1: Test that auto-detects required servers from file path
// File path contains 'portal' so it will auto-start portal server
test.describe('Portal Homepage Tests', () => {
  test('should load portal homepage', async ({ page }) => {
    // Portal server will be auto-started if not running
    await page.goto('/');
    await expect(page).toHaveTitle(/IFLA/);
  });
});

// Example 2: Test that explicitly requests specific servers
test.describe('Cross-Site Navigation Tests', () => {
  test('should navigate between portal and ISBDM', async ({ page }) => {
    // Explicitly request both servers
    await withServers(['portal', 'isbdm'], async () => {
      await page.goto('/');
      await page.click('a[href*="/ISBDM/"]');
      await expect(page).toHaveURL(/ISBDM/);
    });
  });
});

// Example 3: Admin tests auto-detect need for admin server
test.describe('Admin Dashboard Tests @admin', () => {
  test('should load admin dashboard', async ({ page }) => {
    // Admin server will be auto-started based on path/tags
    await page.goto('http://localhost:3007/admin');
    await expect(page).toHaveTitle(/Admin/);
  });
});

// Example 4: Integration test that needs multiple servers
test.describe('RBAC Integration Tests @integration @rbac', () => {
  test('should validate permissions across services', async ({ page }) => {
    // Test path contains 'rbac' and 'integration' so it will start admin and portal
    await page.goto('http://localhost:3007/admin');
    // ... test RBAC functionality
  });
});

// Example 5: Individual site test
test.describe('ISBDM Vocabulary Tests @e2e @isbdm', () => {
  test('should display ISBDM vocabularies', async ({ page }) => {
    // ISBDM server will be auto-started based on tags
    await page.goto('http://localhost:3001/ISBDM/');
    await expect(page.locator('h1')).toContainText('ISBD');
  });
});