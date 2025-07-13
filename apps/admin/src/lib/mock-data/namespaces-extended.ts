// Enhanced namespace data with full metadata

export interface MockNamespace {
  id: string;
  slug: string;
  name: string;
  description: string;
  reviewGroup: string;
  reviewGroupName: string;
  status: 'active' | 'maintenance' | 'archived';
  currentVersion: string;
  lastPublished: string;
  githubRepo: string;
  googleSheetId?: string;
  statistics: {
    elements: number;
    concepts: number;
    translations: number;
    contributors: number;
  };
  activeProjects: string[];
  color: string; // For UI theming
  icon: string; // Material icon name
}

export const mockNamespaces: Record<string, MockNamespace> = {
  'isbd': {
    id: 'ns-isbd',
    slug: 'isbd',
    name: 'ISBD',
    description: 'International Standard Bibliographic Description - Consolidated Edition',
    reviewGroup: 'isbd',
    reviewGroupName: 'ISBD Review Group',
    status: 'active',
    currentVersion: '2021.1.0',
    lastPublished: '2021-07-15T00:00:00Z',
    githubRepo: 'iflastandards/isbd',
    googleSheetId: '1ABC123456789',
    statistics: {
      elements: 185,
      concepts: 42,
      translations: 12,
      contributors: 23,
    },
    activeProjects: ['proj-isbd-2025'],
    color: '#0F766E',
    icon: 'MenuBook',
  },
  'isbdm': {
    id: 'ns-isbdm',
    slug: 'isbdm',
    name: 'ISBD(M)',
    description: 'International Standard Bibliographic Description for Monographic Publications',
    reviewGroup: 'isbd',
    reviewGroupName: 'ISBD Review Group',
    status: 'maintenance',
    currentVersion: '2.0.1',
    lastPublished: '2020-03-10T00:00:00Z',
    githubRepo: 'iflastandards/isbdm',
    statistics: {
      elements: 156,
      concepts: 38,
      translations: 8,
      contributors: 15,
    },
    activeProjects: ['proj-isbd-2025'],
    color: '#0F766E',
    icon: 'AutoStories',
  },
  'lrm': {
    id: 'ns-lrm',
    slug: 'lrm',
    name: 'LRM',
    description: 'Library Reference Model',
    reviewGroup: 'bcm',
    reviewGroupName: 'Bibliography Control and Metadata',
    status: 'active',
    currentVersion: '1.0.1',
    lastPublished: '2023-11-20T00:00:00Z',
    githubRepo: 'iflastandards/lrm',
    googleSheetId: '2DEF456789012',
    statistics: {
      elements: 98,
      concepts: 125,
      translations: 6,
      contributors: 18,
    },
    activeProjects: ['proj-lrm-update'],
    color: '#1e40af',
    icon: 'AccountTree',
  },
  'frbr': {
    id: 'ns-frbr',
    slug: 'frbr',
    name: 'FRBR',
    description: 'Functional Requirements for Bibliographic Records (Superseded by LRM)',
    reviewGroup: 'bcm',
    reviewGroupName: 'Bibliography Control and Metadata',
    status: 'archived',
    currentVersion: '2.0.0',
    lastPublished: '2017-12-01T00:00:00Z',
    githubRepo: 'iflastandards/frbr',
    statistics: {
      elements: 145,
      concepts: 89,
      translations: 15,
      contributors: 12,
    },
    activeProjects: ['proj-frbr-archive'],
    color: '#6b7280',
    icon: 'Archive',
  },
  'muldicat': {
    id: 'ns-muldicat',
    slug: 'muldicat',
    name: 'MulDiCat',
    description: 'Multilingual Dictionary of Cataloguing Terms and Concepts',
    reviewGroup: 'cat',
    reviewGroupName: 'Cataloguing Section',
    status: 'active',
    currentVersion: '3.2.0',
    lastPublished: '2024-09-15T00:00:00Z',
    githubRepo: 'iflastandards/muldicat',
    googleSheetId: '3GHI789012345',
    statistics: {
      elements: 0,
      concepts: 2847,
      translations: 28,
      contributors: 45,
    },
    activeProjects: ['proj-muldicat-fr'],
    color: '#7c3aed',
    icon: 'Translate',
  },
  'unimarc': {
    id: 'ns-unimarc',
    slug: 'unimarc',
    name: 'UNIMARC',
    description: 'Universal MARC Format',
    reviewGroup: 'unimarc',
    reviewGroupName: 'UNIMARC Strategic Programme',
    status: 'active',
    currentVersion: '3.1.0',
    lastPublished: '2024-06-01T00:00:00Z',
    githubRepo: 'iflastandards/unimarc',
    googleSheetId: '4JKL012345678',
    statistics: {
      elements: 2156,
      concepts: 0,
      translations: 4,
      contributors: 28,
    },
    activeProjects: ['proj-unimarc-update'],
    color: '#dc2626',
    icon: 'DataObject',
  },
};

// Review group metadata
export interface MockReviewGroup {
  id: string;
  name: string;
  description: string;
  namespaces: string[];
  chair?: string;
  secretary?: string;
  meetingSchedule?: string;
  color: string;
}

export const mockReviewGroups: Record<string, MockReviewGroup> = {
  'isbd': {
    id: 'isbd',
    name: 'ISBD Review Group',
    description: 'Maintains the International Standard Bibliographic Description',
    namespaces: ['isbd', 'isbdm'],
    chair: 'Dr. Elena Rodriguez',
    secretary: 'Maria Editor',
    meetingSchedule: 'Monthly, 2nd Tuesday',
    color: '#0F766E',
  },
  'bcm': {
    id: 'bcm',
    name: 'Bibliography Control and Metadata',
    description: 'Develops conceptual models for bibliographic information',
    namespaces: ['lrm', 'frbr'],
    chair: 'Prof. James Smith',
    meetingSchedule: 'Quarterly',
    color: '#1e40af',
  },
  'cat': {
    id: 'cat',
    name: 'Cataloguing Section',
    description: 'Promotes cataloguing activities and standards',
    namespaces: ['muldicat'],
    chair: 'Dr. Liu Wei',
    secretary: 'Anna Kowalski',
    meetingSchedule: 'Bi-monthly',
    color: '#7c3aed',
  },
  'unimarc': {
    id: 'unimarc',
    name: 'UNIMARC Strategic Programme',
    description: 'Maintains and develops the UNIMARC formats',
    namespaces: ['unimarc'],
    chair: 'Marc Dubois',
    meetingSchedule: 'Monthly',
    color: '#dc2626',
  },
};

// Helper functions
export function getNamespacesByReviewGroup(reviewGroup: string): MockNamespace[] {
  return Object.values(mockNamespaces).filter(ns => ns.reviewGroup === reviewGroup);
}

export function getActiveNamespaces(): MockNamespace[] {
  return Object.values(mockNamespaces).filter(ns => ns.status === 'active');
}

export function getNamespaceStats() {
  const stats = {
    total: Object.keys(mockNamespaces).length,
    active: 0,
    maintenance: 0,
    archived: 0,
    totalElements: 0,
    totalConcepts: 0,
    totalTranslations: 0,
  };
  
  Object.values(mockNamespaces).forEach(ns => {
    stats[ns.status]++;
    stats.totalElements += ns.statistics.elements;
    stats.totalConcepts += ns.statistics.concepts;
    stats.totalTranslations += ns.statistics.translations;
  });
  
  return stats;
}

export function getReviewGroupByNamespace(namespaceSlug: string): MockReviewGroup | undefined {
  const namespace = mockNamespaces[namespaceSlug];
  if (!namespace) return undefined;
  return mockReviewGroups[namespace.reviewGroup];
}