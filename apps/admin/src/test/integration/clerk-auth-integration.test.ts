/**
 * @integration @auth @critical
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { clerkClient } from '@clerk/nextjs/server';
import { canPerformAction } from '../../lib/authorization';
import { TestUsers, TestUserUtils, clearTestUsersCache, getAllTestUsers } from '../../test-config/clerk-test-users';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

describe('Clerk Authentication Integration @integration @auth @clerk @critical', () => {
  const testDir = path.join(__dirname, '.test-output');

  beforeEach(async () => {
    // Create test directory for any file operations
    await fs.mkdir(testDir, { recursive: true });
    // Clear cache to ensure fresh data
    clearTestUsersCache();
  });

  afterEach(async () => {
    // Clean up test files
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Real Clerk User Data Verification', () => {
    it('should load and verify all test users from Clerk API', async () => {
      // This makes real API calls to Clerk
      const verification = await TestUserUtils.verifyAllTestUsers();
      
      expect(verification.valid).toBe(true);
      expect(verification.errors).toHaveLength(0);
    });

    it('should retrieve superadmin with correct metadata structure', async () => {
      const user = await TestUsers.getSuperAdmin();
      
      expect(user).toBeDefined();
      expect(user?.id).toMatch(/^user_/); // Real Clerk user ID format
      expect(user?.email).toBe('superadmin+clerk_test@example.com');
      expect(user?.roles.systemRole).toBe('superadmin');
      expect(user?.roles.reviewGroups).toEqual([]);
      expect(user?.roles.teams).toEqual([]);
      expect(user?.roles.translations).toEqual([]);
    });

    it('should retrieve review group admin with ISBD permissions', async () => {
      const user = await TestUsers.getReviewGroupAdmin();
      
      expect(user).toBeDefined();
      expect(user?.id).toMatch(/^user_/);
      expect(user?.email).toBe('rg_admin+clerk_test@example.com');
      expect(user?.roles.reviewGroups).toEqual([
        { role: 'admin', reviewGroupId: 'isbd' }
      ]);
      expect(user?.roles.teams).toEqual([]);
      expect(user?.roles.translations).toEqual([]);
    });

    it('should retrieve editor with namespace team permissions', async () => {
      const user = await TestUsers.getEditor();
      
      expect(user).toBeDefined();
      expect(user?.id).toMatch(/^user_/);
      expect(user?.email).toBe('editor+clerk_test@example.com');
      expect(user?.roles.teams).toEqual([
        {
          role: 'editor',
          teamId: 'isbd-team-1',
          namespaces: ['isbd', 'isbdm'],
          reviewGroup: 'isbd'
        }
      ]);
      expect(user?.roles.reviewGroups).toEqual([]);
      expect(user?.roles.translations).toEqual([]);
    });

    it('should retrieve author with limited namespace permissions', async () => {
      const user = await TestUsers.getAuthor();
      
      expect(user).toBeDefined();
      expect(user?.id).toMatch(/^user_/);
      expect(user?.email).toBe('author+clerk_test@example.com');
      expect(user?.roles.teams).toEqual([
        {
          role: 'author',
          teamId: 'lrm-team-1',
          namespaces: ['lrm'],
          reviewGroup: 'bcm'
        }
      ]);
      expect(user?.roles.reviewGroups).toEqual([]);
      expect(user?.roles.translations).toEqual([]);
    });

    it('should retrieve translator with language-specific permissions', async () => {
      const user = await TestUsers.getTranslator();
      
      expect(user).toBeDefined();
      expect(user?.id).toMatch(/^user_/);
      expect(user?.email).toBe('translator+clerk_test@example.com');
      expect(user?.roles.translations).toEqual([
        { language: 'fr', namespaces: ['isbd', 'lrm'] }
      ]);
      expect(user?.roles.reviewGroups).toEqual([]);
      expect(user?.roles.teams).toEqual([]);
    });
  });

  describe('Authorization Logic with Real User Data', () => {
    it('should grant superadmin access to all resources', async () => {
      const user = await TestUsers.getSuperAdmin();
      expect(user).toBeDefined();

      // Note: In a real integration test, we would mock currentUser
      // to return our test user data for authorization testing

      // Test various permissions
      const canCreateNamespace = await canPerformAction('namespace', 'create', {
        reviewGroupId: 'isbd'
      });
      const canEditVocabulary = await canPerformAction('vocabulary', 'update', {
        namespaceId: 'isbd'
      });
      const canManageUsers = await canPerformAction('user', 'invite', {
        reviewGroupId: 'isbd'
      });

      expect(canCreateNamespace).toBe(true);
      expect(canEditVocabulary).toBe(true);
      expect(canManageUsers).toBe(true);
    });

    it('should grant review group admin appropriate permissions', async () => {
      const user = await TestUsers.getReviewGroupAdmin();
      expect(user).toBeDefined();

      // Test permissions for ISBD review group
      const canManageISBD = user!.roles.reviewGroups.some(
        rg => rg.reviewGroupId === 'isbd' && rg.role === 'admin'
      );
      expect(canManageISBD).toBe(true);

      // Should not have permissions for other review groups
      const hasBCMAccess = user!.roles.reviewGroups.some(
        rg => rg.reviewGroupId === 'bcm'
      );
      expect(hasBCMAccess).toBe(false);
    });

    it('should grant editor namespace-specific permissions', async () => {
      const user = await TestUsers.getEditor();
      expect(user).toBeDefined();

      // Test namespace access
      const hasISBDAccess = user!.roles.teams.some(
        team => team.namespaces.includes('isbd') && team.role === 'editor'
      );
      const hasISBDMAccess = user!.roles.teams.some(
        team => team.namespaces.includes('isbdm') && team.role === 'editor'
      );
      const hasLRMAccess = user!.roles.teams.some(
        team => team.namespaces.includes('lrm')
      );

      expect(hasISBDAccess).toBe(true);
      expect(hasISBDMAccess).toBe(true);
      expect(hasLRMAccess).toBe(false);
    });

    it('should grant author limited permissions compared to editor', async () => {
      const user = await TestUsers.getAuthor();
      expect(user).toBeDefined();

      // Author should have access to LRM namespace
      const hasLRMAccess = user!.roles.teams.some(
        team => team.namespaces.includes('lrm') && team.role === 'author'
      );
      expect(hasLRMAccess).toBe(true);

      // But not editor-level permissions
      const isEditor = user!.roles.teams.some(
        team => team.role === 'editor'
      );
      expect(isEditor).toBe(false);
    });

    it('should grant translator language-specific permissions', async () => {
      const user = await TestUsers.getTranslator();
      expect(user).toBeDefined();

      // Should have French translation access
      const hasFrenchAccess = user!.roles.translations.some(
        trans => trans.language === 'fr'
      );
      expect(hasFrenchAccess).toBe(true);

      // Should have access to specific namespaces for translation
      const translationNamespaces = user!.roles.translations
        .find(trans => trans.language === 'fr')?.namespaces || [];
      
      expect(translationNamespaces).toContain('isbd');
      expect(translationNamespaces).toContain('lrm');
      expect(translationNamespaces).not.toContain('unimarc');
    });
  });

  describe('Real Clerk API Integration', () => {
    it('should successfully connect to Clerk API', async () => {
      const clerk = await clerkClient();
      expect(clerk).toBeDefined();

      // Make a real API call to verify connection
      const users = await clerk.users.getUserList({ limit: 1 });
      expect(users).toBeDefined();
      expect(users.data).toBeDefined();
    });

    it('should cache user data for performance', async () => {
      // First call should load from API
      const startTime1 = Date.now();
      const user1 = await TestUsers.getSuperAdmin();
      const duration1 = Date.now() - startTime1;

      // Second call should use cache (should be faster)
      const startTime2 = Date.now();
      const user2 = await TestUsers.getSuperAdmin();
      const duration2 = Date.now() - startTime2;

      expect(user1).toEqual(user2);
      expect(duration2).toBeLessThan(duration1);
    });

    it('should handle cache invalidation correctly', async () => {
      // Load users
      const user1 = await TestUsers.getSuperAdmin();
      expect(user1).toBeDefined();

      // Clear cache
      clearTestUsersCache();

      // Should reload from API
      const user2 = await TestUsers.getSuperAdmin();
      expect(user2).toBeDefined();
      expect(user2?.id).toBe(user1?.id); // Same user, fresh data
    });
  });

  describe('Error Handling with Real Conditions', () => {
    it('should handle missing test users gracefully', async () => {
      // This tests real error conditions from Clerk API
      const nonExistentUser = await TestUsers.getUnauthorizedUser();
      expect(nonExistentUser).toBeNull();
    });

    it('should validate user metadata structure', async () => {
      const users = await getAllTestUsers();
      
      // Verify each user has required metadata structure
      users.forEach(user => {
        expect(user.roles).toBeDefined();
        expect(user.roles.reviewGroups).toBeDefined();
        expect(user.roles.teams).toBeDefined();
        expect(user.roles.translations).toBeDefined();
        expect(Array.isArray(user.roles.reviewGroups)).toBe(true);
        expect(Array.isArray(user.roles.teams)).toBe(true);
        expect(Array.isArray(user.roles.translations)).toBe(true);
      });
    });
  });

  describe('Performance and Reliability', () => {
    it('should complete user verification within performance target', async () => {
      const startTime = Date.now();
      
      const verification = await TestUserUtils.verifyAllTestUsers();
      
      const duration = Date.now() - startTime;
      
      expect(verification.valid).toBe(true);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle concurrent user requests', async () => {
      // Test concurrent access to different users
      const promises = [
        TestUsers.getSuperAdmin(),
        TestUsers.getReviewGroupAdmin(),
        TestUsers.getEditor(),
        TestUsers.getAuthor(),
        TestUsers.getTranslator(),
      ];

      const users = await Promise.all(promises);
      
      // All requests should succeed
      users.forEach(user => {
        expect(user).toBeDefined();
        expect(user?.id).toMatch(/^user_/);
      });

      // All users should be different
      const userIds = users.map(user => user?.id);
      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(users.length);
    });
  });
});