'use client';

import { StandardDashboardLayout } from '@/components/layout/StandardDashboardLayout';
import { rgNavigation } from '@/lib/navigation/review-group';

interface ReviewGroupDashboardLayoutProps {
  children: React.ReactNode;
}

export function ReviewGroupDashboardLayout({ children }: ReviewGroupDashboardLayoutProps) {
  // In production, this would get the actual review group names from context
  const reviewGroupNames = 'ISBD Review Group'; // Placeholder
  
  return (
    <StandardDashboardLayout
      title="Review Group Admin"
      subtitle={reviewGroupNames}
      navigation={rgNavigation}
    >
      {children}
    </StandardDashboardLayout>
  );
}