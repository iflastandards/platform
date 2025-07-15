import { getCerbosUser } from '@/lib/clerk-cerbos';
import { redirect } from 'next/navigation';
import NamespacesList from './NamespacesList';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface NamespacesPageProps {
  searchParams: Promise<{ demo?: string; userId?: string }>;
}

export default async function NamespacesPage({
  searchParams,
}: NamespacesPageProps) {
  const { demo, userId } = await searchParams;
  const isDemo = demo === 'true';

  // In demo mode, use mock data
  if (isDemo) {
    const demoUserId = userId || 'user-admin-1';
    return <NamespacesList userId={demoUserId} isDemo={true} />;
  }

  // Production mode - use real auth
  const user = await getCerbosUser();
  if (!user) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent('/namespaces')}`);
  }

  return <NamespacesList />;
}