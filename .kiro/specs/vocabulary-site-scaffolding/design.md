# Design Document

## Overview

This document outlines the design for building proper structure, navigation, and landing pages for existing IFLA Standards Docusaurus sites. The sites currently exist as placeholder scaffolds but lack the proper index pages, navigation structure, and landing pages needed to present their vocabulary data effectively.

Based on the successful implementation patterns established in the ISBD site and the comprehensive data from the IFLA Standards Complete Analysis Report, this system will generate the missing structural components for the remaining sites using the existing UI components and established patterns.

## Data Source and Architecture

### IFLA Standards Report Data Structure

The system will use the IFLA Standards Complete Analysis Report as the authoritative data source:

```
Total Namespaces: 5
- FRBR: 6 element sets, 573 elements, 2 vocabularies, 8 concepts
- ISBD: 2 element sets, 353 elements, 7 vocabularies, 46 concepts  
- LRM: 1 element set, 117 elements, 0 vocabularies, 0 concepts
- UNIMARC: 49 element sets, 6030 elements, 47 vocabularies, 1582 concepts
- MulDiCat: 0 element sets, 0 concepts, 1 vocabulary, 40 concepts
```

### Site Implementation Priority

1. **ISBD** (Update existing): Fix statistics and enhance structure
2. **LRM** (Simple): 1 element set, no vocabularies - minimal structure
3. **FRBR** (Moderate): 6 element sets + 2 vocabularies - categorized navigation
4. **MulDiCat** (Simple): 1 vocabulary only - vocabulary-focused site
5. **UNIMARC** (Complex): 49 element sets + 47 vocabularies - hierarchical navigation

## Component Architecture

### Existing UI Components (Already Built)

The system will leverage existing components from the theme package:

```typescript
// Available components from @ifla/theme
- NamespaceHub: Main landing page component
- ElementSetCard: Individual element set display cards
- VocabularyCard: Individual vocabulary display cards  
- NamespaceStats: Statistics display component
- CompactButton: Navigation buttons
- CrossSetBrowser: Multi-element set browsing
- ElementSetSwitcher: Navigation between element sets
```

### Site Configuration Data Model

Each site will have enhanced configuration based on the IFLA report data:

```typescript
interface SiteConfiguration {
  namespace: string;
  title: string;
  description: string;
  statistics: {
    totalElements: number;
    totalConcepts: number;
    elementSets: number;
    vocabularies: number;
  };
  elementSets: ElementSetDefinition[];
  vocabularies: VocabularyDefinition[];
  navigationStrategy: 'simple' | 'categorized' | 'hierarchical';
}

interface ElementSetDefinition {
  id: string;
  title: string;
  description: string;
  elementCount: number;
  languages: string[];
  categories?: string[];
  baseIRI: string;
  prefix: string;
}

interface VocabularyDefinition {
  id: string;
  title: string;
  description: string;
  conceptCount: number;
  languages: string[];
  baseIRI: string;
  prefix: string;
  category?: string; // For grouping (e.g., "cartographic", "sound-recordings")
}
```

## Site-Specific Design Patterns

### 1. ISBD Site (Update Existing)

**Current Issues**: Incorrect statistics, needs data refresh
**Pattern**: Multi-element set with vocabulary grid
**Navigation**: Sidebar with element sets and vocabularies sections

```typescript
// Updated ISBD configuration
const isbdConfig: SiteConfiguration = {
  namespace: "isbd",
  title: "ISBD - International Standard Bibliographic Description",
  description: "International Standard Bibliographic Description namespace",
  statistics: {
    totalElements: 353,    // Updated from report
    totalConcepts: 46,     // Updated from report  
    elementSets: 2,
    vocabularies: 7
  },
  elementSets: [
    {
      id: "isbd",
      title: "ISBD Elements", 
      elementCount: 190,    // Updated from report
      // ... other properties
    },
    {
      id: "unconstrained",
      title: "ISBD Elements (unconstrained)",
      elementCount: 163,    // Updated from report
      // ... other properties
    }
  ],
  vocabularies: [
    // 7 vocabularies with correct concept counts
  ],
  navigationStrategy: "categorized"
};
```

### 2. LRM Site (Simple Pattern)

**Pattern**: Single element set, no vocabularies
**Navigation**: Minimal sidebar, element-focused

```typescript
const lrmConfig: SiteConfiguration = {
  namespace: "lrm", 
  title: "LRM - Library Reference Model",
  description: "Library Reference Model namespace",
  statistics: {
    totalElements: 117,
    totalConcepts: 0,
    elementSets: 1,
    vocabularies: 0
  },
  elementSets: [
    {
      id: "lrmer",
      title: "LRMer model",
      elementCount: 117,
      languages: ["English"]
    }
  ],
  vocabularies: [],
  navigationStrategy: "simple"
};
```

### 3. FRBR Site (Categorized Pattern)

**Pattern**: Multiple element sets with user task vocabularies
**Navigation**: Categorized by model type

```typescript
const frbrConfig: SiteConfiguration = {
  namespace: "frbr",
  title: "FRBR - Functional Requirements for Bibliographic Records", 
  description: "Functional Requirements for Bibliographic Records namespace",
  statistics: {
    totalElements: 573,
    totalConcepts: 8,
    elementSets: 6,
    vocabularies: 2
  },
  elementSets: [
    {
      id: "frad",
      title: "FRAD model",
      elementCount: 150,
      category: "authority-data"
    },
    {
      id: "frbrer", 
      title: "FRBRer model",
      elementCount: 216,
      category: "bibliographic-records"
    },
    // ... other element sets
  ],
  vocabularies: [
    {
      id: "frbrer-user-tasks",
      title: "FRBRer User Tasks",
      conceptCount: 4,
      category: "user-tasks"
    },
    {
      id: "frsad-user-tasks", 
      title: "FRSAD User Tasks",
      conceptCount: 4,
      category: "user-tasks"
    }
  ],
  navigationStrategy: "categorized"
};
```

### 4. MulDiCat Site (Vocabulary-Only Pattern)

**Pattern**: No element sets, single multilingual vocabulary
**Navigation**: Vocabulary-focused with language switching

```typescript
const muldicatConfig: SiteConfiguration = {
  namespace: "muldicat",
  title: "MulDiCat - Multilingual Dictionary of Cataloguing Terms",
  description: "Multilingual dictionary of cataloguing terms and concepts namespace", 
  statistics: {
    totalElements: 0,
    totalConcepts: 40,
    elementSets: 0,
    vocabularies: 1
  },
  elementSets: [],
  vocabularies: [
    {
      id: "muldicat",
      title: "MulDiCat",
      conceptCount: 40,
      languages: ["Arabic", "Bulgarian", "Catalan", "Czech", "German", "English", "Spanish", "Finnish", "French", "Croatian", "Italian", "Japanese", "Korean", "Lithuanian", "Latvian", "Polish", "Portuguese", "Russian", "Slovak", "Slovenian", "Albanian", "Serbian", "Swedish", "Thai", "Vietnamese", "Chinese"]
    }
  ],
  navigationStrategy: "simple"
};
```

### 5. UNIMARC Site (Hierarchical Pattern)

**Pattern**: 49 element sets + 47 vocabularies requiring hierarchical organization
**Navigation**: Grouped by field ranges and material types

```typescript
const unimarcConfig: SiteConfiguration = {
  namespace: "unimarc",
  title: "UNIMARC - Universal MARC",
  description: "Universal MARC namespace",
  statistics: {
    totalElements: 6030,
    totalConcepts: 1582, 
    elementSets: 49,
    vocabularies: 47
  },
  elementSets: [
    // Grouped by field ranges
    {
      id: "0XX",
      title: "UNIMARC/B elements 0XX",
      elementCount: 207,
      category: "control-fields"
    },
    {
      id: "1XX", 
      title: "UNIMARC/B elements 1XX",
      elementCount: 610,
      category: "coded-information"
    },
    // ... 47 more element sets
  ],
  vocabularies: [
    // Grouped by material type
    {
      id: "cartographic-altitude",
      title: "Cartographic materials: Altitude of sensor",
      conceptCount: 3,
      category: "cartographic"
    },
    // ... 46 more vocabularies
  ],
  navigationStrategy: "hierarchical"
};
```

## Navigation Strategy Implementation

### Simple Navigation (LRM, MulDiCat)

```typescript
// sidebars.ts for simple sites
const simpleSidebar = {
  docs: [
    {
      type: 'doc',
      id: 'index',
      label: 'Overview'
    },
    {
      type: 'category',
      label: 'Elements', // or 'Vocabulary' for MulDiCat
      items: [{ type: 'autogenerated', dirName: 'elements' }]
    },
    {
      type: 'category', 
      label: 'Documentation',
      items: ['introduction', 'examples', 'about']
    }
  ]
};
```

### Categorized Navigation (ISBD, FRBR)

```typescript
// sidebars.ts for categorized sites
const categorizedSidebar = {
  docs: [
    {
      type: 'doc',
      id: 'index', 
      label: 'Overview'
    },
    {
      type: 'category',
      label: 'Element Sets',
      link: { type: 'doc', id: 'elements/index' },
      items: [
        // Dynamically generated based on element sets
        {
          type: 'category',
          label: 'FRBR Models',
          items: [
            { type: 'doc', id: 'elements/frbrer/index' },
            { type: 'doc', id: 'elements/frad/index' },
            // ... other models
          ]
        }
      ]
    },
    {
      type: 'category',
      label: 'Vocabularies',
      link: { type: 'doc', id: 'vocabularies/index' },
      items: [
        // Dynamically generated based on vocabularies
      ]
    }
  ]
};
```

### Hierarchical Navigation (UNIMARC)

```typescript
// sidebars.ts for hierarchical sites
const hierarchicalSidebar = {
  docs: [
    {
      type: 'doc',
      id: 'index',
      label: 'UNIMARC Overview'
    },
    {
      type: 'category',
      label: 'Element Sets',
      link: { type: 'doc', id: 'elements/index' },
      items: [
        {
          type: 'category',
          label: 'Control & Coded Fields',
          items: [
            { type: 'doc', id: 'elements/0XX/index' },
            { type: 'doc', id: 'elements/1XX/index' }
          ]
        },
        {
          type: 'category', 
          label: 'Linking Fields',
          items: [
            { type: 'doc', id: 'elements/41X/index' },
            { type: 'doc', id: 'elements/42X/index' },
            // ... 8 linking field sets
          ]
        },
        // ... other groups
      ]
    },
    {
      type: 'category',
      label: 'Vocabularies', 
      link: { type: 'doc', id: 'vocabularies/index' },
      items: [
        {
          type: 'category',
          label: 'Cartographic Materials',
          items: [
            // ~15 cartographic vocabularies
          ]
        },
        {
          type: 'category',
          label: 'Sound Recordings', 
          items: [
            // ~12 sound recording vocabularies
          ]
        },
        // ... other material type groups
      ]
    }
  ]
};
```

## Page Template Generation

### Landing Page Template (docs/index.mdx)

```mdx
---
sidebar_position: 1
title: {namespace.title}
sidebar_label: {namespace.title} Overview
description: {namespace.description}
hide_table_of_contents: true
---

import CompactButton from '../src/components/CompactButton';

# {namespace.title}

{namespace.description}

## Namespace Statistics

<div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
  <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', flex: '1', minWidth: '200px' }}>
    <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Elements</div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>{statistics.totalElements}</div>
    <div style={{ fontSize: '0.8rem', color: '#999' }}>Across {statistics.elementSets} element sets</div>
  </div>
  {/* Additional statistics cards */}
</div>

{/* Element Sets Section - if elementSets.length > 0 */}
## Element Sets

<div style={{ display: 'grid', gap: '20px', marginBottom: '40px' }}>
  {elementSets.map(set => (
    <ElementSetCard key={set.id} elementSet={set} />
  ))}
</div>

{/* Vocabularies Section - if vocabularies.length > 0 */}
## Vocabularies

<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '40px' }}>
  {vocabularies.map(vocab => (
    <VocabularyCard key={vocab.id} vocabulary={vocab} />
  ))}
</div>
```

### Element Sets Index Template (docs/elements/index.mdx)

```mdx
---
title: {namespace.title} Element Sets
sidebar_position: 10
---

# {namespace.title} Element Sets

{elementSetsDescription}

## Available Element Sets

<div style={{ display: 'grid', gap: '20px', marginTop: '24px' }}>
  {elementSets.map(set => (
    <ElementSetDetailCard key={set.id} elementSet={set} />
  ))}
</div>

{/* Navigation strategy specific content */}
{navigationStrategy === 'hierarchical' && (
  <ElementSetNavigator elementSets={elementSets} />
)}
```

### Vocabularies Index Template (docs/vocabularies/index.mdx)

```mdx
---
title: {namespace.title} Vocabularies
sidebar_position: 20
---

# {namespace.title} Vocabularies

{vocabulariesDescription}

## Available Vocabularies

{vocabularyCategories.map(category => (
  <VocabularyCategorySection key={category.id} category={category} />
))}
```

## Implementation Architecture

### Data Processing Pipeline

```typescript
interface SiteGenerator {
  // 1. Load IFLA report data
  loadIFLAReportData(): Promise<IFLAReportData>;
  
  // 2. Transform to site configurations
  generateSiteConfigurations(reportData: IFLAReportData): SiteConfiguration[];
  
  // 3. Generate site structure
  generateSiteStructure(config: SiteConfiguration): SiteStructure;
  
  // 4. Create page templates
  generatePageTemplates(structure: SiteStructure): PageTemplate[];
  
  // 5. Generate navigation
  generateNavigation(config: SiteConfiguration): NavigationConfig;
  
  // 6. Write files to disk
  writeSiteFiles(siteKey: string, templates: PageTemplate[], navigation: NavigationConfig): Promise<void>;
}
```

### File Generation Strategy

```typescript
interface FileGenerationPlan {
  siteKey: string;
  filesToCreate: {
    'docs/index.mdx': NamespaceLandingPage;
    'docs/elements/index.mdx'?: ElementSetsIndexPage;
    'docs/vocabularies/index.mdx'?: VocabulariesIndexPage;
    'sidebars.ts': SidebarConfiguration;
    'site-config.json': SiteConfiguration; // Update existing
    'namespace.json': NamespaceMetadata; // Update existing
  };
  filesToUpdate: {
    // Update existing files with correct statistics
  };
}
```

### Batch Processing Workflow

```typescript
class VocabularySiteGenerator {
  async generateAllSites(): Promise<void> {
    const reportData = await this.loadIFLAReportData();
    const siteConfigs = this.generateSiteConfigurations(reportData);
    
    for (const config of siteConfigs) {
      console.log(`Processing ${config.namespace}...`);
      
      // Generate site structure
      const structure = this.generateSiteStructure(config);
      const templates = this.generatePageTemplates(structure);
      const navigation = this.generateNavigation(config);
      
      // Write files
      await this.writeSiteFiles(config.namespace, templates, navigation);
      
      console.log(`✅ Completed ${config.namespace}`);
    }
  }
}
```

## Integration Points

### Existing Theme Components

The system will integrate with existing components:

```typescript
// Import existing components
import { NamespaceHub } from '@ifla/theme/components/NamespaceHub';
import { ElementSetCard } from '@ifla/theme/components/ElementSetCard';
import { VocabularyCard } from '@ifla/theme/components/VocabularyCard';
import { CompactButton } from '@ifla/theme/components/CompactButton';
```

### Site Configuration Updates

Each site's configuration files will be updated:

```json
// site-config.json updates
{
  "namespace": "frbr",
  "namespaceTitle": "FRBR - Functional Requirements for Bibliographic Records",
  "elementSets": [
    // Generated from IFLA report data
  ],
  "vocabularies": [
    // Generated from IFLA report data  
  ],
  "features": {
    "enableMultipleElementSets": true,
    "enableVocabularyCategories": true
  }
}
```

### Build Process Integration

The generated sites will integrate with existing build processes:

- Use existing Nx project configurations
- Maintain compatibility with current deployment pipeline
- Preserve existing theme and component dependencies
- Follow established URL patterns and routing

This design provides a comprehensive approach to extending the proven ISBD pattern to all remaining IFLA standards sites while correcting the existing ISBD statistics and ensuring consistency across the platform.