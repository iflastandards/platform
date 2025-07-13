// Activity logs mock data (using Spatie-style pattern)

export interface MockActivityLog {
  id: string;
  log_name: string;
  description: string;
  subject_type: string;
  subject_id: string;
  causer_type: string;
  causer_id: string;
  properties: {
    old?: any;
    new?: any;
    attributes?: any;
    [key: string]: any;
  };
  created_at: string;
}

export const mockActivityLogs: MockActivityLog[] = [
  {
    id: 'log-1',
    log_name: 'import',
    description: 'Started import from spreadsheet',
    subject_type: 'ImportJob',
    subject_id: 'import-isbd-42',
    causer_type: 'User',
    causer_id: 'user-admin-1',
    properties: {
      attributes: {
        namespace: 'isbd',
        issue_number: 42,
        spreadsheet_url: 'https://docs.google.com/spreadsheets/d/1ABC123456789/edit',
        profile: 'isbd-minimum',
        mode: 'dry-run',
      },
    },
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'log-2',
    log_name: 'edit',
    description: 'Updated element definition',
    subject_type: 'Element',
    subject_id: 'isbd:E45',
    causer_type: 'User',
    causer_id: 'user-editor-1',
    properties: {
      old: {
        definition: 'The chief title of a resource',
      },
      new: {
        definition: 'The chief title of a resource, including any alternative title',
      },
    },
    created_at: '2025-01-10T09:45:00Z',
  },
  {
    id: 'log-3',
    log_name: 'validation',
    description: 'Validation completed with warnings',
    subject_type: 'ValidationReport',
    subject_id: 'val-isbd-2025-01-10',
    causer_type: 'System',
    causer_id: 'system',
    properties: {
      attributes: {
        namespace: 'isbd',
        profile: 'isbd-minimum',
        errors: 0,
        warnings: 3,
        info: 12,
      },
    },
    created_at: '2025-01-10T10:15:00Z',
  },
  {
    id: 'log-4',
    log_name: 'translation',
    description: 'Added French translation',
    subject_type: 'Concept',
    subject_id: 'muldicat:C1523',
    causer_type: 'User',
    causer_id: 'user-translator-1',
    properties: {
      attributes: {
        language: 'fr',
        term: 'Catalogage descriptif',
        status: 'review',
      },
    },
    created_at: '2025-01-11T14:20:00Z',
  },
  {
    id: 'log-5',
    log_name: 'build',
    description: 'Nightly build completed successfully',
    subject_type: 'NightlyBuild',
    subject_id: 'build-isbd-2025-01-12',
    causer_type: 'System',
    causer_id: 'github-actions',
    properties: {
      attributes: {
        namespace: 'isbd',
        semantic_impact: 'minor',
        suggested_version: '2022.0.0',
        duration: 245,
      },
    },
    created_at: '2025-01-12T02:04:05Z',
  },
  {
    id: 'log-6',
    log_name: 'auth',
    description: 'User logged in',
    subject_type: 'Session',
    subject_id: 'session-123',
    causer_type: 'User',
    causer_id: 'user-editor-1',
    properties: {
      attributes: {
        ip: '192.168.1.100',
        user_agent: 'Mozilla/5.0...',
        method: 'github',
      },
    },
    created_at: '2025-01-12T08:30:00Z',
  },
  {
    id: 'log-7',
    log_name: 'project',
    description: 'Added user to project team',
    subject_type: 'ProjectMembership',
    subject_id: 'proj-isbd-2025',
    causer_type: 'User',
    causer_id: 'user-admin-1',
    properties: {
      attributes: {
        user_id: 'user-reviewer-1',
        role: 'reviewer',
        namespaces: ['isbd', 'isbdm'],
      },
    },
    created_at: '2025-01-09T15:00:00Z',
  },
  {
    id: 'log-8',
    log_name: 'cycle',
    description: 'Editorial cycle phase changed',
    subject_type: 'EditorialCycle',
    subject_id: 'cycle-isbd-2025',
    causer_type: 'User',
    causer_id: 'user-admin-1',
    properties: {
      old: {
        phase: 'bootstrap',
      },
      new: {
        phase: 'editing',
      },
    },
    created_at: '2025-01-03T14:30:00Z',
  },
];

// Helper functions
export function getActivityBySubject(subjectType: string, subjectId: string): MockActivityLog[] {
  return mockActivityLogs.filter(log => 
    log.subject_type === subjectType && log.subject_id === subjectId
  );
}

export function getActivityByUser(userId: string): MockActivityLog[] {
  return mockActivityLogs.filter(log => log.causer_id === userId);
}

export function getRecentActivity(limit: number = 50): MockActivityLog[] {
  return mockActivityLogs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

export function getActivityByNamespace(namespace: string): MockActivityLog[] {
  return mockActivityLogs.filter(log => {
    const props = log.properties;
    return props.attributes?.namespace === namespace ||
           props.attributes?.namespaces?.includes(namespace) ||
           log.subject_id.includes(namespace);
  });
}

// Format activity description with user name
export function formatActivityDescription(log: MockActivityLog, users: Record<string, string>): string {
  const userName = users[log.causer_id] || log.causer_id;
  return `${userName} ${log.description}`;
}

// Get activity icon based on log name
export function getActivityIcon(logName: string): string {
  const icons: Record<string, string> = {
    'import': 'CloudUpload',
    'editorial': 'Edit',
    'validation': 'CheckCircle',
    'translation': 'Translate',
    'build': 'Build',
    'auth': 'Login',
    'project': 'Group',
    'cycle': 'Timeline',
  };
  return icons[logName] || 'Info';
}

// Group activities by date
export function groupActivitiesByDate(activities: MockActivityLog[]): Record<string, MockActivityLog[]> {
  return activities.reduce((acc, activity) => {
    const date = new Date(activity.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, MockActivityLog[]>);
}