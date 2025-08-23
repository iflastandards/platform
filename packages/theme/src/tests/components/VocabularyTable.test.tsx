/**
 * @unit @ui @vocabulary @low-priority
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabularyTable } from '../../components/VocabularyTable';
import { expect, describe, it, vi } from 'vitest';

// Mock the useColorMode hook
vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({
    colorMode: 'light',
  }),
}));

// Mock the useDocusaurusContext hook
vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      customFields: {
        vocabularyDefaults: {
          prefix: 'isbdm',
          startCounter: 1000,
          uriStyle: 'numeric',
          caseStyle: 'kebab-case',
          showFilter: true,
          filterPlaceholder: 'Filter values...',
          showTitle: false,
          showURIs: true,
        },
      },
    },
  }),
}));

describe('VocabularyTable', () => {
  // Test data using the legacy format (RDF.values)
  const sampleLegacyFrontMatter = {
    vocabularyId: '1275',
    title: 'Test Vocabulary',
    prefix: 'isbdm',
    uri: 'http://iflastandards.info/ns/isbdm/values/1275',
    type: 'Vocabulary',
    description: 'This is a test vocabulary',
    scopeNote: 'This is just for testing',
    isDefinedBy: 'http://iflastandards.info/ns/isbdm/values/1275',
    RDF: {
      'rdf:type': ['skos:ConceptScheme'],
      'skos:prefLabel': {
        en: 'Test Vocabulary',
      },
      values: [
        {
          value: 'activity card',
          definition:
            'A unit of extent of unitary structure that is a card to be used as a basis for performing a specific activity.',
          scopeNote:
            'An activity card may be part of a set of cards, and usually embodies a text or a still image.',
        },
        {
          value: 'coin',
          definition:
            'A unit of extent of unitary structure that is an object that is a piece of metal stamped by government authority for use as money.',
        },
      ],
    },
  };

  // Test data using the new format (concepts array)
  const sampleNewFrontMatter = {
    vocabularyId: '1275',
    title: 'Test Vocabulary',
    prefix: 'isbdm',
    uri: 'http://iflastandards.info/ns/isbdm/values/1275',
    type: 'Vocabulary',
    description: 'This is a test vocabulary',
    scopeNote: 'This is just for testing',
    isDefinedBy: 'http://iflastandards.info/ns/isbdm/values/1275',
    concepts: [
      {
        value: 'activity card',
        definition:
          'A unit of extent of unitary structure that is a card to be used as a basis for performing a specific activity.',
        scopeNote:
          'An activity card may be part of a set of cards, and usually embodies a text or a still image.',
      },
      {
        value: 'coin',
        definition:
          'A unit of extent of unitary structure that is an object that is a piece of metal stamped by government authority for use as money.',
      },
    ],
  };

  it('renders using legacy front matter properties (RDF.values)', () => {
    render(<VocabularyTable {...sampleLegacyFrontMatter} />);

    // Title is not shown by default
    expect(screen.getByText('This is a test vocabulary')).toBeInTheDocument();
    expect(screen.getByText('This is just for testing')).toBeInTheDocument();

    expect(screen.getByText('activity card')).toBeInTheDocument();
    expect(
      screen.getByText(
        'A unit of extent of unitary structure that is a card to be used as a basis for performing a specific activity.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'An activity card may be part of a set of cards, and usually embodies a text or a still image.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('coin')).toBeInTheDocument();
  });

  it('renders using new front matter properties (concepts array)', () => {
    render(<VocabularyTable {...sampleNewFrontMatter} />);

    // Title is not shown by default
    expect(screen.getByText('This is a test vocabulary')).toBeInTheDocument();
    expect(screen.getByText('This is just for testing')).toBeInTheDocument();

    expect(screen.getByText('activity card')).toBeInTheDocument();
    expect(
      screen.getByText(
        'A unit of extent of unitary structure that is a card to be used as a basis for performing a specific activity.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'An activity card may be part of a set of cards, and usually embodies a text or a still image.',
      ),
    ).toBeInTheDocument();

    expect(screen.getByText('coin')).toBeInTheDocument();
  });

  it('shows title when showTitle is true', () => {
    render(<VocabularyTable {...sampleNewFrontMatter} showTitle={true} />);

    // Title should be visible when showTitle is true
    expect(screen.getByText('Test Vocabulary')).toBeInTheDocument();
  });

  it('generates numeric URIs with specified startCounter', () => {
    render(
      <VocabularyTable
        {...sampleNewFrontMatter}
        startCounter={2000}
        uriStyle="numeric"
      />,
    );

    expect(screen.getByText('(isbdm:1275#t2000)')).toBeInTheDocument();
    expect(screen.getByText('(isbdm:1275#t2001)')).toBeInTheDocument();
  });

  it('generates kebab-case slug URIs', () => {
    render(
      <VocabularyTable
        {...sampleNewFrontMatter}
        uriStyle="slug"
        caseStyle="kebab-case"
      />,
    );

    expect(screen.getByText('(isbdm:1275#activity-card)')).toBeInTheDocument();
    expect(screen.getByText('(isbdm:1275#coin)')).toBeInTheDocument();
  });

  it('generates snake_case slug URIs', () => {
    render(
      <VocabularyTable
        {...sampleNewFrontMatter}
        uriStyle="slug"
        caseStyle="snake_case"
      />,
    );

    expect(screen.getByText('(isbdm:1275#activity_card)')).toBeInTheDocument();
    expect(screen.getByText('(isbdm:1275#coin)')).toBeInTheDocument();
  });

  it('generates camelCase slug URIs', () => {
    render(
      <VocabularyTable
        {...sampleNewFrontMatter}
        uriStyle="slug"
        caseStyle="camelCase"
      />,
    );

    expect(screen.getByText('(isbdm:1275#activityCard)')).toBeInTheDocument();
    expect(screen.getByText('(isbdm:1275#coin)')).toBeInTheDocument();
  });

  it('generates PascalCase slug URIs', () => {
    render(
      <VocabularyTable
        {...sampleNewFrontMatter}
        uriStyle="slug"
        caseStyle="PascalCase"
      />,
    );

    expect(screen.getByText('(isbdm:1275#ActivityCard)')).toBeInTheDocument();
    expect(screen.getByText('(isbdm:1275#Coin)')).toBeInTheDocument();
  });

  it('adds HTML IDs to rows matching the URI fragment', () => {
    const { container } = render(
      <VocabularyTable
        {...sampleNewFrontMatter}
        uriStyle="slug"
        caseStyle="kebab-case"
      />,
    );

    // Test that there are elements with the expected IDs in the document
    const activityCardRow = container.querySelector('#activity-card');
    const coinRow = container.querySelector('#coin');

    expect(activityCardRow).not.toBeNull();
    expect(coinRow).not.toBeNull();
  });

  it('adds data-concept-id attributes with full URIs', () => {
    const { container } = render(
      <VocabularyTable
        {...sampleNewFrontMatter}
        uriStyle="slug"
        caseStyle="kebab-case"
      />,
    );

    const activityCardRow = container.querySelector(
      '[data-concept-id="isbdm:1275#activity-card"]',
    );
    const coinRow = container.querySelector(
      '[data-concept-id="isbdm:1275#coin"]',
    );

    expect(activityCardRow).not.toBeNull();
    expect(coinRow).not.toBeNull();
  });

  it('handles minimal props', () => {
    const minimalProps = {
      vocabularyId: '1275',
      concepts: [
        {
          value: 'test',
          definition: 'Test definition',
        },
      ],
    };

    render(<VocabularyTable {...minimalProps} />);

    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('Test definition')).toBeInTheDocument();
    expect(screen.getByText('(isbdm:1275#t1000)')).toBeInTheDocument();
  });

  it('shows the filter input by default', () => {
    render(<VocabularyTable {...sampleNewFrontMatter} />);

    const filterInput = screen.getByPlaceholderText('Filter values...');
    expect(filterInput).toBeInTheDocument();
  });

  it('hides the filter input when showFilter is false', () => {
    render(<VocabularyTable {...sampleNewFrontMatter} showFilter={false} />);

    const filterInput = screen.queryByPlaceholderText('Filter values...');
    expect(filterInput).toBeNull();
  });

  it('hides URIs when showURIs is false', () => {
    render(<VocabularyTable {...sampleNewFrontMatter} showURIs={false} />);

    // Make sure the term itself is still visible
    expect(screen.getByText('activity card')).toBeInTheDocument();

    // But the URI should not be visible
    expect(screen.queryByText(/\(isbdm:1275#/)).toBeNull();
  });

  it('shows URIs by default', () => {
    render(<VocabularyTable {...sampleNewFrontMatter} />);

    // The URI should be visible
    expect(screen.getByText('(isbdm:1275#t1000)')).toBeInTheDocument();
  });

  it('filters terms based on input', () => {
    render(<VocabularyTable {...sampleNewFrontMatter} />);

    // Both terms are initially visible
    expect(screen.getByText('activity card')).toBeInTheDocument();
    expect(screen.getByText('coin')).toBeInTheDocument();

    // Filter for "activity"
    const filterInput = screen.getByPlaceholderText('Filter values...');
    fireEvent.change(filterInput, { target: { value: 'activity' } });

    // Now only "activity card" should be visible
    expect(screen.getByText('activity card')).toBeInTheDocument();
    expect(screen.queryByText('coin')).not.toBeInTheDocument();

    // Filter for something not in the list
    fireEvent.change(filterInput, { target: { value: 'xyz' } });

    // Now no terms should be visible
    expect(screen.queryByText('activity card')).not.toBeInTheDocument();
    expect(screen.queryByText('coin')).not.toBeInTheDocument();
    expect(screen.getByText('No matching terms found.')).toBeInTheDocument();

    // Clear the filter
    fireEvent.change(filterInput, { target: { value: '' } });

    // All terms should be visible again
    expect(screen.getByText('activity card')).toBeInTheDocument();
    expect(screen.getByText('coin')).toBeInTheDocument();
  });

  // Test for TOC generation
  it('generates TOC items that match vocabulary values with legacy format', () => {
    const toc = VocabularyTable.generateTOC(sampleLegacyFrontMatter);

    // Check that TOC has the correct structure
    expect(toc).toHaveLength(2);

    // Check first item
    expect(toc[0].value).toBe('activity card');
    expect(toc[0].id).toBe('t1000');
    expect(toc[0].children).toEqual([]);
    expect(toc[0].level).toBe(3); // Check level is set correctly

    // Check second item
    expect(toc[1].value).toBe('coin');
    expect(toc[1].id).toBe('t1001');
    expect(toc[1].children).toEqual([]);
    expect(toc[1].level).toBe(3); // Check level is set correctly
  });

  // Test for TOC generation with new format
  it('generates TOC items that match vocabulary values with new format', () => {
    const toc = VocabularyTable.generateTOC(sampleNewFrontMatter);

    // Check that TOC has the correct structure
    expect(toc).toHaveLength(2);

    // Check first item
    expect(toc[0].value).toBe('activity card');
    expect(toc[0].id).toBe('t1000');
    expect(toc[0].children).toEqual([]);
    expect(toc[0].level).toBe(3); // Check level is set correctly

    // Check second item
    expect(toc[1].value).toBe('coin');
    expect(toc[1].id).toBe('t1001');
    expect(toc[1].children).toEqual([]);
    expect(toc[1].level).toBe(3); // Check level is set correctly
  });

  it('generates TOC with correct IDs based on uri style', () => {
    // Test with slug style
    const slugToc = VocabularyTable.generateTOC({
      ...sampleNewFrontMatter,
      uriStyle: 'slug',
      caseStyle: 'kebab-case',
    });

    expect(slugToc[0].id).toBe('activity-card');
    expect(slugToc[1].id).toBe('coin');

    // Test with different start counter
    const customCounterToc = VocabularyTable.generateTOC({
      ...sampleNewFrontMatter,
      startCounter: 5000,
    });

    expect(customCounterToc[0].id).toBe('t5000');
    expect(customCounterToc[1].id).toBe('t5001');
  });
});
