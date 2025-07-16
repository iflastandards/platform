import { AdoptionService } from '../adoption-service';

describe('AdoptionService', () => {
  let service: AdoptionService;

  beforeEach(() => {
    service = new AdoptionService();
  });

  describe('extractSheetId', () => {
    it('should extract sheet ID from valid Google Sheets URL', () => {
      const url = 'https://docs.google.com/spreadsheets/d/1ABC123def456/edit#gid=0';
      const sheetId = service.extractSheetId(url);
      expect(sheetId).toBe('1ABC123def456');
    });

    it('should return null for invalid URL', () => {
      const url = 'https://example.com/not-a-sheet';
      const sheetId = service.extractSheetId(url);
      expect(sheetId).toBeNull();
    });
  });

  describe('isValidGoogleSheetsUrl', () => {
    it('should return true for valid Google Sheets URL', () => {
      const validUrls = [
        'https://docs.google.com/spreadsheets/d/1ABC123def456/edit',
        'https://docs.google.com/spreadsheets/d/1ABC123def456/edit#gid=0',
        'https://docs.google.com/spreadsheets/d/1ABC123def456/edit?usp=sharing',
      ];

      validUrls.forEach(url => {
        expect(service.isValidGoogleSheetsUrl(url)).toBe(true);
      });
    });

    it('should return false for invalid URLs', () => {
      const invalidUrls = [
        'https://example.com',
        'https://docs.google.com/document/d/1ABC123def456/edit',
        'not-a-url',
        'https://sheets.google.com/different-format',
      ];

      invalidUrls.forEach(url => {
        expect(service.isValidGoogleSheetsUrl(url)).toBe(false);
      });
    });
  });

  describe('analyzeSpreadsheet', () => {
    it('should analyze a valid spreadsheet URL', async () => {
      const url = 'https://docs.google.com/spreadsheets/d/1ABC123def456/edit';
      const analysis = await service.analyzeSpreadsheet(url);

      expect(analysis).toHaveProperty('sheetId', '1ABC123def456');
      expect(analysis).toHaveProperty('sheetName');
      expect(analysis).toHaveProperty('worksheets');
      expect(analysis).toHaveProperty('inferredType');
      expect(analysis).toHaveProperty('languages');
      expect(analysis).toHaveProperty('totalRows');
      expect(analysis).toHaveProperty('totalColumns');
    });

    it('should throw error for invalid URL', async () => {
      const url = 'https://example.com/not-a-sheet';
      await expect(service.analyzeSpreadsheet(url)).rejects.toThrow('Invalid Google Sheets URL');
    });
  });

  describe('worksheet type detection', () => {
    it('should identify element-set worksheets', async () => {
      const url = 'https://docs.google.com/spreadsheets/d/1ABC123def456/edit';
      const analysis = await service.analyzeSpreadsheet(url);
      
      const elementSheet = analysis.worksheets.find(w => w.type === 'element-set');
      expect(elementSheet).toBeDefined();
      expect(elementSheet?.headers).toContain('Label@en');
    });

    it('should identify concept-scheme worksheets', async () => {
      const url = 'https://docs.google.com/spreadsheets/d/1ABC123def456/edit';
      const analysis = await service.analyzeSpreadsheet(url);
      
      const conceptSheet = analysis.worksheets.find(w => w.type === 'concept-scheme');
      expect(conceptSheet).toBeDefined();
      expect(conceptSheet?.headers).toContain('PrefLabel@en');
    });

    it('should detect multiple languages', async () => {
      const url = 'https://docs.google.com/spreadsheets/d/1ABC123def456/edit';
      const analysis = await service.analyzeSpreadsheet(url);
      
      expect(analysis.languages).toContain('en');
      expect(analysis.languages).toContain('fr');
      expect(analysis.languages.length).toBeGreaterThan(1);
    });
  });
});