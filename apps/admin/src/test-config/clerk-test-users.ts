/**
 * Clerk Test Users Utilities
 * 
 * This module provides standardized access to Clerk test users for integration testing.
 * These are real Clerk users with proper metadata structure, providing more realistic
 * testing than mocks.
 * 
 * Usage:
 * - Use these for integration tests that need real Clerk authentication
 * - Use mocks for unit tests that don't need full Clerk integration
 * - Always use the helper functions rather than hardcoding user IDs
 */

import { clerkClient } from '@clerk/nextjs/server';
import { UserRoles } from '../lib/auth';

export interface ClerkTestUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: UserRoles;
  description: string;
}

/**
 * Test user email addresses - these correspond to actual Clerk users
 */
export const TEST_USER_EMAILS = {
  SUPERADMIN: 'superadmin+clerk_test@example.com',
  RG_ADMIN: 'rg_admin+clerk_test@example.com',
  EDITOR: 'editor+clerk_test@example.com',
  AUTHOR: 'author+clerk_test@example.com',
  TRANSLATOR: 'translator+clerk_test@example.com',
} as const;

/**
 * Expected metadata structure for each test user
 */
export const TEST_USER_METADATA = {
  SUPERADMIN: {
    systemRole: 'superadmin' as const,
    reviewGroups: [],
    teams: [],
    translations: [],
  },
  RG_ADMIN: {
    reviewGroups: [{ role: 'admin' as const, reviewGroupId: 'isbd' }],
    teams: [],
    translations: [],
  },
  EDITOR: {
    reviewGroups: [],
    teams: [{ 
      role: 'editor' as const,
      teamId: 'isbd-team-1', 
      namespaces: ['isbd', 'isbdm'],
      reviewGroup: 'isbd'
    }],
    translations: [],
  },
  AUTHOR: {
    reviewGroups: [],
    teams: [{ 
      role: 'author' as const,
      teamId: 'lrm-team-1', 
      namespaces: ['lrm'],
      reviewGroup: 'bcm'
    }],
    translations: [],
  },
  TRANSLATOR: {
    reviewGroups: [],
    teams: [],
    translations: [{ 
      language: 'fr', 
      namespaces: ['isbd', 'lrm'] 
    }],
  },
} as const;

/**
 * Cache for test users to avoid repeated API calls
 */
let testUsersCache: Map<string, ClerkTestUser> | null = null;

/**
 * Fetch all test users from Clerk and cache them
 */
export async function loadTestUsers(): Promise<Map<string, ClerkTestUser>> {
  if (testUsersCache) {
    return testUsersCache;
  }

  const clerk = await clerkClient();
  const users = await clerk.users.getUserList({ limit: 50 });
  
  const testUsers = new Map<string, ClerkTestUser>();
  
  for (const user of users.data) {
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email || !email.includes('+clerk_test@')) {
      continue; // Skip non-test users
    }
    
    const roles: UserRoles = {
      systemRole: user.publicMetadata?.systemRole as 'superadmin' | undefined,
      reviewGroups: (user.publicMetadata?.reviewGroups as any[]) || [],
      teams: (user.publicMetadata?.teams as any[]) || [],
      translations: (user.publicMetadata?.translations as any[]) || [],
    };
    
    const testUser: ClerkTestUser = {
      id: user.id,
      email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      roles,
      description: getTestUserDescription(email),
    };
    
    testUsers.set(email, testUser);
  }
  
  testUsersCache = testUsers;
  return testUsers;
}

/**
 * Get a specific test user by email
 */
export async function getTestUser(email: string): Promise<ClerkTestUser | null> {
  const testUsers = await loadTestUsers();
  return testUsers.get(email) || null;
}

/**
 * Get test user by role type
 */
export async function getTestUserByRole(role: keyof typeof TEST_USER_EMAILS): Promise<ClerkTestUser | null> {
  const email = TEST_USER_EMAILS[role];
  return getTestUser(email);
}

/**
 * Get all test users
 */
export async function getAllTestUsers(): Promise<ClerkTestUser[]> {
  const testUsers = await loadTestUsers();
  return Array.from(testUsers.values());
}

/**
 * Clear the test users cache (useful for tests that modify user data)
 */
export function clearTestUsersCache(): void {
  testUsersCache = null;
}

/**
 * Verify that a test user has the expected metadata structure
 */
export function verifyTestUserMetadata(user: ClerkTestUser, expectedRole: keyof typeof TEST_USER_METADATA): boolean {
  const expected = TEST_USER_METADATA[expectedRole];
  const actual = user.roles;
  
  // Deep comparison of metadata
  return JSON.stringify(actual) === JSON.stringify(expected);
}

/**
 * Get description for a test user based on email
 */
function getTestUserDescription(email: string): string {
  switch (email) {
    case TEST_USER_EMAILS.SUPERADMIN:
      return 'System superadmin with full access to all resources';
    case TEST_USER_EMAILS.RG_ADMIN:
      return 'Review Group admin for ISBD with namespace management permissions';
    case TEST_USER_EMAILS.EDITOR:
      return 'Namespace editor for ISBD/ISBDM with content creation/editing permissions';
    case TEST_USER_EMAILS.AUTHOR:
      return 'Namespace author for LRM with content creation permissions (no delete)';
    case TEST_USER_EMAILS.TRANSLATOR:
      return 'French translator for ISBD and LRM namespaces';
    default:
      return 'Test user';
  }
}

/**
 * Helper functions for common test scenarios
 */
export const TestUsers = {
  /**
   * Get a superadmin user for tests requiring full system access
   */
  async getSuperAdmin(): Promise<ClerkTestUser | null> {
    return getTestUserByRole('SUPERADMIN');
  },

  /**
   * Get a review group admin for tests requiring RG management
   */
  async getReviewGroupAdmin(): Promise<ClerkTestUser | null> {
    return getTestUserByRole('RG_ADMIN');
  },

  /**
   * Get an editor for tests requiring content editing
   */
  async getEditor(): Promise<ClerkTestUser | null> {
    return getTestUserByRole('EDITOR');
  },

  /**
   * Get an author for tests requiring content creation (but not deletion)
   */
  async getAuthor(): Promise<ClerkTestUser | null> {
    return getTestUserByRole('AUTHOR');
  },

  /**
   * Get a translator for tests requiring translation permissions
   */
  async getTranslator(): Promise<ClerkTestUser | null> {
    return getTestUserByRole('TRANSLATOR');
  },

  /**
   * Get a user with no special permissions (for negative testing)
   */
  async getUnauthorizedUser(): Promise<ClerkTestUser | null> {
    // For now, we don't have a dedicated unauthorized user
    // Could create one if needed
    return null;
  },
};

/**
 * Test utilities for setting up test contexts
 */
export const TestUserUtils = {
  /**
   * Create a test context with a specific user
   */
  async createTestContext(userEmail: string) {
    const user = await getTestUser(userEmail);
    if (!user) {
      throw new Error(`Test user not found: ${userEmail}`);
    }
    
    return {
      user,
      userId: user.id,
      roles: user.roles,
    };
  },

  /**
   * Verify all test users have correct metadata
   */
  async verifyAllTestUsers(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      const superAdmin = await TestUsers.getSuperAdmin();
      if (!superAdmin || !verifyTestUserMetadata(superAdmin, 'SUPERADMIN')) {
        errors.push('Superadmin user metadata is incorrect');
      }

      const rgAdmin = await TestUsers.getReviewGroupAdmin();
      if (!rgAdmin || !verifyTestUserMetadata(rgAdmin, 'RG_ADMIN')) {
        errors.push('Review Group admin user metadata is incorrect');
      }

      const editor = await TestUsers.getEditor();
      if (!editor || !verifyTestUserMetadata(editor, 'EDITOR')) {
        errors.push('Editor user metadata is incorrect');
      }

      const author = await TestUsers.getAuthor();
      if (!author || !verifyTestUserMetadata(author, 'AUTHOR')) {
        errors.push('Author user metadata is incorrect');
      }

      const translator = await TestUsers.getTranslator();
      if (!translator || !verifyTestUserMetadata(translator, 'TRANSLATOR')) {
        errors.push('Translator user metadata is incorrect');
      }

    } catch (error) {
      errors.push(`Error verifying test users: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Print test user information for debugging
   */
  async printTestUserInfo(): Promise<void> {
    const users = await getAllTestUsers();
    
    console.log('📋 Clerk Test Users:');
    console.log('===================');
    
    users.forEach(user => {
      console.log(`\n${user.email}`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Description: ${user.description}`);
      console.log(`  Roles: ${JSON.stringify(user.roles, null, 2)}`);
    });
  },
};