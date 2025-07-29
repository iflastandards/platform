import { test, expect } from '@playwright/test';
import { setupClerkAuth } from '../utils/clerk-auth-helpers';
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';
import selectors from '../selectors';

// Get the admin portal configuration for local environment
const adminConfig = getAdminPortalConfig('local');

test.describe('Role-Based Access Control for "newtest" namespace (Clerk)', () => {

  test('Site footer has management link pointing to admin dashboard', async ({ page }) => {
    // Navigate to the newtest site
    await page.goto('http://localhost:3008/newtest/');
    
    // Find the management link in the footer
    const managementLink = page.getByRole(selectors.sites.managementLink.role, selectors.sites.managementLink);
    
    // Verify the link has the correct href attribute for the admin dashboard (using updated path structure)
    const expectedDashboardUrl = 'http://localhost:3007/dashboard/newtest';
    await expect(managementLink).toHaveAttribute('href', expectedDashboardUrl);
    
    // Verify the link opens in the same tab (not target="_blank")
    await expect(managementLink).not.toHaveAttribute('target', '_blank');
  });

  test('Management link clicking redirects unauthenticated users to signin', async ({ page }) => {
    // Navigate to the newtest site
    await page.goto('http://localhost:3008/newtest/');
    
    // Find and click the management link in the footer
    const managementLink = page.getByRole(selectors.sites.managementLink.role, selectors.sites.managementLink);
    await expect(managementLink).toBeVisible();
    
    // Click the management link
    await managementLink.click();
    
    // Verify we're redirected to the admin portal signin page (because the dashboard requires auth)
    await expect(page).toHaveURL(adminConfig.signinUrl);
  });

  test('Role [namespace_admin]: Sees all admin and editor controls', async ({ browser }) => {
    const context = await browser.newContext();
    await setupClerkAuth(context, 'systemAdmin');
    const page = await context.newPage();
await page.goto(selectors.dashboard.routes.namespace('newtest'));

await expect(page.getByRole(selectors.dashboard.actions.publishVersion.role, selectors.dashboard.actions.publishVersion)).toBeVisible();
await expect(page.getByRole(selectors.dashboard.actions.manageUsers.role, selectors.dashboard.actions.manageUsers)).toBeVisible();
await expect(page.getByRole(selectors.dashboard.actions.editContent.role, selectors.dashboard.actions.editContent)).toBeVisible();
    await page.close();
  });

  test('Role [namespace_editor]: Sees editor controls but not admin controls', async ({ browser }) => {
    const context = await browser.newContext();
    await setupClerkAuth(context, 'siteEditor');
    const page = await context.newPage();
await page.goto(selectors.dashboard.routes.namespace('newtest'));

await expect(page.getByRole(selectors.dashboard.actions.editContent.role, selectors.dashboard.actions.editContent)).toBeVisible();
    await expect(page.getByRole(selectors.dashboard.actions.sheetsToRdf.role, selectors.dashboard.actions.sheetsToRdf)).toBeVisible();
    await expect(page.getByRole(selectors.dashboard.actions.publishVersion.role, selectors.dashboard.actions.publishVersion)).not.toBeVisible();
    await expect(page.getByRole(selectors.dashboard.actions.manageUsers.role, selectors.dashboard.actions.manageUsers)).not.toBeVisible();
    await page.close();
  });

  test('Role [namespace_reviewer]: Sees review controls but not edit/admin controls', async ({ browser }) => {
    const context = await browser.newContext();
    await setupClerkAuth(context, 'reviewer');
    const page = await context.newPage();
await page.goto(selectors.dashboard.routes.namespace('newtest'));

    await expect(page.getByRole(selectors.dashboard.actions.viewPullRequests.role, selectors.dashboard.actions.viewPullRequests)).toBeVisible();
    await expect(page.getByRole(selectors.dashboard.actions.editContent.role, selectors.dashboard.actions.editContent)).not.toBeVisible();
    await expect(page.getByRole(selectors.dashboard.actions.publishVersion.role, selectors.dashboard.actions.publishVersion)).not.toBeVisible();
    await page.close();
  });
  
  test('Role [namespace_translator]: Sees translate controls but not edit/admin controls', async ({ browser }) => {
    const context = await browser.newContext();
    await setupClerkAuth(context, 'translator');
    const page = await context.newPage();
await page.goto(selectors.dashboard.routes.namespace('newtest'));

    await expect(page.getByRole(selectors.dashboard.actions.translateContent.role, selectors.dashboard.actions.translateContent)).toBeVisible();
    await expect(page.getByRole(selectors.dashboard.actions.editContent.role, selectors.dashboard.actions.editContent)).not.toBeVisible();
    await expect(page.getByRole(selectors.dashboard.actions.publishVersion.role, selectors.dashboard.actions.publishVersion)).not.toBeVisible();
    await page.close();
  });

  test('Access Denied: User with no roles for "newtest" is denied access', async ({ browser }) => {
    const context = await browser.newContext();
    // Use a user role that doesn't have access to 'newtest'
    await setupClerkAuth(context, 'siteEditor'); // This user won't have newtest access
    const page = await context.newPage();
await page.goto(selectors.dashboard.routes.namespace('newtest'));

    await expect(page.getByText(selectors.validation.textPatterns.accessDenied)).toBeVisible();
    await page.close();
  });


  test('Multi-role user: Can switch between different namespace dashboards', async ({ browser }) => {
    const context = await browser.newContext();
    // Use systemAdmin which should have access to all namespaces
    await setupClerkAuth(context, 'systemAdmin');
    const page = await context.newPage();
    
    // Navigate to newtest as editor
    await page.goto(selectors.dashboard.routes.namespace('newtest'));
    await expect(page.getByRole(selectors.dashboard.actions.editContent.role, selectors.dashboard.actions.editContent)).toBeVisible();
    await expect(page.getByRole(selectors.dashboard.actions.publishVersion.role, selectors.dashboard.actions.publishVersion)).not.toBeVisible();
    
    // Navigate to isbd as admin
    await page.goto(selectors.dashboard.routes.namespace('isbd'));
    await expect(page.getByRole(selectors.dashboard.actions.publishVersion.role, selectors.dashboard.actions.publishVersion)).toBeVisible();
    await expect(page.getByRole(selectors.dashboard.actions.manageUsers.role, selectors.dashboard.actions.manageUsers)).toBeVisible();
    
    // Navigate to unimarc as reviewer
    await page.goto(selectors.dashboard.routes.namespace('unimarc'));
    await expect(page.getByRole(selectors.dashboard.actions.viewPullRequests.role, selectors.dashboard.actions.viewPullRequests)).toBeVisible();
    await expect(page.getByRole(selectors.dashboard.actions.editContent.role, selectors.dashboard.actions.editContent)).not.toBeVisible();
    
    await page.close();
  });
});

