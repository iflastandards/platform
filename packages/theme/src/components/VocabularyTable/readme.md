# VocabularyTable Component

A comprehensive multilingual vocabulary table component for Docusaurus with CSV import/export capabilities.

## Folder Structure

```
src/components/global/VocabularyTable/
├── index.tsx                     # Main exports and public API
├── VocabularyTable.tsx          # Core component implementation
├── CSVVocabulary.tsx           # CSV wrapper components
├── types.ts                    # TypeScript interfaces and types
├── utils.ts                    # Helper functions and utilities
├── styles.module.scss          # Component styles
├── hooks/                      # Custom React hooks
│   ├── useCsvLoader.ts        # CSV file loading logic
│   └── useMultilingualText.ts # Multilingual text processing
├── __tests__/                 # Test files
│   ├── VocabularyTable.test.tsx
│   ├── VocabularyTableMultilingual.test.tsx
│   ├── VocabularyTableDefaults.test.tsx
│   ├── VocabularyTableNoDefaults.test.tsx
│   └── VocabularyTableRealExamples.test.tsx
└── README.md                  # This file
```

## Key Files

### `index.tsx`
Main export file providing the public API. Import the component from this file:

```typescript
import VocabularyTable, { 
  CSVVocabulary, 
  VocabularyTableProps 
} from '@site/src/components/global/VocabularyTable';
```

### `VocabularyTable.tsx`
Core component implementation with all the main functionality:
- Multilingual content support
- CSV file loading
- Locale-aware language detection
- Filtering and search
- Expandable details
- URI generation

### `CSVVocabulary.tsx`
Simplified wrapper components for CSV-only usage:
- `CSVVocabulary` - React component wrapper

---

## Testing VocabularyTable

### Unit Testing

```bash
# Run VocabularyTable tests
nx test theme
pnpm test packages/theme/src/tests/components/VocabularyTable/
```

#### Test Structure
- **Location**: `packages/theme/src/tests/components/VocabularyTable/`
- **Framework**: Vitest + React Testing Library
- **Coverage**: Component rendering, props handling, CSV data loading, user interactions

#### Key Test Patterns

##### Basic Rendering Test
```typescript
// Test basic component rendering
<VocabularyTable 
  csvFile="/data/CSV/sensory-test.csv"
  title="Basic Vocabulary Table"
  showTitle={true}
/>
```

##### CSV Data Mocking
```typescript
// Mock fetch for consistent test data
const mockCSVContent = `uri,skos:prefLabel@en,skos:prefLabel@fr,skos:definition@en[0]
sensoryspec:T1001,aural,auditif,"Content intended for hearing"`;

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve(mockCSVContent)
  })
) as any;
```

##### Search and Filter Testing
```typescript
// Test search functionality
const searchInput = screen.getByPlaceholderText(/Filter values/i);
fireEvent.change(searchInput, { target: { value: 'aural' } });

await waitFor(() => {
  expect(screen.getByText('aural')).toBeInTheDocument();
  expect(screen.queryByText('gustatory')).not.toBeInTheDocument();
});
```

##### Language Switching Testing
```typescript
// Test multilingual support
await waitFor(() => {
  expect(screen.getByText('aural')).toBeInTheDocument(); // English default
});

const frenchTab = screen.getByRole('tab', { name: /Français/i });
fireEvent.click(frenchTab);

await waitFor(() => {
  expect(screen.getByText('auditif')).toBeInTheDocument(); // French
});
```

### Integration Testing in Documentation Sites

When using VocabularyTable in documentation sites (e.g., ISBDM), create integration tests:

```typescript
// standards/ISBDM/docs/examples/__tests__/sensory-vocabulary-integration.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import VocabularyTable from '@ifla/theme/components/VocabularyTable';

describe('Sensory Vocabulary Integration', () => {
  it('loads and displays vocabulary data', async () => {
    render(
      <VocabularyTable 
        csvFile="/data/CSV/sensory-test.csv"
        title="Sensory Test Vocabulary"
        showTitle={true}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('aural')).toBeInTheDocument();
    });
  });
});
```

### E2E Testing

For complete user workflow testing with Playwright:

```bash
# Run E2E tests
nx e2e isbdm
npx playwright test e2e/vocabulary-functionality.spec.ts
```

#### E2E Test Patterns

##### Page Loading
```typescript
test('should load vocabulary page', async ({ page }) => {
  await page.goto('/docs/examples/sensory-test-vocabulary/');
  await page.waitForLoadState('networkidle');
  
  await expect(page.locator('h1')).toContainText('Sensory Specification');
  await expect(page.locator('text=aural')).toBeVisible();
});
```

##### Interactive Elements
```typescript
test('should filter vocabulary terms', async ({ page }) => {
  const searchInput = page.locator('input[placeholder*="Filter"]').first();
  await searchInput.fill('aural');
  
  await expect(page.locator('text=aural')).toBeVisible();
  await expect(page.locator('text=gustatory')).not.toBeVisible();
});
```

##### Language Interface
```typescript
test('should switch between languages', async ({ page }) => {
  const frenchTab = page.locator('button:has-text("FR")');
  await frenchTab.click();
  await expect(page.locator('text=auditif')).toBeVisible();
});
```

### Test Data Structure

Expected CSV format for testing:
```csv
uri,rdf:type,skos:prefLabel@en,skos:prefLabel@fr,skos:definition@en[0]
sensoryspec:T1001,skos:Concept,aural,auditif,"Content for hearing"
```

### Common Test Cases

1. **Basic Rendering**: Component mounts, title displays, data loads
2. **Search/Filter**: Input works, results filter correctly, no results message
3. **Multilingual**: Language tabs work, content switches properly
4. **Error Handling**: Network errors, malformed data, empty states
5. **Accessibility**: ARIA labels, keyboard navigation, screen reader support
6. **Performance**: Load times, responsive design, multiple filters

### Debugging Tips

#### Unit Tests
- Use `screen.debug()` to see rendered HTML
- Check console for CSV parsing warnings
- Verify fetch mocks are properly set up
- Use longer timeouts for async operations

#### E2E Tests
- Run with `--headed` flag to see browser
- Use `await page.pause()` to inspect state
- Check network tab for CSV loading issues
- Verify correct localhost port

### Best Practices

1. **Always wait for data loading** before testing interactions
2. **Use specific selectors** rather than generic text matches
3. **Test error states** as well as happy paths
4. **Mock external dependencies** (CSV files) for consistent tests
5. **Test accessibility features** with proper ARIA checks
6. **Include performance tests** for loading times
7. **Test responsive design** with different viewport sizes
- `VocabularyTableFromCSV` - Function-based wrapper

### `types.ts`
All TypeScript interfaces and type definitions:
- `VocabularyTableProps` - Main component props
- `ConceptProps` - Individual concept/term structure
- `MultilingualText` - Multilingual content type
- `LanguageConfig` - Language configuration
- `CSVConceptRow` - CSV data structure

### `utils.ts`
Helper functions and utilities:
- `getLocalizedText()` - Extract text in specific language
- `parseCSVToConcepts()` - Convert CSV data to concepts
- `createSlug()` - Generate URI slugs
- `extractAvailableLanguages()` - Detect languages from data
- `generateTOCFromProps()` - Generate table of contents
- `exportToCSV()` - Export vocabulary to CSV format

### `hooks/useCsvLoader.ts`
Custom hook for loading CSV files:
- Handles fetch operations
- Parses CSV with Papa Parse
- Manages loading and error states
- Returns parsed data

### `hooks/useMultilingualText.ts`
Custom hook for multilingual text processing:
- Localizes all concepts to current language
- Detects available languages
- Provides language display name function
- Manages language fallbacks

## Usage Examples

### Basic Usage
```tsx
import VocabularyTable from '@site/src/components/global/VocabularyTable';

<VocabularyTable 
  vocabularyId="my-vocab"
  title="My Vocabulary"
  description="A sample vocabulary"
  concepts={[
    {
      value: "term1",
      definition: "Definition of term 1"
    }
  ]}
/>
```

### CSV File Usage
```tsx
import VocabularyTable from '@site/src/components/global/VocabularyTable';

// Ultra-simple CSV usage
<VocabularyTable csvFile="vocabularies/csv/terms.csv" />

// With custom configuration
<VocabularyTable 
  csvFile="vocabularies/csv/terms.csv"
  showTitle={true}
  showURIs={false}
/>
```

### Multilingual Usage
```tsx
<VocabularyTable 
  vocabularyId="multilingual-vocab"
  title={{
    en: "English Title",
    fr: "Titre français",
    es: "Título español"
  }}
  description={{
    en: "English description",
    fr: "Description française",
    es: "Descripción española"
  }}
  concepts={[
    {
      value: {
        en: "term",
        fr: "terme",
        es: "término"
      },
      definition: {
        en: "English definition",
        fr: "Définition française",
        es: "Definición española"
      }
    }
  ]}
/>
```

### Using CSV Wrapper
```tsx
import { CSVVocabulary } from '@site/src/components/global/VocabularyTable';

<CSVVocabulary 
  csvFile="vocabularies/csv/terms.csv"
  title="CSV Vocabulary"
  showURIs={false}
/>
```

## Testing

The component includes comprehensive test coverage:

```bash
# Run all tests
npm test VocabularyTable

# Run specific test file
npm test VocabularyTable.test.tsx

# Run tests in watch mode
npm test VocabularyTable -- --watch
```

### Test Files
- `VocabularyTable.test.tsx` - Basic functionality tests
- `VocabularyTableMultilingual.test.tsx` - Multilingual feature tests
- `VocabularyTableDefaults.test.tsx` - Site config defaults tests
- `VocabularyTableNoDefaults.test.tsx` - Fallback behavior tests
- `VocabularyTableRealExamples.test.tsx` - Real-world usage tests

## Development

### Adding New Features

1. **Add types to `types.ts`** if new interfaces are needed
2. **Add utilities to `utils.ts`** for reusable logic
3. **Create custom hooks in `hooks/`** for complex state management
4. **Update main component in `VocabularyTable.tsx`**
5. **Add tests in `__tests__/`** for new functionality
6. **Update exports in `index.tsx`** if new public APIs are added

### Modifying Styles

All styles are in `styles.module.scss` using CSS Modules:
- Follow BEM naming convention
- Include dark mode support with `[data-theme='dark']`
- Add responsive breakpoints as needed
- Include RTL support for right-to-left languages

### Custom Hooks

The component uses custom hooks for better separation of concerns:
- `useCsvLoader` - Handles all CSV file operations
- `useMultilingualText` - Manages multilingual content processing

You can create additional hooks in the `hooks/` directory for new functionality.

## Migration from Previous Version

### If upgrading from the single-file version:

1. **Update imports:**
   ```typescript
   // Old
   import VocabularyTable from '@site/src/components/global/VocabularyTable';
   
   // New (same - no change needed!)
   import VocabularyTable from '@site/src/components/global/VocabularyTable';
   ```

2. **All existing props work the same** - no breaking changes
3. **New features are automatically available** - CSV loading, multilingual support, etc.

### Benefits of New Structure

- **Better maintainability** - Code is organized into logical modules
- **Easier testing** - Each piece can be tested independently
- **Better performance** - Custom hooks optimize re-renders
- **More extensible** - Easy to add new features without bloating main component
- **Better TypeScript support** - Dedicated types file with comprehensive interfaces
- **Reusable utilities** - Helper functions can be used in other components

## Configuration

The component respects Docusaurus site configuration:

```typescript
// docusaurus.config.ts
export default {
  customFields: {
    vocabularyDefaults: {
      prefix: "isbdm",
      startCounter: 1000,
      uriStyle: "numeric",
      caseStyle: "kebab-case",
      showFilter: true,
      filterPlaceholder: "Filter vocabulary terms...",
      showTitle: false,
      showLanguageSelector: true,
      defaultLanguage: "en",
      availableLanguages: ["en", "fr", "es", "de"]
    }
  }
};
```

All these defaults can be overridden on a per-component basis via props.
