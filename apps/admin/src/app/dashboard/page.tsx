import { getCerbosUser } from '@/lib/clerk-cerbos';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  searchParams: Promise<{ sitekey?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const user = await getCerbosUser();
  const params = await searchParams;
  const sitekey = params.sitekey;

  // Clerk middleware ensures authentication, but double-check
  if (!user) {
    const returnUrl = sitekey ? `/dashboard?sitekey=${sitekey}` : '/dashboard';
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
  }

  const userRoles = user.roles || [];
  
  // Check if user has admin access
  const adminRoles = ['superadmin', 'ifla-admin', 'standards-admin'];
  const hasAdminAccess = userRoles.some(role => adminRoles.includes(role));
  
  if (!hasAdminAccess) {
    // If not admin, redirect to a more limited dashboard or show sites they have access to
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Limited Access
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You don't have administrator access. Please contact an admin if you need elevated permissions.
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Your roles:</strong> {userRoles.join(', ') || 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard userRoles={userRoles} userName={user.name || undefined} userEmail={user.email || undefined} />;
}