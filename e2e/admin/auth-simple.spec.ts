import { test, expect } from '@playwright/test';
import { setupClerkAuth, clearClerkAuth } from '../utils/clerk-auth-helpers';
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';

const adminConfig = getAdminPortalConfig('local');

test.describe('Simple Authentication Tests (Clerk)', () => {
  test('Unauthenticated user sees Editor Login link', async ({ page }) => {
    await page.goto('http://localhost:3008/newtest/');
    
    const loginLink = page.getByRole('link', { name: /editor login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', adminConfig.signinUrl);
  });

  test('Mock authenticated user with Clerk', async ({ context, page }) => {
    // Set up Clerk authenticated state
    await setupClerkAuth(context, 'reviewer');
    
    // Navigate to the newtest site
    await page.goto('http://localhost:3008/newtest/');
    
    // Wait for Clerk auth status to sync
    await page.waitForTimeout(2000);
    
    // Check if Editor Login is hidden (indicating authenticated state)
    const loginLink = page.getByRole('link', { name: /editor login/i });
    await expect(loginLink).not.toBeVisible();
    
    // Look for user name display in navigation
    const userNameElement = page.locator(':text("Test User")');
    await expect(userNameElement).toBeVisible();
    console.log('User Name Text:', await userNameElement.textContent());
  });
});