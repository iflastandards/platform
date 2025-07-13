// Vocabulary lifecycle data

export interface MockVocabulary {
  id: string;
  namespace: string;
  name: string;
  currentVersion: string;
  status: 'draft' | 'in_editorial_cycle' | 'published';
  
  editorialCycle?: {
    phase: 'bootstrap' | 'daily_editing' | 'review' | 'publication';
    startedAt: string;
    bootstrapIssue?: number;
    googleSheetId?: string;
    lastImportedAt?: string;
    editors: string[];
    progress: {
      elementsCompleted: number;
      elementsTotal: number;
      conceptsCompleted: number;
      conceptsTotal: number;
    };
  };
  
  nightlyBuild?: {
    lastRun: string;
    status: 'success' | 'failure' | 'running';
    validationSummary: {
      errors: number;
      warnings: number;
      info: number;
    };
    semanticImpact: 'major' | 'minor' | 'patch';
    suggestedVersion: string;
    artifactUrl?: string;
    changesSummary?: {
      added: number;
      modified: number;
      deprecated: number;
    };
  };
  
  dctapProfiles: {
    minimum: string;
    recommended?: string;
  };
  
  publishedVersions: {
    version: string;
    publishedAt: string;
    publishedBy: string;
    releaseNotes?: string;
    downloads: number;
  }[];
}

export const mockVocabularies: MockVocabulary[] = [
  {
    id: 'vocab-isbd-2025',
    namespace: 'isbd',
    name: 'ISBD Consolidated Vocabulary',
    currentVersion: '2021.1.0',
    status: 'in_editorial_cycle',
    editorialCycle: {
      phase: 'daily_editing',
      startedAt: '2025-01-02T00:00:00Z',
      bootstrapIssue: 42,
      googleSheetId: '1ABC123456789',
      lastImportedAt: '2025-01-03T14:30:00Z',
      editors: ['maria.editor@library.org', 'alex.multi@ifla.org'],
      progress: {
        elementsCompleted: 142,
        elementsTotal: 185,
        conceptsCompleted: 38,
        conceptsTotal: 42,
      },
    },
    nightlyBuild: {
      lastRun: '2025-01-12T02:00:00Z',
      status: 'success',
      validationSummary: {
        errors: 0,
        warnings: 3,
        info: 12,
      },
      semanticImpact: 'minor',
      suggestedVersion: '2022.0.0',
      artifactUrl: '/output/nightly-build/isbd-2025-01-12.ttl',
      changesSummary: {
        added: 15,
        modified: 48,
        deprecated: 3,
      },
    },
    dctapProfiles: {
      minimum: 'isbd-minimum.yaml',
      recommended: 'isbd-recommended.yaml',
    },
    publishedVersions: [
      {
        version: '2021.1.0',
        publishedAt: '2021-07-15T00:00:00Z',
        publishedBy: 'admin@ifla.org',
        releaseNotes: 'Consolidated edition merging all formats',
        downloads: 4523,
      },
      {
        version: '2021.0.0',
        publishedAt: '2021-03-01T00:00:00Z',
        publishedBy: 'admin@ifla.org',
        releaseNotes: 'Initial consolidated release',
        downloads: 3891,
      },
    ],
  },
  {
    id: 'vocab-lrm-update',
    namespace: 'lrm',
    name: 'Library Reference Model',
    currentVersion: '1.0.1',
    status: 'in_editorial_cycle',
    editorialCycle: {
      phase: 'bootstrap',
      startedAt: '2025-01-08T00:00:00Z',
      bootstrapIssue: 15,
      googleSheetId: '2DEF456789012',
      editors: ['john.reviewer@university.edu'],
      progress: {
        elementsCompleted: 0,
        elementsTotal: 98,
        conceptsCompleted: 0,
        conceptsTotal: 125,
      },
    },
    dctapProfiles: {
      minimum: 'lrm-minimum.yaml',
      recommended: 'lrm-recommended.yaml',
    },
    publishedVersions: [
      {
        version: '1.0.1',
        publishedAt: '2023-11-20T00:00:00Z',
        publishedBy: 'admin@ifla.org',
        releaseNotes: 'Minor corrections and clarifications',
        downloads: 2156,
      },
      {
        version: '1.0.0',
        publishedAt: '2023-08-01T00:00:00Z',
        publishedBy: 'admin@ifla.org',
        releaseNotes: 'First official release of LRM',
        downloads: 5234,
      },
    ],
  },
  {
    id: 'vocab-muldicat-fr',
    namespace: 'muldicat',
    name: 'MulDiCat French Translation',
    currentVersion: '3.2.0',
    status: 'in_editorial_cycle',
    editorialCycle: {
      phase: 'daily_editing',
      startedAt: '2024-10-01T00:00:00Z',
      bootstrapIssue: 89,
      googleSheetId: '3GHI789012345',
      lastImportedAt: '2024-12-15T10:00:00Z',
      editors: ['pierre.translator@bibliotheque.fr'],
      progress: {
        elementsCompleted: 0,
        elementsTotal: 0,
        conceptsCompleted: 1851,
        conceptsTotal: 2847,
      },
    },
    nightlyBuild: {
      lastRun: '2025-01-12T02:00:00Z',
      status: 'success',
      validationSummary: {
        errors: 0,
        warnings: 45,
        info: 234,
      },
      semanticImpact: 'patch',
      suggestedVersion: '3.2.1',
      artifactUrl: '/output/nightly-build/muldicat-fr-2025-01-12.ttl',
      changesSummary: {
        added: 156,
        modified: 89,
        deprecated: 0,
      },
    },
    dctapProfiles: {
      minimum: 'muldicat-translation.yaml',
    },
    publishedVersions: [
      {
        version: '3.2.0',
        publishedAt: '2024-09-15T00:00:00Z',
        publishedBy: 'admin@ifla.org',
        releaseNotes: 'Added Spanish and Portuguese translations',
        downloads: 892,
      },
    ],
  },
  {
    id: 'vocab-unimarc-2025',
    namespace: 'unimarc',
    name: 'UNIMARC Electronic Resources',
    currentVersion: '3.1.0',
    status: 'draft',
    editorialCycle: {
      phase: 'review',
      startedAt: '2025-01-01T00:00:00Z',
      bootstrapIssue: 156,
      googleSheetId: '4JKL012345678',
      editors: ['alex.multi@ifla.org'],
      progress: {
        elementsCompleted: 89,
        elementsTotal: 124,
        conceptsCompleted: 0,
        conceptsTotal: 0,
      },
    },
    nightlyBuild: {
      lastRun: '2025-01-12T02:00:00Z',
      status: 'failure',
      validationSummary: {
        errors: 5,
        warnings: 23,
        info: 45,
      },
      semanticImpact: 'major',
      suggestedVersion: '4.0.0',
    },
    dctapProfiles: {
      minimum: 'unimarc-fields.yaml',
    },
    publishedVersions: [
      {
        version: '3.1.0',
        publishedAt: '2024-06-01T00:00:00Z',
        publishedBy: 'admin@ifla.org',
        releaseNotes: 'New fields for streaming media',
        downloads: 1523,
      },
    ],
  },
];

// Helper functions
export function getVocabularyByNamespace(namespace: string): MockVocabulary | undefined {
  return mockVocabularies.find(v => v.namespace === namespace);
}

export function getActiveEditorialCycles(): MockVocabulary[] {
  return mockVocabularies.filter(v => v.status === 'in_editorial_cycle');
}

export function getVocabulariesNeedingReview(): MockVocabulary[] {
  return mockVocabularies.filter(v => 
    v.editorialCycle?.phase === 'review' ||
    (v.nightlyBuild && v.nightlyBuild.validationSummary.errors > 0)
  );
}

export function getRecentNightlyBuilds(limit: number = 5): MockVocabulary[] {
  return mockVocabularies
    .filter(v => v.nightlyBuild)
    .sort((a, b) => {
      const dateA = new Date(a.nightlyBuild!.lastRun).getTime();
      const dateB = new Date(b.nightlyBuild!.lastRun).getTime();
      return dateB - dateA;
    })
    .slice(0, limit);
}

// Calculate overall progress for a vocabulary
export function calculateVocabularyProgress(vocab: MockVocabulary): number {
  if (!vocab.editorialCycle) return 0;
  
  const { progress } = vocab.editorialCycle;
  const totalItems = progress.elementsTotal + progress.conceptsTotal;
  const completedItems = progress.elementsCompleted + progress.conceptsCompleted;
  
  if (totalItems === 0) return 0;
  return Math.round((completedItems / totalItems) * 100);
}

// Get semantic version color
export function getSemanticVersionColor(impact: 'major' | 'minor' | 'patch'): string {
  switch (impact) {
    case 'major': return 'error';
    case 'minor': return 'warning';
    case 'patch': return 'success';
  }
}