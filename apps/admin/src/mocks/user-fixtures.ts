/**
 * User Fixtures Helper
 * Generates and validates mock user data based on contracts
 * Uses real Clerk test user data synced from production
 */

import {
  UserFixtureSchema,
  type UserFixture,
  type ClerkUser,
  type AppUser,
  type TeamRole,
  type TranslationAssignment,
  type LegacyReviewGroup,
  type ReviewGroup,
} from '@ifla/contracts';
import { clerkUsersFixture } from '@ifla/fixtures';

// Type-safe fixture data
const CLERK_USER_FIXTURES: Record<string, UserFixture> =
  UserFixtureSchema.array()
    .parse(Object.values(clerkUsersFixture))
    .reduce(
      (acc: Record<string, UserFixture>, user: UserFixture) => {
        const role = Object.entries(clerkUsersFixture).find(
          ([, u]) => (u as UserFixture).id === user.id,
        )?.[0];
        if (role) {
          acc[role] = user;
        }
        return acc;
      },
      {} as Record<string, UserFixture>,
    );

// Map of user roles to their expected dashboard routes
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
 * Get a test user fixture by role
 */
export function getUserFixture(
  role: keyof typeof CLERK_USER_FIXTURES,
): UserFixture {
  const user = CLERK_USER_FIXTURES[role];
  if (!user) {
    throw new Error(`Test user fixture not found for role: ${role}`);
  }
  return user;
}

/**
 * Get all test user fixtures
 */
export function getAllUserFixtures(): UserFixture[] {
  return Object.values(CLERK_USER_FIXTURES);
}

/**
 * Get test user by email
 */
export function getUserFixtureByEmail(email: string): UserFixture | null {
  return (
    Object.values(CLERK_USER_FIXTURES).find((u) => u.email === email) || null
  );
}

/**
 * Get test user by ID
 */
export function getUserFixtureById(id: string): UserFixture | null {
  return Object.values(CLERK_USER_FIXTURES).find((u) => u.id === id) || null;
}

/**
 * Transform UserFixture to ClerkUser format
 */
export function fixtureToClerkUser(fixture: UserFixture): ClerkUser {
  return {
    ...fixture,
    username: null,
    emailAddresses: [
      {
        id: `email_${fixture.id}`,
        emailAddress: fixture.email,
      },
    ],
  };
}

/**
 * Transform UserFixture to AppUser format (for GitHub-based auth)
 */
export function fixtureToAppUser(fixture: UserFixture): AppUser {
  const metadata = fixture.publicMetadata;
  const { privateMetadata } = fixture;

  // Determine system role
  const systemRole =
    metadata.systemRole === 'admin' ||
    metadata.systemRole === 'superadmin' ||
    metadata.roles?.includes('superadmin')
      ? 'admin'
      : undefined;

  // Extract accessible namespaces
  const namespaces = new Set<string>();

  // From teams
  metadata.teams?.forEach((team: TeamRole) => {
    team.namespaces.forEach((ns: string) => namespaces.add(ns));
  });

  // From translations
  metadata.translations?.forEach((trans: TranslationAssignment) => {
    trans.namespaces.forEach((ns: string) => namespaces.add(ns));
  });

  // From review groups (legacy format)
  if (Array.isArray(metadata.reviewGroups)) {
    metadata.reviewGroups.forEach((rg: LegacyReviewGroup | ReviewGroup) => {
      const ns = (rg as ReviewGroup).namespaces;
      if (Array.isArray(ns)) {
        ns.forEach((n: string) => namespaces.add(n));
      }
    });
  }

  // Check if user is review group admin
  const isReviewGroupAdmin =
    metadata.reviewGroups?.some(
      (rg: any) => rg.role === 'admin' || rg.role === 'maintainer',
    ) || false;

  return {
    id: fixture.id,
    email: fixture.email,
    name:
      fixture.fullName ||
      `${fixture.firstName} ${fixture.lastName}`.trim() ||
      'Test User',
    githubUsername: metadata.githubUsername,
    systemRole,
    roles: metadata.roles,
    reviewGroups: [], // Would be populated from GitHub integration
    projects: privateMetadata.projects || {},
    isReviewGroupAdmin,
    accessibleNamespaces: Array.from(namespaces),
  };
}

/**
 * Get expected dashboard route for a user
 */
export function getExpectedDashboardRoute(user: UserFixture | AppUser): string {
  const metadata = 'publicMetadata' in user ? user.publicMetadata : user;

  // Superadmin check
  if (
    metadata.systemRole === 'admin' ||
    metadata.systemRole === 'superadmin' ||
    metadata.roles?.includes('superadmin')
  ) {
    return DASHBOARD_ROUTES.superadmin;
  }

  // Review group admin check (legacy format)
  if (
    'publicMetadata' in user &&
    user.publicMetadata.reviewGroups?.some(
      (rg: LegacyReviewGroup | ReviewGroup) =>
        (rg as LegacyReviewGroup).role === 'admin' ||
        (rg as ReviewGroup).role === 'maintainer',
    )
  ) {
    return DASHBOARD_ROUTES.rgadmin;
  }

  // Namespace admin check
  if (
    'publicMetadata' in user &&
    user.publicMetadata.teams?.some(
      (t: TeamRole) => t.role === 'admin' && t.namespaces?.length > 0,
    )
  ) {
    const team = user.publicMetadata.teams?.find(
      (t: TeamRole) => t.role === 'admin',
    );
    if (team && team.namespaces?.length > 0) {
      return `/dashboard/${team.namespaces[0]}`;
    }
  }

  // Editor check
  if (
    'publicMetadata' in user &&
    user.publicMetadata.teams?.some((t: TeamRole) => t.role === 'editor')
  ) {
    return DASHBOARD_ROUTES.editor;
  }

  // Author check
  if (
    'publicMetadata' in user &&
    user.publicMetadata.teams?.some((t: TeamRole) => t.role === 'author')
  ) {
    return DASHBOARD_ROUTES.author;
  }

  // Translator check
  if (
    'publicMetadata' in user &&
    user.publicMetadata.translations &&
    user.publicMetadata.translations.length > 0
  ) {
    return DASHBOARD_ROUTES.translator;
  }

  // Default to personal dashboard
  return DASHBOARD_ROUTES.translator;
}

/**
 * Create a mock authenticated session
 */
export function createMockSession(userId: string) {
  const user = getUserFixtureById(userId);
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    sessionId: `sess_${user.id}_mock`,
    sessionClaims: {
      email: user.email,
      publicMetadata: user.publicMetadata,
    },
  };
}

/**
 * Test helper to simulate different user states
 */
export const MockUserStates = {
  authenticated: (role: keyof typeof CLERK_USER_FIXTURES) => {
    const user = getUserFixture(role);
    return {
      user: fixtureToClerkUser(user),
      session: createMockSession(user.id),
      isSignedIn: true,
      isLoaded: true,
    };
  },

  unauthenticated: () => ({
    user: null,
    session: null,
    isSignedIn: false,
    isLoaded: true,
  }),

  loading: () => ({
    user: null,
    session: null,
    isSignedIn: false,
    isLoaded: false,
  }),
};

/**
 * Validate that fixtures match expected structure
 */
export function validateFixtures(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Validate each fixture against schema
    Object.entries(clerkUsersFixture).forEach(([role, user]) => {
      try {
        UserFixtureSchema.parse(user);
      } catch (error) {
        errors.push(`Invalid fixture for ${role}: ${error}`);
      }
    });

    // Check expected users exist
    const expectedRoles = [
      'superadmin',
      'rgadmin',
      'nsadmin',
      'editor',
      'author',
      'translator',
    ];
    expectedRoles.forEach((role) => {
      if (!CLERK_USER_FIXTURES[role]) {
        errors.push(`Missing expected user fixture: ${role}`);
      }
    });
  } catch (error) {
    errors.push(`Fixture validation error: ${error}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
