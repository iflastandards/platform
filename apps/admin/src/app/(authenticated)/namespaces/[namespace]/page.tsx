import { notFound, redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import NamespaceDashboard from './NamespaceDashboard';
import { mockNamespaces } from '@/lib/mock-data/namespaces-extended';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface NamespacePageProps {
  params: Promise<{ namespace: string }>;
  searchParams: Promise<{ demo?: string; userId?: string }>;
}

export default async function NamespacePage({
  params,
  searchParams,
}: NamespacePageProps) {
  const { namespace } = await params;
  const { demo, userId } = await searchParams;
  const isDemo = demo === 'true';

  // Validate namespace exists
  const namespaceData = Object.values(mockNamespaces).find(ns => ns.slug === namespace);
  if (!namespaceData) {
    notFound();
  }

  // In demo mode, use mock data
  if (isDemo) {
    const demoUserId = userId || 'user-admin-1';
    return (
      <NamespaceDashboard 
        namespace={namespace} 
        userId={demoUserId}
        isDemo={true}
      />
    );
  }

  // Production mode - use real auth
  const user = await getAuthUser();
  if (!user) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/namespaces/${namespace}`)}`);
  }

  return <NamespaceDashboard namespace={namespace} />;
}