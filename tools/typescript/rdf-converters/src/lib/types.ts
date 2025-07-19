/**
 * Type definitions for RDF to CSV converter with DCTAP support
 */

// import type { Quad } from 'n3'; // Will be used when implementing parser

/**
 * Supported RDF formats
 */
export type RdfFormat = 'turtle' | 'jsonld' | 'rdfxml' | 'ntriples' | 'nquads';

/**
 * DCTAP property definition
 */
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
  isMandatory?: boolean; // Derived from * prefix
  language?: string; // Derived from @lang suffix
  isArray?: boolean; // Derived from [0], [1] suffix
  isCsv?: boolean; // Derived from [csv] suffix
  arrayIndex?: number; // For array format
  originalPropertyID?: string; // Before processing
}

/**
 * DCTAP shape definition
 */
export interface DctapShape {
  shapeID: string;
  shapeLabel?: string;
  properties: DctapProperty[];
}

/**
 * DCTAP profile
 */
export interface DctapProfile {
  shapes: Map<string, DctapShape>;
  metadata?: {
    name?: string;
    version?: string;
    description?: string;
    mandatoryLanguages?: string[];
  };
}

/**
 * Resource data extracted from RDF
 */
export interface ResourceData {
  uri: string;
  type?: string;
  properties: Map<string, PropertyValue[]>;
}

/**
 * Property value with language tag
 */
export interface PropertyValue {
  value: string;
  language?: string;
  datatype?: string;
  isLiteral: boolean;
}

/**
 * CSV row data
 */
export interface CsvRow {
  [key: string]: string | undefined;
}

/**
 * Conversion options
 */
export interface ConversionOptions {
  inputFile: string;
  outputFile: string;
  profileFile?: string;
  format?: RdfFormat;
  subjectFilter?: string[];
  typeFilter?: string[];
  verbose?: boolean;
  dryRun?: boolean;
}

/**
 * Conversion result
 */
export interface ConversionResult {
  success: boolean;
  inputFile: string;
  outputFile: string;
  resourceCount?: number;
  error?: string;
  validationErrors?: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  severity: 'error' | 'warning' | 'info';
  resourceUri: string;
  propertyID: string;
  message: string;
  suggestion?: string;
}

/**
 * Parser options
 */
export interface ParserOptions {
  format?: RdfFormat;
  baseIRI?: string;
}

/**
 * Generator options
 */
export interface GeneratorOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  quoteChar?: string;
  escapeChar?: string;
}

/**
 * Template configuration for MDX generation
 */
export interface TemplateConfig {
  outputPath: string;
  templateFile: string;
  csvMapping: Record<string, MappingConfig>;
  components?: string[];
  frontmatterFields?: string[];
  fileNamePattern?: string;
}

/**
 * CSV to MDX mapping configuration
 */
export interface MappingConfig {
  source: string;
  fallback?: string;
  default?: string | number | boolean;
  transform?: string;
}

/**
 * Namespace mapping
 */
export interface NamespaceMapping {
  [uri: string]: string;
}

/**
 * Pipeline configuration
 */
export interface PipelineConfig {
  sourceDirectory: string;
  outputDirectory: string;
  dctapProfile?: string;
  templateConfig?: string;
  googleSheetsConfig?: {
    credentials: string;
    folderId?: string;
  };
  database?: {
    connectionString: string;
  };
}