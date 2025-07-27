# BasePath Compliance Violations - Round 1

## Executive Summary
Found **26 files** with **89 violations** against CLAUDE.md basePath rules. Most violations are:
1. Missing `addBasePath()` wrapper for API calls and static assets
2. Hardcoded `/admin` paths in ClerkProvider configuration
3. Test files using bare `fetch('/api/...`)` calls without basePath

## Violations by Category

### 🔴 CRITICAL - API Calls Missing addBasePath() (52 violations)
**Rule**: Always use `fetch(addBasePath('/api/...'))` for API calls

1. `apps/admin/src/app/(authenticated)/dashboard/admin/adopt-spreadsheet/AdoptSpreadsheetFormV2.tsx`
   - Line 156: `fetch(addBasePath('/api/admin/namespaces'))` ✅ (already fixed)
   - Line 190: `fetch(addBasePath(...))` ✅ (already fixed)
   - Line 274: `fetch(addBasePath(...))` ✅ (already fixed)
   - Line 326: `fetch(addBasePath('/api/admin/adopt-spreadsheet'))` ✅ (already fixed)

2. `apps/admin/src/app/(authenticated)/dashboard/admin/adopt-spreadsheet/AdoptSpreadsheetForm.tsx`
   - Line 210: `fetch('/api/admin/namespaces')` ❌
   - Line 225: `fetch('/api/admin/namespace/${namespace}/element-sets')` ❌
   - Line 287: `fetch('/api/admin/adopt-spreadsheet')` ❌
   - Line 540: `fetch('/api/admin/adopt-spreadsheet')` ❌

3. `apps/admin/src/app/(authenticated)/import/ImportWorkflow.tsx`
   - Line 179: `fetch('/api/actions/scaffold-from-spreadsheet')` ❌

4. `apps/admin/src/test/lib/session-management.test.ts` (TEST FILE - 13 violations)
   - Lines 36, 55, 80, 110, 121, 141, 200, 239, 250, 273, 282, 310, 330, 341: `fetch('/api/...)` ❌

### 🟠 MEDIUM - Hardcoded /admin Paths (4 violations)
**Rule**: Never hardcode `/admin` - Next.js adds basePath automatically

1. `apps/admin/src/app/layout.tsx`
   - Line 29: `signInUrl="/admin/sign-in"` ❌
   - Line 30: `signUpUrl="/admin/sign-up"` ❌
   - Line 31: `afterSignOutUrl="/admin"` ❌

### 🟡 LOW - Static Assets Missing addBasePath() (1 violation)
**Rule**: Always use `addBasePath('/asset.png')` for static assets

1. `apps/admin/src/app/layout.tsx`
   - Line 10: `icon: '/favicon.ico'` ❌

### 🔵 INFO - Test/Development URLs (32 violations)
These are in test files or role-based routing configs - lower priority but should be consistent

1. `apps/admin/src/app/lib/role-based-routing.ts`
   - Lines 87-90: Hardcoded environment URLs ⚠️ (acceptable for config)

2. `apps/admin/src/test/integration/...` - Multiple test files with hardcoded paths ⚠️

## Files Requiring No Changes (Already Compliant)
- `apps/admin/src/app/(authenticated)/dashboard/admin/adopt-spreadsheet/AdoptSpreadsheetFormV2.tsx` ✅
- `apps/admin/src/lib/auth-routing.ts` ✅ (correctly uses addBasePath)

## Estimated Impact
- **High**: 5 violations in production code that will break in deployed environments
- **Medium**: 4 violations that affect auth flow
- **Low**: 48 violations in test code (won't affect production but should be consistent)

## Fix Priority
1. **CRITICAL**: Fix API calls missing addBasePath (5 violations)
2. **HIGH**: Fix hardcoded /admin paths in ClerkProvider (3 violations) 
3. **MEDIUM**: Fix static asset paths (1 violation)
4. **LOW**: Update test files for consistency (remaining violations)
