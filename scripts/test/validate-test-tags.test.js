/**
 * @integration @critical @testing
 * Tests for the Test Tag Validator script
 */

const { describe, it, expect, vi, beforeEach, afterEach } = require('vitest');
const fs = require('fs');
const { execSync } = require('child_process');
const { TestTagValidator } = require('../validate-test-tags');

// Mock dependencies
vi.mock('fs');
vi.mock('child_process');

const mockFs = vi.mocked(fs);
const mockExecSync = vi.mocked(execSync);

describe('TestTagValidator', () => {
  let validator;
  let consoleSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    validator = new TestTagValidator();
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
    it('should initialize with empty results', () => {
      expect(validator.results).toEqual({
        totalFiles: 0,
        categoryCoverage: 0,
        functionalCoverage: 0,
        priorityCoverage: 0,
        tagExamples: {},
        validationErrors: []
      });
    });
  });

  describe('findAllTestFiles', () => {
    it('should find all test files using find command', () => {
      const mockOutput = `./src/user.test.ts
./src/api.integration.test.ts
./e2e/login.e2e.spec.ts
./apps/admin/components/form.test.tsx`;

      mockExecSync.mockReturnValue(mockOutput);

      const files = validator.findAllTestFiles();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('find . -type f'),
        { encoding: 'utf8' }
      );
      expect(files).toEqual([
        './src/user.test.ts',
        './src/api.integration.test.ts',
        './e2e/login.e2e.spec.ts',
        './apps/admin/components/form.test.tsx'
      ]);
    });

    it('should handle empty output', () => {
      mockExecSync.mockReturnValue('');

      const files = validator.findAllTestFiles();

      expect(files).toEqual([]);
    });

    it('should handle find command errors', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Find command failed');
      });

      const files = validator.findAllTestFiles();

      expect(files).toEqual([]);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        'Error finding test files:',
        'Find command failed'
      );
    });

    it('should filter out empty lines', () => {
      const mockOutput = `./src/user.test.ts

./src/api.test.ts

`;

      mockExecSync.mockReturnValue(mockOutput);

      const files = validator.findAllTestFiles();

      expect(files).toEqual([
        './src/user.test.ts',
        './src/api.test.ts'
      ]);
    });
  });

  describe('validateFile', () => {
    it('should validate file with all required tags', async () => {
      const mockContent = `/**
 * @unit @critical @api
 */
describe('UserService @unit @critical @api', () => {
  it('should create user', () => {});
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      await validator.validateFile('./src/user.test.ts');

      expect(validator.results.categoryCoverage).toBe(1);
      expect(validator.results.functionalCoverage).toBe(1);
      expect(validator.results.priorityCoverage).toBe(1);
      expect(validator.results.tagExamples['@unit']).toContain('user.test.ts');
      expect(validator.results.validationErrors).toHaveLength(0);
    });

    it('should detect missing category tag', async () => {
      const mockContent = `describe('UserService @critical @api', () => {
  it('should create user', () => {});
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      await validator.validateFile('./src/user.test.ts');

      expect(validator.results.categoryCoverage).toBe(0);
      expect(validator.results.validationErrors).toEqual([
        { file: './src/user.test.ts', error: 'Missing category tag' }
      ]);
    });

    it('should count functional and priority tags correctly', async () => {
      const mockContent = `/**
 * @integration @validation @security
 */
describe('UserService @integration @critical @validation @security', () => {
  it('should validate user data', () => {});
});`;

      mockFs.readFileSync.mockReturnValue(mockContent);

      await validator.validateFile('./src/validation.test.ts');

      expect(validator.results.categoryCoverage).toBe(1);
      expect(validator.results.functionalCoverage).toBe(1);
      expect(validator.results.priorityCoverage).toBe(1);
      expect(validator.results.tagExamples['@integration']).toContain('validation.test.ts');
    });

    it('should handle different category tags', async () => {
      const categoryTags = ['@unit', '@integration', '@e2e', '@smoke'];
      
      for (const tag of categoryTags) {
        const mockContent = `describe('Test ${tag}', () => {
  it('should work', () => {});
});`;

        mockFs.readFileSync.mockReturnValue(mockContent);
        validator.results = {
          totalFiles: 0,
          categoryCoverage: 0,
          functionalCoverage: 0,
          priorityCoverage: 0,
          tagExamples: {},
          validationErrors: []
        };

        await validator.validateFile(`./src/${tag}.test.ts`);

        expect(validator.results.categoryCoverage).toBe(1);
        expect(validator.results.tagExamples[tag]).toBeDefined();
      }
    });

    it('should handle file read errors', async () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not readable');
      });

      await validator.validateFile('./src/broken.test.ts');

      expect(validator.results.validationErrors).toEqual([
        { file: './src/broken.test.ts', error: 'File not readable' }
      ]);
    });

    it('should limit tag examples to 3 per tag', async () => {
      // Add 5 files with @unit tag
      for (let i = 1; i <= 5; i++) {
        const mockContent = `describe('Test @unit', () => {});`;
        mockFs.readFileSync.mockReturnValue(mockContent);
        
        await validator.validateFile(`./src/test${i}.test.ts`);
      }

      expect(validator.results.tagExamples['@unit']).toHaveLength(3);
    });
  });

  describe('generateComplianceReport', () => {
    beforeEach(() => {
      validator.results = {
        totalFiles: 10,
        categoryCoverage: 9,
        functionalCoverage: 7,
        priorityCoverage: 8,
        tagExamples: {
          '@unit': ['test1.ts', 'test2.ts'],
          '@integration': ['test3.ts'],
          '@e2e': ['test4.ts', 'test5.ts', 'test6.ts']
        },
        validationErrors: [
          { file: './src/incomplete.test.ts', error: 'Missing category tag' }
        ]
      };
    });

    it('should calculate and display correct percentages', () => {
      validator.generateComplianceReport();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Category tag coverage: 9/10 (90.0%)')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Functional tag coverage: 7/10 (70.0%)')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Priority tag coverage: 8/10 (80.0%)')
      );
    });

    it('should show incomplete status when category coverage < 100%', () => {
      validator.generateComplianceReport();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('PHASE 1 STATUS: ❌ INCOMPLETE')
      );
    });

    it('should show complete status when category coverage = 100%', () => {
      validator.results.categoryCoverage = 10;
      validator.results.validationErrors = [];

      validator.generateComplianceReport();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('PHASE 1 STATUS: ✅ COMPLETE')
      );
    });

    it('should display validation errors', () => {
      validator.generateComplianceReport();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('VALIDATION ERRORS:')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('./src/incomplete.test.ts: Missing category tag')
      );
    });

    it('should display tag distribution', () => {
      validator.generateComplianceReport();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('TAG DISTRIBUTION:')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('@unit: 2 examples - test1.ts, test2.ts')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('@integration: 1 examples - test3.ts')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('@e2e: 3 examples - test4.ts, test5.ts, test6.ts')
      );
    });
  });

  describe('demonstrateTagUsage', () => {
    it('should display example commands for different tag scenarios', () => {
      validator.demonstrateTagUsage();

      const expectedCommands = [
        'pnpm test --grep "@unit"',
        'pnpm test --grep "@critical"',
        'pnpm test --grep "@security"',
        'pnpm test --grep "@api.*@validation"',
        'npx playwright test --grep "@smoke"',
        'npx playwright test --grep "@e2e" --grep-invert "@local-only"'
      ];

      expectedCommands.forEach(command => {
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining(command)
        );
      });
    });

    it('should provide descriptions for each command', () => {
      validator.demonstrateTagUsage();

      const expectedDescriptions = [
        'Run only unit tests (fast feedback loop)',
        'Run critical tests only (CI/CD gates)',
        'Run security-related tests',
        'Run API validation tests',
        'Run smoke tests for quick validation',
        'Run E2E tests excluding local-only'
      ];

      expectedDescriptions.forEach(description => {
        expect(consoleSpy.log).toHaveBeenCalledWith(
          expect.stringContaining(description)
        );
      });
    });
  });

  describe('generateFinalReport', () => {
    beforeEach(() => {
      validator.results = {
        totalFiles: 50,
        categoryCoverage: 48,
        functionalCoverage: 35,
        priorityCoverage: 40,
        tagExamples: {
          '@unit': ['test1.ts', 'test2.ts'],
          '@integration': ['test3.ts'],
          '@e2e': ['test4.ts']
        },
        validationErrors: []
      };

      mockFs.writeFileSync = vi.fn();
    });

    it('should generate comprehensive final report', () => {
      validator.generateFinalReport();

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        'docs/testing/phase-1-completion-report.md',
        expect.stringContaining('# Phase 1 Implementation Complete')
      );

      const reportContent = mockFs.writeFileSync.mock.calls[0][1];

      expect(reportContent).toContain('**Total Test Files**: 50');
      expect(reportContent).toContain('**Category Tag Coverage**: 96.0%');
      expect(reportContent).toContain('**Functional Tag Coverage**: 70.0%');
      expect(reportContent).toContain('**Priority Tag Coverage**: 80.0%');
    });

    it('should include achievements section', () => {
      validator.generateFinalReport();

      const reportContent = mockFs.writeFileSync.mock.calls[0][1];

      expect(reportContent).toContain('## Achievements');
      expect(reportContent).toContain('✅ **Task 1.1**');
      expect(reportContent).toContain('✅ **Task 1.2**');
      expect(reportContent).toContain('✅ **Task 1.3**');
      expect(reportContent).toContain('✅ **Task 1.4**');
    });

    it('should include tag distribution', () => {
      validator.generateFinalReport();

      const reportContent = mockFs.writeFileSync.mock.calls[0][1];

      expect(reportContent).toContain('## Tag Distribution');
      expect(reportContent).toContain('- **@unit**: 2+ files');
      expect(reportContent).toContain('- **@integration**: 1+ files');
      expect(reportContent).toContain('- **@e2e**: 1+ files');
    });

    it('should include benefits and next phase information', () => {
      validator.generateFinalReport();

      const reportContent = mockFs.writeFileSync.mock.calls[0][1];

      expect(reportContent).toContain('## Benefits Realized');
      expect(reportContent).toContain('## Next Phase');
      expect(reportContent).toContain('Phase 1 (Re-tagging Tests) is now **COMPLETE**');
      expect(reportContent).toContain('Phase 2: Test Organization & CI Integration');
    });

    it('should log report generation message', () => {
      validator.generateFinalReport();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Completion report generated: docs/testing/phase-1-completion-report.md')
      );
    });
  });

  describe('validateTags integration', () => {
    it('should run complete validation workflow', async () => {
      const mockFiles = [
        './src/user.test.ts',
        './src/api.test.ts',
        './src/incomplete.test.ts'
      ];

      const mockContents = [
        'describe("UserService @unit @critical @api", () => {});',
        'describe("ApiService @integration @high-priority @api", () => {});',
        'describe("IncompleteService", () => {});'
      ];

      mockExecSync.mockReturnValue(mockFiles.join('\n'));
      mockFs.readFileSync
        .mockReturnValueOnce(mockContents[0])
        .mockReturnValueOnce(mockContents[1])
        .mockReturnValueOnce(mockContents[2]);

      const generateReportSpy = vi.spyOn(validator, 'generateComplianceReport').mockImplementation(() => {});
      const demonstrateSpy = vi.spyOn(validator, 'demonstrateTagUsage').mockImplementation(() => {});

      await validator.validateTags();

      expect(validator.results.totalFiles).toBe(3);
      expect(validator.results.categoryCoverage).toBe(2); // 2 out of 3 have category tags
      expect(validator.results.validationErrors).toHaveLength(1);
      expect(generateReportSpy).toHaveBeenCalled();
      expect(demonstrateSpy).toHaveBeenCalled();

      generateReportSpy.mockRestore();
      demonstrateSpy.mockRestore();
    });
  });
});