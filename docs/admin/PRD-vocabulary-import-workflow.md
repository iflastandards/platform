# Product Requirements Document: Vocabulary Import Workflow

**Version**: 1.0  
**Date**: 2025-01-15  
**Status**: In Development  
**Priority**: P0 - Critical Path

## Overview

### Problem Statement
IFLA needs to import existing ISBD vocabulary spreadsheets into the new documentation-first platform. Currently, there's no UI to trigger the existing import scripts, validate data against profiles, or generate MDX documentation files with embedded RDF.

### Solution
Create an import workflow that connects the existing spreadsheet integration scripts with a user-friendly interface, enabling Review Group administrators to import vocabulary data, validate it against DCTAP profiles, and generate documentation.

## Goals and Objectives

### Primary Goals
1. Enable import of ISBD spreadsheets into MDX documentation format
2. Validate vocabulary data against namespace-specific DCTAP profiles
3. Generate Git branches for review before merging
4. Track import jobs and validation results

### Success Metrics
- Successfully import all ISBD vocabularies within 1 week
- Zero data loss during import process
- 100% of validation errors clearly reported
- Import process takes <5 minutes for typical namespace

## User Stories

### As a Review Group Administrator
- I want to import vocabulary spreadsheets so that I can bootstrap the documentation
- I want to see validation results so that I can fix issues before import
- I want to preview imported content so that I can verify correctness
- I want to track import progress so that I know when it's complete

### As a Namespace Editor
- I want to understand what was imported so that I can continue editing
- I want to see the validation rules so that I know the constraints
- I want to access import history so that I can understand changes

## Functional Requirements

### Import Wizard Interface

#### Step 1: Source Selection
- Select target namespace from available options
- Provide spreadsheet source:
  - GitHub issue number (with embedded URL)
  - Direct Google Sheets URL
  - File upload (Excel/CSV)
- Display spreadsheet preview if possible

#### Step 2: Profile Configuration
- Show current DCTAP profile for namespace
- Option to update profile before import
- Display which fields will be imported
- Show field mappings (spreadsheet → RDF)

#### Step 3: Validation
- Run validation against DCTAP profile
- Display results grouped by severity:
  - **Errors**: Must fix before import
  - **Warnings**: Should review but can proceed
  - **Info**: Suggestions for improvement
- Show line numbers and specific issues
- Provide "Fix and Retry" option

#### Step 4: Import Options
- Choose import mode:
  - **Dry Run**: Create preview branch only
  - **Direct Import**: Create and merge immediately
- Set branch name (auto-generated default)
- Add import notes/description

#### Step 5: Execution
- Show real-time progress
- Display files being created
- Log all actions taken
- Handle errors gracefully

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

### DCTAP Management

#### Profile Adapter
- Load comprehensive CSV baseline
- Extract namespace-relevant fields
- Infer additional fields from existing RDF
- Merge and reconcile profiles
- Save namespace-specific configuration

#### Profile UI
- View current profile configuration
- Edit field constraints
- Set required/optional fields
- Define validation rules
- Test against sample data

## Technical Requirements

### Architecture
- Next.js API routes for backend logic
- React components with MUI design system
- Supabase for job tracking and state
- Git operations via GitHub API
- Existing scripts for actual import

### Data Flow
1. User uploads/provides spreadsheet
2. System validates against DCTAP
3. On success, creates import job
4. Triggers script execution
5. Generates MDX files
6. Creates Git branch
7. Updates job status
8. Notifies user

### Integration Points
- GitHub API for branch/PR creation
- Google Sheets API for data access
- Existing import scripts
- Supabase for persistence
- Clerk for user identity

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

## Open Questions

1. Should we support bulk import of multiple namespaces?
2. How do we handle spreadsheet versioning?
3. What level of preview detail is needed?
4. Should imports be reversible?
5. How do we handle merge conflicts?

## Future Enhancements

1. AI-powered validation suggestions
2. Automatic mapping detection
3. Incremental import support
4. Direct edit in validation view
5. Template generation from profile