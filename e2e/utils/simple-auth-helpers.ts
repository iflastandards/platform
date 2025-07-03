import { BrowserContext, Page } from '@playwright/test';

/**
 * Simple authentication helper that works by intercepting all authentication-related
 * requests and providing mock responses. This bypasses NextAuth's complex flow.
 */

// Test session data for different user types
export const TEST_USERS = {
  admin: {
    id: 'test-admin-id',
    name: 'Test Admin',
    email: 'admin@test.example.com',
    image: 'https://avatars.githubusercontent.com/u/12345',
    roles: ['site-admin', 'ifla-admin'],
  },
  basicUser: {
    id: 'test-basic-id',
    name: 'Test User',
    email: 'user@test.example.com',
    image: 'https://avatars.githubusercontent.com/u/67890',
    roles: [],
  },
  siteEditor: {
    id: 'test-editor-id',
    name: 'Site Editor',
    email: 'editor@test.example.com',
    image: 'https://avatars.githubusercontent.com/u/54321',
    roles: ['portal-editor', 'newtest-admin'],
  },
  unauthenticated: null,
};

/**
 * Set up authentication state by intercepting all auth-related requests
 */
export async function setupAuthState(
  context: BrowserContext,
  userType: keyof typeof TEST_USERS
) {
  const userData = TEST_USERS[userType];
  
  // Create mock session if user is authenticated
  const mockSession = userData ? {
    user: userData,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  } : null;

  // Intercept NextAuth session endpoint
  await context.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSession),
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });
  });

  // Intercept NextAuth providers endpoint
  await context.route('**/api/auth/providers', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        github: {
          id: 'github',
          name: 'GitHub',
          type: 'oauth',
          signinUrl: 'http://localhost:3007/api/auth/signin/github',
          callbackUrl: 'http://localhost:3007/api/auth/callback/github',
        },
      }),
    });
  });

  // Intercept CSRF token endpoint
  await context.route('**/api/auth/csrf', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        csrfToken: 'mock-csrf-token-' + Date.now(),
      }),
    });
  });

  // Intercept signin requests
  await context.route('**/api/auth/signin/**', async (route) => {
    // Redirect to GitHub OAuth for demo
    await route.fulfill({
      status: 302,
      headers: {
        'Location': 'https://github.com/login/oauth/authorize?client_id=test',
      },
    });
  });

  // Intercept signout requests
  await context.route('**/api/auth/signout', async (route) => {
    // Clear session and redirect to signin
    await route.fulfill({
      status: 302,
      headers: {
        'Location': '/auth/signin',
      },
    });
  });

  // Set appropriate session cookie if authenticated
  if (userData) {
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: `test-session-${userType}-${Date.now()}`,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        expires: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      },
    ]);
  }

  return mockSession;
}

/**
 * Clear all authentication state and stop route interception
 */
export async function clearAuthState(context: BrowserContext) {
  await context.clearCookies();
  
  // Stop intercepting auth endpoints
  await context.unroute('**/api/auth/session');
  await context.unroute('**/api/auth/providers');
  await context.unroute('**/api/auth/csrf');
  await context.unroute('**/api/auth/signin/**');
  await context.unroute('**/api/auth/signout');
}

/**
 * Wait for the page to load and authentication state to be resolved
 */
export async function waitForAuthState(page: Page, timeout = 5000) {
  // Wait for any ongoing navigation to complete
  await page.waitForLoadState('networkidle', { timeout });
  
  // Give NextAuth time to resolve session
  await page.waitForTimeout(500);
}

/**
 * Helper to verify authentication state in tests
 */
export async function verifyAuthState(
  page: Page,
  expectedState: 'authenticated' | 'unauthenticated'
) {
  const currentUrl = page.url();
  
  if (expectedState === 'authenticated') {
    // Should not be on signin page
    if (currentUrl.includes('/auth/signin')) {
      throw new Error(`Expected authenticated state but got signin page: ${currentUrl}`);
    }
  } else {
    // Should be on signin page
    if (!currentUrl.includes('/auth/signin')) {
      throw new Error(`Expected unauthenticated state but not on signin page: ${currentUrl}`);
    }
  }
}