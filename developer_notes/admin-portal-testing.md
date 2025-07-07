# Admin Portal Testing Guide

## Overview

This guide outlines the testing infrastructure for the IFLA Standards platform, focusing on the **Admin Portal** (a headless Next.js service) and the **Portal** (a Docusaurus application). The Admin Portal provides authentication and API services, while the Portal contains all administrative UI, including role-based dashboards built with MUI and TinaCMS.

## Architecture

- **Admin Service**: Headless Next.js 15.2.5 application.
  - **Responsibilities**: Authentication (NextAuth.js v4.24.11 with GitHub OAuth), backend APIs.
  - **Port**: 3007 (local).
- **Portal (UI)**: Docusaurus application.
  - **Responsibilities**: All user-facing administrative interfaces, including role-based dashboards.
  - **Port**: 3000 (local).
- **Testing**: Vitest for unit/integration, Playwright for E2E.
- **E2E Target**: The 'newtest' site (port 3008) is used as the content target for testing role-based actions within the Portal UI.

## Test Types

### Unit & Integration Tests (Vitest)
**Purpose**: Test components, utilities, and API logic in isolation or with mocked dependencies.
**Location**: `apps/admin/src/test/` and `portal/src/test/`
**Framework**: Vitest + React Testing Library
**Commands**:
- `nx test admin`: Runs tests for the headless admin service.
- `nx test portal`: Runs tests for the portal UI components.

**What's Tested**:
- **Admin Service**: API endpoint logic, authentication helpers, Cerbos integration.
- **Portal**: React component rendering, user interaction handlers (clicks, form submissions), custom hooks.

### E2E Tests (Playwright)
**Purpose**: Test complete, role-based user workflows in a real browser.
**Location**: `e2e/admin/`
**Framework**: Playwright, targeting the Portal UI and interacting with the Admin service API.
**Command**: `nx run portal:e2e` or `nx e2e portal`

**What's Tested**:
- **Role-Based Access Control**: Verifies that users with different roles (`superadmin`, `namespace_admin`, `namespace_editor`, etc.) see the correct UI and have the correct permissions.
- **Authentication and Authorization**: Full login flow and subsequent authenticated API requests.
- **Complete Admin Workflows**: Scenarios like creating a new vocabulary, editing content via TinaCMS, and publishing, all tested from the perspective of a specific user role.
- **Cross-site Integration**: Navigation and data flow between the Portal's admin dashboards and the content of the `newtest` site.

## E2E Test Configuration for Role-Based Access

### Simulating Roles
To test different user roles without a full GitHub login for each run, we use environment variables to inject a mock user session into the browser context.

- **Environment Variable**: `E2E_MOCK_USER_ROLES`
- **Format**: A JSON string representing the user's roles map.
  - *Example*: `{"newtest": "namespace_admin", "unimarc": "namespace_editor"}`

This variable is read by a custom test setup file that creates a valid `next-auth.session-token` cookie before the test begins.

### Playwright Configuration
**File**: `playwright.config.ts` (root)

```typescript
// Example project configuration for role-based E2E tests
{
  name: 'portal-e2e',
  use: { ...devices['Desktop Chrome'] },
  testMatch: '**/e2e/admin/**/*.spec.ts',
  webServer: [
    {
      command: 'nx serve admin',
      url: 'http://localhost:3007',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'nx serve portal',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'nx start newtest',
      url: 'http://localhost:3008',
      reuseExistingServer: !process.env.CI,
    },
  ],
}
```

## Writing E2E Tests for Roles

### E2E Test Example: `namespace_editor`
**File**: `e2e/admin/auth-roles.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import { mockSessionCookie } from '../utils/session-mock';

test.describe('Role-Based Access for newtest namespace', () => {
  
  test('as namespace_editor, should see editor controls but not admin controls', async ({ browser }) => {
    // 1. Define the user's roles for this test run
    const userRoles = {
      newtest: 'namespace_editor',
    };

    // 2. Create a browser context with the mocked session
    const context = await mockSessionCookie({ browser, userRoles });
    const page = await context.newPage();

    // 3. Navigate to the editor dashboard for the 'newtest' site
    await page.goto('/editor-dashboard/newtest');

    // 4. Assertions
    // Check that editor-specific UI is visible
    await expect(page.getByRole('button', { name: 'Edit Content' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sheets → RDF' })).toBeVisible();

    // Check that admin-specific UI is NOT visible
    await expect(page.getByRole('button', { name: 'Publish Version' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Manage Users' })).not.toBeVisible();
    
    await page.close();
  });

  test('as unauthenticated, "Editor Login" link should redirect to auth', async ({ page }) => {
    // Start at a page within the 'newtest' site
    await page.goto('/newtest/some-page');
    
    // Find and click the login link
    await page.getByRole('link', { name: 'Editor Login' }).click();
    
    // Assert the URL is the sign-in page of the admin service
    await expect(page).toHaveURL(/localhost:3007\/auth\/signin/);
  });
});
```

### Test Scenarios to Cover
- **Superadmin**: Can see and access global settings and all namespace dashboards.
- **Namespace Admin**: Can access admin controls (Publish, Manage Users) only for their assigned namespace (`newtest`).
- **Namespace Editor**: Can access content editing controls but not admin controls.
- **Namespace Reviewer**: Can view content and review tools, but cannot edit.
- **Namespace Translator**: Can access translation-specific UI.
- **User with multiple roles**: Verify correct permissions are applied when navigating between different namespace dashboards.
- **Unauthenticated User**: Is properly redirected to the login page.

## Troubleshooting

### Common Issues

**1. Authentication Mock Issues**
- **Symptom**: Tests fail with "Unauthorized" or redirect loops.
- **Solution**: Ensure the `E2E_MOCK_USER_ROLES` variable is correctly formatted JSON. Verify that the `mockSessionCookie` utility is correctly signing the session token.

**2. E2E Server Startup**
- **Symptom**: Playwright times out waiting for a server.
- **Solution**: Run the `webServer` commands manually in separate terminals to check for errors: `nx serve admin`, `nx serve portal`, `nx start newtest`.

**3. Port Conflicts**
- **Symptom**: Server fails to start with "address already in use".
- **Solution**: Use `pnpm ports:kill` or `lsof -ti:3000,3007,3008 | xargs kill -9` to free up the required ports.
