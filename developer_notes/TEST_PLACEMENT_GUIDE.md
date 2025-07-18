# Test Placement Guide

This guide ensures that tests are placed at the correct level in our 5-phase testing strategy.

## Quick Decision Tree

```
Is the test environment-dependent?
├─ YES → Place in `**/tests/deployment/` → Runs in CI only
└─ NO → Continue...
   │
   Does it test integration between components/services?
   ├─ YES → Name with `.integration.test.ts` → Runs in pre-push
   └─ NO → Continue...
      │
      Is it an E2E test?
      ├─ YES → Place in `e2e/` directory → Runs in pre-push (smart trigger)
      └─ NO → It's a unit test → Name with `.test.ts` → Runs in pre-commit
```

## Test File Naming Conventions

### Unit Tests (Pre-commit - Phase 2)
**Pattern**: `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`
**Location**: Next to the file being tested
**Example**:
```
components/VocabularyTable.tsx
components/VocabularyTable.test.tsx  ← Unit test
```

### Integration Tests (Pre-push - Phase 3)
**Pattern**: `*.integration.test.ts`
**Location**: In `tests/integration/` or next to the file with `.integration.test` suffix
**Example**:
```
services/api-client.ts
services/api-client.integration.test.ts  ← Integration test
tests/integration/vocabulary-sync.integration.test.ts
```

### E2E Tests (Pre-push - Phase 3, smart trigger)
**Pattern**: `*.e2e.test.ts`, `*.spec.ts` (in e2e directory)
**Location**: `e2e/` directory
**Example**:
```
e2e/portal-navigation.e2e.test.ts
e2e/admin-portal/auth-flow.e2e.test.ts
```

### Environment Tests (CI only - Phase 5)
**Pattern**: `env-*.test.ts`, `*-deployment.test.ts`, `external-services.test.ts`
**Location**: `**/tests/deployment/`
**Example**:
```
packages/theme/src/tests/deployment/env-variables.test.ts
packages/theme/src/tests/deployment/external-services.test.ts
packages/theme/src/tests/deployment/supabase-cerbos-keys.test.ts
```

## Test Content Guidelines

### What Goes in Each Test Type

#### Unit Tests (Pre-commit)
- ✅ Component rendering
- ✅ Pure functions
- ✅ Utility functions
- ✅ React hooks (isolated)
- ✅ Class methods
- ✅ Business logic (isolated)
- ❌ External API calls
- ❌ Database operations
- ❌ File system operations

```typescript
// Good unit test example
describe('VocabularyTable', () => {
  it('should render vocabulary items', () => {
    const items = [{ id: '1', term: 'test' }];
    render(<VocabularyTable items={items} />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

#### Integration Tests (Pre-push)
- ✅ API client with mocked backend
- ✅ Service interactions
- ✅ Database operations (test DB)
- ✅ Multi-component workflows
- ✅ Authentication flows
- ❌ Real external services
- ❌ Production APIs

```typescript
// Good integration test example
describe('VocabularySync Integration', () => {
  it('should sync vocabulary from Google Sheets to database', async () => {
    const mockSheets = createMockGoogleSheets();
    const testDb = await createTestDatabase();
    
    const syncer = new VocabularySyncer(mockSheets, testDb);
    await syncer.sync();
    
    const items = await testDb.query('SELECT * FROM vocabulary');
    expect(items).toHaveLength(10);
  });
});
```

#### E2E Tests (Pre-push, smart trigger)
- ✅ User workflows
- ✅ Critical paths
- ✅ Cross-browser testing
- ✅ Visual regression
- ❌ Every possible interaction
- ❌ Unit-level validations

```typescript
// Good E2E test example
test('user can navigate vocabulary sections', async ({ page }) => {
  await page.goto('/isbdm');
  await page.click('text=Elements');
  await expect(page.locator('h1')).toContainText('ISBD Elements');
  await page.click('text=View Details');
  await expect(page.url()).toContain('/elements/');
});
```

#### Environment Tests (CI only)
- ✅ Environment variables present
- ✅ API tokens valid
- ✅ External service connectivity
- ✅ File permissions
- ✅ Deployment configuration
- ❌ Business logic
- ❌ Component behavior

```typescript
// Good environment test example
describe('Supabase Configuration', () => {
  it('should have valid Supabase URL', () => {
    if (!process.env.CI) return; // Skip in local
    
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toMatch(
      /^https:\/\/[a-z0-9]+\.supabase\.co$/
    );
  });
});
```

## Nx Configuration for Test Levels

### Project.json Configuration
```json
{
  "targets": {
    "test": {
      "executor": "@nx/vite:test",
      "options": {
        "config": "vitest.config.nx.ts"
      }
    },
    "test:integration": {
      "executor": "@nx/vite:test",
      "options": {
        "config": "vitest.config.nx.ts",
        "include": ["**/*.integration.test.{ts,tsx}"]
      }
    },
    "e2e": {
      "executor": "@nx/playwright:playwright",
      "options": {
        "config": "playwright.config.ts"
      }
    }
  }
}
```

### Vitest Configuration
```typescript
// vitest.config.nx.ts excludes integration and environment tests by default
exclude: [
  '**/node_modules/**',
  '**/*.integration.test.{ts,tsx}',  // Run in pre-push
  '**/tests/deployment/**',           // Run in CI only
  '**/e2e/**',                       // Run via Playwright
]
```

## Test Creation Checklist

When creating a new test, ask yourself:

1. **Does it need external services or environment variables?**
   - YES → Environment test (CI only)
   - NO → Continue...

2. **Does it test multiple components/services working together?**
   - YES → Integration test (pre-push)
   - NO → Continue...

3. **Does it test a complete user workflow?**
   - YES → E2E test (pre-push)
   - NO → Unit test (pre-commit)

4. **Naming the test file:**
   - Unit test: `Component.test.tsx`
   - Integration: `Service.integration.test.ts`
   - E2E: Place in `e2e/` directory
   - Environment: `env-feature.test.ts` in `tests/deployment/`

## Examples by Feature

### Testing a New API Endpoint

1. **Unit test** (`api/vocabulary.test.ts`):
   - Test request validation
   - Test response formatting
   - Mock all external calls

2. **Integration test** (`api/vocabulary.integration.test.ts`):
   - Test with real database (test instance)
   - Test with mocked external services
   - Test error handling

3. **E2E test** (`e2e/vocabulary-api.e2e.test.ts`):
   - Test full user workflow
   - Test from UI through to API

4. **Environment test** (`tests/deployment/env-api.test.ts`):
   - Test API tokens are present
   - Test external service connectivity

### Testing a React Component

1. **Unit test** (`VocabularyCard.test.tsx`):
   - Test rendering with props
   - Test user interactions
   - Test state changes

2. **Integration test** (if it uses services):
   - Test with mocked API client
   - Test loading states
   - Test error states

3. **E2E test** (if part of critical path):
   - Test in real browser
   - Test complete user flow

## Common Mistakes to Avoid

1. **Putting environment checks in unit tests**
   ```typescript
   // ❌ Bad - This belongs in environment tests
   it('should have API key', () => {
     expect(process.env.GOOGLE_API_KEY).toBeDefined();
   });
   ```

2. **Testing external services in integration tests**
   ```typescript
   // ❌ Bad - Use mocks instead
   it('should fetch from Google Sheets', async () => {
     const data = await googleSheets.get(REAL_SHEET_ID);
   });
   ```

3. **Writing unit tests that need multiple services**
   ```typescript
   // ❌ Bad - This is an integration test
   it('should sync and transform data', async () => {
     const syncer = new Syncer(realDb, realApi, realCache);
   });
   ```

## Enforcement

To ensure tests run at the correct level:

1. **File naming** enforces the test level
2. **Vitest config** excludes integration/environment tests from unit runs
3. **Project.json** defines separate targets for each level
4. **Git hooks** run the appropriate level automatically

When in doubt, start with a unit test and move up levels only if needed.