import {
  getAdminPortalConfig,
  getAdminPortalConfigAuto,
  type Environment,
} from '../config/siteConfig';

/**
 * Add the appropriate base path to a static asset URL or API route based on current environment.
 * This is our own implementation to avoid relying on Next.js internal functions.
 *
 * Uses DOCS_ENV environment variable on server-side and window.location detection on client-side
 * to determine the correct base path for the current environment.
 *
 * @param path - The path to prepend base path to (should start with /)
 * @returns The path with base path prepended
 *
 * @example
 * // Static assets
 * <img src={addBasePath('/logo.png')} />
 *
 * @example
 * // API calls
 * fetch(addBasePath('/api/request-invite'))
 *
 * @example
 * // Favicon in layout
 * icon: addBasePath('/favicon.ico')
 */
export function addBasePath(path: string): string {
  if (!path.startsWith('/')) {
    console.warn('addBasePath: path should start with /, got:', path);
    path = '/' + path;
  }

  let config;

  // Server-side: use DOCS_ENV environment variable (consistent with admin patterns)
  if (typeof window === 'undefined') {
    const env = (process.env.DOCS_ENV as Environment) || 'local';
    config = getAdminPortalConfig(env);
  } else {
    // Client-side: use existing auto-detection logic
    config = getAdminPortalConfigAuto();
  }

  // Extract base path from full URL
  // e.g., "http://localhost:3007/admin" -> "/admin"
  // e.g., "https://iflastandards.github.io/platform/admin" -> "/platform/admin"
  const url = new URL(config.url);
  const basePath = url.pathname.replace(/\/$/, ''); // Remove trailing slash

  return basePath + path;
}
