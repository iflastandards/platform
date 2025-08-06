/**
 * Integration Test Setup
 * 
 * This setup file is for @integration tests that need real Clerk API access.
 * It follows our integration-first philosophy by using real I/O and actual services.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Set up REAL environment variables for integration tests
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
  'pk_test_c3dlZXBpbmctd29tYmF0LTk4LmNsZXJrLmFjY291bnRzLmRldiQ';
process.env.CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 
  'sk_test_ESvATm31uLLeCT4hbGHwBXssmsfqevuGFTVnthvMUn';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router (still needed for integration tests)
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

// DO NOT mock Clerk for integration tests - use real API calls
// Only mock UI components that aren't relevant for API testing
vi.mock('@clerk/nextjs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@clerk/nextjs')>();
  return {
    ...actual,
    // Keep real auth hooks and providers, only mock UI components
    ClerkProvider: vi.fn(({ children }) => children),
    SignInButton: vi.fn(({ children }) => children || 'Sign In'),
    SignUpButton: vi.fn(({ children }) => children || 'Sign Up'),
    SignOutButton: vi.fn(({ children }) => children || 'Sign Out'),
    UserButton: vi.fn(() => 'User Button'),
    SignedIn: vi.fn(({ children }) => children),
    SignedOut: vi.fn(({ children }) => children),
  };
});

// DO NOT mock @clerk/nextjs/server - we want real API calls for integration tests
// The clerkClient, currentUser, and auth functions should make real API calls

// Global fetch mock (but allow real network requests)
const originalFetch = global.fetch;
global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
  // Allow real Clerk API calls
  const url = input?.toString();
  if (url?.includes('clerk.') || url?.includes('api.clerk')) {
    return originalFetch(input, init);
  }
  // Mock other fetch calls as needed
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response);
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Console override for cleaner test output
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress known test warnings but keep real errors
  const message = args[0]?.toString() || '';
  if (
    message.includes('Warning: ReactDOM.render is deprecated') ||
    message.includes('Warning: componentWillReceiveProps') ||
    message.includes('act(...) is not supported')
  ) {
    return;
  }
  originalConsoleError(...args);
};