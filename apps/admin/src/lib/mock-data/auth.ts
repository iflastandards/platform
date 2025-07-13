// Mock Clerk-like user sessions
export interface MockUser {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  publicMetadata: {
    iflaRole?: 'member' | 'staff' | 'admin';
    reviewGroupAdmin?: string[];
    externalContributor: boolean;
  };
  privateMetadata: {
    projectMemberships: {
      projectId: string;
      projectName: string;
      role: 'editor' | 'reviewer' | 'translator';
      reviewGroup: string;
      namespaces: string[];
    }[];
  };
}

// Mock users focused on ISBD namespace for testing role-based features
export const mockUsers: MockUser[] = [
  {
    id: 'user-admin-1',
    email: 'admin@ifla.org',
    name: 'Sarah Administrator',
    imageUrl: 'https://i.pravatar.cc/150?u=admin@ifla.org',
    publicMetadata: {
      iflaRole: 'admin',
      reviewGroupAdmin: ['isbd', 'bcm', 'cat', 'unimarc'],
      externalContributor: false,
    },
    privateMetadata: {
      projectMemberships: [],
    },
  },
  {
    id: 'user-isbd-rg-admin',
    email: 'elena.rodriguez@library.org',
    name: 'Dr. Elena Rodriguez',
    imageUrl: 'https://i.pravatar.cc/150?u=elena.rodriguez@library.org',
    publicMetadata: {
      iflaRole: 'member',
      reviewGroupAdmin: ['isbd'],
      externalContributor: false,
    },
    privateMetadata: {
      projectMemberships: [
        {
          projectId: 'proj-isbd-2025',
          projectName: 'ISBD Consolidation 2025',
          role: 'editor',
          reviewGroup: 'isbd',
          namespaces: ['isbd', 'isbdm'],
        },
      ],
    },
  },
  {
    id: 'user-isbd-editor',
    email: 'maria.editor@library.org',
    name: 'Maria Editor',
    imageUrl: 'https://i.pravatar.cc/150?u=maria.editor@library.org',
    publicMetadata: {
      iflaRole: 'member',
      externalContributor: false,
    },
    privateMetadata: {
      projectMemberships: [
        {
          projectId: 'proj-isbd-2025',
          projectName: 'ISBD Consolidation 2025',
          role: 'editor',
          reviewGroup: 'isbd',
          namespaces: ['isbd', 'isbdm'],
        },
      ],
    },
  },
  {
    id: 'user-isbd-reviewer',
    email: 'john.smith@university.edu',
    name: 'John Smith',
    imageUrl: 'https://i.pravatar.cc/150?u=john.smith@university.edu',
    publicMetadata: {
      iflaRole: 'member',
      externalContributor: true,
    },
    privateMetadata: {
      projectMemberships: [
        {
          projectId: 'proj-isbd-2025',
          projectName: 'ISBD Consolidation 2025',
          role: 'reviewer',
          reviewGroup: 'isbd',
          namespaces: ['isbd'],
        },
      ],
    },
  },
  {
    id: 'user-isbd-translator',
    email: 'pierre.translator@bibliotheque.fr',
    name: 'Pierre Translator',
    imageUrl: 'https://i.pravatar.cc/150?u=pierre.translator@bibliotheque.fr',
    publicMetadata: {
      iflaRole: 'member',
      externalContributor: true,
    },
    privateMetadata: {
      projectMemberships: [
        {
          projectId: 'proj-isbd-fr-translation',
          projectName: 'ISBD French Translation 2025',
          role: 'translator',
          reviewGroup: 'isbd',
          namespaces: ['isbd'],
        },
      ],
    },
  },
  {
    id: 'user-regular-member',
    email: 'regular.member@library.org',
    name: 'Regular Member',
    imageUrl: 'https://i.pravatar.cc/150?u=regular.member@library.org',
    publicMetadata: {
      iflaRole: 'member',
      externalContributor: false,
    },
    privateMetadata: {
      projectMemberships: [],
    },
  },
];

// Mock session helper
export function getMockSession(userId?: string) {
  const user = userId 
    ? mockUsers.find(u => u.id === userId) 
    : mockUsers[0]; // Default to admin
  
  if (!user) return null;

  return {
    user,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    accessToken: `mock-token-${user.id}`,
  };
}

// Helper to get user's accessible namespaces
export function getUserNamespaces(user: MockUser): string[] {
  const namespaces = new Set<string>();
  
  // Admin has access to all
  if (user.publicMetadata.iflaRole === 'admin') {
    return ['isbd', 'isbdm', 'lrm', 'frbr', 'muldicat', 'unimarc'];
  }
  
  // Review group admins have access to their groups' namespaces
  if (user.publicMetadata.reviewGroupAdmin?.length) {
    user.publicMetadata.reviewGroupAdmin.forEach(group => {
      switch (group) {
        case 'isbd':
          namespaces.add('isbd');
          namespaces.add('isbdm');
          break;
        case 'bcm':
          namespaces.add('lrm');
          namespaces.add('frbr');
          break;
        case 'cat':
          namespaces.add('muldicat');
          break;
        case 'unimarc':
          namespaces.add('unimarc');
          break;
      }
    });
  }
  
  // Project members have access to their assigned namespaces
  user.privateMetadata.projectMemberships.forEach(membership => {
    membership.namespaces.forEach(ns => namespaces.add(ns));
  });
  
  return Array.from(namespaces);
}

// Helper to get user's role in a namespace
export function getUserRoleInNamespace(user: MockUser, namespace: string): string | null {
  // Admin always has admin role
  if (user.publicMetadata.iflaRole === 'admin') {
    return 'admin';
  }
  
  // Check review group admin
  const namespaceToGroup: Record<string, string> = {
    'isbd': 'isbd',
    'isbdm': 'isbd',
    'lrm': 'bcm',
    'frbr': 'bcm',
    'muldicat': 'cat',
    'unimarc': 'unimarc',
  };
  
  const reviewGroup = namespaceToGroup[namespace];
  if (user.publicMetadata.reviewGroupAdmin?.includes(reviewGroup)) {
    return 'namespace-admin';
  }
  
  // Check project memberships
  for (const membership of user.privateMetadata.projectMemberships) {
    if (membership.namespaces.includes(namespace)) {
      return membership.role;
    }
  }
  
  return null;
}