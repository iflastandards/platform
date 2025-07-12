import { SITE_CONFIG, Environment } from '@ifla/theme/config/siteConfig';

/**
 * Get the portal URL for the current environment
 * This is used for logout redirects to send users back to the main portal
 */
export function getPortalUrl(): string {
  // Determine environment based on the current URL
  const env = getEnvironment();
  
  // Get portal configuration for this environment
  const portalConfig = SITE_CONFIG.portal[env];
  
  // Construct full URL
  return portalConfig.url + portalConfig.baseUrl;
}

/**
 * Determine the current environment based on the URL
 */
function getEnvironment(): Environment {
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