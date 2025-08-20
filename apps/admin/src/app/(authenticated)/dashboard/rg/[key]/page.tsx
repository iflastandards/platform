import { notFound } from 'next/navigation';
import { RGOverviewPage } from '@/components/dashboard/rg/RGOverviewPage';
import { getReviewGroupByAcronym } from '@/lib/mock-data/review-groups';

interface ReviewGroupPageProps {
  params: Promise<{
    key: string;
  }>;
}

export default async function ReviewGroupPage({ params }: ReviewGroupPageProps) {
  const { key } = await params;
  const reviewGroup = getReviewGroupByAcronym(key);
  
  if (!reviewGroup) {
    notFound();
  }

  // Pass the review group's acronym to the RGOverviewPage
  return <RGOverviewPage reviewGroupName={reviewGroup.acronym} />;
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