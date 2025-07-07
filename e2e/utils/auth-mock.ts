import { Page, BrowserContext } from '@playwright/test';
import jwt from 'jsonwebtoken';

interface MockUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  username: string;
  teams: string[];
}

interface MockSessionOptions {
  user?: Partial<MockUser>;
  roles?: Record<string, string>; // namespace -> role mapping
  expiresIn?: string;
}

// Default mock users for different roles
export const MOCK_USERS = {
  superadmin: {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@ifla.org',
    username: 'superadmin',
    teams: ['system-admin', 'ifla-admin'],
  },
  namespaceAdmin: {
    id: '2',
    name: 'Namespace Admin',
    email: 'nsadmin@ifla.org',
    username: 'nsadmin',
    teams: ['newtest-admin'],
  },
  editor: {
    id: '3',
    name: 'Editor User',
    email: 'editor@ifla.org',
    username: 'editor',
    teams: ['newtest-editor'],
  },
  reviewer: {
    id: '4',
    name: 'Reviewer User',
    email: 'reviewer@ifla.org',
    username: 'reviewer',
    teams: ['newtest-reviewer'],
  },
  translator: {
    id: '5',
    name: 'Translator User',
    email: 'translator@ifla.org',
    username: 'translator',
    teams: ['newtest-translator'],
  },
  multiRole: {
    id: '6',
    name: 'Multi Role User',
    email: 'multirole@ifla.org',
    username: 'multirole',
    teams: ['newtest-editor', 'unimarc-admin', 'isbd-reviewer'],
  },
};

/**
 * Creates a mock authentication session for E2E testing
 * This simulates a successful GitHub OAuth login with specified roles
 */
export async function mockAuthSession(
  context: BrowserContext,
  options: MockSessionOptions = {}
): Promise<void> {
  const user = options.user || MOCK_USERS.editor;
  const roles = options.roles || {};
  
  // Create a mock JWT token similar to what NextAuth would create
  const token = jwt.sign(
    {
      user: {
        ...user,
        roles,
      },
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    },
    process.env.NEXTAUTH_SECRET || 'test-secret'
  );

  // Set the session cookie that NextAuth expects
  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false, // false for localhost
      sameSite: 'Lax',
    },
  ]);

  // Also set the admin session in localStorage for cross-site communication
  await context.addInitScript((sessionData) => {
    const adminSession = {
      isAuthenticated: true,
      username: sessionData.user.username,
      teams: sessionData.user.teams,
      email: sessionData.user.email,
      name: sessionData.user.name,
      roles: sessionData.roles,
    };
    
    // Set in localStorage for the admin portal
    localStorage.setItem('adminSession', JSON.stringify(adminSession));
    
    // Also set for any Docusaurus sites that might check
    localStorage.setItem('ifla-admin-session', JSON.stringify(adminSession));
    
    // Trigger storage event to notify other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'adminSession',
      newValue: JSON.stringify(adminSession),
      url: window.location.href,
    }));
  }, { user, roles });
}

/**
 * Helper to set up mock session environment variable
 * Use this when you need to simulate roles via environment variable
 */
export function getMockRolesEnv(roles: Record<string, string>): string {
  return JSON.stringify(roles);
}

/**
 * Clear mock authentication session
 */
export async function clearAuthSession(context: BrowserContext): Promise<void> {
  // Clear cookies
  await context.clearCookies();
  
  // Clear localStorage
  await context.addInitScript(() => {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('ifla-admin-session');
    localStorage.removeItem('keepLoggedIn');
  });
}

/**
 * Helper to check if user is authenticated in page
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) return false;
    
    try {
      const parsed = JSON.parse(session);
      return parsed.isAuthenticated === true;
    } catch {
      return false;
    }
  });
}

/**
 * Get current user session from page
 */
export async function getCurrentUser(page: Page): Promise<any> {
  return await page.evaluate(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) return null;
    
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  });
}