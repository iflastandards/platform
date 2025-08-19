/**
 * MSW Initialization
 * Starts Mock Service Worker in browser or Node environments
 * based on the NEXT_PUBLIC_USE_MOCK environment variable
 */

import { config } from '@/config/environment';

export async function initMsw() {
  if (config.env.useMock) {
    if (typeof window === 'undefined') {
      // Server/Node environment
      const { server } = await import('../mocks/server');
      server.listen({
        onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
      });
      console.log('[MSW] Mock server started (Node)');
    } else {
      // Browser environment
      const { worker } = await import('../mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass',
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });
      console.log('[MSW] Mock service worker started (Browser)');
    }
  }
}

/**
 * Initialize MSW if in development mode
 * This should be called as early as possible in the app lifecycle
 */
export async function initMswIfNeeded() {
  if (process.env.NODE_ENV === 'development') {
    await initMsw();
  }
}
