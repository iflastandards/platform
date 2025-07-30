# Testing Strategy

**Version:** 3.0  
**Date:** January 2025  
**Status:** Current Implementation (Nx-Optimized)

## Overview

The IFLA Standards Platform employs a comprehensive Nx-optimized testing strategy designed to reduce fragility, accelerate feedback loops, and leverage Nx capabilities for atomic, environment-specific, and parallelized testing. This document details the progressive testing approach, tools, patterns, and quality gates that ensure high-quality software delivery while minimizing CI costs and maintenance overhead.

## Core Testing Principles

### 1. **Progressive Validation**
- Each phase builds on previous phases
- No redundant testing between phases
- Fast feedback in early phases (<5s for unit tests)
- Comprehensive validation before deployment

### 2. **Nx-Optimized Execution**
- Leverage `nx affected` for minimal test runs
- Atomic tests with full isolation
- Parallel execution with Nx agents
- Smart caching for performance

### 3. **Environment-Specific Testing**
- Local tests handle business logic
- Preview tests validate integrations
- Production tests verify deployment only
- CI focuses on environment-specific issues

### 4. **Reduced Fragility**
- Robust selectors (data-testid, getByRole)
- Auto-waiting and retry logic
- Test isolation and cleanup
- Flaky test detection and reporting

## Test Categories and Tags

### Test Tagging System
```typescript
// Test tags for selective execution
type TestTag = '@smoke' | '@integration' | '@e2e' | '@unit' | '@perf' | '@a11y';

// Example tagged test
test('@smoke Authentication flow', async ({ page }) => {
  // Critical path test that runs in all environments
});

test('@integration @api GitHub API sync', async ({ page }) => {
  // Integration test for preview environment
});

test('@e2e Full vocabulary workflow', async ({ page }) => {
  // Comprehensive E2E for pre-push only
});
```

### Tag-Based Execution Strategy
| Tag | Environment | Frequency | Time Limit | Pass Rate |
|-----|------------|-----------|------------|-----------|
| @smoke | All | Every deploy | <5min | 100% |
| @integration | Preview/Local | Pre-merge | <15min | 95% |
| @e2e | Local | Pre-push | <20min | 90% |
| @unit | Local | Pre-commit | <60s | 100% |
| @perf | Preview | Weekly | <30min | Baseline |
| @a11y | All | Pre-merge | <10min | 100% |

## Nx Configuration

### Project Structure
```typescript
// nx.json configuration
{
  "targetDefaults": {
    "test": {
      "executor": "@nx/vite:test",
      "options": {
        "passWithNoTests": true
      }
    },
    "test:integration": {
      "executor": "@nx/playwright:playwright",
      "options": {
        "config": "playwright.config.ts",
        "grep": "@integration"
      }
    },
    "e2e": {
      "executor": "@nx/playwright:playwright",
      "options": {
        "config": "playwright.config.ts",
        "grep": "@e2e"
      }
    }
  },
  "affected": {
    "defaultBase": "main"
  }
}
```

### Playwright Configuration
```typescript
// playwright.config.ts - Nx-optimized
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '50%' : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }],
    ['@currents/playwright'] // Flaky test detection
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Robust waiting strategies
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
      grep: /@mobile/,
    },
  ],

  // Global setup for Clerk auth
  globalSetup: require.resolve('./e2e/global-setup.ts'),
});
```

## Testing Phases

### Phase 1: Unit Tests (Pre-commit)
**Purpose**: Fast feedback for business logic  
**Speed**: <60s for affected projects  
**Automatic**: Via Husky pre-commit hook

```bash
# Nx affected testing
nx affected --target=test --parallel=3

# With coverage
nx affected --target=test --coverage --parallel=3
```

### Phase 2: Integration Tests (Pre-merge)
**Purpose**: Validate service integrations  
**Speed**: <15min  
**Scope**: API endpoints, database, external services

```bash
# Run integration tests for affected projects
nx affected --target=test:integration --parallel=3

# Specific integration suites
nx test:integration admin --grep="@api"
nx test:integration portal --grep="@database"
```

### Phase 3: E2E Tests (Pre-push)
**Purpose**: Full user journey validation  
**Speed**: <20min  
**Scope**: Complete workflows, RBAC scenarios

```bash
# Smart E2E execution
if [[ $(nx show projects --affected --type=app) =~ "admin|portal" ]]; then
  nx affected --target=e2e --parallel=2
fi

# Full E2E suite (manual)
nx run-many --target=e2e --all --parallel=2
```

### Phase 4: Smoke Tests (All Environments)
**Purpose**: Critical path validation  
**Speed**: <5min  
**Scope**: Auth, core features, API health

```bash
# Smoke tests only
nx e2e standards-dev --grep="@smoke"

# Environment-specific
BASE_URL=https://preview.vercel.app nx e2e standards-dev --grep="@smoke"
BASE_URL=https://iflastandards.info nx e2e standards-dev --grep="@smoke"
```

## Clerk Authentication Testing

### Global Setup for Test Users
```typescript
// e2e/global-setup.ts
import { test as setup } from '@playwright/test';
import { ClerkTestUtils } from './utils/clerk-test-utils';

setup('authenticate test users', async ({ page }) => {
  const clerk = new ClerkTestUtils();
  
  // Create or reset test users
  await clerk.ensureTestUsers([
    { email: 'admin@test.ifla.org', role: 'admin' },
    { email: 'editor@test.ifla.org', role: 'editor' },
    { email: 'reviewer@test.ifla.org', role: 'reviewer' },
    { email: 'viewer@test.ifla.org', role: 'viewer' }
  ]);
  
  // Store auth states for reuse
  for (const user of testUsers) {
    await clerk.authenticateUser(page, user);
    await page.context().storageState({ 
      path: `e2e/.auth/${user.role}.json` 
    });
  }
});
```

### RBAC Test Patterns
```typescript
// e2e/admin/rbac.spec.ts
import { test, expect } from '@playwright/test';

test.describe('@integration RBAC Scenarios', () => {
  test.use({ storageState: 'e2e/.auth/editor.json' });
  
  test('editor can modify vocabulary', async ({ page }) => {
    await page.goto('/admin/vocabularies/isbd');
    
    // Use robust selectors
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Term Label').fill('Updated Term');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify with auto-waiting
    await expect(page.getByText('Changes saved')).toBeVisible();
  });
  
  test('editor cannot access system settings', async ({ page }) => {
    await page.goto('/admin/system/settings');
    await expect(page.getByText('Access Denied')).toBeVisible();
  });
});
```

## Robust Selector Strategy

### Selector Priority Order
1. **Test IDs** for critical elements
2. **ARIA roles** for semantic elements
3. **Label text** for form controls
4. **Visible text** for content
5. **CSS selectors** as last resort

```typescript
// Good selector examples
await page.getByTestId('submit-button').click();
await page.getByRole('navigation', { name: 'Main' });
await page.getByLabel('Email Address').fill('test@example.com');
await page.getByText('Welcome to IFLA Standards');

// Avoid fragile selectors
// ❌ await page.locator('.btn-primary:nth-child(2)').click();
// ❌ await page.locator('#app > div > form > button').click();
```

### Auto-waiting and Retry Patterns
```typescript
// Built-in auto-waiting
await expect(page.getByTestId('loading')).toBeHidden();
await expect(page.getByRole('alert')).toContainText('Success');

// Custom retry logic for complex scenarios
await test.step('Wait for data sync', async () => {
  await expect(async () => {
    const response = await page.request.get('/api/status');
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.synced).toBe(true);
  }).toPass({ timeout: 30_000 });
});
```

## Test Data Management

### Fixture System
```typescript
// e2e/fixtures/vocabulary.fixture.ts
export const vocabularyFixtures = {
  minimal: {
    namespace: 'test-minimal',
    elements: [
      { label: { en: 'Title' }, uri: 'http://example.org/title' }
    ]
  },
  
  complete: {
    namespace: 'test-complete',
    elements: generateElements(50),
    elementSets: generateElementSets(5),
    profiles: generateProfiles(2)
  },
  
  rbacScenario: (role: string) => ({
    namespace: `test-rbac-${role}`,
    permissions: getPermissionsForRole(role),
    elements: generateElements(10)
  })
};
```

### Database Seeding
```typescript
// e2e/utils/db-seed.ts
export class TestDataManager {
  async seedForTest(testName: string) {
    const namespace = `test-${testName}-${Date.now()}`;
    
    await this.db.transaction(async (tx) => {
      await tx.vocabularies.create({ namespace, ...fixture });
      await tx.audit.log({ action: 'test_seed', namespace });
    });
    
    return { namespace, cleanup: () => this.cleanup(namespace) };
  }
  
  async cleanup(namespace: string) {
    await this.db.vocabularies.delete({ where: { namespace } });
  }
}
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Nx Optimized Test Pipeline
on: [push, pull_request]

jobs:
  affected-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: nrwl/nx-set-shas@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          cache: 'pnpm'
      
      - run: pnpm install --frozen-lockfile
      
      # Parallel affected tests
      - run: npx nx affected -t typecheck,lint,test --parallel=3
      
      # Integration tests for preview
      - if: github.event_name == 'pull_request'
        run: |
          BASE_URL=${{ steps.vercel.outputs.url }} \
          npx nx affected -t test:integration --parallel=2
      
      # Smoke tests for production
      - if: github.ref == 'refs/heads/main'
        run: |
          BASE_URL=https://iflastandards.info \
          npx nx e2e standards-dev --grep="@smoke"

  nx-agents:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        agent: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      - run: npx nx-cloud start-agent
```

### Nx Cloud Configuration
```json
{
  "nxCloudAccessToken": "...",
  "parallel": 4,
  "cacheableOperations": ["build", "test", "lint", "e2e"],
  "distributedExecutionEnabled": true,
  "agentsConfiguration": {
    "numberOfAgents": 4,
    "workloadDistribution": "even"
  }
}
```

## Performance Optimization

### Test Execution Optimization
```typescript
// Parallel test configuration
export default {
  projects: [
    {
      name: 'unit',
      testMatch: '**/*.test.ts',
      maxWorkers: '50%'
    },
    {
      name: 'integration',
      testMatch: '**/*.integration.test.ts',
      maxWorkers: 2
    },
    {
      name: 'e2e',
      testMatch: '**/*.e2e.test.ts',
      maxWorkers: 1 // Sequential for stability
    }
  ]
};
```

### Nx Affected Optimization
```bash
# Configure affected detection
nx g @nrwl/workspace:move --project portal --implicit-dependencies
nx affected:graph # Visualize dependencies

# Optimize test boundaries
nx g @nrwl/workspace:library-boundary-rules
```

## Test Maintenance

### Flaky Test Detection
```typescript
// playwright.config.ts
reporter: [
  ['@currents/playwright', {
    projectId: 'ifla-standards',
    recordKey: process.env.CURRENTS_RECORD_KEY,
    ci: {
      buildId: process.env.GITHUB_RUN_ID,
      sha: process.env.GITHUB_SHA
    }
  }]
]
```

### Test Quality Metrics
```yaml
Coverage Requirements:
  unit:
    statements: 80%
    branches: 80%
    functions: 80%
    lines: 80%
  
  integration:
    api_endpoints: 100%
    critical_paths: 100%
    error_scenarios: 90%
  
  e2e:
    user_journeys: 100%
    rbac_scenarios: 100%
    responsive_views: 2+

Performance Targets:
  unit_tests: <60s
  integration_tests: <15min
  e2e_tests: <20min
  smoke_tests: <5min
```

## Troubleshooting

### Common Issues and Solutions

1. **Flaky Clerk Authentication**
   ```typescript
   // Use global setup with retry
   await test.step('Authenticate with retry', async () => {
     await expect(async () => {
       await clerkAuth.signIn(credentials);
     }).toPass({ timeout: 30_000 });
   });
   ```

2. **Vercel Preview URL Issues**
   ```bash
   # Wait for deployment
   npx wait-on $VERCEL_URL --timeout 300000
   ```

3. **Nx Cache Misses**
   ```bash
   # Clear and rebuild cache
   nx reset
   nx run-many -t build --skip-nx-cache
   ```

4. **Parallel Test Conflicts**
   ```typescript
   // Use unique test namespaces
   const namespace = `test-${test.info().titlePath.join('-')}-${Date.now()}`;
   ```

## Future Enhancements

### Planned Improvements
1. **AI-Powered Test Generation**: Automatic test creation from user stories
2. **Visual Regression Testing**: Screenshot comparison with AI analysis
3. **Chaos Testing**: Automated failure injection
4. **Performance Profiling**: Integrated performance regression detection
5. **Test Impact Analysis**: ML-based test selection

### Testing Evolution Roadmap
- Q1 2025: Full Nx Cloud integration with distributed execution
- Q2 2025: AI-assisted test maintenance and generation
- Q3 2025: Real user monitoring correlation
- Q4 2025: Predictive test failure analysis

This Nx-optimized testing strategy ensures high-quality software delivery while dramatically reducing test execution time, maintenance overhead, and CI costs through intelligent test selection and parallel execution.