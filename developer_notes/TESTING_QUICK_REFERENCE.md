# Testing Quick Reference

**Purpose**: Concise testing guide for developers and AI agents working on the IFLA Standards Platform. We follow an **integration-first testing philosophy** - preferring real I/O and actual data over mocks.

## 🎯 Test Decision Tree (30 Seconds)

```
Need to write a test?
├─ Uses env vars/external services? → @env test in tests/deployment/
├─ Tests user workflow in browser? → @e2e test in e2e/
├─ Uses files/DB/multiple components? → @integration test (DEFAULT)
└─ Pure function only? → @unit test (RARE)
```

## 📋 Required Tags

### Category (Pick ONE)
- `@integration` - **DEFAULT**: Multiple components with real I/O
- `@e2e` - Browser automation tests
- `@env` - Environment/deployment tests
- `@unit` - Pure functions only (rare)

### Add Functional Tags
- `@api`, `@auth`, `@rbac`, `@ui`, `@validation`, `@security`, `@performance`, `@a11y`

### Add Priority (Optional)
- `@critical`, `@happy-path`, `@error-handling`, `@edge-case`

## 🚀 Key Commands

**🚨 CRITICAL: ALWAYS use `pnpm nx test [project] --skip-nx-cache`**

```bash
# ✅ CORRECT FORMAT (ALWAYS USE THIS):
pnpm nx test unified-spreadsheet --skip-nx-cache
pnpm nx test @ifla/theme --skip-nx-cache
pnpm nx test portal --skip-nx-cache

# ❌ WRONG (NEVER USE THESE):
nx test unified-spreadsheet                    # Missing pnpm and cache skip
pnpm nx test unified-spreadsheet              # Missing cache skip
nx test unified-spreadsheet --skip-nx-cache   # Missing pnpm

# Run affected tests
pnpm nx affected --target=test --parallel=3 --skip-nx-cache

# Run by tag
pnpm test --grep "@integration"
pnpm test --grep "@critical"

# E2E tests
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

## ⏱️ Performance Targets

- **Integration**: <30s per file (primary test type)
- **E2E**: <60s per workflow
- **Unit**: <5s per file (rare)
- **Pre-commit total**: <60s
- **Pre-push total**: <180s

## 🔧 Test Phases

1. **Pre-commit** (Auto): Typecheck + Lint + Fast integration tests
2. **Pre-push** (Auto): All integration + E2E (if needed) + Builds
3. **CI** (Auto): Environment tests only

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

## 🤖 AI Agent Tips

1. **🚨 ALWAYS use `pnpm nx test [project] --skip-nx-cache`** - Never forget!
2. **Default to integration tests** - Use real I/O, not mocks
3. **Create real test files** - Use temp directories and clean up
4. **Test the full flow** - Input → Processing → Output
5. **Use fixtures for consistency** - Store in `tests/fixtures/`
6. **Never use bare `nx` commands** - Always prefix with `pnpm`
7. **Never trust cache** - Always use `--skip-nx-cache`

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