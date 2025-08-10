import { SiteManagementDashboardLayout } from '@/components/dashboard/site-management/SiteManagementDashboardLayout';

interface Props {
  children: React.ReactNode;
  params: { siteKey: string };
}

export default function SiteManagementLayout({ children, params }: Props) {
  return (
    <SiteManagementDashboardLayout siteKey={params.siteKey}>
      {children}
    </SiteManagementDashboardLayout>
  );
}