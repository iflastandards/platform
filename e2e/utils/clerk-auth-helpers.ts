import { BrowserContext } from '@playwright/test';
import { seedClerkAuth, clearClerkAuth as clearClerkAuthState, isValidTestUser } from './clerk-auth';

// Pre-defined test users based on real Clerk test users
// These correspond to actual users in Clerk's development environment
export const TEST_USERS = {
  systemAdmin: {
    email: 'superadmin+clerk_test@example.com',
    name: 'Super Admin',
    role: 'system-admin'
  },
  rgAdmin: {
    email: 'rg_admin+clerk_test@example.com',
    name: 'Review Group Admin',
    role: 'rg-admin'
  },
  siteEditor: {
    email: 'editor+clerk_test@example.com',
    name: 'Editor',
    role: 'editor'
  },
  reviewer: {
    email: 'author+clerk_test@example.com',
    name: 'Author/Reviewer',
    role: 'reviewer'
  },
  translator: {
    email: 'translator+clerk_test@example.com',
    name: 'Translator',
    role: 'translator'
  },
  admin: {
    email: 'superadmin+clerk_test@example.com',
    name: 'Super Admin',
    role: 'system-admin'
  },
  namespace_editor: {
    email: 'editor+clerk_test@example.com',
    name: 'Editor',
    role: 'editor'
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
