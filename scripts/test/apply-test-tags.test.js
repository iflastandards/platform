/**
 * @integration @critical @testing
 * Tests for the Test Tag Updater script
 */

const { describe, it, expect, vi, beforeEach, afterEach } = require('vitest');
const fs = require('fs');
const { TestTagUpdater } = require('../apply-test-tags');

// Mock dependencies
vi.mock('fs');
vi.mock('child_process');
vi.mock('./test-tagging-analyzer.js', () => ({
  TestTaggingAnalyzer: vi.fn(() => ({
    analyzeAllTests: vi.fn(),
    results: {
      missingCategoryTags: [
        { file: 'test1.test.ts', suggestedTag: '@unit' },
        { file: 'test2.test.ts', suggestedTag: '@integration' }
      ],
      missingPriorityTags: [
        { file: 'test3.test.ts', suggestedTag: '@critical' },
        { file: 'test4.test.ts', suggestedTag: '@high-priority' }
      ],
      missingFunctionalTags: [
        { file: 'test5.test.ts', missing: ['@api', '@validation'] },
        { file: 'test6.test.ts', missing: ['@security'] }
      ]
    }
  }))
}));

const mockFs = vi.mocked(fs);

describe('TestTagUpdater', () => {
  let updater;
  let consoleSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    updater = new TestTagUpdater();
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('constructor', () => {
    it('should initialize with empty state', () => {
      expect(updater.updatedFiles).toEqual([]);
      expect(updater.errors).toEqual([]);
      expect(updater.dryRun).toBe(false);
    });
  });

  describe('updateAllTags', () => {
    it('should process all tag types in correct order', async () => {
      const applyCategorySpy = vi.spyOn(updater, 'applyCategoryTags').mockResolvedValue();
      const applyPrioritySpy = vi.spyOn(updater, 'applyPriorityTags').mockResolvedValue();
      const applyFunctionalSpy = vi.spyOn(updater, 'applyFunctionalTags').mockResolvedValue();
      const printSummarySpy = vi.spyOn(updater, 'printSummary').mockImplementation(() => {});

      await updater.updateAllTags({ dryRun: true });

      expect(applyCategorySpy).toHaveBeenCalledWith([
        { file: 'test1.test.ts', suggestedTag: '@unit' },
        { file: 'test2.test.ts', suggestedTag: '@integration' }
      ]);
      expect(applyPrioritySpy).toHaveBeenCalledWith([
        { file: 'test3.test.ts', suggestedTag: '@critical' },
        { file: 'test4.test.ts', suggestedTag: '@high-priority' }
      ]);
      expect(applyFunctionalSpy).toHaveBeenCalledWith([
        { file: 'test5.test.ts', missing: ['@api', '@validation'] },
        { file: 'test6.test.ts', missing: ['@security'] }
      ]);
      expect(printSummarySpy).toHaveBeenCalled();

      applyCategorySpy.mockRestore();
      applyPrioritySpy.mockRestore();
      applyFunctionalSpy.mockRestore();
      printSummarySpy.mockRestore();
    });

    it('should set dry run mode correctly', async () => {
      vi.spyOn(updater, 'applyCategoryTags').mockResolvedValue();
      vi.spyOn(updater, 'applyPriorityTags').mockResolvedValue();
      vi.spyOn(updater, 'applyFunctionalTags').mockResolvedValue();
      vi.spyOn(updater, 'printSummary').mockImplementation(() => {});

      await updater.updateAllTags({ dryRun: true });

      expect(updater.dryRun).toBe(true);
    });
  });

  describe('updateFileWithCategoryTag', () => {
    it('should add category tag to describe block without existing tags', async () => {
      const mockContent = `describe('UserService', () => {
  it('should create user', () => {
    expect(true).toBe(true);
  });
});`;

      const expectedContent = `describe('UserService @unit', () => {
  it('should create user', () => {
    expect(true).toBe(true);
  });
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.writeFileSync = vi.fn();

      updater.dryRun = false;
      await updater.updateFileWithCategoryTag('test.test.ts', '@unit');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'test.test.ts',
        expectedContent
      );
      expect(updater.updatedFiles).toContain('test.test.ts');
    });

    it('should add category tag to existing tags', async () => {
      const mockContent = `describe('UserService @critical', () => {
  it('should create user', () => {
    expect(true).toBe(true);
  });
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.writeFileSync = vi.fn();

      updater.dryRun = false;
      await updater.updateFileWithCategoryTag('test.test.ts', '@unit');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'test.test.ts',
        expect.stringContaining('@critical @unit')
      );
    });

    it('should handle different describe patterns', async () => {
      const patterns = [
        'test.describe("User API", () => {',
        'smokeTest.describe("Login Flow", () => {',
        'e2eTest.describe("End-to-End", () => {',
        'integrationTest.describe("Database", () => {'
      ];

      for (const pattern of patterns) {
        mockFs.readFileSync.mockReturnValue(`${pattern}
  it('should work', () => {});
});`);
        mockFs.writeFileSync = vi.fn();

        updater.dryRun = false;
        await updater.updateFileWithCategoryTag('test.test.ts', '@unit');

        expect(mockFs.writeFileSync).toHaveBeenCalled();
      }
    });

    it('should not modify files in dry run mode', async () => {
      const mockContent = `describe('UserService', () => {});`;
      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.writeFileSync = vi.fn();

      updater.dryRun = true;
      await updater.updateFileWithCategoryTag('test.test.ts', '@unit');

      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
      expect(updater.updatedFiles).toContain('test.test.ts');
    });

    it('should throw error when describe block not found', async () => {
      const mockContent = 'export const helper = () => {};';
      mockFs.readFileSync.mockReturnValue(mockContent);

      await expect(updater.updateFileWithCategoryTag('helper.test.ts', '@unit'))
        .rejects.toThrow('Could not find describe block to update');
    });
  });

  describe('updateFileWithPriorityTag', () => {
    it('should add priority tag to describe block', async () => {
      const mockContent = `describe('UserService', () => {
  it('should create user', () => {});
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.writeFileSync = vi.fn();

      updater.dryRun = false;
      await updater.updateFileWithPriorityTag('test.test.ts', '@critical');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'test.test.ts',
        expect.stringContaining('@critical')
      );
    });

    it('should add priority tag to existing tags', async () => {
      const mockContent = `describe('UserService @unit', () => {
  it('should create user', () => {});
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.writeFileSync = vi.fn();

      updater.dryRun = false;
      await updater.updateFileWithPriorityTag('test.test.ts', '@critical');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'test.test.ts',
        expect.stringContaining('@unit @critical')
      );
    });

    it('should throw error when describe block not found', async () => {
      const mockContent = 'const helper = () => {};';
      mockFs.readFileSync.mockReturnValue(mockContent);

      await expect(updater.updateFileWithPriorityTag('helper.test.ts', '@critical'))
        .rejects.toThrow('Could not find describe block to update');
    });
  });

  describe('updateFileWithFunctionalTags', () => {
    it('should add functional tags to describe block', async () => {
      const mockContent = `describe('UserService', () => {
  it('should validate input', () => {});
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.writeFileSync = vi.fn();

      updater.dryRun = false;
      await updater.updateFileWithFunctionalTags('test.test.ts', ['@api', '@validation']);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'test.test.ts',
        expect.stringContaining('@api @validation')
      );
    });

    it('should add functional tags to existing tags', async () => {
      const mockContent = `describe('UserService @unit @critical', () => {
  it('should validate input', () => {});
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.writeFileSync = vi.fn();

      updater.dryRun = false;
      await updater.updateFileWithFunctionalTags('test.test.ts', ['@api']);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'test.test.ts',
        expect.stringContaining('@unit @critical @api')
      );
    });
  });

  describe('applyCategoryTags', () => {
    it('should process all category tag items successfully', async () => {
      const updateSpy = vi.spyOn(updater, 'updateFileWithCategoryTag').mockResolvedValue();
      
      const missingCategoryTags = [
        { file: 'test1.test.ts', suggestedTag: '@unit' },
        { file: 'test2.test.ts', suggestedTag: '@integration' }
      ];

      await updater.applyCategoryTags(missingCategoryTags);

      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(updateSpy).toHaveBeenCalledWith('test1.test.ts', '@unit');
      expect(updateSpy).toHaveBeenCalledWith('test2.test.ts', '@integration');

      updateSpy.mockRestore();
    });

    it('should handle errors gracefully', async () => {
      const updateSpy = vi.spyOn(updater, 'updateFileWithCategoryTag')
        .mockRejectedValueOnce(new Error('File not found'))
        .mockResolvedValueOnce();
      
      const missingCategoryTags = [
        { file: 'missing.test.ts', suggestedTag: '@unit' },
        { file: 'existing.test.ts', suggestedTag: '@integration' }
      ];

      await updater.applyCategoryTags(missingCategoryTags);

      expect(updater.errors).toEqual([
        { file: 'missing.test.ts', error: 'File not found' }
      ]);

      updateSpy.mockRestore();
    });
  });

  describe('applyPriorityTags', () => {
    it('should process all priority tag items', async () => {
      const updateSpy = vi.spyOn(updater, 'updateFileWithPriorityTag').mockResolvedValue();
      
      const missingPriorityTags = [
        { file: 'test1.test.ts', suggestedTag: '@critical' },
        { file: 'test2.test.ts', suggestedTag: '@high-priority' }
      ];

      await updater.applyPriorityTags(missingPriorityTags);

      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(updateSpy).toHaveBeenCalledWith('test1.test.ts', '@critical');
      expect(updateSpy).toHaveBeenCalledWith('test2.test.ts', '@high-priority');

      updateSpy.mockRestore();
    });
  });

  describe('applyFunctionalTags', () => {
    it('should process all functional tag items', async () => {
      const updateSpy = vi.spyOn(updater, 'updateFileWithFunctionalTags').mockResolvedValue();
      
      const missingFunctionalTags = [
        { file: 'test1.test.ts', missing: ['@api', '@validation'] },
        { file: 'test2.test.ts', missing: ['@security'] }
      ];

      await updater.applyFunctionalTags(missingFunctionalTags);

      expect(updateSpy).toHaveBeenCalledTimes(2);
      expect(updateSpy).toHaveBeenCalledWith('test1.test.ts', ['@api', '@validation']);
      expect(updateSpy).toHaveBeenCalledWith('test2.test.ts', ['@security']);

      updateSpy.mockRestore();
    });
  });

  describe('printSummary', () => {
    it('should display correct summary statistics', () => {
      updater.updatedFiles = ['test1.ts', 'test2.ts', 'test3.ts'];
      updater.errors = [
        { file: 'error1.ts', error: 'Parse error' }
      ];
      updater.dryRun = false;

      updater.printSummary();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Successfully updated: 3 files')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Errors encountered: 1 files')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Changes have been written to files')
      );
    });

    it('should show dry run message when in dry run mode', () => {
      updater.dryRun = true;
      updater.updatedFiles = ['test1.ts'];
      updater.errors = [];

      updater.printSummary();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('This was a dry run')
      );
    });

    it('should display error details when errors exist', () => {
      updater.errors = [
        { file: 'error1.ts', error: 'Parse error' },
        { file: 'error2.ts', error: 'Access denied' }
      ];
      updater.updatedFiles = [];
      updater.dryRun = false;

      updater.printSummary();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('ERRORS:')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('error1.ts: Parse error')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('error2.ts: Access denied')
      );
    });
  });
});