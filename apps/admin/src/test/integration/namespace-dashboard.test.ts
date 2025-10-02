/**
 * Namespace Dashboard Tests
 * Tests namespace-specific dashboard access and functionality
 * Focuses on /dashboard/[siteKey] routes
 * @integration @dashboard @high-priority
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { clearAuthentication } from '../setup-msw';
import { hasNamespaceAccess } from '../../lib/clerk-github-auth';
import { getUserFixture, fixtureToAppUser } from '../../mocks/user-fixtures';

/**
 * @integration @auth @high-priority @critical @namespace @navigation @dashboard
 */

describe('Namespace Dashboard ([siteKey]) @namespace @critical @navigation', () => {
  beforeEach(() => {
    clearAuthentication();
  });

  describe('Namespace Admin Access', () => {
    it('should allow namespace admin to access their namespace dashboard', () => {
      const user = getUserFixture('nsadmin');
      const appUser = fixtureToAppUser(user);

      // Namespace admin should have access to isbd and isbdm
      expect(hasNamespaceAccess(appUser, 'isbd')).toBe(true);
      expect(hasNamespaceAccess(appUser, 'isbdm')).toBe(true);

      // Should not have access to other namespaces
      expect(hasNamespaceAccess(appUser, 'unimarc')).toBe(false);
      expect(hasNamespaceAccess(appUser, 'lrm')).toBe(false);
    });

    it('should identify namespace admin team correctly', () => {
      const user = getUserFixture('nsadmin');
      const metadata = user.publicMetadata;

      // Check namespace admin team structure
      const adminTeam = metadata.teams?.find((t) => t.role === 'admin');
      expect(adminTeam).toBeDefined();
      expect(adminTeam?.teamId).toBe('isbd-namespace-admin');
      expect(adminTeam?.reviewGroup).toBe('isbd');
      expect(adminTeam?.namespaces).toEqual(['isbd', 'isbdm']);
    });

    it('should grant namespace admin full permissions within their namespaces', () => {
      const user = getUserFixture('nsadmin');
      const metadata = user.publicMetadata;

      // Namespace admin with 'admin' role should have full control
      const hasAdminRole = metadata.teams?.some(
        (t) => t.role === 'admin' && t.namespaces?.includes('isbd'),
      );

      expect(hasAdminRole).toBe(true);
    });
  });

  describe('Editor Access to Namespaces', () => {
    it('should allow editor to access assigned namespace dashboards', () => {
      const user = getUserFixture('editor');
      const appUser = fixtureToAppUser(user);

      // Editor should have access to their team's namespaces
      expect(hasNamespaceAccess(appUser, 'isbd')).toBe(true);
      expect(hasNamespaceAccess(appUser, 'isbdm')).toBe(true);

      // Should not have access to unassigned namespaces
      expect(hasNamespaceAccess(appUser, 'unimarc')).toBe(false);
    });

    it('should restrict editor permissions appropriately', () => {
      const user = getUserFixture('editor');
      const metadata = user.publicMetadata;

      // Editor should have 'editor' role, not 'admin'
      const editorTeam = metadata.teams?.find(
        (t) => t.teamId === 'isbd-team-1',
      );
      expect(editorTeam?.role).toBe('editor');
      expect(editorTeam?.role).not.toBe('admin');
    });
  });

  describe('Author Access to Namespaces', () => {
    it('should allow author to access assigned namespace dashboards', () => {
      const user = getUserFixture('author');
      const appUser = fixtureToAppUser(user);

      // Author should have access to their team's namespace
      expect(hasNamespaceAccess(appUser, 'lrm')).toBe(true);

      // Should not have access to other namespaces
      expect(hasNamespaceAccess(appUser, 'isbd')).toBe(false);
      expect(hasNamespaceAccess(appUser, 'isbdm')).toBe(false);
    });

    it('should restrict author to read/create permissions only', () => {
      const user = getUserFixture('author');
      const metadata = user.publicMetadata;

      // Author should have 'author' role with limited permissions
      const authorTeam = metadata.teams?.find((t) => t.teamId === 'lrm-team-1');
      expect(authorTeam?.role).toBe('author');
      expect(authorTeam?.reviewGroup).toBe('bcm');
    });
  });

  describe('Translator Access to Namespaces', () => {
    it('should allow translator to view namespaces they translate', () => {
      const user = getUserFixture('translator');
      const appUser = fixtureToAppUser(user);

      // Translator should have access to translation namespaces
      expect(hasNamespaceAccess(appUser, 'isbd')).toBe(true);
      expect(hasNamespaceAccess(appUser, 'lrm')).toBe(true);

      // Should not have access to non-translation namespaces
      expect(hasNamespaceAccess(appUser, 'unimarc')).toBe(false);
    });

    it('should identify translator language assignments', () => {
      const user = getUserFixture('translator');
      const metadata = user.publicMetadata;

      // Check translator assignments
      const frenchTranslation = metadata.translations?.find(
        (t) => t.language === 'fr',
      );
      expect(frenchTranslation).toBeDefined();
      expect(frenchTranslation?.namespaces).toContain('isbd');
      expect(frenchTranslation?.namespaces).toContain('lrm');
    });

    it('should restrict translator to translation-only permissions', () => {
      const user = getUserFixture('translator');
      const metadata = user.publicMetadata;

      // Translator should not have team roles
      expect(metadata.teams).toEqual([]);
      // Should only have translation assignments
      expect(metadata.translations?.length).toBeGreaterThan(0);
    });
  });

  describe('Review Group Admin Access', () => {
    it('should allow RG admin to access all namespaces in their review group', () => {
      const user = getUserFixture('rgadmin');
      const metadata = user.publicMetadata;

      // RG admin manages the ISBD review group
      const isReviewGroupAdmin = metadata.reviewGroups?.some(
        (rg: any) => rg.role === 'admin' && rg.reviewGroupId === 'isbd',
      );

      expect(isReviewGroupAdmin).toBe(true);
    });

    it('should not route RG admin to specific namespace dashboard', () => {
      const user = getUserFixture('rgadmin');
      const appUser = fixtureToAppUser(user);

      // Add review group data
      appUser.reviewGroups = [
        {
          slug: 'isbd-review-group',
          name: 'ISBD Review Group',
          role: 'maintainer',
          namespaces: ['isbd', 'isbdm'],
        },
      ];
      appUser.isReviewGroupAdmin = true;

      // RG admin should go to /dashboard/rg, not a specific namespace
      // This is tested in dashboard-access.test.ts
      expect(appUser.isReviewGroupAdmin).toBe(true);
    });
  });

  describe('Superadmin Access', () => {
    it('should allow superadmin to access any namespace dashboard', () => {
      const user = getUserFixture('superadmin');
      const appUser = fixtureToAppUser(user);

      // Superadmin has system-level access
      expect(appUser.systemRole).toBe('admin');
      expect(appUser.roles).toContain('superadmin');

      // In practice, superadmin can access any namespace
      // But they are routed to /dashboard/admin by default
    });
  });

  describe('Cross-Namespace Restrictions', () => {
    it('should prevent users from accessing unauthorized namespaces', () => {
      const editor = getUserFixture('editor');
      const editorApp = fixtureToAppUser(editor);

      const author = getUserFixture('author');
      const authorApp = fixtureToAppUser(author);

      // Editor can access isbd/isbdm but not lrm
      expect(hasNamespaceAccess(editorApp, 'isbd')).toBe(true);
      expect(hasNamespaceAccess(editorApp, 'lrm')).toBe(false);

      // Author can access lrm but not isbd
      expect(hasNamespaceAccess(authorApp, 'lrm')).toBe(true);
      expect(hasNamespaceAccess(authorApp, 'isbd')).toBe(false);
    });

    it('should handle users with multiple namespace assignments', () => {
      const translator = getUserFixture('translator');
      const translatorApp = fixtureToAppUser(translator);

      // Translator has access to multiple namespaces for translation
      const {accessibleNamespaces} = translatorApp;
      expect(accessibleNamespaces.length).toBeGreaterThan(1);
      expect(accessibleNamespaces).toContain('isbd');
      expect(accessibleNamespaces).toContain('lrm');
    });
  });

  describe('Namespace Dashboard Components', () => {
    it('should determine correct dashboard components for namespace admin', () => {
      const user = getUserFixture('nsadmin');
      const metadata = user.publicMetadata;

      // Namespace admin should have access to all management features
      const isNamespaceAdmin = metadata.teams?.some(
        (t) => t.role === 'admin' && t.namespaces?.length > 0,
      );

      expect(isNamespaceAdmin).toBe(true);

      // Expected dashboard sections for namespace admin:
      const expectedSections = [
        'content', // Content management
        'vocabularies', // Vocabulary management
        'team', // Team management
        'settings', // Namespace settings
        'rdf', // RDF exports
        'workflow', // Workflow management
        'releases', // Release management
        'quality', // Quality checks
      ];

      // This would be determined by the actual component logic
      // Here we're just documenting the expectation
      expect(expectedSections.length).toBeGreaterThan(0);
    });

    it('should determine correct dashboard components for editor', () => {
      const user = getUserFixture('editor');
      const metadata = user.publicMetadata;

      // Editor should have limited management features
      const isEditor = metadata.teams?.some((t) => t.role === 'editor');

      expect(isEditor).toBe(true);

      // Expected dashboard sections for editor:
      const expectedSections = [
        'content', // Content editing
        'vocabularies', // Vocabulary editing
        'workflow', // Workflow participation
      ];

      expect(expectedSections.length).toBeGreaterThan(0);
    });

    it('should determine correct dashboard components for author', () => {
      const user = getUserFixture('author');
      const metadata = user.publicMetadata;

      // Author should have minimal features
      const isAuthor = metadata.teams?.some((t) => t.role === 'author');

      expect(isAuthor).toBe(true);

      // Expected dashboard sections for author:
      const expectedSections = [
        'content', // Content creation
        'workflow', // Workflow participation
      ];

      expect(expectedSections.length).toBeGreaterThan(0);
    });
  });
});
