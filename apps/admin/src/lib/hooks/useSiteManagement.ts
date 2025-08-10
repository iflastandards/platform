import { useQuery } from '@tanstack/react-query';

export interface SiteInfo {
  key: string;
  title: string;
  code: string;
  description?: string;
  isSpecialCase: boolean;
  githubRepo: string;
  lastUpdated: string;
  buildStatus: 'passing' | 'failing' | 'pending';
  openPRs: number;
  pendingReviews: number;
  teamMembers: number;
  activeReviewers: number;
}

export interface SiteActivity {
  id: string;
  type: 'content' | 'system' | 'deployment' | 'team';
  title: string;
  timestamp: string;
  user?: string;
}

export function useSiteInfo(siteKey: string) {
  return useQuery({
    queryKey: ['site-info', siteKey],
    queryFn: async (): Promise<SiteInfo> => {
      // TODO: Replace with actual API call
      const mockData: SiteInfo = {
        key: siteKey,
        title: getSiteTitle(siteKey),
        code: siteKey.toUpperCase(),
        isSpecialCase: ['portal', 'dev', 'test'].includes(siteKey),
        githubRepo: 'iflastandards/standards-dev',
        lastUpdated: '2 hours ago',
        buildStatus: 'passing',
        openPRs: 3,
        pendingReviews: 5,
        teamMembers: 8,
        activeReviewers: 3,
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSiteActivity(siteKey: string) {
  return useQuery({
    queryKey: ['site-activity', siteKey],
    queryFn: async (): Promise<SiteActivity[]> => {
      // TODO: Replace with actual API call
      const isSpecialCase = ['portal', 'dev', 'test'].includes(siteKey);
      
      const mockData: SiteActivity[] = isSpecialCase ? [
        {
          id: '1',
          type: 'system',
          title: 'System configuration updated',
          timestamp: '1h ago',
          user: 'admin',
        },
        {
          id: '2',
          type: 'system',
          title: 'New namespace created: test-ns',
          timestamp: '3h ago',
          user: 'admin',
        },
        {
          id: '3',
          type: 'deployment',
          title: 'Platform deployment completed',
          timestamp: '1d ago',
          user: 'system',
        },
      ] : [
        {
          id: '1',
          type: 'content',
          title: 'Updated element C2001',
          timestamp: '2h ago',
          user: 'editor',
        },
        {
          id: '2',
          type: 'content',
          title: 'Merged PR #45',
          timestamp: '1d ago',
          user: 'reviewer',
        },
        {
          id: '3',
          type: 'content',
          title: 'Added new vocabulary terms',
          timestamp: '2d ago',
          user: 'author',
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockData;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSiteStats(siteKey: string) {
  return useQuery({
    queryKey: ['site-stats', siteKey],
    queryFn: async () => {
      // TODO: Replace with actual API call
      const isSpecialCase = ['portal', 'dev', 'test'].includes(siteKey);
      
      const mockData = isSpecialCase ? {
        namespaces: 12,
        totalUsers: 156,
        systemIssues: 3,
        activeTasks: 5,
      } : {
        teamMembers: 8,
        activeReviewers: 3,
        openPRs: 3,
        pendingReviews: 5,
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockData;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

function getSiteTitle(siteKey: string): string {
  const titleMap: Record<string, string> = {
    portal: 'IFLA Standards Portal',
    isbd: 'International Standard Bibliographic Description',
    isbdm: 'ISBD for Manifestations',
    unimarc: 'UNIMARC',
    mri: 'Multilingual Resource Identifier',
    frbr: 'Functional Requirements for Bibliographic Records',
    lrm: 'Library Reference Model',
    mia: 'Metadata Infrastructure Architecture',
    pressoo: 'PRESSoo',
    muldicat: 'MULDICAT',
  };
  return titleMap[siteKey] || siteKey.toUpperCase();
}