import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ReviewGroupDashboard from './ReviewGroupDashboard';
import { mockUsers } from '@/lib/mock-data/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ReviewGroupAdminPageProps {
  searchParams: Promise<{ demo?: string; userId?: string }>;
}

export default async function ReviewGroupAdminPage({
  searchParams,
}: ReviewGroupAdminPageProps) {
  const { demo, userId } = await searchParams;
  const isDemo = demo === 'true';

  // In demo mode, use mock data
  if (isDemo) {
    const demoUserId = userId || 'user-editor-1';
    const demoUser = mockUsers.find((u) => u.id === demoUserId) || mockUsers[1];

    // Only allow users with review group admin role to access this page
    if (!demoUser.publicMetadata.reviewGroupAdmin?.length) {
      redirect('/dashboard?demo=true&userId=' + demoUserId);
    }

    return (
      <ReviewGroupDashboard
        userRoles={[demoUser.publicMetadata.iflaRole || 'member']}
        userName={demoUser.name}
        userEmail={demoUser.email}
        reviewGroups={demoUser.publicMetadata.reviewGroupAdmin || []}
      />
    );
  }

  // Production mode - use real auth
  const user = await currentUser();
  if (!user) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent('/dashboard/rg')}`);
  }

  // Check if user has review group admin role
  const publicMetadata = user.publicMetadata as {
    iflaRole?: string;
    reviewGroupAdmin?: string[];
  };

  const hasReviewGroupAdmin = publicMetadata?.reviewGroupAdmin?.length;
  if (!hasReviewGroupAdmin) {
    redirect('/dashboard'); // Redirect to regular dashboard
  }

  return (
    <ReviewGroupDashboard
      userRoles={[publicMetadata?.iflaRole || 'member']}
      userName={(user.firstName || '') + ' ' + (user.lastName || '')}
      userEmail={user.emailAddresses?.[0]?.emailAddress}
      reviewGroups={publicMetadata?.reviewGroupAdmin || []}
    />
  );
}
