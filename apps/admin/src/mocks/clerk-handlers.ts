/**
 * MSW Handlers for Clerk API
 * Mock implementations of Clerk authentication endpoints
 * Uses contract-validated fixtures for consistent test data
 */

import { http, HttpResponse, delay } from 'msw';
import {
  getUserFixture,
  getUserFixtureById,
  getUserFixtureByEmail,
  getAllUserFixtures,
  fixtureToClerkUser,
} from './user-fixtures';
import {
  ClerkUserSchema,
  AuthSessionSchema,
} from '../../../../packages/contracts/schemas/User.zod';

// Clerk API base URL
const CLERK_API_BASE = 'https://api.clerk.com/v1';

// Current mock session state (in-memory for tests)
let currentSession: { userId: string; sessionId: string } | null = null;

/**
 * Set the current authenticated user for tests
 */
export function setMockAuthenticatedUser(userId: string | null) {
  if (userId) {
    const user = getUserFixtureById(userId);
    if (user) {
      currentSession = {
        userId: user.id,
        sessionId: `sess_${user.id}_mock`,
      };
    }
  } else {
    currentSession = null;
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
    | 'translator'
    | null,
) {
  if (role) {
    const user = getUserFixture(role);
    setMockAuthenticatedUser(user.id);
  } else {
    setMockAuthenticatedUser(null);
  }
}

// Clerk API Handlers
export const clerkHandlers = [
  // GET /v1/users/:userId - Get a specific user
  http.get(`${CLERK_API_BASE}/users/:userId`, async ({ params }) => {
    await delay(10); // Simulate network delay

    const { userId } = params;
    const fixture = getUserFixtureById(userId as string);

    if (!fixture) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'User not found',
              long_message: `No user found with ID: ${userId}`,
              code: 'user_not_found',
            },
          ],
        },
        { status: 404 },
      );
    }

    const clerkUser = fixtureToClerkUser(fixture);
    const validated = ClerkUserSchema.parse(clerkUser);

    return HttpResponse.json(validated);
  }),

  // GET /v1/users - List users
  http.get(`${CLERK_API_BASE}/users`, async ({ request }) => {
    await delay(10);

    const url = new URL(request.url);
    const emailAddress = url.searchParams.get('email_address');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let users = getAllUserFixtures();

    // Filter by email if provided
    if (emailAddress) {
      const user = getUserFixtureByEmail(emailAddress);
      users = user ? [user] : [];
    }

    // Paginate
    const paginatedUsers = users.slice(offset, offset + limit);
    const clerkUsers = paginatedUsers.map((u) =>
      ClerkUserSchema.parse(fixtureToClerkUser(u)),
    );

    return HttpResponse.json({
      data: clerkUsers,
      total_count: users.length,
    });
  }),

  // GET /v1/sessions/:sessionId - Get session details
  http.get(`${CLERK_API_BASE}/sessions/:sessionId`, async ({ params }) => {
    await delay(10);

    const { sessionId } = params;

    if (!currentSession || currentSession.sessionId !== sessionId) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'Session not found',
              long_message: `No session found with ID: ${sessionId}`,
              code: 'session_not_found',
            },
          ],
        },
        { status: 404 },
      );
    }

    const user = getUserFixtureById(currentSession.userId);
    if (!user) {
      return HttpResponse.json(
        { errors: [{ message: 'User not found', code: 'user_not_found' }] },
        { status: 404 },
      );
    }

    const session = {
      id: sessionId,
      user_id: user.id,
      status: 'active',
      expire_at: Date.now() + 86400000, // 24 hours from now
      abandon_at: Date.now() + 86400000,
      last_active_at: Date.now(),
      created_at: Date.now() - 3600000, // 1 hour ago
      updated_at: Date.now(),
    };

    return HttpResponse.json(session);
  }),

  // POST /v1/sessions - Create a new session (sign in)
  http.post(`${CLERK_API_BASE}/sessions`, async ({ request }) => {
    await delay(10);

    const body = (await request.json()) as any;
    const { identifier, password } = body;

    // Find user by email
    const user = getUserFixtureByEmail(identifier);

    if (!user) {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'Invalid credentials',
              long_message: 'The provided email or password is incorrect',
              code: 'form_identifier_not_found',
            },
          ],
        },
        { status: 401 },
      );
    }

    // Mock password check (always succeed for test users)
    if (password !== 'testpassword123') {
      return HttpResponse.json(
        {
          errors: [
            {
              message: 'Invalid credentials',
              long_message: 'The provided email or password is incorrect',
              code: 'form_password_incorrect',
            },
          ],
        },
        { status: 401 },
      );
    }

    // Create session
    const sessionId = `sess_${user.id}_${Date.now()}`;
    currentSession = {
      userId: user.id,
      sessionId,
    };

    const session = {
      id: sessionId,
      user_id: user.id,
      status: 'active',
      expire_at: Date.now() + 86400000,
      abandon_at: Date.now() + 86400000,
      last_active_at: Date.now(),
      created_at: Date.now(),
      updated_at: Date.now(),
    };

    return HttpResponse.json(session, { status: 201 });
  }),

  // DELETE /v1/sessions/:sessionId - Sign out
  http.delete(`${CLERK_API_BASE}/sessions/:sessionId`, async ({ params }) => {
    await delay(10);

    const { sessionId } = params;

    if (currentSession?.sessionId === sessionId) {
      currentSession = null;
      return HttpResponse.json({ id: sessionId, status: 'ended' });
    }

    return HttpResponse.json(
      { errors: [{ message: 'Session not found', code: 'session_not_found' }] },
      { status: 404 },
    );
  }),

  // Internal Clerk endpoints used by Next.js middleware
  http.get('**/v1/client', async () => {
    await delay(10);

    if (!currentSession) {
      return HttpResponse.json({
        sessions: [],
        sign_in: null,
        sign_up: null,
        last_active_session_id: null,
      });
    }

    const user = getUserFixtureById(currentSession.userId);
    if (!user) {
      return HttpResponse.json({
        sessions: [],
        sign_in: null,
        sign_up: null,
        last_active_session_id: null,
      });
    }

    return HttpResponse.json({
      sessions: [
        {
          id: currentSession.sessionId,
          user_id: currentSession.userId,
          status: 'active',
          last_active_at: Date.now(),
          expire_at: Date.now() + 86400000,
        },
      ],
      sign_in: null,
      sign_up: null,
      last_active_session_id: currentSession.sessionId,
    });
  }),

  // Mock auth() function response for server components
  http.post('**/internal/auth', async () => {
    await delay(10);

    if (!currentSession) {
      return HttpResponse.json({
        userId: null,
        sessionId: null,
        sessionClaims: null,
      });
    }

    const user = getUserFixtureById(currentSession.userId);
    if (!user) {
      return HttpResponse.json({
        userId: null,
        sessionId: null,
        sessionClaims: null,
      });
    }

    const authSession = AuthSessionSchema.parse({
      userId: user.id,
      sessionId: currentSession.sessionId,
      sessionClaims: {
        email: user.email,
        publicMetadata: user.publicMetadata,
      },
    });

    return HttpResponse.json(authSession);
  }),

  // Mock currentUser() function response
  http.get('**/internal/current-user', async () => {
    await delay(10);

    if (!currentSession) {
      return HttpResponse.json(null);
    }

    const user = getUserFixtureById(currentSession.userId);
    if (!user) {
      return HttpResponse.json(null);
    }

    const clerkUser = fixtureToClerkUser(user);
    return HttpResponse.json(ClerkUserSchema.parse(clerkUser));
  }),
];

/**
 * Reset mock auth state
 */
export function resetMockAuth() {
  currentSession = null;
}

/**
 * Get current mock session
 */
export function getMockSession() {
  return currentSession;
}
