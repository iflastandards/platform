// Central export for all mock data

export * from './auth';
export * from './github-integration';
export { 
  mockProjects as mockGitHubProjects,
  getProjectsByNamespace,
  getIssuesByProject 
} from './github-integration';
export * from './namespaces-extended';
export * from './vocabularies';
export * from './dctap-profiles';
export * from './spreadsheets';
export * from './validation';
export * from './translations';
export * from './supabase/import-jobs';
export * from './supabase/editorial-cycles';
export * from './supabase/nightly-builds';
export * from './supabase/activity-logs';

// Import supabase mock data
import { mockImportJobs } from './supabase/import-jobs';
import { mockEditorialCycles } from './supabase/editorial-cycles';
import { mockNightlyBuilds } from './supabase/nightly-builds';
import { mockActivityLogs } from './supabase/activity-logs';

// Mock Supabase client
export const mockSupabase = {
  from: (table: string) => ({
    select: (_query?: string) => {
      // Return mock data based on table
      switch (table) {
        case 'import_jobs':
          return Promise.resolve({ 
            data: mockImportJobs, 
            error: null 
          });
        case 'editorial_cycles':
          return Promise.resolve({ 
            data: mockEditorialCycles, 
            error: null 
          });
        case 'nightly_builds':
          return Promise.resolve({ 
            data: mockNightlyBuilds, 
            error: null 
          });
        case 'activity_logs':
          return Promise.resolve({ 
            data: mockActivityLogs, 
            error: null 
          });
        default:
          return Promise.resolve({ data: [], error: null });
      }
    },
    insert: (data: unknown) => Promise.resolve({ data, error: null }),
    update: (data: unknown) => Promise.resolve({ data, error: null }),
    delete: () => Promise.resolve({ error: null }),
    eq: (_column: string, _value: unknown) => ({
      select: () => Promise.resolve({ data: [], error: null }),
    }),
  }),
  
  // Mock real-time subscriptions
  channel: (name: string) => ({
    on: (event: string, callback: Function) => {
      // Simulate real-time updates for demo
      if (name === 'import-progress') {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          callback({
            new: {
              progress,
              status: progress >= 100 ? 'completed' : 'processing',
            },
          });
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 1000);
      }
      return { subscribe: () => {} };
    },
  }),
};

// Mock localStorage for persistence
export const mockLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(`ifla-mock-${key}`);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`ifla-mock-${key}`, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(`ifla-mock-${key}`);
    }
  },
};

// Initialize mock data on first load
export function initializeMockData(): void {
  const initialized = mockLocalStorage.getItem('initialized');
  if (!initialized) {
    // Generate some historical data
    console.log('Initializing IFLA mock data for first time...');
    mockLocalStorage.setItem('initialized', 'true');
    mockLocalStorage.setItem('initDate', new Date().toISOString());
  }
}

// Utility to generate realistic timestamps
export function generateTimestamp(daysAgo: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// Utility to simulate async delays
export function simulateDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}