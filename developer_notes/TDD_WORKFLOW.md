# TDD Workflow for Feature Development

> **Note**: This document has been integrated into the comprehensive `AUTOMATED_TDD_WORKFLOW.md`. 
> Please refer to that document for the complete, up-to-date TDD methodology with 5-phase testing strategy and environment configuration.
> 
> **Primary Reference**: [`developer_notes/AUTOMATED_TDD_WORKFLOW.md`](./AUTOMATED_TDD_WORKFLOW.md)

## Overview

This document outlines our Test-Driven Development (TDD) workflow, which must be followed for all feature development in the IFLA Standards platform.

## Core TDD Cycle: Red → Green → Refactor

### 🔴 RED Phase: Write Failing Tests
1. **Define the expected behavior** through tests
2. **Run tests** - they should fail (no implementation exists)
3. **Verify the failure** is for the right reason

### 🟢 GREEN Phase: Make Tests Pass
1. **Write minimal code** to make tests pass
2. **Don't add extra features** not covered by tests
3. **Run tests** - they should now pass

### 🔵 REFACTOR Phase: Improve Code Quality
1. **Clean up the code** while keeping tests green
2. **Extract common patterns** and remove duplication
3. **Run tests** - they should still pass

## Feature Development Workflow

### Step 1: Create Feature Branch
```bash
git checkout -b feature/[feature-name]
```

### Step 2: Define Contracts
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

### Step 3: Write Component Tests (RED)
```typescript
// UserList.test.tsx
describe('UserList Component', () => {
  it('should render list of users', () => {
    // This will fail - component doesn't exist
    const { getByText } = render(<UserList users={mockUsers} />);
    expect(getByText('John Doe')).toBeInTheDocument();
  });

  it('should show empty state when no users', () => {
    // This will fail - component doesn't exist
    const { getByText } = render(<UserList users={[]} />);
    expect(getByText('No users found')).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    // This will fail - component doesn't exist
    const { getByTestId } = render(<UserList loading={true} />);
    expect(getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### Step 4: Write Service Tests (RED)
```typescript
// UserService.test.ts
describe('UserService', () => {
  it('should validate user with contract', () => {
    // This will fail - service doesn't exist
    const invalidUser = { name: 'John' }; // missing required fields
    expect(() => UserService.validate(invalidUser)).toThrow();
  });

  it('should fetch all users', async () => {
    // This will fail - service doesn't exist
    const users = await UserService.getAll();
    expect(users).toHaveLength(3);
    expect(users[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      email: expect.any(String)
    });
  });

  it('should create a new user', async () => {
    // This will fail - service doesn't exist
    const newUser = { name: 'Jane', email: 'jane@example.com', role: 'editor' };
    const created = await UserService.create(newUser);
    expect(created.id).toBeDefined();
  });
});
```

### Step 5: Implement Component (GREEN)
```typescript
// UserList.tsx - Minimal implementation
export const UserList = ({ users, loading }) => {
  if (loading) {
    return <div data-testid="loading-spinner">Loading...</div>;
  }

  if (users.length === 0) {
    return <div>No users found</div>;
  }

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

### Step 6: Implement Service (GREEN)
```typescript
// UserService.ts - Minimal implementation
export const UserService = {
  validate(user: unknown): User {
    return UserContract.parse(user);
  },

  async getAll(): Promise<User[]> {
    // Start with mock data
    return mockUsers;
  },

  async create(userData: Omit<User, 'id'>): Promise<User> {
    const newUser = {
      id: generateId(),
      ...userData
    };
    return this.validate(newUser);
  }
};
```

### Step 7: Refactor (REFACTOR)
```typescript
// UserList.tsx - Refactored with Ant Design
import { List, Empty, Spin } from 'antd';

export const UserList: FC<UserListProps> = ({ users, loading }) => {
  if (loading) {
    return <Spin size="large" data-testid="loading-spinner" />;
  }

  return (
    <List
      dataSource={users}
      locale={{ emptyText: <Empty description="No users found" /> }}
      renderItem={(user) => (
        <List.Item key={user.id}>
          <UserCard user={user} />
        </List.Item>
      )}
    />
  );
};

// UserService.ts - Refactored with DataProvider
export class UserService {
  constructor(private dataProvider: DataProvider) {}

  validate(user: unknown): User {
    return UserContract.parse(user);
  }

  async getAll(): Promise<User[]> {
    const { data } = await this.dataProvider.getList('users', {
      pagination: { page: 1, perPage: 100 }
    });
    return data.map(user => this.validate(user));
  }

  async create(userData: Omit<User, 'id'>): Promise<User> {
    const { data } = await this.dataProvider.create('users', {
      data: userData
    });
    return this.validate(data);
  }
}
```

### Step 8: Add Integration Tests
```typescript
// UserList.integration.test.tsx
describe('UserList Integration', () => {
  beforeAll(() => {
    // Setup MSW handlers
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json(mockUsers);
      })
    );
  });

  it('should fetch and display users from API', async () => {
    const { getByText } = render(
      <RefineProvider dataProvider={liveDataProvider}>
        <UserListPage />
      </RefineProvider>
    );

    await waitFor(() => {
      expect(getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

## Common TDD Patterns

### Pattern 1: Contract Validation Tests
```typescript
describe('Contract Validation', () => {
  it('should accept valid data', () => {
    const valid = { id: '123', name: 'John', email: 'john@example.com', role: 'admin' };
    expect(() => UserContract.parse(valid)).not.toThrow();
  });

  it('should reject invalid email', () => {
    const invalid = { id: '123', name: 'John', email: 'not-an-email', role: 'admin' };
    expect(() => UserContract.parse(invalid)).toThrow();
  });

  it('should reject invalid role', () => {
    const invalid = { id: '123', name: 'John', email: 'john@example.com', role: 'superuser' };
    expect(() => UserContract.parse(invalid)).toThrow();
  });
});
```

### Pattern 2: Component Behavior Tests
```typescript
describe('Component Behavior', () => {
  it('should call onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    const { getByRole } = render(<UserCard user={mockUser} onEdit={onEdit} />);
    
    fireEvent.click(getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(mockUser.id);
  });

  it('should be disabled based on permissions', () => {
    const { getByRole } = render(
      <UserCard user={mockUser} permissions={{ canEdit: false }} />
    );
    
    expect(getByRole('button', { name: /edit/i })).toBeDisabled();
  });
});
```

### Pattern 3: API Error Handling Tests
```typescript
describe('Error Handling', () => {
  it('should handle network errors gracefully', async () => {
    server.use(
      http.get('/api/users', () => {
        return new Response(null, { status: 500 });
      })
    );

    const { getByText } = render(<UserListPage />);
    
    await waitFor(() => {
      expect(getByText(/error loading users/i)).toBeInTheDocument();
    });
  });

  it('should retry failed requests', async () => {
    let attempts = 0;
    server.use(
      http.get('/api/users', () => {
        attempts++;
        if (attempts === 1) {
          return new Response(null, { status: 500 });
        }
        return HttpResponse.json(mockUsers);
      })
    );

    const { getByText, rerender } = render(<UserListPage />);
    
    // First attempt fails
    await waitFor(() => {
      expect(getByText(/error/i)).toBeInTheDocument();
    });
    
    // Click retry
    fireEvent.click(getByRole('button', { name: /retry/i }));
    
    // Second attempt succeeds
    await waitFor(() => {
      expect(getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

## TDD Anti-Patterns to Avoid

### ❌ Don't: Write implementation first
```typescript
// BAD: Writing code before tests
export const UserList = ({ users }) => {
  // Complex implementation without tests
  return <ComplexComponent>{/* ... */}</ComplexComponent>;
};

// Then trying to write tests to match implementation
it('should work somehow', () => {
  // Retrofitting tests to existing code
});
```

### ✅ Do: Write tests first
```typescript
// GOOD: Define behavior through tests
it('should display user names', () => {
  const { getByText } = render(<UserList users={[{ name: 'John' }]} />);
  expect(getByText('John')).toBeInTheDocument();
});

// Then implement minimal code to pass
export const UserList = ({ users }) => {
  return users.map(u => <div key={u.id}>{u.name}</div>);
};
```

### ❌ Don't: Write too much code at once
```typescript
// BAD: Implementing features not covered by tests
export const UserList = ({ users, onEdit, onDelete, onExport, filters }) => {
  // Complex implementation with many untested features
};
```

### ✅ Do: Incremental implementation
```typescript
// GOOD: Add features one test at a time
it('should display users', () => { /* ... */ });
// Implement display

it('should handle edit', () => { /* ... */ });
// Add edit functionality

it('should handle delete', () => { /* ... */ });
// Add delete functionality
```

### ❌ Don't: Skip the refactor phase
```typescript
// BAD: Leaving messy code after tests pass
export const UserList = ({ users }) => {
  // Quick and dirty implementation
  let html = '<ul>';
  for (let i = 0; i < users.length; i++) {
    html += '<li>' + users[i].name + '</li>';
  }
  html += '</ul>';
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
```

### ✅ Do: Clean up after green
```typescript
// GOOD: Refactor to clean, maintainable code
export const UserList: FC<UserListProps> = ({ users }) => {
  return (
    <List
      dataSource={users}
      renderItem={(user) => (
        <List.Item key={user.id}>
          <UserCard user={user} />
        </List.Item>
      )}
    />
  );
};
```

## TDD Checklist

Before starting a feature:
- [ ] Created feature branch
- [ ] Defined Zod contracts
- [ ] Written failing unit tests
- [ ] Written failing integration tests

During implementation:
- [ ] Tests are failing for the right reasons
- [ ] Writing minimal code to pass tests
- [ ] Not adding untested features
- [ ] Running tests frequently

After tests pass:
- [ ] Refactoring for clarity
- [ ] Extracting common patterns
- [ ] Removing duplication
- [ ] Tests still passing after refactor

Before merging:
- [ ] All tests passing
- [ ] Test coverage adequate
- [ ] Edge cases tested
- [ ] Error scenarios tested
- [ ] Performance within targets

## Commands Reference

```bash
# Run tests in watch mode during TDD
pnpm nx test [project] --watch

# Run specific test file
pnpm nx test [project] --testFile=UserList.test.tsx

# Run tests matching pattern
pnpm nx test [project] --testNamePattern="should render"

# Check coverage
pnpm nx test [project] --coverage

# Run only unit tests
pnpm nx test [project] --grep "@unit"

# Run integration tests
pnpm nx test [project] --grep "@integration"
```

## Resources

- [Testing Strategy V2](./TESTING_STRATEGY_V2.md) - Complete testing strategy
- [Test Templates](./TEST_TEMPLATES.md) - Copy-paste test templates
- [Testing Quick Reference](./TESTING_QUICK_REFERENCE.md) - Quick command reference