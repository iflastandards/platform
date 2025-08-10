import { BrowserContext } from '@playwright/test';
import { seedClerkAuth, clearClerkAuth as clearClerkAuthState, isValidTestUser } from './clerk-auth';
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
  admin: {
    email: TEST_USER_EMAILS.SUPERADMIN,
    name: 'Super Admin',
    role: 'system-admin'
  },
  namespace_editor: {
    email: TEST_USER_EMAILS.EDITOR,
    name: 'Editor',
    role: 'editor'
  },
  // Add namespace admin if it exists
  namespaceAdmin: {
    email: TEST_USER_EMAILS.NAMESPACE_ADMIN || TEST_USER_EMAILS.RG_ADMIN,
    name: 'Namespace Admin',
    role: 'namespace-admin'
  }
};

/**
 * Setup Clerk authentication for testing.
 * This authenticates with real Clerk test users instead of mocking.
 * 
 * @param context - The browser context to authenticate
 * @param userTypeOrEmail - Either a user type key from TEST_USERS or a Clerk test user email
 */
export async function setupClerkAuth(
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
export async function clearClerkAuth(context: BrowserContext) {
  await clearClerkAuthState(context);
}

/**
 * Setup unauthenticated state by ensuring no Clerk session exists
 */
export async function setupClerkUnauthenticatedState(context: BrowserContext) {
  // Clear any existing Clerk authentication
  await clearClerkAuthState(context);
  
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
export async function setupClerkExpiredSession(context: BrowserContext) {
  // For Clerk, expired sessions are handled by clearing the session
  // Clerk will automatically redirect to sign-in when the session is invalid/expired
  await setupClerkUnauthenticatedState(context);
}
