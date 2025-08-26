# Docusaurus Testing Standards

## Testing Philosophy: Content-First Strategy

Docusaurus testing focuses on content integrity, component functionality, and site accessibility rather than complex business logic. The testing pyramid emphasizes integration testing with real content and user interactions.

## Testing Stack

- **Unit Testing**: Vitest + React Testing Library (theme components)
- **Integration Testing**: Component + Content validation
- **E2E Testing**: Playwright with content navigation flows
- **Content Testing**: Link validation, MDX rendering, vocabulary integrity
- **Accessibility Testing**: Automated WCAG compliance validation

## Test Categories and Tags (Required)

All tests must use the AI tagging system. Use `pnpm test:tag --staged` before commits.

### Category Tags (Required)
- `@unit` - Component logic testing (theme package)
- `@integration` - Component + content testing (primary)
- `@e2e` - Full site navigation and user flows
- `@content` - MDX rendering and content validation

### Functional Tags (Required)
- `@theme` - Shared theme component testing
- `@vocabulary` - Vocabulary data and display testing
- `@navigation` - Site navigation and linking
- `@accessibility` - A11y compliance testing
- `@seo` - SEO metadata and structure
- `@multi-site` - Cross-site functionality

### Priority Tags (Required)
- `@critical` - Core site functionality
- `@content-integrity` - Content accuracy and completeness
- `@user-flow` - Primary user journeys
- `@regression` - Known issue prevention

## Theme Component Testing

### Component Test Pattern
**Location**: `packages/theme/src/components/[Component]/[Component].test.tsx`

```typescript
// packages/theme/src/components/VocabularyTable/VocabularyTable.test.tsx
import React from 'react';
import { render, screen, userEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { VocabularyTable } from './index';
import type { VocabularyTerm } from './types';

expect.extend(toHaveNoViolations);

const mockVocabulary: VocabularyTerm[] = [
  {
    id: 'area-0',
    term: 'Area 0',
    definition: 'Content form and media type area',
    category: 'structural',
    examples: ['[cartographic material]', '[electronic resource]'],
    status: 'active',
  },
  {
    id: 'area-1',
    term: 'Area 1',
    definition: 'Title and statement of responsibility area',
    category: 'content',
    status: 'active',
  },
  {
    id: 'deprecated-term',
    term: 'Old Term',
    definition: 'A deprecated vocabulary term',
    category: 'legacy',
    status: 'deprecated',
  },
];

describe('VocabularyTable Component @integration @theme @vocabulary', () => {
  it('should render vocabulary terms correctly', () => {
    render(<VocabularyTable vocabulary={mockVocabulary} />);
    
    expect(screen.getByText('Area 0')).toBeInTheDocument();
    expect(screen.getByText('Content form and media type area')).toBeInTheDocument();
    expect(screen.getByText('structural')).toBeInTheDocument();
  });

  it('should filter terms by search input @user-flow', async () => {
    render(<VocabularyTable vocabulary={mockVocabulary} searchable={true} />);
    
    const searchInput = screen.getByLabelText(/search vocabulary terms/i);
    await userEvent.type(searchInput, 'Area 0');
    
    expect(screen.getByText('Area 0')).toBeInTheDocument();
    expect(screen.queryByText('Area 1')).not.toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument(); // Counter update
  });

  it('should filter terms by category @user-flow', async () => {
    render(<VocabularyTable vocabulary={mockVocabulary} showFilters={true} />);
    
    const categoryFilter = screen.getByLabelText(/category/i);
    await userEvent.selectOptions(categoryFilter, 'structural');
    
    expect(screen.getByText('Area 0')).toBeInTheDocument();
    expect(screen.queryByText('Area 1')).not.toBeInTheDocument();
  });

  it('should handle empty vocabulary gracefully @regression', () => {
    render(<VocabularyTable vocabulary={[]} />);
    
    expect(screen.getByText(/no vocabulary terms found/i)).toBeInTheDocument();
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
  });

  it('should display status indicators correctly @content-integrity', () => {
    render(<VocabularyTable vocabulary={mockVocabulary} />);
    
    // Check active status
    const activeStatus = screen.getAllByText('active');
    expect(activeStatus).toHaveLength(2);
    
    // Check deprecated status
    const deprecatedStatus = screen.getByText('deprecated');
    expect(deprecatedStatus).toBeInTheDocument();
  });

  it('should call onTermSelect when term is clicked @user-flow', async () => {
    const mockOnSelect = jest.fn();
    render(
      <VocabularyTable 
        vocabulary={mockVocabulary} 
        onTermSelect={mockOnSelect}
      />
    );
    
    const firstTerm = screen.getByText('Area 0').closest('tr');
    await userEvent.click(firstTerm!);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockVocabulary[0]);
  });

  it('should be accessible @accessibility @critical', async () => {
    const { container } = render(
      <VocabularyTable vocabulary={mockVocabulary} />
    );
    
    // WCAG compliance check
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Keyboard navigation
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Screen reader support
    expect(screen.getByLabelText(/vocabulary terms/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('should support keyboard navigation @accessibility', async () => {
    const mockOnSelect = jest.fn();
    render(
      <VocabularyTable 
        vocabulary={mockVocabulary} 
        onTermSelect={mockOnSelect}
      />
    );
    
    const firstTerm = screen.getByText('Area 0').closest('tr');
    firstTerm!.focus();
    
    await userEvent.keyboard('{Enter}');
    expect(mockOnSelect).toHaveBeenCalled();
  });

  it('should handle large vocabulary datasets efficiently @performance', () => {
    const largeVocabulary = Array.from({ length: 1000 }, (_, i) => ({
      id: `term-${i}`,
      term: `Term ${i}`,
      definition: `Definition for term ${i}`,
      category: i % 2 === 0 ? 'even' : 'odd',
      status: 'active' as const,
    }));

    const startTime = performance.now();
    render(<VocabularyTable vocabulary={largeVocabulary} />);
    const renderTime = performance.now() - startTime;
    
    // Should render within reasonable time (adjust threshold as needed)
    expect(renderTime).toBeLessThan(500);
    expect(screen.getByText('Term 0')).toBeInTheDocument();
  });
});
```

### NavigationCard Testing
```typescript
// packages/theme/src/components/NavigationCard/NavigationCard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavigationCard } from './index';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('NavigationCard Component @integration @theme @navigation', () => {
  it('should render internal links correctly @content-integrity', () => {
    renderWithRouter(
      <NavigationCard
        title="ISBD Areas"
        description="Learn about ISBD descriptive areas"
        href="/docs/areas"
      />
    );
    
    expect(screen.getByText('ISBD Areas')).toBeInTheDocument();
    expect(screen.getByText('Learn about ISBD descriptive areas')).toBeInTheDocument();
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/docs/areas');
  });

  it('should render external links with proper attributes @accessibility', () => {
    render(
      <NavigationCard
        title="RDA Toolkit"
        description="External cataloging resource"
        href="https://rdatoolkit.org"
        external={true}
      />
    );
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('aria-label', 'RDA Toolkit (opens in new tab)');
  });

  it('should display icons correctly', () => {
    render(
      <NavigationCard
        title="Test Card"
        description="Test description"
        href="/test"
        icon="/img/test-icon.svg"
      />
    );
    
    const icon = screen.getByRole('img');
    expect(icon).toHaveAttribute('src', '/img/test-icon.svg');
    expect(icon).toHaveAttribute('alt', '');
  });
});
```

## Content Integration Testing

### MDX Component Integration
```typescript
// standards/isbd/src/components/__tests__/ContentIntegration.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MDXProvider } from '@mdx-js/react';
import { VocabularyTable } from '@ifla/theme/components';
import { isbdVocabulary } from '../data/vocabulary';

const components = {
  VocabularyTable,
};

describe('Content Integration @integration @content @vocabulary', () => {
  it('should render vocabulary table with ISBD data @content-integrity', () => {
    render(
      <MDXProvider components={components}>
        <VocabularyTable vocabulary={isbdVocabulary} />
      </MDXProvider>
    );
    
    // Verify ISBD-specific terms are displayed
    expect(screen.getByText('Area 0')).toBeInTheDocument();
    expect(screen.getByText('Title proper')).toBeInTheDocument();
  });

  it('should validate vocabulary data structure @content-integrity', () => {
    // Ensure all vocabulary entries have required fields
    isbdVocabulary.forEach(term => {
      expect(term.id).toBeDefined();
      expect(term.term).toBeDefined();
      expect(term.definition).toBeDefined();
      expect(term.category).toBeDefined();
      expect(['active', 'deprecated', 'proposed']).toContain(term.status || 'active');
    });
  });

  it('should have consistent category usage @content-integrity', () => {
    const categories = [...new Set(isbdVocabulary.map(term => term.category))];
    
    // Verify expected ISBD categories are present
    expect(categories).toContain('structural');
    expect(categories).toContain('content');
    
    // No empty categories
    categories.forEach(category => {
      expect(category.trim().length).toBeGreaterThan(0);
    });
  });
});
```

## E2E Testing with Playwright

### Site Navigation Testing
```typescript
// e2e/docusaurus/site-navigation.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Docusaurus Site Navigation @e2e @critical @navigation', () => {
  test('should navigate between standards sites @multi-site', async ({ page }) => {
    // Start at portal
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('IFLA Standards');
    
    // Navigate to ISBD
    await page.click('text=ISBD');
    await page.waitForURL('**/isbd/**');
    await expect(page.locator('h1')).toContainText('ISBD');
    
    // Navigate to vocabulary
    await page.click('text=Vocabulary');
    await page.waitForURL('**/vocabulary');
    
    // Verify vocabulary table loads
    await expect(page.locator('[role="table"]')).toBeVisible();
    await expect(page.locator('th:has-text("Term")')).toBeVisible();
  });

  test('should handle vocabulary search and filtering @user-flow @vocabulary', async ({ page }) => {
    await page.goto('/isbd/vocabulary');
    
    // Search functionality
    await page.fill('[aria-label*="Search vocabulary"]', 'Area 0');
    await expect(page.locator('text=Area 0')).toBeVisible();
    await expect(page.locator('text=Area 1')).not.toBeVisible();
    
    // Clear search
    await page.fill('[aria-label*="Search vocabulary"]', '');
    
    // Category filtering
    await page.selectOption('[aria-label*="Category"]', 'structural');
    await expect(page.locator('text=Area 0')).toBeVisible();
    
    // Verify filter persistence
    await page.reload();
    await expect(page.locator('[aria-label*="Category"]')).toHaveValue('structural');
  });

  test('should validate cross-site links @multi-site @content-integrity', async ({ page }) => {
    await page.goto('/isbd/docs/implementation');
    
    // Click link to related standard
    await page.click('text=ISBDM Standard');
    await page.waitForURL('**/isbdm/**');
    
    // Verify landing page
    await expect(page.locator('h1')).toContainText('ISBDM');
    
    // Back to original site
    await page.goBack();
    await expect(page.getByText('implementation')).toBeVisible();
  });

  test('should maintain responsive design @accessibility @user-flow', async ({ page }) => {
    await page.goto('/isbd/vocabulary');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify vocabulary table is scrollable
    const table = page.locator('[role="table"]');
    await expect(table).toBeVisible();
    
    // Verify navigation menu adapts
    const mobileMenu = page.locator('[aria-label="Toggle navigation"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('text=Standards')).toBeVisible();
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(table).toBeVisible();
  });

  test('should be accessible @accessibility @critical', async ({ page }) => {
    await page.goto('/isbd/docs/areas/area-1');
    
    // Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Check ARIA labels
    const searchBox = page.locator('[aria-label*="Search"]');
    if (await searchBox.isVisible()) {
      await expect(searchBox).toHaveAttribute('aria-label');
    }
    
    // Skip link functionality
    await page.keyboard.press('Tab');
    const skipLink = page.locator('text=Skip to main content');
    if (await skipLink.isVisible()) {
      await skipLink.click();
      await expect(page.locator('main')).toBeFocused();
    }
  });
});
```

### Content Validation Testing
```typescript
// e2e/docusaurus/content-validation.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Content Validation @e2e @content-integrity', () => {
  test('should validate all internal links @regression', async ({ page }) => {
    const brokenLinks: string[] = [];
    
    // Collect all internal links
    await page.goto('/');
    const links = await page.locator('a[href^="/"]').all();
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href) {
        const response = await page.request.get(href);
        if (!response.ok()) {
          brokenLinks.push(`${href} (${response.status()})`);
        }
      }
    }
    
    expect(brokenLinks).toHaveLength(0);
  });

  test('should validate vocabulary data integrity @vocabulary @content-integrity', async ({ page }) => {
    await page.goto('/isbd/vocabulary');
    
    // Check for required vocabulary elements
    await expect(page.locator('[role="table"]')).toBeVisible();
    await expect(page.locator('th:has-text("Term")')).toBeVisible();
    await expect(page.locator('th:has-text("Definition")')).toBeVisible();
    await expect(page.locator('th:has-text("Category")')).toBeVisible();
    
    // Verify vocabulary terms are present
    await expect(page.locator('td:has-text("Area")')).toHaveCount({ min: 1 });
    
    // Check for empty cells (data integrity)
    const emptyCells = await page.locator('td:empty').count();
    expect(emptyCells).toBe(0);
  });

  test('should validate SEO metadata @seo @content-integrity', async ({ page }) => {
    await page.goto('/isbd/docs/areas/area-1');
    
    // Check title
    const title = await page.title();
    expect(title).toContain('Area 1');
    expect(title).toContain('ISBD');
    
    // Check meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeLessThan(160);
    
    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
    
    expect(ogTitle).toBeTruthy();
    expect(ogDescription).toBeTruthy();
  });
});
```

## Testing Configuration

### Vitest Configuration
```typescript
// packages/theme/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test-utils/',
        '**/*.test.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
      ],
    },
  },
  resolve: {
    alias: {
      '@ifla/theme': path.resolve(__dirname, './src'),
    },
  },
});
```

### Test Setup
```typescript
// packages/theme/src/test-utils/setup.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure testing library
configure({ testIdAttribute: 'data-testid' });

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Testing Commands

```bash
# Theme component testing
pnpm nx test theme                    # All theme tests
pnpm nx test theme --grep "@unit"     # Unit tests only
pnpm nx test theme --grep "@integration" # Integration tests

# Site-specific testing  
pnpm nx test isbd --grep "@content"   # Content validation
pnpm nx test portal --grep "@navigation" # Navigation tests

# E2E testing
pnpm playwright test --grep "@e2e"   # All E2E tests
pnpm playwright test --grep "@accessibility" # A11y tests
pnpm playwright test --grep "@multi-site" # Cross-site tests

# AI test tagging (required)
pnpm test:tag --staged --provider anthropic # Before commits
pnpm test:tag packages/theme/ --no-dry-run  # Apply to theme package

# Comprehensive testing
pnpm test:comprehensive              # All tests, all sites
pnpm test --grep "@critical"        # Critical path tests only
```

This testing strategy ensures content integrity, component reliability, and excellent user experience across all Docusaurus sites in the IFLA Standards Platform.