/**
 * Isolated tests for unauthenticated API access
 * These tests are separated to properly control mock state
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';

describe('API Unauthenticated Access Tests @integration @api @auth @clerk @critical', () => {
  beforeAll(() => {
    // Override the global mocks BEFORE importing routes
    vi.mock('@clerk/nextjs/server', () => ({
      auth: vi.fn(() => Promise.resolve(null)),
      currentUser: vi.fn(() => Promise.resolve(null)),
      clerkMiddleware: vi.fn(() => vi.fn()),
      clerkClient: vi.fn(() => ({
        users: {
          getUser: vi.fn(),
          getUserList: vi.fn(() =>
            Promise.resolve({ data: [], totalCount: 0 }),
          ),
        },
      })),
    }));

    vi.mock('@/lib/authorization', () => ({
      getAuthContext: vi.fn(() => Promise.resolve(null)),
      canPerformAction: vi.fn(() => Promise.resolve(false)),
      getUserAccessibleResources: vi.fn(() =>
        Promise.resolve({
          reviewGroups: [],
          namespaces: [],
          projects: [],
          teams: [],
        }),
      ),
    }));
  });

  it('should deny access to namespaces without authentication', async () => {
    // Import AFTER mocks are set
    const { GET } = await import('../../app/api/admin/namespaces/route');

    const request = new Request('http://localhost:3000/api/admin/namespaces', {
      method: 'GET',
    });

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHENTICATED');
  });

  it('should deny namespace creation without authentication', async () => {
    const { POST } = await import('../../app/api/admin/namespaces/route');

    const requestBody = {
      name: 'Test Namespace',
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

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHENTICATED');
  });

  it('should deny vocabulary access without authentication', async () => {
    const { GET } = await import('../../app/api/admin/vocabularies/route');

    const request = new Request(
      'http://localhost:3000/api/admin/vocabularies',
      {
        method: 'GET',
      },
    );

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UNAUTHENTICATED');
  });
});
