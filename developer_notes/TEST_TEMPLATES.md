# Test Templates

Copy these templates when creating new tests to ensure proper placement and structure.

## Unit Test Template (Pre-commit)

```typescript
// ComponentName.test.tsx or fileName.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const mockOnClick = vi.fn();
    render(<ComponentName onClick={mockOnClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledOnce();
  });
});
```

## Integration Test Template (Pre-push)

```typescript
// ServiceName.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ServiceName } from './ServiceName';
import { createTestDatabase } from '@/tests/helpers/test-db';
import { mockExternalService } from '@/tests/mocks/external-service';

describe('ServiceName Integration', () => {
  let testDb: TestDatabase;
  let service: ServiceName;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    const mockApi = mockExternalService();
    service = new ServiceName(testDb, mockApi);
  });

  afterAll(async () => {
    await testDb.cleanup();
  });

  it('should integrate with database and external service', async () => {
    // Test multiple components working together
    const result = await service.processData();
    
    // Verify database state
    const dbRecords = await testDb.query('SELECT * FROM records');
    expect(dbRecords).toHaveLength(5);
    
    // Verify service interactions
    expect(mockApi.fetch).toHaveBeenCalledWith('/api/data');
  });
});
```

## E2E Test Template (Pre-push, smart trigger)

```typescript
// e2e/feature-name.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('Feature Name E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete user workflow', async ({ page }) => {
    // Navigate to feature
    await page.click('text=Feature Link');
    await expect(page).toHaveURL('/feature');
    
    // Interact with feature
    await page.fill('[data-testid="input-field"]', 'test value');
    await page.click('button[type="submit"]');
    
    // Verify outcome
    await expect(page.locator('.success-message')).toContainText('Success');
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Trigger error condition
    await page.route('**/api/feature', route => 
      route.fulfill({ status: 500 })
    );
    
    await page.click('button[type="submit"]');
    await expect(page.locator('.error-message')).toBeVisible();
  });
});
```

## Environment Test Template (CI only)

```typescript
// tests/deployment/env-feature.test.ts
import { describe, it, expect } from 'vitest';

describe('Feature Environment Configuration', () => {
  // Always skip in non-CI environments
  it('should skip in non-CI environments', () => {
    if (!process.env.CI) {
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
    
    const response = await fetch(
      `${process.env.FEATURE_API_URL}/health`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.FEATURE_API_KEY}`
        }
      }
    );
    
    expect(response.ok).toBe(true);
  });

  it('should handle fork PR restrictions gracefully', () => {
    if (!process.env.CI) return;
    
    // GitHub restricts secrets in fork PRs
    if (!process.env.FEATURE_API_KEY) {
      console.log('ℹ️  API key not available - likely a fork PR (expected)');
      expect(true).toBe(true);
      return;
    }
    
    expect(process.env.FEATURE_API_KEY).toBeDefined();
  });
});
```

## Test Helper Templates

### Mock External Service
```typescript
// tests/mocks/external-service.ts
import { vi } from 'vitest';

export function mockExternalService() {
  return {
    fetch: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ success: true }),
    delete: vi.fn().mockResolvedValue({ success: true }),
  };
}
```

### Test Database Helper
```typescript
// tests/helpers/test-db.ts
export async function createTestDatabase() {
  const db = new TestDatabase();
  await db.migrate();
  
  return {
    query: (sql: string) => db.query(sql),
    insert: (table: string, data: any) => db.insert(table, data),
    cleanup: () => db.destroy(),
  };
}
```

### React Testing Utils
```typescript
// tests/helpers/react-utils.tsx
import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@/theme';

export function renderWithProviders(ui: ReactElement) {
  return render(
    <ThemeProvider>
      {ui}
    </ThemeProvider>
  );
}
```

## Quick Decision Helper

When writing a test, ask in order:

1. **Environment?** → `env-*.test.ts` in `tests/deployment/`
2. **Integration?** → `*.integration.test.ts`
3. **E2E?** → `e2e/*.e2e.test.ts`
4. **Otherwise** → `*.test.ts` (unit test)

## File Location Examples

```
packages/theme/
├── src/
│   ├── components/
│   │   ├── VocabularyTable.tsx
│   │   ├── VocabularyTable.test.tsx          ← Unit test
│   │   └── VocabularyTable.integration.test.ts ← Integration test
│   ├── services/
│   │   ├── api-client.ts
│   │   ├── api-client.test.ts               ← Unit test
│   │   └── api-client.integration.test.ts   ← Integration test
│   └── tests/
│       └── deployment/
│           ├── env-api.test.ts              ← Environment test
│           └── external-services.test.ts    ← Environment test
└── e2e/
    ├── vocabulary-flow.e2e.test.ts          ← E2E test
    └── admin-portal/
        └── auth.e2e.test.ts                 ← E2E test
```