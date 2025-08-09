# Subsystems Architecture

**Version:** 2.0  
**Date:** July 2025  
**Status:** Current Implementation

## Overview

This document captures important subsystem architectures discovered throughout the codebase that represent significant components of the IFLA Standards Platform. These subsystems extend and enhance the core platform capabilities.

## 1. RDF Converter Pipeline (Phase 4)

### Overview
A major expansion of the RDF converter tooling to create a complete collaborative workflow system integrating Google Sheets for vocabulary editing. This represents a significant investment in tooling for the vocabulary management lifecycle.

### Architecture Components

#### Google Sheets Integration Module
**Purpose**: TypeScript-first interface for all Google Sheets operations
```typescript
// Core responsibilities
- Authentication: Service account setup and management
- CRUD Operations: Create, read, update, delete sheets and data
- Formatting: Apply IFLA-specific formatting and validation
- Sharing: Manage permissions and collaboration
- Data Sync: Bidirectional sync between CSV and Sheets
```

#### Pipeline Orchestrator
**Purpose**: Coordinate the entire workflow from RDF to final MDX files
```
Pipeline Steps:
1. RDF → CSV conversion
2. CSV → Google Sheets upload
3. Collaborative editing period
4. Sheets → CSV download
5. CSV → MDX generation
6. Git commit and PR creation
```

#### Database Schema for Job Tracking
```sql
-- Core tables for pipeline management
pipeline_jobs (
  id uuid PRIMARY KEY,
  namespace text,
  status text, -- pending, processing, completed, failed
  created_by text,
  created_at timestamp
)

namespace_sheets (
  id uuid PRIMARY KEY,
  namespace text,
  sheet_id text,
  last_sync timestamp
)

mdx_files (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES pipeline_jobs,
  file_path text,
  content text,
  created_at timestamp
)
```

### Implementation Phases

#### Phase 4.0: ISBD Integration (Immediate)
- Process existing ISBD spreadsheet
- Complete "orphan sheet" integration
- Design update workflow

#### Phase 4.1-4.4: Full Implementation
- Architecture & Design
- Foundation Enhancement
- Pipeline Core
- Admin UI & Integration
- Hardening & Polish

### Key Design Decisions
- Service account authentication (not OAuth)
- Rate limiting and quota management
- State machine for pipeline steps
- UI-first approach for non-technical users

## 2. Vocabulary Lifecycle Architecture

### Overview
Comprehensive content and vocabulary lifecycle management system integrating Google Sheets for structured data and TinaCMS for prose authoring.

### Core Principles
1. **Clear Separation of Concerns**: Right tool for right job
2. **Git as Single Source of Truth**: All changes tracked
3. **Continuous Integration**: Nightly assembly with feedback

### Four-Phase Lifecycle

#### Phase 1: Cycle Kick-off (Bootstrap)
```
Admin Action → Create/Export to Google Sheet → Editorial Team Edits → Import to Git
```
- One-time administrator-triggered event
- Exports existing RDF to Google Sheet
- Bulk editing in collaborative environment
- Import validates and generates MDX files

#### Phase 2: Incremental Editing (Daily)
```
Editor Login → TinaCMS Editing → Validation Hook → Git Commit
```
- Day-to-day editorial work
- Prose editing via rich-text editor
- Structured data via custom forms
- Real-time validation before commit

#### Phase 3: Nightly Assembly (CI)
```
GitHub Action → Harvest Changes → Assemble Draft → AI Evaluation → Report
```
- Automated nightly process
- Assembles draft vocabulary
- Compares against last published version
- Generates semantic impact report

##### AI-Powered Semantic Versioning Analysis
The nightly assembly includes sophisticated AI analysis that provides data-driven versioning recommendations:

```typescript
interface SemanticVersionAnalysis {
  recommendedVersion: {
    major: boolean;  // Breaking changes detected
    minor: boolean;  // New features added
    patch: boolean;  // Bug fixes only
    version: string; // e.g., "2.1.0"
  };
  
  changeImpact: {
    breakingChanges: BreakingChange[];
    newFeatures: Feature[];
    fixes: BugFix[];
    deprecations: Deprecation[];
  };
  
  compatibility: {
    backwardCompatible: boolean;
    affectedImplementations: string[];
    migrationRequired: boolean;
  };
  
  executiveSummary: string;  // Human-readable impact analysis
}
```

**How It Works**:
1. **Change Detection**: Analyzes all modifications since last published version
2. **Pattern Recognition**: Identifies types of changes (additions, modifications, deletions)
3. **Impact Assessment**: Evaluates semantic impact on existing implementations
4. **Version Recommendation**: Suggests appropriate version number following semver
5. **Report Generation**: Creates detailed changelog with clear explanations

**Benefits**:
- Removes guesswork from versioning decisions
- Ensures consistent versioning across all vocabularies
- Provides transparency for implementers
- Automates changelog generation

#### Phase 4: Publication (Release)
```
Admin Review → Version Selection → Publish API → Tag & Deploy
```
- Administrator-triggered release
- Semantic versioning suggestion
- Creates Git tag
- Deploys to vocabulary server

### API Endpoints
- `POST /api/cycle/import` - Import from Google Sheet
- `POST /api/tina/validateOnSave` - Pre-commit validation
- `POST /api/publish` - Publish new version

## 3. Admin Portal Authentication Architecture

### Problem Solved
- CORS issues between admin portal and Docusaurus sites
- Hardcoded URLs breaking across environments
- Lack of environment-aware configuration

### Solution Architecture

#### Cross-Domain Authentication
```typescript
// Environment-aware URL configuration
export const ADMIN_PORTAL_CONFIG: Record<Environment, AdminPortalConfig> = {
  local: {
    url: 'http://localhost:3007/admin',
    signinUrl: 'http://localhost:3007/admin/auth/signin',
    sessionApiUrl: 'http://localhost:3007/admin/api/auth/session',
  },
  preview: {
    url: 'https://admin-iflastandards-preview.onrender.com',
    // ... preview URLs
  },
  production: {
    url: 'https://www.iflastandards.info/admin',
    // ... production URLs
  }
};
```

#### CORS Configuration
```javascript
// Proper CORS headers for cross-origin requests
headers: [
  {
    key: 'Access-Control-Allow-Origin',
    value: process.env.NODE_ENV === 'production' 
      ? 'https://www.iflastandards.info'
      : 'http://localhost:3008'
  }
]
```

#### Environment Detection
- Automatic detection based on hostname
- SSR-safe with server/client handling
- Fallback to local for unknown environments

## 4. OMR25 Vocabulary Management

### Overview
Enterprise-grade vocabulary management system integrated into the admin portal, providing comprehensive workflows for vocabulary lifecycle management.

### Core Features

#### Import/Export Workflows
- Spreadsheet upload with validation
- DCTAP profile enforcement
- Detailed error reporting with row/column references
- Batch operations for multiple vocabularies

#### Versioning & Publication
- Semantic version suggestions
- Change summaries and diffs
- GitHub Release integration
- Tag-based version control

#### Translation Management
- Dedicated translator workspace
- Language-specific editing
- Progress tracking for incomplete translations
- Structured storage format

#### Quality Assurance
- Real-time validation feedback
- Comprehensive error reporting
- DCTAP profile management
- Pre-publication readiness checks

### Technical Architecture
```
Admin Portal UI
    ↓
Next.js API Routes
    ↓
Validation & Processing Layer
    ├── DCTAP Validation
    ├── RDF Generation
    └── Git Operations
    ↓
Storage Layer
    ├── Git Repository (Source of Truth)
    ├── Supabase (Job Tracking)
    └── Google Sheets (Temporary Workspace)
```

## 5. Vocabulary Site Scaffolding System

### Overview
Automated system for creating new vocabulary documentation sites with standardized structure and configuration.

### Components
- Template-based site generation
- Automatic Nx project configuration
- Docusaurus setup with IFLA theme
- Integration with central configuration matrix

### Generated Structure
```
standards/{new-site}/
├── docusaurus.config.ts    # Pre-configured
├── project.json            # Nx configuration
├── docs/                   # Documentation structure
├── src/                    # Custom components
└── static/                 # Static assets
```

## 6. Component Libraries

### VocabularyTable Component
**Location**: `packages/theme/src/components/VocabularyTable/`

#### Features
- Multilingual vocabulary display
- Sortable, filterable tables
- Accessibility compliant
- Performance optimized for large datasets
- Export functionality

#### Architecture
- React-based with TypeScript
- Uses React Table for functionality
- Integrated with theme system
- Server-side rendering compatible

### Other Shared Components
- Navigation components with environment awareness
- Authentication UI components
- Form components for vocabulary editing
- Status indicators and progress bars

## 7. Testing Infrastructure

### E2E Testing Architecture
- Playwright-based cross-browser testing
- Environment-aware test configuration
- Authentication flow testing
- Cross-site navigation validation

### Integration Test Patterns
- Database transaction testing
- API endpoint validation
- Workflow completion verification
- Error handling scenarios

## 8. Build and Deployment Tools

### Scripts Organization
**Location**: Various `/scripts/` directories

#### Categories
- Build optimization scripts
- Data migration utilities
- Validation and testing tools
- Deployment automation

#### Key Scripts
- `populate-from-csv.ts` - CSV to MDX generation
- `nightly-assembly.ts` - Automated vocabulary assembly
- `sheet-sync/` - Google Sheets synchronization
- `scaffold-site.ts` - New site generation

## Integration Points

### How Subsystems Connect
1. **RDF Pipeline** → feeds → **Vocabulary Lifecycle**
2. **Admin Auth** → secures → **OMR25 Management**
3. **Scaffolding** → creates → **New Vocabulary Sites**
4. **Components** → used by → **All UI Interfaces**
5. **Testing** → validates → **All Subsystems**

### Data Flow Between Subsystems
```
Google Sheets ↔ RDF Pipeline ↔ Git Repository
       ↓                              ↑
   Admin Portal → Vocabulary Lifecycle → Docusaurus Sites
       ↓                              ↑
   Auth System → custom RBAC middleware → User Permissions
```

## Future Subsystem Enhancements

### Planned Additions
1. **AI Integration Module** - Vocabulary suggestions and validation
2. **Analytics Dashboard** - Usage metrics and insights
3. **Notification System** - Email/webhook alerts
4. **Advanced Search** - Elasticsearch integration
5. **Mobile SDKs** - iOS/Android libraries

### Architecture Evolution
- Microservices consideration for heavy processing
- Event-driven architecture for real-time updates
- GraphQL federation for complex queries
- WebAssembly for client-side RDF processing

## Lessons Learned

### What Works Well
- Separation of concerns between subsystems
- Git as source of truth simplifies many workflows
- TypeScript throughout provides excellent type safety
- Nx monorepo enables code sharing

### Challenges Addressed
- Cross-domain authentication complexity
- Google Sheets API quotas require careful management
- Large vocabulary performance needs optimization
- UI abstraction for non-technical users critical

This subsystem documentation provides insight into the significant components that extend the core IFLA Standards Platform, demonstrating the depth and sophistication of the overall architecture.
