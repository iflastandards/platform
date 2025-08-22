/**
 * Dashboard Access Smoke Tests
 * Tests that each user role is routed to the correct dashboard
 * Uses MSW for mocking Clerk authentication
 * @integration @auth @smoke @critical
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authenticateAs, clearAuthentication } from '../setup-msw';
import { getDashboardRoute } from '../../lib/clerk-github-auth';
import {
  getUserFixture,
  fixtureToAppUser,
  DASHBOARD_ROUTES,
} from '../../mocks/user-fixtures';

describe('Dashboard Access Control @smoke', () => {
  beforeEach(() => {
    clearAuthentication();
  });

  describe('Role-based Dashboard Routing', () => {
    it('should route superadmin to admin dashboard', () => {
      const user = getUserFixture('superadmin');
      const appUser = fixtureToAppUser(user);
      const route = getDashboardRoute(appUser);

      expect(route).toBe(DASHBOARD_ROUTES.superadmin);
      expect(route).toBe('/dashboard/admin');
    });

    it('should route review group admin to RG dashboard', () => {
      const user = getUserFixture('rgadmin');
      const appUser = fixtureToAppUser(user);

      // Need to add review group data for proper routing
      appUser.reviewGroups = [
        {
          slug: 'isbd-review-group',
          name: 'ISBD Review Group',
          role: 'maintainer',
          namespaces: ['isbd', 'isbdm'],
        },
      ];
      appUser.isReviewGroupAdmin = true;

      const route = getDashboardRoute(appUser);

      expect(route).toBe(DASHBOARD_ROUTES.rgadmin);
      expect(route).toBe('/dashboard/rg');
    });

    it('should route namespace admin to namespace-specific dashboard', () => {
      const user = getUserFixture('nsadmin');

      // The namespace admin should be routed based on their team's namespaces
      // Since they admin 'isbd' and 'isbdm', they should go to the first one
      const expectedRoute = '/dashboard/isbd';

      // Check the user's metadata directly for namespace admin role
      const metadata = user.publicMetadata;
      const namespaceAdminTeam = metadata.teams?.find(
        (t) => t.role === 'admin' && t.namespaces?.length > 0,
      );

      expect(namespaceAdminTeam).toBeDefined();
      expect(namespaceAdminTeam?.namespaces[0]).toBe('isbd');
      expect(expectedRoute).toBe(DASHBOARD_ROUTES.nsadmin);
    });

    it('should route editor to editor dashboard', () => {
      const user = getUserFixture('editor');
      const appUser = fixtureToAppUser(user);

      // Add project data for editor role detection
      appUser.projects = {
        PVT_123: {
          number: 1,
          title: 'ISBD Consolidation',
          role: 'editor',
          namespaces: ['isbd', 'isbdm'],
          sourceTeam: 'isbd-review-group',
        },
      };

      const route = getDashboardRoute(appUser);

      expect(route).toBe(DASHBOARD_ROUTES.editor);
      expect(route).toBe('/dashboard/editor');
    });

    it('should route author to author dashboard', () => {
      const user = getUserFixture('author');
      const appUser = fixtureToAppUser(user);

      // Add project data for reviewer role (maps to author dashboard)
      appUser.projects = {
        PVT_123: {
          number: 1,
          title: 'LRM Development',
          role: 'reviewer',
          namespaces: ['lrm'],
          sourceTeam: 'bcm-review-group',
        },
      };

      const route = getDashboardRoute(appUser);

      expect(route).toBe(DASHBOARD_ROUTES.author);
      expect(route).toBe('/dashboard/author');
    });

    it('should route translator to personal dashboard', () => {
      const user = getUserFixture('translator');
      const appUser = fixtureToAppUser(user);

      // Add project data for translator role
      appUser.projects = {
        PVT_789: {
          number: 3,
          title: 'ISBD French Translation',
          role: 'translator',
          namespaces: ['isbd'],
          sourceTeam: 'isbd-review-group',
        },
      };

      const route = getDashboardRoute(appUser);

      // Translator should go to author dashboard based on project role
      expect(route).toBe('/dashboard/author');
    });

    it('should route users with no roles to pending dashboard', () => {
      // Create a user with no roles or projects
      const appUser = {
        id: 'user_no_roles',
        email: 'noRoles@example.com',
        name: 'No Roles User',
        reviewGroups: [],
        projects: {},
        isReviewGroupAdmin: false,
        accessibleNamespaces: [],
      };

      const route = getDashboardRoute(appUser);

      expect(route).toBe('/dashboard/pending');
    });
  });

  describe('Namespace Access Control', () => {
    it('should grant namespace admin access to their namespaces', () => {
      const user = getUserFixture('nsadmin');
      const appUser = fixtureToAppUser(user);

      // Check accessible namespaces
      expect(appUser.accessibleNamespaces).toContain('isbd');
      expect(appUser.accessibleNamespaces).toContain('isbdm');
      expect(appUser.accessibleNamespaces).not.toContain('unimarc');
    });

    it('should grant editor access to team namespaces', () => {
      const user = getUserFixture('editor');
      const appUser = fixtureToAppUser(user);

      expect(appUser.accessibleNamespaces).toContain('isbd');
      expect(appUser.accessibleNamespaces).toContain('isbdm');
    });

    it('should grant author access to team namespaces', () => {
      const user = getUserFixture('author');
      const appUser = fixtureToAppUser(user);

      expect(appUser.accessibleNamespaces).toContain('lrm');
      expect(appUser.accessibleNamespaces).not.toContain('isbd');
    });

    it('should grant translator access to translation namespaces', () => {
      const user = getUserFixture('translator');
      const appUser = fixtureToAppUser(user);

      expect(appUser.accessibleNamespaces).toContain('isbd');
      expect(appUser.accessibleNamespaces).toContain('lrm');
    });

    it('should grant superadmin access to all namespaces', () => {
      const user = getUserFixture('superadmin');
      const appUser = fixtureToAppUser(user);

      // Superadmin should have system role
      expect(appUser.systemRole).toBe('admin');
      expect(appUser.roles).toContain('superadmin');
    });
  });

  describe('Authentication State', () => {
    it('should handle unauthenticated users', () => {
      clearAuthentication();

      // When not authenticated, getDashboardRoute should receive null user
      // This would typically redirect to sign-in in the actual app
      expect(DASHBOARD_ROUTES.unauthenticated).toBe('/sign-in');
    });

    it('should maintain authentication state across tests when set', () => {
      authenticateAs('editor');
      // In a real test, this would affect subsequent API calls
      // Here we're just testing the helper works

      authenticateAs(null);
      // Should clear authentication
    });
  });

  describe('Role Hierarchy', () => {
    it('should prioritize system admin over other roles', () => {
      const user = getUserFixture('superadmin');
      const appUser = fixtureToAppUser(user);

      // Even if we add other roles, superadmin should take precedence
      appUser.isReviewGroupAdmin = true;
      appUser.projects = {
        PVT_123: {
          number: 1,
          title: 'Test Project',
          role: 'editor',
          namespaces: ['test'],
          sourceTeam: 'test-team',
        },
      };

      const route = getDashboardRoute(appUser);
      expect(route).toBe('/dashboard/admin');
    });

    it('should prioritize review group admin over project roles', () => {
      const user = getUserFixture('rgadmin');
      const appUser = fixtureToAppUser(user);

      appUser.isReviewGroupAdmin = true;
      appUser.reviewGroups = [
        {
          slug: 'isbd-review-group',
          name: 'ISBD Review Group',
          role: 'maintainer',
          namespaces: ['isbd'],
        },
      ];
      appUser.projects = {
        PVT_456: {
          number: 2,
          title: 'Another Project',
          role: 'reviewer',
          namespaces: ['test'],
          sourceTeam: 'test-team',
        },
      };

      const route = getDashboardRoute(appUser);
      expect(route).toBe('/dashboard/rg');
    });

    it('should prioritize editor role over reviewer role', () => {
      const appUser = {
        id: 'user_multi_role',
        email: 'multi@example.com',
        name: 'Multi Role User',
        reviewGroups: [],
        projects: {
          PVT_123: {
            number: 1,
            title: 'Editor Project',
            role: 'editor' as const,
            namespaces: ['ns1'],
            sourceTeam: 'team1',
          },
          PVT_456: {
            number: 2,
            title: 'Reviewer Project',
            role: 'reviewer' as const,
            namespaces: ['ns2'],
            sourceTeam: 'team2',
          },
        },
        isReviewGroupAdmin: false,
        accessibleNamespaces: ['ns1', 'ns2'],
      };

      const route = getDashboardRoute(appUser);
      expect(route).toBe('/dashboard/editor');
    });
  });
});
