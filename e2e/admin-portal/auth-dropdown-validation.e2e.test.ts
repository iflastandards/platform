import { test, expect } from '@playwright/test';
import { getAdminPortalConfig } from '../../packages/theme/src/config/siteConfig';

test.describe('Authentication Dropdown URL Validation', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let adminConfig: any;
  
  test.beforeAll(async () => {
    // Get admin portal configuration for local environment
    adminConfig = getAdminPortalConfig('local');
  });

  test.beforeEach(async ({ page }) => {
    // Clear any existing sessions and localStorage
    await page.context().clearCookies();
    await page.goto('http://localhost:3008/newtest/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should have correct "Editor Login" URL when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3008/newtest/');
    
    // Wait for page to load
    await expect(page.getByText('New Test Site')).toBeVisible();
    
    // Check that the login link uses correct environment-aware URL
    const loginLink = page.getByRole('link', { name: /editor login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', adminConfig.signinUrl);
    
    // Ensure it's NOT using hardcoded placeholder URLs
    await expect(loginLink).not.toHaveAttribute('href', 'https://your-next-app.com/login');
    await expect(loginLink).not.toHaveAttribute('href', 'http://localhost:3001/signin'); // Wrong port
  });

  test('should have correct "Manage" URL when authenticated as admin', async ({ page, context }) => {
    // Mock authentication with admin roles
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-admin-session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    // Set up authenticated state in localStorage
    await page.goto('http://localhost:3008/newtest/');
    await page.evaluate((config) => {
      const authStatus = {
        isAuthenticated: true,
        username: 'Test Admin',
        teams: ['ifla-admin'], // Admin role that should show "Manage"
        keepMeLoggedIn: false,
        loading: false
      };
      localStorage.setItem('authStatus', JSON.stringify(authStatus));
    }, adminConfig);

    await page.reload();
    await page.waitForTimeout(1000);

    // Find and click the user dropdown to reveal "Manage" link
    const userDropdown = page.locator('.navbar__item.dropdown');
    await expect(userDropdown).toBeVisible();
    
    // Hover or click to open dropdown
    await userDropdown.hover();
    await page.waitForTimeout(500);

    // Check that the "Manage" link uses correct environment-aware URL
    const manageLink = page.getByRole('link', { name: /manage/i });
    await expect(manageLink).toBeVisible();
    await expect(manageLink).toHaveAttribute('href', adminConfig.dashboardUrl);
    
    // Ensure it's NOT using hardcoded placeholder URLs
    await expect(manageLink).not.toHaveAttribute('href', 'https://your-next-app.com/editor');
    await expect(manageLink).not.toHaveAttribute('href', 'http://localhost:3001/dashboard'); // Wrong port
  });

  test('should have correct "Logout" URL when authenticated', async ({ page, context }) => {
    // Mock authentication
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-user-session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    // Set up authenticated state in localStorage
    await page.goto('http://localhost:3008/newtest/');
    await page.evaluate((config) => {
      const authStatus = {
        isAuthenticated: true,
        username: 'Test User',
        teams: ['editors'], // Regular user role
        keepMeLoggedIn: false,
        loading: false
      };
      localStorage.setItem('authStatus', JSON.stringify(authStatus));
    }, adminConfig);

    await page.reload();
    await page.waitForTimeout(1000);

    // Find and open the user dropdown
    const userDropdown = page.locator('.navbar__item.dropdown');
    await expect(userDropdown).toBeVisible();
    await userDropdown.hover();
    await page.waitForTimeout(500);

    // Check that the "Logout" link uses correct environment-aware URL
    const logoutLink = page.getByRole('link', { name: /logout/i });
    await expect(logoutLink).toBeVisible();
    await expect(logoutLink).toHaveAttribute('href', adminConfig.signoutUrl);
    
    // Ensure it's NOT using hardcoded placeholder URLs
    await expect(logoutLink).not.toHaveAttribute('href', 'https://your-next-app.com/logout');
    await expect(logoutLink).not.toHaveAttribute('href', 'http://localhost:3001/auth/signout'); // Wrong port
  });

  test('should test "Keep me logged in" checkbox functionality', async ({ page, context }) => {
    // Mock authentication
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-user-session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    // Set up authenticated state
    await page.goto('http://localhost:3008/newtest/');
    await page.evaluate(() => {
      const authStatus = {
        isAuthenticated: true,
        username: 'Test User',
        teams: ['editors'],
        keepMeLoggedIn: false,
        loading: false
      };
      localStorage.setItem('authStatus', JSON.stringify(authStatus));
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Open the user dropdown
    const userDropdown = page.locator('.navbar__item.dropdown');
    await userDropdown.hover();
    await page.waitForTimeout(500);

    // Find the "Keep me logged in" checkbox
    const keepLoggedInCheckbox = page.locator('input[type="checkbox"]');
    await expect(keepLoggedInCheckbox).toBeVisible();
    
    // Initially should be unchecked
    await expect(keepLoggedInCheckbox).not.toBeChecked();

    // Click the checkbox
    await keepLoggedInCheckbox.check();
    await expect(keepLoggedInCheckbox).toBeChecked();

    // Verify localStorage is updated
    const keepMeLoggedInValue = await page.evaluate(() => {
      return localStorage.getItem('auth-keep-signed-in');
    });
    expect(keepMeLoggedInValue).toBe('true');

    // Verify authStatus is updated
    const authStatus = await page.evaluate(() => {
      const raw = localStorage.getItem('authStatus');
      return raw ? JSON.parse(raw) : null;
    });
    expect(authStatus.keepMeLoggedIn).toBe(true);
  });

  test('should persist "Keep me logged in" state across page reloads', async ({ page, context }) => {
    // Mock authentication and set keepMeLoggedIn to true
    await context.addCookies([
      {
        name: 'next-auth.session-token',
        value: 'mock-user-session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
    ]);

    await page.goto('http://localhost:3008/newtest/');
    await page.evaluate(() => {
      // Set keepMeLoggedIn to true
      localStorage.setItem('auth-keep-signed-in', 'true');
      const authStatus = {
        isAuthenticated: true,
        username: 'Test User',
        teams: ['editors'],
        keepMeLoggedIn: true,
        loading: false
      };
      localStorage.setItem('authStatus', JSON.stringify(authStatus));
    });

    await page.reload();
    await page.waitForTimeout(1000);

    // Open dropdown and check that checkbox is checked
    const userDropdown = page.locator('.navbar__item.dropdown');
    await userDropdown.hover();
    await page.waitForTimeout(500);

    const keepLoggedInCheckbox = page.locator('input[type="checkbox"]');
    await expect(keepLoggedInCheckbox).toBeVisible();
    await expect(keepLoggedInCheckbox).toBeChecked();
  });

  test('should show "Manage" link only for admin roles', async ({ page, context }) => {
    const testCases = [
      {
        role: 'editors',
        shouldShowManage: false,
        description: 'regular editor'
      },
      {
        role: 'ifla-admin',
        shouldShowManage: true,
        description: 'ifla-admin'
      },
      {
        role: 'site-admin',
        shouldShowManage: true,
        description: 'site-admin'
      }
    ];

    for (const testCase of testCases) {
      // Clear session and reload
      await page.context().clearCookies();
      await context.addCookies([
        {
          name: 'next-auth.session-token',
          value: `mock-${testCase.role}-session`,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: false,
        },
      ]);

      await page.goto('http://localhost:3008/newtest/');
      await page.evaluate((role) => {
        const authStatus = {
          isAuthenticated: true,
          username: 'Test User',
          teams: [role],
          keepMeLoggedIn: false,
          loading: false
        };
        localStorage.setItem('authStatus', JSON.stringify(authStatus));
      }, testCase.role);

      await page.reload();
      await page.waitForTimeout(1000);

      // Open dropdown
      const userDropdown = page.locator('.navbar__item.dropdown');
      await userDropdown.hover();
      await page.waitForTimeout(500);

      // Check for "Manage" link visibility
      const manageLink = page.getByRole('link', { name: /manage/i });
      
      if (testCase.shouldShowManage) {
        await expect(manageLink).toBeVisible();
      } else {
        await expect(manageLink).not.toBeVisible();
      }
    }
  });

  test('should handle authentication URL errors gracefully', async ({ page }) => {
    // Navigate to newtest site
    await page.goto('http://localhost:3008/newtest/');
    
    // Mock a scenario where admin portal is unreachable by intercepting requests
    await page.route('**/api/auth/session', route => {
      route.abort('failed');
    });

    await page.reload();
    await page.waitForTimeout(2000); // Allow time for failed session check

    // Should fallback to showing login link
    const loginLink = page.getByRole('link', { name: /editor login/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', adminConfig.signinUrl);

    // Should not show error messages to user
    const errorMessage = page.getByText(/error|failed/i);
    await expect(errorMessage).not.toBeVisible();
  });
});