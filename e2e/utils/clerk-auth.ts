import { BrowserContext } from '@playwright/test';
import { addBasePath } from '@ifla/theme/utils';
import { TEST_USER_EMAILS } from '../../apps/admin/src/test-config/clerk-test-users';

// Map test users for E2E convenience
// All test users use email verification code: 424242
const CLERK_TEST_USERS = [
  { 
    email: TEST_USER_EMAILS.SUPERADMIN, 
    name: 'Super Admin',
    role: 'system-admin'
  },
  { 
    email: TEST_USER_EMAILS.RG_ADMIN, 
    name: 'Review Group Admin',
    role: 'rg-admin'
  },
  { 
    email: TEST_USER_EMAILS.EDITOR, 
    name: 'Editor',
    role: 'editor'
  },
  { 
    email: TEST_USER_EMAILS.AUTHOR, 
    name: 'Author/Reviewer',
    role: 'reviewer'
  },
  { 
    email: TEST_USER_EMAILS.TRANSLATOR, 
    name: 'Translator',
    role: 'translator'
  },
];

/**
 * Authenticate with Clerk using real test users and storage-state seeding.
 * Uses email verification code (424242) for all test users.
 */
export async function seedClerkAuth(context: BrowserContext, email: string) {
  const testUser = CLERK_TEST_USERS.find(u => u.email === email);

  if (!testUser) {
    throw new Error(`Clerk test user with email ${email} not found. Available users: ${CLERK_TEST_USERS.map(u => u.email).join(', ')}`);
  }

  // Create a new page for authentication
  const page = await context.newPage();
  
  try {
    // Navigate to the sign-in page (respecting basePath)
    await page.goto(addBasePath('/sign-in'));
    
    // Wait for Clerk's sign-in form to load
    await page.waitForSelector('input[name="identifier"]', { timeout: 30000 });
    
    // Enter email
    await page.fill('input[name="identifier"]', testUser.email);
    await page.click('button[type="submit"]');
    
    // Wait for verification code input
    await page.waitForSelector('input[name="code"]', { timeout: 10000 });
    
    // Enter the verification code (424242)
    await page.fill('input[name="code"]', '424242');
    await page.click('button[type="submit"]');
    
    // Wait for successful authentication (redirect or success indicator)
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    // Store the authentication state in the context
    await context.storageState({ path: `playwright-state-${testUser.role}.json` });
    
  } catch (error) {
    throw new Error(`Failed to authenticate Clerk user ${email}: ${error.message}`);
  } finally {
    await page.close();
  }
}

/**
 * Clear Clerk authentication state
 */
export async function clearClerkAuth(context: BrowserContext) {
  await context.clearCookies();
  
  // Clear Clerk-specific storage
  await context.addInitScript(() => {
    // Clear all localStorage items that might contain Clerk data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('__clerk') || key.includes('clerk')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage as well
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('__clerk') || key.includes('clerk')) {
        sessionStorage.removeItem(key);
      }
    });
  });
}

/**
 * Helper function to get available test users
 */
export function getAvailableTestUsers() {
  return [...CLERK_TEST_USERS];
}

/**
 * Helper function to check if a user email is a valid test user
 */
export function isValidTestUser(email: string): boolean {
  return CLERK_TEST_USERS.some(user => user.email === email);
}
