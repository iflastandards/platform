/**
 * @unit @utility @vocabulary @low-priority
 * 
 * Unit tests for vocabulary comparison CLI argument parsing logic
 * Tests pure parsing functions without external dependencies
 */

import { describe, it, expect } from 'vitest';

/**
 * Mock implementation of the parseArgs logic from vocabulary-comparison.mjs
 * This replicates the parsing behavior for testing purposes
 */
function parseArgs(args: string[]) {
  const options = {
    spreadsheetId: '',
    indexSheet: 'index',
    skipRdfCheck: false,
    markdown: false,
    outputPath: 'tmp/vocabulary-comparison-report.md',
    help: false,
  };

  args.forEach((arg) => {
    if (arg.startsWith('--spreadsheet-id=')) {
      options.spreadsheetId = arg.split('=')[1];
    } else if (arg.startsWith('--index-sheet=')) {
      options.indexSheet = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      options.outputPath = arg.split('=')[1];
    } else if (arg === '--skip-rdf-check') {
      options.skipRdfCheck = true;
    } else if (arg === '--markdown' || arg === '-md') {
      options.markdown = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  });

  return options;
}

describe('Vocabulary Comparison CLI Argument Parsing', () => {
  describe('parseArgs function', () => {
    it('should parse spreadsheet ID correctly', () => {
      const args = ['--spreadsheet-id=test123'];
      const options = parseArgs(args);

      expect(options.spreadsheetId).toBe('test123');
      expect(options.indexSheet).toBe('index'); // default
      expect(options.skipRdfCheck).toBe(false); // default
      expect(options.markdown).toBe(false); // default
    });

    it('should parse all flags correctly', () => {
      const args = [
        '--spreadsheet-id=test123',
        '--index-sheet=custom-index',
        '--output=custom/output.md',
        '--skip-rdf-check',
        '--markdown',
      ];
      
      const options = parseArgs(args);

      expect(options.spreadsheetId).toBe('test123');
      expect(options.indexSheet).toBe('custom-index');
      expect(options.outputPath).toBe('custom/output.md');
      expect(options.skipRdfCheck).toBe(true);
      expect(options.markdown).toBe(true);
      expect(options.help).toBe(false);
    });

    it('should handle -md shorthand for markdown flag', () => {
      const args = ['--spreadsheet-id=test123', '-md'];
      const options = parseArgs(args);

      expect(options.markdown).toBe(true);
      expect(options.spreadsheetId).toBe('test123');
    });

    it('should handle -h shorthand for help flag', () => {
      const args = ['-h'];
      const options = parseArgs(args);

      expect(options.help).toBe(true);
    });

    it('should handle --help flag', () => {
      const args = ['--help'];
      const options = parseArgs(args);

      expect(options.help).toBe(true);
    });

    it('should maintain default values when no arguments provided', () => {
      const args: string[] = [];
      const options = parseArgs(args);

      expect(options.spreadsheetId).toBe('');
      expect(options.indexSheet).toBe('index');
      expect(options.skipRdfCheck).toBe(false);
      expect(options.markdown).toBe(false);
      expect(options.outputPath).toBe('tmp/vocabulary-comparison-report.md');
      expect(options.help).toBe(false);
    });

    it('should handle mixed order of arguments', () => {
      const args = [
        '--markdown',
        '--spreadsheet-id=mixed-order',
        '--skip-rdf-check',
        '--index-sheet=mixed',
      ];
      
      const options = parseArgs(args);

      expect(options.spreadsheetId).toBe('mixed-order');
      expect(options.indexSheet).toBe('mixed');
      expect(options.skipRdfCheck).toBe(true);
      expect(options.markdown).toBe(true);
    });

    it('should handle empty string values in parameters', () => {
      const args = [
        '--spreadsheet-id=',
        '--index-sheet=',
        '--output=',
      ];
      
      const options = parseArgs(args);

      expect(options.spreadsheetId).toBe('');
      expect(options.indexSheet).toBe('');
      expect(options.outputPath).toBe('');
    });

    it('should handle duplicate flags (last one wins)', () => {
      const args = [
        '--spreadsheet-id=first',
        '--spreadsheet-id=second',
        '--index-sheet=initial',
        '--index-sheet=final',
      ];
      
      const options = parseArgs(args);

      expect(options.spreadsheetId).toBe('second');
      expect(options.indexSheet).toBe('final');
    });

    it('should ignore unrecognized arguments', () => {
      const args = [
        '--spreadsheet-id=test123',
        '--unknown-flag',
        '--another=unknown',
        '--markdown',
      ];
      
      const options = parseArgs(args);

      // Should parse recognized args and ignore unknown ones
      expect(options.spreadsheetId).toBe('test123');
      expect(options.markdown).toBe(true);
      // Unknown flags should not affect other values
      expect(options.skipRdfCheck).toBe(false);
    });
  });
});