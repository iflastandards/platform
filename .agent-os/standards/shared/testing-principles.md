# Testing Principles - Shared Standards

## Core Testing Philosophy

### Integration-Heavy Testing Trophy
The IFLA Standards Platform follows an integration-heavy testing approach that emphasizes realistic user scenarios over isolated unit tests.

```
       🏆
    /       \
   /   E2E   \     ← Fewer, critical user journeys
  /           \
 /             \
/  Integration  \   ← Primary focus (60-70% of tests)
\               /
 \             /
  \   Unit    /     ← Minimal, pure logic only
   \         /
    \_______/
```

### Testing Principles
1. **Integration > Unit**: Test components working together, not in isolation
2. **Mock-First Development**: Perfect UI/UX before backend implementation
3. **User-Centric**: Test what users actually do, not implementation details  
4. **Content Integrity**: Validate data accuracy and consistency
5. **Accessibility First**: WCAG compliance built into test suites

## Test Category System

### Required Test Tags (AI-Assisted)
All tests must be tagged using the AI tagging system:
```bash
pnpm test:tag --staged --provider anthropic
```

#### Category Tags (Required)
- `@unit` - Isolated logic testing (minimal usage)
- `@integration` - Component + dependency testing (primary)
- `@e2e` - Full user journey testing  
- `@content` - Content validation and integrity
- `@env` - Environment/deployment testing (CI only)

#### Functional Tags (Required)
- `@api` - API integration and data flow
- `@auth` - Authentication and authorization
- `@ui` - User interface components
- `@navigation` - Site navigation and routing
- `@vocabulary` - Vocabulary data and display
- `@accessibility` - WCAG compliance testing
- `@performance` - Performance and optimization

#### Priority Tags (Required)
- `@critical` - Core functionality (must not break)
- `@happy-path` - Standard user workflows
- `@error-handling` - Error scenarios and recovery
- `@edge-case` - Boundary conditions and unusual inputs
- `@regression` - Prevention of known issues

## 5-Phase Testing Strategy

### Phase 1: Selective Testing (Development)
**When**: During active development
**Command**: `pnpm test` (affected tests only)
**Purpose**: Fast feedback loop for developers

```bash
# Run only tests affected by current changes
pnpm test --grep "@integration"  # Integration tests
pnpm test --grep "@critical"     # Critical path tests
pnpm nx test [project]           # Project-specific tests
```

### Phase 2: Pre-Commit (Automated)
**When**: Git pre-commit hook
**Command**: `pnpm test:pre-commit`
**Purpose**: Quality gate before code commits

Includes:
- TypeScript validation
- ESLint checks  
- Affected unit tests
- AI test tagging validation

### Phase 3: Pre-Push (Automated)
**When**: Git pre-push hook
**Command**: `pnpm test:pre-push` 
**Purpose**: Integration validation before sharing

Includes:
- Integration tests
- Build verification
- Critical E2E tests
- Security scans

### Phase 4: Comprehensive (Manual)
**When**: Before releases, weekly validation
**Command**: `pnpm test:comprehensive`
**Purpose**: Full system validation

Includes:
- All test suites
- Performance benchmarks
- Accessibility compliance
- Cross-browser testing

### Phase 5: CI Environment (Automated)
**When**: Deployment pipeline
**Command**: Smoke tests against live URLs
**Purpose**: Production readiness validation

## Mock-First Development Strategy

### Development Lifecycle
1. **Phase 1**: Define contracts with Zod schemas
2. **Phase 2**: Create MSW (Mock Service Worker) handlers
3. **Phase 3**: Build perfect UI with mocked data
4. **Phase 4**: Implement backend services
5. **Phase 5**: Switch from mocks to live APIs

### Mock Service Worker (MSW) Integration

#### Setup Pattern
```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Test setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());  
afterAll(() => server.close());
```

#### Handler Pattern
```typescript
// src/mocks/handlers/users.ts
import { http, HttpResponse } from 'msw';
import { UserSchema } from '@/contracts/schemas/User.zod';
import { generateUsers } from '../fixtures';

export const userHandlers = [
  http.get('/api/users', () => {
    const users = generateUsers(10);
    return HttpResponse.json({
      data: users,
      total: users.length,
    });
  }),

  http.post('/api/users', async ({ request }) => {
    const userData = await request.json();
    
    // Validate input with contract
    const validatedData = UserSchema.omit({ 
      id: true, 
      createdAt: true, 
      updatedAt: true 
    }).parse(userData);
    
    const newUser = {
      ...validatedData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json({ data: newUser });
  }),
];
```

### Environment Switching
```typescript
// Environment-based provider switching
export const dataProvider = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  ? mswDataProvider      // Mock data for development/testing
  : supabaseDataProvider // Live data for production
```

## Contract-Driven Testing

### Zod Schema Validation
```typescript
// All external data must be validated
export class UsersAdapter {
  async getAll(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*');
    
    // Always validate external data
    return UserSchema.array().parse(data);
  }
}
```

### Test Data Generation
```typescript
// src/mocks/fixtures.ts
import { faker } from '@faker-js/faker';
import { UserSchema, type User } from '@/contracts/schemas/User.zod';

export function generateUser(overrides: Partial<User> = {}): User {
  const user: User = {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(['admin', 'editor', 'author']),
    createdAt: faker.date.recent().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  };

  // Always validate generated data
  return UserSchema.parse(user);
}
```

## Integration Testing Patterns

### Component + Data Testing
```typescript
describe('UserManagement Integration @integration @ui @api', () => {
  beforeAll(() => {
    server.use(...userHandlers);
  });

  it('should create user through complete flow @happy-path', async () => {
    render(<UserManagement />);
    
    // User interaction
    await userEvent.click(screen.getByText('Add User'));
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.click(screen.getByText('Save'));
    
    // Verify MSW integration
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should handle validation errors gracefully @error-handling', async () => {
    // Override handler to return validation error
    server.use(
      http.post('/api/users', () => {
        return HttpResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      })
    );

    render(<UserManagement />);
    
    // Submit invalid data
    await userEvent.click(screen.getByText('Add User'));
    await userEvent.type(screen.getByLabelText(/email/i), 'invalid-email');
    await userEvent.click(screen.getByText('Save'));

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });
});
```

## E2E Testing Standards

### Deterministic Testing
```typescript
// E2E tests use mocks for predictable behavior
test('user workflow @e2e @critical @happy-path', async ({ page }) => {
  // Run with controlled mock data
  await page.goto('/users?mock=true');
  
  // Predictable test data ensures consistent results
  await page.click('text=Add User');
  await page.fill('[placeholder*="name"]', 'Test User');
  await page.click('button:has-text("Save")');
  
  // Verify against known mock data
  await expect(page.locator('text=Test User')).toBeVisible();
});
```

### Cross-Site Testing
```typescript
test('multi-site navigation @e2e @navigation @multi-site', async ({ page }) => {
  await page.goto('/');
  
  // Navigate between Docusaurus sites
  await page.click('text=ISBD');
  await page.waitForURL('**/isbd/**');
  await expect(page.locator('h1')).toContainText('ISBD');
  
  // Test admin interface
  await page.click('text=Admin');
  await page.waitForURL('**/admin/**');
  await expect(page.locator('h1')).toContainText('Admin');
});
```

## Accessibility Testing Standards

### Automated A11y Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should be accessible @accessibility @critical', async () => {
  const { container } = render(<VocabularyTable vocabulary={mockData} />);
  
  // WCAG compliance validation
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Keyboard Navigation Testing
```typescript
it('should support keyboard navigation @accessibility @ui', async () => {
  render(<NavigationMenu />);
  
  // Test tab navigation
  await userEvent.keyboard('{Tab}');
  expect(screen.getByRole('button', { name: /menu/i })).toHaveFocus();
  
  // Test Enter activation
  await userEvent.keyboard('{Enter}');
  expect(screen.getByRole('menu')).toBeVisible();
});
```

## Performance Testing

### Performance Budgets
```typescript
it('should render large datasets efficiently @performance', () => {
  const largeDataset = Array.from({ length: 1000 }, generateUser);
  
  const startTime = performance.now();
  render(<VocabularyTable vocabulary={largeDataset} />);
  const renderTime = performance.now() - startTime;
  
  // Performance budget: <500ms for 1000 items
  expect(renderTime).toBeLessThan(500);
});
```

### Memory Leak Detection
```typescript
it('should not leak memory on repeated renders @performance', () => {
  const initialMemory = performance.memory?.usedJSHeapSize || 0;
  
  for (let i = 0; i < 100; i++) {
    const { unmount } = render(<ExpensiveComponent />);
    unmount();
  }
  
  // Force garbage collection if available
  if (global.gc) global.gc();
  
  const finalMemory = performance.memory?.usedJSHeapSize || 0;
  const memoryIncrease = finalMemory - initialMemory;
  
  // Memory should not increase significantly
  expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB
});
```

## Test Organization

### File Placement
```
Component tests: Co-located with components
Integration tests: In __tests__ directories  
E2E tests: In e2e/ directory with site grouping
Fixtures: Centralized in src/mocks/fixtures
```

### Test Naming
```typescript
// Descriptive test names with context
it('should filter vocabulary terms by category when filter is selected @integration @vocabulary @user-flow', () => {
  // Test implementation
});

it('should display error message when API request fails @error-handling @api', () => {
  // Test implementation  
});
```

## Quality Gates

### Definition of Done (Testing)
- [ ] All new code has appropriate test coverage
- [ ] Tests use correct tags for filtering
- [ ] Integration tests cover happy path + error scenarios
- [ ] Accessibility compliance validated
- [ ] Performance impact measured
- [ ] Cross-browser compatibility verified (E2E)

### Test Coverage Expectations
- **Integration tests**: Primary coverage metric
- **Critical paths**: 100% coverage required
- **Error scenarios**: All error states tested
- **Edge cases**: Boundary conditions covered
- **Accessibility**: WCAG compliance validated

This testing framework ensures high-quality, maintainable code across both Next.js and Docusaurus applications in the IFLA Standards Platform.