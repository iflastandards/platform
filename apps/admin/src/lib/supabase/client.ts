import { createClient } from '@supabase/supabase-js';

// Supabase types
export interface ImportJob {
  id: string;
  namespace_id: string;
  github_issue_number?: number;
  spreadsheet_url?: string;
  status: 'pending' | 'validating' | 'processing' | 'completed' | 'failed';
  branch_name?: string;
  validation_results?: any;
  created_by: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface EditorialCycle {
  id: string;
  namespace_id: string;
  phase: 'bootstrap' | 'editing' | 'review' | 'publication';
  current_version?: string;
  suggested_version?: string;
  bootstrap_issue_number?: number;
  google_sheet_id?: string;
  started_at: string;
  started_by: string;
  metadata?: any;
}

export interface ActivityLog {
  id: string;
  log_name: string;
  description?: string;
  subject_type?: string;
  subject_id?: string;
  causer_id?: string;
  properties?: any;
  created_at: string;
}

export interface Project {
  id: string;
  github_project_number?: number;
  review_group_slug: string;
  name: string;
  charter?: string;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  assigned_namespaces?: string[];
  created_at: string;
  created_by: string;
}

export interface NamespaceProfile {
  id: string;
  namespace_id: string;
  profile: any;
  based_on_csv: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface ActiveSheet {
  id: string;
  namespace_id: string;
  sheet_id: string;
  sheet_url: string;
  created_by: string;
  created_at: string;
  last_edited_at?: string;
  last_edited_by?: string;
  status: 'ready' | 'in_progress' | 'imported' | 'archived';
  import_job_id?: string;
  project_id?: string;
  metadata?: any;
}

// Database types
export interface Database {
  public: {
    Tables: {
      import_jobs: {
        Row: ImportJob;
        Insert: Omit<ImportJob, 'id' | 'created_at'>;
        Update: Partial<Omit<ImportJob, 'id'>>;
      };
      editorial_cycles: {
        Row: EditorialCycle;
        Insert: Omit<EditorialCycle, 'id' | 'started_at'>;
        Update: Partial<Omit<EditorialCycle, 'id'>>;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: Omit<ActivityLog, 'id' | 'created_at'>;
        Update: never;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'created_at'>;
        Update: Partial<Omit<Project, 'id'>>;
      };
      namespace_profiles: {
        Row: NamespaceProfile;
        Insert: Omit<NamespaceProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<NamespaceProfile, 'id'>>;
      };
      active_sheets: {
        Row: ActiveSheet;
        Insert: Omit<ActiveSheet, 'id' | 'created_at'>;
        Update: Partial<Omit<ActiveSheet, 'id'>>;
      };
    };
  };
}

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Using mock mode.');
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Mock storage for development
const mockStorage: Record<string, any[]> = {
  import_jobs: [],
  editorial_cycles: [],
  activity_logs: [],
  projects: [],
  namespace_profiles: [],
  active_sheets: [],
};

// Mock client for development without Supabase
export const mockSupabase = {
  from: (table: string) => ({
    select: () => ({
      eq: (field: string, value: any) => ({
        single: () => Promise.resolve({
          data: mockStorage[table]?.find((row) => row[field] === value) || null,
          error: null,
        }),
        order: () => Promise.resolve({
          data: mockStorage[table]?.filter((row) => row[field] === value) || [],
          error: null,
        }),
      }),
      order: (column: string, options?: { ascending?: boolean }) => Promise.resolve({
        data: mockStorage[table]?.sort((a, b) => {
          const ascending = options?.ascending !== false;
          const aVal = a[column];
          const bVal = b[column];
          if (aVal < bVal) return ascending ? -1 : 1;
          if (aVal > bVal) return ascending ? 1 : -1;
          return 0;
        }) || [],
        error: null,
      }),
      single: () => Promise.resolve({
        data: mockStorage[table]?.[0] || null,
        error: null,
      }),
    }),
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          const newItem = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            ...data,
          };
          if (!mockStorage[table]) mockStorage[table] = [];
          mockStorage[table].push(newItem);
          return { data: newItem, error: null };
        },
      }),
    }),
    update: (data: any) => ({
      eq: (field: string, value: any) => {
        const index = mockStorage[table]?.findIndex((row) => row[field] === value);
        if (index !== -1 && mockStorage[table]) {
          mockStorage[table][index] = { ...mockStorage[table][index], ...data };
          return Promise.resolve({ data: mockStorage[table][index], error: null });
        }
        return Promise.resolve({ data: null, error: { message: 'Not found' } });
      },
    }),
    delete: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
  }),
};

// Export the client to use (real or mock)
export const db = supabase || mockSupabase;