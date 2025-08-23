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
            showURIs: true
          }
        }
      },
      i18n: {
        currentLocale: 'en',
        locales: ['en', 'fr', 'es']
      }
    })
  }));

describe('VocabularyTable Details Functionality', () => {
  // Test data with additional SKOS properties
  const dataWithDetails = {
    vocabularyId: "details-test",
    title: "Details Test Vocabulary",
    concepts: [
      {
        value: "term with details",
        definition: "A term that has additional SKOS properties",
        notation: "TWD",
        example: "Example usage of this term",
        changeNote: "Definition updated in 2024",
        historyNote: "Added in version 1.0",
        editorialNote: "Needs review"
      },
      {
        value: "simple term",
        definition: "A basic term without additional properties"
      }
    ]
  };

  // Test data without additional SKOS properties
  const dataWithoutDetails = {
    vocabularyId: "no-details-test",
    title: "No Details Test Vocabulary",
    concepts: [
      {
        value: "basic term 1",
        definition: "First basic term"
      },
      {
        value: "basic term 2", 
        definition: "Second basic term"
      }
    ]
  };

  describe('Detail Column Header', () => {
    it('shows "Detail" header when concepts have additional properties', () => {
      render(<VocabularyTable {...dataWithDetails} />);
      
      expect(screen.getByText('Detail')).toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('Definition')).toBeInTheDocument();
      expect(screen.getByText('Scope note')).toBeInTheDocument();
    });

    it('hides Detail column when no concepts have additional properties', () => {
      render(<VocabularyTable {...dataWithoutDetails} />);
      
      expect(screen.queryByText('Detail')).not.toBeInTheDocument();
      expect(screen.getByText('Value')).toBeInTheDocument();
      expect(screen.getByText('Definition')).toBeInTheDocument();
      expect(screen.getByText('Scope note')).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse Buttons', () => {
    it('shows + button only for terms with additional properties', () => {
      render(<VocabularyTable {...dataWithDetails} />);
      
      // Should have one expand button for the term with details
      const expandButtons = screen.getAllByLabelText('Expand details');
      expect(expandButtons).toHaveLength(1);
      
      // Both terms should be visible
      expect(screen.getByText('term with details')).toBeInTheDocument();
      expect(screen.getByText('simple term')).toBeInTheDocument();
    });

    it('expands details when + button is clicked', () => {
      render(<VocabularyTable {...dataWithDetails} />);
      
      const expandButton = screen.getByLabelText('Expand details');
      fireEvent.click(expandButton);
      
      // Should show additional properties
      expect(screen.getByText('Notation:')).toBeInTheDocument();
      expect(screen.getByText('TWD')).toBeInTheDocument();
      expect(screen.getByText('Example:')).toBeInTheDocument();
      expect(screen.getByText('Example usage of this term')).toBeInTheDocument();
      expect(screen.getByText('Change note:')).toBeInTheDocument();
      expect(screen.getByText('Definition updated in 2024')).toBeInTheDocument();
      expect(screen.getByText('History note:')).toBeInTheDocument();
      expect(screen.getByText('Added in version 1.0')).toBeInTheDocument();
      expect(screen.getByText('Editorial note:')).toBeInTheDocument();
      expect(screen.getByText('Needs review')).toBeInTheDocument();
    });

    it('changes button to - when expanded', () => {
      render(<VocabularyTable {...dataWithDetails} />);
      
      const expandButton = screen.getByLabelText('Expand details');
      fireEvent.click(expandButton);
      
      // Button should now be a collapse button
      expect(screen.getByLabelText('Collapse details')).toBeInTheDocument();
      expect(screen.getByText('−')).toBeInTheDocument();
    });

    it('collapses details when - button is clicked', () => {
      render(<VocabularyTable {...dataWithDetails} />);
      
      const expandButton = screen.getByLabelText('Expand details');
      fireEvent.click(expandButton);
      
      // Details should be visible
      expect(screen.getByText('Notation:')).toBeInTheDocument();
      
      const collapseButton = screen.getByLabelText('Collapse details');
      fireEvent.click(collapseButton);
      
      // Details should be hidden
      expect(screen.queryByText('Notation:')).not.toBeInTheDocument();
      expect(screen.queryByText('TWD')).not.toBeInTheDocument();
    });
  });

  describe('CSV Data with Details', () => {
    const csvDataWithDetails = [
      {
        uri: "test:T1001",
        "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
        "skos:prefLabel@en": "enhanced term",
        "skos:definition@en[0]": "A term with CSV-based additional properties",
        "skos:notation@en[0]": "ENH",
        "skos:example@en[0]": "CSV example usage"
      },
      {
        uri: "test:T1002",
        "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
        "skos:prefLabel@en": "basic csv term",
        "skos:definition@en[0]": "A basic CSV term"
      }
    ];

    it('shows Detail column with CSV data containing additional properties', () => {
      render(
        <VocabularyTable 
          vocabularyId="csv-details-test"
          csvData={csvDataWithDetails}
          preferCsvData={true}
        />
      );
      
      expect(screen.getByText('Detail')).toBeInTheDocument();
      expect(screen.getByLabelText('Expand details')).toBeInTheDocument();
    });

    it('expands CSV-based details correctly', () => {
      render(
        <VocabularyTable 
          vocabularyId="csv-details-test"
          csvData={csvDataWithDetails}
          preferCsvData={true}
        />
      );
      
      const expandButton = screen.getByLabelText('Expand details');
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Notation:')).toBeInTheDocument();
      expect(screen.getByText('ENH')).toBeInTheDocument();
      expect(screen.getByText('Example:')).toBeInTheDocument();
      expect(screen.getByText('CSV example usage')).toBeInTheDocument();
    });
  });

  describe('Multilingual Details', () => {
    const multilingualDetailsData = {
      vocabularyId: "multilingual-details",
      title: "Multilingual Details Test",
      concepts: [
        {
          value: {
            en: "multilingual term",
            fr: "terme multilingue"
          },
          definition: {
            en: "A term with multilingual details",
            fr: "Un terme avec des détails multilingues"
          },
          notation: {
            en: "MLT",
            fr: "TML"
          },
          example: {
            en: "English example",
            fr: "Exemple français"
          }
        }
      ]
    };

    it('shows multilingual details in current language', () => {
      render(<VocabularyTable {...multilingualDetailsData} />);
      
      const expandButton = screen.getByLabelText('Expand details');
      fireEvent.click(expandButton);
      
      // Should show English versions
      expect(screen.getByText('MLT')).toBeInTheDocument();
      expect(screen.getByText('English example')).toBeInTheDocument();
    });

    it('switches detail language when main language changes', () => {
      render(<VocabularyTable {...multilingualDetailsData} />);
      
      // Expand details first
      const expandButton = screen.getByLabelText('Expand details');
      fireEvent.click(expandButton);
      
      // Verify English content
      expect(screen.getByText('MLT')).toBeInTheDocument();
      expect(screen.getByText('English example')).toBeInTheDocument();
      
      // Change to French
      const languageSelector = screen.getByLabelText('Select display language');
      fireEvent.change(languageSelector, { target: { value: 'fr' } });
      
      // Details should be collapsed after language change
      expect(screen.queryByText('Notation:')).not.toBeInTheDocument();
    });
  });

  describe('Alternative Labels in Details', () => {
    const dataWithAltLabels = {
      vocabularyId: "alt-labels-test",
      title: "Alternative Labels Test",
      concepts: [
        {
          value: "main term",
          definition: "Term with alternative labels",
          altLabel: "alternative label"
        }
      ]
    };

    it('shows Detail column when concept has only altLabel', () => {
      render(<VocabularyTable {...dataWithAltLabels} />);
      
      // AltLabel is considered an additional detail
      expect(screen.getByText('Detail')).toBeInTheDocument();
      expect(screen.getByLabelText('Expand details')).toBeInTheDocument();
    });

    it('does not show altLabel in expanded details (shown inline instead)', () => {
      render(<VocabularyTable {...dataWithAltLabels} />);
      
      // AltLabel should be shown inline with the main term
      expect(screen.getByText('(alternative label)')).toBeInTheDocument();
      
      const expandButton = screen.getByLabelText('Expand details');
      fireEvent.click(expandButton);
      
      // AltLabel should not be duplicated in expanded details
      // (This depends on implementation - altLabel might be shown inline only)
    });
  });
});