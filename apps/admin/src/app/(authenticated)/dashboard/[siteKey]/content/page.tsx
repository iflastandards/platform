import { SiteContentManagementPage } from '@/components/dashboard/site-management/SiteContentManagementPage';

interface Props {
  params: Promise<{ siteKey: string }>;
}

export default async function SiteContentPage({ params }: Props) {
  const { siteKey } = await params;
  return <SiteContentManagementPage siteKey={siteKey} />;
}
