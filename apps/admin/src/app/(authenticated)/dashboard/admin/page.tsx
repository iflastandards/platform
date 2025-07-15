import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import AdminDashboard from '../AdminDashboard';
import { addBasePath } from '@ifla/theme/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  const user = await getAppUser();
  
  if (!user) {
    redirect(addBasePath(`/sign-in?redirect_url=${encodeURIComponent(addBasePath('/dashboard/admin'))}`));
  }

  // Check if user has system admin role
  if (user.systemRole !== 'admin') {
    // Redirect non-admins to appropriate dashboard
    if (user.isReviewGroupAdmin) {
      redirect('/dashboard/rg');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <AdminDashboard
      userRoles={['admin']}
      userName={user.name}
      userEmail={user.email}
    />
  );
}
