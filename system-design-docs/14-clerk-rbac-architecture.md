# Clerk-Based RBAC Architecture

**Version:** 1.0  
**Date:** January 2025  
**Status:** Proposed Primary Implementation

## Overview

This document outlines the proposed authorization architecture using Clerk.com's organization-based RBAC model as the primary authorization system for the IFLA Standards Platform. Since Cerbos has not been implemented yet, this presents an opportunity to adopt a simpler, more integrated approach that maps IFLA's Review Groups directly to Clerk Organizations.

## Architecture Comparison

### Originally Planned Architecture (Cerbos - Not Implemented)
```yaml
Components:
  - Authentication: Clerk (user identity)
  - Authorization: Cerbos (policy engine)
  - Session Management: NextAuth.js
  - Permission Storage: Supabase
  
Flow:
  1. User authenticates via Clerk
  2. Session includes basic user info
  3. Cerbos evaluates policies for each request
  4. Permissions checked against resource attributes
```

### Proposed Architecture (Clerk Organizations)
```yaml
Components:
  - Authentication: Clerk (user identity)
  - Authorization: Clerk (organization roles)
  - Session Management: Clerk (built-in)
  - Permission Storage: Clerk (metadata)
  
Flow:
  1. User authenticates via Clerk
  2. Session includes organization memberships
  3. Clerk evaluates permissions based on org roles
  4. Application enforces namespace-level access
```

## Mapping IFLA Structure to Clerk Organizations

### Organization Hierarchy

```typescript
// Review Groups as Primary Organizations
interface ClerkOrganizationStructure {
  // Top-level organizations
  organizations: {
    "org_icp": {
      name: "International Cataloguing Principles",
      slug: "icp",
      metadata: {
        type: "review_group",
        namespaces: ["icp", "muldicat"]
      }
    },
    "org_bcm": {
      name: "Bibliographic Conceptual Models",
      slug: "bcm",
      metadata: {
        type: "review_group",
        namespaces: ["frbr", "lrm", "frad"]
      }
    },
    "org_isbd": {
      name: "International Standard Bibliographic Description",
      slug: "isbd",
      metadata: {
        type: "review_group",
        namespaces: ["isbd", "isbdm"]
      }
    },
    "org_puc": {
      name: "Permanent UNIMARC Committee",
      slug: "puc",
      metadata: {
        type: "review_group",
        namespaces: ["unimarc", "mri"]
      }
    }
  }
}
```

### Role Definitions

```typescript
// Custom roles within each organization
interface ClerkRoleDefinitions {
  // Review Group level roles
  review_group_admin: {
    permissions: [
      "namespace:create",
      "namespace:delete",
      "namespace:publish",
      "team:manage",
      "project:create",
      "settings:manage"
    ]
  },
  
  // Namespace-specific roles (using metadata)
  namespace_admin: {
    permissions: [
      "content:manage",
      "vocabulary:publish",
      "team:view",
      "settings:namespace"
    ],
    metadata: {
      namespaces: string[] // Specific namespaces
    }
  },
  
  namespace_editor: {
    permissions: [
      "content:edit",
      "vocabulary:create",
      "vocabulary:update",
      "vocabulary:delete"
    ],
    metadata: {
      namespaces: string[]
    }
  },
  
  namespace_translator: {
    permissions: [
      "content:translate",
      "vocabulary:read"
    ],
    metadata: {
      namespaces: string[],
      languages: string[]
    }
  },
  
  namespace_reviewer: {
    permissions: [
      "content:review",
      "content:comment",
      "vocabulary:read"
    ],
    metadata: {
      namespaces: string[]
    }
  }
}
```

## Implementation Strategy

### Phase 1: Organization Setup

```typescript
// Creating organizations via Clerk API
import { clerkClient } from "@clerk/nextjs/server";

async function setupReviewGroups() {
  const reviewGroups = [
    { name: "ICP", namespaces: ["icp", "muldicat"] },
    { name: "BCM", namespaces: ["frbr", "lrm", "frad"] },
    { name: "ISBD", namespaces: ["isbd", "isbdm"] },
    { name: "PUC", namespaces: ["unimarc", "mri"] }
  ];
  
  for (const rg of reviewGroups) {
    await clerkClient.organizations.create({
      name: rg.name,
      slug: rg.name.toLowerCase(),
      publicMetadata: {
        type: "review_group",
        namespaces: rg.namespaces
      }
    });
  }
}
```

### Phase 2: Role Configuration

```typescript
// Configuring custom roles
async function configureRoles(orgId: string) {
  const roles = [
    {
      name: "review_group_admin",
      key: "rg_admin",
      description: "Full administrative access to review group",
      permissions: ["org:manage", "member:manage"]
    },
    {
      name: "namespace_admin",
      key: "ns_admin",
      description: "Administrative access to specific namespaces",
      permissions: ["content:manage", "publish:manage"]
    },
    // ... other roles
  ];
  
  for (const role of roles) {
    await clerkClient.organizationRoles.create(orgId, role);
  }
}
```

### Phase 3: Permission Checking

```typescript
// Middleware for permission checking
import { auth } from "@clerk/nextjs/server";

export async function checkNamespacePermission(
  action: string,
  namespace: string
) {
  const { orgId, orgRole, orgPermissions, sessionClaims } = auth();
  
  // Check if user has superadmin claim
  if (sessionClaims?.metadata?.superadmin) {
    return true;
  }
  
  // Check organization membership
  const userOrgs = sessionClaims?.organizations || [];
  const relevantOrg = userOrgs.find(org => 
    org.publicMetadata?.namespaces?.includes(namespace)
  );
  
  if (!relevantOrg) return false;
  
  // Check role permissions
  const hasPermission = orgPermissions?.includes(`${action}:${namespace}`) ||
                       orgPermissions?.includes(`${action}:*`);
  
  return hasPermission;
}
```

## Handling Complex Scenarios

### 1. Cross-Organization Access

**Challenge**: Users may need access to namespaces across different Review Groups.

**Solution**: Multi-organization membership
```typescript
// User can be member of multiple organizations
interface UserMemberships {
  user: "user_123",
  memberships: [
    {
      org: "org_bcm",
      role: "namespace_admin",
      metadata: { namespaces: ["lrm"] }
    },
    {
      org: "org_isbd",
      role: "namespace_reviewer",
      metadata: { namespaces: ["isbd"] }
    }
  ]
}
```

### 2. Project-Based Permissions

**Challenge**: Temporary, focused access for external contributors.

**Solution**: Clerk Invitations with metadata
```typescript
// Project-based invitation
async function inviteProjectContributor(
  orgId: string,
  projectId: string,
  email: string,
  namespaces: string[]
) {
  const invitation = await clerkClient.invitations.create({
    organizationId: orgId,
    emailAddress: email,
    role: "project_contributor",
    publicMetadata: {
      projectId,
      namespaces,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    }
  });
  
  // Track in Supabase for project management
  await supabase.from('project_members').insert({
    project_id: projectId,
    invitation_id: invitation.id,
    namespaces,
    expires_at: invitation.publicMetadata.expiresAt
  });
}
```

### 3. Time-Based Permissions

**Challenge**: 24-hour unlock windows for released content.

**Solution**: Session metadata with expiry
```typescript
// Granting temporary elevated permissions
async function grantTemporaryAccess(
  userId: string,
  orgId: string,
  permission: string,
  hours: number = 24
) {
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  
  // Update user's session claims
  await clerkClient.users.update(userId, {
    publicMetadata: {
      temporaryPermissions: {
        [orgId]: {
          [permission]: expiresAt.toISOString()
        }
      }
    }
  });
}

// Check temporary permissions
function hasTemporaryPermission(
  sessionClaims: any,
  orgId: string,
  permission: string
): boolean {
  const temp = sessionClaims?.publicMetadata?.temporaryPermissions?.[orgId]?.[permission];
  if (!temp) return false;
  
  return new Date(temp) > new Date();
}
```

### 4. Namespace-Level Granularity

**Challenge**: Permissions specific to individual namespaces, not just organizations.

**Solution**: Extended metadata and custom claims
```typescript
// Enhanced session with namespace permissions
interface EnhancedSession {
  user: ClerkUser;
  organizations: Array<{
    id: string;
    role: string;
    permissions: string[];
    namespacePermissions: {
      [namespace: string]: {
        role: string;
        permissions: string[];
      }
    }
  }>;
}

// Custom session callback
export function enhanceSession(session: Session): EnhancedSession {
  return {
    ...session,
    organizations: session.organizations.map(org => ({
      ...org,
      namespacePermissions: calculateNamespacePermissions(org, session.user)
    }))
  };
}
```

## Migration Strategy

### Phase 1: Parallel Running (Weeks 1-2)
1. Set up Clerk organizations
2. Mirror Cerbos roles in Clerk
3. Implement permission checking wrapper
4. Run both systems in parallel

### Phase 2: Gradual Migration (Weeks 3-4)
1. Migrate read-only operations first
2. Move write operations by namespace
3. Maintain Cerbos as fallback
4. Monitor and compare decisions

### Phase 3: Cutover (Week 5)
1. Disable Cerbos for migrated features
2. Full Clerk authorization active
3. Keep Cerbos policies archived
4. Performance optimization

### Phase 4: Cleanup (Week 6)
1. Remove Cerbos dependencies
2. Simplify middleware
3. Update documentation
4. Training for administrators

## Benefits of Clerk-Based RBAC

### 1. Simplified Architecture
- Single service for auth and authorization
- Reduced complexity in session management
- Native organization support

### 2. Better User Experience
- Unified user profile and permissions
- Built-in invitation system
- Organization switching UI

### 3. Reduced Maintenance
- No separate policy engine to maintain
- Clerk handles updates and security
- Integrated admin dashboard

### 4. Cost Optimization
- Single vendor for auth services
- No Cerbos hosting costs
- Simplified monitoring

## Challenges and Mitigations

### Challenge 1: Complex Policy Logic
**Issue**: Cerbos allows complex conditional policies.
**Mitigation**: Implement business logic in application layer with Clerk providing base permissions.

### Challenge 2: Cross-Namespace Dependencies
**Issue**: Some operations span multiple namespaces.
**Mitigation**: Use organization-level permissions with namespace filtering in application.

### Challenge 3: Migration Complexity
**Issue**: Existing users and permissions need migration.
**Mitigation**: Automated migration scripts with validation and rollback capability.

### Challenge 4: Performance at Scale
**Issue**: Multiple organization checks might impact performance.
**Mitigation**: Cache organization memberships in session, use Clerk's edge network.

## Implementation Code Examples

### API Route Protection
```typescript
// app/api/namespaces/[nsId]/route.ts
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function PUT(
  req: Request,
  { params }: { params: { nsId: string } }
) {
  const { userId, sessionClaims } = auth();
  
  // Check superadmin
  if (sessionClaims?.publicMetadata?.role === "superadmin") {
    return handleUpdate(params.nsId, await req.json());
  }
  
  // Check organization permissions
  const hasPermission = await checkOrgPermission(
    userId,
    params.nsId,
    "namespace:update"
  );
  
  if (!hasPermission) {
    return new Response("Forbidden", { status: 403 });
  }
  
  return handleUpdate(params.nsId, await req.json());
}
```

### React Hook for Permissions
```typescript
// hooks/useNamespacePermissions.ts
import { useAuth, useOrganization } from "@clerk/nextjs";

export function useNamespacePermissions(namespace: string) {
  const { isSignedIn, sessionClaims } = useAuth();
  const { organization } = useOrganization();
  
  const permissions = useMemo(() => {
    if (!isSignedIn) return { canRead: false, canEdit: false, canPublish: false };
    
    // Superadmin has all permissions
    if (sessionClaims?.publicMetadata?.role === "superadmin") {
      return { canRead: true, canEdit: true, canPublish: true };
    }
    
    // Check organization namespace access
    const orgNamespaces = organization?.publicMetadata?.namespaces || [];
    if (!orgNamespaces.includes(namespace)) {
      return { canRead: false, canEdit: false, canPublish: false };
    }
    
    // Map role to permissions
    const role = sessionClaims?.orgRole;
    return {
      canRead: true, // All org members can read
      canEdit: ["rg_admin", "ns_admin", "ns_editor"].includes(role),
      canPublish: ["rg_admin", "ns_admin"].includes(role)
    };
  }, [isSignedIn, sessionClaims, organization, namespace]);
  
  return permissions;
}
```

## Recommendation

The Clerk-based RBAC architecture offers significant advantages in terms of simplicity, maintenance, and user experience. While it requires careful handling of complex scenarios like cross-namespace permissions and time-based access, these can be effectively managed through Clerk's metadata system and application-layer logic.

**Recommended approach**: Proceed with a phased migration, starting with a proof-of-concept for one Review Group to validate the architecture before full rollout.

## Next Steps

1. Create proof-of-concept with one Review Group
2. Develop migration scripts for users and permissions
3. Build permission checking middleware
4. Create admin UI for organization management
5. Document new permission model for users
6. Plan training for Review Group administrators