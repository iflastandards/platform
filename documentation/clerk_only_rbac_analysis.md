# Transitioning from Cerbos to Clerk-Only RBAC Analysis

## Executive Summary

This document analyzes the feasibility and implications of eliminating Cerbos and using Clerk.com's organization RBAC capabilities as the sole authorization solution for the IFLA Standards Platform.

## Current State Assessment

### Cerbos Implementation Complexity
Based on the current codebase analysis:

- **28 Cerbos policy files** defining granular permissions
- **Complex policy derivation logic** for roles and resources
- **Custom Cerbos integration layer** with extensive TypeScript wrappers
- **Audit logging infrastructure** built around Cerbos decisions
- **Testing framework** specifically designed for Cerbos policy validation

### Clerk's Organization RBAC Capabilities

Clerk offers robust organization-level RBAC features:

- **Organizations**: Multi-tenant structure supporting different review groups
- **Roles**: Built-in role management with custom permissions
- **Permissions**: Granular permission assignment to roles
- **Metadata**: Rich user metadata for storing additional authorization context
- **UI Components**: Pre-built organization management interfaces
- **API**: Complete programmatic control over roles and permissions

## Proposed Clerk-Only Architecture

### Organization Structure
```
IFLA Organization
├── Review Groups (Sub-organizations or metadata)
│   ├── ISBD
│   ├── BCM  
│   ├── ICP
│   └── PUC
└── Cross-cutting roles (system-admin, ifla-admin)
```

### Role Mapping
| Current Complex Role | Clerk Equivalent | Scope |
|---------------------|------------------|-------|
| `system-admin` | `org:admin` | Organization-wide |
| `ifla-admin` | `org:admin` with metadata | Organization-wide |
| `{rg}-admin` | Custom role with RG metadata | Review Group |
| `{site}-admin` | Custom role with site metadata | Site-specific |
| `{rg}-editor` | `editor` role with RG metadata | Review Group |
| `{site}-editor` | `editor` role with site metadata | Site-specific |
| `translator` | `translator` role with language metadata | Scoped by metadata |

### Permission Structure
```typescript
// Clerk Custom Permissions
const permissions = [
  // System permissions
  'system:admin',
  'system:user_management',
  
  // Review Group permissions  
  'reviewgroup:create',
  'reviewgroup:manage',
  'reviewgroup:read',
  
  // Content permissions
  'content:create',
  'content:edit', 
  'content:review',
  'content:translate',
  'content:publish',
  
  // Site permissions
  'site:create',
  'site:manage',
  'site:configure',
  
  // Project permissions
  'project:create',
  'project:manage',
  'project:participate'
];
```

## Implementation Plan

### Phase 1: Clerk Organization Setup
1. **Configure Clerk Organizations**
   - Set up IFLA as primary organization
   - Define custom roles and permissions
   - Configure metadata schema for scoping

2. **Migrate User Data**
   - Transfer existing user assignments to Clerk roles
   - Preserve existing review group and site associations via metadata
   - Update user invitation flows

### Phase 2: Authorization Logic Simplification  
1. **Replace Cerbos Checks**
   ```typescript
   // Before (Cerbos)
   const decision = await cerbos.checkResource({
     principal, resource, actions
   });
   
   // After (Clerk)
   const hasPermission = await clerkClient.users.hasPermission(
     userId, 
     'content:edit',
     { reviewGroup: 'ISBD', site: 'isbdm' }
   );
   ```

2. **Simplify Authorization Utilities**
   - Remove complex Cerbos integration layer
   - Implement direct Clerk API calls
   - Use Clerk's built-in permission checking

### Phase 3: UI Integration
1. **Use Clerk's Built-in Components**
   - `<OrganizationProfile />` for role management
   - `<OrganizationMemberProfile />` for member administration
   - Custom permission-based UI rendering

2. **Simplified Permission Guards**
   ```typescript
   // Simplified permission checking
   function canEditContent(user: ClerkUser, context: ContentContext) {
     return user.hasPermission('content:edit') && 
            user.metadata.reviewGroups?.includes(context.reviewGroup);
   }
   ```

## Benefits of Clerk-Only Approach

### 1. **Reduced Complexity**
- **Eliminate entire Cerbos infrastructure** (policies, PDP, integration layer)
- **Single source of truth** for authentication and authorization
- **Simplified deployment** - no additional services to manage

### 2. **Better Developer Experience** 
- **Native TypeScript integration** with Clerk SDK
- **Real-time permission updates** without policy deployment
- **Built-in admin UI** for role management

### 3. **Operational Simplicity**
- **No Cerbos Hub management** or policy versioning complexity
- **Integrated audit logging** through Clerk's activity logs
- **Single vendor relationship** and support channel

### 4. **Cost Optimization**
- **Eliminate Cerbos licensing** costs
- **Reduced infrastructure** overhead
- **Simplified monitoring** and observability

## Potential Concerns & Mitigations

### 1. **Fine-Grained Permissions**
**Concern**: Clerk may not support the same level of granular, context-aware permissions as Cerbos.

**Mitigation**: 
- Use Clerk's custom permissions with rich metadata
- Implement application-level context checking for complex scenarios
- Most RBAC needs are actually simpler than initially architected

### 2. **Audit Requirements**
**Concern**: Loss of detailed audit trails from Cerbos policy decisions.

**Mitigation**:
- Clerk provides comprehensive activity logging
- Supplement with application-level audit logging for business-critical actions
- Export Clerk logs to external audit systems if needed

### 3. **Policy as Code**
**Concern**: Loss of GitOps-style policy management.

**Mitigation**:
- Use Clerk's Management API to define roles/permissions programmatically
- Version control permission definitions in application code
- Implement infrastructure-as-code approach for Clerk configuration

### 4. **Vendor Lock-in**
**Concern**: Increased dependency on Clerk's authorization model.

**Mitigation**:
- Clerk's API is standard and well-documented
- Authorization logic remains in application layer
- Migration path exists if needed in future

## Migration Strategy

### Step 1: Parallel Implementation (2 weeks)
- Implement Clerk-based authorization alongside existing Cerbos
- Create feature flag to switch between implementations
- Test both systems in development

### Step 2: Gradual Rollout (1 week)
- Start with low-risk features (read-only operations)
- Gradually migrate write operations
- Monitor system behavior and performance

### Step 3: Cerbos Removal (1 week)
- Remove Cerbos policies and infrastructure
- Clean up authorization utilities
- Update documentation and tests

## Code Changes Required

### Remove Files
```
cerbos/                           # Entire directory
apps/admin/src/lib/cerbos.ts     # Cerbos client
scripts/test-admin-roles.js      # Cerbos testing
fixtures/test-scenarios.yaml     # Cerbos test cases
```

### Modify Files
```typescript
// apps/admin/src/lib/authorization.ts
// Simplified to use only Clerk APIs

export async function canPerformAction<T extends ResourceType>(
  resourceType: T,
  action: Action<T>,
  resourceAttributes?: Record<string, any>
): Promise<boolean> {
  const { userId } = auth();
  if (!userId) return false;

  const user = await clerkClient.users.getUser(userId);
  
  // Direct permission check with context
  return user.hasPermission(`${resourceType}:${action}`, {
    reviewGroup: resourceAttributes?.reviewGroup,
    site: resourceAttributes?.site
  });
}
```

## Decision Recommendation

**RECOMMEND PROCEEDING** with Clerk-only RBAC implementation for the following reasons:

1. **Complexity Reduction**: The current Cerbos implementation appears over-engineered for the actual authorization needs
2. **Operational Simplicity**: Managing one system instead of two reduces maintenance overhead
3. **Developer Productivity**: Clerk's native integration will be faster to work with
4. **Feature Parity**: Clerk's organization RBAC can handle the identified use cases
5. **Future Flexibility**: Easier to iterate on authorization logic without policy deployments

The fine-grained auditable approach of Cerbos, while powerful, may be unnecessarily complex for the IFLA Standards Platform's actual needs. The Clerk-only approach provides a more pragmatic balance of functionality and simplicity.

## Next Steps

1. **Create proof-of-concept** implementation using Clerk organizations
2. **Test with existing user scenarios** to validate feature parity  
3. **Measure performance impact** of the simplified approach
4. **Plan migration timeline** based on findings
5. **Update architecture documentation** to reflect new approach

