/**
 * Clerk Test Helpers for API Route Testing
 * 
 * This module provides utilities for testing API routes with real Clerk users.
 * It includes helpers for mocking Clerk authentication in tests while using
 * real user data.
 */

import { vi } from 'vitest';
import { ClerkTestUser, TestUsers } from './clerk-test-users';

/**
 * Mock Clerk's currentUser function to return a specific test user
 */
export function mockClerkCurrentUser(testUser: ClerkTestUser | null) {
  const mockCurrentUser = vi.fn().mockResolvedValue(
    testUser ? {
      id: testUser.id,
      emailAddresses: [{ emailAddress: testUser.email }],
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      publicMetadata: {
        systemRole: testUser.roles.systemRole,
        reviewGroups: testUser.roles.reviewGroups,
        teams: testUser.roles.teams,
        translations: testUser.roles.translations,
      },
    } : null
  );

  // Mock the Clerk module
  vi.doMock('@clerk/nextjs/server', () => ({
    currentUser: mockCurrentUser,
    auth: vi.fn().mockReturnValue({
      userId: testUser?.id || null,
      sessionClaims: testUser ? {
        email: testUser.email,
        publicMetadata: {
          role: testUser.roles.systemRole,
          systemRole: testUser.roles.systemRole,
          reviewGroups: testUser.roles.reviewGroups,
          teams: testUser.roles.teams,
          translations: testUser.roles.translations,
        },
      } : null,
    }),
  }));

  return mockCurrentUser;
}

/**
 * Create a test request with proper headers for API testing
 */
export function createTestRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  headers?: Record<string, string>
): any {
  const url = 'http://localhost:3000/api/test';
  
  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    requestInit.body = JSON.stringify(body);
  }

  // Create a mock NextRequest-like object
  const request = new Request(url, requestInit);
  
  // Add NextRequest-specific properties
  return Object.assign(request, {
    cookies: new Map(),
    nextUrl: new URL(url),
    page: undefined,
    ua: undefined,
  });
}

/**
 * Test scenario helpers for common authorization patterns
 */
export const TestScenarios = {
  /**
   * Test with superadmin user (should have access to everything)
   */
  async withSuperAdmin<T>(testFn: (user: ClerkTestUser) => Promise<T>): Promise<T> {
    const user = await TestUsers.getSuperAdmin();
    if (!user) throw new Error('Superadmin test user not found');
    
    mockClerkCurrentUser(user);
    return testFn(user);
  },

  /**
   * Test with review group admin (should have RG-level access)
   */
  async withReviewGroupAdmin<T>(testFn: (user: ClerkTestUser) => Promise<T>): Promise<T> {
    const user = await TestUsers.getReviewGroupAdmin();
    if (!user) throw new Error('Review group admin test user not found');
    
    mockClerkCurrentUser(user);
    return testFn(user);
  },

  /**
   * Test with namespace admin (should have namespace-level access)
   */
  async withNamespaceAdmin<T>(testFn: (user: ClerkTestUser) => Promise<T>): Promise<T> {
    const user = await TestUsers.getNamespaceAdmin();
    if (!user) throw new Error('Namespace admin test user not found');
    
    mockClerkCurrentUser(user);
    return testFn(user);
  },

  /**
   * Test with editor (should have namespace editing access)
   */
  async withEditor<T>(testFn: (user: ClerkTestUser) => Promise<T>): Promise<T> {
    const user = await TestUsers.getEditor();
    if (!user) throw new Error('Editor test user not found');
    
    mockClerkCurrentUser(user);
    return testFn(user);
  },

  /**
   * Test with author (should have limited editing access)
   */
  async withAuthor<T>(testFn: (user: ClerkTestUser) => Promise<T>): Promise<T> {
    const user = await TestUsers.getAuthor();
    if (!user) throw new Error('Author test user not found');
    
    mockClerkCurrentUser(user);
    return testFn(user);
  },

  /**
   * Test with translator (should have translation access only)
   */
  async withTranslator<T>(testFn: (user: ClerkTestUser) => Promise<T>): Promise<T> {
    const user = await TestUsers.getTranslator();
    if (!user) throw new Error('Translator test user not found');
    
    mockClerkCurrentUser(user);
    return testFn(user);
  },

  /**
   * Test with no authentication (should be denied)
   */
  async withNoAuth<T>(testFn: () => Promise<T>): Promise<T> {
    mockClerkCurrentUser(null);
    return testFn();
  },
};

/**
 * Authorization test matrix helper
 * Tests a function with different user types and expected outcomes
 */
export async function testAuthorizationMatrix(
  testFn: (user: ClerkTestUser | null) => Promise<any>,
  expectedResults: {
    superadmin?: 'allow' | 'deny' | 'error';
    reviewGroupAdmin?: 'allow' | 'deny' | 'error';
    namespaceAdmin?: 'allow' | 'deny' | 'error';
    editor?: 'allow' | 'deny' | 'error';
    author?: 'allow' | 'deny' | 'error';
    translator?: 'allow' | 'deny' | 'error';
    noAuth?: 'allow' | 'deny' | 'error';
  }
) {
  const results: Record<string, any> = {};

  // Test superadmin
  if (expectedResults.superadmin) {
    const user = await TestUsers.getSuperAdmin();
    mockClerkCurrentUser(user);
    try {
      results.superadmin = await testFn(user);
    } catch (error) {
      results.superadmin = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Test review group admin
  if (expectedResults.reviewGroupAdmin) {
    const user = await TestUsers.getReviewGroupAdmin();
    mockClerkCurrentUser(user);
    try {
      results.reviewGroupAdmin = await testFn(user);
    } catch (error) {
      results.reviewGroupAdmin = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Test namespace admin
  if (expectedResults.namespaceAdmin) {
    const user = await TestUsers.getNamespaceAdmin();
    mockClerkCurrentUser(user);
    try {
      results.namespaceAdmin = await testFn(user);
    } catch (error) {
      results.namespaceAdmin = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Test editor
  if (expectedResults.editor) {
    const user = await TestUsers.getEditor();
    mockClerkCurrentUser(user);
    try {
      results.editor = await testFn(user);
    } catch (error) {
      results.editor = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Test author
  if (expectedResults.author) {
    const user = await TestUsers.getAuthor();
    mockClerkCurrentUser(user);
    try {
      results.author = await testFn(user);
    } catch (error) {
      results.author = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Test translator
  if (expectedResults.translator) {
    const user = await TestUsers.getTranslator();
    mockClerkCurrentUser(user);
    try {
      results.translator = await testFn(user);
    } catch (error) {
      results.translator = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  // Test no auth
  if (expectedResults.noAuth) {
    mockClerkCurrentUser(null);
    try {
      results.noAuth = await testFn(null);
    } catch (error) {
      results.noAuth = { error: error instanceof Error ? error.message : String(error) };
    }
  }

  return results;
}

/**
 * Helper to create mock context for API route testing
 */
export function createMockContext(params: Record<string, string> = {}) {
  return {
    params: Promise.resolve(params),
  };
}

/**
 * Helper to extract response data from Next.js Response objects
 */
export async function extractResponseData(response: Response) {
  const text = await response.text();
  
  try {
    return {
      status: response.status,
      data: JSON.parse(text),
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch {
    return {
      status: response.status,
      data: text,
      headers: Object.fromEntries(response.headers.entries()),
    };
  }
}

/**
 * Assertion helpers for common test patterns
 */
export const TestAssertions = {
  /**
   * Assert that a response indicates successful authorization
   */
  expectAuthorized(response: { status: number; data: any }) {
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
    expect(response.data?.error).not.toMatch(/unauthorized|permission/i);
  },

  /**
   * Assert that a response indicates failed authentication
   */
  expectUnauthenticated(response: { status: number; data: any }) {
    expect(response.status).toBe(401);
  },

  /**
   * Assert that a response indicates insufficient permissions
   */
  expectForbidden(response: { status: number; data: any }) {
    expect(response.status).toBe(403);
  },

  /**
   * Assert that a response is successful
   */
  expectSuccess(response: { status: number; data: any }) {
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
  },
};
