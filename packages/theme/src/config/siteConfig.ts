/**
 * Self-contained site configuration for all IFLA sites across all environments.
 * This is the single source of truth for site URLs and base paths.
 * Moved from shared-config.old to theme to eliminate cross-package dependencies.
 */

export type Environment = 'local' | 'preview' | 'production';
export type SiteKey =
  | 'portal'
  | 'ISBDM'
  | 'LRM'
  | 'FRBR'
  | 'isbd'
  | 'muldicat'
  | 'unimarc'
  | 'newtest';

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
export const SITE_CONFIG: Record<
  SiteKey,
  Record<Environment, SiteConfigEntry>
> = {
  portal: {
    local: { url: 'http://localhost:3000', baseUrl: '/', port: 3000 },
    preview: {
      url: 'https://iflastandards.github.io',
      baseUrl: '/platform/',
    },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/' },
  },
  ISBDM: {
    local: { url: 'http://localhost:3001', baseUrl: '/ISBDM/', port: 3001 },
    preview: {
      url: 'https://iflastandards.github.io',
      baseUrl: '/platform/ISBDM/',
    },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/ISBDM/' },
  },
  LRM: {
    local: { url: 'http://localhost:3002', baseUrl: '/LRM/', port: 3002 },
    preview: {
      url: 'https://iflastandards.github.io',
      baseUrl: '/platform/LRM/',
    },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/LRM/' },
  },
  FRBR: {
    local: { url: 'http://localhost:3003', baseUrl: '/FRBR/', port: 3003 },
    preview: {
      url: 'https://iflastandards.github.io',
      baseUrl: '/platform/FRBR/',
    },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/FRBR/' },
  },
  isbd: {
    local: { url: 'http://localhost:3004', baseUrl: '/isbd/', port: 3004 },
    preview: {
      url: 'https://iflastandards.github.io',
      baseUrl: '/platform/isbd/',
    },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/isbd/' },
  },
  muldicat: {
    local: { url: 'http://localhost:3005', baseUrl: '/muldicat/', port: 3005 },
    preview: {
      url: 'https://iflastandards.github.io',
      baseUrl: '/platform/muldicat/',
    },
    production: {
      url: 'https://www.iflastandards.info',
      baseUrl: '/muldicat/',
    },
  },
  unimarc: {
    local: { url: 'http://localhost:3006', baseUrl: '/unimarc/', port: 3006 },
    preview: {
      url: 'https://iflastandards.github.io',
      baseUrl: '/platform/unimarc/',
    },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/unimarc/' },
  },
  // Test sites for scaffolding
  newtest: {
    local: { url: 'http://localhost:3008', baseUrl: '/newtest/', port: 3008 },
    preview: {
      url: 'https://iflastandards.github.io',
      baseUrl: '/platform/newtest/',
    },
    production: { url: 'https://www.iflastandards.info', baseUrl: '/newtest/' },
  },
};

// Admin Portal configuration matrix
export const ADMIN_PORTAL_CONFIG: Record<Environment, AdminPortalConfig> = {
  local: {
    url: 'http://localhost:3007/services',
    signinUrl: 'http://localhost:3007/services/auth/signin',
    dashboardUrl: 'http://localhost:3000/admin/dashboard',
    signoutUrl: 'http://localhost:3007/services/api/auth/signout',
    sessionApiUrl: 'http://localhost:3007/services/api/auth/session',
    port: 3007,
  },
  preview: {
    url: 'https://iflastandards.github.io/platform/services',
    signinUrl: 'https://iflastandards.github.io/platform/services/auth/signin',
    dashboardUrl: 'https://iflastandards.github.io/platform/admin/dashboard',
    signoutUrl:
      'https://iflastandards.github.io/platform/services/api/auth/signout',
    sessionApiUrl:
      'https://iflastandards.github.io/platform/services/api/auth/session',
  },
  production: {
    url: 'https://www.iflastandards.info/services',
    signinUrl: 'https://www.iflastandards.info/services/auth/signin',
    dashboardUrl: 'https://www.iflastandards.info/admin/dashboard',
    signoutUrl: 'https://www.iflastandards.info/services/api/auth/signout',
    sessionApiUrl: 'https://www.iflastandards.info/services/api/auth/session',
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
export function getSiteConfig(
  siteKey: SiteKey,
  env: Environment,
): SiteConfigEntry {
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
export function getSiteConfigMap(
  env: Environment,
): Record<SiteKey, SiteConfigEntry> {
  const result: Record<SiteKey, SiteConfigEntry> = {} as Record<
    SiteKey,
    SiteConfigEntry
  >;

  (Object.keys(SITE_CONFIG) as SiteKey[]).forEach((siteKey) => {
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

  // Preview environment (Vercel or other hosting)
  if (
    hostname.includes('github.io') ||
    hostname.includes('netlify') ||
    hostname.includes('vercel')
  ) {
    return getAdminPortalConfig('preview');
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

  if (
    hostname.includes('github.io') ||
    hostname.includes('netlify') ||
    hostname.includes('vercel')
  ) {
    return 'preview';
  }

  return 'local';
}
