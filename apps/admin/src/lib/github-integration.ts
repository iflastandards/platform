/**
 * GitHub integration utilities for authentication and organization management
 */

import { clerkClient } from '@clerk/nextjs/server';

interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  email: string | null;
}

interface GitHubOrg {
  login: string;
  id: number;
  role?: string;
}

interface GitHubOrgMembership {
  organization: {
    login: string;
    id: number;
  };
  role: string;
}

/**
 * Check if a user is an owner of the iflastandards organization
 */
export async function checkIflaOrganizationOwnership(accessToken: string): Promise<boolean> {
  try {
    // Check organization membership with role
    const response = await fetch('https://api.github.com/user/memberships/orgs/iflastandards', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.error('Failed to check organization membership:', response.status);
      return false;
    }

    const membership: GitHubOrgMembership = await response.json();
    
    // Check if user is an admin (owner) of the organization
    return membership.role === 'admin';
  } catch (error) {
    console.error('Error checking organization ownership:', error);
    return false;
  }
}

/**
 * Get user's GitHub profile information
 */
export async function getGitHubUserProfile(accessToken: string): Promise<GitHubUser | null> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch GitHub user profile:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub user profile:', error);
    return null;
  }
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(accessToken: string): Promise<GitHubOrg[]> {
  try {
    const response = await fetch('https://api.github.com/user/orgs', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch user organizations:', response.status);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return [];
  }
}

/**
 * Sync GitHub profile data with Clerk user
 */
interface ClerkUpdateData {
  publicMetadata?: Record<string, unknown>;
  profileImageUrl?: string;
  firstName?: string;
  lastName?: string;
}

export async function syncGitHubProfileWithClerk(
  clerkUserId: string,
  githubProfile: GitHubUser,
  isOrgOwner: boolean
) {
  try {
    const updateData: ClerkUpdateData = {
      publicMetadata: {
        githubUsername: githubProfile.login,
        githubId: githubProfile.id,
      },
    };

    // Update avatar if available
    if (githubProfile.avatar_url) {
      updateData.profileImageUrl = githubProfile.avatar_url;
    }

    // Update name if available and not already set
    if (githubProfile.name) {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      if (!user.firstName && !user.lastName) {
        const nameParts = githubProfile.name.split(' ');
        updateData.firstName = nameParts[0];
        if (nameParts.length > 1) {
          updateData.lastName = nameParts.slice(1).join(' ');
        }
      }
    }

    // If user is an organization owner, set superadmin role
    if (isOrgOwner) {
      const client = await clerkClient();
      const user = await client.users.getUser(clerkUserId);
      const currentMetadata = (user.publicMetadata as Record<string, unknown>) || {};
      
      updateData.publicMetadata = {
        ...currentMetadata,
        ...updateData.publicMetadata,
        systemRole: 'superadmin',
        iflaRole: 'admin',
      };
    }

    // Update the user in Clerk
    const client = await clerkClient();
    await client.users.updateUser(clerkUserId, updateData);
    
    console.log('Successfully synced GitHub profile with Clerk:', {
      userId: clerkUserId,
      githubUsername: githubProfile.login,
      isOrgOwner,
    });
  } catch (error) {
    console.error('Error syncing GitHub profile with Clerk:', error);
    throw error;
  }
}

/**
 * Check if user is a known organization owner (manual list)
 * This is a temporary solution until we can access GitHub tokens from Clerk
 */
export function isKnownOrganizationOwner(githubUsername: string): boolean {
  const knownOwners = [
    'jonphipps',
    'jphipps',
    // Add other known organization owners here
  ];
  
  return knownOwners.includes(githubUsername.toLowerCase());
}

/**
 * Check and sync GitHub data for a user (simplified version without token access)
 */
export async function checkAndSyncGitHubData(clerkUserId: string): Promise<void> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);
    
    // Find GitHub external account
    const githubAccount = user.externalAccounts.find(
      account => account.provider === 'github'
    );
    
    if (!githubAccount) {
      console.warn('No GitHub account found for user:', clerkUserId);
      return;
    }

    // Check if user is a known org owner
    const isOrgOwner = isKnownOrganizationOwner(githubAccount.username || '');
    
    // Prepare update data
    const currentMetadata = (user.publicMetadata as Record<string, unknown>) || {};
    const updateData: ClerkUpdateData = {
      publicMetadata: {
        ...currentMetadata,
        githubUsername: githubAccount.username,
        githubId: githubAccount.id,
      }
    };

    // Update profile image from GitHub if available
    if (githubAccount.imageUrl && !user.imageUrl) {
      updateData.profileImageUrl = githubAccount.imageUrl;
    }

    // If user is an org owner, grant superadmin
    if (isOrgOwner && updateData.publicMetadata) {
      updateData.publicMetadata.systemRole = 'superadmin';
      updateData.publicMetadata.iflaRole = 'admin';
    }

    // Update the user
    await client.users.updateUser(clerkUserId, updateData);
    
    console.log('Successfully synced GitHub profile with Clerk:', {
      userId: clerkUserId,
      githubUsername: githubAccount.username,
      isOrgOwner,
    });
  } catch (error) {
    console.error('Error in GitHub sync process:', error);
  }
}