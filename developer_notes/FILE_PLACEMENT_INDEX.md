# File Placement Index for IFLA Standards Platform

**Generated**: December 2024  
**Purpose**: Provide concrete guidance for AI Agents regarding file location and placement to minimize searching and facilitate correct code placement.

## Platform Distinction

The monorepo contains two distinct platform types:
1. **Next.js Admin App** (`apps/admin/`) - Dynamic web application
2. **Docusaurus Sites** (`standards/*/`) - Static documentation sites

## Test File Placement

### Current State (INCONSISTENT - See Issues)

#### Next.js Admin App Tests

| Test Type | Primary Location | Secondary Locations | Pattern |
|-----------|------------------|---------------------|---------|
| **Unit Tests** | `apps/admin/src/test/unit/` | `apps/admin/src/lib/__tests__/`<br>`apps/admin/src/components/**/__tests__/` | `*.test.{ts,tsx}` |
| **Integration Tests** | `apps/admin/src/test/integration/`<br>`apps/admin/src/tests/integration/` | `apps/admin/src/app/api/**/__tests__/` | `*.integration.test.{ts,tsx}` or `*.test.{ts,tsx}` |
| **Server-Dependent** | `apps/admin/src/test/integration/server-dependent/` | - | `*.test.{ts,tsx}` |
| **E2E Tests** | `e2e/e2e/admin/` | - | `*.e2e.spec.ts` or `*.spec.ts` |
| **Accessibility** | Mixed in component tests | `e2e/accessibility/` | `*.a11y.test.tsx` |

#### Docusaurus Sites Tests

| Test Type | Location | Pattern |
|-----------|----------|---------|
| **Component Tests** | `packages/theme/src/tests/components/` | `*.test.tsx` |
| **Integration Tests** | `packages/theme/src/tests/scripts/` | `*.test.ts` |
| **Config Tests** | `packages/theme/src/tests/config/` | `*.test.ts` |
| **Deployment Tests** | `packages/theme/src/tests/deployment/` | `*.test.ts` |
| **E2E Tests** | `e2e/e2e/standards/` | `*.e2e.spec.ts` |

#### Shared Package Tests

| Package | Test Location | Pattern |
|---------|---------------|---------|
| `unified-spreadsheet` | `packages/unified-spreadsheet/tests/integration/` | `*.integration.test.ts` |
| `dev-servers` | `packages/dev-servers/src/` (co-located) | `*.test.ts` |
| `theme` | `packages/theme/src/tests/` (centralized)<br>`packages/theme/src/components/**/__tests__/` (some co-located) | Mixed patterns |

### 🔴 INCONSISTENCY ALERT

1. **Admin app has TWO test directories**: 
   - `apps/admin/src/test/` (older)
   - `apps/admin/src/tests/` (newer)
   - **RECOMMENDATION**: Consolidate to `apps/admin/src/tests/`

2. **Mixed test placement strategies**:
   - Some packages use co-located tests (`__tests__` folders)
   - Others use centralized (`tests/` directory)
   - **RECOMMENDATION**: Standardize per platform type

3. **Inconsistent naming patterns**:
   - E2E: `.e2e.spec.ts` vs `.spec.ts`
   - Integration: `.integration.test.ts` vs `.test.ts`
   - **RECOMMENDATION**: Always use explicit suffixes

## Component Placement

### Shared UI Components (Docusaurus)

| Component Type | Location | Used By |
|----------------|----------|---------|
| **Vocabulary Components** | `packages/theme/src/components/VocabularyTable/` | All Docusaurus sites |
| **Navigation Components** | `packages/theme/src/components/{InLink,OutLink,SeeAlso}/` | All Docusaurus sites |
| **Layout Components** | `packages/theme/src/components/{Figure,Mandatory,Unique}/` | All Docusaurus sites |
| **Site Management** | `packages/theme/src/components/SiteManagement*/` | Portal site |

### Admin App Components

| Component Type | Location | Description |
|----------------|----------|-------------|
| **UI Primitives** | `apps/admin/src/components/ui/` | Base Material-UI components |
| **Common Components** | `apps/admin/src/components/common/` | Shared across dashboards |
| **Dashboard Components** | `apps/admin/src/components/dashboard/{role}/` | Role-specific dashboards |
| **Auth Components** | `apps/admin/src/components/auth/` | Authentication UI |
| **Accessibility** | `apps/admin/src/components/accessibility/` | A11y utilities |

## Backend/Service Code Placement

### Admin App Backend

| Service Type | Location | Purpose |
|--------------|----------|---------|
| **API Routes** | `apps/admin/src/app/api/` | Next.js API endpoints |
| **Services** | `apps/admin/src/lib/services/` | Business logic |
| **Middleware** | `apps/admin/src/lib/middleware/` | Auth, logging, etc. |
| **Authorization** | `apps/admin/src/lib/authorization.ts` | RBAC logic |
| **Mock Data** | `apps/admin/src/lib/mock-data/` | Test/demo data |
| **Schemas** | `apps/admin/src/lib/schemas/` | Zod validation schemas |
| **Cache** | `apps/admin/src/lib/cache/` | Caching utilities |
| **Debug** | `apps/admin/src/lib/debug/` | Debug utilities |

### Shared Backend Utilities

| Utility Type | Location | Purpose |
|--------------|----------|---------|
| **Spreadsheet Processing** | `packages/unified-spreadsheet/src/` | CSV/Excel handling |
| **RDF Converters** | `tools/typescript/rdf-converters/src/` | RDF to CSV/MDX |
| **Sheet Sync** | `tools/sheet-sync/src/` | Google Sheets sync |
| **Dev Servers** | `packages/dev-servers/src/` | Development server management |

## Test Fixtures & Mocks

### Current Locations

| Type | Location | Used By |
|------|----------|---------|
| **Admin Mocks** | `apps/admin/src/test/mocks/` | Admin tests |
| **Theme Fixtures** | `packages/theme/src/tests/fixtures/` | Theme tests |
| **E2E Fixtures** | `e2e/fixtures/` | E2E tests |
| **RDF Test Data** | `tools/typescript/rdf-converters/tests/fixtures/` | RDF converter tests |

### 🔴 INCONSISTENCY: No centralized mock/fixture strategy

## Configuration Files

### TypeScript Configs

| Config | Count | Locations | Purpose |
|--------|-------|-----------|---------|
| **Root** | 1 | `tsconfig.json` | Base configuration |
| **Test** | 1 | `tsconfig.test.json` | Test-specific config |
| **Apps** | 1 | `apps/admin/tsconfig.json` | Admin app config |
| **Packages** | Multiple | `packages/*/tsconfig.json` | Package-specific |
| **Sites** | 7 | `standards/*/tsconfig.json` | Each Docusaurus site |
| **Tools** | 2 | `tools/*/tsconfig.json` | Tool configs |

### Vitest Configs

| Location | Purpose |
|----------|---------|
| `apps/admin/vitest.config.ts` | Admin app tests |
| `packages/unified-spreadsheet/vitest.config.ts` | Spreadsheet tests |
| `packages/dev-servers/vitest.config.ts` | Dev server tests |
| `scripts/vitest.config.ts` | Script tests |
| `tools/typescript/rdf-converters/vitest.config.ts` | RDF converter tests |

### Nx Configuration

| File | Purpose |
|------|---------|
| `nx.json` | Global Nx settings |
| `*/project.json` | Per-project Nx targets |

## Tools & Scripts

| Tool/Script | Location | Purpose |
|-------------|----------|---------|
| **Scaffolding** | `scripts/scaffold-site.ts` | Create new sites |
| **Page Templates** | `scripts/page-template-generator.ts` | Generate pages |
| **Port Manager** | `scripts/port-manager.ts` | Manage dev ports |
| **Validation** | `scripts/validate-*.ts` | Various validators |
| **Profile Copy** | `tools/profile-copy.ts` | Copy profiles |

## Recommended File Placement (AI Agents)

### When Creating New Test Files

```typescript
// For Next.js Admin App
if (testType === 'unit') {
  path = 'apps/admin/src/tests/unit/[feature].test.ts'
} else if (testType === 'integration') {
  path = 'apps/admin/src/tests/integration/[feature].integration.test.ts'
} else if (testType === 'e2e') {
  path = 'e2e/e2e/admin/[feature].e2e.spec.ts'
}

// For Docusaurus Sites
if (testType === 'component') {
  path = 'packages/theme/src/tests/components/[Component].test.tsx'
} else if (testType === 'e2e') {
  path = 'e2e/e2e/standards/[site]-[feature].e2e.spec.ts'
}

// For Shared Packages
if (packageName === 'unified-spreadsheet') {
  path = 'packages/unified-spreadsheet/tests/integration/[feature].integration.test.ts'
}
```

### When Creating New Components

```typescript
// For Admin App
if (componentType === 'dashboard') {
  path = 'apps/admin/src/components/dashboard/[role]/[Component].tsx'
} else if (componentType === 'common') {
  path = 'apps/admin/src/components/common/[Component].tsx'
} else if (componentType === 'ui') {
  path = 'apps/admin/src/components/ui/[component].tsx' // lowercase for shadcn
}

// For Docusaurus (shared across sites)
if (platform === 'docusaurus') {
  path = 'packages/theme/src/components/[Component]/index.tsx'
  stylePath = 'packages/theme/src/components/[Component]/styles.module.scss'
}
```

### When Creating New API Routes

```typescript
// Next.js Admin Only
if (isProtected) {
  path = 'apps/admin/src/app/api/admin/[resource]/route.ts'
} else {
  path = 'apps/admin/src/app/api/[endpoint]/route.ts'
}
```

### When Creating Services/Backend Logic

```typescript
// Admin App Services
path = 'apps/admin/src/lib/services/[service-name].ts'

// Shared Processing Tools
if (isSpreadsheetRelated) {
  path = 'packages/unified-spreadsheet/src/[feature].ts'
} else if (isRDFRelated) {
  path = 'tools/typescript/rdf-converters/src/[feature].ts'
}
```

## Major Inconsistencies Summary

1. **Duplicate test directories** in admin app (`test/` vs `tests/`)
2. **Mixed test placement** strategies (co-located vs centralized)
3. **Inconsistent test naming** patterns
4. **No standardized mock/fixture** organization
5. **Multiple TypeScript configs** without clear hierarchy
6. **Scattered Vitest configs** without shared base

## Recommendations for Standardization

1. **Consolidate admin test directories** to `apps/admin/src/tests/`
2. **Adopt platform-specific standards**:
   - Admin: Centralized in `src/tests/`
   - Docusaurus: Centralized in `packages/theme/src/tests/`
   - Packages: Based on package complexity
3. **Enforce naming conventions**:
   - Unit: `*.test.ts`
   - Integration: `*.integration.test.ts`
   - E2E: `*.e2e.spec.ts`
4. **Create shared test utilities** in `packages/test-utils/`
5. **Centralize mock data** in `packages/mock-data/`
6. **Create base configs** that others extend

## Notes for AI Agents

- **Always check existing patterns** in the specific area you're working
- **Prefer the newer location** when duplicates exist
- **Use explicit test type suffixes** for clarity
- **Follow platform conventions** (Next.js vs Docusaurus)
- **Check for existing utilities** before creating new ones