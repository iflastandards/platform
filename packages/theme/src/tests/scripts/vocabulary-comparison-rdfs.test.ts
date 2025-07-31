/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { VocabularyComparisonTool } from '../../../../../scripts/vocabulary-comparison.mjs';

// Mock dependencies
const mockFetch = vi.fn() as Mock;
global.fetch = mockFetch;

describe.skip('VocabularyComparisonTool RDFS Support', () => {
  let tool: any;
  const mockApiKey = 'test-api-key';
  const mockSpreadsheetId = 'test-spreadsheet-id';

  beforeEach(() => {
    vi.clearAllMocks();
    tool = new VocabularyComparisonTool(mockApiKey, mockSpreadsheetId);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('RDFS Element Parsing @unit @api @validation', () => {
    it('should parse RDFS classes from RDF', () => {
      const rdfText = `
                <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">
                    <rdfs:Class rdf:about="http://example.org/Person">
                        <rdfs:label xml:lang="en">Person</rdfs:label>
                        <rdfs:comment xml:lang="en">A human being</rdfs:comment>
                        <rdfs:subClassOf rdf:resource="http://example.org/Agent"/>
                    </rdfs:Class>
                </rdf:RDF>
            `;

      const concepts = tool.parseRdfConcepts(rdfText, 'http://example.org');

      expect(concepts).toHaveLength(1);
      expect(concepts[0].uri).toBe('http://example.org/Person');
      expect(concepts[0].prefLabel).toBe('Person');
      expect(concepts[0].definition).toBe('A human being');
      expect(concepts[0].elementType).toBe('rdfs:Class');
      expect(concepts[0].subClassOf).toEqual(['http://example.org/Agent']);
    });

    it('should parse RDF properties from RDF', () => {
      const rdfText = `
                <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#">
                    <rdf:Property rdf:about="http://example.org/name">
                        <rdfs:label xml:lang="en">name</rdfs:label>
                        <rdfs:comment xml:lang="en">The name of a person</rdfs:comment>
                        <rdfs:domain rdf:resource="http://example.org/Person"/>
                        <rdfs:range rdf:resource="http://www.w3.org/2001/XMLSchema#string"/>
                        <rdfs:subPropertyOf rdf:resource="http://example.org/identifier"/>
                    </rdf:Property>
                </rdf:RDF>
            `;

      const concepts = tool.parseRdfConcepts(rdfText, 'http://example.org');

      expect(concepts).toHaveLength(1);
      expect(concepts[0].uri).toBe('http://example.org/name');
      expect(concepts[0].prefLabel).toBe('name');
      expect(concepts[0].definition).toBe('The name of a person');
      expect(concepts[0].elementType).toBe('rdf:Property');
      expect(concepts[0].domain).toEqual(['http://example.org/Person']);
      expect(concepts[0].range).toEqual([
        'http://www.w3.org/2001/XMLSchema#string',
      ]);
      expect(concepts[0].subPropertyOf).toEqual([
        'http://example.org/identifier',
      ]);
    });

    it('should parse OWL classes and properties', () => {
      const rdfText = `
                <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
                         xmlns:owl="http://www.w3.org/2002/07/owl#">
                    <owl:Class rdf:about="http://example.org/Animal">
                        <rdfs:label xml:lang="en">Animal</rdfs:label>
                    </owl:Class>
                    <owl:ObjectProperty rdf:about="http://example.org/eats">
                        <rdfs:label xml:lang="en">eats</rdfs:label>
                        <rdfs:domain rdf:resource="http://example.org/Animal"/>
                        <rdfs:range rdf:resource="http://example.org/Food"/>
                    </owl:ObjectProperty>
                </rdf:RDF>
            `;

      const concepts = tool.parseRdfConcepts(rdfText, 'http://example.org');

      expect(concepts).toHaveLength(2);

      const owlClass = concepts.find((c) => c.elementType === 'owl:Class');
      expect(owlClass?.uri).toBe('http://example.org/Animal');
      expect(owlClass?.prefLabel).toBe('Animal');

      const owlProperty = concepts.find(
        (c) => c.elementType === 'owl:ObjectProperty',
      );
      expect(owlProperty?.uri).toBe('http://example.org/eats');
      expect(owlProperty?.prefLabel).toBe('eats');
      expect(owlProperty?.domain).toEqual(['http://example.org/Animal']);
      expect(owlProperty?.range).toEqual(['http://example.org/Food']);
    });

    it('should parse mixed SKOS and RDFS elements', () => {
      const rdfText = `
                <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                         xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
                         xmlns:skos="http://www.w3.org/2004/02/skos/core#">
                    <skos:Concept rdf:about="http://example.org/concept1">
                        <skos:prefLabel xml:lang="en">Concept 1</skos:prefLabel>
                        <skos:definition xml:lang="en">A test concept</skos:definition>
                    </skos:Concept>
                    <rdfs:Class rdf:about="http://example.org/Class1">
                        <rdfs:label xml:lang="en">Class 1</rdfs:label>
                        <rdfs:comment xml:lang="en">A test class</rdfs:comment>
                    </rdfs:Class>
                </rdf:RDF>
            `;

      const concepts = tool.parseRdfConcepts(rdfText, 'http://example.org');

      expect(concepts).toHaveLength(2);

      const skosConcept = concepts.find(
        (c) => c.elementType === 'skos:Concept',
      );
      expect(skosConcept?.uri).toBe('http://example.org/concept1');
      expect(skosConcept?.prefLabel).toBe('Concept 1');

      const rdfsClass = concepts.find((c) => c.elementType === 'rdfs:Class');
      expect(rdfsClass?.uri).toBe('http://example.org/Class1');
      expect(rdfsClass?.prefLabel).toBe('Class 1');
    });
  });

  describe('RDFS Sheet Parsing', () => {
    it('should extract RDFS properties from sheet data', async () => {
      const mockSheetData = [
        [
          'uri',
          'rdfs:label',
          'skos:definition',
          'rdfs:subClassOf',
          'rdfs:domain',
          'rdfs:range',
        ],
        [
          'http://example.org/Person',
          'Person',
          'A human being',
          'http://example.org/Agent',
          '',
          '',
        ],
        [
          'http://example.org/name',
          'name',
          'Person name',
          '',
          'http://example.org/Person',
          'xsd:string',
        ],
      ];

      // Mock the fetchSheetData method directly instead of fetch
      vi.spyOn(tool, 'fetchSheetData').mockResolvedValueOnce(mockSheetData);

      const vocab = { token: 'test', uri: 'http://example.org/' };
      const concepts = await tool.fetchSheetConcepts('test-sheet', vocab);

      expect(concepts).toHaveLength(2);

      const personConcept = concepts.find((c) => c.uri.includes('Person'));
      expect(personConcept?.subClassOf).toEqual(['http://example.org/Agent']);
      expect(personConcept?.domain).toEqual([]);
      expect(personConcept?.range).toEqual([]);

      const nameConcept = concepts.find((c) => c.uri.includes('name'));
      expect(nameConcept?.subClassOf).toEqual([]);
      expect(nameConcept?.domain).toEqual(['http://example.org/Person']);
      expect(nameConcept?.range).toEqual(['xsd:string']);
    });
  });

  describe('RDFS Comparison Logic', () => {
    it('should compare RDFS class properties correctly', () => {
      const sheetConcepts = [
        {
          uri: 'http://example.org/Person',
          prefLabel: 'Person',
          definition: 'A human being',
          notation: '',
          subClassOf: ['http://example.org/Agent'],
          domain: [],
          range: [],
          subPropertyOf: [],
        },
      ];

      const rdfConcepts = [
        {
          uri: 'http://example.org/Person',
          prefLabel: 'Person',
          definition: 'A human being',
          notation: '',
          elementType: 'rdfs:Class',
          subClassOf: ['http://example.org/Agent'],
          domain: [],
          range: [],
          subPropertyOf: [],
        },
      ];

      const vocab = { token: 'test' };
      const comparison = tool.compareConcepts(
        vocab,
        sheetConcepts,
        rdfConcepts,
      );

      expect(comparison.matches).toHaveLength(1);
      expect(comparison.mismatches).toHaveLength(0);
      expect(comparison.missing).toHaveLength(0);
    });

    it('should detect RDFS property mismatches', () => {
      const sheetConcepts = [
        {
          uri: 'http://example.org/name',
          prefLabel: 'name',
          definition: 'Person name',
          notation: '',
          subClassOf: [],
          domain: ['http://example.org/Person'],
          range: ['xsd:string'],
          subPropertyOf: [],
        },
      ];

      const rdfConcepts = [
        {
          uri: 'http://example.org/name',
          prefLabel: 'name',
          definition: 'Person name',
          notation: '',
          elementType: 'rdf:Property',
          subClassOf: [],
          domain: ['http://example.org/Agent'], // Different domain
          range: ['xsd:string'],
          subPropertyOf: [],
        },
      ];

      const vocab = { token: 'test' };
      const comparison = tool.compareConcepts(
        vocab,
        sheetConcepts,
        rdfConcepts,
      );

      expect(comparison.matches).toHaveLength(0);
      expect(comparison.mismatches).toHaveLength(1);
      expect(comparison.missing).toHaveLength(0);

      const mismatch = comparison.mismatches[0];
      expect(mismatch.domainMatch).toBe(false);
      expect(mismatch.rangeMatch).toBe(true);
    });
  });

  describe('Array Comparison', () => {
    it('should compare arrays correctly', () => {
      expect(tool.compareArrays([], [])).toBe(true);
      expect(tool.compareArrays(['a'], ['a'])).toBe(true);
      expect(tool.compareArrays(['a', 'b'], ['b', 'a'])).toBe(true); // Order independent
      expect(tool.compareArrays(['A'], ['a'])).toBe(true); // Case insensitive
      expect(tool.compareArrays(['a'], ['b'])).toBe(false);
      expect(tool.compareArrays(['a'], ['a', 'b'])).toBe(false);
      expect(tool.compareArrays(null, null)).toBe(true);
      expect(tool.compareArrays(['a'], null)).toBe(false);
    });

    it('should normalize whitespace in array comparisons', () => {
      expect(tool.compareArrays(['  a  '], ['a'])).toBe(true);
      expect(tool.compareArrays(['a\nb'], ['a b'])).toBe(true);
    });
  });

  describe('Markdown Formatting', () => {
    it('should format arrays for markdown correctly', () => {
      expect(tool.formatArrayForMarkdown([])).toBe('none');
      expect(tool.formatArrayForMarkdown(['item'])).toBe('item');
      expect(tool.formatArrayForMarkdown(['item1', 'item2'])).toBe(
        'item1, item2',
      );
      expect(tool.formatArrayForMarkdown(['item|with|pipes'])).toContain('\\|');
    });
  });
});
