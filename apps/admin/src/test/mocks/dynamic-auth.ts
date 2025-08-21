/**
 * Dynamic Auth Mock System
 *
 * This provides a way to dynamically control auth mocks at runtime,
 * allowing tests to change authentication state after modules are imported.
 */

import { vi } from 'vitest';

// Global state for controlling mock behavior
export const mockAuthState = {
  isAuthenticated: true,
  currentUser: {
    userId: 'user_superadmin123',
    sessionId: 'sess_test_123',
    sessionClaims: {
      sub: 'user_superadmin123',
      email: 'superadmin+clerk_test@example.com',
    },
  },
  authContext: {
    userId: 'user_superadmin123',
    email: 'superadmin+clerk_test@example.com',
    roles: {
      systemRole: 'superadmin' as const,
      reviewGroups: [],
      teams: [],
      translations: [],
    },
  },
  canPerformAction: true,
  accessibleResources: {
    reviewGroups: ['isbd', 'bcm', 'ucp'],
    namespaces: ['isbd', 'isbdm', 'lrm', 'frbr'],
    projects: [],
    teams: [],
  },
};

// Dynamic mock functions that check state at runtime
export const dynamicAuthMock = vi.fn(() => {
  if (!mockAuthState.isAuthenticated) {
    return Promise.resolve(null);
  }
  return Promise.resolve(mockAuthState.currentUser);
});

export const dynamicGetAuthContextMock = vi.fn(() => {
  if (!mockAuthState.isAuthenticated) {
    return Promise.resolve(null);
  }
  return Promise.resolve(mockAuthState.authContext);
});

export const dynamicCanPerformActionMock = vi.fn(() => {
  return Promise.resolve(mockAuthState.canPerformAction);
});

export const dynamicGetUserAccessibleResourcesMock = vi.fn(() => {
  return Promise.resolve(mockAuthState.accessibleResources);
});

// Helper functions to control mock state
export function setAuthenticated(authenticated: boolean) {
  mockAuthState.isAuthenticated = authenticated;
}

export function setCurrentUser(user: any) {
  mockAuthState.currentUser = user;
  mockAuthState.isAuthenticated = !!user;
}

export function setAuthContext(context: any) {
  mockAuthState.authContext = context;
  mockAuthState.isAuthenticated = !!context;
}

export function setCanPerformAction(allowed: boolean) {
  mockAuthState.canPerformAction = allowed;
}

export function setAccessibleResources(resources: any) {
  mockAuthState.accessibleResources = resources;
}

export function resetMockAuthState() {
  mockAuthState.isAuthenticated = true;
  mockAuthState.currentUser = {
    userId: 'user_superadmin123',
    sessionId: 'sess_test_123',
    sessionClaims: {
      sub: 'user_superadmin123',
      email: 'superadmin+clerk_test@example.com',
    },
  };
  mockAuthState.authContext = {
    userId: 'user_superadmin123',
    email: 'superadmin+clerk_test@example.com',
    roles: {
      systemRole: 'superadmin' as const,
      reviewGroups: [],
      teams: [],
      translations: [],
    },
  };
  mockAuthState.canPerformAction = true;
  mockAuthState.accessibleResources = {
    reviewGroups: ['isbd', 'bcm', 'ucp'],
    namespaces: ['isbd', 'isbdm', 'lrm', 'frbr'],
    projects: [],
    teams: [],
  };
}

// Test user presets
export const testUserPresets = {
  superadmin: {
    user: {
      userId: 'user_superadmin123',
      sessionId: 'sess_test_123',
      sessionClaims: {
        sub: 'user_superadmin123',
        email: 'superadmin+clerk_test@example.com',
      },
    },
    context: {
      userId: 'user_superadmin123',
      email: 'superadmin+clerk_test@example.com',
      roles: {
        systemRole: 'superadmin' as const,
        reviewGroups: [],
        teams: [],
        translations: [],
      },
    },
    canPerformAction: true,
    resources: {
      reviewGroups: 'all',
      namespaces: 'all',
      projects: 'all',
      teams: 'all',
    },
  },
  editor: {
    user: {
      userId: 'user_editor123',
      sessionId: 'sess_test_456',
      sessionClaims: {
        sub: 'user_editor123',
        email: 'editor+clerk_test@example.com',
      },
    },
    context: {
      userId: 'user_editor123',
      email: 'editor+clerk_test@example.com',
      roles: {
        systemRole: undefined,
        reviewGroups: [],
        teams: [
          {
            role: 'editor' as const,
            teamId: 'isbd-team-1',
            namespaces: ['isbd', 'isbdm'],
            reviewGroup: 'isbd',
          },
        ],
        translations: [],
      },
    },
    canPerformAction: false, // For namespace creation
    resources: {
      reviewGroups: [],
      namespaces: ['isbd', 'isbdm'],
      projects: [],
      teams: ['isbd-team-1'],
    },
  },
  unauthenticated: {
    user: null,
    context: null,
    canPerformAction: false,
    resources: {
      reviewGroups: [],
      namespaces: [],
      projects: [],
      teams: [],
    },
  },
};

export function setTestUser(preset: keyof typeof testUserPresets) {
  const config = testUserPresets[preset];
  if (preset === 'unauthenticated') {
    setAuthenticated(false);
  } else {
    setCurrentUser(config.user);
    setAuthContext(config.context);
    setCanPerformAction(config.canPerformAction);
    setAccessibleResources(config.resources);
  }
}
