/**
 * Admin app configuration
 */

export type Environment = 'local' | 'preview' | 'production';

export const ADMIN_CONFIG = {
  portal: {
    local: {
      url: 'http://localhost:3000',
      sessionApiUrl: 'http://localhost:3007/admin/api/auth/session',
    },
    preview: {
      url: 'https://iflastandards.github.io/platform',
      sessionApiUrl: 'https://iflastandards.github.io/platform/admin/api/auth/session',
    },
    production: {
      url: 'https://www.iflastandards.info',
      sessionApiUrl: 'https://admin.iflastandards.info/api/auth/session',
    },
  },
} as const;

/**
 * Determine the current environment based on the URL
 */
export function getEnvironment(): Environment {
  // In server components, we need to check environment variables or URLs
  const url = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '';
  
  if (url.includes('localhost')) {
    return 'local';
  } else if (url.includes('github.io')) {
    return 'preview';
  } else {
    return 'production';
  }
}

/**
 * Get the portal URL for the current environment
 * This is used for logout redirects to send users back to the main portal
 */
export function getPortalUrl(): string {
  // Determine environment based on the current URL
  const env = getEnvironment();
  
  // Get portal configuration for this environment
  const portalConfig = ADMIN_CONFIG.portal[env];
  
  // Return the portal URL
  return portalConfig.url;
}