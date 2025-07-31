import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectBrowser, launchBrowser } from './browser';

// Mock child_process to simulate Chrome not being found (safer for tests)
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal();
  const mockSpawn = vi.fn().mockImplementation(() => {
    const mockProcess = {
      on: vi.fn((event, callback) => {
        if (event === 'error') {
          // Simulate Chrome not found error to prevent real browser launches
          setTimeout(() => callback(new Error('spawn ENOENT')), 10);
        } else if (event === 'exit') {
          // Simulate failure exit code
          setTimeout(() => callback(1), 20);
        }
      }),
      unref: vi.fn(),
      kill: vi.fn(),
      pid: undefined // No PID when process fails to start
    };
    return mockProcess;
  });
  
  return {
    ...actual,
    spawn: mockSpawn
  };
});


describe('Browser Override Selection @unit', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BROWSER = '';
    process.argv = [];
  });

  describe('detectBrowser', () => {
    it('should detect default as auto', () => {
      const result = detectBrowser();
      expect(result.browser).toBe('auto');
      expect(result.source).toBe('default');
    });

    it('should detect browser from CLI flag', () => {
      process.argv.push('--browser=chrome');
      const result = detectBrowser();
      expect(result.browser).toBe('chrome');
      expect(result.source).toBe('flag');
    });

    it('should detect browser from environment variable', () => {
      process.env.BROWSER = 'chrome';
      const result = detectBrowser();
      expect(result.browser).toBe('chrome');
      expect(result.source).toBe('env');
    });
  });

  describe('launchBrowser', () => {
    it('should attempt to launch Chrome when specified', async () => {
      const result = await launchBrowser('chrome', { url: 'http://example.com' });
      // With our mock, Chrome should not be found (safer for tests)
      expect(result.success).toBe(false);
      expect(result.error).toContain('Chrome/Chromium not found');
      expect(result.fallback).toBeDefined();
    }, 1000);

    it('should return error if unsupported browser is specified', async () => {
      const result = await launchBrowser('unsupported' as any, { url: 'http://example.com' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported browser type');
    });
  });
});
