import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import PendingDashboard from './PendingDashboard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function PendingPage() {
  const user = await getAppUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // If user has access, redirect to appropriate dashboard
  if (user.accessibleNamespaces.length > 0 || user.systemRole === 'admin' || user.isReviewGroupAdmin) {
    const dashboardRoute = 
      user.systemRole === 'admin' ? '/dashboard/admin' :
      user.isReviewGroupAdmin ? '/dashboard/rg' :
      '/dashboard';
    
    redirect(dashboardRoute);
  }

  return <PendingDashboard user={user} />;
}