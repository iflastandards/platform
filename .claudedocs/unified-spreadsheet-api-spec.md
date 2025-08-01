# Unified Spreadsheet API Technical Specification

## API Reference

### Core Class: UnifiedSpreadsheetAPI

```typescript
import { UnifiedSpreadsheetAPI } from '@ifla/unified-spreadsheet';

// Initialize with optional Google Auth
const api = new UnifiedSpreadsheetAPI({
  googleAuth?: GoogleAuth,
  defaultLanguages?: string[], // ['en', 'fr', 'es']
  validationMode?: 'strict' | 'loose'
});
```

### Reading Operations

```typescript
// Read from file (CSV or XLSX)
const workbook = await api.read({
  type: 'file',
  path: '/path/to/file.csv' // or .xlsx
});

// Read from Google Sheets
const workbook = await api.read({
  type: 'googleSheets',
  spreadsheetId: '1234567890',
  ranges?: ['Sheet1!A1:Z100'] // optional specific ranges
});

// Read from buffer
const workbook = await api.read({
  type: 'buffer',
  buffer: Buffer.from(data),
  mimeType: 'text/csv' // or 'application/vnd.ms-excel'
});
```

### Writing Operations

```typescript
// Write to XLSX
await api.write(workbook, {
  type: 'xlsx',
  path: '/path/to/output.xlsx',
  options?: {
    compression: true,
    sheetProtection?: { password: 'secret' }
  }
});

// Write to CSV
await api.write(workbook, {
  type: 'csv',
  path: '/path/to/output.csv',
  sheetIndex?: 0, // which sheet to export (default: 0)
  options?: {
    delimiter: ',',
    quote: '"',
    encoding: 'utf8'
  }
});

// Write to Google Sheets
await api.write(workbook, {
  type: 'googleSheets',
  spreadsheetId?: '1234567890', // create new if not provided
  options?: {
    clearExisting: true,
    shareWith?: ['email@example.com']
  }
});
```

### Format Conversion

```typescript
// CSV string to Workbook
const workbook = api.fromCSV(csvString, {
  headers?: boolean, // true = first row is headers
  delimiter?: ',',
  sheetName?: 'Data'
});

// Workbook to CSV string
const csvString = api.toCSV(workbook, {
  sheetIndex?: 0,
  includeHeaders?: true,
  delimiter?: ','
});

// RDF Resources to Workbook (for pipeline integration)
const workbook = api.fromRdfResources(resources, {
  profile?: dctapProfile,
  languages?: ['en', 'fr'],
  includeMetadata?: true
});
```

### DCTAP Validation

```typescript
// Validate with DCTAP profile
const errors = api.validateWithProfile(workbook, dctapProfile, {
  mandatoryLanguages?: ['en', 'fr'],
  checkCompleteness?: true,
  validateValueTypes?: true
});

// Validation result structure
interface ValidationError {
  severity: 'error' | 'warning';
  row?: number;
  column?: string;
  propertyID?: string;
  message: string;
  suggestion?: string;
}
```

### Streaming Operations (for large files)

```typescript
// Stream read for large CSV files
const stream = api.createReadStream({
  type: 'file',
  path: '/path/to/large.csv'
});

for await (const row of stream) {
  // Process row by row
  console.log(row); // { col1: 'value1', col2: 'value2' }
}

// Stream write
const writeStream = api.createWriteStream({
  type: 'csv',
  path: '/path/to/output.csv'
});

for (const row of data) {
  await writeStream.write(row);
}
await writeStream.end();
```

## Data Structures

### Workbook Structure

```typescript
interface Workbook {
  sheets: Sheet[];
  metadata?: {
    title?: string;
    author?: string;
    created?: Date;
    modified?: Date;
    customProperties?: Record<string, any>;
  };
}

interface Sheet {
  name: string;
  data: Row[];
  headers?: string[];
  metadata?: {
    frozenRows?: number;
    frozenColumns?: number;
    columnWidths?: number[];
    validations?: CellValidation[];
  };
}

interface Row {
  [columnName: string]: CellValue;
}

type CellValue = string | number | boolean | Date | null | {
  value: any;
  formula?: string;
  style?: CellStyle;
  comment?: string;
  hyperlink?: string;
};
```

## Migration Examples

### Before (xlsx)
```typescript
import * as XLSX from 'xlsx';

// Read
const workbook = XLSX.readFile('data.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

// Write
const newWs = XLSX.utils.json_to_sheet(data);
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, newWs, 'Sheet1');
XLSX.writeFile(newWb, 'output.xlsx');
```

### After (UnifiedSpreadsheetAPI)
```typescript
import { UnifiedSpreadsheetAPI } from '@ifla/unified-spreadsheet';

const api = new UnifiedSpreadsheetAPI();

// Read
const workbook = await api.read({ type: 'file', path: 'data.xlsx' });
const data = workbook.sheets[0].data;

// Write
const newWorkbook = {
  sheets: [{
    name: 'Sheet1',
    headers: Object.keys(data[0]),
    data: data
  }]
};
await api.write(newWorkbook, { type: 'xlsx', path: 'output.xlsx' });
```

## RDF Pipeline Integration

### Current Pipeline Enhancement
```typescript
// 1. RDF → CSV
const rdfParser = new RdfParser();
const resources = await rdfParser.parseFile('vocab.ttl');
const workbook = api.fromRdfResources(resources, { profile: dctapProfile });

// 2. Validate
const errors = api.validateWithProfile(workbook, dctapProfile);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
}

// 3. Export to multiple formats
await api.write(workbook, { type: 'xlsx', path: 'vocab.xlsx' });
await api.write(workbook, { type: 'googleSheets', spreadsheetId: 'new' });

// 4. Edit in Excel/Google Sheets...

// 5. Import back
const editedWorkbook = await api.read({ type: 'file', path: 'vocab-edited.xlsx' });

// 6. Validate again
const importErrors = api.validateWithProfile(editedWorkbook, dctapProfile);

// 7. Convert back to RDF
const rdfGenerator = new RdfGenerator();
const rdfString = rdfGenerator.fromWorkbook(editedWorkbook, { format: 'turtle' });
```

## Error Handling

```typescript
try {
  const workbook = await api.read({ type: 'file', path: 'data.xlsx' });
} catch (error) {
  if (error.code === 'FILE_NOT_FOUND') {
    // Handle missing file
  } else if (error.code === 'INVALID_FORMAT') {
    // Handle corrupt or unsupported file
  } else if (error.code === 'GOOGLE_AUTH_FAILED') {
    // Handle Google Sheets auth issues
  }
}
```

## Performance Considerations

1. **Memory Usage**:
   - Use streaming for files > 10MB
   - Implement pagination for Google Sheets
   - Clear references after processing

2. **Optimization Tips**:
   ```typescript
   // For large files, use streaming
   if (fileSize > 10 * 1024 * 1024) { // 10MB
     const stream = api.createReadStream({ type: 'file', path });
     // Process stream...
   } else {
     const workbook = await api.read({ type: 'file', path });
   }
   ```

3. **Batch Operations**:
   ```typescript
   // Batch write to Google Sheets
   await api.batchWrite(workbooks, {
     type: 'googleSheets',
     spreadsheetIds: ['id1', 'id2', 'id3']
   });
   ```

## Testing Strategy

```typescript
describe('UnifiedSpreadsheetAPI', () => {
  let api: UnifiedSpreadsheetAPI;
  
  beforeEach(() => {
    api = new UnifiedSpreadsheetAPI();
  });

  it('should convert CSV to XLSX', async () => {
    const csv = 'name,value\ntest,123';
    const workbook = api.fromCSV(csv);
    
    await api.write(workbook, { type: 'xlsx', path: 'test.xlsx' });
    const readBack = await api.read({ type: 'file', path: 'test.xlsx' });
    
    expect(readBack.sheets[0].data).toEqual([{ name: 'test', value: '123' }]);
  });

  it('should validate with DCTAP profile', () => {
    const workbook = createTestWorkbook();
    const profile = createTestProfile();
    
    const errors = api.validateWithProfile(workbook, profile);
    expect(errors).toHaveLength(0);
  });
});
```

## Backward Compatibility

For gradual migration, provide compatibility layer:

```typescript
// Optional xlsx compatibility layer
export const xlsxCompat = {
  readFile: (path: string) => {
    const api = new UnifiedSpreadsheetAPI();
    return api.read({ type: 'file', path });
  },
  writeFile: (workbook: Workbook, path: string) => {
    const api = new UnifiedSpreadsheetAPI();
    return api.write(workbook, { type: 'xlsx', path });
  },
  utils: {
    sheet_to_json: (sheet: Sheet) => sheet.data,
    json_to_sheet: (data: any[]) => ({ data, headers: Object.keys(data[0]) })
  }
};
```