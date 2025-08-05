/**
 * Add the appropriate base path to a static asset URL or API route for the admin app.
 * This uses Next.js built-in basePath configuration.
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

  // In Next.js, we can use the basePath from the config
  // For admin app, this is '/admin' in production
  const basePath = process.env.NODE_ENV === 'production' ? '/admin' : '';
  
  return basePath + path;
}