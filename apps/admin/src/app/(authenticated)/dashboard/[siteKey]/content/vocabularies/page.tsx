import { SiteVocabulariesPage } from '@/components/dashboard/site-management/SiteVocabulariesPage';

interface Props {
  params: { siteKey: string };
}

export default function SiteVocabulariesPageRoute({ params }: Props) {
  return <SiteVocabulariesPage siteKey={params.siteKey} />;
}
