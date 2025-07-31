/**
 * Authorization utilities for the IFLA Standards Admin application
 * Simplified version without Cerbos - uses Clerk user metadata for role checking
 */

import { currentUser } from '@clerk/nextjs/server';

// Types for our authorization model
export interface UserRoles {
  system?: 'superadmin';
  reviewGroups: Array<{
    reviewGroupId: string;
    role: 'admin';
  }>;
  teams: Array<{
    teamId: string;
    role: 'editor' | 'author';
    reviewGroup: string;
    namespaces: string[];
  }>;
  translations: Array<{
    language: string;
    namespaces: string[];
  }>;
}

export interface AuthContext {
  userId: string;
  email: string;
  roles: UserRoles;
}

// Resource types for authorization checks
export type ResourceType = 
  | 'reviewGroup'
  | 'namespace'
  | 'project'
  | 'team'
  | 'elementSet'
  | 'vocabulary'
  | 'translation'
  | 'release'
  | 'spreadsheet'
  | 'documentation'
  | 'dctap'
  | 'user';

// Actions for each resource type
export const ACTIONS = {
  reviewGroup: ['create', 'read', 'update', 'delete', 'list', 'manage'] as const,
  namespace: ['create', 'read', 'update', 'delete', 'list'] as const,
  project: ['create', 'read', 'update', 'delete', 'assignTeam', 'assignNamespace'] as const,
  team: ['create', 'read', 'update', 'delete', 'listMembers', 'addMember', 'removeMember', 'updateMemberRole'] as const,
  elementSet: ['create', 'read', 'update', 'delete'] as const,
  vocabulary: ['create', 'read', 'update', 'delete'] as const,
  translation: ['read', 'update', 'approve', 'assignTranslator'] as const,
  release: ['create', 'read', 'update', 'delete', 'publish'] as const,
  spreadsheet: ['read', 'edit', 'import', 'export', 'update'] as const,
  documentation: ['create', 'read', 'update', 'delete'] as const,
  dctap: ['create', 'read', 'update', 'delete', 'export'] as const,
  user: ['invite', 'read', 'update', 'delete', 'impersonate'] as const,
} as const;

export type Action<T extends ResourceType> = typeof ACTIONS[T][number];

/**
 * Get the current user's authorization context
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const user = await currentUser();
  if (!user) return null;

  // Extract roles from Clerk metadata
  const publicMetadata = user.publicMetadata as any;
  
  const roles: UserRoles = {
    system: publicMetadata.systemRole,
    reviewGroups: publicMetadata.reviewGroupAdmin?.map((rgId: string) => ({
      reviewGroupId: rgId,
      role: 'admin' as const,
    })) || [],
    teams: publicMetadata.projectMemberships || [],
    translations: publicMetadata.translations || [],
  };

  return {
    userId: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    roles,
  };
}

/**
 * Check if a user can perform an action on a resource
 * TODO: Implement proper role-based authorization without Cerbos
 * For now, this is a simplified version that checks basic permissions
 */
export async function canPerformAction<T extends ResourceType>(
  resourceType: T,
  action: Action<T>,
  resourceAttributes?: Record<string, any>
): Promise<boolean> {
  const authContext = await getAuthContext();
  if (!authContext) return false;

  // Superadmins can do anything
  if (authContext.roles.system === 'superadmin') return true;

  // TODO: Implement proper permission checking based on resource type and action
  // For now, allow authenticated users to read, but restrict write operations
  const readActions = ['read', 'list'];
  if (readActions.includes(action as string)) {
    return true;
  }

  // Check if user is review group admin
  if (authContext.roles.reviewGroups.length > 0) {
    // Review group admins can manage their review groups
    if (resourceAttributes?.reviewGroupId) {
      return authContext.roles.reviewGroups.some(
        rg => rg.reviewGroupId === resourceAttributes.reviewGroupId
      );
    }
    return true;
  }

  // Check team membership for namespace operations
  if (resourceAttributes?.namespaceId) {
    return authContext.roles.teams.some(team =>
      team.namespaces.includes(resourceAttributes.namespaceId)
    );
  }

  // Default deny
  return false;
}

/**
 * Authorization guards for common operations
 */
export const auth = {
  // Review Group operations
  async canCreateReviewGroup(): Promise<boolean> {
    return canPerformAction('reviewGroup', 'create');
  },

  async canManageReviewGroup(reviewGroupId: string): Promise<boolean> {
    return canPerformAction('reviewGroup', 'update', { reviewGroupId });
  },

  // Namespace operations
  async canCreateNamespace(reviewGroupId: string): Promise<boolean> {
    return canPerformAction('namespace', 'create', { reviewGroupId });
  },

  async canEditNamespace(namespaceId: string, reviewGroupId: string): Promise<boolean> {
    return canPerformAction('namespace', 'update', { namespaceId, reviewGroupId });
  },

  // Project operations
  async canCreateProject(reviewGroupId: string): Promise<boolean> {
    return canPerformAction('project', 'create', { reviewGroupId });
  },

  async canManageProject(projectId: string, reviewGroupId: string): Promise<boolean> {
    return canPerformAction('project', 'update', { projectId, reviewGroupId });
  },

  // Team operations
  async canManageTeam(teamId: string, reviewGroupId: string): Promise<boolean> {
    return canPerformAction('team', 'update', { teamId, reviewGroupId });
  },

  async canAddTeamMember(teamId: string, reviewGroupId: string): Promise<boolean> {
    return canPerformAction('team', 'addMember', { teamId, reviewGroupId });
  },

  // Content operations
  async canEditElementSet(elementSetId: string, namespaceId: string): Promise<boolean> {
    return canPerformAction('elementSet', 'update', { elementSetId, namespaceId });
  },

  async canEditVocabulary(vocabularyId: string, namespaceId: string): Promise<boolean> {
    return canPerformAction('vocabulary', 'update', { vocabularyId, namespaceId });
  },

  // Translation operations
  async canTranslate(language: string, namespaceId: string): Promise<boolean> {
    return canPerformAction('translation', 'update', { language, namespaceId });
  },

  async canApproveTranslation(translationId: string, namespaceId: string): Promise<boolean> {
    return canPerformAction('translation', 'approve', { translationId, namespaceId });
  },

  // Release operations
  async canCreateRelease(namespaceId: string): Promise<boolean> {
    return canPerformAction('release', 'create', { namespaceId });
  },

  async canPublishRelease(releaseId: string, namespaceId: string): Promise<boolean> {
    return canPerformAction('release', 'publish', { releaseId, namespaceId });
  },

  // Spreadsheet operations
  async canEditSpreadsheet(spreadsheetId: string, namespaceId: string): Promise<boolean> {
    return canPerformAction('spreadsheet', 'edit', { spreadsheetId, namespaceId });
  },

  async canImportSpreadsheet(namespaceId: string): Promise<boolean> {
    return canPerformAction('spreadsheet', 'import', { namespaceId });
  },

  // Documentation operations
  async canEditDocumentation(docId: string, namespaceId: string): Promise<boolean> {
    return canPerformAction('documentation', 'update', { docId, namespaceId });
  },

  // User operations
  async canInviteUser(reviewGroupId: string): Promise<boolean> {
    return canPerformAction('user', 'invite', { reviewGroupId });
  },

  async canManageUser(userId: string): Promise<boolean> {
    return canPerformAction('user', 'update', { userId });
  },
};

/**
 * Get user's accessible resources
 */
export async function getUserAccessibleResources() {
  const authContext = await getAuthContext();
  if (!authContext) return null;

  // For superadmins, return everything
  if (authContext.roles.system === 'superadmin') {
    return {
      reviewGroups: 'all',
      namespaces: 'all',
      projects: 'all',
      teams: 'all',
    };
  }

  // Build accessible resources based on roles
  const accessible = {
    reviewGroups: authContext.roles.reviewGroups.map(rg => rg.reviewGroupId),
    namespaces: new Set<string>(),
    projects: new Set<string>(),
    teams: authContext.roles.teams.map(t => t.teamId),
  };

  // Add namespaces from teams
  authContext.roles.teams.forEach(team => {
    team.namespaces.forEach(ns => accessible.namespaces.add(ns));
  });

  // Add namespaces from translations
  authContext.roles.translations.forEach(trans => {
    trans.namespaces.forEach(ns => accessible.namespaces.add(ns));
  });

  return {
    reviewGroups: accessible.reviewGroups,
    namespaces: Array.from(accessible.namespaces),
    projects: Array.from(accessible.projects),
    teams: accessible.teams,
  };
}

/**
 * Middleware to check authorization in API routes
 */
export function requireAuth<T extends ResourceType>(
  resourceType: T,
  action: Action<T>,
  getResourceAttributes?: (req: Request) => Record<string, any>
) {
  return async (req: Request) => {
    const attributes = getResourceAttributes ? getResourceAttributes(req) : {};
    const allowed = await canPerformAction(resourceType, action, attributes);
    
    if (!allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'PERMISSION_DENIED',
            message: `You don't have permission to ${action} ${resourceType}`,
          },
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}