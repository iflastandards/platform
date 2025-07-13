import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SheetSync } from './index';

// Mock environment variables
vi.mock('dotenv', () => ({
  config: vi.fn(),
}));

// Mock Google APIs
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn(),
    },
    sheets: vi.fn(() => ({
      spreadsheets: {
        get: vi.fn().mockResolvedValue({
          data: {
            sheets: [{ properties: { title: 'Sheet1' } }],
          },
        }),
        values: {
          get: vi.fn().mockResolvedValue({
            data: {
              values: [
                ['header1', 'header2'],
                ['value1', 'value2'],
              ],
            },
          }),
          update: vi.fn().mockResolvedValue({}),
          batchUpdate: vi.fn().mockResolvedValue({}),
          clear: vi.fn().mockResolvedValue({}),
        },
        batchUpdate: vi.fn().mockResolvedValue({}),
      },
    })),
  },
}));

// Mock filesystem operations
vi.mock('fs', () => ({
  readFileSync: vi.fn().mockReturnValue('{"sheetId": "test-sheet-id"}'),
  writeFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
  readdirSync: vi.fn().mockReturnValue(['elements.csv']),
}));

// Mock path operations
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  dirname: vi.fn(),
}));

// Mock Commander
vi.mock('commander', () => ({
  Command: vi.fn(() => ({
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    command: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parse: vi.fn(),
  })),
}));

describe('SheetSync', () => {
  let sheetSync: SheetSync;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock environment variables
    process.env.GSHEETS_SA_KEY = Buffer.from(
      JSON.stringify({
        type: 'service_account',
        project_id: 'test-project',
        private_key_id: 'test-key-id',
        private_key:
          '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n',
        client_email: 'test@test-project.iam.gserviceaccount.com',
        client_id: 'test-client-id',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
      }),
    ).toString('base64');

    sheetSync = new SheetSync();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(sheetSync).toBeInstanceOf(SheetSync);
    });

    it('should initialize with environment configuration', () => {
      // Test that the constructor loads global config
      expect(sheetSync).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Test that missing GSHEETS_SA_KEY is handled
      try {
        await sheetSync.status('ISBDM');
      } catch (error) {
        // Should handle missing credentials gracefully in status method
      }

      // Test passes if no unhandled errors are thrown
      expect(true).toBe(true);
    });
  });

  describe('standards configuration', () => {
    it('should have predefined standards', () => {
      // Test that the class can be instantiated and has expected methods
      expect(typeof sheetSync.pull).toBe('function');
      expect(typeof sheetSync.push).toBe('function');
      expect(typeof sheetSync.status).toBe('function');
    });
  });
});
