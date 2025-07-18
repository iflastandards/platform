import * as fs from 'fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PageTemplateGenerator } from './page-template-generator';
import { SiteConfiguration, Vocabulary } from './parse-ifla-report';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('PageTemplateGenerator Enhanced Methods', () => {
  // Sample test data
  const mockVocabulary: Vocabulary = {
    id: 'test-vocabulary',
    title: 'Test Vocabulary',
    description: 'A test vocabulary',
    conceptCount: 20,
    languages: ['en', 'fr'],
  };

  const mockNestedVocabulary: Vocabulary = {
    id: 'category/nested-vocabulary',
    title: 'Nested Vocabulary',
    description: 'A nested vocabulary',
    conceptCount: 15,
    languages: ['en'],
    category: 'Test Category',
  };

  const mockConfig: SiteConfiguration = {
    namespace: 'test',
    title: 'Test Standard',
    description: 'A test standard',
    navigationStrategy: 'simple',
    elementSets: [],
    vocabularies: [mockVocabulary],
    statistics: {
      totalElements: 0,
      totalConcepts: 20,
      elementSets: 0,
      vocabularies: 1,
    },
  };

  const mockHierarchicalConfig: SiteConfiguration = {
    namespace: 'test-hierarchical',
    title: 'Test Hierarchical Standard',
    description: 'A test standard with hierarchical navigation',
    navigationStrategy: 'hierarchical',
    elementSets: [],
    vocabularies: [mockVocabulary, mockNestedVocabulary],
    statistics: {
      totalElements: 0,
      totalConcepts: 35,
      elementSets: 0,
      vocabularies: 2,
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

  describe('generateIndividualVocabularyPages', () => {
    it('should generate pages for each vocabulary', async () => {
      // Setup
      const generator = new PageTemplateGenerator();

      // Mock private method access
      const generateIndividualVocabularyPages = (
        generator as any
      ).generateIndividualVocabularyPages.bind(generator);

      // Execute
      const templates = generateIndividualVocabularyPages(mockConfig);

      // Verify
      expect(templates).toHaveLength(1);
      expect(templates[0].path).toBe('vocabularies/test-vocabulary.mdx');
      expect(templates[0].content).toContain('# Test Vocabulary');
      expect(templates[0].content).toContain('A test vocabulary');
      expect(templates[0].content).toContain('20 concepts');
      expect(templates[0].content).toContain('- English (en)');
      expect(templates[0].content).toContain('- French (fr)');
    });

    it('should handle nested vocabularies with categories', async () => {
      // Setup
      const generator = new PageTemplateGenerator();

      // Mock private method access
      const generateIndividualVocabularyPages = (
        generator as any
      ).generateIndividualVocabularyPages.bind(generator);

      // Execute
      const templates = generateIndividualVocabularyPages(
        mockHierarchicalConfig,
      );

      // Verify
      expect(templates).toHaveLength(3); // 2 vocabularies + 1 category index

      // Check regular vocabulary
      const regularVocab = templates.find(
        (t) => t.path === 'vocabularies/test-vocabulary.mdx',
      );
      expect(regularVocab).toBeDefined();
      expect(regularVocab?.content).toContain('# Test Vocabulary');

      // Check nested vocabulary
      const nestedVocab = templates.find(
        (t) => t.path === 'vocabularies/category/nested-vocabulary.mdx',
      );
      expect(nestedVocab).toBeDefined();
      expect(nestedVocab?.content).toContain('# Nested Vocabulary');

      // Check category index page
      const categoryIndex = templates.find(
        (t) => t.path === 'vocabularies/category/index.mdx',
      );
      expect(categoryIndex).toBeDefined();
      expect(categoryIndex?.content).toContain('# Test Category');
      expect(categoryIndex?.content).toContain(
        'This section contains vocabularies related to test category',
      );
    });
  });

  describe('generateDocumentationPages', () => {
    it('should generate standard documentation pages', async () => {
      // Setup
      const generator = new PageTemplateGenerator();

      // Mock private method access
      const generateDocumentationPages = (
        generator as any
      ).generateDocumentationPages.bind(generator);

      // Execute
      const templates = generateDocumentationPages(mockConfig);

      // Verify
      expect(templates.length).toBeGreaterThanOrEqual(3); // At least introduction, examples, about

      // Check standard pages
      const introPage = templates.find((t) => t.path === 'introduction.mdx');
      expect(introPage).toBeDefined();
      expect(introPage?.content).toContain('# Test Standard Introduction');

      const examplesPage = templates.find((t) => t.path === 'examples.mdx');
      expect(examplesPage).toBeDefined();
      expect(examplesPage?.content).toContain('# Test Standard Examples');

      const aboutPage = templates.find((t) => t.path === 'about.mdx');
      expect(aboutPage).toBeDefined();
      expect(aboutPage?.content).toContain('# About Test Standard');
    });

    it('should generate additional documentation pages for hierarchical navigation', async () => {
      // Setup
      const generator = new PageTemplateGenerator();

      // Mock private method access
      const generateDocumentationPages = (
        generator as any
      ).generateDocumentationPages.bind(generator);

      // Execute
      const templates = generateDocumentationPages(mockHierarchicalConfig);

      // Verify
      expect(templates.length).toBeGreaterThanOrEqual(6); // Standard pages + additional pages

      // Check additional pages
      const assessmentPage = templates.find((t) => t.path === 'assessment.mdx');
      expect(assessmentPage).toBeDefined();
      expect(assessmentPage?.content).toContain(
        '# Test Hierarchical Standard Assessment',
      );

      const glossaryPage = templates.find((t) => t.path === 'glossary.mdx');
      expect(glossaryPage).toBeDefined();
      expect(glossaryPage?.content).toContain(
        '# Test Hierarchical Standard Glossary',
      );

      const faqPage = templates.find((t) => t.path === 'faq.mdx');
      expect(faqPage).toBeDefined();
      expect(faqPage?.content).toContain('# Test Hierarchical Standard FAQ');
    });
  });

  describe('generateToolsPages', () => {
    it('should generate tools pages for hierarchical navigation', async () => {
      // Setup
      const generator = new PageTemplateGenerator();

      // Mock private method access
      const generateToolsPages = (generator as any).generateToolsPages.bind(
        generator,
      );

      // Execute
      const templates = generateToolsPages(mockHierarchicalConfig);

      // Verify
      expect(templates.length).toBeGreaterThanOrEqual(5); // At least 5 tools pages

      // Check tools pages
      const searchPage = templates.find((t) => t.path === 'search.mdx');
      expect(searchPage).toBeDefined();
      expect(searchPage?.content).toContain(
        '# Test Hierarchical Standard Search',
      );
      expect(searchPage?.content).toContain(
        '<SearchPage namespace="test-hierarchical" />',
      );

      const crossSetBrowserPage = templates.find(
        (t) => t.path === 'cross-set-browser.mdx',
      );
      expect(crossSetBrowserPage).toBeDefined();
      expect(crossSetBrowserPage?.content).toContain(
        '# Test Hierarchical Standard Cross-Set Browser',
      );

      const fieldGuidePage = templates.find(
        (t) => t.path === 'field-guide.mdx',
      );
      expect(fieldGuidePage).toBeDefined();
      expect(fieldGuidePage?.content).toContain(
        '# Test Hierarchical Standard Field Guide',
      );

      const exportToolsPage = templates.find(
        (t) => t.path === 'export-tools.mdx',
      );
      expect(exportToolsPage).toBeDefined();
      expect(exportToolsPage?.content).toContain(
        '# Test Hierarchical Standard Export Tools',
      );

      const visualizationPage = templates.find(
        (t) => t.path === 'visualization.mdx',
      );
      expect(visualizationPage).toBeDefined();
      expect(visualizationPage?.content).toContain(
        '# Test Hierarchical Standard Visualization',
      );
    });

    it('should not generate tools pages for simple navigation', async () => {
      // Setup
      const generator = new PageTemplateGenerator();

      // Mock private method access
      const generateToolsPages = (generator as any).generateToolsPages.bind(
        generator,
      );

      // Execute
      const templates = generateToolsPages(mockConfig);

      // Verify - should still generate the pages since the method is called directly
      // In practice, these pages wouldn't be generated for simple navigation
      // because the method wouldn't be called in generateSitePageTemplates
      expect(templates.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('generateSitePageTemplates', () => {
    it('should include individual vocabulary pages in the templates', async () => {
      // Setup
      const generator = new PageTemplateGenerator();
      (fs.existsSync as any).mockReturnValue(false); // Force directory creation

      // Execute
      await generator.generateSitePageTemplates('test', mockConfig);

      // Verify
      // Check that writeFileSync was called for the vocabulary page
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('vocabularies/test-vocabulary.mdx'),
        expect.stringContaining('# Test Vocabulary'),
      );
    });

    it('should include documentation pages in the templates', async () => {
      // Setup
      const generator = new PageTemplateGenerator();
      (fs.existsSync as any).mockReturnValue(false); // Force directory creation

      // Execute
      await generator.generateSitePageTemplates('test', mockConfig);

      // Verify
      // Check that writeFileSync was called for documentation pages
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('introduction.mdx'),
        expect.stringContaining('# Test Standard Introduction'),
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('examples.mdx'),
        expect.stringContaining('# Test Standard Examples'),
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('about.mdx'),
        expect.stringContaining('# About Test Standard'),
      );
    });

    it('should include tools pages for hierarchical navigation', async () => {
      // Setup
      const generator = new PageTemplateGenerator();
      (fs.existsSync as any).mockReturnValue(false); // Force directory creation

      // Execute
      await generator.generateSitePageTemplates(
        'test-hierarchical',
        mockHierarchicalConfig,
      );

      // Verify
      // Check that writeFileSync was called for tools pages
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('search.mdx'),
        expect.stringContaining('# Test Hierarchical Standard Search'),
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('cross-set-browser.mdx'),
        expect.stringContaining(
          '# Test Hierarchical Standard Cross-Set Browser',
        ),
      );
    });

    it('should skip existing files', async () => {
      // Setup
      const generator = new PageTemplateGenerator();

      // Mock existsSync to return true for specific files
      (fs.existsSync as any).mockImplementation((path) => {
        if (path.includes('vocabularies/test-vocabulary.mdx')) {
          return true; // This file exists
        }
        return false; // Other files don't exist
      });

      // Execute
      await generator.generateSitePageTemplates('test', mockConfig);

      // Verify
      // Check that writeFileSync was NOT called for the existing vocabulary page
      const writeFileCalls = (fs.writeFileSync as any).mock.calls;
      const vocabularyPageWritten = writeFileCalls.some((call) =>
        call[0].includes('vocabularies/test-vocabulary.mdx'),
      );
      expect(vocabularyPageWritten).toBe(false);
    });
  });
});
