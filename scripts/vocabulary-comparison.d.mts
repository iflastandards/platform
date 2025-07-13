import type { SheetInfo } from '../types/google-sheets.js';

export interface VocabularyInfo {
  token: string;
  title?: string;
  uri?: string;
  sheetName?: string;
  sheetId?: number;
  hasRdf: boolean;
}

export interface ConceptComparison {
  uri: string;
  prefLabel?: string;
  definition?: string;
  notation?: string;
  rowIndex?: number;
  prefLabelMatch?: boolean;
  definitionMatch?: boolean;
  notationMatch?: boolean;
  sheetValues?: {
    prefLabel?: string;
    definition?: string;
    notation?: string;
    labels?: Record<string, string>;
  };
  rdfValues?: {
    prefLabel?: string;
    definition?: string;
    notation?: string;
    labels?: Record<string, string>;
  };
}

export interface ComparisonResults {
  matches: ConceptComparison[];
  mismatches: ConceptComparison[];
  missing: ConceptComparison[];
  errors: Array<{ message: string; stack?: string }>;
}

export declare class VocabularyComparisonTool {
  constructor(
    apiKey: string,
    spreadsheetId: string,
    options?: {
      indexSheet?: string;
      skipRdfCheck?: boolean;
      markdown?: boolean;
      outputPath?: string;
    },
  );

  apiKey: string;
  spreadsheetId: string;
  baseGoogleSheetsUrl: string;
  options: {
    indexSheet: string;
    skipRdfCheck: boolean;
    markdown: boolean;
    outputPath: string;
  };
  vocabularies: VocabularyInfo[];
  results: ComparisonResults;
  availableSheets: SheetInfo[];

  runComparison(): Promise<void>;
  loadVocabularies(): Promise<void>;
  getAvailableSheets(): Promise<SheetInfo[]>;
  findMatchingSheet(
    availableSheets: SheetInfo[],
    token: string,
    title: string,
  ): SheetInfo | undefined;
  findColumn(headers: string[], possibleNames: string[]): number;
  isInstructionRow(token: string, uri: string): boolean;
  hasValidRdfUri(uri: string): boolean;
  validateSheetStructure(vocab: VocabularyInfo): Promise<void>;
  validateSkosStructure(concepts: ConceptComparison[]): {
    errors: string[];
    warnings: string[];
  };
  compareVocabulary(vocab: VocabularyInfo): Promise<void>;
  fetchSheetData(sheetName: string): Promise<string[][]>;
  parseColumnHeader(
    header: string,
  ): {
    property: string;
    language: string | null;
    index: number;
    original: string;
  } | null;
  organizeColumns(headers: string[]): Map<string, Map<string | null, number[]>>;
  extractPropertyValues(
    row: string[],
    propertyMap: Map<string | null, number[]> | undefined,
    lang: string | null,
  ): string[];
  normalizeText(text: string): string;
  escapeMarkdown(text: string): string;
  truncateText(text: string, maxLength: number): string;
  fetchSheetConcepts(
    sheetName: string,
    vocab?: VocabularyInfo,
  ): Promise<ConceptComparison[]>;
  fetchRdfConcepts(rdfUrl: string): Promise<ConceptComparison[]>;
  parseRdfConcepts(rdfString: string, baseUri: string): ConceptComparison[];
  compareConcepts(
    vocab: VocabularyInfo,
    sheetConcepts: ConceptComparison[],
    rdfConcepts: ConceptComparison[],
  ): {
    matches: ConceptComparison[];
    mismatches: ConceptComparison[];
    missing: ConceptComparison[];
  };
  generateReport(): ComparisonResults;
  generateMarkdownReport(results: ComparisonResults): void;
  saveReport(content: string): void;
  expandUri(uri: string, vocab: VocabularyInfo): string;
}
