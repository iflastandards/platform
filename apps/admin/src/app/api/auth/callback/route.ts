import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDefaultDashboardRoute } from '@/lib/auth-routing';
import { addBasePath } from '@ifla/theme/utils';

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
    // For now, use a simple username-based check
    // TODO: Implement proper GitHub API integration when Clerk token access is available
    const githubUsername = githubAccount.username;
    const adminUsernames = ['jonphipps']; // Add known admin usernames

    console.log('GitHub account detected:', {
      username: githubUsername,
      emailAddress: githubAccount.emailAddress,
    });

    if (adminUsernames.includes(githubUsername || '')) {
      detectedRole = 'admin';
      console.log('User granted admin role based on username:', githubUsername);
    }
  }

  const publicMetadata = user.publicMetadata as {
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
