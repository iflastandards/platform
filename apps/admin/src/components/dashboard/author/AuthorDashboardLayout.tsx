'use client';

import { StandardDashboardLayout } from '@/components/layout/StandardDashboardLayout';
import { getAuthorNavigation } from '@/lib/navigation/author';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface AuthorDashboardLayoutProps {
  children: React.ReactNode;
}

export function AuthorDashboardLayout({ children }: AuthorDashboardLayoutProps) {
  const { user } = useUser();
  const [navigation, setNavigation] = useState(getAuthorNavigation());

  // TODO: Update navigation badges with real counts from user data
  useEffect(() => {
    if (user) {
      // This will be replaced with actual user data fetching
      const updatedNav = getAuthorNavigation().map(item => {
        // Update badge counts based on user data
        // For now, using placeholder values
        return item;
      });
      setNavigation(updatedNav);
    }
  }, [user]);

  return (
    <StandardDashboardLayout
      title="Author Dashboard"
      subtitle="Content Review & Translation"
      navigation={navigation}
    >
      {children}
    </StandardDashboardLayout>
  );
}