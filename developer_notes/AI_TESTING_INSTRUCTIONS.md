# AI Testing Instructions Guide

## Introduction & Scope

This comprehensive guide provides AI assistants with detailed instructions for writing tests within the IFLA Standards Platform. It ensures consistent test tagging, proper placement within the established 5-level testing strategy, and maintains alignment with the project's performance targets and architectural patterns.

The guide focuses on helping AI agents create tests that integrate seamlessly with the existing Nx-based monorepo structure, Playwright E2E framework, and Vitest unit testing infrastructure.

***

## Five-Level Testing Strategy Recap

### 1. Selective Tests (Development Focus)

Fast feedback during active development using `nx affected` to run only changed projects. Optimized for TDD workflows with \<30 second execution times. Focuses on unit tests and targeted regression testing for specific components or features under development.

### 2. Pre-Commit Tests (Automated Git Hook)

Quick validation that prevents broken commits by running essential typecheck, lint, and unit tests on affected projects only. Executes in \<60 seconds with parallel processing. Serves as the first automated quality gate in the development workflow.

### 3. Pre-Push Tests (Automated Git Hook)

Ensures integration readiness by running comprehensive integration tests, E2E tests (when needed), and build validation. Targets \<180 seconds execution time and focuses on inter-component compatibility and deployment readiness validation.

### 4. Comprehensive Tests (Manual/Release)

Full validation suite for major releases covering all test types, performance regression, visual testing, and cross-browser compatibility. Designed for thorough validation before production deployments with comprehensive coverage across all platforms.

### 5. CI Environment Tests (Automated Pipeline)

Validates deployment environments, external service connectivity, API token authentication, and infrastructure-specific configurations. Focuses exclusively on environment-dependent functionality that cannot be tested locally.

***

## Tagging Vocabulary Table

| Test Phase       | File Naming Patterns                | Directory Locations                  | Required Tags          | Optional Meta-Tags                      |
|------------------|-------------------------------------|--------------------------------------|------------------------|----------------------------------------|
| **Selective**    | `*.test.ts`, `*.spec.ts`            | `src/`, `scripts/`, `components/`    | `@unit`                | `@ui`, `@api`, `@critical`             |
| **Pre-Commit**   | `*.test.ts`, `*.spec.ts`            | `src/`, `scripts/`, `components/`    | `@unit`, `@integration`| `@critical`, `@auth`                   |
| **Pre-Push**     | `*.test.ts`, `*.spec.ts`            | `src/`, `scripts/`, `e2e/`           | `@integration`, `@e2e` | `@performance`, `@regression`          |
| **Comprehensive**| `*.test.ts`, `*.spec.ts`, `.e2e.ts` | `e2e/`, `integration/`               | `@e2e`                 | `@cross-site`, `@accessibility`        |
| **CI-Env**       | `.ci.ts`, `.e2e.ts`                 | `ci/`, `tests/deployment/`           | `@env`                 | `@env-specific`                        |

### Additional Available Tags from TestTags Utility

```typescript
// Priority tags
@critical, @high-priority, @low-priority

// Feature area tags  
@auth, @rbac, @api, @ui, @dashboard, @admin, @docs, @navigation, @search, @vocabulary

// Environment tags
@local-only, @ci-only, @preview-only, @production-only

// Browser-specific tags
@chromium-only, @firefox-only, @webkit-only, @mobile-only

// Special tags
@flaky, @skip, @slow, @fast, @visual, @performance
```

***

## Decision Tree & Flowchart

```
  Start: Writing a new test
    ↓
  Does the test require environment variables, 
  external services, or deployment-specific configuration?
    ↓
  YES → Environment Test
    ↓
  Place in: `**/tests/deployment/`
  Name: `env-*.test.ts` or `*-deployment.test.ts`
  Tags: @env, @ci-only
    ↓
  NO → Continue...
    ↓
  Does the test validate interactions between 
  multiple components, services, or systems?
    ↓
  YES → Integration Test
    ↓
  Place in: `tests/integration/` or co-located
  Name: `*.integration.test.ts`
  Tags: @integration
    ↓
  NO → Continue...
    ↓
  Does the test simulate complete user workflows
  using browser automation?
    ↓
  YES → E2E Test
    ↓
  Place in: `e2e/` directory
  Name: `*.e2e.test.ts` or `*.spec.ts`
  Tags: @e2e
    ↓
  NO → Unit Test
    ↓
  Place: Co-located with source file
  Name: `*.test.ts` or `*.spec.ts`
  Tags: @unit
```

***

## Category-Specific Guidelines

### Unit Tests

**DO:**

* ✅ Test isolated functions and components
* ✅ Mock external dependencies
* ✅ Focus on business logic and pure functions
* ✅ Test React component rendering with mocked props
* ✅ Validate input/output transformations
* ✅ Keep execution time under 5 seconds per test

**DON'T:**

* ❌ Make actual API calls
* ❌ Access file systems or databases
* ❌ Test multiple components together
* ❌ Depend on external services
* ❌ Test deployment-specific configurations

### Integration Tests

**DO:**

* ✅ Test component interactions with mocked services
* ✅ Validate API client behavior with mock backends
* ✅ Test service layer integration
* ✅ Verify authentication flows with test data
* ✅ Test database operations with test instances

**DON'T:**

* ❌ Use production APIs or services
* ❌ Test complete user workflows (that's E2E)
* ❌ Include environment-specific configurations
* ❌ Test isolated component logic (that's unit testing)

### E2E Tests

**DO:**

* ✅ Test critical user paths and workflows
* ✅ Validate cross-browser functionality
* ✅ Test complete features from UI to backend
* ✅ Include accessibility testing
* ✅ Focus on high-value user scenarios

**DON'T:**

* ❌ Test every possible user interaction
* ❌ Duplicate unit or integration test coverage
* ❌ Test individual component behavior
* ❌ Include environment configuration validation

### Environment Tests

**DO:**

* ✅ Validate required environment variables exist
* ✅ Test API token authentication
* ✅ Verify external service connectivity
* ✅ Check file permissions and paths
* ✅ Validate deployment configuration

**DON'T:**

* ❌ Test business logic or component behavior
* ❌ Include user workflow validation
* ❌ Test component rendering or interactions
* ❌ Run in local development environments

***

## Example Library

Here are curated, well-documented examples for each test category:

### Unit Test Example

**File**: `./packages/theme/src/tests/components/ExampleTable.test.tsx`

```typescript
describe('ExampleTable @unit @ui', () => {
  it('should render table with provided data', () => {
    const mockData = [{ id: '1', name: 'Test Item' }];
    render(<ExampleTable data={mockData} />);
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });
});
```

### Integration Test Example

**File**: `./e2e/integration/site-validation.integration.spec.ts`

```typescript
describe('Site Validation @integration @critical', () => {
  it('should validate all sites build successfully', async () => {
    const sites = await getAllSiteConfigs();
    for (const site of sites) {
      const buildResult = await buildSite(site);
      expect(buildResult.success).toBe(true);
    }
  });
});
```

### E2E Test Example

**File**: `./e2e/e2e/admin/dashboard.auth.spec.ts`

```typescript
test('User authentication workflow @e2e @auth @critical', async ({ page }) => {
  await page.goto('/admin');
  await page.click('text=Sign In');
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=code]', '424242');
  await page.click('[data-testid=submit]');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

### Environment Test Example

**File**: `./packages/theme/src/tests/deployment/env-deployment.test.ts`

```typescript
describe('Environment Configuration @env @ci-only', () => {
  it('should have valid Supabase configuration', () => {
    if (!process.env.CI) return;
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toMatch(/^https:\/\/.+\.supabase\.co$/);
  });
});
```

***

## Quick-Reference Cheat Sheet & Checklist

### Pre-Development Checklist

* \[ ] Determine test category using decision tree
* \[ ] Choose appropriate file naming convention
* \[ ] Identify required and optional tags
* \[ ] Select proper directory location
* \[ ] Verify alignment with Nx targets

### Test Creation Checklist

* \[ ] File named according to conventions (`*.test.ts`, `*.integration.test.ts`, etc.)
* \[ ] Placed in correct directory structure
* \[ ] Tagged appropriately with required tags
* \[ ] Uses proper test utilities (TestTags, taggedTest, etc.)
* \[ ] Includes meaningful test descriptions
* \[ ] Follows Do/Don't guidelines for category

### Validation Checklist

* \[ ] Test runs with `nx affected --target=test`
* \[ ] Passes ESLint validation
* \[ ] Executes within performance targets
* \[ ] Properly integrates with CI/CD pipeline
* \[ ] Uses environment-aware configuration when needed

### Performance Targets by Category

* **Unit Tests**: \<5 seconds per test file
* **Integration Tests**: \<30 seconds per test file
* **E2E Tests**: \<60 seconds per critical workflow
* **Environment Tests**: \<10 seconds per validation

***

## Embedded Code Snippets & Commands

### Nx Testing Commands

```bash
# Run affected tests only (recommended for development)
nx affected --target=test --parallel=3

# Run specific project tests
nx test @ifla/theme
nx test portal
nx test admin

# Run integration tests
nx affected --target=test:integration

# Run E2E tests
nx run standards-dev:e2e

# Run comprehensive test suite
pnpm test:comprehensive
```

### Test File Templates

#### Unit Test Template

```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName @unit @ui', () => {
  it('should render correctly with props', () => {
    const props = { /* mock props */ };
    render(<ComponentName {...props} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const mockHandler = vi.fn();
    render(<ComponentName onClick={mockHandler} />);
    await userEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

#### Integration Test Template

```typescript
import { vi } from 'vitest';

describe('Service Integration @integration @api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should integrate with external service', async () => {
    const mockService = createMockService();
    const client = new ApiClient(mockService);
    
    const result = await client.fetchData();
    
    expect(result).toBeDefined();
    expect(mockService.get).toHaveBeenCalledWith('/api/data');
  });
});
```

#### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';
import { TestTags } from '../utils/test-tags';

test(`User workflow ${TestTags.E2E} ${TestTags.CRITICAL}`, async ({ page }) => {
  // Navigate to page
  await page.goto('/feature');
  
  // Perform user actions
  await page.click('[data-testid=action-button]');
  
  // Verify expected outcome
  await expect(page.locator('[data-testid=result]')).toBeVisible();
});
```

#### Environment Test Template

```typescript
describe('Environment Validation @env @ci-only', () => {
  it('should validate required environment variables', () => {
    if (!process.env.CI) {
      console.log('Skipping environment test in local development');
      return;
    }

    expect(process.env.REQUIRED_VAR).toBeDefined();
    expect(process.env.REQUIRED_VAR).not.toBe('');
  });
});
```

### Test Tagging Utilities

```typescript
import { TestTags, tags, testWithTags } from './e2e/utils/test-tags';

// Using TestTags constants
describe(`Component Tests ${TestTags.UNIT} ${TestTags.UI}`, () => {
  // test implementation
});

// Using tag builder
const testTags = tags().unit().ui().critical().build();
describe(`Component Tests ${testTags}`, () => {
  // test implementation
});

// Using helper function
describe(testWithTags('Component Tests', TestTags.UNIT, TestTags.UI), () => {
  // test implementation
});
```

### Playwright Configuration Snippets

```typescript
// playwright.config.ts - Project-specific configuration
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'admin-portal',
      testDir: './e2e/e2e/admin',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});
```

***

## Integration with Existing Tools

### Nx Configuration

Tests automatically integrate with Nx targets defined in `project.json`:

* `test`: Unit tests (excludes integration and environment tests)
* `test:integration`: Integration tests only
* `e2e`: Playwright E2E tests

### Git Hooks Integration

Tests run automatically through Husky hooks:

* **Pre-commit**: `nx affected --target=test` (unit tests only)
* **Pre-push**: Integration tests + affected E2E tests

### CI/CD Pipeline

Environment tests run exclusively in CI with proper environment variables and external service access.

***

## Troubleshooting Common Issues

### Test Not Running in Expected Phase

* Verify file naming matches conventions
* Check directory placement
* Ensure proper tags are applied
* Validate Nx configuration excludes/includes

### Performance Issues

* Use `nx affected` instead of running all tests
* Enable Nx daemon: `pnpm nx:daemon:start`
* Check parallel execution configuration
* Review test complexity and mock usage

### Environment Test Failures

* Verify CI environment variables are set
* Check external service connectivity
* Validate API token permissions
* Review environment-specific configurations

This guide ensures AI assistants can create tests that integrate seamlessly with the IFLA Standards Platform's sophisticated testing infrastructure while maintaining high quality and performance standards.
