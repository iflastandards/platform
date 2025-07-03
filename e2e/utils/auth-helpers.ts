import { BrowserContext } from '@playwright/test';

// Test session data for different user types
export const TEST_SESSIONS = {
  admin: {
    name: 'Test Admin',
    email: 'admin@test.example.com',
    image: 'https://avatars.githubusercontent.com/u/12345',
    roles: ['site-admin', 'ifla-admin'],
  },
  basicUser: {
    name: 'Test User',
    email: 'user@test.example.com',
    image: 'https://avatars.githubusercontent.com/u/67890',
    roles: [],
  },
  siteEditor: {
    name: 'Site Editor',
    email: 'editor@test.example.com',
    image: 'https://avatars.githubusercontent.com/u/54321',
    roles: ['portal-editor', 'newtest-admin'],
  },
};

/**
 * Mock NextAuth session by setting up session cookies and intercepting API calls
 * This approach works with NextAuth by mocking the session API endpoint
 */
export async function setupMockAuth(
  context: BrowserContext,
  sessionType: keyof typeof TEST_SESSIONS
) {
  const sessionData = TEST_SESSIONS[sessionType];
  
  // Create a mock session with proper NextAuth structure
  const mockSession = {
    user: {
      id: `test-${sessionType}-id`,
      ...sessionData,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };

  // Mock the NextAuth session API endpoint - this is critical for the auth() function to work
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

  // Mock the NextAuth providers endpoint for signin page
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

  // Mock the CSRF token endpoint that NextAuth needs
  await context.route('**/api/auth/csrf', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        csrfToken: 'mock-csrf-token'
      }),
    });
  });

  // Set session cookie for NextAuth to recognize
  // Use a more realistic token that looks like a NextAuth JWT
  const sessionToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({
    sub: `test-${sessionType}-id`,
    email: sessionData.email,
    name: sessionData.name,
    roles: sessionData.roles,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  })).toString('base64')}.mock-signature`;

  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: sessionToken,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    },
  ]);

  return mockSession;
}

/**
 * Clear authentication state
 */
export async function clearAuth(context: BrowserContext) {
  await context.clearCookies();
  
  // Stop mocking session API
  await context.unroute('**/api/auth/session');
  await context.unroute('**/api/auth/providers');
  await context.unroute('**/api/auth/csrf');
}

/**
 * Setup unauthenticated state (null session)
 */
export async function setupUnauthenticatedState(context: BrowserContext) {
  // Mock session API to return null
  await context.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(null),
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });
  });

  // Mock providers endpoint
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

  // Mock the CSRF token endpoint
  await context.route('**/api/auth/csrf', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        csrfToken: 'mock-csrf-token'
      }),
    });
  });
}

/**
 * Setup expired session state
 */
export async function setupExpiredSession(context: BrowserContext) {
  // Mock session API to return null (expired)
  await context.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(null),
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });
  });

  // Mock the CSRF token endpoint
  await context.route('**/api/auth/csrf', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        csrfToken: 'mock-csrf-token'
      }),
    });
  });

  // Set expired cookie
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: 'expired-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    },
  ]);
}