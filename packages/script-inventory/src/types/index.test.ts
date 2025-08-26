/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import type { Script, ScriptType, AnalyzerOptions } from './index';

describe('TypeScript Types @unit @types', () => {
  it('should define Script interface correctly', () => {
    const mockScript: Script = {
      id: 'test-script',
      path: '/test/script.js',
      name: 'test-script',
      type: 'utility' as ScriptType,
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
      fileInfo: { size: 1024, extension: '.js' },
      packageReferences: []
    };

    expect(mockScript.id).toBe('test-script');
    expect(mockScript.type).toBe('utility');
    expect(mockScript.documentationScore).toBe(0.8);
    expect(Array.isArray(mockScript.tags)).toBe(true);
    expect(mockScript.deprecated).toBe(false);
  });

  it('should define AnalyzerOptions interface correctly', () => {
    const options: AnalyzerOptions = {
      directories: ['scripts', 'tools'],
      excludePatterns: ['node_modules'],
      minDocumentationScore: 0.6,
      verbose: true
    };

    expect(Array.isArray(options.directories)).toBe(true);
    expect(options.directories).toContain('scripts');
    expect(options.minDocumentationScore).toBe(0.6);
    expect(options.verbose).toBe(true);
  });

  it('should validate ScriptType enum values', () => {
    const validTypes: ScriptType[] = [
      'build',
      'deployment',
      'utility',
      'test',
      'maintenance',
      'development',
      'automation',
      'other'
    ];

    validTypes.forEach(type => {
      expect(typeof type).toBe('string');
    });
  });
});