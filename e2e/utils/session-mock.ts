import { Browser, BrowserContext } from '@playwright/test';
import { Session } from 'next-auth';
import * as jose from 'jose';

interface MockSessionArgs {
  browser: Browser;
  userRoles?: Record<string, string>;
  userName?: string;
  userEmail?: string;
}

// Parse roles from environment variable if set
function getRolesFromEnv(): Record<string, string> | undefined {
  const rolesEnv = process.env.E2E_MOCK_USER_ROLES;
  if (!rolesEnv) return undefined;
  
  try {
    return JSON.parse(rolesEnv);
  } catch (error) {
    console.error('Failed to parse E2E_MOCK_USER_ROLES:', error);
    return undefined;
  }
}

// Use a default secret for testing if NEXTAUTH_SECRET is not set
const secretString = process.env.NEXTAUTH_SECRET || 'test-secret-for-e2e-testing-only-32-chars-long!!';
// Ensure the secret is exactly 32 bytes (256 bits) for A256GCM
const secret = new TextEncoder().encode(secretString.padEnd(32, '!').slice(0, 32));

/**
 * Creates a mock NextAuth session cookie to simulate a logged-in user with specific roles.
 * This allows bypassing the actual GitHub login flow in E2E tests.
 *
 * @param {object} args - The arguments for mocking the session.
 * @param {Browser} args.browser - The Playwright browser instance.
 * @param {Record<string, string>} args.userRoles - A map of namespace to role (e.g., { newtest: 'namespace_admin' }).
 * @param {string} [args.userName='Test User'] - The name of the mock user.
 * @param {string} [args.userEmail='test@example.com'] - The email of the mock user.
 * @returns A new browser context with the session cookie set.
 */
export async function mockSessionCookie({
  browser,
  userRoles,
  userName = process.env.E2E_MOCK_USER_NAME || 'Test User',
  userEmail = process.env.E2E_MOCK_USER_EMAIL || 'test@example.com',
}: MockSessionArgs) {
  // Use environment variable roles if not provided explicitly
  const roles = userRoles || getRolesFromEnv() || {};
  
  const context = await browser.newContext();

  const session: Session = {
    user: {
      name: userName,
      email: userEmail,
      roles: roles, // Inject the roles here
    },
    expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
  };

  // Encrypt the session to create the cookie value
  const token = await new jose.EncryptJWT(session)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .encrypt(secret);

  const sessionCookie = {
    name: 'next-auth.session-token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax' as const,
  };

  // Set the cookie on the browser context
  await context.addCookies([sessionCookie]);

  // Also set localStorage for cross-site authentication communication
  // This runs before every navigation
  await context.addInitScript((sessionData) => {
    const adminSession = {
      isAuthenticated: true,
      username: sessionData.userName,
      teams: Object.entries(sessionData.roles).map(([namespace, role]) => `${namespace}-${role.replace('namespace_', '')}`),
      email: sessionData.userEmail,
      name: sessionData.userName,
      roles: sessionData.roles,
    };
    
    // Set in localStorage for the admin portal
    localStorage.setItem('adminSession', JSON.stringify(adminSession));
    
    // Also set for any Docusaurus sites that might check
    localStorage.setItem('ifla-admin-session', JSON.stringify(adminSession));
    
    // Also set the specific format that AuthStatus component expects
    localStorage.setItem('adminPortalSession', JSON.stringify({
      user: {
        name: sessionData.userName,
        email: sessionData.userEmail,
        teams: Object.entries(sessionData.roles).map(([namespace, role]) => `${namespace}-${role.replace('namespace_', '')}`),
      },
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    }));
    
    // Set the authStatus that useAdminSession hook expects
    localStorage.setItem('authStatus', JSON.stringify({
      isAuthenticated: true,
      username: sessionData.userName,
      teams: Object.entries(sessionData.roles).map(([namespace, role]) => `${namespace}-${role.replace('namespace_', '')}`),
      keepMeLoggedIn: false,
      loading: false,
    }));
    
    // Trigger storage event to notify other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'adminSession',
      newValue: JSON.stringify(adminSession),
      url: window.location.href,
    }));
  }, { userName, userEmail, roles });

  return context;
}

/**
 * Helper function to create a mock session from environment variables
 * Usage: E2E_MOCK_USER_ROLES='{"newtest": "namespace_admin"}' npm test
 */
export async function mockSessionFromEnv(browser: Browser): Promise<BrowserContext | null> {
  const roles = getRolesFromEnv();
  if (!roles) {
    console.warn('E2E_MOCK_USER_ROLES not set, skipping mock authentication');
    return null;
  }
  
  return mockSessionCookie({ browser });
}

/**
 * Setup mock authentication with API interception
 * This is the recommended way to mock authentication for E2E tests
 */
export async function setupMockAuth(page: any, options: {
  userName?: string;
  userEmail?: string;
  userRoles: Record<string, string>;
}) {
  const { userName = 'Test User', userEmail = 'test@example.com', userRoles } = options;
  const adminConfig = await page.evaluate(() => {
    // @ts-ignore - accessing window object
    return window.__ADMIN_CONFIG__ || {
      sessionApiUrl: 'http://localhost:3007/admin/api/auth/session'
    };
  });
  
  // Mock the admin portal session API
  await page.route('**/admin/api/auth/session', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          name: userName,
          email: userEmail,
          roles: Object.entries(userRoles).map(([namespace, role]) => `${namespace}-${role.replace('namespace_', '')}`),
        },
      }),
    });
  });
  
  // Also set localStorage for immediate availability
  await page.evaluate((data) => {
    const authStatus = {
      isAuthenticated: true,
      username: data.userName,
      teams: Object.entries(data.userRoles).map(([namespace, role]) => `${namespace}-${role.replace('namespace_', '')}`),
      keepMeLoggedIn: false,
      loading: false,
    };
    localStorage.setItem('authStatus', JSON.stringify(authStatus));
  }, { userName, userEmail, userRoles });
}