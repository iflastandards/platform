import { test, expect } from '@playwright/test';
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';

test.describe('Cross-Site Authentication Communication', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adminConfig: any;
  
  test.beforeAll(async () => {
    // Get admin portal configuration for local environment
    adminConfig = getAdminPortalConfig('local');
  });

  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions and localStorage
    await page.context().clearCookies();
    // Navigate to a page first, then clear localStorage
    await page.goto('http://localhost:3008/newtest/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should reflect admin login status in newtest navbar', async ({ page, context }) => {
    // Step 1: Start at newtest site and verify no authentication
    await page.goto('http://localhost:3008/newtest/');
    
    // Wait for the site to load
    await expect(page.getByText('New Test Site')).toBeVisible();
    
    // Check that the navbar shows "Editor Login" (not authenticated)
    const loginLink = page.getByRole('link', { name: /editor login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', adminConfig.signinUrl);
    
    // Ensure it's NOT using hardcoded placeholder URLs (regression test)
    await expect(loginLink).not.toHaveAttribute('href', 'https://your-next-app.com/login');
    await expect(loginLink).not.toHaveAttribute('href', 'http://localhost:3007/signin'); // Missing /auth prefix
    await expect(loginLink).not.toHaveAttribute('href', 'http://localhost:3001/auth/signin'); // Wrong port

    // Step 2: Navigate to admin portal and mock authentication
    await page.goto(adminConfig.signinUrl);
    
    // Mock successful authentication by setting session cookie
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-site-admin-session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    // Navigate to admin portal dashboard to establish session
    await page.goto(adminConfig.dashboardUrl);
    
    // Verify we're authenticated in admin portal
    await expect(page).not.toHaveURL(/.*signin/);
    
    // Step 3: Return to newtest site and verify authentication is reflected
    await page.goto('http://localhost:3008/newtest/');
    
    // Wait for the auth status to be checked and updated
    // The useAdminSession hook should detect the session and update localStorage
    await page.waitForTimeout(2000); // Give time for session check
    
    // Check if the navbar now shows authenticated state
    // Look for user dropdown or authenticated user interface
    const userDropdown = page.locator('.navbar__item.dropdown');
    const accountButton = page.getByRole('button', { name: /account/i });
    
    // Either the dropdown should be visible or the login link should be gone
    const isAuthenticated = await userDropdown.isVisible() || await accountButton.isVisible();
    const loginLinkGone = !(await loginLink.isVisible());
    
    expect(isAuthenticated || loginLinkGone).toBeTruthy();
  });

  test('should reflect admin logout status in newtest navbar', async ({ page, context }) => {
    // Step 1: Start with authenticated state
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-site-admin-session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    // Set up localStorage to simulate authenticated state
    await page.goto('http://localhost:3008/newtest/');
    await page.evaluate(() => {
      const authStatus = {
        isAuthenticated: true,
        username: 'Test Admin',
        teams: ['site-admin'],
        keepMeLoggedIn: false,
        loading: false
      };
      localStorage.setItem('authStatus', JSON.stringify(authStatus));
    });

    // Reload to apply the auth state
    await page.reload();
    await page.waitForTimeout(1000);

    // Step 2: Navigate to admin portal and sign out
    await page.goto(adminConfig.dashboardUrl);
    
    // Look for sign out button and click it
    const signOutButton = page.getByRole('button', { name: /sign out/i });
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
    } else {
      // Alternative: navigate to signout endpoint directly
      await page.goto(adminConfig.signoutUrl);
    }
    
    // Verify we're signed out (redirected to signin page)
    await expect(page).toHaveURL(/.*signin/);

    // Step 3: Return to newtest site and verify logout is reflected
    await page.goto('http://localhost:3008/newtest/');
    
    // Wait for the auth status to be updated
    await page.waitForTimeout(2000);
    
    // Check that the navbar shows "Editor Login" again (not authenticated)
    const loginLink = page.getByRole('link', { name: /editor login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', adminConfig.signinUrl);
    
    // Ensure it's NOT using hardcoded placeholder URLs (regression test)
    await expect(loginLink).not.toHaveAttribute('href', 'https://your-next-app.com/logout');
    await expect(loginLink).not.toHaveAttribute('href', 'http://localhost:3007/signin'); // Missing /auth prefix
    await expect(loginLink).not.toHaveAttribute('href', 'http://localhost:3001/auth/signin'); // Wrong port
  });

  test('should handle cross-tab authentication synchronization', async ({ page, context }) => {
    // Step 1: Open newtest site in first tab
    await page.goto('http://localhost:3008/newtest/');
    await expect(page.getByText('New Test Site')).toBeVisible();
    
    // Verify initial unauthenticated state
    const loginLink = page.getByRole('link', { name: /editor login/i });
    await expect(loginLink).toBeVisible();

    // Step 2: Open admin portal in new tab and authenticate
    const adminPage = await context.newPage();
    await adminPage.goto(adminConfig.signinUrl);
    
    // Mock authentication
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-site-admin-session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    await adminPage.goto(adminConfig.dashboardUrl);
    await expect(adminPage).not.toHaveURL(/.*signin/);

    // Step 3: Trigger storage event to simulate cross-tab communication
    await adminPage.evaluate(() => {
      const authStatus = {
        isAuthenticated: true,
        username: 'Test Admin',
        teams: ['site-admin'],
        keepMeLoggedIn: false,
        loading: false
      };
      localStorage.setItem('authStatus', JSON.stringify(authStatus));
      
      // Dispatch storage event for cross-tab communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'authStatus',
        newValue: JSON.stringify(authStatus)
      }));
    });

    // Step 4: Return to newtest tab and verify authentication is reflected
    await page.bringToFront();
    await page.waitForTimeout(1000); // Give time for storage event to propagate
    
    // Trigger a focus event to simulate user returning to tab
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForTimeout(1000);

    // Check if authentication state is updated
    const userDropdown = page.locator('.navbar__item.dropdown');
    const accountButton = page.getByRole('button', { name: /account/i });
    
    const isAuthenticated = await userDropdown.isVisible() || await accountButton.isVisible();
    const loginLinkGone = !(await loginLink.isVisible());
    
    expect(isAuthenticated || loginLinkGone).toBeTruthy();

    // Clean up
    await adminPage.close();
  });

  test('should maintain authentication state across page reloads', async ({ page, context }) => {
    // Step 1: Authenticate in admin portal
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-site-admin-session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    await page.goto(adminConfig.dashboardUrl);
    await expect(page).not.toHaveURL(/.*signin/);

    // Step 2: Navigate to newtest and wait for auth state to be established
    await page.goto('http://localhost:3008/newtest/');
    await page.waitForTimeout(2000); // Allow time for session check

    // Step 3: Reload the newtest page
    await page.reload();
    await page.waitForTimeout(2000); // Allow time for session recheck

    // Step 4: Verify authentication state is maintained
    const loginLink = page.getByRole('link', { name: /editor login/i });
    const userDropdown = page.locator('.navbar__item.dropdown');
    const accountButton = page.getByRole('button', { name: /account/i });
    
    // Should either show authenticated UI or not show login link
    const isAuthenticated = await userDropdown.isVisible() || await accountButton.isVisible();
    const loginLinkGone = !(await loginLink.isVisible());
    
    expect(isAuthenticated || loginLinkGone).toBeTruthy();
  });

  test('should handle authentication errors gracefully', async ({ page, context }) => {
    // Step 1: Set up invalid/expired session
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'invalid-expired-session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    // Step 2: Navigate to newtest site
    await page.goto('http://localhost:3008/newtest/');
    await page.waitForTimeout(2000); // Allow time for session check to fail

    // Step 3: Verify fallback to unauthenticated state
    const loginLink = page.getByRole('link', { name: /editor login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', adminConfig.signinUrl);
    
    // Ensure it's NOT using hardcoded placeholder URLs (regression test)
    await expect(loginLink).not.toHaveAttribute('href', 'https://your-next-app.com/login');
    await expect(loginLink).not.toHaveAttribute('href', 'http://localhost:3007/signin'); // Missing /auth prefix

    // Step 4: Verify no error messages are shown to user
    const errorMessage = page.getByText(/error|failed|unauthorized/i);
    await expect(errorMessage).not.toBeVisible();
  });
});
