import { describe, it, expect, beforeEach, afterEach, vi, MockedFunction } from 'vitest';
import type { ServerStateFile, ServerInfo, ServerMode } from './types';

// Mock fs functions completely to avoid real file system access
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn()
  };
});

// Mock os.tmpdir to return consistent path
vi.mock('os', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    tmpdir: vi.fn(() => '/tmp')
  };
});

// Import after mocking to ensure mocks are applied
import {
  readServerState,
  writeServerState,
  clearServerState,
  updateServerState,
  checkModeCompatibility,
  getStateFilePath
} from './state-manager';

import { readFileSync, writeFileSync, existsSync } from 'fs';

// Get mocked versions
const mockReadFileSync = readFileSync as MockedFunction<typeof readFileSync>;
const mockWriteFileSync = writeFileSync as MockedFunction<typeof writeFileSync>;
const mockExistsSync = existsSync as MockedFunction<typeof existsSync>;

// Mock process.kill - will be overridden in specific tests
const mockProcessKill = vi.spyOn(process, 'kill');
mockProcessKill.mockImplementation(() => true);

describe('state-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks to their default implementations
    mockExistsSync.mockReturnValue(false);
    mockReadFileSync.mockReturnValue('');
    mockWriteFileSync.mockImplementation(() => {});
    mockProcessKill.mockImplementation(() => true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getStateFilePath', () => {
    it('should return the correct state file path', () => {
      expect(getStateFilePath()).toBe('/tmp/.ifla-server-state.json');
    });
  });

  describe('readServerState', () => {
    it('should return null if file does not exist', () => {
      mockExistsSync.mockReturnValue(false);
      
      const result = readServerState();
      
      expect(result).toBeNull();
      expect(mockExistsSync).toHaveBeenCalledWith('/tmp/.ifla-server-state.json');
    });

    it('should return null if file is invalid JSON', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('invalid json');
      
      const result = readServerState();
      
      expect(result).toBeNull();
    });

    it('should return null if state structure is invalid', () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify({ invalid: 'structure' }));
      
      const result = readServerState();
      
      expect(result).toBeNull();
    });

    it('should return valid state when file exists and is valid', () => {
      const validState: ServerStateFile = {
        servers: [
          {
            pid: 1234,
            port: 3000,
            site: 'portal',
            mode: 'headless',
            startedAt: Date.now()
          }
        ],
        lastUpdated: Date.now(),
        mode: 'headless'
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(validState));
      
      const result = readServerState();
      
      expect(result).toEqual(validState);
    });
  });

  describe('writeServerState', () => {
    it('should write state to file', () => {
      const state: ServerStateFile = {
        servers: [],
        lastUpdated: Date.now(),
        mode: 'headless'
      };

      writeServerState(state);

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        '/tmp/.ifla-server-state.json',
        JSON.stringify(state, null, 2)
      );
    });

    it('should handle write errors gracefully', () => {
      const state: ServerStateFile = {
        servers: [],
        lastUpdated: Date.now(),
        mode: 'headless'
      };

      mockWriteFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      // Should not throw
      expect(() => writeServerState(state)).not.toThrow();
    });
  });

  describe('clearServerState', () => {
    it('should write empty state when file exists', () => {
      mockExistsSync.mockReturnValue(true);

      clearServerState();

      expect(mockWriteFileSync).toHaveBeenCalledWith(
        '/tmp/.ifla-server-state.json',
        expect.stringMatching(/"servers":\s*\[\]/)
      );
    });

    it('should not write when file does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      clearServerState();

      expect(mockWriteFileSync).not.toHaveBeenCalled();
    });
  });

  describe('updateServerState', () => {
    it('should update state with server info', () => {
      const servers: ServerInfo[] = [
        {
          site: 'portal',
          port: 3000,
          proc: { pid: 1234 } as any,
          mode: 'headless'
        }
      ];

      updateServerState(servers, 'headless');

      expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
      const [filePath, content] = mockWriteFileSync.mock.calls[0];
      expect(filePath).toBe('/tmp/.ifla-server-state.json');
      expect(content).toContain('"mode": "headless"');
      expect(content).toContain('"pid": 1234');
    });

    it('should handle servers without PID', () => {
      const servers: ServerInfo[] = [
        {
          site: 'portal',
          port: 3000,
          proc: {} as any
        }
      ];

      updateServerState(servers, 'interactive');

      expect(mockWriteFileSync).toHaveBeenCalledTimes(1);
      const [filePath, content] = mockWriteFileSync.mock.calls[0];
      expect(filePath).toBe('/tmp/.ifla-server-state.json');
      expect(content).toContain('"pid": 0');
      expect(content).toContain('"mode": "interactive"');
    });
  });

  describe('checkModeCompatibility', () => {
    it('should return compatible when no state exists', () => {
      mockExistsSync.mockReturnValue(false);

      const result = checkModeCompatibility('headless');

      expect(result).toEqual({
        compatible: true,
        existingServers: []
      });
    });

    it('should return compatible when no servers exist', () => {
      const state: ServerStateFile = {
        servers: [],
        lastUpdated: Date.now(),
        mode: 'headless'
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(state));

      const result = checkModeCompatibility('interactive');

      expect(result).toEqual({
        compatible: true,
        existingServers: []
      });
    });

    it('should return compatible when mode matches', () => {
      const state: ServerStateFile = {
        servers: [
          {
            pid: 1234,
            port: 3000,
            site: 'portal',
            mode: 'headless',
            startedAt: Date.now()
          }
        ],
        lastUpdated: Date.now(),
        mode: 'headless'
      };

      mockExistsSync.mockReturnValueOnce(true);
      mockReadFileSync.mockReturnValueOnce(JSON.stringify(state));
      
      // Mock process.kill to simulate all processes exist
      mockProcessKill.mockImplementationOnce(() => true);

      const result = checkModeCompatibility('headless');

      expect(result.compatible).toBe(true);
      expect(result.existingMode).toBe('headless');
      expect(result.existingServers).toHaveLength(1);
    });

    it('should return incompatible when mode differs', () => {
      const state: ServerStateFile = {
        servers: [
          {
            pid: 1234,
            port: 3000,
            site: 'portal',
            mode: 'headless',
            startedAt: Date.now()
          }
        ],
        lastUpdated: Date.now(),
        mode: 'headless'
      };

      mockExistsSync.mockReturnValueOnce(true);
      mockReadFileSync.mockReturnValueOnce(JSON.stringify(state));
      
      // Mock process.kill to simulate all processes exist
      mockProcessKill.mockImplementationOnce(() => true);

      const result = checkModeCompatibility('interactive');

      expect(result.compatible).toBe(false);
      expect(result.existingMode).toBe('headless');
      expect(result.existingServers).toHaveLength(1);
    });

    it('should filter out stale processes', () => {
      const state: ServerStateFile = {
        servers: [
          {
            pid: 1234,
            port: 3000,
            site: 'portal',
            mode: 'headless',
            startedAt: Date.now()
          },
          {
            pid: 0,
            port: 3001,
            site: 'isbd',
            mode: 'headless',
            startedAt: Date.now()
          }
        ],
        lastUpdated: Date.now(),
        mode: 'headless'
      };

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(state));

      // Mock process.kill to throw for dead processes
      const mockKill = vi.spyOn(process, 'kill');
      mockKill.mockImplementation((pid: number, signal: any) => {
        if (pid === 1234) return true; // Process exists
        throw new Error('No such process'); // Process doesn't exist
      });

      const result = checkModeCompatibility('headless');

      expect(result.existingServers).toHaveLength(1);
      expect(result.existingServers[0].pid).toBe(1234);
    });
  });
});
