/**
 * Role-based routing logic for NextAuth redirects
 * Determines the correct landing page based on user roles and permissions
 */

// import { getSiteConfig } from '@ifla/theme/config/siteConfig';
// import type { Environment } from '@ifla/theme/config/siteConfig';

type Environment = 'local' | 'preview' | 'development' | 'production';

interface UserAttributes {
  rgs?: Record<string, string>;
  sites?: Record<string, string>;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface SessionUser {
  id: string;
  roles: string[];
  name?: string | null;
  email?: string | null;
  attributes?: UserAttributes;
}

/**
 * Get the optimal landing page for a user based on their roles
 */
export function getRoleBasedLandingPage(user: SessionUser, baseUrl: string): string {
  const { roles, attributes } = user;
  
  // System admins and IFLA admins get the portal dashboard
  if (roles.includes('system-admin') || roles.includes('ifla-admin')) {
    return `${baseUrl}/dashboard`;
  }
  
  // Site-specific admins should go directly to their site's management interface
  if (attributes?.sites) {
    const siteEntries = Object.entries(attributes.sites);
    
    // If user is admin of exactly one site, redirect them there
    const adminSites = siteEntries.filter(([_, role]) => role === 'admin');
    if (adminSites.length === 1) {
      const [siteKey] = adminSites[0];
      return `${baseUrl}/dashboard/${siteKey}`;
    }
    
    // If user has editor/contributor roles but no admin, also redirect to site management
    if (siteEntries.length === 1) {
      const [siteKey] = siteEntries[0];
      return `${baseUrl}/dashboard/${siteKey}`;
    }
  }
  
  // Review group admins get the general dashboard to choose sites
  if (attributes?.rgs) {
    const rgEntries = Object.entries(attributes.rgs);
    
    // If user is admin of exactly one review group with limited sites, might redirect directly
    const adminRgs = rgEntries.filter(([_, role]) => role === 'admin');
    if (adminRgs.length === 1) {
      const [rg] = adminRgs[0];
      
      // For single-site review groups, redirect directly to site management
      if (rg === 'LRM') {
        return `${baseUrl}/dashboard/lrm`;
      } else if (rg === 'MulDiCat') {
        return `${baseUrl}/dashboard/muldicat`;
      } else if (rg === 'UNIMARC') {
        return `${baseUrl}/dashboard/unimarc`;
      } else if (rg === 'FR') {
        return `${baseUrl}/dashboard/frbr`;
      }
      // ISBD has multiple sites, so show dashboard to choose
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
    preview: 'https://iflastandards.github.io/standards-dev/admin',
    development: 'https://jonphipps.github.io/standards-dev/admin',
    production: 'https://www.iflastandards.info/admin'
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
    
    if (hostname.includes('github.io') || hostname.includes('netlify') || hostname.includes('vercel')) {
      return 'development';
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
    newtest: 3008
  };
  
  if (env === 'local') {
    const port = portMap[siteKey] || 3000;
    return `http://localhost:${port}/${siteKey}/`;
  }
  
  // For other environments, construct URLs based on patterns
  const baseUrls = {
    preview: 'https://iflastandards.github.io/standards-dev',
    development: 'https://jonphipps.github.io/standards-dev',
    production: 'https://www.iflastandards.info'
  };
  
  const baseUrl = baseUrls[env] || 'http://localhost:3000';
  return siteKey === 'portal' ? `${baseUrl}/` : `${baseUrl}/${siteKey}/`;
}

/**
 * Check if user has access to a specific site
 */
export function userHasSiteAccess(user: SessionUser, siteKey: string): boolean {
  const { roles, attributes } = user;
  
  // System admins have access to everything
  if (roles.includes('system-admin') || roles.includes('ifla-admin')) {
    return true;
  }
  
  // Direct site access
  if (attributes?.sites?.[siteKey]) {
    return true;
  }
  
  // Review group access (check which review group the site belongs to)
  const siteToRg: Record<string, string> = {
    lrm: 'LRM',
    isbd: 'ISBD',
    isbdm: 'ISBD',
    muldicat: 'MulDiCat',
    frbr: 'FR',
    unimarc: 'UNIMARC',
    newtest: 'ISBD' // For testing
  };
  
  const rg = siteToRg[siteKey];
  if (rg && attributes?.rgs?.[rg]) {
    return true;
  }
  
  return false;
}