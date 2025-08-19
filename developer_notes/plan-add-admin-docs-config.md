# Plan: Add Admin Docs Configuration Functions

## Overview
Add `getAdminDocsConfig` and `getAdminDocsConfigAuto` functions to `packages/theme/src/config/siteConfig.ts` that mirror the existing admin portal configuration functions but with different environment URLs.

## Environment URLs
- **Local**: `http://localhost:3030` (port 3030)
- **Preview**: `https://docs-iflastandards-preview.onrender.com`  
- **Production**: `https://docs.iflastandards.info`
- **BaseUrl**: `/` for all environments

## Tasks

- [ ] **Phase 1: Setup & Planning**
  - [x] Create planning document with task checklist
  - [ ] Commit planning document

- [ ] **Phase 2: Implementation**
  - [ ] Define `AdminDocsConfig` interface (copy structure of `AdminPortalConfig`)
  - [ ] Add `ADMIN_DOCS_CONFIG` constant with environment-specific URLs
  - [ ] Implement `getAdminDocsConfig(env: Environment)` function  
  - [ ] Implement `getAdminDocsConfigAuto()` function with hostname detection
  - [ ] Ensure all new exports are properly exported

- [ ] **Phase 3: Testing & Quality**
  - [ ] Create unit tests in `packages/theme/src/config/__tests__/adminDocsConfig.test.ts`
  - [ ] Run lint, typecheck, and tests
  - [ ] Fix any issues until all pass

- [ ] **Phase 4: Documentation & Finalization**
  - [ ] Update relevant documentation with new Admin Docs configuration
  - [ ] Add code examples demonstrating usage
  - [ ] Mark all tasks complete in planning document
  - [ ] Commit final changes with descriptive message

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
- [ ] New functions work identically to admin portal functions
- [ ] All environments return correct configuration objects
- [ ] Auto-detection correctly identifies environment from hostname
- [ ] Tests pass and provide good coverage
- [ ] Documentation is updated
- [ ] Code follows existing patterns and conventions
