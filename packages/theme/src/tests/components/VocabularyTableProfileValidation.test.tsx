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
            showCSVErrors: true // Enable by default for tests
          }
        }
      },
      i18n: {
        currentLocale: 'en',
        locales: ['en', 'fr', 'es']
      }
    })
  }));

describe('VocabularyTable Profile-Based Validation', () => {
  describe('Repeatable Properties', () => {
    it('accepts array notation for repeatable properties', () => {
      const csvDataWithArrays = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term1",
          "skos:prefLabel@fr": "terme1",
          "skos:definition@en[0]": "First definition",
          "skos:definition@en[1]": "Second definition", // Multiple definitions allowed
          "skos:definition@fr[0]": "Première définition",
          "skos:definition@fr[1]": "Deuxième définition",
          "skos:altLabel@en[0]": "alternate 1",
          "skos:altLabel@en[1]": "alternate 2", // Multiple altLabels allowed
          "skos:altLabel@fr[0]": "alternatif 1",
          "skos:altLabel@fr[1]": "alternatif 2"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="repeatable-test"
          csvData={csvDataWithArrays}
          preferCsvData={true}
        />
      );

      // Should not show validation errors for repeatable properties with arrays
      // Should not show error badge for valid data
      expect(screen.queryByText(/validation issue.*found/)).not.toBeInTheDocument();
    });

    it('shows error for array notation on non-repeatable properties', () => {
      const csvDataWithInvalidArrays = [
        {
          uri: "test:T1001",
          "rdf:type[0]": "http://www.w3.org/2004/02/skos/core#Concept", // rdf:type is not repeatable
          "rdf:type[1]": "skos:Concept", // This should trigger an error
          "skos:prefLabel@en": "term1",
          "skos:prefLabel@fr": "terme1"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="non-repeatable-test"
          csvData={csvDataWithInvalidArrays}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      expect(screen.getByText(/Property "rdf:type" is not repeatable/)).toBeInTheDocument();
    });
  });

  describe('Required skos:prefLabel for All Languages', () => {
    it('shows error when prefLabel is missing for a language', () => {
      const csvDataMissingLabel = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "english term",
          "skos:prefLabel@fr": "terme français",
          // Missing skos:prefLabel@es
          "skos:definition@en[0]": "Definition",
          "skos:definition@fr[0]": "Définition",
          "skos:definition@es[0]": "Definición" // Spanish definition exists but no label
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="missing-label-lang-test"
          csvData={csvDataMissingLabel}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      expect(screen.getByText(/Missing required skos:prefLabel for some languages/)).toBeInTheDocument();
      expect(screen.getByText(/Languages without prefLabel: es/)).toBeInTheDocument();
    });

    it('shows error for each row missing prefLabel in a language', () => {
      const csvDataMultipleMissing = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term1",
          "skos:prefLabel@fr": "", // Empty French label
        },
        {
          uri: "test:T1002",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term2",
          "skos:prefLabel@fr": "", // Empty French label
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="multiple-missing-test"
          csvData={csvDataMultipleMissing}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      expect(screen.getByText(/Missing skos:prefLabel@fr in 2 row\(s\)/)).toBeInTheDocument();
    });
  });

  describe('Unknown Columns', () => {
    it('shows warning for columns not in the profile', () => {
      const csvDataUnknownColumns = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term1",
          "skos:prefLabel@fr": "terme1",
          "custom:property": "some value", // Not in profile
          "unknown:field": "another value" // Not in profile
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="unknown-columns-test"
          csvData={csvDataUnknownColumns}
          preferCsvData={true}
        />
      );

      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
      expect(screen.getByText(/Unknown column: "custom:property"/)).toBeInTheDocument();
      expect(screen.getByText(/Unknown column: "unknown:field"/)).toBeInTheDocument();
    });
  });

  describe('showCSVErrors Prop', () => {
    it('hides validation errors when showCSVErrors is false', () => {
      const csvDataWithErrors = [
        {
          uri: "", // Missing URI
          "skos:prefLabel@en": "test"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="hide-errors-test"
          csvData={csvDataWithErrors}
          preferCsvData={true}
          showCSVErrors={false}
        />
      );

      // Validation section should not be shown
      // Should not show error badge for valid data
      expect(screen.queryByText(/validation issue.*found/)).not.toBeInTheDocument();
    });

    it('shows validation errors when showCSVErrors is true', () => {
      const csvDataWithErrors = [
        {
          uri: "", // Missing URI
          "skos:prefLabel@en": "test"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="show-errors-test"
          csvData={csvDataWithErrors}
          preferCsvData={true}
          showCSVErrors={true}
        />
      );

      // Validation section should be shown
      // Check for error badge and expand it
      const errorBadge = screen.getByText(/validation issue.*found/);
      expect(errorBadge).toBeInTheDocument();
      fireEvent.click(errorBadge);
    });
  });

  describe('Profile Compliance', () => {
    it('validates all concept properties according to profile', () => {
      const compliantCsvData = [
        {
          uri: "test:T1001",
          "rdf:type": "http://www.w3.org/2004/02/skos/core#Concept",
          "skos:prefLabel@en": "term one",
          "skos:altLabel@en[0]": "alternate one",
          "skos:definition@en[0]": "Definition one",
          "skos:scopeNote@en[0]": "Scope note",
          "skos:notation@en[0]": "T1",
          "skos:example@en[0]": "Example usage",
          "skos:changeNote@en[0]": "Changed in v2",
          "skos:historyNote@en[0]": "Historical note",
          "skos:editorialNote@en[0]": "Editor note",
          "skos:topConceptOf": "test:vocabulary",
          "skos:inScheme": "test:vocabulary"
        }
      ];

      render(
        <VocabularyTable 
          vocabularyId="profile-compliant-test"
          csvData={compliantCsvData}
          preferCsvData={true}
        />
      );

      // Should not show validation issues for profile-compliant data
      // Should not show error badge for valid data
      expect(screen.queryByText(/validation issue.*found/)).not.toBeInTheDocument();
    });
  });
});