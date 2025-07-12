# Data Storage Architecture for IFLA Platform

## Overview

This document defines where different types of data are stored across the IFLA Standards Development Platform, balancing between version-controlled files, external services, and database storage.

## Storage Locations by Data Type

### 1. Version-Controlled in Git (Source of Truth)

**What Goes Here:**
- Vocabulary content (MDX files with RDF in frontmatter)
- DCTAP profiles (YAML/JSON files)
- Cerbos policies (YAML files in `/cerbos/policies/`)
- Docusaurus site configuration
- Build artifacts and generated RDF
- Documentation

**Example Structure:**
```
standards/isbd/
├── docs/
│   ├── elements/
│   │   └── *.mdx          # Element pages with RDF frontmatter
│   └── concepts/
│       └── *.mdx          # Concept pages with RDF frontmatter
├── dctap/
│   ├── minimum.yaml       # Minimum profile
│   └── recommended.yaml   # Recommended profile
└── rdf/
    └── generated/         # Build outputs
```

### 2. Clerk (User & Identity Management)

**What Goes Here:**
- User profiles and authentication
- Organization memberships
- User metadata:
  ```typescript
  {
    publicMetadata: {
      iflaRole: 'member' | 'staff' | 'admin',
      reviewGroupAdmin: string[], // ['isbd', 'bcm']
      externalContributor: boolean
    },
    privateMetadata: {
      projectMemberships: [{
        projectId: string,
        role: 'editor' | 'reviewer' | 'translator',
        joinedAt: Date
      }]
    }
  }
  ```

### 3. GitHub (Collaboration Infrastructure)

**What Goes Here:**
- Issues (including import requests with spreadsheet URLs)
- Pull requests and branches
- Project boards (task tracking)
- Releases and tags (version management)
- Team memberships
- Webhooks for events

### 4. Supabase (Application Database)

**Primary Use Cases:**
- Queue management (as mentioned)
- Transient operational data
- Audit logs and activity tracking
- Cache for expensive operations

**Proposed Tables:**

#### Core Entities
```sql
-- Review Groups (mostly static, could be config)
review_groups (
  id uuid PRIMARY KEY,
  slug text UNIQUE,  -- 'isbd', 'bcm', etc.
  name text,
  description text,
  created_at timestamp
)

-- Projects (GitHub Projects integration)
projects (
  id uuid PRIMARY KEY,
  review_group_id uuid REFERENCES review_groups,
  github_project_id bigint,
  name text,
  charter text,
  status text, -- 'planning', 'active', 'completed'
  start_date date,
  target_end_date date,
  created_at timestamp
)

-- Namespaces (linked to Git repos)
namespaces (
  id uuid PRIMARY KEY,
  slug text UNIQUE,  -- 'isbd', 'lrm', etc.
  name text,
  review_group_id uuid REFERENCES review_groups,
  github_repo text,  -- 'iflastandards/isbd'
  current_version text,
  google_sheet_id text,  -- Persistent sheet link
  created_at timestamp
)

-- Project-Namespace assignments
project_namespaces (
  project_id uuid REFERENCES projects,
  namespace_id uuid REFERENCES namespaces,
  assigned_at timestamp,
  PRIMARY KEY (project_id, namespace_id)
)
```

#### Import/Export Operations
```sql
-- Import jobs from spreadsheets
import_jobs (
  id uuid PRIMARY KEY,
  namespace_id uuid REFERENCES namespaces,
  github_issue_number integer,
  google_sheet_url text,
  dctap_profile text,
  status text, -- 'pending', 'processing', 'completed', 'failed'
  import_mode text, -- 'direct', 'dry-run'
  branch_name text,
  started_at timestamp,
  completed_at timestamp,
  created_by text, -- Clerk user ID
  result jsonb -- Detailed results
)

-- Validation results (cached)
validation_results (
  id uuid PRIMARY KEY,
  import_job_id uuid REFERENCES import_jobs,
  severity text, -- 'error', 'warning', 'info'
  line_number integer,
  column text,
  message text,
  suggestion text,
  created_at timestamp
)
```

#### Editorial Lifecycle
```sql
-- Editorial cycles
editorial_cycles (
  id uuid PRIMARY KEY,
  namespace_id uuid REFERENCES namespaces,
  version text,
  phase text, -- 'bootstrap', 'editing', 'review', 'publication'
  bootstrap_issue_number integer,
  google_sheet_id text,
  started_at timestamp,
  started_by text, -- Clerk user ID
  published_at timestamp,
  metadata jsonb
)

-- Nightly build results
nightly_builds (
  id uuid PRIMARY KEY,
  namespace_id uuid REFERENCES namespaces,
  run_date date,
  status text, -- 'success', 'failure'
  validation_summary jsonb,
  semantic_impact text, -- 'major', 'minor', 'patch'
  suggested_version text,
  artifact_path text,
  report_markdown text, -- SEMANTIC_IMPACT_REPORT content
  created_at timestamp
)
```

#### Activity & Audit
```sql
-- Activity logs (using spatie pattern)
activity_logs (
  id uuid PRIMARY KEY,
  log_name text,
  description text,
  subject_type text,
  subject_id uuid,
  causer_type text,
  causer_id text, -- Clerk user ID
  properties jsonb,
  created_at timestamp
)
```

### 5. Google Sheets (Temporary Working Space)

**What Goes Here:**
- Spreadsheet data during bulk editing phases
- Shared with service account for import
- NOT the source of truth after import

### 6. Local Storage / Session Storage

**What Goes Here:**
- UI preferences (theme, layout)
- Draft form data
- Temporary filters and sorts
- Cache for expensive computations

## Data Flow Examples

### Import Workflow
1. User creates GitHub issue with spreadsheet URL → **GitHub**
2. Admin initiates import, job created → **Supabase**
3. Spreadsheet fetched → **Google Sheets API**
4. Validation results cached → **Supabase**
5. MDX files created → **Git commit**
6. Branch/PR created → **GitHub**
7. Activity logged → **Supabase**

### User Access Check
1. User authenticates → **Clerk**
2. Get user metadata → **Clerk**
3. Get project assignments → **Clerk privateMetadata**
4. Check namespace permissions → **Cerbos policies** (in Git)
5. Log access → **Supabase**

### Version Publication
1. Review nightly build → **Supabase** (cached report)
2. Approve version → **UI action**
3. Tag created → **GitHub**
4. RDF published → **Git** (generated files)
5. Activity logged → **Supabase**

## Key Principles

1. **Git as Source of Truth**: All content and configuration that needs version control lives in Git
2. **Supabase for Operations**: Transient data, queues, caches, and audit logs
3. **External Services for Their Strengths**: 
   - Clerk for auth
   - GitHub for collaboration
   - Google Sheets for spreadsheet editing
4. **No Duplication**: Don't store in Supabase what's already in Git/GitHub
5. **Cache Judiciously**: Only cache expensive operations (like validation results)

## Migration Considerations

For the Potemkin village demo:
1. Mock Supabase calls can return static data
2. Use localStorage to simulate database persistence
3. Generate fake historical data for charts/timelines
4. Mock webhook events from GitHub/Clerk

## Security Notes

- Supabase RLS policies should enforce Cerbos decisions
- Sensitive data (tokens, credentials) in environment variables
- Audit logs should be immutable
- Regular backups of Supabase data
- Git repositories are the ultimate backup