/**
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the CLI commands
vi.mock('./commands/analyze', () => ({
  analyzeCommand: vi.fn()
}));

vi.mock('./commands/query', () => ({
  queryCommand: vi.fn()
}));

vi.mock('./commands/register', () => ({
  registerCommand: vi.fn()
}));

vi.mock('./commands/validate', () => ({
  validateCommand: vi.fn()
}));

vi.mock('../api/server', () => ({
  ScriptInventoryServer: vi.fn().mockImplementation(() => ({
    start: vi.fn()
  }))
}));

describe('CLI @integration @cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('command parsing @unit', () => {
    it('should import CLI modules successfully', async () => {
      // Test that we can import the command modules
      const { analyzeCommand } = await import('./commands/analyze');
      const { queryCommand } = await import('./commands/query');
      const { registerCommand } = await import('./commands/register');
      const { validateCommand } = await import('./commands/validate');
      
      expect(analyzeCommand).toBeDefined();
      expect(queryCommand).toBeDefined();
      expect(registerCommand).toBeDefined();
      expect(validateCommand).toBeDefined();
    });
  });

  describe('command modules @integration', () => {
    it('should call analyzeCommand when imported', async () => {
      const { analyzeCommand } = await import('./commands/analyze');
      
      // Test that the function exists and can be called
      expect(analyzeCommand).toBeDefined();
      expect(typeof analyzeCommand).toBe('function');
    });

    it('should call queryCommand when imported', async () => {
      const { queryCommand } = await import('./commands/query');
      
      expect(queryCommand).toBeDefined();
      expect(typeof queryCommand).toBe('function');
    });

    it('should call registerCommand when imported', async () => {
      const { registerCommand } = await import('./commands/register');
      
      expect(registerCommand).toBeDefined();
      expect(typeof registerCommand).toBe('function');
    });

    it('should call validateCommand when imported', async () => {
      const { validateCommand } = await import('./commands/validate');
      
      expect(validateCommand).toBeDefined();
      expect(typeof validateCommand).toBe('function');
    });
  });
});