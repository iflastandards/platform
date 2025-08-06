/**
 * @unit @critical @auth
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createUser, 
  getUser, 
  createSuperAdmin, 
  createReviewGroupAdmin, 
  createNamespaceEditor,
  createNamespaceAuthor,
  createTranslator,
  clearUsers 
} from '../../app/lib/mock-auth';
import { UserRoles } from '../../lib/auth';

describe('Mock Authentication @unit @critical @auth', () => {
  beforeEach(() => {
    clearUsers();
  });

  describe('createUser', () => {
    it('should create a new mock user with provided data', () => {
      const user = createUser({
        name: 'Test User',
        teams: [{ 
          teamId: 'team-1', 
          role: 'editor', 
          reviewGroup: 'isbd', 
          namespaces: ['isbd', 'isbdm'] 
        }],
      });

      expect(user).toMatchObject({
        name: 'Test User',
        email: 'test.user@example.com',
      });
      expect(user.roles.teams).toHaveLength(1);
      expect(user.roles.teams[0]).toMatchObject({
        teamId: 'team-1',
        role: 'editor',
        reviewGroup: 'isbd',
        namespaces: ['isbd', 'isbdm'],
      });
      expect(user.id).toMatch(/^mock-\d+-[a-z0-9]+$/);
    });

    it('should generate email from name', () => {
      const user = createUser({
        name: 'John Doe Smith',
      });

      expect(user.email).toBe('john.doe.smith@example.com');
    });

    it('should handle special characters in name', () => {
      const user = createUser({
        name: "O'Brien-Smith",
      });

      expect(user.email).toBe("obrien-smith@example.com");
    });

    it('should create unique IDs for each user', async () => {
      const user1 = createUser({ name: 'User 1' });
      
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const user2 = createUser({ name: 'User 2' });

      expect(user1.id).not.toBe(user2.id);
    });

    it('should handle empty roles', () => {
      const user = createUser({
        name: 'No Roles User',
      });

      expect(user.roles.reviewGroups).toEqual([]);
      expect(user.roles.teams).toEqual([]);
      expect(user.roles.translations).toEqual([]);
    });

    it('should handle complex role structure', () => {
      const user = createUser({
        name: 'Complex User',
        systemRole: 'superadmin',
        reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
        teams: [{ 
          teamId: 'team-1', 
          role: 'editor', 
          reviewGroup: 'isbd', 
          namespaces: ['isbd', 'isbdm'] 
        }],
        translations: [{ language: 'fr', namespaces: ['isbd'] }],
      });

      expect(user.roles.systemRole).toBe('superadmin');
      expect(user.roles.reviewGroups).toHaveLength(1);
      expect(user.roles.teams).toHaveLength(1);
      expect(user.roles.translations).toHaveLength(1);
    });
  });

  describe('getUser', () => {
    it('should retrieve an existing user by ID', () => {
      const userData = {
        name: 'Retrievable User',
        roles: ['editor'],
      };

      const createdUser = createUser(userData);
      const retrievedUser = getUser(createdUser.id);

      expect(retrievedUser).toEqual(createdUser);
    });

    it('should return null for non-existent user ID', () => {
      const user = getUser('non-existent-id');

      expect(user).toBeNull();
    });

    it('should return null for invalid ID format', () => {
      const user = getUser('');

      expect(user).toBeNull();
    });

    it('should maintain user data integrity', () => {
      const userData = {
        name: 'Integrity Test User',
        roles: {
          systemRole: undefined,
          reviewGroups: [],
          teams: [],
          translations: [],
        } as UserRoles,
      };

      const createdUser = createUser(userData);
      const retrievedUser = getUser(createdUser.id);

      expect(retrievedUser).toEqual({
        id: createdUser.id,
        name: 'Integrity Test User',
        email: 'integrity.test.user@example.com',
        roles: {
          systemRole: undefined,
          reviewGroups: [],
          teams: [],
          translations: [],
        },
        publicMetadata: {
          systemRole: undefined,
          reviewGroups: [],
          teams: [],
          translations: [],
        },
      });
    });
  });

  describe('Helper Functions', () => {
    it('should create a super admin user', () => {
      const superAdmin = createSuperAdmin('Test Super Admin');

      expect(superAdmin.roles.systemRole).toBe('superadmin');
      expect(superAdmin.name).toBe('Test Super Admin');
    });

    it('should create a review group admin', () => {
      const rgAdmin = createReviewGroupAdmin('ISBD Admin', 'isbd');

      expect(rgAdmin.roles.reviewGroups).toHaveLength(1);
      expect(rgAdmin.roles.reviewGroups[0]).toMatchObject({
        reviewGroupId: 'isbd',
        role: 'admin',
      });
    });

    it('should create a namespace editor', () => {
      const editor = createNamespaceEditor('ISBD Editor', 'team-1', 'isbd', ['isbd', 'isbdm']);

      expect(editor.roles.teams).toHaveLength(1);
      expect(editor.roles.teams[0]).toMatchObject({
        teamId: 'team-1',
        role: 'editor',
        reviewGroup: 'isbd',
        namespaces: ['isbd', 'isbdm'],
      });
    });

    it('should create a namespace author', () => {
      const author = createNamespaceAuthor('ISBD Author', 'team-2', 'isbd', ['isbd']);

      expect(author.roles.teams).toHaveLength(1);
      expect(author.roles.teams[0]).toMatchObject({
        teamId: 'team-2',
        role: 'author',
        reviewGroup: 'isbd',
        namespaces: ['isbd'],
      });
    });

    it('should create a translator', () => {
      const translator = createTranslator('French Translator', 'fr', ['isbd', 'lrm']);

      expect(translator.roles.translations).toHaveLength(1);
      expect(translator.roles.translations[0]).toMatchObject({
        language: 'fr',
        namespaces: ['isbd', 'lrm'],
      });
    });

    it('should create a user with no permissions', () => {
      const unauthorizedUser = createUser({
        name: 'Unauthorized User',
      });

      expect(unauthorizedUser.roles.systemRole).toBeUndefined();
      expect(unauthorizedUser.roles.reviewGroups).toEqual([]);
      expect(unauthorizedUser.roles.teams).toEqual([]);
      expect(unauthorizedUser.roles.translations).toEqual([]);
    });
  });
});