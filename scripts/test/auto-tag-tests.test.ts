/**
 * @integration @critical @testing
 * Tests for the AI-powered test file tagging tool
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestTagger, TestAnalysis, ProcessingOptions } from '../auto-tag-tests';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Mock the external dependencies
vi.mock('fs');
vi.mock('child_process');
vi.mock('glob');
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
vi.mock('inquirer');
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn()
  }
}));

// Mock AI provider modules
vi.mock('@memberjunction/ai-anthropic', () => ({
  AnthropicLLM: vi.fn()
}));
vi.mock('@memberjunction/ai-gemini', () => ({
  GeminiLLM: vi.fn()
}));
vi.mock('@memberjunction/ai-openai', () => ({
  OpenAILLM: vi.fn()
}));

const mockFs = vi.mocked(fs);
const mockExecSync = vi.mocked(execSync);

describe('TestTagger', () => {
  let testTagger: TestTagger;
  let mockOptions: ProcessingOptions;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockOptions = {
      provider: 'anthropic',
      dryRun: true,
      interactive: false,
      affected: false,
      staged: false,
      verbose: false,
      moveFiles: false,
      fixNames: false
    };

    // Set up environment variable mock
    process.env.ANTHROPIC_API_KEY = 'mock-api-key';
    
    testTagger = new TestTagger(mockOptions);
  });

  afterEach(() => {
    vi.resetAllMocks();
    delete process.env.ANTHROPIC_API_KEY;
  });

  describe('constructor', () => {
    it('should create TestTagger with provided options', () => {
      expect(testTagger).toBeInstanceOf(TestTagger);
    });

    it('should initialize with correct default options', () => {
      const defaultTagger = new TestTagger({
        provider: 'gemini',
        dryRun: false,
        interactive: true,
        affected: false,
        staged: false,
        verbose: true,
        moveFiles: true,
        fixNames: true
      });
      expect(defaultTagger).toBeInstanceOf(TestTagger);
    });
  });

  describe('initialize', () => {
    it('should initialize AI provider successfully', async () => {
      const mockLLMInstance = {
        ChatCompletion: vi.fn(),
        SetAdditionalSettings: vi.fn(),
        ClearAdditionalSettings: vi.fn()
      };

      // Mock dynamic import
      vi.doMock('@memberjunction/ai-anthropic', () => ({
        AnthropicLLM: vi.fn(() => mockLLMInstance)
      }));

      await expect(testTagger.initialize()).resolves.not.toThrow();
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      
      await expect(testTagger.initialize()).rejects.toThrow(
        'ANTHROPIC_API_KEY not found in environment'
      );
    });

    it('should throw error for unknown provider', async () => {
      const invalidTagger = new TestTagger({
        ...mockOptions,
        provider: 'invalid-provider' as any
      });
      
      await expect(invalidTagger.initialize()).rejects.toThrow(
        'Unknown provider: invalid-provider'
      );
    });
  });

  describe('analyzeTestFile', () => {
    beforeEach(() => {
      // Mock successful initialization
      const mockLLMInstance = {
        ChatCompletion: vi.fn().mockResolvedValue({
          success: true,
          data: {
            choices: [{
              message: {
                content: JSON.stringify({
                  classification: 'unit',
                  confidence: 'high',
                  tags: ['@unit', '@critical', '@api'],
                  reasoning: 'This is a unit test with mocked dependencies',
                  concerns: [],
                  recommendations: []
                })
              }
            }]
          }
        }),
        SetAdditionalSettings: vi.fn(),
        ClearAdditionalSettings: vi.fn()
      };
      
      (testTagger as any).llm = mockLLMInstance;
    });

    it('should analyze test file successfully', async () => {
      const mockFileContent = `
        import { vi } from 'vitest';
        import { UserService } from '../UserService';
        
        vi.mock('../UserService');
        
        describe('UserController', () => {
          it('should create user successfully', () => {
            // test implementation
          });
        });
      `;

      mockFs.readFileSync.mockReturnValue(mockFileContent);

      const result = await testTagger.analyzeTestFile('/path/to/test.test.ts');

      expect(result).toEqual({
        classification: 'unit',
        confidence: 'high',
        tags: ['@unit', '@critical', '@api'],
        reasoning: 'This is a unit test with mocked dependencies',
        concerns: [],
        recommendations: []
      });
    });

    it('should handle malformed AI response gracefully', async () => {
      const mockLLMInstance = {
        ChatCompletion: vi.fn().mockResolvedValue({
          success: true,
          data: {
            choices: [{
              message: {
                content: 'Invalid JSON response'
              }
            }]
          }
        })
      };
      
      (testTagger as any).llm = mockLLMInstance;
      mockFs.readFileSync.mockReturnValue('test content');

      await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
        .rejects.toThrow();
    });

    it('should handle AI provider errors', async () => {
      const mockLLMInstance = {
        ChatCompletion: vi.fn().mockResolvedValue({
          success: false,
          message: 'AI provider error'
        })
      };
      
      (testTagger as any).llm = mockLLMInstance;
      mockFs.readFileSync.mockReturnValue('test content');

      await expect(testTagger.analyzeTestFile('/path/to/test.test.ts'))
        .rejects.toThrow('AI provider error');
    });

    it('should throw error when not initialized', async () => {
      const uninitializedTagger = new TestTagger(mockOptions);

      await expect(uninitializedTagger.analyzeTestFile('/path/to/test.test.ts'))
        .rejects.toThrow('TestTagger not initialized');
    });
  });

  describe('getModelName', () => {
    it('should return correct default model for each provider', () => {
      const anthropicTagger = new TestTagger({ ...mockOptions, provider: 'anthropic' });
      expect((anthropicTagger as any).getModelName()).toBe('claude-3-haiku-20240307');

      const geminiTagger = new TestTagger({ ...mockOptions, provider: 'gemini' });
      expect((geminiTagger as any).getModelName()).toBe('gemini-1.5-flash');

      const openaiTagger = new TestTagger({ ...mockOptions, provider: 'openai' });
      expect((openaiTagger as any).getModelName()).toBe('gpt-4o-mini');

      const perplexityTagger = new TestTagger({ ...mockOptions, provider: 'perplexity' });
      expect((perplexityTagger as any).getModelName()).toBe('sonar-small-online');
    });

    it('should return custom model when specified', () => {
      const customTagger = new TestTagger({
        ...mockOptions,
        provider: 'anthropic',
        model: 'claude-3-opus-20240229'
      });
      expect((customTagger as any).getModelName()).toBe('claude-3-opus-20240229');
    });
  });

  describe('buildPrompt', () => {
    it('should build comprehensive prompt for analysis', () => {
      const fileName = 'user.test.ts';
      const filePath = '/src/test/user.test.ts';
      const content = 'describe("UserService", () => {})';

      const prompt = (testTagger as any).buildPrompt(fileName, filePath, content);

      expect(prompt).toContain(fileName);
      expect(prompt).toContain(filePath);
      expect(prompt).toContain(content);
      expect(prompt).toContain('STRICT RULES TO FOLLOW');
      expect(prompt).toContain('@unit');
      expect(prompt).toContain('@integration');
      expect(prompt).toContain('@e2e');
      expect(prompt).toContain('@smoke');
    });

    it('should truncate very long content', () => {
      const fileName = 'large.test.ts';
      const filePath = '/src/test/large.test.ts';
      const content = 'x'.repeat(10000);

      const prompt = (testTagger as any).buildPrompt(fileName, filePath, content);

      expect(prompt).toContain('content truncated for analysis');
      expect(prompt.length).toBeLessThan(content.length + 5000);
    });
  });

  describe('analyzeFileLocation', () => {
    it('should return null for correctly located unit test', () => {
      const filePath = '/src/test/unit/user.unit.test.ts';
      const classification = 'unit';

      const result = (testTagger as any).analyzeFileLocation(filePath, classification);

      expect(result).toBeNull();
    });

    it('should suggest relocation for misplaced test', () => {
      const filePath = '/src/test/integration/user.test.ts';
      const classification = 'unit';

      const result = (testTagger as any).analyzeFileLocation(filePath, classification);

      expect(result).not.toBeNull();
      expect(result.currentPath).toBe(filePath);
      expect(result.reason).toContain('unit test found in wrong directory type');
      expect(result.confidence).toBe('high');
    });

    it('should suggest filename fix when fixNames is enabled', () => {
      const taggerWithFixNames = new TestTagger({
        ...mockOptions,
        fixNames: true
      });

      const filePath = '/src/test/unit/user.test.ts';
      const classification = 'unit';

      // Mock findProjectRoot
      vi.spyOn(taggerWithFixNames as any, 'findProjectRoot').mockReturnValue('/project');

      const result = (taggerWithFixNames as any).analyzeFileLocation(filePath, classification);

      expect(result).not.toBeNull();
      expect(result.suggestedPath).toContain('.unit.test.ts');
    });
  });

  describe('findProjectRoot', () => {
    it('should find project root with package.json', () => {
      mockFs.existsSync
        .mockReturnValueOnce(false) // First check fails
        .mockReturnValueOnce(true);  // Second check finds package.json

      const result = (testTagger as any).findProjectRoot('/project/src/test/file.test.ts');

      expect(result).toBeTruthy();
    });

    it('should find project root with project.json', () => {
      mockFs.existsSync
        .mockReturnValueOnce(false) // package.json check fails
        .mockReturnValueOnce(false) // package.json check fails again
        .mockReturnValueOnce(true);  // project.json check succeeds

      const result = (testTagger as any).findProjectRoot('/project/src/test/file.test.ts');

      expect(result).toBeTruthy();
    });
  });

  describe('getFilesToProcess', () => {
    beforeEach(() => {
      // Mock glob
      vi.doMock('glob', () => ({
        glob: {
          sync: vi.fn().mockReturnValue([
            'src/user.test.ts',
            'src/api.integration.test.ts',
            'e2e/login.e2e.spec.ts'
          ])
        }
      }));
    });

    it('should get staged files when staged option is true', async () => {
      const stagedTagger = new TestTagger({
        ...mockOptions,
        staged: true
      });

      mockExecSync.mockReturnValue('src/user.test.ts\nsrc/api.test.ts\n');

      const result = await (stagedTagger as any).getFilesToProcess();

      expect(mockExecSync).toHaveBeenCalledWith('git diff --staged --name-only', {
        encoding: 'utf8'
      });
      expect(result).toEqual(['src/user.test.ts', 'src/api.test.ts']);
    });

    it('should get affected files when affected option is true', async () => {
      const affectedTagger = new TestTagger({
        ...mockOptions,
        affected: true
      });

      mockExecSync.mockReturnValue('src/user.test.ts\nsrc/api.test.ts\n');

      const result = await (affectedTagger as any).getFilesToProcess();

      expect(mockExecSync).toHaveBeenCalledWith(
        'pnpm nx print-affected --type=app --select=files',
        { encoding: 'utf8' }
      );
      expect(result).toEqual(['src/user.test.ts', 'src/api.test.ts']);
    });

    it('should handle git command failures gracefully', async () => {
      const stagedTagger = new TestTagger({
        ...mockOptions,
        staged: true
      });

      mockExecSync.mockImplementation(() => {
        throw new Error('Git command failed');
      });

      const result = await (stagedTagger as any).getFilesToProcess();

      expect(result).toEqual([]);
    });

    it('should use glob pattern when no specific options are set', async () => {
      const { glob } = await import('glob');
      const mockGlob = vi.mocked(glob.sync);
      
      mockGlob.mockReturnValue([
        'src/user.test.ts',
        'src/api.integration.test.ts'
      ]);

      const result = await (testTagger as any).getFilesToProcess();

      expect(mockGlob).toHaveBeenCalledWith('**/*.{test,spec}.{ts,tsx,js,jsx}', {
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/.next/**'
        ]
      });
      expect(result).toEqual(['src/user.test.ts', 'src/api.integration.test.ts']);
    });

    it('should use custom pattern when specified', async () => {
      const patternTagger = new TestTagger({
        ...mockOptions,
        pattern: 'src/**/*.unit.test.ts'
      });

      const { glob } = await import('glob');
      const mockGlob = vi.mocked(glob.sync);
      
      mockGlob.mockReturnValue(['src/user.unit.test.ts']);

      const result = await (patternTagger as any).getFilesToProcess();

      expect(mockGlob).toHaveBeenCalledWith('src/**/*.unit.test.ts', {
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/.next/**'
        ]
      });
      expect(result).toEqual(['src/user.unit.test.ts']);
    });
  });

  describe('applyTags', () => {
    it('should add tags to file without existing tags', async () => {
      const mockContent = `import { describe, it } from 'vitest';

describe('UserService', () => {
  it('should create user', () => {
    // test implementation
  });
});`;

      const expectedContent = `import { describe, it } from 'vitest';

/**
 * @unit @critical @api
 */
describe('UserService', () => {
  it('should create user', () => {
    // test implementation
  });
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.writeFileSync = vi.fn();

      const nonDryRunTagger = new TestTagger({
        ...mockOptions,
        dryRun: false
      });

      await (nonDryRunTagger as any).applyTags(
        '/path/to/test.test.ts',
        ['@unit', '@critical', '@api']
      );

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/path/to/test.test.ts',
        expect.stringContaining('@unit @critical @api')
      );
    });

    it('should update existing tags', async () => {
      const mockContent = `/**
 * @unit @low-priority
 */
describe('UserService', () => {
  it('should create user', () => {
    // test implementation
  });
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.writeFileSync = vi.fn();

      const nonDryRunTagger = new TestTagger({
        ...mockOptions,
        dryRun: false
      });

      await (nonDryRunTagger as any).applyTags(
        '/path/to/test.test.ts',
        ['@unit', '@critical', '@api']
      );

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/path/to/test.test.ts',
        expect.stringContaining('@unit @critical @api')
      );
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/path/to/test.test.ts',
        expect.not.stringContaining('@low-priority')
      );
    });

    it('should not modify files in dry run mode', async () => {
      const mockContent = 'describe("test", () => {});';
      mockFs.readFileSync.mockReturnValue(mockContent);
      mockFs.writeFileSync = vi.fn();

      await (testTagger as any).applyTags(
        '/path/to/test.test.ts',
        ['@unit', '@critical']
      );

      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should handle files without test blocks gracefully', async () => {
      const mockContent = 'export const helper = () => {};';
      mockFs.readFileSync.mockReturnValue(mockContent);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await (testTagger as any).applyTags(
        '/path/to/helper.test.ts',
        ['@unit', '@critical']
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot find test block')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('moveTestFile', () => {
    it('should move file and update git when file is tracked', async () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync = vi.fn();
      mockFs.renameSync = vi.fn();
      mockExecSync.mockImplementation(() => ''); // git mv succeeds

      await (testTagger as any).moveTestFile(
        '/src/wrong/test.test.ts',
        '/src/unit/test.unit.test.ts'
      );

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/src/unit', { recursive: true });
      expect(mockFs.renameSync).toHaveBeenCalledWith(
        '/src/wrong/test.test.ts',
        '/src/unit/test.unit.test.ts'
      );
      expect(mockExecSync).toHaveBeenCalledWith(
        'git mv "/src/wrong/test.test.ts" "/src/unit/test.unit.test.ts"',
        { stdio: 'ignore' }
      );
    });

    it('should handle git mv failure gracefully', async () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.renameSync = vi.fn();
      mockExecSync.mockImplementation(() => {
        throw new Error('File not tracked');
      });

      await expect((testTagger as any).moveTestFile(
        '/src/wrong/test.test.ts',
        '/src/unit/test.unit.test.ts'
      )).resolves.not.toThrow();

      expect(mockFs.renameSync).toHaveBeenCalled();
    });
  });

  describe('extractContentFromResult', () => {
    it('should extract content from standard OpenAI format', () => {
      const result = {
        success: true,
        data: {
          choices: [{
            message: {
              content: '{"classification": "unit"}'
            }
          }]
        }
      };

      const content = (testTagger as any).extractContentFromResult(result);
      expect(content).toBe('{"classification": "unit"}');
    });

    it('should extract content from alternative format', () => {
      const result = {
        success: true,
        data: {
          choices: [{
            text: '{"classification": "integration"}'
          }]
        }
      };

      const content = (testTagger as any).extractContentFromResult(result);
      expect(content).toBe('{"classification": "integration"}');
    });

    it('should throw error when no content found', () => {
      const result = {
        success: true,
        data: {
          choices: [{}]
        }
      };

      expect(() => (testTagger as any).extractContentFromResult(result))
        .toThrow('Could not extract content from AI provider response');
    });
  });

  describe('parseAnalysis', () => {
    it('should parse valid JSON analysis', () => {
      const content = `{
        "classification": "unit",
        "confidence": "high",
        "tags": ["@unit", "@api"],
        "reasoning": "Test uses mocks",
        "concerns": [],
        "recommendations": []
      }`;

      const analysis = (testTagger as any).parseAnalysis(content);

      expect(analysis).toEqual({
        classification: 'unit',
        confidence: 'high',
        tags: ['@unit', '@api'],
        reasoning: 'Test uses mocks',
        concerns: [],
        recommendations: []
      });
    });

    it('should parse JSON wrapped in markdown code blocks', () => {
      const content = '```json\n{"classification": "unit"}\n```';

      const analysis = (testTagger as any).parseAnalysis(content);

      expect(analysis.classification).toBe('unit');
    });

    it('should provide defaults for missing fields', () => {
      const content = '{"classification": "e2e"}';

      const analysis = (testTagger as any).parseAnalysis(content);

      expect(analysis).toEqual({
        classification: 'e2e',
        confidence: 'low',
        tags: [],
        reasoning: 'No reasoning provided',
        concerns: [],
        recommendations: []
      });
    });

    it('should throw error for invalid JSON', () => {
      const content = 'invalid json content';

      expect(() => (testTagger as any).parseAnalysis(content))
        .toThrow();
    });
  });
});