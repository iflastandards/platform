/**
 * MSW Test Setup
 * Configures Mock Service Worker for test environment
 * This replaces vi.mock() with network-level interception
 */

import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';
import { beforeAll, afterEach, afterAll } from 'vitest';
import {
  resetMockAuth,
  setMockAuthenticatedRole,
} from '../mocks/clerk-handlers';

// Create MSW server instance
export const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'warn', // Warn on unhandled requests during tests
  });
});

// Reset handlers and auth state after each test
afterEach(() => {
  server.resetHandlers();
  resetMockAuth();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

/**
 * Test helper to set authenticated user for a test
 */
export function authenticateAs(
  role:
    | 'superadmin'
    | 'rgadmin'
    | 'nsadmin'
    | 'editor'
    | 'author'
    | 'translator'
    | null,
) {
  setMockAuthenticatedRole(role);
}

/**
 * Test helper to clear authentication
 */
export function clearAuthentication() {
  resetMockAuth();
}

/**
 * Override specific handlers for a test
 */
export function mockApiResponse(path: string, response: any, status = 200) {
  server.use(
    ...[
      require('msw').http.get(path, () => require('msw').HttpResponse.json(response, { status })),
      require('msw').http.post(path, () => require('msw').HttpResponse.json(response, { status })),
    ],
  );
}
