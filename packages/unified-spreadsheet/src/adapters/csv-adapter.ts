/**
 * CSV adapter for CSV file operations
 * Handles reading and writing CSV files with configurable options
 */

import type { Sheet, Row, CellValue, WriteOptions, ConversionOptions } from '../types';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';

/**
 * Adapter for CSV file operations
 * Provides streaming support for large files
 */
export class CsvAdapter {
  /**
   * Read CSV file into Sheet format
   * @param path - File path to read
   * @param options - Conversion options
   * @returns Promise resolving to Sheet
   */
  async read(path: string, options?: ConversionOptions): Promise<Sheet> {
    const delimiter = options?.delimiter || ',';
    const includeHeaders = options?.headers ?? true;
    
    const sheet: Sheet = {
      name: 'CSV Import',
      data: [],
      headers: []
    };

    const content = await this.readFileContent(path);
    const lines = content.trim().split('\n');
    
    if (lines.length === 0) {
      return sheet;
    }

    // Parse headers if present
    let startIndex = 0;
    if (includeHeaders && lines.length > 0) {
      const rawHeaders = this.parseLine(lines[0], delimiter);
      // Make headers unique by appending a suffix for duplicates
      const headerCounts: Record<string, number> = {};
      sheet.headers = rawHeaders.map(header => {
        if (!headerCounts[header]) {
          headerCounts[header] = 1;
          return header;
        } else {
          const count = headerCounts[header]++;
          return `${header}_${count}`;
        }
      });
      startIndex = 1;
    }

    // Parse data rows
    for (let i = startIndex; i < lines.length; i++) {
      const values = this.parseLine(lines[i], delimiter);
      const row: Row = {};

      if (sheet.headers && sheet.headers.length > 0) {
        // Map values to headers
        sheet.headers.forEach((header, index) => {
          row[header] = this.parseValue(values[index] || '');
        });
      } else {
        // Use column indices as keys
        values.forEach((value, index) => {
          row[`Column${index + 1}`] = this.parseValue(value);
        });
      }

      sheet.data.push(row);
    }

    return sheet;
  }

  /**
   * Read CSV from buffer
   * @param buffer - Buffer containing CSV data
   * @param options - Conversion options
   * @returns Promise resolving to Sheet
   */
  async readBuffer(buffer: Buffer, options?: ConversionOptions): Promise<Sheet> {
    const content = buffer.toString('utf8');
    return Promise.resolve(this.parseContent(content, options));
  }

  /**
   * Write Sheet to CSV file
   * @param sheet - Sheet to write
   * @param path - Target file path
   * @param options - Write options
   * @returns Promise that resolves when write is complete
   */
  async write(sheet: Sheet, path: string, options?: WriteOptions): Promise<void> {
    const delimiter = options?.delimiter || ',';
    const quote = options?.quote || '"';
    const includeHeaders = options?.includeHeaders ?? true;
    const encoding = options?.encoding || 'utf8';

    const stream = createWriteStream(path, { encoding });

    // Write headers if requested
    if (includeHeaders && sheet.headers && sheet.headers.length > 0) {
      const headerLine = this.formatLine(sheet.headers, delimiter, quote);
      stream.write(headerLine + '\n');
    }

    // Write data rows
    for (const row of sheet.data) {
      const values = sheet.headers 
        ? sheet.headers.map(header => row[header])
        : Object.values(row);
      
      const line = this.formatLine(
        values.map(v => this.formatValue(v)), 
        delimiter, 
        quote
      );
      stream.write(line + '\n');
    }

    await new Promise<void>((resolve, reject) => {
      stream.end(() => resolve());
      stream.on('error', reject);
    });
  }

  /**
   * Stream CSV file for memory-efficient processing
   * @param sourcePath - Source file path
   * @param targetPath - Target file path
   * @param transform - Transform function for each row
   * @param options - Conversion options
   * @returns Promise that resolves when streaming is complete
   */
  async stream(
    sourcePath: string,
    targetPath: string,
    transform?: (row: Row) => Row | null,
    options?: ConversionOptions
  ): Promise<void> {
    const delimiter = options?.delimiter || ',';
    const readStream = createReadStream(sourcePath, { encoding: 'utf8' });
    const writeStream = createWriteStream(targetPath, { encoding: 'utf8' });

    let headers: string[] = [];
    let isFirstLine = true;

    const transformStream = new Transform({
      transform: (chunk, encoding, callback) => {
        const lines = chunk.toString().split('\n');
        
        for (const line of lines) {
          if (!line.trim()) continue;

          if (isFirstLine && options?.headers !== false) {
            headers = this.parseLine(line, delimiter);
            isFirstLine = false;
            callback(null, line + '\n');
            continue;
          }

          const values = this.parseLine(line, delimiter);
          const row: Row = {};

          if (headers.length > 0) {
            headers.forEach((header, index) => {
              row[header] = this.parseValue(values[index] || '');
            });
          } else {
            values.forEach((value, index) => {
              row[`Column${index + 1}`] = this.parseValue(value);
            });
          }

          if (transform) {
            const transformed = transform(row);
            if (transformed) {
              const transformedValues = headers.length > 0
                ? headers.map(h => transformed[h])
                : Object.values(transformed);
              const outputLine = this.formatLine(
                transformedValues.map(v => this.formatValue(v)),
                delimiter,
                '"'
              );
              callback(null, outputLine + '\n');
            } else {
              callback();
            }
          } else {
            callback(null, line + '\n');
          }
        }
      }
    });

    await pipeline(readStream, transformStream, writeStream);
  }

  /**
   * Parse CSV line respecting quotes and escapes
   */
  private parseLine(line: string, delimiter: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
        i++;
        continue;
      }

      if (char === delimiter && !inQuotes) {
        values.push(current);
        current = '';
        i++;
        continue;
      }

      current += char;
      i++;
    }

    // Add the last value
    values.push(current);

    return values;
  }

  /**
   * Format values into CSV line
   */
  private formatLine(values: string[], delimiter: string, quote: string): string {
    return values.map(value => {
      // Check if value needs quoting
      if (
        value.includes(delimiter) || 
        value.includes(quote) || 
        value.includes('\n') ||
        value.includes('\r')
      ) {
        // Escape quotes in the value
        const escaped = value.replace(new RegExp(quote, 'g'), quote + quote);
        return quote + escaped + quote;
      }
      return value;
    }).join(delimiter);
  }

  /**
   * Parse string value to appropriate type
   */
  private parseValue(value: string): CellValue {
    // Trim whitespace
    value = value.trim();

    // Check for null/empty
    if (!value || value.toLowerCase() === 'null') {
      return null;
    }

    // Check for boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Check for number
    const num = Number(value);
    if (!isNaN(num) && value !== '') {
      return num;
    }

    // Check for date (ISO format)
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Return as string
    return value;
  }

  /**
   * Format cell value for CSV output
   */
  private formatValue(value: CellValue): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value.toString();
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'object' && 'value' in value) {
      // Rich cell - use the value
      return this.formatValue(value.value);
    }

    return String(value);
  }

  /**
   * Read file content as string
   */
  private async readFileContent(path: string): Promise<string> {
    const chunks: string[] = [];
    const stream = createReadStream(path, { encoding: 'utf8' });

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: string | Buffer) => {
        chunks.push(typeof chunk === 'string' ? chunk : chunk.toString('utf8'));
      });
      stream.on('end', () => resolve(chunks.join('')));
      stream.on('error', reject);
    });
  }

  /**
   * Parse CSV content from string
   */
  private parseContent(content: string, options?: ConversionOptions): Sheet {
    const delimiter = options?.delimiter || ',';
    const includeHeaders = options?.headers ?? true;
    
    const sheet: Sheet = {
      name: 'CSV Import',
      data: [],
      headers: []
    };

    const lines = content.trim().split(/\r?\n/);
    
    if (lines.length === 0) {
      return sheet;
    }

    // Parse headers if present
    let startIndex = 0;
    if (includeHeaders && lines.length > 0) {
      sheet.headers = this.parseLine(lines[0], delimiter);
      startIndex = 1;
    }

    // Parse data rows
    for (let i = startIndex; i < lines.length; i++) {
      const values = this.parseLine(lines[i], delimiter);
      const row: Row = {};

      if (sheet.headers && sheet.headers.length > 0) {
        // Map values to headers
        sheet.headers.forEach((header, index) => {
          row[header] = this.parseValue(values[index] || '');
        });
      } else {
        // Use column indices as keys
        values.forEach((value, index) => {
          row[`Column${index + 1}`] = this.parseValue(value);
        });
      }

      sheet.data.push(row);
    }

    return sheet;
  }
}