# Next.js 15 Code Style Standards

## App Router Conventions

### File Naming & Structure
- **Routes**: Use kebab-case for directory names (`/user-imports`, `/csv-processing`)
- **Pages**: Always `page.tsx` for route components
- **Layouts**: Always `layout.tsx` for shared layouts
- **Loading**: Always `loading.tsx` for loading UI
- **Errors**: Always `error.tsx` for error boundaries
- **API Routes**: Always `route.ts` (not `.tsx`) for API endpoints
- **Components**: PascalCase.tsx (`UserForm.tsx`, `DataTable.tsx`)
- **Utilities**: camelCase.ts (`formatDate.ts`, `validateInput.ts`)
- **Types**: PascalCase.types.ts (`User.types.ts`, `ApiResponse.types.ts`)
- **Tests**: ComponentName.test.tsx (co-located with components)

### Directory Structure
```
apps/admin/src/
├── app/
│   ├── (authenticated)/          # Route group for auth protection
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # Dashboard route
│   │   │   ├── [siteKey]/        # Dynamic site management
│   │   │   │   ├── page.tsx      # Site overview
│   │   │   │   ├── content/      # Content management
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── vocabularies/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── [id]/edit/page.tsx
│   │   │   │   │       └── new/page.tsx
│   │   │   │   └── layout.tsx    # Site-specific layout
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx      # Admin dashboard
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── namespaces/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── author/
│   │   │   ├── editor/
│   │   │   └── rg/               # Review group dashboard
│   │   └── layout.tsx            # Authenticated layout wrapper
│   ├── api/
│   │   ├── admin/
│   │   │   ├── users/route.ts
│   │   │   ├── roles/route.ts
│   │   │   └── namespace/
│   │   │       └── [namespace]/
│   │   │           └── vocabularies/route.ts
│   │   ├── auth/
│   │   │   ├── callback/route.ts
│   │   │   └── signin/route.ts
│   │   └── health/route.ts
│   ├── sign-in/page.tsx          # Clerk auth pages
│   ├── sign-up/page.tsx
│   ├── global.css
│   ├── layout.tsx                # Root layout with Metadata
│   └── page.tsx                  # Home page (redirects to dashboard)
├── components/
│   ├── dashboard/                # Role-based dashboard components
│   │   ├── admin/
│   │   ├── author/
│   │   ├── editor/
│   │   └── rg/
│   ├── auth/
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── auth.ts                   # Clerk integration
│   ├── authorization.ts          # RBAC logic
│   └── services/
├── providers/
│   ├── RefineProvider.tsx        # refine.dev setup
│   ├── dataProvider.ts           # Central data provider (mock/live switching)
│   └── adapters/                 # Service layer adapters (Zod validation)
│       ├── users.adapter.ts      # User service with validation
│       ├── supabaseJobs.adapter.ts
│       └── rdfService.adapter.ts
└── mocks/
    ├── handlers.ts               # MSW request handlers (mock contracts)
    ├── fixtures.ts               # Mock data generators
    └── user-fixtures.ts          # Role-specific test data
├── ../../packages/
│   ├── contracts/                # 🎯 SINGLE SOURCE OF TRUTH
│   │   ├── schemas/              # Zod schemas for internal data
│   │   │   ├── Job.zod.ts        # Master Job schema
│   │   │   ├── User.zod.ts       # User schema
│   │   │   └── Vocabulary.zod.ts
│   │   └── openapi/              # External API specifications
│   └── fixtures/                 # Static mock data (JSON files)
```

## Server vs Client Components

### Default: Server Components
- Use server components by default (no 'use client' directive)
- Server components can:
  - Fetch data directly in the component
  - Access server-only APIs and databases
  - Keep large dependencies on the server
  - Use async/await for data fetching

### Client Components: Use 'use client' When
- Using React hooks (`useState`, `useEffect`, `useContext`)
- Using Clerk hooks (`useUser`, `useAuth`, `useSignIn`)
- Using Next.js navigation (`useRouter`, `usePathname`, `useSearchParams`)
- Using browser-only APIs (`localStorage`, `window`, `navigator`)
- Handling browser events (`onClick`, `onSubmit`, etc.)
- Using refine.dev hooks (`useList`, `useCreate`, `useUpdate`)
- Using Ant Design form instances and interactive components
- Using state management libraries

### Examples

**Server Component (Default):**
```typescript
// app/(authenticated)/dashboard/admin/users/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management | IFLA Admin',
  description: 'Manage users and permissions',
};

async function AdminUsersPage() {
  // Direct data fetching in server component - no 'use client' needed
  const users = await getUsers();
  
  return (
    <div>
      <h1>User Management</h1>
      <UserList users={users} />
    </div>
  );
}

export default AdminUsersPage;
```

**Client Component (When Needed):**
```typescript
'use client'
// components/dashboard/admin/AdminUsersPage.tsx
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button, Form, Input } from 'antd';

export function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  
  const handleCreateUser = () => {
    router.push('/dashboard/admin/users/new');
  };
  
  return (
    <div>
      <Form onFinish={handleSubmit}>
        <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
          <Input placeholder="User email" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Create User
        </Button>
      </Form>
    </div>
  );
}
```

### Metadata Export Pattern
```typescript
// Always export metadata from page.tsx files
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title | IFLA Admin',
  description: 'Page description for SEO',
  keywords: ['ifla', 'standards', 'vocabulary'],
};

// For dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { siteKey } = params;
  
  return {
    title: `${siteKey} Management | IFLA Admin`,
    description: `Manage ${siteKey} vocabularies and content`,
  };
}
```

## App Router Specific Patterns

### Route Groups and Layouts
```typescript
// (authenticated)/layout.tsx - Route group with protection
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  return <div className="authenticated-layout">{children}</div>;
}
```

### Dynamic Routes with TypeScript
```typescript
// [siteKey]/page.tsx - Dynamic route with proper typing
interface PageProps {
  params: { siteKey: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SitePage({ params, searchParams }: PageProps) {
  const { siteKey } = params;
  return <div>Site: {siteKey}</div>;
}
```

### Navigation Router Import (App Router Specific)
```typescript
// ✅ CORRECT - App Router navigation
import { useRouter } from 'next/navigation'; // NOT 'next/router'
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

// In client components
const router = useRouter();
router.push('/dashboard');
router.replace('/login');

// In server components/actions
redirect('/dashboard');
```

## 🚨 Architectural Constraints (Prime Directive)

### Non-Negotiable Rules
1. **Contracts First**: All data shapes defined in `/packages/contracts` using Zod
2. **Type-Safety Required**: `any` type forbidden for data structures
3. **Mock-First Development**: Features work with MSW before live backend
4. **Central dataProvider**: All data operations route through refine.dev dataProvider
5. **Unified Job Model**: Async operations use master `Job.zod.ts` schema
6. **WCAG 2.1 AA**: Accessibility compliance required for all features
7. **RDF Builds Reference**: Use existing RDF Builds vertical slice as template

## 🎯 Core Architecture Patterns

### Contract-First Development (Prime Directive)
**Rule**: All data shapes defined once in `/packages/contracts` using Zod schemas

```typescript
// ✅ CORRECT - Contracts define data shape
// packages/contracts/schemas/User.zod.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'author', 'viewer']),
  permissions: z.array(z.string()),
});

export type User = z.infer<typeof UserSchema>;
```

### Service Adapter Validation Pattern
**Rule**: Every function receiving external data MUST validate with Zod

```typescript
// ✅ CORRECT - Service adapter with validation
// providers/adapters/users.adapter.ts
import { UserSchema } from '@ifla/contracts/schemas/User.zod';

export class UsersAdapter {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw new Error(`Failed to fetch users: ${error.message}`);
    
    // 🎯 REQUIRED: Validate with Zod before returning
    return UserSchema.array().parse(data);
  }
  
  async create(userData: unknown): Promise<User> {
    // 🎯 REQUIRED: Validate input
    const validatedData = UserSchema.parse(userData);
    
    const { data, error } = await supabase
      .from('users')
      .insert(validatedData)
      .select()
      .single();
      
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    
    // 🎯 REQUIRED: Validate output
    return UserSchema.parse(data);
  }
}
```

### Mock-First Development Pattern
**Rule**: Features must work with MSW before live backend

```typescript
// ✅ CORRECT - MSW handler defines contract
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { generateUsers } from './user-fixtures';

export const userHandlers = [
  http.get('/api/admin/users', () => {
    const users = generateUsers(10);
    return HttpResponse.json({ 
      data: users, 
      total: users.length,
      current: 1,
      pageSize: 10 
    });
  }),
  
  http.post('/api/admin/users', async ({ request }) => {
    const userData = await request.json();
    const newUser = { id: crypto.randomUUID(), ...userData };
    return HttpResponse.json({ data: newUser });
  }),
];
```

### dataProvider Pattern (Central Gateway)
**Rule**: UI components use refine hooks, never direct API calls

```typescript
// ✅ CORRECT - Using refine hooks
import { useList, useCreate } from '@refinedev/core';

export function UsersPage() {
  // UI components are "dumb" - they use refine hooks
  const { data: users, isLoading } = useList({
    resource: 'users',
    pagination: { current: 1, pageSize: 10 },
  });
  
  const { mutate: createUser } = useCreate({
    resource: 'users',
  });

  return (
    <Table
      dataSource={users?.data}
      loading={isLoading}
      // ...
    />
  );
}

// ❌ WRONG - Direct API calls
export function UsersPage() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users').then(/* ... */); // DON'T DO THIS
  }, []);
}
```

## Import Organization

### Import Order
1. React and Next.js imports
2. Third-party libraries (Clerk, refine, antd, etc.)
3. Internal utilities and types
4. Relative imports
5. Type-only imports last

```typescript
// 1. React/Next.js (App Router specific)
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { redirect, notFound } from 'next/navigation';
import type { Metadata } from 'next';

// 2. Third-party
import { useUser } from '@clerk/nextjs';
import { Create, useForm } from '@refinedev/antd';
import { Button, Form, Input } from 'antd';

// 3. Internal utilities
import { validateUser } from '@/lib/validation';
import { getUserPermissions } from '@/lib/authorization';

// 4. Relative imports
import { UserCard } from './UserCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

// 5. Type-only imports
import type { User } from '@/types/User';
import type { FormProps } from 'antd';
```

## Component Patterns

### Function Declaration Style
- Use function declarations for components (not arrow functions)
- Use PascalCase for component names
- Export at the end of the file

```typescript
// Good
function UserProfile({ user }: UserProfileProps) {
  return <div>{user.name}</div>;
}

export default UserProfile;

// Avoid
export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return <div>{user.name}</div>;
};
```

### Props Interface Pattern
```typescript
interface UserFormProps {
  user?: User;
  onSubmit: (data: User) => void;
  loading?: boolean;
}

function UserForm({ user, onSubmit, loading = false }: UserFormProps) {
  // Component logic
}
```

## Formatting Rules

### Indentation
- Use 2 spaces for indentation (never tabs)
- Maintain consistent indentation throughout files

### String Literals
- Use single quotes for strings: `'Hello World'`
- Use double quotes only for JSX attributes: `<div className="container">`
- Use template literals for interpolation: `` `Hello ${name}` ``

### Object and Array Formatting
```typescript
// Objects - trailing commas
const config = {
  apiUrl: '/api/v1',
  timeout: 5000,
  retries: 3,
};

// Arrays - trailing commas
const permissions = [
  'read:users',
  'write:users',
  'delete:users',
];

// JSX attributes
<Button
  type="primary"
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Save Changes
</Button>
```

## TypeScript Conventions

### Strict Mode Enforcement
- `any` type is forbidden for data structures
- Use proper typing for all props, state, and API responses
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, primitives, and computed types

### Type Definitions
```typescript
// Interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Types for unions and computed types
type UserRole = 'admin' | 'editor' | 'author';
type UserKeys = keyof User;

// Generic constraints
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

## Error Handling

### Try-Catch Patterns
```typescript
// API routes
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validatedData = UserSchema.parse(data);
    const result = await createUser(validatedData);
    
    return Response.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ error: 'Validation failed' }, { status: 400 });
    }
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Error Boundaries
```typescript
// error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
```

## Comments and Documentation

### When to Comment
- Complex business logic
- Non-obvious implementation choices
- API integrations and data transformations
- Temporary workarounds (with TODO)

### JSDoc for Functions
```typescript
/**
 * Transforms raw user data from the API into our internal User schema
 * @param apiUser - Raw user data from external API
 * @returns Validated User object
 * @throws {ZodError} When validation fails
 */
function transformUser(apiUser: unknown): User {
  return UserSchema.parse(apiUser);
}
```

### Inline Comments
```typescript
// Convert UTC timestamp to user's local timezone
const localDate = new Date(utcTimestamp * 1000);

// TODO: Replace with proper role-based permissions check
if (user.role === 'admin') {
  // Allow access
}
```

## Accessibility Standards

### ARIA and Semantic HTML
- Use semantic HTML elements (`<main>`, `<nav>`, `<section>`, `<article>`)
- Provide proper ARIA labels for interactive elements
- Ensure proper heading hierarchy (h1 → h2 → h3)
- Use proper form labels and associations

```typescript
function UserForm() {
  return (
    <main>
      <h1>User Management</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            aria-required="true"
            aria-describedby="username-help"
          />
          <div id="username-help">
            Must be 3-20 characters long
          </div>
        </div>
        
        <button type="submit" aria-describedby="submit-help">
          Create User
        </button>
        <div id="submit-help">
          This will create a new user account
        </div>
      </form>
    </main>
  );
}
```

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Proper focus management and visual focus indicators
- Logical tab order

### Color and Contrast
- Follow WCAG 2.1 Level AA contrast requirements
- Don't rely solely on color to convey information
- Provide alternative text for images and icons

This code style guide ensures consistency, maintainability, and accessibility across all Next.js development in the IFLA Standards Platform.