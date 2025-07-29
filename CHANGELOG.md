# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Enhanced Playwright configuration with proper TypeScript typing for CI/CD environments
- Improved error handling in CSV validation endpoints
- Better unused import management across development packages

### Changed
- **BREAKING**: Enhanced Playwright reporter configuration for CI environments
  - Fixed TypeScript type errors in `playwright.config.enhanced.ts`
  - Updated reporter configuration to use proper tuple format: `[['github', {}]]` instead of `['github']`
  - This ensures compatibility with Playwright's strict typing requirements

### Fixed
- **Scripts**: Fixed unused import issues across multiple files
  - Removed unused `parse` import from `apps/admin/src/app/api/validate-csv/route.ts`
  - Removed unused `createClient` import from `supabase/functions/validate-csv/index.ts`
  - Cleaned up unused imports in `packages/dev-servers/src/server-manager.ts`
    - Removed unused `ServerMode` and `BrowserType` type imports
    - Removed unused `readServerState` function import
- **TypeScript**: Fixed admin build configuration
  - Removed problematic dist type includes from `apps/admin/tsconfig.json`
  - Prevents TypeScript errors when Next.js dist directory doesn't exist yet
- **ESLint**: Fixed critical linting errors preventing successful builds
  - All major errors have been resolved, only warnings remain for non-blocking issues

### Migration Notes

#### For Developers
If you have local modifications to the Playwright configuration or CSV validation endpoints, please review your changes against the new implementations to ensure compatibility.

#### For CI/CD Pipelines
The Playwright configuration updates improve CI/CD reliability by:
- Ensuring proper GitHub Actions integration with the `github` reporter
- Better error handling for missing or invalid configuration options
- Improved TypeScript type safety preventing runtime errors

#### Build Process Changes
- The admin TypeScript configuration no longer attempts to include non-existent Next.js type files
- This prevents build failures when the `.next` directory is not present
- No action required from developers - builds will now be more reliable

### Technical Details

#### Playwright Configuration
```typescript
// Before (causing TypeScript errors)
...(process.env.CI ? ['github'] : [])

// After (proper typing)
...(process.env.CI ? [['github', {}] as const] : [])
```

#### TypeScript Configuration
```json
// Removed problematic include path
// "../../dist/apps/admin/.next/types/**/*.ts"
```

This update ensures more reliable builds and better developer experience across all environments.
