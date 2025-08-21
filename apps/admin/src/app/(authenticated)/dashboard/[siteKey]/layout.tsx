import { SiteManagementDashboardLayout } from '@/components/dashboard/site-management/SiteManagementDashboardLayout';

interface Props {
  children: React.ReactNode;
  params: Promise<{ siteKey: string }>;
}

export default async function SiteManagementLayout({
  children,
  params,
}: Props) {
  const { siteKey } = await params;
  return (
    <SiteManagementDashboardLayout siteKey={siteKey}>
      {children}
    </SiteManagementDashboardLayout>
  );
}
