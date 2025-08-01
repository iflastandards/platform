/**
 * ExcelJS adapter for XLSX file operations
 * Replaces the vulnerable xlsx package with secure ExcelJS implementation
 */

import type { Workbook, Sheet, Row, CellValue, WriteOptions } from '../types';
import * as ExcelJS from 'exceljs';
import { createReadStream, createWriteStream } from 'node:fs';

/**
 * Adapter for ExcelJS library operations
 * Handles reading and writing XLSX files with full formatting support
 */
export class ExcelJSAdapter {
  /**
   * Read XLSX file into unified Workbook format
   * @param path - File path to read
   * @returns Promise resolving to Workbook
   */
  async read(path: string): Promise<Workbook> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path);
    
    return this.convertFromExcelJS(workbook);
  }

  /**
   * Read XLSX from buffer into unified Workbook format
   * @param buffer - Buffer containing XLSX data
   * @returns Promise resolving to Workbook
   */
  async readBuffer(buffer: Buffer): Promise<Workbook> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    return this.convertFromExcelJS(workbook);
  }

  /**
   * Write Workbook to XLSX file
   * @param workbook - Workbook to write
   * @param path - Target file path
   * @param options - Write options
   * @returns Promise that resolves when write is complete
   */
  async write(workbook: Workbook, path: string, options?: WriteOptions): Promise<void> {
    const excelWorkbook = this.convertToExcelJS(workbook, options);
    
    // Use streaming for better performance
    const stream = createWriteStream(path);
    await excelWorkbook.xlsx.write(stream);
  }

  /**
   * Write Workbook to buffer
   * @param workbook - Workbook to write
   * @param options - Write options
   * @returns Promise resolving to Buffer
   */
  async writeBuffer(workbook: Workbook, options?: WriteOptions): Promise<Buffer> {
    const excelWorkbook = this.convertToExcelJS(workbook, options);
    return await excelWorkbook.xlsx.writeBuffer() as Buffer;
  }

  /**
   * Stream read XLSX file for memory efficiency
   * @param path - File path to read
   * @param onSheet - Callback for each sheet
   * @returns Promise that resolves when streaming is complete
   */
  async streamRead(
    path: string, 
    onSheet: (sheet: Sheet, index: number) => Promise<void>
  ): Promise<void> {
    const stream = createReadStream(path);
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(stream, {
      entries: 'emit',
      worksheets: 'emit'
    });

    let sheetIndex = 0;
    
    for await (const worksheetReader of workbookReader) {
      const sheet = await this.convertSheetFromStream(worksheetReader);
      await onSheet(sheet, sheetIndex++);
    }
  }

  /**
   * Convert ExcelJS workbook to unified format
   */
  private convertFromExcelJS(excelWorkbook: ExcelJS.Workbook): Workbook {
    const sheets: Sheet[] = [];

    excelWorkbook.eachSheet((worksheet) => {
      const sheet: Sheet = {
        name: worksheet.name,
        data: [],
        headers: []
      };

      // Extract headers from first row if present
      const firstRow = worksheet.getRow(1);
      if (firstRow.hasValues) {
        const values = firstRow.values;
        if (Array.isArray(values)) {
          sheet.headers = values.slice(1).map(v => String(v || ''));
        }
      }

      // Convert rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1 && sheet.headers?.length) {
          return; // Skip header row
        }

        const rowData: Row = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = sheet.headers?.[colNumber - 1] || `Column${colNumber}`;
          rowData[header] = this.convertCellValue(cell);
        });

        sheet.data.push(rowData);
      });

      // Add metadata
      sheet.metadata = {
        frozenRows: worksheet.views[0]?.state === 'frozen' ? worksheet.views[0].ySplit : undefined,
        frozenColumns: worksheet.views[0]?.state === 'frozen' ? worksheet.views[0].xSplit : undefined,
        columnWidths: Array.from({ length: worksheet.columnCount }, (_, i) => 
          worksheet.getColumn(i + 1).width || 10
        )
      };

      sheets.push(sheet);
    });

    return {
      sheets,
      metadata: {
        title: excelWorkbook.title,
        author: excelWorkbook.creator,
        created: excelWorkbook.created,
        modified: excelWorkbook.modified,
        customProperties: excelWorkbook.properties as any
      }
    };
  }

  /**
   * Convert unified workbook to ExcelJS format
   */
  private convertToExcelJS(workbook: Workbook, options?: WriteOptions): ExcelJS.Workbook {
    const excelWorkbook = new ExcelJS.Workbook();

    // Set metadata
    if (workbook.metadata) {
      excelWorkbook.creator = workbook.metadata.author || 'IFLA Standards Platform';
      excelWorkbook.created = workbook.metadata.created || new Date();
      excelWorkbook.modified = workbook.metadata.modified || new Date();
      excelWorkbook.title = workbook.metadata.title || '';
    }

    // Convert sheets
    workbook.sheets.forEach((sheet) => {
      const worksheet = excelWorkbook.addWorksheet(sheet.name);

      // Add headers
      if (sheet.headers && sheet.headers.length > 0) {
        worksheet.addRow(sheet.headers);
        
        // Style header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      }

      // Add data rows
      sheet.data.forEach((row) => {
        const values = sheet.headers 
          ? sheet.headers.map(header => row[header])
          : Object.values(row);
        worksheet.addRow(values);
      });

      // Apply metadata
      if (sheet.metadata) {
        // Freeze panes
        if (sheet.metadata.frozenRows || sheet.metadata.frozenColumns) {
          worksheet.views = [{
            state: 'frozen',
            xSplit: sheet.metadata.frozenColumns || 0,
            ySplit: sheet.metadata.frozenRows || 0
          }];
        }

        // Set column widths
        sheet.metadata.columnWidths?.forEach((width, index) => {
          worksheet.getColumn(index + 1).width = width;
        });
      }

      // Apply sheet protection if requested
      if (options?.sheetProtection) {
        worksheet.protect(options.sheetProtection.password, {});
      }
    });

    return excelWorkbook;
  }

  /**
   * Convert cell value from ExcelJS to unified format
   */
  private convertCellValue(cell: ExcelJS.Cell): CellValue {
    // Handle different cell types
    if (cell.type === ExcelJS.ValueType.Null) {
      return null;
    }

    if (cell.type === ExcelJS.ValueType.Formula) {
      return {
        value: cell.result,
        formula: cell.formula as string
      };
    }

    if (cell.type === ExcelJS.ValueType.Hyperlink) {
      return {
        value: cell.text,
        hyperlink: (cell.value as any).hyperlink
      };
    }

    if (cell.type === ExcelJS.ValueType.RichText) {
      // Convert rich text to plain text for now
      const richText = cell.value as ExcelJS.CellRichTextValue;
      return richText.richText.map(rt => rt.text).join('');
    }

    // Handle dates
    if (cell.type === ExcelJS.ValueType.Date) {
      return cell.value as Date;
    }

    // Default to the cell value
    return cell.value as string | number | boolean;
  }

  /**
   * Convert streaming worksheet to Sheet format
   */
  private async convertSheetFromStream(
    worksheetReader: any
  ): Promise<Sheet> {
    const sheet: Sheet = {
      name: worksheetReader.name || 'Sheet',
      data: [],
      headers: []
    };

    let isFirstRow = true;

    for await (const row of worksheetReader) {
      if (isFirstRow && row.values && row.values.length > 0) {
        const values = row.values;
        if (Array.isArray(values)) {
          sheet.headers = values.slice(1).map((v: any) => String(v || ''));
        }
        isFirstRow = false;
        continue;
      }

      const rowData: Row = {};
      if (row.values && Array.isArray(row.values)) {
        row.values.slice(1).forEach((value: any, index: number) => {
          const header = sheet.headers?.[index] || `Column${index + 1}`;
          rowData[header] = value as CellValue;
        });
      }

      sheet.data.push(rowData);
    }

    return sheet;
  }
}