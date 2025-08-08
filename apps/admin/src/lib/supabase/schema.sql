-- Minimal Supabase schema for IFLA Standards Admin
-- Focus on operational data only (content lives in Git)

-- Import jobs for tracking spreadsheet imports
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id TEXT NOT NULL,
  github_issue_number INTEGER,
  spreadsheet_url TEXT,
  status TEXT CHECK (status IN ('pending', 'validating', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  branch_name TEXT,
  validation_results JSONB,
  created_by TEXT NOT NULL, -- Clerk user ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Editorial cycles for tracking vocabulary lifecycle
CREATE TABLE editorial_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id TEXT NOT NULL,
  phase TEXT CHECK (phase IN ('bootstrap', 'editing', 'review', 'publication')) DEFAULT 'bootstrap',
  current_version TEXT,
  suggested_version TEXT,
  bootstrap_issue_number INTEGER,
  google_sheet_id TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  started_by TEXT NOT NULL, -- Clerk user ID
  metadata JSONB
);

-- Activity logs for audit trail
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_name TEXT NOT NULL,
  description TEXT,
  subject_type TEXT, -- 'namespace', 'project', 'import_job'
  subject_id TEXT,
  causer_id TEXT, -- Clerk user ID
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (supplements GitHub Projects)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_project_number INTEGER UNIQUE,
  review_group_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  charter TEXT,
  status TEXT CHECK (status IN ('planning', 'active', 'completed', 'on-hold')) DEFAULT 'active',
  assigned_namespaces TEXT[], -- Array of namespace slugs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL -- Clerk user ID
);

-- Simple DCTAP profiles per namespace
CREATE TABLE namespace_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace_id TEXT UNIQUE NOT NULL,
  profile JSONB NOT NULL, -- The actual DCTAP configuration
  based_on_csv BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT NOT NULL
);

-- Import logs for validation results and processing details
CREATE TABLE import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_job_id UUID REFERENCES import_jobs(id) ON DELETE CASCADE,
  log_type TEXT CHECK (log_type IN ('validation', 'processing', 'error', 'info')) NOT NULL,
  step TEXT, -- 'csv_parsing', 'dctap_validation', 'rdf_generation', etc.
  message TEXT,
  details JSONB, -- Structured data like validation issues
  severity TEXT CHECK (severity IN ('error', 'warning', 'info')) DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_import_jobs_namespace ON import_jobs(namespace_id);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_logs_job ON import_logs(import_job_id);
CREATE INDEX idx_import_logs_type ON import_logs(log_type);
CREATE INDEX idx_activity_logs_subject ON activity_logs(subject_type, subject_id);
CREATE INDEX idx_projects_review_group ON projects(review_group_slug);
CREATE INDEX idx_projects_status ON projects(status);

-- Enable Row Level Security
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE namespace_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - authorization handled via Clerk metadata)
-- For now, authenticated users can read everything but write is restricted

-- Import jobs: users can see all, create their own
CREATE POLICY "Users can view all import jobs" ON import_jobs
  FOR SELECT USING (true);

CREATE POLICY "Users can create import jobs" ON import_jobs
  FOR INSERT WITH CHECK (auth.uid()::text = created_by);

-- Activity logs: read-only for all authenticated users
CREATE POLICY "Users can view activity logs" ON activity_logs
  FOR SELECT USING (true);

-- Projects: viewable by all
CREATE POLICY "Users can view projects" ON projects
  FOR SELECT USING (true);

-- Namespace profiles: viewable by all
CREATE POLICY "Users can view namespace profiles" ON namespace_profiles
  FOR SELECT USING (true);

-- Import logs: viewable by all
CREATE POLICY "Users can view import logs" ON import_logs
  FOR SELECT USING (true);
