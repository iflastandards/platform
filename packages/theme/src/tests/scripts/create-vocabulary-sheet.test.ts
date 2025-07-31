import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { google } from 'googleapis';
import { 
  VocabularyConfig,
  initializeGoogle,
  findOrCreateWorkbook,
  createVocabularySheet,
  DCTAP_PROFILES
} from '../../../../../scripts/create-vocabulary-sheet';

// Mock googleapis
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn()
    },
    sheets: vi.fn(),
    drive: vi.fn()
  }
}));

// Mock readline for CLI input
vi.mock('readline', () => ({
  createInterface: vi.fn(() => ({
    question: vi.fn(),
    close: vi.fn()
  }))
}));

describe('create-vocabulary-sheet @unit @api @validation', () => {
  let mockSheets: any;
  let mockDrive: any;
  let mockAuth: any;

  beforeEach(() => {
    // Reset environment
    process.env.GSHEETS_SA_KEY = Buffer.from(JSON.stringify({
      type: 'service_account',
      project_id: 'test-project',
      private_key: 'test-key',
      client_email: 'test@test.iam.gserviceaccount.com'
    })).toString('base64');

    // Setup mocks
    mockAuth = {
      getClient: vi.fn()
    };

    mockSheets = {
      spreadsheets: {
        get: vi.fn(),
        batchUpdate: vi.fn(),
        values: {
          get: vi.fn(),
          update: vi.fn()
        }
      }
    };

    mockDrive = {
      files: {
        list: vi.fn(),
        create: vi.fn()
      }
    };

    // Configure googleapis mock
    (google.auth.GoogleAuth as any).mockImplementation(() => mockAuth);
    (google.sheets as any).mockReturnValue(mockSheets);
    (google.drive as any).mockReturnValue(mockDrive);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeGoogle', () => {
    it('should initialize Google APIs with correct credentials', () => {
      const result = initializeGoogle();

      expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
        credentials: {
          type: 'service_account',
          project_id: 'test-project',
          private_key: 'test-key',
          client_email: 'test@test.iam.gserviceaccount.com'
        },
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file'
        ]
      });

      expect(result).toHaveProperty('sheets');
      expect(result).toHaveProperty('drive');
    });

    it('should throw error if GSHEETS_SA_KEY is not set', () => {
      delete process.env.GSHEETS_SA_KEY;

      expect(() => initializeGoogle()).toThrow();
    });
  });

  describe('findOrCreateWorkbook', () => {
    it('should return existing workbook if found', async () => {
      const mockFiles = {
        data: {
          files: [{ id: 'existing-sheet-id', name: 'ISBDM-values' }]
        }
      };

      mockDrive.files.list.mockResolvedValue(mockFiles);

      const result = await findOrCreateWorkbook(
        mockDrive,
        mockSheets,
        'ISBDM',
        'values'
      );

      expect(mockDrive.files.list).toHaveBeenCalledWith({
        q: "name='ISBDM-values' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        fields: 'files(id, name)'
      });

      expect(result).toBe('existing-sheet-id');
      expect(mockDrive.files.create).not.toHaveBeenCalled();
    });

    it('should create new workbook if not found', async () => {
      mockDrive.files.list.mockResolvedValue({ data: { files: [] } });
      mockDrive.files.create.mockResolvedValue({ data: { id: 'new-sheet-id' } });

      const result = await findOrCreateWorkbook(
        mockDrive,
        mockSheets,
        'ISBDM',
        'elements'
      );

      expect(mockDrive.files.create).toHaveBeenCalledWith({
        requestBody: {
          name: 'ISBDM-elements',
          mimeType: 'application/vnd.google-apps.spreadsheet'
        },
        fields: 'id'
      });

      expect(result).toBe('new-sheet-id');
    });
  });

  describe('createVocabularySheet', () => {
    const mockConfig: VocabularyConfig = {
      profileType: 'values',
      vocabularyName: 'test-vocabulary',
      title: 'Test Vocabulary',
      description: 'Test description',
      languages: ['en', 'fr']
    };

    it('should create vocabulary sheet with correct headers', async () => {
      mockSheets.spreadsheets.batchUpdate.mockResolvedValue({
        data: {
          replies: [{
            addSheet: {
              properties: { sheetId: 12345 }
            }
          }]
        }
      });

      mockSheets.spreadsheets.values.update.mockResolvedValue({});

      const sheetId = await createVocabularySheet(
        mockSheets,
        'spreadsheet-id',
        mockConfig
      );

      // Check sheet creation
      expect(mockSheets.spreadsheets.batchUpdate).toHaveBeenCalledWith({
        spreadsheetId: 'spreadsheet-id',
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'test-vocabulary'
              }
            }
          }]
        }
      });

      // Check headers with language variants
      expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith({
        spreadsheetId: 'spreadsheet-id',
        range: 'test-vocabulary!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'valueID',
            'label',
            'label_en',
            'label_fr',
            'definition',
            'definition_en',
            'definition_fr',
            'scopeNote',
            'scopeNote_en',
            'scopeNote_fr',
            'example',
            'source',
            'status'
          ]]
        }
      });

      expect(sheetId).toBe(12345);
    });

    it('should handle elements profile correctly', async () => {
      const elementsConfig: VocabularyConfig = {
        ...mockConfig,
        profileType: 'elements'
      };

      mockSheets.spreadsheets.batchUpdate.mockResolvedValue({
        data: {
          replies: [{
            addSheet: {
              properties: { sheetId: 67890 }
            }
          }]
        }
      });

      mockSheets.spreadsheets.values.update.mockResolvedValue({});

      await createVocabularySheet(
        mockSheets,
        'spreadsheet-id',
        elementsConfig
      );

      // Check headers for elements profile
      expect(mockSheets.spreadsheets.values.update).toHaveBeenCalledWith({
        spreadsheetId: 'spreadsheet-id',
        range: 'test-vocabulary!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'elementID',
            'label',
            'label_en',
            'label_fr',
            'definition',
            'definition_en',
            'definition_fr',
            'comment',
            'comment_en',
            'comment_fr',
            'cardinality',
            'datatype',
            'status'
          ]]
        }
      });
    });
  });

  describe('DCTAP profiles', () => {
    it('should have correct values profile columns', () => {
      expect(DCTAP_PROFILES.values.columns).toEqual([
        'valueID',
        'label',
        'definition',
        'scopeNote',
        'example',
        'source',
        'status'
      ]);
    });

    it('should have correct elements profile columns', () => {
      expect(DCTAP_PROFILES.elements.columns).toEqual([
        'elementID',
        'label',
        'definition',
        'comment',
        'cardinality',
        'datatype',
        'status'
      ]);
    });
  });

  describe('error handling', () => {
    it('should handle Google API errors gracefully', async () => {
      mockDrive.files.list.mockRejectedValue(new Error('API Error'));

      await expect(
        findOrCreateWorkbook(mockDrive, mockSheets, 'ISBDM', 'values')
      ).rejects.toThrow('API Error');
    });

    it('should validate vocabulary name format', () => {
      const config: VocabularyConfig = {
        profileType: 'values',
        vocabularyName: 'Invalid Name!', // Invalid characters
        title: 'Test',
        description: 'Test',
        languages: ['en']
      };

      // This validation would be in the main function
      expect(/^[a-z0-9-]+$/.test(config.vocabularyName)).toBe(false);
    });
  });
});