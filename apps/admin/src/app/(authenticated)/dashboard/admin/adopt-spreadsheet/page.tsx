import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import AdoptSpreadsheetFormV2 from './AdoptSpreadsheetFormV2';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdoptSpreadsheetPage() {
  const user = await getAppUser();
  
  if (!user) {
    redirect('/auth/sign-in');
  }

  // Check if user has system admin role
  if (user.systemRole !== 'admin') {
    // Redirect non-admins to appropriate dashboard
    if (user.isReviewGroupAdmin) {
      redirect('/dashboard/rg');
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <AdoptSpreadsheetFormV2
      userId={user.id}
      userName={user.name}
      userEmail={user.email}
    />
  );
}