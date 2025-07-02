/**
 * Self-contained site configuration for all IFLA sites across all environments.
 * This is the single source of truth for site URLs and base paths.
 * Moved from shared-config.old to theme to eliminate cross-package dependencies.
 */

export type Environment = 'local' | 'preview' | 'development' | 'production';
export type SiteKey = 'portal' | 'ISBDM' | 'LRM' | 'FRBR' | 'isbd' | 'muldicat' | 'unimarc' | 'newtest';

export interface SiteConfigEntry {
  url: string;
  baseUrl: string;
  port?: number; // Only for local environment
}

export interface AdminPortalConfig {
  url: string;
  signinUrl: string;
  dashboardUrl: string;
  signoutUrl: string;
  sessionApiUrl: string;
  port?: number; // Only for local environment
}

// Type for Docusaurus site configuration objects (used in tests and components)
export interface SiteConfig {
  title?: string;
  url?: string;
  baseUrl?: string;
  customFields?: {
    siteKey?: string;
    environment?: string;
    isPortal?: boolean;
    vocabularyDefaults?: {
      prefix?: string;
      startCounter?: number;
      uriStyle?: 'numeric' | 'kebab-case';
      caseStyle?: 'kebab-case' | 'camelCase';
      defaultLanguage?: string;
      availableLanguages?: readonly string[];
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Central configuration matrix - single source of truth
export const SITE_CONFIG: Record<SiteKey, Record<Environment, SiteConfigEntry>> = {
  portal: {
    local: { url: 'http://localhost:3000', baseUrl: '/', port: 3000 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/' },
  },
  ISBDM: {
    local: { url: 'http://localhost:3001', baseUrl: '/ISBDM/', port: 3001 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/ISBDM/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/ISBDM/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/ISBDM/' },
  },
  LRM: {
    local: { url: 'http://localhost:3002', baseUrl: '/LRM/', port: 3002 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/LRM/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/LRM/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/LRM/' },
  },
  FRBR: {
    local: { url: 'http://localhost:3003', baseUrl: '/FRBR/', port: 3003 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/FRBR/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/FRBR/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/FRBR/' },
  },
  isbd: {
    local: { url: 'http://localhost:3004', baseUrl: '/isbd/', port: 3004 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/isbd/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/isbd/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/isbd/' },
  },
  muldicat: {
    local: { url: 'http://localhost:3005', baseUrl: '/muldicat/', port: 3005 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/muldicat/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/muldicat/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/muldicat/' },
  },
  unimarc: {
    local: { url: 'http://localhost:3006', baseUrl: '/unimarc/', port: 3006 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/unimarc/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/unimarc/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/unimarc/' },
  },
  // Test sites for scaffolding
  newtest: {
    local: { url: 'http://localhost:3008', baseUrl: '/newtest/', port: 3008 },
    preview: { url: 'https://iflastandards.github.io', baseUrl: '/standards-dev/newtest/' },
    development: { url: 'https://jonphipps.github.io', baseUrl: '/standards-dev/newtest/' },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/newtest/' },
  },
};

// Admin Portal configuration matrix
export const ADMIN_PORTAL_CONFIG: Record<Environment, AdminPortalConfig> = {
  local: {
    url: 'http://localhost:3007',
    signinUrl: 'http://localhost:3007/signin',
    dashboardUrl: 'http://localhost:3007/dashboard',
    signoutUrl: 'http://localhost:3007/api/auth/signout',
    sessionApiUrl: 'http://localhost:3007/api/auth/session',
    port: 3007,
  },
  preview: {
    url: 'https://iflastandards.github.io/standards-dev/admin',
    signinUrl: 'https://iflastandards.github.io/standards-dev/admin/signin',
    dashboardUrl: 'https://iflastandards.github.io/standards-dev/admin/dashboard',
    signoutUrl: 'https://iflastandards.github.io/standards-dev/admin/api/auth/signout',
    sessionApiUrl: 'https://iflastandards.github.io/standards-dev/admin/api/auth/session',
  },
  development: {
    url: 'https://jonphipps.github.io/standards-dev/admin',
    signinUrl: 'https://jonphipps.github.io/standards-dev/admin/signin',
    dashboardUrl: 'https://jonphipps.github.io/standards-dev/admin/dashboard',
    signoutUrl: 'https://jonphipps.github.io/standards-dev/admin/api/auth/signout',
    sessionApiUrl: 'https://jonphipps.github.io/standards-dev/admin/api/auth/session',
  },
  production: {
    url: 'https://www.iflastandards.info/admin',
    signinUrl: 'https://www.iflastandards.info/admin/signin',
    dashboardUrl: 'https://www.iflastandards.info/admin/dashboard',
    signoutUrl: 'https://www.iflastandards.info/admin/api/auth/signout',
    sessionApiUrl: 'https://www.iflastandards.info/admin/api/auth/session',
  },
};

/**
 * Get the configuration for a specific site and environment.
 * This function creates a new object to avoid shared references when
 * multiple builds are running concurrently.
 * 
 * @param siteKey - The site identifier
 * @param env - The environment
 * @returns The site configuration
 * @throws Error if configuration is missing
 */
export function getSiteConfig(siteKey: SiteKey, env: Environment): SiteConfigEntry {
  const config = SITE_CONFIG[siteKey]?.[env];
  if (!config) {
    throw new Error(`Configuration missing for ${siteKey} in ${env}`);
  }
  // Return a new object to avoid shared references when multiple builds run concurrently
  return { ...config };
}

/**
 * Get all site configurations for a specific environment as a mapping object.
 * This is SSG-compatible as it returns a serializable object instead of a function.
 * This function creates new objects to avoid shared references when
 * multiple builds are running concurrently.
 * 
 * @param env - The environment (used only at build time)
 * @returns A mapping object of all site configurations for the environment
 */
export function getSiteConfigMap(env: Environment): Record<SiteKey, SiteConfigEntry> {
  const result: Record<SiteKey, SiteConfigEntry> = {} as Record<SiteKey, SiteConfigEntry>;

  (Object.keys(SITE_CONFIG) as SiteKey[]).forEach(siteKey => {
    const config = SITE_CONFIG[siteKey]?.[env];
    if (config) {
      // Create a new object to avoid shared references when multiple builds run concurrently
      result[siteKey] = { ...config };
    }
  });

  return result;
}

/**
 * Get the admin portal configuration for a specific environment.
 * 
 * @param env - The environment
 * @returns The admin portal configuration
 * @throws Error if configuration is missing
 */
export function getAdminPortalConfig(env: Environment): AdminPortalConfig {
  const config = ADMIN_PORTAL_CONFIG[env];
  if (!config) {
    throw new Error(`Admin portal configuration missing for ${env}`);
  }
  // Return a new object to avoid shared references
  return { ...config };
}

/**
 * Auto-detect environment and get admin portal configuration.
 * This is useful for client-side code that needs to determine the environment dynamically.
 * 
 * @returns The admin portal configuration for the detected environment
 */
export function getAdminPortalConfigAuto(): AdminPortalConfig {
  // Server-side default (local development)
  if (typeof window === 'undefined') {
    return getAdminPortalConfig('local');
  }

  // Client-side: determine environment from window.location
  const { hostname } = window.location;
  
  // Production environment
  if (hostname === 'standards.ifla.org' || hostname.includes('ifla.org')) {
    return getAdminPortalConfig('production');
  }

  // Preview environment (GitHub Pages - iflastandards org)
  if (hostname === 'iflastandards.github.io') {
    return getAdminPortalConfig('preview');
  }

  // Development environment (GitHub Pages - personal)
  if (hostname.includes('github.io') || hostname.includes('netlify') || hostname.includes('vercel')) {
    return getAdminPortalConfig('development');
  }

  // Local development (default)
  return getAdminPortalConfig('local');
}

/**
 * Get the current site's environment based on URL
 * Useful for determining what admin portal URLs to use
 */
export function getCurrentEnvironment(): Environment {
  if (typeof window === 'undefined') {
    return 'local';
  }

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
