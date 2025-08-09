# Multi-Element Set Architecture

**Version:** 1.0  
**Date:** July 2025  
**Status:** Design Specification  
**Source:** Consolidated from docs/docusaurus_site_scaffolding/

## Overview

This document consolidates the multi-element set architecture design from the scaffolding documentation. It addresses the complexity of namespaces that contain multiple element sets and vocabularies, such as ISBD (2 element sets + 7 vocabularies) and UNIMARC (~24 element sets + many vocabularies).

## Problem Statement

The current system architecture assumes one element set per Docusaurus site, but the reality is more complex:
- **ISBD namespace**: 2 element sets (ISBD, ISBD Unconstrained) + 7 concept schemes
- **ISBD-LRM namespace**: 9 element sets (ISBDM, ISBDW, ISBDE, etc.) + concept schemes
- **UNIMARC namespace**: ~24 element sets organized by field groups + many concept schemes

## Architectural Solution

### Enhanced One Site Per Namespace

Keep one Docusaurus site per namespace but enhance to handle multiple element sets.

### Site Structure

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

## Component Architecture

### NamespaceHub Component

Central component for namespace landing pages:

```typescript
interface NamespaceHubProps {
  namespace: {
    id: string;
    title: string;
    description: string;
    elementSets: ElementSetInfo[];
    vocabularies: VocabularyInfo[];
  };
}
```

**Features**:
- Overview statistics
- Grid layout for element sets
- Grid layout for vocabularies
- Search functionality across all sets
- Visual hierarchy

### ElementSetCard Component

Card component for displaying element set information:

```typescript
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
```

### VocabularyCard Component

Card component for displaying vocabulary information:

```typescript
interface VocabularyInfo {
  id: string;
  title: string;
  description?: string;
  termCount: number;
  path: string;
  lastUpdated?: string;
}
```

## Navigation Design

### Enhanced Sidebar Structure

```typescript
const sidebars = {
  docs: [
    {
      type: 'doc',
      id: 'index',
      label: 'Namespace Overview'
    },
    {
      type: 'category',
      label: 'Element Sets',
      link: { type: 'doc', id: 'elements/index' },
      items: [
        // Dynamic generation for each element set
      ]
    },
    {
      type: 'category',
      label: 'Vocabularies',
      link: { type: 'doc', id: 'vocabularies/index' },
      items: [
        // Dynamic generation for each vocabulary
      ]
    }
  ]
};
```

## Implementation Examples

### ISBD Implementation

- 2 Element Sets: ISBD (constrained) and ISBD Unconstrained
- 7 Vocabularies: content-form, media-type, content-qualification, etc.
- Clear separation between element sets
- Unified navigation structure

### UNIMARC Implementation

- ~24 Element Sets organized by field groups
- Multiple concept schemes
- Hierarchical organization
- Advanced filtering and search

## Benefits

1. **Scalability**: Handles any number of element sets per namespace
2. **Flexibility**: Supports different organizational patterns
3. **User Experience**: Clear navigation and discovery
4. **Maintainability**: Consistent structure across namespaces
5. **Search**: Unified search across all sets in a namespace

## Migration Path

1. **Phase 1**: Update scaffolding scripts to support multi-element structure
2. **Phase 2**: Create NamespaceHub and related components
3. **Phase 3**: Migrate existing sites to new structure
4. **Phase 4**: Update documentation generation pipeline

## Related Documents

- `docs/docusaurus_site_scaffolding/DESIGN-MULTIPLE-ELEMENT-SETS.md`
- `docs/docusaurus_site_scaffolding/DESIGN-UI-COMPONENTS.md`
- `docs/docusaurus_site_scaffolding/DESIGN-IMPLEMENTATION-EXAMPLES.md`
- `system-design-docs/26-ui-component-patterns.md`
