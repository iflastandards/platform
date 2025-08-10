import { SiteOverviewPage } from '@/components/dashboard/site-management/SiteOverviewPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteDashboardPage({ params }: Props) {
  return <SiteOverviewPage siteKey={params.siteKey} />;
}
