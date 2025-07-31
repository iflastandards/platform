# E2E Testing Framework Guide

This guide explains the new Nx-optimized E2E testing framework that implements atomic, tag-based testing with Playwright.

## Table of Contents
1. [Overview](#overview)
2. [Test Categories](#test-categories)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Tagging System](#tagging-system)
6. [CI/CD Integration](#cicd-integration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

The new E2E testing framework is designed to:
- Reduce test fragility and maintenance overhead
- Accelerate CI/CD feedback loops  
- Enable atomic, focused testing
- Integrate seamlessly with Nx's affected commands
- Support different testing environments (local, preview, production)

### Key Features
- **Tag-based categorization**: Run specific test types using tags
- **Nx affected integration**: Only run tests for changed projects
- **Multiple test speeds**: Smoke (<5min), Integration (<15min), Full E2E (<20min)
- **Clerk authentication**: Built-in support for RBAC testing
- **Parallel execution**: Leverages Nx agents for faster runs

## Test Categories

### Smoke Tests (🏃 <5 minutes)
Quick validation tests that verify basic functionality is working.
- **Pass Rate Target**: 100%
- **No retries allowed**
- **Run frequently during development**

```bash
# Run all smoke tests
pnpm test:e2e:smoke

# Run only affected smoke tests
pnpm test:e2e:smoke:affected
```

### Integration Tests (🚶 <15 minutes)
Tests that verify interactions between different services and components.
- **Pass Rate Target**: 95%
- **1 retry allowed**
- **Database seeding included**

```bash
# Run all integration tests
pnpm test:e2e:integration

# Run only affected integration tests  
pnpm test:e2e:integration:affected
```

### Full E2E Tests (🐌 <20 minutes)
Complete end-to-end workflows including complex user journeys.
- **Pass Rate Target**: 90%
- **2 retries allowed**
- **Sequential execution for stability**

```bash
# Run full E2E suite
pnpm test:e2e:full

# Run only affected E2E tests
pnpm test:e2e:full:affected
```

## Running Tests

### Quick Start Commands

```bash
# For development - run smoke tests for changed code
pnpm test:e2e:smoke:affected

# Before pushing - run integration tests
pnpm test:pre-push:integration

# Debug with UI mode
pnpm test:e2e:ui

# Run tests by tag
pnpm test:e2e:tags @critical
pnpm test:e2e:tags @auth
pnpm test:e2e:tags @rbac
```

### Browser Testing

By default, all tests run in headless Chrome for speed and consistency. For comprehensive browser testing:

```bash
# Run tests in all browsers (Chrome, Firefox, Safari, Edge)
pnpm test:e2e:browsers

# Run tests in specific browsers
pnpm test:e2e:firefox
pnpm test:e2e:safari
pnpm test:e2e:edge

# Run smoke tests in all browsers
pnpm test:e2e:smoke:browsers
```

### CI-Specific Commands

```bash
# Quick CI validation (smoke only)
pnpm test:ci:quick

# Standard CI validation (smoke + integration)
pnpm test:ci:standard  

# Full CI validation (all test types)
pnpm test:ci:full
```

### Tag-Based Testing

Run specific tests using tags:

```bash
# Critical tests only
pnpm test:e2e:critical

# Authentication tests
pnpm test:e2e:auth

# RBAC tests  
pnpm test:e2e:rbac

# Performance tests
pnpm test:e2e:perf

# Custom tag combinations
pnpm test:e2e:tags "@smoke and @api"
pnpm test:e2e:tags "@integration and not @slow"
```

### Utility Commands

```bash
# See all available test commands
pnpm test:help

# Analyze and categorize existing tests
pnpm test:e2e:categorize

# Explain the testing strategy
pnpm test:explain-strategy
```

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '../utils/tagged-test';
import { tags } from '../utils/test-tags';

test.describe('Feature Name @smoke @ui', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Using Tagged Test Helpers

```typescript
import { smokeTest, integrationTest, e2eTest } from '../utils/tagged-test';

// Smoke test - auto-tagged with @smoke
smokeTest('quick validation', async ({ page }) => {
  // Fast test logic
});

// Integration test - auto-tagged with @integration  
integrationTest('service interaction', async ({ page }) => {
  // Cross-service test logic
});

// Full E2E test - auto-tagged with @e2e
e2eTest('complete workflow', async ({ page }) => {
  // End-to-end workflow
});
```

### Using Tag Builder

```typescript
import { tags } from '../utils/test-tags';

test(`critical auth flow ${tags().critical().auth().build()}`, async ({ page }) => {
  // Test implementation
});

test(`slow performance test ${tags().performance().slow().build()}`, async ({ page }) => {
  // Performance test
});
```

### Authentication Tests (TODO: Pending Clerk Setup)

```typescript
import { authFixture } from '../fixtures/auth.fixture';

test('admin access', async ({ page }) => {
  // TODO: Implement once Clerk is configured
  // await authFixture.loginAs('admin');
  // await page.goto('/admin');
  // await expect(page.locator('h1')).toContainText('Admin Dashboard');
});
```

## Tagging System

### Available Tags

| Tag | Description | Usage |
|-----|-------------|-------|
| `@smoke` | Quick validation tests | Core functionality checks |
| `@integration` | Cross-service tests | API interactions, data flow |
| `@e2e` | Full workflows | Complete user journeys |
| `@critical` | Must-pass tests | Business-critical paths |
| `@auth` | Authentication tests | Login, logout, sessions |
| `@rbac` | Role-based access | Permission testing |
| `@api` | API tests | Backend endpoints |
| `@ui` | UI tests | Frontend interactions |
| `@performance` | Performance tests | Speed, load testing |
| `@slow` | Long-running tests | Tests >30s |
| `@flaky` | Known flaky tests | Temporarily unstable |

### Tag Combinations

Tests can have multiple tags:

```typescript
test.describe('Admin Dashboard @integration @ui @auth', () => {
  // Tests inherit all three tags
});
```

## CI/CD Integration

### GitHub Actions Integration

The framework integrates with GitHub Actions through different workflows:

1. **PR Checks**: Runs smoke + affected integration tests
2. **Preview Deployment**: Runs integration tests  
3. **Production Deployment**: Runs full E2E suite

### Nx Cloud Integration

- Distributed test execution across agents
- Caching of test results
- Parallel execution optimization

### Environment-Specific Testing

```bash
# Local development
BASE_URL=http://localhost:3000 pnpm test:e2e:smoke

# Preview environment
BASE_URL=https://preview.site.com pnpm test:e2e:integration

# Production
BASE_URL=https://production.site.com pnpm test:e2e:full
```

## Best Practices

### 1. Test Organization

- Place tests in appropriate directories:
  - `e2e/smoke/` - Quick validation tests
  - `e2e/integration/` - Service interaction tests  
  - `e2e/e2e/` - Full workflow tests

### 2. Tag Usage

- Always tag your tests appropriately
- Use multiple tags when relevant
- Add `@critical` to business-critical tests
- Mark known issues with `@flaky`

### 3. Test Writing

- Keep smoke tests under 10 seconds each
- Use data attributes for reliable selectors
- Implement proper waiting strategies
- Clean up test data after runs

### 4. Performance

- Run affected tests during development
- Use parallel execution in CI
- Leverage Nx caching
- Monitor test execution times

### 5. Debugging

- Use `test.only` for focused debugging
- Enable traces for failed tests
- Use Playwright UI mode for visual debugging
- Check videos/screenshots on failures

## Troubleshooting

### Common Issues

#### Tests Running Too Slowly
- Check if you're using the correct test category
- Ensure parallel execution is enabled
- Verify Nx daemon is running

#### Flaky Tests
- Add proper wait conditions
- Check for race conditions  
- Use `test.retry()` for known issues
- Tag with `@flaky` temporarily

#### Authentication Issues
- Clerk setup is pending (Task #4)
- Use `test.skip()` for auth-dependent tests
- Mock authentication in development

#### Port Conflicts
```bash
# Kill all test server ports
pnpm ports:kill
```

### Debug Commands

```bash
# Run with UI mode for debugging
pnpm test:e2e:ui

# Run specific test file
npx playwright test e2e/smoke/auth.smoke.spec.ts

# Run with debug flag
DEBUG=pw:api pnpm test:e2e:smoke

# Generate report
npx playwright show-report
```

## Migration Guide

If you have existing tests, migrate them gradually:

1. Add appropriate tags to existing tests
2. Move tests to correct directories
3. Update imports to use `tagged-test`
4. Replace hard-coded waits with proper conditions
5. Add data attributes for selectors

Example migration:

```typescript
// Before
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  // test logic
});

// After  
import { integrationTest, expect } from '../utils/tagged-test';

integrationTest('login flow @auth @critical', async ({ page }) => {
  // test logic
});
```

## Next Steps

1. **Clerk Authentication**: Implement auth fixtures (Task #4)
2. **Add More Tests**: Expand test coverage using the framework
3. **Monitor Performance**: Track test execution times
4. **Optimize Further**: Identify and improve slow tests
5. **Documentation**: Keep this guide updated with new patterns

---

## Browser Testing Implementation

### Overview
The framework defaults to Chrome-only testing for speed and consistency, with the ability to run comprehensive multi-browser tests on demand.

### Default Behavior
- All test configurations default to **headless Chrome only**
- Benefits:
  - 3-4x faster test execution
  - More consistent results
  - Lower resource usage
  - Better CI/CD performance

### Multi-Browser Testing Commands

```bash
# Run all tests in all browsers
pnpm test:e2e:browsers

# Run smoke tests in all browsers
pnpm test:e2e:browsers:smoke

# Run in specific browsers
pnpm test:e2e:firefox
pnpm test:e2e:safari
pnpm test:e2e:edge
```

### Browser Configuration
The `playwright.config.browsers.ts` includes:
- **Desktop Chrome** (Windows, macOS, Linux)
- **Desktop Firefox** (Windows, macOS, Linux)
- **Desktop Safari** (macOS only)
- **Microsoft Edge**
- **Mobile Chrome** (Android)
- **Mobile Safari** (iOS)

### Performance Comparison
- **Chrome-only**: ~5-10 minutes for full suite
- **All browsers**: ~20-30 minutes for full suite
- **Recommendation**: Use Chrome-only for development, all browsers for release testing

---

## Cross-Site Authentication Testing

### Overview
Comprehensive testing of authentication communication between admin-portal and documentation sites, ensuring login/logout status is properly synchronized.

### Test Coverage

1. **Admin Login Status Reflection**
   - Verifies login in admin portal reflects in documentation site navbar
   - Tests session cookie sharing and API communication

2. **Admin Logout Status Reflection**
   - Ensures logout from admin portal updates documentation site
   - Validates session cleanup across sites

3. **Cross-Tab Authentication Synchronization**
   - Tests localStorage-based communication between tabs
   - Verifies storage events trigger UI updates

4. **Authentication State Persistence**
   - Validates authentication survives page reloads
   - Tests session cookie persistence

5. **Error Handling**
   - Tests graceful fallback for invalid/expired sessions
   - Ensures no error messages shown to users

### Implementation Details

#### Authentication Mocking
```typescript
// Mock NextAuth session cookie
await context.addCookies([
  {
    name: 'next-auth.session-token',
    value: 'mock-site-admin-session',
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
  },
]);
```

#### Cross-Tab Communication
```typescript
// Simulate localStorage-based communication
const authStatus = {
  isAuthenticated: true,
  username: 'Test Admin',
  teams: ['site-admin'],
  loading: false
};
localStorage.setItem('authStatus', JSON.stringify(authStatus));

// Dispatch storage event for cross-tab communication
window.dispatchEvent(new StorageEvent('storage', {
  key: 'authStatus',
  newValue: JSON.stringify(authStatus)
}));
```

### Running Cross-Site Auth Tests

```bash
# Run only cross-site auth tests
npx playwright test e2e/admin-portal/cross-site-auth-communication.e2e.test.ts

# Run with UI for debugging
npx playwright test e2e/admin-portal/cross-site-auth-communication.e2e.test.ts --ui

# Run specific test case
npx playwright test -g "should reflect admin login status"
```

### Architecture Tested
```
Admin Portal (NextAuth.js) 
    ↓ (authentication)
Session Cookie + /api/auth/session
    ↓ (HTTP requests)
useAdminSession hook (docusaurus)
    ↓ (React state + localStorage)
AuthDropdownNavbarItem (navbar)
    ↓ (storage events)
Cross-tab synchronization
```

---

For more information, see:
- [Product Requirements Document](./Product%20Requirements%20Document%20(PRD)_%20Nx-Optimized.md)
- [Testing Strategy](./TESTING_STRATEGY.md)
- [Implementation Plan](./NX_E2E_IMPLEMENTATION_PLAN.md)