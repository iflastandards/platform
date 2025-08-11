# System Design Documentation Consolidation Plan

**Date:** July 2025  
**Purpose:** Consolidate documents 11-31 into core documents 00-10 to create a more manageable documentation structure

## Overview

This plan outlines how to incorporate all content from supplementary documents (11-31) into the core system design documents (00-10) plus a new Document 11 for Design System and UI Patterns.

## Consolidation Mapping

### Document 00 - Executive Summary
**No changes needed** - Remains high-level overview

### Document 01 - System Architecture Overview
**Incorporate from:**
- Doc 22 (OMR25 Comparison) → Add comparison table to technology choices section
- Doc 27 (MVP Critical Path) → Add MVP timeline to implementation roadmap

**Key additions:**
- OMR25 feature comparison matrix
- MVP timeline with critical milestones

### Document 02 - Data Architecture
**Incorporate from:**
- Doc 21 (Vocabulary Server Requirements) → Add vocabulary server design
- Doc 23 (MDX Generation Safety) → Add safety patterns section
- Doc 31 (Multi-Element Set Architecture) → Add to data models section

**Key additions:**
- Vocabulary server pathmap system
- MDX generation safety protocols
- Multi-element set data models

### Document 03 - Configuration Architecture
**Incorporate from:**
- Doc 12 (Environment Strategy Final) → Replace existing environment section
- Doc 13 (Environment Migration Guide) → Add as implementation guide
- Doc 14 (Repository Structure Current) → Add repository organization section

**Key additions:**
- 3-environment strategy (local/preview/production)
- Environment migration procedures
- Repository naming rationale

### Document 04 - Development Workflow
**Incorporate from:**
- Doc 19 (Edit Permissions Workflow) → Add to workflow governance
- Doc 20 (Translation Workflow Integration) → Add translation procedures
- Doc 28 (ISBD CSV to MDX Plan) → Add as conversion workflow example

**Key additions:**
- Granular edit permissions
- Version-based translation synchronization
- CSV to MDX conversion workflow

### Document 05 - API Architecture
**Incorporate from:**
- Doc 24 (Admin UI API Specification) → Replace existing API section with comprehensive spec

**Key additions:**
- Complete 170+ endpoint specification
- Request/response examples
- Error handling patterns

### Document 06 - Testing Strategy
**No changes needed** - Already comprehensive

### Document 07 - Subsystems Architecture
**Already contains** vocabulary lifecycle content
**No additional changes needed**

### Document 08 - Architecture Evolution
**Incorporate from:**
- Doc 30 (Integration PRD Alignment) → Add to evolution tracking

**Key additions:**
- PRD conformance analysis
- Architecture decision records

### Document 09 - Collaboration Architecture
**Incorporate from:**
- Doc 15 (TinaCMS Integration Design) → Add CMS integration section
- Doc 16 (TinaCMS POC Guide) → Add as implementation guide
- Doc 17 (TinaCMS Integration Architecture) → Add detailed architecture
- Doc 18 (Multilingual Strategy Design) → Add internationalization section

**Key additions:**
- Complete TinaCMS integration architecture
- Field-level and document-level editing
- Multilingual content strategy

### Document 10 - Implementation Strategy
**Incorporate from:**
- Doc 11 (Discussion Points) → Add as open questions section

**Key additions:**
- Outstanding discussion points
- Decision log

### NEW Document 11 - Design System and UI Patterns
**Create from:**
- Doc 25 (Design System Specification)
- Doc 26 (UI Component Patterns)
- Doc 29 (Admin Dashboard Mockup Reference)

**Contents:**
- Complete design system specification
- MUI component patterns
- Dashboard mockup references
- Accessibility standards

## Implementation Steps

### Phase 1: Create New Document 11
1. Combine documents 25, 26, and 29 into comprehensive Design System document
2. Ensure all component patterns and mockups are preserved
3. Add cross-references to implementation examples

### Phase 2: Update Core Documents (00-10)
1. Update each core document according to the mapping above
2. Preserve all technical specifications and examples
3. Add clear section headers for incorporated content
4. Update table of contents and navigation

### Phase 3: Archive Supplementary Documents
1. Create `archive/` subdirectory
2. Move documents 11-31 to archive with README explaining consolidation
3. Add forwarding references in archive README

### Phase 4: Update Cross-References
1. Update all internal document references
2. Update external references in other project documentation
3. Update developer_notes to point to consolidated documents

## Content Preservation Checklist

### Critical Information to Preserve
- [ ] 3-environment deployment strategy (Doc 12)
- [ ] Version-based translation synchronization (Doc 20)
- [ ] Vocabulary server pathmap system (Doc 21)
- [ ] OMR25 feature comparison (Doc 22)
- [ ] MDX generation safety protocols (Doc 23)
- [ ] Complete API specification (Doc 24)
- [ ] Multi-element set architecture (Doc 31)
- [ ] All POC guides and implementation examples
- [ ] All mockups and UI patterns

### Document Structure Template

Each consolidated section should follow this structure:
```markdown
## [Section Name]
*Source: Previously documented in [Doc XX - Title]*

### Overview
[Brief introduction]

### Core Concepts
[Key information from source document]

### Implementation Details
[Technical specifications]

### Examples
[Code examples and patterns]

### References
- Original design: `archive/XX-original-title.md`
- Related sections: [cross-references]
```

## Success Criteria

1. All information from documents 11-31 is incorporated into documents 00-11
2. No technical specifications or implementation details are lost
3. Navigation and discovery is improved
4. Document count reduced from 32 to 12
5. Clear audit trail maintained via archive

## Timeline

- Phase 1: 1 day - Create Document 11
- Phase 2: 2-3 days - Update core documents
- Phase 3: 1 day - Archive and create references
- Phase 4: 1 day - Update cross-references

Total: ~1 week for complete consolidation
