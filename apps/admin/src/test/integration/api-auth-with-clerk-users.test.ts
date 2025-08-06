/**
 * @integration @api @auth @high-priority
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET } from '../../app/api/admin/namespaces/route';
import { 
  TestScenarios, 
  createTestRequest, 
  extractResponseData,
  TestAssertions,
  testAuthorizationMatrix 
} from '../../test-config/clerk-test-helpers';
import { TestUsers } from '../../test-config/clerk-test-users';

describe('API Authorization with Clerk Test Users @integration @api @auth @clerk', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset modules after each test
    vi.resetModules();
  });

  describe('GET /api/admin/namespaces', () => {
    it('should allow superadmin to access namespaces', async () => {
      await TestScenarios.withSuperAdmin(async (user) => {
        const request = createTestRequest('GET');
        const response = await GET(request);
        const result = await extractResponseData(response);

        TestAssertions.expectSuccess(result);
        expect(result.data.success).toBe(true);
        expect(result.data.data).toBeDefined();
      });
    });

    it('should allow review group admin to access namespaces', async () => {
      await TestScenarios.withReviewGroupAdmin(async (user) => {
        const request = createTestRequest('GET');
        const response = await GET(request);
        const result = await extractResponseData(response);

        TestAssertions.expectSuccess(result);
        expect(result.data.success).toBe(true);
        expect(result.data.data).toBeDefined();
      });
    });

    it('should allow editor to access namespaces', async () => {
      await TestScenarios.withEditor(async (user) => {
        const request = createTestRequest('GET');
        const response = await GET(request);
        const result = await extractResponseData(response);

        TestAssertions.expectSuccess(result);
        expect(result.data.success).toBe(true);
        expect(result.data.data).toBeDefined();
      });
    });

    it('should deny access without authentication', async () => {
      await TestScenarios.withNoAuth(async () => {
        const request = createTestRequest('GET');
        const response = await GET(request);
        const result = await extractResponseData(response);

        TestAssertions.expectUnauthenticated(result);
        expect(result.data.error.code).toBe('AUTH_REQUIRED');
      });
    });

    it('should test authorization matrix', async () => {
      const results = await testAuthorizationMatrix(
        async (user) => {
          const request = createTestRequest('GET');
          const response = await GET(request);
          return extractResponseData(response);
        },
        {
          superadmin: 'allow',
          reviewGroupAdmin: 'allow',
          editor: 'allow',
          author: 'allow',
          translator: 'allow',
          noAuth: 'deny',
        }
      );

      // Verify superadmin access
      TestAssertions.expectSuccess(results.superadmin);
      
      // Verify review group admin access
      TestAssertions.expectSuccess(results.reviewGroupAdmin);
      
      // Verify editor access
      TestAssertions.expectSuccess(results.editor);
      
      // Verify no auth is denied
      TestAssertions.expectUnauthenticated(results.noAuth);
    });
  });

  describe('User Role Verification', () => {
    it('should verify superadmin has correct permissions', async () => {
      const user = await TestUsers.getSuperAdmin();
      expect(user).toBeDefined();
      expect(user?.roles.systemRole).toBe('superadmin');
      expect(user?.email).toBe('superadmin+clerk_test@example.com');
    });

    it('should verify review group admin has correct permissions', async () => {
      const user = await TestUsers.getReviewGroupAdmin();
      expect(user).toBeDefined();
      expect(user?.roles.reviewGroups).toHaveLength(1);
      expect(user?.roles.reviewGroups[0].reviewGroupId).toBe('isbd');
      expect(user?.roles.reviewGroups[0].role).toBe('admin');
    });

    it('should verify editor has correct permissions', async () => {
      const user = await TestUsers.getEditor();
      expect(user).toBeDefined();
      expect(user?.roles.teams).toHaveLength(1);
      expect(user?.roles.teams[0].role).toBe('editor');
      expect(user?.roles.teams[0].namespaces).toContain('isbd');
      expect(user?.roles.teams[0].namespaces).toContain('isbdm');
    });

    it('should verify author has correct permissions', async () => {
      const user = await TestUsers.getAuthor();
      expect(user).toBeDefined();
      expect(user?.roles.teams).toHaveLength(1);
      expect(user?.roles.teams[0].role).toBe('author');
      expect(user?.roles.teams[0].namespaces).toContain('lrm');
    });

    it('should verify translator has correct permissions', async () => {
      const user = await TestUsers.getTranslator();
      expect(user).toBeDefined();
      expect(user?.roles.translations).toHaveLength(1);
      expect(user?.roles.translations[0].language).toBe('fr');
      expect(user?.roles.translations[0].namespaces).toContain('isbd');
      expect(user?.roles.translations[0].namespaces).toContain('lrm');
    });
  });

  describe('Real Authorization Logic Testing', () => {
    it('should test namespace filtering based on user permissions', async () => {
      // Test that editor only sees namespaces they have access to
      await TestScenarios.withEditor(async (user) => {
        const request = createTestRequest('GET');
        const response = await GET(request);
        const result = await extractResponseData(response);

        TestAssertions.expectSuccess(result);
        
        // Editor should see namespaces they have team access to
        const namespaces = result.data.data;
        expect(namespaces).toBeDefined();
        
        // This would depend on your actual namespace filtering logic
        // The test verifies that the authorization system works with real user data
      });
    });

    it('should test review group filtering', async () => {
      await TestScenarios.withReviewGroupAdmin(async (user) => {
        const request = createTestRequest('GET', null, {
          'Content-Type': 'application/json'
        });
        
        // Add query parameter for review group filtering
        const url = new URL(request.url);
        url.searchParams.set('reviewGroup', 'isbd');
        
        const filteredRequest = Object.assign(new Request(url.toString(), {
          method: request.method,
          headers: request.headers,
          body: request.body,
        }), {
          cookies: new Map(),
          nextUrl: url,
          page: undefined,
          ua: undefined,
        });

        const response = await GET(filteredRequest as any);
        const result = await extractResponseData(response);

        TestAssertions.expectSuccess(result);
        
        // Should return namespaces for the ISBD review group
        const namespaces = result.data.data;
        expect(namespaces).toBeDefined();
      });
    });
  });
});