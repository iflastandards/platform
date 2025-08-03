# Test Templates

Copy these templates when creating new tests to ensure proper placement and structure. Our testing philosophy prioritizes **integration tests with real I/O** over mocked unit tests.

**📋 Phase Context**: These templates align with our [5-phase testing strategy](./TESTING_STRATEGY.md) - use the appropriate template based on which phase your test belongs to.

## Integration Test Template (Primary - Phase 1/3)

**Phase Context**: Phase 1 (Selective) and Phase 3 (Pre-push)  
**Performance Target**: < 30 seconds per file  
**Purpose**: Testing multiple components working together with real file I/O, databases, and services.

```typescript
// ComponentName.integration.test.tsx or serviceName.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceName } from '../../src/ServiceName';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

describe('ServiceName @integration @api @validation', () => {
  const testDir = path.join(__dirname, '.test-output');
  let service: ServiceName;

  beforeEach(async () => {
    // Create test directory for real file operations
    await fs.mkdir(testDir, { recursive: true });
    service = new ServiceName();
  });

  afterEach(async () => {
    // Clean up test files
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should process real files correctly', async () => {
    // Create real test data
    const inputPath = path.join(testDir, 'input.csv');
    const outputPath = path.join(testDir, 'output.xlsx');
    await fs.writeFile(inputPath, 'header1,header2\nvalue1,value2');
    
    // Test with real I/O
    await service.convertFile(inputPath, outputPath);
    
    // Verify real output
    const exists = await fs.access(outputPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
    
    // Verify content (using another real read operation)
    const result = await service.readFile(outputPath);
    expect(result.sheets[0].data).toHaveLength(1);
  });

  it('should handle errors with real conditions', async () => {
    const nonExistentPath = path.join(testDir, 'does-not-exist.csv');
    
    await expect(service.processFile(nonExistentPath))
      .rejects.toThrow('File not found');
  });
});
```

## Unit Test Template (Rare - Phase 2)

**Phase Context**: Phase 2 (Pre-commit)  
**Performance Target**: < 5 seconds per file  
**Purpose**: Only use for pure functions without external dependencies. Most code should be tested with integration tests.

```typescript
// utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate, calculateSum } from '../../src/utils';

describe('Utility Functions @unit', () => {
  it('should format date correctly', () => {
    const date = new Date('2024-03-15T10:30:00Z');
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2024-03-15');
  });

  it('should calculate sum of array', () => {
    expect(calculateSum([1, 2, 3, 4])).toBe(10);
    expect(calculateSum([])).toBe(0);
  });
});
```

## E2E Test Template (Phase 3 - Smart Trigger)

**Phase Context**: Phase 3 (Pre-push) - Auto-triggers when portal/admin affected  
**Performance Target**: < 60 seconds per workflow  
**Purpose**: Testing complete user workflows through the browser.

```typescript
// e2e/feature-name.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name E2E @e2e @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete user workflow with real data', async ({ page }) => {
    // Navigate to feature
    await page.click('text=Upload Spreadsheet');
    await expect(page).toHaveURL('/upload');
    
    // Upload real file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./fixtures/test-data.xlsx');
    
    // Wait for processing
    await expect(page.locator('.upload-success')).toBeVisible();
    
    // Verify results
    await page.click('text=View Results');
    const table = page.locator('table');
    await expect(table).toBeVisible();
    await expect(table.locator('tr')).toHaveCount(101); // 100 + header
    
    // Download converted file
    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Export as CSV');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('export.csv');
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    // Upload invalid file
    await page.locator('input[type="file"]').setInputFiles('./fixtures/invalid.txt');
    
    // Verify error message
    await expect(page.locator('.error-message'))
      .toContainText('Please upload a valid spreadsheet file');
  });
});
```

## Environment Test Template (Phase 5 - CI Only)

**Phase Context**: Phase 5 (CI Environment Tests)  
**Performance Target**: < 30 seconds per service  
**Purpose**: Testing deployment configuration and external service connectivity.

```typescript
// tests/deployment/env-feature.test.ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Feature Environment Configuration @env @ci-only', () => {
  it('should skip in non-CI environments', () => {
    if (!process.env.CI) {
      console.log('Skipping environment test in local development');
      expect(true).toBe(true);
      return;
    }
  });

  it('should have required environment variables', () => {
    if (!process.env.CI) return;
    
    expect(process.env.FEATURE_API_KEY).toBeDefined();
    expect(process.env.FEATURE_API_KEY).not.toBe('');
    expect(process.env.FEATURE_API_KEY).toMatch(/^[A-Za-z0-9]{32}$/);
  });

  it('should connect to external service', async () => {
    if (!process.env.CI) return;
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Test real connection
    const { data, error } = await supabase
      .from('test_table')
      .select('count')
      .single();
    
    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

## Test Helper Templates

### Real Test Database Helper
```typescript
// tests/helpers/test-db.ts
import { Database } from '../../src/database';

export async function createTestDatabase() {
  // Create real test database instance
  const db = new Database({
    connection: process.env.TEST_DATABASE_URL || 'sqlite::memory:'
  });
  
  await db.migrate();
  await db.seed();
  
  return {
    query: (sql: string) => db.query(sql),
    insert: (table: string, data: any) => db.insert(table, data),
    cleanup: async () => {
      await db.truncateAll();
      await db.close();
    }
  };
}
```

### File Test Helper
```typescript
// tests/helpers/file-utils.ts
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export class TestFileManager {
  private testDir: string;
  private createdFiles: string[] = [];

  constructor(testName: string) {
    this.testDir = path.join(__dirname, '.test-output', testName);
  }

  async setup() {
    await fs.mkdir(this.testDir, { recursive: true });
  }

  async createFile(filename: string, content: string) {
    const filepath = path.join(this.testDir, filename);
    await fs.writeFile(filepath, content);
    this.createdFiles.push(filepath);
    return filepath;
  }

  async cleanup() {
    await fs.rm(this.testDir, { recursive: true, force: true });
  }

  getPath(filename: string) {
    return path.join(this.testDir, filename);
  }
}
```

### React Testing Utils with Real Data
```typescript
// tests/helpers/react-utils.tsx
import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Use real query client, not mocked
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

export function renderWithProviders(ui: ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {ui}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```

## Quick Decision Helper (Phase-Aware)

When writing a test, ask in order:

1. **Environment-specific?** → `env-*.test.ts` in `tests/deployment/` (Phase 5 - CI)
2. **User workflow?** → `*.e2e.test.ts` in `e2e/` (Phase 3 - Pre-push)
3. **Uses files/DB/services?** → `*.integration.test.ts` in `tests/integration/` (Phase 1/3 - DEFAULT)
4. **Pure function only?** → `*.test.ts` in `tests/unit/` (Phase 2 - Pre-commit, RARE)

**Phase Execution**:
- **Phase 1**: Individual project testing during development
- **Phase 2**: Pre-commit (unit tests, typecheck, lint)
- **Phase 3**: Pre-push (integration tests, builds, smart E2E)
- **Phase 4**: Comprehensive (manual, all tests)
- **Phase 5**: CI environment (deployment validation only)

## File Location Examples

```
packages/unified-spreadsheet/
├── src/
│   ├── adapters/
│   │   ├── csv-adapter.ts
│   │   └── exceljs-adapter.ts
│   └── unified-spreadsheet.ts
├── tests/
│   ├── integration/                    ← Most tests go here
│   │   ├── csv-adapter.integration.test.ts
│   │   ├── exceljs-adapter.integration.test.ts
│   │   └── unified-spreadsheet.integration.test.ts
│   ├── unit/                          ← Only pure functions
│   │   └── utils.test.ts
│   ├── fixtures/                      ← Real test data
│   │   ├── sample.csv
│   │   ├── complex.xlsx
│   │   └── large-dataset.csv
│   └── deployment/                    ← CI-only tests
│       └── env-api.test.ts
└── e2e/
    └── spreadsheet-workflow.e2e.test.ts
```

## Integration Test Best Practices

### DO:
- ✅ Create real files and verify their contents
- ✅ Use actual test databases (SQLite in-memory is great)
- ✅ Test error conditions with real scenarios
- ✅ Clean up all created resources in `afterEach`
- ✅ Use fixtures for consistent test data
- ✅ Test the full flow from input to output

### DON'T:
- ❌ Mock file systems or I/O operations
- ❌ Mock dependencies unless absolutely necessary
- ❌ Test implementation details
- ❌ Leave test files behind after tests complete

## Example: Real Integration Test from Our Codebase

```typescript
describe('UnifiedSpreadsheetAPI @integration @api', () => {
  let api: UnifiedSpreadsheetAPI;
  const testDir = path.join(__dirname, '.test-output');

  beforeEach(async () => {
    api = new UnifiedSpreadsheetAPI();
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  test('should convert CSV to XLSX with real files', async () => {
    // Create real CSV file
    const csvPath = path.join(testDir, 'input.csv');
    await fs.writeFile(csvPath, 'name,score\nAlice,95\nBob,87');

    // Convert using real I/O
    const xlsxPath = path.join(testDir, 'output.xlsx');
    await api.convert(
      { type: 'file', path: csvPath },
      { type: 'xlsx', path: xlsxPath }
    );

    // Read back and verify
    const workbook = await api.read({ type: 'file', path: xlsxPath });
    expect(workbook.sheets[0].data).toHaveLength(2);
    expect(workbook.sheets[0].data[0].name).toBe('Alice');
    expect(workbook.sheets[0].data[0].score).toBe(95);
  });
});
```

This approach gives us confidence that our code works with real files, real data formats, and real error conditions - exactly as it will in production.