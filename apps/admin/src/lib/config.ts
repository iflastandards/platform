/**
 * Admin app configuration
 */

import { config } from '@/config/environment';

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
  // Use the centralized config's environment detection
  const envName = config.currentEnvironment;

  // Map config environment names to Environment type
  if (envName.startsWith('test_') || envName === 'development') {
    return 'local';
  }
  if (envName === 'staging') {
    return 'preview';
  }
  return 'production';
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
