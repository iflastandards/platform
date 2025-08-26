# Data Flow Architecture

## Prime Directive: Contract-First Development

**The data lifecycle is always:**
```
UI Component → refine Hook → dataProvider → Service Adapter → Live API / MSW
```

All data shapes are defined once in `/packages/contracts` using Zod schemas. The rest of the application consumes these contracts.

## DataProvider Pattern

### Central Data Provider
**Location**: `/apps/admin/src/providers/dataProvider.ts`

The dataProvider is the **sole gateway** for all data operations. UI components never fetch data directly.

```typescript
// dataProvider.ts
import { dataProvider as supabaseDataProvider } from '@refinedev/supabase';
import { mswDataProvider } from './mswDataProvider';

export const dataProvider = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  ? mswDataProvider
  : supabaseDataProvider({
      supabaseClient,
      // ... configuration
    });
```

### Mock/Live Switching
Environment variable controls data source:
- `NEXT_PUBLIC_USE_MOCK=true` → MSW handlers
- `NEXT_PUBLIC_USE_MOCK=false` → Live Supabase API

This allows:
- ✅ Development with mock data
- ✅ Testing with controlled data
- ✅ Production with live APIs
- ✅ Easy A/B testing between mock and live

## Service Adapters

### Purpose
Service adapters handle:
1. **Fetching** data from external APIs
2. **Transforming** data to internal schema
3. **Validating** with Zod before returning
4. **Error handling** with structured responses

### Location and Naming
**Location**: `/apps/admin/src/providers/adapters/`

**Naming Convention**: `{resource}.adapter.ts`
- `users.adapter.ts`
- `jobs.adapter.ts`  
- `supabaseJobs.adapter.ts`

### Adapter Pattern
```typescript
// users.adapter.ts
import { UserSchema, type User } from '@/packages/contracts/schemas/User.zod';
import { supabase } from '@/lib/supabase';

export class UsersAdapter {
  /**
   * Fetch all users from Supabase
   * @returns Promise<User[]> - Validated user array
   * @throws {ValidationError} When API data doesn't match schema
   */
  async getAll(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      // ALWAYS validate external data with Zod
      return UserSchema.array().parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid user data from API', error.errors);
      }
      throw error;
    }
  }

  /**
   * Create a new user
   * @param userData - User data to create
   * @returns Promise<User> - Created and validated user
   */
  async create(userData: Omit<User, 'id'>): Promise<User> {
    // Validate input data
    const validatedInput = UserSchema.omit({ id: true }).parse(userData);
    
    const { data, error } = await supabase
      .from('users')
      .insert(validatedInput)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    // Validate response data
    return UserSchema.parse(data);
  }
}

// Export singleton instance
export const usersAdapter = new UsersAdapter();
```

### Error Handling Pattern
```typescript
class ValidationError extends Error {
  constructor(message: string, public details: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Usage in adapter
try {
  return UserSchema.parse(apiData);
} catch (error) {
  if (error instanceof ZodError) {
    throw new ValidationError(
      'API returned invalid user data',
      error.errors
    );
  }
  throw error;
}
```

## Contract-First Development

### Schema Definition
**Location**: `/packages/contracts/schemas/`

Define data shapes ONCE using Zod:

```typescript
// User.zod.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'author']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;
```

### Type Generation
Types are automatically generated from schemas:

```typescript
// Generated in /packages/contracts/types/ts/
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'author';
  createdAt: string;
  updatedAt: string;
};
```

### Validation Rules
1. **Define schema ONCE** in contracts package
2. **Generate types automatically** - never write types manually
3. **Validate at boundaries** - every adapter method
4. **Never bypass validation** - all external data must be parsed
5. **Use discriminated unions** for variant data shapes

### Example: Discriminated Union
```typescript
// Job.zod.ts
export const JobSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('csv-import'),
    id: z.string(),
    status: z.enum(['pending', 'running', 'completed', 'failed']),
    csvFile: z.string(),
    rowCount: z.number(),
  }),
  z.object({
    type: z.literal('user-export'),
    id: z.string(),
    status: z.enum(['pending', 'running', 'completed', 'failed']),
    exportFormat: z.enum(['csv', 'json', 'xlsx']),
    userCount: z.number(),
  }),
]);

export type Job = z.infer<typeof JobSchema>;
```

## Refine.dev Integration

### Using Refine Hooks
UI components use refine hooks exclusively:

```typescript
'use client'
import { useList, useCreate, useUpdate } from '@refinedev/core';

function UsersPage() {
  // Automatically uses dataProvider under the hood
  const { data: users, isLoading } = useList({
    resource: 'users',
  });

  const { mutate: createUser } = useCreate();

  const handleCreateUser = (userData: Omit<User, 'id'>) => {
    createUser({
      resource: 'users',
      values: userData,
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {users?.data.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### Resource Configuration
```typescript
// App.tsx or provider setup
const resources = [
  {
    name: 'users',
    list: '/users',
    create: '/users/new',
    edit: '/users/:id/edit',
    show: '/users/:id',
  },
  {
    name: 'jobs',
    list: '/jobs',
    create: '/jobs/new',
    edit: '/jobs/:id/edit',
    show: '/jobs/:id',
  },
];
```

## State Management Rules

### Server State
- **Managed by**: refine + TanStack Query
- **Used for**: API data, async operations
- **Pattern**: Use refine hooks (`useList`, `useOne`, etc.)

### Client State  
- **Managed by**: React hooks (`useState`, `useReducer`)
- **Used for**: UI state, form inputs, modals
- **Pattern**: Component-local state only

### Global State
- **Avoid**: Complex global state management
- **Exception**: User authentication (handled by Clerk)
- **Pattern**: Lift state up or use refine's built-in state

## MSW Mock Integration

### Mock Data Provider
```typescript
// mswDataProvider.ts
import { DataProvider } from '@refinedev/core';
import { UserSchema } from '@/packages/contracts/schemas/User.zod';

export const mswDataProvider: DataProvider = {
  getList: async ({ resource }) => {
    // MSW will intercept this request
    const response = await fetch(`/api/${resource}`);
    const data = await response.json();
    
    // Always validate even mock data
    if (resource === 'users') {
      return {
        data: UserSchema.array().parse(data),
        total: data.length,
      };
    }
    
    return data;
  },
  
  create: async ({ resource, variables }) => {
    const response = await fetch(`/api/${resource}`, {
      method: 'POST',
      body: JSON.stringify(variables),
    });
    
    return await response.json();
  },
  
  // ... other CRUD methods
};
```

### Mock Handlers
**Location**: `/apps/admin/src/mocks/handlers.ts`

```typescript
// handlers.ts
import { http, HttpResponse } from 'msw';
import { generateUsers } from './fixtures';

export const handlers = [
  http.get('/api/users', () => {
    const users = generateUsers(10);
    return HttpResponse.json(users);
  }),

  http.post('/api/users', async ({ request }) => {
    const userData = await request.json();
    const newUser = {
      id: crypto.randomUUID(),
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return HttpResponse.json(newUser);
  }),
];
```

## Job Model Pattern

### Unified Job Schema
**Location**: `/packages/contracts/schemas/Job.zod.ts`

All long-running operations must use the Job model:

```typescript
export const JobSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  progress: z.number().min(0).max(100),
  result: z.unknown().optional(),
  error: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  userId: z.string().uuid(),
});

export type Job = z.infer<typeof JobSchema>;
```

### Job Adapter Example
```typescript
// jobs.adapter.ts
export class JobsAdapter {
  async create(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const { data } = await supabase
      .from('jobs')
      .insert({
        ...jobData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    return JobSchema.parse(data);
  }

  async updateStatus(id: string, status: Job['status'], progress?: number): Promise<Job> {
    const { data } = await supabase
      .from('jobs')
      .update({
        status,
        progress,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    return JobSchema.parse(data);
  }
}
```

This data flow architecture ensures type safety, consistency, and maintainability across the entire Next.js application while supporting both mock-driven development and production deployments.