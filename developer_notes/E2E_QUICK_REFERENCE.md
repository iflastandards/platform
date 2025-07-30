# E2E Testing Quick Reference

## 🚀 Most Common Commands

```bash
# During development
pnpm test:e2e:smoke:affected      # Quick validation of changes

# Before committing  
pnpm test:pre-commit:smoke         # Fast pre-commit checks

# Before pushing
pnpm test:pre-push:integration     # Thorough integration tests

# Debug mode
pnpm test:e2e:ui                   # Visual debugging
```

## 📋 Test Categories

| Type | Time | Command | Use When |
|------|------|---------|----------|
| 🏃 **Smoke** | <5min | `pnpm test:e2e:smoke` | Quick validation |
| 🚶 **Integration** | <15min | `pnpm test:e2e:integration` | Service interactions |
| 🐌 **E2E** | <20min | `pnpm test:e2e:full` | Complete workflows |

## 🏷️ Tag Reference

```bash
# Run by tag
pnpm test:e2e:tags @smoke          # Quick tests
pnpm test:e2e:tags @critical       # Must-pass tests  
pnpm test:e2e:tags @auth           # Authentication
pnpm test:e2e:tags @rbac           # Role-based access
pnpm test:e2e:tags @api            # API tests
pnpm test:e2e:tags @ui             # UI tests

# Shortcuts
pnpm test:e2e:critical              # Same as tags @critical
pnpm test:e2e:auth                  # Same as tags @auth
```

## ✍️ Writing Tests

### Basic Structure
```typescript
import { test, expect } from '../utils/tagged-test';

test.describe('Feature @smoke @ui', () => {
  test('should work', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});
```

### Using Helpers
```typescript
import { smokeTest, integrationTest } from '../utils/tagged-test';

smokeTest('quick check', async ({ page }) => {
  // Auto-tagged with @smoke
});

integrationTest('api interaction', async ({ page }) => {
  // Auto-tagged with @integration  
});
```

### Tag Builder
```typescript
import { tags } from '../utils/test-tags';

test(`critical auth ${tags().critical().auth().build()}`, async ({ page }) => {
  // Tagged with @critical @auth
});
```

## 🔧 CI Commands

```bash
pnpm test:ci:quick          # Smoke only (fastest)
pnpm test:ci:standard       # Smoke + Integration  
pnpm test:ci:full           # Everything (slowest)
```

## 🐛 Debugging

```bash
# Visual debugging
pnpm test:e2e:ui

# Run specific file
npx playwright test path/to/test.spec.ts

# With debug output
DEBUG=pw:api pnpm test:e2e:smoke

# Show last report
npx playwright show-report
```

## 📁 File Structure

```
e2e/
├── smoke/              # Quick tests (<10s each)
│   ├── auth.smoke.spec.ts
│   └── dashboard.smoke.spec.ts
├── integration/        # Service tests  
│   ├── rbac.integration.spec.ts
│   └── api.integration.spec.ts
├── e2e/               # Full workflows
│   └── user-journey.e2e.spec.ts
├── fixtures/          # Test data & utilities
└── utils/             # Helpers & configuration
```

## ⚡ Performance Tips

1. **Use affected commands** - Only test what changed
2. **Tag properly** - Helps with test organization
3. **Keep smoke tests fast** - Under 10 seconds each
4. **Parallel execution** - Enabled by default in CI
5. **Nx caching** - Automatic test result caching

## 🆘 Help

```bash
pnpm test:help              # Show all test commands
pnpm test:explain-strategy  # Explain testing approach
pnpm test:e2e:categorize    # Analyze test distribution
```

---
**Pro Tip**: Start with `pnpm test:help` to see all available commands with descriptions!