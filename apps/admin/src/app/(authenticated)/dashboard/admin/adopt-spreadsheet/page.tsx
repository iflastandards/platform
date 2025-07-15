import { getAppUser } from '@/lib/clerk-github-auth';
import { redirect } from 'next/navigation';
import AdoptSpreadsheetForm from './AdoptSpreadsheetForm';
import { addBasePath } from '@ifla/theme/utils';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdoptSpreadsheetPage() {
  const user = await getAppUser();
  
  if (!user) {
    redirect(addBasePath(`/sign-in?redirect_url=${encodeURIComponent(addBasePath('/dashboard/admin/adopt-spreadsheet'))}`));
  }

  // Check if user has system admin role
  if (user.systemRole !== 'admin') {
    // Redirect non-admins to appropriate dashboard
    redirect(addBasePath('/dashboard'));
  }

  return (
    <AdoptSpreadsheetForm
      userId={user.id}
      userName={user.name}
      userEmail={user.email}
    />
  );
}