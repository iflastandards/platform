# Next.js Testing Standards

## Testing Philosophy: Mock-First Strategy

The Next.js admin application follows a **Mock-First Development** approach where features are fully functional with MSW mocks before connecting to live APIs. This ensures reliable testing and faster development cycles.

## Testing Stack

- **Unit Testing**: Vitest + React Testing Library  
- **Integration Testing**: MSW (Mock Service Worker) + React Testing Library
- **E2E Testing**: Playwright with mock-first approach
- **Component Testing**: React Testing Library + Ant Design Test Utils

## Test Categories and Tags (Required)

All tests must use the AI tagging system. Use `pnpm test:tag --staged` before commits.

### Category Tags (Required)
- `@unit` - Isolated logic testing (rare for UI)
- `@integration` - Component + MSW testing (primary)
- `@e2e` - Full user journey testing
- `@smoke` - CI-only against deployed URLs

### Functional Tags (Required)
- `@api` - API integration testing
- `@auth` - Authentication flows
- `@rbac` - Role-based access control
- `@ui` - User interface components
- `@validation` - Form and data validation
- `@admin` - Admin-specific functionality

### Priority Tags (Required)
- `@critical` - Core functionality
- `@happy-path` - Standard user flows
- `@error-handling` - Error scenarios
- `@edge-case` - Boundary conditions

## Integration Testing (Primary Approach)

### MSW Setup
**Location**: `/apps/admin/src/mocks/`

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { UserSchema } from '@/packages/contracts/schemas/User.zod';
import { generateUsers, generateUser } from './fixtures';

export const userHandlers = [
  // List users
  http.get('/api/users', () => {
    const users = generateUsers(10);
    return HttpResponse.json({
      data: users,
      total: users.length,
    });
  }),

  // Get single user
  http.get('/api/users/:id', ({ params }) => {
    const user = generateUser({ id: params.id as string });
    return HttpResponse.json({ data: user });
  }),

  // Create user
  http.post('/api/users', async ({ request }) => {
    const userData = await request.json();
    
    // Validate input with Zod
    const validatedData = UserSchema.omit({ id: true, createdAt: true, updatedAt: true })
      .parse(userData);
    
    const newUser = generateUser({
      ...validatedData,
      id: crypto.randomUUID(),
    });
    
    return HttpResponse.json({ data: newUser });
  }),

  // Update user
  http.put('/api/users/:id', async ({ params, request }) => {
    const updates = await request.json();
    const updatedUser = generateUser({
      id: params.id as string,
      ...updates,
    });
    
    return HttpResponse.json({ data: updatedUser });
  }),

  // Delete user
  http.delete('/api/users/:id', ({ params }) => {
    return HttpResponse.json({ 
      message: `User ${params.id} deleted`,
      success: true 
    });
  }),
];

export const handlers = [
  ...userHandlers,
  // ... other resource handlers
];
```

### Mock Data Generation
```typescript
// mocks/fixtures.ts
import { faker } from '@faker-js/faker';
import { UserSchema, type User } from '@/packages/contracts/schemas/User.zod';

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

export function generateUsers(count: number): User[] {
  return Array.from({ length: count }, () => generateUser());
}

export function generateCsvImport(overrides: Partial<CsvImport> = {}): CsvImport {
  return CsvImportSchema.parse({
    id: faker.string.uuid(),
    filename: `${faker.system.fileName()}.csv`,
    status: faker.helpers.arrayElement(['pending', 'processing', 'completed', 'failed']),
    rowCount: faker.number.int({ min: 10, max: 1000 }),
    errorCount: faker.number.int({ min: 0, max: 10 }),
    createdAt: faker.date.recent().toISOString(),
    userId: faker.string.uuid(),
    ...overrides,
  });
}
```

### Integration Test Pattern
```typescript
// components/UserForm.test.tsx
import { render, screen, userEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/mocks/server';
import { userHandlers } from '@/mocks/handlers';
import { UserForm } from './UserForm';

describe('UserForm Integration @integration @ui @validation @admin', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  beforeAll(() => {
    // Setup MSW handlers
    server.use(...userHandlers);
  });

  afterEach(() => {
    queryClient.clear();
  });

  function renderWithProviders(ui: React.ReactElement) {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  }

  it('should create user with valid data', async () => {
    const mockOnSuccess = jest.fn();
    
    renderWithProviders(
      <UserForm onSuccess={mockOnSuccess} />
    );

    // Fill form
    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.selectOptions(screen.getByLabelText(/role/i), 'admin');

    // Submit form
    await userEvent.click(screen.getByText(/save/i));

    // Verify MSW mock was called and success callback triggered
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
        })
      );
    });
  });

  it('should handle validation errors', async () => {
    renderWithProviders(<UserForm />);

    // Submit empty form
    await userEvent.click(screen.getByText(/save/i));

    // Check validation messages
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should handle server errors gracefully', async () => {
    // Override handler to return error
    server.use(
      http.post('/api/users', () => {
        return HttpResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        );
      })
    );

    renderWithProviders(<UserForm />);

    await userEvent.type(screen.getByLabelText(/name/i), 'Existing User');
    await userEvent.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await userEvent.selectOptions(screen.getByLabelText(/role/i), 'admin');
    await userEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
    });
  });
});
```

### refine.dev Integration Testing
```typescript
// pages/users.test.tsx
import { render, screen, userEvent, waitFor } from '@testing-library/react';
import { RefineProvider } from '@refinedev/core';
import { mswDataProvider } from '@/providers/mswDataProvider';
import UsersListPage from './page';

describe('Users List Page @integration @api @rbac @admin', () => {
  function renderWithRefine(ui: React.ReactElement) {
    return render(
      <RefineProvider dataProvider={mswDataProvider}>
        {ui}
      </RefineProvider>
    );
  }

  beforeAll(() => {
    server.use(...userHandlers);
  });

  it('should load and display users list', async () => {
    renderWithRefine(<UsersListPage />);

    // Loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();

    // Check data is displayed
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('should filter users by role', async () => {
    renderWithRefine(<UsersListPage />);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    // Click role filter
    const roleFilter = screen.getByText('Role').closest('th');
    const filterIcon = roleFilter?.querySelector('.ant-table-filter-icon');
    
    if (filterIcon) {
      await userEvent.click(filterIcon);
    }

    // Select admin filter
    await userEvent.click(screen.getByText('Admin'));
    await userEvent.click(screen.getByText('OK'));

    // Verify only admin users are shown
    const roleCells = screen.getAllByText('admin');
    expect(roleCells.length).toBeGreaterThan(0);
    expect(screen.queryByText('editor')).not.toBeInTheDocument();
  });
});
```

## E2E Testing with Playwright

### Mock-First E2E Approach
E2E tests run with `NEXT_PUBLIC_USE_MOCK=true` in CI for deterministic behavior.

```typescript
// e2e/admin/user-management.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('User Management Workflow @e2e @critical @admin', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure mock mode is enabled
    await page.goto('/users?mock=true');
  });

  test('should create, edit, and delete user', async ({ page }) => {
    // Navigate to users list
    await page.goto('/users');
    await page.waitForLoadState('networkidle');

    // Create new user
    await page.click('text=Create');
    await page.fill('[placeholder*="name"]', 'Test User');
    await page.fill('[placeholder*="email"]', 'test@example.com');
    await page.selectOption('[aria-label*="Role"]', 'editor');
    await page.click('button:has-text("Save")');

    // Verify user was created
    await expect(page.locator('text=User created successfully')).toBeVisible();
    await expect(page.locator('text=Test User')).toBeVisible();

    // Edit user
    await page.click('text=Test User');
    await page.click('text=Edit');
    await page.fill('[value="Test User"]', 'Updated User');
    await page.click('button:has-text("Save")');

    // Verify user was updated
    await expect(page.locator('text=User updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated User')).toBeVisible();

    // Delete user
    await page.click('text=Updated User');
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Yes")'); // Confirm deletion

    // Verify user was deleted
    await expect(page.locator('text=User deleted successfully')).toBeVisible();
    await expect(page.locator('text=Updated User')).not.toBeVisible();
  });

  test('should handle role-based access control @rbac', async ({ page }) => {
    // Test with editor role (should have limited access)
    await page.addInitScript(() => {
      window.localStorage.setItem('user_role', 'editor');
    });

    await page.goto('/users');

    // Editor should not see delete button
    await expect(page.locator('button:has-text("Delete")')).not.toBeVisible();

    // Editor should not see admin-only sections
    await expect(page.locator('[data-testid="admin-settings"]')).not.toBeVisible();
  });
});
```

### CSV Import Workflow E2E
```typescript
// e2e/admin/csv-import.e2e.test.ts
test('CSV import workflow @e2e @critical @admin @api', async ({ page }) => {
  await page.goto('/csv-imports');

  // Start new import
  await page.click('text=New Import');
  
  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'test.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('name,email,role\nJohn Doe,john@example.com,editor\nJane Smith,jane@example.com,author'),
  });

  // Start processing
  await page.click('text=Upload');

  // Wait for processing to complete (mock will complete immediately)
  await expect(page.locator('text=Processing...')).toBeVisible();
  await expect(page.locator('text=Completed')).toBeVisible({ timeout: 10000 });

  // Verify results
  await expect(page.locator('text=2 rows processed')).toBeVisible();
  await expect(page.locator('text=0 errors')).toBeVisible();

  // Navigate to users to verify import
  await page.goto('/users');
  await expect(page.locator('text=John Doe')).toBeVisible();
  await expect(page.locator('text=Jane Smith')).toBeVisible();
});
```

## Unit Testing (Limited Use)

Unit tests are used sparingly for pure logic functions only:

```typescript
// utils/validation.test.ts
import { validateEmail, validateRole } from './validation';

describe('Validation Utilities @unit @validation', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('validateRole', () => {
    it('should accept valid roles', () => {
      expect(validateRole('admin')).toBe(true);
      expect(validateRole('editor')).toBe(true);
      expect(validateRole('author')).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(validateRole('superuser')).toBe(false);
      expect(validateRole('guest')).toBe(false);
      expect(validateRole('')).toBe(false);
    });
  });
});
```

## Test Utilities

### Custom Render Helper
```typescript
// test-utils/render.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RefineProvider } from '@refinedev/core';
import { ConfigProvider } from 'antd';
import { mswDataProvider } from '@/providers/mswDataProvider';

interface CustomRenderOptions extends RenderOptions {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }), ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <RefineProvider dataProvider={mswDataProvider}>
          <ConfigProvider>
            {children}
          </ConfigProvider>
        </RefineProvider>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from '@testing-library/react';
```

### MSW Server Setup
```typescript
// test-utils/server.ts
import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

export const server = setupServer(...handlers);

// Setup for all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
```

## Test Configuration

### Vitest Config
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### Test Setup
```typescript
// test-utils/setup.ts
import '@testing-library/jest-dom';
import { server } from './server';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
```

## Testing Commands

```bash
# Run affected tests (primary workflow)
pnpm test

# Run specific test types
pnpm test --grep "@integration"
pnpm test --grep "@unit"

# Run E2E tests
pnpm playwright test

# Tag tests before commit
pnpm test:tag --staged

# Run comprehensive tests
pnpm test:comprehensive
```

This testing strategy ensures high confidence in the Next.js admin application through comprehensive mock-first development, proper test categorization, and excellent coverage of both happy path and error scenarios.