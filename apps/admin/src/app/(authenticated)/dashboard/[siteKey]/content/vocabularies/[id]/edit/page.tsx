import { SiteVocabularyEditPage } from '@/components/dashboard/site-management/SiteVocabularyEditPage';

interface Props {
  params: { siteKey: string; id: string };
}

export default function EditVocabularyPage({ params }: Props) {
  return <SiteVocabularyEditPage siteKey={params.siteKey} vocabularyId={params.id} />;
}