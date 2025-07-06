// e2e/admin-portal/rbac-scenarios.e2e.test.ts
import { test, expect } from '@playwright/test';
import { setupMockAuth, TEST_USERS } from '../utils/auth-helpers';

test.describe('RBAC Scenarios', () => {
  test('System admin should have full access', async ({ page, context }) => {
    await setupMockAuth(context, TEST_USERS.systemAdmin);
    await page.goto('/admin/dashboard');
    await expect(page.getByText('System Admin Dashboard')).toBeVisible();
    await expect(page.getByText('Manage Users')).toBeVisible();
    await expect(page.getByText('Manage Namespaces')).toBeVisible();
    await expect(page.getByText('Manage Sites')).toBeVisible();
  });

  test('Namespace admin should have scoped access', async ({ page, context }) => {
    await setupMockAuth(context, TEST_USERS.namespaceAdmin);
    await page.goto('/admin/dashboard');
    await expect(page.getByText('ISBD Namespace Dashboard')).toBeVisible();
    await expect(page.getByText('Manage Users in ISBD')).toBeVisible();
    await expect(page.getByText('Manage Sites in ISBD')).toBeVisible();
    await expect(page.getByText('Manage Namespaces')).not.toBeVisible();
  });

  test('Site editor should have limited access', async ({ page, context }) => {
    await setupMockAuth(context, TEST_USERS.siteEditor);
    await page.goto('/admin/dashboard');
    await expect(page.getByText('ISBDM Site Dashboard')).toBeVisible();
    await expect(page.getByText('Edit Site Content')).toBeVisible();
    await expect(page.getByText('Manage Users')).not.toBeVisible();
    await expect(page.getByText('Manage Sites')).not.toBeVisible();
  });

  test('Basic user should have no admin access', async ({ page, context }) => {
    await setupMockAuth(context, TEST_USERS.basicUser);
    await page.goto('/admin/dashboard');
    await expect(page.getByText('Access Denied')).toBeVisible();
  });
});
