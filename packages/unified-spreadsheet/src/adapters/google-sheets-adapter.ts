/**
 * Google Sheets adapter for Google Sheets API operations
 * Handles reading and writing to Google Sheets
 */

import type { Workbook, Sheet, Row, CellValue, WriteOptions } from '../types';

/**
 * Adapter for Google Sheets operations
 * Requires Google Auth to be configured
 */
export class GoogleSheetsAdapter {
  private auth: any;
  private sheets: any;

  constructor(auth: any) {
    this.auth = auth;
    // Google Sheets API will be initialized when needed
  }

  /**
   * Initialize Google Sheets API client
   */
  private async initSheetsAPI() {
    if (!this.sheets) {
      // Dynamic import to avoid issues if googleapis is not installed
      const { google } = await import('googleapis');
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    }
    return this.sheets;
  }

  /**
   * Read Google Sheets document into Workbook format
   * @param spreadsheetId - Google Sheets document ID
   * @param ranges - Optional array of A1 notation ranges to read
   * @returns Promise resolving to Workbook
   */
  async read(spreadsheetId: string, ranges?: string[]): Promise<Workbook> {
    const sheets = await this.initSheetsAPI();
    
    // Get spreadsheet metadata
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false
    });

    const workbook: Workbook = {
      sheets: [],
      metadata: {
        title: metadata.data.properties?.title,
        author: undefined, // Not available from Google Sheets API
        created: undefined,
        modified: undefined
      }
    };

    // Get data from each sheet
    const sheetMetadata = metadata.data.sheets || [];
    
    for (const sheetMeta of sheetMetadata) {
      const sheetName = sheetMeta.properties?.title || 'Sheet';
      const range = ranges?.find(r => r.includes(sheetName)) || sheetName;
      
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
          valueRenderOption: 'UNFORMATTED_VALUE',
          dateTimeRenderOption: 'FORMATTED_STRING'
        });

        const values = response.data.values || [];
        const sheet = this.convertToSheet(sheetName, values);
        
        // Add sheet metadata
        if (sheetMeta.properties?.gridProperties) {
          sheet.metadata = {
            frozenRows: sheetMeta.properties.gridProperties.frozenRowCount,
            frozenColumns: sheetMeta.properties.gridProperties.frozenColumnCount
          };
        }

        workbook.sheets.push(sheet);
      } catch (error) {
        console.warn(`Failed to read sheet ${sheetName}:`, error);
        // Add empty sheet on error
        workbook.sheets.push({
          name: sheetName,
          data: [],
          headers: []
        });
      }
    }

    return workbook;
  }

  /**
   * Write Workbook to Google Sheets
   * @param workbook - Workbook to write
   * @param spreadsheetId - Target spreadsheet ID
   * @param options - Write options
   * @returns Promise that resolves when write is complete
   */
  async write(
    workbook: Workbook, 
    spreadsheetId: string, 
    options?: WriteOptions
  ): Promise<void> {
    const sheets = await this.initSheetsAPI();

    // Clear existing content if requested
    if (options?.clearExisting) {
      await this.clearSpreadsheet(spreadsheetId);
    }

    // Update each sheet
    const requests: any[] = [];
    
    for (let i = 0; i < workbook.sheets.length; i++) {
      const sheet = workbook.sheets[i];
      const values = this.convertFromSheet(sheet);
      
      // Update values
      const range = `${sheet.name}!A1`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values
        }
      });

      // Add formatting requests if metadata exists
      if (sheet.metadata) {
        if (sheet.metadata.frozenRows || sheet.metadata.frozenColumns) {
          requests.push({
            updateSheetProperties: {
              properties: {
                sheetId: i,
                gridProperties: {
                  frozenRowCount: sheet.metadata.frozenRows || 0,
                  frozenColumnCount: sheet.metadata.frozenColumns || 0
                }
              },
              fields: 'gridProperties.frozenRowCount,gridProperties.frozenColumnCount'
            }
          });
        }
      }
    }

    // Apply formatting if any
    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests
        }
      });
    }

    // Share with users if requested
    if (options?.shareWith && options.shareWith.length > 0) {
      await this.shareSpreadsheet(spreadsheetId, options.shareWith);
    }
  }

  /**
   * Create a new Google Sheets document
   * @param title - Title for the new spreadsheet
   * @param workbook - Initial workbook content
   * @returns Promise resolving to spreadsheet ID
   */
  async create(title: string, workbook?: Workbook): Promise<string> {
    const sheets = await this.initSheetsAPI();

    // Create spreadsheet with initial structure
    const resource: any = {
      properties: {
        title
      }
    };

    if (workbook && workbook.sheets.length > 0) {
      resource.sheets = workbook.sheets.map((sheet, index) => ({
        properties: {
          sheetId: index,
          title: sheet.name,
          gridProperties: {
            rowCount: sheet.data.length + 1,
            columnCount: sheet.headers?.length || Object.keys(sheet.data[0] || {}).length || 10,
            frozenRowCount: sheet.metadata?.frozenRows,
            frozenColumnCount: sheet.metadata?.frozenColumns
          }
        }
      }));
    }

    const response = await sheets.spreadsheets.create({
      resource
    });

    const spreadsheetId = response.data.spreadsheetId!;

    // Populate with data if provided
    if (workbook) {
      await this.write(workbook, spreadsheetId);
    }

    return spreadsheetId;
  }

  /**
   * Convert Google Sheets values to Sheet format
   */
  private convertToSheet(name: string, values: any[][]): Sheet {
    if (values.length === 0) {
      return {
        name,
        data: [],
        headers: []
      };
    }

    // First row as headers
    const headers = values[0].map(v => String(v || ''));
    
    // Convert remaining rows to data
    const data: Row[] = [];
    for (let i = 1; i < values.length; i++) {
      const row: Row = {};
      values[i].forEach((value, index) => {
        const header = headers[index] || `Column${index + 1}`;
        row[header] = this.parseGoogleValue(value);
      });
      data.push(row);
    }

    return {
      name,
      headers,
      data
    };
  }

  /**
   * Convert Sheet to Google Sheets values format
   */
  private convertFromSheet(sheet: Sheet): any[][] {
    const values: any[][] = [];

    // Add headers
    if (sheet.headers && sheet.headers.length > 0) {
      values.push(sheet.headers);
    }

    // Add data rows
    sheet.data.forEach(row => {
      const rowValues = sheet.headers
        ? sheet.headers.map(header => this.formatGoogleValue(row[header]))
        : Object.values(row).map(v => this.formatGoogleValue(v));
      values.push(rowValues);
    });

    return values;
  }

  /**
   * Parse value from Google Sheets format
   */
  private parseGoogleValue(value: any): CellValue {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Google Sheets returns numbers and booleans as-is
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    // Try to parse dates
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return String(value);
  }

  /**
   * Format value for Google Sheets
   */
  private formatGoogleValue(value: CellValue): any {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      // Google Sheets prefers ISO format for dates
      return value.toISOString().split('T')[0];
    }

    if (typeof value === 'object' && 'value' in value) {
      // Rich cell - use the value
      return this.formatGoogleValue(value.value);
    }

    return value;
  }

  /**
   * Clear all content from a spreadsheet
   */
  private async clearSpreadsheet(spreadsheetId: string): Promise<void> {
    const sheets = await this.initSheetsAPI();
    
    // Get all sheet names
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false
    });

    const sheetNames = metadata.data.sheets?.map(
      (s: any) => s.properties?.title
    ).filter(Boolean) || [];

    // Clear each sheet
    for (const sheetName of sheetNames) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: sheetName
      });
    }
  }

  /**
   * Share spreadsheet with users
   */
  private async shareSpreadsheet(
    spreadsheetId: string, 
    emails: string[]
  ): Promise<void> {
    // This would require Google Drive API
    // For now, we'll log a warning
    console.warn(
      'Sharing spreadsheets requires Google Drive API integration. ' +
      `Please share spreadsheet ${spreadsheetId} manually with: ${emails.join(', ')}`
    );
  }
}