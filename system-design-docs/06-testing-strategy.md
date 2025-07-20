# Testing Strategy

**Version:** 2.0  
**Date:** January 2025  
**Status:** Current Implementation

## Overview

The IFLA Standards Platform employs a comprehensive five-phase testing strategy designed to catch issues at the earliest possible stage while minimizing CI costs. This document details the progressive testing approach, tools, patterns, and quality gates that ensure high-quality software delivery.

## Core Testing Principles

### 1. **Progressive Validation**
- Each phase builds on previous phases
- No redundant testing between phases
- Fast feedback in early phases
- Comprehensive validation before deployment

### 2. **Cost-Efficient Testing**
- Local testing handles 95% of validation
- CI only tests environment-specific issues
- Smart caching reduces execution time
- Parallel execution maximizes throughput

### 3. **Developer Experience First**
- Sub-5 second feedback for unit tests
- Clear error messages and diagnostics
- Automated test generation helpers
- Integrated with development workflow

## Five-Phase Testing Architecture

### Phase 1: Selective Tests (On-Demand Development)
**Purpose**: Individual testing for focused development work and TDD  
**Speed**: <5 seconds per test file  
**Optimization**: Heavy use of `nx affected` and smart caching

#### Unit Test Execution
```bash
# Individual project tests
nx test @ifla/theme              # Theme package only
nx test portal                   # Portal site only
nx test admin                    # Admin portal only

# Affected tests (recommended)
nx affected --target=test        # Only test changed projects
nx affected --target=test --parallel=3

# Watch mode for TDD
nx test @ifla/theme --watch
```

#### Component Testing
```typescript
// Example component test
import { render, screen } from '@testing-library/react';
import { VocabularyTable } from './VocabularyTable';

describe('VocabularyTable', () => {
  it('renders vocabulary data correctly', () => {
    const mockData = {
      elements: [
        { id: '1', label: { en: 'Title' }, uri: 'http://...' }
      ]
    };
    
    render(<VocabularyTable data={mockData} />);
    
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveAttribute('aria-label');
  });
});
```

### Phase 2: Pre-Commit Tests (Git Hook)
**Purpose**: Fast feedback preventing broken commits  
**Speed**: <60 seconds for typical changes  
**Automatic**: Runs on every `git commit`

#### What Runs Automatically
```bash
# Via Husky pre-commit hook
nx affected --target=typecheck --parallel=3
nx affected --target=lint --parallel=3      # Warnings allowed
nx affected --target=test --parallel=3      # Unit tests only
```

#### Configuration
```json
// .precommitrc.json
{
  "enableTypeCheck": true,
  "enableLint": true,
  "enableTests": true,
  "testPattern": "unit",
  "allowWarnings": true,
  "parallel": 3
}
```

### Phase 3: Pre-Push Tests (Git Hook)
**Purpose**: Integration tests and deployment readiness  
**Speed**: <180 seconds  
**Assumes**: Pre-commit tests already passed

#### What Runs Automatically
```bash
# Via Husky pre-push hook
nx affected --target=test:integration --parallel=3
nx affected --target=build --parallel=3
nx affected --target=e2e                  # If portal/admin affected
```

#### Smart E2E Triggers
```json
// .prepushrc.json
{
  "runE2E": "auto",  // auto, true, false
  "e2eTriggers": ["portal", "admin"],
  "integrationTestTimeout": 120000,
  "buildCacheEnabled": true
}
```

### Phase 4: Comprehensive Tests (Manual)
**Purpose**: Full validation before major releases  
**Speed**: <300 seconds  
**When**: Release preparation, major refactoring

#### Full Test Suite Command
```bash
# Everything in parallel
pnpm test:comprehensive

# Equivalent to:
nx run-many --target=typecheck --all --parallel &&
nx run-many --target=lint --all --parallel &&
nx run-many --target=test --all --parallel &&
nx run-many --target=test:integration --all --parallel &&
nx run-many --target=build --all --parallel &&
nx run standards-dev:e2e &&
nx run standards-dev:regression:full
```

### Phase 5: CI Environment Tests (GitHub Actions)
**Purpose**: Environment-specific validation ONLY  
**Speed**: <180 seconds  
**Focus**: What can't be tested locally

#### What CI Tests
```bash
# Environment validation only
pnpm test:ci:env

# Tests:
# - Environment variables exist and valid
# - API tokens authenticate successfully
# - External services reachable
# - File paths work in CI
# - Correct deployment environment
```

#### What CI Never Tests
- ❌ TypeScript checking (done locally)
- ❌ Linting (done locally)
- ❌ Unit tests (done locally)
- ❌ Integration tests (done locally)
- ❌ Business logic (done locally)

## Test Categories

### Unit Tests
**Purpose**: Test individual functions and components in isolation

```typescript
// Vitest configuration
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/'],
      threshold: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
});
```

### Integration Tests
**Purpose**: Test component interactions and workflows

```typescript
// Example integration test
describe('Vocabulary Import Workflow', () => {
  it('should import vocabulary from spreadsheet', async () => {
    // Setup
    const mockSheet = createMockSpreadsheet();
    const namespace = 'test-namespace';
    
    // Execute
    const result = await importVocabulary(namespace, mockSheet);
    
    // Verify
    expect(result.status).toBe('success');
    expect(result.elementsCreated).toBe(10);
    expect(await vocabularyExists(namespace)).toBe(true);
  });
});
```

### E2E Tests (Playwright)
**Purpose**: Test complete user workflows across browsers

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } }
  ]
});
```

```typescript
// Example E2E test
test('vocabulary search and navigation', async ({ page }) => {
  await page.goto('/portal');
  
  // Search for vocabulary
  await page.fill('[data-testid="search-input"]', 'ISBD');
  await page.click('[data-testid="search-button"]');
  
  // Verify results
  await expect(page.locator('[data-testid="search-results"]'))
    .toContainText('ISBD Elements');
  
  // Navigate to vocabulary
  await page.click('text=ISBD Elements');
  await expect(page).toHaveURL(/.*\/isbd\/elements/);
  
  // Verify vocabulary page
  await expect(page.locator('h1')).toContainText('ISBD Elements');
});
```

### Performance Tests
**Purpose**: Ensure application meets performance targets

```typescript
// Performance test example
test('page load performance', async ({ page }) => {
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
    };
  });
  
  expect(metrics.domContentLoaded).toBeLessThan(1000); // 1 second
  expect(metrics.loadComplete).toBeLessThan(3000);     // 3 seconds
});
```

### Accessibility Tests
**Purpose**: Ensure WCAG 2.1 AA compliance

```typescript
// Accessibility test with Playwright
test('accessibility compliance', async ({ page }) => {
  await page.goto('/portal');
  
  // Automated accessibility testing
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

## Test Organization

### Directory Structure
```
├── apps/
│   ├── portal/
│   │   └── src/
│   │       └── __tests__/      # Portal unit tests
│   └── admin/
│       └── src/
│           └── __tests__/      # Admin unit tests
├── packages/
│   └── theme/
│       └── src/
│           └── tests/          # Theme component tests
├── e2e/                        # End-to-end tests
│   ├── portal/
│   ├── admin/
│   └── cross-site/
└── test/                       # Test utilities
    ├── fixtures/
    ├── mocks/
    └── helpers/
```

### Test Naming Conventions
```typescript
// Unit tests
ComponentName.test.tsx
functionName.test.ts

// Integration tests
workflow-name.integration.test.ts

// E2E tests
feature-name.e2e.test.ts

// Performance tests
page-name.perf.test.ts
```

## Testing Patterns

### Test Data Management
```typescript
// Centralized test data factory
export const TestDataFactory = {
  vocabulary: (overrides = {}) => ({
    id: 'test-vocab',
    namespace: 'test',
    elements: [],
    ...overrides
  }),
  
  element: (overrides = {}) => ({
    id: 'test-element',
    uri: 'http://example.org/test',
    label: { en: 'Test Element' },
    ...overrides
  })
};
```

### Mock Strategies
```typescript
// API mocking with MSW
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.get('/api/vocabularies/:namespace', (req, res, ctx) => {
    return res(ctx.json({ 
      data: TestDataFactory.vocabulary() 
    }));
  })
);

// Start server before all tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Test Utilities
```typescript
// Custom render with providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    );
  }
  
  return render(ui, { wrapper: Wrapper, ...options });
}
```

## Quality Gates

### Coverage Requirements
```yaml
Unit Tests:
  statements: 80%
  branches: 80%
  functions: 80%
  lines: 80%

Integration Tests:
  critical_paths: 100%
  happy_paths: 90%
  error_paths: 80%

E2E Tests:
  user_journeys: 100%
  cross_browser: 3 browsers
  responsive: 2 viewports
```

### Performance Benchmarks
```yaml
Page Load:
  first_contentful_paint: <1.8s
  time_to_interactive: <3.5s
  cumulative_layout_shift: <0.1

API Response:
  p50: <100ms
  p95: <500ms
  p99: <1000ms

Build Performance:
  unit_tests: <60s
  integration_tests: <180s
  full_build: <300s
```

## Continuous Testing

### Test Automation
```yaml
# GitHub Actions workflow
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test:ci:env    # Environment tests only
      - run: pnpm build:affected # Build for deployment
```

### Test Reporting
```typescript
// Vitest reporters configuration
export default {
  test: {
    reporters: [
      'default',
      'json',
      'html',
      ['junit', { outputFile: 'test-results.xml' }]
    ]
  }
};
```

## Test Debugging

### Debug Commands
```bash
# Debug specific test
nx test @ifla/theme --testNamePattern="VocabularyTable"

# Debug with browser
npx playwright test --debug

# Generate trace
npx playwright test --trace on

# View test report
npx playwright show-report
```

### Common Issues
1. **Flaky Tests**: Use retry logic and proper waits
2. **Slow Tests**: Profile and optimize, use test.skip for expensive tests
3. **False Positives**: Ensure proper assertions and error handling
4. **Environment Issues**: Mock external dependencies consistently

## Test Maintenance

### Best Practices
1. **Keep Tests Simple**: One concept per test
2. **Use Descriptive Names**: Test names should explain what and why
3. **Avoid Implementation Details**: Test behavior, not implementation
4. **Maintain Test Data**: Keep fixtures up-to-date
5. **Regular Cleanup**: Remove obsolete tests

### Test Review Checklist
- [ ] Tests are deterministic
- [ ] Tests run in isolation
- [ ] Tests have clear assertions
- [ ] Tests cover edge cases
- [ ] Tests are maintainable
- [ ] Tests follow naming conventions
- [ ] Tests use appropriate helpers

## Future Testing Enhancements

### Planned Improvements
1. **Visual Regression Testing**: Automated screenshot comparison
2. **Contract Testing**: API contract validation
3. **Mutation Testing**: Test quality validation
4. **Load Testing**: Performance under load
5. **Security Testing**: Automated vulnerability scanning

### Testing Evolution
- AI-assisted test generation
- Self-healing tests
- Predictive test selection
- Real user monitoring integration
- Chaos engineering practices

This testing strategy ensures high-quality software delivery while maintaining excellent developer experience and cost efficiency through intelligent test distribution and execution.