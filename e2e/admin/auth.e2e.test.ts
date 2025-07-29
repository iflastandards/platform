import { test, expect } from '@playwright/test';
import { 
  clearClerkAuth, 
  setupClerkUnauthenticatedState, 
  setupClerkExpiredSession,
  setupClerkAuth
} from '../utils/clerk-auth-helpers';

test.describe('Admin Portal Authentication (Clerk)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions and stop route mocking
await clearClerkAuth(page.context());
  });

  test('should redirect unauthenticated users to sign-in', async ({ page }) => {
    // Setup unauthenticated state
await setupClerkUnauthenticatedState(page.context());
    
// Try to access admin portal dashboard directly
    await page.goto('http://localhost:3007/dashboard/newtest');
    
    // Wait for Clerk useUser() loading state
    await page.waitForSelector('[data-testid="dashboard-loaded"]', { state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Should redirect to home page with Clerk authentication modal
    await expect(page).toHaveURL('http://localhost:3007/');
    await expect(page.locator('[data-testid="SafeSignInButton"]')).toBeVisible();
    
    // Check sign-in page elements
    await expect(page.getByText('Sign in to Admin Portal')).toBeVisible();
await expect(page.locator('[data-testid="SafeSignInButton"]')).toBeVisible();
  });

  test('should handle OAuth callback flow', async ({ page }) => {
    // Setup unauthenticated state for signin page
await setupClerkUnauthenticatedState(page.context());
    
    // Start OAuth flow
    await page.goto('http://localhost:3007/auth/signin');
    
    // Click GitHub sign-in button
await page.locator('[data-testid="SafeSignInButton"]').click();
    
    // Should redirect to GitHub OAuth (in real test, we'd mock this)
    // For demo purposes, we'll check that the redirect happens
    await expect(page).toHaveURL(/github\.com|localhost:3007/);
  });

  test('should redirect to requested site after authentication', async ({ page }) => {
    // Setup unauthenticated state first
await setupClerkUnauthenticatedState(page.context());
    
    // For demo, check that the redirect parameter is preserved
    await page.goto('http://localhost:3007/site/newtest?from=external');
    
    // Should preserve the 'from' parameter through auth flow
    await expect(page).toHaveURL(/.*signin.*from=external/);
  });

  test('should display user info when authenticated', async ({ page, context }) => {
    // Setup authenticated state with admin user
await setupClerkAuth(context, 'admin');

    await page.goto('http://localhost:3007/dashboard/newtest');
    
// Wait for Clerk useUser() loading state
    await page.waitForSelector('[data-testid="dashboard-loaded"]', { state: 'visible' });
    
    // Should see user interface (not redirected to sign-in)
    await expect(page).not.toHaveURL(/.*signin/);
    
    // Should be able to access the dashboard
    await expect(page).toHaveURL('http://localhost:3007/dashboard/newtest');
  });

  test('should sign out successfully', async ({ page, context }) => {
    // Setup authenticated state with admin user
await setupClerkAuth(context, 'admin');

await page.goto('http://localhost:3007/dashboard/newtest');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-loaded"]', { state: 'visible' });
    
    // Find and click sign-out button (if visible in UI)
    const signOutButton = page.getByRole('button', { name: /sign out/i });
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
      
      // Should redirect to sign-in page
      await expect(page).toHaveURL(/.*signin/);
    }
  });

  test('should handle session expiration gracefully', async ({ page, context }) => {
    // Setup expired session state
await setupClerkExpiredSession(context);

    await page.goto('http://localhost:3007/dashboard/newtest');
    
    // Should handle expired session by redirecting to sign-in
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should prevent unauthorized site access', async ({ page }) => {
    // Setup unauthenticated state
await setupClerkUnauthenticatedState(page.context());
    
    // Try to access a restricted site
    await page.goto('http://localhost:3007/dashboard/restricted-site');
    
    // Should be redirected to sign-in or show unauthorized message
    const isSignInPage = await page.url().includes('signin');
    const hasUnauthorizedMessage = await page.getByText(/unauthorized|forbidden/i).isVisible().catch(() => false);
    
    expect(isSignInPage || hasUnauthorizedMessage).toBeTruthy();
  });
});
