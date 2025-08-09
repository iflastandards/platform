# AI Development Guidelines

**Version:** 1.0  
**Date:** January 2025  
**Status:** Active Reference Document

## Overview

This document provides comprehensive guidelines for AI assistants and developers using AI tools within the IFLA Standards Platform. It ensures consistent implementation patterns, proper test placement, and alignment with our 5-phase testing strategy.

## Core Principles for AI Development

### 1. Evidence Over Assumptions
- **Always verify** with actual code/data before making changes
- **Read existing implementations** before creating new ones
- **Use MCP servers** for accurate, up-to-date library information
- **Trust implementation over documentation** when they conflict

### 2. Integration-First Testing Philosophy
- **Prioritize real-world testing** with actual data, files, and services
- **Use mocks sparingly** - only for pure unit tests
- **Test with real I/O** - actual files, databases, and services
- **Default to integration tests** over unit tests

### 3. Platform Awareness
- **Identify the platform** (Admin Portal vs Documentation Sites) before coding
- **Apply platform-specific patterns** (Next.js for admin, Docusaurus for docs)
- **Use correct styling approach** (Material-UI for admin, Infima/SASS for docs)
- **Check system-design-docs** for authoritative specifications

## MCP Server Usage Strategy

### Decision Tree for Tool Selection

```
START: What type of task?
│
├─> 🔍 SEARCHING CODEBASE?
│   └─> USE JetBrains MCP FIRST (file search, content search, structure)
│
├─> 📚 USING EXTERNAL LIBRARY?
│   ├─> React/Next.js/TypeScript → USE Context7
│   ├─> Material-UI → USE MUI MCP
│   └─> Other libraries → USE Context7
│
├─> 🎨 BUILDING UI?
│   ├─> MUI component → USE MUI MCP (required)
│   └─> React patterns → USE Context7
│
├─> 🧩 COMPLEX PROBLEM?
│   └─> USE Sequential Thinking + JetBrains
│
└─> ✏️ SIMPLE EDIT? → Use native tools
```

### Key MCP Servers

1. **JetBrains MCP**: Codebase intelligence, search, and navigation
2. **Context7**: Library documentation and API references
3. **MUI MCP**: Material-UI component documentation
4. **Sequential Thinking**: Complex problem analysis and planning
5. **Nx MCP**: Nx workspace and build system information

## 5-Phase Testing Strategy Integration

Our testing approach follows a progressive validation strategy:

### Phase 1: Selective Tests (Development Focus)
- **Purpose**: Individual testing for focused development work and TDD
- **When**: During active development, debugging, feature work  
- **Speed**: < 30 seconds per test file
- **Commands**: 
  ```bash
  pnpm nx test {project}
  pnpm test --grep "@unit"
  pnpm test --grep "@critical"
  ```

### Phase 2: Pre-Commit Tests (Automated Git Hook)
- **Purpose**: Fast feedback loop preventing broken commits
- **When**: Automatically on every `git commit`
- **Speed**: < 60 seconds for typical changes
- **What runs**: TypeScript, ESLint, unit tests (affected only)

### Phase 3: Pre-Push Tests (Automated Git Hook)  
- **Purpose**: Integration tests and deployment readiness validation
- **When**: Automatically on every `git push`
- **Speed**: < 180 seconds
- **What runs**: Integration tests, builds, E2E (if portal/admin affected)

### Phase 4: Comprehensive Tests (Manual/Release)
- **Purpose**: Full validation before major releases
- **When**: Release preparation, major refactoring validation
- **Speed**: < 300 seconds
- **Commands**: `pnpm test:comprehensive`

### Phase 5: CI Environment Tests (Automated Pipeline)
- **Purpose**: Validate deployment environment, secrets, infrastructure ONLY
- **When**: GitHub Actions CI pipeline
- **What runs**: Environment variables, API tokens, external service connectivity

## Test Classification and Placement

### Quick Decision Tree

```
Is the test environment-dependent?
├─ YES → Place in `**/tests/deployment/` → Runs in CI only
└─ NO → Continue...
   │
   Does it test integration between components/services?
   ├─ YES → Name with `.integration.test.ts` → Runs in pre-push
   └─ NO → Continue...
      │
      Is it an E2E test?
      ├─ YES → Place in `e2e/` directory → Runs in pre-push (smart trigger)
      └─ NO → It's a unit test → Name with `.test.ts` → Runs in pre-commit
```

### Test File Naming Conventions

| Test Type | File Pattern | Example | Phase |
|-----------|--------------|---------|-------|
| Unit | `*.test.ts` | `utils.test.ts` | Phase 2 |
| Integration | `*.integration.test.ts` | `api.integration.test.ts` | Phase 3 |
| E2E | `*.e2e.test.ts` | `workflow.e2e.test.ts` | Phase 3 |
| Environment | `env-*.test.ts` | `env-deployment.test.ts` | Phase 5 |

### Test Tagging System

```typescript
// Category Tags (Required - Pick ONE)
describe('Feature @integration @api @validation', () => {
  // Integration test with functional tags
});

describe('Pure Function @unit', () => {
  // Unit test (rare - use sparingly)
});

test('User Workflow @e2e @critical @authentication', async ({ page }) => {
  // E2E test with priority and functional tags
});

describe('Deployment @env @ci-only', () => {
  // Environment test (CI only)
});
```

## Authorization Testing Guidelines

### Custom RBAC Context

Our platform uses custom RBAC with Clerk's publicMetadata (NOT Clerk Organizations):

- **Caching Layer**: Permission checks cached for 5 minutes (reduces latency from ~50ms to <1ms)
- **withAuth Middleware**: All protected API routes use our custom middleware
- **Debug Mode**: Comprehensive debugging via environment variables and `/api/admin/auth/debug` endpoint
- **Test Users**: 5 pre-configured Clerk users with specific roles (all use verification code `424242`)

### Unit vs Integration Tests for Authorization

#### Unit Tests (Authorization Logic Only)
```typescript
/**
 * @unit @auth
 * Unit tests for authorization functions - test logic in isolation
 */
describe('Authorization Functions @unit @auth', () => {
  beforeEach(() => {
    // Mock Clerk completely for unit tests
    vi.mock('@clerk/nextjs/server', () => ({
      currentUser: vi.fn()
    }));
  });

  test('canPerformAction allows superadmin all actions', async () => {
    // Mock user data for unit test
    const mockCurrentUser = vi.mocked(currentUser);
    mockCurrentUser.mockResolvedValue({
      id: 'test-superadmin',
      publicMetadata: { roles: { superadmin: true } }
    });

    const result = await canPerformAction('namespace', 'delete', {
      namespaceId: 'any-namespace'
    });

    expect(result).toBe(true);
  });
});
```

#### Integration Tests (API Routes with Real Users)
```typescript
/**
 * @integration @auth @api
 * Integration tests for API routes - use real test users, no mocking
 */
describe('Protected API Routes @integration @auth', () => {
  let testUsers: ClerkTestUsers;
  
  beforeAll(async () => {
    // Use real Clerk test users (no mocking)
    testUsers = await loadClerkTestUsers();
  });
  
  test('RG Admin can create namespace via API', async () => {
    // Use real test user authentication
    const response = await authenticatedFetch('/api/admin/namespaces', {
      method: 'POST',
      user: testUsers.reviewGroupAdmin,
      body: JSON.stringify({
        name: 'Test Namespace',
        reviewGroupId: 'isbd'
      })
    });
    
    expect(response.status).toBe(200);
    
    // Verify actual database record was created
    const namespace = await supabase
      .from('namespaces')
      .select('*')
      .eq('name', 'Test Namespace')
      .single();
    
    expect(namespace.data).toBeDefined();
  });
});
```

## Implementation Rules for AI Assistants

### Critical Rules
1. **NEVER use `any` without eslint-disable comment**
2. **ALWAYS run `pnpm typecheck && pnpm lint` after edits**
3. **ALWAYS fix code to pass tests, never fix tests to pass**
4. **ALWAYS ensure local validation (Phases 1-4) passes before pushing**
5. **NEVER commit secrets or API keys** - pre-commit hooks will block
6. **Use `workspaceUtils` in integration tests, not `process.cwd()`**
7. **Include `experimental_faster: true` in all `docusaurus.config.ts` files**

### Code Style Requirements
- **Imports**: Use path aliases (`@ifla/theme`, `@site/*`), remove unused imports
- **Formatting**: Single quotes, Prettier config in `.prettierrc`
- **Types**: Prefer explicit types over `any`, use eslint-disable when necessary
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **React**: No React import needed (JSX transform), hooks rules enforced
- **Error handling**: Use proper TypeScript error types, avoid generic catches
- **Comments**: DO NOT ADD comments unless explicitly requested

### Platform-Specific Patterns

#### Admin Portal (Next.js)
- **Components**: `apps/admin/src/components/`
- **API Routes**: `apps/admin/src/app/api/`
- **Tests**: `apps/admin/src/test*/`, `apps/admin/e2e/`
- **Styling**: Material-UI theme system ONLY (NO Tailwind CSS)
- **Auth**: Clerk required

#### Documentation Sites (Docusaurus)
- **Components**: `packages/theme/src/components/` (shared globally)
- **Tests**: `packages/theme/src/tests/`
- **Styling**: Infima + SASS/SCSS
- **Content**: MDX files in `docs/`
- **No API routes** - static generation only

## Common Patterns and Anti-Patterns

### ✅ Good: Integration Test with Real I/O

```typescript
test('should convert Excel to CSV with real files', async () => {
  const xlsxPath = './fixtures/data.xlsx';
  const csvPath = './output/data.csv';
  
  await convertExcelToCsv(xlsxPath, csvPath);
  
  // Verify actual file was created
  const exists = await fs.access(csvPath).then(() => true).catch(() => false);
  expect(exists).toBe(true);
  
  // Verify content is correct
  const content = await fs.readFile(csvPath, 'utf-8');
  expect(content).toContain('header1,header2,header3');
  expect(content.split('\n')).toHaveLength(101);
});
```

### ❌ Bad: Over-Mocked Unit Test

```typescript
// AVOID THIS PATTERN
test('should read file', async () => {
  const mockFs = {
    readFile: jest.fn().mockResolvedValue('mocked content')
  };
  
  const reader = new FileReader(mockFs);
  const content = await reader.read('file.txt');
  
  expect(mockFs.readFile).toHaveBeenCalledWith('file.txt');
  expect(content).toBe('mocked content');
});
// This test only verifies that mocks work, not that the code works
```

## Performance Guidelines

### Phase-Specific Performance Targets

- **Phase 1 (Selective)**: < 30 seconds per test file
- **Phase 2 (Pre-commit)**: < 60 seconds total
- **Phase 3 (Pre-push)**: < 180 seconds total  
- **Phase 4 (Comprehensive)**: < 300 seconds total
- **Phase 5 (CI Environment)**: < 180 seconds total

### Optimization Techniques

```typescript
describe('Optimized Integration Tests', () => {
  // Share expensive resources
  let testDb: TestDatabase;
  
  beforeAll(async () => {
    testDb = await createTestDatabase();
  });
  
  afterAll(async () => {
    await testDb.cleanup();
  });
  
  // Use test fixtures
  const fixtures = {
    smallCsv: './fixtures/small.csv',
    largeCsv: './fixtures/large.csv',
    complexXlsx: './fixtures/complex.xlsx'
  };
  
  test('should process file efficiently', async () => {
    // Use pre-created test file
    const result = await processFile(fixtures.smallCsv);
    expect(result.rows).toBe(100);
  });
});
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Integration Tests Not Found
- Check file naming: must include `.integration.test.ts`
- Verify vitest config includes `tests/**` directory
- Clear Nx cache: `pnpm nx reset`
- Run tests with: `pnpm nx test [project]`

#### Slow Integration Tests
- Use smaller test fixtures
- Share expensive setup with `beforeAll`
- Run tests in parallel
- Profile with `vitest --reporter=verbose`

#### Authorization Test Issues
- Verify test user has correct metadata structure in Clerk
- Check that `publicMetadata` matches expected format
- Enable debug mode: `AUTH_DEBUG=true AUTH_DEBUG_VERBOSE=true`
- Check debug endpoint: `/api/admin/auth/debug?action=logs`

#### Cache-Related Test Failures
- Clear cache between tests: `clearTestUsersCache()`
- Account for 5-minute TTL when testing cache expiration
- Use `vi.useFakeTimers()` for time-dependent cache tests

## Quick Reference Commands

### Development Commands
```bash
# Admin portal
pnpm nx dev admin --turbopack         # Start dev server
pnpm nx build admin                   # Build
pnpm nx test admin                    # Test

# Documentation sites
pnpm nx start {site}                  # Start dev (e.g., isbd, portal)
pnpm nx build {site}                  # Build site

# Testing (ALWAYS use affected)
pnpm test                             # Runs nx affected
pnpm nx affected -t test --parallel=3 # Manual affected
pnpm typecheck                        # Type checking
pnpm lint                             # Linting
```

### Test Commands by Phase
```bash
# Phase 1: Selective Testing (Development)
pnpm nx test unified-spreadsheet
pnpm test --grep "@critical"

# Phase 2-3: Automated (Pre-commit/Pre-push)
pnpm test:pre-commit                  # Phase 2 equivalent
pnpm test:pre-push                    # Phase 3 equivalent

# Phase 4: Comprehensive Testing
pnpm test:comprehensive               # All tests, parallelized

# Phase 5: CI Environment (Automated)
pnpm test:ci:env                      # Environment validation only
```

## Related Documentation

- **System Architecture**: [Doc 1 - System Architecture Overview](./01-system-architecture-overview.md)
- **Platform Guide**: [Doc 20 - Platform-Specific Architecture Guide](./20-platform-specific-architecture-guide.md)
- **Testing Strategy**: [Doc 6 - Testing Strategy](./06-testing-strategy.md)
- **RBAC Implementation**: [Doc 14 - RBAC Implementation](./14-rbac-implementation.md)
- **Developer Notes**: See `developer_notes/` for detailed implementation guides

This guide ensures AI assistants and developers maintain consistency, quality, and efficiency when working with the IFLA Standards Platform codebase.