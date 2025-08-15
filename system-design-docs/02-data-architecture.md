# Data Architecture

**Version:** 1.1  
**Date:** August 2025  
**Status:** Current Implementation

## Overview

The IFLA Standards Platform employs a distributed data architecture that leverages multiple specialized systems, each optimized for specific data types and access patterns. This document details the data storage strategy, models, flows, and governance principles.

## Core Data Principles

### 1. **Git as Single Source of Truth**
- All vocabulary definitions, standards content, and configurations are version-controlled
- Every change creates an auditable history with attribution
- Rollback capability for any historical state
- No critical data exists outside version control

### 2. **Distributed Storage Strategy**
Different data types are stored in systems optimized for their access patterns:
- **Static/Versioned Data** → Git/GitHub
- **User Identity** → Clerk
- **Operational Data** → Supabase
- **Temporary Workspaces** → Google Sheets
- **UI State** → Local Storage/Session Storage

### 3. **No Duplication Principle**
- Data exists in exactly one authoritative location
- Other systems may cache but never own data
- Clear ownership boundaries between systems
- Synchronization through events, not replication

## Data Storage Systems

### 1. Git/GitHub (Primary Storage)
**Purpose**: Version-controlled source of truth for all standards data

**Data Stored**:
```
standards/
  {namespace}/
    namespace.json          # Namespace metadata
    docs/                   # MDX with embedded RDF
      elements/*.mdx        # Element definitions with RDF front matter
      concepts/*.mdx        # Concept definitions with RDF front matter
      vocabularies/*.mdx    # Vocabulary definitions with RDF front matter
    vocabs/                 # All vocabulary-related assets
      rdf/                  # Source of truth - all formats together
        elements/           # Element definitions (ISBD terminology)
          isbd-elements.ttl
          isbd-elements.rdf
          isbd-elements.jsonld
          isbd-elements.csv # All formats together
        ves/                # Vocabulary Encoding Schemes
          contentform/
            contentform.ttl
            contentform.rdf
            contentform.jsonld
            contentform.csv # Each vocabulary in all formats
          mediatype/
            [all formats]
          contentqualification/
            motion/
              [all formats]
        ses/                # Syntax Encoding Schemes
          punctuation/
            [all formats]
      dctap/                # DCTAP validation profiles
        elements.yaml
        ves.yaml
        ses.yaml
      jsonld-context/       # JSON-LD context definitions
        elements.jsonld
        ves.jsonld
        ses.jsonld
      draft/                # Temporary validation workspace
        elements/           # Mirrors rdf structure
        ves/
        ses/
        validation-report.md
```

**MDX with RDF Front Matter**:
```yaml
---
uri: http://iflastandards.info/ns/isbd/terms/contentForm
prefLabel:
  en: content form
  fr: forme du contenu
definition:
  en: A categorization reflecting the fundamental form...
broader: http://iflastandards.info/ns/isbd/terms/C2001
---
# Content documentation follows...
```

**Access Patterns**:
- Build-time: Scaffold docs from vocabs/rdf/**/*.csv, validate against vocabs/rdf/**/*.ttl
- Runtime: API serves cached content, content negotiation for RDF formats
- Updates: CSV → Docs → vocabs/draft validation → vocabs/rdf update cycle
- Versioning: Git tags per standard (e.g., isbd-v1.2.0, isbdm-v1.1.0)

### 2. Clerk (User Identity)
**Purpose**: Authentication and minimal user metadata

**Data Model** (8KB limit per user):
```typescript
interface ClerkUserMetadata {
  exp: {
    fmt: string;      // Export format preferences (encoded)
    lang: string;     // Language preferences (comma-separated)
    ns: string;       // Last accessed namespace
    proj: string;     // Project IDs (comma-separated)
  };
  github?: {
    teams: string[];  // Cached team memberships
    lastSync: number; // Timestamp of last sync
  };
}
```

**Compression Strategy**:
- Boolean flags encoded as binary strings
- Lists stored as comma-separated values
- Abbreviated keys to save space
- References to full data stored elsewhere

### 3. Supabase (Operational Data)
**Purpose**: Processing workflows, import/export tracking, and transient operational data

**Core Tables**:
```sql
-- Import/Export job tracking
import_jobs (
  id uuid PRIMARY KEY,
  namespace text NOT NULL,
  sheet_id text,
  status text, -- pending, processing, completed, failed
  created_by text,
  created_at timestamp,
  completed_at timestamp,
  error_message text
)

-- Validation results
validation_results (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES import_jobs(id),
  item_uri text,
  errors jsonb,
  warnings jsonb,
  created_at timestamp
)

-- Review groups and projects (cached from GitHub)
review_groups (
  id uuid PRIMARY KEY,
  github_team_id text UNIQUE,
  name text,
  description text,
  cached_at timestamp
)

projects (
  id uuid PRIMARY KEY,
  github_project_id text UNIQUE,
  review_group_id uuid REFERENCES review_groups,
  name text,
  namespaces text[], -- Associated namespace keys
  cached_at timestamp
)

-- Import/Export workflow management
import_jobs (
  id uuid PRIMARY KEY,
  namespace text,
  sheet_id text,
  status text, -- pending, processing, completed, failed
  validation_results jsonb,
  created_by text,
  created_at timestamp
)

-- Validation and processing results
validation_results (
  id uuid PRIMARY KEY,
  job_id uuid REFERENCES import_jobs,
  row_number integer,
  column_name text,
  error_type text,
  error_message text,
  severity text -- error, warning, info
)

-- Audit logs (using Spatie pattern)
activity_logs (
  id uuid PRIMARY KEY,
  log_name text,
  description text,
  subject_type text,
  subject_id text,
  causer_type text,
  causer_id text,
  properties jsonb,
  created_at timestamp
)
```

**Row Level Security**:
- All tables implement RLS based on custom RBAC middleware decisions
- User can only see data for authorized namespaces
- Audit logs are immutable once created

### 4. Google Sheets (Temporary Workspaces)
**Purpose**: Collaborative bulk editing interface

**Data Structure**:
- Each sheet represents a vocabulary export
- DCTAP-compliant column structure
- Metadata in header rows
- Version tracking through sheet history

**Lifecycle**:
1. Export from Git → Google Sheet
2. Collaborative editing period
3. Import validation
4. Merge back to Git
5. Sheet archived or deleted

### 5. Local Storage (Client State)
**Purpose**: UI preferences and client-side caching

**Data Stored**:
```typescript
interface LocalStorageData {
  uiPreferences: {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    tableViewOptions: object;
  };
  recentlyViewed: {
    namespaces: string[];
    vocabularies: string[];
    lastAccessed: Record<string, number>;
  };
  draftData: {
    forms: Record<string, object>;
    lastSaved: number;
  };
}
```

## Data Models

### Vocabulary Data Model
**MDX-Based Vocabulary Structure**:
```typescript
// MDX Front Matter for Vocabulary Items
interface VocabularyFrontMatter {
  uri: string;
  prefLabel: LocalizedString;
  definition: LocalizedString;
  altLabel?: LocalizedString;
  scopeNote?: LocalizedString;
  type?: 'class' | 'property' | 'concept';
  broader?: string | string[];
  narrower?: string | string[];
  related?: string | string[];
  domain?: string[];
  range?: string[];
  status: 'draft' | 'review' | 'published';
  version?: string;
  created?: string;
  modified?: string;
}

interface LocalizedString {
  [languageCode: string]: string;
}

// Example MDX file
---
uri: http://iflastandards.info/ns/isbd/terms/contentForm
prefLabel:
  en: content form
  fr: forme du contenu
definition:
  en: A categorization reflecting the fundamental form...
  fr: Une catégorisation reflétant la forme fondamentale...
broader: http://iflastandards.info/ns/isbd/terms/C2001
status: published
---

# Content Form

Detailed documentation and usage examples...
```

### Multi-Element Set Architecture
**Namespace with Multiple Element Sets**:
```typescript
interface NamespaceConfiguration {
  id: string;
  title: string;
  description: string;
  elementSets: ElementSetInfo[];
  vocabularies: VocabularyInfo[];
  navigationStrategy: 'simple' | 'categorized' | 'hierarchical';
}

interface ElementSetInfo {
  id: string;
  title: string;
  description: string;
  elementCount: number;
  lastUpdated: string;
  path: string;
  categories: string[];
  prefix: string;
  baseIRI: string;
}

interface VocabularyInfo {
  id: string;
  title: string;
  description?: string;
  conceptCount: number;
  path: string;
  lastUpdated?: string;
  category?: string;
}
```

**Examples**:
- **ISBD**: 2 element sets (ISBD, ISBD Unconstrained) + 7 vocabularies
- **UNIMARC**: ~24 element sets organized by field groups + many vocabularies

**Directory Structure**:
```
/standards/{namespace}/
├── docs/
│   ├── index.mdx                    # Namespace overview
│   ├── elements/                    # Element Sets section
│   │   ├── index.mdx               # Element sets overview
│   │   ├── {element-set-1}/        # First element set
│   │   │   ├── index.mdx          
│   │   │   └── {categories}/      
│   │   └── {element-set-2}/        # Second element set
│   │       ├── index.mdx          
│   │       └── {categories}/      
│   └── vocabularies/               # Concept Schemes section
│       ├── index.mdx              # Vocabularies overview
│       └── {vocabulary-name}/     
```

### DCTAP Profile Model
```typescript
interface DCTAPProfile {
  id: string;
  namespace: string;
  version: string;
  shapes: Shape[];
}

interface Shape {
  shapeId: string;
  shapeLabel: string;
  properties: PropertyConstraint[];
}

interface PropertyConstraint {
  propertyId: string;
  propertyLabel: string;
  mandatory: boolean;
  repeatable: boolean;
  valueConstraint?: string;
  valueConstraintType?: string;
  note?: string;
}
```

## Data Flow Patterns

### Platform-Specific Data Flows

#### Admin Portal (Next.js) - Dynamic Data Flow

The admin portal handles dynamic data operations with real-time API calls:

##### 1. Vocabulary Import Flow (Admin Only)
```mermaid
sequenceDiagram
    participant U as User
    participant A as Admin Portal
    participant API as Next.js API Routes
    participant S as Supabase
    participant G as Google Sheets
    participant GH as GitHub

    U->>A: Upload spreadsheet
    A->>API: POST /api/import
    API->>S: Create import job
    API->>G: Fetch sheet data
    API->>API: Validate against DCTAP
    API->>S: Store validation results
    
    alt Validation Success
        API->>GH: Create branch
        API->>GH: Commit changes
        API->>GH: Create PR
        API->>U: Show success + PR link
    else Validation Failed
        API->>S: Update job status
        API->>U: Show error report
    end
```

##### 2. User Access Flow (Admin Only)
```mermaid
sequenceDiagram
    participant U as User
    participant C as Clerk
    participant A as Admin Portal
    participant API as API Routes
    participant RBAC as Custom RBAC
    participant S as Supabase

    U->>C: Authenticate
    C->>A: Return user + metadata
    A->>API: Request with auth
    API->>RBAC: Check permissions
    RBAC->>API: Return decisions
    API->>S: Query with RLS context
    S->>API: Return authorized data
    API->>A: JSON response
    A->>U: Render UI
```

#### Documentation Sites (Docusaurus) - Static Data Flow

Docusaurus sites use build-time data fetching with no runtime API calls:

##### 3. Build-Time Data Flow (Docusaurus Only)
```mermaid
graph LR
    A[Git Repository] --> B[Docusaurus Build]
    B --> C[Read MDX Files]
    B --> D[Read JSON Files]
    C --> E[Generate Static HTML]
    D --> E
    E --> F[Static Site Files]
    F --> G[CDN/GitHub Pages]
    
    D --> H[Generate RDF]
    H --> I[Static RDF Files]
    I --> G
```

##### 4. Runtime Data Access (Docusaurus)
```mermaid
graph LR
    U[User Browser] --> CDN[CDN/GitHub Pages]
    CDN --> HTML[Static HTML]
    CDN --> JS[React Hydration]
    CDN --> RDF[Static RDF Files]
    
    note1[No API calls]
    note2[No authentication]
    note3[All data pre-rendered]
```

## RDF/CSV Management and Versioning

### Directory Structure Philosophy
The `rdf/` directory serves as the single source of truth for all vocabulary data formats. CSV is treated as a first-class format alongside RDF serializations (TTL, RDF/XML, JSON-LD) because:
- All formats represent the same semantic data
- CSV enables spreadsheet workflows and bulk editing
- All formats version together as a cohesive unit

### Round-Trip Validation Workflow
```mermaid
graph LR
    A[rdf/*.csv] -->|Scaffold| B[docs/*.mdx]
    B -->|Harvest| C[draft_rdf/*.ttl]
    C -->|Compare| D[rdf/*.ttl]
    D -->|Match| E[Ready to Release]
    D -->|Mismatch| F[Fix & Iterate]
```

1. **CSV to Docs**: Scripts scaffold MDX documentation from CSV files
2. **Docs to Draft RDF**: Harvest RDF from MDX frontmatter to `draft_rdf/`
3. **Validation**: Compare `draft_rdf/` against source `rdf/` for consistency
4. **Update Cycle**: If validation passes, update source RDF; if not, fix issues

### Versioning Strategy
Standards are versioned independently using Git tags:

```bash
# Tag format: {standard}-v{version}
git tag isbd-v1.2.0    # ISBD release 1.2.0
git tag isbdm-v1.1.0   # ISBDM release 1.1.0
git tag lrm-v2.0.0     # LRM release 2.0.0
```

**Version Tracking**:
- Each standard versions independently
- No version files needed (Git tags are the source of truth)
- Release includes all formats (TTL, RDF, JSON-LD, CSV)
- External publication via PR to versioned repositories

**Release Process**:
```bash
# 1. Validate round-trip
pnpm nx run isbd:validate-rdf

# 2. Tag release
git tag -a isbd-v1.2.0 -m "ISBD v1.2.0: Content qualification update"

# 3. Push to origin
git push origin isbd-v1.2.0

# 4. Export to external repo (all formats)
./scripts/publish-standard.sh isbd 1.2.0
```

## Four-Phase Vocabulary Lifecycle

### Phase 1: Bootstrap (Cycle Kick-off)
- Admin initiates new editorial cycle
- Exports current vocabulary from Git to Google Sheets
- Team performs bulk updates in spreadsheet
- Import validates and creates MDX files with embedded RDF

### Phase 2: Daily Editing
- Direct MDX editing via Git
- Form-based RDF metadata editing in admin portal
- Real-time DCTAP validation
- Automatic version tracking

### Phase 3: Nightly Assembly
- Automated builds via GitHub Actions
- Validation against DCTAP profiles
- Semantic versioning suggestions
- Impact report generation

### Phase 4: Publication
- Review impact reports
- Confirm version numbers
- Merge to main branch
- Automatic deployment to production

## Data Access Patterns

### Read Access Hierarchy
1. **Memory Cache** (Runtime)
   - In-process caching for hot data
   - TTL-based invalidation
   - LRU eviction policy

2. **Clerk Metadata** (User-specific)
   - User preferences and settings
   - Cached team memberships
   - Recent activity

3. **File System** (Build-time)
   - Direct file reads during build
   - Watched for hot reload in dev
   - Cached by Nx

4. **Supabase** (Operational)
   - Active workflows and jobs
   - Validation results
   - Audit trails

5. **GitHub API** (Organizational)
   - Team memberships (cached in Clerk)
   - Project metadata (cached in Supabase)
   - Rate-limited access

### Write Patterns
All writes follow strict patterns based on data type:

**Vocabulary Data**:
1. Changes proposed in PR
2. Validation checks run
3. Review and approval
4. Merge triggers deployment

**User Preferences**:
1. Direct write to Clerk metadata
2. Optimistic UI updates
3. Background sync

**Operational Data**:
1. Write to Supabase with RLS
2. Trigger any webhooks
3. Update audit log

## Data Validation

### Schema Validation
**JSON Schema** for all file-based data:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "namespace", "elements"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "namespace": { "type": "string" },
    "elements": {
      "type": "array",
      "items": { "$ref": "#/definitions/element" }
    }
  }
}
```

### Runtime Validation
**Zod schemas** for TypeScript validation:
```typescript
const ElementSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  uri: z.string().url(),
  label: LocalizedStringSchema,
  definition: LocalizedStringSchema,
  type: z.enum(['class', 'property'])
});
```

### DCTAP Validation
- Shapes define structure constraints
- Properties define value constraints
- Cardinality rules enforced
- Custom validators for domain rules

## Data Migration Strategy

### Version Migration
1. **Backward Compatibility**: New versions read old formats
2. **Migration Scripts**: Automated updates on deploy
3. **Validation**: Post-migration verification
4. **Rollback Plan**: Git revert capability

### System Migration
When migrating between storage systems:
1. Dual-write period for safety
2. Verification of data integrity
3. Gradual cutover with feature flags
4. Complete audit trail

## Performance Optimization

### Caching Strategy
```yaml
Build Cache:
  - Nx computation caching
  - Docker layer caching
  - Node modules caching

Runtime Cache:
  - CDN edge caching (static assets)
  - API response caching (Vercel)
  - Database query caching (Supabase)
  - Client-side caching (SWR)

Cache Invalidation:
  - Git commit triggers rebuild
  - Webhook-based invalidation
  - TTL-based expiry
  - Manual cache purge
```

### Query Optimization
- Indexed fields in Supabase
- Denormalized views for complex queries
- Pagination for large result sets
- GraphQL for efficient data fetching (planned)

## Data Security

### Encryption
- **At Rest**: Git repository encryption, Supabase transparent encryption
- **In Transit**: TLS 1.3 for all connections
- **Application Level**: Sensitive data encrypted before storage

### Access Control
- Row Level Security in Supabase
- Git branch protection rules
- custom RBAC middleware policy enforcement
- API rate limiting

### Data Privacy
- PII minimization
- Right to deletion support
- Audit trail for compliance
- Geographic data residency

## Monitoring and Observability

### Data Quality Metrics
- Validation error rates
- Schema compliance scores
- Data freshness indicators
- Consistency checks

### Performance Metrics
- Query response times
- Cache hit rates
- Storage utilization
- API latency

### Audit Requirements
- All data changes logged
- User attribution maintained
- Timestamp precision
- Immutable audit trail

## Vocabulary Server Architecture

### Content Negotiation System
**Purpose**: Handle HTTP content negotiation for RDF resources and legacy URL compatibility

**Requirements**:
```yaml
Core Features:
  - Arbitrary redirect mapping (URI to documentation URL)
  - Lexical alias support (human-readable URIs)
  - Version-aware routing
  - Performance: <10ms redirect latency
  - Scale: Support 10K+ mappings per namespace
```

**Pathmap Data Structure**:
```json
{
  "namespace": "isbd",
  "version": "2.0",
  "base_url": "https://www.iflastandards.info/isbd",
  "mappings": [
    {
      "uri": "http://iflastandards.info/ns/isbd/terms/1001",
      "path": "/docs/vocabularies/contentTypes/Text",
      "aliases": {
        "en": "Text",
        "fr": "Texte",
        "es": "Texto"
      }
    }
  ],
  "slug_rules": {
    "case": "lowercase",
    "separator": "-",
    "normalize_unicode": true,
    "max_length": 50
  }
}
```

**Implementation Options**:
1. **Enhanced Nginx**: Native performance, limited flexibility
2. **Nginx + Lua**: Dynamic resolution, hot reload capability
3. **Edge Functions**: Full programmatic control, easy platform integration

## MDX Generation Safety Patterns

### Dry-Run System
**Purpose**: Preview MDX generation changes before application

**Architecture**:
```typescript
interface DryRunConfig {
  namespace: string;
  version: string;
  source: SpreadsheetSource;
  outputFormat: 'diff' | 'side-by-side' | 'summary';
  includeMetrics: boolean;
}

interface DryRunResult {
  summary: ChangeSummary;
  changes: FileChange[];
  warnings: ValidationWarning[];
  breakingChanges: BreakingChange[];
  preview: string;
}
```

### Rollback Mechanism
**Backup Strategy**:
```typescript
interface BackupStrategy {
  type: 'git' | 'filesystem' | 'hybrid';
  retention: {
    count: 10;
    duration: { days: 30 };
  };
  compression: boolean;
}

interface RestorePoint {
  id: string;
  namespace: string;
  timestamp: Date;
  files: FileInventory;
  metadata: GenerationMetadata;
}
```

**Atomic Operations**:
- Write to temporary directory
- Validate completeness
- Create backup of current state
- Atomic move to target
- Verify successful write
- Clean up on success or restore on failure

### Validation Gates
```typescript
const GENERATION_GATES: ValidationGate[] = [
  { name: 'Schema Validation', critical: true },
  { name: 'Breaking Change Detection', critical: true },
  { name: 'URI Consistency', critical: true },
  { name: 'Translation Completeness', critical: false }
];
```

## Disaster Recovery

### Backup Strategy
- Git: Distributed by nature + tagged MDX generations
- Supabase: Daily automated backups
- Google Sheets: Version history
- Clerk: Managed service backups
- MDX: Git tags + filesystem snapshots for rollback

### Recovery Procedures
1. **Data Loss**: Restore from Git history
2. **Service Outage**: Failover to cached data
3. **Corruption**: Validation and repair scripts
4. **Complete Failure**: Rebuild from Git
5. **Bad MDX Generation**: Rollback to tagged version

## Future Considerations

### Scalability Planning
- Partition strategies for large vocabularies
- Read replica configuration
- Sharding for geographic distribution
- Event streaming for real-time updates
- Multi-element set optimization for large namespaces

### Technology Evolution
- GraphQL API layer
- Event sourcing for audit trail
- CRDT for collaborative editing
- Blockchain for immutable provenance
- Enhanced vocabulary server with ML-based routing

This data architecture provides a robust, scalable foundation that maintains data integrity while enabling collaborative workflows and high-performance access patterns.
