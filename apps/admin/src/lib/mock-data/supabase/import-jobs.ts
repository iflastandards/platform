// Import job history mock data

export interface MockImportJob {
  id: string;
  namespace_id: string;
  github_issue_number: number;
  google_sheet_url: string;
  dctap_profile: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  import_mode: 'direct' | 'dry-run';
  branch_name?: string;
  started_at: string;
  completed_at?: string;
  created_by: string;
  result: {
    recordsProcessed: number;
    recordsImported: number;
    filesCreated: number;
    filesModified: number;
    errors: number;
    warnings: number;
    validationReportId?: string;
    pullRequestUrl?: string;
  };
}

export const mockImportJobs: MockImportJob[] = [
  {
    id: 'import-isbd-42',
    namespace_id: 'ns-isbd',
    github_issue_number: 42,
    google_sheet_url: 'https://docs.google.com/spreadsheets/d/1ABC123456789/edit',
    dctap_profile: 'isbd-minimum',
    status: 'pending',
    import_mode: 'dry-run',
    started_at: '2025-01-10T10:00:00Z',
    created_by: 'user-admin-1',
    result: {
      recordsProcessed: 0,
      recordsImported: 0,
      filesCreated: 0,
      filesModified: 0,
      errors: 0,
      warnings: 0,
    },
  },
  {
    id: 'import-isbd-38',
    namespace_id: 'ns-isbd',
    github_issue_number: 38,
    google_sheet_url: 'https://docs.google.com/spreadsheets/d/5MNO345678901/edit',
    dctap_profile: 'isbd-recommended',
    status: 'completed',
    import_mode: 'direct',
    branch_name: 'import/area-0-implementation',
    started_at: '2025-01-03T14:00:00Z',
    completed_at: '2025-01-03T15:00:00Z',
    created_by: 'user-admin-1',
    result: {
      recordsProcessed: 23,
      recordsImported: 23,
      filesCreated: 23,
      filesModified: 2,
      errors: 0,
      warnings: 0,
      validationReportId: 'val-isbd-2025-01-03',
      pullRequestUrl: 'https://github.com/iflastandards/isbd/pull/39',
    },
  },
  {
    id: 'import-muldicat-89',
    namespace_id: 'ns-muldicat',
    github_issue_number: 89,
    google_sheet_url: 'https://docs.google.com/spreadsheets/d/3GHI789012345/edit',
    dctap_profile: 'muldicat-translation',
    status: 'completed',
    import_mode: 'dry-run',
    branch_name: 'import/french-batch-3',
    started_at: '2024-12-15T09:30:00Z',
    completed_at: '2024-12-15T10:00:00Z',
    created_by: 'user-admin-1',
    result: {
      recordsProcessed: 1695,
      recordsImported: 1695,
      filesCreated: 156,
      filesModified: 1539,
      errors: 0,
      warnings: 45,
      validationReportId: 'val-muldicat-2024-12-15',
    },
  },
  {
    id: 'import-unimarc-156',
    namespace_id: 'ns-unimarc',
    github_issue_number: 156,
    google_sheet_url: 'https://docs.google.com/spreadsheets/d/4JKL012345678/edit',
    dctap_profile: 'unimarc-fields',
    status: 'failed',
    import_mode: 'dry-run',
    started_at: '2025-01-12T08:00:00Z',
    completed_at: '2025-01-12T08:30:00Z',
    created_by: 'user-editor-1',
    result: {
      recordsProcessed: 124,
      recordsImported: 0,
      filesCreated: 0,
      filesModified: 0,
      errors: 5,
      warnings: 23,
      validationReportId: 'val-unimarc-2025-01-12',
    },
  },
];

// Helper functions
export function getImportJobsByNamespace(namespaceId: string): MockImportJob[] {
  return mockImportJobs.filter(job => job.namespace_id === namespaceId);
}

export function getActiveImportJobs(): MockImportJob[] {
  return mockImportJobs.filter(job => 
    job.status === 'pending' || job.status === 'processing'
  );
}

export function getImportJobByIssue(issueNumber: number): MockImportJob | undefined {
  return mockImportJobs.find(job => job.github_issue_number === issueNumber);
}

// Generate import job summary
export function getImportJobSummary(job: MockImportJob): string {
  switch (job.status) {
    case 'pending':
      return '⏳ Import pending...';
    case 'processing':
      return '🔄 Processing import...';
    case 'completed':
      const { recordsImported, errors, warnings } = job.result;
      if (errors === 0) {
        return `✅ Successfully imported ${recordsImported} records${warnings > 0 ? ` with ${warnings} warnings` : ''}`;
      }
      return `⚠️ Imported ${recordsImported} records with ${errors} errors`;
    case 'failed':
      return `❌ Import failed with ${job.result.errors} errors`;
  }
}