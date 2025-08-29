/**
 * @e2e @utility @workflow @high-priority
 * 
 * End-to-end tests for complete AI test tagging workflow
 * Tests entire system from file creation to tag application
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

describe('End-to-End Tagging Workflow', () => {
  const testProjectDir = '/tmp/test-e2e-project-' + Date.now();
  const scriptsDir = path.join(process.cwd(), 'scripts');

  beforeAll(() => {
    // Setup mock project structure
    const dirs = [
      'src/components',
      'src/services',
      'src/utils',
      'tests/unit',
      'tests/integration',
      'tests/e2e',
      '.git/hooks'
    ];

    dirs.forEach(dir => {
      fs.mkdirSync(path.join(testProjectDir, dir), { recursive: true });
    });

    // Create package.json
    fs.writeFileSync(path.join(testProjectDir, 'package.json'), JSON.stringify({
      name: 'test-project',
      scripts: {
        'test:tag': `node ${scriptsDir}/auto-tag-tests-v2.js`,
        'test:validate': `node ${scriptsDir}/validate-test-tag-rules.js`
      }
    }, null, 2));
  });

  afterAll(() => {
    if (fs.existsSync(testProjectDir)) {
      fs.rmSync(testProjectDir, { recursive: true, force: true });
    }
  });

  describe('Complete Project Tagging', () => {
    it('should tag all test files in a project', async () => {
      // Create various test files
      const testFiles = [
        {
          path: 'src/components/Button.test.tsx',
          content: `
import { render } from '@testing-library/react';
import { Button } from './Button';

describe('Button component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
  });
});`
        },
        {
          path: 'src/services/api.test.ts',
          content: `
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([]));
  })
);

describe('API Service', () => {
  beforeAll(() => server.listen());
  
  it('fetches users', async () => {
    const users = await fetchUsers();
    expect(users).toEqual([]);
  });
});`
        },
        {
          path: 'tests/e2e/login.spec.ts',
          content: `
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[name="email"]', 'user@test.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});`
        }
      ];

      // Write test files
      testFiles.forEach(({ path: filePath, content }) => {
        const fullPath = path.join(testProjectDir, filePath);
        fs.writeFileSync(fullPath, content);
      });

      // Run tagging on entire project
      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        dryRun: false,
        verbose: true
      });

      const files = await glob(`${testProjectDir}/**/*.{test,spec}.{ts,tsx,js,jsx}`);
      const results = await tagger['processFiles'](files);

      // Verify all files were processed
      expect(results).toHaveLength(testFiles.length);

      // Verify appropriate tags were applied
      const buttonTest = results.find(r => r.file.includes('Button.test.tsx'));
      expect(buttonTest?.suggestedTags).toContain('@unit');
      expect(buttonTest?.suggestedTags).toContain('@ui');

      const apiTest = results.find(r => r.file.includes('api.test.ts'));
      expect(apiTest?.suggestedTags).toContain('@integration');
      expect(apiTest?.suggestedTags).toContain('@api');

      const e2eTest = results.find(r => r.file.includes('login.spec.ts'));
      expect(e2eTest?.suggestedTags).toContain('@e2e');

      // Verify files were updated
      const buttonContent = fs.readFileSync(
        path.join(testProjectDir, 'src/components/Button.test.tsx'),
        'utf-8'
      );
      expect(buttonContent).toContain('@unit');
      expect(buttonContent).toContain('@ui');
      expect(buttonContent).toContain('@ai-reviewed');
    });

    it('should respect .gitignore patterns', async () => {
      // Create .gitignore
      fs.writeFileSync(path.join(testProjectDir, '.gitignore'), `
node_modules/
dist/
build/
coverage/
*.log
`);

      // Create test files in ignored directories
      fs.mkdirSync(path.join(testProjectDir, 'dist/tests'), { recursive: true });
      fs.writeFileSync(
        path.join(testProjectDir, 'dist/tests/ignored.test.js'),
        'describe("Ignored", () => {});'
      );

      // Create test file in allowed directory
      fs.writeFileSync(
        path.join(testProjectDir, 'src/allowed.test.ts'),
        'describe("Allowed", () => {});'
      );

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        dryRun: true,
        respectGitignore: true
      });

      const files = await glob(`${testProjectDir}/**/*.test.{ts,js}`);
      const filtered = tagger['filterIgnoredFiles'](files, testProjectDir);

      expect(filtered).not.toContain(expect.stringContaining('dist/'));
      expect(filtered.some(f => f.includes('allowed.test.ts'))).toBe(true);
    });
  });

  describe('CI/CD Integration', () => {
    it('should work in CI environment', async () => {
      // Set CI environment variables
      process.env.CI = 'true';
      process.env.GITHUB_ACTIONS = 'true';

      const testFile = path.join(testProjectDir, 'ci-test.test.ts');
      fs.writeFileSync(testFile, `
describe('CI Test', () => {
  it('should work in CI', () => {
    expect(process.env.CI).toBe('true');
  });
});`);

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        dryRun: false
      });

      const result = await tagger['analyzeFile'](testFile);
      expect(result.suggestedTags).toContain('@unit');

      // Cleanup
      delete process.env.CI;
      delete process.env.GITHUB_ACTIONS;
    });

    it('should generate reports for CI', async () => {
      const reportPath = path.join(testProjectDir, 'tagging-report.json');
      
      const testFiles = [
        path.join(testProjectDir, 'test1.test.ts'),
        path.join(testProjectDir, 'test2.test.ts')
      ];

      testFiles.forEach(file => {
        fs.writeFileSync(file, `
describe('Test', () => {
  it('test', () => {});
});`);
      });

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        dryRun: false,
        reportPath
      });

      await tagger['processFiles'](testFiles);

      expect(fs.existsSync(reportPath)).toBe(true);
      
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      expect(report.totalFiles).toBe(2);
      expect(report.results).toHaveLength(2);
    });
  });

  describe('Multi-Provider Workflow', () => {
    it('should handle provider switching based on confidence', async () => {
      const testFile = path.join(testProjectDir, 'complex.test.ts');
      
      fs.writeFileSync(testFile, `
import { render, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfile } from './UserProfile';

const server = setupServer(
  rest.get('/api/user/:id', (req, res, ctx) => {
    return res(ctx.json({ 
      id: req.params.id,
      name: 'Test User',
      role: 'admin'
    }));
  })
);

describe('UserProfile with API integration', () => {
  let queryClient;
  
  beforeAll(() => server.listen());
  beforeEach(() => {
    queryClient = new QueryClient();
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('fetches and displays user data with role-based permissions', async () => {
    const { getByText, getByRole } = render(
      <QueryClientProvider client={queryClient}>
        <UserProfile userId="123" />
      </QueryClientProvider>
    );
    
    await waitFor(() => {
      expect(getByText('Test User')).toBeInTheDocument();
      expect(getByRole('button', { name: 'Admin Panel' })).toBeInTheDocument();
    });
  });
});`);

      // Mock different confidence levels from providers
      let callCount = 0;
      vi.mocked(global.fetch).mockImplementation(async (url) => {
        callCount++;
        
        if (callCount === 1 && (url as string).includes('gemini')) {
          // Low confidence from Gemini
          return {
            ok: true,
            json: async () => ({
              candidates: [{
                content: {
                  parts: [{
                    text: JSON.stringify({
                      tags: ['@unit'],
                      confidence: 0.6,
                      reasoning: 'Uncertain'
                    })
                  }]
                }
              }]
            }),
            statusText: 'OK'
          } as Response;
        } 
          // High confidence from fallback
          return {
            ok: true,
            json: async () => ({
              content: [{
                text: JSON.stringify({
                  tags: ['@integration', '@api', '@ui', '@rbac'],
                  confidence: 0.95,
                  reasoning: 'Complex integration test with MSW, React Query, and RBAC'
                })
              }]
            }),
            statusText: 'OK'
          } as Response;
        
      });

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'gemini',
        fallbackProvider: 'anthropic',
        apiKey: 'test-key',
        fallbackApiKey: 'fallback-key',
        confidenceThreshold: 0.8,
        dryRun: true
      });

      const result = await tagger['analyzeFile'](testFile);
      
      expect(result.provider).toBe('anthropic');
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.suggestedTags).toContain('@integration');
      expect(result.suggestedTags).toContain('@api');
      expect(result.suggestedTags).toContain('@rbac');
    });
  });

  describe('Incremental Tagging', () => {
    it('should support incremental tagging for large codebases', async () => {
      // Create many test files
      const testCount = 20;
      const files: string[] = [];
      
      for (let i = 0; i < testCount; i++) {
        const file = path.join(testProjectDir, `incremental-${i}.test.ts`);
        const hasReview = i < 10; // First 10 are already reviewed
        
        fs.writeFileSync(file, `
/**
 * ${hasReview ? '@unit @api' : ''}
 * ${hasReview ? `// @ai-reviewed by:gemini on:2024-01-15 tags:[@unit,@api]` : ''}
 */
describe('Test ${i}', () => {
  it('test ${i}', () => {
    ${i % 2 === 0 ? 'expect(true).toBe(true);' : 'fetch("/api/data");'}
  });
});`);
        files.push(file);
      }

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      const tagger = new EnhancedTestTagger({
        provider: 'local',
        skipReviewed: true,
        dryRun: true,
        verbose: true
      });

      const results = await tagger['processFiles'](files);
      
      // Should only process unreviewed files
      const processed = results.filter(r => !r.alreadyReviewed);
      expect(processed).toHaveLength(10);
      
      // Should mark reviewed files
      const reviewed = results.filter(r => r.alreadyReviewed);
      expect(reviewed).toHaveLength(10);
    });

    it('should save and resume progress', async () => {
      const progressFile = path.join(testProjectDir, '.tagging-progress.json');
      const files = [
        path.join(testProjectDir, 'progress-1.test.ts'),
        path.join(testProjectDir, 'progress-2.test.ts'),
        path.join(testProjectDir, 'progress-3.test.ts')
      ];

      files.forEach((file, i) => {
        fs.writeFileSync(file, `
describe('Progress ${i}', () => {
  it('test', () => {});
});`);
      });

      const { EnhancedTestTagger } = await import('../../auto-tag-tests-v2');
      
      // First run - process first 2 files
      const tagger1 = new EnhancedTestTagger({
        provider: 'local',
        dryRun: false,
        progressFile,
        maxFiles: 2
      });

      await tagger1['processFiles'](files.slice(0, 2));
      
      // Save progress
      fs.writeFileSync(progressFile, JSON.stringify({
        processed: files.slice(0, 2),
        remaining: files.slice(2),
        timestamp: new Date().toISOString()
      }));

      // Resume - process remaining files
      const progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
      
      const tagger2 = new EnhancedTestTagger({
        provider: 'local',
        dryRun: false
      });

      const results = await tagger2['processFiles'](progress.remaining);
      expect(results).toHaveLength(1);
      
      // Verify all files now have tags
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        expect(content).toContain('@ai-reviewed');
      }
    });
  });
});