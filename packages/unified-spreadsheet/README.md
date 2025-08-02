# @ifla/unified-spreadsheet

A unified API for working with spreadsheet files (CSV, XLSX) and Google Sheets, with built-in DCTAP validation support.

## Features

- **Unified API**: Single interface for CSV, XLSX, and Google Sheets
- **Type Safety**: Full TypeScript support with comprehensive types
- **DCTAP Integration**: Built-in validation for RDF vocabularies
- **Streaming Support**: Memory-efficient handling of large files
- **Format Conversion**: Easy conversion between supported formats
- **Rich Metadata**: Preserve formatting, formulas, and cell styles

## Installation

```bash
pnpm add @ifla/unified-spreadsheet
```

## Usage

### Basic Example

```typescript
import { UnifiedSpreadsheetAPI } from '@ifla/unified-spreadsheet';

const api = new UnifiedSpreadsheetAPI();

// Read a file (auto-detects format)
const workbook = await api.read({ 
  type: 'file', 
  path: 'data.xlsx' 
});

// Access data
console.log(workbook.sheets[0].data);

// Write to different format
await api.write(workbook, { 
  type: 'csv', 
  path: 'output.csv' 
});
```

### Reading Files

```typescript
// Read XLSX file
const xlsxWorkbook = await api.read({ 
  type: 'file', 
  path: 'spreadsheet.xlsx' 
});

// Read CSV file
const csvWorkbook = await api.read({ 
  type: 'file', 
  path: 'data.csv' 
});

// Read from buffer
const bufferWorkbook = await api.read({ 
  type: 'buffer', 
  buffer: fileBuffer,
  mimeType: 'text/csv' 
});

// Read from Google Sheets (requires auth)
const googleWorkbook = await api.read({ 
  type: 'googleSheets',
  spreadsheetId: '1234567890',
  ranges: ['Sheet1!A1:Z100']
});
```

### Writing Files

```typescript
// Write to XLSX
await api.write(workbook, { 
  type: 'xlsx', 
  path: 'output.xlsx',
  options: {
    compression: true,
    sheetProtection: { password: 'secret' }
  }
});

// Write to CSV
await api.write(workbook, { 
  type: 'csv', 
  path: 'output.csv',
  options: {
    delimiter: ',',
    includeHeaders: true,
    encoding: 'utf8'
  }
});
```

### Format Conversion

```typescript
// Convert CSV to XLSX
await api.convert(
  { type: 'file', path: 'input.csv' },
  { type: 'xlsx', path: 'output.xlsx' }
);

// Convert XLSX to CSV (first sheet only)
await api.convert(
  { type: 'file', path: 'input.xlsx' },
  { type: 'csv', path: 'output.csv' }
);
```

### Working with Workbook Data

```typescript
// Create a workbook from scratch
const workbook: Workbook = {
  sheets: [{
    name: 'Sales Data',
    headers: ['Product', 'Quantity', 'Price'],
    data: [
      { Product: 'Widget A', Quantity: 100, Price: 9.99 },
      { Product: 'Widget B', Quantity: 50, Price: 14.99 }
    ],
    metadata: {
      frozenRows: 1,
      columnWidths: [20, 10, 10]
    }
  }],
  metadata: {
    title: 'Q1 Sales Report',
    author: 'Sales Team',
    created: new Date()
  }
};

// Write the workbook
await api.write(workbook, { type: 'xlsx', path: 'sales.xlsx' });
```

### DCTAP Validation

```typescript
// Validate against DCTAP profile
const profile = await api.readDctapProfile('profile.csv');
const errors = await api.validate(workbook, profile);

if (errors.length > 0) {
  console.error('Validation errors:', errors);
}

// Validation with RDF conversion
const options = {
  profilePath: 'dctap-profile.csv',
  languages: ['en', 'es'],
  mode: 'strict' as const
};

const rdfWorkbook = await api.convertRdfToCsv(
  'vocabulary.ttl',
  options
);
```

### Streaming Large Files

```typescript
// Stream read for memory efficiency
await api.streamRead('large-file.xlsx', async (sheet, index) => {
  console.log(`Processing sheet ${index}: ${sheet.name}`);
  // Process sheet data in chunks
  for (const row of sheet.data) {
    await processRow(row);
  }
});
```

## API Reference

### Types

```typescript
interface Workbook {
  sheets: Sheet[];
  metadata?: WorkbookMetadata;
}

interface Sheet {
  name: string;
  data: Row[];
  headers?: string[];
  metadata?: SheetMetadata;
}

interface Row {
  [key: string]: CellValue;
}

type CellValue = string | number | boolean | Date | null | RichCell;

interface RichCell {
  value: any;
  formula?: string;
  style?: CellStyle;
  hyperlink?: string;
}
```

### Error Handling

The API throws descriptive errors for common issues:

```typescript
try {
  await api.read({ type: 'file', path: 'missing.xlsx' });
} catch (error) {
  // Handle file not found error
}

try {
  await api.read({ type: 'file', path: 'data.pdf' });
} catch (error) {
  // Handle unsupported file type error
}
```

## Features in Detail

### Duplicate Header Handling

When reading CSV files with duplicate column names, headers are automatically made unique:

```csv
id,id,name
1,2,John
```

Becomes:
```javascript
{
  headers: ['id', 'id_1', 'name'],
  data: [{ id: 1, id_1: 2, name: 'John' }]
}
```

### Data Type Preservation

The API preserves data types during read/write operations:
- Numbers remain numbers
- Dates are parsed and preserved as Date objects
- Booleans are recognized (true/false, TRUE/FALSE)
- Null values are preserved

### Formula Support

Excel formulas are preserved when reading XLSX files:

```javascript
const cell = workbook.sheets[0].data[0].Total;
console.log(cell.formula); // "=A1+B1"
console.log(cell.value);   // 42 (calculated result)
```

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

## Migration from xlsx Package

This package was created to replace the vulnerable `xlsx` (SheetJS) package. For migration details, see [XLSX_TO_EXCELJS_MIGRATION.md](../../developer_notes/XLSX_TO_EXCELJS_MIGRATION.md).

## License

MIT © IFLA Standards Development