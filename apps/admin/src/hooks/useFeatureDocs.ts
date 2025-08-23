import { useState, useEffect } from 'react';

interface FeatureDocs {
  userGuide?: string;
  api?: string;
  readme?: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  steps?: any[];
}

interface Tooltip {
  id: string;
  field: string;
  title: string;
  content: string;
}

interface TourStep {
  title: string;
  description: string;
  target: string; // CSS selector
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface UseFeatureDocsReturn {
  docs: FeatureDocs | null;
  tutorials: {
    items: Tutorial[];
    tour: TourStep[];
  } | null;
  tooltips: Tooltip[] | null;
  loading: boolean;
  error: Error | null;
  getFieldHelp: (field: string) => string | undefined;
}

/**
 * Hook to load feature documentation and help content
 */
export function useFeatureDocs(feature?: string): UseFeatureDocsReturn {
  const [docs, setDocs] = useState<FeatureDocs | null>(null);
  const [tutorials, setTutorials] = useState<{ items: Tutorial[]; tour: TourStep[] } | null>(null);
  const [tooltips, setTooltips] = useState<Tooltip[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!feature) {
      setLoading(false);
      return;
    }

    const loadDocs = async () => {
      try {
        setLoading(true);
        
        // In production, these would be fetched from an API or CDN
        // For now, we'll use mock data based on the feature
        const mockDocs: FeatureDocs = {
          userGuide: `# ${feature} User Guide\n\nThis is the user guide for ${feature}...`,
          api: `# ${feature} API Documentation\n\nAPI endpoints for ${feature}...`,
          readme: `# ${feature} README\n\nDeveloper documentation for ${feature}...`,
        };

        const mockTutorials = {
          items: [
            {
              id: '1',
              title: `Getting Started with ${feature}`,
              description: 'Learn the basics in 5 minutes',
              duration: '5 min',
              level: 'Beginner' as const,
            },
            {
              id: '2',
              title: `Advanced ${feature} Features`,
              description: 'Master advanced techniques',
              duration: '15 min',
              level: 'Advanced' as const,
            },
          ],
          tour: [
            {
              title: 'Welcome!',
              description: `Let's take a quick tour of ${feature}`,
              target: '.ant-page-header',
            },
            {
              title: 'Create New',
              description: 'Click here to create a new item',
              target: '.create-button',
              placement: 'bottom' as const,
            },
            {
              title: 'Filter & Search',
              description: 'Use these controls to find what you need',
              target: '.ant-table-filter',
              placement: 'top' as const,
            },
          ],
        };

        const mockTooltips: Tooltip[] = [
          {
            id: '1',
            field: 'name',
            title: 'Name Field',
            content: 'Enter a unique, descriptive name for this item.',
          },
          {
            id: '2',
            field: 'type',
            title: 'Type Selection',
            content: 'Choose the appropriate type from the dropdown.',
          },
          {
            id: '3',
            field: 'status',
            title: 'Status',
            content: 'Current status of the item. Updates automatically.',
          },
        ];

        setDocs(mockDocs);
        setTutorials(mockTutorials);
        setTooltips(mockTooltips);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadDocs();
  }, [feature]);

  const getFieldHelp = (field: string): string | undefined => tooltips?.find(t => t.field === field)?.content;

  return {
    docs,
    tutorials,
    tooltips,
    loading,
    error,
    getFieldHelp,
  };
}

/**
 * Hook to check if a user needs the guided tour
 */
export function useNeedsTour(feature: string): boolean {
  const [needsTour, setNeedsTour] = useState(false);

  useEffect(() => {
    const tourKey = `tour_completed_${feature}`;
    const completed = localStorage.getItem(tourKey);
    setNeedsTour(!completed);
  }, [feature]);

  return needsTour;
}

/**
 * Mark a tour as completed
 */
export function markTourCompleted(feature: string): void {
  const tourKey = `tour_completed_${feature}`;
  localStorage.setItem(tourKey, 'true');
}