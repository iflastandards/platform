# Testing Quick Reference

**Purpose**: Concise testing guide for developers and AI agents working on the IFLA Standards Platform. We follow an **integration-first testing philosophy** within a **5-phase testing strategy** - preferring real I/O and actual data over mocks.

**📋 Full Strategy**: See [TESTING_STRATEGY.md](./TESTING_STRATEGY.md) for complete 5-phase approach.

**🔐 Auth Context**: Custom RBAC with Clerk metadata (NOT Organizations). All protected routes use `withAuth` middleware. Permission checks cached for 5min (50ms→<1ms).

## 🎯 Test Decision Tree (30 Seconds)

```
Need to write a test?
├─ Uses env vars/external services? → @env test in tests/deployment/
├─ Tests user workflow in browser? → @e2e test in e2e/
├─ Uses files/DB/multiple components? → @integration test (DEFAULT)
└─ Pure function only? → @unit test (RARE)
```

## 🔐 Test Users (Quick Access)

| Email | Role | Access |
|-------|------|--------|
| `superadmin+clerk_test@example.com` | System Admin | Full system |
| `rg_admin+clerk_test@example.com` | RG Admin | ISBD review group |
| `editor+clerk_test@example.com` | Editor | ISBD/ISBDM namespaces |
| `author+clerk_test@example.com` | Author | LRM namespace |
| `translator+clerk_test@example.com` | Translator | French for ISBD/LRM |

All use verification code: **`424242`**

## 📋 Required Tags

### Category (Pick ONE)
- `@integration` - **DEFAULT**: Multiple components with real I/O
- `@e2e` - Browser automation tests
- `@env` - Environment/deployment tests
- `@unit` - Pure functions only (rare)

### Add Functional Tags
- `@api`, `@auth`, `@rbac`, `@ui`, `@validation`, `@security`, `@performance`, `@a11y`, `@cache`

### Add Priority (Optional)
- `@critical`, `@happy-path`, `@error-handling`, `@edge-case`

## 🚀 Phase-Aware Commands

### Phase 1: Selective Testing (Development)
```bash
# ✅ Individual project testing:
pnpm nx test unified-spreadsheet
pnpm nx test @ifla/theme
pnpm nx test portal

# ✅ Tag-based selection:
pnpm test --grep "@unit"              # Unit tests only
pnpm test --grep "@integration"       # Integration tests only
pnpm test --grep "@critical"          # Critical tests only
pnpm test --grep "@api.*@validation"  # API validation tests

# ✅ Affected testing:
pnpm test                             # nx affected --target=test
```

### Phase 2-3: Automated (Git Hooks)
```bash
# These run automatically, but can be triggered manually:
pnpm test:pre-commit                  # Phase 2 equivalent
pnpm test:pre-push                    # Phase 3 equivalent
```

### Phase 4: Comprehensive Testing
```bash
pnpm test:comprehensive               # All tests, parallelized
pnpm test:comprehensive:unit          # All unit tests
pnpm test:comprehensive:e2e           # All E2E tests
```

### Phase 5: CI Environment (Automated)
```bash
# E2E tests (Playwright)
pnpm playwright test --grep "@smoke"
pnpm playwright test --grep "@critical"
```

## 📁 File Placement

```
packages/[package-name]/
├── src/
│   └── components/
│       └── Button.tsx
├── tests/
│   ├── integration/                     # Most tests go here
│   │   └── button.integration.test.tsx  # @integration (DEFAULT)
│   ├── unit/                           # Rare - pure functions only
│   │   └── utils.test.ts               # @unit
│   └── deployment/                     # CI-only tests
│       └── env-api.test.ts             # @env
└── e2e/
    └── button-workflow.e2e.test.ts     # @e2e
```

## ⏱️ Performance Targets (Phase-Aligned)

- **Phase 1 (Selective)**: < 30s per test file
- **Phase 2 (Pre-commit)**: < 60s total
- **Phase 3 (Pre-push)**: < 180s total
- **Phase 4 (Comprehensive)**: < 300s total
- **Phase 5 (CI Environment)**: < 180s total

### Test Type Targets
- **Integration**: <30s per file (primary test type)
- **E2E**: <60s per workflow
- **Unit**: <5s per file (rare)

## 🔧 5-Phase Testing Strategy

1. **Phase 1 - Selective** (Development): Individual project testing, tag-based selection
2. **Phase 2 - Pre-commit** (Auto): Typecheck + Lint + Unit tests (affected only)
3. **Phase 3 - Pre-push** (Auto): Integration tests + Builds + Smart E2E
4. **Phase 4 - Comprehensive** (Manual): Full validation for releases
5. **Phase 5 - CI Environment** (Auto): Environment validation only

### Quality Commands
```bash
# Linting (use with testing)
pnpm lint                    # Lint affected files
pnpm lint:fix               # Auto-fix linting issues

# Type checking
pnpm typecheck              # TypeScript validation

# Auth debugging
AUTH_DEBUG=true pnpm test    # Enable auth debug logs
AUTH_DEBUG_VERBOSE=true      # Include stack traces
```

## 📝 Integration Test Template (Primary)

```typescript
// feature.integration.test.ts
describe('Feature @integration @api', () => {
  const testDir = path.join(__dirname, '.test-output');
  
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });
  
  it('should process real files', async () => {
    // Create real test file
    const csvPath = path.join(testDir, 'test.csv');
    await fs.writeFile(csvPath, 'header\nvalue');
    
    // Test with real I/O
    const result = await processFile(csvPath);
    
    // Verify actual results
    expect(result.rows).toBe(1);
  });
});
```

## 🔐 Auth Testing Template

```typescript
// auth.integration.test.ts
describe('Protected Route @integration @auth @rbac', () => {
  let testUser: ClerkTestUser;
  
  beforeAll(async () => {
    testUser = await TestUsers.getReviewGroupAdmin();
  });
  
  it('should enforce permissions with withAuth', async () => {
    // Test protected API route
    const response = await fetch('/api/admin/namespaces', {
      method: 'POST',
      body: JSON.stringify({ 
        name: 'Test',
        reviewGroupId: 'isbd' 
      })
    });
    
    // RG Admin can create in their review group
    expect(response.status).toBe(200);
    
    // Check debug info if needed
    if (process.env.AUTH_DEBUG) {
      const logs = await fetch('/api/admin/auth/debug?action=logs');
      console.log('Auth decision:', await logs.json());
    }
  });
});
```

## 🤖 AI Agent Tips

1. **🚨 ALWAYS use `pnpm nx test [project]`** - Never forget pnpm prefix!
2. **Default to integration tests** - Use real I/O, not mocks
3. **Create real test files** - Use temp directories and clean up
4. **Test the full flow** - Input → Processing → Output
5. **Use fixtures for consistency** - Store in `tests/fixtures/`
6. **Never use bare `nx` commands** - Always prefix with `pnpm`

### 🔐 Auth Testing Tips
7. **Test users available** - 5 pre-configured Clerk users (code: `424242`)
8. **Use withAuth middleware** - All protected routes use our custom wrapper
9. **Cache impacts timing** - Permission checks cached 5min (50ms→<1ms)
10. **Debug with endpoint** - `/api/admin/auth/debug` for troubleshooting
11. **Clear cache in tests** - `clearTestUsersCache()` between test suites

## 💡 Philosophy

We believe in testing code the way it runs in production:
- ✅ Real file I/O operations
- ✅ Actual test databases
- ✅ Multiple components working together
- ✅ Real error conditions
- ❌ Avoid mocks unless absolutely necessary

## 🔗 Full Documentation

- **Integration-First Guide**: `/developer_notes/AI_TESTING_INSTRUCTIONS.md`
- **Templates**: `/developer_notes/TEST_TEMPLATES.md`
- **Comprehensive Strategy**: `/system-design-docs/06-testing-strategy-comprehensive.md`
- **Auth Testing Guide**: `/developer_notes/CLERK_AUTHENTICATION_TESTING.md`
- **Test Users Config**: `/apps/admin/src/test-config/clerk-test-users.ts`