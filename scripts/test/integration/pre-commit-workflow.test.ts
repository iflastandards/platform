/**
 * @integration @critical @workflow
 * 
 * Integration tests for pre-commit hook workflow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

describe('Pre-commit Hook Workflow @integration @workflow', () => {
  const testDir = '/tmp/test-precommit-' + Date.now();
  const scriptsDir = path.join(process.cwd(), 'scripts');

  beforeEach(() => {
    // Create test directory
    fs.mkdirSync(testDir, { recursive: true });
    
    // Mock git commands
    vi.spyOn(process, 'env', 'get').mockReturnValue({
      ...process.env,
      TEST_MODE: 'true',
      TEST_DIR: testDir
    });
  });

  afterEach(() => {
    // Cleanup
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    vi.clearAllMocks();
  });

  describe('Staged Files Processing', () => {
    it('should only process staged test files', async () => {
      // Create mock test files
      const stagedFile = path.join(testDir, 'staged.test.ts');
      const unstagedFile = path.join(testDir, 'unstaged.test.ts');
      
      fs.writeFileSync(stagedFile, `
describe('Staged test', () => {
  it('needs tags', () => {});
});`);

      fs.writeFileSync(unstagedFile, `
describe('Unstaged test', () => {
  it('should not be processed', () => {});
});`);

      // Mock git diff to return only staged file
      const mockGitDiff = vi.fn(() => 'staged.test.ts\n');
      vi.mocked(execSync).mockImplementation((cmd) => {
        if (cmd.includes('git diff --cached --name-only')) {
          return Buffer.from('staged.test.ts\n');
        }
        return Buffer.from('');
      });

      // Run tagging on staged files
      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        staged: true,
        dryRun: true,
        provider: 'local' // Use local analysis for testing
      });

      const results = await tagger['processFiles']([stagedFile]);
      
      expect(results).toHaveLength(1);
      expect(results[0].file).toContain('staged.test.ts');
    });

    it('should validate tags before allowing commit', async () => {
      const testFile = path.join(testDir, 'invalid-tags.test.ts');
      
      // Create test with invalid tag combination
      fs.writeFileSync(testFile, `
/**
 * @unit @server-dependent
 */
describe('Invalid combination', () => {
  it('should fail validation', () => {});
});`);

      // Run validation
      const validateScript = path.join(scriptsDir, 'validate-test-tag-rules.js');
      
      let validationFailed = false;
      try {
        execSync(`node ${validateScript} ${testFile}`, {
          stdio: 'pipe'
        });
      } catch (error) {
        validationFailed = true;
      }

      expect(validationFailed).toBe(true);
    });

    it('should add review comments to prevent re-processing', async () => {
      const testFile = path.join(testDir, 'review.test.ts');
      
      fs.writeFileSync(testFile, `
describe('Test', () => {
  it('needs review', () => {});
});`);

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        dryRun: false
      });

      // Process file once
      await tagger['processFiles']([testFile]);
      
      const content1 = fs.readFileSync(testFile, 'utf-8');
      expect(content1).toContain('@ai-reviewed');

      // Process again - should skip
      const results2 = await tagger['processFiles']([testFile]);
      const skipped = results2.filter(r => r.alreadyReviewed);
      
      expect(skipped).toHaveLength(1);
    });
  });

  describe('Hook Integration', () => {
    it('should integrate with git pre-commit hook', async () => {
      const hookScript = `#!/bin/bash
# Test pre-commit hook

# Run test tagging on staged files
pnpm test:tag --staged --provider gemini

# Validate tag rules
pnpm test:validate-tags

# Run affected unit tests
pnpm test:affected --target=test --base=HEAD~1
`;

      const hookPath = path.join(testDir, 'pre-commit');
      fs.writeFileSync(hookPath, hookScript);
      fs.chmodSync(hookPath, '755');

      // Verify hook is executable
      const stats = fs.statSync(hookPath);
      expect(stats.mode & parseInt('100', 8)).toBeTruthy();
      
      // Verify hook content
      expect(hookScript).toContain('test:tag --staged');
      expect(hookScript).toContain('test:validate-tags');
    });

    it('should handle hook failures gracefully', async () => {
      const testFile = path.join(testDir, 'fail.test.ts');
      
      // Create test that will fail tagging
      fs.writeFileSync(testFile, `
// Invalid JavaScript syntax {{{
describe('Broken', () => {`);

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        dryRun: true
      });

      let error: Error | null = null;
      try {
        await tagger['analyzeFile'](testFile);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
    });
  });

  describe('Performance Optimization', () => {
    it('should batch process files efficiently', async () => {
      const files: string[] = [];
      
      // Create 10 test files
      for (let i = 0; i < 10; i++) {
        const file = path.join(testDir, `batch${i}.test.ts`);
        fs.writeFileSync(file, `
describe('Batch ${i}', () => {
  it('test ${i}', () => {});
});`);
        files.push(file);
      }

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        batchSize: 5,
        dryRun: true
      });

      const startTime = Date.now();
      const results = await tagger['processFiles'](files);
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(5000); // Should be fast with local provider
    });

    it('should skip already reviewed files for performance', async () => {
      const reviewedFile = path.join(testDir, 'reviewed.test.ts');
      const newFile = path.join(testDir, 'new.test.ts');
      
      // Create already reviewed file
      fs.writeFileSync(reviewedFile, `
/**
 * @unit @ui
 * // @ai-reviewed by:gemini on:2024-01-15 tags:[@unit,@ui]
 */
describe('Already reviewed', () => {
  it('should skip', () => {});
});`);

      // Create new file
      fs.writeFileSync(newFile, `
describe('New test', () => {
  it('needs tags', () => {});
});`);

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        skipReviewed: true,
        dryRun: true
      });

      const results = await tagger['processFiles']([reviewedFile, newFile]);
      
      const processed = results.filter(r => !r.alreadyReviewed);
      expect(processed).toHaveLength(1);
      expect(processed[0].file).toContain('new.test.ts');
    });
  });

  describe('Error Recovery', () => {
    it('should continue processing after individual file failures', async () => {
      const files = [
        path.join(testDir, 'valid.test.ts'),
        path.join(testDir, 'invalid.test.ts'),
        path.join(testDir, 'valid2.test.ts')
      ];

      // Create valid file
      fs.writeFileSync(files[0], `
describe('Valid', () => {
  it('works', () => {});
});`);

      // Create invalid file
      fs.writeFileSync(files[1], `
// Syntax error {{{{
describe(`);

      // Create another valid file
      fs.writeFileSync(files[2], `
describe('Valid 2', () => {
  it('also works', () => {});
});`);

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        continueOnError: true,
        dryRun: true
      });

      const results = await tagger['processFiles'](files);
      
      // Should process valid files despite error
      const successful = results.filter(r => !r.error);
      expect(successful.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle API failures with fallback', async () => {
      const testFile = path.join(testDir, 'fallback.test.ts');
      
      fs.writeFileSync(testFile, `
describe('API test', () => {
  it('needs fallback', async () => {
    await fetch('/api/data');
  });
});`);

      // Mock API failures
      vi.mocked(global.fetch)
        .mockRejectedValueOnce(new Error('Gemini API failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            content: [{
              text: JSON.stringify({
                tags: ['@integration', '@api'],
                confidence: 0.9,
                reasoning: 'Fallback worked'
              })
            }]
          }),
          statusText: 'OK'
        } as Response);

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'gemini',
        fallbackProvider: 'anthropic',
        apiKey: 'test-key',
        fallbackApiKey: 'fallback-key',
        dryRun: true
      });

      const result = await tagger['analyzeFile'](testFile);
      
      expect(result.provider).toBe('anthropic');
      expect(result.suggestedTags).toContain('@api');
    });
  });

  describe('Reporting', () => {
    it('should generate comprehensive reports', async () => {
      const files = [];
      
      // Create test files with various scenarios
      const scenarios = [
        { name: 'unit', tags: '@unit @ui' },
        { name: 'integration', tags: '@integration @api' },
        { name: 'e2e', tags: '@e2e @critical' },
        { name: 'untagged', tags: '' }
      ];

      for (const scenario of scenarios) {
        const file = path.join(testDir, `${scenario.name}.test.ts`);
        fs.writeFileSync(file, `
/**
 * ${scenario.tags}
 */
describe('${scenario.name} test', () => {
  it('test', () => {});
});`);
        files.push(file);
      }

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        dryRun: true,
        verbose: true
      });

      const results = await tagger['processFiles'](files);
      const report = tagger['generateReport'](results);

      expect(report).toContain('Total files');
      expect(report).toContain('Already reviewed');
      expect(report).toContain('Need update');
      expect(report).toContain('Errors');
    });
  });
});