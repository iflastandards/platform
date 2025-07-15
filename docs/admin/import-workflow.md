# Import Workflow Documentation

## Overview

The import workflow enables IFLA staff to import vocabulary data from Google Sheets into the platform. This is a critical feature for the 4-phase vocabulary lifecycle.

## Current Implementation Status

### ✅ Completed
- Import UI wizard with 5-step process
- Job tracking system with real-time status updates
- Supabase integration for job persistence
- Mock validation system
- Status page for monitoring import progress

### 🚧 In Progress
- Actual spreadsheet downloading from Google Sheets
- DCTAP validation against comprehensive CSV profiles
- MDX generation from spreadsheet data
- GitHub branch creation and PR workflow

### 📋 TODO
- TinaCMS integration evaluation
- Production Supabase setup
- Google Sheets API credentials
- Connect to existing sheet-sync tools

## Architecture

### Components

1. **ImportWorkflow.tsx** - Main wizard UI
   - Step 1: Select namespace
   - Step 2: Provide spreadsheet URL
   - Step 3: Configure DCTAP profile
   - Step 4: Validate data
   - Step 5: Execute import

2. **ImportJobStatus.tsx** - Real-time job monitoring
   - Polls API every 2 seconds
   - Shows progress, validation results, and completion status

3. **ImportService.ts** - Business logic layer
   - Creates and manages import jobs
   - Handles validation
   - Orchestrates the import process

4. **Supabase Integration**
   - `import_jobs` table for job tracking
   - `activity_logs` for audit trail
   - Mock client for development

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

## Next Steps

1. **Complete Google Sheets Integration**
   - Set up service account credentials
   - Connect ImportService to spreadsheet-api.ts
   - Implement actual data download

2. **DCTAP Validation**
   - Load comprehensive CSV profiles
   - Implement profile-based validation
   - Generate meaningful error messages

3. **MDX Generation**
   - Create templates for vocabulary pages
   - Generate concept pages
   - Update navigation and indexes

4. **GitHub Integration**
   - Create branches programmatically
   - Generate pull requests
   - Link to GitHub issues

5. **TinaCMS Evaluation**
   - Research integration approaches
   - Compare with custom editor
   - Make build vs. integrate decision