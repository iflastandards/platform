# Authentication Testing Guide

## Overview

This guide documents the authentication testing strategy for the IFLA Standards admin application. We use Mock Service Worker (MSW) to provide consistent, contract-based mocking of Clerk authentication endpoints.

## Architecture

### Core Principles

1. **Contracts as Single Source of Truth**: All user data structures are defined in `/packages/contracts/schemas/User.zod.ts`
2. **MSW for All Mocking**: Network-level interception replaces `vi.mock()` 
3. **Real Test Data**: Fixtures are synced from actual Clerk test users
4. **Type Safety**: Zod validation at all boundaries

### File Structure

```
apps/admin/
├── scripts/
│   └── sync-clerk-test-users.ts    # Syncs test users from Clerk
├── src/
│   ├── mocks/
│   │   ├── clerk-handlers.ts       # MSW handlers for Clerk API
│   │   ├── user-fixtures.ts        # User fixture helpers
│   │   └── handlers.ts             # Combined MSW handlers
│   └── test/
│       ├── setup-msw.ts            # MSW test configuration
│       └── integration/
│           ├── dashboard-access.test.ts    # Dashboard routing tests
│           └── namespace-dashboard.test.ts # Namespace-specific tests
packages/
├── contracts/
│   └── schemas/
│       └── User.zod.ts              # User contract schema
└── fixtures/
    └── clerk-users.json             # Synced test user data
```

## Test User Roles

We maintain 6 test user accounts in Clerk for comprehensive role testing:

| Role | Email | Dashboard Route | Permissions |
|------|-------|----------------|-------------|
| **Superadmin** | `superadmin+clerk_test@example.com` | `/dashboard/admin` | Full system access |
| **Review Group Admin** | `rg_admin+clerk_test@example.com` | `/dashboard/rg` | Manages review groups & namespaces |
| **Namespace Admin** | `ns_admin+clerk_test@example.com` | `/dashboard/isbd` | Full control of specific namespace(s) |
| **Editor** | `editor+clerk_test@example.com` | `/dashboard/editor` | Edit content in assigned namespaces |
| **Author** | `author+clerk_test@example.com` | `/dashboard/author` | Create content in assigned namespaces |
| **Translator** | `translator+clerk_test@example.com` | `/dashboard` | Translate content for specific languages |

## Dashboard Routes

Each role is automatically routed to their appropriate dashboard:

- `/dashboard/admin` - System administration (superadmin only)
- `/dashboard/rg` - Review group management 
- `/dashboard/[siteKey]` - Namespace-specific management (e.g., `/dashboard/isbd`)
- `/dashboard/editor` - Editor workspace
- `/dashboard/author` - Author workspace
- `/dashboard` - Personal dashboard (translators, users with limited access)
- `/dashboard/pending` - Waiting page (users with no permissions)

## Setting Up Tests

### 1. Sync Test Users

Before writing tests, ensure test user data is current:

```bash
pnpm tsx scripts/sync-clerk-test-users.ts
```

This generates:
- `/packages/fixtures/clerk-users.json` - User fixture data
- `/apps/admin/test-users-report.md` - Human-readable report

### 2. Configure MSW

Tests automatically use MSW through the setup files:

```typescript
// vitest.config.ts
setupFiles: ['./src/test/setup.ts', './src/test/setup-msw.ts']
```

### 3. Write Tests

#### Basic Authentication Test

```typescript
import { describe, it, expect } from 'vitest';
import { authenticateAs, clearAuthentication } from '../setup-msw';
import { getUserFixture, fixtureToAppUser } from '../../mocks/user-fixtures';

describe('My Feature', () => {
  it('should work for editors', () => {
    // Set authenticated user
    authenticateAs('editor');
    
    // Your test logic here
    const user = getUserFixture('editor');
    const appUser = fixtureToAppUser(user);
    
    expect(appUser.accessibleNamespaces).toContain('isbd');
  });
  
  it('should handle unauthenticated users', () => {
    clearAuthentication();
    
    // Test unauthenticated behavior
  });
});
```

#### Dashboard Access Test

```typescript
import { getDashboardRoute } from '../../lib/clerk-github-auth';
import { getUserFixture, fixtureToAppUser } from '../../mocks/user-fixtures';

it('should route namespace admin correctly', () => {
  const user = getUserFixture('nsadmin');
  const appUser = fixtureToAppUser(user);
  
  // Namespace admin goes to their first namespace
  const route = getDashboardRoute(appUser);
  expect(route).toBe('/dashboard/isbd');
});
```

## MSW Handler Details

The Clerk MSW handlers mock these endpoints:

- `GET /v1/users/:userId` - Get user by ID
- `GET /v1/users` - List users (with filtering)
- `GET /v1/sessions/:sessionId` - Get session details
- `POST /v1/sessions` - Create session (sign in)
- `DELETE /v1/sessions/:sessionId` - End session (sign out)
- `POST /internal/auth` - Mock auth() function
- `GET /internal/current-user` - Mock currentUser() function

## Helper Functions

### User Fixtures

```typescript
import { 
  getUserFixture,           // Get by role
  getUserFixtureByEmail,     // Get by email
  getUserFixtureById,        // Get by ID
  fixtureToClerkUser,        // Convert to Clerk format
  fixtureToAppUser,          // Convert to app format
  getExpectedDashboardRoute  // Get expected route for user
} from '../../mocks/user-fixtures';
```

### Authentication Helpers

```typescript
import { 
  authenticateAs,      // Set authenticated role
  clearAuthentication  // Clear auth state
} from '../setup-msw';

// Set authentication for a test
authenticateAs('editor');

// Clear authentication
clearAuthentication();
```

## Contract Validation

All user data is validated against Zod schemas:

```typescript
// User fixture structure
const UserFixtureSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  publicMetadata: UserPublicMetadataSchema,
  privateMetadata: UserPrivateMetadataSchema,
  // ...
});

// Automatic validation in MSW handlers
const clerkUser = ClerkUserSchema.parse(userData);
```

## Testing Patterns

### 1. Role-Based Access Control

```typescript
describe('RBAC', () => {
  it.each([
    ['superadmin', '/dashboard/admin'],
    ['rgadmin', '/dashboard/rg'],
    ['nsadmin', '/dashboard/isbd'],
    ['editor', '/dashboard/editor'],
    ['author', '/dashboard/author'],
    ['translator', '/dashboard']
  ])('%s should route to %s', (role, expectedRoute) => {
    const user = getUserFixture(role as any);
    const appUser = fixtureToAppUser(user);
    const route = getDashboardRoute(appUser);
    expect(route).toBe(expectedRoute);
  });
});
```

### 2. Namespace Access

```typescript
describe('Namespace Access', () => {
  it('should restrict access by role', () => {
    const nsAdmin = getUserFixture('nsadmin');
    const editor = getUserFixture('editor');
    
    // Namespace admin has full access
    expect(hasNamespaceAccess(fixtureToAppUser(nsAdmin), 'isbd')).toBe(true);
    
    // Editor has limited access
    expect(hasNamespaceAccess(fixtureToAppUser(editor), 'isbd')).toBe(true);
    expect(hasNamespaceAccess(fixtureToAppUser(editor), 'unimarc')).toBe(false);
  });
});
```

### 3. Permission Hierarchy

```typescript
describe('Permission Hierarchy', () => {
  it('should prioritize higher roles', () => {
    const user = getUserFixture('superadmin');
    const appUser = fixtureToAppUser(user);
    
    // Add lower roles to superadmin
    appUser.isReviewGroupAdmin = true;
    appUser.projects = { /* ... */ };
    
    // Should still route to admin dashboard
    const route = getDashboardRoute(appUser);
    expect(route).toBe('/dashboard/admin');
  });
});
```

## Migration from vi.mock()

### Old Pattern (Deprecated)

```typescript
// ❌ Old way using vi.mock
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'test' })),
  currentUser: vi.fn(() => mockUser)
}));
```

### New Pattern (MSW)

```typescript
// ✅ New way using MSW
import { authenticateAs } from '../setup-msw';

beforeEach(() => {
  authenticateAs('editor');
});
```

## Troubleshooting

### Issue: Test users not found

**Solution**: Run sync script to update fixtures
```bash
pnpm tsx scripts/sync-clerk-test-users.ts
```

### Issue: Authentication not working in tests

**Solution**: Ensure MSW setup is included in vitest config
```typescript
setupFiles: ['./src/test/setup-msw.ts']
```

### Issue: Unexpected dashboard route

**Solution**: Check user metadata structure
```typescript
const user = getUserFixture('nsadmin');
console.log(user.publicMetadata.teams);
```

## Environment Variables

Tests use mock Clerk keys by default:

```typescript
// Set in src/test/setup.ts
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_...';
process.env.CLERK_SECRET_KEY = 'sk_test_...';
```

For integration tests with real Clerk:
```bash
# Use real keys (not recommended for unit tests)
NEXT_PUBLIC_USE_MOCK=false pnpm test
```

## Best Practices

1. **Always sync before major test updates**: Keep fixtures current with production
2. **Use role names, not user IDs**: More readable and maintainable
3. **Test all roles**: Each feature should be tested with relevant roles
4. **Clear auth between tests**: Prevent test contamination
5. **Validate contracts**: Ensure all mock data passes schema validation
6. **Document custom metadata**: If adding new fields, update User.zod.ts

## Next Steps

1. Add more granular permission tests
2. Test cross-namespace collaboration scenarios
3. Add performance tests for large user lists
4. Implement E2E tests with Playwright using MSW