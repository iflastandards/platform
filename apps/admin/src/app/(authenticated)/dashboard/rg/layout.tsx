import { ReviewGroupDashboardLayout } from '@/components/dashboard/rg/ReviewGroupDashboardLayout';

interface RGLayoutProps {
  children: React.ReactNode;
}

export default function RGLayout({ children }: RGLayoutProps) {
  return (
    <ReviewGroupDashboardLayout>
      {children}
    </ReviewGroupDashboardLayout>
  );
}