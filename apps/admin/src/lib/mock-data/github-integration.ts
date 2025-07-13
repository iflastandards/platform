// Mock GitHub integration data

export interface MockGitHubIssue {
  number: number;
  title: string;
  body: string; // Markdown with spreadsheet URL, DCTAP profile
  labels: string[];
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  assignee?: string;
  html_url: string;
  repository_url: string;
}

export interface MockGitHubRepo {
  id: number;
  name: string;
  full_name: string;
  default_branch: string;
  html_url: string;
  description: string;
}

export interface MockGitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface MockGitHubProject {
  id: string;
  number: number;
  name: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  columns?: {
    id: string;
    name: string;
    cards_count: number;
  }[];
}

// Mock GitHub repositories
export const mockRepos: Record<string, MockGitHubRepo> = {
  'isbd': {
    id: 1,
    name: 'isbd',
    full_name: 'iflastandards/isbd',
    default_branch: 'main',
    html_url: 'https://github.com/iflastandards/isbd',
    description: 'International Standard Bibliographic Description',
  },
  'lrm': {
    id: 2,
    name: 'lrm',
    full_name: 'iflastandards/lrm',
    default_branch: 'main',
    html_url: 'https://github.com/iflastandards/lrm',
    description: 'Library Reference Model',
  },
  'muldicat': {
    id: 3,
    name: 'muldicat',
    full_name: 'iflastandards/muldicat',
    default_branch: 'main',
    html_url: 'https://github.com/iflastandards/muldicat',
    description: 'Multilingual Dictionary of Cataloguing Terms',
  },
  'unimarc': {
    id: 4,
    name: 'unimarc',
    full_name: 'iflastandards/unimarc',
    default_branch: 'main',
    html_url: 'https://github.com/iflastandards/unimarc',
    description: 'Universal MARC Format',
  },
};

// Mock GitHub issues (import requests)
export const mockIssues: MockGitHubIssue[] = [
  {
    number: 42,
    title: '[Import] ISBD Elements Update 2025',
    body: '## Import Request\n\n**Spreadsheet URL**: https://docs.google.com/spreadsheets/d/1ABC123/edit\n**DCTAP Profile**: minimum\n**Description**: Updated element definitions for ISBD 2025 consolidation\n\n### Changes Include:\n- New elements for digital resources\n- Updated definitions for existing elements\n- Deprecated legacy elements marked\n\ncc @maria.editor',
    labels: ['import-request', 'isbd', 'priority:high'],
    state: 'open',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
    assignee: 'maria.editor@library.org',
    html_url: 'https://github.com/iflastandards/isbd/issues/42',
    repository_url: 'https://api.github.com/repos/iflastandards/isbd',
  },
  {
    number: 15,
    title: '[Import] LRM Concept Vocabulary',
    body: '## Import Request\n\n**Spreadsheet URL**: https://docs.google.com/spreadsheets/d/2DEF456/edit\n**DCTAP Profile**: recommended\n**Description**: New concept vocabulary for LRM implementation guide\n\n### Validation Status:\n✅ Pre-validated against DCTAP profile\n✅ Reviewed by BCM committee',
    labels: ['import-request', 'lrm', 'validated', 'ready'],
    state: 'open',
    created_at: '2025-01-08T14:30:00Z',
    updated_at: '2025-01-09T09:15:00Z',
    html_url: 'https://github.com/iflastandards/lrm/issues/15',
    repository_url: 'https://api.github.com/repos/iflastandards/lrm',
  },
  {
    number: 89,
    title: '[Import] MulDiCat French Terms',
    body: '## Import Request\n\n**Spreadsheet URL**: https://docs.google.com/spreadsheets/d/3GHI789/edit\n**DCTAP Profile**: translation\n**Description**: French translations for MulDiCat terms batch 3\n\n### Progress:\n- [x] Terms extracted from source\n- [x] Translation completed\n- [ ] Review by native speakers\n- [ ] Import to system',
    labels: ['import-request', 'muldicat', 'translation', 'fr'],
    state: 'open',
    created_at: '2025-01-05T11:20:00Z',
    updated_at: '2025-01-11T16:45:00Z',
    assignee: 'pierre.translator@bibliotheque.fr',
    html_url: 'https://github.com/iflastandards/muldicat/issues/89',
    repository_url: 'https://api.github.com/repos/iflastandards/muldicat',
  },
  {
    number: 156,
    title: '[Import] UNIMARC Field Updates',
    body: '## Import Request\n\n**Spreadsheet URL**: https://docs.google.com/spreadsheets/d/4JKL012/edit\n**DCTAP Profile**: unimarc-fields\n**Description**: New fields for electronic resources\n\n⚠️ **Note**: This import has validation errors that need to be resolved',
    labels: ['import-request', 'unimarc', 'has-errors'],
    state: 'open',
    created_at: '2025-01-12T08:00:00Z',
    updated_at: '2025-01-12T09:30:00Z',
    html_url: 'https://github.com/iflastandards/unimarc/issues/156',
    repository_url: 'https://api.github.com/repos/iflastandards/unimarc',
  },
  {
    number: 38,
    title: '[Import] ISBD Area 0 Complete',
    body: '## Import Request\n\n**Spreadsheet URL**: https://docs.google.com/spreadsheets/d/5MNO345/edit\n**DCTAP Profile**: recommended\n**Description**: Area 0 implementation complete\n\n✅ Successfully imported on 2025-01-03\n📁 Branch: `import/area-0-implementation`\n🔗 PR: #39',
    labels: ['import-request', 'isbd', 'completed'],
    state: 'closed',
    created_at: '2025-01-02T13:00:00Z',
    updated_at: '2025-01-03T15:00:00Z',
    html_url: 'https://github.com/iflastandards/isbd/issues/38',
    repository_url: 'https://api.github.com/repos/iflastandards/isbd',
  },
];

// Mock GitHub branches
export const mockBranches: Record<string, MockGitHubBranch[]> = {
  'isbd': [
    {
      name: 'main',
      commit: { sha: 'abc123', url: 'https://api.github.com/repos/iflastandards/isbd/commits/abc123' },
      protected: true,
    },
    {
      name: 'import/elements-2025',
      commit: { sha: 'def456', url: 'https://api.github.com/repos/iflastandards/isbd/commits/def456' },
      protected: false,
    },
    {
      name: 'feature/digital-resources',
      commit: { sha: 'ghi789', url: 'https://api.github.com/repos/iflastandards/isbd/commits/ghi789' },
      protected: false,
    },
  ],
  'lrm': [
    {
      name: 'main',
      commit: { sha: 'jkl012', url: 'https://api.github.com/repos/iflastandards/lrm/commits/jkl012' },
      protected: true,
    },
    {
      name: 'develop',
      commit: { sha: 'mno345', url: 'https://api.github.com/repos/iflastandards/lrm/commits/mno345' },
      protected: true,
    },
  ],
};

// Mock GitHub Projects
export const mockProjects: MockGitHubProject[] = [
  {
    id: 'proj-isbd-2025',
    number: 1,
    name: 'ISBD Consolidation 2025',
    body: 'Charter: Consolidate all ISBD specialized designations into unified standard\n\nTimeline: Jan 2025 - Dec 2025\nDeliverables:\n- Unified element set\n- Migration guidelines\n- Implementation examples',
    state: 'open',
    created_at: '2024-12-01T00:00:00Z',
    updated_at: '2025-01-12T10:00:00Z',
    columns: [
      { id: 'col1', name: 'To Do', cards_count: 15 },
      { id: 'col2', name: 'In Progress', cards_count: 8 },
      { id: 'col3', name: 'Review', cards_count: 3 },
      { id: 'col4', name: 'Done', cards_count: 22 },
    ],
  },
  {
    id: 'proj-lrm-update',
    number: 2,
    name: 'LRM Minor Update 2025',
    body: 'Charter: Address implementation feedback and clarify ambiguous areas\n\nTimeline: Jan 2025 - Jun 2025\nFocus Areas:\n- Agent relationships\n- Expression attributes\n- Manifestation statements',
    state: 'open',
    created_at: '2024-12-15T00:00:00Z',
    updated_at: '2025-01-10T14:00:00Z',
    columns: [
      { id: 'col5', name: 'Backlog', cards_count: 12 },
      { id: 'col6', name: 'Sprint', cards_count: 5 },
      { id: 'col7', name: 'Done', cards_count: 8 },
    ],
  },
  {
    id: 'proj-muldicat-fr',
    number: 3,
    name: 'MulDiCat French Translation',
    body: 'Charter: Complete French translation of all MulDiCat terms\n\nProgress: 65% complete\nTarget: March 2025',
    state: 'open',
    created_at: '2024-10-01T00:00:00Z',
    updated_at: '2025-01-11T16:00:00Z',
  },
];

// Helper functions
export function getIssuesForNamespace(namespace: string): MockGitHubIssue[] {
  return mockIssues.filter(issue => 
    issue.labels.includes(namespace) || 
    issue.repository_url.includes(namespace)
  );
}

export function getOpenImportRequests(namespace: string): MockGitHubIssue[] {
  return getIssuesForNamespace(namespace).filter(issue => 
    issue.state === 'open' && 
    issue.labels.includes('import-request')
  );
}

export function getProjectById(projectId: string): MockGitHubProject | undefined {
  return mockProjects.find(p => p.id === projectId);
}

export function getProjectsForReviewGroup(reviewGroup: string): MockGitHubProject[] {
  const groupProjects: Record<string, string[]> = {
    'isbd': ['proj-isbd-2025'],
    'bcm': ['proj-lrm-update', 'proj-frbr-archive'],
    'cat': ['proj-muldicat-fr'],
    'unimarc': ['proj-unimarc-update'],
  };
  
  const projectIds = groupProjects[reviewGroup] || [];
  return mockProjects.filter(p => projectIds.includes(p.id));
}

// Additional helper functions for namespace dashboard
export function getProjectsByNamespace(namespace: string): MockGitHubProject[] {
  return mockProjects.filter(project => {
    // Map projects to namespaces based on naming convention
    const projectNamespace = project.name.toLowerCase().includes('isbd') ? 'isbd' :
                            project.name.toLowerCase().includes('muldicat') ? 'muldicat' :
                            project.name.toLowerCase().includes('lrm') ? 'lrm' :
                            project.name.toLowerCase().includes('frbr') ? 'frbr' :
                            project.name.toLowerCase().includes('unimarc') ? 'unimarc' :
                            'unknown';
    return projectNamespace === namespace;
  });
}

export function getIssuesByProject(projectId: string): MockGitHubIssue[] {
  // Map issues to projects - for demo purposes, we'll distribute issues across projects
  const projectIssueMap: Record<string, number[]> = {
    'proj-isbd-2025': [42, 43, 44],
    'proj-isbd-maintenance': [45, 46],
    'proj-muldicat-fr': [47, 48],
    'proj-muldicat-de': [49],
    'proj-lrm-2026': [50, 51],
  };
  
  const issueNumbers = projectIssueMap[projectId] || [];
  return mockIssues.filter(issue => issueNumbers.includes(issue.number));
}

