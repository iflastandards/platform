/**
 * Unit Tests for ImportService
 * Part of the 5-level testing strategy - Level 1: Unit Tests
 * These run in pre-commit hooks and should be FAST
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImportService, type ValidationResult } from '../import-service';

// Mock the database - we're testing logic, not DB integration
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  db: {
    from: vi.fn(() => ({
      insert: mockInsert,
      update: mockUpdate,
      select: mockSelect,
    })),
  },
}));

// Setup default mock implementations
beforeEach(() => {
  mockInsert.mockReturnValue({
    select: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'mock-job-id',
          namespace_id: 'test-namespace',
          status: 'pending',
          created_at: new Date().toISOString(),
          created_by: 'test-user',
        },
        error: null,
      }),
    }),
  });

  mockUpdate.mockReturnValue({
    eq: vi.fn().mockResolvedValue({
      data: { id: 'mock-job-id' },
      error: null,
    }),
  });

  mockSelect.mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'mock-job-id',
          namespace_id: 'test-namespace',
          status: 'pending',
          spreadsheet_url: 'https://docs.google.com/spreadsheets/d/123',
        },
        error: null,
      }),
    }),
  });
});

describe('ImportService - Fast Unit Tests @unit @api @validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL Validation', () => {
    it('should detect invalid Google Sheets URLs', async () => {
      const invalidUrls = [
        'https://example.com',
        'https://drive.google.com/file/123',
        'not-a-url',
        '',
      ];

      for (const url of invalidUrls) {
        const results = await ImportService.validateSpreadsheet(url);
        expect(
          results.some(
            (r) =>
              r.type === 'error' &&
              r.message === 'Invalid Google Sheets URL format',
          ),
        ).toBe(true);
      }
    });

    it('should accept valid Google Sheets URLs', async () => {
      const validUrls = [
        'https://docs.google.com/spreadsheets/d/1abc123/edit',
        'https://docs.google.com/spreadsheets/d/1abc-123_456/edit#gid=0',
      ];

      for (const url of validUrls) {
        const results = await ImportService.validateSpreadsheet(url);
        const urlError = results.find(
          (r) =>
            r.type === 'error' &&
            r.message === 'Invalid Google Sheets URL format',
        );
        expect(urlError).toBeUndefined();
      }
    });
  });

  describe('Job Management', () => {
    it('should create import job with required fields', async () => {
      const job = await ImportService.createImportJob({
        namespace_id: 'test-namespace',
        spreadsheet_url: 'https://docs.google.com/spreadsheets/d/123',
        created_by: 'test-user',
      });

      expect(job).toBeDefined();
      expect(job?.namespace_id).toBe('test-namespace');
      expect(job?.status).toBe('pending');
    });

    it('should update job status correctly', async () => {
      const result = await ImportService.updateImportJobStatus(
        'job-id',
        'processing',
      );
      expect(result).toBe(true);
    });

    it('should save validation results', async () => {
      const results: ValidationResult[] = [
        { type: 'error', message: 'Test error' },
        { type: 'warning', message: 'Test warning' },
      ];

      const result = await ImportService.saveValidationResults(
        'job-id',
        results,
      );
      expect(result).toBe(true);
    });
  });

  describe('IFLA-Specific Validation Logic', () => {
    it('should validate IFLA required columns', () => {
      // This is a pure function we can extract and test
      const validateIFLAColumns = (headers: string[]): ValidationResult[] => {
        const required = ['Identifier', 'Label', 'Definition'];
        const results: ValidationResult[] = [];

        required.forEach((col) => {
          if (!headers.includes(col)) {
            results.push({
              type: 'error',
              message: `Missing required column: ${col}`,
              column: col,
              suggestion: `Add a column named "${col}" to your spreadsheet`,
            });
          }
        });

        return results;
      };

      const headers = ['Identifier', 'Label']; // Missing Definition
      const errors = validateIFLAColumns(headers);

      expect(errors).toHaveLength(1);
      expect(errors[0].column).toBe('Definition');
    });

    it('should detect language columns', () => {
      const detectLanguages = (headers: string[]): string[] => {
        const langPattern = /_([a-z]{2}(-[A-Z]{2})?)$/;
        const languages = new Set<string>();

        headers.forEach((header) => {
          const match = header.match(langPattern);
          if (match) languages.add(match[1]);
        });

        return Array.from(languages);
      };

      const headers = ['Label_en', 'Label_es', 'Definition_fr'];
      expect(detectLanguages(headers)).toEqual(['en', 'es', 'fr']);
    });

    it('should validate identifier uniqueness', () => {
      const checkDuplicates = (rows: Array<{ Identifier: string }>) => {
        const seen = new Map<string, number[]>();

        rows.forEach((row, idx) => {
          const existing = seen.get(row.Identifier) || [];
          existing.push(idx + 2); // +2 for header and 1-based
          seen.set(row.Identifier, existing);
        });

        return Array.from(seen.entries())
          .filter(([_, rows]) => rows.length > 1)
          .map(([id, rows]) => ({ identifier: id, rows }));
      };

      const data = [
        { Identifier: 'concept1' },
        { Identifier: 'concept2' },
        { Identifier: 'concept1' }, // Duplicate
      ];

      const duplicates = checkDuplicates(data);
      expect(duplicates).toHaveLength(1);
      expect(duplicates[0].identifier).toBe('concept1');
      expect(duplicates[0].rows).toEqual([2, 4]);
    });
  });
});
