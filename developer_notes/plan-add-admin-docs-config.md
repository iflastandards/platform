# Plan: Add Admin Docs Configuration Functions

## Overview
Add `getAdminDocsConfig` and `getAdminDocsConfigAuto` functions to `packages/theme/src/config/siteConfig.ts` that mirror the existing admin portal configuration functions but with different environment URLs.

## Environment URLs
- **Local**: `http://localhost:3030` (port 3030)
- **Preview**: `https://docs-iflastandards-preview.onrender.com`  
- **Production**: `https://docs.iflastandards.info`
- **BaseUrl**: `/` for all environments

## Tasks

- [x] **Phase 1: Setup & Planning**
  - [x] Create planning document with task checklist
  - [x] Commit planning document

- [x] **Phase 2: Implementation**
  - [x] Define `AdminDocsConfig` interface (copy structure of `AdminPortalConfig`)
  - [x] Add `ADMIN_DOCS_CONFIG` constant with environment-specific URLs
  - [x] Implement `getAdminDocsConfig(env: Environment)` function  
  - [x] Implement `getAdminDocsConfigAuto()` function with hostname detection
  - [x] Ensure all new exports are properly exported

- [x] **Phase 3: Testing & Quality**
  - [x] Create unit tests in `packages/theme/src/config/__tests__/adminDocsConfig.test.ts`
  - [x] Run lint, typecheck, and tests
  - [x] Fix any issues until all pass

- [x] **Phase 4: Documentation & Finalization**
  - [x] Update relevant documentation with new Admin Docs configuration
  - [x] Add code examples demonstrating usage
  - [x] Mark all tasks complete in planning document
  - [x] Commit final changes with descriptive message

## Implementation Details

### AdminDocsConfig Interface
Should include the same fields as `AdminPortalConfig`:
- `url: string`
- `signinUrl: string` 
- `dashboardUrl: string`
- `signoutUrl: string`
- `sessionApiUrl: string`
- `port?: number` (only for local environment)

### Environment Detection Logic
Auto-detection should check for:
- `docs.iflastandards.info` → production
- `docs-iflastandards-preview.onrender.com` → preview
- `localhost:3030` or similar → local (default)

## Success Criteria
- [x] New functions work identically to admin portal functions
- [x] All environments return correct configuration objects
- [x] Auto-detection correctly identifies environment from hostname
- [x] Tests pass and provide good coverage (18 tests passed)
- [x] Documentation is updated
- [x] Code follows existing patterns and conventions
