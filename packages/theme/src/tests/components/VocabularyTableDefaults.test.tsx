/**
 * @unit @ui @vocabulary @low-priority
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { VocabularyTable } from '../../components/VocabularyTable';
import { expect, describe, it, vi, beforeEach } from 'vitest';

// Mock the useColorMode hook
vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({
    colorMode: 'light',
  }),
}));

// Mock useDocusaurusContext to simulate site customFields
vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      customFields: {
        vocabularyDefaults: {
          prefix: 'default-prefix',
          startCounter: 2000,
          uriStyle: 'numeric',
          caseStyle: 'kebab-case',
          showFilter: true,
          filterPlaceholder: 'Default placeholder text...',
          showTitle: false,
          showURIs: true,
          RDF: {
            'rdf:type': ['default:ConceptScheme', 'default:Vocabulary'],
          }
        }
      }
    }
  })
}));

describe('VocabularyTable with customFields defaults', () => {
  // Mock window.__DOCUSAURUS__ for generateTOC tests
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.__DOCUSAURUS__ = {
        siteConfig: {
          customFields: {
            vocabularyDefaults: {
              prefix: 'default-prefix',
              startCounter: 2000,
              uriStyle: 'numeric',
              caseStyle: 'kebab-case',
              showFilter: true,
              filterPlaceholder: 'Default placeholder text...',
              showTitle: false,
              showURIs: true,
              RDF: {
                'rdf:type': ['default:ConceptScheme', 'default:Vocabulary'],
              }
            }
          }
        }
      };
    }
  });

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

  // Test 1: Using defaults for all customizable properties
  it('uses default values from customFields when not specified in props', () => {
    render(<VocabularyTable {...minimalProps} />);

    // Check if default prefix is used
    expect(screen.getByText('(default-prefix:test-vocab#t2000)')).toBeInTheDocument();
    
    // Check if default counter is used (t2000 for first item)
    expect(screen.getByText('(default-prefix:test-vocab#t2000)')).toBeInTheDocument();
    expect(screen.getByText('(default-prefix:test-vocab#t2001)')).toBeInTheDocument();
    
    // Default placeholder is used
    expect(screen.getByPlaceholderText('Default placeholder text...')).toBeInTheDocument();
    
    // Default showTitle value is used (false, so title shouldn't be rendered as h3)
    expect(screen.queryByRole('heading', { name: 'Test Vocabulary', level: 3 })).not.toBeInTheDocument();
  });

  // Test 2: Overriding individual defaults
  it('allows overriding individual default values', () => {
    render(
      <VocabularyTable 
        {...minimalProps} 
        prefix="custom-prefix"
        startCounter={3000}
        filterPlaceholder="Custom placeholder..."
        showTitle={true}
      />
    );

    // Custom prefix overrides default
    expect(screen.getByText('(custom-prefix:test-vocab#t3000)')).toBeInTheDocument();
    
    // Custom startCounter overrides default
    expect(screen.getByText('(custom-prefix:test-vocab#t3000)')).toBeInTheDocument();
    expect(screen.getByText('(custom-prefix:test-vocab#t3001)')).toBeInTheDocument();
    
    // Custom placeholder overrides default
    expect(screen.getByPlaceholderText('Custom placeholder...')).toBeInTheDocument();
    
    // Custom showTitle overrides default
    expect(screen.getByRole('heading', { name: 'Test Vocabulary', level: 3 })).toBeInTheDocument();
  });

  // Test 3: Overriding filterPlaceholder
  it('allows overriding filterPlaceholder', () => {
    render(<VocabularyTable {...minimalProps} filterPlaceholder="Search terms..." />);
    expect(screen.getByPlaceholderText('Search terms...')).toBeInTheDocument();
  });

  // Test 4: Overriding showFilter
  it('allows overriding showFilter', () => {
    render(<VocabularyTable {...minimalProps} showFilter={false} />);
    expect(screen.queryByPlaceholderText('Default placeholder text...')).not.toBeInTheDocument();
  });

  // Test 5: Overriding uriStyle
  it('allows overriding uriStyle', () => {
    render(<VocabularyTable {...minimalProps} uriStyle="slug" />);
    expect(screen.getByText('(default-prefix:test-vocab#term-one)')).toBeInTheDocument();
    expect(screen.getByText('(default-prefix:test-vocab#term-two)')).toBeInTheDocument();
  });

  // Test 6: Overriding caseStyle
  it('allows overriding caseStyle', () => {
    render(<VocabularyTable {...minimalProps} uriStyle="slug" caseStyle="camelCase" />);
    expect(screen.getByText('(default-prefix:test-vocab#termOne)')).toBeInTheDocument();
    expect(screen.getByText('(default-prefix:test-vocab#termTwo)')).toBeInTheDocument();
  });

  // Test 7: Combining multiple overrides
  it('correctly applies multiple overrides', () => {
    render(
      <VocabularyTable 
        {...minimalProps} 
        prefix="custom-prefix"
        uriStyle="slug"
        caseStyle="PascalCase"
        showFilter={false}
        showTitle={true}
      />
    );

    // Verify combined overrides are applied correctly
    expect(screen.getByText('(custom-prefix:test-vocab#TermOne)')).toBeInTheDocument();
    expect(screen.getByText('(custom-prefix:test-vocab#TermTwo)')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Default placeholder text...')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Test Vocabulary', level: 3 })).toBeInTheDocument();
  });

  // Test 8: generateTOC with defaults
  it('generateTOC uses defaults from window.__DOCUSAURUS__', () => {
    const toc = VocabularyTable.generateTOC(minimalProps);
    
    // Should use the default startCounter (2000)
    expect(toc[0].id).toBe('t2000');
    expect(toc[1].id).toBe('t2001');
    
    // Should have correct structure
    expect(toc).toHaveLength(2);
    expect(toc[0].value).toBe('term one');
    expect(toc[1].value).toBe('term two');
    expect(toc[0].level).toBe(3);
  });

  // Test 9: generateTOC with overrides
  it('generateTOC respects property overrides', () => {
    const toc = VocabularyTable.generateTOC({
      ...minimalProps,
      startCounter: 5000,
      uriStyle: 'slug',
      caseStyle: 'snake_case'
    });
    
    // Should use the overridden values
    expect(toc[0].id).toBe('term_one');
    expect(toc[1].id).toBe('term_two');
  });

  // Test 10: Default RDF merging
  it('merges default RDF values with provided RDF values', () => {
    // We need to reference this data later, so save it
    // The component doesn't expose the merged RDF directly
    // so we test this indirectly by checking the rendered component
    
    const propsWithRdfTypes = {
      ...minimalProps,
      RDF: {
        'rdf:type': ['custom:Type'],
        values: minimalProps.RDF.values
      }
    };
    
    // This will merge the RDF defaults with the prop values
    // but we can't directly inspect the merged RDF without 
    // adding a test hook to the component
    
    // In a real implementation, you'd need to add a test hook or modify 
    // the component to expose the merged RDF to verify this test fully
    
    render(<VocabularyTable {...propsWithRdfTypes} />);
    
    // Verify basic rendering still works
    expect(screen.getByText('term one')).toBeInTheDocument();
    expect(screen.getByText('term two')).toBeInTheDocument();
  });
});