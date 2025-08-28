/**
 * @integration @critical @testing
 * Integration tests for file processing workflows in the test-tagging scripts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestTagger, ProcessingOptions } from '../../auto-tag-tests';
import { TEST_FILE_FIXTURES, AI_RESPONSE_FIXTURES } from '../fixtures/test-files.fixtures';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { tmpdir } from 'os';

// Mock external dependencies
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

describe('File Processing Integration Tests', () => {
  let testTagger: TestTagger;
  let tempDir: string;
  let mockOptions: ProcessingOptions;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create temp directory for test files
    tempDir = path.join(tmpdir(), 'test-tagger-integration', Date.now().toString());
    
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

    // Setup mock LLM
    const mockLLMInstance = {
      ChatCompletion: vi.fn(),
      ChatCompletions: vi.fn(),
      SetAdditionalSettings: vi.fn(),
      ClearAdditionalSettings: vi.fn()
    };

    (testTagger as any).llm = mockLLMInstance;

    // Mock filesystem operations
    mockFs.existsSync = vi.fn().mockReturnValue(true);
    mockFs.mkdirSync = vi.fn();
    mockFs.writeFileSync = vi.fn();
    mockFs.renameSync = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete process.env.ANTHROPIC_API_KEY;
  });

  describe('End-to-End File Processing', () => {
    it('should process unit test file and apply correct tags', async () => {
      const filePath = path.join(tempDir, 'user.test.ts');
      
      // Mock file content
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      // Mock AI response
      const mockLLM = (testTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      });

      // Mock file discovery
      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue([filePath]);

      // Process the file
      await testTagger.processFiles();

      // Verify AI was called with correct content
      expect(mockLLM.ChatCompletion).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining('UserService Unit Tests')
            })
          ])
        })
      );

      // Verify tags were applied
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        filePath,
        expect.stringContaining('@unit @critical @api')
      );
    });

    it('should process integration test file and apply correct tags', async () => {
      const filePath = path.join(tempDir, 'database.integration.test.ts');
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.INTEGRATION_TEST_DATABASE);

      const mockLLM = (testTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_INTEGRATION_ANALYSIS)
            }
          }]
        }
      });

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue([filePath]);

      await testTagger.processFiles();

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        filePath,
        expect.stringContaining('@integration @high-priority @api @validation')
      );
    });

    it('should process e2e test file and apply correct tags', async () => {
      const filePath = path.join(tempDir, 'login.e2e.spec.ts');
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.E2E_TEST_PLAYWRIGHT);

      const mockLLM = (testTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_E2E_ANALYSIS)
            }
          }]
        }
      });

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue([filePath]);

      await testTagger.processFiles();

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        filePath,
        expect.stringContaining('@e2e @critical @ui @navigation')
      );
    });

    it('should process smoke test file and apply correct tags', async () => {
      const filePath = path.join(tempDir, 'health.smoke.spec.ts');
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.SMOKE_TEST_CRITICAL_PATH);

      const mockLLM = (testTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_SMOKE_ANALYSIS)
            }
          }]
        }
      });

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue([filePath]);

      await testTagger.processFiles();

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        filePath,
        expect.stringContaining('@smoke @critical')
      );
    });
  });

  describe('Batch Processing', () => {
    it('should process multiple files in parallel when batch size is met', async () => {
      const files = [
        path.join(tempDir, 'test1.test.ts'),
        path.join(tempDir, 'test2.test.ts'),
        path.join(tempDir, 'test3.test.ts'),
        path.join(tempDir, 'test4.test.ts'),
        path.join(tempDir, 'test5.test.ts'),
        path.join(tempDir, 'test6.test.ts')
      ];

      // Mock file contents
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      // Mock batch processing response
      const mockLLM = (testTagger as any).llm;
      const batchResponse = files.map(() => ({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      }));
      
      mockLLM.ChatCompletions.mockResolvedValue(batchResponse);

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue(files);

      await testTagger.processFiles();

      // Should use batch processing for efficiency
      expect(mockLLM.ChatCompletions).toHaveBeenCalled();
      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(files.length);
    });

    it('should fallback to sequential processing if batch fails', async () => {
      const files = [
        path.join(tempDir, 'test1.test.ts'),
        path.join(tempDir, 'test2.test.ts')
      ];

      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      const mockLLM = (testTagger as any).llm;
      
      // First batch call fails
      mockLLM.ChatCompletions.mockRejectedValue(new Error('Batch processing failed'));
      
      // Individual calls succeed
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      });

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue(files);

      await testTagger.processFiles();

      // Should try batch first, then fallback to individual
      expect(mockLLM.ChatCompletions).toHaveBeenCalled();
      expect(mockLLM.ChatCompletion).toHaveBeenCalledTimes(files.length);
    });
  });

  describe('File Discovery Workflows', () => {
    it('should process staged files when staged option is enabled', async () => {
      const stagedTagger = new TestTagger({
        ...mockOptions,
        staged: true
      });
      (stagedTagger as any).llm = (testTagger as any).llm;

      const stagedFiles = [
        'src/user.test.ts',
        'src/api.integration.test.ts'
      ];

      mockExecSync.mockReturnValue(stagedFiles.join('\n'));
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      const mockLLM = (stagedTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      });

      await stagedTagger.processFiles();

      expect(mockExecSync).toHaveBeenCalledWith(
        'git diff --staged --name-only',
        { encoding: 'utf8' }
      );
      expect(mockLLM.ChatCompletion).toHaveBeenCalledTimes(stagedFiles.length);
    });

    it('should process affected files when affected option is enabled', async () => {
      const affectedTagger = new TestTagger({
        ...mockOptions,
        affected: true
      });
      (affectedTagger as any).llm = (testTagger as any).llm;

      const affectedFiles = [
        'apps/admin/user.test.ts',
        'packages/theme/component.test.tsx'
      ];

      mockExecSync.mockReturnValue(affectedFiles.join('\n'));
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      const mockLLM = (affectedTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      });

      await affectedTagger.processFiles();

      expect(mockExecSync).toHaveBeenCalledWith(
        'pnpm nx print-affected --type=app --select=files',
        { encoding: 'utf8' }
      );
      expect(mockLLM.ChatCompletion).toHaveBeenCalledTimes(affectedFiles.length);
    });

    it('should use glob pattern when no specific options are set', async () => {
      const files = [
        'src/user.test.ts',
        'e2e/login.e2e.spec.ts',
        'apps/admin/form.integration.test.tsx'
      ];

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue(files);
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      const mockLLM = (testTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      });

      await testTagger.processFiles();

      expect(glob.sync).toHaveBeenCalledWith(
        '**/*.{test,spec}.{ts,tsx,js,jsx}',
        {
          ignore: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/.next/**'
          ]
        }
      );
      expect(mockLLM.ChatCompletion).toHaveBeenCalledTimes(files.length);
    });
  });

  describe('File Location Analysis and Movement', () => {
    it('should suggest and move files when moveFiles option is enabled', async () => {
      const moveFilesTagger = new TestTagger({
        ...mockOptions,
        moveFiles: true,
        interactive: false // Non-interactive for automated moving
      });
      (moveFilesTagger as any).llm = (testTagger as any).llm;

      const wrongLocationFile = '/src/integration/user.test.ts'; // Unit test in wrong location
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);
      mockFs.existsSync.mockReturnValue(false); // Target directory doesn't exist

      // Mock findProjectRoot
      vi.spyOn(moveFilesTagger as any, 'findProjectRoot').mockReturnValue('/project');

      const mockLLM = (moveFilesTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      });

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue([wrongLocationFile]);

      await moveFilesTagger.processFiles();

      // Should create target directory and move file
      expect(mockFs.mkdirSync).toHaveBeenCalled();
      expect(mockFs.renameSync).toHaveBeenCalled();
      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('git mv'),
        { stdio: 'ignore' }
      );
    });

    it('should fix file names when fixNames option is enabled', async () => {
      const fixNamesTagger = new TestTagger({
        ...mockOptions,
        fixNames: true,
        moveFiles: true
      });
      (fixNamesTagger as any).llm = (testTagger as any).llm;

      const wrongNameFile = '/src/test/unit/user.test.ts'; // Should be user.unit.test.ts
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);
      
      vi.spyOn(fixNamesTagger as any, 'findProjectRoot').mockReturnValue('/project');

      const mockLLM = (fixNamesTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      });

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue([wrongNameFile]);

      await fixNamesTagger.processFiles();

      // Should suggest correct filename
      const moveCall = mockFs.renameSync.mock.calls[0];
      if (moveCall) {
        expect(moveCall[1]).toContain('.unit.test.ts');
      }
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should continue processing other files when one file fails', async () => {
      const files = [
        path.join(tempDir, 'working.test.ts'),
        path.join(tempDir, 'broken.test.ts'),
        path.join(tempDir, 'another-working.test.ts')
      ];

      // First and third files work, second fails
      mockFs.readFileSync
        .mockReturnValueOnce(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS)
        .mockImplementationOnce(() => {
          throw new Error('File read error');
        })
        .mockReturnValueOnce(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      const mockLLM = (testTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      });

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue(files);

      await testTagger.processFiles();

      // Should process 2 files successfully, 1 should fail
      expect(mockLLM.ChatCompletion).toHaveBeenCalledTimes(2);
      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(2);
    });

    it('should handle AI provider failures gracefully', async () => {
      const filePath = path.join(tempDir, 'test.test.ts');
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      const mockLLM = (testTagger as any).llm;
      mockLLM.ChatCompletion.mockRejectedValue(new Error('AI provider unavailable'));

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue([filePath]);

      // Should not throw, should handle gracefully
      await expect(testTagger.processFiles()).resolves.not.toThrow();

      // Should not write any files due to AI failure
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should handle malformed AI responses gracefully', async () => {
      const filePath = path.join(tempDir, 'test.test.ts');
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

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

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue([filePath]);

      await testTagger.processFiles();

      // Should handle JSON parse error gracefully
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('Dry Run Mode', () => {
    it('should not modify files in dry run mode', async () => {
      const dryRunTagger = new TestTagger({
        ...mockOptions,
        dryRun: true
      });
      (dryRunTagger as any).llm = (testTagger as any).llm;

      const filePath = path.join(tempDir, 'test.test.ts');
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      const mockLLM = (dryRunTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      });

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue([filePath]);

      await dryRunTagger.processFiles();

      // Should analyze but not modify
      expect(mockLLM.ChatCompletion).toHaveBeenCalled();
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
      expect(mockFs.renameSync).not.toHaveBeenCalled();
    });

    it('should show what would be done in dry run mode', async () => {
      const dryRunTagger = new TestTagger({
        ...mockOptions,
        dryRun: true,
        verbose: true
      });
      (dryRunTagger as any).llm = (testTagger as any).llm;

      const filePath = path.join(tempDir, 'test.test.ts');
      
      mockFs.readFileSync.mockReturnValue(TEST_FILE_FIXTURES.UNIT_TEST_WITH_MOCKS);

      const mockLLM = (dryRunTagger as any).llm;
      mockLLM.ChatCompletion.mockResolvedValue({
        success: true,
        data: {
          choices: [{
            message: {
              content: JSON.stringify(AI_RESPONSE_FIXTURES.VALID_UNIT_ANALYSIS)
            }
          }]
        }
      });

      const { glob } = await import('glob');
      vi.mocked(glob.sync).mockReturnValue([filePath]);

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await dryRunTagger.processFiles();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DRY RUN] Would add tags')
      );

      consoleSpy.mockRestore();
    });
  });
});