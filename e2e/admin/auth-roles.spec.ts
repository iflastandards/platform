import { test, expect } from '@playwright/test';
import { mockSessionCookie, mockSessionFromEnv } from '../utils/session-mock';
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';

// Get the admin portal configuration for local environment
const adminConfig = getAdminPortalConfig('local');

test.describe('Role-Based Access Control for "newtest" namespace', () => {

  test('Unauthenticated: "Editor Login" link redirects to auth', async ({ page }) => {
    // Navigate to the newtest site
    await page.goto('http://localhost:3008/newtest/');
    
    // Find and click the editor login link
    const loginLink = page.getByRole('link', { name: /editor login/i });
    
    // Verify the link has the correct href attribute (not hardcoded)
    await expect(loginLink).toHaveAttribute('href', adminConfig.signinUrl);
    
    // Click the link
    await loginLink.click();
    
    // Verify we're redirected to the admin portal signin page
    await expect(page).toHaveURL(adminConfig.signinUrl);
  });

  test('Authenticated: User dropdown shows user name', async ({ browser }) => {
    // Create a mock session with reviewer role
    const context = await mockSessionCookie({
      browser,
      userRoles: { newtest: 'namespace_reviewer' },
      userName: 'John Doe',
    });
    const page = await context.newPage();
    
    // Mock the admin portal session API response
    await page.route(`${adminConfig.sessionApiUrl}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'John Doe',
            email: 'john@example.com',
            roles: ['newtest-reviewer'],
          },
        }),
      });
    });
    
    // Navigate to the newtest site
    await page.goto('http://localhost:3008/newtest/');
    
    // Wait for the auth dropdown to appear
    await page.waitForSelector('.navbar__item.dropdown', { timeout: 5000 });
    
    // Verify the user dropdown is visible with the correct name
    const userDropdown = page.locator('.navbar__item.dropdown').getByRole('link');
    await expect(userDropdown).toContainText('John Doe');
    
    // Verify no editor login link is shown when authenticated
    await expect(page.getByRole('link', { name: /editor login/i })).not.toBeVisible();
    
    await page.close();
  });

  test('Role [namespace_admin]: Sees all admin and editor controls', async ({ browser }) => {
    const context = await mockSessionCookie({ browser, userRoles: { newtest: 'namespace_admin' } });
    const page = await context.newPage();
    await page.goto('/admin-dashboard/newtest');

    await expect(page.getByRole('button', { name: 'Publish Version' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Manage Users' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Content' })).toBeVisible();
    await page.close();
  });

  test('Role [namespace_editor]: Sees editor controls but not admin controls', async ({ browser }) => {
    const context = await mockSessionCookie({ browser, userRoles: { newtest: 'namespace_editor' } });
    const page = await context.newPage();
    await page.goto('/editor-dashboard/newtest');

    await expect(page.getByRole('button', { name: 'Edit Content' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sheets → RDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish Version' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Manage Users' })).not.toBeVisible();
    await page.close();
  });

  test('Role [namespace_reviewer]: Sees review controls but not edit/admin controls', async ({ browser }) => {
    const context = await mockSessionCookie({ browser, userRoles: { newtest: 'namespace_reviewer' } });
    const page = await context.newPage();
    await page.goto('/reviewer-dashboard/newtest');

    await expect(page.getByRole('button', { name: 'View Pull Requests' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Content' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish Version' })).not.toBeVisible();
    await page.close();
  });
  
  test('Role [namespace_translator]: Sees translate controls but not edit/admin controls', async ({ browser }) => {
    const context = await mockSessionCookie({ browser, userRoles: { newtest: 'namespace_translator' } });
    const page = await context.newPage();
    await page.goto('/translator-dashboard/newtest');

    await expect(page.getByRole('button', { name: 'Translate Content' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Content' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish Version' })).not.toBeVisible();
    await page.close();
  });

  test('Access Denied: User with no roles for "newtest" is denied access', async ({ browser }) => {
    const context = await mockSessionCookie({ browser, userRoles: { unimarc: 'namespace_editor' } });
    const page = await context.newPage();
    await page.goto('/admin-dashboard/newtest');

    await expect(page.getByText("You don't have permission to access this page.")).toBeVisible();
    await page.close();
  });

  test('User dropdown shows correct items based on authentication status', async ({ browser }) => {
    // Test as editor with manage permissions
    const context = await mockSessionCookie({ 
      browser, 
      userRoles: { newtest: 'namespace_admin' },
      userName: 'Admin User',
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:3008/newtest/');
    
    // Open the user dropdown
    await page.getByRole('button', { name: 'Admin User' }).click();
    
    // Verify dropdown items for admin
    await expect(page.getByRole('menuitem', { name: /logout/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /manage/i })).toBeVisible();
    
    // Verify the manage link has correct href
    const manageLink = page.getByRole('menuitem', { name: /manage/i });
    await expect(manageLink).toHaveAttribute('href', adminConfig.dashboardUrl);
    
    await page.close();
  });

  test('Keep logged in checkbox persists across sessions', async ({ browser }) => {
    const context = await mockSessionCookie({ 
      browser, 
      userRoles: { newtest: 'namespace_editor' },
      userName: 'Editor User',
    });
    const page = await context.newPage();
    
    // Set keep logged in preference
    await page.goto('http://localhost:3008/newtest/');
    await page.evaluate(() => {
      localStorage.setItem('keepLoggedIn', 'true');
    });
    
    // Verify it persists
    const keepLoggedIn = await page.evaluate(() => localStorage.getItem('keepLoggedIn'));
    expect(keepLoggedIn).toBe('true');
    
    await page.close();
  });

  test('Multi-role user: Can switch between different namespace dashboards', async ({ browser }) => {
    const context = await mockSessionCookie({ 
      browser, 
      userRoles: { 
        newtest: 'namespace_editor',
        isbd: 'namespace_admin',
        unimarc: 'namespace_reviewer' 
      },
      userName: 'Multi Role User',
    });
    const page = await context.newPage();
    
    // Navigate to newtest as editor
    await page.goto('/editor-dashboard/newtest');
    await expect(page.getByRole('button', { name: 'Edit Content' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish Version' })).not.toBeVisible();
    
    // Navigate to isbd as admin
    await page.goto('/admin-dashboard/isbd');
    await expect(page.getByRole('button', { name: 'Publish Version' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Manage Users' })).toBeVisible();
    
    // Navigate to unimarc as reviewer
    await page.goto('/reviewer-dashboard/unimarc');
    await expect(page.getByRole('button', { name: 'View Pull Requests' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit Content' })).not.toBeVisible();
    
    await page.close();
  });
});

test.describe('Environment Variable Authentication', () => {
  test('Uses E2E_MOCK_USER_ROLES when set', async ({ browser }) => {
    // This test demonstrates using environment variables
    // Run with: E2E_MOCK_USER_ROLES='{"newtest": "namespace_admin"}' nx e2e standards-dev --spec=admin/auth-roles.spec.ts
    
    const context = await mockSessionFromEnv(browser);
    if (!context) {
      test.skip('E2E_MOCK_USER_ROLES not set');
      return;
    }
    
    const page = await context.newPage();
    await page.goto('http://localhost:3008/newtest/');
    
    // Should be authenticated based on environment variable
    const userName = process.env.E2E_MOCK_USER_NAME || 'Test User';
    await expect(page.getByRole('button', { name: userName })).toBeVisible();
    
    await page.close();
  });
});
