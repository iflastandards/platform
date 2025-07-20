# ISBD CSV to MDX Conversion Plan (Updated)

**Version:** 2.0  
**Date:** January 2025  
**Status:** Implementation Plan  
**Purpose:** Execute Phase 4.0 (Epic 0) - Immediate ISBD Integration using existing RDF converter infrastructure

## Overview

This plan updates the approach based on the existing Phase 4 Pipeline Integration plan and available tools. We'll use the existing `populate-from-csv.ts` script and RDF converter infrastructure to quickly demonstrate ISBD legacy standards with browse and search functionality.

## Alignment with Phase 4

This work corresponds to **Epic 0: ISBD Immediate Integration (Week 1)** from the Phase 4 plan:
- Task 0.1: Process Existing ISBD Spreadsheet
- Task 0.2: Complete Orphan Sheet Integration  
- Task 0.3: Design Update Workflow

## Current State Analysis

### Existing Infrastructure
1. **populate-from-csv.ts** - Script to generate MDX from CSV using templates
2. **ISBD Templates** - Already configured in `/standards/isbd/templates/`
   - `element.mdx` - For RDF elements
   - `vocabulary.mdx` - For vocabularies
   - `config.json` - Mapping configuration

3. **CSV Data Structure**
Located in `/standards/isbd/csv/ns/isbd/`:
- `elements.csv` - RDF properties and element definitions
- `terms/contentform.csv` - Content form vocabulary
- `terms/contentqualification/*.csv` - Content qualification vocabularies
- `terms/mediatype.csv` - Media type vocabulary

### CSV Format
```csv
uri,reg:identifier,reg:status,rdf:type,skos:definition@en,skos:definition@fr,skos:prefLabel@en,skos:prefLabel@fr,...
```

Key characteristics:
- RDF predicates as column headers
- Language tags using @ notation (e.g., `@en`, `@fr`)
- Multiple language variants for labels and definitions
- Hierarchical relationships via `skos:hasTopConcept`, `skos:inScheme`

## Implementation Approach

### Step 1: Extend Template Configuration

1. **Update config.json for Vocabularies**
   ```json
   {
     "templates": {
       "vocabulary": {
         "path": "vocabulary.mdx",
         "csvSource": "../csv/ns/isbd/terms/{vocabularyId}.csv",
         "csvMapping": {
           "id": { "source": "uri", "transform": "extractId" },
           "title": { "source": "skos:prefLabel@en" },
           "definition": { "source": "skos:definition@en" },
           "scopeNote": { "source": "skos:scopeNote@en" },
           "RDF.type": { "source": "rdf:type" },
           "RDF.inScheme": { "source": "skos:inScheme" }
         },
         "outputPath": "../docs/vocabularies/{vocabularyId}/{conceptId}.mdx"
       }
     }
   }
   ```

2. **Create Vocabulary-Specific Templates**
   - Extend existing vocabulary.mdx template
   - Add multilingual support via CSV columns
   - Include VocabularyTable component

### Step 2: Execute Immediate Conversion (Task 0.1)

```bash
# Process elements
pnpm tsx scripts/populate-from-csv.ts --standard=isbd --type=element

# Process vocabularies (extend script to handle vocabularies)
pnpm tsx scripts/populate-from-csv.ts --standard=isbd --type=vocabulary --vocab=contentform
pnpm tsx scripts/populate-from-csv.ts --standard=isbd --type=vocabulary --vocab=mediatype
```

### Step 3: Create Vocabulary Index Pages

1. **Main Vocabulary Index** (`/docs/vocabularies/index.mdx`)
   ```mdx
   ---
   sidebar_position: 1
   title: ISBD Vocabularies
   ---

   # ISBD Vocabularies

   Browse the controlled vocabularies used in ISBD.

   ## Content Description
   - [Content Forms](/docs/vocabularies/contentform) - Types of content expression
   - [Media Types](/docs/vocabularies/mediatype) - Media categories

   ## Content Qualification
   - [Dimensionality](/docs/vocabularies/dimensionality)
   - [Motion](/docs/vocabularies/motion)
   - [Sensory Specification](/docs/vocabularies/sensoryspecification)
   ```

2. **Individual Vocabulary Pages** (use VocabularyTable component)
   ```mdx
   ---
   sidebar_position: 2
   title: Content Form
   ---

   # Content Form Vocabulary

   <VocabularyTable 
     csv="/data/contentform.csv"
     namespace="isbd"
     prefix="isbd"
     languages={['en', 'fr', 'es', 'it', 'lv', 'ru', 'sr', 'zh']}
     defaultLanguage="en"
     showFilter={true}
     showURIs={true}
   />
   ```

### Step 4: Complete Orphan Sheet Integration (Task 0.2)

1. **Identify ISBD Google Sheet**
   - Get sheet ID from existing workflows
   - Document current access permissions
   - Create "birth certificate" linking sheet to namespace

2. **Database Record Creation**
   ```sql
   INSERT INTO namespace_sheets (
     namespace_id,
     sheet_id,
     sheet_url,
     created_at,
     last_synced,
     sync_status
   ) VALUES (
     'isbd',
     'google-sheet-id',
     'https://docs.google.com/spreadsheets/d/...',
     NOW(),
     NOW(),
     'orphan_adopted'
   );
   ```

### Step 5: Design Update Workflow (Task 0.3)

1. **Change Detection**
   - Poll Google Sheets API for last modified time
   - Compare with last_synced timestamp
   - Trigger update if changes detected

2. **Update Process**
   - Download updated CSV from Google Sheets
   - Run through populate-from-csv.ts
   - Generate diff preview
   - Apply changes after validation

3. **Minimal UI Design**
   ```
   ISBD Vocabulary Management
   ├── Current Version: v2011
   ├── Google Sheet: [View] [Sync Status: ✓]
   ├── Last Updated: 2025-01-15
   └── Actions:
       ├── [Check for Updates]
       ├── [Preview Changes]
       └── [Apply Updates]
   ```

## Implementation Timeline (Aligned with Phase 4)

### Day 1-2: Process ISBD Spreadsheet → MDX
- [ ] Run existing elements through populate-from-csv.ts
- [ ] Extend script to handle vocabulary CSVs
- [ ] Generate MDX for all vocabularies
- [ ] Create vocabulary index pages
- [ ] Validate output against CSV data

### Day 3: Complete Orphan Sheet Integration
- [ ] Locate existing ISBD Google Sheet
- [ ] Create namespace_sheets database record
- [ ] Document sheet metadata and permissions
- [ ] Test sheet access via API

### Day 4-5: Design Update Workflow
- [ ] Create update detection mechanism
- [ ] Design validation preview UI
- [ ] Plan rollback strategy
- [ ] Create minimal admin interface mockup
- [ ] Document workflow for review group

## Technical Considerations

### Using Existing Infrastructure
1. **populate-from-csv.ts** already handles:
   - CSV parsing with language tags
   - Template population
   - MDX generation with frontmatter
   - Category determination

2. **VocabularyTable Component** provides:
   - Multilingual display
   - Filtering and search
   - URI display options
   - CSV data rendering

3. **Docusaurus Search** handles:
   - Full-text indexing
   - Multilingual content
   - Real-time search results

### Required Extensions

1. **Vocabulary Support in populate-from-csv.ts**
   ```typescript
   // Add vocabulary processing
   if (templateType === 'vocabulary') {
     // Handle multiple vocabulary files
     // Generate index pages
     // Create concept detail pages
   }
   ```

2. **Multilingual Frontmatter**
   ```yaml
   ---
   title: Dataset
   labels:
     en: dataset
     fr: données
     es: conjunto de datos
   definitions:
     en: Content expressed by digitally-encoded data...
     fr: Contenu exprimé sous la forme de données...
   ---
   ```

## Success Criteria

### Immediate Goals (Week 1)
- [ ] ISBD vocabularies viewable as MDX pages
- [ ] All languages preserved and accessible
- [ ] Basic navigation working
- [ ] Search functionality operational
- [ ] Clear demonstration for review group

### Update Workflow Goals
- [ ] Google Sheet changes detectable
- [ ] Preview of changes before applying
- [ ] Simple UI for non-technical users
- [ ] Clear audit trail
- [ ] Rollback capability

## Next Steps

### Immediate Actions
1. Verify access to ISBD Google Sheet
2. Test populate-from-csv.ts with ISBD elements
3. Extend script for vocabulary support
4. Generate initial MDX pages
5. Deploy to preview environment

### Follow-up Actions
1. Gather feedback from ISBD review group
2. Refine templates based on feedback
3. Implement update workflow UI
4. Document process for other standards
5. Plan migration of remaining vocabularies