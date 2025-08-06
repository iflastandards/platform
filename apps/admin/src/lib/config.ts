/**
 * Admin app configuration
 */

export type Environment = 'local' | 'preview' | 'production';

export const ADMIN_CONFIG = {
  portal: {
    local: {
      url: 'http://localhost:3000',
      adminUrl: 'http://localhost:3007',
    },
    preview: {
      url: 'https://iflastandards.github.io/platform',
      adminUrl: 'https://admin-iflastandards-preview.onrender.com',
    },
    production: {
      url: 'https://www.iflastandards.info',
      adminUrl: 'https://admin.iflastandards.info',
    },
  },
} as const;

/**
 * Determine the current environment based on the URL
 */
export function getEnvironment(): Environment {
  // In server components, we need to check environment variables or URLs
  const url = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || process.env.VERCEL_URL || '';
  
  if (url.includes('localhost')) {
    return 'local';
  } else if (url.includes('github.io') || url.includes('onrender.com') || url.includes('vercel.app')) {
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