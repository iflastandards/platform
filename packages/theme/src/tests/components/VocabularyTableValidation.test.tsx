/**
 * @unit @ui @vocabulary @validation @low-priority
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

describe('VocabularyTable CSV Validation', () => {
  describe('Duplicate Column Detection', () => {
    it('shows error for true duplicate column headers', () => {
      const csvDataWithDuplicates = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term1",
          "skos:prefLabel@fr": "terme1",
          "skos:definition@en[0]": "Definition 1"
        }
      ];
      
      // Add a true duplicate by manipulating the data
      // Note: In real CSV, this would be two columns with the same header
      // For testing, we'll use a non-repeatable property with array notation
      csvDataWithDuplicates[0]["rdf:type[0]"] = "http://www.w3.org/2004/02/skos/core#Concept";
      csvDataWithDuplicates[0]["rdf:type[1]"] = "skos:Concept";

      render(
        <VocabularyTable 
          vocabularyId="duplicate-test"
          csvData={csvDataWithDuplicates}
          preferCsvData={true}
        />
      );

      // Check for error badge instead of direct text
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      
      // Expand the details to see the errors
      fireEvent.click(errorBadge);
      
      expect(screen.getByText(/Property "rdf:type" is not repeatable/)).toBeInTheDocument();
    });
  });

  describe('Missing Required Fields', () => {
    it('shows error for missing URI', () => {
      const csvDataMissingUri = [
        {
          uri: "", // Empty URI
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term without uri",
          "skos:definition@en[0]": "This term has no URI"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="missing-uri-test"
          csvData={csvDataMissingUri}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      
      expect(screen.getByText(/Missing URI in 1 row/)).toBeInTheDocument();
    });

    it('shows error for missing preferred label', () => {
      const csvDataMissingLabel = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "", // Empty label
          "skos:prefLabel@fr": "", // Empty label
          "skos:definition@en[0]": "Term with no label"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="missing-label-test"
          csvData={csvDataMissingLabel}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      
      // Now shows per-language errors
      expect(screen.getByText(/Missing skos:prefLabel@en in 1 row/)).toBeInTheDocument();
      expect(screen.getByText(/Missing skos:prefLabel@fr in 1 row/)).toBeInTheDocument();
    });

    it('shows warning for missing definition', () => {
      const csvDataMissingDefinition = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term without definition"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="missing-def-test"
          csvData={csvDataMissingDefinition}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      
      expect(screen.getByText(/Missing "skos:definition" column/)).toBeInTheDocument();
    });
  });

  describe('Language Consistency', () => {
    it('shows warning for inconsistent language coverage in headers', () => {
      // This tests header-level inconsistency (different languages available for different properties)
      const csvDataInconsistentHeaders = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "english term",
          "skos:prefLabel@fr": "terme français",
          // Note: no @es column for prefLabel, but there is for definition
          "skos:definition@en[0]": "English definition",
          "skos:definition@fr[0]": "Définition française",
          "skos:definition@es[0]": "Definición española" // Spanish only for definition
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="lang-consistency-test"
          csvData={csvDataInconsistentHeaders}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      
      expect(screen.getByText(/Inconsistent language coverage/)).toBeInTheDocument();
    });

    it('shows warning for inconsistent language data in rows', () => {
      // This tests row-level inconsistency (empty values in some languages)
      const csvDataInconsistentRows = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "english term",
          "skos:prefLabel@fr": "terme français",
          "skos:prefLabel@es": "", // Missing Spanish value
          "skos:definition@en[0]": "English definition",
          "skos:definition@fr[0]": "Définition française",
          "skos:definition@es[0]": "" // Missing Spanish value
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="row-consistency-test"
          csvData={csvDataInconsistentRows}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      
      expect(screen.getByText(/1 row\(s\) with inconsistent language data/)).toBeInTheDocument();
    });
  });

  describe('Invalid URI Format', () => {
    it('shows warning for invalid URI format', () => {
      const csvDataInvalidUri = [
        {
          uri: "invalid uri with spaces", // Invalid format
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term with bad uri",
          "skos:definition@en[0]": "Definition"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="invalid-uri-test"
          csvData={csvDataInvalidUri}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      
      expect(screen.getByText(/Found 1 invalid URI/)).toBeInTheDocument();
    });
  });

  describe('Clean CSV Data', () => {
    it('shows no validation issues for clean data', () => {
      const cleanCsvData = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term one",
          "skos:prefLabel@fr": "terme un",
          "skos:definition@en[0]": "Definition one",
          "skos:definition@fr[0]": "Définition un"
        },
        {
          uri: "test:T1002",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term two",
          "skos:prefLabel@fr": "terme deux",
          "skos:definition@en[0]": "Definition two",
          "skos:definition@fr[0]": "Définition deux"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="clean-test"
          csvData={cleanCsvData}
          preferCsvData={true}
        />
      );

      // Should not show error badge at all
      expect(screen.queryByText(/validation issue.*found/)).not.toBeInTheDocument();
    });
  });

  describe('Multiple Issues', () => {
    it('shows all validation issues when multiple problems exist', () => {
      const csvDataMultipleIssues = [
        {
          uri: "", // Missing URI
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "", // Missing label
          "skos:prefLabel@fr": "", // Missing label
          "skos:definition@en[0]": "", // Inconsistent language
          "skos:definition@fr[0]": "Définition"
        },
        {
          uri: "invalid format", // Invalid URI
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term",
          "skos:prefLabel@fr": "", // Inconsistent language
          "skos:definition@en[0]": "Definition",
          "skos:definition@fr[0]": ""
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="multiple-issues-test"
          csvData={csvDataMultipleIssues}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      
      // Should show multiple issues
      expect(screen.getByText(/Missing URI/)).toBeInTheDocument();
      // Use getAllByText since there are multiple prefLabel errors
      const prefLabelErrors = screen.getAllByText(/Missing skos:prefLabel@/);
      expect(prefLabelErrors.length).toBeGreaterThan(0); // Should have at least one prefLabel error
      expect(screen.getByText(/invalid URI/)).toBeInTheDocument();
      expect(screen.getByText(/2 row\(s\) with inconsistent language data/)).toBeInTheDocument();
    });
  });

  describe('Validation Display', () => {
    it('shows errors with error styling', () => {
      const csvDataWithError = [
        {
          uri: "",
          "skos:prefLabel@en": "test"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="error-style-test"
          csvData={csvDataWithError}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      
      const errorElement = screen.getByText(/❌ Error/);
      expect(errorElement).toBeInTheDocument();
      // Check for CSS module class pattern
      expect(errorElement.parentElement?.className).toMatch(/error/);
    });

    it('shows warnings with warning styling', () => {
      const csvDataWithWarning = [
        {
          uri: "invalid uri",
          "skos:prefLabel@en": "test",
          "skos:definition@en[0]": "Definition"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="warning-style-test"
          csvData={csvDataWithWarning}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      
      const warningElement = screen.getByText(/⚠️ Warning/);
      expect(warningElement).toBeInTheDocument();
      // Check for CSS module class pattern
      expect(warningElement.parentElement?.className).toMatch(/warning/);
    });
  });

  describe('Non-CSV Data', () => {
    it('does not show validation for non-CSV data', () => {
      const conceptsData = {
        vocabularyId: "concepts-test",
        concepts: [
          {
            value: "test term",
            definition: "Test definition"
          }
        ]
      };

      render(<VocabularyTable {...conceptsData} />);

      // Should not show error badge for non-CSV data
      expect(screen.queryByText(/validation issue.*found/)).not.toBeInTheDocument();
    });
  });
});