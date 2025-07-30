# Nx-Optimized E2E Test Strategy Implementation Plan

## Overview
This plan implements the PRD requirements for an Nx-optimized E2E test strategy while maintaining compatibility with the existing 5-level testing framework. The implementation will reduce E2E fragility, accelerate CI/CD feedback, leverage Nx capabilities for atomic testing, and integrate Clerk authentication workflows.

## Todo List

### High Priority
- [ ] **Task 1**: Create base Playwright configuration files for different test types
  - `playwright.config.base.ts` - Shared base configuration
  - `playwright.config.smoke.ts` - Smoke tests only (<5min)
  - `playwright.config.integration.ts` - Integration tests (<15min)
  - `playwright.config.e2e.ts` - Full E2E suite (<20min)
  - `playwright.config.ci.ts` - CI-specific optimizations

- [ ] **Task 2**: Update nx.json with optimized E2E configurations and test categorization
  - Add new namedInputs for test categorization (smoke, integration, e2e)
  - Configure targetDefaults for new test targets
  - Optimize caching strategies for E2E tests
  - Enable proper parallelization settings

- [ ] **Task 3**: Create test tagging infrastructure and helper utilities
  - Implement test tagging system using Playwright's grep feature
  - Tags: `@smoke`, `@integration`, `@e2e`, `@critical`, `@auth`, `@rbac`
  - Create helper utilities for tag-based test execution

- [ ] **Task 4**: Set up Clerk authentication fixtures and global setup
  - Create `e2e/playwright/clerk-setup.ts` for auth initialization
  - Implement test user management system
  - Per-test isolation with session cleanup
  - RBAC scenario fixtures

### Medium Priority
- [ ] **Task 5**: Create directory structure for smoke/integration/e2e tests
  ```
  e2e/
  ├── fixtures/
  │   ├── auth.fixture.ts         # Clerk auth fixtures
  │   ├── test-data.fixture.ts    # Test data management
  │   └── database.fixture.ts     # DB seeding/cleanup
  ├── smoke/
  │   ├── auth.spec.ts           # @smoke tests
  │   ├── dashboard.spec.ts
  │   └── api-health.spec.ts
  ├── integration/
  │   ├── rbac.spec.ts          # @integration tests
  │   ├── cross-service.spec.ts
  │   └── admin-flows.spec.ts
  ├── e2e/
  │   ├── user-journeys.spec.ts  # @e2e tests
  │   └── docs-navigation.spec.ts
  └── utils/
      ├── selectors.ts           # Robust selector strategies
      └── wait-helpers.ts        # Auto-waiting utilities
  ```

- [ ] **Task 6**: Update project.json with new test targets
  - Add test:smoke target
  - Add test:integration target
  - Update existing e2e target configurations

- [ ] **Task 7**: Create example tests for each category (smoke, integration, e2e)
  - Smoke test examples with @smoke tags
  - Integration test examples with @integration tags
  - E2E test examples with @e2e tags

- [ ] **Task 8**: Update package.json scripts for new test commands
  - Add scripts for smoke, integration, and e2e tests
  - Update pre-push and CI scripts

### Low Priority
- [ ] **Task 9**: Create documentation for new testing strategy
  - Update `/docs/testing/strategy.md`
  - Create migration guide
  - Document conventions and best practices

## Phase 1: Foundation Setup (Day 1-2)

### 1.1 Nx Configuration Enhancement
Update nx.json with optimized E2E configurations:
- Add new namedInputs for test categorization (smoke, integration, e2e)
- Configure targetDefaults for new test targets
- Optimize caching strategies for E2E tests
- Enable proper parallelization settings

### 1.2 Playwright Configuration Refactoring
Create multiple Playwright configs:
- `playwright.config.base.ts` - Shared base configuration
- `playwright.config.smoke.ts` - Smoke tests only (<5min)
- `playwright.config.integration.ts` - Integration tests (<15min)
- `playwright.config.e2e.ts` - Full E2E suite (<20min)
- `playwright.config.ci.ts` - CI-specific optimizations

### 1.3 Test Tagging Infrastructure
- Implement test tagging system using Playwright's grep feature
- Tags: `@smoke`, `@integration`, `@e2e`, `@critical`, `@auth`, `@rbac`
- Create helper utilities for tag-based test execution

## Phase 2: Test Structure Reorganization (Day 2-3)

### 2.1 Directory Structure
```
e2e/
├── fixtures/
│   ├── auth.fixture.ts         # Clerk auth fixtures
│   ├── test-data.fixture.ts    # Test data management
│   └── database.fixture.ts     # DB seeding/cleanup
├── smoke/
│   ├── auth.spec.ts           # @smoke tests
│   ├── dashboard.spec.ts
│   └── api-health.spec.ts
├── integration/
│   ├── rbac.spec.ts          # @integration tests
│   ├── cross-service.spec.ts
│   └── admin-flows.spec.ts
├── e2e/
│   ├── user-journeys.spec.ts  # @e2e tests
│   └── docs-navigation.spec.ts
└── utils/
    ├── selectors.ts           # Robust selector strategies
    └── wait-helpers.ts        # Auto-waiting utilities
```

### 2.2 Selector Strategy Enhancement
- Implement data-testid attributes across all components
- Create selector utility functions using:
  - `getByRole` for accessibility
  - `data-testid` for stability
  - Fallback to text content only when necessary

## Phase 3: Clerk Authentication Integration (Day 3-4)

### 3.1 Global Setup for Clerk
- Create `e2e/playwright/clerk-setup.ts` for auth initialization
- Implement test user management system
- Per-test isolation with session cleanup
- RBAC scenario fixtures

### 3.2 Auth Test Helpers
```typescript
// e2e/fixtures/auth.fixture.ts
export const authFixture = {
  loginAs: async (role: 'admin' | 'editor' | 'viewer') => {},
  createTestUser: async () => {},
  cleanupTestUser: async () => {},
  getSessionToken: async () => {}
};
```

## Phase 4: Nx Integration & Affected Logic (Day 4-5)

### 4.1 Project Configuration Updates
Update project.json files with new test targets:
```json
{
  "test:smoke": {
    "executor": "@nx/playwright:playwright",
    "options": {
      "config": "playwright.config.smoke.ts"
    }
  },
  "test:integration": {
    "executor": "@nx/playwright:playwright",
    "options": {
      "config": "playwright.config.integration.ts"
    }
  }
}
```

### 4.2 Affected Test Optimization
- Configure Nx to understand E2E test dependencies
- Implement smart test selection based on changed files
- Create custom Nx executor for optimized E2E runs

## Phase 5: CI/CD Pipeline Integration (Day 5-6)

### 5.1 GitHub Actions Workflows
**Preview Environment Workflow**:
- Run smoke tests on every push
- Run integration tests on Vercel preview URLs
- Parallel execution with Nx Cloud

**Production Deployment Workflow**:
- Mandatory smoke test gate
- Optional full E2E suite
- Flaky test detection and reporting

### 5.2 Environment-Specific Test Execution
- Implement environment detection in tests
- Configure BASE_URL dynamically
- Handle preview vs production API endpoints

## Phase 6: Test Optimization & Tooling (Day 6-7)

### 6.1 Performance Optimizations
- Implement test sharding for parallel execution
- Configure Nx Cloud for distributed test runs
- Add retry logic for flaky tests
- Optimize server startup/teardown

### 6.2 Reporting & Monitoring
- Integrate Playwright HTML reports
- Set up flaky test detection
- Create test execution dashboards
- Implement failure notifications

## Phase 7: Documentation & Migration (Day 7-8)

### 7.1 Documentation Updates
- Update `/docs/testing/strategy.md` with new approach
- Create migration guide for existing tests
- Document test conventions and best practices
- Add troubleshooting guide

### 7.2 Test Migration
- Refactor existing E2E tests to use new structure
- Apply tags to all tests
- Update selectors to use new strategy
- Validate coverage requirements

## Implementation Details

### Vitest Configuration Updates
- Create `vitest.config.integration.ts` for integration tests
- Update `vitest.config.nx.ts` to properly exclude tagged tests
- Configure test reporters for better CI integration

### Package.json Script Updates
```json
{
  "test:smoke": "nx affected --target=test:smoke",
  "test:integration": "nx affected --target=test:integration",
  "test:e2e:full": "nx affected --target=test:e2e",
  "test:pre-push": "pnpm test:unit && pnpm test:integration",
  "test:ci:preview": "pnpm test:smoke && pnpm test:integration"
}
```

### Quality Gates Implementation
- Pre-commit: Unit tests only (existing)
- Pre-push: Unit + Integration tests
- Preview Deploy: Smoke + Integration
- Production Deploy: Smoke tests (mandatory)

## Success Metrics
- Pre-push validation < 5 minutes
- Smoke tests 100% pass rate
- Integration tests 95% pass rate
- Full E2E 90% pass rate
- 50% reduction in flaky tests
- 70% faster CI feedback loops

## Next Steps
1. Create the foundational configuration files
2. Set up the test infrastructure
3. Implement Clerk authentication fixtures
4. Create example tests for each category
5. Update CI/CD pipelines
6. Provide migration scripts for existing tests

This implementation maintains backward compatibility while introducing the new optimized strategy, allowing for gradual migration of existing tests.