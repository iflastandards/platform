# Docusaurus Code Style Standards

## File Naming & Structure

### Directory Conventions
- **Sites**: kebab-case directory names (`/portal`, `/standards/isbd`, `/standards/isbdm`)
- **Documentation**: `docs/` for content, `src/` for components and config
- **Components**: PascalCase.tsx (`VocabularyTable.tsx`, `NavigationCard.tsx`)
- **Utilities**: camelCase.ts (`siteHelpers.ts`, `configUtils.ts`)
- **MDX Files**: kebab-case.mdx (`getting-started.mdx`, `vocabulary-terms.mdx`)
- **Static Assets**: `static/` directory, organized by type

### Multi-Site Structure
```
standards-dev/
├── portal/                     # Main documentation hub
│   ├── docs/                   # Portal content
│   ├── src/                    # Portal-specific components
│   └── docusaurus.config.ts    # Portal configuration
├── standards/                  # Individual standard sites
│   ├── isbd/
│   │   ├── docs/               # ISBD content
│   │   ├── src/                # ISBD-specific components
│   │   └── docusaurus.config.ts
│   └── [other-standards]/
└── packages/theme/             # Shared components & theme
    ├── src/components/         # Reusable components
    ├── src/config/            # Shared configuration
    └── src/utils/             # Common utilities
```

## Component Organization

### Shared Theme Package (`packages/theme/`)
All reusable components live in the shared theme package:

```typescript
// packages/theme/src/components/VocabularyTable/index.tsx
export function VocabularyTable({ vocabulary, showFilters = true }: Props) {
  // Component logic
}

export default VocabularyTable;
```

### Site-Specific Components
For site-specific functionality:

```typescript
// standards/isbd/src/components/ISBDSpecificComponent.tsx
import { VocabularyTable } from '@ifla/theme/components';

export function ISBDSpecificComponent() {
  return (
    <div>
      <VocabularyTable vocabulary={isbdTerms} />
    </div>
  );
}
```

## MDX Content Standards

### Front Matter
```yaml
---
title: Page Title
description: Brief description for SEO
sidebar_position: 2
keywords: [vocabulary, terms, isbd]
---
```

### Content Structure
```markdown
# Page Title

Brief introduction paragraph.

## Main Sections

Content organized in clear sections.

### Subsections

Use consistent heading hierarchy.

## Code Examples

\```typescript
// Well-commented examples
const example = 'formatted code';
\```

## Related Resources

- [Internal Link](/docs/related-page)
- [External Link](https://example.com)
```

### Component Usage in MDX
```mdx
import { VocabularyTable } from '@ifla/theme/components';
import { NavigationCard } from '@ifla/theme/components';

# Vocabulary Terms

<VocabularyTable 
  vocabulary={currentVocabulary} 
  showFilters={true}
  searchable={true}
/>

## Navigation

<NavigationCard
  title="Next Section"
  description="Continue to implementation details"
  href="/docs/implementation"
/>
```

## TypeScript Conventions

### Configuration Files
```typescript
// docusaurus.config.ts
import type { Config } from '@docusaurus/types';
import { siteConfig } from '@ifla/theme/config';

const config: Config = {
  title: 'ISBD Standard',
  tagline: 'International Standard Bibliographic Description',
  
  // Use shared configuration
  ...siteConfig.defaults,
  
  // Site-specific overrides
  url: siteConfig.urls.isbd,
  baseUrl: '/isbd/',
  
  themeConfig: {
    ...siteConfig.theme.defaults,
    navbar: {
      title: 'ISBD',
      logo: {
        alt: 'ISBD Logo',
        src: 'img/isbd-logo.svg',
      },
      items: siteConfig.theme.navbar.items,
    },
  },
};

export default config;
```

### Component Props
```typescript
interface VocabularyTableProps {
  vocabulary: VocabularyTerm[];
  showFilters?: boolean;
  searchable?: boolean;
  onTermSelect?: (term: VocabularyTerm) => void;
}

interface VocabularyTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  examples?: string[];
  relatedTerms?: string[];
}
```

## Import Organization

### Import Order
1. React and Docusaurus imports
2. Third-party libraries
3. Shared theme components and utilities
4. Site-specific components
5. Type-only imports last

```typescript
// 1. React/Docusaurus
import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// 2. Third-party
import clsx from 'clsx';

// 3. Shared theme
import { VocabularyTable } from '@ifla/theme/components';
import { formatDate } from '@ifla/theme/utils';

// 4. Site-specific
import { ISBDTerms } from '../data/terms';

// 5. Type-only
import type { Props } from '@theme/BlogPostPage';
```

## Styling Conventions

### CSS Modules
```css
/* VocabularyTable.module.css */
.vocabularyContainer {
  margin-bottom: var(--ifla-spacing-lg);
  border: 1px solid var(--ifla-color-border);
  border-radius: var(--ifla-border-radius);
}

.filterSection {
  padding: var(--ifla-spacing-md);
  background-color: var(--ifla-color-background-secondary);
  border-bottom: 1px solid var(--ifla-color-border);
}

.termRow {
  padding: var(--ifla-spacing-sm) var(--ifla-spacing-md);
  border-bottom: 1px solid var(--ifla-color-border-light);
}

.termRow:hover {
  background-color: var(--ifla-color-background-hover);
}
```

### CSS Custom Properties
Use IFLA design system variables:

```css
:root {
  /* Colors */
  --ifla-color-primary: #1976d2;
  --ifla-color-secondary: #dc004e;
  --ifla-color-background: #ffffff;
  --ifla-color-background-secondary: #f8f9fa;
  --ifla-color-text: #212529;
  --ifla-color-border: #dee2e6;
  
  /* Spacing */
  --ifla-spacing-xs: 0.25rem;
  --ifla-spacing-sm: 0.5rem;
  --ifla-spacing-md: 1rem;
  --ifla-spacing-lg: 1.5rem;
  --ifla-spacing-xl: 3rem;
  
  /* Typography */
  --ifla-font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui;
  --ifla-font-size-sm: 0.875rem;
  --ifla-font-size-base: 1rem;
  --ifla-font-size-lg: 1.25rem;
}
```

## Configuration Management

### Shared Configuration Pattern
```typescript
// packages/theme/src/config/siteConfig.ts
export const siteConfig = {
  urls: {
    portal: 'https://iflastandards.info',
    isbd: 'https://iflastandards.info/isbd',
    isbdm: 'https://iflastandards.info/isbdm',
    // ... other sites
  },
  
  defaults: {
    favicon: 'img/favicon.ico',
    organizationName: 'ifla',
    projectName: 'standards',
    trailingSlash: false,
    
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },
  },
  
  theme: {
    defaults: {
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    },
    
    navbar: {
      items: [
        {
          type: 'dropdown',
          label: 'Standards',
          position: 'left',
          items: [
            { label: 'ISBD', href: '/isbd' },
            { label: 'ISBDM', href: '/isbdm' },
            // ... other standards
          ],
        },
        {
          href: 'https://github.com/ifla/standards',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
  },
};
```

### Site-Specific Configuration
```typescript
// standards/isbd/docusaurus.config.ts
import type { Config } from '@docusaurus/types';
import { siteConfig } from '@ifla/theme/config';

const config: Config = {
  ...siteConfig.defaults,
  
  title: 'ISBD - International Standard Bibliographic Description',
  tagline: 'Consolidated Edition 2024',
  url: siteConfig.urls.isbd,
  baseUrl: '/isbd/',
  
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/ifla/standards/tree/main/standards/isbd/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  
  themeConfig: {
    ...siteConfig.theme.defaults,
    navbar: {
      title: 'ISBD',
      logo: {
        alt: 'ISBD Logo',
        src: 'img/isbd-logo.svg',
        srcDark: 'img/isbd-logo-dark.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Documentation',
        },
        ...siteConfig.theme.navbar.items,
      ],
    },
    
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} IFLA. Built with Docusaurus.`,
    },
  },
};

export default config;
```

## Accessibility Standards

### Semantic HTML in Components
```typescript
function VocabularyTable({ vocabulary, searchable = true }: Props) {
  return (
    <section aria-labelledby="vocabulary-heading">
      <h2 id="vocabulary-heading">Vocabulary Terms</h2>
      
      {searchable && (
        <div className={styles.searchContainer}>
          <label htmlFor="vocabulary-search" className="sr-only">
            Search vocabulary terms
          </label>
          <input
            id="vocabulary-search"
            type="text"
            placeholder="Search terms..."
            aria-describedby="search-help"
          />
          <div id="search-help" className="sr-only">
            Type to filter vocabulary terms by name or definition
          </div>
        </div>
      )}
      
      <table className={styles.vocabularyTable} role="table">
        <thead>
          <tr>
            <th scope="col">Term</th>
            <th scope="col">Definition</th>
            <th scope="col">Category</th>
          </tr>
        </thead>
        <tbody>
          {vocabulary.map(term => (
            <tr key={term.id}>
              <th scope="row">{term.term}</th>
              <td>{term.definition}</td>
              <td>{term.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

### ARIA Labels and Descriptions
- Use `aria-labelledby` to reference heading elements
- Provide `aria-describedby` for additional context
- Use `role` attributes for complex interactions
- Include screen reader only text with `.sr-only` class

### Color and Contrast
- Follow WCAG 2.1 Level AA contrast requirements (4.5:1)
- Don't rely solely on color to convey information
- Provide alternative text for all images and icons
- Test with browser accessibility tools

## Error Handling

### Graceful Degradation
```typescript
function VocabularyTable({ vocabulary }: Props) {
  if (!vocabulary || vocabulary.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No vocabulary terms available.</p>
        <Link to="/docs/contributing">
          Help us by contributing terms →
        </Link>
      </div>
    );
  }
  
  return (
    <div className={styles.vocabularyContainer}>
      {/* Table content */}
    </div>
  );
}
```

### Build-Time Validation
```typescript
// Validate configuration during build
function validateSiteConfig(config: Config): void {
  if (!config.title) {
    throw new Error('Site title is required');
  }
  
  if (!config.url || !config.baseUrl) {
    throw new Error('Site URL and baseURL are required');
  }
}
```

This code style guide ensures consistency, maintainability, and accessibility across all Docusaurus sites in the IFLA Standards Platform while leveraging the shared theme architecture.