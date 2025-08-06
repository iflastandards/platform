# Clerk Testing Strategy: Mock vs Real API

This guide explains when to use real Clerk API calls vs mocks, following our **integration-first testing philosophy**.

## 🎯 Quick Decision Tree

```
Writing a test?
├─ @integration test? → Use REAL Clerk API (DEFAULT)
├─ @unit test of pure function? → Use mocks (RARE)
├─ @e2e test? → Use real Clerk in browser
└─ UI component test? → Mock Clerk components only
```

## ✅ Use Real Clerk API (Integration Tests)

**When**: Testing multiple components, API routes, authorization logic
**Command**: `pnpm test:integration` (uses `vitest.config.integration.ts`)
**Setup**: `src/test/setup-integration.ts` - NO Clerk mocking

```typescript
// ✅ CORRECT - Integration test with real Clerk API
describe('API Authorization @integration @auth', () => {
  it('should authenticate real user', async () => {
    // Makes actual API call to Clerk
    const user = await TestUsers.getSuperAdmin();
    expect(user.id).toMatch(/^user_/); // Real Clerk user ID
    
    // Test real authorization logic
    const canEdit = await canPerformAction('namespace', 'update', {
      namespaceId: 'isbd'
    });
    expect(canEdit).toBe(true);
  });
});
```

**Benefits**:
- Tests real authentication flow
- Validates actual user metadata structure
- Catches API changes and network issues
- Tests authorization with real user data
- Follows integration-first philosophy

## ❌ Use Mocks (Unit Tests Only)

**When**: Testing pure functions that don't need real authentication
**Command**: `pnpm test:unit` (uses default `vitest.config.ts`)
**Setup**: `src/test/setup.ts` - Mocks Clerk completely

```typescript
// ✅ CORRECT - Unit test with mocked data
describe('Permission Utils @unit', () => {
  it('should parse user roles correctly', () => {
    // Mock data for pure function testing
    const mockRoles = {
      systemRole: 'superadmin',
      reviewGroups: [],
      teams: [],
      translations: []
    };
    
    const permissions = parseUserPermissions(mockRoles);
    expect(permissions.canManageAll).toBe(true);
  });
});
```

**When to Mock**:
- Pure functions that don't make API calls
- UI components that only need auth state
- Tests where real API calls would exceed 30s timeout
- Edge cases impossible to reproduce with real users

## 🔧 Configuration Files

### Integration Tests (Real Clerk API)
```typescript
// vitest.config.integration.ts
export default defineConfig({
  test: {
    setupFiles: ['./src/test/setup-integration.ts'], // NO Clerk mocking
    testTimeout: 30000, // Allow time for real API calls
    include: ['**/*.integration.{test,spec}.ts'],
  },
});
```

### Unit Tests (Mocked Clerk)
```typescript
// vitest.config.ts (default)
export default defineConfig({
  test: {
    setupFiles: ['./src/test/setup.ts'], // Full Clerk mocking
    include: ['**/*.{test,spec}.ts'],
    exclude: ['**/*.integration.{test,spec}.ts'],
  },
});
```

## 🚀 Commands for Different Test Types

```bash
# Integration tests with REAL Clerk API
pnpm test:integration

# Unit tests with MOCKED Clerk
pnpm test:unit

# All tests (mixed approach)
pnpm test

# Server-dependent tests (real servers + real Clerk)
pnpm test:server-dependent
```

## 📋 Environment Variables

### For Integration Tests (Real API)
```bash
# .env.local or .env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_real_key
CLERK_SECRET_KEY=sk_test_your_real_secret
```

### For Unit Tests (Mocked)
```bash
# Fake keys are fine since Clerk is mocked
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_fake_key_for_mocking
CLERK_SECRET_KEY=sk_test_fake_key_for_mocking
```

## 🎭 What Gets Mocked vs Real

### Integration Tests (`setup-integration.ts`)
```typescript
// ✅ REAL - Authentication and API calls
import { clerkClient, currentUser, auth } from '@clerk/nextjs/server';
// These make real API calls to Clerk

// ❌ MOCKED - Only UI components (not relevant for API testing)
vi.mock('@clerk/nextjs', () => ({
  ClerkProvider: vi.fn(({ children }) => children),
  SignInButton: vi.fn(() => 'Sign In'),
  // ... other UI components
}));
```

### Unit Tests (`setup.ts`)
```typescript
// ❌ MOCKED - Everything Clerk-related
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => Promise.resolve({ userId: null })),
  currentUser: vi.fn(() => Promise.resolve(null)),
  clerkClient: vi.fn(),
}));
```

## 🧪 Test Examples

### ✅ Integration Test Pattern
```typescript
describe('Namespace API @integration @api @auth', () => {
  const testDir = path.join(__dirname, '.test-output');
  
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });
  
  it('should authorize superadmin for namespace creation', async () => {
    // Real Clerk API call
    const user = await TestUsers.getSuperAdmin();
    
    // Real authorization check
    const canCreate = await canPerformAction('namespace', 'create', {
      reviewGroupId: 'isbd'
    });
    
    expect(canCreate).toBe(true);
  });
});
```

### ✅ Unit Test Pattern
```typescript
describe('Auth Utils @unit', () => {
  it('should extract legacy roles from metadata', () => {
    const mockMetadata = {
      systemRole: 'superadmin',
      reviewGroups: [{ reviewGroupId: 'isbd', role: 'admin' }]
    };
    
    const legacyRoles = extractLegacyRoles(mockMetadata);
    expect(legacyRoles).toContain('superadmin');
  });
});
```

## 🎯 Performance Considerations

### Integration Tests
- **Target**: <30s per test file
- **Real API calls**: Acceptable overhead for realistic testing
- **Caching**: Test users are cached after first load
- **Parallel**: Run integration tests in parallel when possible

### Unit Tests
- **Target**: <5s per test file
- **No network**: All mocked for speed
- **Fast feedback**: Quick validation during development

## 🔍 Debugging

### Integration Test Issues
```bash
# Debug real Clerk API calls
TEST_DEBUG=1 pnpm test:integration

# Check environment variables
echo $CLERK_SECRET_KEY
```

### Unit Test Issues
```bash
# Debug mocked behavior
pnpm test:unit --reporter=verbose
```

## 📚 Best Practices

### DO:
- ✅ Use real Clerk API for @integration tests
- ✅ Cache test user data for performance
- ✅ Clean up test files in afterEach
- ✅ Test with actual user metadata structure
- ✅ Follow 5-phase testing strategy

### DON'T:
- ❌ Mock Clerk in integration tests
- ❌ Use real API calls in unit tests
- ❌ Hardcode user IDs in tests
- ❌ Skip cleanup in integration tests
- ❌ Test implementation details

## 🚨 Common Pitfalls

1. **Wrong Config**: Using unit test config for integration tests
2. **Missing Env Vars**: Real API calls fail without proper keys
3. **Timeout Issues**: Integration tests need longer timeouts
4. **Cache Problems**: Not clearing test user cache between tests
5. **Mock Conflicts**: Mixing mocked and real Clerk in same test

## 📖 Related Documentation

- `developer_notes/TESTING_QUICK_REFERENCE.md` - Overall testing strategy
- `developer_notes/TEST_TEMPLATES.md` - Test templates and patterns
- `apps/admin/docs/clerk-test-users-guide.md` - Using real test users
- `AGENTS.md` - Testing philosophy and commands