import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdoptionService } from '../adoption-service';

// Mock the supabase client
vi.mock('@/lib/supabase/client', () => ({
  db: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'mock-sheet-id',
              namespace_id: 'isbd',
              sheet_id: 'test-sheet-123',
              sheet_url:
                'https://docs.google.com/spreadsheets/d/test-sheet-123',
              status: 'ready',
              project_id: 'project-1',
            },
            error: null,
          }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }, // Not found error
          }),
          order: vi.fn().mockReturnValue({
            data: [],
            error: null,
          }),
        }),
      }),
    }),
  },
}));

// Mock fs
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  promises: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock csv-stringify
vi.mock('csv-stringify/sync', () => ({
  stringify: vi.fn((rows) =>
    rows.map((row: any[]) => row.join(',')).join('\n'),
  ),
}));

describe('AdoptionService @unit', () => {
  let service: AdoptionService;
  const mockEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Don't set GSHEETS_SA_KEY to avoid triggering API calls
    process.env = {
      ...mockEnv,
      GSHEETS_SA_KEY: undefined,
    };
    service = new AdoptionService();
  });

  afterEach(() => {
    process.env = mockEnv;
  });

  describe('extractSheetId', () => {
    it('should extract sheet ID from Google Sheets URL', () => {
      const url = 'https://docs.google.com/spreadsheets/d/1abc123DEF456/edit';
      const sheetId = service.extractSheetId(url);
      expect(sheetId).toBe('1abc123DEF456');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/not-a-sheet';
      const sheetId = service.extractSheetId(url);
      expect(sheetId).toBeNull();
    });
  });

  describe('isValidGoogleSheetsUrl', () => {
    it('should validate correct Google Sheets URL', () => {
      const url = 'https://docs.google.com/spreadsheets/d/1abc123DEF456/edit';
      expect(service.isValidGoogleSheetsUrl(url)).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(service.isValidGoogleSheetsUrl('https://example.com')).toBe(false);
      expect(service.isValidGoogleSheetsUrl('not-a-url')).toBe(false);
    });
  });

  describe('analyzeSpreadsheet', () => {
    it('should throw error when GSHEETS_SA_KEY is not configured', async () => {
      const url = 'https://docs.google.com/spreadsheets/d/test-sheet-123/edit';
      
      await expect(service.analyzeSpreadsheet(url)).rejects.toThrow(
        'Google Sheets API credentials not configured. Please set GSHEETS_SA_KEY environment variable.'
      );
    });

    it('should throw error for invalid URL', async () => {
      const url = 'https://example.com/not-a-sheet';
      await expect(service.analyzeSpreadsheet(url)).rejects.toThrow(
        'Invalid Google Sheets URL',
      );
    });
  });

  describe('isSpreadsheetAdopted', () => {
    it('should return false for unadopted sheet', async () => {
      const isAdopted = await service.isSpreadsheetAdopted('new-sheet-id');
      expect(isAdopted).toBe(false);
    });
  });

  describe('downloadAdoptedSheet', () => {
    it('should handle API unavailability gracefully', async () => {
      // Without API key, it should throw an error
      await expect(service.downloadAdoptedSheet(
        'test-sheet-123',
        'isbd',
        '/tmp/test-output',
      )).rejects.toThrow('Google Sheets API credentials not configured');
    });
  });

  describe('adoptSpreadsheet', () => {
    it('should throw error when API is not configured', async () => {
      const options = {
        spreadsheetUrl:
          'https://docs.google.com/spreadsheets/d/test-sheet-123/edit',
        projectId: 'project-1',
        dctapProfileId: 'dctap-1',
        userId: 'user-123',
        userName: 'Test User',
      };

      await expect(service.adoptSpreadsheet(options)).rejects.toThrow(
        'Google Sheets API credentials not configured'
      );
    });
  });
});