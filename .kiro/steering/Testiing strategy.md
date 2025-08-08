---
inclusion: always
---

# Testing Strategy

## Overview

The IFLA Standards Platform implements a comprehensive multi-layered testing approach to ensure reliability across all sites and components. This document defines testing patterns, conventions, and requirements for AI assistants working with this codebase.

## Key Testing Principles

1. **Test-Driven Development**: Write tests before implementing features
2. **Multi-Environment Testing**: Validate across local, preview, and production environments
3. **Performance-Focused**: Optimize test execution with Nx affected detection
4. **Cross-Site Validation**: Ensure navigation and linking between standards sites works correctly
5. **Accessibility Compliance**: All components must pass WCAG 2.1 AA standards

## Test Groups

### 1. Selective Tests (Development Focus)

**Purpose**: Fast feedback during development
**Command**: `pnpm test` or `nx affected --target=test`
**When to Use**: During active development, for quick validation

```bash
# Recommended for AI assistants during development
nx affected --target=test              # Test only changed projects
nx test <project-name>                 # Test specific project
```

### 2. Comprehensive Tests (Release Focus)

**Purpose**: Full validation before releases
**Command**: `pnpm test:comprehensive`
**When to Use**: After completing major features or before releases

### 3. Pre-Commit/Pre-Push Tests (Git Hooks)

**Purpose**: Prevent broken code from being committed/pushed
**Commands**: Automatically triggered by Git hooks
**When to Use**: Let these run automatically, don't bypass

## Testing Architecture

### Unit Testing (Vitest)

**File Pattern**: `*.test.ts`, `*.spec.ts` co-located with source files
**Coverage Target**: >80% for critical paths

```typescript
// Required test structure
describe('ComponentName', () => {
  it('should handle expected behavior', () => {
    // Arrange, Act, Assert pattern required
  });
});
```

### Scripts Testing

**Purpose**: Isolated testing for utility scripts
**Location**: `scripts/` directory with dedicated Nx project configuration
**Configuration**: `scripts/vitest.config.ts` - Separate from main test suite

**Key Features**:
- Only runs tests when scripts themselves change (Nx affected detection)
- Isolated from main test suite for faster pre-commit hooks
- Dedicated npm scripts for convenience

**Commands**:
```bash
pnpm test:scripts              # Run all script tests
pnpm test:scripts:affected     # Run only affected script tests
pnpm test:scripts:file <path>  # Run a specific test file
pnpm test:scripts:watch        # Run tests in watch mode
pnpm test:scripts:coverage     # Run tests with coverage
```

**Usage Pattern**:
```bash
# Run a script directly
pnpm tsx scripts/your-script.ts

# Test a script
pnpm test:scripts:file scripts/your-script.test.ts
```

### Global Mocks

**Location**: Centralized in `packages/theme/src/tests/__mocks__/` directory
**Purpose**: Provide consistent mock implementations across all tests
**Usage**: Automatically loaded via Vitest setup files

```typescript
// Example of using global mocks in tests
// No need to define local mocks for these modules
import { render } from '@testing-library/react';
import MyComponent from './MyComponent';

// Global mocks for Docusaurus components are already configured
// in packages/theme/src/tests/setup.ts
describe('MyComponent', () => {
  it('renders correctly with mocked dependencies', () => {
    const { container } = render(<MyComponent />);
    // Your assertions here
  });
});
```

**Key Global Mocks**:
- Docusaurus components (`@docusaurus/Link`, `@theme/Tabs`, etc.)
- Docusaurus hooks (`useDocusaurusContext`, `useBaseUrl`, etc.)
- Router functionality (`@docusaurus/router`)
- Theme utilities (`@docusaurus/theme-common`)

**Setup Files**:
- Main setup: `packages/theme/src/tests/setup.ts`
- Admin setup: `apps/admin/src/test/setup.ts`
- MUI setup: `packages/theme/src/tests/setup/mui-setup.ts`

### Integration Testing (Playwright)

**Location**: `e2e/` directory
**Key Files**:
- `e2e/site-validation.spec.ts`: Validates all site builds
- `e2e/vocabulary-functionality.spec.ts`: Tests vocabulary features
- `e2e/admin/*.spec.ts`: Admin portal tests

### Build Regression Testing

**Purpose**: Ensure all sites build successfully
**Scripts**: 
- `scripts/test-site-builds.js`: Full build testing
- `scripts/test-site-builds-affected.js`: Optimized testing

## AI Assistant Testing Guidelines

### When Adding New Features

1. **Create Test Files First**: Implement tests before writing feature code
2. **Test All Environments**: Verify with different DOCS_ENV values
3. **Run Affected Tests**: Use `nx affected --target=test` to validate changes
4. **Validate Builds**: Run `pnpm test:builds:affected` before completing

### When Modifying Existing Code

1. **Run Existing Tests First**: Ensure you understand current behavior
2. **Update Tests With Changes**: Keep tests in sync with implementation
3. **Check Cross-Site Impact**: Test navigation between sites if URLs change
4. **Verify in Multiple Browsers**: Test in Chrome, Firefox, and mobile views

### Required Test Coverage

| Component Type | Min Coverage | Test Focus |
|----------------|-------------|------------|
| UI Components  | 80% | User interactions, accessibility |
| Utilities      | 90% | Edge cases, error handling |
| API Endpoints  | 85% | Response formats, error states |
| Config Files   | 70% | Environment variations |

## Test Data Management

- Use fixtures from `fixtures/` directory
- Maintain realistic but anonymized test data
- Include edge cases in test scenarios
- Follow existing patterns for mock data structure

## Authentication Testing

### Test Users

The platform includes predefined test users with different permission levels for authentication testing:

| Email | Role | Permissions |
|-------|------|------------|
| translator+clerk_test@example.com | Project Translator | Translation-related permissions |
| author+clerk_test@example.com | Project Author/Reviewer | Content creation and review |
| editor+clerk_test@example.com | Project Editor | Content editing and management |
| superadmin+clerk_test@example.com | Super Admin | Full system access |
| rg_admin+clerk_test@example.com | Review Group Admin | Review group management |

### Authentication Rules

- All `/admin` routes require authentication except those defined as public in `apps/admin/src/middleware.ts`
- All API endpoints require authentication except for specific public endpoints
- Public routes include:
  - `/` (Public home page)
  - `/request-invite` (Invitation request page)
  - `/api/auth/callback` (Auth callback API)
  - `/api/request-invite` (Request invite API)
  - `/api/hello` (Test API)
  - `/api/health` (Health check endpoint)

### Testing Authentication

**Important Notes**:
- Authentication mocks are deprecated in favor of using real test users
- Test users only work in the local (dev) environment
- The standard authentication code for all test users is **424242**

When writing tests that require authentication:

1. **Unit Tests**: Use the real test users listed above rather than authentication mocks
2. **API Tests**: Include proper authentication headers or tokens for the appropriate test user
3. **E2E Tests**: Use Playwright's authentication helpers to log in with the appropriate test user and code "424242"
4. **Authorization Tests**: Verify both positive (allowed) and negative (denied) permission scenarios

## Common Testing Commands

```bash
# Primary commands for AI assistants
pnpm test                             # Test affected projects
pnpm test:e2e                         # Run E2E tests
pnpm test:builds:affected             # Test affected site builds
pnpm test:visual                      # Run visual regression tests

# Debugging commands
npx playwright test --headed          # Run E2E tests with browser visible
npx vitest --ui                       # Open Vitest UI for debugging
```

## Troubleshooting Test Failures

### Test Integrity Guidelines

- **When tests fail, assume the test is correct and the code needs to be fixed**, especially for new code
- **Never modify tests just to make them pass** - this defeats the purpose of testing
- **Never hard-code expected results** unless those results truly cannot vary
- **Be especially careful with basePath and baseUrl tests** - these must remain dynamic
- For regression testing, evaluate whether code or environment changes necessitate test updates
- Use your judgment, but prioritize maintaining test integrity over quick fixes

### Common Issues and Solutions

1. **Build Failures**
   - Check environment variables in `packages/theme/src/config`
   - Verify imports use correct paths
   - Ensure dependencies are installed

2. **E2E Test Failures**
   - Run with `--headed` flag to observe browser behavior
   - Check for timing issues with `await` statements
   - Verify test selectors match current DOM structure

3. **Unit Test Failures**
   - Verify mock configurations match actual dependencies
   - Check for test isolation issues
   - Ensure async operations complete before assertions

## Performance Optimization

- Use `--parallel=3` flag for faster execution
- Leverage Nx cache for faster builds
- Focus on affected tests during development
- Run comprehensive tests only before releases

## Mandatory Testing Requirements

### Performance Targets

1. **Pre-commit target**: < 60 seconds (use `nx affected`)
2. **Use 5-level strategy**: Selective → Comprehensive → Pre-commit → Pre-push → CI
3. **Always use `nx affected`** for development testing
4. **Parallel execution**: `--parallel=3` for performance
5. **Speed targets**:
   - Selective: <30s
   - Pre-commit: <60s
   - Pre-push: <180s

### Pre-Development Checklist

Before starting any code or test work:

- [ ] Check if basePath applies (use root-relative paths like `/dashboard`)
- [ ] Choose appropriate test level (usually selective/affected)
- [ ] Verify API calls use `addBasePath()` utility
- [ ] Use `nx affected` instead of running everything