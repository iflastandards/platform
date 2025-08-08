# Vocabulary Management UI Implementation Plan

## Project Context

This document serves as the master reference for implementing a MUI-based "Potemkin village" demonstration of the IFLA vocabulary management system. The system showcases the complete vocabulary lifecycle from spreadsheet import through RDF generation and publication.

## Session Summary (2025-07-12)

### What We've Accomplished
1. **Integrated Material-UI (MUI)** into the admin application with OMR25 color scheme
2. **Clarified the organizational model**:
   - Review Groups (perpetual organizations) charter Projects (working groups)
   - Projects have Teams with members in specific roles
   - Projects are assigned Namespaces to work on
   - GitHub Projects provides task management
3. **Defined authentication/authorization architecture**:
   - Clerk for identity management and invitations
   - Custom RBAC via Clerk publicMetadata
   - GitHub for project management and repository access
4. **Planned comprehensive vocabulary management UI** with focus on the 4-phase lifecycle

### Current State
- MUI theme configured with OMR25 colors (primary teal #0F766E)
- AdminDashboard updated with Projects navigation
- Basic theme context for dark/light mode switching
- Documentation created for projects/teams structure and auth architecture

## Core Vocabulary Management Workflows

### 1. Import Spreadsheet to Scaffold Site Workflow
```
1. User logs in → Role-based namespace selector
2. Admin selects namespace → Sees pending GitHub issues
3. Actions tab → "Scaffold namespace from spreadsheet" action
4. Import confirmation page → Verifies spreadsheet from GitHub issue
5. Confirms action → Submitted to Vercel function which:
   a. Converts spreadsheets to CSV
   b. Validates against DCTAP profile
   c. If errors: generates report and GitHub issue
   d. If success: scaffolds element/concept pages
   e. Creates branch for dry-run preview
```

### 2. Four-Phase Vocabulary Lifecycle
1. **Bootstrap (Cycle Kick-off)**
   - Admin initiates new editorial cycle
   - Exports current RDF to Google Sheets
   - Team performs bulk updates
   - Import creates MDX files with embedded RDF

2. **Daily Editing**
   - TinaCMS for prose editing
   - Form-based RDF metadata editing
   - Real-time validation on save

3. **Nightly Assembly**
   - Automated builds harvest changes
   - AI-powered semantic versioning
   - Impact reports for review

4. **Publication**
   - Admin reviews impact report
   - Confirms version number
   - One-click publish to vocabulary server

## System Requirements

### Minimally Viable Features
1. Manage users, roles, projects, namespaces, docusaurus sites, GitHub integration
2. Accept uploaded Excel/RDF for input
3. DCTAP profile management per project
4. Empty spreadsheet templates from profiles
5. Spreadsheet validation against profiles
6. RDF → populated spreadsheet generation
7. Spreadsheet → Docusaurus site scaffolding
8. Git branches for version control
9. Batch import/export of vocabularies
10. Namespace versioning with GitHub tags
11. TinaCMS page/frontmatter editing
12. AI-powered content generation

## Technical Architecture

### Technology Stack
- **Frontend**: Next.js 15.2.5 (App Router)
- **UI Library**: MUI 7.2.0 with OMR25 theme
- **Data Grid**: @mui/x-data-grid for spreadsheet views
- **Authentication**: Clerk (mocked for demo)
- **Authorization**: Custom RBAC (implemented)
- **Version Control**: GitHub integration
- **Functions**: Vercel serverless (mocked)
- **Database**: Supabase (mocked for demo)

### Data Storage Strategy
See `developer_notes/data-storage-architecture.md` for complete details.

**Key Points**:
- **Git**: Source of truth for vocabularies (MDX files), DCTAP profiles, policies
- **Clerk**: User profiles and project memberships
- **GitHub**: Issues, PRs, project boards, releases
- **Supabase**: Import jobs, validation results, editorial cycles, activity logs
- **Google Sheets**: Temporary workspace during bulk editing

### File Structure
```
apps/admin/src/
├── lib/mock-data/
│   ├── auth.ts                    # Clerk-like user sessions
│   ├── github-integration.ts      # Issues, repos, branches
│   ├── namespaces-extended.ts     # Enhanced namespace data
│   ├── vocabularies.ts            # Vocabulary lifecycle data
│   ├── dctap-profiles.ts          # Profile definitions
│   ├── spreadsheets.ts            # Google Sheets metadata
│   ├── validation.ts              # Validation results
│   ├── translations.ts            # Translation progress
│   ├── supabase/
│   │   ├── import-jobs.ts         # Import job history
│   │   ├── editorial-cycles.ts    # Cycle state tracking
│   │   ├── nightly-builds.ts      # Build results
│   │   └── activity-logs.ts       # Audit trail
│
├── components/
│   ├── common/
│   │   ├── NamespaceSelector.tsx # Role-based namespace cards
│   │   ├── StatusChip.tsx        # Consistent status badges
│   │   ├── RoleChip.tsx          # User role indicators
│   │   ├── ProgressBar.tsx       # Import/export progress
│   │   └── ActivityFeed.tsx      # Timeline component
│   │
│   ├── github/
│   │   ├── IssueCard.tsx         # GitHub issue display
│   │   ├── BranchPreview.tsx     # Branch status viewer
│   │   └── PullRequestStatus.tsx # PR integration
│   │
│   ├── vocabulary/
│   │   ├── SpreadsheetViewer.tsx # Excel-like DataGrid
│   │   ├── ValidationReport.tsx  # Error/warning display
│   │   ├── RdfVisualization.tsx  # Tree view for RDF
│   │   ├── VersionTimeline.tsx   # Version history
│   │   └── DctapConstraintBuilder.tsx
│   │
│   └── import/
│       ├── SpreadsheetPreview.tsx # Pre-import preview
│       ├── ImportStepper.tsx      # Multi-step wizard
│       ├── ValidationResults.tsx  # DCTAP check results
│       └── ImportProgress.tsx     # Real-time status
│
└── app/dashboard/
    ├── page.tsx                   # Role-based landing
    ├── [role]/[namespace]/
    │   ├── page.tsx              # Namespace dashboard
    │   ├── actions/              # Available actions
    │   ├── import/               # Import workflow
    │   ├── templates/            # DCTAP templates
    │   ├── batch/                # Bulk operations
    │   ├── versions/             # Version management
    │   └── pages/                # TinaCMS mock
    └── projects/[id]/
        └── profiles/             # DCTAP management
```

## Mock Data Models

### User with Namespace Roles
```typescript
interface MockUser {
  id: string;
  email: string;
  name: string;
  publicMetadata: {
    iflaRole?: 'member' | 'staff' | 'admin';
    reviewGroupAdmin?: string[];
    externalContributor: boolean;
  };
  privateMetadata: {
    projectMemberships: {
      projectId: string;
      projectName: string;
      role: 'editor' | 'reviewer' | 'translator';
      reviewGroup: string;
      namespaces: string[];
    }[];
  };
}
```

### GitHub Issue for Import
```typescript
interface MockGitHubIssue {
  number: number;
  title: string;
  body: string; // Markdown with spreadsheet URL, DCTAP profile
  labels: string[];
  state: 'open' | 'closed';
  created_at: string;
  assignee?: string;
}
```

### Vocabulary with Lifecycle
```typescript
interface MockVocabulary {
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
  };
  
  dctapProfiles: {
    minimum: string;
    recommended?: string;
  };
}
```

## Key UI Patterns

### 1. Role-Based Navigation
- Landing page shows namespace cards based on user role
- Super admins see all namespaces
- Regular users see only assigned namespaces
- Role badge on each card (Admin/Reviewer/Translator)

### 2. GitHub Issue Integration
- Issues appear as cards in namespace dashboard
- Template: "[Import] {Namespace} {Description}"
- Labels indicate status: 'import-request', 'validated', 'processing'
- One-click navigation to import workflow

### 3. Import Wizard (Stepper)
```typescript
const steps = [
  'Source Verification',      // Show GitHub issue details
  'Spreadsheet Preview',      // Preview data from sheet
  'DCTAP Validation',        // Show validation results
  'Import Options',          // Direct vs dry-run branch
  'Confirm & Execute'        // Final confirmation
];
```

### 4. Validation Visualization
- Grouped by severity (Error/Warning/Info)
- Line numbers for spreadsheet rows
- Expandable details for each issue
- Jump-to functionality

### 5. Version Management
- Timeline visualization of versions
- Semantic version badges
- GitHub release tag associations
- Comparison tools between versions

## Implementation Phases

### Phase 1: Core Infrastructure (Priority: High)
1. Create all mock data generators
2. Implement common components
3. Set up role-based routing

### Phase 2: Import Workflow (Priority: High)
1. Landing page with namespace selector
2. Namespace dashboard with GitHub issues
3. Import wizard with validation
4. Results and error handling

### Phase 3: Vocabulary Management (Priority: Medium)
1. Spreadsheet viewer/editor
2. DCTAP profile management
3. Validation reports
4. Version timeline

### Phase 4: Advanced Features (Priority: Low)
1. Batch operations
2. Translation management
3. AI content generation mock
4. Nightly build simulation

## Critical Implementation Notes

1. **Mock Data Consistency**: Use consistent IDs across all mock data relationships
2. **Real-time Updates**: Simulate progress with setTimeout/setInterval
3. **Error States**: Include validation failures and import errors in mocks
4. **Responsive Design**: Test on mobile viewports
5. **Role Enforcement**: Conditionally render based on user role
6. **MUI Theme**: Use theme colors consistently (primary.main for actions)

## Mock Supabase Integration

For the Potemkin village demo, we'll mock Supabase calls:

```typescript
// Example mock Supabase client
export const mockSupabase = {
  from: (table: string) => ({
    select: () => Promise.resolve({ data: getMockData(table) }),
    insert: (data: any) => Promise.resolve({ data, error: null }),
    update: (data: any) => Promise.resolve({ data, error: null }),
    delete: () => Promise.resolve({ error: null })
  }),
  
  // Mock real-time subscriptions
  channel: (name: string) => ({
    on: (event: string, callback: Function) => {
      // Simulate real-time updates
      setTimeout(() => callback({ new: mockRealtimeData }), 2000);
      return { subscribe: () => {} };
    }
  })
};
```

### Persistent Storage Simulation
- Use localStorage for persistence across sessions
- Generate realistic historical data on first load
- Maintain relationships between entities
- Simulate delays for async operations

## Next Steps for Implementation

1. Start with mock data generators (auth.ts, github-integration.ts, etc.)
2. Create NamespaceSelector component for landing page
3. Implement role-based routing structure
4. Build namespace dashboard with GitHub issue cards
5. Create import wizard with MUI Stepper
6. Add validation visualization components

## References

- MUI Documentation: https://mui.com/material-ui/
- Existing mockup paths: `/Users/jonphipps/Library/Mobile Documents/com~apple~CloudDocs/IFLA/mockups/`
- Theme configuration: `/apps/admin/src/theme/mui-theme.ts`
- Current AdminDashboard: `/apps/admin/src/app/dashboard/AdminDashboard.tsx`

---

This document should be read at the start of each session to maintain context and continue implementation.