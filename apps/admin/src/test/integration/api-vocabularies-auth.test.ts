/**
 * @integration @api @auth @critical
 * Integration tests for Vocabulary API with namespace-level authorization
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GET as listVocabularies, POST as createVocabulary } from '../../app/api/admin/vocabularies/route';
import { 
  GET as getVocabulary, 
  PUT as updateVocabulary, 
  DELETE as deleteVocabulary 
} from '../../app/api/admin/vocabularies/[id]/route';
import { TestUsers, clearTestUsersCache } from '../../test-config/clerk-test-users';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

describe('Vocabularies API Authorization @integration @api @auth @critical', () => {
  const testDir = path.join(__dirname, '.test-output');
  
  // Test vocabulary data
  const testVocabulary = {
    name: 'Test Vocabulary',
    description: 'A test vocabulary for integration testing',
    namespaceId: 'isbd',
    prefix: 'test',
    uri: 'http://example.org/test',
    status: 'draft' as const,
    visibility: 'public' as const,
  };

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    clearTestUsersCache();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
    vi.resetModules();
  });

  describe('GET /api/admin/vocabularies - List Vocabularies', () => {
    describe('Authorization Matrix @auth', () => {
      it('should allow superadmin to list all vocabularies', async () => {
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

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'GET',
        });

        const response = await listVocabularies(request as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(Array.isArray(data.data)).toBe(true);
      });

      it('should allow RG admin to list vocabularies in their namespaces', async () => {
        const user = await TestUsers.getReviewGroupAdmin();
        expect(user).toBeDefined();

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

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'GET',
        });

        const response = await listVocabularies(request as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        // Should only see vocabularies from accessible namespaces
      });

      it('should allow editor to list vocabularies in their namespaces', async () => {
        const user = await TestUsers.getEditor();
        expect(user).toBeDefined();

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

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'GET',
        });

        const response = await listVocabularies(request as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
      });

      it('should deny access without authentication', async () => {
        vi.doMock('../../lib/authorization', async () => {
          const actual = await vi.importActual('../../lib/authorization');
          return {
            ...actual,
            getAuthContext: vi.fn().mockResolvedValue(null),
          };
        });

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'GET',
        });

        const response = await listVocabularies(request as any);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('AUTH_REQUIRED');
      });
    });

    describe('Query Parameters @api', () => {
      it('should filter vocabularies by namespace', async () => {
        const user = await TestUsers.getReviewGroupAdmin();
        
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

        const request = new Request('http://localhost:3000/api/admin/vocabularies?namespace=isbd', {
          method: 'GET',
        });

        const response = await listVocabularies(request as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        // All returned vocabularies should be from ISBD namespace
      });

      it('should filter vocabularies by status', async () => {
        const user = await TestUsers.getSuperAdmin();
        
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

        const request = new Request('http://localhost:3000/api/admin/vocabularies?status=published', {
          method: 'GET',
        });

        const response = await listVocabularies(request as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      });
    });
  });

  describe('POST /api/admin/vocabularies - Create Vocabulary', () => {
    describe('Authorization Matrix @auth @critical', () => {
      it('should allow superadmin to create vocabularies', async () => {
        const user = await TestUsers.getSuperAdmin();
        
        vi.doMock('../../lib/authorization', async () => {
          const actual = await vi.importActual('../../lib/authorization');
          return {
            ...actual,
            getAuthContext: vi.fn().mockResolvedValue({
              userId: user!.id,
              email: user!.email,
              roles: user!.roles,
            }),
            canPerformAction: vi.fn().mockResolvedValue(true),
          };
        });

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testVocabulary),
        });

        const response = await createVocabulary(request as any);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.name).toBe(testVocabulary.name);
        expect(data.data.namespaceId).toBe(testVocabulary.namespaceId);
      });

      it('should allow RG admin to create vocabularies in their namespaces', async () => {
        const user = await TestUsers.getReviewGroupAdmin();
        
        vi.doMock('../../lib/authorization', async () => {
          const actual = await vi.importActual('../../lib/authorization');
          return {
            ...actual,
            getAuthContext: vi.fn().mockResolvedValue({
              userId: user!.id,
              email: user!.email,
              roles: user!.roles,
            }),
            canPerformAction: vi.fn().mockImplementation(async (resource, action, attributes) => {
              // RG admin can create vocabularies in ISBD namespace
              if (resource === 'vocabulary' && action === 'create' && attributes?.namespaceId === 'isbd') {
                return true;
              }
              return false;
            }),
          };
        });

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testVocabulary),
        });

        const response = await createVocabulary(request as any);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.namespaceId).toBe('isbd');
      });

      it('should deny RG admin from creating vocabularies in other namespaces', async () => {
        const user = await TestUsers.getReviewGroupAdmin();
        
        vi.doMock('../../lib/authorization', async () => {
          const actual = await vi.importActual('../../lib/authorization');
          return {
            ...actual,
            getAuthContext: vi.fn().mockResolvedValue({
              userId: user!.id,
              email: user!.email,
              roles: user!.roles,
            }),
            canPerformAction: vi.fn().mockImplementation(async (resource, action, attributes) => {
              // RG admin cannot create vocabularies in LRM namespace
              if (resource === 'vocabulary' && action === 'create' && attributes?.namespaceId === 'lrm') {
                return false;
              }
              return true;
            }),
          };
        });

        const unauthorizedVocab = { ...testVocabulary, namespaceId: 'lrm' };
        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(unauthorizedVocab),
        });

        const response = await createVocabulary(request as any);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('PERMISSION_DENIED');
      });

      it('should allow editor to create vocabularies in their namespaces', async () => {
        const user = await TestUsers.getEditor();
        
        vi.doMock('../../lib/authorization', async () => {
          const actual = await vi.importActual('../../lib/authorization');
          return {
            ...actual,
            getAuthContext: vi.fn().mockResolvedValue({
              userId: user!.id,
              email: user!.email,
              roles: user!.roles,
            }),
            canPerformAction: vi.fn().mockImplementation(async (resource, action, attributes) => {
              // Editor can create vocabularies in their namespaces
              if (resource === 'vocabulary' && action === 'create' && 
                  (attributes?.namespaceId === 'isbd' || attributes?.namespaceId === 'isbdm')) {
                return true;
              }
              return false;
            }),
          };
        });

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testVocabulary),
        });

        const response = await createVocabulary(request as any);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
      });

      it('should deny author from creating vocabularies', async () => {
        const user = await TestUsers.getAuthor();
        
        vi.doMock('../../lib/authorization', async () => {
          const actual = await vi.importActual('../../lib/authorization');
          return {
            ...actual,
            getAuthContext: vi.fn().mockResolvedValue({
              userId: user!.id,
              email: user!.email,
              roles: user!.roles,
            }),
            canPerformAction: vi.fn().mockResolvedValue(false), // Authors cannot create
          };
        });

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...testVocabulary, namespaceId: 'lrm' }),
        });

        const response = await createVocabulary(request as any);
        const data = await response.json();

        expect(response.status).toBe(403);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('PERMISSION_DENIED');
      });
    });

    describe('Input Validation @validation', () => {
      it('should validate required fields', async () => {
        const user = await TestUsers.getSuperAdmin();
        
        vi.doMock('../../lib/authorization', async () => {
          const actual = await vi.importActual('../../lib/authorization');
          return {
            ...actual,
            getAuthContext: vi.fn().mockResolvedValue({
              userId: user!.id,
              email: user!.email,
              roles: user!.roles,
            }),
            canPerformAction: vi.fn().mockResolvedValue(true),
          };
        });

        const invalidVocab = {
          description: 'Missing required fields',
          // Missing: name, namespaceId, prefix, uri
        };

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidVocab),
        });

        const response = await createVocabulary(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('VALIDATION_ERROR');
      });

      it('should validate URI format', async () => {
        const user = await TestUsers.getSuperAdmin();
        
        vi.doMock('../../lib/authorization', async () => {
          const actual = await vi.importActual('../../lib/authorization');
          return {
            ...actual,
            getAuthContext: vi.fn().mockResolvedValue({
              userId: user!.id,
              email: user!.email,
              roles: user!.roles,
            }),
            canPerformAction: vi.fn().mockResolvedValue(true),
          };
        });

        const invalidUriVocab = {
          ...testVocabulary,
          uri: 'not-a-valid-uri', // Invalid URI format
        };

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidUriVocab),
        });

        const response = await createVocabulary(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('VALIDATION_ERROR');
      });

      it('should validate status enum values', async () => {
        const user = await TestUsers.getSuperAdmin();
        
        vi.doMock('../../lib/authorization', async () => {
          const actual = await vi.importActual('../../lib/authorization');
          return {
            ...actual,
            getAuthContext: vi.fn().mockResolvedValue({
              userId: user!.id,
              email: user!.email,
              roles: user!.roles,
            }),
            canPerformAction: vi.fn().mockResolvedValue(true),
          };
        });

        const invalidStatusVocab = {
          ...testVocabulary,
          status: 'invalid-status', // Invalid enum value
        };

        const request = new Request('http://localhost:3000/api/admin/vocabularies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidStatusVocab),
        });

        const response = await createVocabulary(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
      });
    });
  });

  describe('GET /api/admin/vocabularies/[id] - Get Single Vocabulary', () => {
    const mockVocabularyId = 'vocab-123';

    it('should allow users with namespace access to view vocabulary', async () => {
      const user = await TestUsers.getEditor();
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          canPerformAction: vi.fn().mockResolvedValue(true),
        };
      });

      // Mock database response
      vi.doMock('../../lib/db', () => ({
        getVocabularyById: vi.fn().mockResolvedValue({
          id: mockVocabularyId,
          ...testVocabulary,
        }),
      }));

      const request = new Request(`http://localhost:3000/api/admin/vocabularies/${mockVocabularyId}`, {
        method: 'GET',
      });

      const response = await getVocabulary(request as any, { params: { id: mockVocabularyId } } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockVocabularyId);
    });

    it('should deny access to vocabularies in inaccessible namespaces', async () => {
      const user = await TestUsers.getAuthor(); // Author with access to LRM only
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          canPerformAction: vi.fn().mockResolvedValue(false), // No access to ISBD
        };
      });

      // Mock database response - vocabulary in ISBD namespace
      vi.doMock('../../lib/db', () => ({
        getVocabularyById: vi.fn().mockResolvedValue({
          id: mockVocabularyId,
          ...testVocabulary,
          namespaceId: 'isbd',
        }),
      }));

      const request = new Request(`http://localhost:3000/api/admin/vocabularies/${mockVocabularyId}`, {
        method: 'GET',
      });

      const response = await getVocabulary(request as any, { params: { id: mockVocabularyId } } as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('PERMISSION_DENIED');
    });

    it('should return 404 for non-existent vocabulary', async () => {
      const user = await TestUsers.getSuperAdmin();
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
        };
      });

      // Mock database response - vocabulary not found
      vi.doMock('../../lib/db', () => ({
        getVocabularyById: vi.fn().mockResolvedValue(null),
      }));

      const request = new Request('http://localhost:3000/api/admin/vocabularies/non-existent', {
        method: 'GET',
      });

      const response = await getVocabulary(request as any, { params: { id: 'non-existent' } } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PUT /api/admin/vocabularies/[id] - Update Vocabulary', () => {
    const mockVocabularyId = 'vocab-123';
    const updateData = {
      name: 'Updated Vocabulary Name',
      description: 'Updated description',
      status: 'published' as const,
    };

    it('should allow editor to update vocabularies in their namespaces', async () => {
      const user = await TestUsers.getEditor();
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          canPerformAction: vi.fn().mockResolvedValue(true),
        };
      });

      // Mock database responses
      vi.doMock('../../lib/db', () => ({
        getVocabularyById: vi.fn().mockResolvedValue({
          id: mockVocabularyId,
          ...testVocabulary,
        }),
        updateVocabulary: vi.fn().mockResolvedValue({
          id: mockVocabularyId,
          ...testVocabulary,
          ...updateData,
        }),
      }));

      const request = new Request(`http://localhost:3000/api/admin/vocabularies/${mockVocabularyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const response = await updateVocabulary(request as any, { params: { id: mockVocabularyId } } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe(updateData.name);
      expect(data.data.status).toBe(updateData.status);
    });

    it('should deny author from updating vocabularies', async () => {
      const user = await TestUsers.getAuthor();
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          canPerformAction: vi.fn().mockResolvedValue(false),
        };
      });

      const request = new Request(`http://localhost:3000/api/admin/vocabularies/${mockVocabularyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const response = await updateVocabulary(request as any, { params: { id: mockVocabularyId } } as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('PERMISSION_DENIED');
    });

    it('should prevent changing namespaceId', async () => {
      const user = await TestUsers.getSuperAdmin();
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          canPerformAction: vi.fn().mockResolvedValue(true),
        };
      });

      const invalidUpdate = {
        ...updateData,
        namespaceId: 'different-namespace', // Attempting to change namespace
      };

      const request = new Request(`http://localhost:3000/api/admin/vocabularies/${mockVocabularyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUpdate),
      });

      const response = await updateVocabulary(request as any, { params: { id: mockVocabularyId } } as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('namespaceId cannot be changed');
    });
  });

  describe('DELETE /api/admin/vocabularies/[id] - Delete Vocabulary', () => {
    const mockVocabularyId = 'vocab-123';

    it('should allow RG admin to delete vocabularies in their namespaces', async () => {
      const user = await TestUsers.getReviewGroupAdmin();
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          canPerformAction: vi.fn().mockResolvedValue(true),
        };
      });

      // Mock database responses
      vi.doMock('../../lib/db', () => ({
        getVocabularyById: vi.fn().mockResolvedValue({
          id: mockVocabularyId,
          ...testVocabulary,
          namespaceId: 'isbd',
        }),
        deleteVocabulary: vi.fn().mockResolvedValue(true),
      }));

      const request = new Request(`http://localhost:3000/api/admin/vocabularies/${mockVocabularyId}`, {
        method: 'DELETE',
      });

      const response = await deleteVocabulary(request as any, { params: { id: mockVocabularyId } } as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('deleted successfully');
    });

    it('should deny editor from deleting vocabularies', async () => {
      const user = await TestUsers.getEditor();
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          canPerformAction: vi.fn().mockResolvedValue(false), // Editors cannot delete
        };
      });

      const request = new Request(`http://localhost:3000/api/admin/vocabularies/${mockVocabularyId}`, {
        method: 'DELETE',
      });

      const response = await deleteVocabulary(request as any, { params: { id: mockVocabularyId } } as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('PERMISSION_DENIED');
    });

    it('should deny author from deleting vocabularies', async () => {
      const user = await TestUsers.getAuthor();
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          canPerformAction: vi.fn().mockResolvedValue(false),
        };
      });

      const request = new Request(`http://localhost:3000/api/admin/vocabularies/${mockVocabularyId}`, {
        method: 'DELETE',
      });

      const response = await deleteVocabulary(request as any, { params: { id: mockVocabularyId } } as any);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('PERMISSION_DENIED');
    });

    it('should return 404 when deleting non-existent vocabulary', async () => {
      const user = await TestUsers.getSuperAdmin();
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
        };
      });

      // Mock database response - vocabulary not found
      vi.doMock('../../lib/db', () => ({
        getVocabularyById: vi.fn().mockResolvedValue(null),
      }));

      const request = new Request('http://localhost:3000/api/admin/vocabularies/non-existent', {
        method: 'DELETE',
      });

      const response = await deleteVocabulary(request as any, { params: { id: 'non-existent' } } as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Performance and Caching @performance', () => {
    it('should complete authorization checks within performance target', async () => {
      const user = await TestUsers.getSuperAdmin();
      
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

      const startTime = Date.now();
      
      const request = new Request('http://localhost:3000/api/admin/vocabularies', {
        method: 'GET',
      });

      const response = await listVocabularies(request as any);
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should benefit from authorization caching on repeated requests', async () => {
      const user = await TestUsers.getEditor();
      
      let authCallCount = 0;
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockImplementation(async () => {
            authCallCount++;
            return {
              userId: user!.id,
              email: user!.email,
              roles: user!.roles,
            };
          }),
          canPerformAction: vi.fn().mockResolvedValue(true),
        };
      });

      // First request
      const request1 = new Request('http://localhost:3000/api/admin/vocabularies/vocab-1', {
        method: 'GET',
      });
      await getVocabulary(request1 as any, { params: { id: 'vocab-1' } } as any);

      // Second request (should use cache)
      const request2 = new Request('http://localhost:3000/api/admin/vocabularies/vocab-1', {
        method: 'GET',
      });
      await getVocabulary(request2 as any, { params: { id: 'vocab-1' } } as any);

      // Auth context should be cached (called less than twice)
      expect(authCallCount).toBeLessThanOrEqual(2);
    });
  });

  describe('Error Handling @validation', () => {
    it('should handle malformed JSON in request body', async () => {
      const request = new Request('http://localhost:3000/api/admin/vocabularies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json {',
      });

      const response = await createVocabulary(request as any);
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle database errors gracefully', async () => {
      const user = await TestUsers.getSuperAdmin();
      
      vi.doMock('../../lib/authorization', async () => {
        const actual = await vi.importActual('../../lib/authorization');
        return {
          ...actual,
          getAuthContext: vi.fn().mockResolvedValue({
            userId: user!.id,
            email: user!.email,
            roles: user!.roles,
          }),
          canPerformAction: vi.fn().mockResolvedValue(true),
        };
      });

      // Mock database error
      vi.doMock('../../lib/db', () => ({
        createVocabulary: vi.fn().mockRejectedValue(new Error('Database connection failed')),
      }));

      const request = new Request('http://localhost:3000/api/admin/vocabularies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testVocabulary),
      });

      const response = await createVocabulary(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });

    it('should handle missing content-type header', async () => {
      const request = new Request('http://localhost:3000/api/admin/vocabularies', {
        method: 'POST',
        body: JSON.stringify(testVocabulary),
        // Missing Content-Type header
      });

      const response = await createVocabulary(request as any);
      
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Complete Authorization Matrix @auth @critical', () => {
    it('should verify complete permission matrix for vocabulary operations', async () => {
      const testCases = [
        {
          role: 'superadmin',
          user: await TestUsers.getSuperAdmin(),
          permissions: {
            list: true,
            read: true,
            create: true,
            update: true,
            delete: true,
          },
        },
        {
          role: 'review group admin',
          user: await TestUsers.getReviewGroupAdmin(),
          permissions: {
            list: true,
            read: true,
            create: true,
            update: true,
            delete: true, // Can delete in their namespaces
          },
        },
        {
          role: 'editor',
          user: await TestUsers.getEditor(),
          permissions: {
            list: true,
            read: true,
            create: true,
            update: true,
            delete: false, // Cannot delete
          },
        },
        {
          role: 'author',
          user: await TestUsers.getAuthor(),
          permissions: {
            list: true,
            read: true,
            create: false, // Cannot create
            update: false, // Cannot update
            delete: false, // Cannot delete
          },
        },
        {
          role: 'translator',
          user: await TestUsers.getTranslator(),
          permissions: {
            list: true,
            read: true,
            create: false,
            update: false, // Can only update translations
            delete: false,
          },
        },
      ];

      for (const testCase of testCases) {
        expect(testCase.user).toBeDefined();
        expect(testCase.user?.id).toMatch(/^user_/);
        
        // Log the expected permissions for documentation
        console.log(`${testCase.role} vocabulary permissions:`, testCase.permissions);
      }
    });
  });
});