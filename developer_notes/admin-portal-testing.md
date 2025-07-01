# Admin Portal Testing Guide

## Overview

The Admin Portal is a Next.js 15.2.5 application with comprehensive testing infrastructure built on Nx, Vitest, and Playwright. It provides administrative management for IFLA standards sites with full GitHub OAuth integration.

## Architecture

- **Framework**: Next.js 15.2.5 with App Router
- **Authentication**: NextAuth.js v4.24.11 with GitHub OAuth
- **Testing**: Vitest for unit/integration, Playwright for E2E
- **Port**: 3007 (development), 4200 (production build)
- **Testing Target**: Uses 'newtest' site (port 3008) for realistic E2E testing

## Test Types

### Unit Tests
**Purpose**: Test components, utilities, and business logic in isolation
**Location**: `apps/admin-portal/src/test/components/`
**Framework**: Vitest + React Testing Library
**Command**: `nx run admin-portal:test:unit`

```bash
# Run unit tests only (fast feedback)
nx run admin-portal:test:unit

# Watch mode for TDD
nx run admin-portal:test:watch

# With coverage reporting
nx run admin-portal:test:coverage
```

**What's Tested**:
- React component rendering and behavior
- User interaction handlers (clicks, form submissions)
- Component prop validation and edge cases
- Utility functions and helpers
- Authentication logic (mocked)

### Integration Tests
**Purpose**: Test component workflows with external dependencies
**Location**: `apps/admin-portal/src/test/integration/`
**Framework**: Vitest with API mocking
**Command**: `nx run admin-portal:test:integration`

```bash
# Run integration tests only
nx run admin-portal:test:integration

# All tests (unit + integration)
nx test admin-portal
```

**What's Tested**:
- API interactions with GitHub
- Site management workflows
- Authentication flows with NextAuth
- Cross-component data flow
- Form submission and validation

### E2E Tests
**Purpose**: Test complete user workflows in real browser
**Location**: `e2e/admin-portal/`
**Framework**: Playwright with newtest site as target
**Command**: `nx run admin-portal:e2e`

```bash
# Run E2E tests
nx run admin-portal:e2e

# Run with Playwright UI
playwright test --project=admin-portal --ui

# Debug mode
playwright test --project=admin-portal --debug
```

**What's Tested**:
- Authentication and authorization flows
- Navigation between admin-portal and newtest site
- Complete site management workflows
- Cross-site integration (newtest ↔ admin-portal)
- Browser compatibility and accessibility

## Test Configuration

### Vitest Configuration
**File**: `apps/admin-portal/vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/*.e2e.{test,spec}.{js,ts,jsx,tsx}']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/test': resolve(__dirname, './src/test'),
    },
  },
});
```

### Playwright Configuration
**File**: `playwright.config.ts` (admin-portal project)

```typescript
{
  name: 'admin-portal',
  use: { ...devices['Desktop Chrome'] },
  testMatch: '**/e2e/admin-portal/**/*.e2e.test.ts',
  webServer: [
    {
      command: 'nx start newtest',
      url: 'http://localhost:3008',
    },
    {
      command: 'nx serve admin-portal',
      url: 'http://localhost:3007',
    },
  ],
}
```

## Test Utilities

### Mocks and Fixtures
**Location**: `apps/admin-portal/src/test/`

```
src/test/
├── fixtures/
│   └── mockData.ts          # Test data (sessions, sites, GitHub)
├── mocks/
│   ├── api.ts              # API response mocks
│   └── components.tsx      # React component mocks
└── setup.ts                # Test environment setup
```

### Mock Data Examples
```typescript
// Mock authenticated session
export const mockSession: Session = {
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock site data
export const mockSiteData = {
  newtest: {
    siteKey: 'newtest',
    title: 'New Test Site',
    code: 'NEWTEST',
    status: 'development',
  },
};
```

### API Mocking
```typescript
// Setup global fetch mock
setupFetchMock();

// Mock specific API responses
mockApiCall('/api/sites/newtest', mockSiteData.newtest);
mockApiError('/api/invalid', 'Not found', 404);
```

## Testing Workflow

### Development Workflow
```bash
# 1. Start development servers
nx start newtest           # Testing target site
nx serve admin-portal      # Admin portal

# 2. Run tests during development
nx run admin-portal:test:watch    # TDD with watch mode

# 3. Run full test suite before commits
nx test admin-portal              # All unit + integration tests
nx run admin-portal:e2e          # E2E validation
```

### CI/CD Integration
```bash
# Pre-commit (automatic)
nx affected --target=test:unit    # Fast unit tests

# Pre-push (automatic)
nx test admin-portal              # Full test suite

# CI Pipeline
nx run admin-portal:e2e          # E2E validation in CI
```

## Writing Tests

### Unit Test Example
```typescript
// apps/admin-portal/src/test/components/SiteManagementClient.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import SiteManagementClient from '@/app/dashboard/[siteKey]/SiteManagementClient';

describe('SiteManagementClient', () => {
  it('should render site management interface', () => {
    render(
      <SiteManagementClient 
        siteTitle="Test Site"
        siteCode="TEST"
        siteKey="newtest"
      />
    );
    
    expect(screen.getByText('Test Site Management')).toBeInTheDocument();
  });

  it('should switch tabs when clicked', async () => {
    render(<SiteManagementClient {...props} />);
    
    fireEvent.click(screen.getByText('Content'));
    
    await waitFor(() => {
      expect(screen.getByText('Content Management')).toBeVisible();
    });
  });
});
```

### Integration Test Example
```typescript
// apps/admin-portal/src/test/integration/site-management.integration.test.tsx
import { auth } from '@/app/api/auth/auth';
import { mockSession } from '../fixtures/mockData';

vi.mock('@/app/api/auth/auth', () => ({
  auth: vi.fn(),
}));

describe('Site Management Integration', () => {
  beforeEach(() => {
    (auth as any).mockResolvedValue(mockSession);
    setupFetchMock();
  });

  it('should load site data from API', async () => {
    mockApiCall('/api/sites/newtest', mockSiteData.newtest);
    
    render(<SiteManagementClient siteKey="newtest" />);
    
    await waitFor(() => {
      expect(screen.getByText('New Test Site Management')).toBeInTheDocument();
    });
  });
});
```

### E2E Test Example
```typescript
// e2e/admin-portal/site-management-workflow.e2e.test.ts
import { test, expect } from '@playwright/test';

test('should navigate from newtest to admin portal', async ({ page }) => {
  // Start at newtest site
  await page.goto('http://localhost:3008');
  await expect(page.getByText('New Test Site')).toBeVisible();
  
  // Navigate to admin portal
  await page.goto('http://localhost:3007/dashboard/newtest');
  await expect(page.getByText('New Test Site Management')).toBeVisible();
});
```

## Performance Targets

- **Unit Tests**: < 10 seconds (fast feedback)
- **Integration Tests**: < 30 seconds (API interactions)
- **E2E Tests**: < 60 seconds (full workflows)
- **Coverage Target**: > 80% for critical paths

## Troubleshooting

### Common Issues

**1. Authentication Mock Issues**
```bash
# Clear auth mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
```

**2. API Mock Conflicts**
```bash
# Reset fetch mocks
afterEach(() => {
  cleanupFetchMock();
});
```

**3. E2E Server Startup**
```bash
# Manual server start if auto-start fails
nx start newtest &
nx serve admin-portal &
playwright test --project=admin-portal
```

**4. Port Conflicts**
```bash
# Kill conflicting processes
pnpm ports:kill
# or for specific ports
lsof -ti:3007,3008 | xargs kill -9
```

### Debug Commands
```bash
# Debug unit tests
nx run admin-portal:test:watch --ui

# Debug E2E tests  
playwright test --project=admin-portal --debug --headed

# Inspect test coverage
nx run admin-portal:test:coverage
open coverage/index.html
```

## Quick Reference

### Essential Commands
```bash
# Development
nx serve admin-portal                   # Start dev server
nx start newtest                       # Start test target

# Testing  
nx test admin-portal                   # All tests
nx run admin-portal:test:unit         # Unit tests only
nx run admin-portal:test:integration  # Integration tests only
nx run admin-portal:e2e               # E2E tests

# Development workflow
nx run admin-portal:test:watch        # TDD mode
nx run admin-portal:test:coverage     # With coverage

# Convenience scripts (package.json)
pnpm test:admin-portal               # All tests
pnpm test:admin-portal:unit         # Unit tests only
pnpm test:admin-portal:e2e          # E2E tests only
```

### Test File Patterns
- Unit: `*.test.tsx` in `src/test/components/`
- Integration: `*.integration.test.tsx` in `src/test/integration/`
- E2E: `*.e2e.test.ts` in `e2e/admin-portal/`

### Key Testing Principles
1. **Fast Feedback**: Unit tests provide immediate validation
2. **Realistic Integration**: Integration tests use mocked external services
3. **End-to-End Confidence**: E2E tests validate complete user workflows
4. **Isolation**: Each test is independent and repeatable
5. **Real Environment**: E2E tests use actual newtest site for realistic scenarios

This testing infrastructure ensures the admin-portal maintains high quality while providing fast development feedback and comprehensive validation of user workflows.