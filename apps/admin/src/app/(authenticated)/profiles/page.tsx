import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ProfilesManager from './ProfilesManager';
import { mockUsers } from '@/lib/mock-data/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ProfilesPageProps {
  searchParams: Promise<{ demo?: string; userId?: string }>;
}

export default async function ProfilesPage({
  searchParams,
}: ProfilesPageProps) {
  const { demo, userId } = await searchParams;
  const isDemo = demo === 'true';

  // In demo mode, use mock data
  if (isDemo) {
    const demoUserId = userId || 'user-admin-1';
    const demoUser = mockUsers.find(u => u.id === demoUserId) || mockUsers[0];

    return (
      <ProfilesManager 
        userRoles={[demoUser.publicMetadata.iflaRole || 'member']}
        userName={demoUser.name}
        userEmail={demoUser.email}
      />
    );
  }

  // Production mode - use real auth
  const user = await currentUser();
  if (!user) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent('/profiles')}`);
  }

  const publicMetadata = user.publicMetadata as { iflaRole?: string };

  return (
    <ProfilesManager 
      userRoles={[publicMetadata?.iflaRole || 'member']}
      userName={(user.firstName || '') + ' ' + (user.lastName || '')}
      userEmail={user.emailAddresses?.[0]?.emailAddress}
    />
  );
}