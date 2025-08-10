import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import { SharedProjectsPage } from '@/components/dashboard/shared/ProjectsPage';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const user = await getAppUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/dashboard/editor/projects');
  }

  return <SharedProjectsPage user={user} role="editor" />;
}
