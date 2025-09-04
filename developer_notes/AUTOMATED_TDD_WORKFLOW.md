# Automated TDD Workflow - Complete Integration Guide

## Overview

This document consolidates our Test-Driven Development (TDD) workflow with automated environment switching, 5-phase testing strategy, and commit conventions. It supersedes and combines guidance from TDD_WORKFLOW.md, TESTING_STRATEGY_V2.md, and WORKFLOW_TESTING_EMPHASIS.md.

## 🎯 Core Principles

1. **Test-First Development**: ALWAYS write failing tests before implementation
2. **Environment Switching**: Seamless mock/real service switching via configuration
3. **5-Phase Testing**: Progressive validation from development to production
4. **Contract-Driven**: Zod schemas define and validate all data shapes
5. **nx affected**: Optimize test execution at every phase

## 📋 Commit Conventions (Enforced by Git Hooks)

Our TDD workflow is enforced through conventional commit patterns that map directly to the red/green/refactor cycle:

### 🔴 RED Phase Commits
```bash
# Write failing tests (implementation comes later)
git commit -m "test(RED): add failing user authentication tests"
git commit -m "test(RED): create failing validation for email format"
git commit -m "test(RED): add failing tests for user role permissions"
```

### 🟢 GREEN Phase Commits  
```bash
# Minimal implementation to pass tests
git commit -m "feat(GREEN): implement user authentication service"
git commit -m "fix(GREEN): add email validation to user form"
git commit -m "feat(GREEN): add role-based access control"
```

### 🔵 REFACTOR Phase Commits
```bash
# Code cleanup while keeping tests green
git commit -m "refactor(REFACTOR): extract authentication logic to service"
git commit -m "refactor(REFACTOR): simplify user validation functions"
git commit -m "refactor(REFACTOR): consolidate role checking utilities"
```

## 🏭 5-Phase Testing Strategy

### Phase Configuration
```typescript
// apps/admin/src/config/environment.ts
import { TestPhase, TestTag } from './environment';

// Current phase determines which tests run
const currentPhase = getCurrentTestPhase();
const tagsToRun = getTestTagsForPhase(currentPhase);
```

### Phase Boundaries & Execution

| Phase | Trigger | Test Tags | Environment | nx Command |
|-------|---------|-----------|-------------|------------|
| **1: Selective** | On Save | None | N/A | `nx affected --target=typecheck && nx affected --target=lint` |
| **2: Pre-commit** | Git commit | `@unit` | `USE_MOCKS=true` | `nx affected --target=test --tag=unit` |
| **3: Pre-push** | Git push | `@unit`, `@integration` | `USE_MOCKS=true` | `nx affected --target=test --tag=unit,integration` |
| **4: Comprehensive** | PR/Manual | `@unit`, `@integration`, `@e2e` | Real services | `nx affected --target=test --tag=unit,integration,e2e` |
| **5: CI/Deployment** | Deploy | `@smoke` | Production | `nx run-many --target=test --tag=smoke` |

## 🔄 TDD Cycle Implementation

### Step 1: Create Feature Branch
```bash
git checkout -b feature/[feature-name]
```

### Step 2: Define Contracts (Pre-RED)
```typescript
// packages/contracts/src/User.zod.ts
export const UserContract = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer'])
});

export type User = z.infer<typeof UserContract>;
```

### Step 3: Write Tests (RED Phase)

#### Tag Your Tests Appropriately
```typescript
// UserList.test.tsx
describe('UserList Component @unit', () => {
  it('should render list of users', () => {
    // This will fail - component doesn't exist
    const { getByText } = render(<UserList users={mockUsers} />);
    expect(getByText('John Doe')).toBeInTheDocument();
  });
});

describe('UserService @integration', () => {
  it('should fetch users with MSW mock', async () => {
    // This will fail - service doesn't exist
    const users = await userService.getAll();
    expect(users).toMatchContract(UserContract.array());
  });
});

describe('User Management @e2e', () => {
  it('should create and list users', async () => {
    // This will fail - full flow doesn't exist
    await createUser(testUser);
    const users = await listUsers();
    expect(users).toContainEqual(testUser);
  });
});
```

#### Environment-Aware Test Setup
```typescript
// test-utils/setup.ts
export function setupTestEnvironment() {
  const phase = getCurrentTestPhase();
  
  if (phase <= TestPhase.PRE_PUSH) {
    // Phases 2-3: Use MSW mocks
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());
  } else if (phase === TestPhase.COMPREHENSIVE) {
    // Phase 4: Use real local services
    beforeAll(async () => {
      await startLocalServices();
    });
    afterAll(async () => {
      await stopLocalServices();
    });
  }
  // Phase 5: Production smoke tests run against live services
}
```

### Step 4: Create MSW Handlers
```typescript
// mocks/handlers.ts
export const handlers = [
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.json({
        data: mockUsers,
        total: mockUsers.length
      })
    );
  }),
  
  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json();
    
    // Validate against contract even in mocks
    try {
      const user = UserContract.parse(body);
      return res(ctx.status(201), ctx.json(user));
    } catch (error) {
      return res(ctx.status(400), ctx.json({ error: 'Invalid user data' }));
    }
  })
];
```

### Step 5: Implement Minimal Code (GREEN Phase)

#### Service with Environment Switching
```typescript
// services/UserService.ts
export class UserService {
  private provider: DataProvider;
  
  constructor() {
    // Environment determines provider
    this.provider = process.env.USE_MOCKS === 'true'
      ? new MockDataProvider()
      : new SupabaseDataProvider();
  }
  
  async getAll(): Promise<User[]> {
    const response = await this.provider.getList('users');
    // Always validate with contract
    return UserContract.array().parse(response.data);
  }
  
  async create(data: unknown): Promise<User> {
    // Validate input
    const validated = UserContract.parse(data);
    const response = await this.provider.create('users', validated);
    // Validate output
    return UserContract.parse(response.data);
  }
}
```

#### Component Implementation
```typescript
// components/UserList.tsx
export const UserList: FC = () => {
  const { data: users, isLoading } = useList<User>({
    resource: 'users',
    dataProviderName: 'default'
  });
  
  if (isLoading) return <Spin />;
  if (!users || users.length === 0) return <Empty description="No users found" />;
  
  return (
    <List
      dataSource={users}
      renderItem={(user) => (
        <List.Item key={user.id}>
          {user.name} ({user.email})
        </List.Item>
      )}
    />
  );
};
```

### Step 6: Refactor (REFACTOR Phase)

#### Extract Common Patterns
```typescript
// hooks/useValidatedData.ts
export function useValidatedData<T>(
  resource: string,
  contract: z.ZodType<T>
) {
  const { data, ...rest } = useList({
    resource,
    dataProviderName: 'default'
  });
  
  const validatedData = useMemo(() => {
    if (!data) return undefined;
    try {
      return contract.array().parse(data);
    } catch (error) {
      console.error(`Validation failed for ${resource}:`, error);
      return undefined;
    }
  }, [data, contract, resource]);
  
  return { data: validatedData, ...rest };
}

// Refactored component
export const UserList: FC = () => {
  const { data: users, isLoading } = useValidatedData('users', UserContract);
  // ... rest of component
};
```

## 🚀 Running Tests by Phase

### Development (Phase 1)
```bash
# Continuous type checking
pnpm nx affected --target=typecheck --watch

# Continuous linting
pnpm nx affected --target=lint --watch
```

### Pre-commit (Phase 2)
```bash
# Automatic via git hooks, or manual:
USE_MOCKS=true pnpm nx affected --target=test --tag=unit
```

### Pre-push (Phase 3)
```bash
# Automatic via git hooks, or manual:
USE_MOCKS=true pnpm nx affected --target=test --tag=unit,integration
```

### Comprehensive (Phase 4)
```bash
# Start local services first
pnpm start:services

# Run full test suite
pnpm nx affected --target=test --tag=unit,integration,e2e

# Or with specific project
pnpm nx test admin --tag=unit,integration,e2e
```

### Production (Phase 5)
```bash
# Smoke tests only
pnpm nx run-many --target=test --tag=smoke --projects=admin,portal
```

## 📊 Test Tagging Best Practices

### Tag Hierarchy
```typescript
// Combine tags for better organization
describe('UserService @integration @api @critical', () => {
  // Critical API integration tests
});

describe('UserForm @unit @ui @accessibility', () => {
  // Accessibility-focused unit tests
});

describe('User Flow @e2e @smoke @auth', () => {
  // Auth flow that's also a smoke test
});
```

### Performance Tags
```typescript
describe('Large Dataset @integration @performance', () => {
  it('should handle 10,000 users @slow', async () => {
    // Test with large dataset
  }, 30000); // 30 second timeout
});
```

## 🔧 Environment Configuration

### Test Environment Detection
```typescript
// apps/admin/src/config/environment.ts
export function getCurrentTestPhase(): TestPhase {
  // Automatic detection based on environment
  if (process.env.CI) return TestPhase.CI;
  if (process.env.TEST_PHASE) return parseInt(process.env.TEST_PHASE);
  if (process.env.USE_MOCKS === 'true') return TestPhase.PRE_PUSH;
  return TestPhase.COMPREHENSIVE;
}

export function shouldRunTest(tags: TestTag[]): boolean {
  const phase = getCurrentTestPhase();
  const allowedTags = getTestTagsForPhase(phase);
  return tags.some(tag => allowedTags.includes(tag));
}
```

### Dynamic Provider Selection
```typescript
// providers/dataProvider.ts
export const dataProvider = (() => {
  const phase = getCurrentTestPhase();
  
  switch (phase) {
    case TestPhase.PRE_COMMIT:
    case TestPhase.PRE_PUSH:
      return mockDataProvider; // MSW-based
    
    case TestPhase.COMPREHENSIVE:
      return demoDataProvider; // Local services
    
    case TestPhase.CI:
      return productionDataProvider; // Real APIs
    
    default:
      return mockDataProvider;
  }
})();
```

## 📈 Coverage Requirements by Phase

| Phase | Unit Coverage | Integration Coverage | E2E Coverage |
|-------|--------------|---------------------|--------------|
| Pre-commit | 80% | N/A | N/A |
| Pre-push | 80% | 70% | N/A |
| Comprehensive | 80% | 70% | Key flows |
| Production | N/A | N/A | Critical paths |

## 🎯 Quick Reference Commands

```bash
# Check what phase you're in
pnpm nx run admin:test --tag=debug

# Run tests for current phase
pnpm test:current

# Run specific phase tests
TEST_PHASE=2 pnpm nx test admin  # Pre-commit
TEST_PHASE=3 pnpm nx test admin  # Pre-push
TEST_PHASE=4 pnpm nx test admin  # Comprehensive

# Skip certain tags
pnpm nx test admin --skip-tags=slow,flaky

# Run only critical tests
pnpm nx test admin --tag=critical

# Parallel test execution
pnpm nx affected --target=test --parallel=3
```

## 🚨 Common Pitfalls & Solutions

### Pitfall: Tests Pass Locally but Fail in CI
**Solution**: Ensure environment variables match:
```bash
# Test with CI environment locally
CI=true USE_MOCKS=false pnpm test
```

### Pitfall: Slow Test Execution
**Solution**: Use tags to run subsets:
```bash
# Fast tests only during development
pnpm nx test admin --tag=unit --skip-tags=slow
```

### Pitfall: Contract Mismatches
**Solution**: Always validate both input and output:
```typescript
// Good: Validate at boundaries
const input = InputContract.parse(rawData);
const result = await process(input);
const output = OutputContract.parse(result);

// Bad: Trust without validation
const result = await process(rawData);
```

## 📚 Related Documentation

- `TDD_WITH_REFINE_GENERATORS.md` - Using Refine.dev with TDD
- `WORKFLOW_TESTING_EMPHASIS.md` - Mock/real switching patterns
- `TESTING_STRATEGY_V2.md` - Detailed testing strategy
- `COMPLETE_FEATURE_FACTORY_WORKFLOW.md` - Full feature development
- `apps/admin/src/config/environment.ts` - Environment configuration

## ✅ Checklist for Every Feature

- [ ] Feature branch created
- [ ] Contracts defined in `packages/contracts`
- [ ] Tests written with appropriate tags
- [ ] Tests fail correctly (RED phase)
- [ ] MSW handlers created for mock data
- [ ] Minimal implementation passes tests (GREEN phase)
- [ ] Code refactored while keeping tests green (REFACTOR phase)
- [ ] Environment switching works (mock/real)
- [ ] All phase tests pass progressively
- [ ] Commit messages follow TDD conventions