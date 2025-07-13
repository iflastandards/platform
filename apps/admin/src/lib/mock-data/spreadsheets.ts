// Google Sheets metadata mock data

export interface MockSpreadsheet {
  id: string;
  name: string;
  namespace: string;
  url: string;
  lastModified: string;
  modifiedBy: string;
  sheetNames: string[];
  rowCount: number;
  status: 'active' | 'locked' | 'archived';
  importHistory: {
    importedAt: string;
    importedBy: string;
    issueNumber: number;
    recordsImported: number;
    errors: number;
    warnings: number;
  }[];
}

export const mockSpreadsheets: MockSpreadsheet[] = [
  {
    id: '1ABC123456789',
    name: 'ISBD Elements 2025',
    namespace: 'isbd',
    url: 'https://docs.google.com/spreadsheets/d/1ABC123456789/edit',
    lastModified: '2025-01-10T09:30:00Z',
    modifiedBy: 'maria.editor@library.org',
    sheetNames: ['Elements', 'Areas', 'Deprecated', 'Notes'],
    rowCount: 186,
    status: 'active',
    importHistory: [
      {
        importedAt: '2025-01-03T14:30:00Z',
        importedBy: 'admin@ifla.org',
        issueNumber: 42,
        recordsImported: 185,
        errors: 0,
        warnings: 3,
      },
    ],
  },
  {
    id: '2DEF456789012',
    name: 'LRM Concepts Update',
    namespace: 'lrm',
    url: 'https://docs.google.com/spreadsheets/d/2DEF456789012/edit',
    lastModified: '2025-01-08T16:45:00Z',
    modifiedBy: 'john.reviewer@university.edu',
    sheetNames: ['Entities', 'Attributes', 'Relationships'],
    rowCount: 224,
    status: 'active',
    importHistory: [],
  },
  {
    id: '3GHI789012345',
    name: 'MulDiCat French Translation Batch 3',
    namespace: 'muldicat',
    url: 'https://docs.google.com/spreadsheets/d/3GHI789012345/edit',
    lastModified: '2025-01-11T14:20:00Z',
    modifiedBy: 'pierre.translator@bibliotheque.fr',
    sheetNames: ['Terms_A-M', 'Terms_N-Z', 'Review_Notes'],
    rowCount: 1851,
    status: 'active',
    importHistory: [
      {
        importedAt: '2024-12-15T10:00:00Z',
        importedBy: 'admin@ifla.org',
        issueNumber: 89,
        recordsImported: 1695,
        errors: 0,
        warnings: 45,
      },
    ],
  },
  {
    id: '4JKL012345678',
    name: 'UNIMARC Electronic Resources Fields',
    namespace: 'unimarc',
    url: 'https://docs.google.com/spreadsheets/d/4JKL012345678/edit',
    lastModified: '2025-01-12T08:15:00Z',
    modifiedBy: 'alex.multi@ifla.org',
    sheetNames: ['NewFields', 'ModifiedFields', 'Examples'],
    rowCount: 124,
    status: 'active',
    importHistory: [],
  },
  {
    id: '5MNO345678901',
    name: 'ISBD Area 0 Implementation',
    namespace: 'isbd',
    url: 'https://docs.google.com/spreadsheets/d/5MNO345678901/edit',
    lastModified: '2025-01-02T11:00:00Z',
    modifiedBy: 'maria.editor@library.org',
    sheetNames: ['Area0_Elements'],
    rowCount: 23,
    status: 'locked',
    importHistory: [
      {
        importedAt: '2025-01-03T15:00:00Z',
        importedBy: 'admin@ifla.org',
        issueNumber: 38,
        recordsImported: 23,
        errors: 0,
        warnings: 0,
      },
    ],
  },
];

// Helper functions
export function getSpreadsheetById(id: string): MockSpreadsheet | undefined {
  return mockSpreadsheets.find(s => s.id === id);
}

export function getActiveSpreadsheets(namespace?: string): MockSpreadsheet[] {
  let sheets = mockSpreadsheets.filter(s => s.status === 'active');
  if (namespace) {
    sheets = sheets.filter(s => s.namespace === namespace);
  }
  return sheets;
}

export function getSpreadsheetFromUrl(url: string): MockSpreadsheet | undefined {
  // Extract ID from Google Sheets URL
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) return undefined;
  return getSpreadsheetById(match[1]);
}

// Mock spreadsheet data preview
export function generateMockSpreadsheetData(spreadsheet: MockSpreadsheet): any[][] {
  switch (spreadsheet.namespace) {
    case 'isbd':
      return [
        ['identifier', 'label@en', 'definition@en', 'area', 'status'],
        ['E1', 'Title proper', 'The chief title of a resource', 'Area1', 'current'],
        ['E2', 'Parallel title', 'Title in another language', 'Area1', 'current'],
        ['E3', 'Other title information', 'Subtitle or additional title', 'Area1', 'current'],
        // ... more rows
      ];
    case 'lrm':
      return [
        ['lrm_number', 'type', 'label@en', 'definition@en', 'domain', 'range'],
        ['LRM-E1', 'Entity', 'Res', 'Any entity in the universe of discourse', '', ''],
        ['LRM-E2', 'Entity', 'Work', 'Distinct intellectual creation', 'LRM-E1', ''],
        ['LRM-A1', 'Attribute', 'Category', 'Type or genre of a work', 'LRM-E2', 'literal'],
        // ... more rows
      ];
    case 'muldicat':
      return [
        ['concept_id', 'prefLabel@en', 'prefLabel@fr', 'definition@en', 'definition@fr', 'source'],
        ['C0001', 'Cataloguing', 'Catalogage', 'The process of creating catalog records', 'Le processus de création de notices', 'RDA'],
        ['C0002', 'Authority control', 'Contrôle d\'autorité', 'Process of maintaining consistency', 'Processus de maintien de la cohérence', 'AACR2'],
        // ... more rows
      ];
    default:
      return [['No preview available']];
  }
}