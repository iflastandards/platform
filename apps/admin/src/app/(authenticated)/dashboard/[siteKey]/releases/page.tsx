import { SiteReleasesPage } from '@/components/dashboard/site-management/SiteReleasesPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteReleasesPageRoute({ params }: Props) {
  return <SiteReleasesPage siteKey={params.siteKey} />;
}
