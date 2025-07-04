import { BrowserContext } from '@playwright/test';

// Function to create a test user with specific roles and attributes
export function createTestUser(userData: {
  name: string;
  email: string;
  roles: string[];
  rgs?: Record<string, string>;
  sites?: Record<string, string>;
  languages?: string[];
}) {
  return {
    id: `test-${userData.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
    name: userData.name,
    email: userData.email,
    image: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 100000)}`,
    roles: userData.roles,
    attributes: {
      rgs: userData.rgs || {},
      sites: userData.sites || {},
      languages: userData.languages || ['en'],
    },
  };
}

// Pre-defined test users for common scenarios
export const TEST_USERS = {
  systemAdmin: createTestUser({
    name: 'System Admin',
    email: 'system-admin@test.example.com',
    roles: ['system-admin'],
  }),
  rgAdmin: createTestUser({
    name: 'ISBD Review Group Admin',
    email: 'isbd-admin@test.example.com',
    roles: ['user'],
    rgs: { ISBD: 'admin' },
  }),
  siteEditor: createTestUser({
    name: 'ISBDM Site Editor',
    email: 'isbdm-editor@test.example.com',
    roles: ['user'],
    sites: { isbdm: 'editor' },
  }),
  multiRgTranslator: createTestUser({
    name: 'Multi-Review Group Translator',
    email: 'translator@test.example.com',
    roles: ['user'],
    rgs: {
      ISBD: 'translator',
      BCM: 'translator',
    },
    languages: ['en', 'fr', 'es'],
  }),
  basicUser: createTestUser({
    name: 'Basic User',
    email: 'user@test.example.com',
    roles: ['user'],
  }),
};

/**
 * Mock NextAuth session by setting up session cookies and intercepting API calls
 */
export async function setupMockAuth(
  context: BrowserContext,
  user: ReturnType<typeof createTestUser>
) {
  const mockSession = {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };

  // Mock the NextAuth session API endpoint
  await context.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockSession),
    });
  });

  // Set session cookie
  const sessionToken = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    attributes: user.attributes,
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
      expires: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
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