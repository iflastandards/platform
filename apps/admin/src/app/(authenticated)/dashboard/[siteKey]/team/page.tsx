import { SiteTeamManagementPage } from '@/components/dashboard/site-management/SiteTeamManagementPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteTeamPage({ params }: Props) {
  return <SiteTeamManagementPage siteKey={params.siteKey} />;
}