# Current RBAC Implementation

**Version:** 1.0  
**Date:** July 2025  
**Status:** Active Implementation

## Overview

This document describes the **actual implemented** authorization architecture for the IFLA Standards Platform. The system uses Clerk for authentication with a custom RBAC implementation stored in Clerk's `publicMetadata`.

## Architecture Overview

### Technology Stack
- **Authentication**: Clerk (handles user identity and sessions)
- **Authorization**: Custom RBAC via `publicMetadata`
- **API Layer**: Standard Next.js App Router API routes
- **Data Storage**: Supabase for operational data, Git for content

### Key Design Decisions
1. **Metadata-based roles**: Using Clerk publicMetadata for role storage
2. **Custom authorization**: Authorization logic implemented in TypeScript
3. **Standard API routes**: Next.js API routes with fetch()
4. **Hierarchical roles**: Role-based permissions with namespace-level granularity

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

```typescript
// Example test for authorization
describe('Authorization', () => {
  it('should allow superadmin all actions', () => {
    const result = checkUserPermission(
      'superadmin',
      'vocabulary',
      'delete',
      'isbd'
    );
    expect(result).toBe(true);
  });
  
  it('should restrict viewer to read-only', () => {
    const canRead = checkUserPermission('viewer', 'vocabulary', 'read');
    const canEdit = checkUserPermission('viewer', 'vocabulary', 'edit');
    
    expect(canRead).toBe(true);
    expect(canEdit).toBe(false);
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

## Monitoring and Audit

### Authorization Events
```typescript
// Log authorization decisions for audit
export async function logAuthorizationEvent(
  userId: string,
  resource: string,
  action: string,
  allowed: boolean,
  context?: any
) {
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

## Future Considerations

1. **Token-based API Access**: For external integrations
2. **Fine-grained Permissions**: More specific resource controls
3. **Delegation**: Allow users to delegate permissions
4. **Audit Trail**: Comprehensive authorization logging
5. **Performance Caching**: Cache permission checks

## Conclusion

The current implementation provides a robust, simple, and maintainable authorization system that meets all current requirements without the complexity of external policy engines or organizational structures. It can be easily extended or migrated if requirements change.
