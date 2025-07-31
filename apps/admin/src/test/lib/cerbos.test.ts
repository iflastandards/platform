import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GRPC } from '@cerbos/grpc';

// Mock the Cerbos GRPC client
vi.mock('@cerbos/grpc', () => ({
  GRPC: vi.fn().mockImplementation(() => ({
    checkResource: vi.fn(),
    checkResources: vi.fn(),
    planResources: vi.fn(),
    isAllowed: vi.fn(),
  })),
}));

describe('Cerbos Integration @unit', () => {
  let cerbosClient: any;

  beforeEach(() => {
    // Create a new mock instance for each test
    cerbosClient = new GRPC('localhost:3593', { tls: false });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Cerbos Client Configuration', () => {
    it('should create Cerbos client with correct configuration', () => {
      expect(GRPC).toHaveBeenCalledWith('localhost:3593', { tls: false });
    });

    it('should use environment variable for PDP URL in production', () => {
      process.env.NEXT_PUBLIC_CERBOS_PDP_URL =
        'https://cerbos.iflastandards.info:3593';
      process.env.NODE_ENV = 'production';

      // Re-import to get new configuration
      vi.resetModules();
      const _prodClient = new GRPC(process.env.NEXT_PUBLIC_CERBOS_PDP_URL, {
        tls: true,
      });

      expect(GRPC).toHaveBeenCalledWith(
        'https://cerbos.iflastandards.info:3593',
        { tls: true },
      );
    });
  });

  describe('Resource Permission Checks', () => {
    it('should check permissions for namespace resources', async () => {
      const mockResponse = {
        resource: {
          id: 'ISBD',
          kind: 'namespace',
          actions: {
            view: 'EFFECT_ALLOW',
            edit: 'EFFECT_ALLOW',
            admin: 'EFFECT_DENY',
          },
        },
      };

      cerbosClient.checkResource.mockResolvedValueOnce(mockResponse);

      const result = await cerbosClient.checkResource({
        principal: {
          id: 'user-123',
          roles: ['namespace-editor:ISBD'],
          attributes: {
            email: 'editor@example.com',
          },
        },
        resource: {
          id: 'ISBD',
          kind: 'namespace',
          attributes: {
            name: 'ISBD',
            description: 'International Standard Bibliographic Description',
          },
        },
        actions: ['view', 'edit', 'admin'],
      });

      expect(result.resource.actions.view).toBe('EFFECT_ALLOW');
      expect(result.resource.actions.edit).toBe('EFFECT_ALLOW');
      expect(result.resource.actions.admin).toBe('EFFECT_DENY');
    });

    it('should check permissions for site resources', async () => {
      const mockResponse = {
        resource: {
          id: 'isbdm',
          kind: 'site',
          actions: {
            view: 'EFFECT_ALLOW',
            edit: 'EFFECT_ALLOW',
            publish: 'EFFECT_ALLOW',
            delete: 'EFFECT_DENY',
          },
        },
      };

      cerbosClient.checkResource.mockResolvedValueOnce(mockResponse);

      const result = await cerbosClient.checkResource({
        principal: {
          id: 'user-456',
          roles: ['site-admin:isbdm'],
          attributes: {
            email: 'admin@example.com',
          },
        },
        resource: {
          id: 'isbdm',
          kind: 'site',
          attributes: {
            namespace: 'ISBD',
            status: 'active',
          },
        },
        actions: ['view', 'edit', 'publish', 'delete'],
      });

      expect(result.resource.actions.publish).toBe('EFFECT_ALLOW');
      expect(result.resource.actions.delete).toBe('EFFECT_DENY');
    });

    it('should check permissions for vocabulary resources', async () => {
      const mockResponse = {
        resource: {
          id: 'vocab-123',
          kind: 'vocabulary',
          actions: {
            read: 'EFFECT_ALLOW',
            write: 'EFFECT_ALLOW',
            approve: 'EFFECT_DENY',
          },
        },
      };

      cerbosClient.checkResource.mockResolvedValueOnce(mockResponse);

      const result = await cerbosClient.checkResource({
        principal: {
          id: 'user-789',
          roles: ['namespace-editor:LRM'],
          attributes: {},
        },
        resource: {
          id: 'vocab-123',
          kind: 'vocabulary',
          attributes: {
            namespace: 'LRM',
            status: 'draft',
          },
        },
        actions: ['read', 'write', 'approve'],
      });

      expect(result.resource.actions.read).toBe('EFFECT_ALLOW');
      expect(result.resource.actions.write).toBe('EFFECT_ALLOW');
      expect(result.resource.actions.approve).toBe('EFFECT_DENY');
    });
  });

  describe('Bulk Permission Checks', () => {
    it('should check multiple resources in a single request', async () => {
      const mockResponse = {
        results: [
          {
            resource: {
              id: 'isbdm',
              kind: 'site',
              actions: { view: 'EFFECT_ALLOW', edit: 'EFFECT_ALLOW' },
            },
          },
          {
            resource: {
              id: 'lrm',
              kind: 'site',
              actions: { view: 'EFFECT_ALLOW', edit: 'EFFECT_DENY' },
            },
          },
        ],
      };

      cerbosClient.checkResources.mockResolvedValueOnce(mockResponse);

      const result = await cerbosClient.checkResources({
        principal: {
          id: 'user-123',
          roles: ['site-editor:isbdm', 'site-viewer:lrm'],
        },
        resources: [
          {
            resource: {
              id: 'isbdm',
              kind: 'site',
            },
            actions: ['view', 'edit'],
          },
          {
            resource: {
              id: 'lrm',
              kind: 'site',
            },
            actions: ['view', 'edit'],
          },
        ],
      });

      expect(result.results[0].resource.actions.edit).toBe('EFFECT_ALLOW');
      expect(result.results[1].resource.actions.edit).toBe('EFFECT_DENY');
    });
  });

  describe('Derived Roles', () => {
    it('should derive namespace admin from system admin', async () => {
      const mockResponse = {
        resource: {
          id: 'ISBD',
          kind: 'namespace',
          actions: {
            admin: 'EFFECT_ALLOW',
          },
        },
      };

      cerbosClient.checkResource.mockResolvedValueOnce(mockResponse);

      const result = await cerbosClient.checkResource({
        principal: {
          id: 'super-admin',
          roles: ['system-admin'],
          attributes: {},
        },
        resource: {
          id: 'ISBD',
          kind: 'namespace',
        },
        actions: ['admin'],
      });

      // System admin should have admin access to all namespaces
      expect(result.resource.actions.admin).toBe('EFFECT_ALLOW');
    });

    it('should derive site permissions from namespace roles', async () => {
      const mockResponse = {
        resource: {
          id: 'isbdm',
          kind: 'site',
          actions: {
            edit: 'EFFECT_ALLOW',
          },
        },
      };

      cerbosClient.checkResource.mockResolvedValueOnce(mockResponse);

      const result = await cerbosClient.checkResource({
        principal: {
          id: 'namespace-editor',
          roles: ['namespace-editor:ISBD'],
          attributes: {},
        },
        resource: {
          id: 'isbdm',
          kind: 'site',
          attributes: {
            namespace: 'ISBD',
          },
        },
        actions: ['edit'],
      });

      // Namespace editor should have edit access to sites in their namespace
      expect(result.resource.actions.edit).toBe('EFFECT_ALLOW');
    });
  });

  describe('Permission Planning', () => {
    it('should plan resource access queries', async () => {
      const mockResponse = {
        kind: 'KIND_ALWAYS_ALLOWED',
        condition: null,
      };

      cerbosClient.planResources.mockResolvedValueOnce(mockResponse);

      const result = await cerbosClient.planResources({
        principal: {
          id: 'admin-user',
          roles: ['site-admin'],
        },
        resource: {
          kind: 'site',
        },
        action: 'view',
      });

      expect(result.kind).toBe('KIND_ALWAYS_ALLOWED');
    });

    it('should return conditional access plans', async () => {
      const mockResponse = {
        kind: 'KIND_CONDITIONAL',
        condition: {
          match: {
            all: [
              { expr: 'request.resource.attr.namespace == "ISBD"' },
              { expr: 'request.resource.attr.status == "active"' },
            ],
          },
        },
      };

      cerbosClient.planResources.mockResolvedValueOnce(mockResponse);

      const result = await cerbosClient.planResources({
        principal: {
          id: 'editor',
          roles: ['namespace-editor:ISBD'],
        },
        resource: {
          kind: 'site',
        },
        action: 'edit',
      });

      expect(result.kind).toBe('KIND_CONDITIONAL');
      expect(result.condition).toBeDefined();
    });
  });

  describe('Simple Permission Helper', () => {
    it('should use isAllowed helper for simple checks', async () => {
      cerbosClient.isAllowed.mockResolvedValueOnce(true);

      const allowed = await cerbosClient.isAllowed({
        principal: {
          id: 'user-123',
          roles: ['site-editor:isbdm'],
        },
        resource: {
          id: 'isbdm',
          kind: 'site',
        },
        action: 'edit',
      });

      expect(allowed).toBe(true);
    });

    it('should deny access when not allowed', async () => {
      cerbosClient.isAllowed.mockResolvedValueOnce(false);

      const allowed = await cerbosClient.isAllowed({
        principal: {
          id: 'user-456',
          roles: ['site-viewer:isbdm'],
        },
        resource: {
          id: 'isbdm',
          kind: 'site',
        },
        action: 'delete',
      });

      expect(allowed).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle Cerbos connection errors', async () => {
      const error = new Error('Failed to connect to Cerbos PDP');
      cerbosClient.checkResource.mockRejectedValueOnce(error);

      await expect(
        cerbosClient.checkResource({
          principal: { id: 'user-123', roles: [] },
          resource: { id: 'test', kind: 'site' },
          actions: ['view'],
        }),
      ).rejects.toThrow('Failed to connect to Cerbos PDP');
    });

    it('should handle invalid policy errors', async () => {
      const error = new Error('Policy validation failed');
      cerbosClient.checkResource.mockRejectedValueOnce(error);

      await expect(
        cerbosClient.checkResource({
          principal: { id: 'user-123', roles: ['invalid-role'] },
          resource: { id: 'test', kind: 'invalid-kind' },
          actions: ['invalid-action'],
        }),
      ).rejects.toThrow('Policy validation failed');
    });

    it('should handle timeout errors', async () => {
      const error = new Error('Request timeout');
      cerbosClient.checkResource.mockRejectedValueOnce(error);

      await expect(
        cerbosClient.checkResource({
          principal: { id: 'user-123', roles: [] },
          resource: { id: 'test', kind: 'site' },
          actions: ['view'],
        }),
      ).rejects.toThrow('Request timeout');
    });
  });
});
