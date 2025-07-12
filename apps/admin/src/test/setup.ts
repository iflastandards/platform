import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

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
  auth: vi.fn(() => Promise.resolve({
    userId: null,
    sessionId: null,
    sessionClaims: null,
  })),
  currentUser: vi.fn(() => Promise.resolve(null)),
  clerkMiddleware: vi.fn(() => vi.fn()),
}));

// Mock clerk-cerbos bridge
vi.mock('@/lib/clerk-cerbos', () => ({
  getCerbosUser: vi.fn(() => Promise.resolve(null)),
  userHasRole: vi.fn(() => Promise.resolve(false)),
  getUserNamespaceRole: vi.fn(() => Promise.resolve(null)),
  getUserSiteRole: vi.fn(() => Promise.resolve(null)),
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