import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getDefaultDashboardRoute } from '@/lib/auth-routing';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';
  const userId = searchParams.get('userId');

  // Handle demo mode - only redirect to dashboard if userId is provided
  if (demo && userId) {
    const demoUserId = userId;
    // Import mock users dynamically to avoid build issues
    const { mockUsers } = await import('@/lib/mock-data/auth');
    const demoUser = mockUsers.find((u) => u.id === demoUserId) || mockUsers[0];

    const dashboardRoute = getDefaultDashboardRoute(demoUser, true);
    const separator = dashboardRoute.includes('?') ? '&' : '?';
    const fullUrl = `${dashboardRoute}${separator}userId=${demoUserId}`;

    return NextResponse.redirect(new URL(fullUrl, request.url));
  }

  // If demo=true but no userId, redirect back to /admin (they clicked login button)
  if (demo && !userId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Production mode - check if user is already authenticated
  const user = await currentUser();
  if (user) {
    const publicMetadata = user.publicMetadata as {
      iflaRole?: 'member' | 'staff' | 'admin';
      reviewGroupAdmin?: string[];
      externalContributor?: boolean;
    };

    const dashboardRoute = getDefaultDashboardRoute({ publicMetadata });
    return NextResponse.redirect(new URL(dashboardRoute, request.url));
  }

  // Redirect to Clerk's sign-in page with proper callback
  const signInUrl = `/sign-in?redirect_url=${encodeURIComponent('/api/auth/callback')}`;
  return NextResponse.redirect(new URL(signInUrl, request.url));
}
