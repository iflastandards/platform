/**
 * GitHub Organization Ownership Checker
 * 
 * This module provides a proper way to check GitHub organization ownership
 * using either:
 * 1. GitHub App installation token (preferred)
 * 2. Personal Access Token with org:read scope
 * 3. OAuth token from user (during initial sign-in)
 * 
 * This replaces the temporary "known users" list approach.
 */

interface GitHubOrgMember {
  login: string;
  id: number;
  role: string;
  state: string;
}

/**
 * Get GitHub App installation token
 * This generates a JWT and exchanges it for an installation token
 */
async function getGitHubAppInstallationToken(): Promise<string | null> {
  try {
    const appId = process.env.GITHUB_APP_ID;
    const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
    const privateKey = process.env.GITHUB_APP_PRIVATE_KEY_BASE64 
      ? Buffer.from(process.env.GITHUB_APP_PRIVATE_KEY_BASE64, 'base64').toString()
      : process.env.GITHUB_APP_PRIVATE_KEY;

    if (!appId || !installationId || !privateKey) {
      console.warn('GitHub App credentials not fully configured');
      return null;
    }

    // Create JWT for GitHub App authentication
    const { createAppAuth } = await import('@octokit/auth-app');
    
    const auth = createAppAuth({
      appId,
      privateKey,
      installationId: Number(installationId),
    });

    const { token } = await auth({ type: 'installation' });
    return token;
  } catch (error) {
    console.error('Failed to get GitHub App installation token:', error);
    return null;
  }
}

/**
 * Check if a user is an owner/admin of the iflastandards organization
 * using a GitHub App installation token or PAT
 * 
 * This is the preferred method as it doesn't rely on user OAuth tokens
 * which are only available during initial authentication.
 */
export async function checkOrgOwnershipWithAppToken(
  githubUsername: string
): Promise<boolean> {
  try {
    // Try to get GitHub App installation token first
    let githubToken = await getGitHubAppInstallationToken();
    
    // Fall back to PAT if app token fails
    if (!githubToken) {
      githubToken = process.env.GITHUB_PAT || null;
    }
    
    if (!githubToken) {
      console.warn('No GitHub authentication available. Cannot check org ownership.');
      return false;
    }

    // Check user's membership in the organization
    const response = await fetch(
      `https://api.github.com/orgs/iflastandards/members/${githubUsername}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.status === 404) {
      // User is not a member
      return false;
    }

    if (!response.ok) {
      console.error(`Failed to check org membership: ${response.status}`);
      return false;
    }

    // Now check if they're an owner (requires admin:org scope)
    const roleResponse = await fetch(
      `https://api.github.com/orgs/iflastandards/memberships/${githubUsername}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!roleResponse.ok) {
      console.error(`Failed to check membership role: ${roleResponse.status}`);
      // User is a member but we can't determine role
      return false;
    }

    const membership = await roleResponse.json();
    
    // GitHub returns 'admin' for organization owners
    const isOwner = membership.role === 'admin';
    
    console.log(`GitHub org check for ${githubUsername}: role=${membership.role}, isOwner=${isOwner}`);
    
    return isOwner;
  } catch (error) {
    console.error('Error checking organization ownership with app token:', error);
    return false;
  }
}

/**
 * Get all organization owners using GitHub App token
 * This can be used to periodically sync the list of owners
 */
export async function getAllOrgOwners(): Promise<string[]> {
  try {
    // Try to get GitHub App installation token first
    let githubToken = await getGitHubAppInstallationToken();
    
    // Fall back to PAT if app token fails
    if (!githubToken) {
      githubToken = process.env.GITHUB_PAT || null;
    }
    
    if (!githubToken) {
      console.warn('No GitHub authentication available.');
      return [];
    }

    // Get all organization members
    const response = await fetch(
      'https://api.github.com/orgs/iflastandards/members?role=admin&per_page=100',
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch org owners: ${response.status}`);
      return [];
    }

    const owners: GitHubOrgMember[] = await response.json();
    
    const ownerUsernames = owners.map(owner => owner.login);
    
    console.log(`Found ${ownerUsernames.length} organization owners:`, ownerUsernames);
    
    return ownerUsernames;
  } catch (error) {
    console.error('Error fetching organization owners:', error);
    return [];
  }
}

/**
 * Cache organization owners in memory with TTL
 * This reduces API calls to GitHub
 */
class OrgOwnerCache {
  private owners: Set<string> = new Set();
  private lastFetch: number = 0;
  private ttl: number = 5 * 60 * 1000; // 5 minutes

  async isOwner(githubUsername: string): Promise<boolean> {
    // Refresh cache if expired
    if (Date.now() - this.lastFetch > this.ttl) {
      await this.refresh();
    }

    return this.owners.has(githubUsername.toLowerCase());
  }

  async refresh(): Promise<void> {
    try {
      const owners = await getAllOrgOwners();
      this.owners = new Set(owners.map(u => u.toLowerCase()));
      this.lastFetch = Date.now();
      console.log(`Org owner cache refreshed with ${this.owners.size} owners`);
    } catch (error) {
      console.error('Failed to refresh org owner cache:', error);
      // Keep existing cache if refresh fails
    }
  }

  // Force refresh the cache
  invalidate(): void {
    this.lastFetch = 0;
  }
}

// Singleton cache instance
export const orgOwnerCache = new OrgOwnerCache();

/**
 * Main function to check if a user is an organization owner
 * This tries multiple methods in order of preference:
 * 1. Cached result
 * 2. GitHub App token check
 * 3. Fallback to known users (only if all else fails)
 */
export async function isOrganizationOwner(githubUsername: string): Promise<boolean> {
  if (!githubUsername) {
    return false;
  }

  try {
    // Try cached result first
    const isCachedOwner = await orgOwnerCache.isOwner(githubUsername);
    if (isCachedOwner) {
      console.log(`${githubUsername} is a cached organization owner`);
      return true;
    }

    // Try direct API check with app token
    const isApiOwner = await checkOrgOwnershipWithAppToken(githubUsername);
    if (isApiOwner) {
      console.log(`${githubUsername} confirmed as organization owner via API`);
      // Refresh cache to include this user
      orgOwnerCache.invalidate();
      return true;
    }

    // As a last resort, check against a minimal emergency access list
    // This should only contain 1-2 usernames for emergency access
    const emergencyAccessList = process.env.GITHUB_EMERGENCY_ADMINS?.split(',') || [];
    if (emergencyAccessList.includes(githubUsername.toLowerCase())) {
      console.warn(`${githubUsername} granted emergency admin access (not verified via API)`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error checking org ownership for ${githubUsername}:`, error);
    return false;
  }
}