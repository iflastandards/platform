/**
 * @integration @auth @high-priority
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { 
  TestUsers, 
  TestUserUtils, 
  TEST_USER_EMAILS,
  getAllTestUsers,
  clearTestUsersCache 
} from '../../test-config/clerk-test-users';

describe('Clerk Test Users @integration @authentication @clerk', () => {
  beforeAll(() => {
    // Clear cache to ensure fresh data
    clearTestUsersCache();
  });

  describe('Test User Access', () => {
    it('should load all test users successfully', async () => {
      const users = await getAllTestUsers();
      
      expect(users).toBeDefined();
      expect(users.length).toBeGreaterThan(0);
      
      // Should have at least our 5 main test users
      expect(users.length).toBeGreaterThanOrEqual(5);
    });

    it('should get superadmin test user', async () => {
      const superAdmin = await TestUsers.getSuperAdmin();
      
      expect(superAdmin).toBeDefined();
      expect(superAdmin?.email).toBe(TEST_USER_EMAILS.SUPERADMIN);
      expect(superAdmin?.roles.systemRole).toBe('superadmin');
    });

    it('should get review group admin test user', async () => {
      const rgAdmin = await TestUsers.getReviewGroupAdmin();
      
      expect(rgAdmin).toBeDefined();
      expect(rgAdmin?.email).toBe(TEST_USER_EMAILS.RG_ADMIN);
      expect(rgAdmin?.roles.reviewGroups).toHaveLength(1);
      expect(rgAdmin?.roles.reviewGroups[0]).toMatchObject({
        reviewGroupId: 'isbd',
        role: 'admin'
      });
    });

    it('should get editor test user', async () => {
      const editor = await TestUsers.getEditor();
      
      expect(editor).toBeDefined();
      expect(editor?.email).toBe(TEST_USER_EMAILS.EDITOR);
      expect(editor?.roles.teams).toHaveLength(1);
      expect(editor?.roles.teams[0]).toMatchObject({
        teamId: 'isbd-team-1',
        role: 'editor',
        reviewGroup: 'isbd',
        namespaces: ['isbd', 'isbdm']
      });
    });

    it('should get author test user', async () => {
      const author = await TestUsers.getAuthor();
      
      expect(author).toBeDefined();
      expect(author?.email).toBe(TEST_USER_EMAILS.AUTHOR);
      expect(author?.roles.teams).toHaveLength(1);
      expect(author?.roles.teams[0]).toMatchObject({
        teamId: 'lrm-team-1',
        role: 'author',
        reviewGroup: 'bcm',
        namespaces: ['lrm']
      });
    });

    it('should get translator test user', async () => {
      const translator = await TestUsers.getTranslator();
      
      expect(translator).toBeDefined();
      expect(translator?.email).toBe(TEST_USER_EMAILS.TRANSLATOR);
      expect(translator?.roles.translations).toHaveLength(1);
      expect(translator?.roles.translations[0]).toMatchObject({
        language: 'fr',
        namespaces: ['isbd', 'lrm']
      });
    });
  });

  describe('Test User Utilities', () => {
    it('should create test context for a user', async () => {
      const context = await TestUserUtils.createTestContext(TEST_USER_EMAILS.EDITOR);
      
      expect(context).toBeDefined();
      expect(context.user).toBeDefined();
      expect(context.userId).toBeDefined();
      expect(context.roles).toBeDefined();
      expect(context.user.email).toBe(TEST_USER_EMAILS.EDITOR);
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        TestUserUtils.createTestContext('nonexistent@example.com')
      ).rejects.toThrow('Test user not found');
    });

    it('should verify all test users have correct metadata', async () => {
      const verification = await TestUserUtils.verifyAllTestUsers();
      
      expect(verification).toBeDefined();
      expect(verification.valid).toBe(true);
      expect(verification.errors).toHaveLength(0);
    }, 10000); // Longer timeout for API calls
  });

  describe('Test User Metadata Validation', () => {
    it('should have correct superadmin metadata', async () => {
      const user = await TestUsers.getSuperAdmin();
      
      expect(user?.roles).toMatchObject({
        systemRole: 'superadmin',
        reviewGroups: [],
        teams: [],
        translations: []
      });
    });

    it('should have correct review group admin metadata', async () => {
      const user = await TestUsers.getReviewGroupAdmin();
      
      expect(user?.roles.reviewGroups).toEqual([
        { reviewGroupId: 'isbd', role: 'admin' }
      ]);
      expect(user?.roles.teams).toEqual([]);
      expect(user?.roles.translations).toEqual([]);
    });

    it('should have correct editor metadata', async () => {
      const user = await TestUsers.getEditor();
      
      expect(user?.roles.teams).toEqual([
        { 
          teamId: 'isbd-team-1', 
          role: 'editor', 
          reviewGroup: 'isbd', 
          namespaces: ['isbd', 'isbdm'] 
        }
      ]);
      expect(user?.roles.reviewGroups).toEqual([]);
      expect(user?.roles.translations).toEqual([]);
    });

    it('should have correct author metadata', async () => {
      const user = await TestUsers.getAuthor();
      
      expect(user?.roles.teams).toEqual([
        { 
          teamId: 'lrm-team-1', 
          role: 'author', 
          reviewGroup: 'bcm', 
          namespaces: ['lrm'] 
        }
      ]);
      expect(user?.roles.reviewGroups).toEqual([]);
      expect(user?.roles.translations).toEqual([]);
    });

    it('should have correct translator metadata', async () => {
      const user = await TestUsers.getTranslator();
      
      expect(user?.roles.translations).toEqual([
        { language: 'fr', namespaces: ['isbd', 'lrm'] }
      ]);
      expect(user?.roles.reviewGroups).toEqual([]);
      expect(user?.roles.teams).toEqual([]);
    });
  });

  describe('Caching Behavior', () => {
    it('should cache test users after first load', async () => {
      // Clear cache first
      clearTestUsersCache();
      
      // First call should load from API
      const users1 = await getAllTestUsers();
      
      // Second call should use cache (should be faster)
      const users2 = await getAllTestUsers();
      
      expect(users1).toEqual(users2);
      expect(users1.length).toBe(users2.length);
    });

    it('should reload users after cache clear', async () => {
      // Load users
      await getAllTestUsers();
      
      // Clear cache
      clearTestUsersCache();
      
      // Should be able to load again
      const users = await getAllTestUsers();
      expect(users).toBeDefined();
      expect(users.length).toBeGreaterThan(0);
    });
  });
});