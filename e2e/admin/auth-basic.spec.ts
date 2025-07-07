import { test, expect } from '@playwright/test';
import { mockSessionCookie } from '../utils/session-mock';
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';

const adminConfig = getAdminPortalConfig('local');

test.describe('Basic Authentication Flow', () => {
  test('Editor login link is visible when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3008/newtest/');
    
    // Debug: Take screenshot to see what's on the page
    await page.screenshot({ path: 'tmp/newtest-unauthenticated.png' });
    
    // Look for any auth-related elements
    const authElements = await page.locator('[class*="auth"], [class*="Auth"], [id*="auth"], [id*="Auth"]').all();
    console.log(`Found ${authElements.length} auth-related elements`);
    
    // Try multiple selectors for the login link
    const loginSelectors = [
      'a:text("Editor Login")',
      'a:text("Login")',
      'a:text("Sign in")',
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
    const context = await mockSessionCookie({
      browser,
      userRoles: { newtest: 'namespace_editor' },
      userName: 'Test User',
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:3008/newtest/');
    
    // Wait a bit for the AuthStatus component to check session
    await page.waitForTimeout(2000);
    
    // Debug: Take screenshot
    await page.screenshot({ path: 'tmp/newtest-authenticated.png' });
    
    // Look for navbar items
    const navbarItems = await page.locator('.navbar__items').all();
    console.log(`Found ${navbarItems.length} navbar sections`);
    
    // Check localStorage to verify session is set
    const localStorageData = await page.evaluate(() => {
      return {
        adminSession: localStorage.getItem('adminSession'),
        iflaAdminSession: localStorage.getItem('ifla-admin-session'),
        adminPortalSession: localStorage.getItem('adminPortalSession'),
      };
    });
    console.log('LocalStorage data:', JSON.stringify(localStorageData, null, 2));
    
    // Check for any dropdown or button with user info
    const dropdownSelectors = [
      'button:has-text("Test User")',
      '[class*="dropdown"]:has-text("Test User")',
      '[class*="userMenu"]',
      '[class*="authDropdown"]',
      '.navbar__item.dropdown'
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
    
    // Also check for the specific auth dropdown component
    const authDropdown = await page.locator('[class*="authDropdown"], .dropdown:has(button)').count();
    console.log(`Found ${authDropdown} auth dropdown elements`);
    
    await page.close();
  });
});