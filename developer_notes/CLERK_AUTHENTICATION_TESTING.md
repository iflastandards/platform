# Clerk Authentication Testing Guide

This guide explains how to set up and use Clerk authentication in E2E tests.

## Overview

Our E2E tests use real Clerk authentication with pre-configured test users. Tests can run in authenticated or unauthenticated state, with different user roles for our custom RBAC system (using Clerk publicMetadata, NOT Clerk Organizations).

### Key Architecture Points
- **Custom RBAC**: We use Clerk's publicMetadata to store role information
- **No Clerk Organizations**: We do NOT use Clerk's built-in organization features
- **No tRPC**: Standard Next.js API routes with fetch()
- **withAuth Middleware**: All protected routes use our custom middleware
- **Caching**: AuthCache reduces permission checks from ~50ms to <1ms
- **Debug Mode**: Comprehensive authorization debugging available

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

Pre-configured test users in Clerk with custom RBAC metadata:

| Email | Role Type | Metadata Structure | Purpose |
|-------|-----------|-------------------|---------|
| superadmin+clerk_test@example.com | System Admin | `systemRole: 'superadmin'` | Full system access |
| rg_admin+clerk_test@example.com | Review Group Admin | `reviewGroups: [{ role: 'admin', reviewGroupId: 'isbd' }]` | Administers ISBD review group |
| editor+clerk_test@example.com | Team Editor | `teams: [{ role: 'editor', teamId: 'isbd-team-1', namespaces: ['isbd', 'isbdm'] }]` | Edit content in ISBD namespaces |
| author+clerk_test@example.com | Team Author | `teams: [{ role: 'author', teamId: 'lrm-team-1', namespaces: ['lrm'] }]` | Author content in LRM namespace |
| translator+clerk_test@example.com | Translator | `translations: [{ language: 'fr', namespaces: ['isbd', 'lrm'] }]` | French translations for ISBD/LRM |

All users authenticate with email verification code: `424242`

### 3. Role Structure

Our custom RBAC implementation uses Clerk's `publicMetadata` field with this structure:

```typescript
interface UserMetadata {
  systemRole?: 'superadmin';  // Optional system-wide admin
  reviewGroups: Array<{        // Review Group admin roles
    role: 'admin';
    reviewGroupId: string;
  }>;
  teams: Array<{               // Team memberships with namespace access
    role: 'editor' | 'author';
    teamId: string;
    reviewGroup: string;
    namespaces: string[];
  }>;
  translations: Array<{        // Translation assignments
    language: string;
    namespaces: string[];
  }>;
}
```

**Note**: We use custom RBAC with Clerk's publicMetadata, NOT Clerk Organizations or Clerk RBAC features.

### 4. Global Setup

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

### Using Test Users in Integration Tests

```typescript
import { TestUsers } from '../../test-config/clerk-test-users';

test('admin functionality', async () => {
  // Get the superadmin test user
  const user = await TestUsers.getSuperAdmin();
  
  // User object includes:
  // - id: Clerk user ID
  // - email: Test user email
  // - roles: Parsed metadata structure
  // - description: User purpose
});
```

### Available Test User Helpers

```typescript
// Get specific test users
const superAdmin = await TestUsers.getSuperAdmin();
const rgAdmin = await TestUsers.getReviewGroupAdmin();
const editor = await TestUsers.getEditor();
const author = await TestUsers.getAuthor();
const translator = await TestUsers.getTranslator();

// Verify all test users are configured correctly
const verification = await TestUserUtils.verifyAllTestUsers();
if (!verification.valid) {
  console.error('Test user issues:', verification.errors);
}

// Clear cache when test users are modified
import { clearTestUsersCache } from '../../test-config/clerk-test-users';
clearTestUsersCache();
```

### Testing withAuth Middleware

```typescript
// Testing API routes protected by withAuth
import { withAuth } from '@/lib/middleware/withAuth';
import { TestUsers } from '../../test-config/clerk-test-users';

describe('Protected API Routes', () => {
  test('should allow RG admin to create namespace', async () => {
    const rgAdmin = await TestUsers.getReviewGroupAdmin();
    
    // Mock the Clerk auth to return our test user
    vi.mock('@clerk/nextjs/server', () => ({
      currentUser: vi.fn().mockResolvedValue({
        id: rgAdmin.id,
        publicMetadata: TEST_USER_METADATA.RG_ADMIN
      })
    }));
    
    const response = await fetch('/api/admin/namespaces', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Namespace',
        reviewGroupId: 'isbd'
      })
    });
    
    expect(response.status).toBe(200);
  });
  
  test('should deny editor from deleting namespace', async () => {
    const editor = await TestUsers.getEditor();
    
    // Test that editors cannot delete
    const response = await fetch('/api/admin/namespaces/test-ns', {
      method: 'DELETE'
    });
    
    expect(response.status).toBe(403);
    const error = await response.json();
    expect(error.error.code).toBe('PERMISSION_DENIED');
  });
});
```

### Using Debug Endpoints in Tests

```typescript
describe('Authorization Debug Tests', () => {
  test('should verify permission matrix', async () => {
    const superAdmin = await TestUsers.getSuperAdmin();
    
    // Get permission matrix from debug endpoint
    const response = await fetch('/api/admin/auth/debug?action=matrix', {
      headers: { /* auth headers */ }
    });
    
    const { data } = await response.json();
    
    // Superadmin should have all permissions
    expect(data.matrix.namespace.create).toBe(true);
    expect(data.matrix.namespace.delete).toBe(true);
    expect(data.matrix.user.delete).toBe(true);
  });
  
  test('should trace authorization decisions', async () => {
    // Enable debug mode for detailed logging
    process.env.AUTH_DEBUG = 'true';
    process.env.AUTH_DEBUG_VERBOSE = 'true';
    
    // Make a request that requires authorization
    await fetch('/api/admin/namespaces');
    
    // Check debug logs
    const logs = await fetch('/api/admin/auth/debug?action=logs&count=1');
    const { data } = await logs.json();
    
    expect(data[0].result).toBe('allowed');
    expect(data[0].roleChecks).toContainEqual(
      expect.objectContaining({
        role: 'admin',
        type: 'reviewGroup',
        matched: true
      })
    );
  });
});
```

### Testing with Cached Permissions

```typescript
describe('Permission Caching', () => {
  test('should use cached permissions for performance', async () => {
    const startTime = performance.now();
    
    // First call - hits database
    const perm1 = await canPerformAction('namespace', 'read', {
      namespaceId: 'isbd'
    });
    
    const firstCallTime = performance.now() - startTime;
    
    // Second call - uses cache
    const cacheStart = performance.now();
    const perm2 = await canPerformAction('namespace', 'read', {
      namespaceId: 'isbd'
    });
    
    const cachedCallTime = performance.now() - cacheStart;
    
    expect(perm1).toBe(perm2);
    expect(cachedCallTime).toBeLessThan(firstCallTime / 10); // Cache is 10x+ faster
    expect(cachedCallTime).toBeLessThan(5); // Should be under 5ms
  });
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

## Debugging Authorization

### Using the Debug Endpoint

```typescript
// Check authorization debug information
const response = await fetch('/api/admin/auth/debug?action=matrix');
const { data } = await response.json();

// data.matrix shows all permissions for current user
console.log('User permissions:', data.matrix);
```

### Debug Mode Environment Variables

```bash
# Enable authorization debug logging
AUTH_DEBUG=true
AUTH_DEBUG_VERBOSE=true  # Include stack traces
AUTH_DEBUG_STACK=true    # Include call stacks
```

### Checking Permissions in Tests

```typescript
test('verify RG admin permissions', async () => {
  const rgAdmin = await TestUsers.getReviewGroupAdmin();
  
  // Check specific permission
  const canCreate = await canPerformAction('namespace', 'create', {
    reviewGroupId: 'isbd'
  });
  
  expect(canCreate).toBe(true); // RG admins can create namespaces
});
```

## Troubleshooting

### Authentication Fails

1. Check Clerk Dashboard for email/password auth enabled
2. Verify test user emails exist in Clerk with correct metadata
3. Verify all users use verification code `424242`
4. Enable debug mode: `DEBUG=pw:api AUTH_DEBUG=true pnpm test:e2e`

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

### External Documentation
- [Clerk Playwright Example](https://github.com/clerk/clerk-playwright-nextjs)
- [Playwright Auth Docs](https://playwright.dev/docs/auth)
- [Clerk Testing Docs](https://clerk.com/docs/testing)

### Internal Documentation
- **Test User Configuration**: `/apps/admin/src/test-config/clerk-test-users.ts`
- **Authorization Implementation**: `/apps/admin/src/lib/authorization.ts`
- **withAuth Middleware**: `/apps/admin/src/lib/middleware/withAuth.ts`
- **Auth Cache**: `/apps/admin/src/lib/cache/AuthCache.ts`
- **Debug Utilities**: `/apps/admin/src/lib/debug/authDebug.ts`
- **Permission Matrix**: `/system-design-docs/13-permission-matrix-detailed.md`

### Key Implementation Files
- **Auth Context Schema**: `/apps/admin/src/lib/schemas/auth.schema.ts`
- **Test User Tests**: `/apps/admin/src/test/integration/clerk-test-users.test.ts`
- **API Auth Tests**: `/apps/admin/src/test/integration/api-auth-with-clerk-users.test.ts`