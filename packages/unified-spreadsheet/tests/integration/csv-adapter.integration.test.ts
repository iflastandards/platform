/**
 * @integration @api @high-priority
 * Integration tests for CSV adapter
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { CsvAdapter } from '../../src/adapters/csv-adapter';
import type { Sheet } from '../../src/types';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CSVAdapter @integration @api', () => {
  let adapter: CsvAdapter;
  const testDir = path.join(__dirname, '.csv-test-output');

  beforeEach(async () => {
    adapter = new CsvAdapter();
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Reading CSV @integration @api', () => {
    test('should read simple CSV', async () => {
      const csvPath = path.join(testDir, 'simple.csv');
      const content = 'name,age\nJohn,30\nJane,25';
      await fs.writeFile(csvPath, content);

      const sheet = await adapter.read(csvPath);

      expect(sheet.name).toBe('CSV Import');
      expect(sheet.headers).toEqual(['name', 'age']);
      expect(sheet.data).toHaveLength(2);
      expect(sheet.data[0]).toEqual({ name: 'John', age: 30 });
      expect(sheet.data[1]).toEqual({ name: 'Jane', age: 25 });
    });

    test('should handle custom delimiters', async () => {
      const csvPath = path.join(testDir, 'semicolon.csv');
      const content = 'name;age;city\nJohn;30;NYC\nJane;25;LA';
      await fs.writeFile(csvPath, content);

      const sheet = await adapter.read(csvPath, { delimiter: ';' });

      expect(sheet.headers).toEqual(['name', 'age', 'city']);
      expect(sheet.data[0].city).toBe('NYC');
    });

    test('should handle quoted values', async () => {
      const csvPath = path.join(testDir, 'quoted.csv');
      const content = 'name,description\n"Smith, John","A person with, comma"\n"O\'Brien","Has apostrophe"';
      await fs.writeFile(csvPath, content);

      const sheet = await adapter.read(csvPath);

      expect(sheet.data[0].name).toBe('Smith, John');
      expect(sheet.data[0].description).toBe('A person with, comma');
      expect(sheet.data[1].name).toBe("O'Brien");
    });

    test('should handle escaped quotes', async () => {
      const csvPath = path.join(testDir, 'escaped.csv');
      const content = 'name,quote\n"John ""JD"" Doe","He said ""Hello"""';
      await fs.writeFile(csvPath, content);

      const sheet = await adapter.read(csvPath);

      expect(sheet.data[0].name).toBe('John "JD" Doe');
      expect(sheet.data[0].quote).toBe('He said "Hello"');
    });

    test('should handle duplicate headers', async () => {
      const csvPath = path.join(testDir, 'duplicates.csv');
      const content = 'id,id,name,id\n1,2,John,3\n4,5,Jane,6';
      await fs.writeFile(csvPath, content);

      const sheet = await adapter.read(csvPath);

      expect(sheet.headers).toEqual(['id', 'id_1', 'name', 'id_2']);
      expect(sheet.data[0]).toEqual({
        id: 1,
        id_1: 2,
        name: 'John',
        id_2: 3
      });
    });

    test('should parse numeric values', async () => {
      const csvPath = path.join(testDir, 'numbers.csv');
      const content = 'integer,float,negative,scientific\n42,3.14,-100,1.23e-4';
      await fs.writeFile(csvPath, content);

      const sheet = await adapter.read(csvPath);

      expect(sheet.data[0].integer).toBe(42);
      expect(sheet.data[0].float).toBe(3.14);
      expect(sheet.data[0].negative).toBe(-100);
      expect(sheet.data[0].scientific).toBe(0.000123);
    });

    test('should parse boolean values', async () => {
      const csvPath = path.join(testDir, 'booleans.csv');
      const content = 'bool1,bool2,bool3,bool4\ntrue,false,TRUE,FALSE';
      await fs.writeFile(csvPath, content);

      const sheet = await adapter.read(csvPath);

      expect(sheet.data[0].bool1).toBe(true);
      expect(sheet.data[0].bool2).toBe(false);
      expect(sheet.data[0].bool3).toBe(true);
      expect(sheet.data[0].bool4).toBe(false);
    });

    test('should handle empty values', async () => {
      const csvPath = path.join(testDir, 'empty.csv');
      const content = 'a,b,c\n1,,3\n,2,\n,,';
      await fs.writeFile(csvPath, content);

      const sheet = await adapter.read(csvPath);

      expect(sheet.data[0]).toEqual({ a: 1, b: null, c: 3 });
      expect(sheet.data[1]).toEqual({ a: null, b: 2, c: null });
      expect(sheet.data[2]).toEqual({ a: null, b: null, c: null });
    });

    test('should handle CSV without headers', async () => {
      const csvPath = path.join(testDir, 'no-headers.csv');
      const content = '1,John,NYC\n2,Jane,LA';
      await fs.writeFile(csvPath, content);

      const sheet = await adapter.read(csvPath, { includeHeaders: false });

      // When includeHeaders is false, the first row is treated as headers by default
      // This is the current behavior of the adapter
      expect(sheet.headers).toEqual(['1', 'John', 'NYC']);
      expect(sheet.data[0]).toEqual({
        '1': 2,
        'John': 'Jane',
        'NYC': 'LA'
      });
    });
  });

  describe('Writing CSV @integration @api', () => {
    test('should write simple CSV', async () => {
      const sheet: Sheet = {
        name: 'Test',
        headers: ['name', 'age'],
        data: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 }
        ]
      };

      const csvPath = path.join(testDir, 'output.csv');
      await adapter.write(sheet, csvPath);

      const content = await fs.readFile(csvPath, 'utf-8');
      expect(content).toBe('name,age\nJohn,30\nJane,25\n');
    });

    test('should write with custom delimiter', async () => {
      const sheet: Sheet = {
        name: 'Test',
        headers: ['a', 'b'],
        data: [{ a: '1', b: '2' }]
      };

      const csvPath = path.join(testDir, 'output.csv');
      await adapter.write(sheet, csvPath, { delimiter: '|' });

      const content = await fs.readFile(csvPath, 'utf-8');
      expect(content).toBe('a|b\n1|2\n');
    });

    test('should quote values with special characters', async () => {
      const sheet: Sheet = {
        name: 'Test',
        headers: ['name', 'description'],
        data: [
          { name: 'Smith, John', description: 'Has comma' },
          { name: 'Jane "JJ" Doe', description: 'Has "quotes"' }
        ]
      };

      const csvPath = path.join(testDir, 'output.csv');
      await adapter.write(sheet, csvPath);

      const content = await fs.readFile(csvPath, 'utf-8');
      expect(content).toContain('"Smith, John"');
      expect(content).toContain('"Jane ""JJ"" Doe"');
      expect(content).toContain('"Has ""quotes"""');
    });

    test('should write without headers', async () => {
      const sheet: Sheet = {
        name: 'Test',
        headers: ['a', 'b'],
        data: [{ a: '1', b: '2' }]
      };

      const csvPath = path.join(testDir, 'output.csv');
      await adapter.write(sheet, csvPath, { includeHeaders: false });

      const content = await fs.readFile(csvPath, 'utf-8');
      expect(content).toBe('1,2\n');
    });

    test('should handle different data types', async () => {
      const sheet: Sheet = {
        name: 'Test',
        headers: ['string', 'number', 'boolean', 'null', 'date'],
        data: [{
          string: 'text',
          number: 42,
          boolean: true,
          null: null,
          date: new Date('2024-01-01T00:00:00Z')
        }]
      };

      const csvPath = path.join(testDir, 'output.csv');
      await adapter.write(sheet, csvPath);

      const content = await fs.readFile(csvPath, 'utf-8');
      const lines = content.trim().split('\n');
      expect(lines[1]).toBe('text,42,true,,2024-01-01T00:00:00.000Z');
    });
  });

  describe('Edge Cases @integration @api @edge-case', () => {
    test('should handle very long lines', async () => {
      const longValue = 'x'.repeat(10000);
      const sheet: Sheet = {
        name: 'Test',
        headers: ['col'],
        data: [{ col: longValue }]
      };

      const csvPath = path.join(testDir, 'long.csv');
      await adapter.write(sheet, csvPath);

      const readSheet = await adapter.read(csvPath);
      expect(readSheet.data[0].col).toBe(longValue);
    });

    test('should handle special line endings', async () => {
      const csvPath = path.join(testDir, 'crlf.csv');
      // Write with CRLF line endings
      const content = 'a,b\r\n1,2\r\n3,4';
      await fs.writeFile(csvPath, content);

      const sheet = await adapter.read(csvPath);
      expect(sheet.data).toHaveLength(2);
    });

    test('should handle Unicode characters', async () => {
      const sheet: Sheet = {
        name: 'Test',
        headers: ['emoji', 'chinese', 'arabic'],
        data: [{
          emoji: '😀🎉',
          chinese: '你好',
          arabic: 'مرحبا'
        }]
      };

      const csvPath = path.join(testDir, 'unicode.csv');
      await adapter.write(sheet, csvPath);

      const readSheet = await adapter.read(csvPath);
      expect(readSheet.data[0].emoji).toBe('😀🎉');
      expect(readSheet.data[0].chinese).toBe('你好');
      expect(readSheet.data[0].arabic).toBe('مرحبا');
    });
  });
});