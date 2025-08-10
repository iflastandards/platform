import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import { SharedNamespacesPage } from '@/components/dashboard/shared/NamespacesPage';

export const dynamic = 'force-dynamic';

export default async function NamespacesPage() {
  const user = await getAppUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/dashboard/editor/namespaces');
  }

  return <SharedNamespacesPage user={user} role="editor" />;
}
