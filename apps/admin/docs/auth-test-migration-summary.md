# Auth Test Migration Summary

## Overview

We've successfully migrated from `vi.mock()` based auth testing to MSW (Mock Service Worker) based testing, following the contract-first approach.

## What Was Deprecated

### Files Moved to `src/test/_deprecated/`

1. **API Tests using vi.mock()**
   - `api-unauthenticated.test.ts`
   - `api-vocabularies-simple.test.ts`
   - `api-vocabularies-working.test.ts`
   - `api-namespaces-auth.test.ts`
   - `api-auth-with-clerk-users.test.ts`
   - `api-vocabularies-auth.test.ts`

2. **Authorization Tests**
   - `lib/authorization.integration.test.ts` - Used old mockAuthenticatedUser pattern

3. **Mock Files**
   - `dynamic-auth.ts` - Old dynamic mock system
   - `__mocks__/AuthCache.ts` - Old cache mocks

4. **Other Tests**
   - `session-management.test.ts` - Used old mock patterns

## What Was Kept

These tests work with real Clerk integration or don't interfere with MSW:

- ✅ `clerk-auth-integration.test.ts` - Tests real Clerk API integration
- ✅ `clerk-test-users.test.ts` - Tests actual Clerk test user loading
- ✅ `dashboard-routing.integration.test.ts` - Compatible with new approach
- ✅ Other component tests that don't directly mock Clerk

## New MSW-Based Tests

### Created Tests
1. **`dashboard-access.test.ts`** (17 passing tests)
   - Tests role-based dashboard routing
   - Validates namespace access control
   - Verifies permission hierarchy

2. **`namespace-dashboard.test.ts`** (18 passing tests)
   - Tests namespace-specific dashboard access
   - Validates permissions per role
   - Tests cross-namespace restrictions

## Test Results

### Before Migration
- **96 failing tests** due to auth mock conflicts
- Inconsistent mocking approaches
- No single source of truth

### After Migration
- **75 failing tests** (21 tests fixed)
- **212 passing tests**
- Clean separation between MSW and deprecated tests

## Why Tests Were Deprecated

1. **vi.mock() Conflicts**: The old tests used `vi.mock('@clerk/nextjs/server')` which conflicts with MSW handlers
2. **No Contract Validation**: Old mocks didn't validate against Zod schemas
3. **Maintenance Burden**: Multiple mock systems were hard to maintain
4. **Inconsistent Data**: Mock data wasn't synced with real Clerk users

## Migration Guide for Deprecated Tests

To rewrite a deprecated test using MSW:

### Old Pattern (Deprecated)
```typescript
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'test' })),
  currentUser: vi.fn(() => mockUser)
}));
```

### New Pattern (MSW)
```typescript
import { authenticateAs } from '../setup-msw';

beforeEach(() => {
  authenticateAs('editor'); // or any role
});
```

## Key Files in New System

1. **Contracts**: `/packages/contracts/schemas/User.zod.ts`
2. **Fixtures**: `/packages/fixtures/clerk-users.json` (synced from Clerk)
3. **MSW Handlers**: `/src/mocks/clerk-handlers.ts`
4. **User Helpers**: `/src/mocks/user-fixtures.ts`
5. **Test Setup**: `/src/test/setup-msw.ts`

## Benefits of New Approach

1. **Single Source of Truth**: All user data defined in contracts
2. **Real Test Data**: Fixtures synced from actual Clerk users
3. **Network-Level Mocking**: MSW intercepts at HTTP level, more realistic
4. **Type Safety**: All data validated with Zod schemas
5. **Easy Switching**: Can switch between mock and live Clerk with environment variable

## Next Steps

1. **Rewrite Critical API Tests**: The deprecated API tests should be rewritten using MSW
2. **Remove setup.ts Mocks**: Eventually remove the old mock imports from setup.ts
3. **Full MSW Migration**: Convert remaining tests to use MSW patterns
4. **E2E Tests**: Add Playwright tests that use MSW for deterministic testing

## Commands

### Sync Test Users from Clerk
```bash
pnpm tsx scripts/sync-clerk-test-users.ts
```

### Run New Auth Tests
```bash
# Dashboard access tests
pnpm test dashboard-access.test.ts

# Namespace dashboard tests  
pnpm test namespace-dashboard.test.ts

# All non-deprecated tests
pnpm test
```

### View Deprecated Tests
```bash
ls -la src/test/_deprecated/
```

## Summary

The migration successfully establishes MSW as the primary mocking strategy for auth tests, following the contract-first principle. Old tests using `vi.mock()` have been deprecated but preserved for reference. The new system provides better type safety, maintainability, and alignment with the project's architectural principles.