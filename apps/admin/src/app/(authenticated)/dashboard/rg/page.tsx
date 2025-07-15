import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import ReviewGroupDashboard from './ReviewGroupDashboard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ReviewGroupAdminPage() {
  const user = await getAppUser();
  
  if (!user) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent('/dashboard/rg')}`);
  }

  // Check if user has review group admin role
  if (!user.isReviewGroupAdmin) {
    // Redirect to appropriate dashboard
    if (user.systemRole === 'admin') {
      redirect('/dashboard/admin');
    } else {
      redirect('/dashboard');
    }
  }

  // Get list of review groups where user is maintainer
  const adminReviewGroups = user.reviewGroups
    .filter(rg => rg.role === 'maintainer')
    .map(rg => rg.slug);

  return (
    <ReviewGroupDashboard
      userRoles={['rg_admin']}
      userName={user.name}
      userEmail={user.email}
      reviewGroups={adminReviewGroups}
    />
  );
}
