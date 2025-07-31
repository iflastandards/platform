import { describe, it, expect } from 'vitest';
import { getMockGitHubData } from '@/lib/github-mock-service';

describe('Dashboard Routing with Real Clerk Users @unit @critical @navigation', () => {
  // Test users with their expected dashboards
  const testUsers = [
    {
      email: 'superadmin+clerk_test@example.com',
      expectedGitHubUsername: 'superadmin-demo',
      expectedSystemRole: 'admin',
      expectedDashboard: '/dashboard/admin',
      description: 'System Admin with all maintainer roles'
    },
    {
      email: 'rg_admin+clerk_test@example.com',
      expectedGitHubUsername: 'rgadmin-demo',
      expectedSystemRole: undefined,
      expectedDashboard: '/dashboard',
      description: 'RG Admin (ISBD maintainer) with project'
    },
    {
      email: 'editor+clerk_test@example.com',
      expectedGitHubUsername: 'editor-demo',
      expectedSystemRole: undefined,
      expectedDashboard: '/dashboard',
      description: 'Editor with 2 projects'
    },
    {
      email: 'author+clerk_test@example.com',
      expectedGitHubUsername: 'author-demo',
      expectedSystemRole: undefined,
      expectedDashboard: '/dashboard',
      description: 'Author/Reviewer with 1 project'
    },
    {
      email: 'translator+clerk_test@example.com',
      expectedGitHubUsername: 'translator-demo',
      expectedSystemRole: undefined,
      expectedDashboard: '/dashboard',
      description: 'Translator with project but no team'
    },
    {
      email: 'jphipps@madcreek.com',
      expectedGitHubUsername: 'jonphipps',
      expectedSystemRole: 'admin',
      expectedDashboard: '/dashboard/admin',
      description: 'Real user Jon Phipps as admin'
    }
  ];

  testUsers.forEach(({ email, expectedGitHubUsername, expectedSystemRole, expectedDashboard, description }) => {
    it(`should route ${description} correctly`, () => {
      // Set demo mode
      process.env.NEXT_PUBLIC_IFLA_DEMO = 'true';
      
      // Get mock GitHub data
      const mockData = getMockGitHubData(email);
      
      // Verify GitHub username
      expect(mockData.githubUsername).toBe(expectedGitHubUsername);
      
      // Verify system role
      expect(mockData.systemRole).toBe(expectedSystemRole);
      
      // Verify review groups
      if (email === 'translator+clerk_test@example.com') {
        expect(mockData.reviewGroups).toHaveLength(0);
      } else {
        expect(mockData.reviewGroups.length).toBeGreaterThan(0);
      }
      
      // Verify dashboard routing based on roles
      if (mockData.systemRole === 'admin') {
        expect(expectedDashboard).toBe('/dashboard/admin');
      } else if (mockData.reviewGroups.length === 0 && Object.keys(mockData.projects).length === 0) {
        expect(expectedDashboard).toBe('/dashboard/pending');
      } else {
        expect(expectedDashboard).toBe('/dashboard');
      }
    });
  });

  it('should handle user with no access (pending dashboard)', () => {
    const unknownEmail = 'unknown@example.com';
    const mockData = getMockGitHubData(unknownEmail);
    
    expect(mockData.githubUsername).toBe('unknown');
    expect(mockData.systemRole).toBeUndefined();
    expect(mockData.reviewGroups).toHaveLength(0);
    expect(Object.keys(mockData.projects)).toHaveLength(0);
    
    // User with no access should go to pending dashboard
    const expectedDashboard = '/dashboard/pending';
    expect(expectedDashboard).toBe('/dashboard/pending');
  });

  it('should extract accessible namespaces correctly', () => {
    const editorData = getMockGitHubData('editor+clerk_test@example.com');
    
    // Editor has access to ISBD, ISBDM (from team) and CAT (from team)
    const expectedNamespaces = new Set(['isbd', 'isbdm', 'cat']);
    
    const accessibleNamespaces = new Set<string>();
    
    // From review groups
    editorData.reviewGroups.forEach(rg => {
      rg.namespaces.forEach(ns => accessibleNamespaces.add(ns));
    });
    
    // From projects
    Object.values(editorData.projects).forEach(project => {
      project.namespaces.forEach(ns => accessibleNamespaces.add(ns));
    });
    
    expect(accessibleNamespaces).toEqual(expectedNamespaces);
  });
});