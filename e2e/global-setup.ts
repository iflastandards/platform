import { chromium, FullConfig } from '@playwright/test';
import { addBasePath } from '@ifla/theme/utils';
import * as fs from 'fs';
import * as path from 'path';

// Define test users that match your Clerk environment
// All test users use email verification code: 424242
const CLERK_TEST_USERS = [
  {
    email: 'superadmin+clerk_test@example.com',
    role: 'system-admin',
    storageFile: 'playwright/.auth/admin.json'
  },
  {
    email: 'rg_admin+clerk_test@example.com',
    role: 'rg-admin',
    storageFile: 'playwright/.auth/rg-admin.json'
  },
  {
    email: 'editor+clerk_test@example.com',
    role: 'editor',
    storageFile: 'playwright/.auth/editor.json'
  },
  {
    email: 'author+clerk_test@example.com',
    role: 'reviewer',
    storageFile: 'playwright/.auth/reviewer.json'
  },
  {
    email: 'translator+clerk_test@example.com',
    role: 'translator',
    storageFile: 'playwright/.auth/translator.json'
  }
];

async function globalSetup(config: FullConfig) {
  // Ensure auth directory exists
  const authDir = path.join(__dirname, '../playwright/.auth');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Check if we need to authenticate (skip in CI if auth files exist)
  const skipAuth = process.env.SKIP_AUTH_SETUP === 'true';
  if (skipAuth) {
    console.log('Skipping authentication setup (SKIP_AUTH_SETUP=true)');
    return;
  }

  // Authenticate each test user
  const browser = await chromium.launch();

  for (const user of CLERK_TEST_USERS) {
    console.log(`Authenticating ${user.role} user: ${user.email}`);
    
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to the sign-in page
      const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3007';
      await page.goto(`${baseURL}${addBasePath('/sign-in')}`);

      // Wait for Clerk's sign-in form
      await page.waitForSelector('input[name="identifier"]', { timeout: 30000 });

      // Fill in email
      await page.fill('input[name="identifier"]', user.email);
      await page.click('button[type="submit"]');

      // Wait for verification code field
      await page.waitForSelector('input[name="code"]', { timeout: 10000 });
      await page.fill('input[name="code"]', '424242');
      await page.click('button[type="submit"]');

      // Wait for successful authentication
      await page.waitForURL('**/dashboard**', { timeout: 30000 });

      // Save authentication state
      await context.storageState({ path: user.storageFile });
      console.log(`✓ Saved authentication state for ${user.role}`);

    } catch (error) {
      console.error(`✗ Failed to authenticate ${user.email}:`, error);
      throw error;
    } finally {
      await context.close();
    }
  }

  await browser.close();
}

export default globalSetup;