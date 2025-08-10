import { SiteGithubPage } from '@/components/dashboard/site-management/SiteGithubPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteGithubPageRoute({ params }: Props) {
  return <SiteGithubPage siteKey={params.siteKey} />;
}
