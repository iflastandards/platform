/**
 * Authorization utilities for the IFLA Standards Admin application
 * Simplified version without Cerbos - uses Clerk user metadata for role checking
 */

import { currentUser } from '@clerk/nextjs/server';
import { UserRoles } from './auth';

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

  // Extract structured metadata with proper defaults
  const metadata = user.publicMetadata as any;
  
  const roles: UserRoles = {
    system: metadata?.systemRole, // Maps to system for backward compatibility
    systemRole: metadata?.systemRole,
    reviewGroups: metadata?.reviewGroups || [],
    teams: metadata?.teams || [],
    translations: metadata?.translations || [],
  };

  return {
    userId: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    roles,
  };
}

/**
 * Check if a user can perform an action on a resource
 * Implements proper role-based authorization based on the Cerbos design
 */
export async function canPerformAction<T extends ResourceType>(
  resourceType: T,
  action: Action<T>,
  resourceAttributes?: Record<string, any>
): Promise<boolean> {
  const authContext = await getAuthContext();
  if (!authContext) return false;

  // Superadmins bypass all checks
  if (authContext.roles.system === 'superadmin') return true;

  // Check specific resource type permissions
  switch (resourceType) {
    case 'reviewGroup':
      return checkReviewGroupPermission(authContext, action as Action<'reviewGroup'>, resourceAttributes);
    
    case 'namespace':
      return checkNamespacePermission(authContext, action as Action<'namespace'>, resourceAttributes);
    
    case 'project':
      return checkProjectPermission(authContext, action as Action<'project'>, resourceAttributes);
    
    case 'team':
      return checkTeamPermission(authContext, action as Action<'team'>, resourceAttributes);
    
    case 'elementSet':
    case 'vocabulary':
      return checkContentPermission(authContext, action as Action<'vocabulary'>, resourceAttributes);
    
    case 'translation':
      return checkTranslationPermission(authContext, action as Action<'translation'>, resourceAttributes);
    
    case 'release':
      return checkReleasePermission(authContext, action as Action<'release'>, resourceAttributes);
    
    case 'spreadsheet':
      return checkSpreadsheetPermission(authContext, action as Action<'spreadsheet'>, resourceAttributes);
    
    case 'user':
      return checkUserPermission(authContext, action as Action<'user'>, resourceAttributes);
    
    default:
      // Default to read-only for authenticated users
      return ['read', 'list'].includes(action as string);
  }
}

// Helper functions for specific resource type checks

function checkReviewGroupPermission(
  context: AuthContext,
  action: Action<'reviewGroup'>,
  attributes?: Record<string, any>
): boolean {
  // Review Group Admins can manage their own review groups
  if (attributes?.reviewGroupId) {
    const isRGAdmin = context.roles.reviewGroups.some(
      rg => rg.reviewGroupId === attributes.reviewGroupId && rg.role === 'admin'
    );
    if (isRGAdmin) return true;
  }
  
  // Only superadmins can create new review groups
  if (action === 'create') return false;
  
  // All authenticated users can read/list review groups
  return ['read', 'list'].includes(action);
}

function checkNamespacePermission(
  context: AuthContext,
  action: Action<'namespace'>,
  attributes?: Record<string, any>
): boolean {
  // Review Group Admins can manage namespaces in their review groups
  if (attributes?.reviewGroupId) {
    const isRGAdmin = context.roles.reviewGroups.some(
      rg => rg.reviewGroupId === attributes.reviewGroupId
    );
    if (isRGAdmin) return true;
  }
  
  // Check team-based namespace access
  if (attributes?.namespaceId) {
    const hasAccess = context.roles.teams.some(
      team => team.namespaces.includes(attributes.namespaceId)
    );
    
    if (hasAccess) {
      // Editors can perform most actions
      const isEditor = context.roles.teams.some(
        team => team.namespaces.includes(attributes.namespaceId) && team.role === 'editor'
      );
      
      if (isEditor) {
        return !['delete', 'create'].includes(action); // Editors can't delete or create namespaces
      }
      
      // Authors have limited permissions
      return ['read', 'list'].includes(action);
    }
  }
  
  // Default read access for authenticated users
  return ['read', 'list'].includes(action);
}

function checkProjectPermission(
  context: AuthContext,
  action: Action<'project'>,
  attributes?: Record<string, any>
): boolean {
  // Review Group Admins can manage projects in their review groups
  if (attributes?.reviewGroupId) {
    const isRGAdmin = context.roles.reviewGroups.some(
      rg => rg.reviewGroupId === attributes.reviewGroupId
    );
    if (isRGAdmin) return true;
  }
  
  // Team members can access their projects
  if (attributes?.teamId) {
    const isMember = context.roles.teams.some(
      team => team.teamId === attributes.teamId
    );
    
    if (isMember) {
      return !['delete', 'create', 'assignTeam'].includes(action);
    }
  }
  
  return ['read', 'list'].includes(action);
}

function checkTeamPermission(
  context: AuthContext,
  action: Action<'team'>,
  attributes?: Record<string, any>
): boolean {
  // Review Group Admins can manage teams in their review groups
  if (attributes?.reviewGroupId) {
    const isRGAdmin = context.roles.reviewGroups.some(
      rg => rg.reviewGroupId === attributes.reviewGroupId
    );
    if (isRGAdmin) return true;
  }
  
  // Team members can view their own teams
  if (attributes?.teamId) {
    const isMember = context.roles.teams.some(
      team => team.teamId === attributes.teamId
    );
    
    if (isMember) {
      return ['read', 'listMembers'].includes(action as string);
    }
  }
  
  return ['list', 'read'].includes(action as string);
}

function checkContentPermission(
  context: AuthContext,
  action: Action<'vocabulary'>,
  attributes?: Record<string, any>
): boolean {
  // Check namespace-based access
  if (attributes?.namespaceId) {
    const teamAccess = context.roles.teams.find(
      team => team.namespaces.includes(attributes.namespaceId)
    );
    
    if (teamAccess) {
      // Editors have full content permissions
      if (teamAccess.role === 'editor') return true;
      
      // Authors can create and update
      if (teamAccess.role === 'author') {
        return ['create', 'read', 'update'].includes(action);
      }
    }
    
    // Translators can read content in their namespaces
    const hasTranslationAccess = context.roles.translations.some(
      trans => trans.namespaces.includes(attributes.namespaceId)
    );
    
    if (hasTranslationAccess) {
      return action === 'read';
    }
  }
  
  return action === 'read';
}

function checkTranslationPermission(
  context: AuthContext,
  action: Action<'translation'>,
  attributes?: Record<string, any>
): boolean {
  // Check translation assignments
  if (attributes?.namespaceId && attributes?.language) {
    const hasTranslationRole = context.roles.translations.some(
      trans => trans.language === attributes.language &&
               trans.namespaces.includes(attributes.namespaceId)
    );
    
    if (hasTranslationRole) {
      return ['read', 'update'].includes(action);
    }
  }
  
  // Review Group Admins can approve translations
  if (attributes?.reviewGroupId && action === 'approve') {
    return context.roles.reviewGroups.some(
      rg => rg.reviewGroupId === attributes.reviewGroupId
    );
  }
  
  return action === 'read';
}

function checkReleasePermission(
  context: AuthContext,
  action: Action<'release'>,
  attributes?: Record<string, any>
): boolean {
  // Only Review Group Admins can create/publish releases
  if (['create', 'publish', 'delete'].includes(action)) {
    if (attributes?.reviewGroupId) {
      return context.roles.reviewGroups.some(
        rg => rg.reviewGroupId === attributes.reviewGroupId
      );
    }
    return false;
  }
  
  // Team members can update releases
  if (action === 'update' && attributes?.namespaceId) {
    return context.roles.teams.some(
      team => team.namespaces.includes(attributes.namespaceId) &&
              team.role === 'editor'
    );
  }
  
  return action === 'read';
}

function checkSpreadsheetPermission(
  context: AuthContext,
  action: Action<'spreadsheet'>,
  attributes?: Record<string, any>
): boolean {
  // Check namespace-based access
  if (attributes?.namespaceId) {
    const teamAccess = context.roles.teams.find(
      team => team.namespaces.includes(attributes.namespaceId)
    );
    
    if (teamAccess?.role === 'editor') {
      return true; // Editors have full spreadsheet access
    }
    
    if (teamAccess?.role === 'author') {
      return ['read', 'edit'].includes(action);
    }
  }
  
  return action === 'read';
}

function checkUserPermission(
  context: AuthContext,
  action: Action<'user'>,
  attributes?: Record<string, any>
): boolean {
  // Only Review Group Admins can invite users to their review groups
  if (action === 'invite' && attributes?.reviewGroupId) {
    return context.roles.reviewGroups.some(
      rg => rg.reviewGroupId === attributes.reviewGroupId
    );
  }
  
  // Users can read their own profile
  if (action === 'read' && attributes?.userId === context.userId) {
    return true;
  }
  
  // Users can update their own profile (limited fields)
  if (action === 'update' && attributes?.userId === context.userId) {
    return true;
  }
  
  // Only superadmins can delete or impersonate users
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