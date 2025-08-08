# Deprecated Tests Migration Log

**Date:** January 2025  
**Task:** Step 6 - Remove obsolete tests & specs  

## Analysis Summary

After comprehensive analysis of the codebase looking for test files where **all** tests are tagged as "Deprecated", no such files were found. However, several files contain deprecated elements or will become obsolete due to ongoing migrations.

## Files Analyzed

### Test Files with Deprecated Elements (NOT fully deprecated)
- `packages/theme/src/tests/components/ElementReference.test.tsx` - Contains deprecated test data but active tests
- `packages/theme/src/tests/components/ElementReference-improved.test.tsx` - Has deprecated warnings but active functionality
- `packages/theme/src/tests/scripts/vocabulary-comparison-cli.test.ts` - Contains skipped tests but not deprecated

### Files Marked for Future Removal (Post-Migration)

#### Cerbos-Related Tests (Will be deprecated after Clerk migration)
These files will become obsolete once the Cerbos-to-Clerk migration is complete:

1. **`apps/admin/src/test/lib/cerbos.test.ts`**
   - Full Cerbos integration tests
   - **Reason for removal:** Cerbos authorization system being replaced by Clerk
   - **Timeline:** Not needed - custom RBAC already implemented

2. **`packages/theme/src/tests/deployment/supabase-cerbos-keys.test.ts`**
   - Cerbos key validation tests
   - **Reason for removal:** Cerbos keys no longer needed after migration
   - **Timeline:** After Clerk migration completion

3. **Additional Cerbos test files** (if any exist):
   - `apps/admin/src/test/lib/rbac.test.ts` - Contains Cerbos dependencies
   - `apps/admin/src/test/lib/review-group-authorization.test.ts` - Contains Cerbos dependencies
   - `apps/admin/src/test/lib/namespace-permissions.test.ts` - Contains Cerbos dependencies

#### Authentication Helper Functions (Partially deprecated)
Files with deprecated functions but still containing active code:

1. **`e2e/utils/auth-helpers.ts`**
   - Function `createTestUser()` marked as deprecated (line 35-46)
   - **Reason:** Real Clerk users now managed in Clerk's metadata
   - **Action:** Keep file, function already marked as deprecated with warning

2. **`e2e/utils/session-mock.ts`**
   - Several deprecated parameters in functions (lines 18, 25, 33-35, 78-87)
   - **Reason:** User roles/names now managed through Clerk user data
   - **Action:** Keep file, deprecated parameters already marked with warnings

## Migration Document Updates

### Updated migration documentation:
- **File:** `developer_notes/e2e-migration-2025.md`
- **Note added:** Documented current state where no fully deprecated test files exist yet
- **Future guidance:** Instructions for cleanup post-Cerbos migration

## Package.json Test Script Analysis

Current test script glob patterns in `package.json` are appropriate and do not need updates at this time:
- Line 88: `"lint:tests": "eslint '**/*.test.{js,jsx,ts,tsx}' '**/*.spec.{js,jsx,ts,tsx}' '**/tests/**/*.{js,jsx,ts,tsx}' '**/e2e/**/*.{js,jsx,ts,tsx}'"`
- Line 164: `"test": "node scripts/test-with-daemon.js"`

These patterns will continue to work correctly even after future test file removals.

## Recommendations for Future Cleanup

### Cleanup Notes:
1. Cerbos was never implemented - no cleanup needed
2. Custom RBAC is already in place
3. Test files can be updated as needed during normal development
4. Archive Cerbos policy files and related fixtures

### Immediate Actions:
- No immediate test file removals needed
- All deprecated functions already have appropriate warnings
- Monitor ongoing migrations for when test files become fully obsolete

## Status: COMPLETED ✅

**Result:** Analysis complete. No test files found where all tests are deprecated.  
**Action:** Created migration log for future reference.  
**Next Steps:** Revisit this task after Cerbos-to-Clerk migration completion.
