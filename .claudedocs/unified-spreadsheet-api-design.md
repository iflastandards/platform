# Unified Spreadsheet API Design

## Current Architecture Analysis

### Data Pipelines
1. **CSV Files**: Read/Write using `csv-parse`
2. **XLSX Files**: Read/Write using `xlsx` (vulnerable)
3. **Google Sheets**: Read/Write using `googleapis`

### Current Flow
```
CSV Files → Parse → Memory → Write to XLSX/Google Sheets
                  ↓
                Memory
                  ↓
            Write to Format
```

## Recommended Solution: **ExcelJS + Unified Abstraction Layer**

### Why This Approach?

1. **ExcelJS** for XLSX operations (replacing vulnerable xlsx)
2. **Keep existing** CSV libraries (`csv-parse`, `csv-stringify`)
3. **Keep existing** Google Sheets API (`googleapis`)
4. **Create unified abstraction** layer on top

### Architecture Design

```typescript
// Unified Spreadsheet Interface
interface UnifiedSpreadsheet {
  // Core operations
  read(source: DataSource): Promise<Workbook>
  write(workbook: Workbook, target: DataTarget): Promise<void>
  
  // Format conversions
  fromCSV(csvData: string): Workbook
  toCSV(workbook: Workbook, sheetIndex?: number): string
  
  // Streaming support
  readStream(source: DataSource): AsyncIterator<Row>
  writeStream(target: DataTarget): WritableStream
}

interface DataSource {
  type: 'file' | 'googleSheets' | 'buffer'
  path?: string
  spreadsheetId?: string
  buffer?: Buffer
}

interface DataTarget {
  type: 'xlsx' | 'csv' | 'googleSheets'
  path?: string
  spreadsheetId?: string
}

interface Workbook {
  sheets: Sheet[]
  metadata?: WorkbookMetadata
}

interface Sheet {
  name: string
  data: Row[]
  headers?: string[]
}
```

## Implementation Strategy

### Phase 1: Core Libraries Setup

```json
{
  "dependencies": {
    "exceljs": "^4.4.0",           // XLSX read/write
    "csv-parse": "^5.6.0",         // CSV parsing
    "csv-stringify": "^6.6.0",     // CSV generation
    "googleapis": "^154.0.0",      // Google Sheets (existing)
    "stream": "^0.0.3"            // Stream utilities
  }
}
```

### Phase 2: Unified API Implementation

```typescript
// unified-spreadsheet.ts
import ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { google } from 'googleapis';

export class UnifiedSpreadsheetAPI {
  private sheets: any;
  
  constructor(googleAuth?: any) {
    if (googleAuth) {
      this.sheets = google.sheets({ version: 'v4', auth: googleAuth });
    }
  }

  // Read from any source
  async read(source: DataSource): Promise<Workbook> {
    switch (source.type) {
      case 'file':
        return this.readFile(source.path!);
      case 'googleSheets':
        return this.readGoogleSheets(source.spreadsheetId!);
      case 'buffer':
        return this.readBuffer(source.buffer!);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  // Write to any target
  async write(workbook: Workbook, target: DataTarget): Promise<void> {
    switch (target.type) {
      case 'xlsx':
        return this.writeXLSX(workbook, target.path!);
      case 'csv':
        return this.writeCSV(workbook, target.path!);
      case 'googleSheets':
        return this.writeGoogleSheets(workbook, target.spreadsheetId!);
      default:
        throw new Error(`Unsupported target type: ${target.type}`);
    }
  }

  // XLSX operations using ExcelJS
  private async readFile(path: string): Promise<Workbook> {
    if (path.endsWith('.csv')) {
      const csvContent = await fs.readFile(path, 'utf-8');
      return this.fromCSV(csvContent);
    }
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(path);
    
    return this.excelJSToUnified(workbook);
  }

  private async writeXLSX(workbook: Workbook, path: string): Promise<void> {
    const excelWorkbook = new ExcelJS.Workbook();
    
    for (const sheet of workbook.sheets) {
      const worksheet = excelWorkbook.addWorksheet(sheet.name);
      worksheet.addRows([sheet.headers || [], ...sheet.data]);
    }
    
    await excelWorkbook.xlsx.writeFile(path);
  }

  // CSV operations
  fromCSV(csvContent: string, sheetName = 'Sheet1'): Workbook {
    const rows = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
    
    return {
      sheets: [{
        name: sheetName,
        headers,
        data: rows.map(row => headers.map(h => row[h]))
      }]
    };
  }

  toCSV(workbook: Workbook, sheetIndex = 0): string {
    const sheet = workbook.sheets[sheetIndex];
    const data = [sheet.headers || [], ...sheet.data];
    
    return stringify(data, {
      header: true,
      columns: sheet.headers
    });
  }

  // Google Sheets operations
  private async readGoogleSheets(spreadsheetId: string): Promise<Workbook> {
    const spreadsheet = await this.sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: true
    });
    
    const sheets: Sheet[] = [];
    
    for (const sheet of spreadsheet.data.sheets || []) {
      const values = sheet.data?.[0]?.rowData || [];
      const rows = values.map(row => 
        row.values?.map(cell => cell.formattedValue || '') || []
      );
      
      sheets.push({
        name: sheet.properties?.title || 'Sheet',
        headers: rows[0] || [],
        data: rows.slice(1)
      });
    }
    
    return { sheets };
  }

  private async writeGoogleSheets(workbook: Workbook, spreadsheetId: string): Promise<void> {
    // Implementation for writing to Google Sheets
    // Similar to existing createGoogleWorkbooks logic
  }

  // Streaming support for large files
  async *readStream(source: DataSource): AsyncIterator<Row> {
    if (source.type === 'file' && source.path?.endsWith('.csv')) {
      const stream = fs.createReadStream(source.path);
      const parser = stream.pipe(parse({
        columns: true,
        skip_empty_lines: true
      }));
      
      for await (const row of parser) {
        yield row;
      }
    } else if (source.type === 'file') {
      // ExcelJS streaming
      const workbook = new ExcelJS.stream.xlsx.WorkbookReader(source.path);
      
      for await (const worksheet of workbook) {
        for await (const row of worksheet) {
          yield row.values;
        }
      }
    }
  }
}
```

## Migration Path

### Step 1: Install Dependencies
```bash
pnpm remove xlsx
pnpm add exceljs
```

### Step 2: Create Unified API
Create `packages/unified-spreadsheet/` with the unified API implementation.

### Step 3: Update Existing Code

**Before** (spreadsheet-api.ts):
```typescript
import { utils as xlsxUtils, write as xlsxWrite } from 'xlsx';

const workbook = xlsxUtils.book_new();
const worksheet = xlsxUtils.aoa_to_sheet(data);
xlsxUtils.book_append_sheet(workbook, worksheet, name);
```

**After**:
```typescript
import { UnifiedSpreadsheetAPI } from '@ifla/unified-spreadsheet';

const api = new UnifiedSpreadsheetAPI();
const workbook = await api.read({ type: 'file', path: 'data.csv' });
await api.write(workbook, { type: 'xlsx', path: 'output.xlsx' });
await api.write(workbook, { type: 'googleSheets', spreadsheetId: '...' });
```

## Benefits of This Approach

1. **Single API** for all formats
2. **Security**: No vulnerable dependencies
3. **Performance**: Streaming support for large files
4. **Flexibility**: Easy to add new formats
5. **Type Safety**: Full TypeScript support
6. **Testing**: Easier to mock and test

## Example Usage

```typescript
// Read CSV, write to both XLSX and Google Sheets
const api = new UnifiedSpreadsheetAPI(googleAuth);

// Read CSV
const workbook = await api.read({ 
  type: 'file', 
  path: 'vocabulary.csv' 
});

// Write to XLSX
await api.write(workbook, { 
  type: 'xlsx', 
  path: 'vocabulary.xlsx' 
});

// Write to Google Sheets
await api.write(workbook, { 
  type: 'googleSheets', 
  spreadsheetId: 'abc123' 
});

// Convert between formats
const csvContent = api.toCSV(workbook);
const newWorkbook = api.fromCSV(csvContent);

// Stream large files
for await (const row of api.readStream({ type: 'file', path: 'large.csv' })) {
  // Process row by row
}
```

## Testing Strategy

```typescript
describe('UnifiedSpreadsheetAPI', () => {
  it('should read CSV and write XLSX', async () => {
    const api = new UnifiedSpreadsheetAPI();
    const workbook = await api.read({ type: 'file', path: 'test.csv' });
    await api.write(workbook, { type: 'xlsx', path: 'test.xlsx' });
    // Verify output
  });

  it('should handle format conversions', () => {
    const csv = 'name,value\ntest,123';
    const workbook = api.fromCSV(csv);
    const output = api.toCSV(workbook);
    expect(output).toBe(csv);
  });
});
```

## Next Steps

1. Create the `@ifla/unified-spreadsheet` package
2. Implement the UnifiedSpreadsheetAPI class
3. Add comprehensive tests
4. Migrate existing code to use the new API
5. Remove vulnerable xlsx dependency

This approach gives you:
- **One API** for all spreadsheet operations
- **Security** by replacing vulnerable xlsx
- **Performance** with streaming support
- **Flexibility** to add new formats easily