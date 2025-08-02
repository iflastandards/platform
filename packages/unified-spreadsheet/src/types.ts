/**
 * Type definitions for Unified Spreadsheet API
 */

export interface DataSource {
  type: 'file' | 'googleSheets' | 'buffer';
  path?: string;
  spreadsheetId?: string;
  buffer?: Buffer;
  mimeType?: string;
  ranges?: string[];
}

export interface DataTarget {
  type: 'file' | 'xlsx' | 'csv' | 'googleSheets';
  path?: string;
  spreadsheetId?: string;
  sheetIndex?: number;
  options?: WriteOptions;
}

export interface WriteOptions {
  // XLSX options
  compression?: boolean;
  sheetProtection?: { password: string };
  
  // CSV options
  delimiter?: string;
  quote?: string;
  encoding?: BufferEncoding;
  includeHeaders?: boolean;
  
  // Google Sheets options
  clearExisting?: boolean;
  shareWith?: string[];
}

export interface Workbook {
  sheets: Sheet[];
  metadata?: WorkbookMetadata;
}

export interface WorkbookMetadata {
  title?: string;
  author?: string;
  created?: Date;
  modified?: Date;
  customProperties?: Record<string, any>;
}

export interface Sheet {
  name: string;
  data: Row[];
  headers?: string[];
  metadata?: SheetMetadata;
}

export interface SheetMetadata {
  frozenRows?: number;
  frozenColumns?: number;
  columnWidths?: number[];
  validations?: CellValidation[];
}

export type Row = Record<string, CellValue>;

export type CellValue = string | number | boolean | Date | null | RichCell;

export interface RichCell {
  value: any;
  formula?: string;
  style?: CellStyle;
  comment?: string;
  hyperlink?: string;
}

export interface CellStyle {
  font?: {
    name?: string;
    size?: number;
    bold?: boolean;
    italic?: boolean;
    color?: string;
  };
  fill?: {
    type?: 'pattern';
    pattern?: string;
    fgColor?: string;
    bgColor?: string;
  };
  alignment?: {
    horizontal?: 'left' | 'center' | 'right';
    vertical?: 'top' | 'middle' | 'bottom';
  };
  border?: {
    top?: BorderStyle;
    left?: BorderStyle;
    bottom?: BorderStyle;
    right?: BorderStyle;
  };
}

export interface BorderStyle {
  style?: 'thin' | 'medium' | 'thick';
  color?: string;
}

export interface CellValidation {
  type: 'list' | 'whole' | 'decimal' | 'textLength' | 'custom';
  operator?: 'between' | 'notBetween' | 'equal' | 'notEqual' | 'greaterThan' | 'lessThan';
  formula1?: string;
  formula2?: string;
  showErrorMessage?: boolean;
  errorMessage?: string;
  errorTitle?: string;
}

// DCTAP Integration Types
export interface DctapProfile {
  shapes: Map<string, DctapShape>;
  metadata?: {
    name?: string;
    version?: string;
    description?: string;
    mandatoryLanguages?: string[];
  };
}

export interface DctapShape {
  shapeID: string;
  shapeLabel?: string;
  properties: DctapProperty[];
}

export interface DctapProperty {
  propertyID: string;
  propertyLabel?: string;
  mandatory?: boolean;
  repeatable?: boolean;
  valueNodeType?: 'IRI' | 'literal' | 'bnode';
  valueDataType?: string;
  valueConstraint?: string;
  valueConstraintType?: string;
  valueShape?: string;
  note?: string;
  // IFLA extensions
  isMandatory?: boolean;
  language?: string;
  isArray?: boolean;
  isCsv?: boolean;
  arrayIndex?: number;
  originalPropertyID?: string;
}

export interface ValidationError {
  severity: 'error' | 'warning';
  row?: number;
  column?: string;
  propertyID?: string;
  message: string;
  suggestion?: string;
  resourceUri?: string;
}

export interface UnifiedSpreadsheetOptions {
  googleAuth?: any; // Google Auth instance
  defaultLanguages?: string[];
  validationMode?: 'strict' | 'loose';
}

export interface ConversionOptions {
  headers?: boolean;
  delimiter?: string;
  sheetName?: string;
  sheetIndex?: number;
  includeHeaders?: boolean;
}

export interface RdfConversionOptions {
  profile?: DctapProfile;
  languages?: string[];
  includeMetadata?: boolean;
}

export interface StreamOptions {
  highWaterMark?: number;
  encoding?: BufferEncoding;
}