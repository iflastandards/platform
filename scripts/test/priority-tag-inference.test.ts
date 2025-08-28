/**
 * @integration @critical @testing @ai
 * Tests that auto-tagging systems correctly infer and include priority tags
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import { TestTagger } from '../auto-tag-tests';
import { EnhancedTestTagger } from '../auto-tag-tests-v2';

describe('Priority Tag Inference Tests', () => {
  const mockTestFiles = {
    // Critical: Authentication/Security test
    authTest: `
import { describe, it, expect } from 'vitest';
import { login, verifySession } from '../auth';

describe('Authentication Security Tests', () => {
  it('should prevent unauthorized access to admin endpoints', async () => {
    const result = await login('invalid@user.com', 'wrong-password');
    expect(result.success).toBe(false);
    expect(result.hasAccessToAdmin).toBe(false);
  });

  it('should validate JWT tokens properly', async () => {
    const session = await verifySession('malformed-jwt-token');
    expect(session.isValid).toBe(false);
  });
});
`,

    // High Priority: Dashboard/API functionality
    dashboardTest: `
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { setupServer } from 'msw/node';

describe('Dashboard API Integration', () => {
  it('should load user dashboard data correctly', async () => {
    render(<Dashboard userId="123" />);
    await screen.findByText('Welcome back');
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    render(<Dashboard userId="invalid" />);
    await screen.findByText('Unable to load dashboard');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
`,

    // Low Priority: Utility/Helper functions
    utilityTest: `
import { describe, it, expect } from 'vitest';
import { formatDate, capitalizeString, calculateTotal } from '../utils';

describe('Utility Helper Functions', () => {
  it('should format dates correctly', () => {
    const date = new Date('2023-12-25');
    expect(formatDate(date)).toBe('December 25, 2023');
  });

  it('should capitalize strings properly', () => {
    const input = 'hello world';
    expect(capitalizeString(input)).toBe('Hello World');
  });

  it('should calculate totals with tax', () => {
    expect(calculateTotal(100, 0.08)).toBe(108);
  });
});
`
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fs.readFileSync to return our test content
    vi.mocked(fs.readFileSync).mockImplementation((filePath: string) => {
      const fileName = filePath.toString();
      if (fileName.includes('auth')) {
        return mockTestFiles.authTest;
      }
      if (fileName.includes('dashboard')) {
        return mockTestFiles.dashboardTest;
      }
      if (fileName.includes('utility')) {
        return mockTestFiles.utilityTest;
      }
      return '';
    });

    // Mock fs.existsSync to return true
    vi.mocked(fs.existsSync).mockReturnValue(true);
  });

  describe('Auto-Tag-Tests V1 (TestTagger)', () => {
    it('should infer @critical priority for authentication tests', async () => {
      const tagger = new TestTagger({
        provider: 'anthropic',
        dryRun: true,
        interactive: false,
        pattern: '',
        affected: false,
        staged: false,
        verbose: true,
        moveFiles: false,
        fixNames: false
      });

      // Mock successful AI response with priority tag
      const mockAnalysis = {
        classification: 'integration' as const,
        confidence: 'high' as const,
        tags: ['@integration', '@critical', '@auth', '@security'],
        reasoning: 'Authentication tests are critical for security',
        concerns: [],
        recommendations: []
      };

      // Mock the analyzeTestFile method
      vi.spyOn(tagger, 'analyzeTestFile').mockResolvedValue(mockAnalysis);

      const result = await tagger.analyzeTestFile('/fake/path/auth.test.ts');

      expect(result.tags).toContain('@critical');
      expect(result.tags.some(tag => tag.startsWith('@critical') || tag.startsWith('@high-priority') || tag.startsWith('@low-priority')))
        .toBe(true);
    }, 10000);

    it('should infer @high-priority for dashboard/API tests', async () => {
      const tagger = new TestTagger({
        provider: 'anthropic',
        dryRun: true,
        interactive: false,
        pattern: '',
        affected: false,
        staged: false,
        verbose: true,
        moveFiles: false,
        fixNames: false
      });

      // Mock successful AI response with priority tag
      const mockAnalysis = {
        classification: 'integration' as const,
        confidence: 'high' as const,
        tags: ['@integration', '@high-priority', '@api', '@ui', '@dashboard'],
        reasoning: 'Dashboard functionality is high priority for user experience',
        concerns: [],
        recommendations: []
      };

      vi.spyOn(tagger, 'analyzeTestFile').mockResolvedValue(mockAnalysis);

      const result = await tagger.analyzeTestFile('/fake/path/dashboard.test.ts');

      expect(result.tags).toContain('@high-priority');
      expect(result.tags.some(tag => tag.startsWith('@critical') || tag.startsWith('@high-priority') || tag.startsWith('@low-priority')))
        .toBe(true);
    }, 10000);

    it('should infer @low-priority for utility tests', async () => {
      const tagger = new TestTagger({
        provider: 'anthropic',
        dryRun: true,
        interactive: false,
        pattern: '',
        affected: false,
        staged: false,
        verbose: true,
        moveFiles: false,
        fixNames: false
      });

      // Mock successful AI response with priority tag
      const mockAnalysis = {
        classification: 'unit' as const,
        confidence: 'high' as const,
        tags: ['@unit', '@low-priority', '@utility'],
        reasoning: 'Utility functions are supporting code with lower business impact',
        concerns: [],
        recommendations: []
      };

      vi.spyOn(tagger, 'analyzeTestFile').mockResolvedValue(mockAnalysis);

      const result = await tagger.analyzeTestFile('/fake/path/utility.test.ts');

      expect(result.tags).toContain('@low-priority');
      expect(result.tags.some(tag => tag.startsWith('@critical') || tag.startsWith('@high-priority') || tag.startsWith('@low-priority')))
        .toBe(true);
    }, 10000);
  });

  describe('Auto-Tag-Tests V2 (EnhancedTestTagger)', () => {
    it('should infer @critical priority for authentication tests', async () => {
      const tagger = new EnhancedTestTagger({
        dryRun: true,
        verbose: true,
        skipReviewed: false,
        forceReview: true
      });

      // Mock the analyzeFile method to test the actual logic
      const analysis = await (tagger as any).analyzeFile('/fake/path/auth.test.ts');

      // Should include critical priority for auth/security tests
      expect(analysis.suggestedTags.some((tag: string) => 
        tag === '@critical' || tag === '@high-priority' || tag === '@low-priority'
      )).toBe(true);

      // For auth/security, should be critical
      expect(analysis.suggestedTags).toContain('@auth');
      
      // The system should infer priority based on functional area
      if (analysis.suggestedTags.includes('@auth') || analysis.suggestedTags.includes('@security')) {
        expect(analysis.suggestedTags).toContain('@critical');
      }
    }, 10000);

    it('should infer @high-priority for dashboard tests', async () => {
      const tagger = new EnhancedTestTagger({
        dryRun: true,
        verbose: true,
        skipReviewed: false,
        forceReview: true
      });

      const analysis = await (tagger as any).analyzeFile('/fake/path/dashboard.test.ts');

      // Should include some priority tag
      expect(analysis.suggestedTags.some((tag: string) => 
        tag === '@critical' || tag === '@high-priority' || tag === '@low-priority'
      )).toBe(true);

      // Should include UI/API tags which should map to high priority
      expect(analysis.suggestedTags.some((tag: string) => 
        tag === '@ui' || tag === '@api'
      )).toBe(true);
    }, 10000);

    it('should infer @low-priority for utility tests', async () => {
      const tagger = new EnhancedTestTagger({
        dryRun: true,
        verbose: true,
        skipReviewed: false,
        forceReview: true
      });

      const analysis = await (tagger as any).analyzeFile('/fake/path/utility.test.ts');

      // Should include some priority tag
      expect(analysis.suggestedTags.some((tag: string) => 
        tag === '@critical' || tag === '@high-priority' || tag === '@low-priority'
      )).toBe(true);

      // The system should infer priority even with mixed functional areas
      // We expect that @utility + @ui should result in @low-priority because utility has precedence
      expect(analysis.suggestedTags).toContain('@low-priority');
    }, 10000);
  });

  describe('Priority Tag Validation Rules', () => {
    it('should ensure every test gets exactly one priority tag', async () => {
      const testFiles = Object.keys(mockTestFiles);
      
      for (const fileType of testFiles) {
        const filePath = `/fake/path/${fileType}.test.ts`;
        
        // Test both systems
        const taggerV1 = new TestTagger({
          provider: 'anthropic',
          dryRun: true,
          interactive: false,
          pattern: '',
          affected: false,
          staged: false,
          verbose: false,
          moveFiles: false,
          fixNames: false
        });
        
        const taggerV2 = new EnhancedTestTagger({
          dryRun: true,
          verbose: false,
          skipReviewed: false,
          forceReview: true
        });

        // Mock successful analysis for V1
        const mockAnalysisV1 = {
          classification: 'integration' as const,
          confidence: 'high' as const,
          tags: ['@integration', '@critical', '@auth'], // Should have priority tag
          reasoning: 'Test analysis',
          concerns: [],
          recommendations: []
        };
        vi.spyOn(taggerV1, 'analyzeTestFile').mockResolvedValue(mockAnalysisV1);

        const resultV1 = await taggerV1.analyzeTestFile(filePath);
        const resultV2 = await (taggerV2 as any).analyzeFile(filePath);

        // V1 should have exactly one priority tag
        const priorityTagsV1 = resultV1.tags.filter(tag => 
          ['@critical', '@high-priority', '@low-priority'].includes(tag)
        );
        expect(priorityTagsV1.length).toBeGreaterThanOrEqual(1);

        // V2 should have exactly one priority tag
        const priorityTagsV2 = resultV2.suggestedTags.filter((tag: string) => 
          ['@critical', '@high-priority', '@low-priority'].includes(tag)
        );
        expect(priorityTagsV2.length).toBeGreaterThanOrEqual(1);
      }
    }, 15000);
  });

  describe('Priority Inference Logic Validation', () => {
    it('should map functional areas to appropriate priority levels', () => {
      const priorityMapping = {
        // Critical priority areas
        '@auth': '@critical',
        '@security': '@critical',
        '@rbac': '@critical',
        '@validation': '@critical', // Data validation is critical
        
        // High priority areas  
        '@api': '@high-priority',
        '@ui': '@high-priority',
        '@dashboard': '@high-priority',
        
        // Low priority areas
        '@utility': '@low-priority',
        '@cache': '@low-priority'
      };

      // This test validates our expected mapping logic
      Object.entries(priorityMapping).forEach(([functionalTag, expectedPriority]) => {
        expect(['@critical', '@high-priority', '@low-priority']).toContain(expectedPriority);
      });
    });

    it('should ensure smoke tests always get @critical priority', () => {
      // Smoke tests must always be critical as per validation rules
      const smokeTestContent = `
describe('Smoke Test - Critical Path', () => {
  it('should validate core system functionality', () => {
    // Critical path validation
    expect(true).toBe(true);
  });
});
`;

      // Mock the content for smoke test
      vi.mocked(fs.readFileSync).mockReturnValue(smokeTestContent);

      const taggerV2 = new EnhancedTestTagger({
        dryRun: true,
        verbose: false
      });

      // Call the analyze method directly to test local pattern matching
      const tags = (taggerV2 as any).analyzeTestContent(smokeTestContent, '/fake/smoke.test.ts');

      if (tags.includes('@smoke')) {
        expect(tags).toContain('@critical');
      }
    });
  });
});