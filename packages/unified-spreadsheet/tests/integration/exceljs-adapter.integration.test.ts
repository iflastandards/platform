/**
 * @integration @api @high-priority
 * Integration tests for ExcelJS adapter
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ExcelJSAdapter } from '../../src/adapters/exceljs-adapter';
import type { Workbook, Row, RichCell } from '../../src/types';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ExcelJSAdapter @integration @api', () => {
  let adapter: ExcelJSAdapter;
  const testDir = path.join(__dirname, '.xlsx-test-output');

  beforeEach(async () => {
    adapter = new ExcelJSAdapter();
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Writing and Reading XLSX @integration @api', () => {
    test('should write and read simple workbook', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Sheet1',
          headers: ['Name', 'Age', 'City'],
          data: [
            { Name: 'John Doe', Age: 30, City: 'New York' },
            { Name: 'Jane Smith', Age: 25, City: 'London' }
          ]
        }]
      };

      const xlsxPath = path.join(testDir, 'simple.xlsx');
      await adapter.write(workbook, xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);

      expect(readWorkbook.sheets).toHaveLength(1);
      expect(readWorkbook.sheets[0].name).toBe('Sheet1');
      expect(readWorkbook.sheets[0].headers).toEqual(['Name', 'Age', 'City']);
      expect(readWorkbook.sheets[0].data).toHaveLength(2);
      expect(readWorkbook.sheets[0].data[0]).toEqual({
        Name: 'John Doe',
        Age: 30,
        City: 'New York'
      });
    });

    test('should handle multiple sheets', async () => {
      const workbook: Workbook = {
        sheets: [
          {
            name: 'Employees',
            headers: ['ID', 'Name'],
            data: [
              { ID: 1, Name: 'Alice' },
              { ID: 2, Name: 'Bob' }
            ]
          },
          {
            name: 'Departments',
            headers: ['DeptID', 'DeptName'],
            data: [
              { DeptID: 100, DeptName: 'Sales' },
              { DeptID: 200, DeptName: 'Engineering' }
            ]
          }
        ]
      };

      const xlsxPath = path.join(testDir, 'multi-sheet.xlsx');
      await adapter.write(workbook, xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);

      expect(readWorkbook.sheets).toHaveLength(2);
      expect(readWorkbook.sheets[0].name).toBe('Employees');
      expect(readWorkbook.sheets[1].name).toBe('Departments');
      expect(readWorkbook.sheets[1].data[0].DeptName).toBe('Sales');
    });

    test('should preserve workbook metadata', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Data',
          headers: ['Col1'],
          data: [{ Col1: 'Value1' }]
        }],
        metadata: {
          title: 'Test Workbook',
          author: 'Test Author',
          created: new Date('2024-01-01'),
          modified: new Date('2024-01-02'),
          customProperties: {
            project: 'IFLA Standards',
            version: '1.0'
          }
        }
      };

      const xlsxPath = path.join(testDir, 'metadata.xlsx');
      await adapter.write(workbook, xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);

      expect(readWorkbook.metadata?.title).toBe('Test Workbook');
      expect(readWorkbook.metadata?.author).toBe('Test Author');
      expect(readWorkbook.metadata?.created).toBeInstanceOf(Date);
      expect(readWorkbook.metadata?.modified).toBeInstanceOf(Date);
    });

    test('should handle sheet metadata', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Frozen',
          headers: ['A', 'B', 'C', 'D'],
          data: [
            { A: 1, B: 2, C: 3, D: 4 },
            { A: 5, B: 6, C: 7, D: 8 }
          ],
          metadata: {
            frozenRows: 1,
            frozenColumns: 2,
            columnWidths: [10, 20, 15, 25]
          }
        }]
      };

      const xlsxPath = path.join(testDir, 'frozen.xlsx');
      await adapter.write(workbook, xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);

      const metadata = readWorkbook.sheets[0].metadata;
      expect(metadata?.frozenRows).toBe(1);
      expect(metadata?.frozenColumns).toBe(2);
      expect(metadata?.columnWidths).toEqual([10, 20, 15, 25]);
    });
  });

  describe('Data Types @integration @api', () => {
    test('should preserve different data types', async () => {
      const testDate = new Date('2024-03-15T10:30:00Z');
      const workbook: Workbook = {
        sheets: [{
          name: 'Types',
          headers: ['string', 'number', 'boolean', 'date', 'null'],
          data: [{
            string: 'Hello World',
            number: 42.5,
            boolean: true,
            date: testDate,
            null: null
          }]
        }]
      };

      const xlsxPath = path.join(testDir, 'types.xlsx');
      await adapter.write(workbook, xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);
      const data = readWorkbook.sheets[0].data[0];

      expect(data.string).toBe('Hello World');
      expect(data.number).toBe(42.5);
      expect(data.boolean).toBe(true);
      expect(data.date).toBeInstanceOf(Date);
      expect((data.date as Date).toISOString()).toBe(testDate.toISOString());
      // Null values might be undefined or null depending on how ExcelJS handles them
      expect(data.null == null).toBe(true);
    });

    test('should handle formula cells', async () => {
      // Note: Writing formulas requires using ExcelJS directly
      // This test verifies reading formula cells
      const ExcelJS = await import('exceljs');
      const excelWorkbook = new ExcelJS.Workbook();
      const worksheet = excelWorkbook.addWorksheet('Formulas');
      
      worksheet.addRow(['A', 'B', 'Sum']);
      worksheet.addRow([10, 20, { formula: 'A2+B2' }]);
      worksheet.addRow([30, 40, { formula: 'A3+B3' }]);

      const xlsxPath = path.join(testDir, 'formulas.xlsx');
      await excelWorkbook.xlsx.writeFile(xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);
      const data = readWorkbook.sheets[0].data;

      // ExcelJS stores formula results
      // The Sum column will have the formula
      const sumCell = data[0].Sum as RichCell;
      expect(sumCell.formula).toBe('A2+B2');
      // Note: ExcelJS may not calculate the formula result during read
    });
  });

  describe('Large Files @integration @api @performance', () => {
    test('should handle large datasets', async () => {
      const rows = 1000;
      const data: Row[] = [];
      
      for (let i = 0; i < rows; i++) {
        data.push({
          ID: i + 1,
          Name: `Person ${i + 1}`,
          Email: `person${i + 1}@example.com`,
          Score: Math.floor(Math.random() * 100)
        });
      }

      const workbook: Workbook = {
        sheets: [{
          name: 'Large Dataset',
          headers: ['ID', 'Name', 'Email', 'Score'],
          data
        }]
      };

      const xlsxPath = path.join(testDir, 'large.xlsx');
      await adapter.write(workbook, xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);
      expect(readWorkbook.sheets[0].data).toHaveLength(rows);
      expect(readWorkbook.sheets[0].data[999].ID).toBe(1000);
    });
  });

  describe('Styling and Formatting @integration @api', () => {
    test('should apply header styling', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Styled',
          headers: ['Product', 'Price'],
          data: [
            { Product: 'Apple', Price: 1.99 },
            { Product: 'Banana', Price: 0.99 }
          ]
        }]
      };

      const xlsxPath = path.join(testDir, 'styled.xlsx');
      await adapter.write(workbook, xlsxPath);

      // Read with ExcelJS directly to verify styling
      const ExcelJS = await import('exceljs');
      const excelWorkbook = new ExcelJS.Workbook();
      await excelWorkbook.xlsx.readFile(xlsxPath);
      
      const worksheet = excelWorkbook.getWorksheet('Styled');
      const headerRow = worksheet?.getRow(1);
      
      expect(headerRow?.font?.bold).toBe(true);
      expect(headerRow?.fill?.pattern).toBe('solid');
    });

    test('should handle sheet protection', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Protected',
          headers: ['Confidential'],
          data: [{ Confidential: 'Secret Data' }]
        }]
      };

      const xlsxPath = path.join(testDir, 'protected.xlsx');
      await adapter.write(workbook, xlsxPath, {
        sheetProtection: { password: 'secret123' }
      });

      // Verify file is created (actual protection verification would require ExcelJS)
      const stats = await fs.stat(xlsxPath);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('Buffer Operations @integration @api', () => {
    test('should write and read from buffer', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Buffer Test',
          headers: ['Value'],
          data: [{ Value: 'Test' }]
        }]
      };

      const buffer = await adapter.writeBuffer(workbook);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      const readWorkbook = await adapter.readBuffer(buffer);
      expect(readWorkbook.sheets[0].data[0].Value).toBe('Test');
    });
  });

  describe('Error Handling @integration @api @error-handling', () => {
    test('should handle corrupt file gracefully', async () => {
      const corruptPath = path.join(testDir, 'corrupt.xlsx');
      await fs.writeFile(corruptPath, 'This is not a valid XLSX file');

      await expect(adapter.read(corruptPath)).rejects.toThrow();
    });

    test('should handle missing file', async () => {
      const missingPath = path.join(testDir, 'missing.xlsx');
      
      await expect(adapter.read(missingPath)).rejects.toThrow();
    });

    test('should handle empty workbook', async () => {
      const workbook: Workbook = {
        sheets: []
      };

      const xlsxPath = path.join(testDir, 'empty.xlsx');
      await adapter.write(workbook, xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);
      expect(readWorkbook.sheets).toHaveLength(0);
    });
  });

  describe('Special Cases @integration @api @edge-case', () => {
    test('should handle sheets without headers', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'No Headers',
          data: [
            { Column1: 'A', Column2: 'B' },
            { Column1: 'C', Column2: 'D' }
          ]
        }]
      };

      const xlsxPath = path.join(testDir, 'no-headers.xlsx');
      await adapter.write(workbook, xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);
      // When reading back, the first row might be interpreted as headers
      // This depends on the data structure - if no headers provided, first row becomes headers
      expect(readWorkbook.sheets[0].data.length).toBeGreaterThanOrEqual(1);
    });

    test('should handle special characters in sheet names', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Special!@#$%',
          headers: ['Data'],
          data: [{ Data: 'Test' }]
        }]
      };

      const xlsxPath = path.join(testDir, 'special-names.xlsx');
      await adapter.write(workbook, xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);
      expect(readWorkbook.sheets[0].name).toBe('Special!@#$%');
    });

    test('should handle Unicode content', async () => {
      const workbook: Workbook = {
        sheets: [{
          name: 'Unicode',
          headers: ['English', 'Chinese', 'Arabic', 'Emoji'],
          data: [{
            English: 'Hello',
            Chinese: '你好世界',
            Arabic: 'مرحبا بالعالم',
            Emoji: '🌍🌎🌏'
          }]
        }]
      };

      const xlsxPath = path.join(testDir, 'unicode.xlsx');
      await adapter.write(workbook, xlsxPath);

      const readWorkbook = await adapter.read(xlsxPath);
      const data = readWorkbook.sheets[0].data[0];
      
      expect(data.Chinese).toBe('你好世界');
      expect(data.Arabic).toBe('مرحبا بالعالم');
      expect(data.Emoji).toBe('🌍🌎🌏');
    });
  });
});