/**
 * Mock authorization module for testing
 */

import { vi } from 'vitest';

export const mockAuthContext = {
  userId: 'user_superadmin123',
  email: 'superadmin+clerk_test@example.com',
  roles: {
    systemRole: 'superadmin' as const,
    reviewGroups: [],
    teams: [],
    translations: [],
  },
};

export const mockGetAuthContext = vi.fn().mockResolvedValue(mockAuthContext);

export const mockCanPerformAction = vi.fn().mockResolvedValue(true);

export const mockGetUserAccessibleResources = vi.fn().mockResolvedValue({
  reviewGroups: ['isbd', 'bcm', 'ucp'],
  namespaces: ['isbd', 'isbdm', 'lrm', 'frbr'],
  projects: [],
  teams: [],
});

export const authorizationMock = {
  getAuthContext: mockGetAuthContext,
  canPerformAction: mockCanPerformAction,
  getUserAccessibleResources: mockGetUserAccessibleResources,
};
