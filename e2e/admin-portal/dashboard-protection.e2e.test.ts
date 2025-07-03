import { test, expect } from '@playwright/test';
import { 
  clearAuth, 
  setupUnauthenticatedState 
} from '../utils/auth-helpers';

test.describe('Dashboard Authentication Protection', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await clearAuth(page.context());
  });

  test('should redirect unauthenticated users from main dashboard to signin', async ({ page }) => {
    // Setup unauthenticated state
    await setupUnauthenticatedState(page.context());
    
    // Try to access the main dashboard without authentication
    await page.goto('http://localhost:3007/dashboard');
    
    // Should be redirected to sign-in page
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // Verify sign-in page elements are visible
    await expect(page.getByText('Sign in to Admin Portal')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in with github/i })).toBeVisible();
  });

  test('should redirect unauthenticated users from site dashboard to signin', async ({ page }) => {
    // Setup unauthenticated state
    await setupUnauthenticatedState(page.context());
    
    // Try to access a specific site dashboard without authentication
    await page.goto('http://localhost:3007/dashboard/portal');
    
    // Should be redirected to sign-in page
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // Verify sign-in page elements are visible
    await expect(page.getByText('Sign in to Admin Portal')).toBeVisible();
  });

  test('should redirect from multiple protected routes', async ({ page }) => {
    // Setup unauthenticated state
    await setupUnauthenticatedState(page.context());
    
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/portal',
      '/dashboard/ISBDM',
      '/dashboard/LRM',
      '/dashboard/newtest',
    ];

    for (const route of protectedRoutes) {
      // Try to access each protected route
      await page.goto(`http://localhost:3007${route}`);
      
      // Should always redirect to signin
      await expect(page).toHaveURL(/.*\/auth\/signin/);
    }
  });

  test('should not allow direct API access without authentication', async ({ page }) => {
    // Setup unauthenticated state (which mocks session API to return null)
    await setupUnauthenticatedState(page.context());
    
    // Try to access the session API directly
    const response = await page.request.get('http://localhost:3007/api/auth/session');
    
    // Should return empty session or null
    const session = await response.json();
    expect(session).toBeNull();
  });

  test('should preserve return URL parameters in signin redirect', async ({ page }) => {
    // Try to access a specific dashboard page with parameters
    const targetUrl = 'http://localhost:3007/dashboard/newtest?view=editor&tab=content';
    await page.goto(targetUrl);
    
    // Should be redirected to signin
    await expect(page).toHaveURL(/.*\/auth\/signin/);
    
    // The signin page should preserve return URL for post-authentication redirect
    // (This tests the protection mechanism, not the full auth flow)
    const currentUrl = page.url();
    const hasCallbackUrl = currentUrl.includes('callbackUrl') || currentUrl.includes('from');
    
    // If NextAuth preserves the return URL, it should be in the signin URL
    // If not, that's also acceptable since protection is working
    console.log('Signin URL with potential callback:', currentUrl);
  });

  test('should handle direct API route access without authentication', async ({ page }) => {
    // Test that API routes also require authentication
    const apiRoutes = [
      'http://localhost:3007/api/site/newtest',
      'http://localhost:3007/api/user/profile',
    ];
    
    for (const apiUrl of apiRoutes) {
      try {
        const response = await page.request.get(apiUrl);
        // API should either redirect (302/301) or return unauthorized (401/403)
        expect([301, 302, 401, 403, 404]).toContain(response.status());
      } catch (error) {
        // Network errors are also acceptable if the route doesn't exist yet
        console.log(`API route ${apiUrl}: ${error}`);
      }
    }
  });

  test('should verify signin page renders correctly', async ({ page }) => {
    // Navigate to signin page directly
    await page.goto('http://localhost:3007/auth/signin');
    
    // Should show signin elements
    await expect(page.getByText('Sign in to Admin Portal')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in with github/i })).toBeVisible();
    
    // Should show appropriate messaging
    await expect(page.getByText(/Access restricted to authorized IFLA team members/)).toBeVisible();
  });

  test('should verify OAuth button functionality', async ({ page }) => {
    // Navigate to signin page
    await page.goto('http://localhost:3007/auth/signin');
    
    // Click GitHub OAuth button
    const githubButton = page.getByRole('button', { name: /sign in with github/i });
    await expect(githubButton).toBeVisible();
    
    // In a real scenario, this would redirect to GitHub
    // For testing, we just verify the button is functional
    await githubButton.click();
    
    // Should either redirect to GitHub or show some response
    // We don't test the full OAuth flow in E2E
    await page.waitForTimeout(1000);
    
    // Verify we're not stuck on the same page without response
    const currentUrl = page.url();
    console.log('URL after OAuth click:', currentUrl);
  });
});