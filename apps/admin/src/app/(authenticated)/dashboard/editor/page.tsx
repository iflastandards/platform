import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import EditorDashboard from './EditorDashboard';

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = 'force-dynamic';

export default async function EditorDashboardPage() {
  // Get the authenticated user with GitHub metadata
  const user = await getAppUser();

  // Clerk middleware ensures authentication, but double-check
  if (!user) {
    redirect('/sign-in?redirect_url=/dashboard/editor');
  }

  // Verify user has editor or lead role
  const projectRoles = Object.values(user.projects);
  const hasEditorRole = projectRoles.some(p => p.role === 'lead' || p.role === 'editor');
  
  if (!hasEditorRole && user.systemRole !== 'admin' && !user.isReviewGroupAdmin) {
    // Redirect to appropriate dashboard based on their actual role
    if (projectRoles.some(p => p.role === 'reviewer' || p.role === 'translator')) {
      redirect('/dashboard/author');
    } else {
      redirect('/dashboard');
    }
  }

  return <EditorDashboard user={user} />;
}