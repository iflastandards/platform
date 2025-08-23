/**
 * @unit @ui @vocabulary @low-priority
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { VocabularyTable } from '../../components/VocabularyTable';
import { expect, describe, it, vi } from 'vitest';

// Mock the useColorMode hook
vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({
    colorMode: 'light',
  }),
}));

// Mock useDocusaurusContext to simulate no customFields
vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      // No customFields at all
    }
  })
}));

describe('VocabularyTable with no customFields defaults', () => {
  const minimalProps = {
    vocabularyId: 'test-vocab',
    title: 'Test Vocabulary',
    description: 'Test description',
    RDF: {
      values: [
        {
          value: 'term one',
          definition: 'Definition of first term',
        },
        {
          value: 'term two',
          definition: 'Definition of second term',
          scopeNote: 'Scope note for second term',
        }
      ]
    }
  };

  // Test 1: Falls back to hardcoded defaults
  it('falls back to hardcoded defaults when no customFields are available', () => {
    render(<VocabularyTable {...minimalProps} />);

    // Check if hardcoded defaults are used
    // Default prefix is 'isbdm'
    expect(screen.getByText('(isbdm:test-vocab#t1000)')).toBeInTheDocument();
    
    // Default startCounter is 1000
    expect(screen.getByText('(isbdm:test-vocab#t1000)')).toBeInTheDocument();
    expect(screen.getByText('(isbdm:test-vocab#t1001)')).toBeInTheDocument();
    
    // Default placeholder is 'Filter values...'
    expect(screen.getByPlaceholderText('Filter values...')).toBeInTheDocument();
    
    // Default showTitle is false
    expect(screen.queryByRole('heading', { name: 'Test Vocabulary', level: 3 })).not.toBeInTheDocument();
  });

  // Test 2: Property overrides still work without customFields
  it('correctly applies overrides even without customFields', () => {
    render(
      <VocabularyTable 
        {...minimalProps} 
        prefix="custom-prefix"
        startCounter={5000}
        uriStyle="slug"
        caseStyle="PascalCase"
        showFilter={false}
        showTitle={true}
        showURIs={true}
      />
    );

    // All overrides should still work
    expect(screen.getByText('(custom-prefix:test-vocab#TermOne)')).toBeInTheDocument();
    expect(screen.getByText('(custom-prefix:test-vocab#TermTwo)')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Filter values...')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Test Vocabulary', level: 3 })).toBeInTheDocument();
  });

  // Test 3: generateTOC with no context
  it('generateTOC falls back to hardcoded defaults when no window.__DOCUSAURUS__ is available', () => {
    // Ensure window.__DOCUSAURUS__ is undefined for this test
    if (typeof window !== 'undefined') {
      delete window.__DOCUSAURUS__;
    }
    
    const toc = VocabularyTable.generateTOC(minimalProps);
    
    // Should use the hardcoded defaults (startCounter: 1000)
    expect(toc[0].id).toBe('t1000');
    expect(toc[1].id).toBe('t1001');
  });
});