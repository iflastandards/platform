# Clerk Test Users Guide

This guide explains how to use real Clerk test users in your integration tests following our **integration-first testing philosophy**. We prefer real I/O and actual data over mocks for more realistic testing of authentication and authorization flows.

**📋 Prerequisites**: Read `developer_notes/TESTING_QUICK_REFERENCE.md` and `developer_notes/TEST_TEMPLATES.md` before writing tests.

## Overview

We maintain a set of standardized Clerk test users that represent different roles in our system:

- **Superadmin**: Full system access
- **Review Group Admin**: Manages ISBD review group
- **Editor**: Can edit content in ISBD/ISBDM namespaces
- **Author**: Can create content in LRM namespace (no delete)
- **Translator**: Can translate content in French for ISBD/LRM

## Test User Emails

```typescript
const TEST_USER_EMAILS = {
  SUPERADMIN: 'superadmin+clerk_test@example.com',
  RG_ADMIN: 'rg_admin+clerk_test@example.com',
  EDITOR: 'editor+clerk_test@example.com',
  AUTHOR: 'author+clerk_test@example.com',
  TRANSLATOR: 'translator+clerk_test@example.com',
};
```

## Usage in Tests

### Basic Usage

```typescript
import { TestUsers, TestScenarios } from '../utils/clerk-test-users';

describe('My API Tests', () => {
  it('should allow superadmin access', async () => {
    await TestScenarios.withSuperAdmin(async (user) => {
      // Your test code here
      // The user object contains real Clerk data
      expect(user.roles.systemRole).toBe('superadmin');
    });
  });
});
```

### API Route Testing

```typescript
import { TestScenarios, createTestRequest, extractResponseData } from '../utils/clerk-test-helpers';
import { GET } from '../../app/api/admin/namespaces/route';

describe('API Authorization', () => {
  it('should test namespace access', async () => {
    await TestScenarios.withEditor(async (user) => {
      const request = createTestRequest('GET');
      const response = await GET(request);
      const result = await extractResponseData(response);
      
      expect(result.status).toBe(200);
      expect(result.data.success).toBe(true);
    });
  });
});
```

### Authorization Matrix Testing

```typescript
import { testAuthorizationMatrix } from '../utils/clerk-test-helpers';

describe('Authorization Matrix', () => {
  it('should test all user types', async () => {
    const results = await testAuthorizationMatrix(
      async (user) => {
        // Your test function
        const request = createTestRequest('GET');
        const response = await GET(request);
        return extractResponseData(response);
      },
      {
        superadmin: 'allow',
        reviewGroupAdmin: 'allow',
        editor: 'allow',
        author: 'deny',
        translator: 'deny',
        noAuth: 'deny',
      }
    );

    // Verify results
    expect(results.superadmin.status).toBe(200);
    expect(results.noAuth.status).toBe(401);
  });
});
```

## Available Helper Functions

### TestUsers

- `TestUsers.getSuperAdmin()` - Get superadmin test user
- `TestUsers.getReviewGroupAdmin()` - Get review group admin
- `TestUsers.getEditor()` - Get editor user
- `TestUsers.getAuthor()` - Get author user
- `TestUsers.getTranslator()` - Get translator user

### TestScenarios

- `TestScenarios.withSuperAdmin(testFn)` - Run test as superadmin
- `TestScenarios.withReviewGroupAdmin(testFn)` - Run test as RG admin
- `TestScenarios.withEditor(testFn)` - Run test as editor
- `TestScenarios.withAuthor(testFn)` - Run test as author
- `TestScenarios.withTranslator(testFn)` - Run test as translator
- `TestScenarios.withNoAuth(testFn)` - Run test without authentication

### TestAssertions

- `TestAssertions.expectAuthorized(response)` - Assert successful authorization
- `TestAssertions.expectUnauthenticated(response)` - Assert 401 response
- `TestAssertions.expectForbidden(response)` - Assert 403 response
- `TestAssertions.expectSuccess(response)` - Assert 2xx response

## Test User Metadata Structure

Each test user has the following metadata structure:

```typescript
interface UserRoles {
  systemRole?: 'superadmin';
  reviewGroups: Array<{
    reviewGroupId: string;
    role: 'admin';
  }>;
  teams: Array<{
    teamId: string;
    role: 'editor' | 'author';
    reviewGroup: string;
    namespaces: string[];
  }>;
  translations: Array<{
    language: string;
    namespaces: string[];
  }>;
}
```

### Specific User Configurations

**Superadmin**:
```typescript
{
  systemRole: 'superadmin',
  reviewGroups: [],
  teams: [],
  translations: []
}
```

**Review Group Admin**:
```typescript
{
  reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }],
  teams: [],
  translations: []
}
```

**Editor**:
```typescript
{
  reviewGroups: [],
  teams: [{ 
    teamId: 'isbd-team-1', 
    role: 'editor', 
    reviewGroup: 'isbd', 
    namespaces: ['isbd', 'isbdm'] 
  }],
  translations: []
}
```

**Author**:
```typescript
{
  reviewGroups: [],
  teams: [{ 
    teamId: 'lrm-team-1', 
    role: 'author', 
    reviewGroup: 'bcm', 
    namespaces: ['lrm'] 
  }],
  translations: []
}
```

**Translator**:
```typescript
{
  reviewGroups: [],
  teams: [],
  translations: [{ 
    language: 'fr', 
    namespaces: ['isbd', 'lrm'] 
  }]
}
```

## When to Use Clerk Test Users vs Mocks (Integration-First Philosophy)

### Use Clerk Test Users For (DEFAULT):
- **@integration tests** that test API routes with authentication (PRIMARY USE CASE)
- **Authorization flow testing** where you need real Clerk metadata
- **Multi-component scenarios** that involve authentication + business logic
- **Testing actual permission logic** with real user data
- **Performance testing** with real authorization overhead

### Use Mocks For (RARE):
- **@unit tests** of pure functions that don't need authentication
- **Component tests** that focus on UI logic without auth
- **Edge cases** that are impossible to reproduce with real users
- **Tests where Clerk API calls would exceed 30s performance target**

**Note**: Follow our 5-phase testing strategy - most tests should be @integration tests with real I/O.

## Best Practices

1. **Use descriptive test names** that indicate which user type is being tested
2. **Clear mocks between tests** to avoid interference
3. **Verify user metadata** in tests to ensure correct setup
4. **Use authorization matrix testing** for comprehensive coverage
5. **Test both positive and negative cases** (authorized and unauthorized)

## Troubleshooting

### Test User Not Found
If you get "Test user not found" errors:
1. Verify the user exists in Clerk dashboard
2. Check that the email matches exactly
3. Ensure the user has the correct metadata structure

### Permission Tests Failing
If authorization tests fail unexpectedly:
1. Verify the user's metadata using `TestUserUtils.printTestUserInfo()`
2. Check that the authorization logic matches the user's permissions
3. Ensure you're testing the right namespace/resource combination

### Slow Tests
If tests are slow due to Clerk API calls:
1. Use the caching mechanism (users are cached after first load)
2. Consider using mocks for unit tests
3. Group related tests to minimize user switching

## Maintenance

The test users are automatically updated with the correct metadata structure. If you need to modify a test user:

1. Update the metadata in `TEST_USER_METADATA` constant
2. Run the update script to sync with Clerk
3. Update any tests that depend on the changed metadata

## Example Test File

See `apps/admin/src/test/integration/api-auth-with-clerk-users.test.ts` for a complete example of using Clerk test users in integration tests.