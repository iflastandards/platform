'use client';

import { StandardDashboardLayout } from '@/components/layout/StandardDashboardLayout';
import { getEditorNavigation } from '@/lib/navigation/editor';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface EditorDashboardLayoutProps {
  children: React.ReactNode;
}

export function EditorDashboardLayout({ children }: EditorDashboardLayoutProps) {
  const { user } = useUser();
  const [navigation, setNavigation] = useState(getEditorNavigation());

  // TODO: Update navigation badges with real counts from user data
  useEffect(() => {
    if (user) {
      // This will be replaced with actual user data fetching
      const updatedNav = getEditorNavigation().map(item => {
        // Update badge counts based on user data
        // For now, using placeholder values
        return item;
      });
      setNavigation(updatedNav);
    }
  }, [user]);

  return (
    <StandardDashboardLayout
      title="Editor Dashboard"
      subtitle="Editorial Control Center"
      navigation={navigation}
    >
      {children}
    </StandardDashboardLayout>
  );
}