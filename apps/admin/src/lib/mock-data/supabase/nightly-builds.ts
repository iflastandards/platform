// Nightly build results mock data

export interface MockNightlyBuild {
  id: string;
  namespace_id: string;
  run_date: string;
  status: 'success' | 'failure' | 'running';
  validation_summary: {
    errors: number;
    warnings: number;
    info: number;
  };
  semantic_impact: 'major' | 'minor' | 'patch';
  suggested_version: string;
  artifact_path?: string;
  report_markdown: string;
  created_at: string;
  duration_seconds: number;
  changes: {
    added: number;
    modified: number;
    deprecated: number;
    total: number;
  };
}

export const mockNightlyBuilds: MockNightlyBuild[] = [
  {
    id: 'build-isbd-2025-01-12',
    namespace_id: 'ns-isbd',
    run_date: '2025-01-12',
    status: 'success',
    validation_summary: {
      errors: 0,
      warnings: 3,
      info: 12,
    },
    semantic_impact: 'minor',
    suggested_version: '2022.0.0',
    artifact_path: '/output/nightly-build/isbd-2025-01-12.ttl',
    report_markdown: `# ISBD Semantic Impact Report
## Date: 2025-01-12

### Summary
- **Current Version**: 2021.1.0
- **Suggested Version**: 2022.0.0 (MINOR)
- **Total Changes**: 66

### Breaking Changes
None detected.

### Minor Changes
- Added 15 new elements for digital resources
- Modified 48 element definitions for clarity
- Added support for new media types

### Patch Changes
- Fixed typos in 12 element descriptions
- Updated 3 deprecated element references

### Validation Results
✅ All RDF validation passed
⚠️ 3 warnings about missing translations
ℹ️ 12 info messages about optional improvements`,
    created_at: '2025-01-12T02:00:00Z',
    duration_seconds: 245,
    changes: {
      added: 15,
      modified: 48,
      deprecated: 3,
      total: 66,
    },
  },
  {
    id: 'build-muldicat-2025-01-12',
    namespace_id: 'ns-muldicat',
    run_date: '2025-01-12',
    status: 'success',
    validation_summary: {
      errors: 0,
      warnings: 45,
      info: 234,
    },
    semantic_impact: 'patch',
    suggested_version: '3.2.1',
    artifact_path: '/output/nightly-build/muldicat-fr-2025-01-12.ttl',
    report_markdown: `# MulDiCat Semantic Impact Report
## Date: 2025-01-12

### Summary
- **Current Version**: 3.2.0
- **Suggested Version**: 3.2.1 (PATCH)
- **Total Changes**: 245

### Changes
- Added 156 French translations
- Updated 89 existing translations for consistency
- No structural changes

### Translation Progress
- French: 65% complete (1851/2847)
- Spanish: 100% complete
- Portuguese: 100% complete`,
    created_at: '2025-01-12T02:00:00Z',
    duration_seconds: 189,
    changes: {
      added: 156,
      modified: 89,
      deprecated: 0,
      total: 245,
    },
  },
  {
    id: 'build-unimarc-2025-01-12',
    namespace_id: 'ns-unimarc',
    run_date: '2025-01-12',
    status: 'failure',
    validation_summary: {
      errors: 5,
      warnings: 23,
      info: 45,
    },
    semantic_impact: 'major',
    suggested_version: '4.0.0',
    report_markdown: `# UNIMARC Semantic Impact Report
## Date: 2025-01-12

### Summary
- **Current Version**: 3.1.0
- **Suggested Version**: 4.0.0 (MAJOR)
- **Build Status**: FAILED ❌

### Validation Errors
1. Duplicate field tag: 856
2. Invalid tag format: 85a (must be 3 digits)
3. Invalid indicator value: "1X"
4. Missing required field: mandatory (line 45)
5. Invalid boolean value: "yes" (line 67)

### Cannot proceed with build until errors are resolved`,
    created_at: '2025-01-12T02:00:00Z',
    duration_seconds: 67,
    changes: {
      added: 0,
      modified: 0,
      deprecated: 0,
      total: 0,
    },
  },
  {
    id: 'build-isbd-2025-01-11',
    namespace_id: 'ns-isbd',
    run_date: '2025-01-11',
    status: 'success',
    validation_summary: {
      errors: 0,
      warnings: 5,
      info: 15,
    },
    semantic_impact: 'patch',
    suggested_version: '2021.1.1',
    artifact_path: '/output/nightly-build/isbd-2025-01-11.ttl',
    report_markdown: `# ISBD Semantic Impact Report
## Date: 2025-01-11

### Summary
- **Current Version**: 2021.1.0
- **Suggested Version**: 2021.1.1 (PATCH)
- **Total Changes**: 8

### Changes
- Fixed 5 typos
- Updated 3 examples`,
    created_at: '2025-01-11T02:00:00Z',
    duration_seconds: 198,
    changes: {
      added: 0,
      modified: 8,
      deprecated: 0,
      total: 8,
    },
  },
];

// Helper functions
export function getLatestBuildForNamespace(namespaceId: string): MockNightlyBuild | undefined {
  return mockNightlyBuilds
    .filter(build => build.namespace_id === namespaceId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
}

export function getRecentBuilds(limit: number = 10): MockNightlyBuild[] {
  return mockNightlyBuilds
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export function getFailedBuilds(): MockNightlyBuild[] {
  return mockNightlyBuilds.filter(build => build.status === 'failure');
}

// Calculate build success rate
export function getBuildSuccessRate(namespaceId?: string): number {
  const builds = namespaceId 
    ? mockNightlyBuilds.filter(b => b.namespace_id === namespaceId)
    : mockNightlyBuilds;
  
  if (builds.length === 0) return 0;
  
  const successCount = builds.filter(b => b.status === 'success').length;
  return Math.round((successCount / builds.length) * 100);
}

// Get build status color
export function getBuildStatusColor(status: MockNightlyBuild['status']): string {
  switch (status) {
    case 'success': return 'success';
    case 'failure': return 'error';
    case 'running': return 'info';
  }
}

// Format build duration
export function formatBuildDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}