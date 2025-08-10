import { SiteElementsPage } from '@/components/dashboard/site-management/SiteElementsPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteElementsPageRoute({ params }: Props) {
  return <SiteElementsPage siteKey={params.siteKey} />;
}
