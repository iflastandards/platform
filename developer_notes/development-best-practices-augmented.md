# Development Best Practices - IFLA Standards Platform

## Context

Global development guidelines for IFLA Standards Platform projects, integrating Agent OS principles with project-specific requirements.

<conditional-block context-check="core-principles">
IF this Core Principles section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using Core Principles already in context"
ELSE:
  READ: The following principles

## Core Principles

### Keep It Simple

- Implement code in the fewest lines possible
- Avoid over-engineering solutions
- Choose straightforward approaches over clever ones
- **IFLA-specific**: Use existing patterns from `@ifla/theme` package before creating new solutions

### Optimize for Readability

- Prioritize code clarity over micro-optimizations
- Write self-documenting code with clear variable names
- Add comments for "why" not "what"
- **IFLA-specific**: Follow TypeScript strict mode - NO undocumented `any` types

### DRY (Don't Repeat Yourself)

- Extract repeated business logic to private methods
- Extract repeated UI markup to reusable components
- Create utility functions for common operations
- **IFLA-specific**: Leverage shared components from `@ifla/theme` package
- **IFLA-specific**: Use centralized configuration from `packages/theme/src/config/`

### File Structure

- Keep files focused on a single responsibility
- Group related functionality together
- Use consistent naming conventions
- **IFLA-specific**: Maximum 500 lines per file - split if larger
- **IFLA-specific**: Co-locate tests with source files (`*.test.ts`)
</conditional-block>

<conditional-block context-check="ifla-monorepo" task-condition="working-with-monorepo">
IF current task involves monorepo operations:
  IF IFLA Monorepo section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using IFLA Monorepo guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: IFLA Monorepo section not relevant to current task

## IFLA Monorepo Guidelines

### Package Manager & Build System

- **ALWAYS use pnpm** - never npm or yarn
- **ALWAYS use Nx commands** for builds and tests: `nx build {project}`, `nx test {project}`
- **ALWAYS run from root directory** - all commands execute from monorepo root
- **Use affected commands**: `nx affected --target=build` for faster builds

### Project Structure Awareness

- **Admin Portal**: Next.js 15 with App Router (`apps/admin/`)
- **Documentation Sites**: Docusaurus 3.8 (`portal/`, `standards/*/`)
- **Shared Code**: Theme package (`packages/theme/`) - use before creating new components
- **Scripts**: Isolated Nx project (`scripts/`) with dedicated testing

### Component Organization Strategy

**Shared Components** (Multi-site usage):
- **Location**: `packages/theme/src/components/`
- **Usage**: Docusaurus sites, cross-site functionality
- **Examples**: `VocabularyTable`, `NamespaceHub`, `SiteLink`

**Application Components** (Single-app usage):
- **Admin Portal**: `apps/admin/src/components/`
- **Site-Specific**: `standards/{site}/src/components/`
- **Principle**: Keep components local until sharing is needed (YAGNI)

### Essential Commands

```bash
# Development (ALWAYS from root)
pnpm nx start {site}                    # Start development server
pnpm nx dev admin --turbopack          # Admin with Turbopack
pnpm nx run {site}:start:robust        # With port cleanup

# Building
pnpm nx build {project}                # Single project
pnpm build:all                    # All projects (Nx optimized)
pnpm nx affected --target=build        # Only changed projects

# Testing (MANDATORY patterns)
pnpm test                         # Affected tests only
pnpm nx affected --target=test         # Explicit affected testing
pnpm test:comprehensive           # Full test suite (releases only)

# Performance
pnpm nx:daemon:start              # Speed up all Nx commands
pnpm nx:cache:clear               # Fresh builds when needed
```
</conditional-block>

<conditional-block context-check="docusaurus-development" task-condition="working-with-docusaurus">
IF current task involves Docusaurus site development:
  IF Docusaurus Development section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Docusaurus Development guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Docusaurus Development section not relevant to current task

## Docusaurus Site Development

### Site Structure & Configuration

- **Use centralized configuration** from `@ifla/theme` package
- **Leverage `createStandardSiteConfig()`** factory for consistency
- **Follow established patterns** from existing sites (portal, ISBDM, LRM, etc.)

```typescript
// ✅ CORRECT - Use site factory
import { createStandardSiteConfig } from '@ifla/theme/config';

const config = createStandardSiteConfig({
  siteKey: 'mystandard',
  title: 'My Standard',
  tagline: 'A new IFLA standard',
  // Site-specific customizations
});
```

### Component Development

- **Use `@ifla/theme` components** before creating new ones
- **Follow folder-based component structure** with `index.tsx` + `styles.module.scss`
- **Follow MDX patterns** for content integration
- **Implement responsive design** with existing CSS utilities

```tsx
// ✅ CORRECT - Leverage existing theme components
import { SiteLink, CompactButton } from '@ifla/theme/components';
import { getSiteConfig } from '@ifla/theme/config';

// Custom site component
export function StandardNavigation() {
  return (
    <nav>
      <SiteLink to="/overview">Overview</SiteLink>
      <CompactButton href="/download">Download</CompactButton>
    </nav>
  );
}
```

### Creating New Docusaurus Components

**ALWAYS follow the established pattern**:

1. **Create component folder**: `components/MyComponent/`
2. **Add implementation**: `components/MyComponent/index.tsx`
3. **Add styles**: `components/MyComponent/styles.module.scss`
4. **Export from main index**: Add to `components/index.ts`

```tsx
// ✅ CORRECT - MyComponent/index.tsx
import React from 'react';
import styles from './styles.module.scss';

interface MyComponentProps {
  title: string;
  children?: React.ReactNode;
}

export default function MyComponent({ title, children }: MyComponentProps) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{title}</h3>
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
```

### Component Location Guidelines

**Shared Docusaurus Components**: `packages/theme/src/components/`
- Used across multiple documentation sites
- Examples: `VocabularyTable`, `NamespaceHub`, `SiteLink`, `DownloadPanel`
- Import: `import { ComponentName } from '@ifla/theme/components'`

**Site-Specific Components**: `standards/{site}/src/components/`
- Used only within a specific Docusaurus site
- Create here when component is unique to one standard

### Docusaurus Component Structure Pattern

**ALWAYS use the folder-based pattern for Docusaurus components**:

```
components/
├── ComponentName/
│   ├── index.tsx              # Component implementation
│   └── styles.module.scss     # Component-specific styles
```

```tsx
// ✅ CORRECT - ComponentName/index.tsx
import React from 'react';
import styles from './styles.module.scss';

export default function ComponentName() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Component Title</h2>
    </div>
  );
}
```

```scss
/* ✅ CORRECT - ComponentName/styles.module.scss */
.container {
  padding: 1rem;
  border-radius: 8px;
}

.title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}
```

**Benefits of this pattern**:
- **Encapsulation**: Styles are scoped to the component
- **Organization**: Related files are grouped together
- **Maintainability**: Easy to find and modify component-specific styles
- **Consistency**: Matches existing theme package structure

### Content Management

- **Use standard sidebar patterns** from `sidebars.ts`
- **Follow content organization** from existing standards
- **Implement cross-site navigation** with theme utilities

### Development Commands

```bash
# Docusaurus-specific development
pnpm nx start {site}                    # Start development server
pnpm nx build {site}                    # Build single site
pnpm nx serve {site}                    # Serve built site

# With port cleanup (recommended)
pnpm nx run {site}:start:robust         # Start with port cleanup
pnpm nx run {site}:serve:robust         # Serve with port cleanup

# Site scaffolding
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard"
```
</conditional-block>

<conditional-block context-check="nextjs-admin-development" task-condition="working-with-nextjs-admin">
IF current task involves Next.js admin portal or API development:
  IF Next.js Admin Development section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Next.js Admin Development guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Next.js Admin Development section not relevant to current task

## Next.js Admin Portal & API Development

### Critical Routing Rules

- **Use standard Next.js routing patterns** - paths like `/dashboard`
- **ALWAYS use Next.js Link component** for internal navigation
- **Use standard fetch calls** for API calls and static assets

```tsx
// ✅ CORRECT
import Link from 'next/link';

<Link href="/dashboard">Dashboard</Link>
fetch('/api/users')
<img src="/images/logo.png" />

// ❌ INCORRECT
<a href="/dashboard">Dashboard</a>
// (Use Link component instead of anchor tags)
```

### API Route Development

- **Use App Router API patterns** (`app/api/*/route.ts`)
- **Implement proper HTTP methods** (GET, POST, PUT, DELETE)
- **Use consistent error handling** with proper status codes
- **Validate all inputs** with Zod schemas

```typescript
// ✅ CORRECT - API Route Handler
import { NextResponse } from 'next/server';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = CreateUserSchema.parse(body);
    
    const user = await createUser(validatedData);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 400 }
    );
  }
}
```

### Authentication & Authorization

- **Use Clerk for both authentication and authorization**
- **Implement organization-based RBAC** with Clerk metadata
- **Test with real test users** (code: 424242)

```typescript
// ✅ CORRECT - Clerk-only authorization
import { auth } from '@clerk/nextjs/server';

export async function checkPermission(
  resource: string,
  action: string,
  namespace?: string
) {
  const { has, orgRole, sessionClaims } = auth();
  
  // Check superadmin
  if (sessionClaims?.publicMetadata?.superadmin) {
    return true;
  }
  
  // Check organization-based permission
  const permission = namespace 
    ? `${resource}:${action}:${namespace}`
    : `${resource}:${action}`;
    
  return has({ permission }) || has({ role: 'org:admin' });
}

// ✅ CORRECT - Protected API route
export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const canAccess = await checkPermission('project', 'read');
  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Handle authorized request
}
```

### API Route Security (MANDATORY)

**🚨 CRITICAL RULE: ALL API routes must be protected with authentication checks**

- **Default assumption**: All API routes are private and require authentication
- **Public routes**: Must be explicitly documented and justified
- **Authorization**: Check permissions after authentication
- **Error handling**: Return proper HTTP status codes

```typescript
// ✅ CORRECT - Standard protected API route pattern
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  // 1. ALWAYS check authentication first
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Check authorization for specific resource
  const canAccess = await checkPermission('resource', 'read');
  if (!canAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 3. Handle authorized request
  return NextResponse.json({ data: 'protected data' });
}

// ✅ CORRECT - Public route (explicitly documented)
export async function GET() {
  // Public routes must have clear justification
  // This endpoint provides public health check data
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}

// ❌ INCORRECT - Missing authentication check
export async function GET() {
  // This exposes data without authentication!
  return NextResponse.json({ sensitiveData: 'exposed' });
}
```

#### Public Route Exceptions

Only these routes should be public (must be documented):

- **Health checks**: `/api/health`, `/api/status`
- **Authentication**: `/api/auth/*` (Clerk callbacks)
- **Public data**: `/api/public/*` (explicitly public endpoints)
- **Webhooks**: `/api/webhooks/*` (with proper signature verification)

```typescript
// ✅ CORRECT - Webhook with signature verification
export async function POST(request: Request) {
  // Verify webhook signature instead of user auth
  const signature = request.headers.get('webhook-signature');
  if (!verifyWebhookSignature(signature, await request.text())) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  // Handle webhook
}
```

#### Security Checklist for API Routes

- [ ] **Authentication check**: `const { userId } = auth();`
- [ ] **Return 401** for unauthenticated requests
- [ ] **Authorization check**: Verify user can access resource
- [ ] **Return 403** for unauthorized requests  
- [ ] **Input validation**: Validate all request data
- [ ] **Error handling**: Don't leak sensitive information
- [ ] **Rate limiting**: Consider for public endpoints
- [ ] **CORS**: Configure appropriately for cross-origin requests

### RBAC Implementation Patterns

```typescript
// User metadata structure in Clerk
interface UserMetadata {
  systemRole?: 'superadmin';
  reviewGroups: Array<{
    reviewGroupId: string;
    role: 'admin';
  }>;
  teams: Array<{
    teamId: string;
    role: 'editor' | 'author';
    reviewGroup: string;
    namespaces: string[];
  }>;
  translations: Array<{
    language: string;
    namespaces: string[];
  }>;
}

// Permission hook for React components
import { useAuth, useOrganization } from "@clerk/nextjs";

export function usePermissions() {
  const { isSignedIn, sessionClaims } = useAuth();
  const { organization } = useOrganization();
  
  const can = useCallback((action: string, resource?: string, resourceId?: string) => {
    if (!isSignedIn) return false;
    
    // Superadmin bypass
    if (sessionClaims?.publicMetadata?.superadmin) return true;
    
    // Check organization permissions
    const permission = `${resource}:${action}`;
    return organization?.permissions?.includes(permission) || false;
  }, [isSignedIn, sessionClaims, organization]);
  
  return { can, organization, isSignedIn };
}
```

### Component Architecture

- **Use App Router patterns** with Server/Client Components
- **Implement proper TypeScript** with `ReactElement` return types
- **Use React Query** for server state management
- **Follow Material-UI patterns** for consistent UI

### Component Location Guidelines

**Next.js Admin Components**: `apps/admin/src/components/`
- Used only within the admin portal application
- Examples: `Navbar`, `ProgressBar`, `StatusChip`, `SpreadsheetViewer`
- Organized by feature: `auth/`, `layout/`, `ui/`, `vocabulary/`, etc.
- Import: `import { ComponentName } from '@/components/feature'`

**Shared React Hooks**: `apps/admin/src/hooks/` (if admin-specific) or `packages/theme/src/hooks/` (if reusable)
- Admin-specific hooks stay local
- Reusable hooks go in theme package

### Next.js Admin Component Patterns

**Pattern 1: Single File Components (Recommended)**
```
components/
├── layout/
│   └── Navbar.tsx              # Single component file
├── common/
│   ├── ProgressBar.tsx         # Single component file
│   ├── StatusChip.tsx          # Single component file
│   └── index.ts                # Re-export for convenience
```

```tsx
// ✅ CORRECT - Single file component with Material-UI
'use client';

import React from 'react';
import { Box, Chip, ChipProps } from '@mui/material';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: 'active' | 'pending' | 'inactive';
  label: string;
}

export function StatusChip({ status, label, ...props }: StatusChipProps) {
  const getColor = () => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'default';
    }
  };

  return (
    <Chip
      label={label}
      color={getColor()}
      size="small"
      {...props}
    />
  );
}
```

**Pattern 2: Compound Components (For Related Components)**
```tsx
// ✅ CORRECT - Multiple related components in one file
export function Alert({ children, className = '' }: AlertProps) {
  return (
    <div className={`rounded-lg border p-4 ${className}`} role="alert">
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = '' }: AlertTitleProps) {
  return (
    <h5 className={`mb-1 font-medium ${className}`}>
      {children}
    </h5>
  );
}

export function AlertDescription({ children, className = '' }: AlertDescriptionProps) {
  return (
    <div className={`text-sm ${className}`}>
      {children}
    </div>
  );
}
```

**Key Differences from Docusaurus**:
- **No folder structure**: Components are single `.tsx` files
- **Material-UI styling**: Use `sx` prop and theme system (not CSS modules)
- **Feature-based organization**: Group by functionality, not component type
- **Index files for re-exports**: Optional convenience exports

### Recommended Best Practice for Next.js Components

**Combine the three patterns appropriately**:

- **Use Pattern 1 (Single File Components)** for most UI components that are standalone and reusable. This keeps files simple and focused.

- **Use Pattern 2 (Compound Components)** within those single files for closely related internal components that logically belong together, improving encapsulation without splintering the file structure.

- **Use Pattern 3 (Feature Grouping with Index Files)** to structure and expose components at the feature/module level. This organizes components by domain, improves developer ergonomics, and supports future scaling.

```tsx
// ✅ EXAMPLE - Combining patterns effectively

// Pattern 1: Single file component
// components/vocabulary/SpreadsheetViewer.tsx
'use client';

import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

// Pattern 2: Compound components within the same file
function SpreadsheetHeader({ title }: { title: string }) {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h6">{title}</Typography>
    </Box>
  );
}

function SpreadsheetContent({ data }: { data: any[] }) {
  return (
    <Box sx={{ p: 2 }}>
      {/* Content implementation */}
    </Box>
  );
}

// Main component using compound components
export function SpreadsheetViewer({ title, data }: SpreadsheetViewerProps) {
  return (
    <Paper elevation={1}>
      <SpreadsheetHeader title={title} />
      <SpreadsheetContent data={data} />
    </Paper>
  );
}

// Pattern 3: Feature-level index file
// components/vocabulary/index.ts
export { SpreadsheetViewer } from './SpreadsheetViewer';
export { ValidationReport } from './ValidationReport';
```

### Additional Best Practices

- **Maintain consistency** in naming conventions and export styles across all components and features
- **Use `sx` prop and Material-UI theme system** consistently to keep styling maintainable and theme-compliant
- **Keep `'use client'` directive** only on components needing client-side behavior to optimize server components usage
- **Keep index files minimal** and selectively expose only public component API surfaces

This hybrid approach aligns well with the tech stack (Next.js 15, React 19, Material-UI 7) and Nx-managed monorepo environment. It balances clarity, modularity, and maintainability in a growing admin codebase.

### Development Commands

```bash
# Next.js admin development
pnpm nx dev admin --turbopack           # Start with Turbopack (recommended)
pnpm nx build admin                     # Build admin portal
pnpm nx start admin                     # Start production server

# API testing
pnpm nx test admin                      # Run admin tests
pnpm test:server-dependent         # Test with live servers
```
</conditional-block>

<conditional-block context-check="dependencies" task-condition="choosing-external-library">
IF current task involves choosing an external library:
  IF Dependencies section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Dependencies guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Dependencies section not relevant to current task

## Dependencies

### Choose Libraries Wisely

When adding third-party dependencies:

- Select the most popular and actively maintained option
- Check the library's GitHub repository for:
  - Recent commits (within last 6 months)
  - Active issue resolution
  - Number of stars/downloads
  - Clear documentation
- **IFLA-specific**: Verify compatibility with React 19 and Next.js 15
- **IFLA-specific**: Consider impact on build performance (Nx caching)
</conditional-block>

<conditional-block context-check="test-creation" task-condition="creating-tests">
IF current task involves creating new tests:
  IF Test Creation section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Test Creation guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Test Creation section not relevant to current task

## Test Creation Guidelines

### Integration-First Testing Philosophy

- **Write tests BEFORE implementing features** (TDD approach)
- **Default to integration tests**: Test with real I/O, files, databases, and services
- **Use unit tests sparingly**: Only for pure functions without external dependencies
- **MANDATORY**: Read `developer_notes/AI_TESTING_INSTRUCTIONS.md` before writing tests

### Test Decision Tree (30 Seconds)

```
Need to write a test?
├─ Uses env vars/external services? → @env test in tests/deployment/
├─ Tests user workflow in browser? → @e2e test in e2e/
├─ Uses files/DB/multiple components? → @integration test (DEFAULT)
└─ Pure function only? → @unit test (RARE)
```

### Required Test Tags

```typescript
// Category Tags (Required - Pick ONE)
describe('Feature @integration @api @validation', () => {
  // Integration test with functional tags
});

describe('Pure Function @unit', () => {
  // Unit test (rare - use sparingly)
});

test('User Workflow @e2e @critical @authentication', async ({ page }) => {
  // E2E test with priority and functional tags
});

describe('Deployment @env @ci-only', () => {
  // Environment test (CI only)
});
```

**Tag Categories**:
- **Category** (required): `@unit`, `@integration`, `@e2e`, `@env`
- **Functional**: `@api`, `@auth`, `@rbac`, `@ui`, `@validation`, `@security`
- **Priority**: `@critical`, `@happy-path`, `@error-handling`, `@edge-case`

### Test File Placement & Organization (IFLA Centralized Pattern)

**IFLA's Centralized Testing Strategy** - Optimized for monorepo consistency and discoverability:

**Package-Level Testing Structure**:
```
packages/[package-name]/
├── src/                             # Source code only
│   ├── components/
│   │   ├── VocabularyTable/         # Complex components may have __tests__ subfolder
│   │   │   ├── index.tsx
│   │   │   ├── types.ts
│   │   │   └── __tests__/           # Component-specific tests (acceptable pattern)
│   │   │       ├── vocabulary-table-main.test.tsx
│   │   │       └── multilingual-vocabulary.test.tsx
│   │   ├── Button.tsx
│   │   └── SiteLink.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   └── services/
│   │       ├── api.ts
│   │       └── __tests__/           # Service-specific tests (current pattern)
│   │           └── api.test.ts
│   └── hooks/
│       └── useFetch.ts
├── tests/                           # Centralized test directory (IFLA pattern)
│   ├── components/                  # Component tests (centralized)
│   │   ├── Button.test.tsx
│   │   ├── SiteLink.test.tsx
│   │   └── VocabularyTable.test.tsx
│   ├── integration/                 # Integration tests (broader scope)
│   │   ├── csv-processing.integration.test.ts
│   │   └── api-workflow.integration.test.ts
│   ├── deployment/                  # Environment tests (CI only)
│   │   └── env-validation.test.ts
│   ├── fixtures/                    # Test data files
│   │   ├── sample-data.csv
│   │   ├── test-workbook.xlsx
│   │   └── apiResponses.ts
│   ├── __mocks__/                   # Package-specific mocks
│   │   ├── external-service.ts
│   │   └── file-system.ts
│   └── setup.ts                     # Test setup configuration
└── vitest.config.ts                 # Package test configuration
```

**Application-Level Testing Structure (Next.js Admin)**:
```
apps/admin/
├── src/
│   ├── components/                  # Source code only
│   │   ├── layout/
│   │   │   └── Navbar.tsx
│   │   ├── common/
│   │   │   ├── StatusChip.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── vocabulary/
│   │       └── SpreadsheetViewer.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── utils/
│   │   │   └── validation.ts
│   │   └── services/
│   │       ├── adoption-service.ts
│   │       └── __tests__/           # Service tests (current pattern - keep)
│   │           └── adoption-service.test.ts
│   └── hooks/
│       └── usePermissions.ts
└── src/test/                        # Centralized test directory (IFLA pattern)
    ├── components/                  # Component tests (centralized)
    │   ├── NamespaceManagementClient.test.tsx
    │   └── layout/
    │       └── Navbar.test.tsx
    ├── lib/                         # Library tests (centralized)
    │   ├── auth.test.ts
    │   ├── session-management.test.ts
    │   └── utils/
    │       └── validation.test.ts
    ├── hooks/                       # Hook tests (centralized)
    │   └── usePermissions.test.ts
    ├── integration/                 # Multi-component workflows
    │   ├── auth-flow.integration.test.ts
    │   ├── api-rbac.integration.test.ts
    │   └── server-dependent/        # Live server tests
    │       └── cors.integration.test.ts
    ├── mocks/                       # Application-specific mocks
    │   ├── clerk.ts
    │   └── next-router.ts
    ├── utils/                       # Test utilities
    │   ├── test-utils.tsx
    │   └── auth-helpers.ts
    └── setup.ts                     # Test setup configuration
```

**Docusaurus Theme Testing (IFLA's Current Pattern)**:
```
packages/theme/
├── src/
│   ├── components/                  # Source code only
│   │   ├── VocabularyTable/
│   │   │   ├── index.tsx
│   │   │   ├── types.ts
│   │   │   └── __tests__/           # Complex component tests (current pattern)
│   │   │       ├── vocabulary-table-main.test.tsx
│   │   │       └── multilingual-vocabulary.test.tsx
│   │   ├── SiteLink/
│   │   │   └── index.tsx
│   │   └── DownloadPanel/
│   │       └── index.tsx
│   ├── config/
│   │   └── siteConfig.ts
│   └── hooks/
│       └── useDocusaurusConfig.ts
└── src/tests/                       # Centralized test directory (IFLA pattern)
    ├── components/                  # Component tests (centralized)
    │   ├── SiteLink.test.tsx
    │   ├── DownloadPanel.test.tsx
    │   ├── VocabularyTable.test.tsx
    │   └── Figure/                  # Organized by feature when needed
    │       └── Figure.test.tsx
    ├── config/                      # Configuration tests
    │   └── siteConfig.test.ts
    ├── deployment/                  # Environment tests
    │   ├── env-deployment.test.ts
    │   └── external-services.test.ts
    ├── __mocks__/                   # Docusaurus-specific mocks
    │   ├── @theme/Layout.tsx
    │   ├── @docusaurus/useDocusaurusContext.ts
    │   └── @docusaurus/router.ts
    ├── fixtures/                    # Theme test data
    │   ├── siteConfigs.ts
    │   ├── vocabularyData.ts
    │   └── apiResponses.ts
    ├── setup/                       # Test setup files
    │   ├── docusaurus-setup.ts
    │   └── mui-setup.ts
    └── setup.ts                     # Main test setup
```

**Root-Level E2E Structure**:
```
e2e/
├── e2e/                            # Full user workflows
│   ├── admin/
│   │   └── dashboard.e2e.spec.ts
│   └── standards/
│       └── vocabulary.e2e.spec.ts
├── integration/                    # Cross-service integration
│   ├── site-validation.spec.ts
│   └── rbac-workflow.spec.ts
├── smoke/                          # Quick health checks
│   ├── portal.smoke.spec.ts
│   └── auth.smoke.spec.ts
├── fixtures/                       # E2E test data
│   ├── test-data.fixture.ts
│   └── database.fixture.ts
├── utils/                          # E2E utilities
│   ├── auth-helpers.ts
│   └── page-helpers.ts
└── global-setup.ts                # E2E setup
```

**Global Test Resources (Minimal)**:
```
fixtures/                           # Project-wide shared data only
├── resources/
│   ├── namespaces.yaml
│   └── sites.yaml
├── users/
│   ├── test-users.yaml             # Real test user definitions
│   └── rbac-scenarios.yaml
└── test-scenarios.yaml             # Cross-project scenarios
```

### IFLA's Smart Mocking Strategy (Centralized Pattern)

**Global Mocks - Minimal and Strategic**:
- **Location**: `packages/theme/src/tests/__mocks__/` (Docusaurus ecosystem only)
- **Docusaurus Components**: `BrowserOnly.tsx`, `CodeBlock.tsx`, `Heading.tsx`, `TabItem.tsx`
- **Docusaurus Hooks**: `useDocusaurusContext.ts`, `useBaseUrl.ts`
- **Router Functionality**: `router.ts`, `theme-common.ts`
- **Principle**: Global mocks only for framework-level dependencies that are used across many tests

**Centralized Test Mocks (IFLA Pattern)**:
- **Theme package**: `packages/theme/src/tests/__mocks__/` for Docusaurus-specific mocks
- **Admin app**: `apps/admin/src/test/mocks/` for Next.js/Clerk-specific mocks
- **Package-specific**: `packages/{package}/tests/__mocks__/` for package-internal mocks
- **Benefits**: Easy to find, maintain, and share across tests in the same domain

**Local Test Mocks (When Needed)**:
- **Test-specific mocks**: Inline `vi.mock()` calls within individual test files
- **Override global mocks**: Local mocks take precedence when needed
- **Component-specific**: For complex components with `__tests__/` folders

**Dependency Injection for Testability**:
```typescript
// ✅ CORRECT - Design for testability with IFLA patterns
interface ApiService {
  fetchUser(id: string): Promise<User>;
}

class UserService {
  constructor(private apiService: ApiService) {}
  
  async getUser(id: string): Promise<User> {
    return this.apiService.fetchUser(id);
  }
}

// In centralized tests, use consistent mock patterns
// apps/admin/src/test/mocks/api-service.ts
export const mockApiService: ApiService = {
  fetchUser: vi.fn().mockResolvedValue(mockUser)
};

// In test file: apps/admin/src/test/lib/user-service.test.ts
import { mockApiService } from '../mocks/api-service';
const userService = new UserService(mockApiService);
```

**IFLA's Balanced Mocking Strategy**:
- **Mock framework dependencies**: Docusaurus, Next.js, Clerk (centralized mocks)
- **Mock external services**: APIs, databases, third-party services (centralized mocks)
- **Keep internal logic real**: Test actual interactions between IFLA modules
- **Integration tests use minimal mocking**: Only mock external boundaries

**Test Fixtures Organization (IFLA's Centralized Approach)**:
- **Package fixtures**: `packages/{package}/tests/fixtures/` for shared test data
- **Application fixtures**: `apps/admin/src/test/fixtures/` for admin-specific data
- **E2E fixtures**: `e2e/fixtures/` for end-to-end test scenarios
- **Global fixtures**: `fixtures/` (root level) for cross-project data (users, namespaces)
- **Benefits**: Clear hierarchy, easy to locate, shared across related tests

**Test Setup Files (IFLA Pattern)**:
- **Theme package**: `packages/theme/src/tests/setup.ts` (Docusaurus + MUI setup)
- **Admin app**: `apps/admin/src/test/setup.ts` (Next.js + Clerk setup)
- **E2E tests**: `e2e/global-setup.ts` (Playwright global setup)
- **Package-specific**: Each package has its own `vitest.config.ts` referencing centralized setup

### IFLA Test Naming Conventions (Centralized Pattern)

**Unit Tests (Centralized in test directories)**:
- **Components**: `ComponentName.test.tsx` in `tests/components/` or `src/test/components/`
- **Utilities**: `utils.test.ts` in `tests/lib/` or `src/test/lib/`
- **Hooks**: `useCustomHook.test.ts` in `tests/hooks/` or `src/test/hooks/`
- **Services**: `service-name.test.ts` in `tests/lib/` or `lib/services/__tests__/`

**Complex Component Tests (Subfolder Pattern)**:
- **Pattern**: `__tests__/component-feature.test.tsx` within component folder
- **Example**: `VocabularyTable/__tests__/vocabulary-table-main.test.tsx`
- **Use when**: Component has multiple test files or complex test scenarios

**Integration Tests (Separated in Dedicated Directories)**:
- **Pattern**: `*.integration.test.ts`
- **Location**: `tests/integration/` (package level) or `src/test/integration/` (app level)
- **Multi-component workflows**: `user-workflow.integration.test.ts`
- **API integration**: `auth-api.integration.test.ts`
- **Server-dependent**: `server-dependent/cors.integration.test.ts`

**E2E Tests (Full User Journeys)**:
- **Pattern**: `*.e2e.spec.ts` or `*.spec.ts`
- **Location**: `e2e/e2e/`, `e2e/smoke/`, `e2e/integration/`
- **User-focused naming**: `dashboard.auth.spec.ts`, `isbdm-sensory-vocabulary.e2e.spec.ts`
- **Feature-based organization**: `admin/dashboard.e2e.spec.ts`, `standards/vocabulary.e2e.spec.ts`

**Environment Tests (CI-Only)**:
- **Pattern**: `env-*.test.ts`
- **Location**: `tests/deployment/` or `src/tests/deployment/`
- **Service validation**: `env-deployment.test.ts`, `external-services.test.ts`
- **Tagged**: `@env @ci-only`

**Test Data and Fixtures (IFLA's Centralized Approach)**:
- **Package fixtures**: `tests/fixtures/apiResponses.ts`, `tests/fixtures/vocabularyData.ts`
- **Application fixtures**: `src/test/fixtures/` for app-specific data
- **Sample files**: `sample-data.csv`, `test-workbook.xlsx` in appropriate `fixtures/` directory
- **Global fixtures**: `fixtures/` (root level) for cross-project data

**File Organization Examples**:
```
# Theme package (current IFLA pattern)
packages/theme/src/tests/components/VocabularyTable.test.tsx
packages/theme/src/tests/fixtures/vocabularyData.ts

# Admin app (current IFLA pattern)  
apps/admin/src/test/components/NamespaceManagementClient.test.tsx
apps/admin/src/test/lib/auth.test.ts

# Complex components (acceptable IFLA pattern)
packages/theme/src/components/VocabularyTable/__tests__/vocabulary-table-main.test.tsx
```

### IFLA Test Templates (Centralized Pattern)

**Unit Test Template (Centralized)**:
```typescript
// tests/components/ComponentName.test.tsx (centralized location)
import { render, screen } from '@testing-library/react';
import { ComponentName } from '../../src/components/ComponentName';

describe('ComponentName @unit', () => {
  it('should render with required props', () => {
    render(<ComponentName title="Test Title" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  
  it('should handle user interactions', async () => {
    const handleClick = vi.fn();
    render(<ComponentName title="Test" onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

**Complex Component Test Template (Subfolder Pattern)**:
```typescript
// src/components/VocabularyTable/__tests__/vocabulary-table-main.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VocabularyTable } from '../VocabularyTable';
import { expect, describe, it, vi, beforeEach } from 'vitest';

// Mock Docusaurus dependencies (local override)
vi.mock('@docusaurus/theme-common', () => ({
  useColorMode: () => ({ colorMode: 'light' }),
}));

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      customFields: {
        vocabularyDefaults: {
          prefix: 'isbdm',
          defaultLanguage: 'en',
          availableLanguages: ['en', 'fr', 'es'],
        }
      }
    }
  })
}));

describe('VocabularyTable Main Features @unit @ui', () => {
  it('should render vocabulary data with multilingual support', () => {
    const mockData = [
      { id: '1', term: 'Test Term', definition: 'Test Definition' }
    ];
    
    render(<VocabularyTable data={mockData} />);
    
    expect(screen.getByText('Test Term')).toBeInTheDocument();
    expect(screen.getByText('Test Definition')).toBeInTheDocument();
  });
});
```

**Integration Test Template (IFLA Pattern)**:
```typescript
// tests/integration/feature-workflow.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';

describe('Feature Workflow @integration @api', () => {
  const testDir = path.join(__dirname, '.test-output');
  
  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });
  
  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });
  
  it('should process real files and interact with multiple components', async () => {
    // Create real test file
    const csvPath = path.join(testDir, 'test.csv');
    await fs.writeFile(csvPath, 'header\nvalue');
    
    // Test real I/O and component interactions
    const processor = new FileProcessor();
    const validator = new DataValidator();
    
    const result = await processor.processFile(csvPath);
    const validation = await validator.validate(result);
    
    // Verify actual results from real operations
    expect(result.rows).toBe(1);
    expect(validation.isValid).toBe(true);
  });
});
```

**Service Test Template (IFLA Pattern)**:
```typescript
// lib/services/__tests__/adoption-service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AdoptionService } from '../adoption-service';

// Mock external dependencies (centralized pattern)
vi.mock('@/lib/supabase/client', () => ({
  db: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'mock-sheet-id', status: 'ready' },
            error: null,
          }),
        }),
      }),
    }),
  },
}));

describe('AdoptionService @unit @api', () => {
  let service: AdoptionService;

  beforeEach(() => {
    service = new AdoptionService();
    vi.clearAllMocks();
  });

  it('should create adoption sheet successfully', async () => {
    const result = await service.createAdoptionSheet({
      namespaceId: 'isbd',
      projectId: 'project-1',
    });

    expect(result.success).toBe(true);
    expect(result.data.id).toBe('mock-sheet-id');
  });
});
```

### Authentication Testing with Real Users

- **Use real test users** with code **424242**
- **Available test users**: translator, author, editor, superadmin, rg_admin
- **Public routes**: `/`, `/request-invite`, `/api/auth/callback`, `/api/hello`, `/api/health`

```typescript
// ✅ CORRECT - Authentication test pattern
describe('Protected API Endpoint @integration @auth', () => {
  it('should allow access for authorized user', async () => {
    const response = await fetch('/api/protected', {
      headers: { 'Authorization': `Bearer ${editorToken}` }
    });
    expect(response.status).toBe(200);
  });
  
  it('should deny access for unauthorized user', async () => {
    const response = await fetch('/api/protected');
    expect(response.status).toBe(401);
  });
});
```

### Test Commands (MANDATORY Format)

```bash
# 🚨 ALWAYS use pnpm prefix
pnpm nx test unified-spreadsheet
pnpm nx test @ifla/theme
pnpm nx test portal

# Tag-based selection
pnpm test --grep "@unit"              # Unit tests only
pnpm test --grep "@integration"       # Integration tests only
pnpm test --grep "@critical"          # Critical tests only
pnpm test --grep "@api.*@validation"  # API validation tests

# Affected testing (recommended)
pnpm test                             # nx affected --target=test
```

### Performance Targets

- **Integration tests**: < 30 seconds per file (primary test type)
- **Unit tests**: < 5 seconds per file (rare)
- **E2E tests**: < 60 seconds per workflow
- **Environment tests**: < 30 seconds per service
</conditional-block>

<conditional-block context-check="test-build-infrastructure" task-condition="working-with-test-infrastructure">
IF current task involves test execution, build validation, or CI/CD:
  IF Test & Build Infrastructure section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using Test & Build Infrastructure guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Test & Build Infrastructure section not relevant to current task

## Test & Build Infrastructure

### 5-Phase Testing Strategy

1. **Selective Tests** (Development): `pnpm test` - Affected tests only
2. **Comprehensive Tests** (Release): `pnpm test:comprehensive` - Full validation
3. **Pre-commit Tests** (Git Hook): < 60 seconds - Essential checks only
4. **Pre-push Tests** (Git Hook): < 180 seconds - Production readiness
5. **CI Tests** (GitHub Actions): Environment validation only

### Performance Targets & Commands

```bash
# Phase 1: Selective (Development) - Target: <30s
pnpm test                         # Affected tests (recommended)
pnpm nx affected --target=test         # Explicit affected testing
pnpm nx test {project}                 # Single project testing

# Phase 2: Comprehensive (Release) - Target: <300s
pnpm test:comprehensive           # Full test suite
pnpm test:comprehensive:unit      # All unit tests
pnpm test:comprehensive:e2e       # All E2E tests
pnpm test:comprehensive:builds    # All build validation

# Phase 3: Pre-commit (Automated) - Target: <60s
pnpm test:pre-commit              # Fast feedback before commit
# Includes: TypeScript, ESLint, Unit tests (affected), Config validation

# Phase 4: Pre-push (Automated) - Target: <180s
pnpm test:pre-push:flexible       # Production readiness
# Includes: Integration tests, Production builds (affected), Smart E2E

# Phase 5: CI (GitHub Actions) - Target: <180s
# Environment validation, deployment verification, external service checks
```

### Build Validation Commands

```bash
# Build testing
pnpm test:builds:affected         # Test affected site builds
pnpm test:builds:critical         # Portal + ISBDM builds
pnpm test:builds:config           # Fast config validation

# Site-specific builds
pnpm nx build {project}                # Single project build
pnpm build:all                    # All projects (Nx optimized)
pnpm nx affected --target=build        # Only changed projects

# Build validation with cleanup
pnpm nx run {site}:start:robust        # Start with port cleanup
pnpm nx run {site}:serve:robust        # Serve with port cleanup
```

### E2E Testing Infrastructure

```bash
# E2E test execution
pnpm test:e2e                     # Run E2E tests
npx playwright test --headed      # Run with browser visible
npx playwright test --project=chromium  # Specific browser

# E2E debugging
npx playwright test --debug       # Debug mode
npx playwright codegen            # Generate test code
```

### Performance Optimization

```bash
# Nx performance commands
pnpm nx:daemon:start              # Speed up all Nx commands
pnpm nx:cache:clear               # Clear cache when needed
pnpm nx:cache:stats               # Monitor cache effectiveness
pnpm nx:graph                     # Visualize dependencies

# Parallel execution
pnpm nx affected --target=test --parallel=3  # Parallel test execution
pnpm nx run-many --target=build --all --parallel=3  # Parallel builds
```

### Git Hook Management

```bash
# Manual hook execution (for debugging)
pnpm test:pre-commit              # Equivalent to pre-commit hook
pnpm test:pre-push                # Equivalent to pre-push hook

# Hook bypass (use rarely)
git commit --no-verify            # Skip pre-commit (NOT recommended)
git push --no-verify              # Skip pre-push (NOT recommended)
```

### Infrastructure Health Checks

```bash
# System validation
pnpm health                       # Comprehensive system check
pnpm fresh                        # Clean install with cache clear
pnpm ports:kill                   # Free up development ports

# Dependency validation
pnpm install                      # Refresh dependencies
pnpm typecheck                    # TypeScript validation across all projects
pnpm lint                         # Code quality check across all projects
```

### CI/CD Integration

- **GitHub Actions**: Automated on push/PR with Nx Cloud distributed builds
- **Preview Deployments**: `preview` branch → GitHub Pages
- **Production Deployments**: `main` branch → Production environment
- **Build Artifacts**: Preserved for debugging failed builds
- **Status Checks**: PR merging blocked until all checks pass
</conditional-block>

<conditional-block context-check="ifla-quality" task-condition="code-quality-check">
IF current task involves code quality or linting:
  IF IFLA Quality section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using IFLA Quality guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: IFLA Quality section not relevant to current task

## IFLA Code Quality Standards

### TypeScript Requirements (MANDATORY)

- **NEVER use `any` type** without explicit documentation and review tag
- **ALWAYS use explicit return types** for functions
- **MUST use `ReactElement` instead of `JSX.Element`** for React components
- **ALWAYS validate external data** with Zod schemas

```typescript
// ✅ CORRECT
import { ReactElement } from 'react';
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1)
});

function UserProfile(): ReactElement {
  // Component implementation
}

// ❌ FORBIDDEN
function UserProfile(): JSX.Element {  // Cannot find namespace 'JSX'
  const data: any = getUserData();     // Undocumented any
}
```

### Pre-Development Checklist (MANDATORY)

Before starting any task:

- [ ] **Check MUI MCP and Context7 MCP** for examples before writing code
- [ ] **Verify routing patterns** (use root-relative paths like `/dashboard`)
- [ ] **Choose appropriate test level** (usually selective/affected)
- [ ] **Confirm API calls use standard fetch**
- [ ] **🚨 API SECURITY: All API routes must have authentication checks**
- [ ] **Use `nx affected` instead of running everything**

### Post-Development Checklist (MANDATORY)

After completing any task:

- [ ] **Run `pnpm typecheck`** - must pass with zero errors
- [ ] **Run `pnpm lint`** - must pass with zero warnings (auto-fixes unused imports)
- [ ] **Run affected tests** - `pnpm test` must pass
- [ ] **Verify builds** - `nx build {project}` must succeed
- [ ] **🚨 SECURITY REVIEW: All API routes have authentication checks**

### ESLint Integration

- **Centralized configuration**: All projects use `@ifla/eslint-config` shared package
- **Automatic unused import removal**: ESLint auto-fixes unused imports on save/commit
- **Relaxed test rules**: Test files allow `any` types, console logs, longer functions
- **Pre-commit integration**: Husky + lint-staged automatically runs ESLint on staged files

```bash
# ESLint commands
pnpm lint                    # Lint affected files (nx affected)
pnpm lint:fix               # Auto-fix issues (removes unused imports)
pnpm lint:all               # Lint all files
```

### System Performance Configuration

- **Nx parallelism**: Optimized for 16-core Apple Silicon (8 parallel tasks)
- **Test workers**: 8-10 workers for optimal performance
- **Build operations**: 8-10 parallel builds with memory management
- **Environment detection**: Automatic CI vs local performance tuning
</conditional-block>

<conditional-block context-check="ifla-performance" task-condition="performance-optimization">
IF current task involves performance optimization:
  IF IFLA Performance section already read in current context:
    SKIP: Re-reading this section
    NOTE: "Using IFLA Performance guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: IFLA Performance section not relevant to current task

## IFLA Performance Optimization

### Nx Optimization (MANDATORY)

- **ALWAYS have Nx daemon running**: `pnpm nx:daemon:start`
- **Use affected commands**: `nx affected --target=build` for faster builds
- **Monitor cache effectiveness**: `pnpm nx:cache:stats`
- **Clear cache when needed**: `pnpm nx:cache:clear`

### Development Performance

- **Use Turbopack for Next.js**: `nx dev admin --turbopack`
- **Leverage port cleanup**: `nx run {site}:start:robust`
- **Run health checks**: `pnpm health` to verify system configuration
- **Use parallel execution**: `--parallel=3` for tests

### Build Performance

- **Optimize for affected builds**: Only build what changed
- **Use Nx Cloud caching**: Distributed builds with 6-8 agents
- **Monitor build times**: Target < 5 minutes for full builds
</conditional-block>

## Summary of IFLA-Specific Augmentations

### Key Additions to Agent OS Principles

1. **Monorepo-First Approach**: Always use Nx commands and pnpm from root directory
2. **Affected-Only Development**: Use `nx affected` for all development operations
3. **Strict TypeScript**: No `any` types, explicit return types, React 19 compatibility
4. **Centralized Test Organization**: Consistent test placement in dedicated directories
5. **Separated Integration Tests**: Dedicated directories for broader-scope tests
6. **Strategic Mocking**: Centralized mocks for framework dependencies, minimal global mocks
7. **Integration Testing**: Real I/O over mocks, 5-phase testing strategy
8. **Performance Targets**: Specific time limits for different test phases
9. **Authentication**: Real test users with standardized code (424242)
10. **Routing Standards**: Specific patterns for Next.js routing
11. **Quality Gates**: Mandatory pre/post development checklists

### IFLA's Centralized Test Infrastructure Benefits

- **Consistency**: All tests follow the same organizational pattern across packages
- **Discoverability**: Tests are in predictable locations (`tests/`, `src/test/`)
- **Maintainability**: Clear separation between source code and test code
- **Monorepo Optimization**: Centralized patterns work well with Nx affected testing
- **Framework Alignment**: Matches Nx and Vitest conventions for workspace testing
- **Team Efficiency**: Developers know exactly where to find and place tests

### IFLA's Test Organization Patterns

- **Unit Tests**: Centralized in `tests/components/`, `tests/lib/`, `src/test/components/`
- **Complex Components**: `__tests__/` subfolders when multiple test files needed
- **Integration Tests**: Dedicated `tests/integration/` and `src/test/integration/` directories
- **Service Tests**: `lib/services/__tests__/` pattern for service-specific tests
- **Global Mocks**: Framework-specific mocks in `tests/__mocks__/` directories
- **Fixtures**: Centralized in `tests/fixtures/` with clear hierarchy

### Integration with Existing Tools

- **MCP Servers**: Context7 for documentation, MUI for components
- **GitHub Integration**: Octokit.js, mock-github for testing
- **Build System**: Nx with distributed caching and parallel execution
- **Testing**: Vitest + Playwright with centralized test organization
- **Global Mocks**: Strategic, framework-focused, easily maintainable
- **Accessibility**: Comprehensive UK/EU compliance framework (see UI/UX Accessibility Best Practices)

### Additional Best Practice References

- **UI/UX Accessibility**: `developer_notes/ui-ux-accessibility-best-practices.md` - Complete WCAG 2.1 AA compliance guide
- **Design System**: `system-design-docs/11-design-system-ui-patterns.md` - Comprehensive UI component patterns
- **Admin Accessibility**: `apps/admin/CLAUDE.md` - Admin-specific accessibility requirements

This augmented version maintains the simplicity and clarity of the Agent OS principles while aligning with IFLA's proven centralized testing approach, ensuring consistency, maintainability, and optimal monorepo performance.