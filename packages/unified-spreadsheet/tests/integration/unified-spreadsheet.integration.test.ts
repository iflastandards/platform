/**
 * @integration @api @critical
 * Comprehensive integration tests for UnifiedSpreadsheetAPI
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { UnifiedSpreadsheetAPI } from '../../src/unified-spreadsheet';
import { ExcelJSAdapter } from '../../src/adapters/exceljs-adapter';
import { CsvAdapter } from '../../src/adapters/csv-adapter';
import type { Workbook, Sheet, Row } from '../../src/types';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('UnifiedSpreadsheetAPI @integration @api', () => {
  let api: UnifiedSpreadsheetAPI;
  const testDir = path.join(__dirname, '.test-output');

  beforeEach(async () => {
    api = new UnifiedSpreadsheetAPI();
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Core API @integration @api @happy-path', () => {
    test('should create instance with default adapters', () => {
      expect(api).toBeDefined();
      expect(api.read).toBeDefined();
      expect(api.write).toBeDefined();
      expect(api.convert).toBeDefined();
      expect(api.validate).toBeDefined();
    });
  });

  describe('CSV Operations @integration @api', () => {
    const csvContent = `name,age,city
John Doe,30,New York
Jane Smith,25,London
Bob Johnson,35,Tokyo`;

    test('should read CSV file', async () => {
      const csvPath = path.join(testDir, 'test.csv');
      await fs.writeFile(csvPath, csvContent);

      const workbook = await api.read({ type: 'file', path: csvPath });

      expect(workbook.sheets).toHaveLength(1);
      expect(workbook.sheets[0].headers).toEqual(['name', 'age', 'city']);
      expect(workbook.sheets[0].data).toHaveLength(3);
      expect(workbook.sheets[0].data[0]).toEqual({
        name: 'John Doe',
        age: 30,
        city: 'New York'
      });
    });

    test('should write CSV file', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Test Sheet',
          headers: ['name', 'age', 'city'],
          data: [
            { name: 'John Doe', age: 30, city: 'New York' },
            { name: 'Jane Smith', age: 25, city: 'London' }
          ]
        }]
      };

      const csvPath = path.join(testDir, 'output.csv');
      await api.write(workbook, { type: 'csv', path: csvPath });

      const content = await fs.readFile(csvPath, 'utf-8');
      expect(content).toContain('name,age,city');
      expect(content).toContain('John Doe,30,New York');
      expect(content).toContain('Jane Smith,25,London');
    });

    test('should handle CSV with duplicate headers', async () => {
      const csvWithDuplicates = `uri,uri,type,label
item1,,Type1,Label1
item2,,Type2,Label2`;

      const csvPath = path.join(testDir, 'duplicates.csv');
      await fs.writeFile(csvPath, csvWithDuplicates);

      const workbook = await api.read({ type: 'file', path: csvPath });

      expect(workbook.sheets[0].headers).toEqual(['uri', 'uri_1', 'type', 'label']);
      expect(workbook.sheets[0].data[0]).toEqual({
        uri: 'item1',
        uri_1: null,
        type: 'Type1',
        label: 'Label1'
      });
    });
  });

  describe('Excel Operations @integration @api', () => {
    test('should write and read XLSX file', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Data',
          headers: ['Product', 'Price', 'Stock'],
          data: [
            { Product: 'Apple', Price: 1.5, Stock: 100 },
            { Product: 'Banana', Price: 0.8, Stock: 150 },
            { Product: 'Orange', Price: 2.0, Stock: 80 }
          ],
          metadata: {
            frozenRows: 1,
            columnWidths: [15, 10, 10]
          }
        }],
        metadata: {
          title: 'Product Inventory',
          author: 'Test Suite'
        }
      };

      const xlsxPath = path.join(testDir, 'products.xlsx');
      await api.write(workbook, { type: 'xlsx', path: xlsxPath });

      // Verify file exists
      const stats = await fs.stat(xlsxPath);
      expect(stats.size).toBeGreaterThan(0);

      // Read it back
      const readWorkbook = await api.read({ type: 'file', path: xlsxPath });
      
      expect(readWorkbook.sheets).toHaveLength(1);
      expect(readWorkbook.sheets[0].name).toBe('Data');
      expect(readWorkbook.sheets[0].data).toHaveLength(3);
      expect(readWorkbook.sheets[0].data[0].Product).toBe('Apple');
      expect(readWorkbook.sheets[0].data[0].Price).toBe(1.5);
    });

    test('should handle multiple sheets', async () => {
      const workbook: Workbook = {
        sheets: [
          {
            name: 'Sales',
            headers: ['Month', 'Revenue'],
            data: [
              { Month: 'January', Revenue: 10000 },
              { Month: 'February', Revenue: 12000 }
            ]
          },
          {
            name: 'Expenses',
            headers: ['Category', 'Amount'],
            data: [
              { Category: 'Rent', Amount: 3000 },
              { Category: 'Utilities', Amount: 500 }
            ]
          }
        ]
      };

      const xlsxPath = path.join(testDir, 'multi-sheet.xlsx');
      await api.write(workbook, { type: 'xlsx', path: xlsxPath });

      const readWorkbook = await api.read({ type: 'file', path: xlsxPath });
      
      expect(readWorkbook.sheets).toHaveLength(2);
      expect(readWorkbook.sheets[0].name).toBe('Sales');
      expect(readWorkbook.sheets[1].name).toBe('Expenses');
    });
  });

  describe('File Type Auto-detection @integration @api', () => {
    test('should auto-detect CSV file', async () => {
      const csvPath = path.join(testDir, 'auto.csv');
      await fs.writeFile(csvPath, 'a,b\n1,2');

      const workbook = await api.read({ type: 'file', path: csvPath });
      expect(workbook.sheets[0].data).toHaveLength(1);
    });

    test('should auto-detect XLSX file', async () => {
      // Create a simple XLSX file first
      const workbook: Workbook = {
        sheets: [{ name: 'Test', headers: ['col1'], data: [{ col1: 'value1' }] }]
      };
      
      const xlsxPath = path.join(testDir, 'auto.xlsx');
      await api.write(workbook, { type: 'xlsx', path: xlsxPath });

      // Read using file type with auto-detection
      const readWorkbook = await api.read({ type: 'file', path: xlsxPath });
      expect(readWorkbook.sheets[0].data[0].col1).toBe('value1');
    });
  });

  describe('Conversion Operations @integration @api', () => {
    test('should convert CSV to XLSX', async () => {
      const csvPath = path.join(testDir, 'input.csv');
      const xlsxPath = path.join(testDir, 'output.xlsx');

      await fs.writeFile(csvPath, 'name,score\nAlice,95\nBob,87');

      await api.convert(
        { type: 'file', path: csvPath },
        { type: 'xlsx', path: xlsxPath }
      );

      const workbook = await api.read({ type: 'file', path: xlsxPath });
      expect(workbook.sheets[0].data).toHaveLength(2);
      expect(workbook.sheets[0].data[0].name).toBe('Alice');
    });

    test('should convert XLSX to CSV', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Sheet1',
          headers: ['id', 'value'],
          data: [
            { id: 1, value: 'test' },
            { id: 2, value: 'data' }
          ]
        }]
      };

      const xlsxPath = path.join(testDir, 'input.xlsx');
      const csvPath = path.join(testDir, 'output.csv');

      await api.write(workbook, { type: 'xlsx', path: xlsxPath });
      await api.convert(
        { type: 'file', path: xlsxPath },
        { type: 'csv', path: csvPath }
      );

      const csvContent = await fs.readFile(csvPath, 'utf-8');
      expect(csvContent).toContain('id,value');
      expect(csvContent).toContain('1,test');
      expect(csvContent).toContain('2,data');
    });
  });

  describe('Error Handling @integration @api @error-handling', () => {
    test('should throw error for non-existent file', async () => {
      await expect(
        api.read({ type: 'file', path: '/non/existent/file.csv' })
      ).rejects.toThrow();
    });

    test('should throw error for unsupported file extension', async () => {
      const txtPath = path.join(testDir, 'test.txt');
      await fs.writeFile(txtPath, 'test content');

      await expect(
        api.read({ type: 'file', path: txtPath })
      ).rejects.toThrow('Unsupported file extension: txt');
    });

    test('should handle empty CSV gracefully', async () => {
      const emptyPath = path.join(testDir, 'empty.csv');
      await fs.writeFile(emptyPath, '');

      const workbook = await api.read({ type: 'file', path: emptyPath });
      // Empty CSV file might return a single empty row
      expect(workbook.sheets[0].data.length).toBeLessThanOrEqual(1);
      if (workbook.sheets[0].data.length === 1) {
        expect(workbook.sheets[0].data[0]).toEqual({});
      }
      // Empty CSV will have one empty header
      expect(workbook.sheets[0].headers.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Special Characters and Edge Cases @integration @api @edge-case', () => {
    test('should handle quoted values in CSV', async () => {
      const csvWithQuotes = `name,description
"John, Jr.",Has comma in name
"Jane ""JJ"" Smith","Has ""quotes"" inside"`;

      const csvPath = path.join(testDir, 'quoted.csv');
      await fs.writeFile(csvPath, csvWithQuotes);

      const workbook = await api.read({ type: 'file', path: csvPath });
      
      expect(workbook.sheets[0].data[0].name).toBe('John, Jr.');
      expect(workbook.sheets[0].data[1].description).toBe('Has "quotes" inside');
    });

    test('should preserve data types', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Types',
          headers: ['string', 'number', 'boolean', 'date'],
          data: [{
            string: 'text',
            number: 42,
            boolean: true,
            date: new Date('2024-01-01')
          }]
        }]
      };

      const xlsxPath = path.join(testDir, 'types.xlsx');
      await api.write(workbook, { type: 'xlsx', path: xlsxPath });

      const readWorkbook = await api.read({ type: 'file', path: xlsxPath });
      const data = readWorkbook.sheets[0].data[0];

      expect(typeof data.string).toBe('string');
      expect(typeof data.number).toBe('number');
      expect(data.boolean).toBe(true);
      expect(data.date).toBeInstanceOf(Date);
    });
  });
});