/**
 * Test User Constants
 * Centralized test user email addresses and metadata structures
 * Used across all testing environments (unit, integration, e2e)
 */

/**
 * Test user email addresses - these correspond to actual Clerk users
 * All users use verification code: 424242
 */
export const TEST_USER_EMAILS = {
  SUPERADMIN: 'superadmin+clerk_test@example.com',
  RG_ADMIN: 'rg_admin+clerk_test@example.com',
  NAMESPACE_ADMIN: 'ns_admin+clerk_test@example.com',
  EDITOR: 'editor+clerk_test@example.com',
  AUTHOR: 'author+clerk_test@example.com',
  TRANSLATOR: 'translator+clerk_test@example.com',
} as const;

export type TestUserRole = keyof typeof TEST_USER_EMAILS;

/**
 * Expected metadata structure for each test user
 * This matches the Clerk publicMetadata structure for our custom RBAC
 */
export const TEST_USER_METADATA = {
  SUPERADMIN: {
    role: 'superadmin' as const,
    systemRole: 'superadmin' as const,
    reviewGroups: [],
    teams: [],
    translations: [],
  },
  RG_ADMIN: {
    role: 'admin' as const,
    systemRole: undefined,
    reviewGroups: [{ role: 'admin' as const, reviewGroupId: 'isbd' }],
    teams: [],
    translations: [],
  },
  NAMESPACE_ADMIN: {
    role: 'admin' as const,
    systemRole: undefined,
    reviewGroups: [],
    teams: [
      {
        teamId: 'isbd-namespace-admin',
        role: 'admin' as const,
        reviewGroup: 'isbd',
        namespaces: ['isbd', 'isbdm'],
      },
    ],
    translations: [],
  },
  EDITOR: {
    role: 'editor' as const,
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
  AUTHOR: {
    role: 'editor' as const,
    systemRole: undefined,
    reviewGroups: [],
    teams: [
      {
        role: 'author' as const,
        teamId: 'lrm-team-1',
        namespaces: ['lrm'],
        reviewGroup: 'bcm',
      },
    ],
    translations: [],
  },
  TRANSLATOR: {
    role: 'translator' as const,
    systemRole: undefined,
    reviewGroups: [],
    teams: [],
    translations: [
      {
        language: 'fr',
        namespaces: ['isbd', 'lrm'],
      },
    ],
  },
} as const;

/**
 * Map of user roles to their expected dashboard routes
 */
export const DASHBOARD_ROUTES = {
  superadmin: '/dashboard/admin',
  rgadmin: '/dashboard/rg',
  nsadmin: '/dashboard/isbd', // First namespace they admin
  editor: '/dashboard/editor',
  author: '/dashboard/author',
  translator: '/dashboard',
  unauthenticated: '/sign-in',
} as const;

/**
 * Test user IDs mapped to roles
 * These are the actual Clerk user IDs from the fixtures
 */
export const TEST_USER_IDS = {
  SUPERADMIN: 'user_2zsI76wuc6kilY2CVPB0vOOLXWk',
  RG_ADMIN: 'user_2zsI22BmfFg4ZHGmGXJkDqDb8cO',
  NAMESPACE_ADMIN: 'user_2zsI0b3bGMvOQN8iZ5T5cILqxe3',
  EDITOR: 'user_2zsI9xgIrEYnXQ1n7VKlNxHjcWD',
  AUTHOR: 'user_2zsI6Zi8K8GxBzWNg2z3MFFEhSa',
  TRANSLATOR: 'user_2zsI3bFdM8P8tJoKPJzpP5XKQYH',
} as const;
