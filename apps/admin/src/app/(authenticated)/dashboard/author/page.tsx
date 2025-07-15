import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import AuthorDashboard from './AuthorDashboard';

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = 'force-dynamic';

export default async function AuthorDashboardPage() {
  // Get the authenticated user with GitHub metadata
  const user = await getAppUser();

  // Clerk middleware ensures authentication, but double-check
  if (!user) {
    redirect('/sign-in?redirect_url=/dashboard/author');
  }

  // Verify user has author role (reviewer or translator)
  const projectRoles = Object.values(user.projects);
  const hasAuthorRole = projectRoles.some(p => p.role === 'reviewer' || p.role === 'translator');
  
  if (!hasAuthorRole && user.systemRole !== 'admin' && !user.isReviewGroupAdmin) {
    // Redirect to appropriate dashboard based on their actual role
    if (projectRoles.some(p => p.role === 'lead' || p.role === 'editor')) {
      redirect('/dashboard/editor');
    } else {
      redirect('/dashboard');
    }
  }

  return <AuthorDashboard user={user} />;
}