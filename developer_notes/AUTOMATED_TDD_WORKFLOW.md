# Automated TDD Workflow with Environment-Based Testing

## Overview

This document defines our automated Test-Driven Development workflow that integrates:
- 4 testing environments (test_mock, test_integration, staging, production)
- Type and priority tags for test organization
- Progressive testing stages from unit to production
- Agent-driven automation patterns

## Core Testing Philosophy

```
Contracts → Tests → Mock Implementation → Real Implementation → Production
```

Every feature follows this progression:
1. **Define contracts** (Zod schemas)
2. **Write tests with tags** (type, priority, environment)
3. **Implement with mocks** (MSW/fixtures)
4. **Connect real services** (progressive environments)
5. **Deploy with confidence** (smoke tests only)

## Test Tagging System

### Type Tags (What the test validates)

```typescript
/**
 * Test Type Tags:
 * @unit        - Pure functions, components, isolated logic
 * @integration - Service interactions, API calls, data flow
 * @e2e         - User workflows, browser automation
 * @smoke       - Critical path verification, health checks
 * @contract    - Data shape validation, schema compliance
 * @performance - Response times, memory usage, optimization
 * @security    - Auth, permissions, vulnerability checks
 */
```

### Priority Tags (Failure tolerance)

```typescript
/**
 * Priority Tags:
 * @critical    - Must pass in ALL environments (blocks deployment)
 * @essential   - Must pass in staging/production (blocks production)
 * @important   - Should pass in production (warning only)
 * @nice-to-have - Optional improvements (never blocks)
 */
```

### Environment Tags (Where it runs)

```typescript
/**
 * Environment Tags:
 * @mock-only      - Only runs with USE_MOCKS=true
 * @real-only      - Only runs with USE_MOCKS=false
 * @staging-only   - Only runs in staging environment
 * @prod-only      - Only runs in production
 * @all-envs       - Runs in all environments (default)
 */
```

## Environment Configuration

```typescript
// apps/admin/src/config/environments.ts
export const environments = {
  test_mock: {
    USE_MOCKS: true,
    SUPABASE_URL: 'http://localhost:54321',
    DATABASE: 'mock',
    TEST_TAGS: ['@unit', '@contract', '@mock-only']
  },
  test_integration: {
    USE_MOCKS: false,
    SUPABASE_URL: 'http://localhost:54321',
    DATABASE: 'local',
    TEST_TAGS: ['@integration', '@e2e', '@real-only']
  },
  staging: {
    USE_MOCKS: false,
    SUPABASE_URL: process.env.STAGING_SUPABASE_URL,
    DATABASE: 'staging',
    TEST_TAGS: ['@smoke', '@essential', '@staging-only']
  },
  production: {
    USE_MOCKS: false,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    DATABASE: 'production',
    TEST_TAGS: ['@smoke', '@critical', '@prod-only']
  }
};

// Get current environment
export function getCurrentEnvironment() {
  return environments[process.env.TEST_ENV || 'test_mock'];
}
```

## Test Runner Configuration

```typescript
// apps/admin/vitest.config.ts
import { defineConfig } from 'vitest/config';
import { getCurrentEnvironment } from './src/config/environments';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    
    // Filter tests by environment tags
    include: getTestPatterns(),
    
    // Configure timeouts by test type
    testTimeout: getTestTimeout(),
    hookTimeout: 10000,
    
    // Reporter configuration
    reporters: getReporters(),
    
    // Coverage thresholds by priority
    coverage: getCoverageConfig(),
  },
});

function getTestPatterns() {
  const env = getCurrentEnvironment();
  const patterns = [];
  
  // Include tests matching environment tags
  if (env.TEST_TAGS.includes('@unit')) {
    patterns.push('**/*.unit.test.{ts,tsx}');
  }
  if (env.TEST_TAGS.includes('@integration')) {
    patterns.push('**/*.integration.test.{ts,tsx}');
  }
  if (env.TEST_TAGS.includes('@e2e')) {
    patterns.push('**/*.e2e.test.{ts,tsx}');
  }
  if (env.TEST_TAGS.includes('@smoke')) {
    patterns.push('**/*.smoke.test.{ts,tsx}');
  }
  
  return patterns.length > 0 ? patterns : ['**/*.test.{ts,tsx}'];
}

function getTestTimeout() {
  const env = getCurrentEnvironment();
  
  if (env.DATABASE === 'mock') return 5000;  // 5s for mock tests
  if (env.DATABASE === 'local') return 30000; // 30s for local integration
  if (env.DATABASE === 'staging') return 60000; // 1m for staging
  return 10000; // 10s for production smoke tests
}

function getReporters() {
  const env = getCurrentEnvironment();
  
  if (env.DATABASE === 'production') {
    return ['json', 'junit']; // Machine-readable for monitoring
  }
  
  return ['verbose', 'html']; // Human-readable for development
}

function getCoverageConfig() {
  return {
    provider: 'v8',
    thresholds: {
      // Critical code must have high coverage
      'src/lib/services/**': {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90
      },
      // UI components can have lower coverage
      'src/components/**': {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70
      }
    }
  };
}
```

## Test Setup with Environment Switching

```typescript
// apps/admin/src/test/setup.ts
import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { server } from '@/mocks/server';
import { getCurrentEnvironment } from '@/config/environments';

const env = getCurrentEnvironment();

beforeAll(() => {
  // Setup based on environment
  if (env.USE_MOCKS) {
    server.listen({ onUnhandledRequest: 'warn' });
  }
  
  // Configure test database
  if (env.DATABASE === 'local') {
    // Setup test database connection
  }
});

afterAll(() => {
  if (env.USE_MOCKS) {
    server.close();
  }
});

beforeEach(() => {
  // Reset mocks between tests
  if (env.USE_MOCKS) {
    server.resetHandlers();
  }
});

// Custom test runner that respects tags
export function describeWithTags(
  name: string,
  tags: string[],
  fn: () => void
) {
  const env = getCurrentEnvironment();
  const shouldRun = tags.some(tag => env.TEST_TAGS.includes(tag));
  
  if (shouldRun) {
    describe(name, fn);
  } else {
    describe.skip(name, fn);
  }
}

// Tagged test helper
export function testWithTags(
  name: string,
  tags: string[],
  fn: () => void | Promise<void>
) {
  const env = getCurrentEnvironment();
  const shouldRun = tags.some(tag => env.TEST_TAGS.includes(tag));
  
  if (shouldRun) {
    test(name, fn);
  } else {
    test.skip(name, fn);
  }
}
```

## Progressive Test Implementation Pattern

### Step 1: Contract Definition with Tests

```typescript
// packages/contracts/src/Vocabulary.zod.ts
import { z } from 'zod';

export const VocabularyContract = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  namespace: z.string().url(),
  prefix: z.string().regex(/^[a-z]+$/),
  status: z.enum(['draft', 'published', 'deprecated']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Contract validation test
/**
 * @contract @critical @all-envs
 * Contract validation is critical and runs everywhere
 */
export const vocabularyContractTests = () => {
  test('should validate correct vocabulary data', () => {
    const valid = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Dublin Core',
      namespace: 'http://purl.org/dc/terms/',
      prefix: 'dc',
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    expect(() => VocabularyContract.parse(valid)).not.toThrow();
  });
  
  test('should reject invalid vocabulary data', () => {
    const invalid = {
      name: '', // Empty name
      namespace: 'not-a-url',
      prefix: 'DC', // Uppercase not allowed
    };
    
    expect(() => VocabularyContract.parse(invalid)).toThrow();
  });
};
```

### Step 2: Unit Tests with Mocks

```typescript
// apps/admin/src/app/vocabularies/__tests__/VocabularyService.unit.test.ts

/**
 * @unit @critical @mock-only
 * Service logic tests that run only with mocks
 */
describe('VocabularyService - Unit Tests', () => {
  let service: VocabularyService;
  
  beforeEach(() => {
    process.env.TEST_ENV = 'test_mock';
    service = new VocabularyService();
  });
  
  test('should validate vocabulary before creation', async () => {
    const invalid = { name: '' };
    
    await expect(service.create(invalid)).rejects.toThrow(
      'Validation failed'
    );
  });
  
  test('should generate prefix from name', () => {
    const prefix = service.generatePrefix('Dublin Core Terms');
    expect(prefix).toBe('dcterms');
  });
  
  test('should check namespace uniqueness', async () => {
    // Mock returns predetermined result
    const exists = await service.checkNamespaceExists(
      'http://purl.org/dc/terms/'
    );
    expect(exists).toBe(true);
  });
});
```

### Step 3: Integration Tests with MSW

```typescript
// apps/admin/src/app/vocabularies/__tests__/VocabularyAPI.integration.test.ts

/**
 * @integration @essential @all-envs
 * API integration tests that work with both mock and real
 */
describe('Vocabulary API - Integration Tests', () => {
  const env = getCurrentEnvironment();
  
  describeWithTags(
    'CRUD Operations',
    ['@integration', '@essential'],
    () => {
      test('should create vocabulary', async () => {
        const vocabulary = {
          name: 'Test Vocabulary',
          namespace: 'http://example.org/test',
          prefix: 'test',
          status: 'draft'
        };
        
        const response = await fetch('/api/vocabularies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vocabulary)
        });
        
        expect(response.ok).toBe(true);
        
        const created = await response.json();
        
        // Validate against contract regardless of environment
        expect(() => VocabularyContract.parse(created)).not.toThrow();
        
        // Environment-specific assertions
        if (env.USE_MOCKS) {
          expect(created.id).toBe('mock-id-123'); // Mock returns fixed ID
        } else {
          expect(created.id).toMatch(/^[0-9a-f-]{36}$/); // Real returns UUID
        }
      });
      
      test('should list vocabularies with pagination', async () => {
        const response = await fetch('/api/vocabularies?page=1&limit=10');
        const data = await response.json();
        
        expect(data).toHaveProperty('items');
        expect(data).toHaveProperty('total');
        expect(data.items.length).toBeLessThanOrEqual(10);
        
        // Validate each item
        data.items.forEach(item => {
          expect(() => VocabularyContract.parse(item)).not.toThrow();
        });
      });
    }
  );
});
```

### Step 4: E2E Tests with Environment Toggle

```typescript
// apps/admin/src/app/vocabularies/__tests__/VocabularyWorkflow.e2e.test.ts
import { test, expect } from '@playwright/test';

/**
 * @e2e @essential @real-only
 * End-to-end workflow tests that need real services
 */
test.describe('Vocabulary Management Workflow', () => {
  // Run same test against different environments
  ['test_integration', 'staging'].forEach(envName => {
    test.describe(`Environment: ${envName}`, () => {
      test.beforeAll(async () => {
        process.env.TEST_ENV = envName;
      });
      
      test('should complete vocabulary lifecycle', async ({ page }) => {
        // Navigate to vocabularies
        await page.goto('/vocabularies');
        
        // Create new vocabulary
        await page.click('[data-testid="create-vocabulary"]');
        await page.fill('[name="name"]', 'E2E Test Vocabulary');
        await page.fill('[name="namespace"]', 'http://example.org/e2e');
        await page.fill('[name="prefix"]', 'e2e');
        await page.click('[type="submit"]');
        
        // Verify creation
        await expect(page.locator('text=E2E Test Vocabulary')).toBeVisible();
        
        // Edit vocabulary
        await page.click('[data-testid="edit-vocabulary"]');
        await page.selectOption('[name="status"]', 'published');
        await page.click('[type="submit"]');
        
        // Verify status change
        await expect(page.locator('.ant-tag-green')).toContainText('PUBLISHED');
        
        // Delete vocabulary (only in test environment)
        if (envName === 'test_integration') {
          await page.click('[data-testid="delete-vocabulary"]');
          await page.click('text=Confirm');
          await expect(page.locator('text=E2E Test Vocabulary')).not.toBeVisible();
        }
      });
    });
  });
});
```

### Step 5: Smoke Tests for Production

```typescript
// apps/admin/src/app/vocabularies/__tests__/VocabularySmoke.smoke.test.ts

/**
 * @smoke @critical @prod-only
 * Minimal smoke tests for production health checks
 */
describe('Vocabulary Service - Smoke Tests', () => {
  testWithTags(
    'should reach vocabulary API endpoint',
    ['@smoke', '@critical'],
    async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/vocabularies/health`
      );
      
      expect(response.status).toBe(200);
      
      const health = await response.json();
      expect(health.status).toBe('healthy');
      expect(health.database).toBe('connected');
    }
  );
  
  testWithTags(
    'should have correct permissions configured',
    ['@smoke', '@critical'],
    async () => {
      // Check anonymous access is blocked
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/vocabularies`,
        { headers: {} } // No auth header
      );
      
      expect(response.status).toBe(401);
    }
  );
  
  testWithTags(
    'should serve vocabulary UI',
    ['@smoke', '@essential'],
    async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/vocabularies`
      );
      
      expect(response.status).toBe(200);
      
      const html = await response.text();
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('vocabulary');
    }
  );
});
```

## Automated Test Execution Pipeline

### Local Development Commands

```bash
# Development with continuous testing
pnpm test:dev
# Runs: TEST_ENV=test_mock vitest --watch

# Pre-commit validation
pnpm test:commit
# Runs: TEST_ENV=test_mock vitest --run --grep "@unit|@critical"

# Pre-push comprehensive
pnpm test:push
# Runs: TEST_ENV=test_integration vitest --run --grep "@essential|@critical"

# Pre-deploy verification
pnpm test:deploy
# Runs: TEST_ENV=staging playwright test
```

### CI/CD Pipeline Commands

```yaml
# .github/workflows/test.yml
name: Progressive Testing

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: TEST_ENV=test_mock pnpm test:ci
      
  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: TEST_ENV=test_integration pnpm test:ci
      
  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: npx playwright install
      - run: TEST_ENV=staging pnpm test:e2e
      
  deploy:
    needs: e2e-tests
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm build
      - run: pnpm deploy:staging
      - run: TEST_ENV=staging pnpm test:smoke
```

## Agent Automation Patterns

### Pattern 1: Test-First Feature Development

```typescript
// Agent prompt template
const featureDevelopmentPrompt = `
Create a new feature: ${featureName}

Step 1: Define contracts
- Create Zod schema in packages/contracts
- Add contract validation tests (@contract @critical)

Step 2: Write failing tests
- Unit tests with @unit @critical @mock-only
- Integration tests with @integration @essential @all-envs
- E2E tests with @e2e @important @real-only

Step 3: Implement with mocks
- Create MSW handlers
- Implement service with USE_MOCKS check
- Run TEST_ENV=test_mock pnpm test

Step 4: Connect real services
- Add real API implementation
- Run TEST_ENV=test_integration pnpm test

Step 5: Add smoke tests
- Create minimal health checks (@smoke @critical)
- Verify in staging environment
`;
```

### Pattern 2: Test Tag Analysis

```typescript
// Agent analyzes test coverage by tags
async function analyzeTestCoverage() {
  const tests = await findAllTests();
  
  const analysis = {
    byType: {
      unit: tests.filter(t => t.tags.includes('@unit')).length,
      integration: tests.filter(t => t.tags.includes('@integration')).length,
      e2e: tests.filter(t => t.tags.includes('@e2e')).length,
      smoke: tests.filter(t => t.tags.includes('@smoke')).length,
    },
    byPriority: {
      critical: tests.filter(t => t.tags.includes('@critical')).length,
      essential: tests.filter(t => t.tags.includes('@essential')).length,
      important: tests.filter(t => t.tags.includes('@important')).length,
      niceToHave: tests.filter(t => t.tags.includes('@nice-to-have')).length,
    },
    byEnvironment: {
      mockOnly: tests.filter(t => t.tags.includes('@mock-only')).length,
      realOnly: tests.filter(t => t.tags.includes('@real-only')).length,
      allEnvs: tests.filter(t => t.tags.includes('@all-envs')).length,
    },
    
    // Identify gaps
    gaps: {
      missingCritical: findFeaturesWithoutCriticalTests(),
      missingSmoke: findEndpointsWithoutSmokeTests(),
      missingContracts: findServicesWithoutContractTests(),
    }
  };
  
  return analysis;
}
```

### Pattern 3: Automated Test Generation

```typescript
// Agent generates tests based on contracts
function generateTestsFromContract(contract: ZodSchema) {
  const tests = [];
  
  // Generate contract validation tests
  tests.push({
    type: '@contract @critical',
    code: generateContractValidationTest(contract)
  });
  
  // Generate unit tests for each field
  contract.shape.forEach(field => {
    tests.push({
      type: '@unit @essential',
      code: generateFieldValidationTest(field)
    });
  });
  
  // Generate integration test skeleton
  tests.push({
    type: '@integration @essential',
    code: generateCRUDIntegrationTest(contract)
  });
  
  // Generate smoke test
  tests.push({
    type: '@smoke @critical',
    code: generateHealthCheckTest(contract)
  });
  
  return tests;
}
```

## Test Priority Matrix

| Test Type | Critical | Essential | Important | Nice-to-Have |
|-----------|----------|-----------|-----------|--------------|
| **Unit** | Core business logic | Service methods | Helper functions | Utility functions |
| **Integration** | Auth, Database | API endpoints | External services | Third-party APIs |
| **E2E** | User registration | CRUD workflows | Advanced features | UI polish |
| **Smoke** | API health | Auth check | Database connection | Feature flags |
| **Contract** | All schemas | - | - | - |

## Failure Handling by Environment

```typescript
// Environment-specific failure policies
const failurePolicies = {
  test_mock: {
    '@critical': 'block', // Stop immediately
    '@essential': 'warn',  // Continue but warn
    '@important': 'info',  // Just log
    '@nice-to-have': 'ignore'
  },
  test_integration: {
    '@critical': 'block',
    '@essential': 'block', // Stricter in integration
    '@important': 'warn',
    '@nice-to-have': 'ignore'
  },
  staging: {
    '@critical': 'block',
    '@essential': 'block',
    '@important': 'block', // Even stricter in staging
    '@nice-to-have': 'warn'
  },
  production: {
    '@critical': 'alert', // Page ops team
    '@essential': 'alert',
    '@important': 'log',
    '@nice-to-have': 'ignore'
  }
};
```

## Implementation Checklist

- [ ] Configure 4 environments in `environments.ts`
- [ ] Set up test runner with tag filtering
- [ ] Create test helpers for tag-based execution
- [ ] Write contract tests for all schemas
- [ ] Tag all existing tests appropriately
- [ ] Set up MSW handlers for mock environment
- [ ] Create environment-aware service implementations
- [ ] Configure CI/CD pipeline with progressive stages
- [ ] Add smoke tests for production monitoring
- [ ] Document test coverage by tags
- [ ] Create agent prompts for automated testing

## Summary

This automated TDD workflow ensures:
1. **Contracts drive everything** - Single source of truth
2. **Tests are properly tagged** - Clear organization and priority
3. **Progressive confidence** - From mocks to production
4. **Environment-aware execution** - Right tests at right time
5. **Automated enforcement** - CI/CD prevents bad deployments
6. **Agent assistance** - Consistent implementation patterns