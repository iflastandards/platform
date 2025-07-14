/**
 * Shared utilities for IFLA theme components
 */

import {
  MultilingualText,
  LanguageConfig,
  UriCaseStyle,
  ConceptProps,
  CSVConceptRow,
} from '../types';

/**
 * Get localized text from multilingual text object
 */
export function getLocalizedText(
  text: MultilingualText | string | undefined,
  language: string = 'en',
  fallbackLanguage: string = 'en',
): string {
  if (!text) return '';
  if (typeof text === 'string') return text;

  // Try requested language first
  if (text[language]) return text[language];

  // Try fallback language
  if (text[fallbackLanguage]) return text[fallbackLanguage];

  // Return first available language
  const keys = Object.keys(text);
  if (keys.length > 0) return text[keys[0]];

  return '';
}

/**
 * Get all localized versions of text
 */
export function getAllLocalizedText(
  text: MultilingualText | string | undefined,
): Record<string, string> {
  if (!text) return {};
  if (typeof text === 'string') return { en: text };
  return text;
}

/**
 * Create a URL-safe slug from text
 */
export function createSlug(
  text: string,
  caseStyle: UriCaseStyle = 'kebab-case',
): string {
  let slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim(); // Remove leading/trailing whitespace

  // Apply case style
  switch (caseStyle) {
    case 'camelCase':
      return slug.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    case 'PascalCase':
      return slug.replace(/(^|-)([a-z])/g, (_, __, letter) =>
        letter.toUpperCase(),
      );
    case 'kebab-case':
    default:
      return slug;
  }
}

/**
 * Generate URI for a concept
 */
export function generateConceptUri(
  id: string,
  baseUri: string,
  uriStyle: UriCaseStyle = 'numeric',
  prefix: string = '',
  startCounter: number = 1000,
): string {
  const baseUrl = baseUri.endsWith('/') ? baseUri : `${baseUri}/`;

  switch (uriStyle) {
    case 'numeric':
      const numericId = parseInt(id) || startCounter;
      return `${baseUrl}${prefix}${numericId}`;
    case 'kebab-case':
    case 'camelCase':
    case 'PascalCase':
      return `${baseUrl}${createSlug(id, uriStyle)}`;
    default:
      return `${baseUrl}${id}`;
  }
}

/**
 * Parse CSV data to concepts
 */
export function parseCSVToConcepts(
  csvData: CSVConceptRow[],
  vocabularyUri?: string,
  uriStyle: UriCaseStyle = 'numeric',
  prefix: string = '',
  startCounter: number = 1000,
): ConceptProps[] {
  return csvData.map((row, index) => {
    const id = row.id || row.notation || `concept-${index}`;
    const uri =
      row.uri ||
      (vocabularyUri
        ? generateConceptUri(
            id,
            vocabularyUri,
            uriStyle,
            prefix,
            startCounter + index,
          )
        : `#${id}`);

    return {
      id,
      uri,
      label: parseMultilingualField(row.label || row.prefLabel),
      definition: parseMultilingualField(row.definition || row.description),
      scopeNote: parseMultilingualField(row.scopeNote),
      prefLabel: parseMultilingualField(row.prefLabel),
      altLabel: parseMultilingualField(row.altLabel),
      hiddenLabel: parseMultilingualField(row.hiddenLabel),
      notation: row.notation,
      broader: parseArrayField(row.broader),
      narrower: parseArrayField(row.narrower),
      related: parseArrayField(row.related),
      exactMatch: parseArrayField(row.exactMatch),
      closeMatch: parseArrayField(row.closeMatch),
      example: parseMultilingualField(row.example),
      note: parseMultilingualField(row.note),
      changeNote: parseMultilingualField(row.changeNote),
      editorialNote: parseMultilingualField(row.editorialNote),
      historyNote: parseMultilingualField(row.historyNote),
      deprecated: String(row.deprecated).toLowerCase() === 'true',
      inScheme: parseArrayField(row.inScheme),
      topConceptOf: parseArrayField(row.topConceptOf),
      scheme: row.scheme,
      definition_source: row.definition_source,
      ...row, // Include any additional fields
    };
  });
}

/**
 * Parse multilingual field from CSV (e.g., "en:Hello|fr:Bonjour")
 */
function parseMultilingualField(
  value: string | undefined,
): MultilingualText | string | undefined {
  if (!value) return undefined;

  // Check if it contains language codes
  if (value.includes('|') && value.includes(':')) {
    const result: MultilingualText = {};
    const parts = value.split('|');

    for (const part of parts) {
      const [lang, text] = part.split(':');
      if (lang && text) {
        result[lang.trim()] = text.trim();
      }
    }

    return Object.keys(result).length > 0 ? result : value;
  }

  return value;
}

/**
 * Parse array field from CSV (e.g., "value1|value2|value3")
 */
function parseArrayField(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split('|')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/**
 * Extract available languages from concepts
 */
export function extractAvailableLanguages(
  concepts: ConceptProps[],
): LanguageConfig[] {
  const languages = new Set<string>();

  concepts.forEach((concept) => {
    Object.values(concept).forEach((value) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
      ) {
        Object.keys(value as MultilingualText).forEach((lang) =>
          languages.add(lang),
        );
      }
    });
  });

  return Array.from(languages).map((code) => ({
    code,
    label: getLanguageLabel(code),
    direction: getLanguageDirection(code),
  }));
}

/**
 * Get human-readable language label
 */
function getLanguageLabel(code: string): string {
  const labels: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    zh: '中文',
    ja: '日本語',
    ar: 'العربية',
    hi: 'हिन्दी',
  };

  return labels[code] || code.toUpperCase();
}

/**
 * Get text direction for language
 */
function getLanguageDirection(code: string): 'ltr' | 'rtl' {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(code) ? 'rtl' : 'ltr';
}

/**
 * Export concepts to CSV format
 */
export function exportToCSV(concepts: ConceptProps[]): string {
  if (concepts.length === 0) return '';

  // Get all unique field names
  const fieldNames = new Set<string>();
  concepts.forEach((concept) => {
    Object.keys(concept).forEach((key) => fieldNames.add(key));
  });

  const headers = Array.from(fieldNames);
  const csvRows = [headers.join(',')];

  concepts.forEach((concept) => {
    const row = headers.map((header) => {
      const value = concept[header as keyof ConceptProps];

      if (Array.isArray(value)) {
        return `"${value.join('|')}"`;
      } else if (typeof value === 'object' && value !== null) {
        // Handle multilingual text
        const entries = Object.entries(value as MultilingualText);
        return `"${entries.map(([lang, text]) => `${lang}:${text}`).join('|')}"`;
      } else if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }

      return value || '';
    });

    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

/**
 * Generate table of contents from concepts
 */
export function generateTOCFromProps(concepts: ConceptProps[]): any[] {
  return concepts.map((concept) => ({
    id: concept.id || concept.uri,
    label: getLocalizedText(concept.label) || 'Untitled',
    level: 1,
  }));
}

/**
 * Validate required fields in concept
 */
export function validateConcept(concept: ConceptProps): string[] {
  const errors: string[] = [];

  if (!concept.id && !concept.uri) {
    errors.push('Concept must have either id or uri');
  }

  if (!concept.label && !concept.prefLabel) {
    errors.push('Concept must have either label or prefLabel');
  }

  return errors;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep merge objects
 */
export function deepMerge<T>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key] || ({} as any), source[key] as any);
      } else {
        result[key] = source[key] as any;
      }
    }
  }

  return result;
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Sanitize HTML string
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// Export addBasePath utility
export { addBasePath } from './addBasePath';
