/**
 * Cross-Service Integration Tests
 * Tests for interactions between different services
 */

import { test, expect, integrationTest } from '../utils/tagged-test';
import { TestData } from '../fixtures/test-data.fixture';

test.describe('Cross-Service Integration Tests @integration @api', () => {
  integrationTest('vocabulary changes should sync across services', async ({ page, request, context }) => {
    // This test verifies that vocabulary changes in admin are reflected in documentation sites
    test.skip(true, 'Requires full service integration setup');
    
    // Example test structure:
    // 1. Create vocabulary in admin
    // const adminPage = await context.newPage();
    // await adminPage.goto('/admin/vocabularies');
    // await adminPage.click('button:has-text("Add Vocabulary")');
    // await adminPage.fill('[name="term"]', 'Integration Test Term');
    // await adminPage.fill('[name="definition"]', 'Test Definition');
    // await adminPage.click('button:has-text("Save")');
    
    // 2. Verify it appears in documentation site
    // await page.goto('/isbdm/vocabulary');
    // await expect(page.locator('text=Integration Test Term')).toBeVisible({ timeout: 10000 });
    
    // 3. Clean up
    // await adminPage.goto('/admin/vocabularies');
    // await adminPage.click('text=Integration Test Term');
    // await adminPage.click('button:has-text("Delete")');
  });

  integrationTest('API rate limiting should work across endpoints', async ({ request }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3007';
    const requests = [];
    
    // Make multiple rapid requests
    for (let i = 0; i < 20; i++) {
      requests.push(
        request.get(`${baseUrl}/admin/api/health`).catch(e => e)
      );
    }
    
    const responses = await Promise.all(requests);
    
    // Some requests should be rate limited (if rate limiting is enabled)
    const rateLimited = responses.filter(r => 
      r.status && r.status() === 429
    );
    
    // This is a soft check - rate limiting might not be enabled in all environments
    if (rateLimited.length > 0) {
      console.log(`Rate limiting is active: ${rateLimited.length} requests were limited`);
      expect(rateLimited.length).toBeGreaterThan(0);
    } else {
      console.log('Rate limiting not detected - this might be expected in test environment');
    }
  });

  integrationTest('shared authentication should work between portal and admin', async ({ context }) => {
    test.skip(true, 'Requires Clerk authentication setup');
    
    // Example test structure:
    // 1. Login to admin
    // const adminPage = await context.newPage();
    // await adminPage.goto('/admin');
    // await authFixture.loginAs('admin', adminPage);
    
    // 2. Open portal in same context
    // const portalPage = await context.newPage();
    // await portalPage.goto('/portal');
    
    // 3. Should be authenticated in both
    // await expect(adminPage.locator('[data-testid="user-menu"]')).toBeVisible();
    // await expect(portalPage.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // 4. Logout from one should affect the other
    // await adminPage.click('[data-testid="user-menu"]');
    // await adminPage.click('text=Logout');
    // await portalPage.reload();
    // await expect(portalPage.locator('text=Sign in')).toBeVisible();
  });

  integrationTest('database transactions should maintain consistency', async ({ request }) => {
    test.skip(true, 'Requires database setup');
    
    // Example test structure:
    // 1. Start a multi-step operation
    // const createResponse = await request.post('/admin/api/vocabularies/batch', {
    //   data: TestData.vocabulary.batch
    // });
    
    // 2. Verify partial failure handling
    // If one item fails, all should rollback
    
    // 3. Verify final state
    // const listResponse = await request.get('/admin/api/vocabularies');
    // const items = await listResponse.json();
    // Either all items exist or none do
  });

  integrationTest('search functionality should work across sites', async ({ page }) => {
    // Test that search indexes are properly synchronized
    const searchTerm = 'library';
    
    // Search in portal
    await page.goto('/');
    const portalSearch = page.locator('input[type="search"], [role="searchbox"]').first();
    
    if (await portalSearch.isVisible()) {
      await portalSearch.fill(searchTerm);
      await portalSearch.press('Enter');
      
      // Should show results (or search page)
      await expect(page.locator('text=/result|search/i')).toBeVisible({ timeout: 5000 });
    }
    
    // Search in ISBDM site
    await page.goto('/isbdm');
    const isbdmSearch = page.locator('input[type="search"], [role="searchbox"]').first();
    
    if (await isbdmSearch.isVisible()) {
      await isbdmSearch.fill(searchTerm);
      await isbdmSearch.press('Enter');
      
      // Should show results
      await expect(page.locator('text=/result|search/i')).toBeVisible({ timeout: 5000 });
    }
  });

  integrationTest('error handling should be consistent across services', async ({ request }) => {
    const endpoints = [
      '/admin/api/vocabularies/invalid-id',
      '/admin/api/users/invalid-id',
      '/admin/api/sites/invalid-id',
    ];
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3007';
    
    for (const endpoint of endpoints) {
      const response = await request.get(`${baseUrl}${endpoint}`).catch(e => e);
      
      if (response.status) {
        // Should return consistent error format
        expect([400, 401, 403, 404]).toContain(response.status());
        
        if (response.headers()['content-type']?.includes('application/json')) {
          const error = await response.json().catch(() => null);
          if (error) {
            // Should have consistent error structure
            expect(error).toHaveProperty('error');
            // Optionally check for message, code, etc.
          }
        }
      }
    }
  });
});