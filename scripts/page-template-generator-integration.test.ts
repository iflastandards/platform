import * as fs from 'fs';
import { describe, expect, it, vi } from 'vitest';
import { PageTemplateGenerator } from './page-template-generator';
import { SiteConfiguration } from './parse-ifla-report';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe('Page Template Generator Integration @unit', () => {
  // Sample test data
  const mockConfig: SiteConfiguration = {
    namespace: 'test-integration',
    title: 'Test Integration Standard',
    description: 'A test standard for integration testing',
    navigationStrategy: 'hierarchical',
    elementSets: [
      {
        id: 'element-set-1',
        title: 'Element Set 1',
        description: 'First element set',
        elementCount: 10,
        languages: ['en', 'fr'],
      },
    ],
    vocabularies: [
      {
        id: 'vocabulary-1',
        title: 'Vocabulary 1',
        description: 'First vocabulary',
        conceptCount: 20,
        languages: ['en', 'fr'],
      },
    ],
    statistics: {
      totalElements: 10,
      totalConcepts: 20,
      elementSets: 1,
      vocabularies: 1,
    },
  };

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Default mock implementations
    (fs.existsSync as any).mockReturnValue(false); // Force file creation
  });

  it('should generate all required files for a complete site', async () => {
    // Setup
    const generator = new PageTemplateGenerator('standards');

    // Execute
    await generator.generateSitePageTemplates('test-integration', mockConfig);

    // Verify
    // Check that directories were created
    expect(fs.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('docs'), {
      recursive: true,
    });
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('docs/elements'),
      { recursive: true },
    );
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining('docs/vocabularies'),
      { recursive: true },
    );

    // Check that files were created
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('index.mdx'),
      expect.stringContaining('# Test Integration Standard'),
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('elements/index.mdx'),
      expect.stringContaining('# Test Integration Standard Element Sets'),
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('elements/element-set-1/index.mdx'),
      expect.stringContaining('# Element Set 1'),
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('vocabularies/index.mdx'),
      expect.stringContaining('# Test Integration Standard Vocabularies'),
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('vocabularies/vocabulary-1.mdx'),
      expect.stringContaining('# Vocabulary 1'),
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('introduction.mdx'),
      expect.stringContaining('# Test Integration Standard Introduction'),
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('examples.mdx'),
      expect.stringContaining('# Test Integration Standard Examples'),
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('about.mdx'),
      expect.stringContaining('# About Test Integration Standard'),
    );

    // Check that tools pages were created (hierarchical navigation)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('search.mdx'),
      expect.stringContaining('# Test Integration Standard Search'),
    );

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('cross-set-browser.mdx'),
      expect.stringContaining('# Test Integration Standard Cross-Set Browser'),
    );
  });

  it('should skip existing files during generation', async () => {
    // Setup
    const generator = new PageTemplateGenerator('standards');

    // Mock existsSync to return true for specific files
    (fs.existsSync as any).mockImplementation((path) => {
      if (path.includes('vocabularies/vocabulary-1.mdx')) {
        return true; // This file exists
      }
      return false; // Other files don't exist
    });

    // Execute
    await generator.generateSitePageTemplates('test-integration', mockConfig);

    // Verify
    // Check that the vocabulary file was not written
    const writeFileCalls = (fs.writeFileSync as any).mock.calls;
    const vocabularyFileWritten = writeFileCalls.some((call) =>
      call[0].includes('vocabularies/vocabulary-1.mdx'),
    );

    expect(vocabularyFileWritten).toBe(false);

    // But other files were written
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('index.mdx'),
      expect.stringContaining('# Test Integration Standard'),
    );
  });

  it('should generate files for different navigation strategies', async () => {
    // Setup
    const generator = new PageTemplateGenerator('standards');

    // Create a simple navigation config
    const simpleConfig: SiteConfiguration = {
      ...mockConfig,
      navigationStrategy: 'simple',
    };

    // Execute
    await generator.generateSitePageTemplates('test-simple', simpleConfig);

    // Verify
    // Check that tools pages were NOT created for simple navigation
    const writeFileCalls = (fs.writeFileSync as any).mock.calls;
    const searchPageWritten = writeFileCalls.some((call) =>
      call[0].includes('search.mdx'),
    );

    // Tools pages should not be generated for simple navigation
    expect(searchPageWritten).toBe(false);

    // But standard pages should be generated
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('index.mdx'),
      expect.stringContaining('# Test Integration Standard'),
    );
  });
});
