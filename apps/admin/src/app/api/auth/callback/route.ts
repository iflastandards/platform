import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDefaultDashboardRoute } from '@/lib/auth-routing';
import { addBasePath } from '@ifla/theme/utils';
import { checkAndSyncGitHubData } from '@/lib/github-integration';

export async function GET(request: NextRequest) {
  // Get the authenticated user
  const user = await currentUser();

  if (!user) {
    // If no user, redirect to sign-in
    return NextResponse.redirect(new URL(addBasePath('/sign-in'), request.url));
  }

  // Check for GitHub organization membership
  const githubAccount = user.externalAccounts?.find(
    (account) => account.provider === 'github',
  );
  let detectedRole: 'member' | 'staff' | 'admin' = 'member';

  if (githubAccount) {
    // Sync GitHub data and check organization ownership
    try {
      await checkAndSyncGitHubData(user.id);
      
      // Re-fetch user to get updated metadata
      const { currentUser: refreshUser } = await import('@clerk/nextjs/server');
      const updatedUser = await refreshUser();
      
      if (updatedUser?.publicMetadata?.systemRole === 'superadmin') {
        detectedRole = 'admin';
        console.log('User granted superadmin role based on GitHub org ownership');
      }
    } catch (error) {
      console.error('Error syncing GitHub data:', error);
      // Fall back to username-based check
      const githubUsername = githubAccount.username;
      const adminUsernames = ['jonphipps']; // Fallback for known admins

      console.log('GitHub account detected:', {
        username: githubUsername,
        emailAddress: githubAccount.emailAddress,
      });

      if (adminUsernames.includes(githubUsername || '')) {
        detectedRole = 'admin';
        console.log('User granted admin role based on username (fallback):', githubUsername);
      }
    }
  }

  const publicMetadata = user.publicMetadata as {
    systemRole?: 'superadmin';
    iflaRole?: 'member' | 'staff' | 'admin';
    reviewGroupAdmin?: string[];
    externalContributor?: boolean;
  };

  // Use detected role if no role is already set
  const effectiveRole = publicMetadata.iflaRole || detectedRole;

  console.log('Role assignment:', {
    existingRole: publicMetadata.iflaRole,
    detectedRole,
    effectiveRole,
  });

  // Route user to appropriate dashboard based on their role
  const dashboardRoute = getDefaultDashboardRoute({
    publicMetadata: {
      ...publicMetadata,
      iflaRole: effectiveRole,
    },
  });

  console.log('Redirecting to dashboard:', dashboardRoute);

  return NextResponse.redirect(new URL(dashboardRoute, request.url));
}
