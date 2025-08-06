import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Set up test environment variables
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY =
  'pk_test_Y2xlcmstdGVzdC1rZXktZm9yLXRlc3RpbmctcHVycG9zZXMtb25seQ';
process.env.CLERK_SECRET_KEY =
  'sk_test_dGVzdC1zZWNyZXQta2V5LWZvci10ZXN0aW5nLXB1cnBvc2VzLW9ubHk';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
  redirect: vi.fn(),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: vi.fn(({ children }) => children),
  SignInButton: vi.fn(({ children }) => children || 'Sign In'),
  SignUpButton: vi.fn(({ children }) => children || 'Sign Up'),
  SignOutButton: vi.fn(({ children }) => children || 'Sign Out'),
  UserButton: vi.fn(() => 'User Button'),
  SignedIn: vi.fn(({ children }) => children),
  SignedOut: vi.fn(({ children }) => children),
  useAuth: vi.fn(() => ({
    userId: null,
    sessionId: null,
    isSignedIn: false,
    isLoaded: true,
  })),
  useUser: vi.fn(() => ({
    user: null,
    isLoaded: true,
    isSignedIn: false,
  })),
}));

// Mock Clerk server
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() =>
    Promise.resolve({
      userId: null,
      sessionId: null,
      sessionClaims: null,
    }),
  ),
  currentUser: vi.fn(() => Promise.resolve(null)),
  clerkMiddleware: vi.fn(() => vi.fn()),
  clerkClient: vi.fn(() => ({
    users: {
      getUser: vi.fn(() => Promise.resolve({
        id: 'test-user-id',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'Test',
        lastName: 'User',
        publicMetadata: {},
        privateMetadata: {},
      })),
      getUserList: vi.fn(() => Promise.resolve({
        data: [
          {
            id: 'user_superadmin123',
            emailAddresses: [{ emailAddress: 'superadmin+clerk_test@example.com' }],
            firstName: 'Super',
            lastName: 'Admin',
            publicMetadata: {
              systemRole: 'superadmin',
              reviewGroups: [],
              teams: [],
              translations: [],
            },
            privateMetadata: {},
          },
          {
            id: 'user_rgadmin123',
            emailAddresses: [{ emailAddress: 'rg_admin+clerk_test@example.com' }],
            firstName: 'Review Group',
            lastName: 'Admin',
            publicMetadata: {
              systemRole: undefined,
              reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
              teams: [],
              translations: [],
            },
            privateMetadata: {},
          },
          {
            id: 'user_editor123',
            emailAddresses: [{ emailAddress: 'editor+clerk_test@example.com' }],
            firstName: 'Test',
            lastName: 'Editor',
            publicMetadata: {
              systemRole: undefined,
              reviewGroups: [],
              teams: [{ teamId: 'isbd-team-1', role: 'editor', reviewGroup: 'isbd', namespaces: ['isbd', 'isbdm'] }],
              translations: [],
            },
            privateMetadata: {},
          },
          {
            id: 'user_author123',
            emailAddresses: [{ emailAddress: 'author+clerk_test@example.com' }],
            firstName: 'Test',
            lastName: 'Author',
            publicMetadata: {
              systemRole: undefined,
              reviewGroups: [],
              teams: [{ teamId: 'lrm-team-1', role: 'author', reviewGroup: 'bcm', namespaces: ['lrm'] }],
              translations: [],
            },
            privateMetadata: {},
          },
          {
            id: 'user_translator123',
            emailAddresses: [{ emailAddress: 'translator+clerk_test@example.com' }],
            firstName: 'Test',
            lastName: 'Translator',
            publicMetadata: {
              systemRole: undefined,
              reviewGroups: [],
              teams: [],
              translations: [{ language: 'fr', namespaces: ['isbd', 'lrm'] }],
            },
            privateMetadata: {},
          },
        ],
        totalCount: 5,
      })),
    },
  })),
}));

// Mock auth helper
vi.mock('@/lib/auth', () => ({
  getAuthUser: vi.fn(() => Promise.resolve(null)),
}));

// Global fetch mock
global.fetch = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
