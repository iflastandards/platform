'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import WelcomePage from '@/components/welcome/WelcomePage';

export default function HomePage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      // Role-based redirect logic
      const role = user?.publicMetadata?.role;
      if (role === 'superadmin') router.replace('/dashboard');
      else if (role === 'editor') router.replace('/editor/dashboard');
      else router.replace('/dashboard');
    }
  }, [isSignedIn, user, router]);

  // When user signs out, they are redirected here and see the welcome page
  // The navbar is only shown in authenticated routes under (authenticated)/
  if (!isSignedIn) {
    return <WelcomePage />;
  }

  // During sign-in process, show nothing while redirecting
  return null;
}
