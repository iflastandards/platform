# Current RBAC Implementation

**Version:** 2.0  
**Date:** January 2025  
**Status:** Active Implementation

## Overview

This document describes the **actual implemented** authorization architecture for the IFLA Standards Platform. The system uses Clerk for authentication with a custom RBAC implementation stored in Clerk's `publicMetadata`.

## Architecture Overview

### Technology Stack
- **Authentication**: Clerk (handles user identity and sessions)
- **Authorization**: Custom RBAC via `publicMetadata` (NOT Clerk Organizations)
- **API Layer**: Standard Next.js App Router API routes (NOT tRPC)
- **Data Storage**: Supabase for operational data, Git for content
- **Performance**: AuthCache with 5-minute TTL (reduces checks from ~50ms to <1ms)

### Key Design Decisions
1. **Metadata-based roles**: Using Clerk publicMetadata for role storage
2. **Custom authorization**: Authorization logic implemented in TypeScript
3. **Standard API routes**: Next.js API routes with fetch()
4. **Namespace-level authorization**: Lowest level of permission granularity
5. **No vocabulary-specific permissions**: All content within namespace shares permissions

## Authorization Hierarchy (CRITICAL)

The IFLA Standards Platform uses **namespace-level authorization** as the fundamental access control mechanism:

```
System Level (Superadmin)
    ↓
Review Group Level (Review Group Admin)
    ↓
Namespace Level (Namespace Admin/Editor/Translator) ← LOWEST AUTHORIZATION LEVEL
    ↓
Content Level (Vocabularies, Element Sets) ← NO SPECIFIC PERMISSIONS
```

### Key Principles

1. **Namespace is the lowest level of authorization** - All content permissions are determined by namespace access
2. **No vocabulary-specific permissions** - Users cannot have permissions for individual vocabularies
3. **No element-set-specific permissions** - Users cannot have permissions for individual element sets
4. **Inheritance model** - All content within a namespace inherits the namespace's access permissions
5. **Uniform access** - If you can edit one vocabulary in a namespace, you can edit ALL vocabularies in that namespace

## Role Hierarchy

```typescript
// From apps/admin/src/lib/authorization.ts
export const ROLES = {
  SUPERADMIN: 'superadmin',  // Full system access
  ADMIN: 'admin',            // Review group administration
  EDITOR: 'editor',          // Content creation and editing
  TRANSLATOR: 'translator',  // Translation capabilities
  REVIEWER: 'reviewer',      // Review and comment only
  VIEWER: 'viewer'          // Read-only access
} as const;
```

### Permission Matrix

| Role | Vocabularies | Namespaces | Users | Settings | Publishing |
|------|-------------|------------|-------|----------|------------|
| SUPERADMIN | Full | Full | Full | Full | Full |
| ADMIN | Full | Manage | Manage | Edit | Approve |
| EDITOR | Create/Edit | View | View | View | Submit |
| TRANSLATOR | Translate | View | - | - | - |
| REVIEWER | Comment | View | - | - | - |
| VIEWER | Read | View | - | - | - |

## Implementation Details

### 1. User Metadata Structure

```typescript
// Stored in Clerk user.publicMetadata
interface UserPublicMetadata {
  role: 'superadmin' | 'admin' | 'editor' | 'translator' | 'reviewer' | 'viewer';
  namespacePermissions?: {
    [namespace: string]: {
      role: string;
      permissions: string[];
    }
  };
  temporaryAccess?: {
    [resource: string]: {
      expiresAt: string;
      grantedBy: string;
    }
  };
}
```

### 2. Authorization Function

```typescript
// apps/admin/src/lib/authorization.ts
export function checkUserPermission(
  userRole: string | undefined,
  resource: string,
  action: string,
  namespace?: string,
  namespacePermissions?: NamespacePermissions
): boolean {
  // Superadmin bypass
  if (userRole === ROLES.SUPERADMIN) return true;
  
  // Check namespace-specific permissions
  if (namespace && namespacePermissions?.[namespace]) {
    const nsPerms = namespacePermissions[namespace].permissions;
    if (nsPerms.includes(`${resource}:${action}`)) return true;
  }
  
  // Check role-based permissions
  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions.includes(`${resource}:${action}`);
}
```

### 3. API Route Protection

```typescript
// Example: apps/admin/src/app/api/vocabularies/[namespace]/route.ts
import { auth } from "@clerk/nextjs/server";
import { checkUserPermission } from "@/lib/authorization";

export async function GET(
  req: Request,
  { params }: { params: { namespace: string } }
) {
  const { userId, sessionClaims } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userRole = sessionClaims?.publicMetadata?.role;
  const canRead = checkUserPermission(
    userRole,
    'vocabulary',
    'read',
    params.namespace
  );
  
  if (!canRead) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Fetch and return vocabularies
  const vocabularies = await fetchVocabularies(params.namespace);
  return NextResponse.json(vocabularies);
}
```

### 4. Client-Side Permission Checking

```typescript
// hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role;
  
  const can = useCallback((resource: string, action: string, namespace?: string) => {
    return checkUserPermission(
      userRole,
      resource,
      action,
      namespace,
      user?.publicMetadata?.namespacePermissions
    );
  }, [userRole, user]);
  
  return {
    can,
    role: userRole,
    isSuperadmin: userRole === 'superadmin'
  };
}

// Usage in components
function VocabularyEditor({ namespace }) {
  const { can } = usePermissions();
  
  if (!can('vocabulary', 'edit', namespace)) {
    return <AccessDenied />;
  }
  
  return <EditorComponent />;
}
```

## API Endpoints

### Standard Next.js App Router Structure
```
apps/admin/src/app/api/
├── auth/                    # Authentication endpoints
│   └── [...clerk]/route.ts # Clerk webhook handlers
├── vocabularies/           # Vocabulary management
│   ├── route.ts           # List all vocabularies
│   └── [namespace]/
│       ├── route.ts       # Namespace operations
│       └── elements/
│           └── route.ts   # Element operations
├── users/                  # User management
│   ├── route.ts           # List users
│   └── [userId]/
│       └── route.ts       # User operations
└── admin/                  # Admin operations
    └── settings/
        └── route.ts       # System settings
```

### Example API Implementation

```typescript
// apps/admin/src/app/api/vocabularies/route.ts
export async function GET(req: Request) {
  const { userId, sessionClaims } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userRole = sessionClaims?.publicMetadata?.role;
  const namespaces = await getUserAccessibleNamespaces(userId, userRole);
  
  const vocabularies = await Promise.all(
    namespaces.map(ns => fetchVocabularies(ns))
  );
  
  return NextResponse.json({ 
    data: vocabularies.flat(),
    meta: { 
      total: vocabularies.length,
      namespaces 
    }
  });
}

export async function POST(req: Request) {
  const { userId, sessionClaims } = auth();
  const body = await req.json();
  
  if (!checkUserPermission(
    sessionClaims?.publicMetadata?.role,
    'vocabulary',
    'create',
    body.namespace
  )) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  const vocabulary = await createVocabulary(body);
  return NextResponse.json(vocabulary, { status: 201 });
}
```

## Middleware Configuration

```typescript
// apps/admin/src/middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: [
    "/",
    "/api/public/(.*)",
    "/sign-in",
    "/sign-up"
  ]
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api)(.*)"
  ]
};
```

## Benefits of Current Implementation

1. **Simplicity**: Single source of truth in publicMetadata
2. **Flexibility**: Easy to add new roles or permissions
3. **Performance**: No external service calls for authorization
4. **Maintainability**: All logic in TypeScript, no policy files
5. **Cost-effective**: No additional services beyond Clerk

## Migration Path (If Needed)

If we need to migrate to a different authorization system in the future:

1. **Data Migration**: Export roles from publicMetadata
2. **Gradual Rollout**: Run both systems in parallel
3. **Validation**: Compare authorization decisions
4. **Cutover**: Switch to new system once validated
5. **Cleanup**: Remove old authorization code

## Testing Strategy

### Test Users Configuration

The platform includes 5 pre-configured Clerk test users with specific roles (all use verification code `424242`):

1. **Superadmin Test User**: Full system access
2. **Review Group Admin**: Admin for specific review groups
3. **Editor**: Content editing permissions
4. **Translator**: Translation-only access
5. **Viewer**: Read-only access

### Authorization Testing Patterns

```typescript
// Example test for authorization with caching
describe('Authorization with Cache', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearTestUsersCache();
  });

  it('should allow superadmin all actions', () => {
    const result = checkUserPermission(
      'superadmin',
      'vocabulary',
      'delete',
      'isbd'
    );
    expect(result).toBe(true);
  });
  
  it('should cache permission results for 5 minutes', async () => {
    const start = performance.now();
    
    // First call - hits database
    const perm1 = await canPerformAction('namespace', 'read', {
      namespaceId: 'isbd'
    });
    const firstTime = performance.now() - start;
    
    // Second call - uses cache
    const cacheStart = performance.now();
    const perm2 = await canPerformAction('namespace', 'read', {
      namespaceId: 'isbd'
    });
    const cacheTime = performance.now() - cacheStart;
    
    // Cache should be significantly faster
    expect(cacheTime).toBeLessThan(firstTime / 10);
    expect(cacheTime).toBeLessThan(1); // Sub-millisecond from cache
    
    // Results should be identical
    expect(perm1).toBe(perm2);
  });
  
  it('should respect namespace permissions', () => {
    const nsPerms = {
      'isbd': {
        role: 'editor',
        permissions: ['vocabulary:edit', 'vocabulary:create']
      }
    };
    
    const result = checkUserPermission(
      'viewer',
      'vocabulary',
      'edit',
      'isbd',
      nsPerms
    );
    expect(result).toBe(true);
  });
});
```

### Debug Mode Testing

```typescript
describe('Authorization Debug Verification', () => {
  test('should verify permission matrix matches expectations', async () => {
    // Enable debug mode
    process.env.AUTH_DEBUG = 'true';
    process.env.AUTH_DEBUG_VERBOSE = 'true';
    
    // Get current user's permission matrix
    const response = await fetch('/api/admin/auth/debug?action=matrix');
    const { data } = await response.json();
    
    // Define expected permissions for RG Admin
    const expectedRGAdminPermissions = {
      namespace: { create: true, read: true, update: true, delete: true },
      vocabulary: { create: true, read: true, update: true, delete: false },
      user: { read: true, update: true, create: false, delete: false }
    };
    
    // Verify matrix matches expectations
    Object.entries(expectedRGAdminPermissions).forEach(([resource, actions]) => {
      Object.entries(actions).forEach(([action, expected]) => {
        expect(data.matrix[resource][action]).toBe(expected);
      });
    });
  });
});
```

## withAuth Middleware Pattern

### Custom Middleware Wrapper

```typescript
// apps/admin/src/lib/auth/middleware.ts
export function withAuth(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>,
  options: {
    resource: string;
    action: string;
  }
) {
  return async (request: NextRequest) => {
    const { userId, sessionClaims } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userRole = sessionClaims?.publicMetadata?.role;
    const namespacePermissions = sessionClaims?.publicMetadata?.namespacePermissions;
    
    // Extract resource attributes from request
    const resourceAttributes = getResourceAttributes(request);
    
    const canPerform = checkUserPermission(
      userRole,
      options.resource,
      options.action,
      resourceAttributes.namespace,
      namespacePermissions
    );
    
    if (!canPerform) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Call the actual handler with auth context
    return handler(request, {
      userId,
      userRole,
      namespacePermissions,
      resourceAttributes
    });
  };
}
```

### Usage in API Routes

```typescript
// apps/admin/src/app/api/vocabularies/[namespace]/route.ts
export const GET = withAuth(async (request, context) => {
  // Handler has access to authenticated context
  const { resourceAttributes } = context;
  const vocabularies = await fetchVocabularies(resourceAttributes.namespace);
  return NextResponse.json(vocabularies);
}, {
  resource: 'vocabulary',
  action: 'read'
});

export const POST = withAuth(async (request, context) => {
  const body = await request.json();
  const vocabulary = await createVocabulary({
    ...body,
    createdBy: context.userId
  });
  return NextResponse.json(vocabulary, { status: 201 });
}, {
  resource: 'vocabulary',
  action: 'create'
});
```

## Monitoring and Audit

### Authorization Events with Debug Support

```typescript
// Log authorization decisions for audit
export async function logAuthorizationEvent(
  userId: string,
  resource: string,
  action: string,
  allowed: boolean,
  context?: any
) {
  // Debug mode logging
  if (process.env.AUTH_DEBUG === 'true') {
    console.log('[AUTH]', {
      userId,
      resource,
      action,
      allowed,
      context,
      timestamp: new Date().toISOString()
    });
  }
  
  // Verbose debug mode
  if (process.env.AUTH_DEBUG_VERBOSE === 'true') {
    console.log('[AUTH VERBOSE]', {
      stack: new Error().stack,
      headers: context?.headers,
      body: context?.body
    });
  }
  
  // Persist to database
  await supabase.from('authorization_log').insert({
    user_id: userId,
    resource,
    action,
    allowed,
    context,
    timestamp: new Date().toISOString()
  });
}
```

### Debug Endpoint

```typescript
// apps/admin/src/app/api/admin/auth/debug/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  // Only available to superadmin in production
  const { sessionClaims } = auth();
  if (process.env.NODE_ENV === 'production' && 
      sessionClaims?.publicMetadata?.role !== 'superadmin') {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  switch (action) {
    case 'matrix':
      // Return permission matrix for current user
      return NextResponse.json({ 
        data: generatePermissionMatrix(sessionClaims) 
      });
      
    case 'logs':
      // Return recent authorization logs
      const count = parseInt(searchParams.get('count') || '10');
      const logs = await getRecentAuthLogs(count);
      return NextResponse.json({ data: logs });
      
    case 'cache':
      // Return cache statistics
      const stats = getAuthCacheStats();
      return NextResponse.json({ data: stats });
      
    default:
      return NextResponse.json({ 
        error: "Invalid action. Use: matrix, logs, or cache" 
      }, { status: 400 });
  }
}
```

## Future Considerations

1. **Token-based API Access**: For external integrations
2. **Fine-grained Permissions**: More specific resource controls
3. **Delegation**: Allow users to delegate permissions
4. **Audit Trail**: Comprehensive authorization logging
5. **Performance Caching**: Cache permission checks

## Conclusion

The current implementation provides a robust, simple, and maintainable authorization system that meets all current requirements without the complexity of external policy engines or organizational structures. It can be easily extended or migrated if requirements change.
