import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AdminDashboard from '../AdminDashboard';
import { mockUsers } from '@/lib/mock-data/auth';
import { addBasePath } from '@ifla/theme/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface SuperAdminPageProps {
  searchParams: Promise<{ demo?: string; userId?: string }>;
}

export default async function SuperAdminPage({
  searchParams,
}: SuperAdminPageProps) {
  const { demo, userId } = await searchParams;
  const isDemo = demo === 'true';

  // In demo mode, use mock data
  if (isDemo) {
    const demoUserId = userId || 'user-admin-1';
    const demoUser = mockUsers.find((u) => u.id === demoUserId) || mockUsers[0];

    // Only allow admin users to access this page
    if (demoUser.publicMetadata.iflaRole !== 'admin') {
      redirect('/dashboard?demo=true&userId=' + demoUserId);
    }

    return (
      <AdminDashboard
        userRoles={[demoUser.publicMetadata.iflaRole || 'member']}
        userName={demoUser.name}
        userEmail={demoUser.email}
      />
    );
  }

  // Production mode - use real auth
  const user = await currentUser();
  if (!user) {
    redirect(addBasePath(`/sign-in?redirect_url=${encodeURIComponent(addBasePath('/dashboard/admin'))}`));
  }

  // Check if user has admin role
  const publicMetadata = user.publicMetadata as { iflaRole?: string };
  const isAdmin = publicMetadata?.iflaRole === 'admin';
  if (!isAdmin) {
    redirect('/dashboard'); // Redirect non-admins to regular dashboard
  }

  return (
    <AdminDashboard
      userRoles={[publicMetadata?.iflaRole || 'member']}
      userName={(user.firstName || '') + ' ' + (user.lastName || '')}
      userEmail={user.emailAddresses?.[0]?.emailAddress}
    />
  );
}
