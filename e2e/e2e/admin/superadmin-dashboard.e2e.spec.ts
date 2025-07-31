import { e2eTest, expect, type Page } from '../../utils/tagged-test';

// Helper to mock admin session
async function mockAdminSession(page: Page, session: any) {
  // Intercept session API calls
  await page.route('**/api/auth/session', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(session),
    });
  });

  // Set session in localStorage to avoid redirects
  await page.evaluate((sessionData) => {
    localStorage.setItem('adminSession', JSON.stringify(sessionData));
  }, session);
}

e2eTest.describe('Superadmin Dashboard @admin @rbac @critical @e2e @navigation', () => {
  e2eTest.describe('Access Control @auth', () => {
    e2eTest('redirects unauthenticated users to login', async ({ page }) => {
      // Mock no session
      await page.route('**/api/auth/session', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ isAuthenticated: false }),
        });
      });

      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/.*\/auth\/signin/);
      expect(page.url()).toContain('returnUrl=%2Fdashboard');
    });

    e2eTest('shows access denied for non-admin users', async ({ page }) => {
      await mockAdminSession(page, {
        isAuthenticated: true,
        username: 'regularuser',
        teams: ['some-team', 'another-team'],
      });

      await page.goto('/dashboard');

      // Should show access denied message
      await expect(page.getByRole('alert')).toContainText(/don't have permission/i);
      await expect(page.getByText('System Administration')).not.toBeVisible();
    });

    e2eTest('grants access to system-admin users', async ({ page }) => {
      await mockAdminSession(page, {
        isAuthenticated: true,
        username: 'admin',
        teams: ['system-admin'],
      });

      await page.goto('/dashboard');

      // Should show dashboard
      await expect(page.getByText('System Administration')).toBeVisible();
      await expect(page.getByText('Welcome, admin')).toBeVisible();
    });

    e2eTest('grants access to ifla-admin users', async ({ page }) => {
      await mockAdminSession(page, {
        isAuthenticated: true,
        username: 'iflaadmin',
        teams: ['ifla-admin', 'other-team'],
      });

      await page.goto('/dashboard');

      // Should show dashboard
      await expect(page.getByText('System Administration')).toBeVisible();
    });
  });

  e2eTest.describe('Site Creation Workflow @admin', () => {
    e2eTest.beforeEach(async ({ page }) => {
      await mockAdminSession(page, {
        isAuthenticated: true,
        username: 'admin',
        teams: ['system-admin'],
      });
      await page.goto('/dashboard');
    });

    e2eTest('opens site creation dialog', async ({ page }) => {
      // Click create site button
      await page.getByRole('button', { name: 'Create New Site' }).click();

      // Dialog should open
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('Create New Site', { exact: true })).toBeVisible();

      // Form fields should be present
      await expect(page.getByLabel('Site Key')).toBeVisible();
      await expect(page.getByLabel('Title')).toBeVisible();
      await expect(page.getByLabel('Tagline')).toBeVisible();
    });

    e2eTest('validates required fields @validation', async ({ page }) => {
      await page.getByRole('button', { name: 'Create New Site' }).click();

      // Try to submit empty form
      await page.getByRole('button', { name: 'Create Site' }).click();

      // Should show validation errors
      await expect(page.getByText(/Site key is required/i)).toBeVisible();
      await expect(page.getByText(/Title is required/i)).toBeVisible();
    });

    e2eTest('successfully creates a new site', async ({ page }) => {
      // Mock successful API response
      await page.route('**/api/scaffold', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            output: 'Site created successfully',
            siteKey: 'testsite',
          }),
        });
      });

      // Open dialog
      await page.getByRole('button', { name: 'Create New Site' }).click();

      // Fill form
      await page.getByLabel('Site Key').fill('testsite');
      await page.getByLabel('Title').fill('Test Site');
      await page.getByLabel('Tagline').fill('A test IFLA site');

      // Submit
      await page.getByRole('button', { name: 'Create Site' }).click();

      // Should show success message
      await expect(page.getByText(/Site created successfully/i)).toBeVisible();

      // Dialog should close
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    e2eTest('handles API errors gracefully @error-handling', async ({ page }) => {
      // Mock error response
      await page.route('**/api/scaffold', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Site key already exists',
            stderr: 'Error: Directory already exists',
          }),
        });
      });

      await page.getByRole('button', { name: 'Create New Site' }).click();

      // Fill and submit form
      await page.getByLabel('Site Key').fill('existing');
      await page.getByLabel('Title').fill('Existing Site');
      await page.getByLabel('Tagline').fill('Test');
      await page.getByRole('button', { name: 'Create Site' }).click();

      // Should show error message
      await expect(page.getByText(/Site key already exists/i)).toBeVisible();

      // Dialog should remain open
      await expect(page.getByRole('dialog')).toBeVisible();
    });

    e2eTest('validates site key format @validation', async ({ page }) => {
      await page.getByRole('button', { name: 'Create New Site' }).click();

      // Try invalid site key
      await page.getByLabel('Site Key').fill('Test Site!');
      await page.getByLabel('Title').fill('Test');
      await page.getByLabel('Tagline').fill('Test');

      // Should show validation error on blur or submit
      await page.getByRole('button', { name: 'Create Site' }).click();

      await expect(page.getByText(/Site key must be lowercase/i)).toBeVisible();
    });
  });

  e2eTest.describe('Team Management @teams', () => {
    e2eTest.beforeEach(async ({ page }) => {
      await mockAdminSession(page, {
        isAuthenticated: true,
        username: 'admin',
        teams: ['system-admin'],
      });
      await page.goto('/dashboard');
    });

    e2eTest('navigates to team management', async ({ page }) => {
      await page.getByRole('button', { name: 'Manage GitHub Teams' }).click();

      // Should navigate or open team management interface
      await expect(page.getByText('GitHub Team Management')).toBeVisible();
    });
  });

  e2eTest.describe('Dashboard Overview @monitoring', () => {
    e2eTest.beforeEach(async ({ page }) => {
      await mockAdminSession(page, {
        isAuthenticated: true,
        username: 'admin',
        teams: ['system-admin'],
      });
    });

    e2eTest('displays site statistics', async ({ page }) => {
      // Mock site statistics API
      await page.route('**/api/stats/sites', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            total: 5,
            published: 3,
            draft: 2,
          }),
        });
      });

      await page.goto('/dashboard');

      // Should display statistics
      await expect(page.getByText('Total Sites: 5')).toBeVisible();
      await expect(page.getByText('Published: 3')).toBeVisible();
      await expect(page.getByText('Draft: 2')).toBeVisible();
    });

    e2eTest('shows recent activity', async ({ page }) => {
      // Mock activity API
      await page.route('**/api/activity/recent', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            {
              id: 1,
              type: 'site_created',
              user: 'admin',
              details: 'Created site: isbd',
              timestamp: new Date().toISOString(),
            },
            {
              id: 2,
              type: 'content_updated',
              user: 'editor',
              details: 'Updated LRM documentation',
              timestamp: new Date().toISOString(),
            },
          ]),
        });
      });

      await page.goto('/dashboard');

      // Should show recent activities
      await expect(page.getByText('Created site: isbd')).toBeVisible();
      await expect(page.getByText('Updated LRM documentation')).toBeVisible();
    });
  });

  e2eTest.describe('Responsive Design @ui', () => {
    e2eTest('adapts to mobile viewport', async ({ page }) => {
      await mockAdminSession(page, {
        isAuthenticated: true,
        username: 'admin',
        teams: ['system-admin'],
      });

      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');

      // Mobile menu should be visible
      await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();

      // Cards should stack vertically
      const cards = page.locator('.MuiCard-root');
      const count = await cards.count();
      
      for (let i = 0; i < count - 1; i++) {
        const card1Box = await cards.nth(i).boundingBox();
        const card2Box = await cards.nth(i + 1).boundingBox();
        
        // Verify vertical stacking
        expect(card1Box!.y).toBeLessThan(card2Box!.y);
      }
    });

    e2eTest('maintains functionality on tablet', async ({ page }) => {
      await mockAdminSession(page, {
        isAuthenticated: true,
        username: 'admin',
        teams: ['system-admin'],
      });

      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard');

      // All functionality should remain accessible
      await expect(page.getByRole('button', { name: 'Create New Site' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Manage GitHub Teams' })).toBeVisible();
    });
  });
});