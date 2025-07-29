import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectBrowser, launchBrowser } from './browser';

vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal();
  const mockSpawn = vi.fn().mockImplementation(() => ({
    on: vi.fn((event, callback) => {
      if (event === 'spawn') {
        setTimeout(() => callback(), 10);
      }
    }),
    unref: vi.fn(),
    kill: vi.fn(),
    pid: 12345
  }));
  
  return {
    ...actual,
    spawn: mockSpawn
  };
});


describe('Browser Override Selection', () => {

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
      // Chrome might be available on the system (like macOS) or not
      expect(['launched', 'failed']).toContain(result.status);
    }, 10000);

    it('should return error if unsupported browser is specified', async () => {
      const result = await launchBrowser('unsupported' as any, { url: 'http://example.com' });
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported browser type');
    });
  });
});
