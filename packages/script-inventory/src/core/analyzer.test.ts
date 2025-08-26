/**
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { ScriptAnalyzer } from './analyzer';
import type { AnalyzerOptions } from '../types';

// Mock fs operations
vi.mock('fs', () => ({
  promises: {
    access: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
    mkdir: vi.fn(),
  }
}));

describe('ScriptAnalyzer @integration @analysis', () => {
  let analyzer: ScriptAnalyzer;
  let mockOptions: AnalyzerOptions;

  beforeEach(() => {
    mockOptions = {
      directories: ['scripts', 'tools'],
      excludePatterns: ['node_modules', '.git'],
      minDocumentationScore: 0.6,
      verbose: false
    };
    analyzer = new ScriptAnalyzer(mockOptions);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findScriptFiles @unit', () => {
    it('should find script files in specified directories', async () => {
      const mockFiles = [
        { name: 'script1.js', isFile: () => true, isDirectory: () => false },
        { name: 'script2.ts', isFile: () => true, isDirectory: () => false },
        { name: 'README.md', isFile: () => true, isDirectory: () => false }
      ];

      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as any);

      const files = await analyzer.findScriptFiles();
      
      expect(files).toEqual([
        path.join('scripts', 'script1.js'),
        path.join('scripts', 'script2.ts'),
        path.join('tools', 'script1.js'),
        path.join('tools', 'script2.ts')
      ]);
      expect(fs.access).toHaveBeenCalledWith('scripts');
      expect(fs.access).toHaveBeenCalledWith('tools');
    });

    it('should handle directory access errors gracefully', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('Directory not found'));

      const files = await analyzer.findScriptFiles();
      
      expect(files).toEqual([]);
    });
  });

  describe('analyzeScript @integration', () => {
    it('should analyze a script file and extract metadata', async () => {
      const mockScript = `#!/usr/bin/env node
/**
 * Test script for inventory analysis
 * @purpose Testing script analysis functionality
 * @author Test Author
 * @version 1.0.0
 */

const fs = require('fs');
console.log('Hello, world!');
`;

      vi.mocked(fs.readFile).mockResolvedValue(mockScript);
      vi.mocked(fs.stat).mockResolvedValue({
        size: 1024,
        mtime: new Date('2023-01-01T00:00:00Z'),
        isFile: () => true
      } as any);

      const result = await analyzer.analyzeScript('test/script.js');

      expect(result).toBe(true);
      expect(fs.readFile).toHaveBeenCalledWith('test/script.js', 'utf-8');
    });

    it('should handle file read errors gracefully', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

      const result = await analyzer.analyzeScript('nonexistent.js');

      expect(result).toBe(false);
    });
  });

  describe('analyze @integration @critical', () => {
    it('should perform full analysis and return results', async () => {
      // Mock findScriptFiles to return test files
      const mockFiles = ['scripts/test1.js', 'scripts/test2.ts'];
      vi.spyOn(analyzer, 'findScriptFiles').mockResolvedValue(mockFiles);
      
      // Mock analyzeScript to return success
      vi.spyOn(analyzer, 'analyzeScript').mockResolvedValue(true);

      const result = await analyzer.analyze();

      expect(result.processedFiles).toEqual(mockFiles);
      expect(result.updatedFiles).toEqual(mockFiles);
      expect(result.skippedFiles).toEqual([]);
      expect(result.errorFiles).toEqual([]);
    });

    it('should handle mixed success and failure scenarios', async () => {
      const mockFiles = ['scripts/good.js', 'scripts/bad.js'];
      vi.spyOn(analyzer, 'findScriptFiles').mockResolvedValue(mockFiles);
      
      // Mock first file succeeds, second fails
      vi.spyOn(analyzer, 'analyzeScript')
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const result = await analyzer.analyze();

      expect(result.processedFiles).toEqual(mockFiles);
      expect(result.updatedFiles).toEqual(['scripts/good.js']);
      expect(result.errorFiles).toEqual(['scripts/bad.js']);
    });
  });

  describe('configuration @unit', () => {
    it('should use provided options', () => {
      expect(analyzer.options).toEqual(mockOptions);
    });

    it('should handle default options', () => {
      const defaultAnalyzer = new ScriptAnalyzer();
      expect(defaultAnalyzer.options.directories).toEqual(['scripts', 'tools']);
      expect(defaultAnalyzer.options.verbose).toBe(false);
    });
  });
});