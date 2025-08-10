import { SiteRdfManagementPage } from '@/components/dashboard/site-management/SiteRdfManagementPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteRdfPage({ params }: Props) {
  return <SiteRdfManagementPage siteKey={params.siteKey} />;
}