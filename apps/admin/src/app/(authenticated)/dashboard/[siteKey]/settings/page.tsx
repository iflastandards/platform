import { SiteSettingsPage } from '@/components/dashboard/site-management/SiteSettingsPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteSettingsPageRoute({ params }: Props) {
  return <SiteSettingsPage siteKey={params.siteKey} />;
}
