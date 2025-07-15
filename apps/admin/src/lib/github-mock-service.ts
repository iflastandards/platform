/**
 * Mock GitHub service for demo mode
 * Provides fake GitHub team and project data for real Clerk users
 */

import { ReviewGroup, Project } from './clerk-github-auth';

// Map of email patterns to mock GitHub data
const mockDataByEmail: Record<string, {
  githubUsername: string;
  systemRole?: 'admin';
  reviewGroups: ReviewGroup[];
  projects: Record<string, Project>;
}> = {
  // Superadmin
  'superadmin+clerk_test@example.com': {
    githubUsername: 'superadmin-demo',
    systemRole: 'admin',
    reviewGroups: [
      { slug: 'isbd-review-group', name: 'ISBD Review Group', role: 'maintainer', namespaces: ['isbd', 'isbdm'] },
      { slug: 'bcm-review-group', name: 'BCM Review Group', role: 'maintainer', namespaces: ['bcm'] },
      { slug: 'cat-review-group', name: 'CAT Review Group', role: 'maintainer', namespaces: ['cat'] },
      { slug: 'unimarc-review-group', name: 'UNIMARC Review Group', role: 'maintainer', namespaces: ['unimarc'] },
      { slug: 'subject-analysis-review-group', name: 'Subject Analysis Review Group', role: 'maintainer', namespaces: ['subject'] }
    ],
    projects: {}
  },
  
  // RG Admin
  'rg_admin+clerk_test@example.com': {
    githubUsername: 'rgadmin-demo',
    reviewGroups: [
      { slug: 'isbd-review-group', name: 'ISBD Review Group', role: 'maintainer', namespaces: ['isbd', 'isbdm'] },
      { slug: 'bcm-review-group', name: 'BCM Review Group', role: 'member', namespaces: ['bcm'] }
    ],
    projects: {
      'PVT_123': {
        number: 1,
        title: 'ISBD Consolidation 2025',
        role: 'lead',
        namespaces: ['isbd', 'isbdm'],
        sourceTeam: 'isbd-review-group'
      }
    }
  },
  
  // Editor
  'editor+clerk_test@example.com': {
    githubUsername: 'editor-demo',
    reviewGroups: [
      { slug: 'isbd-review-group', name: 'ISBD Review Group', role: 'member', namespaces: ['isbd', 'isbdm'] },
      { slug: 'cat-review-group', name: 'CAT Review Group', role: 'member', namespaces: ['cat'] }
    ],
    projects: {
      'PVT_123': {
        number: 1,
        title: 'ISBD Consolidation 2025',
        role: 'editor',
        namespaces: ['isbd', 'isbdm'],
        sourceTeam: 'isbd-review-group'
      },
      'PVT_456': {
        number: 2,
        title: 'MulDiCat Enhancement',
        role: 'editor',
        namespaces: ['cat'],
        sourceTeam: 'cat-review-group'
      }
    }
  },
  
  // Author
  'author+clerk_test@example.com': {
    githubUsername: 'author-demo',
    reviewGroups: [
      { slug: 'isbd-review-group', name: 'ISBD Review Group', role: 'member', namespaces: ['isbd'] }
    ],
    projects: {
      'PVT_123': {
        number: 1,
        title: 'ISBD Consolidation 2025',
        role: 'reviewer',
        namespaces: ['isbd'],
        sourceTeam: 'isbd-review-group'
      }
    }
  },
  
  // Translator
  'translator+clerk_test@example.com': {
    githubUsername: 'translator-demo',
    reviewGroups: [], // No team membership
    projects: {
      'PVT_789': {
        number: 3,
        title: 'ISBD French Translation',
        role: 'translator',
        namespaces: ['isbd'],
        sourceTeam: 'isbd-review-group'
      }
    }
  },
  
  // Jon Phipps - real GitHub user
  'jphipps@madcreek.com': {
    githubUsername: 'jonphipps',
    systemRole: 'admin',
    reviewGroups: [
      { slug: 'isbd-review-group', name: 'ISBD Review Group', role: 'maintainer', namespaces: ['isbd', 'isbdm'] },
      { slug: 'bcm-review-group', name: 'BCM Review Group', role: 'maintainer', namespaces: ['bcm'] },
      { slug: 'cat-review-group', name: 'CAT Review Group', role: 'maintainer', namespaces: ['cat'] },
      { slug: 'unimarc-review-group', name: 'UNIMARC Review Group', role: 'maintainer', namespaces: ['unimarc'] },
      { slug: 'subject-analysis-review-group', name: 'Subject Analysis Review Group', role: 'maintainer', namespaces: ['subject'] }
    ],
    projects: {}
  }
};

// Default data for ISBD team members (when you add the 30 members)
const defaultISBDMember = {
  systemRole: undefined as 'admin' | undefined,
  reviewGroups: [
    { slug: 'isbd-review-group', name: 'ISBD Review Group', role: 'member' as const, namespaces: ['isbd'] }
  ],
  projects: {} as Record<string, Project>
};

/**
 * Get mock GitHub data for a user based on their email
 */
export function getMockGitHubData(email: string) {
  // Check for exact match first
  const exactMatch = mockDataByEmail[email];
  if (exactMatch) {
    return exactMatch;
  }
  
  // Generate GitHub username from email
  const username = email.split('@')[0].replace(/[+._]/g, '-').toLowerCase();
  
  // Check if this is an ISBD member (you can add pattern matching here)
  if (email.includes('@library.') || email.includes('@bibliotheque.') || email.includes('@biblioteca.')) {
    return {
      githubUsername: username,
      ...defaultISBDMember
    };
  }
  
  // Default: user with no access
  return {
    githubUsername: username,
    systemRole: undefined,
    reviewGroups: [],
    projects: {}
  };
}

/**
 * Simulate GitHub API call to get user's teams
 */
export async function mockGetUserTeams(githubUsername: string): Promise<ReviewGroup[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Find user by GitHub username
  const userData = Object.values(mockDataByEmail).find(
    data => data.githubUsername === githubUsername
  );
  
  return userData?.reviewGroups || [];
}

/**
 * Simulate GitHub API call to get user's projects
 */
export async function mockGetUserProjects(githubUsername: string): Promise<Record<string, Project>> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Find user by GitHub username
  const userData = Object.values(mockDataByEmail).find(
    data => data.githubUsername === githubUsername
  );
  
  return userData?.projects || {};
}

/**
 * Add or update mock data for a user (useful for testing)
 */
export function addMockUser(email: string, data: typeof mockDataByEmail[string]) {
  mockDataByEmail[email] = data;
}