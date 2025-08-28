/**
 * @unit @testing @tracking @validation @high-priority
 * @ai-reviewed by:test-suite on:2024-01-15 tags:[@unit,@testing,@tracking]
 * 
 * Tests for review comment tracking and management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import { EnhancedTestTagger, type TagAnalysis } from '../auto-tag-tests-v2';

describe('Review Comment Tracking @unit @tracking', () => {
  let tagger: EnhancedTestTagger;
  let mockFiles: Map<string, string>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFiles = new Map();

    vi.mocked(fs.readFileSync).mockImplementation((path: string) => {
      const content = mockFiles.get(path);
      if (!content) {throw new Error(`File not found: ${path}`);}
      return content;
    });

    vi.mocked(fs.writeFileSync).mockImplementation((path: string, content: string) => {
      mockFiles.set(path, content);
    });

    tagger = new EnhancedTestTagger({
      skipReviewed: true,
      dryRun: false
    });
  });

  describe('Review Comment Detection', () => {
    it('should detect review comments in various formats', () => {
      const testCases = [
        {
          content: `// @ai-reviewed by:gemini on:2024-01-15 tags:[@unit,@ui]`,
          expected: {
            provider: 'gemini',
            date: '2024-01-15',
            tags: ['@unit', '@ui']
          }
        },
        {
          content: `// @ai-reviewed by:anthropic on:2024-12-25 tags:[@integration,@api,@auth]`,
          expected: {
            provider: 'anthropic',
            date: '2024-12-25',
            tags: ['@integration', '@api', '@auth']
          }
        },
        {
          content: `// @ai-reviewed by:openai on:2023-06-01 tags:[@e2e]`,
          expected: {
            provider: 'openai',
            date: '2023-06-01',
            tags: ['@e2e']
          }
        }
      ];

      testCases.forEach(({ content, expected }) => {
        const result = tagger['checkReviewStatus'](content);
        expect(result).toEqual(expected);
      });
    });

    it('should detect review comments within JSDoc', () => {
      const content = `
/**
 * @unit @ui @validation
 * // @ai-reviewed by:gemini on:2024-01-10 tags:[@unit,@ui,@validation]
 */
describe('Test', () => {});`;

      const result = tagger['checkReviewStatus'](content);
      
      expect(result).toBeDefined();
      expect(result?.provider).toBe('gemini');
      expect(result?.date).toBe('2024-01-10');
      expect(result?.tags).toEqual(['@unit', '@ui', '@validation']);
    });

    it('should return undefined when no review comment exists', () => {
      const content = `
/**
 * @unit @api
 */
describe('Unreviewed test', () => {});`;

      const result = tagger['checkReviewStatus'](content);
      expect(result).toBeUndefined();
    });

    it('should handle review comments with spaces in tags', () => {
      const content = `// @ai-reviewed by:gemini on:2024-01-15 tags:[ @unit , @ui , @validation ]`;
      
      const result = tagger['checkReviewStatus'](content);
      expect(result?.tags).toEqual(['@unit', '@ui', '@validation']);
    });

    it('should handle empty tag lists', () => {
      const content = `// @ai-reviewed by:local on:2024-01-15 tags:[]`;
      
      const result = tagger['checkReviewStatus'](content);
      expect(result?.tags).toEqual([]);
    });
  });

  describe('Review Comment Addition', () => {
    it('should add review comment to unreviewed file', () => {
      const testFile = 'unreviewed.test.ts';
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
        reasoning: 'Unit test with UI',
        needsUpdate: true,
        alreadyReviewed: false
      };

      tagger['updateTestFile'](testFile, analysis);
      
      const updated = mockFiles.get(testFile);
      expect(updated).toContain('// @ai-reviewed by:gemini');
      expect(updated).toMatch(/on:\d{4}-\d{2}-\d{2}/);
      expect(updated).toContain('tags:[@unit,@ui]');
    });

    it('should add review comment to JSDoc', () => {
      const testFile = 'jsdoc.test.ts';
      const originalContent = `
/**
 * @unit @api
 * Test description
 */
describe('Test', () => {});`;

      mockFiles.set(testFile, originalContent);

      const analysis: TagAnalysis = {
        file: testFile,
        existingTags: ['@unit', '@api'],
        suggestedTags: ['@unit', '@api', '@validation'],
        confidence: 0.9,
        provider: 'anthropic',
        reasoning: 'Added validation tag',
        needsUpdate: true,
        alreadyReviewed: false
      };

      tagger['updateTestFile'](testFile, analysis);
      
      const updated = mockFiles.get(testFile);
      expect(updated).toContain('@unit @api @validation');
      expect(updated).toContain('// @ai-reviewed by:anthropic');
      expect(updated).toContain('tags:[@unit,@api,@validation]');
    });

    it('should replace existing review comment', () => {
      const testFile = 'reviewed.test.ts';
      const originalContent = `
/**
 * @unit
 * // @ai-reviewed by:gemini on:2024-01-01 tags:[@unit]
 */
describe('Test', () => {});`;

      mockFiles.set(testFile, originalContent);

      const analysis: TagAnalysis = {
        file: testFile,
        existingTags: ['@unit'],
        suggestedTags: ['@integration', '@api'],
        confidence: 0.95,
        provider: 'anthropic',
        reasoning: 'Re-evaluated as integration test',
        needsUpdate: true,
        alreadyReviewed: false
      };

      tagger['updateTestFile'](testFile, analysis);
      
      const updated = mockFiles.get(testFile);
      
      // Should not have old review comment
      expect(updated).not.toContain('on:2024-01-01');
      expect(updated).not.toContain('by:gemini');
      
      // Should have new review comment
      expect(updated).toContain('// @ai-reviewed by:anthropic');
      expect(updated).toContain('tags:[@integration,@api]');
      
      // Should only have one review comment
      const reviewMatches = updated!.match(/\/\/\s*@ai-reviewed/g);
      expect(reviewMatches).toHaveLength(1);
    });

    it('should create JSDoc if missing', () => {
      const testFile = 'no-jsdoc.test.ts';
      const originalContent = `describe('Test', () => {
  it('works', () => {});
});`;

      mockFiles.set(testFile, originalContent);

      const analysis: TagAnalysis = {
        file: testFile,
        existingTags: [],
        suggestedTags: ['@e2e', '@auth'],
        confidence: 0.88,
        provider: 'local',
        reasoning: 'E2E auth test',
        needsUpdate: true,
        alreadyReviewed: false
      };

      tagger['updateTestFile'](testFile, analysis);
      
      const updated = mockFiles.get(testFile);
      
      // Should start with JSDoc
      expect(updated).toMatch(/^\/\*\*/);
      expect(updated).toContain('@e2e @auth');
      expect(updated).toContain('// @ai-reviewed by:local');
      expect(updated).toContain('*/\n\ndescribe');
    });

    it('should format date correctly', () => {
      const testFile = 'date.test.ts';
      mockFiles.set(testFile, 'describe("Test", () => {});');

      const analysis: TagAnalysis = {
        file: testFile,
        existingTags: [],
        suggestedTags: ['@unit'],
        confidence: 0.95,
        provider: 'gemini',
        reasoning: 'Unit test',
        needsUpdate: true,
        alreadyReviewed: false
      };

      // Mock Date to ensure consistent testing
      const mockDate = new Date('2024-03-15');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      tagger['updateTestFile'](testFile, analysis);
      
      const updated = mockFiles.get(testFile);
      expect(updated).toContain('on:2024-03-15');
    });
  });

  describe('Skip Reviewed Files', () => {
    it('should skip files with review comments when skipReviewed is true', async () => {
      const testFile = 'already-reviewed.test.ts';
      const content = `
/**
 * @unit @ui
 * // @ai-reviewed by:gemini on:2024-01-10 tags:[@unit,@ui]
 */
describe('Reviewed test', () => {});`;

      mockFiles.set(testFile, content);

      const analysis = await tagger['analyzeFile'](testFile);
      
      expect(analysis.alreadyReviewed).toBe(true);
      expect(analysis.needsUpdate).toBe(false);
      expect(analysis.lastReviewInfo).toEqual({
        provider: 'gemini',
        date: '2024-01-10',
        tags: ['@unit', '@ui']
      });
    });

    it('should process reviewed files when skipReviewed is false', async () => {
      const noSkipTagger = new EnhancedTestTagger({
        skipReviewed: false,
        forceReview: true
      });

      const testFile = 'force-review.test.ts';
      const content = `
/**
 * @unit
 * // @ai-reviewed by:gemini on:2024-01-01 tags:[@unit]
 */
describe('Test', () => {
  it('uses MSW', () => { server.listen(); });
});`;

      mockFiles.set(testFile, content);

      const analysis = await noSkipTagger['analyzeFile'](testFile);
      
      expect(analysis.alreadyReviewed).toBe(false);
      expect(analysis.suggestedTags).toContain('@integration');
    });

    it('should process files when forceReview is true regardless of skipReviewed', async () => {
      const forceTagger = new EnhancedTestTagger({
        skipReviewed: true,  // Would normally skip
        forceReview: true    // But force overrides
      });

      const testFile = 'force.test.ts';
      const content = `
/**
 * // @ai-reviewed by:local on:2024-01-01 tags:[@unit]
 */
describe('Force review', () => {});`;

      mockFiles.set(testFile, content);

      const analysis = await forceTagger['analyzeFile'](testFile);
      
      expect(analysis.alreadyReviewed).toBe(false);
      // Should re-analyze despite review comment
    });
  });

  describe('Review Comment Preservation', () => {
    it('should preserve other comments when updating', () => {
      const testFile = 'preserve.test.ts';
      const originalContent = `
/**
 * @unit
 * This is an important test
 * TODO: Add more test cases
 */
// Another comment
describe('Test', () => {});`;

      mockFiles.set(testFile, originalContent);

      const analysis: TagAnalysis = {
        file: testFile,
        existingTags: ['@unit'],
        suggestedTags: ['@unit', '@validation'],
        confidence: 0.9,
        provider: 'gemini',
        reasoning: 'Added validation',
        needsUpdate: true,
        alreadyReviewed: false
      };

      tagger['updateTestFile'](testFile, analysis);
      
      const updated = mockFiles.get(testFile);
      
      // Should preserve other comments
      expect(updated).toContain('This is an important test');
      expect(updated).toContain('TODO: Add more test cases');
      expect(updated).toContain('// Another comment');
      
      // Should add review comment
      expect(updated).toContain('// @ai-reviewed by:gemini');
    });

    it.skip('should handle multi-line JSDoc correctly', () => {
      const testFile = 'multiline.test.ts';
      const originalContent = `
/**
 * @integration @api
 * 
 * This test validates the user authentication flow
 * including token generation and validation.
 * 
 * @see https://docs.example.com/auth
 */
describe('Auth test', () => {});`;

      mockFiles.set(testFile, originalContent);

      const analysis: TagAnalysis = {
        file: testFile,
        existingTags: ['@integration', '@api'],
        suggestedTags: ['@integration', '@api', '@auth', '@security'],
        confidence: 0.95,
        provider: 'anthropic',
        reasoning: 'Auth and security tags added',
        needsUpdate: true,
        alreadyReviewed: false
      };

      tagger['updateTestFile'](testFile, analysis);
      
      const updated = mockFiles.get(testFile);
      
      // Should preserve documentation
      expect(updated).toContain('This test validates the user authentication flow');
      expect(updated).toContain('including token generation and validation');
      expect(updated).toContain('@see https://docs.example.com/auth');
      
      // Should update tags
      expect(updated).toContain('@integration @api @auth @security');
      
      // Should add review comment
      expect(updated).toContain('// @ai-reviewed by:anthropic');
    });
  });

  describe('Edge Cases', () => {
    it.skip('should handle files with multiple describe blocks', () => {
      const testFile = 'multiple.test.ts';
      const content = `
/**
 * @unit
 */
describe('First suite', () => {
  it('test 1', () => {});
});

describe('Second suite', () => {
  it('test 2', () => {});
});`;

      mockFiles.set(testFile, content);

      const analysis: TagAnalysis = {
        file: testFile,
        existingTags: ['@unit'],
        suggestedTags: ['@unit', '@ui'],
        confidence: 0.9,
        provider: 'gemini',
        reasoning: 'UI unit tests',
        needsUpdate: true,
        alreadyReviewed: false
      };

      tagger['updateTestFile'](testFile, analysis);
      
      const updated = mockFiles.get(testFile);
      
      // Should update the JSDoc at the top
      expect(updated).toMatch(/^\/\*\*[\s\S]*?@unit @ui/);
      expect(updated).toContain('// @ai-reviewed by:gemini');
      
      // Should preserve both describe blocks
      expect(updated).toContain('describe(\'First suite\'');
      expect(updated).toContain('describe(\'Second suite\'');
    });

    it('should handle malformed review comments gracefully', () => {
      const testCases = [
        '// @ai-reviewed',
        '// @ai-reviewed by:gemini',
        '// @ai-reviewed by:gemini on:2024-01-15',
        '// @ai-reviewed tags:[@unit]',
        '// @ai-reviewed by: on: tags:',
      ];

      testCases.forEach(content => {
        const result = tagger['checkReviewStatus'](content);
        expect(result).toBeUndefined();
      });
    });
  });
});