import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import { AuthorProjectsPage } from '@/components/dashboard/author/ProjectsPage';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const user = await getAppUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/dashboard/author/projects');
  }

  return <AuthorProjectsPage user={user} />;
}