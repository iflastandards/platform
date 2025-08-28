/**
 * @integration @critical @testing
 * Tests for error handling and edge cases in test-tagging scripts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestTagger, ProcessingOptions } from '../auto-tag-tests';
import { TestTagUpdater } from '../apply-test-tags';
import { TestTagValidator } from '../validate-test-tags';
import { TEST_FILE_FIXTURES, AI_RESPONSE_FIXTURES } from './fixtures/test-files.fixtures';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Mock dependencies
vi.mock('fs');
vi.mock('child_process');
vi.mock('chalk', () => ({
  default: {
    bold: vi.fn((text) => text),
    blue: vi.fn((text) => text),
    green: vi.fn((text) => text),
    yellow: vi.fn((text) => text),
    red: vi.fn((text) => text),
    cyan: vi.fn((text) => text),
    gray: vi.fn((text) => text)
  }
}));
vi.mock('ora', () => ({
  default: vi.fn(() => ({
    start: vi.fn(() => ({ succeed: vi.fn(), fail: vi.fn() })),
    succeed: vi.fn(),
    fail: vi.fn()
  }))
}));
vi.mock('glob', () => ({
  glob: {
    sync: vi.fn()
  }
}));

const mockFs = vi.mocked(fs);
const mockExecSync = vi.mocked(execSync);

describe('Error Handling and Edge Cases', () => {
  let consoleSpy: {
    log: any;
    error: any;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('TestTagger Error Handling', () => {
    let testTagger: TestTagger;
    let mockOptions: ProcessingOptions;

    beforeEach(() => {
      mockOptions = {
        provider: 'anthropic',
        dryRun: false,
        interactive: false,
        affected: false,
        staged: false,
        verbose: false,
        moveFiles: false,
        fixNames: false
      };

      process.env.ANTHROPIC_API_KEY = 'mock-api-key';
      testTagger = new TestTagger(mockOptions);
    });

    afterEach(() => {
      delete process.env.ANTHROPIC_API_KEY;
    });

    describe('Initialization Errors', () => {
      it('should handle missing API key gracefully', async () => {
        delete process.env.ANTHROPIC_API_KEY;
        const tagger = new TestTagger(mockOptions);

        await expect(tagger.initialize()).rejects.toThrow(
          'ANTHROPIC_API_KEY not found in environment'
        );
      });

      it('should handle unknown provider', async () => {
        const invalidTagger = new TestTagger({
          ...mockOptions,
          provider: 'unknown-provider' as any
        });

        await expect(invalidTagger.initialize()).rejects.toThrow(
          'Unknown provider: unknown-provider'
        );
      });

      it('should handle provider package not found', async () => {
        // Mock dynamic import to fail
        const originalImport = vi.importModule;
        vi.importModule = vi.fn().mockRejectedValue(new Error('Module not found'));

        await expect(testTagger.initialize()).rejects.toThrow(
          expect.stringContaining('Failed to initialize anthropic provider')
        );

        vi.importModule = originalImport;
      });

      it('should handle provider class not found in module', async () => {
        // Mock module without expected class
        vi.doMock('@memberjunction/ai-anthropic', () => ({
          WrongClassName: vi.fn()
        }));

        await expect(testTagger.initialize()).rejects.toThrow(
          expect.stringContaining('Could not find AnthropicLLM')
        );
      });
    });

    describe('File System Errors', () => {
      beforeEach(async () => {
        const mockLLMInstance = {
          ChatCompletion: vi.fn(),
          SetAdditionalSettings: vi.fn(),
          ClearAdditionalSettings: vi.fn()
        };
        (testTagger as any).llm = mockLLMInstance;
      });

      it('should handle file not found errors', async () => {
        mockFs.readFileSync.mockImplementation(() => {
          throw new Error('ENOENT: no such file or directory');
        });

        const result = await testTagger.analyzeTestFile('/nonexistent/file.test.ts')
          .catch(error => error);

        expect(result).toBeInstanceOf(Error);
        expect(consoleSpy.error).toHaveBeenCalledWith(
          expect.stringContaining('Error analyzing'),
          expect.any(Error)
        );
      });

      it('should handle permission denied errors', async () => {
        mockFs.readFileSync.mockImplementation(() => {
          const error: any = new Error('EACCES: permission denied');
          error.code = 'EACCES';
          throw error;
        });

        await expect(testTagger.analyzeTestFile('/restricted/file.test.ts'))
          .rejects.toThrow('EACCES: permission denied');
      });

      it('should handle file write errors during tag application', async () => {
        const filePath = '/readonly/file.test.ts';
        const mockContent = TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS;

        mockFs.readFileSync.mockReturnValue(mockContent);
        mockFs.writeFileSync.mockImplementation(() => {
          throw new Error('EACCES: permission denied, open');
        });

        await (testTagger as any).applyTags(filePath, ['@unit', '@critical']);

        // Should handle error gracefully - no throw
        expect(consoleSpy.error).toHaveBeenCalled();
      });

      it('should handle directory creation failures during file moves', async () => {
        const fromPath = '/src/wrong/test.test.ts';
        const toPath = '/src/unit/test.unit.test.ts';

        mockFs.existsSync.mockReturnValue(false);
        mockFs.mkdirSync.mockImplementation(() => {
          throw new Error('EACCES: permission denied, mkdir');
        });

        await expect((testTagger as any).moveTestFile(fromPath, toPath))
          .rejects.toThrow('EACCES: permission denied, mkdir');
      });
    });

    describe('AI Provider Response Errors', () => {
      beforeEach(async () => {
        const mockLLMInstance = {
          ChatCompletion: vi.fn(),
          SetAdditionalSettings: vi.fn(),
          ClearAdditionalSettings: vi.fn()
        };
        (testTagger as any).llm = mockLLMInstance;
      });

      it('should handle AI provider timeout', async () => {
        const mockLLM = (testTagger as any).llm;
        mockLLM.ChatCompletion.mockRejectedValue(new Error('Request timeout'));

        mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

        await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
          .rejects.toThrow('Request timeout');
      });

      it('should handle AI provider rate limiting', async () => {
        const mockLLM = (testTagger as any).llm;
        mockLLM.ChatCompletion.mockRejectedValue(new Error('Rate limit exceeded'));

        mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

        await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
          .rejects.toThrow('Rate limit exceeded');
      });

      it('should handle malformed AI responses', async () => {
        const mockLLM = (testTagger as any).llm;
        mockLLM.ChatCompletion.mockResolvedValue({
          success: true,
          data: {
            choices: [{
              message: {
                content: AI_RESPONSE_FIXTURES.MALFORMED_JSON_RESPONSE
              }
            }]
          }
        });

        mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

        await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
          .rejects.toThrow();
      });

      it('should handle empty AI responses', async () => {
        const mockLLM = (testTagger as any).llm;
        mockLLM.ChatCompletion.mockResolvedValue({
          success: true,
          data: {
            choices: [{
              message: {
                content: AI_RESPONSE_FIXTURES.EMPTY_RESPONSE
              }
            }]
          }
        });

        mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

        await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
          .rejects.toThrow();
      });

      it('should handle non-JSON AI responses', async () => {
        const mockLLM = (testTagger as any).llm;
        mockLLM.ChatCompletion.mockResolvedValue({
          success: true,
          data: {
            choices: [{
              message: {
                content: AI_RESPONSE_FIXTURES.NON_JSON_RESPONSE
              }
            }]
          }
        });

        mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

        await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
          .rejects.toThrow();
      });

      it('should handle AI provider failure responses', async () => {
        const mockLLM = (testTagger as any).llm;
        mockLLM.ChatCompletion.mockResolvedValue({
          success: false,
          message: 'AI model overloaded',
          error: 'SERVICE_UNAVAILABLE'
        });

        mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

        await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
          .rejects.toThrow('AI model overloaded');
      });
    });

    describe('Git Command Errors', () => {
      it('should handle git command not found', async () => {
        const stagedTagger = new TestTagger({
          ...mockOptions,
          staged: true
        });

        mockExecSync.mockImplementation(() => {
          throw new Error('git: command not found');
        });

        const files = await (stagedTagger as any).getFilesToProcess();

        expect(files).toEqual([]);
      });

      it('should handle git repository not found', async () => {
        const stagedTagger = new TestTagger({
          ...mockOptions,
          staged: true
        });

        mockExecSync.mockImplementation(() => {
          throw new Error('fatal: not a git repository');
        });

        const files = await (stagedTagger as any).getFilesToProcess();

        expect(files).toEqual([]);
      });

      it('should handle nx command failures', async () => {
        const affectedTagger = new TestTagger({
          ...mockOptions,
          affected: true
        });

        mockExecSync
          .mockImplementationOnce(() => {
            throw new Error('nx: command not found');
          })
          .mockReturnValueOnce('fallback.test.ts\n');

        const { glob } = await import('glob');
        vi.mocked(glob.sync).mockReturnValue(['fallback.test.ts']);

        const files = await (affectedTagger as any).getFilesToProcess();

        // Should fallback to glob pattern
        expect(files).toEqual(['fallback.test.ts']);
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining('Could not determine affected files')
        );
      });
    });

    describe('Edge Cases in File Content', () => {
      beforeEach(async () => {
        const mockLLMInstance = {
          ChatCompletion: vi.fn().mockResolvedValue({
            success: true,
            data: {
              choices: [{
                message: {
                  content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
                }
              }]
            }
          }),
          SetAdditionalSettings: vi.fn(),
          ClearAdditionalSettings: vi.fn()
        };
        (testTagger as any).llm = mockLLMInstance;
      });

      it('should handle files without test blocks', async () => {
        mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.PROBLEMATIC_NO_DESCRIBE);

        await (testTagger as any).applyTags('/path/to/helper.test.ts', ['@unit']);

        expect(consoleSpy.error).toHaveBeenCalledWith(
          expect.stringContaining('Cannot find test block')
        );
      });

      it('should handle very large files', async () => {
        const largeContent = 'x'.repeat(50000) + '\ndescribe("Large test", () => {});';
        mockFs.readFileSync.mockReturnValue(largeContent);

        const result = await testTagger.analyzeTestFile('/path/to/large.test.ts');

        // Should truncate content and still analyze
        expect(result).toBeDefined();
        expect(result.classification).toBe('unit');
      });

      it('should handle files with special characters', async () => {
        const specialContent = `describe('Test with 特殊文字 and émojis 🧪', () => {
          it('should handle unicode', () => {});
        });`;
        
        mockFs.readFileSync.mockReturnValue(specialContent);

        const result = await testTagger.analyzeTestFile('/path/to/special.test.ts');

        expect(result).toBeDefined();
      });

      it('should handle empty or nearly empty files', async () => {
        mockFs.readFileSync.mockReturnValue('   \n\n  ');

        const mockLLM = (testTagger as any).llm;
        mockLLM.ChatCompletion.mockResolvedValue({
          success: true,
          data: {
            choices: [{
              message: {
                content: JSON.stringify({
                  classification: 'unit',
                  confidence: 'low',
                  tags: ['@unit', '@low-priority'],
                  reasoning: 'File appears empty or minimal',
                  concerns: ['File has no substantial content'],
                  recommendations: ['Add proper test content']
                })
              }
            }]
          }
        });

        const result = await testTagger.analyzeTestFile('/path/to/empty.test.ts');

        expect(result.concerns).toContain('File has no substantial content');
      });

      it('should handle binary or corrupted files', async () => {
        const binaryContent = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]).toString('binary');
        mockFs.readFileSync.mockReturnValue(binaryContent);

        // Should not crash, but may produce unusual results
        await expect(testTagger.analyzeTestFile('/path/to/binary.test.ts'))
          .resolves.toBeDefined();
      });
    });
  });

  describe('TestTagUpdater Error Handling', () => {
    let updater: TestTagUpdater;

    beforeEach(() => {
      // Mock the analyzer dependency
      vi.doMock('./test-tagging-analyzer.js', () => ({
        TestTaggingAnalyzer: vi.fn(() => ({
          analyzeAllTests: vi.fn(),
          results: {
            missingCategoryTags: [],
            missingPriorityTags: [],
            missingFunctionalTags: []
          }
        }))
      }));

      updater = new TestTagUpdater();
    });

    it('should handle file read errors during tag updates', async () => {
      updater.updateFileWithCategoryTag = vi.fn().mockRejectedValue(
        new Error('ENOENT: file not found')
      );

      const categoryTags = [
        { file: 'missing.test.ts', suggestedTag: '@unit' }
      ];

      await updater.applyCategoryTags(categoryTags);

      expect(updater.errors).toHaveLength(1);
      expect(updater.errors[0]).toEqual({
        file: 'missing.test.ts',
        error: 'ENOENT: file not found'
      });
    });

    it('should handle analyzer initialization failures', async () => {
      const { TestTaggingAnalyzer } = await import('./test-tagging-analyzer.js');
      const mockAnalyzer = vi.mocked(TestTaggingAnalyzer);
      
      mockAnalyzer.mockImplementation(() => ({
        analyzeAllTests: vi.fn().mockRejectedValue(new Error('Analysis failed')),
        results: {}
      }));

      await expect(updater.updateAllTags()).rejects.toThrow('Analysis failed');
    });

    it('should handle malformed file content that cannot be parsed', async () => {
      mockFs.readFileSync.mockReturnValue('invalid javascript content {{{');

      await expect(
        updater.updateFileWithCategoryTag('invalid.test.ts', '@unit')
      ).rejects.toThrow('Could not find describe block to update');
    });

    it('should handle concurrent access/write conflicts', async () => {
      mockFs.readFileSync.mockReturnValue('describe("Test", () => {});');
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('EBUSY: resource busy or locked');
      });

      updater.dryRun = false;

      const updatePromise = updater.updateFileWithCategoryTag('locked.test.ts', '@unit');

      await expect(updatePromise).rejects.toThrow('EBUSY: resource busy or locked');
    });
  });

  describe('TestTagValidator Error Handling', () => {
    let validator: TestTagValidator;

    beforeEach(() => {
      validator = new TestTagValidator();
    });

    it('should handle find command failures', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('find: command not found');
      });

      const files = validator.findAllTestFiles();

      expect(files).toEqual([]);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'Error finding test files:',
        'find: command not found'
      );
    });

    it('should handle file system permission errors during validation', async () => {
      const files = ['accessible.test.ts', 'restricted.test.ts'];
      
      mockExecSync.mockReturnValue(files.join('\n'));
      
      mockFs.readFileSync
        .mockReturnValueOnce('describe("Accessible test @unit", () => {});')
        .mockImplementationOnce(() => {
          throw new Error('EACCES: permission denied');
        });

      await validator.validateTags();

      expect(validator.results.totalFiles).toBe(2);
      expect(validator.results.categoryCoverage).toBe(1); // Only one file processed
      expect(validator.results.validationErrors).toHaveLength(1);
      expect(validator.results.validationErrors[0]).toEqual({
        file: 'restricted.test.ts',
        error: 'EACCES: permission denied'
      });
    });

    it('should handle report generation failures', () => {
      validator.results = {
        totalFiles: 10,
        categoryCoverage: 8,
        functionalCoverage: 6,
        priorityCoverage: 7,
        tagExamples: { '@unit': ['test1.ts'] },
        validationErrors: []
      };

      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('ENOSPC: no space left on device');
      });

      expect(() => validator.generateFinalReport()).toThrow('ENOSPC: no space left on device');
    });

    it('should handle corrupted or binary test files', async () => {
      const files = ['normal.test.ts', 'binary.test.ts'];
      
      mockExecSync.mockReturnValue(files.join('\n'));
      
      const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0x03]).toString('binary');
      
      mockFs.readFileSync
        .mockReturnValueOnce('describe("Normal test @unit", () => {});')
        .mockReturnValueOnce(binaryContent);

      await validator.validateTags();

      expect(validator.results.totalFiles).toBe(2);
      expect(validator.results.categoryCoverage).toBe(1); // Only normal file counted
    });
  });

  describe('Network and External Dependency Errors', () => {
    it('should handle network connectivity issues for AI providers', async () => {
      const testTagger = new TestTagger({
        provider: 'anthropic',
        dryRun: false,
        interactive: false,
        affected: false,
        staged: false,
        verbose: false,
        moveFiles: false,
        fixNames: false
      });

      process.env.ANTHROPIC_API_KEY = 'test-key';

      const mockLLMInstance = {
        ChatCompletion: vi.fn().mockRejectedValue(
          new Error('ENOTFOUND: network unreachable')
        ),
        SetAdditionalSettings: vi.fn(),
        ClearAdditionalSettings: vi.fn()
      };

      (testTagger as any).llm = mockLLMInstance;
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
        .rejects.toThrow('ENOTFOUND: network unreachable');
    });

    it('should handle DNS resolution failures', async () => {
      const testTagger = new TestTagger({
        provider: 'perplexity',
        dryRun: false,
        interactive: false,
        affected: false,
        staged: false,
        verbose: false,
        moveFiles: false,
        fixNames: false
      });

      process.env.PERPLEXITY_API_KEY = 'test-key';

      const mockLLMInstance = {
        ChatCompletion: vi.fn().mockRejectedValue(
          new Error('ENOTFOUND: getaddrinfo failed')
        ),
        SetAdditionalSettings: vi.fn(),
        ClearAdditionalSettings: vi.fn()
      };

      (testTagger as any).llm = mockLLMInstance;
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
        .rejects.toThrow('ENOTFOUND: getaddrinfo failed');
    });
  });

  describe('Memory and Resource Constraints', () => {
    it('should handle out of memory situations gracefully', async () => {
      const testTagger = new TestTagger({
        provider: 'anthropic',
        dryRun: false,
        interactive: false,
        affected: false,
        staged: false,
        verbose: false,
        moveFiles: false,
        fixNames: false
      });

      process.env.ANTHROPIC_API_KEY = 'test-key';

      const mockLLMInstance = {
        ChatCompletion: vi.fn().mockRejectedValue(
          new Error('JavaScript heap out of memory')
        ),
        SetAdditionalSettings: vi.fn(),
        ClearAdditionalSettings: vi.fn()
      };

      (testTagger as any).llm = mockLLMInstance;
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
        .rejects.toThrow('JavaScript heap out of memory');
    });

    it('should handle disk space issues during file operations', async () => {
      const updater = new TestTagUpdater();
      
      mockFs.readFileSync.mockReturnValue('describe("Test", () => {});');
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('ENOSPC: no space left on device');
      });

      updater.dryRun = false;

      await expect(
        updater.updateFileWithCategoryTag('test.test.ts', '@unit')
      ).rejects.toThrow('ENOSPC: no space left on device');
    });
  });

  describe('Race Conditions and Concurrency Issues', () => {
    it('should handle files being modified during processing', async () => {
      const testTagger = new TestTagger({
        provider: 'anthropic',
        dryRun: false,
        interactive: false,
        affected: false,
        staged: false,
        verbose: false,
        moveFiles: false,
        fixNames: false
      });

      process.env.ANTHROPIC_API_KEY = 'test-key';

      let readCount = 0;
      mockFs.readFileSync.mockImplementation(() => {
        readCount++;
        if (readCount === 1) {
          return TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS;
        }
        // File changed between read operations
        return TEST_FILE_FIXTURES.INTEGRATION_TEST_DATABASE;
      });

      const mockLLMInstance = {
        ChatCompletion: vi.fn().mockResolvedValue({
          success: true,
          data: {
            choices: [{
              message: {
                content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
              }
            }]
          }
        }),
        SetAdditionalSettings: vi.fn(),
        ClearAdditionalSettings: vi.fn()
      };

      (testTagger as any).llm = mockLLMInstance;

      // Should handle the change gracefully
      await expect(testTagger.analyzeTestFile('/path/to/changing.test.ts'))
        .resolves.toBeDefined();
    });

    it('should handle multiple processes trying to modify same file', async () => {
      const updater = new TestTagUpdater();
      
      mockFs.readFileSync.mockReturnValue('describe("Test", () => {});');
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('ETXTBSY: text file busy');
      });

      updater.dryRun = false;

      await expect(
        updater.updateFileWithCategoryTag('busy.test.ts', '@unit')
      ).rejects.toThrow('ETXTBSY: text file busy');
    });
  });
});