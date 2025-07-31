# Test Tagging Audit Summary - Phase 1

## Overview
This document summarizes the current state of test tagging across the IFLA Standards Platform and provides updated standards for Phase 1 of the Testing Standards Compliance Implementation Plan.

## Current State Analysis

### Files Audited
- **E2E Tests**: `e2e/smoke/api-health.smoke.spec.ts`, `e2e/integration/build-validation.integration.spec.ts`, `superadmin-dashboard.e2e.spec.ts`
- **Unit Tests**: `apps/admin/src/test/lib/rbac.test.ts`, `scripts/port-manager.test.ts`
- **Theme Tests**: `packages/theme/src/tests/scripts/vocabulary-comparison.test.ts`
- **Example Files**: `examples/tests/*.ts`

### Current Tagging Patterns

#### ✅ Well-Tagged Files (E2E with Playwright)
- **Smoke Tests**: Use `@smoke @api @critical` appropriately
- **Integration Tests**: Apply `@build @validation @critical @portal @security @deployment @navigation` with environment tags
- **Environment-specific**: `@local-only`, `@preview`, `@production`

#### ❌ Missing Tags (Non-Playwright Tests)
- **Vitest Unit Tests**: No tagging system applied
- **Utility Tests**: Lack categorization tags
- **RBAC Tests**: Missing `@unit @rbac @security` tags

## Updated Tagging Standards

### Core Test Category Tags (Required)
- `@unit` - Unit tests (isolated, fast, mocked dependencies)
- `@integration` - Integration tests (component interactions)
- `@e2e` - End-to-end tests (full user workflows)
- `@smoke` - Smoke tests (basic functionality validation)

### Functional Domain Tags (Recommended)
- `@api` - API-focused tests
- `@validation` - Data validation tests
- `@security` - Security-related tests
- `@authentication` - Auth/login tests
- `@navigation` - UI navigation tests
- `@rbac` - Role-based access control tests
- `@portal` - Portal-specific functionality
- `@deployment` - Deployment/build validation

### Priority Tags (Recommended)
- `@critical` - Critical path tests (must run in all environments)
- `@happy-path` - Standard success scenarios
- `@error-handling` - Error condition tests

### Environment Tags (As Needed)
- `@local-only` - Tests that only run locally
- `@ci-only` - CI-specific tests
- `@preview` - Preview environment tests
- `@production` - Production environment tests

## Implementation Examples

### Unit Test Tagging
```typescript
describe('IFLAElementValidator - Unit Tests @unit @validation', () => {
  // Test implementation
});
```

### Integration Test Tagging
```typescript
integrationTest.describe('Vocabulary Import Service Integration @integration @api', () => {
  integrationTest('should complete vocabulary import workflow @critical @happy-path', async () => {
    // Test implementation
  });
  
  integrationTest('should handle validation failures gracefully @error-handling', async () => {
    // Test implementation
  });
});
```

### E2E Test Tagging
```typescript
e2eTest.describe('User Journey - Complete Workflow @login-flow', () => {
  e2eTest('User can navigate from login to dashboard @critical @authentication @navigation', async ({ page }) => {
    // Test implementation
  });
});
```

## Files Requiring Tag Updates

### High Priority (Core Functionality)
1. `apps/admin/src/test/lib/rbac.test.ts` → Add `@unit @rbac @security`
2. `scripts/port-manager.test.ts` → Add `@unit @utility`
3. `packages/theme/src/tests/scripts/vocabulary-comparison.test.ts` → Add `@unit @api @validation`

### Medium Priority (Supporting Tests)
1. All untagged unit tests in `apps/*/src/test/`
2. Integration tests missing category tags
3. E2E tests with incomplete functional tags

### Low Priority (Nice to Have)
1. Environment-specific tag refinement
2. Priority tag assignment for non-critical tests

## Next Steps (Task 1.2-1.4)

### Task 1.2: Identify Missing Tags
- Run automated scan for tests without required category tags
- Generate list of files needing updates
- Prioritize by test importance and frequency of execution

### Task 1.3: Create Tag Update Scripts
- Develop automated tagging scripts for batch updates
- Create validation scripts to ensure tag consistency
- Set up pre-commit hooks to enforce tagging standards

### Task 1.4: Apply Tags to All Tests
- Execute batch updates using priority order
- Validate tag application
- Update CI/CD pipelines to use new tag-based test selection
- Document tag usage in project README

## Tag Usage Commands

### Running Tests by Category
```bash
# Run only unit tests
pnpm test --grep "@unit"

# Run critical tests only
pnpm test --grep "@critical"

# Run API-related tests
pnpm test --grep "@api"

# Run tests excluding local-only
pnpm test --grep "(?!.*@local-only)"
```

### Playwright-Specific Tag Usage
```bash
# Run smoke tests only
npx playwright test --grep "@smoke"

# Run critical e2e tests
npx playwright test --grep "@critical.*@e2e"

# Skip production-only tests in local dev
npx playwright test --grep "(?!.*@production)"
```

## Benefits of This Tagging System

1. **Selective Test Execution**: Run only relevant tests based on context
2. **CI/CD Optimization**: Different pipeline stages can run different test sets
3. **Developer Productivity**: Focus on specific test categories during development
4. **Quality Assurance**: Ensure critical tests always run
5. **Documentation**: Tags serve as living documentation of test purpose
6. **Debugging**: Easier to identify and run failing test categories

## Compliance Metrics

### Target Metrics for Phase 1 Completion
- **100%** of test files have at least one category tag (`@unit`, `@integration`, `@e2e`, `@smoke`)
- **90%** of critical path tests tagged with `@critical`
- **80%** of tests have functional domain tags
- **75%** of environment-specific tests properly tagged

### Success Criteria
- [ ] All example files updated with comprehensive tagging
- [ ] Batch update scripts created and tested
- [ ] CI/CD pipelines configured for tag-based execution
- [ ] Documentation updated with tagging standards
- [ ] Pre-commit hooks enforcing tag requirements
