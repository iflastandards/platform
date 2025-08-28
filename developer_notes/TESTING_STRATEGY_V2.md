# Testing Strategy V2 - Feature Factory & Contract-Driven Development

## Overview

Our testing strategy has evolved to support the Feature Factory method with contract-driven development, emphasizing:
1. **Contracts First**: Define Zod schemas and data contracts
2. **Mock-First UI Development**: Build UI with mock data providers
3. **Progressive Enhancement**: Switch from mock → demo → live data
4. **Nx Affected**: Minimize test execution at every stage

## 🏭 Feature Factory Testing Workflow

### Phase 1: Contract Definition
```typescript
// 1. Define the contract with Zod
const UserContract = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(['admin', 'editor', 'viewer'])
});

// 2. Create type from contract
type User = z.infer<typeof UserContract>;
```

### Phase 2: Mock Data Provider (UI Development)
```typescript
/**
 * @unit @critical @ui
 * Tests UI with mock data provider
 */
describe('UserList with Mock Provider', () => {
  const mockProvider = createMockDataProvider({
    getUsers: async () => mockUsers
  });
  
  it('should render users from mock provider', () => {
    // Test UI components with deterministic mock data
  });
});
```

### Phase 3: Demo Data Provider (Integration)
```typescript
/**
 * @integration @critical @api
 * Tests with demo data provider (MSW or fixtures)
 */
describe('UserList with Demo Provider', () => {
  const demoProvider = createDemoDataProvider({
    // Uses MSW or test fixtures
    endpoint: '/api/users'
  });
  
  it('should handle demo data correctly', () => {
    // Test with realistic but safe demo data
  });
});
```

### Phase 4: Live Data Provider (Local/Preview)
```typescript
/**
 * @integration @server-dependent @api @local-only
 * Tests with live services using demo data
 */
describe('UserList with Live Provider', () => {
  const liveProvider = createLiveDataProvider({
    // Connects to Supabase/Google Sheets with demo data
    apiUrl: process.env.API_URL
  });
  
  beforeAll(() => {
    // Requires admin server running
    if (!isServerRunning(3007)) {
      throw new Error('Admin server required: nx run admin:dev');
    }
  });
  
  it('should work with live services (demo data)', () => {
    // Test against actual services with safe demo data
  });
});
```

## 📊 Testing Phases by Environment

### Local Development

#### After Every Save
- **Automatic**: TypeScript type checking
- **Automatic**: ESLint/Prettier formatting
- **Tags**: N/A (IDE integration)

#### Pre-Commit (Fast Feedback)
```bash
# Runs via husky pre-commit hook
nx affected --target=test --base=HEAD~1 --grep "@unit"
nx affected --target=test --base=HEAD~1 --grep "@integration" --grep-invert "@server-dependent"
```
- **@unit**: Pure unit tests with mocks
- **@integration** (without @server-dependent): MSW-based integration tests

#### Pre-Push (Thorough Validation)
```bash
# Runs via husky pre-push hook
nx affected --target=test --base=origin/main --grep "@integration"
nx affected --target=test --base=origin/main --grep "@e2e"
```
- **@integration @server-dependent**: Tests with live demo data (requires admin server)
- **@e2e @server-dependent**: Browser tests with demo data

### CI - Preview Environment

#### On PR (Before Merge)
```yaml
- name: Unit & Mock Integration Tests
  run: nx affected --target=test --base=origin/main --grep-invert "@server-dependent"

- name: Build Affected
  run: nx affected --target=build --base=origin/main

- name: Deploy Preview
  id: deploy-preview
  run: ./scripts/deploy-preview.sh

- name: Live Demo Data Tests
  run: |
    export API_URL=${{ steps.deploy-preview.outputs.url }}
    nx affected --target=test --base=origin/main --grep "@integration.*@preview-safe"
    nx affected --target=test --base=origin/main --grep "@e2e.*@preview-safe"
```

### CI - Production Environment

#### After Production Deploy
```yaml
- name: Smoke Tests Only
  run: nx affected --target=test --base=${{ github.event.before }} --grep "@smoke.*@post-deploy"

- name: Service Health Checks
  run: nx affected --target=test --base=${{ github.event.before }} --grep "@health.*@post-deploy"

- name: API Availability
  run: nx affected --target=test --base=${{ github.event.before }} --grep "@api.*@health.*@post-deploy"
```

**CRITICAL**: No integration or E2E tests in production (live user data)

## 🏷️ Updated Tag Classification

### Test Categories

#### 1. Unit Tests (@unit)
- **When**: Every commit (pre-commit hook)
- **Requires**: Nothing (fully mocked)
- **Example**: Component render tests, pure function tests
```typescript
/**
 * @unit @critical @ui
 */
```

#### 2. Mock Integration (@integration)
- **When**: Pre-commit (fast) and CI
- **Requires**: Nothing (MSW mocks)
- **Example**: API contract tests with MSW
```typescript
/**
 * @integration @critical @api
 */
```

#### 3. Demo Data Integration (@integration @server-dependent)
- **When**: Pre-push (local) and Preview (CI)
- **Requires**: Admin server (local: port 3007, preview: deployed URL)
- **Services**: Supabase, Google Sheets with demo data
```typescript
/**
 * @integration @server-dependent @api @demo-data
 */
```

#### 4. E2E Tests (@e2e @server-dependent)
- **When**: Pre-push (local) and Preview (CI)
- **Requires**: Admin server + any other specified servers
- **Note**: Must explicitly state non-admin server requirements
```typescript
/**
 * @e2e @server-dependent @ui @requires-portal @demo-data
 */
```

#### 5. Smoke Tests (@smoke @post-deploy)
- **When**: After production deployment only
- **Requires**: Deployed production URLs
- **Scope**: Critical path validation only
```typescript
/**
 * @smoke @post-deploy @critical
 */
```

#### 6. Health Checks (@health @post-deploy)
- **When**: After any deployment
- **Requires**: Deployed service URLs
- **Scope**: Service availability only
```typescript
/**
 * @health @post-deploy @api
 */
```

### Environment Tags

| Tag | Description | When Used |
|-----|-------------|-----------|
| @demo-data | Uses demo/test data | Local, Preview |
| @preview-safe | Safe for preview environment | CI Preview |
| @server-dependent | Needs servers running | Local, Preview |
| @requires-portal | Needs portal server (port 3000) | Explicit only |
| @requires-[site] | Needs specific Docusaurus site | Explicit only |
| @post-deploy | Runs after deployment | Production only |
| @health | Service availability check | All deployments |

### Data Provider Tags

| Tag | Provider Type | Description |
|-----|--------------|-------------|
| @mock-provider | MockDataProvider | Hardcoded test data |
| @demo-provider | DemoDataProvider | MSW or fixtures |
| @live-provider | LiveDataProvider | Real services, demo data |

## 🚀 Nx Affected Usage

### Every Test Command Uses Affected

```bash
# Local development
nx affected:test --base=HEAD~1  # Compare to last commit

# Pre-push
nx affected:test --base=origin/main  # Compare to main branch

# CI
nx affected:test --base=origin/main  # PR comparison
nx affected:test --base=${{ github.event.before }}  # Deploy comparison

# With tag filtering
nx affected:test --base=HEAD~1 --grep "@unit"
nx affected:test --base=origin/main --grep "@integration" --grep-invert "@server-dependent"
```

### Configuration in nx.json

```json
{
  "affected": {
    "defaultBase": "main"
  },
  "targetDefaults": {
    "test": {
      "cache": true,
      "inputs": ["default", "^production"],
      "options": {
        "passWithNoTests": true
      }
    }
  }
}
```

## 📝 Test File Examples

### Unit Test (Pre-commit)
```typescript
/**
 * @unit @critical @ui
 * No server dependencies, runs on every commit
 */
import { render } from '@testing-library/react';
import { UserList } from './UserList';
import { mockUsers } from '@/test/fixtures';

describe('UserList Component', () => {
  it('should render users', () => {
    const { getByText } = render(
      <UserList users={mockUsers} />
    );
    expect(getByText(mockUsers[0].name)).toBeInTheDocument();
  });
});
```

### Mock Integration Test (Pre-commit)
```typescript
/**
 * @integration @critical @api
 * Uses MSW, no server needed
 */
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { UserService } from './UserService';

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json(mockUsers);
  })
);

describe('UserService with MSW', () => {
  beforeAll(() => server.listen());
  
  it('should fetch users', async () => {
    const users = await UserService.getAll();
    expect(users).toEqual(mockUsers);
  });
});
```

### Live Demo Integration Test (Pre-push/Preview)
```typescript
/**
 * @integration @server-dependent @api @demo-data @preview-safe
 * Requires admin server, uses demo data in real services
 */
describe('UserService with Live Provider', () => {
  beforeAll(async () => {
    // Ensure admin server is running
    await waitForServer(process.env.ADMIN_URL || 'http://localhost:3007');
    // Ensure we're using demo dataset
    await switchToDataset('demo');
  });

  it('should CRUD users with live services', async () => {
    const user = await UserService.create({
      name: 'Demo User',
      email: 'demo@test.com'
    });
    expect(user.id).toBeDefined();
    
    // Clean up demo data
    await UserService.delete(user.id);
  });
});
```

### E2E Test Requiring Multiple Servers
```typescript
/**
 * @e2e @server-dependent @ui @requires-portal @demo-data
 * Explicitly requires portal server besides admin
 */
import { test, expect } from '@playwright/test';

test.describe('Cross-Site Navigation', () => {
  test.beforeAll(async () => {
    // Explicitly check for required servers
    await waitForServer('http://localhost:3007'); // Admin
    await waitForServer('http://localhost:3000'); // Portal (explicit)
  });

  test('should navigate between admin and portal', async ({ page }) => {
    await page.goto('http://localhost:3007/admin');
    await page.click('[data-testid="portal-link"]');
    await expect(page).toHaveURL('http://localhost:3000');
  });
});
```

### Smoke Test (Production Only)
```typescript
/**
 * @smoke @post-deploy @critical
 * Validates critical paths after production deploy
 */
import { test, expect } from '@playwright/test';

test.describe('Production Health', () => {
  test('should load admin dashboard', async ({ page }) => {
    await page.goto(process.env.PROD_URL + '/admin');
    await expect(page.locator('h1')).toContainText('Dashboard');
    // No data modifications in production!
  });
});
```

## 🔧 Package.json Scripts

```json
{
  "scripts": {
    // Automatic (IDE)
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --fix",
    
    // Pre-commit (fast)
    "test:pre-commit": "nx affected:test --base=HEAD~1 --grep '@unit|@integration' --grep-invert '@server-dependent'",
    
    // Pre-push (thorough)
    "test:pre-push": "nx affected:test --base=origin/main --grep '@integration|@e2e' --grep '@server-dependent'",
    
    // Admin server tests
    "test:admin": "nx affected:test --base=HEAD~1 --grep '@server-dependent' --grep-invert '@requires-'",
    
    // Tests requiring specific servers
    "test:with-portal": "nx affected:test --base=HEAD~1 --grep '@requires-portal'",
    
    // CI Preview
    "test:preview": "nx affected:test --base=origin/main --grep '@preview-safe'",
    
    // Post-deploy
    "test:smoke": "nx affected:test --base=$BEFORE_SHA --grep '@smoke.*@post-deploy'",
    "test:health": "nx affected:test --base=$BEFORE_SHA --grep '@health.*@post-deploy'"
  }
}
```

## ✅ Key Principles

1. **Contract-First**: Define data contracts before implementation
2. **Mock-First UI**: Build UI with mock providers before backend
3. **Progressive Enhancement**: Mock → Demo → Live data
4. **Nx Affected Everything**: Only test what changed
5. **Explicit Server Requirements**: Default is admin-only, others must be explicit
6. **Demo Data Safety**: Never test with production data
7. **Environment Appropriate**: Right tests at right time
8. **Fast Feedback**: Unit/mock tests on commit, integration on push
9. **Production Caution**: Only smoke/health checks in production

## 🚨 Critical Rules

1. **Server dependencies must be explicit** - Don't assume servers are running
2. **@requires-[server] tags are mandatory** - For any non-admin server needs
3. **Demo data only in preview** - Never modify production data
4. **Nx affected is non-negotiable** - Always use affected commands
5. **Progressive data providers** - Mock → Demo → Live in that order