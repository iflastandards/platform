/**
 * @ifla/unified-spreadsheet
 * Unified API for CSV, XLSX, and Google Sheets operations with DCTAP validation
 */

// Main API
export { UnifiedSpreadsheetAPI, createSpreadsheetAPI } from './unified-spreadsheet';

// Types
export type {
  // Data source/target types
  DataSource,
  DataTarget,
  WriteOptions,
  
  // Workbook types
  Workbook,
  WorkbookMetadata,
  Sheet,
  SheetMetadata,
  Row,
  CellValue,
  RichCell,
  
  // Styling types
  CellStyle,
  BorderStyle,
  CellValidation,
  
  // DCTAP types
  DctapProfile,
  DctapShape,
  DctapProperty,
  ValidationError,
  
  // Options types
  UnifiedSpreadsheetOptions,
  ConversionOptions,
  RdfConversionOptions,
  StreamOptions
} from './types';

// Re-export adapter interfaces when they're implemented
// export type { ExcelJSAdapter } from './adapters/exceljs-adapter';
// export type { CsvAdapter } from './adapters/csv-adapter';
// export type { GoogleSheetsAdapter } from './adapters/google-sheets-adapter';

// Re-export validator when implemented
// export { DctapValidator } from './dctap/dctap-validator';