import { describe, it, expect, afterEach, vi } from 'vitest';
import { VocabularyComparisonTool } from '../../../../../scripts/vocabulary-comparison.mjs';

describe.skip('VocabularyComparisonTool', () => {
  const mockApiKey = 'test-api-key';
  const mockSpreadsheetId = 'test-spreadsheet-id';

  // Restore all mocks after each test to ensure isolation
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with required parameters', () => {
      const tool = new VocabularyComparisonTool(mockApiKey, mockSpreadsheetId);
      expect(tool.apiKey).toBe(mockApiKey);
      expect(tool.spreadsheetId).toBe(mockSpreadsheetId);
      expect(tool.options).toEqual({
        indexSheet: 'Index',
        skipRdfCheck: false,
        markdown: false,
        outputPath: './report',
      });
    });

    it('should override default options when provided', () => {
      const options = {
        indexSheet: 'CustomIndex',
        skipRdfCheck: true,
        markdown: true,
        outputPath: './custom-report',
      };
      const tool = new VocabularyComparisonTool(
        mockApiKey,
        mockSpreadsheetId,
        options,
      );
      expect(tool.options).toEqual(options);
    });
  });

  describe('getAvailableSheets', () => {
    it('should return a list of sheets on successful fetch', async () => {
      const mockSheets = {
        sheets: [
          { properties: { title: 'Sheet1', sheetId: '1' } },
          { properties: { title: 'Sheet2', sheetId: '2' } },
        ],
      };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockSheets,
        }),
      );

      const tool = new VocabularyComparisonTool(mockApiKey, mockSpreadsheetId);
      const sheets = await tool.getAvailableSheets();

      expect(sheets).toEqual([
        { title: 'Sheet1', sheetId: '1' },
        { title: 'Sheet2', sheetId: '2' },
      ]);
      expect(fetch).toHaveBeenCalledWith(
        `https://sheets.googleapis.com/v4/spreadsheets/${mockSpreadsheetId}?key=${mockApiKey}`,
      );
    });

    it('should throw an error if the network response is not ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          statusText: 'Service Unavailable',
        }),
      );

      const tool = new VocabularyComparisonTool(mockApiKey, mockSpreadsheetId);
      await expect(tool.getAvailableSheets()).rejects.toThrow(
        'Failed to fetch spreadsheet metadata: Service Unavailable',
      );
    });

    it('should throw an error if the response JSON is malformed', async () => {
      // Malformed response (missing 'sheets' property)
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({}),
        }),
      );

      const tool = new VocabularyComparisonTool(mockApiKey, mockSpreadsheetId);
      // This will likely throw a TypeError because the code tries to access `data.sheets.map`
      await expect(tool.getAvailableSheets()).rejects.toThrow();
    });
  });

  describe('fetchSheetData', () => {
    it('should return sheet data on successful fetch', async () => {
      const mockData = {
        values: [
          ['Header1', 'Header2'],
          ['Row1Col1', 'Row1Col2'],
        ],
      };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => mockData,
        }),
      );

      const tool = new VocabularyComparisonTool(mockApiKey, mockSpreadsheetId);
      const sheetName = 'TestSheet';
      const data = await tool.fetchSheetData(sheetName);

      expect(data).toEqual(mockData.values);
      expect(fetch).toHaveBeenCalledWith(
        `https://sheets.googleapis.com/v4/spreadsheets/${mockSpreadsheetId}/values/${sheetName}?key=${mockApiKey}`,
      );
    });

    it('should throw an error if the network response is not ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          statusText: 'Not Found',
        }),
      );

      const tool = new VocabularyComparisonTool(mockApiKey, mockSpreadsheetId);
      const sheetName = 'NonExistentSheet';
      await expect(tool.fetchSheetData(sheetName)).rejects.toThrow(
        `Failed to fetch sheet ${sheetName}: Not Found`,
      );
    });

    it('should return an empty array if "values" property is missing', async () => {
      // Response missing the 'values' property
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({}),
        }),
      );

      const tool = new VocabularyComparisonTool(mockApiKey, mockSpreadsheetId);
      const data = await tool.fetchSheetData('TestSheet');
      expect(data).toEqual([]);
    });
  });
});
