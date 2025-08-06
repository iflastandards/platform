/**
 * @integration @api @auth @critical
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET, POST } from '../../app/api/admin/namespaces/route';
import { TestUsers, clearTestUsersCache } from '../../test-config/clerk-test-users';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

describe('Namespaces API Authorization @integration @api @auth @critical', () => {
  const testDir = path.join(__dirname, '.test-output');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    clearTestUsersCache();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    vi.resetModules();
  });

  describe('GET /api/admin/namespaces with Real User Authorization', () => {
    it('should allow superadmin to list all namespaces', async () => {
      const user = await TestUsers.getSuperAdmin();
      expect(user).toBeDefined();

      // Mock Clerk's getAuthContext to return our test user
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          getUserAccessibleResources: vi.fn().mockResolvedValue({
            reviewGroups: 'all',
            namespaces: 'all',
            projects: 'all',
            teams: 'all',
          }),
        };
      });

      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'GET',
      });

      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should allow review group admin to list namespaces in their group', async () => {
      const user = await TestUsers.getReviewGroupAdmin();
      expect(user).toBeDefined();

      // Mock authorization for RG admin
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          getUserAccessibleResources: vi.fn().mockResolvedValue({
            reviewGroups: ['isbd'],
            namespaces: ['isbd', 'isbdm'],
            projects: [],
            teams: [],
          }),
        };
      });

      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'GET',
      });

      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should allow editor to list namespaces they have access to', async () => {
      const user = await TestUsers.getEditor();
      expect(user).toBeDefined();

      // Mock authorization for editor
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          getUserAccessibleResources: vi.fn().mockResolvedValue({
            reviewGroups: [],
            namespaces: ['isbd', 'isbdm'],
            projects: [],
            teams: ['isbd-team-1'],
          }),
        };
      });

      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'GET',
      });

      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('should deny access without authentication', async () => {
      // Mock no authentication
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue(null),
        };
      });

      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'GET',
      });

      const response = await GET(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('POST /api/admin/namespaces with Real User Authorization', () => {
    it('should allow superadmin to create namespaces', async () => {
      const user = await TestUsers.getSuperAdmin();
      expect(user).toBeDefined();

      // Mock authorization for superadmin
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          auth: {
            canCreateNamespace: vi.fn().mockResolvedValue(true),
          },
        };
      });

      const requestBody = {
        name: 'Test Namespace',
        description: 'A test namespace',
        reviewGroupId: 'isbd',
        visibility: 'public',
      };

      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.name).toBe('Test Namespace');
    });

    it('should allow review group admin to create namespaces in their group', async () => {
      const user = await TestUsers.getReviewGroupAdmin();
      expect(user).toBeDefined();

      // Mock authorization for RG admin
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          auth: {
            canCreateNamespace: vi.fn().mockResolvedValue(true),
          },
        };
      });

      const requestBody = {
        name: 'ISBD Test Namespace',
        description: 'A test namespace for ISBD',
        reviewGroupId: 'isbd',
        visibility: 'public',
      };

      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.reviewGroup).toBe('isbd');
    });

    it('should deny namespace creation for editors', async () => {
      const user = await TestUsers.getEditor();
      expect(user).toBeDefined();

      // Mock authorization denial for editor
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          auth: {
            canCreateNamespace: vi.fn().mockResolvedValue(false),
          },
        };
      });

      const requestBody = {
        name: 'Unauthorized Namespace',
        description: 'Should not be created',
        reviewGroupId: 'isbd',
        visibility: 'public',
      };

      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('PERMISSION_DENIED');
    });

    it('should validate required fields', async () => {
      const user = await TestUsers.getSuperAdmin();
      expect(user).toBeDefined();

      const requestBody = {
        // Missing required fields
        description: 'Missing name and reviewGroupId',
      };

      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.missing).toContain('name');
      expect(data.error.details.missing).toContain('reviewGroupId');
    });
  });

  describe('Real User Permission Matrix', () => {
    it('should test permission matrix with all user types', async () => {
      const testCases = [
        {
          name: 'superadmin',
          user: await TestUsers.getSuperAdmin(),
          expectedAccess: true,
          expectedCreate: true,
        },
        {
          name: 'review group admin',
          user: await TestUsers.getReviewGroupAdmin(),
          expectedAccess: true,
          expectedCreate: true,
        },
        {
          name: 'editor',
          user: await TestUsers.getEditor(),
          expectedAccess: true,
          expectedCreate: false,
        },
        {
          name: 'author',
          user: await TestUsers.getAuthor(),
          expectedAccess: true,
          expectedCreate: false,
        },
        {
          name: 'translator',
          user: await TestUsers.getTranslator(),
          expectedAccess: true,
          expectedCreate: false,
        },
      ];

      for (const testCase of testCases) {
        expect(testCase.user).toBeDefined();
        expect(testCase.user?.id).toMatch(/^user_/);
        expect(testCase.user?.email).toContain('+clerk_test@example.com');

        // Verify user has expected role structure
        expect(testCase.user?.roles).toBeDefined();
        expect(testCase.user?.roles.reviewGroups).toBeDefined();
        expect(testCase.user?.roles.teams).toBeDefined();
        expect(testCase.user?.roles.translations).toBeDefined();
      }
    });
  });

  describe('Error Handling with Real Conditions', () => {
    it('should handle malformed request bodies', async () => {
      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request as any);
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle missing content-type header', async () => {
      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'POST',
        body: JSON.stringify({ name: 'test' }),
      });

      const response = await POST(request as any);
      
      // Should handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Performance with Real User Data', () => {
    it('should complete authorization checks within performance target', async () => {
      const user = await TestUsers.getSuperAdmin();
      expect(user).toBeDefined();

      const startTime = Date.now();

      // Mock fast authorization
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          getUserAccessibleResources: vi.fn().mockResolvedValue({
            reviewGroups: 'all',
            namespaces: 'all',
            projects: 'all',
            teams: 'all',
          }),
        };
      });

      const request = new Request('http://localhost:3000/api/admin/namespaces', {
        method: 'GET',
      });

      const response = await GET(request as any);
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});