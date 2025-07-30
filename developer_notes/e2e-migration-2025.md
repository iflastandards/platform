# E2E Test Migration 2025

## Migration Summary

This document provides a comprehensive overview of changes required for migrating authentication and route management in the IFLA Standards Platform from NextAuth to Clerk, along with other relevant framework updates.

### General Migration Strategies

- **Migrate**: Update selectors/routes for new features (same feature, new selector/route)
- **Redesign**: Integrate new Clerk features and flow changes (feature exists but flow has changed, needs bigger rewrite)
- **Deprecated**: Remove tests related to removed features (feature removed, test should be deleted)

## Detailed Test Failure Analysis

### Authentication System Changes (NextAuth → Clerk)

#### Core Changes Identified:
1. **Sign-in Route**: `/auth/signin` → Clerk modal-based authentication
2. **Session API**: `/api/auth/session` → Clerk's `useUser()` hook
3. **Authentication Flow**: Server-side session → Client-side Clerk authentication
4. **Middleware**: NextAuth middleware → `clerkMiddleware` with `createRouteMatcher`

### Test Files Requiring Updates

#### 1. `e2e/admin/auth.e2e.test.ts` - **REDESIGN Required**

**Current Issues:**
- Tests expect redirect to `/auth/signin` but Clerk uses modal authentication
- Looking for "Sign in with GitHub" button but Clerk uses `SafeSignInButton` component
- Session mocking uses NextAuth patterns instead of Clerk patterns

**Expected UI/Route/API:**
- **Original**: Redirect to `/auth/signin` page with GitHub OAuth button
- **Current**: Modal-based sign-in triggered by `SafeSignInButton` component

**Changes Required:**
- **Migrate**: Update URL expectations from `/auth/signin` to home page with modal
- **Redesign**: Replace NextAuth session mocking with Clerk user mocking
- **Redesign**: Update button selectors to match Clerk's dynamic import components

**Specific Test Failures:**
``` 
// OLD (NextAuth)
await expect(page).toHaveURL(/.*\/auth\/signin/);
await expect(page.getByRole('button', { name: /sign in with github/i })).toBeVisible();

// NEW (Clerk) - Need to update to:
// Check for modal trigger or home page with sign-in button
// Use Clerk's SafeSignInButton component selector
```

#### 2. `e2e/admin/dashboard-protection.e2e.test.ts` - **REDESIGN Required**

**Current Issues:**
- Tests expect unauthenticated users to be redirected to `/auth/signin`
- Clerk middleware protection works differently than NextAuth

**Expected UI/Route/API:**
- **Original**: Protected routes redirect to `/auth/signin` page
- **Current**: Clerk middleware blocks access, may redirect to home page or show modal

**Changes Required:**
- **Redesign**: Update redirect expectations to match Clerk's protection behavior
- **Migrate**: Update session API mocking to use Clerk's patterns

#### 3. `e2e/admin/auth-basic.spec.ts` - **MIGRATE Required**

**Current Issues:**
- Looking for auth elements using NextAuth-specific selectors
- Session mocking uses old localStorage patterns

**Expected UI/Route/API:**
- **Original**: Traditional auth dropdown in navbar
- **Current**: Clerk-based authentication status components

**Changes Required:**
- **Migrate**: Update selectors to find Clerk authentication components
- **Migrate**: Replace session mocking with Clerk-compatible mocks

#### 4. `e2e/utils/auth-helpers.ts` - **REDESIGN Required**

**Current Issues:**
- Entire helper file is built around NextAuth patterns
- Session mocking, cookie setting, API route mocking all need updates

**Expected UI/Route/API:**
- **Original**: NextAuth session tokens, `/api/auth/session` endpoint
- **Current**: Clerk user objects, Clerk's authentication state management

**Changes Required:**
- **Redesign**: Complete rewrite of auth helpers to use Clerk patterns
- **Deprecated**: Remove NextAuth-specific functions like `setupMockAuth`
- **Migrate**: Create new Clerk-compatible helper functions

### Component and Route Changes

#### Authentication Components

1. **SafeSignInButton** (NEW - MIGRATE)
   - **Location**: `apps/admin/src/components/auth/SafeSignInButton.tsx`
   - **Usage**: Dynamic import of Clerk's `SignInButton` with modal mode
   - **Test Impact**: Button selectors need to account for dynamic loading

2. **Middleware Protection** (CHANGED - REDESIGN)
   - **Location**: `apps/admin/src/middleware.ts`
   - **Change**: `clerkMiddleware` with `createRouteMatcher` for public routes
   - **Test Impact**: Protection behavior differs from NextAuth

3. **Home Page Authentication** (CHANGED - REDESIGN)
   - **Location**: `apps/admin/src/app/page.tsx`
   - **Change**: Uses `useUser()` hook, redirects authenticated users to `/dashboard`
   - **Test Impact**: Authentication flow starts from home page, not dedicated sign-in page

### API Route Changes

#### Authentication APIs

1. **Sign-in Route** (CHANGED - REDESIGN)
   - **Old**: `/api/auth/signin` (NextAuth)
   - **New**: `/api/auth/signin` (Custom implementation with Clerk)
   - **Change**: Now redirects to Clerk's sign-in or dashboard based on auth state

2. **Session API** (REMOVED - DEPRECATED)
   - **Old**: `/api/auth/session` (NextAuth)
   - **New**: Client-side `useUser()` hook (Clerk)
   - **Change**: No longer server-side session API, uses client-side hooks

### Migration Action Plan

#### Phase 1: Update Auth Helpers (REDESIGN)
- [ ] Rewrite `e2e/utils/auth-helpers.ts` for Clerk
- [ ] Create Clerk-compatible user mocking functions
- [ ] Update session state management for tests

#### Phase 2: Update Core Auth Tests (REDESIGN)
- [ ] `auth.e2e.test.ts`: Replace redirect expectations with modal-based flow
- [ ] `dashboard-protection.e2e.test.ts`: Update protection behavior expectations
- [ ] Update button selectors for Clerk components

#### Phase 3: Update Component Tests (MIGRATE)
- [ ] `auth-basic.spec.ts`: Update selectors for Clerk auth components
- [ ] Update navbar and dropdown selectors
- [ ] Fix localStorage and session checking patterns

#### Phase 4: Cross-site Auth Tests (REDESIGN)
- [ ] Update cross-site authentication communication tests
- [ ] Verify Clerk works across different sites in the platform

### Testing Patterns to Update

#### Old NextAuth Patterns (DEPRECATED)
```typescript
// OLD - Remove these patterns
await setupMockAuth(context, 'admin');
await expect(page).toHaveURL(/.*\/auth\/signin/);
await context.route('**/api/auth/session', ...);
```

#### New Clerk Patterns (MIGRATE/REDESIGN)
```typescript
// NEW - Use these patterns instead
// Mock Clerk's useUser hook
// Check for modal-based authentication
// Use Clerk's authentication state management
```

### Notes for Future Updates

1. **Server Connection Issues**: Many tests show connection refused errors, indicating server setup issues during testing that need to be resolved alongside authentication updates.

2. **Component Loading**: Clerk uses dynamic imports which may affect test timing and element detection.

3. **Cross-browser Compatibility**: Authentication changes need to be tested across all browsers (Chrome, Firefox, Safari, Mobile).

4. **Environment Considerations**: Clerk behavior may differ between test, preview, and production environments.

This document should be continually updated as migration steps are undertaken and tested.
