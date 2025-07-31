import { currentUser } from '@clerk/nextjs/server';

/**
 * Get the current authenticated user
 * This replaces the old getCerbosUser function
 */
export async function getAuthUser() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }
  
  // Return a simplified user object with roles from public metadata
  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    imageUrl: user.imageUrl || '',
    roles: (user.publicMetadata?.roles as string[]) || [],
  };
}