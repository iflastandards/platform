# RBAC Implementation Guide

**Version:** 2.0  
**Date:** January 2025  
**Purpose:** Developer guide for the actual RBAC implementation in the IFLA Standards Platform

## Overview

This guide provides practical implementation details for developers working with the IFLA Standards Platform's custom Role-Based Access Control (RBAC) system. The platform uses Clerk for authentication with a custom RBAC implementation storing roles in `publicMetadata`.

## Quick Reference

- **Authorization**: Custom RBAC via Clerk publicMetadata
- **Authentication**: Clerk with built-in session management
- **Permission Storage**: Clerk user publicMetadata
- **Frontend Framework**: Next.js with React
- **API Layer**: Standard Next.js App Router API routes (NOT tRPC)

> **Note**: The platform uses a custom RBAC system, NOT Clerk Organizations or Cerbos. This simplifies the architecture while meeting all requirements.

## Custom RBAC Implementation

### Role Definitions

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

// User metadata structure in Clerk
interface UserPublicMetadata {
  role: keyof typeof ROLES;
  namespacePermissions?: {
    [namespace: string]: {
      role: string;
      permissions: string[];
    }
  };
}
      effect: EFFECT_ALLOW
      roles:
        - namespace_admin
      condition:
        match:
          expr: request.principal.attr.namespaces.contains(request.resource.id)
    
    - actions: ["*"]
      effect: EFFECT_ALLOW
      roles:
        - review_group_admin
      condition:
        match:
          expr: request.resource.attr.reviewGroup in request.principal.attr.reviewGroups
    
    - actions: ["*"]
      effect: EFFECT_ALLOW
      roles:
        - superadmin
```

### Project-Based Permissions

```yaml
# policies/project_policy.yaml
apiVersion: api.cerbos.dev/v1
resourcePolicy:
  version: "default"
  resource: "project"
  rules:
    - actions: ["view"]
      effect: EFFECT_ALLOW
      roles:
        - project_contributor
        - project_member
        - project_manager
        - project_lead
      condition:
        match:
          expr: request.resource.id in request.principal.attr.projects
    
    - actions: ["contribute"]
      effect: EFFECT_ALLOW
      roles:
        - project_member
        - project_manager
        - project_lead
      condition:
        match:
          expr: |
            request.resource.id in request.principal.attr.projects &&
            request.resource.attr.namespaces.intersects(request.principal.attr.projectNamespaces[request.resource.id])
    
    - actions: ["manage"]
```

### Permission Matrix

| Role | Vocabularies | Namespaces | Users | Settings |
|------|-------------|------------|-------|----------|
| SUPERADMIN | Full | Full | Full | Full |
| ADMIN | Full | Manage | Manage | Edit |
| EDITOR | Create/Edit | View | View | View |
| TRANSLATOR | Translate | View | - | - |
| REVIEWER | Comment | View | - | - |
| VIEWER | Read | View | - | - |

### Namespace-Specific Permissions

```typescript
// Example: User with editor role in specific namespace
interface NamespacePermissions {
  'isbd': {
    role: 'editor',
    permissions: ['vocabulary:create', 'vocabulary:edit', 'vocabulary:delete']
  },
  'unimarc': {
    role: 'reviewer',
    permissions: ['vocabulary:read', 'vocabulary:comment']
  }
}
```

### Time-Based Permissions

```yaml
# policies/time_based_policy.yaml
apiVersion: api.cerbos.dev/v1
resourcePolicy:
  version: "default"
  resource: "namespace"
  rules:
    - actions: ["unlock_released"]
      effect: EFFECT_ALLOW
      roles:
        - review_group_admin
      condition:
        match:
          all:
            of:
              - expr: request.resource.attr.reviewGroup in request.principal.attr.reviewGroups
              - expr: request.principal.attr.unlockExpiry > now()
    
    - actions: ["emergency_access"]
      effect: EFFECT_ALLOW
      roles:
        - superadmin
      condition:
        match:
          all:
            of:
              - expr: request.principal.attr.emergencyAccess == true
              - expr: request.principal.attr.emergencyExpiry > now()
```

## API Implementation

### Authorization Implementation

```typescript
// apps/admin/src/lib/authorization.ts
import { auth } from "@clerk/nextjs/server";

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

// Example usage in API route
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
    'namespace',
    'read',
    params.namespace
  );
  
  if (!canRead) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  
  // Proceed with request...
}
```

### Permission Aggregation Endpoint

```typescript
// app/api/admin/users/me/permissions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserPermissions } from '@/lib/permissions'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const permissions = await getUserPermissions(session.user.id)
  
  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      globalRole: session.user.globalRole || 'none'
    },
    permissions: {
      system: permissions.system || [],
      reviewGroups: permissions.reviewGroups || {},
      namespaces: permissions.namespaces || {},
      projects: permissions.projects || {}
    },
    effectivePermissions: permissions.effective || {}
  })
}

// lib/permissions.ts
export async function getUserPermissions(userId: string) {
  // Fetch from database
  const userRoles = await db.userRoles.findMany({
    where: { userId },
    include: {
      reviewGroup: true,
      namespace: true,
      project: true
    }
  })
  
  // Aggregate permissions
  const permissions = {
    system: [],
    reviewGroups: {},
    namespaces: {},
    projects: {},
    effective: {}
  }
  
  for (const role of userRoles) {
    if (role.globalRole === 'superadmin') {
      permissions.system = ['system.*']
    }
    
    if (role.reviewGroup) {
      permissions.reviewGroups[role.reviewGroup.id] = {
        role: role.role,
        permissions: getReviewGroupPermissions(role.role)
      }
    }
    
    if (role.namespace) {
      permissions.namespaces[role.namespace.id] = {
        role: role.role,
        permissions: getNamespacePermissions(role.role)
      }
    }
    
    if (role.project) {
      permissions.projects[role.project.id] = {
        role: role.role,
        permissions: getProjectPermissions(role.role),
        namespaceAccess: role.project.namespaces
      }
    }
  }
  
  // Calculate effective permissions
  permissions.effective = calculateEffectivePermissions(permissions)
  
  return permissions
}
```

## Frontend Implementation

### Permission Hook

```typescript
// hooks/usePermissions.ts
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

export function usePermissions() {
  const { data: session } = useSession()
  
  const { data: permissions, isLoading } = useQuery({
    queryKey: ['permissions', session?.user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/users/me/permissions')
      if (!res.ok) throw new Error('Failed to fetch permissions')
      return res.json()
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
  
  const can = useCallback((action: string, resource?: string, resourceId?: string) => {
    if (!permissions) return false
    
    // Check system permissions
    if (permissions.permissions.system.includes('system.*')) return true
    if (permissions.permissions.system.includes(`${resource}.${action}`)) return true
    
    // Check resource-specific permissions
    if (resource && resourceId) {
      const resourcePerms = permissions.permissions[resource + 's']?.[resourceId]
      if (resourcePerms?.permissions.includes(action)) return true
      if (resourcePerms?.permissions.includes(`${resource}.${action}`)) return true
    }
    
    // Check effective permissions
    if (resourceId && permissions.effectivePermissions[resourceId]) {
      return permissions.effectivePermissions[resourceId].includes(`${resource}.${action}`)
    }
    
    return false
  }, [permissions])
  
  return {
    permissions,
    isLoading,
    can,
    user: session?.user
  }
}
```

### Tab Visibility Control

```typescript
// components/NamespaceDetail/TabNavigation.tsx
import { Tabs, Tab } from '@mui/material'
import { usePermissions } from '@/hooks/usePermissions'

interface TabConfig {
  label: string
  value: string
  permission: string
  component: React.ComponentType
}

const tabs: TabConfig[] = [
  { label: 'Overview', value: 'overview', permission: 'ns.read', component: OverviewTab },
  { label: 'Content', value: 'content', permission: 'content.edit', component: ContentTab },
  { label: 'Versions', value: 'versions', permission: 'ns.publish', component: VersionsTab },
  { label: 'Team', value: 'team', permission: 'ns.team', component: TeamTab },
  { label: 'Settings', value: 'settings', permission: 'ns.config', component: SettingsTab },
]

export function TabNavigation({ namespaceId }: { namespaceId: string }) {
  const { can } = usePermissions()
  const [activeTab, setActiveTab] = useState('overview')
  
  // Filter tabs based on permissions
  const visibleTabs = tabs.filter(tab => 
    can(tab.permission.split('.')[1], 'namespace', namespaceId)
  )
  
  const ActiveComponent = visibleTabs.find(t => t.value === activeTab)?.component || OverviewTab
  
  return (
    <>
      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
        {visibleTabs.map(tab => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
      <ActiveComponent namespaceId={namespaceId} />
    </>
  )
}
```

### Action Button Visibility

```typescript
// components/DataTable/ActionMenu.tsx
import { IconButton, Menu, MenuItem } from '@mui/material'
import { MoreVert } from '@mui/icons-material'
import { usePermissions } from '@/hooks/usePermissions'

interface Action {
  label: string
  onClick: () => void
  permission: string
  resource: string
}

export function ActionMenu({ 
  actions, 
  resourceId 
}: { 
  actions: Action[]
  resourceId: string 
}) {
  const { can } = usePermissions()
  const [anchorEl, setAnchorEl] = useState(null)
  
  const visibleActions = actions.filter(action =>
    can(action.permission, action.resource, resourceId)
  )
  
  if (visibleActions.length === 0) return null
  
  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {visibleActions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              action.onClick()
              setAnchorEl(null)
            }}
          >
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
```

## Database Schema

### Supabase Tables with RLS

```sql
-- User roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  review_group_id TEXT,
  namespace_id TEXT,
  project_id TEXT,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, role, review_group_id, namespace_id, project_id)
);

-- RLS policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own roles
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT USING (auth.uid()::text = user_id);

-- Admins can manage roles within their scope
CREATE POLICY "Admins can manage roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()::text
      AND (
        ur.role = 'superadmin' OR
        (ur.role = 'review_group_admin' AND ur.review_group_id = user_roles.review_group_id) OR
        (ur.role = 'namespace_admin' AND ur.namespace_id = user_roles.namespace_id) OR
        (ur.role = 'project_lead' AND ur.project_id = user_roles.project_id)
      )
    )
  );

-- Delegations table
CREATE TABLE delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_id TEXT NOT NULL,
  delegatee_id TEXT NOT NULL,
  permissions TEXT[] NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  revoked_by TEXT,
  CHECK (expires_at > created_at)
);

-- Emergency access log
CREATE TABLE emergency_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER NOT NULL,
  approved_by TEXT NOT NULL
);
```

## Testing RBAC

### Unit Tests

```typescript
// __tests__/permissions.test.ts
import { describe, it, expect } from 'vitest'
import { checkPermission } from '@/lib/permissions'

describe('Permission Checks', () => {
  it('should allow namespace admin to publish', async () => {
    const user = {
      id: 'user1',
      roles: ['namespace_admin'],
      namespaces: ['ns_isbd']
    }
    
    const result = await checkPermission(
      user,
      'namespace',
      'publish',
      { id: 'ns_isbd' }
    )
    
    expect(result).toBe(true)
  })
  
  it('should deny editor from publishing', async () => {
    const user = {
      id: 'user2',
      roles: ['namespace_editor'],
      namespaces: ['ns_isbd']
    }
    
    const result = await checkPermission(
      user,
      'namespace',
      'publish',
      { id: 'ns_isbd' }
    )
    
    expect(result).toBe(false)
  })
  
  it('should respect time-based permissions', async () => {
    const user = {
      id: 'user3',
      roles: ['review_group_admin'],
      reviewGroups: ['rg_isbd'],
      unlockExpiry: new Date(Date.now() + 3600000) // 1 hour from now
    }
    
    const result = await checkPermission(
      user,
      'namespace',
      'unlock_released',
      { id: 'ns_isbd', reviewGroup: 'rg_isbd' }
    )
    
    expect(result).toBe(true)
  })
})
```

### Integration Tests

```typescript
// __tests__/api/permissions.test.ts
import { describe, it, expect } from 'vitest'
import { createMockRequest } from '@/test/utils'

describe('Permission API', () => {
  it('should return user permissions', async () => {
    const req = createMockRequest({
      user: { id: 'user1', email: 'test@example.com' }
    })
    
    const response = await GET(req)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('permissions')
    expect(data.permissions).toHaveProperty('namespaces')
  })
  
  it('should enforce namespace access', async () => {
    const req = createMockRequest({
      user: { id: 'user1', roles: ['namespace_editor'], namespaces: ['ns_isbd'] }
    })
    
    // Try to access unauthorized namespace
    const response = await GET(req, { params: { nsId: 'ns_unimarc' } })
    
    expect(response.status).toBe(403)
  })
})
```

## Security Best Practices

### 1. Permission Caching

```typescript
// lib/cache/permissions.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
})

const CACHE_TTL = 5 * 60 // 5 minutes

export async function getCachedPermissions(userId: string) {
  const cached = await redis.get(`permissions:${userId}`)
  if (cached) return cached
  
  const permissions = await getUserPermissions(userId)
  await redis.setex(`permissions:${userId}`, CACHE_TTL, permissions)
  
  return permissions
}

export async function invalidatePermissionCache(userId: string) {
  await redis.del(`permissions:${userId}`)
}
```

### 2. Audit Logging

```typescript
// lib/audit.ts
export async function logPermissionCheck(
  userId: string,
  resource: string,
  action: string,
  allowed: boolean,
  context?: Record<string, any>
) {
  await db.auditLog.create({
    data: {
      userId,
      eventType: 'permission_check',
      resource,
      action,
      allowed,
      context,
      timestamp: new Date()
    }
  })
  
  // Alert on suspicious patterns
  if (!allowed) {
    const recentFailures = await db.auditLog.count({
      where: {
        userId,
        allowed: false,
        timestamp: { gte: new Date(Date.now() - 5 * 60 * 1000) }
      }
    })
    
    if (recentFailures > 10) {
      await alertSecurityTeam(userId, 'Excessive permission failures')
    }
  }
}
```

### 3. Emergency Access

```typescript
// lib/emergency-access.ts
export async function grantEmergencyAccess(
  userId: string,
  approvedBy: string,
  reason: string,
  durationMinutes: number = 60
) {
  // Require additional authentication
  const verified = await verifyEmergencyAuth(approvedBy)
  if (!verified) throw new Error('Emergency authentication failed')
  
  // Log the access grant
  await db.emergencyAccessLog.create({
    data: {
      userId,
      approvedBy,
      reason,
      durationMinutes,
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + durationMinutes * 60 * 1000)
    }
  })
  
  // Update user session
  await updateUserSession(userId, {
    emergencyAccess: true,
    emergencyExpiry: new Date(Date.now() + durationMinutes * 60 * 1000)
  })
  
  // Alert all admins
  await notifyAdmins(`Emergency access granted to ${userId} by ${approvedBy}`)
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied Despite Role Assignment**
   - Check if user session has latest roles
   - Verify resource attributes match policy conditions
   - Check for time-based expiration
   - Review audit logs for denied attempts

2. **Cerbos Connection Errors**
   - Verify Cerbos server is running
   - Check network connectivity
   - Review Cerbos logs for policy errors
   - Test with Cerbos playground

3. **Cache Inconsistency**
   - Clear permission cache after role changes
   - Implement cache invalidation on role updates
   - Monitor cache hit rates
   - Set appropriate TTL values

### Debug Mode

```typescript
// Enable detailed permission logging
if (process.env.NODE_ENV === 'development') {
  console.log('Permission check:', {
    user: principal,
    resource: resourceObj,
    action,
    result: decision.isAllowed(action),
    trace: decision.getTrace()
  })
}
```

This implementation guide provides the foundation for RBAC in the IFLA Standards Platform. Always refer to the authoritative [RBAC Authorization Model](../system-design-docs/12-rbac-authorization-model.md) and [Permission Matrix](../system-design-docs/13-permission-matrix-detailed.md) for complete specifications.

## Current Implementation: Custom RBAC with Clerk

The platform uses a custom RBAC system with roles stored in Clerk's `publicMetadata`. This approach is simpler than Clerk Organizations or external policy engines.

### Implementation Overview

```typescript
// Using custom RBAC with Clerk authentication
import { auth } from "@clerk/nextjs/server";
import { checkUserPermission } from "@/lib/authorization";

export async function checkPermission(
  resource: string,
  action: string,
  namespace?: string
) {
  const { userId, sessionClaims } = auth();
  
  if (!userId) return false;
  
  const userRole = sessionClaims?.publicMetadata?.role;
  const namespacePerms = sessionClaims?.publicMetadata?.namespacePermissions;
  
  return checkUserPermission(
    userRole,
    resource,
    action,
    namespace,
    namespacePerms
  );
}
```

### User Metadata Structure

```typescript
// Review Groups as Clerk Organizations
const organizations = {
  icp: {
    name: "International Cataloguing Principles",
    roles: ["admin", "editor", "translator", "reviewer"],
    namespaces: ["icp", "muldicat"]
  },
  bcm: {
    name: "Bibliographic Conceptual Models",
    roles: ["admin", "editor", "translator", "reviewer"],
    namespaces: ["frbr", "lrm", "frad"]
  },
  // ... other review groups
};
```

### Clerk Permission Hook

```typescript
// React hook for Clerk permissions
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

### Migration Path

For detailed information on the current RBAC implementation, see:
- [RBAC Implementation](../system-design-docs/14-rbac-implementation.md)

The Clerk approach offers simplified management and better integration with the authentication layer, while maintaining the same permission model and user experience.