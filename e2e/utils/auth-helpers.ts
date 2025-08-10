import { BrowserContext } from '@playwright/test';
import { seedClerkAuth, clearClerkAuth, isValidTestUser } from './clerk-auth';
import { TEST_USER_EMAILS } from '../../apps/admin/src/test-config/clerk-test-users';

// Map the test user emails to a more convenient format for E2E tests
export const TEST_USERS = {
  systemAdmin: {
    email: TEST_USER_EMAILS.SUPERADMIN,
    name: 'Super Admin',
    role: 'system-admin'
  },
  rgAdmin: {
    email: TEST_USER_EMAILS.RG_ADMIN,
    name: 'Review Group Admin',
    role: 'rg-admin'
  },
  siteEditor: {
    email: TEST_USER_EMAILS.EDITOR,
    name: 'Editor',
    role: 'editor'
  },
  reviewer: {
    email: TEST_USER_EMAILS.AUTHOR,
    name: 'Author/Reviewer',
    role: 'reviewer'
  },
  translator: {
    email: TEST_USER_EMAILS.TRANSLATOR,
    name: 'Translator',
    role: 'translator'
  },
};

/**
 * @deprecated Use TEST_USERS instead. This function is kept for backward compatibility.
 * Real Clerk users are now managed in Clerk's metadata, not through this helper.
 */
export function createTestUser(userData: {
  name: string;
  email: string;
  roles: string[];
  rgs?: Record<string, string>;
  sites?: Record<string, string>;
  languages?: string[];
}) {
  console.warn('createTestUser is deprecated. Use TEST_USERS with real Clerk test user emails instead.');
  
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

/**
 * Setup Clerk authentication for testing.
 * This authenticates with real Clerk test users instead of mocking.
 * 
 * @param context - The browser context to authenticate
 * @param userTypeOrEmail - Either a user type key from TEST_USERS or a Clerk test user email
 */
export async function setupMockAuth(
  context: BrowserContext, 
  userTypeOrEmail: keyof typeof TEST_USERS | string
) {
  let email: string;
  
  // Check if it's a user type key or direct email
  if (userTypeOrEmail in TEST_USERS) {
    email = TEST_USERS[userTypeOrEmail as keyof typeof TEST_USERS].email;
  } else {
    email = userTypeOrEmail as string;
  }
  
  // Validate the email is a known test user
  if (!isValidTestUser(email)) {
    throw new Error(`Invalid test user: ${email}. Available test users: ${Object.keys(TEST_USERS).join(', ')}`);
  }
  
  await seedClerkAuth(context, email);
}

/**
 * Clear Clerk authentication state
 */
export async function clearAuth(context: BrowserContext) {
  await clearClerkAuth(context);
  // No need to unroute NextAuth endpoints since we're using Clerk
}

/**
 * Setup unauthenticated state by ensuring no Clerk session exists
 */
export async function setupUnauthenticatedState(context: BrowserContext) {
  // Clear any existing Clerk authentication
  await clearClerkAuth(context);
  
  // Clear any cookies that might indicate authentication
  await context.clearCookies();
  
  // Ensure Clerk shows the user as unauthenticated
  await context.addInitScript(() => {
    // Clear any Clerk session data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('__clerk') || key.includes('clerk')) {
        localStorage.removeItem(key);
      }
    });
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('__clerk') || key.includes('clerk')) {
        sessionStorage.removeItem(key);
      }
    });
  });
}

/**
 * Setup expired session state by clearing Clerk authentication
 * In Clerk, we simulate expired sessions by simply having no valid session
 */
export async function setupExpiredSession(context: BrowserContext) {
  // For Clerk, expired sessions are handled by clearing the session
  // Clerk will automatically redirect to sign-in when the session is invalid/expired
  await setupUnauthenticatedState(context);
}
