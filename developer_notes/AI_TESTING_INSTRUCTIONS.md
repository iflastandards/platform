# AI Testing Instructions Guide

## Introduction & Scope

This comprehensive guide provides AI assistants with detailed instructions for writing tests within the IFLA Standards Platform. It emphasizes our **integration-first testing philosophy** where we prioritize real-world testing with actual data, files, and services over mocked unit tests.

The guide ensures consistent test tagging, proper placement within the established 5-level testing strategy, and maintains alignment with the project's performance targets and architectural patterns.

## Testing Philosophy

### Integration-First Approach

We believe in testing code the way it actually runs in production. This means:

* **Real File I/O**: Test with actual files on disk rather than mocked file systems
* **Real Data**: Use test fixtures and sample data that mirror production scenarios
* **Real Services**: When possible, test against test instances of real services
* **Real Integration**: Test multiple components working together as they do in production

### When to Use Pure Unit Tests

Pure unit tests (with mocks) should be limited to:
* Pure functions with no external dependencies
* Complex algorithms that need isolation for clarity
* Edge cases that are difficult to reproduce with real data
* Performance-critical code that needs microsecond-level timing

### Test Classification

We classify tests based on their execution phase and dependencies:
* **Integration Tests**: Multiple components working together with real I/O
* **E2E Tests**: Full user workflows through the browser
* **Environment Tests**: Deployment and infrastructure validation
* **Unit Tests**: Isolated functions (use sparingly)

***

## Five-Level Testing Strategy

### 1. Selective Tests (Development Focus)

Fast feedback during active development using `nx affected` to run only changed projects. Optimized for TDD workflows with <30 second execution times. Primarily integration tests for the code being actively developed.

### 2. Pre-Commit Tests (Automated Git Hook)

Quick validation that prevents broken commits by running essential typecheck, lint, and fast integration tests on affected projects only. Executes in <60 seconds with parallel processing. Serves as the first automated quality gate.

### 3. Pre-Push Tests (Automated Git Hook)

Ensures deployment readiness by running comprehensive integration tests, E2E tests (when needed), and build validation. Targets <180 seconds execution time and focuses on inter-component compatibility and system integration.

### 4. Comprehensive Tests (Manual/Release)

Full validation suite for major releases covering all test types, performance regression, visual testing, and cross-browser compatibility. Includes long-running integration tests and extensive E2E scenarios.

### 5. CI Environment Tests (Automated Pipeline)

Validates deployment environments, external service connectivity, API token authentication, and infrastructure-specific configurations. Tests functionality that requires actual deployed environments.

***

## Test Organization & Naming

### Directory Structure

```
packages/[package-name]/
├── src/                           # Source code
├── tests/
│   ├── integration/              # Integration tests (primary)
│   │   ├── api.integration.test.ts
│   │   ├── csv-adapter.integration.test.ts
│   │   └── excel-export.integration.test.ts
│   ├── unit/                     # Pure unit tests (minimal)
│   │   └── utils.test.ts
│   └── fixtures/                 # Test data files
│       ├── sample-data.csv
│       └── test-workbook.xlsx
└── e2e/                          # End-to-end tests
    └── workflow.e2e.test.ts
```

### Naming Conventions

| Test Type | File Pattern | Example |
|-----------|--------------|---------|
| Integration | `*.integration.test.ts` | `csv-adapter.integration.test.ts` |
| Unit | `*.test.ts` | `pure-function.test.ts` |
| E2E | `*.e2e.test.ts` | `user-workflow.e2e.test.ts` |
| Environment | `env-*.test.ts` | `env-deployment.test.ts` |

### Tagging System

```typescript
// Integration test tags
describe('Feature @integration @api', () => {
  // Tests multiple components with real I/O
});

// Unit test tags (rare)
describe('Pure Function @unit', () => {
  // Tests isolated logic without dependencies
});

// E2E test tags
test('User Workflow @e2e @critical', async ({ page }) => {
  // Tests complete user journey
});

// Environment test tags
describe('Deployment @env @ci-only', () => {
  // Tests infrastructure and deployment
});
```

***

## Decision Tree for Test Classification

```
Start: Writing a new test
  ↓
Does the test require deployment infrastructure,
environment variables, or external services?
  ↓
YES → Environment Test
  ├─ Place in: tests/deployment/
  ├─ Name: env-*.test.ts
  └─ Tags: @env @ci-only
  ↓
NO → Continue...
  ↓
Does the test simulate complete user workflows
through the browser interface?
  ↓
YES → E2E Test
  ├─ Place in: e2e/
  ├─ Name: *.e2e.test.ts
  └─ Tags: @e2e
  ↓
NO → Continue...
  ↓
Does the test use real files, databases, or 
multiple components working together?
  ↓
YES → Integration Test (DEFAULT)
  ├─ Place in: tests/integration/
  ├─ Name: *.integration.test.ts
  └─ Tags: @integration
  ↓
NO → Unit Test (RARE)
  ├─ Place in: tests/unit/
  ├─ Name: *.test.ts
  └─ Tags: @unit
```

***

## Integration Test Guidelines (Primary Test Type)

### DO:
* ✅ Test with real file I/O operations
* ✅ Use actual test databases or data stores
* ✅ Test multiple components working together
* ✅ Use real test data that mirrors production
* ✅ Test complete features end-to-end (without UI)
* ✅ Verify actual file contents after operations
* ✅ Test error handling with real error conditions

### DON'T:
* ❌ Mock file systems or I/O operations
* ❌ Mock dependencies unless absolutely necessary
* ❌ Test implementation details
* ❌ Use production services or data

### Example Integration Test

```typescript
/**
 * @integration @api
 * Integration tests for CSV adapter with real file I/O
 */
describe('CSVAdapter @integration @api', () => {
  let adapter: CsvAdapter;
  const testDir = path.join(__dirname, '.test-output');

  beforeEach(async () => {
    adapter = new CsvAdapter();
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('Real File Operations @integration @api', () => {
    test('should read and parse actual CSV file', async () => {
      // Create a real CSV file
      const csvPath = path.join(testDir, 'test.csv');
      const csvContent = 'name,age,city\nJohn,30,NYC\nJane,25,LA';
      await fs.writeFile(csvPath, csvContent);

      // Test reading with actual file I/O
      const sheet = await adapter.read(csvPath);

      // Verify real data was parsed correctly
      expect(sheet.headers).toEqual(['name', 'age', 'city']);
      expect(sheet.data).toHaveLength(2);
      expect(sheet.data[0]).toEqual({
        name: 'John',
        age: 30,
        city: 'NYC'
      });
    });

    test('should handle large files with streaming', async () => {
      // Create a large CSV file
      const rows = 10000;
      const csvPath = path.join(testDir, 'large.csv');
      
      // Actually write the file
      const writeStream = createWriteStream(csvPath);
      writeStream.write('id,data\n');
      for (let i = 0; i < rows; i++) {
        writeStream.write(`${i},value${i}\n`);
      }
      await promisify(writeStream.end.bind(writeStream))();

      // Test reading large file
      const sheet = await adapter.read(csvPath);
      
      // Verify all data was read
      expect(sheet.data).toHaveLength(rows);
      expect(sheet.data[rows - 1].id).toBe(rows - 1);
    });
  });
});
```

***

## Unit Test Guidelines (Use Sparingly)

### When to Write Unit Tests

Only write unit tests for:
* Pure functions with no side effects
* Complex algorithms that benefit from isolation
* Utility functions that don't interact with external systems
* Mathematical or logical operations

### Example Unit Test

```typescript
/**
 * @unit
 * Unit tests for pure utility functions
 */
describe('Date Utils @unit', () => {
  test('should format date correctly', () => {
    const date = new Date('2024-03-15T10:30:00Z');
    const formatted = formatDate(date, 'YYYY-MM-DD');
    expect(formatted).toBe('2024-03-15');
  });

  test('should calculate date difference', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-15');
    const days = daysBetween(start, end);
    expect(days).toBe(14);
  });
});
```

***

## E2E Test Guidelines

### DO:
* ✅ Test critical user journeys
* ✅ Use real browser interactions
* ✅ Test against running applications
* ✅ Verify visual elements and user feedback
* ✅ Test cross-browser compatibility
* ✅ Include accessibility checks

### Example E2E Test

```typescript
test('Complete spreadsheet workflow @e2e @critical', async ({ page }) => {
  // Navigate to upload page
  await page.goto('/spreadsheets/upload');
  
  // Upload a real file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('./fixtures/test-data.xlsx');
  
  // Wait for processing
  await expect(page.locator('.upload-success')).toBeVisible();
  
  // Verify data is displayed
  await page.click('text=View Data');
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('tr')).toHaveCount(101); // 100 rows + header
  
  // Export to different format
  await page.click('text=Export');
  await page.selectOption('select[name="format"]', 'csv');
  
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toBe('export.csv');
});
```

***

## Environment Test Guidelines

### DO:
* ✅ Validate environment variables
* ✅ Test external service connectivity
* ✅ Verify deployment configuration
* ✅ Check infrastructure requirements
* ✅ Test with actual credentials (in CI only)

### Example Environment Test

```typescript
describe('Production Environment @env @ci-only', () => {
  it('should connect to Supabase with valid credentials', async () => {
    if (!process.env.CI) {
      console.log('Skipping environment test in local development');
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Test actual connection
    const { data, error } = await supabase
      .from('test_table')
      .select('id')
      .limit(1);

    expect(error).toBeNull();
    expect(data).toBeDefined();
  });
});
```

***

## Test Configuration

### Vitest Configuration for Integration Tests

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    // Longer timeout for integration tests
    testTimeout: 30000,
    hookTimeout: 30000,
  }
});
```

### Test Script Configuration

**🚨 CRITICAL FOR AI AGENTS: ALWAYS use `pnpm nx test [project] --skip-nx-cache`**

```json
{
  "scripts": {
    "test": "pnpm test:affected",
    "test:affected": "nx affected --target=test",
    "test:integration": "nx affected --target=test --projects=tag:integration",
    "test:e2e": "nx affected --target=e2e",
    "test:all": "nx run-many --target=test"
  }
}
```

### ❗ MANDATORY Test Execution Format

```bash
# ✅ ALWAYS USE THIS FORMAT:
pnpm nx test unified-spreadsheet --skip-nx-cache
pnpm nx test @ifla/theme --skip-nx-cache
pnpm nx test portal --skip-nx-cache

# ❌ NEVER USE THESE:
nx test unified-spreadsheet              # Missing pnpm and cache skip
pnpm nx test unified-spreadsheet        # Missing cache skip  
nx test unified-spreadsheet --skip-nx-cache  # Missing pnpm
```

**AI AGENTS: This is non-negotiable. You MUST use both `pnpm` and `--skip-nx-cache` for ALL test runs.**

***

## Performance Guidelines

### Integration Test Performance

* Target: <30 seconds per test file
* Use test fixtures instead of generating data
* Clean up test files after each test
* Use parallel execution when possible
* Share expensive setup between tests

### Optimization Techniques

```typescript
describe('Optimized Integration Tests', () => {
  // Share expensive resources
  let testDb: TestDatabase;
  
  beforeAll(async () => {
    testDb = await createTestDatabase();
  });
  
  afterAll(async () => {
    await testDb.cleanup();
  });
  
  // Use test fixtures
  const fixtures = {
    smallCsv: './fixtures/small.csv',
    largeCsv: './fixtures/large.csv',
    complexXlsx: './fixtures/complex.xlsx'
  };
  
  test('should process file efficiently', async () => {
    // Use pre-created test file
    const result = await processFile(fixtures.smallCsv);
    expect(result.rows).toBe(100);
  });
});
```

***

## Common Patterns and Anti-Patterns

### ✅ Good: Integration Test with Real I/O

```typescript
test('should convert Excel to CSV with real files', async () => {
  const xlsxPath = './fixtures/data.xlsx';
  const csvPath = './output/data.csv';
  
  await convertExcelToCsv(xlsxPath, csvPath);
  
  // Verify actual file was created
  const exists = await fs.access(csvPath).then(() => true).catch(() => false);
  expect(exists).toBe(true);
  
  // Verify content is correct
  const content = await fs.readFile(csvPath, 'utf-8');
  expect(content).toContain('header1,header2,header3');
  expect(content.split('\n')).toHaveLength(101);
});
```

### ❌ Bad: Over-Mocked Unit Test

```typescript
// AVOID THIS PATTERN
test('should read file', async () => {
  const mockFs = {
    readFile: jest.fn().mockResolvedValue('mocked content')
  };
  
  const reader = new FileReader(mockFs);
  const content = await reader.read('file.txt');
  
  expect(mockFs.readFile).toHaveBeenCalledWith('file.txt');
  expect(content).toBe('mocked content');
});
// This test only verifies that mocks work, not that the code works
```

***

## Troubleshooting

### Integration Tests Not Found

* Check file naming: must include `.integration.test.ts`
* Verify vitest config includes `tests/**` directory
* Clear Nx cache: `pnpm nx reset`
* 🚨 Run tests with: `pnpm nx test [project] --skip-nx-cache`

### Slow Integration Tests

* Use smaller test fixtures
* Share expensive setup with `beforeAll`
* Run tests in parallel
* Profile with `vitest --reporter=verbose`

### File Permission Errors

* Ensure test directory is writable
* Clean up files in `afterEach`
* Use unique filenames to avoid conflicts

This guide reflects our integration-first testing philosophy where we prioritize testing real-world scenarios over isolated unit tests, resulting in more confidence that our code works correctly in production.