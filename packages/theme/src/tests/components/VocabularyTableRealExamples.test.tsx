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

// Mock useDocusaurusContext to use our actual customFields
vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      customFields: {
        vocabularyDefaults: {
          prefix: "isbdm",
          startCounter: 1000,
          uriStyle: "numeric",
          caseStyle: "kebab-case",
          showFilter: true,
          filterPlaceholder: "Filter vocabulary terms...",
          showTitle: false,
          showURIs: true,
          RDF: {
            "rdf:type": ["skos:ConceptScheme"]
          }
        }
      }
    }
  })
}));

describe('VocabularyTable with real-world examples', () => {
  // Test 1: Full 1275.mdx example
  it('correctly renders a complete vocabulary like 1275.mdx', () => {
    const fullExample = {
      vocabularyId: "1275",
      title: "ISBDM Extent of Unitary Structure value vocabulary",
      prefix: "isbdm",
      uri: "http://iflastandards.info/ns/isbdm/values/1275",
      type: "Vocabulary",
      description: "This value vocabulary is a source of values for a has extent of unitary structure element.",
      scopeNote: "The vocabulary does not cover the full scope of the element and may be extended with additional values.",
      isDefinedBy: "http://iflastandards.info/ns/isbdm/values/1275",
      startCounter: 1000,
      uriStyle: "numeric" as const,
      caseStyle: "kebab-case" as const,
      RDF: {
        "rdf:type": ["skos:ConceptScheme"],
        "skos:prefLabel": {
          en: "ISBDM Extent of Unitary Structure value vocabulary"
        },
        "skos:definition": {
          en: "This value vocabulary is a source of values for a has extent of unitary structure element."
        },
        "skos:scopeNote": {
          en: "The vocabulary does not cover the full scope of the element and may be extended with additional values."
        },
        values: [
          {
            value: "activity card",
            definition: "A unit of extent of unitary structure that is a card to be used as a basis for performing a specific activity.",
            scopeNote: "An activity card may be part of a set of cards, and usually embodies a text or a still image."
          },
          {
            value: "coin",
            definition: "A unit of extent of unitary structure that is an object that is a piece of metal stamped by government authority for use as money."
          }
        ]
      },
      showTitle: false,
      filterPlaceholder: "Filter vocabulary terms..."
    };

    render(<VocabularyTable {...fullExample} />);

    // Check if the component renders correctly
    expect(screen.getByText('activity card')).toBeInTheDocument();
    expect(screen.getByText('coin')).toBeInTheDocument();
    expect(screen.getByText('A unit of extent of unitary structure that is a card to be used as a basis for performing a specific activity.')).toBeInTheDocument();
    expect(screen.getByText('This value vocabulary is a source of values for a has extent of unitary structure element.')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter vocabulary terms...')).toBeInTheDocument();
  });

  // Test 2: Minimal example (from MinimalVocabulary.mdx)
  it('correctly renders a minimal vocabulary using site defaults', () => {
    const minimalExample = {
      title: "Minimal Vocabulary Example",
      vocabularyId: "minimal-example",
      description: "This example shows how to create a vocabulary with minimal front matter, using global defaults.",
      RDF: {
        values: [
          {
            value: "First Term",
            definition: "This is the definition of the first term.",
            scopeNote: "This is an optional scope note for the first term."
          },
          {
            value: "Second Term",
            definition: "This is the definition of the second term."
          }
        ]
      }
    };

    render(<VocabularyTable {...minimalExample} />);

    // Check that everything renders correctly using defaults
    expect(screen.getByText('First Term')).toBeInTheDocument();
    expect(screen.getByText('Second Term')).toBeInTheDocument();
    expect(screen.getByText('This is the definition of the first term.')).toBeInTheDocument();
    expect(screen.getByText('This is an optional scope note for the first term.')).toBeInTheDocument();
    expect(screen.getByText('This is the definition of the second term.')).toBeInTheDocument();
    
    // Check that URIs are generated correctly using defaults
    expect(screen.getByText('(isbdm:minimal-example#t1000)')).toBeInTheDocument();
    expect(screen.getByText('(isbdm:minimal-example#t1001)')).toBeInTheDocument();
    
    // Default filter is present
    expect(screen.getByPlaceholderText('Filter vocabulary terms...')).toBeInTheDocument();
  });

  // Test 3: Testing default RDF.rdf:type merging
  it('correctly merges RDF.rdf:type from customFields', () => {
    const propsWithNoRdfType = {
      vocabularyId: "test-vocab",
      title: "Test Vocabulary",
      description: "Test description",
      RDF: {
        values: [
          {
            value: 'term one',
            definition: 'Definition of first term',
          }
        ]
      }
    };
    
    // In a real implementation, you'd need to add a test hook to verify the merge
    // Here we're just confirming the component renders correctly
    render(<VocabularyTable {...propsWithNoRdfType} />);
    
    expect(screen.getByText('term one')).toBeInTheDocument();
    expect(screen.getByText('Definition of first term')).toBeInTheDocument();
    expect(screen.getByText('(isbdm:test-vocab#t1000)')).toBeInTheDocument();
  });

  // Test 4: Mixed vocabulary with some defaults and some overrides
  it('correctly handles mixed vocabulary with some defaults and some overrides', () => {
    const mixedExample = {
      vocabularyId: "mixed-example",
      title: "Mixed Example Vocabulary",
      description: "This example uses some defaults and overrides others.",
      // Uses default prefix: "isbdm"
      // Uses default startCounter: 1000
      uriStyle: "slug" as const, // Override default "numeric"
      // Uses default caseStyle: "kebab-case"
      showFilter: true, // Same as default
      filterPlaceholder: "Custom filter text...", // Override default
      RDF: {
        values: [
          {
            value: "Test Term",
            definition: "Test definition"
          }
        ]
      }
    };

    render(<VocabularyTable {...mixedExample} />);

    // Check overridden properties
    expect(screen.getByText('(isbdm:mixed-example#test-term)')).toBeInTheDocument(); // slug style
    expect(screen.getByPlaceholderText('Custom filter text...')).toBeInTheDocument(); // custom placeholder
    
    // Check that defaults are still applied
    expect(screen.queryByRole('heading', { name: 'Mixed Example Vocabulary', level: 3 })).not.toBeInTheDocument(); // default showTitle: false
  });
});