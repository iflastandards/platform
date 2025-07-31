import { vi } from 'vitest';
import type { MockUser } from '@/app/lib/mock-auth';

/**
 * Mock Clerk authentication for testing
 * This allows tests to set up authenticated users with specific roles
 */

let currentMockUser: MockUser | null = null;

/**
 * Set the current mock user for Clerk authentication
 */
export function setMockUser(user: MockUser | null) {
  currentMockUser = user;
  
  // Update the Clerk mocks to return this user
  const clerkServerModule = vi.mocked(await import('@clerk/nextjs/server'));
  const authModule = vi.mocked(await import('@/lib/auth'));
  
  if (user) {
    // Mock Clerk server functions
    clerkServerModule.auth.mockResolvedValue({
      userId: user.id,
      sessionId: `session-${user.id}`,
      sessionClaims: {
        metadata: {
          roles: user.roles,
        },
      },
    });
    
    clerkServerModule.currentUser.mockResolvedValue({
      id: user.id,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      fullName: user.name,
      emailAddresses: [
        {
          emailAddress: user.email,
          id: `email-${user.id}`,
          verification: {
            status: 'verified',
            strategy: 'email_code',
            verifiedAtClient: new Date().toISOString(),
          },
        },
      ],
      publicMetadata: {
        roles: user.roles,
      },
    } as any);
    
    // Mock auth helper
    authModule.getAuthUser.mockResolvedValue({
      id: user.id,
      email: user.email,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      imageUrl: '',
      roles: user.roles,
    });
  } else {
    // Reset to unauthenticated state
    clerkServerModule.auth.mockResolvedValue({
      userId: null,
      sessionId: null,
      sessionClaims: null,
    });
    
    clerkServerModule.currentUser.mockResolvedValue(null);
    
    authModule.getAuthUser.mockResolvedValue(null);
  }
  
  // Also update client-side Clerk mocks
  const clerkClientModule = vi.mocked(await import('@clerk/nextjs'));
  
  clerkClientModule.useAuth.mockReturnValue({
    userId: user?.id || null,
    sessionId: user ? `session-${user.id}` : null,
    isSignedIn: !!user,
    isLoaded: true,
  } as any);
  
  clerkClientModule.useUser.mockReturnValue({
    user: user ? {
      id: user.id,
      fullName: user.name,
      primaryEmailAddress: {
        emailAddress: user.email,
      },
    } : null,
    isLoaded: true,
    isSignedIn: !!user,
  } as any);
}

/**
 * Clear the current mock user
 */
export function clearMockUser() {
  setMockUser(null);
}

/**
 * Get the current mock user
 */
export function getMockUser(): MockUser | null {
  return currentMockUser;
}