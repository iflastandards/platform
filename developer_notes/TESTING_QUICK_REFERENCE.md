# Testing Quick Reference

**Purpose**: Concise testing guide for developers and AI agents working on the IFLA Standards Platform.

## 🎯 Test Decision Tree (30 Seconds)

```
Need to write a test?
├─ Uses env vars/external services? → @env test in tests/deployment/
├─ Tests multiple components? → @integration test (*.integration.test.ts)
├─ Tests user workflow in browser? → @e2e test in e2e/
└─ Otherwise → @unit test next to source file
```

## 📋 Required Tags

### Category (Pick ONE)
- `@unit` - Isolated tests
- `@integration` - Multi-component tests  
- `@e2e` - Browser automation tests
- `@smoke` - Critical path tests
- `@env` - Environment config tests

### Add Functional Tags
- `@api`, `@auth`, `@rbac`, `@ui`, `@validation`, `@security`, `@performance`, `@a11y`

### Add Priority (Optional)
- `@critical`, `@happy-path`, `@error-handling`, `@edge-case`

## 🚀 Key Commands

```bash
# Most common - run affected tests
nx affected --target=test --parallel=3

# Test specific project
nx test @ifla/theme --watch

# Run by tag
pnpm test --grep "@unit"
pnpm test --grep "@critical"
pnpm test --grep "@auth.*@integration"

# E2E tests
npx playwright test --grep "@smoke"
```

## 📁 File Placement

```
src/
├── components/
│   ├── Button.tsx
│   ├── Button.test.tsx              # @unit
│   └── Button.integration.test.tsx  # @integration
└── tests/
    ├── integration/                 # @integration
    └── deployment/                  # @env
e2e/                                # @e2e
```

## ⏱️ Performance Targets

- **Unit**: <5s per file
- **Integration**: <30s per suite
- **E2E**: <60s per workflow
- **Pre-commit total**: <60s
- **Pre-push total**: <180s

## 🔧 Test Phases

1. **Pre-commit** (Auto): Typecheck + Lint + Unit tests
2. **Pre-push** (Auto): Integration + E2E (if needed) + Builds
3. **CI** (Auto): Environment tests only

## 📝 Test Template

```typescript
// Component.test.tsx
describe('Component @unit @ui', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## 🤖 AI Agent Tips

1. **Always tag tests** - Use decision tree above
2. **Mock dependencies** in unit tests
3. **Use fixtures** for test data
4. **One concept per test**
5. **Run affected only** - Don't use --all

## 🔗 Full Documentation

- **Comprehensive Guide**: `/system-design-docs/06-testing-strategy-comprehensive.md`
- **AI Instructions**: `/developer_notes/AI_TESTING_INSTRUCTIONS.md`
- **Templates**: `/developer_notes/TEST_TEMPLATES.md`
- **Placement Guide**: `/developer_notes/TEST_PLACEMENT_GUIDE.md`