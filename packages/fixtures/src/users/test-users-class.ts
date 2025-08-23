/**
 * TestUsers Class
 * High-level API for working with test users in different testing contexts
 */

import {
  getTestUserByRole,
  getTestUserByEmail,
  getTestUserById,
  verifyTestUserMetadata,
  type ClerkTestUser,
  type TestUserInfo,
} from './helpers';
import {
  TEST_USER_EMAILS,
  TEST_USER_METADATA,
  type TestUserRole,
} from './constants';

/**
 * TestUsers class provides a high-level API for test user operations
 */
export class TestUsers {
  /**
   * Get the superadmin test user
   */
  static async getSuperAdmin(): Promise<TestUserInfo> {
    const user = getTestUserByRole('SUPERADMIN');
    if (!user) {
      throw new Error('Superadmin test user not found');
    }
    return this.toTestUserInfo(
      user,
      'SUPERADMIN',
      'System administrator with full access',
    );
  }

  /**
   * Get the review group admin test user
   */
  static async getReviewGroupAdmin(): Promise<TestUserInfo> {
    const user = getTestUserByRole('RG_ADMIN');
    if (!user) {
      throw new Error('Review group admin test user not found');
    }
    return this.toTestUserInfo(
      user,
      'RG_ADMIN',
      'Review group administrator for ISBD',
    );
  }

  /**
   * Get the namespace admin test user
   */
  static async getNamespaceAdmin(): Promise<TestUserInfo> {
    const user = getTestUserByRole('NAMESPACE_ADMIN');
    if (!user) {
      throw new Error('Namespace admin test user not found');
    }
    return this.toTestUserInfo(
      user,
      'NAMESPACE_ADMIN',
      'Namespace administrator for ISBD/ISBDM',
    );
  }

  /**
   * Get the editor test user
   */
  static async getEditor(): Promise<TestUserInfo> {
    const user = getTestUserByRole('EDITOR');
    if (!user) {
      throw new Error('Editor test user not found');
    }
    return this.toTestUserInfo(
      user,
      'EDITOR',
      'Team editor with edit permissions',
    );
  }

  /**
   * Get the author test user
   */
  static async getAuthor(): Promise<TestUserInfo> {
    const user = getTestUserByRole('AUTHOR');
    if (!user) {
      throw new Error('Author test user not found');
    }
    return this.toTestUserInfo(
      user,
      'AUTHOR',
      'Team author with create permissions',
    );
  }

  /**
   * Get the translator test user
   */
  static async getTranslator(): Promise<TestUserInfo> {
    const user = getTestUserByRole('TRANSLATOR');
    if (!user) {
      throw new Error('Translator test user not found');
    }
    return this.toTestUserInfo(
      user,
      'TRANSLATOR',
      'French translator for ISBD/LRM',
    );
  }

  /**
   * Get a test user by email
   */
  static async getByEmail(email: string): Promise<TestUserInfo | null> {
    const user = getTestUserByEmail(email);
    if (!user) {
      return null;
    }

    // Determine role from email
    const roleEntry = Object.entries(TEST_USER_EMAILS).find(
      ([, e]) => e === email,
    );
    if (!roleEntry) {
      return null;
    }

    const [role] = roleEntry as [TestUserRole, string];
    return this.toTestUserInfo(user, role, `Test user with role: ${role}`);
  }

  /**
   * Get a test user by ID
   */
  static async getById(id: string): Promise<TestUserInfo | null> {
    const user = getTestUserById(id);
    if (!user) {
      return null;
    }

    // Determine role from email
    const roleEntry = Object.entries(TEST_USER_EMAILS).find(([, email]) => {
      const u = getTestUserByEmail(email);
      return u?.id === id;
    });

    if (!roleEntry) {
      return null;
    }

    const [role] = roleEntry as [TestUserRole, string];
    return this.toTestUserInfo(user, role, `Test user with role: ${role}`);
  }

  /**
   * Verify all test users have correct metadata
   */
  static async verifyAllTestUsers(): Promise<{
    valid: boolean;
    results: Array<{ email: string; valid: boolean; errors: string[] }>;
  }> {
    const results: Array<{ email: string; valid: boolean; errors: string[] }> =
      [];

    for (const [role, email] of Object.entries(TEST_USER_EMAILS)) {
      const user = getTestUserByEmail(email);
      if (!user) {
        results.push({
          email,
          valid: false,
          errors: [`User not found for ${role}`],
        });
        continue;
      }

      const verification = verifyTestUserMetadata(user, role as TestUserRole);
      results.push({
        email,
        ...verification,
      });
    }

    return {
      valid: results.every((r) => r.valid),
      results,
    };
  }

  /**
   * Convert ClerkTestUser to TestUserInfo
   */
  private static toTestUserInfo(
    user: ClerkTestUser,
    role: TestUserRole,
    description: string,
  ): TestUserInfo {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.publicMetadata || TEST_USER_METADATA[role],
      description,
    };
  }

  /**
   * Get all test users
   */
  static async getAllUsers(): Promise<TestUserInfo[]> {
    const users: TestUserInfo[] = [];

    for (const role of Object.keys(TEST_USER_EMAILS) as TestUserRole[]) {
      const user = getTestUserByRole(role);
      if (user) {
        users.push(
          this.toTestUserInfo(user, role, `Test user with role: ${role}`),
        );
      }
    }

    return users;
  }
}
