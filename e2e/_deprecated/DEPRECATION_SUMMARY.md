# E2E Test Deprecation Summary

**Date**: 2025-07-29

## Reason for Deprecation

The authentication interface has changed from a dropdown-based system to Clerk-based authentication. The following UI elements no longer exist in the current interface:
- "Editor Login" links
- Dropdown menu authentication pattern
- Several auth-related selectors that referenced the old UI

## Deprecated Test Files

### 1. auth-dropdown-validation.e2e.test.ts
- **Original Location**: `e2e/admin/auth-dropdown-validation.e2e.test.ts`
- **Reason**: References non-existent `selectors.auth.editorLoginLink` and dropdown menu pattern
- **Key Tests**: URL validation, "Keep me logged in" functionality, role-based menu visibility

### 2. auth-basic.spec.ts
- **Original Location**: `e2e/admin/auth-basic.spec.ts`
- **Reason**: Looking for "Editor Login" links that no longer exist
- **Key Tests**: Basic authentication flow, navbar structure when authenticated

### 3. auth-simple.spec.ts
- **Original Location**: `e2e/admin/auth-simple.spec.ts`  
- **Reason**: Tests expect "Editor Login" link in unauthenticated state
- **Key Tests**: Unauthenticated user views, mock authenticated user state

### 4. cross-site-auth-communication.e2e.test.ts
- **Original Location**: `e2e/admin/cross-site-auth-communication.e2e.test.ts`
- **Reason**: Multiple references to "Editor Login" links and old auth patterns
- **Key Tests**: Cross-site auth sync, cross-tab communication, auth persistence

### 5. auth-roles.spec.ts
- **Original Location**: `e2e/admin/auth-roles.spec.ts`
- **Reason**: Test assumptions no longer valid - management link may not exist, dashboard routes protected by Clerk middleware, signin flow changed
- **Key Tests**: Role-based access control, management link validation, multi-role switching

### 6. auth.e2e.test.ts
- **Original Location**: `e2e/admin/auth.e2e.test.ts`
- **Reason**: Using incorrect routes - `/auth/signin` should be `/api/auth/signin`, `/dashboard/newtest` returns 404, route structure changed
- **Key Tests**: Authentication flow, redirect behavior, session handling, sign out functionality

### 7. dashboard-protection.e2e.test.ts
- **Original Location**: `e2e/admin/dashboard-protection.e2e.test.ts`
- **Reason**: Routes return 404, expects UI elements that don't exist, authentication flow has changed
- **Key Tests**: Dashboard route protection, unauthenticated redirects

### 8. rbac-scenarios.e2e.test.ts
- **Original Location**: `e2e/admin/rbac-scenarios.e2e.test.ts`
- **Reason**: Same authentication and routing issues as other tests
- **Key Tests**: Role-based access control scenarios

### 9. site-management-workflow.e2e.test.ts
- **Original Location**: `e2e/admin/site-management-workflow.e2e.test.ts`
- **Reason**: Same authentication and routing issues as other tests
- **Key Tests**: Site management workflows

### 10. docs-env-validation.spec.ts
- **Original Location**: `e2e/docs-env-validation.spec.ts`
- **Reason**: Tests a function (getEnvironmentName) that doesn't exist in the codebase
- **Key Tests**: DOCS_ENV validation, environment name mapping

### 11. environment-fallback.spec.ts
- **Original Location**: `e2e/environment-fallback.spec.ts`
- **Reason**: Expects DOCS_ENV to be plain text but it's encrypted in the .env file
- **Key Tests**: Environment configuration validation, site environment files

### 12. server-integration.spec.ts
- **Original Location**: `e2e/examples/server-integration.spec.ts`
- **Reason**: Tests features that aren't implemented - vocabularies API and UI
- **Key Tests**: Vocabulary CRUD operations, WebSocket functionality

### 13. multi-site-testing-partial.spec.ts (partial deprecation)
- **Original Location**: `e2e/examples/multi-site-testing.spec.ts` (lines 73-121)
- **Reason**: Two test suites had incorrect assumptions - wrong URLs and ports
- **Key Tests**: API Integration Tests, Performance Testing with CDP

### 14. vocabulary-functionality.spec.ts
- **Original Location**: `e2e/vocabulary-functionality.spec.ts`
- **Reason**: Uses wrong port (3001) and tests pages that may not exist
- **Key Tests**: Vocabulary table functionality, search/filter features

## Tests That Remain Active

The following test files remain active but may have had failing tests removed:
- `e2e/examples/multi-site-testing.spec.ts` (partially active - some tests removed)
- Other e2e tests not related to authentication or the deprecated features

## Migration Notes

The authentication system has migrated from a custom dropdown-based pattern to Clerk authentication. Key changes:

1. **Login Flow**: Users now use Clerk's SafeSignInButton instead of "Editor Login" links
2. **Auth UI**: The dropdown menu pattern has been replaced with Clerk's built-in UI
3. **Selectors**: Old selectors like `selectors.auth.editorLoginLink` no longer exist
4. **Cross-Site Auth**: Clerk handles session synchronization automatically

## Recommendations

1. **Update Tests**: New tests should be written to properly test Clerk authentication flows
2. **Selector Updates**: Update selectors.ts to remove references to deprecated auth elements
3. **Documentation**: Update test documentation to reflect the new authentication pattern
4. **Coverage**: Ensure new tests cover the same scenarios as the deprecated tests