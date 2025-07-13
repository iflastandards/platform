import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ImportWorkflow from './ImportWorkflow';
import { mockUsers } from '@/lib/mock-data/auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ImportPageProps {
  searchParams: Promise<{ demo?: string; userId?: string }>;
}

export default async function ImportPage({
  searchParams,
}: ImportPageProps) {
  const { demo, userId } = await searchParams;
  const isDemo = demo === 'true';

  // In demo mode, use mock data
  if (isDemo) {
    const demoUserId = userId || 'user-admin-1';
    const demoUser = mockUsers.find(u => u.id === demoUserId) || mockUsers[0];

    return (
      <ImportWorkflow 
        userRoles={[demoUser.publicMetadata.iflaRole || 'member']}
        userName={demoUser.name}
        userEmail={demoUser.email}
        accessibleNamespaces={[]}
      />
    );
  }

  // Production mode - use real auth
  const user = await currentUser();
  if (!user) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent('/import')}`);
  }

  const publicMetadata = user.publicMetadata as { iflaRole?: string };

  return (
    <ImportWorkflow 
      userRoles={[publicMetadata?.iflaRole || 'member']}
      userName={(user.firstName || '') + ' ' + (user.lastName || '')}
      userEmail={user.emailAddresses?.[0]?.emailAddress}
      accessibleNamespaces={[]}
    />
  );
}