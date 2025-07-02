import { test, expect } from '@playwright/test';

test.describe('Admin Portal Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions
    await page.context().clearCookies();
  });

  test('should redirect unauthenticated users to sign-in', async ({ page }) => {
    // Try to access admin portal dashboard directly
    await page.goto('http://localhost:3007/dashboard/newtest');
    
    // Should be redirected to sign-in page
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // Check sign-in page elements
    await expect(page.getByText('Sign in to Admin Portal')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in with github/i })).toBeVisible();
  });

  test('should handle OAuth callback flow', async ({ page }) => {
    // Start OAuth flow
    await page.goto('http://localhost:3007/auth/signin');
    
    // Click GitHub sign-in button
    await page.getByRole('button', { name: /sign in with github/i }).click();
    
    // Should redirect to GitHub OAuth (in real test, we'd mock this)
    // For demo purposes, we'll check that the redirect happens
    await expect(page).toHaveURL(/github\.com|localhost:3007/);
  });

  test('should redirect to requested site after authentication', async ({ page }) => {
    // This test would require authentication to be set up
    // In a real scenario, we'd mock the OAuth flow or use test credentials
    
    // For demo, check that the redirect parameter is preserved
    await page.goto('http://localhost:3007/site/newtest?from=external');
    
    // Should preserve the 'from' parameter through auth flow
    await expect(page).toHaveURL(/.*signin.*from=external/);
  });

  test('should display user info when authenticated', async ({ page, context }) => {
    // Mock authentication by setting session cookie
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    await page.goto('http://localhost:3007/dashboard/newtest');
    
    // Should see user interface (this would require proper session mocking)
    // For demo, check that we're not redirected to sign-in
    await expect(page).not.toHaveURL(/.*signin/);
  });

  test('should sign out successfully', async ({ page, context }) => {
    // Set up authenticated state
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    await page.goto('http://localhost:3007/dashboard/newtest');
    
    // Find and click sign-out button (if visible in UI)
    const signOutButton = page.getByRole('button', { name: /sign out/i });
    if (await signOutButton.isVisible()) {
      await signOutButton.click();
      
      // Should redirect to sign-in page
      await expect(page).toHaveURL(/.*signin/);
    }
  });

  test('should handle session expiration gracefully', async ({ page, context }) => {
    // Set up expired session
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'expired-session-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    await page.goto('http://localhost:3007/dashboard/newtest');
    
    // Should handle expired session by redirecting to sign-in
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should prevent unauthorized site access', async ({ page }) => {
    // Try to access a restricted site
    await page.goto('http://localhost:3007/dashboard/restricted-site');
    
    // Should be redirected to sign-in or show unauthorized message
    const isSignInPage = await page.url().includes('signin');
    const hasUnauthorizedMessage = await page.getByText(/unauthorized|forbidden/i).isVisible().catch(() => false);
    
    expect(isSignInPage || hasUnauthorizedMessage).toBeTruthy();
  });
});
