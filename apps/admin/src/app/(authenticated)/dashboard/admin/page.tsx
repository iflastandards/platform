import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import AdminDashboard from '../AdminDashboard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
  const user = await getAppUser();
  
  if (!user) {
    redirect('/auth/sign-in');
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
