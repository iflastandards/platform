/**
 * Unit tests for authorization functions
 * @integration @auth @critical
 */
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { mockCache } from './__mocks__/AuthCache';
import { type AuthContext } from '../../../lib/schemas/auth.schema';

// Mock the cache module
vi.mock('../../../lib/cache/AuthCache', () => ({
  getAuthCache: () => mockCache,
}));

describe('Authorization Functions @integration @auth @critical', () => {
  beforeEach(() => {
    vi.resetModules(); // Reset modules before each test to ensure clean mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthContext', () => {
    it('should return null when user is not authenticated', async () => {
      vi.doMock('@clerk/nextjs/server', () => ({
        auth: vi.fn().mockResolvedValue({ userId: null }),
        currentUser: vi.fn().mockResolvedValue(null),
      }));
      const { getAuthContext } = await import('../../../lib/authorization');
      const result = await getAuthContext();
      expect(result).toBeNull();
    });

    it('should return cached auth context if available', async () => {
      const userId = 'user-123';
      const cachedContext: AuthContext = {
        userId,
        email: 'test@example.com',
        roles: {
          systemRole: 'superadmin',
          reviewGroups: [],
          teams: [],
          translations: [],
        },
      };

      mockCache.getCachedAuthContext.mockReturnValue(cachedContext);
      vi.doMock('@clerk/nextjs/server', () => ({
        auth: vi.fn().mockResolvedValue({
          userId,
          sessionId: `sess-${userId}`,
          sessionClaims: {
            email: 'test@example.com',
            publicMetadata: { systemRole: 'superadmin' },
          },
        }),
        currentUser: vi.fn().mockResolvedValue({
          id: userId,
          emailAddresses: [{ emailAddress: 'test@example.com' }],
          publicMetadata: { systemRole: 'superadmin' },
        }),
      }));

      const { getAuthContext } = await import('../../../lib/authorization');
      const result = await getAuthContext();

      expect(result).toEqual(cachedContext);
      expect(mockCache.getCachedAuthContext).toHaveBeenCalledWith(userId);
    });

    it('should parse and cache user metadata for superadmin', async () => {
      const userId = 'super-123';
      vi.doMock('@clerk/nextjs/server', () => ({
        auth: vi.fn().mockResolvedValue({
          userId,
          sessionId: `sess-${userId}`,
          sessionClaims: {
            email: 'super@example.com',
            publicMetadata: { systemRole: 'superadmin' },
          },
        }),
        currentUser: vi.fn().mockResolvedValue({
          id: userId,
          emailAddresses: [{ emailAddress: 'super@example.com' }],
          publicMetadata: { systemRole: 'superadmin' },
        }),
      }));
      mockCache.getCachedAuthContext.mockReturnValue(null);

      const { getAuthContext } = await import('../../../lib/authorization');
      const result = await getAuthContext();

      expect(result).toEqual({
        userId,
        email: 'super@example.com',
        roles: {
          system: 'superadmin',
          systemRole: 'superadmin',
          reviewGroups: [],
          teams: [],
          translations: [],
        },
      });

      expect(mockCache.cacheAuthContext).toHaveBeenCalledWith(
        userId,
        expect.any(Object),
      );
    });

    it('should parse review group admin metadata', async () => {
      vi.doMock('@clerk/nextjs/server', () => ({
        auth: vi.fn().mockResolvedValue({
          userId: 'rg-admin-123',
          sessionId: 'sess-rg-admin-123',
          sessionClaims: {
            email: 'rg-admin-123@example.com',
            publicMetadata: {
              reviewGroups: [
                { reviewGroupId: 'isbd', role: 'admin' },
                { reviewGroupId: 'unimarc', role: 'admin' },
              ],
            },
          },
        }),
        currentUser: vi.fn().mockResolvedValue({
          id: 'rg-admin-123',
          emailAddresses: [{ emailAddress: 'rg-admin-123@example.com' }],
          publicMetadata: {
            reviewGroups: [
              { reviewGroupId: 'isbd', role: 'admin' },
              { reviewGroupId: 'unimarc', role: 'admin' },
            ],
          },
        }),
      }));
      mockCache.getCachedAuthContext.mockReturnValue(null);

      const { getAuthContext } = await import('../../../lib/authorization');
      const result = await getAuthContext();

      expect(result?.roles.reviewGroups).toHaveLength(2);
      expect(result?.roles.reviewGroups[0]).toEqual({
        reviewGroupId: 'isbd',
        role: 'admin',
      });
    });

    it('should parse team member metadata', async () => {
      vi.doMock('@clerk/nextjs/server', () => ({
        auth: vi.fn().mockResolvedValue({
          userId: 'team-member-123',
          sessionId: 'sess-team-member-123',
          sessionClaims: {
            email: 'team-member-123@example.com',
            publicMetadata: {
              teams: [
                {
                  teamId: 'team-1',
                  role: 'editor',
                  reviewGroup: 'isbd',
                  namespaces: ['isbd', 'isbdm'],
                },
              ],
            },
          },
        }),
        currentUser: vi.fn().mockResolvedValue({
          id: 'team-member-123',
          emailAddresses: [{ emailAddress: 'team-member-123@example.com' }],
          publicMetadata: {
            teams: [
              {
                teamId: 'team-1',
                role: 'editor',
                reviewGroup: 'isbd',
                namespaces: ['isbd', 'isbdm'],
              },
            ],
          },
        }),
      }));
      mockCache.getCachedAuthContext.mockReturnValue(null);

      const { getAuthContext } = await import('../../../lib/authorization');
      const result = await getAuthContext();

      expect(result?.roles.teams).toHaveLength(1);
      expect(result?.roles.teams[0]).toEqual({
        teamId: 'team-1',
        role: 'editor',
        reviewGroup: 'isbd',
        namespaces: ['isbd', 'isbdm'],
      });
    });

    it('should parse translator metadata', async () => {
      vi.doMock('@clerk/nextjs/server', () => ({
        auth: vi.fn().mockResolvedValue({
          userId: 'translator-123',
          sessionId: 'sess-translator-123',
          sessionClaims: {
            email: 'translator-123@example.com',
            publicMetadata: {
              translations: [
                {
                  language: 'fr',
                  namespaces: ['isbd', 'unimarc'],
                },
              ],
            },
          },
        }),
        currentUser: vi.fn().mockResolvedValue({
          id: 'translator-123',
          emailAddresses: [{ emailAddress: 'translator-123@example.com' }],
          publicMetadata: {
            translations: [
              {
                language: 'fr',
                namespaces: ['isbd', 'unimarc'],
              },
            ],
          },
        }),
      }));
      mockCache.getCachedAuthContext.mockReturnValue(null);

      const { getAuthContext } = await import('../../../lib/authorization');
      const result = await getAuthContext();

      expect(result?.roles.translations).toHaveLength(1);
      expect(result?.roles.translations[0]).toEqual({
        language: 'fr',
        namespaces: ['isbd', 'unimarc'],
      });
    });

    it('should handle various invalid metadata gracefully', async () => {
      const testCases = [
        { teams: 'not-an-array', reviewGroups: null, translations: undefined },
        { teams: { obj: true }, reviewGroups: 123, translations: 'string' },
        { teams: undefined, reviewGroups: undefined, translations: undefined },
      ];

      for (const metadata of testCases) {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({
            userId: 'invalid-123',
            sessionId: 'sess-invalid-123',
            sessionClaims: {
              email: 'invalid@example.com',
              publicMetadata: metadata,
            },
          }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'invalid-123',
            emailAddresses: [{ emailAddress: 'invalid@example.com' }],
            publicMetadata: metadata,
          }),
        }));
        mockCache.getCachedAuthContext.mockReturnValue(null);

        const { getAuthContext } = await import('../../../lib/authorization');
        const result = await getAuthContext();

        expect(result).toBeDefined();
        expect(result?.roles.teams).toEqual([]);
        expect(result?.roles.reviewGroups).toEqual([]);
        expect(result?.roles.translations).toEqual([]);
        vi.resetModules();
      }
    });
  });

  describe('canPerformAction', () => {
    it('should return false when user is not authenticated', async () => {
      vi.doMock('@clerk/nextjs/server', () => ({
        auth: vi.fn().mockResolvedValue({ userId: null }),
        currentUser: vi.fn().mockResolvedValue(null),
      }));
      const { canPerformAction } = await import('../../../lib/authorization');
      const result = await canPerformAction('user', 'read');
      expect(result).toBe(false);
    });

    it('should return cached permission result if available', async () => {
      const userId = 'user-123';
      vi.doMock('@clerk/nextjs/server', () => ({
        auth: vi.fn().mockResolvedValue({ userId }),
        currentUser: vi.fn().mockResolvedValue({ id: userId, publicMetadata: {} }),
      }));
      mockCache.getCachedPermission.mockReturnValue(true);

      const { canPerformAction } = await import('../../../lib/authorization');
      const result = await canPerformAction('namespace', 'read', {
        namespaceId: 'isbd',
      });

      expect(result).toBe(true);
      expect(mockCache.getCachedPermission).toHaveBeenCalledWith(
        userId,
        'namespace',
        'read',
        { namespaceId: 'isbd' },
      );
    });

    it('should allow superadmin to perform any action', async () => {
      vi.doMock('@clerk/nextjs/server', () => ({
        auth: vi.fn().mockResolvedValue({ userId: 'super-123' }),
        currentUser: vi.fn().mockResolvedValue({ id: 'super-123', publicMetadata: { systemRole: 'superadmin' } }),
      }));
      mockCache.getCachedPermission.mockReturnValue(null);

      const { canPerformAction } = await import('../../../lib/authorization');
      expect(await canPerformAction('user', 'delete')).toBe(true);
      expect(await canPerformAction('reviewGroup', 'create')).toBe(true);
      expect(await canPerformAction('namespace', 'delete')).toBe(true);
      expect(await canPerformAction('vocabulary', 'delete')).toBe(true);

      expect(mockCache.cachePermission).toHaveBeenCalled();
    });

    describe('Review Group permissions', () => {
      it('should allow review group admin to manage their review group', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'rg-admin-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'rg-admin-123',
            publicMetadata: {
              reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('reviewGroup', 'update', {
            reviewGroupId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('reviewGroup', 'delete', {
            reviewGroupId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('reviewGroup', 'manage', {
            reviewGroupId: 'isbd',
          }),
        ).toBe(true);
      });

      it('should deny review group admin from managing other review groups', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'rg-admin-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'rg-admin-123',
            publicMetadata: {
              reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('reviewGroup', 'update', {
            reviewGroupId: 'unimarc',
          }),
        ).toBe(false);
      });

      it('should deny non-superadmin from creating review groups', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'rg-admin-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'rg-admin-123',
            publicMetadata: {
              reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(await canPerformAction('reviewGroup', 'create')).toBe(false);
      });

      it('should allow authenticated users to read review groups', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'user-123' }),
          currentUser: vi.fn().mockResolvedValue({ id: 'user-123', publicMetadata: {} }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(await canPerformAction('reviewGroup', 'read')).toBe(true);
        expect(await canPerformAction('reviewGroup', 'list')).toBe(true);
      });
    });

    describe('Namespace permissions', () => {
      it('should allow review group admin to manage namespaces in their review group', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'rg-admin-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'rg-admin-123',
            publicMetadata: {
              reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('namespace', 'create', {
            reviewGroupId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('namespace', 'update', {
            reviewGroupId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('namespace', 'delete', {
            reviewGroupId: 'isbd',
          }),
        ).toBe(true);
      });

      it('should allow editor to update namespaces they have access to', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'editor-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'editor-123',
            publicMetadata: {
              teams: [
                {
                  teamId: 'team-1',
                  role: 'editor',
                  reviewGroup: 'isbd',
                  namespaces: ['isbd', 'isbdm'],
                },
              ],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('namespace', 'update', {
            namespaceId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('namespace', 'read', { namespaceId: 'isbd' }),
        ).toBe(true);
      });

      it('should deny editor from creating or deleting namespaces', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'editor-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'editor-123',
            publicMetadata: {
              teams: [
                {
                  teamId: 'team-1',
                  role: 'editor',
                  reviewGroup: 'isbd',
                  namespaces: ['isbd'],
                },
              ],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('namespace', 'create', {
            namespaceId: 'isbd',
          }),
        ).toBe(false);
        expect(
          await canPerformAction('namespace', 'delete', {
            namespaceId: 'isbd',
          }),
        ).toBe(false);
      });

      it('should allow author only read access to namespaces', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'author-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'author-123',
            publicMetadata: {
              teams: [
                {
                  teamId: 'team-1',
                  role: 'author',
                  reviewGroup: 'isbd',
                  namespaces: ['isbd'],
                },
              ],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('namespace', 'read', { namespaceId: 'isbd' }),
        ).toBe(true);
        expect(
          await canPerformAction('namespace', 'list', { namespaceId: 'isbd' }),
        ).toBe(true);
        expect(
          await canPerformAction('namespace', 'update', {
            namespaceId: 'isbd',
          }),
        ).toBe(false);
        expect(
          await canPerformAction('namespace', 'delete', {
            namespaceId: 'isbd',
          }),
        ).toBe(false);
      });
    });

    describe('Vocabulary/ElementSet permissions', () => {
      it('should require namespace context for write operations', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'editor-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'editor-123',
            publicMetadata: {
              teams: [
                {
                  teamId: 'team-1',
                  role: 'editor',
                  reviewGroup: 'isbd',
                  namespaces: ['isbd'],
                },
              ],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(await canPerformAction('vocabulary', 'create')).toBe(false);
        expect(await canPerformAction('vocabulary', 'update')).toBe(false);
        expect(await canPerformAction('vocabulary', 'delete')).toBe(false);
        expect(await canPerformAction('vocabulary', 'read')).toBe(true);
      });

      it('should allow editor full access to vocabularies in their namespace', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'editor-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'editor-123',
            publicMetadata: {
              teams: [
                {
                  teamId: 'team-1',
                  role: 'editor',
                  reviewGroup: 'isbd',
                  namespaces: ['isbd'],
                },
              ],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('vocabulary', 'create', {
            namespaceId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('vocabulary', 'read', { namespaceId: 'isbd' }),
        ).toBe(true);
        expect(
          await canPerformAction('vocabulary', 'update', {
            namespaceId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('vocabulary', 'delete', {
            namespaceId: 'isbd',
          }),
        ).toBe(true);
      });

      it('should allow author to create and update but not delete vocabularies', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'author-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'author-123',
            publicMetadata: {
              teams: [
                {
                  teamId: 'team-1',
                  role: 'author',
                  reviewGroup: 'isbd',
                  namespaces: ['isbd'],
                },
              ],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('vocabulary', 'create', {
            namespaceId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('vocabulary', 'read', { namespaceId: 'isbd' }),
        ).toBe(true);
        expect(
          await canPerformAction('vocabulary', 'update', {
            namespaceId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('vocabulary', 'delete', {
            namespaceId: 'isbd',
          }),
        ).toBe(false);
      });

      it('should allow translator read-only access to vocabularies', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'translator-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'translator-123',
            publicMetadata: {
              translations: [
                {
                  language: 'fr',
                  namespaces: ['isbd'],
                },
              ],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('vocabulary', 'read', { namespaceId: 'isbd' }),
        ).toBe(true);
        expect(
          await canPerformAction('vocabulary', 'create', {
            namespaceId: 'isbd',
          }),
        ).toBe(false);
        expect(
          await canPerformAction('vocabulary', 'update', {
            namespaceId: 'isbd',
          }),
        ).toBe(false);
        expect(
          await canPerformAction('vocabulary', 'delete', {
            namespaceId: 'isbd',
          }),
        ).toBe(false);
      });

      it('should inherit permissions from namespace for element sets', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'editor-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'editor-123',
            publicMetadata: {
              teams: [
                {
                  teamId: 'team-1',
                  role: 'editor',
                  reviewGroup: 'isbd',
                  namespaces: ['isbd'],
                },
              ],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('elementSet', 'create', {
            namespaceId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('elementSet', 'update', {
            namespaceId: 'isbd',
          }),
        ).toBe(true);
        expect(
          await canPerformAction('elementSet', 'delete', {
            namespaceId: 'isbd',
          }),
        ).toBe(true);
      });
    });

    describe('Translation permissions', () => {
      it('should allow translator to update translations for their language/namespace', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'translator-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'translator-123',
            publicMetadata: {
              translations: [
                {
                  language: 'fr',
                  namespaces: ['isbd', 'unimarc'],
                },
              ],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('translation', 'read', {
            language: 'fr',
            namespaceId: 'isbd',
          }),
        ).toBe(true);

        expect(
          await canPerformAction('translation', 'update', {
            language: 'fr',
            namespaceId: 'isbd',
          }),
        ).toBe(true);
      });

      it('should deny translator from updating other languages', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'translator-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'translator-123',
            publicMetadata: {
              translations: [
                {
                  language: 'fr',
                  namespaces: ['isbd'],
                },
              ],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('translation', 'update', {
            language: 'de',
            namespaceId: 'isbd',
          }),
        ).toBe(false);
      });

      it('should allow review group admin to approve translations', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'rg-admin-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'rg-admin-123',
            publicMetadata: {
              reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('translation', 'approve', {
            reviewGroupId: 'isbd',
          }),
        ).toBe(true);
      });
    });

    describe('User permissions', () => {
      it('should allow review group admin to invite users to their review group', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'rg-admin-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'rg-admin-123',
            publicMetadata: {
              reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('user', 'invite', { reviewGroupId: 'isbd' }),
        ).toBe(true);
        expect(
          await canPerformAction('user', 'invite', {
            reviewGroupId: 'unimarc',
          }),
        ).toBe(false);
      });

      it('should allow users to read and update their own profile', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'user-123' }),
          currentUser: vi.fn().mockResolvedValue({ id: 'user-123', publicMetadata: {} }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('user', 'read', { userId: 'user-123' }),
        ).toBe(true);
        expect(
          await canPerformAction('user', 'update', { userId: 'user-123' }),
        ).toBe(true);
      });

      it('should deny users from reading or updating other profiles', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'user-123' }),
          currentUser: vi.fn().mockResolvedValue({ id: 'user-123', publicMetadata: {} }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('user', 'read', { userId: 'other-user' }),
        ).toBe(false);
        expect(
          await canPerformAction('user', 'update', { userId: 'other-user' }),
        ).toBe(false);
      });

      it('should deny non-superadmin from deleting or impersonating users', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'rg-admin-123' }),
          currentUser: vi.fn().mockResolvedValue({
            id: 'rg-admin-123',
            publicMetadata: {
              reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
            },
          }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import('../../../lib/authorization');

        expect(
          await canPerformAction('user', 'delete', { userId: 'any-user' }),
        ).toBe(false);
        expect(
          await canPerformAction('user', 'impersonate', { userId: 'any-user' }),
        ).toBe(false);
      });
    });

    describe('Default permissions', () => {
      it('should allow read/list for unknown resource types', async () => {
        vi.doMock('@clerk/nextjs/server', () => ({
          auth: vi.fn().mockResolvedValue({ userId: 'user-123' }),
          currentUser: vi.fn().mockResolvedValue({ id: 'user-123', publicMetadata: {} }),
        }));
        mockCache.getCachedPermission.mockReturnValue(null);
        const { canPerformAction } = await import(
          '../../../lib/authorization'
        );
        await import('../../../lib/authorization');
        
        const result = await canPerformAction(
          'documentation' as any,
          'read' as any,
        );
        expect(result).toBe(true);
      });
    });
  });

  describe('getUserAccessibleResources', () => {
    it('should return null when user is not authenticated', async () => {
      mockAuthenticatedUser({ userId: null });
      const { getUserAccessibleResources } = await import(
        '../../../lib/authorization'
      );
      const result = await getUserAccessibleResources();
      expect(result).toBeNull();
    });

    it('should return "all" for superadmin', async () => {
      mockAuthenticatedUser({
        userId: 'super-123',
        publicMetadata: { systemRole: 'superadmin' },
      });
      const { getUserAccessibleResources } = await import(
        '../../../lib/authorization'
      );
      const result = await getUserAccessibleResources();
      expect(result).toEqual({
        reviewGroups: 'all',
        namespaces: 'all',
        projects: 'all',
        teams: 'all',
      });
    });

    it('should return accessible resources based on roles', async () => {
      mockAuthenticatedUser({
        userId: 'user-123',
        publicMetadata: {
          reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
          teams: [
            {
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd', 'isbdm'],
            },
            {
              teamId: 'team-2',
              role: 'author',
              reviewGroup: 'unimarc',
              namespaces: ['unimarc'],
            },
          ],
          translations: [
            {
              language: 'fr',
              namespaces: ['frbr', 'lrm'],
            },
          ],
        },
      });
      const { getUserAccessibleResources } = await import(
        '../../../lib/authorization'
      );
      const result = await getUserAccessibleResources();

      expect(result).toEqual({
        reviewGroups: ['isbd'],
        namespaces: expect.arrayContaining([
          'isbd',
          'isbdm',
          'unimarc',
          'frbr',
          'lrm',
        ]),
        projects: [],
        teams: ['team-1', 'team-2'],
      });

      const namespaces = result?.namespaces as string[];
      expect(new Set(namespaces).size).toBe(namespaces.length);
    });

    it('should handle empty roles gracefully', async () => {
      mockAuthenticatedUser({ userId: 'user-123', publicMetadata: {} });
      const { getUserAccessibleResources } = await import(
        '../../../lib/authorization'
      );
      const result = await getUserAccessibleResources();

      expect(result).toEqual({
        reviewGroups: [],
        namespaces: [],
        projects: [],
        teams: [],
      });
    });
  });

  describe('invalidateUserCache', () => {
    it('should call cache invalidation for the user', async () => {
      const { invalidateUserCache } = await import(
        '../../../lib/authorization'
      );
      invalidateUserCache('user-123');
      expect(mockCache.invalidateUser).toHaveBeenCalledWith('user-123');
    });
  });

  describe('requireAuth middleware', () => {
    it('should return 403 response when permission is denied', async () => {
      mockAuthenticatedUser({ userId: 'user-123', publicMetadata: {} });
      const { requireAuth } = await import('../../../lib/authorization');

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
          message: "You don't have permission to create reviewGroup",
        },
      });
    });

    it('should not return response when permission is granted', async () => {
      mockAuthenticatedUser({
        userId: 'super-123',
        publicMetadata: { systemRole: 'superadmin' },
      });
      const { requireAuth } = await import('../../../lib/authorization');

      const middleware = requireAuth('reviewGroup', 'create');
      const req = new Request('http://localhost/api/test');
      const response = await middleware(req);

      expect(response).toBeUndefined();
    });

    it('should use resource attributes from request', async () => {
      mockAuthenticatedUser({
        userId: 'rg-admin-123',
        publicMetadata: {
          reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
        },
      });
      const { requireAuth } = await import('../../../lib/authorization');

      const getResourceAttributes = (req: Request) => {
        const url = new URL(req.url);
        return { reviewGroupId: url.searchParams.get('reviewGroupId') };
      };

      const middleware = requireAuth(
        'reviewGroup',
        'update',
        getResourceAttributes,
      );
      const req = new Request('http://localhost/api/test?reviewGroupId=isbd');
      const response = await middleware(req);

      expect(response).toBeUndefined();
    });
  });

  describe('auth helper functions', () => {
    beforeEach(async () => {
      mockAuthenticatedUser({
        userId: 'test-user',
        publicMetadata: {
          reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
          teams: [
            {
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd'],
            },
          ],
        },
      });
    });

    it('should check canCreateReviewGroup', async () => {
      const { auth } = await import('../../../lib/authorization');
      expect(await auth.canCreateReviewGroup()).toBe(false);
    });

    it('should check canManageReviewGroup', async () => {
      const { auth } = await import('../../../lib/authorization');
      expect(await auth.canManageReviewGroup('isbd')).toBe(true);
      expect(await auth.canManageReviewGroup('unimarc')).toBe(false);
    });

    it('should check canCreateNamespace', async () => {
      const { auth } = await import('../../../lib/authorization');
      expect(await auth.canCreateNamespace('isbd')).toBe(true);
      expect(await auth.canCreateNamespace('unimarc')).toBe(false);
    });

    it('should check canEditNamespace', async () => {
      const { auth } = await import('../../../lib/authorization');
      expect(await auth.canEditNamespace('isbd', 'isbd')).toBe(true);
    });

    it('should check canEditVocabulary', async () => {
      const { auth } = await import('../../../lib/authorization');
      expect(await auth.canEditVocabulary('vocab-1', 'isbd')).toBe(true);
      expect(await auth.canEditVocabulary('vocab-1', 'unimarc')).toBe(false);
    });

    it('should check canTranslate', async () => {
      const { auth } = await import('../../../lib/authorization');
      expect(await auth.canTranslate('fr', 'isbd')).toBe(false);
    });

    it('should check canInviteUser', async () => {
      const { auth } = await import('../../../lib/authorization');
      expect(await auth.canInviteUser('isbd')).toBe(true);
      expect(await auth.canInviteUser('unimarc')).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing email addresses gracefully', async () => {
      mockAuthenticatedUser({
        userId: 'user-123',
        email: '',
        publicMetadata: {},
      });
      const { getAuthContext } = await import('../../../lib/authorization');
      const result = await getAuthContext();
      expect(result?.email).toBe('user-123@placeholder.local');
    });

    it('should handle undefined publicMetadata', async () => {
      mockAuthenticatedUser({ userId: 'user-123', publicMetadata: {} });
      const { getAuthContext } = await import('../../../lib/authorization');
      const result = await getAuthContext();
      expect(result?.roles).toEqual({
        system: undefined,
        systemRole: undefined,
        reviewGroups: [],
        teams: [],
        translations: [],
      });
    });

    it('should handle cache errors gracefully', async () => {
      mockCache.getCachedAuthContext.mockImplementation(() => {
        throw new Error('Cache error');
      });
      mockAuthenticatedUser({ userId: 'user-123', publicMetadata: {} });
      const { getAuthContext } = await import('../../../lib/authorization');
      await expect(getAuthContext()).rejects.toThrow('Cache error');
    });
  });

  describe('Performance and caching', () => {
    it('should cache auth context after fetching', async () => {
      const userId = 'user-123';
      mockAuthenticatedUser({
        userId,
        publicMetadata: {
          teams: [
            {
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd'],
            },
          ],
        },
      });
      mockCache.getCachedAuthContext.mockReturnValue(null);
      const { getAuthContext } = await import('../../../lib/authorization');
      await getAuthContext();

      expect(mockCache.cacheAuthContext).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ userId }),
      );
    });

    it('should cache permission results', async () => {
      const userId = 'user-123';
      mockAuthenticatedUser({
        userId,
        publicMetadata: {
          teams: [
            {
              teamId: 'team-1',
              role: 'editor',
              reviewGroup: 'isbd',
              namespaces: ['isbd'],
            },
          ],
        },
      });
      mockCache.getCachedPermission.mockReturnValue(null);
      const { canPerformAction } = await import('../../../lib/authorization');
      await canPerformAction('namespace', 'update', { namespaceId: 'isbd' });

      expect(mockCache.cachePermission).toHaveBeenCalledWith(
        userId,
        'namespace',
        'update',
        true,
        { namespaceId: 'isbd' },
      );
    });

    it('should use cached permission on second call', async () => {
      const userId = 'user-123';
      mockAuthenticatedUser({ userId, publicMetadata: {} });
      const { canPerformAction } = await import('../../../lib/authorization');

      mockCache.getCachedPermission.mockReturnValueOnce(null);
      await canPerformAction('namespace', 'read');

      mockCache.getCachedPermission.mockReturnValueOnce(true);
      const result = await canPerformAction('namespace', 'read');

      expect(result).toBe(true);
      expect(mockCache.getCachedPermission).toHaveBeenCalledTimes(2);
    });
  });
});
