# Design Document

## Overview

This document outlines the design for integrating OMR25 vocabulary management features into the existing IFLA Standards Platform. The design leverages the established Next.js admin portal, Docusaurus documentation sites, and GitHub-based collaboration infrastructure while adding sophisticated vocabulary management capabilities.

**Key Design Principle**: The system follows a Google Sheets-centric approach where there is only one way data enters the system - through system-generated Google Spreadsheets that conform to our specifications. The system creates and manages these spreadsheets, sharing them with project team members for collaborative editing.

The core strategy enhances the `apps/admin` Next.js application to serve as the central hub for all vocabulary lifecycle tasks, from spreadsheet generation and validation to versioning and publication, while maintaining the proven Docusaurus sites as the public-facing documentation layer.

## Architecture

### System Architecture Overview

```mermaid
graph TB
    subgraph "User Interface Layer"
        A[Admin Portal - Next.js]
        B[Docusaurus Sites]
        C[Google Sheets - Collaborative Editing]
    end

    subgraph "Data Flow - Single Source Entry"
        D[System-Generated Spreadsheets]
        E[DCTAP Embedded in Sheets]
        F[Index Sheet with Metadata]
        G[Vocabulary Worksheets]
    end

    subgraph "API & Service Layer"
        H[Next.js API Routes]
        I[Vercel Edge Functions]
        J[GitHub Actions]
    end

    subgraph "Shared Packages"
        K[@ifla/validation]
        L[@ifla/rdf-tools]
        M[@ifla/sheets-manager]
    end

    subgraph "Authentication & Authorization"
        N[Clerk Authentication]
        O[Cerbos Authorization]
    end

    subgraph "External Services"
        P[GitHub API]
        Q[Google Sheets API]
        R[Supabase Database]
    end

    subgraph "Data Storage"
        S[Git Repository - Published Output]
        T[Supabase - Workflow State]
        U[Google Drive - System Spreadsheets]
    end

    A --> H
    A --> D
    C --> D
    D --> E
    D --> F
    D --> G
    H --> I
    H --> J
    H --> K
    H --> L
    H --> M
    I --> P
    I --> Q
    I --> R
    J --> S
    H --> N
    H --> O
    N --> U
    O --> T
    Q --> U
    P --> S
    R --> T
    D --> Q
```

### Component Architecture

The vocabulary management system is organized into several key domains within the admin portal:

```
apps/admin/src/
├── domains/
│   ├── vocabulary/
│   │   ├── sheets/
│   │   │   ├── components/
│   │   │   │   ├── SpreadsheetGenerator.tsx
│   │   │   │   ├── DCTAPEditor.tsx
│   │   │   │   ├── VocabularySelector.tsx
│   │   │   │   └── LanguageSelector.tsx
│   │   │   ├── services/
│   │   │   │   ├── sheets-service.ts
│   │   │   │   ├── dctap-service.ts
│   │   │   │   └── template-service.ts
│   │   │   └── types.ts
│   │   ├── sync/
│   │   │   ├── components/
│   │   │   │   ├── SyncManager.tsx
│   │   │   │   ├── ValidationResults.tsx
│   │   │   │   └── ChangePreview.tsx
│   │   │   ├── services/
│   │   │   │   ├── sync-service.ts
│   │   │   │   └── validation-service.ts
│   │   │   └── types.ts
│   │   ├── versioning/
│   │   │   ├── components/
│   │   │   │   ├── VersionManager.tsx
│   │   │   │   ├── PublicationModal.tsx
│   │   │   │   └── VersionTimeline.tsx
│   │   │   └── services/
│   │   │       └── version-service.ts
│   │   └── translation/
│   │       ├── components/
│   │       │   ├── TranslationWorkspace.tsx
│   │       │   └── ProgressDashboard.tsx
│   │       └── services/
│   │           └── translation-service.ts
│   ├── projects/
│   │   ├── components/
│   │   │   ├── ProjectManager.tsx
│   │   │   └── TeamManager.tsx
│   │   └── services/
│   │       └── project-service.ts
│   └── admin/
│       ├── components/
│       │   ├── UserManager.tsx
│       │   └── SystemDashboard.tsx
│       └── services/
│           └── admin-service.ts
```

## Components and Interfaces

### Core Vocabulary Management Components

#### 1. SpreadsheetGenerator Component

The SpreadsheetGenerator creates system-managed Google Spreadsheets for vocabulary development:

```typescript
interface SpreadsheetGeneratorProps {
  namespaceId: string;
  dctapProfileId: string;
  onComplete: (spreadsheet: SystemSpreadsheet) => void;
}

interface SpreadsheetGeneratorOptions {
  includeExistingData: boolean;
  vocabulariesToInclude: string[];
  languagesToInclude: string[];
  templateType: 'empty' | 'populated';
}

interface SystemSpreadsheet {
  id: string;
  url: string;
  indexSheet: IndexSheetMetadata;
  vocabularySheets: VocabularySheetMetadata[];
  dctapSheet: DCTAPSheetMetadata;
  permissions: SpreadsheetPermissions;
}
```

**Key Features:**
- Creates spreadsheets in system Google Drive
- Embeds DCTAP profile as editable worksheet
- Generates index sheet with vocabulary metadata
- Creates vocabulary worksheets (empty or populated)
- Shares with project team members automatically
- Follows Postel's Law for flexible column additions

#### 2. VocabularyEditor Component

The VocabularyEditor provides TinaCMS-powered editing for vocabulary elements:

```typescript
interface VocabularyEditorProps {
  vocabularyId: string;
  elementId?: string;
  mode: 'prose' | 'structured';
}

interface ElementFormData {
  term: string;
  label: Record<string, string>;
  definition: Record<string, string>;
  type: string;
  properties: Record<string, any>;
  examples: Example[];
  relationships: Relationship[];
}
```

**Key Features:**
- WYSIWYG editing for prose documentation
- Form-based editing for structured RDF metadata
- Real-time validation against DCTAP profiles
- Live preview of generated RDF
- Auto-save with Git commit integration

#### 3. VersionManager Component

The VersionManager handles the complete publication workflow:

```typescript
interface VersionManagerProps {
  namespaceId: string;
  onPublish: (version: Version) => void;
}

interface PublicationOptions {
  versionType: 'major' | 'minor' | 'patch';
  customVersion?: string;
  releaseNotes: string;
  formats: RDFFormat[];
  notifySubscribers: boolean;
}
```

**Key Features:**
- Semantic version recommendation based on change analysis
- Multi-format RDF generation (Turtle, RDF/XML, JSON-LD)
- GitHub Release creation with assets
- Automated notification system
- Rollback capabilities

#### 4. TranslationWorkspace Component

The TranslationWorkspace provides an integrated translation interface:

```typescript
interface TranslationWorkspaceProps {
  namespaceId: string;
  language: string;
  userId: string;
}

interface TranslationEntry {
  elementId: string;
  property: string;
  sourceText: string;
  translation: string;
  status: 'untranslated' | 'draft' | 'reviewed' | 'approved';
  notes?: string;
  confidence: number;
}
```

**Key Features:**
- Side-by-side source and target language editing
- Context-aware translation suggestions
- Progress tracking and statistics
- Integration with translation memory
- Quality assurance tools

#### 5. SyncManager Component

The SyncManager handles synchronization between system spreadsheets and the platform:

```typescript
interface SyncManagerProps {
  namespaceId: string;
  spreadsheetId: string;
  onSyncComplete: (result: SyncResult) => void;
}

interface SyncOptions {
  vocabulariesToSync: string[];
  languagesToSync: string[];
  dryRun: boolean;
  validateOnly: boolean;
}

interface SyncResult {
  success: boolean;
  changesDetected: ChangeSet[];
  validationResult: ValidationResult;
  filesGenerated: string[];
  errors?: SyncError[];
}
```

**Key Features:**
- Detects changes in system-managed spreadsheets
- Validates against embedded DCTAP profile
- Handles new worksheets added on-the-fly
- Supports partial synchronization by vocabulary/language
- Follows Postel's Law for flexible column handling

### Shared Package Architecture

#### @ifla/validation Package

Provides DCTAP validation capabilities with flexible column handling:

```typescript
export class DCTAPValidator {
  constructor(private profile: DCTAPProfile) {}
  
  validateSheet(sheet: SheetData): ValidationResult;
  validateElement(element: ElementData): ElementValidation;
  generateReport(results: ValidationResult[]): ValidationReport;
  adaptToNewColumns(sheet: SheetData): DCTAPProfile; // Postel's Law implementation
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: ValidationSummary;
  adaptedProfile?: DCTAPProfile; // New profile if columns were added
}
```

#### @ifla/sheets-manager Package

Manages system-generated Google Spreadsheets:

```typescript
export class SheetsManager {
  constructor(private serviceAccount: GoogleServiceAccount) {}
  
  createSystemSpreadsheet(options: SpreadsheetCreationOptions): Promise<SystemSpreadsheet>;
  updateSpreadsheetStructure(spreadsheetId: string, changes: StructureChanges): Promise<void>;
  shareWithTeam(spreadsheetId: string, teamMembers: TeamMember[]): Promise<void>;
  detectChanges(spreadsheetId: string, lastSync: Date): Promise<ChangeSet>;
  embedDCTAP(spreadsheetId: string, profile: DCTAPProfile): Promise<void>;
}

export interface SpreadsheetCreationOptions {
  namespaceId: string;
  vocabularies: VocabularyDefinition[];
  languages: string[];
  includeExistingData: boolean;
  dctapProfile: DCTAPProfile;
}
```

#### @ifla/rdf-tools Package

Handles RDF generation and serialization:

```typescript
export class RDFHarvester {
  constructor(private baseUri: string) {}
  
  harvestFromDirectory(directory: string): Promise<Store>;
  harvestFromSpreadsheet(spreadsheet: SystemSpreadsheet): Promise<Store>;
  addVocabularyMetadata(metadata: VocabularyMetadata): Promise<void>;
}

export class RDFSerializer {
  serializeTurtle(store: Store): Promise<string>;
  serializeRDFXML(store: Store): Promise<string>;
  serializeJSONLD(store: Store): Promise<string>;
}
```

## Data Models

### Core Data Structures

#### System Spreadsheet Models

```typescript
interface SystemSpreadsheet {
  id: string;
  namespaceId: string;
  googleSheetId: string;
  url: string;
  status: 'active' | 'archived';
  createdBy: string;
  createdAt: Date;
  lastSyncAt?: Date;
  structure: SpreadsheetStructure;
}

interface SpreadsheetStructure {
  indexSheet: IndexSheetMetadata;
  dctapSheet: DCTAPSheetMetadata;
  vocabularySheets: VocabularySheetMetadata[];
  version: string;
}

interface IndexSheetMetadata {
  name: string;
  vocabularies: VocabularyIndexEntry[];
  languages: string[];
  lastModified: Date;
}

interface VocabularyIndexEntry {
  name: string;
  sheetName: string;
  type: 'element-set' | 'value-vocabulary';
  description: string;
  status: 'active' | 'deprecated';
  lastModified: Date;
}

interface DCTAPSheetMetadata {
  name: string;
  version: string;
  profile: DCTAPProfile;
  isEditable: boolean;
  lastModified: Date;
}

interface VocabularySheetMetadata {
  name: string;
  vocabularyType: 'element-set' | 'value-vocabulary';
  columns: ColumnDefinition[];
  rowCount: number;
  languages: string[];
  lastModified: Date;
}
```

#### Synchronization Models

```typescript
interface SyncJob {
  id: string;
  namespaceId: string;
  spreadsheetId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  triggeredBy: string;
  syncOptions: SyncOptions;
  validationReportId?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface SyncOptions {
  vocabulariesToSync: string[];
  languagesToSync: string[];
  dryRun: boolean;
  validateOnly: boolean;
  detectNewWorksheets: boolean;
}

interface ChangeSet {
  spreadsheetId: string;
  detectedAt: Date;
  changes: Change[];
  newWorksheets: string[];
  modifiedWorksheets: string[];
  dctapChanges?: DCTAPChange[];
}

interface Change {
  sheetName: string;
  type: 'insert' | 'update' | 'delete';
  row: number;
  column?: string;
  oldValue?: any;
  newValue?: any;
  elementId?: string;
}

interface DCTAPChange {
  type: 'column_added' | 'constraint_modified' | 'shape_added';
  details: Record<string, any>;
  requiresProfileUpdate: boolean;
}
```

#### Editorial Cycle Models

```typescript
interface EditorialCycle {
  id: string;
  namespaceId: string;
  targetVersion: string;
  status: 'draft' | 'review' | 'published';
  startedBy: string;
  startedAt: Date;
  publishedAt?: Date;
  metadata: CycleMetadata;
}

interface CycleMetadata {
  description: string;
  releaseNotes: string;
  breakingChanges: boolean;
  migrationGuide?: string;
  contributors: string[];
}
```

#### Translation Models

```typescript
interface TranslationSession {
  id: string;
  namespaceId: string;
  language: string;
  version: string;
  translatorId: string;
  status: 'active' | 'completed' | 'abandoned';
  progress: TranslationProgress;
  createdAt: Date;
  updatedAt: Date;
}

interface TranslationProgress {
  totalEntries: number;
  translatedEntries: number;
  reviewedEntries: number;
  approvedEntries: number;
  percentage: number;
}
```

### Database Schema Extensions

The following tables extend the existing Supabase schema:

```sql
-- System-managed spreadsheets
CREATE TABLE system_spreadsheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace_id TEXT NOT NULL,
    google_sheet_id TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'archived')) DEFAULT 'active',
    structure JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Synchronization jobs for system spreadsheets
CREATE TABLE sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace_id TEXT NOT NULL,
    spreadsheet_id UUID REFERENCES system_spreadsheets(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    triggered_by UUID REFERENCES auth.users(id),
    sync_options JSONB NOT NULL DEFAULT '{}',
    validation_report_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Validation reports for sync jobs
CREATE TABLE validation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_job_id UUID REFERENCES sync_jobs(id),
    summary JSONB NOT NULL,
    results JSONB NOT NULL,
    adapted_profile JSONB, -- New DCTAP profile if columns were added
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Change sets detected during synchronization
CREATE TABLE change_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spreadsheet_id UUID REFERENCES system_spreadsheets(id),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    changes JSONB NOT NULL DEFAULT '[]',
    new_worksheets TEXT[] DEFAULT '{}',
    modified_worksheets TEXT[] DEFAULT '{}',
    dctap_changes JSONB DEFAULT NULL,
    processed BOOLEAN DEFAULT FALSE
);

-- Editorial cycles for version management
CREATE TABLE editorial_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace_id TEXT NOT NULL,
    target_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'published')),
    started_by UUID REFERENCES auth.users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    published_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB NOT NULL DEFAULT '{}'
);

-- Translation sessions for tracking translation work
CREATE TABLE translation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace_id TEXT NOT NULL,
    language TEXT NOT NULL,
    version TEXT NOT NULL,
    translator_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'abandoned')),
    progress JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- DCTAP profiles for validation (can be embedded in spreadsheets)
CREATE TABLE dctap_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    namespace_id TEXT,
    profile_data JSONB NOT NULL,
    version TEXT NOT NULL,
    is_embedded BOOLEAN DEFAULT FALSE, -- TRUE if embedded in spreadsheet
    spreadsheet_id UUID REFERENCES system_spreadsheets(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance
CREATE INDEX idx_system_spreadsheets_namespace ON system_spreadsheets(namespace_id);
CREATE INDEX idx_system_spreadsheets_google_id ON system_spreadsheets(google_sheet_id);
CREATE INDEX idx_sync_jobs_spreadsheet ON sync_jobs(spreadsheet_id);
CREATE INDEX idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX idx_change_sets_spreadsheet ON change_sets(spreadsheet_id);
CREATE INDEX idx_change_sets_processed ON change_sets(processed);
CREATE INDEX idx_dctap_profiles_namespace ON dctap_profiles(namespace_id);
CREATE INDEX idx_dctap_profiles_embedded ON dctap_profiles(is_embedded, spreadsheet_id);

-- Row Level Security policies
ALTER TABLE system_spreadsheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dctap_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for system_spreadsheets
CREATE POLICY "Users can view spreadsheets in their namespaces" ON system_spreadsheets
    FOR SELECT USING (
        namespace_id IN (
            SELECT namespace_id FROM user_namespace_access WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Editors can create spreadsheets" ON system_spreadsheets
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        namespace_id IN (
            SELECT namespace_id FROM user_namespace_access 
            WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
        )
    );

-- Policies for sync_jobs
CREATE POLICY "Users can view sync jobs for their spreadsheets" ON sync_jobs
    FOR SELECT USING (
        spreadsheet_id IN (
            SELECT id FROM system_spreadsheets 
            WHERE namespace_id IN (
                SELECT namespace_id FROM user_namespace_access WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create sync jobs" ON sync_jobs
    FOR INSERT WITH CHECK (
        triggered_by = auth.uid() AND
        spreadsheet_id IN (
            SELECT id FROM system_spreadsheets 
            WHERE namespace_id IN (
                SELECT namespace_id FROM user_namespace_access 
                WHERE user_id = auth.uid() AND role IN ('editor', 'admin')
            )
        )
    );

-- Similar policies for other tables...
```

## Error Handling

### Validation Error Management

The system provides comprehensive error handling for vocabulary validation:

```typescript
interface ValidationError {
  row: number;
  column: string;
  value: any;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
  context?: ValidationContext;
}

interface ValidationContext {
  elementType: string;
  propertyName: string;
  expectedType: string;
  allowedValues?: string[];
  relatedElements?: string[];
}
```

**Error Categories:**
1. **Structural Errors**: Missing required columns, invalid headers
2. **Data Type Errors**: Invalid values for specific data types
3. **Constraint Violations**: Values that don't meet DCTAP constraints
4. **Reference Errors**: Broken relationships between elements
5. **Format Errors**: Malformed URIs, invalid syntax

### Import Error Recovery

The system provides multiple recovery mechanisms:

1. **Partial Import**: Import valid rows while flagging errors
2. **Error Annotation**: Add comments to source spreadsheet
3. **Correction Workflow**: Guide users through fixing errors
4. **Rollback Capability**: Undo imports that cause issues

## Testing Strategy

### Unit Testing

Each component and service includes comprehensive unit tests:

```typescript
// Example test structure
describe('DCTAPValidator', () => {
  describe('validateSheet', () => {
    it('should pass validation for valid sheet data', () => {
      const validator = new DCTAPValidator(mockProfile);
      const result = validator.validateSheet(validSheetData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required columns', () => {
      const validator = new DCTAPValidator(mockProfile);
      const result = validator.validateSheet(invalidSheetData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          rule: 'required-properties',
          severity: 'error'
        })
      );
    });
  });
});
```

### Integration Testing

Integration tests verify the complete workflow:

```typescript
describe('Vocabulary Import Workflow', () => {
  it('should complete full import from Google Sheets', async () => {
    // Setup test data
    const mockSheet = createMockGoogleSheet();
    const namespace = await createTestNamespace();
    
    // Execute import
    const result = await importService.importFromSpreadsheet({
      namespaceId: namespace.id,
      spreadsheetId: mockSheet.id,
      dctapProfileId: 'test-profile'
    });
    
    // Verify results
    expect(result.success).toBe(true);
    expect(result.summary.elementsCreated).toBeGreaterThan(0);
    
    // Verify files were created
    const files = await getGeneratedFiles(namespace.id);
    expect(files).toHaveLength(result.summary.documentsGenerated);
  });
});
```

### End-to-End Testing

E2E tests verify complete user workflows:

```typescript
describe('Vocabulary Management E2E', () => {
  it('should allow user to import and publish vocabulary', async () => {
    await page.goto('/admin/namespace/test-ns');
    
    // Start import wizard
    await page.click('[data-testid="import-vocabulary"]');
    
    // Enter spreadsheet URL
    await page.fill('[data-testid="spreadsheet-url"]', TEST_SHEET_URL);
    await page.click('[data-testid="validate-sheet"]');
    
    // Wait for validation
    await page.waitForSelector('[data-testid="validation-success"]');
    
    // Proceed with import
    await page.click('[data-testid="import-direct"]');
    
    // Wait for completion
    await page.waitForSelector('[data-testid="import-complete"]');
    
    // Verify vocabulary appears in list
    await expect(page.locator('[data-testid="vocabulary-list"]')).toContainText('Test Vocabulary');
  });
});
```

## Security Considerations

### Authentication and Authorization

The system leverages the existing Clerk and Cerbos infrastructure:

```typescript
// Authorization check example
async function checkVocabularyEditPermission(
  userId: string,
  namespaceId: string
): Promise<boolean> {
  const principal = await buildPrincipal(userId);
  const resource = {
    kind: 'namespace',
    id: namespaceId,
    attributes: await getNamespaceAttributes(namespaceId)
  };
  
  const result = await cerbos.checkResource({
    principal,
    resource,
    actions: ['edit']
  });
  
  return result.isAllowed('edit');
}
```

### Data Protection

1. **Input Validation**: All user inputs validated and sanitized
2. **SQL Injection Prevention**: Parameterized queries only
3. **XSS Protection**: Content Security Policy headers
4. **CSRF Protection**: Token-based request validation
5. **Rate Limiting**: API endpoints protected against abuse

### Audit Trail

All vocabulary management operations are logged:

```typescript
interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}
```

## Performance Optimization

### Caching Strategy

1. **API Response Caching**: Redis cache for frequently accessed data
2. **RDF Generation Caching**: Cache generated RDF files
3. **Validation Caching**: Cache DCTAP validation results
4. **CDN Integration**: Static assets served via CDN

### Database Optimization

1. **Indexing Strategy**: Optimized indexes for common queries
2. **Query Optimization**: Efficient queries with proper joins
3. **Connection Pooling**: Managed database connections
4. **Read Replicas**: Separate read/write database instances

### Background Processing

Long-running operations are handled asynchronously:

```typescript
// Background job example
export async function processVocabularyImport(jobId: string) {
  const job = await getImportJob(jobId);
  
  try {
    await updateJobStatus(jobId, 'processing');
    
    // Fetch and validate spreadsheet
    const sheetData = await fetchGoogleSheet(job.sourceUrl);
    const validation = await validateSheet(sheetData, job.dctapProfileId);
    
    if (!validation.valid) {
      await updateJobStatus(jobId, 'failed');
      await saveValidationReport(jobId, validation);
      return;
    }
    
    // Generate and commit files
    const files = await generateMDXFiles(sheetData);
    await commitToGitHub(job.namespaceId, files);
    
    await updateJobStatus(jobId, 'completed');
    await notifyUser(job.triggeredBy, 'Import completed successfully');
    
  } catch (error) {
    await updateJobStatus(jobId, 'failed');
    await logError(error, { jobId, context: 'vocabulary-import' });
    await notifyUser(job.triggeredBy, 'Import failed');
  }
}
```

This design provides a comprehensive foundation for implementing the OMR25 vocabulary management features while maintaining compatibility with the existing IFLA Standards Platform architecture and leveraging proven patterns and technologies.