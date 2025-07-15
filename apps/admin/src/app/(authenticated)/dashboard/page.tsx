import { getAppUser, getDashboardRoute } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import PersonalDashboard from './PersonalDashboard';

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Get the authenticated user with GitHub metadata (real or mocked based on IFLA_DEMO)
  const user = await getAppUser();

  // Clerk middleware ensures authentication, but double-check
  if (!user) {
    redirect('/sign-in?redirect_url=/dashboard');
  }

  // Determine the appropriate dashboard based on user's roles
  const dashboardRoute = getDashboardRoute(user);
  
  // If user should go to a different dashboard, redirect them
  if (dashboardRoute !== '/dashboard') {
    redirect(dashboardRoute);
  }

  // Show the personal dashboard for regular users
  return <PersonalDashboard user={user} />;
}