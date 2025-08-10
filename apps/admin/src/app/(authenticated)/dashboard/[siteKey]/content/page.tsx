import { SiteContentManagementPage } from '@/components/dashboard/site-management/SiteContentManagementPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteContentPage({ params }: Props) {
  return <SiteContentManagementPage siteKey={params.siteKey} />;
}