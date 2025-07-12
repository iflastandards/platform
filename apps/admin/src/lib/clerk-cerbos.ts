import { auth, currentUser } from '@clerk/nextjs/server';

export interface CerbosUser {
  id: string;
  roles: string[];
  name?: string | null;
  email?: string | null;
  attributes?: {
    rgs?: Record<string, string>;    // Review groups
    sites?: Record<string, string>;   // Site-specific roles
  };
}

export async function getCerbosUser(): Promise<CerbosUser | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // Get the full user object with metadata
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  // Extract roles from Clerk's public metadata
  // You'll need to configure these in Clerk Dashboard
  const publicMetadata = user.publicMetadata as {
    roles?: string[];
    rgs?: Record<string, string>;
    sites?: Record<string, string>;
  };

  return {
    id: userId,
    roles: publicMetadata.roles || [],
    email: user.emailAddresses?.[0]?.emailAddress || null,
    name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null,
    attributes: {
      rgs: publicMetadata.rgs || {},
      sites: publicMetadata.sites || {}
    }
  };
}

// Helper function to check if user has a specific role
export async function userHasRole(role: string): Promise<boolean> {
  const user = await getCerbosUser();
  return user?.roles.includes(role) || false;
}

// Helper function to get user's role for a specific namespace
export async function getUserNamespaceRole(namespace: string): Promise<string | null> {
  const user = await getCerbosUser();
  return user?.attributes?.rgs?.[namespace] || null;
}

// Helper function to get user's role for a specific site
export async function getUserSiteRole(site: string): Promise<string | null> {
  const user = await getCerbosUser();
  return user?.attributes?.sites?.[site] || null;
}