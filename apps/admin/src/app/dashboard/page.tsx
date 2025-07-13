import { getCerbosUser } from '@/lib/clerk-cerbos';
import { redirect } from 'next/navigation';
import RoleBasedDashboard from './RoleBasedDashboard';

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  searchParams: Promise<{ sitekey?: string; demo?: string; userId?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const sitekey = params.sitekey;
  const isDemo = params.demo === 'true';

  // In demo mode, use mock data
  if (isDemo) {
    // Get demo user from query param or default to admin
    const demoUserId = params.userId || 'user-admin-1';
    return <RoleBasedDashboard userId={demoUserId} />;
  }

  // Production mode - use real auth
  const user = await getCerbosUser();

  // Clerk middleware ensures authentication, but double-check
  if (!user) {
    const returnUrl = sitekey ? `/dashboard?sitekey=${sitekey}` : '/dashboard';
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
  }

  // For now, show the role-based dashboard for all users
  // In production, you would map the real user to appropriate roles
  return <RoleBasedDashboard />;
}