# Content Standards for Docusaurus Sites

## Documentation Philosophy

### User-Centered Approach
- **Audience First**: Write for practitioners (catalogers, librarians, system implementers)
- **Task-Oriented**: Structure content around user workflows and goals
- **Progressive Disclosure**: Start simple, provide detail on demand
- **Consistent Voice**: Professional, clear, and authoritative tone

### Content Hierarchy
```
Portal Level: Overview and navigation
├── Standard Level: Specific implementation guidance
│   ├── Introduction & Overview
│   ├── Core Concepts & Principles
│   ├── Detailed Specifications
│   ├── Implementation Examples
│   ├── Vocabulary & Terminology
│   └── Resources & References
└── Cross-References: Links between related standards
```

## MDX Content Structure

### Front Matter Standards
All MDX files must include structured front matter:

```yaml
---
title: "Page Title (Descriptive and Searchable)"
description: "Brief description for SEO and social sharing (120-160 characters)"
sidebar_position: 2
keywords: [isbd, cataloging, bibliography, areas]
tags: [implementation, examples, vocabulary]
last_update:
  date: 2024-01-15
  author: "Author Name"
---
```

### Required Front Matter Fields
- **title**: Descriptive page title for navigation and SEO
- **description**: Brief summary for search engines and social media
- **sidebar_position**: Numerical order for navigation (10, 20, 30...)
- **keywords**: Array of searchable terms
- **tags**: Content categorization for filtering

### Optional Front Matter Fields
- **last_update**: Track content currency and authorship
- **draft**: Boolean for work-in-progress content
- **unlisted**: Boolean for internal/reference pages
- **custom_edit_url**: Override edit link for external sources

## Content Organization Patterns

### Introduction Pages
```mdx
---
title: "ISBD - International Standard Bibliographic Description"
description: "Consolidated edition of ISBD for describing library resources"
sidebar_position: 10
keywords: [isbd, bibliographic description, cataloging standard]
tags: [introduction, overview]
---

# ISBD - International Standard Bibliographic Description

Brief introduction paragraph explaining the standard's purpose and scope.

## What is ISBD?

Clear definition and context.

## Key Features

- **Structured Areas**: Eight descriptive areas for complete resource description
- **Punctuation Rules**: Standardized punctuation for international consistency  
- **Content Types**: Guidelines for all resource formats and media

## Quick Start

<NavigationCard
  title="Getting Started Guide"
  description="Learn ISBD basics in 10 minutes"
  href="/docs/getting-started"
/>

## Standards Navigation

<div className="navigation-grid">
  <NavigationCard
    title="Areas 0-8"
    description="Complete area-by-area specifications"
    href="/docs/areas/overview"
  />
  <NavigationCard
    title="Vocabulary"
    description="ISBD terms and definitions"
    href="/docs/vocabulary"
  />
</div>
```

### Implementation Guide Pattern
```mdx
---
title: "Area 1: Title and Statement of Responsibility"
description: "Implementation guidelines for ISBD Area 1 descriptive elements"
sidebar_position: 20
keywords: [area 1, title, responsibility, cataloging]
tags: [implementation, areas, examples]
---

# Area 1: Title and Statement of Responsibility

Area 1 contains information about the title and statement of responsibility for the resource.

## Elements and Order

1. **Title proper**
2. **General material designation** [optional]
3. **Parallel titles**
4. **Other title information**
5. **Statement of responsibility**

## Prescribed Punctuation

| Element | Preceding Punctuation | Following Punctuation |
|---------|----------------------|----------------------|
| Title proper | - | : (before other title info) |
| Parallel title | = | : (before other title info) |
| Other title information | : | / (before responsibility) |
| Statement of responsibility | / | . (end of area) |

## Implementation Examples

### Basic Title
```
Simple title.
```

### Title with Responsibility Statement  
```
Advanced cataloging techniques / John Smith.
```

### Complex Example
```
IFLA cataloging principles = Principes de catalogage de l'IFLA : 
international guidelines / prepared by the IFLA Committee on Cataloging.
```

## Vocabulary Terms

<VocabularyTable vocabulary={area1Terms} categories={['title', 'responsibility']} />

## Common Issues

### Issue: Multiple Authors
**Problem**: How to handle multiple responsibility statements
**Solution**: Use standard connecting phrases

```
Cataloging today / John Smith, Jane Doe, and Robert Johnson.
```

### Issue: Corporate Authors
**Problem**: Representing organizational responsibility
**Solution**: Follow hierarchy patterns

```
Library standards / International Federation of Library Associations, 
Committee on Cataloging Standards.
```
```

## Vocabulary Integration

### Vocabulary Data Structure
```typescript
// standards/isbd/src/data/vocabulary.ts
import type { VocabularyTerm } from '@ifla/theme/components';

export const isbdVocabulary: VocabularyTerm[] = [
  {
    id: 'title-proper',
    term: 'Title proper',
    definition: 'The chief name of a resource, including any alternative title but excluding parallel titles and other title information.',
    category: 'title-elements',
    examples: [
      'Advanced cataloging techniques',
      'Library science today',
      'Cataloging rules, or, How to organize information'
    ],
    relatedTerms: ['parallel-title', 'alternative-title'],
    status: 'active'
  },
  {
    id: 'parallel-title',
    term: 'Parallel title',
    definition: 'The title proper in another language and/or script.',
    category: 'title-elements',
    examples: [
      'Principes de catalogage = Cataloging principles',
      'Bibliothekswesen = Library science'
    ],
    relatedTerms: ['title-proper', 'other-title-information'],
    status: 'active'
  }
];

// Category-specific subsets for targeted displays
export const titleElements = isbdVocabulary.filter(term => 
  term.category === 'title-elements'
);

export const punctuationRules = isbdVocabulary.filter(term => 
  term.category === 'punctuation'
);
```

### Vocabulary Usage in Content
```mdx
## Core Terminology

Understanding ISBD requires familiarity with specific terminology:

<VocabularyTable 
  vocabulary={titleElements}
  showFilters={false}
  searchable={true}
/>

## All ISBD Terms

Browse the complete ISBD vocabulary with filtering and search:

<VocabularyTable 
  vocabulary={isbdVocabulary}
  showFilters={true}
  categories={['title-elements', 'punctuation', 'areas', 'content-types']}
/>
```

## Cross-Site Linking Standards

### Internal Linking
```mdx
For related information, see:
- [Area 2: Edition Area](../area-2/overview.mdx)
- [ISBD Punctuation Rules](../appendices/punctuation.mdx)
- [Complete Vocabulary](/vocabulary)
```

### External Standard References
```mdx
import { siteConfig } from '@ifla/theme/config';

Related standards:
- [ISBDM Standard]({siteConfig.urls.isbdm}/docs/introduction) for manifestations
- [LRM]({siteConfig.urls.lrm}/docs/model) conceptual foundation
- [RDA Toolkit](https://www.rdatoolkit.org) implementation guidance
```

### Reference Citations
```mdx
## References

1. IFLA Cataloguing Section. *ISBD: International Standard Bibliographic Description*. 
   Consolidated ed. Berlin: De Gruyter Saur, 2011.
2. Library of Congress. *Resource Description and Access (RDA)*. 
   Chicago: American Library Association, 2010.
3. Joint Steering Committee for Development of RDA. 
   [*RDA Toolkit*](https://www.rdatoolkit.org). Chicago: ALA, 2010-.
```

## Content Quality Standards

### Writing Guidelines
- **Active Voice**: Use active voice when possible ("Apply punctuation rules" vs "Punctuation rules should be applied")
- **Concise Language**: Eliminate unnecessary words and jargon
- **Parallel Structure**: Maintain consistent formatting in lists and procedures
- **Clear Examples**: Provide concrete, realistic examples from library practice

### Technical Accuracy
- **Current Standards**: Reference only current editions of standards
- **Cross-Validation**: Ensure consistency across related pages
- **Expert Review**: Subject matter experts review technical content
- **Version Control**: Track changes to maintain content currency

### SEO Optimization
- **Keyword Integration**: Natural integration of search terms
- **Heading Structure**: Logical H1-H6 hierarchy for content outline
- **Meta Descriptions**: Compelling descriptions under 160 characters
- **Internal Linking**: Strategic linking to improve site navigation

## Content Maintenance

### Regular Review Cycle
```yaml
# Content maintenance schedule
quarterly_review:
  - vocabulary_updates
  - example_validation
  - cross_reference_checks
  - seo_optimization

annual_review:
  - content_restructuring
  - standards_alignment
  - user_feedback_integration
  - performance_analysis
```

### Version Management
```mdx
---
title: "Implementation Examples"
last_update:
  date: 2024-01-15
  author: "Standards Committee"
version: "2024.1"
replaces: "2023.2"
---

## Change History

### Version 2024.1 (January 2024)
- Updated examples for digital resources
- Added multilingual cataloging examples
- Revised punctuation guidelines

### Version 2023.2 (July 2023)
- Initial consolidated examples
- Cross-references to related standards
```

## Multimedia Integration

### Image Standards
```mdx
![ISBD Area Structure Diagram](./images/isbd-areas-diagram.svg)
*Figure 1: ISBD eight-area structure showing element relationships*

<figure>
  <img src="./images/cataloging-example.png" alt="Sample catalog record showing ISBD punctuation" />
  <figcaption>
    Figure 2: Complete ISBD catalog record with prescribed punctuation
  </figcaption>
</figure>
```

### Interactive Elements
```mdx
import { VocabularyTable, NavigationCard } from '@ifla/theme/components';

## Interactive Vocabulary Browser

<VocabularyTable 
  vocabulary={isbdVocabulary}
  searchable={true}
  showFilters={true}
  onTermSelect={(term) => {
    // Custom interaction logic
    console.log('Selected term:', term);
  }}
/>

## Related Tools

<div className="navigation-grid">
  <NavigationCard
    title="Cataloging Validator"
    description="Check your ISBD records for compliance"
    href="/tools/validator"
    icon="🔍"
  />
  
  <NavigationCard
    title="Practice Examples"
    description="Interactive cataloging exercises"
    href="/practice"
    icon="✏️"
  />
</div>
```

## Accessibility Requirements

### Content Accessibility
- **Plain Language**: Write at appropriate reading level for audience
- **Clear Structure**: Use headings, lists, and white space effectively
- **Alt Text**: Descriptive alternative text for all images and diagrams
- **Link Context**: Meaningful link text that describes destination

### Technical Accessibility
```mdx
<!-- Good: Descriptive link text -->
Learn more about [ISBD punctuation rules in Area 1](../punctuation/area-1.mdx).

<!-- Avoid: Generic link text -->
Learn more about ISBD punctuation rules [here](../punctuation/area-1.mdx).

<!-- Good: Descriptive headings -->
## Implementing Title Proper Guidelines

<!-- Avoid: Vague headings -->
## Implementation
```

This content standards guide ensures consistent, high-quality documentation across all IFLA Standards sites while maintaining accessibility and user focus.