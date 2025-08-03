/**
 * Core implementation of Unified Spreadsheet API
 * Provides a unified interface for CSV, XLSX, and Google Sheets operations
 */

import type {
  DataSource,
  DataTarget,
  Workbook,
  Row,
  UnifiedSpreadsheetOptions,
  ConversionOptions,
  RdfConversionOptions,
  StreamOptions,
  DctapProfile,
  ValidationError
} from './types';
import { ExcelJSAdapter } from './adapters/exceljs-adapter';
import { CsvAdapter } from './adapters/csv-adapter';
import { GoogleSheetsAdapter } from './adapters/google-sheets-adapter';
import { DctapValidator } from './dctap/dctap-validator';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

/**
 * Main class for unified spreadsheet operations
 * Handles CSV, XLSX, and Google Sheets with DCTAP validation
 */
export class UnifiedSpreadsheetAPI {
  private readonly options: UnifiedSpreadsheetOptions;
  private readonly excelAdapter: ExcelJSAdapter;
  private readonly csvAdapter: CsvAdapter;
  private readonly googleAdapter?: GoogleSheetsAdapter;
  private readonly validator: DctapValidator;

  constructor(options: UnifiedSpreadsheetOptions = {}) {
    this.options = {
      defaultLanguages: ['en'],
      validationMode: 'strict',
      ...options
    };

    // Initialize adapters
    this.excelAdapter = new ExcelJSAdapter();
    this.csvAdapter = new CsvAdapter();
    
    // Only initialize Google adapter if auth is provided
    if (options.googleAuth) {
      this.googleAdapter = new GoogleSheetsAdapter(options.googleAuth);
    }

    // Initialize validator
    this.validator = new DctapValidator({
      languages: this.options.defaultLanguages,
      mode: this.options.validationMode
    });
  }

  /**
   * Read data from various sources into a unified Workbook format
   * @param source - Data source configuration
   * @param options - Conversion options
   * @returns Promise resolving to a Workbook
   */
  async read(source: DataSource, options?: ConversionOptions): Promise<Workbook> {
    switch (source.type) {
      case 'file':
        if (!source.path) {
          throw new Error('File path is required for file source');
        }
        return this.readFile(source.path, source.mimeType, options);

      case 'buffer':
        if (!source.buffer) {
          throw new Error('Buffer is required for buffer source');
        }
        return this.readBuffer(source.buffer, source.mimeType, options);

      case 'googleSheets':
        if (!source.spreadsheetId) {
          throw new Error('Spreadsheet ID is required for Google Sheets source');
        }
        if (!this.googleAdapter) {
          throw new Error('Google Sheets adapter not initialized. Provide googleAuth in options.');
        }
        return this.googleAdapter.read(source.spreadsheetId, source.ranges);

      default:
        throw new Error(`Unsupported source type: ${(source as any).type}`);
    }
  }

  /**
   * Write workbook data to various targets
   * @param workbook - Workbook to write
   * @param target - Target configuration
   * @returns Promise that resolves when write is complete
   */
  async write(workbook: Workbook, target: DataTarget): Promise<void> {
    switch (target.type) {
      case 'file':
        if (!target.path) {
          throw new Error('File path is required for file target');
        }
        // Auto-detect format from file extension
        const ext = target.path.toLowerCase().split('.').pop();
        if (ext === 'csv') {
          return this.csvAdapter.write(
            workbook.sheets[target.sheetIndex || 0], 
            target.path, 
            target.options
          );
        } else if (ext === 'xlsx' || ext === 'xls') {
          return this.excelAdapter.write(workbook, target.path, target.options);
        } else {
          throw new Error(`Unsupported file extension: ${ext}`);
        }

      case 'xlsx':
        if (!target.path) {
          throw new Error('File path is required for XLSX target');
        }
        return this.excelAdapter.write(workbook, target.path, target.options);

      case 'csv':
        if (!target.path) {
          throw new Error('File path is required for CSV target');
        }
        return this.csvAdapter.write(
          workbook.sheets[target.sheetIndex || 0], 
          target.path, 
          target.options
        );

      case 'googleSheets':
        if (!target.spreadsheetId) {
          throw new Error('Spreadsheet ID is required for Google Sheets target');
        }
        if (!this.googleAdapter) {
          throw new Error('Google Sheets adapter not initialized. Provide googleAuth in options.');
        }
        return this.googleAdapter.write(workbook, target.spreadsheetId, target.options);

      default:
        throw new Error(`Unsupported target type: ${(target as any).type}`);
    }
  }

  /**
   * Convert between different spreadsheet formats
   * @param source - Source configuration
   * @param target - Target configuration
   * @param options - Conversion options
   * @returns Promise that resolves when conversion is complete
   */
  async convert(
    source: DataSource, 
    target: DataTarget, 
    options?: ConversionOptions
  ): Promise<void> {
    const workbook = await this.read(source, options);
    await this.write(workbook, target);
  }

  /**
   * Validate workbook data against a DCTAP profile
   * @param workbook - Workbook to validate
   * @param profile - DCTAP profile
   * @returns Array of validation errors (empty if valid)
   */
  async validate(workbook: Workbook, profile: DctapProfile): Promise<ValidationError[]> {
    return this.validator.validate(workbook, profile);
  }

  /**
   * Convert workbook to RDF format
   * @param workbook - Workbook to convert
   * @param options - RDF conversion options
   * @returns RDF string in requested format
   */
  async toRdf(workbook: Workbook, options: RdfConversionOptions): Promise<string> {
    // This will be implemented by integrating with existing RDF converters
    throw new Error('RDF conversion not yet implemented');
  }

  /**
   * Convert RDF to workbook format
   * @param rdf - RDF string
   * @param options - Conversion options
   * @returns Promise resolving to a Workbook
   */
  async fromRdf(rdf: string, options: RdfConversionOptions): Promise<Workbook> {
    // This will be implemented by integrating with existing RDF converters
    throw new Error('RDF parsing not yet implemented');
  }

  /**
   * Stream large files for memory-efficient processing
   * @param source - Source file path
   * @param target - Target file path
   * @param transform - Optional transform function
   * @param options - Stream options
   * @returns Promise that resolves when streaming is complete
   */
  async stream(
    source: string,
    target: string,
    transform?: (row: Row) => Row | null,
    options?: StreamOptions
  ): Promise<void> {
    const readStream = createReadStream(source, options);
    const writeStream = createWriteStream(target, options);

    const transformStream = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        try {
          const row = JSON.parse(chunk.toString()) as Row;
          const transformed = transform ? transform(row) : row;
          if (transformed) {
            callback(null, JSON.stringify(transformed) + '\n');
          } else {
            callback();
          }
        } catch (error) {
          callback(error as Error);
        }
      }
    });

    if (transform) {
      await pipeline(readStream, transformStream, writeStream);
    } else {
      await pipeline(readStream, writeStream);
    }
  }

  /**
   * Get adapter-specific functionality
   * @returns Object with adapter instances
   */
  getAdapters() {
    return {
      excel: this.excelAdapter,
      csv: this.csvAdapter,
      google: this.googleAdapter
    };
  }

  /**
   * Private helper to read file based on extension/mime type
   */
  private async readFile(
    path: string, 
    mimeType?: string, 
    options?: ConversionOptions
  ): Promise<Workbook> {
    const extension = path.split('.').pop()?.toLowerCase();
    
    if (extension === 'csv' || mimeType === 'text/csv') {
      const sheet = await this.csvAdapter.read(path, options);
      return { sheets: [sheet] };
    } else if (
      extension === 'xlsx' || 
      extension === 'xls' || 
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return this.excelAdapter.read(path);
    } else {
      throw new Error(`Unsupported file extension: ${extension || mimeType}`);
    }
  }

  /**
   * Private helper to read buffer based on mime type
   */
  private async readBuffer(
    buffer: Buffer, 
    mimeType?: string, 
    options?: ConversionOptions
  ): Promise<Workbook> {
    if (mimeType === 'text/csv') {
      const sheet = await this.csvAdapter.readBuffer(buffer, options);
      return { sheets: [sheet] };
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      !mimeType // Default to Excel if no mime type
    ) {
      return this.excelAdapter.readBuffer(buffer);
    } else {
      throw new Error(`Unsupported buffer type: ${mimeType}`);
    }
  }
}

/**
 * Factory function to create a new UnifiedSpreadsheetAPI instance
 * @param options - Configuration options
 * @returns New UnifiedSpreadsheetAPI instance
 */
export function createSpreadsheetAPI(options?: UnifiedSpreadsheetOptions): UnifiedSpreadsheetAPI {
  return new UnifiedSpreadsheetAPI(options);
}