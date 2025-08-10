'use client';

import { StandardDashboardLayout } from '@/components/layout/StandardDashboardLayout';
import { adminNavigation } from '@/lib/navigation/admin';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  return (
    <StandardDashboardLayout
      title="IFLA Admin"
      subtitle="System Administration"
      navigation={adminNavigation}
    >
      {children}
    </StandardDashboardLayout>
  );
}