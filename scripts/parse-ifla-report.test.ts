import { describe, expect, it } from 'vitest';
import {
  determineNavigationStrategy,
  generateSiteConfigurations,
  parseIFLAReportData,
  transformElementSet,
  transformVocabulary,
  validateSiteConfigurations,
  type IFLAReportData,
  type SiteConfiguration,
} from './parse-ifla-report';

// Mock data for testing
const mockElementSetData = {
  title: 'Test Element Set',
  description: 'A test element set',
  elementCount: 100,
  languages: ['English', 'Spanish'],
  suggestedPrefix: 'test',
  url: 'https://example.com/test',
};

const mockVocabularyData = {
  title: 'Test Vocabulary',
  description: 'A test vocabulary',
  conceptCount: 50,
  languages: ['English'],
  suggestedPrefix: 'testvocab',
  url: 'https://example.com/testvocab',
};

const mockIFLAData: IFLAReportData = {
  metadata: {
    crawlDate: '2025-01-01T00:00:00.000Z',
    source: 'https://test.example.com',
    totalNamespaces: 2,
    crawlerVersion: '1.0-test',
    summary: {
      totalElementSets: 2,
      totalElements: 150,
      totalValueVocabularies: 2,
      totalConcepts: 75,
    },
    failedUrls: 0,
  },
  namespaces: {
    TEST1: {
      name: 'Test Namespace 1',
      description: 'First test namespace',
      elementSets: {
        'Test Element Set 1': mockElementSetData,
      },
      valueVocabularies: {
        'Test Vocabulary 1': mockVocabularyData,
      },
    },
    TEST2: {
      name: 'Test Namespace 2',
      description: 'Second test namespace',
      elementSets: {},
      valueVocabularies: {
        'Test Vocabulary 2': {
          ...mockVocabularyData,
          title: 'Test Vocabulary 2',
          conceptCount: 25,
        },
      },
    },
  },
};

describe('IFLA Report Data Parser @unit', () => {
  describe('transformElementSet', () => {
    it('should transform element set data correctly', () => {
      const result = transformElementSet(
        'Test Element Set',
        mockElementSetData,
      );

      expect(result).toEqual({
        id: 'test',
        title: 'Test Element Set',
        description: 'A test element set',
        elementCount: 100,
        languages: ['English', 'Spanish'],
        prefix: 'test',
        url: 'https://example.com/test',
      });
    });

    it('should handle missing optional fields', () => {
      const minimalData = {
        elementCount: 50,
        suggestedPrefix: 'minimal',
      };

      const result = transformElementSet('Minimal Set', minimalData);

      expect(result.id).toBe('minimal');
      expect(result.title).toBe('Minimal Set');
      expect(result.elementCount).toBe(50);
      expect(result.languages).toEqual(['English']);
      expect(result.description).toBeUndefined();
    });

    it('should generate ID from name when prefix is missing', () => {
      const dataWithoutPrefix = {
        elementCount: 25,
      };

      const result = transformElementSet(
        'Complex Name With Spaces!',
        dataWithoutPrefix,
      );

      expect(result.id).toBe('complexnamewithspaces');
      expect(result.prefix).toBe('complexnamewithspaces');
    });
  });

  describe('transformVocabulary', () => {
    it('should transform vocabulary data correctly', () => {
      const result = transformVocabulary('Test Vocabulary', mockVocabularyData);

      expect(result).toEqual({
        id: 'testvocab',
        title: 'Test Vocabulary',
        description: 'A test vocabulary',
        conceptCount: 50,
        languages: ['English'],
        prefix: 'testvocab',
        category: undefined,
        url: 'https://example.com/testvocab',
      });
    });

    it('should categorize cartographic vocabularies', () => {
      const cartographicData = {
        ...mockVocabularyData,
        title: 'Cartographic materials: Test',
      };

      const result = transformVocabulary(
        'Cartographic materials: Test',
        cartographicData,
      );

      expect(result.category).toBe('cartographic');
    });

    it('should categorize sound recording vocabularies', () => {
      const soundData = {
        ...mockVocabularyData,
        title: 'Sound recordings: Test',
      };

      const result = transformVocabulary('Sound recordings: Test', soundData);

      expect(result.category).toBe('sound-recordings');
    });

    it('should categorize user task vocabularies', () => {
      const userTaskData = {
        ...mockVocabularyData,
        title: 'FRBR User Tasks',
      };

      const result = transformVocabulary('FRBR User Tasks', userTaskData);

      expect(result.category).toBe('user-tasks');
    });

    it('should categorize content form vocabularies', () => {
      const contentData = {
        ...mockVocabularyData,
        title: 'ISBD Content Form',
      };

      const result = transformVocabulary('ISBD Content Form', contentData);

      expect(result.category).toBe('content-form');
    });
  });

  describe('determineNavigationStrategy', () => {
    it('should return simple for minimal content', () => {
      expect(determineNavigationStrategy(1, 0)).toBe('simple');
      expect(determineNavigationStrategy(0, 1)).toBe('simple');
      expect(determineNavigationStrategy(1, 1)).toBe('simple');
    });

    it('should return categorized for moderate content', () => {
      expect(determineNavigationStrategy(3, 2)).toBe('categorized');
      expect(determineNavigationStrategy(5, 3)).toBe('categorized');
      expect(determineNavigationStrategy(2, 6)).toBe('categorized');
    });

    it('should return hierarchical for complex content', () => {
      expect(determineNavigationStrategy(15, 10)).toBe('hierarchical');
      expect(determineNavigationStrategy(49, 47)).toBe('hierarchical');
      expect(determineNavigationStrategy(5, 20)).toBe('hierarchical');
    });
  });

  describe('generateSiteConfigurations', () => {
    it('should generate correct site configurations', () => {
      const result = generateSiteConfigurations(mockIFLAData);

      expect(Object.keys(result)).toHaveLength(2);
      expect(result).toHaveProperty('test1');
      expect(result).toHaveProperty('test2');

      const test1Config = result.test1;
      expect(test1Config.namespace).toBe('test1');
      expect(test1Config.title).toBe('TEST1 - Test Namespace 1');
      expect(test1Config.description).toBe('First test namespace');
      expect(test1Config.statistics.elementSets).toBe(1);
      expect(test1Config.statistics.vocabularies).toBe(1);
      expect(test1Config.statistics.totalElements).toBe(100);
      expect(test1Config.statistics.totalConcepts).toBe(50);
      expect(test1Config.navigationStrategy).toBe('simple');
    });

    it('should handle namespaces with only vocabularies', () => {
      const result = generateSiteConfigurations(mockIFLAData);
      const test2Config = result.test2;

      expect(test2Config.statistics.elementSets).toBe(0);
      expect(test2Config.statistics.vocabularies).toBe(1);
      expect(test2Config.statistics.totalElements).toBe(0);
      expect(test2Config.statistics.totalConcepts).toBe(25);
      expect(test2Config.navigationStrategy).toBe('simple');
    });
  });

  describe('validateSiteConfigurations', () => {
    it('should validate correct configurations', () => {
      const validConfigs = generateSiteConfigurations(mockIFLAData);
      const result = validateSiteConfigurations(validConfigs);

      expect(result).toBe(true);
    });

    it('should detect missing required fields', () => {
      const invalidConfig: Record<string, SiteConfiguration> = {
        invalid: {
          namespace: 'invalid',
          title: '', // Missing title
          description: 'Test description',
          statistics: {
            totalElements: 0,
            totalConcepts: 0,
            elementSets: 0,
            vocabularies: 0,
          },
          elementSets: [],
          vocabularies: [],
          navigationStrategy: 'simple',
        },
      };

      const result = validateSiteConfigurations(invalidConfig);
      expect(result).toBe(false);
    });

    it('should detect statistics mismatches', () => {
      const configWithMismatch: Record<string, SiteConfiguration> = {
        mismatch: {
          namespace: 'mismatch',
          title: 'Test Config',
          description: 'Test description',
          statistics: {
            totalElements: 100, // Wrong count
            totalConcepts: 50, // Wrong count
            elementSets: 1,
            vocabularies: 1,
          },
          elementSets: [
            {
              id: 'test',
              title: 'Test',
              elementCount: 50, // Actual count is 50, not 100
              languages: ['English'],
              prefix: 'test',
            },
          ],
          vocabularies: [
            {
              id: 'testvocab',
              title: 'Test Vocab',
              conceptCount: 25, // Actual count is 25, not 50
              languages: ['English'],
              prefix: 'testvocab',
            },
          ],
          navigationStrategy: 'simple',
        },
      };

      const result = validateSiteConfigurations(configWithMismatch);
      expect(result).toBe(false);
    });

    it('should detect invalid element set data', () => {
      const configWithInvalidElementSet: Record<string, SiteConfiguration> = {
        invalid: {
          namespace: 'invalid',
          title: 'Test Config',
          description: 'Test description',
          statistics: {
            totalElements: 0,
            totalConcepts: 0,
            elementSets: 1,
            vocabularies: 0,
          },
          elementSets: [
            {
              id: '', // Missing ID
              title: 'Test',
              elementCount: 0,
              languages: ['English'],
              prefix: '', // Missing prefix
            },
          ],
          vocabularies: [],
          navigationStrategy: 'simple',
        },
      };

      const result = validateSiteConfigurations(configWithInvalidElementSet);
      expect(result).toBe(false);
    });
  });

  describe('parseIFLAReportData', () => {
    it('should throw error for non-existent file', () => {
      expect(() => {
        parseIFLAReportData('/non/existent/file.json');
      }).toThrow('Report file not found');
    });

    // Note: Testing actual file parsing would require creating temporary files
    // This is typically done in integration tests rather than unit tests
  });
});
