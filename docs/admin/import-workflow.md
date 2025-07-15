# Vocabulary Management Workflow Documentation

## Overview

The vocabulary management system enables IFLA staff to manage vocabulary data through a round-trip workflow between the platform and Google Sheets. This supports the 4-phase vocabulary lifecycle and maintains RDF data integrity.

## Workflow Lifecycle

### Initial Migration (One-time)
```
Existing RDF → Generate Spreadsheet → Import to MDX
```

### Ongoing Management
```
MDX (source of truth) → Export to Sheets → Collaborative Editing → Import to MDX
```

## Export Phase

### 1. Project Setup
- The primary actor is Project **Editor**
- Editor selects element sets OR value vocabularies (never mixed in same sheet)
- Chooses languages to include
- Can add new language columns (with optional AI pre-translation)
- Can add new elements or reorder DCTAP columns
- Cannot edit/delete existing DCTAP rows (preserves RDF integrity)
- The DCTAP as altered by the 

### 2. Sheet Creation
- System creates sheet in IFLA's Google Drive
- Sends edit invitations to project members  
- Adds sheet to "Active Worksheets" in UI
- Sheet structure includes:
  - DCTAP worksheet (namespace configuration)
  - Index worksheet (lists all worksheets)
  - Element set OR value vocabulary worksheets
  - Selected subset of languages/elements

## Import Phase

### 1. Select Namespace & Active Sheet
- Choose target namespace from accessible namespaces
- Select from dropdown of active sheets or paste URL
- System already has reference to exported sheet

### 2. Execute Import (Early Execution)
- Create import job with tracking ID
- Download spreadsheet including DCTAP
- Begin processing pipeline

### 3. DCTAP Validation
- Compare imported DCTAP against namespace default
- If different, prompt user:
  - Update namespace default DCTAP? (versioned)
  - Create variant DCTAP for this import?
- Track DCTAP version for rollback capability

### 4. Validate & Preview
- Validate spreadsheet against selected DCTAP
- Run IFLA-specific validation rules
- Check for conflicts with Crowdin translations
- Generate preview of changes
- Show affected elements and files

### 5. Scaffold & Commit
- Generate MDX pages for Docusaurus
- Create atomic commit with system message
- Options:
  - **Dry-run** (default): Preview without committing
  - **Branch**: Import to `import/[namespace]-[date]`
  - **Direct**: Commit with 24hr revert window
- Editor reviews and confirms/rejects

## Current Implementation Status

### ✅ Completed
- Import UI wizard framework
- Job tracking system with real-time status updates
- Supabase integration for job persistence
- Mock validation system
- Status page for monitoring import progress
- Test suite following 5-level strategy

### 🚧 In Progress
- Google OAuth integration via Clerk
- Active worksheets management UI
- DCTAP versioning system
- Conflict detection with Crowdin
- Import manifest tracking

### 📋 TODO
- Two-stage commit workflow
- Dry-run preview mode
- Translation mode selector
- DCTAP rollback capability
- Comprehensive audit trail

## Architecture

### Components

1. **ImportWorkflow.tsx** - Main wizard UI
   - Manages both export and import flows
   - Handles active sheet selection
   - Coordinates with Google Drive

2. **ImportJobStatus.tsx** - Real-time job monitoring
   - Polls API every 2 seconds
   - Shows progress, validation results, and completion status
   - Links to preview/diff views

3. **ImportService.ts** - Business logic layer
   - Creates and manages import jobs
   - Handles validation and DCTAP comparison
   - Generates import manifests
   - Orchestrates MDX generation

4. **Google Integration**
   - OAuth via Clerk for authentication
   - Drive API for sheet management
   - Sheets API for data access
   - Automatic permission handling

5. **Supabase Integration**
   - `import_jobs` table for job tracking
   - `import_manifests` for rollback capability
   - `active_sheets` for worksheet management
   - `dctap_versions` for configuration tracking
   - `activity_logs` for audit trail

### API Routes

- `POST /api/actions/scaffold-from-spreadsheet` - Create import job
- `GET /api/actions/scaffold-from-spreadsheet?jobId={id}` - Check job status

## Setup Instructions

### 1. Supabase Setup

Run the setup script for detailed instructions:
```bash
pnpm tsx scripts/setup-supabase.ts
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Database Schema

Apply the schema from `apps/admin/src/lib/supabase/schema.sql` in your Supabase SQL editor.

## Usage

1. Navigate to `/admin/import`
2. Follow the wizard steps
3. Monitor progress on the status page
4. Check GitHub for the created branch/PR

## Integration Points

### Existing Tools to Connect

1. **Sheet Sync Tool** (`tools/sheet-sync/`)
   - Downloads and syncs Google Sheets data
   - Converts to CSV format
   - Already configured for IFLA standards

2. **Spreadsheet API** (`scripts/spreadsheet-api.ts`)
   - Google Sheets API integration
   - Vocabulary discovery and analysis
   - Batch processing capabilities

3. **RDF to CSV** (`scripts/rdf-to-csv.ts`)
   - Converts RDF to spreadsheet format
   - DCTAP profile support
   - Language handling

4. **Scaffold Site** (`scripts/scaffold-site.ts`)
   - Generates MDX from templates
   - Creates complete site structure
   - Nx project integration

## Translation Management

### Translation Mode Options
1. **Vocabulary Only** (via spreadsheet)
   - For structural vocabulary translations
   - Maintains RDF consistency
   - Batch processing capability

2. **Full Documentation** (via Crowdin)
   - For instructional content
   - Supports complex formatting
   - Professional translation workflow

3. **Hybrid Approach**
   - Vocabulary structure via spreadsheet
   - Instructions/examples via Crowdin
   - System merges both sources
   - Conflict resolution UI

### Editor's Choice
- System detects content type and suggests mode
- Editor can override based on project needs
- Clear guidelines for each approach

## Active Worksheets UI

### Location: `/namespaces/[namespace]`
- Dedicated "Active Worksheets" panel showing:
  - Sheet name and creation date
  - Direct Google Drive link
  - Last edited by/when
  - Current status (ready/in-progress/imported)
  - "Import Now" action button

### Additional UI Elements
- Badge on namespace cards showing active sheet count
- Dashboard widget "My Active Sheets"
- Real-time notifications for collaborator edits
- Filter/sort options for sheet management

## Import Manifest & Rollback

### Import Manifest Structure
```typescript
{
  importId: string
  namespaceId: string
  sheetId: string
  dctapVersion: string
  affectedElements: string[]
  previousValues: Record<string, any>
  importedBy: string
  importedAt: Date
  commitSha: string
  revertExpiresAt: Date // 24hr window
}
```

### Rollback Capabilities
- One-click revert within 24 hours
- Full restoration of previous values
- Automatic cleanup of generated files
- Audit trail preservation
- DCTAP version rollback

## Security & Permissions

### Google Integration
- OAuth via Clerk (single sign-on)
- Automatic Drive permissions
- Scoped access to IFLA folders only
- Refresh token management

### Namespace Permissions
- Cerbos policy enforcement
- Role-based access (e.g., `isbd-editor`)
- Activity logging for audit
- Import approval workflow

## Conflict Detection

### Pre-import Checks
1. Uncommitted changes in MDX files
2. Active Crowdin translations
3. Other pending imports
4. DCTAP version conflicts

### Resolution Options
- Force override (with backup)
- Merge changes
- Cancel and notify
- Queue for later

## Next Steps

### Phase 1: Core Infrastructure
1. **Google OAuth Integration**
   - Add Google provider to Clerk
   - Store refresh tokens
   - Test Drive API access

2. **Active Sheets Management**
   - Create Supabase tables
   - Build UI components
   - Add real-time sync

3. **Two-stage Commit Flow**
   - Preview generation
   - Diff visualization
   - Confirm/reject UI

### Phase 2: Advanced Features
1. **DCTAP Versioning**
   - Version tracking system
   - Rollback UI
   - Migration tools

2. **Translation Mode Selector**
   - Mode detection logic
   - Crowdin conflict checker
   - Merge algorithm

3. **Import Manifests**
   - Manifest generation
   - Revert functionality
   - Cleanup automation

### Phase 3: Polish & Scale
1. **Performance Optimization**
   - Batch processing
   - Background jobs
   - Progress streaming

2. **Enhanced Validation**
   - Custom rule engine
   - AI-powered suggestions
   - Quality scoring

3. **Collaboration Features**
   - Real-time cursors
   - Comment threads
   - Change proposals