import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import { AuthorNamespacesPage } from '@/components/dashboard/author/NamespacesPage';

export const dynamic = 'force-dynamic';

export default async function NamespacesPage() {
  const user = await getAppUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/dashboard/author/namespaces');
  }

  return <AuthorNamespacesPage user={user} />;
}