import { test, expect } from '@playwright/test';
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';
import { setupClerkAuth, clearClerkAuth } from '../utils/clerk-auth-helpers';
import selectors from '../selectors';

test.describe('Cross-Site Authentication Communication (Clerk)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adminConfig: any;
  
  test.beforeAll(async () => {
    // Get admin portal configuration for local environment
    adminConfig = getAdminPortalConfig('local');
  });

  test.beforeEach(async ({ page }) => {
    // Clear any existing Clerk sessions and localStorage
    await clearClerkAuth(page.context());
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

    // Step 2: Set up Clerk authentication
    await setupClerkAuth(context, 'admin');
    
    // Navigate to admin portal dashboard to establish session
    await page.goto(adminConfig.dashboardUrl);
    
    // Wait for Clerk useUser() loading state
    await page.waitForSelector('[data-testid="dashboard-loaded"]', { state: 'visible' });
    
    // Verify we're authenticated in admin portal
    await expect(page).not.toHaveURL(/.*signin/);
    
    // Step 3: Return to newtest site and verify authentication is reflected
    await page.goto('http://localhost:3008/newtest/');
    
    // Wait for Clerk auth status to be checked and updated across sites
    await page.waitForTimeout(2000); // Give time for Clerk session sync
    
    // Check if the navbar now shows authenticated state
    // Look for user account button or authenticated user interface
    const accountButton = page.getByRole(selectors.auth.accountButton.role, selectors.auth.accountButton);
    
    // Either the account button should be visible or the login link should be gone
    const isAuthenticated = await accountButton.isVisible();
    const loginLinkGone = !(await loginLink.isVisible());
    
    expect(isAuthenticated || loginLinkGone).toBeTruthy();
  });

  test('should reflect admin logout status in newtest navbar', async ({ page, context }) => {
    // Step 1: Start with Clerk authenticated state
    await setupClerkAuth(context, 'admin');

    // Navigate to newtest site and verify authenticated state
    await page.goto('http://localhost:3008/newtest/');
    await page.waitForTimeout(2000); // Give time for Clerk session sync

    // Step 2: Navigate to admin portal and sign out
    await page.goto(adminConfig.dashboardUrl);
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-loaded"]', { state: 'visible' });
    
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

    // Step 2: Open admin portal in new tab and authenticate with Clerk
    const adminPage = await context.newPage();
    await setupClerkAuth(context, 'admin');
    
    await adminPage.goto(adminConfig.dashboardUrl);
    await adminPage.waitForSelector('[data-testid="dashboard-loaded"]', { state: 'visible' });
    await expect(adminPage).not.toHaveURL(/.*signin/);

    // Step 3: Trigger Clerk session sync across tabs
    await adminPage.evaluate(() => {
      // Clerk handles cross-tab synchronization automatically
      // Simulate Clerk's cross-tab communication by dispatching custom event
      window.dispatchEvent(new CustomEvent('clerk:session-updated', {
        detail: {
          isAuthenticated: true,
          user: {
            firstName: 'Test',
            lastName: 'Admin',
            emailAddresses: [{ emailAddress: 'admin@example.com' }]
          }
        }
      }));
    });

    // Step 4: Return to newtest tab and verify authentication is reflected
    await page.bringToFront();
    await page.waitForTimeout(1000); // Give time for storage event to propagate
    
    // Trigger a focus event to simulate user returning to tab
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForTimeout(1000);

    // Check if authentication state is updated
    const accountButton = page.getByRole(selectors.auth.accountButton.role, selectors.auth.accountButton);
    
    const isAuthenticated = await accountButton.isVisible();
    const loginLinkGone = !(await loginLink.isVisible());
    
    expect(isAuthenticated || loginLinkGone).toBeTruthy();

    // Clean up
    await adminPage.close();
  });

  test('should maintain authentication state across page reloads', async ({ page, context }) => {
    // Step 1: Authenticate with Clerk
    await setupClerkAuth(context, 'admin');

    await page.goto(adminConfig.dashboardUrl);
    await page.waitForSelector('[data-testid="dashboard-loaded"]', { state: 'visible' });
    await expect(page).not.toHaveURL(/.*signin/);

    // Step 2: Navigate to newtest and wait for auth state to be established
    await page.goto('http://localhost:3008/newtest/');
    await page.waitForTimeout(2000); // Allow time for session check

    // Step 3: Reload the newtest page
    await page.reload();
    await page.waitForTimeout(2000); // Allow time for session recheck

    // Step 4: Verify authentication state is maintained
    const loginLink = page.getByRole('link', { name: /editor login/i });
    const accountButton = page.getByRole(selectors.auth.accountButton.role, selectors.auth.accountButton);
    
    // Should either show authenticated UI or not show login link
    const isAuthenticated = await accountButton.isVisible();
    const loginLinkGone = !(await loginLink.isVisible());
    
    expect(isAuthenticated || loginLinkGone).toBeTruthy();
  });

  test('should handle authentication errors gracefully', async ({ page, context }) => {
    // Step 1: Set up Clerk with cleared/invalid session state
    await clearClerkAuth(context);
    
    // Simulate an expired Clerk session by clearing auth state
    await context.addInitScript(() => {
      // Clear Clerk session data to simulate expired state
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('__clerk') || key.includes('clerk')) {
          localStorage.removeItem(key);
        }
      });
    });

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
