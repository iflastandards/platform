import { SiteWorkflowPage } from '@/components/dashboard/site-management/SiteWorkflowPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteWorkflowPageRoute({ params }: Props) {
  return <SiteWorkflowPage siteKey={params.siteKey} />;
}
