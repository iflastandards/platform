# Clerk Authentication Testing Guide

This guide explains how to set up and use Clerk authentication in E2E tests.

## Overview

Our E2E tests use real Clerk authentication with pre-configured test users. Tests can run in authenticated or unauthenticated state, with different user roles for RBAC testing.

## Setup

### 1. Environment Variables

Copy `.env.test.example` to `.env.test`:

```bash
# Enable demo mode
IFLA_DEMO=true
NEXT_PUBLIC_IFLA_DEMO=true

# Base URL
BASE_URL=http://localhost:3007
```

No passwords needed - all test users use verification code `424242`.

### 2. Test Users

Pre-configured test users in Clerk:

| Email | Role | Purpose |
|-------|------|---------|
| superadmin+clerk_test@example.com | system-admin | Full admin access |
| rg_admin+clerk_test@example.com | rg-admin | Review Group Admin |
| editor+clerk_test@example.com | editor | Content editing |
| author+clerk_test@example.com | reviewer | Review/author access |
| translator+clerk_test@example.com | translator | Translation access |

All users authenticate with email verification code: `424242`

### 3. Global Setup

The global setup (`e2e/global-setup.ts`) runs before all tests to:
1. Authenticate each test user
2. Save authentication state to `playwright/.auth/{role}.json`
3. Make auth state available for test projects

## Writing Authenticated Tests

### File Naming Convention

- Authenticated tests: `*.auth.spec.ts`
- Regular tests: `*.spec.ts`

### Example Authenticated Test

```typescript
import { e2eTest as test, expect } from '../../utils/tagged-test';

test.describe('Admin Feature @admin @auth', () => {
  test('should access protected resource', async ({ page }) => {
    await page.goto('/dashboard');
    // Already authenticated via storage state
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
```

### Test Projects

The base configuration includes these authenticated projects:

- `chromium-admin`: Admin user context
- `chromium-editor`: Editor user context
- `chromium`: Unauthenticated tests

## Running Tests

```bash
# Run all tests (including setup)
pnpm test:e2e

# Run only authenticated tests
npx playwright test --project=chromium-admin

# Skip authentication setup (use existing auth)
SKIP_AUTH_SETUP=true pnpm test:e2e

# Run specific user role tests
npx playwright test --project=chromium-editor
```

## Authentication Utilities

### Manual Authentication in Tests

```typescript
import { setupMockAuth } from '../utils/auth-helpers';

test('manual auth test', async ({ context, page }) => {
  // Authenticate as admin
  await setupMockAuth(context, 'systemAdmin');
  
  await page.goto('/dashboard');
  // Now authenticated
});
```

### Clear Authentication

```typescript
import { clearAuth } from '../utils/auth-helpers';

test('logout test', async ({ context, page }) => {
  await clearAuth(context);
  
  await page.goto('/dashboard');
  // Should redirect to login
});
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run E2E Tests
  env:
    IFLA_DEMO: true
    NEXT_PUBLIC_IFLA_DEMO: true
  run: pnpm test:e2e
```

### Pre-seeded Authentication

For faster CI runs, you can pre-seed authentication:

1. Run global setup locally
2. Upload `playwright/.auth/*.json` as artifacts
3. Download in CI and skip setup:

```bash
SKIP_AUTH_SETUP=true pnpm test:e2e
```

## Troubleshooting

### Authentication Fails

1. Check Clerk Dashboard for username/password auth enabled
2. Verify test user emails exist in Clerk
3. Check `.env.test` has correct passwords
4. Enable debug mode: `DEBUG=pw:api pnpm test:e2e`

### Session Expires

- Auth state is saved per project run
- Re-run global setup if sessions expire
- Consider shorter test runs in CI

### Different Environments

Configure base URL for different environments:

```bash
# Local development
BASE_URL=http://localhost:3007 pnpm test:e2e

# Preview
BASE_URL=https://preview.example.com pnpm test:e2e
```

## Best Practices

1. **Use Role-Based Projects**: Test different user permissions with dedicated projects
2. **Keep Auth State Fresh**: Re-run setup periodically or in CI
3. **Test Both States**: Include tests for authenticated and unauthenticated flows
4. **Mock When Possible**: Use real auth for critical flows, mock for unit tests
5. **Secure Credentials**: Never commit passwords, use environment variables

## Migration from Mock Auth

If migrating from mock authentication:

1. Update test files to remove mock setup
2. Add `.auth.spec.ts` suffix for authenticated tests
3. Remove manual authentication calls
4. Let project configuration handle auth state

## Advanced Patterns

### Multi-Role Testing

```typescript
test.describe('Multi-role feature', () => {
  test.describe('Admin perspective', () => {
    test.use({ storageState: 'playwright/.auth/admin.json' });
    
    test('admin can delete', async ({ page }) => {
      // Test admin-specific features
    });
  });
  
  test.describe('Editor perspective', () => {
    test.use({ storageState: 'playwright/.auth/editor.json' });
    
    test('editor cannot delete', async ({ page }) => {
      // Test editor limitations
    });
  });
});
```

### Dynamic Authentication

```typescript
import { Browser } from '@playwright/test';

async function authenticateUser(browser: Browser, role: string) {
  const context = await browser.newContext();
  await setupMockAuth(context, role);
  return context;
}
```

## Reference

- [Clerk Playwright Example](https://github.com/clerk/clerk-playwright-nextjs)
- [Playwright Auth Docs](https://playwright.dev/docs/auth)
- [Clerk Testing Docs](https://clerk.com/docs/testing)