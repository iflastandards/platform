# E2E Test Inventory and Migration Plan

## Overview
This document provides a comprehensive inventory of all E2E and integration tests in the codebase and their migration status to the new Nx-optimized framework.

## Migration Status Summary
- **Total Tests Found**: 15 active E2E tests + 14 deprecated + 6 server-dependent integration tests
- **Successfully Migrated**: 8 E2E tests ✅
- **Server-Dependent Tests**: 6 integration tests (keep in current location) ✅
- **Needs Migration**: 0 tests (all active tests properly categorized)
- **Handoff Tests**: 2 tests (purpose unclear, may be examples)
- **API Integration**: 1 test (keep in current location)
- **Scripts Integration**: 1 test (keep in current location)

## Test Categories

### 🟢 Already Migrated (Using New Framework)
These tests are already using the new framework structure:

#### Smoke Tests (`e2e/smoke/`)
- ✅ `api-health.smoke.spec.ts` - API health check smoke test
- ✅ `auth.smoke.spec.ts` - Authentication smoke test  
- ✅ `dashboard.smoke.spec.ts` - Dashboard smoke test

#### Integration Tests (`e2e/integration/`)
- ✅ `admin-flows.integration.spec.ts` - Admin workflow integration
- ✅ `cross-service.integration.spec.ts` - Cross-service integration
- ✅ `rbac.integration.spec.ts` - RBAC integration test

### ✅ Successfully Migrated Tests
These tests have been successfully migrated to the new framework:

#### Portal/Site Tests
1. **`e2e/portal-smoke.spec.ts`** → `e2e/smoke/portal.smoke.spec.ts`
   - Tags: `@portal @critical @smoke`
   - Uses: `smokeTest` utility

2. **`e2e/standards-smoke.spec.ts`** → `e2e/smoke/standards.smoke.spec.ts`
   - Tags: `@standards @smoke`
   - Uses: `smokeTest` utility with dynamic test generation

3. **`e2e/site-validation.spec.ts`** → `e2e/integration/site-validation.integration.spec.ts`
   - Tags: `@sites @validation @integration`
   - Uses: `integrationTest` utility

#### Admin Tests
4. **`e2e/admin-architecture/superadmin-dashboard.spec.ts`** → `e2e/e2e/admin/superadmin-dashboard.e2e.spec.ts`
   - Tags: `@admin @rbac @critical @e2e`
   - Uses: `e2eTest` utility with mock session helpers

#### Performance Tests
5. **`e2e/performance.spec.ts`** → `e2e/e2e/performance/load-testing.e2e.spec.ts`
   - Tags: `@performance @slow @e2e`
   - Uses: `e2eTest` utility

#### Visual Tests
6. **`e2e/visual-regression-enhanced.spec.ts`** → `e2e/e2e/visual/regression.e2e.spec.ts`
   - Tags: `@visual @slow @e2e`
   - Uses: `e2eTest` utility with multiple viewports

#### Build Validation
7. **`e2e/post-build-validation.spec.ts`** → `e2e/integration/build-validation.integration.spec.ts`
   - Tags: `@build @validation @integration`
   - Uses: `integrationTest` utility

#### Standards Tests
8. **`standards/ISBDM/e2e/sensory-test-vocabulary.e2e.test.ts`** → `e2e/e2e/standards/isbdm-sensory-vocabulary.e2e.spec.ts`
   - Tags: `@standards @vocabulary @isbdm @e2e`
   - Uses: `e2eTest` utility

### 🟡 Tests Not Migrated (Keep in Current Location)

#### Server-Dependent Integration Tests
Located in `apps/admin/src/test/integration/server-dependent/`:

1. **`admin-startup-test.test.ts`**
   - Tests admin server startup with health checks
   - Requires running Next.js server on port 3007
   - Uses vitest with server-dependent config

2. **`basic-server-test.test.ts`**
   - Basic server lifecycle tests
   - Tests server start/stop functionality

3. **`cors-integration.test.ts`**
   - Tests CORS headers and cross-origin requests
   - Requires admin server running

4. **`cross-site-auth.test.ts`**
   - Tests authentication between admin and Docusaurus sites
   - Requires both admin (3007) and newtest (3008) servers

5. **`simple-spawn-test.test.ts`**
   - Tests process spawning capabilities
   - Basic command execution tests

6. **`spawn-test.test.ts`**
   - Advanced process spawning tests
   - Tests complex server management scenarios

**Run Command**: `pnpm test:server-dependent` (from apps/admin directory)

#### API Integration Tests
7. **`apps/admin/src/app/api/actions/scaffold-from-spreadsheet/__tests__/route.integration.test.ts`**
   - Keep in current location for API testing
   - Ensure excluded from unit test runs

#### Script Integration Tests
8. **`scripts/page-template-generator.integration.test.ts`**
   - Keep in scripts directory
   - Part of tooling tests

### 🔍 Tests Needing Investigation

#### Handoff Tests (Purpose Unclear)
1. **`e2e/simple-handoff.spec.ts`**
   - May be example/demo code
   - Needs investigation to determine if active test

2. **`e2e/interactive-headless-handoff.spec.ts`**
   - May be example/demo code
   - Needs investigation to determine if active test

#### Affected Tests (May be duplicates)
3. **`e2e/site-validation-affected.spec.ts`**
   - Appears to be a variant of site-validation
   - May not be needed with new framework

4. **`e2e/standards-smoke-affected.spec.ts`**
   - Appears to be a variant of standards-smoke
   - May not be needed with new framework

5. **`e2e/examples/multi-site-testing.spec.ts`**
   - Example file, not an active test
   - Keep as reference

### 📦 Deprecated Tests (Reference Only)
Located in `e2e/_deprecated/`:
- auth-basic.spec.ts
- auth-dropdown-validation.e2e.test.ts
- auth-roles.spec.ts
- auth-simple.spec.ts
- auth.e2e.test.ts
- cross-site-auth-communication.e2e.test.ts
- dashboard-protection.e2e.test.ts
- docs-env-validation.spec.ts
- environment-fallback.spec.ts
- multi-site-testing-partial.spec.ts
- rbac-scenarios.e2e.test.ts
- server-integration.spec.ts
- site-management-workflow.e2e.test.ts
- vocabulary-functionality.spec.ts

## Migration Status

### ✅ Completed Tasks
1. **Phase 1: Categorization** - COMPLETE
   - Inventoried all tests
   - Analyzed and categorized each test
   - Documented required tags

2. **Phase 2: Test Updates** - COMPLETE
   - Added appropriate tags to all migrated tests
   - Updated imports to use `tagged-test` utilities
   - Ensured tests follow new patterns
   - Updated test timeouts and retry logic

3. **Phase 3: File Movement** - COMPLETE
   - Moved all active tests to correct directory structure
   - Updated all imports
   - Verified tests run correctly

### 🔄 Remaining Tasks

4. **Phase 4: Cleanup** - IN PROGRESS
   - ✅ Keep deprecated tests in `e2e/_deprecated/` for reference
   - ⏳ Set up Clerk authentication fixtures (Task #4)
   - ⏳ Remove old test files from root `e2e/` directory
   - ⏳ Update CI/CD configurations to use new test commands

## Test Organization Structure

### E2E Tests (Playwright-based)
Located in `/e2e/` directory:
- **Smoke Tests** (`e2e/smoke/`) - Quick validation tests
- **Integration Tests** (`e2e/integration/`) - Cross-service tests  
- **E2E Tests** (`e2e/e2e/`) - Full user journey tests

### Server-Dependent Integration Tests (Vitest-based)
Located in `apps/admin/src/test/integration/server-dependent/`:
- Require running servers (Next.js, Docusaurus)
- Test real server interactions, CORS, authentication
- Run with `pnpm test:server-dependent`
- Use dedicated test server manager

### API Integration Tests (Vitest-based)
Located alongside API routes:
- Test API endpoints with real dependencies
- May require database or external services
- Run with integration test configuration

## Test Categorization Guidelines

### Smoke Tests (@smoke)
- Quick validation (<10s per test)
- Core functionality only
- No complex setup
- No external dependencies
- 100% pass rate required

### Integration Tests (@integration)
- Cross-service functionality (<30s per test)
- May require database/API setup
- Can test multiple components
- 95% pass rate required
- 1 retry allowed

### E2E Tests (@e2e)
- Complete user journeys (<60s per test)
- Full application flows
- May be slower/more complex
- 90% pass rate required
- 2 retries allowed

## Next Steps

1. Review each test file to understand its purpose
2. Categorize tests based on the guidelines above
3. Begin migration starting with the simplest tests
4. Update imports and add tags progressively
5. Test each migrated file to ensure it works
6. Move files to new structure once validated