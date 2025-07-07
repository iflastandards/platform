import { test, expect } from '@playwright/test';
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';

const adminConfig = getAdminPortalConfig('local');

test.describe('Simple Authentication Tests', () => {
  test('Unauthenticated user sees Editor Login link', async ({ page }) => {
    await page.goto('http://localhost:3008/newtest/');
    
    const loginLink = page.getByRole('link', { name: /editor login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', adminConfig.signinUrl);
  });

  test('Mock authenticated user with API interception', async ({ page }) => {
    // Mock the admin portal session API before navigation
    await page.route('**/admin/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'John Doe',
            email: 'john@example.com',
            roles: ['newtest-reviewer'],
          },
        }),
      });
    });
    
    // Navigate to the newtest site
    await page.goto('http://localhost:3008/newtest/');
    
    // Wait a bit for the auth component to check session
    await page.waitForTimeout(2000);
    
    // Check if Editor Login is hidden (indicating authenticated state)
    const loginLink = page.getByRole('link', { name: /editor login/i });
    await expect(loginLink).not.toBeVisible();
    
    // Look for any element containing John Doe
    const userElements = await page.locator(':text("John Doe")').count();
    console.log(`Found ${userElements} elements containing "John Doe"`);
    
    // Check for dropdown elements
    const dropdowns = await page.locator('.navbar__item.dropdown').count();
    console.log(`Found ${dropdowns} dropdown elements`);
    
    // Get all text from navbar
    const navbarText = await page.locator('.navbar__items').textContent();
    console.log('Navbar text:', navbarText);
  });
});