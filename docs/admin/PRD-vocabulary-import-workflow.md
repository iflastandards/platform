# Product Requirements Document: Vocabulary Management System

**Version**: 2.0  
**Date**: 2025-01-15  
**Status**: In Development  
**Priority**: P0 - Critical Path

## Overview

### Problem Statement
IFLA needs a comprehensive system to manage vocabulary lifecycles through collaborative editing in Google Sheets while maintaining RDF data integrity. The system must support both initial migration from existing RDF and ongoing round-trip workflows between MDX documentation and spreadsheets.

### Solution
Create a complete vocabulary management system with export/import workflows, collaborative editing via Google Sheets, version control, and multiple translation strategies. The system maintains MDX files as the source of truth while enabling familiar spreadsheet-based collaboration.

## Goals and Objectives

### Primary Goals
1. **Initial Migration**: Convert existing RDF to spreadsheets, then import to MDX format
2. **Round-trip Workflow**: Export MDX to sheets, collaborate, import changes back
3. **Maintain Integrity**: Preserve RDF structure while enabling collaborative editing
4. **Version Control**: Track all changes with rollback capability
5. **Translation Support**: Handle vocabulary translations via multiple strategies

### Success Metrics
- Successfully migrate all existing vocabularies within 2 weeks
- Zero data loss during round-trip workflows
- 100% of validation errors clearly reported with fixes
- Export/import cycle completes in <5 minutes
- 24-hour rollback window for all imports
- Support for 3 translation modes (vocabulary, documentation, hybrid)

## User Stories

### As a Review Group Administrator
- I want to export vocabularies to Google Sheets so my team can collaborate
- I want to import edited spreadsheets back to MDX with validation
- I want to preview changes before committing them
- I want to rollback imports within 24 hours if needed
- I want to choose how translations are handled (spreadsheet vs Crowdin)

### As a Namespace Editor  
- I want to see active worksheets for my namespace
- I want to add new language columns with AI pre-translation
- I want to reorder DCTAP columns without breaking RDF
- I want to track who edited what and when
- I want to resolve conflicts between different edit sources

### As a Project Collaborator
- I want to receive Google Sheets invitations automatically
- I want to see the current status of shared worksheets
- I want to know when my edits have been imported
- I want to understand validation errors in my language

## Functional Requirements

### Export Workflow

#### Step 1: Content Selection
- Choose namespace to export
- Select content type:
  - Element sets (never mixed with values)
  - Value vocabularies (never mixed with elements)
- Pick specific sets/vocabularies or all
- Choose languages to include

#### Step 2: Export Configuration
- Add new language columns with optional AI translation
- Reorder DCTAP columns (changes spreadsheet layout)
- Add new elements to DCTAP (cannot edit/delete existing)
- Set collaboration permissions

#### Step 3: Sheet Creation
- Generate sheet in IFLA Google Drive
- Send edit invitations to team members
- Add to "Active Worksheets" in UI
- Create tracking record in database

### Import Workflow

#### Step 1: Select Namespace & Sheet
- Choose target namespace
- Select from active sheets dropdown or paste URL
- Show sheet metadata (last edited, by whom)

#### Step 2: Execute Import (Early)
- Create import job with unique ID
- Download spreadsheet with DCTAP
- Begin processing pipeline

#### Step 3: DCTAP Validation
- Compare imported DCTAP with namespace default
- If changed, prompt user:
  - Update namespace default (with versioning)
  - Create variant for this import only
- Store DCTAP decision for rollback

#### Step 4: Validate & Preview
- Validate data against selected DCTAP
- Check IFLA-specific rules
- Detect conflicts (Crowdin, Git, other imports)
- Generate comprehensive preview
- Show diff of all changes

#### Step 5: Commit Strategy
- Choose approach:
  - **Dry Run** (default): Preview only, no changes
  - **Branch**: Create `import/[namespace]-[date]`
  - **Direct**: Commit with 24hr rollback
- Review complete changeset
- Confirm or reject import
- Create import manifest for rollback

### Post-Import Features

#### Import History
- List all imports for namespace
- Show who imported and when
- Link to resulting branches/PRs
- Access validation reports

#### Validation Reports
- Persistent storage of validation results
- Exportable as CSV/JSON
- Filterable by severity
- Include suggestions for fixes

### Translation Management

#### Translation Modes
1. **Vocabulary Only** (Spreadsheet)
   - Structural translations only
   - Maintains RDF consistency
   - Batch processing
   - AI pre-translation option

2. **Full Documentation** (Crowdin)
   - Complete documentation translation
   - Rich formatting support
   - Professional workflow
   - Version control integration

3. **Hybrid Mode**
   - Split vocabulary/documentation
   - Automatic content detection
   - Merge from both sources
   - Conflict resolution UI

#### Mode Selection Logic
- Analyze content ratio (vocabulary vs documentation)
- Suggest optimal mode
- Allow editor override
- Track mode per import

### Active Worksheets Management

#### Namespace View (`/namespaces/[namespace]`)
- Active Worksheets panel showing:
  - Sheet name and creation date
  - Direct Google Drive link
  - Last edited by/when
  - Status (ready/in-progress/imported)
  - "Import Now" action

#### Dashboard Integration
- "My Active Sheets" widget
- Badge counts on namespace cards
- Real-time edit notifications
- Quick actions menu

### DCTAP Versioning

#### Version Management
- Automatic versioning on changes
- Tagged versions (e.g., "v1.2")
- Comparison view between versions
- Rollback to any version
- Track which imports used which version

#### Profile Evolution
- Can add new elements
- Can reorder columns
- Cannot edit/delete existing (breaks RDF)
- Namespace-wide or variant profiles
- Migration tools for version updates

## Technical Requirements

### Architecture
- Next.js API routes for backend logic
- React components with MUI design system
- Supabase for job tracking and state
- Git operations via GitHub API
- Existing scripts for actual import

### Data Flow

#### Export Flow
1. User selects content to export
2. System creates sheet in Google Drive
3. Invitations sent to collaborators
4. Sheet added to active worksheets
5. Users edit collaboratively
6. System tracks changes

#### Import Flow  
1. User selects active sheet
2. System downloads with DCTAP
3. Validates against profiles
4. Generates preview/diff
5. User confirms strategy
6. System commits changes
7. Creates rollback manifest
8. Updates job status

### Integration Points
- **Google OAuth** via Clerk for SSO
- **Google Drive API** for sheet management
- **Google Sheets API** for data access
- **GitHub API** for version control
- **Supabase** for state management
- **Crowdin API** for translation conflicts
- **Existing scripts** for processing

### Performance Requirements
- Import wizard loads in <2 seconds
- Validation completes in <30 seconds
- Import process completes in <5 minutes
- Support files up to 10MB

### Security Requirements
- Validate all input data
- Sanitize file uploads
- Require authentication
- Audit all actions
- Secure API endpoints

## Non-Functional Requirements

### Usability
- Clear progress indicators
- Helpful error messages
- Inline documentation
- Keyboard navigation
- Mobile-responsive

### Reliability
- Handle network failures gracefully
- Resume interrupted imports
- Rollback failed imports
- Preserve data integrity

### Maintainability
- Modular component design
- Comprehensive logging
- Error tracking
- Performance monitoring

## User Interface Design

### Visual Hierarchy
1. Wizard progress bar at top
2. Main content area for current step
3. Navigation buttons at bottom
4. Help sidebar (collapsible)

### Component Library
- MUI Stepper for wizard
- DataGrid for spreadsheet preview
- Alert for validation messages
- LinearProgress for import progress
- Snackbar for notifications

### Responsive Design
- Desktop: Full wizard interface
- Tablet: Condensed layout
- Mobile: Single column with accordion steps

## Dependencies

### External Dependencies
- GitHub API access
- Google Sheets API credentials
- Existing import scripts must be working
- Supabase project configured

### Internal Dependencies
- Authentication via Clerk
- User must have appropriate permissions
- Namespace must exist in system
- Git repository must be configured

## Timeline and Phases

### Phase 1: MVP (Week 1)
- Basic import wizard UI
- Connect to existing scripts
- Simple validation display
- Create preview branches

### Phase 2: Enhancement (Week 2)
- DCTAP profile management
- Advanced validation rules
- Import history tracking
- Batch import support

### Phase 3: Polish (Week 3)
- Performance optimization
- Enhanced error handling
- Comprehensive help docs
- Analytics integration

## Acceptance Criteria

### Import Wizard
- [ ] All 5 steps functional
- [ ] Validation prevents bad imports
- [ ] Preview branch created successfully
- [ ] Progress tracked in Supabase
- [ ] Errors handled gracefully

### DCTAP Integration
- [ ] Profiles loaded from CSV
- [ ] Namespace-specific customization
- [ ] Validation uses correct profile
- [ ] Profile changes persist

### User Experience
- [ ] <5 clicks to complete import
- [ ] Clear error messages
- [ ] Successful import notification
- [ ] Can resume interrupted import

## Database Schema

### Core Tables
```sql
-- Active worksheet tracking
CREATE TABLE active_sheets (
  id UUID PRIMARY KEY,
  namespace_id TEXT NOT NULL,
  sheet_id TEXT NOT NULL, -- Google Sheets ID
  sheet_url TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  last_edited_at TIMESTAMPTZ,
  last_edited_by TEXT,
  status TEXT NOT NULL, -- ready, in_progress, imported
  import_job_id UUID REFERENCES import_jobs(id)
);

-- Import manifests for rollback
CREATE TABLE import_manifests (
  id UUID PRIMARY KEY,
  import_job_id UUID REFERENCES import_jobs(id),
  namespace_id TEXT NOT NULL,
  sheet_id TEXT NOT NULL,
  dctap_version TEXT NOT NULL,
  affected_elements JSONB NOT NULL,
  previous_values JSONB NOT NULL,
  commit_sha TEXT,
  imported_by TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL,
  revert_expires_at TIMESTAMPTZ NOT NULL
);

-- DCTAP version tracking
CREATE TABLE dctap_versions (
  id UUID PRIMARY KEY,
  namespace_id TEXT NOT NULL,
  version TEXT NOT NULL,
  profile JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  is_default BOOLEAN DEFAULT FALSE
);
```

## Rollback Strategy

### Implementation
1. **Manifest Creation**: Store complete state before import
2. **24-Hour Window**: Automatic expiration of rollback option
3. **One-Click Revert**: Simple UI action to restore
4. **Audit Trail**: Keep record even after rollback
5. **Cascading Cleanup**: Remove generated files

### Conflict Resolution

#### Detection Points
1. Uncommitted Git changes
2. Active Crowdin translations
3. Concurrent imports
4. DCTAP version mismatches

#### Resolution Strategies
1. **Queue**: Delay until conflict resolves
2. **Merge**: Attempt automatic merge
3. **Override**: Force with backup
4. **Cancel**: Abort and notify

## Open Questions (Resolved)

1. **Google Auth**: Yes, integrate via Clerk OAuth
2. **Commit Flow**: Two-stage with preview and confirm
3. **Revert Strategy**: Dry-run default with 24hr rollback
4. **Crowdin Integration**: Three modes with editor choice
5. **Active Sheets UI**: Dedicated panel in namespace view

## Future Enhancements

### Phase 1 (Immediate)
1. Google OAuth integration
2. Active worksheets UI
3. Basic import/export flow
4. Simple validation

### Phase 2 (Month 2)
1. DCTAP versioning system
2. Translation mode selector
3. Conflict detection
4. Import manifests

### Phase 3 (Month 3)
1. AI translation integration
2. Advanced validation rules
3. Real-time collaboration
4. Performance optimization