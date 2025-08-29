import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock child_process to simulate Chrome not being found (safer for tests)
vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    spawn: vi.fn().mockImplementation(() => ({
      on: vi.fn((event, callback) => {
        if (event === 'error') {
          setTimeout(() => callback(new Error('spawn ENOENT')), 10);
        } else if (event === 'exit') {
          setTimeout(() => callback(1), 20); // Non-zero exit code = failure
        }
      }),
      kill: vi.fn(),
      unref: vi.fn(),
      pid: undefined
    }))
  };
});

import { detectBrowser, launchBrowser } from './browser';

/**
 * @integration @low-priority @ui @server-dependent
 */


describe('Browser Override Selection @integration', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BROWSER = '';
    process.argv = [];
  });

  describe('detectBrowser @unit', () => {
    it('should detect default as auto @unit', () => {
      const result = detectBrowser();
      expect(result.browser).toBe('auto');
      expect(result.source).toBe('default');
    });

    it('should detect browser from CLI flag @unit', () => {
      process.argv.push('--browser=chrome');
      const result = detectBrowser();
      expect(result.browser).toBe('chrome');
      expect(result.source).toBe('flag');
    });

    it('should detect browser from environment variable @unit', () => {
      process.env.BROWSER = 'chrome';
      const result = detectBrowser();
      expect(result.browser).toBe('chrome');
      expect(result.source).toBe('env');
    });
  });

  describe('launchBrowser @integration', () => {
    it('should attempt to launch Chrome when specified @integration @server-dependent', async () => {
      const result = await launchBrowser('chrome', { url: 'http://example.com' });
      // With our mock, Chrome should not be found (safer for tests)
      expect(result.success).toBe(false);
      expect(result.error).toContain('Chrome/Chromium not found');
      expect(result.fallback).toBeDefined();
    }, 1000);

    it('should return error if unsupported browser is specified @integration', async () => {
      const result = await launchBrowser('unsupported' as any, { url: 'http://example.com' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported browser type');
    });
  });
});
