# Docusaurus Component Standards

## Shared Theme Components

All reusable components live in `packages/theme/src/components/` and follow consistent patterns for cross-site usage.

### Component Architecture

#### Component Structure
```
packages/theme/src/components/
├── VocabularyTable/
│   ├── index.tsx              # Main component
│   ├── VocabularyTable.module.css
│   ├── VocabularyTable.test.tsx
│   ├── types.ts               # Component-specific types
│   └── README.md              # Usage documentation
├── NavigationCard/
├── SearchBox/
└── shared/                    # Common utilities
    ├── hooks/
    ├── utils/
    └── types.ts
```

#### Export Pattern
```typescript
// packages/theme/src/components/VocabularyTable/index.tsx
export { VocabularyTable } from './VocabularyTable';
export type { VocabularyTableProps } from './types';

// packages/theme/src/components/index.ts
export { VocabularyTable } from './VocabularyTable';
export { NavigationCard } from './NavigationCard';
export { SearchBox } from './SearchBox';
```

## Core Component Patterns

### VocabularyTable Component

**Purpose**: Interactive table for displaying and searching vocabulary terms across all IFLA standards.

```typescript
// packages/theme/src/components/VocabularyTable/types.ts
export interface VocabularyTerm {
  id: string;
  term: string;
  definition: string;
  category: string;
  examples?: string[];
  relatedTerms?: string[];
  status?: 'active' | 'deprecated' | 'proposed';
}

export interface VocabularyTableProps {
  vocabulary: VocabularyTerm[];
  showFilters?: boolean;
  searchable?: boolean;
  categories?: string[];
  onTermSelect?: (term: VocabularyTerm) => void;
  className?: string;
}

// packages/theme/src/components/VocabularyTable/index.tsx
import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import styles from './VocabularyTable.module.css';
import type { VocabularyTableProps, VocabularyTerm } from './types';

export function VocabularyTable({
  vocabulary,
  showFilters = true,
  searchable = true,
  categories = [],
  onTermSelect,
  className,
}: VocabularyTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredVocabulary = useMemo(() => {
    return vocabulary.filter(term => {
      const matchesSearch = searchTerm === '' || 
        term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
        term.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [vocabulary, searchTerm, selectedCategory]);

  const availableCategories = useMemo(() => {
    const cats = categories.length > 0 ? categories : 
      [...new Set(vocabulary.map(term => term.category))];
    return ['all', ...cats];
  }, [vocabulary, categories]);

  return (
    <section 
      className={clsx(styles.vocabularyContainer, className)}
      aria-labelledby="vocabulary-heading"
    >
      <h2 id="vocabulary-heading" className={styles.heading}>
        Vocabulary Terms ({filteredVocabulary.length})
      </h2>
      
      {(searchable || showFilters) && (
        <div className={styles.controlsContainer}>
          {searchable && (
            <div className={styles.searchContainer}>
              <label htmlFor="vocabulary-search" className="sr-only">
                Search vocabulary terms
              </label>
              <input
                id="vocabulary-search"
                type="text"
                placeholder="Search terms or definitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Type to filter vocabulary terms by name or definition
              </div>
            </div>
          )}
          
          {showFilters && availableCategories.length > 1 && (
            <div className={styles.filterContainer}>
              <label htmlFor="category-filter" className={styles.filterLabel}>
                Category:
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles.filterSelect}
              >
                {availableCategories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : 
                     category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {filteredVocabulary.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No vocabulary terms found matching your criteria.</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className={styles.resetButton}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.vocabularyTable} role="table">
            <thead>
              <tr>
                <th scope="col" className={styles.termHeader}>Term</th>
                <th scope="col" className={styles.definitionHeader}>Definition</th>
                <th scope="col" className={styles.categoryHeader}>Category</th>
                <th scope="col" className={styles.statusHeader}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVocabulary.map(term => (
                <tr 
                  key={term.id}
                  className={clsx(
                    styles.termRow,
                    onTermSelect && styles.clickableRow
                  )}
                  onClick={() => onTermSelect?.(term)}
                  role={onTermSelect ? "button" : undefined}
                  tabIndex={onTermSelect ? 0 : undefined}
                >
                  <th scope="row" className={styles.termCell}>
                    {term.term}
                  </th>
                  <td className={styles.definitionCell}>
                    {term.definition}
                    {term.examples && term.examples.length > 0 && (
                      <div className={styles.examples}>
                        <strong>Examples:</strong> {term.examples.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className={styles.categoryCell}>
                    <span className={clsx(styles.categoryBadge, styles[`category-${term.category}`])}>
                      {term.category}
                    </span>
                  </td>
                  <td className={styles.statusCell}>
                    <span className={clsx(styles.statusBadge, styles[`status-${term.status || 'active'}`])}>
                      {term.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
```

### NavigationCard Component

**Purpose**: Consistent navigation cards for cross-site linking and content discovery.

```typescript
// packages/theme/src/components/NavigationCard/types.ts
export interface NavigationCardProps {
  title: string;
  description: string;
  href: string;
  icon?: string | React.ReactNode;
  external?: boolean;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

// packages/theme/src/components/NavigationCard/index.tsx
import React from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './NavigationCard.module.css';
import type { NavigationCardProps } from './types';

export function NavigationCard({
  title,
  description,
  href,
  icon,
  external = false,
  variant = 'default',
  size = 'medium',
}: NavigationCardProps) {
  const cardContent = (
    <div className={clsx(
      styles.card,
      styles[variant],
      styles[size]
    )}>
      {icon && (
        <div className={styles.iconContainer}>
          {typeof icon === 'string' ? (
            <img src={icon} alt="" className={styles.icon} />
          ) : (
            icon
          )}
        </div>
      )}
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
      </div>
      
      {external && (
        <div className={styles.externalIndicator} aria-hidden="true">
          ↗
        </div>
      )}
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardLink}
        aria-label={`${title} (opens in new tab)`}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={href} className={styles.cardLink}>
      {cardContent}
    </Link>
  );
}
```

### SearchBox Component

**Purpose**: Site-specific search integration with Algolia.

```typescript
// packages/theme/src/components/SearchBox/index.tsx
import React from 'react';
import { DocSearch } from '@docsearch/react';
import { useThemeConfig } from '@docusaurus/theme-common';
import styles from './SearchBox.module.css';

export function SearchBox() {
  const { algolia } = useThemeConfig();

  if (!algolia) {
    return null;
  }

  return (
    <div className={styles.searchContainer}>
      <DocSearch
        appId={algolia.appId}
        indexName={algolia.indexName}
        apiKey={algolia.apiKey}
        searchParameters={{
          facetFilters: algolia.contextualSearch 
            ? [`site:${window.location.hostname}`]
            : [],
        }}
        placeholder="Search documentation..."
      />
    </div>
  );
}
```

## MDX Integration Patterns

### Component Usage in Documentation

```mdx
---
title: ISBD Areas
description: Overview of ISBD descriptive areas
---

import { VocabularyTable } from '@ifla/theme/components';
import { NavigationCard } from '@ifla/theme/components';
import { isbdAreas } from '../data/vocabulary';

# ISBD Descriptive Areas

The International Standard Bibliographic Description defines eight areas for resource description.

## Area Definitions

<VocabularyTable 
  vocabulary={isbdAreas}
  showFilters={true}
  searchable={true}
  categories={['structural', 'content', 'physical']}
/>

## Related Standards

<div className="navigation-grid">
  <NavigationCard
    title="ISBDM"
    description="ISBD for Manifestations - Specialized application"
    href="/isbdm/docs/areas"
    icon="/img/isbdm-icon.svg"
  />
  
  <NavigationCard
    title="RDA Toolkit"
    description="Resource Description and Access guidelines"
    href="https://www.rdatoolkit.org"
    external={true}
    icon="/img/rda-icon.svg"
  />
</div>
```

### Custom MDX Components

```typescript
// packages/theme/src/components/MDXComponents/index.ts
import { VocabularyTable } from '../VocabularyTable';
import { NavigationCard } from '../NavigationCard';
import { SearchBox } from '../SearchBox';

// Export all components for MDX usage
export const MDXComponents = {
  VocabularyTable,
  NavigationCard,
  SearchBox,
  // Add custom MDX components here
};
```

## Responsive Design Standards

### CSS Grid Layouts
```css
/* NavigationCard.module.css */
.navigation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--ifla-spacing-lg);
  margin: var(--ifla-spacing-xl) 0;
}

@media (max-width: 768px) {
  .navigation-grid {
    grid-template-columns: 1fr;
    gap: var(--ifla-spacing-md);
  }
}
```

### Mobile-First Approach
```css
/* VocabularyTable.module.css */
.tableContainer {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.vocabularyTable {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
}

@media (max-width: 768px) {
  .vocabularyTable {
    min-width: 100%;
    font-size: 0.875rem;
  }
  
  .definitionCell,
  .examples {
    max-width: 200px;
    overflow-wrap: break-word;
  }
}
```

## Testing Standards

### Component Testing Pattern
```typescript
// packages/theme/src/components/VocabularyTable/VocabularyTable.test.tsx
import React from 'react';
import { render, screen, userEvent } from '@testing-library/react';
import { VocabularyTable } from './index';
import type { VocabularyTerm } from './types';

const mockVocabulary: VocabularyTerm[] = [
  {
    id: '1',
    term: 'Area 0',
    definition: 'Content form and media type area',
    category: 'structural',
    examples: ['[cartographic material]', '[electronic resource]'],
    status: 'active',
  },
  {
    id: '2',
    term: 'Area 1',
    definition: 'Title and statement of responsibility area',
    category: 'content',
    status: 'active',
  },
];

describe('VocabularyTable @integration @ui @theme', () => {
  it('should render vocabulary terms', () => {
    render(<VocabularyTable vocabulary={mockVocabulary} />);
    
    expect(screen.getByText('Area 0')).toBeInTheDocument();
    expect(screen.getByText('Content form and media type area')).toBeInTheDocument();
  });

  it('should filter terms by search input', async () => {
    render(<VocabularyTable vocabulary={mockVocabulary} searchable={true} />);
    
    const searchInput = screen.getByLabelText(/search vocabulary terms/i);
    await userEvent.type(searchInput, 'Area 0');
    
    expect(screen.getByText('Area 0')).toBeInTheDocument();
    expect(screen.queryByText('Area 1')).not.toBeInTheDocument();
  });

  it('should filter terms by category', async () => {
    render(<VocabularyTable vocabulary={mockVocabulary} showFilters={true} />);
    
    const categoryFilter = screen.getByLabelText(/category/i);
    await userEvent.selectOptions(categoryFilter, 'structural');
    
    expect(screen.getByText('Area 0')).toBeInTheDocument();
    expect(screen.queryByText('Area 1')).not.toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<VocabularyTable vocabulary={mockVocabulary} />);
    
    // Check ARIA labels and structure
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByLabelText(/vocabulary terms/i)).toBeInTheDocument();
    
    // Check heading hierarchy
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });
});
```

## Performance Optimization

### Lazy Loading
```typescript
// For large vocabulary datasets
import React, { lazy, Suspense } from 'react';

const VocabularyTable = lazy(() => import('./VocabularyTable'));

export function LazyVocabularyTable(props) {
  return (
    <Suspense fallback={<div>Loading vocabulary...</div>}>
      <VocabularyTable {...props} />
    </Suspense>
  );
}
```

### Memoization
```typescript
// packages/theme/src/components/VocabularyTable/index.tsx
import React, { memo, useMemo } from 'react';

export const VocabularyTable = memo(function VocabularyTable({
  vocabulary,
  // ... other props
}: VocabularyTableProps) {
  // Memoize expensive computations
  const sortedVocabulary = useMemo(() => {
    return [...vocabulary].sort((a, b) => a.term.localeCompare(b.term));
  }, [vocabulary]);

  // Component implementation
});
```

## Accessibility Compliance

### WCAG 2.1 AA Standards
- **Color Contrast**: 4.5:1 ratio for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Visible focus indicators and logical tab order

### Testing Tools Integration
```typescript
// In component tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<VocabularyTable vocabulary={mockVocabulary} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

This component system ensures consistency, accessibility, and maintainability across all Docusaurus sites in the IFLA Standards Platform.