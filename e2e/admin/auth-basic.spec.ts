import { test, expect } from '@playwright/test';
import { setupClerkAuth } from '../utils/clerk-auth-helpers';
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';

const adminConfig = getAdminPortalConfig('local');

test.describe('Basic Authentication Flow (Clerk)', () => {
  test('Editor login link is visible when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3008/newtest/');
    
    // Debug: Take screenshot to see what's on the page
    await page.screenshot({ path: 'tmp/newtest-unauthenticated.png' });
    
    // Look for any auth-related elements
    const authElements = await page.locator('[class*="auth"], [class*="Auth"], [id*="auth"], [id*="Auth"]').all();
    console.log(`Found ${authElements.length} auth-related elements`);
    
// Try multiple selectors for the Clerk login link
    const loginSelectors = [
      '[data-testid="SafeSignInButton"]',
      'a:text("Editor Login")',
      'a:text("Login")',
      'a:text("Sign in")',
      'button:text("Sign in")',
      'a[href*="signin"]',
      'a[href*="auth"]'
    ];
    
    let loginLink = null;
    for (const selector of loginSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        loginLink = element.first();
        console.log(`Found login link with selector: ${selector}`);
        break;
      }
    }
    
    expect(loginLink).not.toBeNull();
  });

  test('Check navbar structure when authenticated', async ({ browser }) => {
    const context = await browser.newContext();
    await setupClerkAuth(context, 'namespace_editor');
    const page = await context.newPage();
    
    await page.goto('http://localhost:3008/newtest/');
    
// Wait for Clerk useUser() loading state
    await page.waitForSelector('[data-testid="dashboard-loaded"]', { state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Debug: Take screenshot
    await page.screenshot({ path: 'tmp/newtest-authenticated.png' });
    
    // Look for navbar items (debug info)
    const navbarItems = await page.locator('[role="navigation"]').all();
    console.log(`Found ${navbarItems.length} navigation sections`);
    
// Check for Clerk session data
    const clerkData = await page.evaluate(() => {
      return {
        clerkUser: window.__clerk_user || null,
        clerkLoaded: window.__clerk_loaded || false,
      };
    });
    console.log('Clerk data:', JSON.stringify(clerkData, null, 2));
    
    // Check for any dropdown or button with user info
const dropdownSelectors = [
      'button:has-text("Test User")',
      'button[role="button"][name="Test User"]'
    ];
    
    let userElement = null;
    for (const selector of dropdownSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        userElement = element.first();
        console.log(`Found user element with selector: ${selector}`);
        break;
      }
    }
    
    // Log all buttons on the page for debugging
    const allButtons = await page.locator('button').all();
    for (const button of allButtons) {
      const text = await button.textContent();
      console.log(`Button found: "${text}"`);
    }
    
    // Check for any MUI-based button components
    const muiButtons = await page.locator('[role="button"]').count();
    console.log(`Found ${muiButtons} button elements`);
    
    await page.close();
  });
});