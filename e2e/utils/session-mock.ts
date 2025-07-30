import { BrowserContext, Browser } from '@playwright/test';
import { seedClerkAuth, clearClerkAuth, isValidTestUser } from './clerk-auth';

interface MockSessionArgs {
  browser: Browser;
  userRoles?: Record<string, string>; // Keep for backward compatibility
  userName?: string; // Keep for backward compatibility
  userEmail?: string;
}

/**
 * Creates a Clerk session using real test users with storage-state seeding.
 * This performs actual Clerk authentication instead of mocking.
 * 
 * @param {object} args - The arguments for creating the session.
 * @param {Browser} args.browser - The Playwright browser instance.
 * @param {string} [args.userEmail='editor+clerk_test@example.com'] - The email of the test user.
 * @param {Record<string, string>} [args.userRoles] - Deprecated, roles are now managed by Clerk metadata.
 * @param {string} [args.userName] - Deprecated, names are managed by Clerk user data.
 * @returns A new browser context with the Clerk session established.
 */
export async function mockSessionCookie({ 
  browser, 
  userEmail = 'editor+clerk_test@example.com',
  userRoles, // Deprecated but kept for compatibility
  userName // Deprecated but kept for compatibility
}: MockSessionArgs) {
  // Validate the test user email
  if (!isValidTestUser(userEmail)) {
    throw new Error(`Invalid test user email: ${userEmail}. Use one of the predefined Clerk test users.`);
  }
  
  // Warn about deprecated parameters
  if (userRoles) {
    console.warn('userRoles parameter is deprecated. Roles are now managed through Clerk user metadata.');
  }
  if (userName) {
    console.warn('userName parameter is deprecated. Names are now managed through Clerk user data.');
  }
  
  const context = await browser.newContext();
  await seedClerkAuth(context, userEmail);
  return context;
}

/**
 * Helper function to create a session from environment variables
 * Usage: E2E_MOCK_USER_EMAIL='editor+clerk_test@example.com' npm test
 */
export async function mockSessionFromEnv(browser: Browser): Promise<BrowserContext | null> {
  const email = process.env.E2E_MOCK_USER_EMAIL;
  if (!email) {
    console.warn('E2E_MOCK_USER_EMAIL not set, using default editor user for testing');
    return mockSessionCookie({ browser });
  }
  
  return mockSessionCookie({ browser, userEmail: email });
}

/**
 * Clear authentication session
 */
export async function clearAuthSession(context: BrowserContext): Promise<void> {
  await clearClerkAuth(context);
}

/**
 * Setup authentication for page-level testing.
 * This creates a context with a pre-authenticated Clerk session.
 */
export async function setupMockAuth(page: any, options: {
  userName?: string; // Deprecated but kept for compatibility
  userEmail?: string;
  userRoles?: Record<string, string>; // Deprecated but kept for compatibility
}) {
  const { 
    userEmail = 'editor+clerk_test@example.com',
    userName, // Deprecated
    userRoles // Deprecated
  } = options;
  
  // Warn about deprecated parameters
  if (userName) {
    console.warn('userName parameter is deprecated in setupMockAuth. Names are managed through Clerk user data.');
  }
  if (userRoles) {
    console.warn('userRoles parameter is deprecated in setupMockAuth. Roles are managed through Clerk metadata.');
  }
  
  // Validate the test user email
  if (!isValidTestUser(userEmail)) {
    throw new Error(`Invalid test user email: ${userEmail}. Use one of the predefined Clerk test users.`);
  }
  
  // For page-level testing, we need to authenticate in the current context
  // This assumes the page is already part of a context that needs authentication
  const context = page.context();
  await seedClerkAuth(context, userEmail);
}
