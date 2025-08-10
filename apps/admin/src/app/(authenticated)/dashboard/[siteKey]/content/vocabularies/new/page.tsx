import { SiteVocabularyCreatePage } from '@/components/dashboard/site-management/SiteVocabularyCreatePage';

interface Props {
  params: { siteKey: string };
}

export default function NewVocabularyPage({ params }: Props) {
  return <SiteVocabularyCreatePage siteKey={params.siteKey} />;
}