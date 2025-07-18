import * as fs from 'fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageTemplateGenerator } from './page-template-generator';
import { ElementSet, SiteConfiguration } from './parse-ifla-report';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('PageTemplateGenerator', () => {
  // Sample test data
  const mockElementSet: ElementSet = {
    id: 'test-element-set',
    title: 'Test Element Set',
    description: 'A test element set',
    elementCount: 10,
    languages: ['en', 'fr'],
  };

  const mockIsbd: ElementSet = {
    id: 'isbd',
    title: 'ISBD Elements',
    description: 'ISBD Element Set',
    elementCount: 50,
    languages: ['en', 'fr', 'de'],
  };

  const mockUnconstrained: ElementSet = {
    id: 'unconstrained',
    title: 'ISBD Unconstrained',
    description: 'ISBD Unconstrained Element Set',
    elementCount: 30,
    languages: ['en'],
  };

  const mockConfig: SiteConfiguration = {
    namespace: 'test',
    title: 'Test Standard',
    description: 'A test standard',
    navigationStrategy: 'simple',
    elementSets: [mockElementSet],
    vocabularies: [],
    statistics: {
      totalElements: 10,
      totalConcepts: 0,
      elementSets: 1,
      vocabularies: 0,
    },
  };

  const mockIsbdConfig: SiteConfiguration = {
    namespace: 'isbd',
    title: 'ISBD Standard',
    description: 'ISBD standard description',
    navigationStrategy: 'hierarchical',
    elementSets: [mockIsbd, mockUnconstrained],
    vocabularies: [],
    statistics: {
      totalElements: 80,
      totalConcepts: 0,
      elementSets: 2,
      vocabularies: 0,
    },
  };

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    (fs.existsSync as any).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generateIndividualElementSetPages', () => {
    it('should generate index page for each element set', async () => {
      // Setup
      const generator = new PageTemplateGenerator();

      // Mock private method access
      const generateIndividualElementSetPages = (
        generator as any
      ).generateIndividualElementSetPages.bind(generator);

      // Execute
      const templates = generateIndividualElementSetPages(mockConfig);

      // Verify
      expect(templates).toHaveLength(1);
      expect(templates[0].path).toBe('elements/test-element-set/index.mdx');
      expect(templates[0].content).toContain('# Test Element Set');
      expect(templates[0].content).toContain('A test element set');
      expect(templates[0].content).toContain('10 elements');
      expect(templates[0].content).toContain('- English (en)');
      expect(templates[0].content).toContain('- French (fr)');
    });

    it('should generate subdirectory pages for ISBD element set', async () => {
      // Setup
      const generator = new PageTemplateGenerator();

      // Mock private method access
      const generateIndividualElementSetPages = (
        generator as any
      ).generateIndividualElementSetPages.bind(generator);

      // Execute
      const templates = generateIndividualElementSetPages(mockIsbdConfig);

      // Verify
      expect(templates.length).toBeGreaterThan(5); // Main pages + subdirectory pages

      // Check main element set pages
      const isbdMainPage = templates.find(
        (t) => t.path === 'elements/isbd/index.mdx',
      );
      expect(isbdMainPage).toBeDefined();
      expect(isbdMainPage?.content).toContain('# ISBD Elements');

      const unconstrainedMainPage = templates.find(
        (t) => t.path === 'elements/unconstrained/index.mdx',
      );
      expect(unconstrainedMainPage).toBeDefined();
      expect(unconstrainedMainPage?.content).toContain('# ISBD Unconstrained');

      // Check ISBD subdirectory pages
      const statementsPage = templates.find(
        (t) => t.path === 'elements/isbd/statements/index.mdx',
      );
      expect(statementsPage).toBeDefined();
      expect(statementsPage?.content).toContain('# ISBD Elements Statements');

      const notesPage = templates.find(
        (t) => t.path === 'elements/isbd/notes/index.mdx',
      );
      expect(notesPage).toBeDefined();

      const attributesPage = templates.find(
        (t) => t.path === 'elements/isbd/attributes/index.mdx',
      );
      expect(attributesPage).toBeDefined();

      const relationshipsPage = templates.find(
        (t) => t.path === 'elements/isbd/relationships/index.mdx',
      );
      expect(relationshipsPage).toBeDefined();

      // Check unconstrained subdirectory page
      const elementsPage = templates.find(
        (t) => t.path === 'elements/unconstrained/elements/index.mdx',
      );
      expect(elementsPage).toBeDefined();
      expect(elementsPage?.content).toContain('# ISBD Unconstrained Elements');
    });

    it('should format languages list correctly', async () => {
      // Setup
      const generator = new PageTemplateGenerator();

      // Mock private method access
      const formatLanguagesList = (generator as any).formatLanguagesList.bind(
        generator,
      );

      // Execute & Verify
      expect(formatLanguagesList(['en'])).toContain('- English (en)');
      expect(formatLanguagesList(['en', 'fr'])).toContain(
        '- English (en)\n- French (fr)',
      );
      expect(formatLanguagesList([])).toContain('- None specified');
      expect(formatLanguagesList(['xx'])).toContain('- xx (xx)'); // Unknown language code
    });
  });

  describe('generateSitePageTemplates', () => {
    it('should include individual element set pages in the templates', async () => {
      // Setup
      const generator = new PageTemplateGenerator();
      (fs.existsSync as any).mockReturnValue(false); // Force directory creation

      // Execute
      await generator.generateSitePageTemplates('test', mockConfig);

      // Verify
      // Check that writeFileSync was called for the element set index page
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('elements/test-element-set/index.mdx'),
        expect.stringContaining('# Test Element Set'),
      );
    });
  });
});
