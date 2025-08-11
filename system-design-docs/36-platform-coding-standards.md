# Platform Coding Standards

**Version:** 1.0  
**Date:** January 2025  
**Status:** Active Reference Document

## Overview

This document defines comprehensive coding standards for the IFLA Standards Platform, with specific guidance for Next.js development, TypeScript usage, import handling, and platform-specific patterns. These standards ensure consistency, maintainability, and proper functionality across our monorepo architecture.

## Next.js Specific Standards

### Routing and Navigation

#### 1. Internal Link Navigation

**Always use Next.js routing utilities for internal links:**

```typescript
// ✅ CORRECT - Use Next.js Link component
import Link from 'next/link';
<Link href="/dashboard">Dashboard</Link>

// ❌ WRONG - Never use raw anchor tags for internal navigation
<a href="/dashboard">Dashboard</a>
```

#### 2. API Calls

**Use standard fetch with relative paths:**

```typescript
// ✅ CORRECT - Standard fetch with relative path
const response = await fetch('/api/route');

// ✅ CORRECT - With full options
const response = await fetch('/api/vocabularies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// ❌ WRONG - Don't use absolute URLs for internal APIs
const response = await fetch('https://admin.iflastandards.info/api/route');
```

#### 3. Static Assets and Images

**Use standard paths for static assets:**

```typescript
// ✅ CORRECT - Standard paths
<img src="/logo.png" alt="Logo" />
<Image src="/images/hero.jpg" alt="Hero" width={1200} height={600} />

// Favicon in layout
export const metadata = {
  icons: { icon: '/favicon.ico' }
};

// ❌ WRONG - Don't use external URLs for local assets
<img src="https://cdn.example.com/logo.png" />
```

#### 4. Middleware Configuration

**Standard middleware matchers:**

```typescript
// ✅ CORRECT
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api)(.*)"
  ]
};

// Protected routes example
export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"]
};
```

### Quick Reference Table

| Scenario | ✅ Do | ❌ Don't |
|----------|-------|---------|
| Page Links | `<Link href="/dashboard">` | `<a href="/dashboard">` |
| API Calls | `fetch('/api/route')` | `fetch('https://domain.com/api/route')` |
| Static Assets | `<img src="/logo.png" />` | Use external CDN for local assets |
| Middleware | `matcher: "/dashboard/:path*"` | Complex regex unless necessary |

## TypeScript Standards

### Import Compliance Rules

#### Always Do This

```typescript
// ✅ CORRECT - ES Module syntax
import { useState } from 'react';
import { addBasePath } from '@ifla/theme/utils';
import type { NextPage } from 'next';

// ✅ CORRECT - Use workspace path aliases
import { VocabularyTable } from '@ifla/theme/components';
import { useAuth } from '@/hooks/useAuth';

// ✅ CORRECT - Type imports for types only
import type { User, Permission } from '@/types';
```

#### Never Do This

```typescript
// ❌ WRONG - CommonJS require
const config = require('./config');

// ❌ WRONG - Deep relative paths
import util from '../../../packages/shared/src/utils/helper';

// ❌ WRONG - Missing type imports
import { User } from '@/types'; // If User is only used as a type
```

### Type Safety Requirements

#### Explicit Types Required

```typescript
// ✅ CORRECT - Explicit types
export async function processData(input: string): Promise<ProcessedData> {
  const result: ProcessedData = await transform(input);
  return result;
}

// ✅ CORRECT - Typed API routes
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const data = await fetchData();
  return NextResponse.json(data);
}
```

#### Handling `any` Types

```typescript
// ✅ CORRECT - Document any usage
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const externalData: any = await untyped3rdPartyLib.getData(); // Third-party lib lacks types

// ❌ WRONG - Undocumented any
const data: any = processInput(input);
```

### Next.js-Specific TypeScript Rules

| Context | ✅ Always | ❌ Never |
|---------|-----------|----------|
| Page Components | Type with `NextPage` or custom page types | Use untyped function components |
| API Routes | Use `NextRequest`/`NextResponse` types | Use plain `Request`/`Response` |
| Dynamic Routes | Type params: `{ params: { id: string } }` | Use untyped params |
| Metadata | Use `Metadata` type from `next` | Use plain objects |
| Server Actions | Mark with `'use server'` directive | Mix server/client code |

## Code Organization Standards

### File Structure by Platform

#### Admin Portal (Next.js)
```
apps/admin/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── api/                # API routes
│   │   ├── (authenticated)/    # Protected routes
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and helpers
│   ├── test/                   # Test files
│   │   ├── integration/        # Integration tests
│   │   └── unit/              # Unit tests
│   └── types/                  # TypeScript types
└── e2e/                        # E2E tests
```

#### Documentation Sites (Docusaurus)
```
standards/{site}/
├── docs/                       # MDX documentation
├── src/
│   ├── components/            # React components
│   ├── css/                   # SASS/CSS files
│   └── pages/                 # Custom pages
├── static/                     # Static assets
└── docusaurus.config.ts       # Site configuration
```

### Naming Conventions

#### Files and Directories
- **Components**: PascalCase (`VocabularyTable.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Test files**: Match source with `.test.ts` suffix
- **Constants**: UPPER_SNAKE_CASE in files (`API_ENDPOINTS.ts`)
- **Hooks**: camelCase with `use` prefix (`usePermission.ts`)

#### Code Elements
```typescript
// Variables and functions: camelCase
const userName = 'John';
function calculateTotal() {}

// Components and types: PascalCase
interface UserProfile {}
function UserDashboard() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = '/api';

// Private class members: underscore prefix
class Service {
  private _cache: Map<string, any>;
}
```

## Platform-Specific Patterns

### Admin Portal (Next.js + Material-UI)

#### Component Structure
```typescript
// ✅ CORRECT - Material-UI components
import { Box, Button, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

// ❌ WRONG - Don't use Tailwind in admin
<div className="bg-blue-500 p-4">Content</div>
```

#### API Route Pattern
```typescript
// app/api/vocabularies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';

export const GET = withAuth(async (request: NextRequest) => {
  // Implementation
  return NextResponse.json({ data });
}, {
  resource: 'vocabulary',
  action: 'read'
});
```

### Documentation Sites (Docusaurus + Infima)

#### Component Structure
```typescript
// ✅ CORRECT - Infima classes and SASS
import styles from './Component.module.scss';
import clsx from 'clsx';

export function DocComponent({ className }: Props) {
  return (
    <div className={clsx('container', styles.wrapper, className)}>
      <h2 className="hero__title">Title</h2>
    </div>
  );
}

// ❌ WRONG - Don't use Material-UI in docs
import { Box } from '@mui/material';
```

## Error Handling Standards

### API Error Responses
```typescript
// Consistent error format
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

### Component Error Boundaries
```typescript
// Use error boundaries for component errors
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <VocabularyTable />
</ErrorBoundary>
```

## Testing Standards

### Test File Organization
```typescript
// Match source file structure
// Source: src/components/VocabularyTable.tsx
// Test:   src/components/VocabularyTable.test.tsx

// Integration test naming
// Source: src/services/api-client.ts
// Test:   src/services/api-client.integration.test.ts
```

### Mocking Next.js Features
```typescript
// Always mock Next.js router in tests
import { useRouter } from 'next/navigation';
vi.mock('next/navigation');

// Mock router for testing
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  pathname: '/dashboard',
  query: {}
};
```

## Security Standards

### API Security
```typescript
// Always validate and sanitize input
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = schema.parse(body); // Throws if invalid
  // Process validated data
}
```

### Authentication Checks
```typescript
// Always use withAuth middleware for protected routes
export const GET = withAuth(async (request) => {
  // Handler code
}, {
  resource: 'namespace',
  action: 'read'
});
```

## Performance Standards

### Code Splitting
```typescript
// Use dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { 
    loading: () => <Skeleton />,
    ssr: false 
  }
);
```

### Data Fetching
```typescript
// Use React Query for client-side caching
import { useQuery } from '@tanstack/react-query';

function useVocabularies() {
  return useQuery({
    queryKey: ['vocabularies'],
    queryFn: fetchVocabularies,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

## Documentation Standards

### JSDoc Comments
```typescript
/**
 * Processes vocabulary data and returns formatted result
 * @param input - Raw vocabulary data from API
 * @param options - Processing options
 * @returns Formatted vocabulary object ready for display
 * @throws {ValidationError} If input data is invalid
 */
export function processVocabulary(
  input: RawVocabulary,
  options?: ProcessOptions
): FormattedVocabulary {
  // Implementation
}
```

### Component Documentation
```typescript
interface Props {
  /** List of vocabulary items to display */
  items: VocabularyItem[];
  /** Callback fired when item is selected */
  onSelect?: (item: VocabularyItem) => void;
  /** Whether the table is in loading state */
  loading?: boolean;
}

/**
 * Displays vocabulary items in a sortable, filterable table
 * @example
 * <VocabularyTable 
 *   items={vocabularies}
 *   onSelect={handleSelect}
 * />
 */
export function VocabularyTable({ items, onSelect, loading }: Props) {
  // Implementation
}
```

## Enforcement and Validation

### Pre-commit Checks
- TypeScript compilation: `pnpm typecheck`
- ESLint validation: `pnpm lint`
- Prettier formatting: automatic via git hooks

### Required Validations
```bash
# Before committing
pnpm typecheck && pnpm lint

# Before pushing
pnpm test:affected
```

## Related Documentation

- **AI Guidelines**: [Doc 35 - AI Development Guidelines](35-ai-development-guidelines.md)
- **Platform Guide**: [Doc 20 - Platform-Specific Architecture Guide](20-platform-specific-architecture-guide.md)
- **Testing Strategy**: [Doc 6 - Testing Strategy](06-testing-strategy.md)
- **RBAC Implementation**: [Doc 14 - RBAC Implementation](14-rbac-implementation.md)

This document serves as the authoritative reference for coding standards across the IFLA Standards Platform. All code must comply with these standards to maintain consistency and quality.
