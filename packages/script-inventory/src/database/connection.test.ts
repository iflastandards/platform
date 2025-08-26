/**
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Database } from 'sqlite3';
import { ScriptDatabase } from './connection';
import type { Script } from '../types';

// Mock sqlite3
vi.mock('sqlite3', () => ({
  Database: vi.fn().mockImplementation(() => ({
    close: vi.fn((cb) => cb()),
    run: vi.fn((sql, params, cb) => cb?.()),
    get: vi.fn((sql, params, cb) => cb?.(null, {})),
    all: vi.fn((sql, params, cb) => cb?.(null, [])),
    serialize: vi.fn((fn) => fn()),
    prepare: vi.fn(() => ({
      run: vi.fn(),
      finalize: vi.fn()
    }))
  })),
  OPEN_READWRITE: 2,
  OPEN_CREATE: 4
}));

// Mock fs
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    copyFile: vi.fn(),
    mkdir: vi.fn()
  },
  existsSync: vi.fn()
}));

describe('ScriptDatabase @integration @database', () => {
  let db: ScriptDatabase;
  let mockDbInstance: any;

  beforeEach(async () => {
    mockDbInstance = {
      close: vi.fn((cb) => cb()),
      run: vi.fn((sql, params, cb) => cb?.()),
      get: vi.fn((sql, params, cb) => cb?.(null, {})),
      all: vi.fn((sql, params, cb) => cb?.(null, [])),
      serialize: vi.fn((fn) => fn()),
      prepare: vi.fn(() => ({
        run: vi.fn(),
        finalize: vi.fn()
      }))
    };

    vi.mocked(Database).mockImplementation(() => mockDbInstance);
    
    db = new ScriptDatabase();
    await db.connect();
  });

  afterEach(async () => {
    await db.disconnect();
    vi.clearAllMocks();
  });

  describe('connection management @critical', () => {
    it('should connect to database', async () => {
      expect(Database).toHaveBeenCalledWith(
        expect.stringContaining('scripts.db'),
        expect.any(Number),
        expect.any(Function)
      );
    });

    it('should disconnect from database', async () => {
      await db.disconnect();
      expect(mockDbInstance.close).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      vi.mocked(Database).mockImplementation(() => {
        throw new Error('Connection failed');
      });

      const newDb = new ScriptDatabase();
      await expect(newDb.connect()).rejects.toThrow('Connection failed');
    });
  });

  describe('script operations @integration', () => {
    const mockScript: Script = {
      id: 'test-script',
      path: '/test/script.js',
      name: 'test-script',
      type: 'utility',
      purpose: 'Test script',
      description: 'A test script',
      author: 'Test Author',
      version: '1.0.0',
      tags: ['test'],
      dependencies: [],
      lastModified: new Date(),
      lastAnalyzed: new Date(),
      documentationScore: 0.8,
      deprecated: false,
      usage: 'node script.js',
      fileInfo: {
        size: 1024,
        extension: '.js'
      },
      packageReferences: []
    };

    it('should save script to database', async () => {
      mockDbInstance.run.mockImplementation((sql, params, cb) => {
        cb?.call({ lastID: 1, changes: 1 });
      });

      await db.saveScript(mockScript);

      expect(mockDbInstance.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO scripts'),
        expect.arrayContaining([
          mockScript.id,
          mockScript.path,
          mockScript.name
        ]),
        expect.any(Function)
      );
    });

    it('should get script from database', async () => {
      const mockRow = {
        id: mockScript.id,
        path: mockScript.path,
        name: mockScript.name,
        type: mockScript.type,
        purpose: mockScript.purpose,
        description: mockScript.description,
        author: mockScript.author,
        version: mockScript.version,
        tags: JSON.stringify(mockScript.tags),
        dependencies: JSON.stringify(mockScript.dependencies),
        lastModified: mockScript.lastModified.toISOString(),
        lastAnalyzed: mockScript.lastAnalyzed.toISOString(),
        documentationScore: mockScript.documentationScore,
        deprecated: 0,
        usage: mockScript.usage,
        fileInfo: JSON.stringify(mockScript.fileInfo),
        packageReferences: JSON.stringify(mockScript.packageReferences)
      };

      mockDbInstance.get.mockImplementation((sql, params, cb) => {
        cb?.(null, mockRow);
      });

      const result = await db.getScript(mockScript.id);

      expect(result).toEqual(mockScript);
      expect(mockDbInstance.get).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM scripts WHERE id = ?'),
        [mockScript.id],
        expect.any(Function)
      );
    });

    it('should get all scripts with pagination', async () => {
      const mockRows = [mockScript];
      
      mockDbInstance.all.mockImplementation((sql, params, cb) => {
        cb?.(null, mockRows.map(script => ({
          ...script,
          tags: JSON.stringify(script.tags),
          dependencies: JSON.stringify(script.dependencies),
          lastModified: script.lastModified.toISOString(),
          lastAnalyzed: script.lastAnalyzed.toISOString(),
          deprecated: script.deprecated ? 1 : 0,
          fileInfo: JSON.stringify(script.fileInfo),
          packageReferences: JSON.stringify(script.packageReferences)
        })));
      });

      const result = await db.getAllScripts({ limit: 10, offset: 0 });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockScript);
    });

    it('should search scripts', async () => {
      mockDbInstance.all.mockImplementation((sql, params, cb) => {
        cb?.(null, []);
      });

      const result = await db.searchScripts({
        keywords: ['test'],
        type: 'utility',
        limit: 10,
        offset: 0
      });

      expect(result).toEqual([]);
      expect(mockDbInstance.all).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.any(Array),
        expect.any(Function)
      );
    });
  });

  describe('statistics @unit', () => {
    it('should get database statistics', async () => {
      const mockStats = {
        totalScripts: 10,
        totalTags: 5,
        totalDependencies: 15,
        avgDocumentationScore: 0.75,
        databaseSize: '1MB',
        lastUpdated: new Date().toISOString()
      };

      mockDbInstance.get
        .mockImplementationOnce((sql, params, cb) => cb?.(null, { count: 10 }))
        .mockImplementationOnce((sql, params, cb) => cb?.(null, { count: 5 }))
        .mockImplementationOnce((sql, params, cb) => cb?.(null, { count: 15 }))
        .mockImplementationOnce((sql, params, cb) => cb?.(null, { avg: 0.75 }))
        .mockImplementationOnce((sql, params, cb) => cb?.(null, { lastModified: mockStats.lastUpdated }));

      const result = await db.getStats();

      expect(result).toMatchObject({
        totalScripts: 10,
        totalTags: 5,
        totalDependencies: 15,
        avgDocumentationScore: 0.75
      });
    });
  });

  describe('database maintenance @integration', () => {
    it('should backup database', async () => {
      const fs = await import('fs');
      vi.mocked(fs.promises.copyFile).mockResolvedValue(undefined);

      await db.backup();

      expect(fs.promises.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('scripts.db'),
        expect.stringContaining('scripts.db.backup')
      );
    });

    it('should handle backup errors', async () => {
      const fs = await import('fs');
      vi.mocked(fs.promises.copyFile).mockRejectedValue(new Error('Backup failed'));

      await expect(db.backup()).rejects.toThrow('Backup failed');
    });
  });
});