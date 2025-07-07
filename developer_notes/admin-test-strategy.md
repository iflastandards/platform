# Test-First Implementation Strategy for Admin Architecture

## Overview
This document provides a comprehensive test-first approach for implementing the Docusaurus + TinaCMS + MUI Admin Architecture. Each test is written before the implementation to guide development and ensure quality.

## Testing Stack
- **Unit Tests**: Vitest + React Testing Library for components
- **Integration Tests**: Vitest for API routes with MSW (Mock Service Worker)
- **E2E Tests**: Playwright for full workflow testing
- **Test Utilities**: Custom test helpers for authentication and mocking

## Test Organization

```
packages/theme/src/tests/
├── components/
│   ├── ProtectedRoute.test.tsx
│   ├── DashboardLayout.test.tsx
│   └── MUIThemeProvider.test.tsx
├── hooks/
│   └── useAdminSession.test.ts
└── setup/
    └── mui-setup.ts

apps/admin/src/tests/
├── api/
│   ├── github/
│   │   └── teams.test.ts
│   ├── scaffold/
│   │   └── route.test.ts
│   └── convert/
│       └── sheets-to-rdf.test.ts
└── setup/
    └── api-test-setup.ts

e2e/
├── admin-architecture/
│   ├── superadmin-dashboard.spec.ts
│   ├── editor-workflow.spec.ts
│   └── data-conversion.spec.ts
└── fixtures/
    └── mui-dashboard-fixtures.ts
```

## Phase 1: Component Tests

### 1.1 ProtectedRoute Component Tests

**Test Scenarios:**
1. Shows loading state while checking authentication
2. Redirects to login when unauthenticated
3. Shows access denied for insufficient roles
4. Renders children when authorized
5. Handles multiple role requirements
6. Preserves return URL in redirect

### 1.2 DashboardLayout Component Tests

**Test Scenarios:**
1. Renders with correct title
2. Displays username from session
3. Applies MUI theme correctly
4. Responsive layout behavior
5. Navigation menu functionality

### 1.3 MUIThemeProvider Tests

**Test Scenarios:**
1. Provides MUI theme to children
2. Synchronizes with Docusaurus color mode
3. Applies IFLA color palette
4. Theme switching functionality

## Phase 2: API Route Tests

### 2.1 GitHub Teams API Tests

**Test Scenarios:**
1. Creates team with correct parameters
2. Adds members with appropriate roles
3. Handles authentication failures
4. Validates admin permissions
5. Error handling for GitHub API failures

### 2.2 Site Scaffolding API Tests

**Test Scenarios:**
1. Executes scaffolding script correctly
2. Handles file upload and processing
3. Validates input parameters
4. Returns appropriate success/error responses
5. Cleans up on failure

### 2.3 Data Conversion API Tests

**Test Scenarios:**
1. Authenticates with Google Sheets
2. Converts sheet data to RDF
3. Saves files to correct location
4. Handles missing/invalid data
5. Progress tracking for large conversions

## Phase 3: E2E Dashboard Tests

### 3.1 Superadmin Dashboard E2E

**Test Scenarios:**
1. Login and navigation to dashboard
2. Create new site workflow
3. Team management operations
4. Role-based visibility
5. Error handling and recovery

### 3.2 Editor Dashboard E2E

**Test Scenarios:**
1. Access control verification
2. Content editing via TinaCMS
3. Data conversion workflows
4. Status tracking and updates
5. Collaboration features

## Test Implementation Examples

### Example 1: ProtectedRoute Unit Test
```typescript
// packages/theme/src/tests/components/ProtectedRoute.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import * as useAdminSessionModule from '../../hooks/useAdminSession';

describe('ProtectedRoute', () => {
  const mockUseAdminSession = vi.spyOn(useAdminSessionModule, 'useAdminSession');
  
  beforeEach(() => {
    vi.clearAllMocks();
    delete window.location;
    window.location = { href: '' } as Location;
  });

  it('shows loading state while checking authentication', () => {
    mockUseAdminSession.mockReturnValue({
      isAuthenticated: false,
      teams: [],
      loading: true,
      username: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', async () => {
    mockUseAdminSession.mockReturnValue({
      isAuthenticated: false,
      teams: [],
      loading: false,
      username: null,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(window.location.href).toContain('/auth/signin');
      expect(window.location.href).toContain('returnUrl=');
    });
  });

  it('shows access denied for insufficient roles', () => {
    mockUseAdminSession.mockReturnValue({
      isAuthenticated: true,
      teams: ['some-team'],
      loading: false,
      username: 'testuser',
    });

    render(
      <ProtectedRoute requiredRoles={['admin']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authorized', () => {
    mockUseAdminSession.mockReturnValue({
      isAuthenticated: true,
      teams: ['admin'],
      loading: false,
      username: 'testuser',
    });

    render(
      <ProtectedRoute requiredRoles={['admin']}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
```

### Example 2: API Route Integration Test
```typescript
// apps/admin/src/tests/api/scaffold/route.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '../../../app/api/scaffold/route';
import { auth } from '../../../app/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';

vi.mock('../../../app/lib/auth');
vi.mock('child_process');

describe('/api/scaffold', () => {
  const mockAuth = vi.mocked(auth);
  const mockExec = vi.mocked(exec);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires authentication', async () => {
    mockAuth.mockResolvedValue(null);

    const { req } = createMocks({
      method: 'POST',
      body: { siteKey: 'test', title: 'Test Site', tagline: 'Test' },
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  it('requires admin role', async () => {
    mockAuth.mockResolvedValue({
      user: { id: '1', roles: ['user'] }
    });

    const { req } = createMocks({
      method: 'POST',
      body: { siteKey: 'test', title: 'Test Site', tagline: 'Test' },
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  it('successfully creates site', async () => {
    mockAuth.mockResolvedValue({
      user: { id: '1', roles: ['system-admin'] }
    });

    mockExec.mockImplementation((cmd, opts, callback) => {
      callback(null, { stdout: 'Site created successfully', stderr: '' });
    });

    const { req } = createMocks({
      method: 'POST',
      body: { siteKey: 'newsite', title: 'New Site', tagline: 'A new site' },
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      success: true,
      output: 'Site created successfully',
      siteKey: 'newsite'
    });
    
    expect(mockExec).toHaveBeenCalledWith(
      expect.stringContaining('scaffold-site.ts'),
      expect.any(Object),
      expect.any(Function)
    );
  });
});
```

### Example 3: E2E Dashboard Test
```typescript
// e2e/admin-architecture/superadmin-dashboard.spec.ts
import { test, expect } from '@playwright/test';
import { mockAdminSession } from '../fixtures/auth-helpers';

test.describe('Superadmin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin session
    await mockAdminSession(page, {
      isAuthenticated: true,
      username: 'admin',
      teams: ['system-admin'],
    });
  });

  test('can create new site', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await expect(page.getByText('System Administration')).toBeVisible();
    
    // Click create site button
    await page.getByRole('button', { name: 'Create New Site' }).click();
    
    // Fill in form
    await page.getByLabel('Site Key').fill('testsite');
    await page.getByLabel('Title').fill('Test Site');
    await page.getByLabel('Tagline').fill('A test site');
    
    // Mock API response
    await page.route('/api/scaffold', async route => {
      await route.fulfill({
        status: 200,
        json: { success: true, siteKey: 'testsite' }
      });
    });
    
    // Submit form
    await page.getByRole('button', { name: 'Create Site' }).click();
    
    // Verify success
    await expect(page.getByText('Site created successfully')).toBeVisible();
  });

  test('shows error for unauthorized access', async ({ page }) => {
    // Mock non-admin session
    await mockAdminSession(page, {
      isAuthenticated: true,
      username: 'user',
      teams: ['some-team'],
    });
    
    await page.goto('/dashboard');
    
    await expect(page.getByText(/don't have permission/i)).toBeVisible();
  });
});
```

## Test Infrastructure Setup

### MUI + Docusaurus Test Setup
```typescript
// packages/theme/src/tests/setup/mui-setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Docusaurus theme-common
vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({ colorMode: 'light', setColorMode: vi.fn() }),
}));

// Mock MUI components that might have SSR issues
vi.mock('@mui/material/styles', async () => {
  const actual = await vi.importActual('@mui/material/styles');
  return {
    ...actual,
    useTheme: () => ({
      palette: { mode: 'light' },
      breakpoints: { up: () => '@media (min-width:600px)' },
    }),
  };
});
```

## Testing Best Practices

1. **Write Tests First**: Define expected behavior before implementation
2. **Test User Journeys**: Focus on complete workflows, not just units
3. **Mock External Services**: Use MSW for API mocking
4. **Test Error States**: Always test failure scenarios
5. **Accessibility Testing**: Include ARIA and keyboard navigation tests
6. **Performance Testing**: Monitor component render times

## CI/CD Integration

```yaml
# .github/workflows/test-admin-architecture.yml
name: Test Admin Architecture

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      
      # Unit & Integration Tests
      - run: pnpm nx run theme:test
      - run: pnpm nx run admin:test
      
      # E2E Tests
      - run: pnpm playwright install
      - run: pnpm nx run standards-dev:e2e:admin-architecture
```

## Next Steps

1. Start with component unit tests (ProtectedRoute, DashboardLayout)
2. Move to API integration tests
3. Implement E2E tests for complete workflows
4. Add performance and accessibility tests
5. Set up continuous monitoring