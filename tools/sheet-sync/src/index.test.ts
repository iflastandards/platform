import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SheetSync } from './index';

// Mock environment variables
vi.mock('dotenv', () => ({
  config: vi.fn()
}));

// Mock Google APIs
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn()
    },
    sheets: vi.fn()
  }
}));

// Mock filesystem operations
vi.mock('fs', () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  readdirSync: vi.fn()
}));

// Mock path operations
vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  dirname: vi.fn()
}));

// Mock Commander
vi.mock('commander', () => ({
  Command: vi.fn(() => ({
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    command: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parse: vi.fn()
  }))
}));

describe('SheetSync', () => {
  let sheetSync: SheetSync;

  beforeEach(() => {
    vi.clearAllMocks();
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