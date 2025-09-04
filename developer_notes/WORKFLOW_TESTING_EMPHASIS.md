# Workflow Testing Emphasis - Mock/Real Switching Throughout

> **Note**: This document has been integrated into the comprehensive `AUTOMATED_TDD_WORKFLOW.md`. 
> Please refer to that document for the complete, up-to-date workflow with 5-phase testing and environment switching.
> 
> **Primary Reference**: [`developer_notes/AUTOMATED_TDD_WORKFLOW.md`](./AUTOMATED_TDD_WORKFLOW.md)

## Core Principle: Test-Driven with Environment Switching

Every feature, regardless of type, must support seamless switching between mock and real services through environment configuration.

## Updated Workflow Phases with Testing Focus

### Phase 0: Code Discovery & Test Analysis
**NEW EMPHASIS:**
- Identify existing test patterns and mocks
- Find existing MSW handlers to extend
- Locate environment switching code
- Review existing contracts that tests validate against

```bash
# First commands when exploring existing code
grep -r "MSW\|mock\|fixture" --include="*.ts" 
grep -r "process.env\|config.env" --include="*.ts"
find . -name "*.test.ts" -o -name "*.spec.ts"
```

### Phase 1: Requirements & Test Scenarios
**NEW EMPHASIS:**
- Define test scenarios BEFORE implementation details
- Identify what needs mocking vs. real services
- Plan environment configurations

```typescript
// Start with test scenarios in requirements
describe('Namespace Inventory Feature', () => {
  describe('Mock Environment', () => {
    it('should list namespaces from mock data');
    it('should validate namespace URI format');
    it('should track usage relationships');
  });
  
  describe('Real Environment', () => {
    it('should verify namespace URI is resolvable');
    it('should import from prefix.cc API');
    it('should sync with GitHub repos');
  });
});
```

### Phase 2: Contracts & Test Data Design
**NEW EMPHASIS:**
- Contracts drive both mocks and real data validation
- Test data covers all edge cases
- Same contracts validate mock and real responses

```typescript
// Contract is source of truth for ALL environments
export const NamespaceContract = z.object({
  id: z.string().uuid(),
  uri: z.string().url(),
  // ... fields
});

// Mock data MUST match contract
export const mockNamespaces = [
  NamespaceContract.parse({
    id: '123',
    uri: 'http://example.org/ns',
    // Valid mock data
  })
];

// Real data MUST be validated with same contract
const realData = await fetchFromAPI();
const validated = NamespaceContract.parse(realData);
```

### Phase 3: Environment-Aware Implementation
**NEW EMPHASIS:**
- Every service has mock and real implementations
- Environment config determines which to use
- Same interface for both

```typescript
// Service with environment switching
export class NamespaceService {
  private provider: DataProvider;
  
  constructor() {
    // Environment determines provider
    this.provider = config.env.useMocks 
      ? new MockDataProvider()
      : new LiveDataProvider();
  }
  
  async verifyNamespace(uri: string): Promise<ValidationResult> {
    if (config.env.useMocks) {
      // Mock returns predetermined result
      return mockVerificationResults[uri] || { valid: true };
    } else {
      // Real service makes actual HTTP request
      return await this.provider.verify(uri);
    }
  }
}
```

### Phase 4: Progressive Testing Strategy

#### Level 1: Type Check & Lint (Immediate)
```bash
# On save - immediate feedback
pnpm typecheck --watch
pnpm lint --watch
```

#### Level 2: Unit Tests with Mocks (Fast - <5s)
```typescript
// @unit @mock
describe('NamespaceService (Mock)', () => {
  beforeAll(() => {
    process.env.USE_MOCKS = 'true';
  });
  
  it('should validate against contract', () => {
    const service = new NamespaceService();
    const result = service.validate(mockNamespace);
    expect(result).toMatchContract(NamespaceContract);
  });
});
```

#### Level 3: Integration Tests with MSW (Medium - <30s)
```typescript
// @integration @msw
describe('Namespace API Integration', () => {
  beforeAll(() => {
    server.listen(); // MSW server
  });
  
  it('should handle full CRUD cycle', async () => {
    // MSW intercepts all HTTP calls
    const created = await api.create(testNamespace);
    const fetched = await api.get(created.id);
    const updated = await api.update(created.id, changes);
    const deleted = await api.delete(created.id);
    
    // All validated against contracts
    expect(created).toMatchContract(NamespaceContract);
  });
});
```

#### Level 4: E2E with Environment Toggle (Slow - <2m)
```typescript
// @e2e @environment-aware
describe('Namespace E2E', () => {
  const testEnvs = [
    { name: 'mock', apiUrl: 'http://localhost:3000', useMocks: true },
    { name: 'staging', apiUrl: process.env.STAGING_URL, useMocks: false }
  ];
  
  testEnvs.forEach(env => {
    describe(`Environment: ${env.name}`, () => {
      beforeAll(() => {
        process.env.API_URL = env.apiUrl;
        process.env.USE_MOCKS = String(env.useMocks);
      });
      
      it('should complete namespace workflow', async () => {
        // Same test runs against mock and real
        await page.goto('/namespaces');
        await page.click('[data-testid="create-namespace"]');
        // ... same test flow
      });
    });
  });
});
```

#### Level 5: Post-Deploy Smoke Tests (Minimal)
```typescript
// @smoke @post-deploy
describe('Production Smoke Tests', () => {
  it('should reach namespace API', async () => {
    const response = await fetch(`${process.env.PROD_URL}/api/namespaces`);
    expect(response.status).toBe(200);
  });
  
  it('should have correct service configuration', async () => {
    const config = await fetch(`${process.env.PROD_URL}/api/config`);
    expect(config.environment).toBe('production');
    expect(config.servicesAvailable).toContain('namespaces');
  });
});
```

## Implementation Patterns for Each Feature Type

### Type 1: CRUD Features - Test Pattern
```typescript
class CrudTestPattern {
  // 1. Contract validation tests
  testContract() {
    expect(mockData).toMatchContract(EntityContract);
    expect(realData).toMatchContract(EntityContract);
  }
  
  // 2. Mock CRUD tests (fast)
  async testMockCrud() {
    process.env.USE_MOCKS = 'true';
    await testCreateReadUpdateDelete();
  }
  
  // 3. Real CRUD tests (slower)
  async testRealCrud() {
    process.env.USE_MOCKS = 'false';
    await testCreateReadUpdateDelete();
  }
  
  // 4. Same test implementation
  async testCreateReadUpdateDelete() {
    const service = new EntityService(); // Reads env internally
    const created = await service.create(testData);
    // ... rest of CRUD
  }
}
```

### Type 2: Long-Running Services - Test Pattern
```typescript
class JobTestPattern {
  // 1. Mock job completes immediately
  async testMockJob() {
    process.env.USE_MOCKS = 'true';
    const job = await startJob();
    expect(job.status).toBe('completed'); // Mock completes instantly
  }
  
  // 2. Real job with timeout
  async testRealJob() {
    process.env.USE_MOCKS = 'false';
    const job = await startJob();
    
    // Poll with timeout
    await waitFor(() => {
      return job.status === 'completed';
    }, { timeout: 30000 });
  }
  
  // 3. Progress monitoring works in both
  async testProgress() {
    const job = await startJob();
    const updates = [];
    
    job.on('progress', (p) => updates.push(p));
    await job.complete();
    
    expect(updates).toContain(25);
    expect(updates).toContain(50);
    expect(updates).toContain(75);
    expect(updates).toContain(100);
  }
}
```

### Type 3: GitHub Reflection - Test Pattern
```typescript
class GitHubTestPattern {
  // 1. Mock GitHub API responses
  async testMockGitHub() {
    process.env.USE_MOCKS = 'true';
    
    // MSW intercepts GitHub API calls
    const teams = await githubService.getTeams();
    expect(teams).toEqual(mockGitHubTeams);
  }
  
  // 2. Real GitHub with rate limit handling
  async testRealGitHub() {
    process.env.USE_MOCKS = 'false';
    process.env.GITHUB_TOKEN = process.env.TEST_GITHUB_TOKEN;
    
    const teams = await githubService.getTeams();
    expect(teams).toMatchContract(GitHubTeamContract);
  }
  
  // 3. Webhook testing (always mocked)
  async testWebhook() {
    const payload = mockGitHubWebhookPayload();
    const response = await handleWebhook(payload);
    expect(response.status).toBe(200);
  }
}
```

## Environment Configuration

### Development
```typescript
// .env.development
USE_MOCKS=true
API_URL=http://localhost:3000
ENABLE_MSW=true
LOG_LEVEL=debug
```

### Testing
```typescript
// .env.test
USE_MOCKS=true  // Default to mocks for speed
API_URL=http://localhost:3000
ENABLE_MSW=true
TEST_TIMEOUT=30000
```

### Staging
```typescript
// .env.staging
USE_MOCKS=false  // Use real services
API_URL=https://staging-api.example.com
ENABLE_MSW=false
LOG_LEVEL=info
```

### Production
```typescript
// .env.production
USE_MOCKS=false
API_URL=https://api.example.com
ENABLE_MSW=false
LOG_LEVEL=error
```

## Quick Feedback Loop Commands

```bash
# Immediate feedback (on save)
pnpm dev:test  # Runs: typecheck --watch & lint --watch & test --watch

# Pre-commit (fast - <30s)
pnpm test:quick  # Runs: typecheck && lint && test --grep "@unit|@mock"

# Pre-push (thorough - <2m)
pnpm test:thorough  # Runs: all unit + integration with mocks

# Pre-deploy (complete - <5m)
pnpm test:complete  # Runs: all tests with real services (staging)

# Post-deploy (minimal - <30s)
pnpm test:smoke  # Runs: health checks only
```

## Key Principles for All Workflows

1. **Contracts are the truth** - Same validation for mock and real
2. **Environment determines behavior** - Not hardcoded switches
3. **Tests work in all environments** - Same test, different data source
4. **Fast feedback first** - Mocks for development speed
5. **Progressive confidence** - Mock → MSW → Real → Production
6. **Fail fast** - Typecheck/lint catch errors immediately
7. **Test the contract, not the implementation** - Focus on data shape

## Workflow Checklist for Every Feature

- [ ] Contracts defined and tested
- [ ] Mock data matches contracts
- [ ] MSW handlers return contract-valid data
- [ ] Service has mock/real switching
- [ ] Unit tests run with mocks
- [ ] Integration tests run with MSW
- [ ] E2E tests run with both mock and real
- [ ] Environment configs documented
- [ ] Smoke tests for production
- [ ] Fast feedback loop configured

This approach ensures:
- **Rapid development** with mock data
- **Contract confidence** through validation
- **Environment flexibility** for different stages
- **Fast feedback** during development
- **Production confidence** through progressive testing