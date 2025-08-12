import { auth, currentUser } from '@clerk/nextjs/server';
import { getMockGitHubData } from './github-mock-service';

/**
 * Maps Clerk user metadata to our application's role structure
 * Based on GitHub Teams integration architecture
 */

const isDemo = process.env.IFLA_DEMO === 'true';

export interface ReviewGroup {
  slug: string;
  name: string;
  role: 'maintainer' | 'member';
  namespaces: string[];
}

export interface Project {
  number: number;
  title: string;
  role: 'lead' | 'editor' | 'reviewer' | 'translator';
  namespaces: string[];
  sourceTeam: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string;
  githubUsername?: string;
  systemRole?: 'admin';
  roles?: string[];
  reviewGroups: ReviewGroup[];
  projects: Record<string, Project>;
  isReviewGroupAdmin: boolean;
  accessibleNamespaces: string[];
}

/**
 * Get the current user with GitHub Teams metadata from Clerk
 */
export async function getAppUser(): Promise<AppUser | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  const email = user.emailAddresses?.[0]?.emailAddress || '';
  
  // In demo mode, use mock GitHub data
  if (isDemo) {
    const mockData = getMockGitHubData(email);
    
    return {
      id: userId,
      email,
      name: user.fullName || user.firstName || 'User',
      githubUsername: mockData.githubUsername,
      systemRole: mockData.systemRole,
      reviewGroups: mockData.reviewGroups,
      projects: mockData.projects,
      isReviewGroupAdmin: mockData.reviewGroups.some(rg => rg.role === 'maintainer'),
      accessibleNamespaces: extractAccessibleNamespaces(mockData.reviewGroups, mockData.projects),
    };
  }

  // Production mode - use real GitHub data from Clerk metadata
  const publicMetadata = user.publicMetadata as {
    githubId?: string;
    githubUsername?: string;
    systemRole?: 'admin';
    roles?: string[];
    reviewGroups?: ReviewGroup[];
    isReviewGroupAdmin?: boolean;
    totalActiveProjects?: number;
  };

  const privateMetadata = user.privateMetadata as {
    projects?: Record<string, Project>;
    accessibleNamespaces?: string[];
    lastGitHubSync?: string;
  };

  // SUPERADMIN OVERRIDE: Grant full access to test superadmin email
  const isSuperadminEmail = email === 'superadmin+clerk_test@example.com';
  
  return {
    id: userId,
    email,
    name: user.fullName || user.firstName || 'User',
    githubUsername: publicMetadata.githubUsername,
    systemRole: isSuperadminEmail ? 'admin' : (publicMetadata.roles?.includes('superadmin') ? 'admin' : publicMetadata.systemRole),
    roles: isSuperadminEmail ? ['superadmin'] : (publicMetadata.roles || []),
    reviewGroups: isSuperadminEmail ? 
      [
        { slug: 'isbd-review-group', name: 'ISBD Review Group', role: 'maintainer', namespaces: ['isbd', 'isbdm'] },
        { slug: 'bcm-review-group', name: 'BCM Review Group', role: 'maintainer', namespaces: ['bcm'] },
        { slug: 'cat-review-group', name: 'CAT Review Group', role: 'maintainer', namespaces: ['cat'] },
        { slug: 'unimarc-review-group', name: 'UNIMARC Review Group', role: 'maintainer', namespaces: ['unimarc'] },
      ] : (publicMetadata.reviewGroups || []),
    projects: privateMetadata.projects || {},
    isReviewGroupAdmin: isSuperadminEmail ? true : (publicMetadata.isReviewGroupAdmin || false),
    accessibleNamespaces: isSuperadminEmail ? 
      ['isbd', 'isbdm', 'bcm', 'cat', 'unimarc', 'lrm', 'frbr', 'mri', 'pressoo', 'muldicat'] : 
      (privateMetadata.accessibleNamespaces || []),
  };
}


/**
 * Extract all accessible namespaces from review groups and projects
 */
function extractAccessibleNamespaces(reviewGroups: ReviewGroup[], projects: Record<string, Project>): string[] {
  const namespaces = new Set<string>();
  
  // Add namespaces from review groups
  reviewGroups.forEach(rg => {
    rg.namespaces.forEach(ns => namespaces.add(ns));
  });
  
  // Add namespaces from projects
  Object.values(projects).forEach(project => {
    project.namespaces.forEach(ns => namespaces.add(ns));
  });
  
  return Array.from(namespaces);
}

/**
 * Determine which dashboard the user should see
 */
export function getDashboardRoute(user: AppUser): string {
  // System admin goes to admin dashboard
  if (isSuperAdmin(user)) {
    return '/dashboard/admin';
  }
  
  // Review group admin goes to RG dashboard
  if (user.isReviewGroupAdmin) {
    return '/dashboard/rg';
  }
  
  // Check for project-specific roles
  const projectRoles = Object.values(user.projects);
  
  // Users with lead/editor roles get editor dashboard
  if (projectRoles.some(p => p.role === 'lead' || p.role === 'editor')) {
    return '/dashboard/editor';
  }
  
  // Users with reviewer/translator roles get author dashboard
  if (projectRoles.some(p => p.role === 'reviewer' || p.role === 'translator')) {
    return '/dashboard/author';
  }
  
  // Users with namespace access go to personal dashboard
  if (user.accessibleNamespaces.length > 0) {
    return '/dashboard';
  }
  
  // Users with no access see a waiting page
  return '/dashboard/pending';
}

/**
 * Check if user has a specific role in a review group
 */
export function hasReviewGroupRole(user: AppUser, teamSlug: string, role?: 'maintainer' | 'member'): boolean {
  const rg = user.reviewGroups.find(rg => rg.slug === teamSlug);
  if (!rg) return false;
  
  return role ? rg.role === role : true;
}

/**
 * Check if user has access to a namespace
 */
export function hasNamespaceAccess(user: AppUser, namespace: string): boolean {
  return user.accessibleNamespaces.includes(namespace);
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: AppUser, role: string): boolean {
  return user.roles?.includes(role) || false;
}

/**
 * Check if user is a superadmin (using roles array or legacy systemRole)
 */
export function isSuperAdmin(user: AppUser): boolean {
  return hasRole(user, 'superadmin') || user.systemRole === 'admin';
}

/**
 * Get user's role in a specific namespace
 */
export function getNamespaceRole(user: AppUser, namespace: string): string | null {
  // System admin always has admin role
  if (isSuperAdmin(user)) {
    return 'admin';
  }
  
  // Check if user is maintainer of the review group that owns this namespace
  const reviewGroup = user.reviewGroups.find(rg => 
    rg.namespaces.includes(namespace) && rg.role === 'maintainer'
  );
  
  if (reviewGroup) {
    return 'namespace-admin';
  }
  
  // Check project roles
  for (const project of Object.values(user.projects)) {
    if (project.namespaces.includes(namespace)) {
      return project.role;
    }
  }
  
  // Check if they have member access via review group
  const memberGroup = user.reviewGroups.find(rg => 
    rg.namespaces.includes(namespace) && rg.role === 'member'
  );
  
  if (memberGroup) {
    return 'member';
  }
  
  return null;
}