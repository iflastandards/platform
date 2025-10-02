# Automated TDD Agent Prompts

## Purpose
This document provides structured prompts for AI agents to implement TDD workflows consistently across the admin application, ensuring proper test tagging, environment configuration, and progressive testing stages.

---

## Core Workflow Prompts

### 1. Initial Feature Setup with TDD

```
I need to implement [FEATURE_NAME] using TDD workflow.

Please follow these steps:
1. Create feature branch: feature/[feature-name]
2. Define Zod contract in packages/contracts
3. Write failing tests with proper tags:
   - @unit @critical for business logic
   - @integration @essential for API calls
   - @e2e @important for user workflows
   - @smoke @critical for health checks
4. Set up test environments (test_mock, test_integration, staging, production)
5. Create MSW handlers for mock environment
6. Show test execution plan by environment

Start with Step 1 and wait for confirmation before proceeding.
```

### 2. Contract-First Development

```
Define contracts for [ENTITY_NAME]:

Requirements:
- Entity has these fields: [list fields]
- Validation rules: [list rules]
- Relationships: [list relationships]

Generate:
1. Zod schema with full validation
2. TypeScript types from schema
3. Contract validation tests (@contract @critical)
4. Mock data generators
5. MSW response handlers

All tests must validate against the contract in ALL environments.
```

### 3. Test Implementation by Environment

```
Implement tests for [FEATURE_NAME] across environments:

TEST_MOCK environment (@unit @mock-only):
- Pure business logic tests
- Component rendering tests
- Mock data validation

TEST_INTEGRATION environment (@integration @real-only):
- API endpoint tests
- Database operations
- Service integrations

STAGING environment (@e2e @staging-only):
- Complete user workflows
- Cross-service interactions
- Performance benchmarks

PRODUCTION environment (@smoke @prod-only):
- Health check endpoints
- Critical path verification
- Permission validation

Each test must include appropriate tags and environment checks.
```

### 4. Service Implementation with Environment Switching

```
Create [SERVICE_NAME] with environment-aware implementation:

```typescript
class [SERVICE_NAME] {
  constructor() {
    const env = getCurrentEnvironment();
    this.provider = env.USE_MOCKS ? mockProvider : realProvider;
  }

  // Methods must work in all environments
  async method() {
    if (USE_MOCKS) {
      // Return mock data matching contract
    } else {
      // Call real service and validate with contract
    }
  }
}
```

Requirements:
- Support all 4 environments
- Validate responses with contracts
- Same interface for mock/real
- Progressive error handling
```

### 5. Test Tagging Analysis

```
Analyze test coverage for [FEATURE/MODULE]:

Report on:
1. Type coverage:
   - How many @unit tests?
   - How many @integration tests?
   - How many @e2e tests?
   - How many @smoke tests?

2. Priority coverage:
   - All @critical tests identified
   - @essential coverage percentage
   - Missing @important tests
   - @nice-to-have opportunities

3. Environment coverage:
   - Tests per environment
   - Environment-specific gaps
   - Cross-environment validation

4. Recommendations:
   - Missing critical coverage
   - Test type imbalances
   - Environment gaps
```

---

## Feature-Specific TDD Prompts

### CRUD Feature TDD

```
Implement CRUD for [ENTITY] using TDD + Refine.dev:

Phase 1 - Test Setup:
1. Write tests for List page (@unit @critical)
2. Write tests for Create form (@unit @essential)
3. Write tests for Edit form (@integration @essential)
4. Write tests for Delete action (@integration @important)

Phase 2 - Refine Generation:
1. Generate with: npx refine create resource [entity]
2. Run tests to identify gaps
3. List what needs customization

Phase 3 - Enhancement:
1. Add contract validation
2. Add permission checks
3. Add business logic
4. Make all tests pass

Phase 4 - Environment Testing:
1. Verify with TEST_ENV=test_mock
2. Verify with TEST_ENV=test_integration
3. Add smoke tests for production
```

### Long-Running Job TDD

```
Implement job queue for [JOB_TYPE] using TDD:

Test Requirements:
1. Mock job completes instantly (@unit @mock-only)
2. Real job with progress tracking (@integration @real-only)
3. Cancellation support (@integration @important)
4. Error recovery (@integration @essential)
5. Production monitoring (@smoke @critical)

Implementation:
- Job contract with status enum
- Progress event emitter
- MSW handlers for mock progress
- Real queue implementation
- Environment-based timeout configuration

Mock behavior:
- Instant completion in test_mock
- Simulated progress in test_integration
- Real processing in staging/production
```

### API Integration TDD

```
Implement [EXTERNAL_API] integration using TDD:

Test Layers:
1. Contract tests for API responses (@contract @critical)
2. Mock API responses with MSW (@unit @mock-only)
3. Rate limiting tests (@integration @important)
4. Error handling tests (@integration @essential)
5. Health check tests (@smoke @critical)

Environment Strategy:
- test_mock: MSW intercepts all calls
- test_integration: Call sandbox API
- staging: Call staging API with test credentials
- production: Minimal health checks only

Include retry logic, timeout handling, and circuit breaker pattern.
```

---

## Test Organization Prompts

### Test File Structure

```
Organize tests for [FEATURE] following this structure:

```
apps/admin/src/
  app/[feature]/
    __tests__/
      [Feature].contract.test.ts    (@contract @critical)
      [Feature].unit.test.ts        (@unit @critical)
      [Feature].integration.test.ts (@integration @essential)
      [Feature].e2e.test.ts        (@e2e @important)
      [Feature].smoke.test.ts      (@smoke @critical)
      fixtures/
        mock[Feature].ts
        invalid[Feature].ts
      helpers/
        [feature]TestUtils.ts
```

Each test file must:
- Import getCurrentEnvironment()
- Use describeWithTags() for conditional execution
- Validate data with contracts
- Support environment switching
```

### Test Coverage Report

```
Generate test coverage report for [MODULE]:

Include:
1. Statement coverage by file
2. Branch coverage for critical paths
3. Test execution time by environment
4. Tag distribution analysis
5. Missing test identification

Format as:
```
Coverage Report: [MODULE]
━━━━━━━━━━━━━━━━━━━━━━━━
Statements: XX% (critical: XX%)
Branches: XX% (critical: XX%)

By Priority:
• @critical: XX/XX tests passing
• @essential: XX/XX tests passing  
• @important: XX/XX tests passing

By Environment:
• test_mock: XXms average
• test_integration: XXms average
• staging: XXms average
• production: XXms average

Gaps Identified:
• Missing @smoke test for [endpoint]
• No @contract test for [schema]
```
```

---

## Environment Configuration Prompts

### Environment Setup

```
Configure testing environments for [FEATURE]:

1. Update apps/admin/src/config/environments.ts:
   - Add feature-specific config to each environment
   - Set appropriate TEST_TAGS per environment
   - Configure timeouts and retries

2. Create environment-specific test data:
   - Mock fixtures for test_mock
   - Seed data for test_integration
   - Test accounts for staging
   - Read-only tests for production

3. Set up environment variables:
   - TEST_ENV for environment selection
   - Feature flags per environment
   - API endpoints per environment
   - Credentials per environment

Show the configuration for review.
```

### CI/CD Pipeline Configuration

```
Set up CI/CD pipeline for [FEATURE] with progressive testing:

GitHub Actions workflow:
1. On push: Run @unit @critical with test_mock
2. On PR: Run @integration @essential with test_integration
3. On merge to main: Run @e2e with staging
4. Post-deploy: Run @smoke with production

Include:
- Parallel test execution where possible
- Test result artifacts
- Coverage reports
- Failure notifications
- Automatic rollback triggers

Generate .github/workflows/[feature]-test.yml
```

---

## Test Execution Prompts

### Progressive Test Execution

```
Execute tests for [FEATURE] progressively:

Step 1 - Quick Validation (< 5s):
```bash
TEST_ENV=test_mock pnpm test --grep "@unit|@critical"
```

Step 2 - Integration Check (< 30s):
```bash
TEST_ENV=test_integration pnpm test --grep "@integration|@essential"
```

Step 3 - E2E Verification (< 2m):
```bash
TEST_ENV=staging pnpm playwright test
```

Step 4 - Production Smoke (< 10s):
```bash
TEST_ENV=production pnpm test --grep "@smoke"
```

Show results after each step and stop on critical failures.
```

### Test Debugging

```
Debug failing test for [TEST_NAME]:

1. Identify test tags and environment requirements
2. Check getCurrentEnvironment() configuration
3. Verify MSW handlers if @mock-only
4. Validate contract compliance
5. Check environment-specific assertions
6. Review timeout configurations
7. Examine test isolation issues

Run with debug output:
```bash
DEBUG=* TEST_ENV=[environment] pnpm test --grep "[TEST_NAME]" --reporter=verbose
```

Provide analysis of failure cause and fix recommendations.
```

---

## Automated Test Generation

### Generate Tests from Contract

```
Generate comprehensive tests from [CONTRACT_NAME]:

Auto-generate:
1. Valid data tests for each field
2. Invalid data tests for validation rules
3. Edge case tests for boundaries
4. Null/undefined handling tests
5. Type coercion tests
6. Relationship validation tests

Tag each generated test appropriately:
- Validation tests: @unit @critical
- Type tests: @unit @essential
- Edge cases: @unit @important
- Relationships: @integration @essential

Output test file with proper structure and tags.
```

### Generate MSW Handlers

```
Generate MSW handlers for [ENTITY]:

Create handlers for:
1. GET /api/[entity] - List with pagination
2. GET /api/[entity]/:id - Single item
3. POST /api/[entity] - Create with validation
4. PUT /api/[entity]/:id - Update with validation
5. DELETE /api/[entity]/:id - Delete with checks

Each handler must:
- Validate request data with contract
- Return contract-compliant responses
- Simulate realistic delays
- Handle error scenarios
- Support query parameters

Include both success and failure scenarios.
```

---

## Test Maintenance Prompts

### Update Test Tags

```
Review and update test tags for [MODULE]:

Current tags to review:
1. Upgrade @nice-to-have to @important where appropriate
2. Ensure all critical paths have @critical
3. Add missing environment tags
4. Remove obsolete tags
5. Add performance tags where needed

Show proposed changes before applying.
```

### Test Refactoring

```
Refactor tests in [MODULE] for better maintainability:

1. Extract common setup into beforeEach
2. Create test data factories
3. Reduce test interdependencies
4. Improve test descriptions
5. Consolidate duplicate assertions
6. Add missing cleanup in afterEach

Maintain all existing test coverage while improving structure.
```

---

## Usage Examples

### Complete Feature Implementation

```
Agent: I'll implement the vocabulary management feature using TDD workflow.

Step 1: Creating feature branch
[Creates branch: feature/vocabulary-management]

Step 2: Defining contracts
[Creates VocabularyContract with validation]

Step 3: Writing failing tests with tags
[Creates tests with @unit, @integration, @e2e, @smoke tags]

Step 4: Setting up environments
[Configures all 4 test environments]

Step 5: Creating MSW handlers
[Implements mock API responses]

Ready to proceed with implementation. Continue?
```

### Test Coverage Analysis

```
Agent: Analyzing test coverage for vocabularies module:

Type Coverage:
• @unit: 24 tests (60% coverage)
• @integration: 12 tests (30% coverage)
• @e2e: 3 tests (7.5% coverage)
• @smoke: 1 test (2.5% coverage)

Priority Gaps:
• Missing @critical test for delete operation
• No @essential test for bulk import
• Missing @smoke test for API health

Recommended additions:
1. Add delete confirmation test (@critical)
2. Add bulk import validation (@essential)
3. Add /api/vocabularies/health endpoint (@smoke)
```

---

## Summary

These prompts enable agents to:
1. **Implement TDD consistently** across all features
2. **Properly tag tests** for environment-based execution
3. **Generate appropriate test coverage** for each environment
4. **Analyze and improve** existing test suites
5. **Automate test generation** from contracts

The prompts ensure that every feature follows the same high-quality TDD workflow with proper environment support and progressive testing stages.