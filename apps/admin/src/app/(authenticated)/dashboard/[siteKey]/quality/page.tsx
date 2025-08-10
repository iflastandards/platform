import { SiteQualityPage } from '@/components/dashboard/site-management/SiteQualityPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteQualityPageRoute({ params }: Props) {
  return <SiteQualityPage siteKey={params.siteKey} />;
}
