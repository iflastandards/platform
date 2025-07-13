// Validation results mock data

export interface ValidationResult {
  id: string;
  severity: 'error' | 'warning' | 'info';
  line: number;
  column?: string;
  field: string;
  message: string;
  suggestion?: string;
  rule: string;
}

export interface MockValidationReport {
  id: string;
  importJobId?: string;
  namespace: string;
  profileId: string;
  validatedAt: string;
  validatedBy: string;
  totalRecords: number;
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
  results: ValidationResult[];
  status: 'pass' | 'fail' | 'partial';
}

export const mockValidationReports: MockValidationReport[] = [
  {
    id: 'val-isbd-2025-01-10',
    importJobId: 'import-isbd-42',
    namespace: 'isbd',
    profileId: 'isbd-minimum',
    validatedAt: '2025-01-10T10:15:00Z',
    validatedBy: 'system',
    totalRecords: 185,
    summary: {
      errors: 0,
      warnings: 3,
      info: 12,
    },
    status: 'pass',
    results: [
      {
        id: 'val-1',
        severity: 'warning',
        line: 45,
        column: 'definition@en',
        field: 'skos:definition',
        message:
          'Definition is shorter than recommended (less than 20 characters)',
        suggestion: 'Consider providing a more detailed definition',
        rule: 'definition-length',
      },
      {
        id: 'val-2',
        severity: 'warning',
        line: 67,
        column: 'label@fr',
        field: 'rdfs:label',
        message: 'Missing French translation',
        suggestion: 'Add French label for complete multilingual support',
        rule: 'multilingual-completeness',
      },
      {
        id: 'val-3',
        severity: 'warning',
        line: 89,
        column: 'status',
        field: 'isbd:status',
        message: 'Element marked as deprecated but no replacement specified',
        suggestion:
          'Use dcterms:isReplacedBy to indicate the replacement element',
        rule: 'deprecation-replacement',
      },
      {
        id: 'val-4',
        severity: 'info',
        line: 12,
        column: 'example',
        field: 'skos:example',
        message: 'No examples provided',
        suggestion: 'Adding examples helps users understand proper usage',
        rule: 'best-practice',
      },
    ],
  },
  {
    id: 'val-unimarc-2025-01-12',
    namespace: 'unimarc',
    profileId: 'unimarc-fields',
    validatedAt: '2025-01-12T08:30:00Z',
    validatedBy: 'system',
    totalRecords: 124,
    summary: {
      errors: 5,
      warnings: 23,
      info: 45,
    },
    status: 'fail',
    results: [
      {
        id: 'val-10',
        severity: 'error',
        line: 15,
        column: 'tag',
        field: 'marc:tag',
        message: 'Duplicate field tag: 856',
        rule: 'unique-tag',
      },
      {
        id: 'val-11',
        severity: 'error',
        line: 23,
        column: 'tag',
        field: 'marc:tag',
        message: 'Invalid tag format: 85a (must be 3 digits)',
        suggestion: 'Use format like "856" or "085"',
        rule: 'tag-format',
      },
      {
        id: 'val-12',
        severity: 'error',
        line: 34,
        column: 'indicators',
        field: 'marc:indicators',
        message: 'Invalid indicator value: "1X" (must be digit or #)',
        suggestion: 'Use "1#" for undefined second indicator',
        rule: 'indicator-format',
      },
      {
        id: 'val-13',
        severity: 'error',
        line: 45,
        field: 'marc:mandatory',
        message: 'Missing required field: mandatory',
        rule: 'required-field',
      },
      {
        id: 'val-14',
        severity: 'error',
        line: 67,
        column: 'repeatable',
        field: 'marc:repeatable',
        message: 'Invalid boolean value: "yes" (must be true/false)',
        suggestion: 'Use "true" or "false"',
        rule: 'datatype-boolean',
      },
    ],
  },
  {
    id: 'val-muldicat-2024-12-15',
    importJobId: 'import-muldicat-89',
    namespace: 'muldicat',
    profileId: 'muldicat-translation',
    validatedAt: '2024-12-15T10:00:00Z',
    validatedBy: 'system',
    totalRecords: 1695,
    summary: {
      errors: 0,
      warnings: 45,
      info: 234,
    },
    status: 'pass',
    results: [
      {
        id: 'val-20',
        severity: 'warning',
        line: 234,
        column: 'prefLabel@fr',
        field: 'skos:prefLabel',
        message: 'Potential translation inconsistency detected',
        suggestion:
          'Review translation for consistency with other French terms',
        rule: 'translation-consistency',
      },
      {
        id: 'val-21',
        severity: 'info',
        line: 567,
        field: 'skos:altLabel',
        message: 'No alternative labels provided',
        suggestion: 'Consider adding synonyms or variant forms',
        rule: 'best-practice',
      },
    ],
  },
];

// Helper functions
export function getValidationReport(
  reportId: string,
): MockValidationReport | undefined {
  return mockValidationReports.find((r) => r.id === reportId);
}

export function getLatestValidationForNamespace(
  namespace: string,
): MockValidationReport | undefined {
  const reports = mockValidationReports
    .filter((r) => r.namespace === namespace)
    .sort(
      (a, b) =>
        new Date(b.validatedAt).getTime() - new Date(a.validatedAt).getTime(),
    );
  return reports[0];
}

export function getValidationErrors(
  report: MockValidationReport,
): ValidationResult[] {
  return report.results.filter((r) => r.severity === 'error');
}

export function getValidationWarnings(
  report: MockValidationReport,
): ValidationResult[] {
  return report.results.filter((r) => r.severity === 'warning');
}

// Generate validation summary text
export function getValidationSummaryText(report: MockValidationReport): string {
  const { errors, warnings, info: _info } = report.summary;

  if (errors === 0 && warnings === 0) {
    return `✅ All ${report.totalRecords} records passed validation`;
  } else if (errors > 0) {
    return `❌ Validation failed: ${errors} error${errors > 1 ? 's' : ''}, ${warnings} warning${warnings > 1 ? 's' : ''}`;
  } else {
    return `⚠️ Validation passed with ${warnings} warning${warnings > 1 ? 's' : ''}`;
  }
}

// Get severity color for MUI
export function getSeverityColor(
  severity: 'error' | 'warning' | 'info',
): 'error' | 'warning' | 'info' | 'success' {
  return severity;
}

// Group validation results by field
export function groupResultsByField(
  results: ValidationResult[],
): Record<string, ValidationResult[]> {
  return results.reduce(
    (acc, result) => {
      const field = result.field;
      if (!acc[field]) {
        acc[field] = [];
      }
      acc[field].push(result);
      return acc;
    },
    {} as Record<string, ValidationResult[]>,
  );
}
