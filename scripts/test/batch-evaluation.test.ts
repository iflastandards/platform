/**
 * @unit @testing @ai
 * @ai-reviewed by:test-suite on:2024-01-15 tags:[@unit,@testing,@ai]
 * 
 * Tests for batch evaluation functionality in the enhanced test tagger
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { EnhancedTestTagger, TagAnalysis } from '../auto-tag-tests-v2';

// Mock modules
vi.mock('fs');
vi.mock('glob');
vi.mock('child_process');

describe('Batch Evaluation Tests @unit @ai', () => {
  let tagger: EnhancedTestTagger;
  let mockFiles: Map<string, string>;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockFiles = new Map();

    // Mock file system
    vi.mocked(fs.readFileSync).mockImplementation((path: string) => {
      const content = mockFiles.get(path);
      if (!content) throw new Error(`File not found: ${path}`);
      return content;
    });

    vi.mocked(fs.writeFileSync).mockImplementation((path: string, content: string) => {
      mockFiles.set(path, content);
    });

    // Initialize tagger with test config
    tagger = new EnhancedTestTagger({
      provider: 'gemini',
      fallbackProvider: 'anthropic',
      skipReviewed: true,
      dryRun: false,
      verbose: false,
      batchSize: 5,
    });
  });

  describe('Review Status Detection', () => {
    it('should detect previously reviewed files', () => {
      const testFile = 'test.spec.ts';
      const content = `
/**
 * @unit @api
 * // @ai-reviewed by:gemini on:2024-01-10 tags:[@unit,@api,@validation]
 */
describe('Test', () => {});`;

      mockFiles.set(testFile, content);

      const analysis = tagger['checkReviewStatus'](content);
      
      expect(analysis).toBeDefined();
      expect(analysis?.provider).toBe('gemini');
      expect(analysis?.date).toBe('2024-01-10');
      expect(analysis?.tags).toEqual(['@unit', '@api', '@validation']);
    });

    it('should skip reviewed files when configured', async () => {
      const testFile = 'reviewed.test.ts';
      const content = `
/**
 * @unit
 * // @ai-reviewed by:anthropic on:2024-01-14 tags:[@unit,@ui]
 */
describe('Reviewed test', () => {});`;

      mockFiles.set(testFile, content);

      const analysis = await tagger['analyzeFile'](testFile);
      
      expect(analysis.alreadyReviewed).toBe(true);
      expect(analysis.needsUpdate).toBe(false);
      expect(analysis.provider).toBe('anthropic');
    });

    it('should re-review files when forceReview is true', async () => {
      const forceTagger = new EnhancedTestTagger({
        forceReview: true,
        skipReviewed: false,
      });

      const testFile = 'force-review.test.ts';
      const content = `
/**
 * // @ai-reviewed by:gemini on:2024-01-01 tags:[@unit]
 */
describe('Test needing update', () => {
  it('uses MSW', () => {
    server.listen();
  });
});`;

      mockFiles.set(testFile, content);

      const analysis = await forceTagger['analyzeFile'](testFile);
      
      expect(analysis.alreadyReviewed).toBe(false);
      expect(analysis.suggestedTags).toContain('@integration');
    });
  });

  describe('Tag Extraction and Analysis', () => {
    it('should extract tags from JSDoc comments', () => {
      const content = `
/**
 * @unit @api @validation @critical
 */
describe('Test', () => {});`;

      const tags = tagger['extractExistingTags'](content);
      
      expect(tags).toContain('@unit');
      expect(tags).toContain('@api');
      expect(tags).toContain('@validation');
      expect(tags).toContain('@critical');
    });

    it('should extract tags from describe blocks', () => {
      const content = `
describe('UserService @integration @api', () => {
  describe('authentication @auth @security', () => {
    it('validates tokens', () => {});
  });
});`;

      const tags = tagger['extractExistingTags'](content);
      
      expect(tags).toContain('@integration');
      expect(tags).toContain('@api');
      expect(tags).toContain('@auth');
      expect(tags).toContain('@security');
    });

    it('should analyze test content for appropriate tags', () => {
      const unitTest = `
import { render } from '@testing-library/react';
import { UserList } from './UserList';

describe('UserList component', () => {
  it('renders users', () => {
    render(<UserList users={mockUsers} />);
  });
});`;

      const tags = tagger['analyzeTestContent'](unitTest, 'UserList.test.tsx');
      
      expect(tags).toContain('@unit');
      expect(tags).toContain('@ui');
      expect(tags).not.toContain('@server-dependent');
    });

    it('should identify integration tests with MSW', () => {
      const integrationTest = `
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json(mockUsers));
  })
);

describe('UserService', () => {
  beforeAll(() => server.listen());
});`;

      const tags = tagger['analyzeTestContent'](integrationTest, 'UserService.test.ts');
      
      expect(tags).toContain('@integration');
      expect(tags).toContain('@api');
      expect(tags).not.toContain('@server-dependent');
    });

    it('should identify E2E tests', () => {
      const e2eTest = `
import { test, expect } from '@playwright/test';

test('user can complete checkout', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
});`;

      const tags = tagger['analyzeTestContent'](e2eTest, 'checkout.e2e.spec.ts');
      
      expect(tags).toContain('@e2e');
      expect(tags).toContain('@server-dependent');
      expect(tags).toContain('@local-only');
    });

    it('should identify smoke tests', () => {
      const smokeTest = `
describe('Production Health Check @smoke', () => {
  it('API responds with 200', async () => {
    const response = await fetch(process.env.PROD_URL + '/api/health');
    expect(response.status).toBe(200);
  });
});`;

      const tags = tagger['analyzeTestContent'](smokeTest, 'health.smoke.spec.ts');
      
      expect(tags).toContain('@smoke');
      expect(tags).toContain('@post-deploy');
      expect(tags).toContain('@critical');
      expect(tags).not.toContain('@server-dependent');
    });
  });

  describe('Tag Validation Rules', () => {
    it('should remove server-dependent from unit tests', () => {
      const tags = new Set(['@unit', '@server-dependent', '@local-only']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@unit')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(false);
      expect(tags.has('@local-only')).toBe(false);
    });

    it('should add required tags for smoke tests', () => {
      const tags = new Set(['@smoke']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@smoke')).toBe(true);
      expect(tags.has('@post-deploy')).toBe(true);
      expect(tags.has('@critical')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(false);
    });

    it('should add local-only to server-dependent tests', () => {
      const tags = new Set(['@integration', '@server-dependent']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@server-dependent')).toBe(true);
      expect(tags.has('@local-only')).toBe(true);
    });

    it('should add environment specification to E2E tests', () => {
      const tags = new Set(['@e2e']);
      
      tagger['applyTagValidationRules'](tags);
      
      expect(tags.has('@e2e')).toBe(true);
      expect(tags.has('@server-dependent')).toBe(true);
      expect(tags.has('@local-only')).toBe(true);
    });
  });

  describe('File Updates', () => {
    it('should add review comment when updating file', () => {
      const testFile = 'update.test.ts';
      const originalContent = `
describe('Test', () => {
  it('does something', () => {});
});`;

      mockFiles.set(testFile, originalContent);

      const analysis: TagAnalysis = {
        file: testFile,
        existingTags: [],
        suggestedTags: ['@unit', '@ui'],
        confidence: 0.95,
        provider: 'gemini',
        reasoning: 'Unit test with UI components',
        needsUpdate: true,
        alreadyReviewed: false,
      };

      tagger['updateTestFile'](testFile, analysis);
      
      const updatedContent = mockFiles.get(testFile);
      expect(updatedContent).toContain('@unit @ui');
      expect(updatedContent).toContain('// @ai-reviewed by:gemini');
      expect(updatedContent).toMatch(/on:\d{4}-\d{2}-\d{2}/);
      expect(updatedContent).toContain('tags:[@unit,@ui]');
    });

    it('should update existing JSDoc with new tags', () => {
      const testFile = 'existing-jsdoc.test.ts';
      const originalContent = `
/**
 * @integration
 * This is a test file
 */
describe('Test', () => {});`;

      mockFiles.set(testFile, originalContent);

      const analysis: TagAnalysis = {
        file: testFile,
        existingTags: ['@integration'],
        suggestedTags: ['@integration', '@api', '@auth'],
        confidence: 0.9,
        provider: 'anthropic',
        reasoning: 'Integration test with auth API',
        needsUpdate: true,
        alreadyReviewed: false,
      };

      tagger['updateTestFile'](testFile, analysis);
      
      const updatedContent = mockFiles.get(testFile);
      expect(updatedContent).toContain('@integration @api @auth');
      expect(updatedContent).toContain('// @ai-reviewed by:anthropic');
    });

    it('should respect dry-run mode', () => {
      const dryRunTagger = new EnhancedTestTagger({
        dryRun: true,
      });

      const testFile = 'dry-run.test.ts';
      const originalContent = `describe('Test', () => {});`;
      mockFiles.set(testFile, originalContent);

      const analysis: TagAnalysis = {
        file: testFile,
        existingTags: [],
        suggestedTags: ['@unit'],
        confidence: 0.95,
        provider: 'local',
        reasoning: 'Unit test',
        needsUpdate: true,
        alreadyReviewed: false,
      };

      dryRunTagger['updateTestFile'](testFile, analysis);
      
      // Content should not change in dry-run mode
      expect(mockFiles.get(testFile)).toBe(originalContent);
    });
  });

  describe('Batch Processing', () => {
    it('should process files in batches', async () => {
      const files = Array.from({ length: 12 }, (_, i) => `test${i}.test.ts`);
      
      files.forEach(file => {
        mockFiles.set(file, `describe('Test ${file}', () => {});`);
      });

      const processBatchSpy = vi.spyOn(tagger as any, 'processBatch');
      
      // Mock glob to return our test files
      const glob = await import('glob');
      vi.mocked(glob.glob).mockResolvedValue(files);

      await tagger.runBatchEvaluation();
      
      // With batchSize=5, we should have 3 batches (5, 5, 2)
      expect(processBatchSpy).toHaveBeenCalledTimes(3);
    });

    it('should track statistics during batch processing', async () => {
      const files = ['reviewed.test.ts', 'needs-update.test.ts', 'correct.test.ts'];
      
      // Reviewed file
      mockFiles.set('reviewed.test.ts', `
/**
 * // @ai-reviewed by:gemini on:2024-01-10 tags:[@unit]
 */
describe('Reviewed', () => {});`);

      // Needs update
      mockFiles.set('needs-update.test.ts', `
describe('Needs update', () => {
  it('uses MSW', () => { server.listen(); });
});`);

      // Correct tags
      mockFiles.set('correct.test.ts', `
/**
 * @unit @ui
 */
describe('Correct', () => {
  it('renders', () => { render(<Component />); });
});`);

      const results = await tagger['processBatch'](files);
      
      expect(results).toHaveLength(3);
      expect(results[0].alreadyReviewed).toBe(true);
      expect(results[1].needsUpdate).toBe(true);
      expect(results[2].needsUpdate).toBe(false);
    });
  });

  describe('AI Provider Fallback', () => {
    it('should fall back to Anthropic when Gemini confidence is low', async () => {
      const mockCallAIProvider = vi.spyOn(tagger as any, 'callAIProvider');
      
      // Mock Gemini returning low confidence
      mockCallAIProvider.mockImplementationOnce(async () => ({
        tags: ['@unit'],
        confidence: 0.6, // Below threshold
        reasoning: 'Low confidence',
      }));

      // Mock Anthropic returning high confidence
      mockCallAIProvider.mockImplementationOnce(async () => ({
        tags: ['@integration', '@api'],
        confidence: 0.95,
        reasoning: 'High confidence from Anthropic',
      }));

      const testFile = 'fallback.test.ts';
      mockFiles.set(testFile, `describe('Test', () => {});`);

      // Need to set API keys for this test
      tagger['config'].apiKey = 'test-gemini-key';
      tagger['config'].fallbackApiKey = 'test-anthropic-key';

      const analysis = await tagger['analyzeFile'](testFile);
      
      expect(mockCallAIProvider).toHaveBeenCalledTimes(2);
      expect(analysis.provider).toBe('anthropic');
      expect(analysis.suggestedTags).toEqual(['@integration', '@api']);
      expect(analysis.confidence).toBe(0.95);
    });

    it('should use local analysis when no API keys available', async () => {
      const noApiTagger = new EnhancedTestTagger({
        provider: 'gemini',
        apiKey: undefined,
        fallbackApiKey: undefined,
      });

      const testFile = 'local-only.test.ts';
      mockFiles.set(testFile, `
import { render } from '@testing-library/react';
describe('Component test', () => {
  it('renders', () => { render(<div />); });
});`);

      const analysis = await noApiTagger['analyzeFile'](testFile);
      
      expect(analysis.provider).toBe('local');
      expect(analysis.confidence).toBe(0.7);
      expect(analysis.suggestedTags).toContain('@unit');
      expect(analysis.suggestedTags).toContain('@ui');
    });
  });

  describe('Staged Files Evaluation', () => {
    it('should process only staged test files', async () => {
      const { execSync } = await import('child_process');
      
      // Mock git command to return staged files
      vi.mocked(execSync).mockReturnValueOnce(
        Buffer.from('src/components/Button.test.tsx\nsrc/api/user.test.ts\nsrc/utils.js')
      );

      // Mock the test files
      mockFiles.set('src/components/Button.test.tsx', `
describe('Button', () => {
  it('renders', () => { render(<Button />); });
});`);

      mockFiles.set('src/api/user.test.ts', `
describe('User API', () => {
  it('fetches users', () => {});
});`);

      const analyzeFileSpy = vi.spyOn(tagger as any, 'analyzeFile');
      
      await tagger.runStagedEvaluation();
      
      // Should only process the two test files, not utils.js
      expect(analyzeFileSpy).toHaveBeenCalledTimes(2);
      expect(analyzeFileSpy).toHaveBeenCalledWith('src/components/Button.test.tsx');
      expect(analyzeFileSpy).toHaveBeenCalledWith('src/api/user.test.ts');
    });

    it('should re-stage files after updating', async () => {
      const { execSync } = await import('child_process');
      
      vi.mocked(execSync)
        .mockReturnValueOnce(Buffer.from('test.spec.ts')) // git diff
        .mockReturnValueOnce(Buffer.from('')) // git add
        .mockReturnValueOnce(Buffer.from('')); // git add after update

      mockFiles.set('test.spec.ts', `describe('Test', () => {});`);

      await tagger.runStagedEvaluation();
      
      // Should call git add after updating the file
      expect(execSync).toHaveBeenCalledWith('git add test.spec.ts');
    });
  });
});

describe('AI Prompt Building @unit @ai', () => {
  let tagger: EnhancedTestTagger;

  beforeEach(() => {
    tagger = new EnhancedTestTagger();
  });

  it('should build comprehensive prompts for AI analysis', () => {
    const testContent = `
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/users', handler)
);

describe('UserService @api', () => {
  beforeAll(() => server.listen());
  
  it('fetches and validates user data', async () => {
    const users = await fetchUsers();
    expect(users).toHaveLength(3);
  });
});`;

    const prompt = tagger['buildAIPrompt'](testContent, 'UserService.test.ts');
    
    expect(prompt).toContain('UserService.test.ts');
    expect(prompt).toContain('@unit');
    expect(prompt).toContain('@integration');
    expect(prompt).toContain('@e2e');
    expect(prompt).toContain('Rules:');
    expect(prompt).toContain('Unit tests CANNOT be @server-dependent');
    expect(prompt).toContain(testContent.slice(0, 3000));
  });

  it('should truncate long test content in prompts', () => {
    const longContent = 'x'.repeat(5000);
    const prompt = tagger['buildAIPrompt'](longContent, 'long.test.ts');
    
    expect(prompt).toContain(longContent.slice(0, 3000));
    expect(prompt).not.toContain(longContent.slice(3001));
  });
});