import { notFound } from 'next/navigation';
import { RGOverviewPage } from '@/components/dashboard/rg/RGOverviewPage';
import { getReviewGroupByAcronym } from '@/lib/mock-data/review-groups';

interface ReviewGroupPageProps {
  params: {
    key: string;
  };
}

export default function ReviewGroupPage({ params }: ReviewGroupPageProps) {
  const reviewGroup = getReviewGroupByAcronym(params.key);
  
  if (!reviewGroup) {
    notFound();
  }

  // Pass the review group's namespaces to the RGOverviewPage
  return <RGOverviewPage reviewGroups={[reviewGroup.id]} />;
}

// Generate static params for all review groups
export function generateStaticParams() {
  return [
    { key: 'ICP' },
    { key: 'BCM' },
    { key: 'ISBD' },
    { key: 'PUC' },
  ];
}