/**
 * Role-based routing logic for Clerk redirects
 * Determines the correct landing page based on user roles and permissions
 */

import { UserRoles } from '@/lib/auth';

type Environment = 'local' | 'preview' | 'development' | 'production';

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  roles: UserRoles;
}

/**
 * Get the optimal landing page for a user based on their roles
 */
export function getRoleBasedLandingPage(
  user: SessionUser,
  baseUrl: string,
): string {
  const { roles } = user;

  // Superadmins get the portal dashboard
  if (roles.systemRole === 'superadmin') {
    return `${baseUrl}/dashboard`;
  }

  // Review Group Admins get the general dashboard to choose sites
  if (roles.reviewGroups && roles.reviewGroups.length > 0) {
    const adminRgs = roles.reviewGroups.filter(rg => rg.role === 'admin');
    
    if (adminRgs.length === 1) {
      const rg = adminRgs[0].reviewGroupId;

      // For single-namespace review groups, redirect directly to namespace management
      if (rg === 'icp') {
        return `${baseUrl}/dashboard/muldicat`;
      }
      // BCM, ISBD, and PUC have multiple namespaces, so show dashboard to choose
    }
  }

  // Team members with single namespace access
  if (roles.teams && roles.teams.length > 0) {
    const allNamespaces = new Set<string>();
    roles.teams.forEach(team => {
      team.namespaces.forEach(ns => allNamespaces.add(ns));
    });

    // If user has access to exactly one namespace, redirect there
    if (allNamespaces.size === 1) {
      const namespace = Array.from(allNamespaces)[0];
      return `${baseUrl}/dashboard/${namespace}`;
    }
  }

  // Default to main dashboard for multi-role users or unclear cases
  return `${baseUrl}/dashboard`;
}

/**
 * Get admin portal URL for the given environment
 */
function getAdminPortalUrl(env: Environment): string {
  const urls = {
    local: 'http://localhost:3007',
    preview: 'https://admin-iflastandards-preview.onrender.com',
    development: 'https://admin-iflastandards-preview.onrender.com',
    production: 'https://admin.iflastandards.info',
  };

  return urls[env];
}

/**
 * Get the environment from current URL or environment variable
 */
export function getCurrentEnvironment(): Environment {
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    if (hostname === 'standards.ifla.org' || hostname.includes('ifla.org')) {
      return 'production';
    }

    if (hostname === 'iflastandards.github.io') {
      return 'preview';
    }

    if (
      hostname.includes('github.io') ||
      hostname.includes('netlify') ||
      hostname.includes('vercel') ||
      hostname.includes('onrender.com')
    ) {
      return 'preview';
    }

    return 'local';
  }

  // Server-side: use environment variable or default to local
  return (process.env.DOCS_ENV as Environment) || 'local';
}

/**
 * Generate pre-authentication URL for testing scenarios
 * This creates a URL that will automatically log in the user and redirect appropriately
 */
export function generateTestingURL(user: SessionUser): string {
  const env = getCurrentEnvironment();
  const baseUrl = getAdminPortalUrl(env);

  // Determine where the user should land
  const landingPage = getRoleBasedLandingPage(user, baseUrl);

  // For mock auth, we'll pass the user data as URL parameters (development only)
  if (process.env.NODE_ENV === 'development') {
    const userParam = encodeURIComponent(JSON.stringify(user));
    return `${baseUrl}/auth/signin?mockUser=${userParam}&callbackUrl=${encodeURIComponent(landingPage)}`;
  }

  // Production: just return the expected landing page
  return landingPage;
}

/**
 * Get the appropriate site URL for a given site key
 */
export function getSiteManagementURL(siteKey: string): string {
  const env = getCurrentEnvironment();

  // Use hardcoded config to avoid build-time dependency issues
  const portMap: Record<string, number> = {
    portal: 3000,
    isbdm: 3001,
    lrm: 3002,
    frbr: 3003,
    isbd: 3004,
    muldicat: 3005,
    unimarc: 3006,
    newtest: 3008,
  };

  if (env === 'local') {
    const port = portMap[siteKey] || 3000;
    return `http://localhost:${port}/${siteKey}/`;
  }

  // For other environments, construct URLs based on patterns
  const baseUrls = {
    preview: 'https://iflastandards.github.io/standards-dev',
    development: 'https://jonphipps.github.io/standards-dev',
    production: 'https://www.iflastandards.info',
  };

  const baseUrl = baseUrls[env] || 'http://localhost:3000';
  return siteKey === 'portal' ? `${baseUrl}/` : `${baseUrl}/${siteKey}/`;
}

/**
 * Check if user has access to a specific namespace/site
 */
export function userHasSiteAccess(user: SessionUser, siteKey: string): boolean {
  const { roles } = user;

  // Superadmins have access to everything
  if (roles.systemRole === 'superadmin') {
    return true;
  }

  // Check team-based namespace access
  const hasTeamAccess = roles.teams?.some(team => 
    team.namespaces.includes(siteKey)
  );
  if (hasTeamAccess) {
    return true;
  }

  // Check translation access
  const hasTranslationAccess = roles.translations?.some(trans => 
    trans.namespaces.includes(siteKey)
  );
  if (hasTranslationAccess) {
    return true;
  }

  // Review group access (check which review group the site belongs to)
  const siteToRg: Record<string, string> = {
    // ICP (International Cataloguing Principles)
    muldicat: 'icp',

    // BCM (Bibliographic Conceptual Models)
    lrm: 'bcm',
    frbr: 'bcm',
    frad: 'bcm',
    frbrer: 'bcm',
    frbroo: 'bcm',
    frsad: 'bcm',

    // ISBD (International Standard Bibliographic Description)
    isbd: 'isbd',
    isbdm: 'isbd',
    isbdw: 'isbd',
    isbde: 'isbd',
    isbdi: 'isbd',
    isbdap: 'isbd',
    isbdac: 'isbd',
    isbdn: 'isbd',
    isbdp: 'isbd',
    isbdt: 'isbd',

    // PUC (Permanent UNIMARC Committee) - all UNIMARC elements
    unimarc: 'puc',

    // Testing
    newtest: 'isbd', // For testing
  };

  const rg = siteToRg[siteKey];
  if (rg && roles.reviewGroups?.some(reviewGroup => reviewGroup.reviewGroupId === rg)) {
    return true;
  }

  return false;
}
