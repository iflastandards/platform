import { currentUser } from '@clerk/nextjs/server';

/**
 * User metadata structure for RBAC
 * Stored in Clerk's publicMetadata for authorization
 */
export interface UserMetadata {
  // System-level role (only for superadmins)
  systemRole?: 'superadmin';
  
  // Review Group administrative roles
  reviewGroups: Array<{
    reviewGroupId: string;
    role: 'admin';
  }>;
  
  // Team memberships with namespace access
  teams: Array<{
    teamId: string;
    role: 'editor' | 'author';
    reviewGroup: string;
    namespaces: string[];
  }>;
  
  // Translation assignments
  translations: Array<{
    language: string;
    namespaces: string[];
  }>;
}

// Alias for backward compatibility
export interface UserRoles extends UserMetadata {
  system?: 'superadmin'; // Alias for systemRole
}

/**
 * Get the current authenticated user with proper RBAC metadata
 * Returns user with roles from Clerk's publicMetadata
 */
export async function getAuthUser() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }
  
  // Extract structured metadata or provide defaults
  const metadata: UserMetadata = {
    systemRole: (user.publicMetadata as any)?.systemRole,
    reviewGroups: (user.publicMetadata as any)?.reviewGroups || [],
    teams: (user.publicMetadata as any)?.teams || [],
    translations: (user.publicMetadata as any)?.translations || []
  };
  
  // Return a properly structured user object
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    imageUrl: user.imageUrl || '',
    metadata: metadata,
    // Legacy roles array for backward compatibility
    roles: extractLegacyRoles(metadata),
  };
}

/**
 * Extract legacy roles array from structured metadata
 * This provides backward compatibility during migration
 */
function extractLegacyRoles(metadata: UserMetadata): string[] {
  const roles: string[] = [];
  
  // Add system role
  if (metadata.systemRole === 'superadmin') {
    roles.push('super-admin', 'admin');
  }
  
  // Add review group admin roles
  if (metadata.reviewGroups.length > 0) {
    roles.push('admin', 'rg-admin');
  }
  
  // Add team-based roles
  metadata.teams.forEach(team => {
    if (team.role === 'editor') {
      roles.push('editor');
    } else if (team.role === 'author') {
      roles.push('author');
    }
  });
  
  // Add translator role
  if (metadata.translations.length > 0) {
    roles.push('translator');
  }
  
  return [...new Set(roles)]; // Remove duplicates
}