// Editorial cycle state tracking mock data

export interface MockEditorialCycle {
  id: string;
  namespace_id: string;
  version: string;
  phase: 'bootstrap' | 'editing' | 'review' | 'publication';
  bootstrap_issue_number?: number;
  google_sheet_id?: string;
  started_at: string;
  started_by: string;
  published_at?: string;
  metadata: {
    previousVersion?: string;
    targetDate?: string;
    reviewers?: string[];
    notes?: string;
    milestones?: {
      phase: string;
      completedAt: string;
      completedBy: string;
    }[];
  };
}

export const mockEditorialCycles: MockEditorialCycle[] = [
  {
    id: 'cycle-isbd-2025',
    namespace_id: 'ns-isbd',
    version: '2022.0.0-draft',
    phase: 'editing',
    bootstrap_issue_number: 42,
    google_sheet_id: '1ABC123456789',
    started_at: '2025-01-02T00:00:00Z',
    started_by: 'user-admin-1',
    metadata: {
      previousVersion: '2021.1.0',
      targetDate: '2025-06-01T00:00:00Z',
      reviewers: ['maria.editor@library.org', 'alex.multi@ifla.org'],
      notes: 'Major consolidation of all ISBD formats',
      milestones: [
        {
          phase: 'bootstrap',
          completedAt: '2025-01-03T14:30:00Z',
          completedBy: 'user-admin-1',
        },
      ],
    },
  },
  {
    id: 'cycle-lrm-2025',
    namespace_id: 'ns-lrm',
    version: '1.1.0-draft',
    phase: 'bootstrap',
    bootstrap_issue_number: 15,
    google_sheet_id: '2DEF456789012',
    started_at: '2025-01-08T00:00:00Z',
    started_by: 'user-admin-1',
    metadata: {
      previousVersion: '1.0.1',
      targetDate: '2025-06-30T00:00:00Z',
      reviewers: ['john.reviewer@university.edu'],
      notes: 'Minor update based on implementation feedback',
    },
  },
  {
    id: 'cycle-muldicat-fr',
    namespace_id: 'ns-muldicat',
    version: '3.3.0-draft',
    phase: 'editing',
    bootstrap_issue_number: 89,
    google_sheet_id: '3GHI789012345',
    started_at: '2024-10-01T00:00:00Z',
    started_by: 'user-admin-1',
    metadata: {
      previousVersion: '3.2.0',
      targetDate: '2025-03-15T00:00:00Z',
      reviewers: ['pierre.translator@bibliotheque.fr'],
      notes: 'French translation completion',
      milestones: [
        {
          phase: 'bootstrap',
          completedAt: '2024-10-02T10:00:00Z',
          completedBy: 'user-admin-1',
        },
      ],
    },
  },
  {
    id: 'cycle-unimarc-2025',
    namespace_id: 'ns-unimarc',
    version: '4.0.0-draft',
    phase: 'review',
    bootstrap_issue_number: 156,
    google_sheet_id: '4JKL012345678',
    started_at: '2025-01-01T00:00:00Z',
    started_by: 'user-admin-1',
    metadata: {
      previousVersion: '3.1.0',
      targetDate: '2025-09-01T00:00:00Z',
      reviewers: ['alex.multi@ifla.org'],
      notes: 'Major update for electronic resources',
    },
  },
  {
    id: 'cycle-isbd-2021',
    namespace_id: 'ns-isbd',
    version: '2021.1.0',
    phase: 'publication',
    google_sheet_id: '0OLD123456789',
    started_at: '2021-01-15T00:00:00Z',
    started_by: 'legacy-admin',
    published_at: '2021-07-15T00:00:00Z',
    metadata: {
      previousVersion: '2021.0.0',
      notes: 'Consolidated edition - first major release',
      milestones: [
        {
          phase: 'bootstrap',
          completedAt: '2021-01-20T00:00:00Z',
          completedBy: 'legacy-admin',
        },
        {
          phase: 'editing',
          completedAt: '2021-05-01T00:00:00Z',
          completedBy: 'legacy-admin',
        },
        {
          phase: 'review',
          completedAt: '2021-06-15T00:00:00Z',
          completedBy: 'legacy-admin',
        },
        {
          phase: 'publication',
          completedAt: '2021-07-15T00:00:00Z',
          completedBy: 'legacy-admin',
        },
      ],
    },
  },
];

// Helper functions
export function getActiveCycles(): MockEditorialCycle[] {
  return mockEditorialCycles.filter(cycle => !cycle.published_at);
}

export function getCycleByNamespace(namespaceId: string): MockEditorialCycle | undefined {
  return mockEditorialCycles.find(cycle => 
    cycle.namespace_id === namespaceId && !cycle.published_at
  );
}

export function getCyclesInPhase(phase: MockEditorialCycle['phase']): MockEditorialCycle[] {
  return mockEditorialCycles.filter(cycle => cycle.phase === phase);
}

// Calculate cycle progress
export function getCycleProgress(cycle: MockEditorialCycle): number {
  const phases = ['bootstrap', 'editing', 'review', 'publication'];
  const currentPhaseIndex = phases.indexOf(cycle.phase);
  return Math.round(((currentPhaseIndex + 1) / phases.length) * 100);
}

// Get phase color
export function getPhaseColor(phase: MockEditorialCycle['phase']): string {
  switch (phase) {
    case 'bootstrap': return 'info';
    case 'editing': return 'warning';
    case 'review': return 'secondary';
    case 'publication': return 'success';
  }
}

// Calculate days in current phase
export function getDaysInPhase(cycle: MockEditorialCycle): number {
  const lastMilestone = cycle.metadata.milestones?.[cycle.metadata.milestones.length - 1];
  const phaseStartDate = lastMilestone 
    ? new Date(lastMilestone.completedAt)
    : new Date(cycle.started_at);
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - phaseStartDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}