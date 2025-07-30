import { Page, BrowserContext } from '@playwright/test';
import { addBasePath } from '@ifla/theme/utils';

interface ClerkTestUser {
  email: string;
  verificationCode: string;
  name: string;
  role: string;
  // Real users that exist in Clerk's development environment
}

// Real Clerk test users with role-based emails and 424242 verification code
const CLERK_TEST_USERS: ClerkTestUser[] = [
  { 
    email: 'superadmin+clerk_test@example.com', 
    verificationCode: '424242', 
    name: 'Super Admin',
    role: 'system-admin'
  },
  { 
    email: 'rg_admin+clerk_test@example.com', 
    verificationCode: '424242', 
    name: 'Review Group Admin',
    role: 'rg-admin'
  },
  { 
    email: 'editor+clerk_test@example.com', 
    verificationCode: '424242', 
    name: 'Editor',
    role: 'editor'
  },
  { 
    email: 'author+clerk_test@example.com', 
    verificationCode: '424242', 
    name: 'Author/Reviewer',
    role: 'reviewer'
  },
  { 
    email: 'translator+clerk_test@example.com', 
    verificationCode: '424242', 
    name: 'Translator',
    role: 'translator'
  },
];

/**
 * Authenticate with Clerk using real test users and storage-state seeding.
 * This performs actual Clerk authentication with the 424242 verification code.
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
    await page.waitForSelector('[data-clerk-field="identifier"]', { timeout: 10000 });
    
    // Enter email
    await page.fill('[data-clerk-field="identifier"]', testUser.email);
    await page.click('[data-clerk="primaryButton"]');
    
    // Wait for verification code input
    await page.waitForSelector('[data-clerk-field="code"]', { timeout: 10000 });
    
    // Enter the verification code (424242)
    await page.fill('[data-clerk-field="code"]', testUser.verificationCode);
    await page.click('[data-clerk="primaryButton"]');
    
    // Wait for successful authentication (redirect or success indicator)
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    
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
export function getAvailableTestUsers(): ClerkTestUser[] {
  return [...CLERK_TEST_USERS];
}

/**
 * Helper function to check if a user email is a valid test user
 */
export function isValidTestUser(email: string): boolean {
  return CLERK_TEST_USERS.some(user => user.email === email);
}
