/**
 * Unit tests for authorization functions
 * @unit @auth @critical
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAuthContext,
  canPerformAction,
  getUserAccessibleResources,
  invalidateUserCache,
  requireAuth,
  auth,
  type ResourceType
} from '../authorization';
import { type AuthContext } from '../schemas/auth.schema';
import { getAuthCache } from '../cache/AuthCache';

// Mock Clerk's currentUser
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn()
}));

// Mock the auth cache
vi.mock('../cache/AuthCache', () => ({
  getAuthCache: vi.fn(() => ({
    getCachedAuthContext: vi.fn(),
    cacheAuthContext: vi.fn(),
    getCachedPermission: vi.fn(),
    cachePermission: vi.fn(),
    invalidateUser: vi.fn(),
    getStatistics: vi.fn(() => ({
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalCached: 0
    }))
  }))
}));

describe('Authorization Functions @unit @auth @critical', () => {
  const mockCache = {
    getCachedAuthContext: vi.fn(),
    cacheAuthContext: vi.fn(),
    getCachedPermission: vi.fn(),
    cachePermission: vi.fn(),
    invalidateUser: vi.fn(),
    getStatistics: vi.fn(() => ({
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalCached: 0
    }))
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAuthCache as any).mockReturnValue(mockCache);
    mockCache.getCachedAuthContext.mockReturnValue(null);
    mockCache.getCachedPermission.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthContext', () => {
    it('should return null when user is not authenticated', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue(null);

      const result = await getAuthContext();
      expect(result).toBeNull();
    });

    it('should return cached auth context if available', async () => {
      const cachedContext: AuthContext = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: {
          systemRole: 'superadmin',
          reviewGroups: [],
          teams: [],
          translations: []
        }
      };

      mockCache.getCachedAuthContext.mockReturnValue(cachedContext);
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({ id: 'user-123' });

      const result = await getAuthContext();
      expect(result).toEqual(cachedContext);
      expect(mockCache.getCachedAuthContext).toHaveBeenCalledWith('user-123');
    });

    it('should parse and cache user metadata for superadmin', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'super-123',
        emailAddresses: [{ emailAddress: 'super@example.com' }],
        publicMetadata: {
          systemRole: 'superadmin'
        }
      });

      const result = await getAuthContext();
      
      expect(result).toEqual({
        userId: 'super-123',
        email: 'super@example.com',
        roles: {
          system: 'superadmin',
          systemRole: 'superadmin',
          reviewGroups: [],
          teams: [],
          translations: []
        }
      });
      
      expect(mockCache.cacheAuthContext).toHaveBeenCalledWith('super-123', expect.any(Object));
    });

    it('should parse review group admin metadata', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'rg-admin-123',
        emailAddresses: [{ emailAddress: 'rgadmin@example.com' }],
        publicMetadata: {
          reviewGroups: [
            { reviewGroupId: 'isbd', role: 'admin' },
            { reviewGroupId: 'unimarc', role: 'admin' }
          ]
        }
      });

      const result = await getAuthContext();
      
      expect(result?.roles.reviewGroups).toHaveLength(2);
      expect(result?.roles.reviewGroups[0]).toEqual({
        reviewGroupId: 'isbd',
        role: 'admin'
      });
    });

    it('should parse team member metadata', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'team-member-123',
        emailAddresses: [{ emailAddress: 'member@example.com' }],
        publicMetadata: {
          teams: [
            {
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd', 'isbdm']
            }
          ]
        }
      });

      const result = await getAuthContext();
      
      expect(result?.roles.teams).toHaveLength(1);
      expect(result?.roles.teams[0]).toEqual({
        teamId: 'team-1',
        role: 'editor',
        reviewGroup: 'isbd',
        namespaces: ['isbd', 'isbdm']
      });
    });

    it('should parse translator metadata', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'translator-123',
        emailAddresses: [{ emailAddress: 'translator@example.com' }],
        publicMetadata: {
          translations: [
            {
              language: 'fr',
              namespaces: ['isbd', 'unimarc']
            }
          ]
        }
      });

      const result = await getAuthContext();
      
      expect(result?.roles.translations).toHaveLength(1);
      expect(result?.roles.translations[0]).toEqual({
        language: 'fr',
        namespaces: ['isbd', 'unimarc']
      });
    });

    it('should handle invalid metadata gracefully', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'invalid-123',
        emailAddresses: [{ emailAddress: 'invalid@example.com' }],
        publicMetadata: {
          // Invalid structure
          teams: 'not-an-array',
          reviewGroups: null
        }
      });

      const result = await getAuthContext();
      
      // Should still return a context (unvalidated for backward compatibility)
      expect(result).toBeDefined();
      // The invalid data is preserved in the unvalidated context
      expect(result?.roles.teams).toEqual('not-an-array');
      expect(result?.roles.reviewGroups).toEqual([]);
    });
  });

  describe('canPerformAction', () => {
    it('should return false when user is not authenticated', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue(null);

      const result = await canPerformAction('user', 'read');
      expect(result).toBe(false);
    });

    it('should return cached permission result if available', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        publicMetadata: {}
      });

      mockCache.getCachedPermission.mockReturnValue(true);

      const result = await canPerformAction('namespace', 'read', { namespaceId: 'isbd' });
      
      expect(result).toBe(true);
      expect(mockCache.getCachedPermission).toHaveBeenCalledWith(
        'user-123',
        'namespace',
        'read',
        { namespaceId: 'isbd' }
      );
    });

    it('should allow superadmin to perform any action', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'super-123',
        emailAddresses: [{ emailAddress: 'super@example.com' }],
        publicMetadata: {
          systemRole: 'superadmin'
        }
      });

      // Test various resource types and actions
      expect(await canPerformAction('user', 'delete')).toBe(true);
      expect(await canPerformAction('reviewGroup', 'create')).toBe(true);
      expect(await canPerformAction('namespace', 'delete')).toBe(true);
      expect(await canPerformAction('vocabulary', 'delete')).toBe(true);
      
      // Verify caching was called
      expect(mockCache.cachePermission).toHaveBeenCalled();
    });

    describe('Review Group permissions', () => {
      it('should allow review group admin to manage their review group', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'rg-admin-123',
          emailAddresses: [{ emailAddress: 'rgadmin@example.com' }],
          publicMetadata: {
            reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }]
          }
        });

        expect(await canPerformAction('reviewGroup', 'update', { reviewGroupId: 'isbd' })).toBe(true);
        expect(await canPerformAction('reviewGroup', 'delete', { reviewGroupId: 'isbd' })).toBe(true);
        expect(await canPerformAction('reviewGroup', 'manage', { reviewGroupId: 'isbd' })).toBe(true);
      });

      it('should deny review group admin from managing other review groups', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'rg-admin-123',
          emailAddresses: [{ emailAddress: 'rgadmin@example.com' }],
          publicMetadata: {
            reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }]
          }
        });

        expect(await canPerformAction('reviewGroup', 'update', { reviewGroupId: 'unimarc' })).toBe(false);
      });

      it('should deny non-superadmin from creating review groups', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'rg-admin-123',
          emailAddresses: [{ emailAddress: 'rgadmin@example.com' }],
          publicMetadata: {
            reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }]
          }
        });

        expect(await canPerformAction('reviewGroup', 'create')).toBe(false);
      });

      it('should allow authenticated users to read review groups', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'user-123',
          emailAddresses: [{ emailAddress: 'user@example.com' }],
          publicMetadata: {}
        });

        expect(await canPerformAction('reviewGroup', 'read')).toBe(true);
        expect(await canPerformAction('reviewGroup', 'list')).toBe(true);
      });
    });

    describe('Namespace permissions', () => {
      it('should allow review group admin to manage namespaces in their review group', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'rg-admin-123',
          emailAddresses: [{ emailAddress: 'rgadmin@example.com' }],
          publicMetadata: {
            reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }]
          }
        });

        expect(await canPerformAction('namespace', 'create', { reviewGroupId: 'isbd' })).toBe(true);
        expect(await canPerformAction('namespace', 'update', { reviewGroupId: 'isbd' })).toBe(true);
        expect(await canPerformAction('namespace', 'delete', { reviewGroupId: 'isbd' })).toBe(true);
      });

      it('should allow editor to update namespaces they have access to', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'editor-123',
          emailAddresses: [{ emailAddress: 'editor@example.com' }],
          publicMetadata: {
            teams: [{
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd', 'isbdm']
            }]
          }
        });

        expect(await canPerformAction('namespace', 'update', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('namespace', 'read', { namespaceId: 'isbd' })).toBe(true);
      });

      it('should deny editor from creating or deleting namespaces', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'editor-123',
          emailAddresses: [{ emailAddress: 'editor@example.com' }],
          publicMetadata: {
            teams: [{
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd']
            }]
          }
        });

        expect(await canPerformAction('namespace', 'create', { namespaceId: 'isbd' })).toBe(false);
        expect(await canPerformAction('namespace', 'delete', { namespaceId: 'isbd' })).toBe(false);
      });

      it('should allow author only read access to namespaces', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'author-123',
          emailAddresses: [{ emailAddress: 'author@example.com' }],
          publicMetadata: {
            teams: [{
              teamId: 'team-1',
              role: 'author',
              reviewGroup: 'isbd',
              namespaces: ['isbd']
            }]
          }
        });

        expect(await canPerformAction('namespace', 'read', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('namespace', 'list', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('namespace', 'update', { namespaceId: 'isbd' })).toBe(false);
        expect(await canPerformAction('namespace', 'delete', { namespaceId: 'isbd' })).toBe(false);
      });
    });

    describe('Vocabulary/ElementSet permissions', () => {
      it('should require namespace context for write operations', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'editor-123',
          emailAddresses: [{ emailAddress: 'editor@example.com' }],
          publicMetadata: {
            teams: [{
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd']
            }]
          }
        });

        // Without namespace context
        expect(await canPerformAction('vocabulary', 'create')).toBe(false);
        expect(await canPerformAction('vocabulary', 'update')).toBe(false);
        expect(await canPerformAction('vocabulary', 'delete')).toBe(false);
        
        // Read operations allowed without namespace
        expect(await canPerformAction('vocabulary', 'read')).toBe(true);
      });

      it('should allow editor full access to vocabularies in their namespace', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'editor-123',
          emailAddresses: [{ emailAddress: 'editor@example.com' }],
          publicMetadata: {
            teams: [{
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd']
            }]
          }
        });

        expect(await canPerformAction('vocabulary', 'create', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('vocabulary', 'read', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('vocabulary', 'update', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('vocabulary', 'delete', { namespaceId: 'isbd' })).toBe(true);
      });

      it('should allow author to create and update but not delete vocabularies', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'author-123',
          emailAddresses: [{ emailAddress: 'author@example.com' }],
          publicMetadata: {
            teams: [{
              teamId: 'team-1',
              role: 'author',
              reviewGroup: 'isbd',
              namespaces: ['isbd']
            }]
          }
        });

        expect(await canPerformAction('vocabulary', 'create', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('vocabulary', 'read', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('vocabulary', 'update', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('vocabulary', 'delete', { namespaceId: 'isbd' })).toBe(false);
      });

      it('should allow translator read-only access to vocabularies', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'translator-123',
          emailAddresses: [{ emailAddress: 'translator@example.com' }],
          publicMetadata: {
            translations: [{
              language: 'fr',
              namespaces: ['isbd']
            }]
          }
        });

        expect(await canPerformAction('vocabulary', 'read', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('vocabulary', 'create', { namespaceId: 'isbd' })).toBe(false);
        expect(await canPerformAction('vocabulary', 'update', { namespaceId: 'isbd' })).toBe(false);
        expect(await canPerformAction('vocabulary', 'delete', { namespaceId: 'isbd' })).toBe(false);
      });

      it('should inherit permissions from namespace for element sets', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'editor-123',
          emailAddresses: [{ emailAddress: 'editor@example.com' }],
          publicMetadata: {
            teams: [{
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd']
            }]
          }
        });

        // ElementSets should have same permissions as vocabularies
        expect(await canPerformAction('elementSet', 'create', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('elementSet', 'update', { namespaceId: 'isbd' })).toBe(true);
        expect(await canPerformAction('elementSet', 'delete', { namespaceId: 'isbd' })).toBe(true);
      });
    });

    describe('Translation permissions', () => {
      it('should allow translator to update translations for their language/namespace', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'translator-123',
          emailAddresses: [{ emailAddress: 'translator@example.com' }],
          publicMetadata: {
            translations: [{
              language: 'fr',
              namespaces: ['isbd', 'unimarc']
            }]
          }
        });

        expect(await canPerformAction('translation', 'read', { 
          language: 'fr', 
          namespaceId: 'isbd' 
        })).toBe(true);
        
        expect(await canPerformAction('translation', 'update', { 
          language: 'fr', 
          namespaceId: 'isbd' 
        })).toBe(true);
      });

      it('should deny translator from updating other languages', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'translator-123',
          emailAddresses: [{ emailAddress: 'translator@example.com' }],
          publicMetadata: {
            translations: [{
              language: 'fr',
              namespaces: ['isbd']
            }]
          }
        });

        expect(await canPerformAction('translation', 'update', { 
          language: 'de', 
          namespaceId: 'isbd' 
        })).toBe(false);
      });

      it('should allow review group admin to approve translations', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'rg-admin-123',
          emailAddresses: [{ emailAddress: 'rgadmin@example.com' }],
          publicMetadata: {
            reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }]
          }
        });

        expect(await canPerformAction('translation', 'approve', { 
          reviewGroupId: 'isbd' 
        })).toBe(true);
      });
    });

    describe('User permissions', () => {
      it('should allow review group admin to invite users to their review group', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'rg-admin-123',
          emailAddresses: [{ emailAddress: 'rgadmin@example.com' }],
          publicMetadata: {
            reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }]
          }
        });

        expect(await canPerformAction('user', 'invite', { reviewGroupId: 'isbd' })).toBe(true);
        expect(await canPerformAction('user', 'invite', { reviewGroupId: 'unimarc' })).toBe(false);
      });

      it('should allow users to read and update their own profile', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'user-123',
          emailAddresses: [{ emailAddress: 'user@example.com' }],
          publicMetadata: {}
        });

        expect(await canPerformAction('user', 'read', { userId: 'user-123' })).toBe(true);
        expect(await canPerformAction('user', 'update', { userId: 'user-123' })).toBe(true);
      });

      it('should deny users from reading or updating other profiles', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'user-123',
          emailAddresses: [{ emailAddress: 'user@example.com' }],
          publicMetadata: {}
        });

        expect(await canPerformAction('user', 'read', { userId: 'other-user' })).toBe(false);
        expect(await canPerformAction('user', 'update', { userId: 'other-user' })).toBe(false);
      });

      it('should deny non-superadmin from deleting or impersonating users', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'rg-admin-123',
          emailAddresses: [{ emailAddress: 'rgadmin@example.com' }],
          publicMetadata: {
            reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }]
          }
        });

        expect(await canPerformAction('user', 'delete', { userId: 'any-user' })).toBe(false);
        expect(await canPerformAction('user', 'impersonate', { userId: 'any-user' })).toBe(false);
      });
    });

    describe('Default permissions', () => {
      it('should allow read/list for unknown resource types', async () => {
        const { currentUser } = await import('@clerk/nextjs/server');
        (currentUser as any).mockResolvedValue({
          id: 'user-123',
          emailAddresses: [{ emailAddress: 'user@example.com' }],
          publicMetadata: {}
        });

        // Test with a resource type that doesn't have specific handlers
        const result = await canPerformAction('documentation' as ResourceType, 'read' as any);
        expect(result).toBe(true);
      });
    });
  });

  describe('getUserAccessibleResources', () => {
    it('should return null when user is not authenticated', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue(null);

      const result = await getUserAccessibleResources();
      expect(result).toBeNull();
    });

    it('should return "all" for superadmin', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'super-123',
        emailAddresses: [{ emailAddress: 'super@example.com' }],
        publicMetadata: {
          systemRole: 'superadmin'
        }
      });

      const result = await getUserAccessibleResources();
      expect(result).toEqual({
        reviewGroups: 'all',
        namespaces: 'all',
        projects: 'all',
        teams: 'all'
      });
    });

    it('should return accessible resources based on roles', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'user@example.com' }],
        publicMetadata: {
          reviewGroups: [
            { reviewGroupId: 'isbd', role: 'admin' }
          ],
          teams: [
            {
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd', 'isbdm']
            },
            {
              teamId: 'team-2',
              role: 'author',
              reviewGroup: 'unimarc',
              namespaces: ['unimarc']
            }
          ],
          translations: [
            {
              language: 'fr',
              namespaces: ['frbr', 'lrm']
            }
          ]
        }
      });

      const result = await getUserAccessibleResources();
      
      expect(result).toEqual({
        reviewGroups: ['isbd'],
        namespaces: expect.arrayContaining(['isbd', 'isbdm', 'unimarc', 'frbr', 'lrm']),
        projects: [],
        teams: ['team-1', 'team-2']
      });
      
      // Check that namespaces are unique
      const namespaces = result?.namespaces as string[];
      expect(new Set(namespaces).size).toBe(namespaces.length);
    });

    it('should handle empty roles gracefully', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'user@example.com' }],
        publicMetadata: {}
      });

      const result = await getUserAccessibleResources();
      
      expect(result).toEqual({
        reviewGroups: [],
        namespaces: [],
        projects: [],
        teams: []
      });
    });
  });

  describe('invalidateUserCache', () => {
    it('should call cache invalidation for the user', () => {
      invalidateUserCache('user-123');
      expect(mockCache.invalidateUser).toHaveBeenCalledWith('user-123');
    });
  });

  describe('requireAuth middleware', () => {
    it('should return 403 response when permission is denied', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'user@example.com' }],
        publicMetadata: {}
      });

      const middleware = requireAuth('reviewGroup', 'create');
      const req = new Request('http://localhost/api/test');
      const response = await middleware(req);

      expect(response).toBeInstanceOf(Response);
      expect(response?.status).toBe(403);
      
      const body = await response?.json();
      expect(body).toEqual({
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: "You don't have permission to create reviewGroup"
        }
      });
    });

    it('should not return response when permission is granted', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'super-123',
        emailAddresses: [{ emailAddress: 'super@example.com' }],
        publicMetadata: {
          systemRole: 'superadmin'
        }
      });

      const middleware = requireAuth('reviewGroup', 'create');
      const req = new Request('http://localhost/api/test');
      const response = await middleware(req);

      expect(response).toBeUndefined();
    });

    it('should use resource attributes from request', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'rg-admin-123',
        emailAddresses: [{ emailAddress: 'rgadmin@example.com' }],
        publicMetadata: {
          reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }]
        }
      });

      const getResourceAttributes = (req: Request) => {
        const url = new URL(req.url);
        return { reviewGroupId: url.searchParams.get('reviewGroupId') };
      };

      const middleware = requireAuth('reviewGroup', 'update', getResourceAttributes);
      const req = new Request('http://localhost/api/test?reviewGroupId=isbd');
      const response = await middleware(req);

      expect(response).toBeUndefined(); // Permission granted
    });
  });

  describe('auth helper functions', () => {
    beforeEach(async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'test-user',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        publicMetadata: {
          reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
          teams: [{
            teamId: 'team-1',
            role: 'editor',
            reviewGroup: 'isbd',
            namespaces: ['isbd']
          }]
        }
      });
    });

    it('should check canCreateReviewGroup', async () => {
      expect(await auth.canCreateReviewGroup()).toBe(false);
    });

    it('should check canManageReviewGroup', async () => {
      expect(await auth.canManageReviewGroup('isbd')).toBe(true);
      expect(await auth.canManageReviewGroup('unimarc')).toBe(false);
    });

    it('should check canCreateNamespace', async () => {
      expect(await auth.canCreateNamespace('isbd')).toBe(true);
      expect(await auth.canCreateNamespace('unimarc')).toBe(false);
    });

    it('should check canEditNamespace', async () => {
      expect(await auth.canEditNamespace('isbd', 'isbd')).toBe(true);
    });

    it('should check canEditVocabulary', async () => {
      expect(await auth.canEditVocabulary('vocab-1', 'isbd')).toBe(true);
      expect(await auth.canEditVocabulary('vocab-1', 'unimarc')).toBe(false);
    });

    it('should check canTranslate', async () => {
      expect(await auth.canTranslate('fr', 'isbd')).toBe(false);
    });

    it('should check canInviteUser', async () => {
      expect(await auth.canInviteUser('isbd')).toBe(true);
      expect(await auth.canInviteUser('unimarc')).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing email addresses gracefully', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'user-123',
        emailAddresses: [],
        publicMetadata: {}
      });

      const result = await getAuthContext();
      expect(result?.email).toBe('');
    });

    it('should handle undefined publicMetadata', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'user@example.com' }],
        publicMetadata: undefined
      });

      const result = await getAuthContext();
      expect(result?.roles).toEqual({
        system: undefined,
        systemRole: undefined,
        reviewGroups: [],
        teams: [],
        translations: []
      });
    });

    it('should handle cache errors gracefully', async () => {
      // Simulate cache error - the error is thrown, not caught
      // This test verifies that cache errors would need to be handled
      // In production, we might want to add try-catch around cache operations
      mockCache.getCachedAuthContext.mockImplementation(() => {
        throw new Error('Cache error');
      });

      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'user@example.com' }],
        publicMetadata: {}
      });

      // The current implementation doesn't handle cache errors gracefully
      // This test documents the current behavior
      await expect(getAuthContext()).rejects.toThrow('Cache error');
    });
  });

  describe('Performance and caching', () => {
    it('should cache auth context after fetching', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'user@example.com' }],
        publicMetadata: {
          teams: [{
            teamId: 'team-1',
            role: 'editor',
            reviewGroup: 'isbd',
            namespaces: ['isbd']
          }]
        }
      });

      await getAuthContext();
      
      expect(mockCache.cacheAuthContext).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          userId: 'user-123',
          email: 'user@example.com'
        })
      );
    });

    it('should cache permission results', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'user@example.com' }],
        publicMetadata: {
          teams: [{
            teamId: 'team-1',
            role: 'editor',
            reviewGroup: 'isbd',
            namespaces: ['isbd']
          }]
        }
      });

      await canPerformAction('namespace', 'update', { namespaceId: 'isbd' });
      
      expect(mockCache.cachePermission).toHaveBeenCalledWith(
        'user-123',
        'namespace',
        'update',
        true,
        { namespaceId: 'isbd' }
      );
    });

    it('should use cached permission on second call', async () => {
      const { currentUser } = await import('@clerk/nextjs/server');
      (currentUser as any).mockResolvedValue({
        id: 'user-123',
        emailAddresses: [{ emailAddress: 'user@example.com' }],
        publicMetadata: {}
      });

      // First call - cache miss
      mockCache.getCachedPermission.mockReturnValueOnce(null);
      await canPerformAction('namespace', 'read');
      
      // Second call - cache hit
      mockCache.getCachedPermission.mockReturnValueOnce(true);
      const result = await canPerformAction('namespace', 'read');
      
      expect(result).toBe(true);
      expect(mockCache.getCachedPermission).toHaveBeenCalledTimes(2);
    });
  });
});