/**
 * Test User Helper Functions
 * Utilities for working with test user fixtures
 */

import clerkUsersData from '../clerk-users.json';
import {
  TEST_USER_EMAILS,
  TEST_USER_METADATA,
  type TestUserRole,
} from './constants';

export interface ClerkTestUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  publicMetadata: any;
  privateMetadata?: any;
  createdAt: number;
  updatedAt: number;
}

export interface TestUserInfo {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  roles: any;
  description: string;
}

// Type-safe fixture data
const CLERK_USER_FIXTURES: Record<string, ClerkTestUser> =
  clerkUsersData as any;

/**
 * Get a test user by role name
 */
export function getTestUserByRole(
  role: TestUserRole | string,
): ClerkTestUser | null {
  const roleKey = role.toLowerCase().replace('_', '');
  return CLERK_USER_FIXTURES[roleKey] || null;
}

/**
 * Get a test user by email address
 */
export function getTestUserByEmail(email: string): ClerkTestUser | null {
  return (
    Object.values(CLERK_USER_FIXTURES).find((user) => user.email === email) ||
    null
  );
}

/**
 * Get a test user by Clerk ID
 */
export function getTestUserById(id: string): ClerkTestUser | null {
  return (
    Object.values(CLERK_USER_FIXTURES).find((user) => user.id === id) || null
  );
}

/**
 * Get all test user fixtures
 */
export function getAllTestUsers(): ClerkTestUser[] {
  return Object.values(CLERK_USER_FIXTURES);
}

/**
 * Get all test user emails
 */
export function getAllTestUserEmails(): string[] {
  return Object.values(TEST_USER_EMAILS);
}

/**
 * Verify a user has the expected metadata structure
 */
export function verifyTestUserMetadata(
  user: ClerkTestUser,
  expectedRole: TestUserRole,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const expected = TEST_USER_METADATA[expectedRole];

  if (!user.publicMetadata) {
    errors.push('User has no publicMetadata');
    return { valid: false, errors };
  }

  // Check system role
  if (expected.systemRole !== undefined) {
    if (user.publicMetadata.systemRole !== expected.systemRole) {
      errors.push(
        `Expected systemRole ${expected.systemRole}, got ${user.publicMetadata.systemRole}`,
      );
    }
  }

  // Check review groups
  if (expected.reviewGroups?.length) {
    if (!Array.isArray(user.publicMetadata.reviewGroups)) {
      errors.push('reviewGroups is not an array');
    } else if (
      user.publicMetadata.reviewGroups.length !== expected.reviewGroups.length
    ) {
      errors.push(
        `Expected ${expected.reviewGroups.length} review groups, got ${user.publicMetadata.reviewGroups.length}`,
      );
    }
  }

  // Check teams
  if (expected.teams?.length) {
    if (!Array.isArray(user.publicMetadata.teams)) {
      errors.push('teams is not an array');
    } else if (user.publicMetadata.teams.length !== expected.teams.length) {
      errors.push(
        `Expected ${expected.teams.length} teams, got ${user.publicMetadata.teams.length}`,
      );
    }
  }

  // Check translations
  if (expected.translations?.length) {
    if (!Array.isArray(user.publicMetadata.translations)) {
      errors.push('translations is not an array');
    } else if (
      user.publicMetadata.translations.length !== expected.translations.length
    ) {
      errors.push(
        `Expected ${expected.translations.length} translations, got ${user.publicMetadata.translations.length}`,
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Clear any cached test user data (for test isolation)
 */
let testUserCache: Map<string, ClerkTestUser> | null = null;

export function clearTestUsersCache(): void {
  testUserCache = null;
}

/**
 * Get cached test user or fetch from fixtures
 */
export function getCachedTestUser(identifier: string): ClerkTestUser | null {
  if (!testUserCache) {
    testUserCache = new Map();
  }

  if (testUserCache.has(identifier)) {
    return testUserCache.get(identifier)!;
  }

  let user: ClerkTestUser | null = null;

  // Try as role
  user = getTestUserByRole(identifier);
  if (user) {
    testUserCache.set(identifier, user);
    return user;
  }

  // Try as email
  user = getTestUserByEmail(identifier);
  if (user) {
    testUserCache.set(identifier, user);
    return user;
  }

  // Try as ID
  user = getTestUserById(identifier);
  if (user) {
    testUserCache.set(identifier, user);
    return user;
  }

  return null;
}
