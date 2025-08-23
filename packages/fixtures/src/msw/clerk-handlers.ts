/**
 * MSW Handlers for Clerk API
 * Reusable mock handlers for Clerk authentication
 * Can be used across all test environments
 */

import { http, HttpResponse, delay } from 'msw';
import {
  getTestUserByEmail,
  getTestUserById,
  getAllTestUsers,
  type ClerkTestUser,
} from '../users/helpers';
import { TEST_USER_EMAILS } from '../users/constants';

// Clerk API base URL
const CLERK_API_BASE = 'https://api.clerk.com/v1';

// Current mock session state (in-memory for tests)
let currentMockSession: {
  userId: string;
  sessionId: string;
  user: ClerkTestUser;
} | null = null;

/**
 * Set the current authenticated user for tests
 */
export function setMockAuthenticatedUser(userId: string | null) {
  if (userId) {
    const user = getTestUserById(userId);
    if (user) {
      currentMockSession = {
        userId: user.id,
        sessionId: `sess_${user.id}_mock`,
        user,
      };
    }
  } else {
    currentMockSession = null;
  }
}

/**
 * Set authenticated user by role
 */
export function setMockAuthenticatedRole(
  role:
    | 'superadmin'
    | 'rgadmin'
    | 'nsadmin'
    | 'editor'
    | 'author'
    | 'translator',
) {
  const emailMap = {
    superadmin: TEST_USER_EMAILS.SUPERADMIN,
    rgadmin: TEST_USER_EMAILS.RG_ADMIN,
    nsadmin: TEST_USER_EMAILS.NAMESPACE_ADMIN,
    editor: TEST_USER_EMAILS.EDITOR,
    author: TEST_USER_EMAILS.AUTHOR,
    translator: TEST_USER_EMAILS.TRANSLATOR,
  };

  const email = emailMap[role];
  const user = getTestUserByEmail(email);

  if (user) {
    setMockAuthenticatedUser(user.id);
  }
}

/**
 * Clear mock authentication
 */
export function clearMockAuth() {
  currentMockSession = null;
}

/**
 * Get current mock user
 */
export function getCurrentMockUser(): ClerkTestUser | null {
  return currentMockSession?.user || null;
}

/**
 * Create Clerk MSW handlers
 * @param options Configuration options for the handlers
 */
export function createClerkHandlers(options?: {
  delay?: number;
  apiBase?: string;
}) {
  const apiBase = options?.apiBase || CLERK_API_BASE;
  const responseDelay = options?.delay || 0;

  return [
    // Get user by ID
    http.get(`${apiBase}/users/:userId`, async ({ params }) => {
      if (responseDelay) {await delay(responseDelay);}

      const user = getTestUserById(params.userId as string);
      if (!user) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(user);
    }),

    // Get current user
    http.get(`${apiBase}/me`, async () => {
      if (responseDelay) {await delay(responseDelay);}

      if (!currentMockSession) {
        return new HttpResponse(null, { status: 401 });
      }

      return HttpResponse.json(currentMockSession.user);
    }),

    // Get user list
    http.get(`${apiBase}/users`, async ({ request }) => {
      if (responseDelay) {await delay(responseDelay);}

      const url = new URL(request.url);
      const email = url.searchParams.get('email_address');

      if (email) {
        const user = getTestUserByEmail(email);
        return HttpResponse.json({
          data: user ? [user] : [],
          total_count: user ? 1 : 0,
        });
      }

      return HttpResponse.json({
        data: getAllTestUsers(),
        total_count: getAllTestUsers().length,
      });
    }),

    // Create session (sign in)
    http.post(`${apiBase}/client/sessions`, async ({ request }) => {
      if (responseDelay) {await delay(responseDelay);}

      const body = (await request.json()) as any;
      const { identifier } = body;

      const user = getTestUserByEmail(identifier);
      if (!user) {
        return new HttpResponse(
          JSON.stringify({
            errors: [{ message: 'Invalid email or password' }],
          }),
          { status: 401 },
        );
      }

      // Set the mock session
      currentMockSession = {
        userId: user.id,
        sessionId: `sess_${user.id}_mock`,
        user,
      };

      return HttpResponse.json({
        response: {
          id: currentMockSession.sessionId,
          user,
          status: 'active',
        },
        client: {
          sessions: [
            {
              id: currentMockSession.sessionId,
              user,
              status: 'active',
            },
          ],
        },
      });
    }),

    // Delete session (sign out)
    http.delete(`${apiBase}/client/sessions/:sessionId`, async () => {
      if (responseDelay) {await delay(responseDelay);}

      currentMockSession = null;
      return new HttpResponse(null, { status: 200 });
    }),

    // Update user metadata
    http.patch(
      `${apiBase}/users/:userId/metadata`,
      async ({ params, request }) => {
        if (responseDelay) {await delay(responseDelay);}

        const user = getTestUserById(params.userId as string);
        if (!user) {
          return new HttpResponse(null, { status: 404 });
        }

        const body = (await request.json()) as any;

        // Update the user metadata (in memory only for tests)
        if (body.public_metadata) {
          user.publicMetadata = {
            ...user.publicMetadata,
            ...body.public_metadata,
          };
        }
        if (body.private_metadata) {
          user.privateMetadata = {
            ...user.privateMetadata,
            ...body.private_metadata,
          };
        }

        return HttpResponse.json(user);
      },
    ),
  ];
}

/**
 * Create handlers for Next.js API routes that use Clerk
 */
export function createNextAuthHandlers(options?: {
  delay?: number;
  baseUrl?: string;
}) {
  const baseUrl = options?.baseUrl || '';
  const responseDelay = options?.delay || 0;

  return [
    // Mock /api/auth/me endpoint
    http.get(`${baseUrl}/api/auth/me`, async () => {
      if (responseDelay) {await delay(responseDelay);}

      if (!currentMockSession) {
        return new HttpResponse(null, { status: 401 });
      }

      return HttpResponse.json({
        user: currentMockSession.user,
        sessionId: currentMockSession.sessionId,
      });
    }),

    // Mock /api/auth/session endpoint
    http.get(`${baseUrl}/api/auth/session`, async () => {
      if (responseDelay) {await delay(responseDelay);}

      if (!currentMockSession) {
        return HttpResponse.json({ user: null });
      }

      return HttpResponse.json({
        user: currentMockSession.user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    }),

    // Mock sign out
    http.post(`${baseUrl}/api/auth/signout`, async () => {
      if (responseDelay) {await delay(responseDelay);}

      currentMockSession = null;
      return HttpResponse.json({ success: true });
    }),
  ];
}
