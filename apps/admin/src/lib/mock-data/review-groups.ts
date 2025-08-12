export interface ReviewGroup {
  id: string;
  acronym: string;
  name: string;
  fullName: string;
  description: string;
  namespaces: string[];
  memberCount: number;
  status: 'active' | 'planning' | 'inactive';
  color: string;
  chair?: string;
  secretary?: string;
  meetingSchedule?: string;
}

export const reviewGroups: ReviewGroup[] = [
  {
    id: 'icp',
    acronym: 'ICP',
    name: 'ICP Review Group',
    fullName: 'International Cataloguing Principles Review Group',
    description: 'Develops and maintains international cataloguing principles and guidelines for bibliographic description and access',
    namespaces: ['muldicat'],
    memberCount: 8,
    status: 'active',
    color: '#2563EB', // Blue
    chair: 'Dr. Anna Chen',
    secretary: 'Michael Brown',
    meetingSchedule: 'Quarterly',
  },
  {
    id: 'bcm',
    acronym: 'BCM',
    name: 'BCM Review Group',
    fullName: 'Bibliographic Conceptual Models Review Group',
    description: 'Oversees the development and maintenance of IFLA\'s bibliographic conceptual models including FRBR and LRM',
    namespaces: ['frbr', 'lrm'],
    memberCount: 12,
    status: 'active',
    color: '#7C3AED', // Purple
    chair: 'Prof. James Wilson',
    secretary: 'Sarah Johnson',
    meetingSchedule: 'Bi-monthly',
  },
  {
    id: 'isbd',
    acronym: 'ISBD',
    name: 'ISBD Review Group',
    fullName: 'International Standard Bibliographic Description Review Group',
    description: 'Maintains and develops the International Standard Bibliographic Description to serve the needs of cataloguers and other users of bibliographic information',
    namespaces: ['isbd', 'isbdm'],
    memberCount: 15,
    status: 'active',
    color: '#0F766E', // Teal (IFLA primary)
    chair: 'Dr. Elena Rodriguez',
    secretary: 'Maria Editor',
    meetingSchedule: 'Monthly, 2nd Tuesday',
  },
  {
    id: 'puc',
    acronym: 'PUC',
    name: 'PUC Review Group',
    fullName: 'Permanent UNIMARC Committee Review Group',
    description: 'Responsible for the maintenance and development of the UNIMARC format for bibliographic and authority data',
    namespaces: ['unimarc'],
    memberCount: 10,
    status: 'active',
    color: '#DC2626', // Red
    chair: 'Dr. François Dubois',
    secretary: 'Giovanni Rossi',
    meetingSchedule: 'Monthly',
  },
];

export function getReviewGroupById(id: string): ReviewGroup | undefined {
  return reviewGroups.find(rg => rg.id === id);
}

export function getReviewGroupByAcronym(acronym: string): ReviewGroup | undefined {
  return reviewGroups.find(rg => rg.acronym.toLowerCase() === acronym.toLowerCase());
}

export function getReviewGroupsByNamespace(namespace: string): ReviewGroup[] {
  return reviewGroups.filter(rg => rg.namespaces.includes(namespace.toLowerCase()));
}

export function getActiveReviewGroups(): ReviewGroup[] {
  return reviewGroups.filter(rg => rg.status === 'active');
}

// Statistics helpers
export function getReviewGroupsStats() {
  return {
    total: reviewGroups.length,
    active: reviewGroups.filter(rg => rg.status === 'active').length,
    totalMembers: reviewGroups.reduce((sum, rg) => sum + rg.memberCount, 0),
    totalNamespaces: new Set(reviewGroups.flatMap(rg => rg.namespaces)).size,
  };
}