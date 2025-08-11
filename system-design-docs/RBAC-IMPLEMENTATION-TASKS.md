# RBAC Implementation Alignment Tasks

**Created**: January 2025  
**Purpose**: Track tasks needed to align the implementation with the RBAC specification  
**Status**: Active Task List

## Overview

This document tracks the tasks required to update the current RBAC implementation to match the system design specification. The specification (documented in docs 12-14) is correct; the implementation needs updating.

## Gap Analysis

### Current Implementation (Needs Updating)

**Location**: `apps/admin/src/lib/authorization.ts`

```typescript
// INCORRECT - Too simplified
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  EDITOR: 'editor',
  TRANSLATOR: 'translator',
  REVIEWER: 'reviewer',
  VIEWER: 'viewer'
}
```

**Issues**:
- Missing Review Group Admin role
- Missing Namespace Admin role
- No namespace-scoped roles
- No project/team roles
- Incorrect hierarchy

### Target Implementation (Per Specification)

**Required Roles** (from `system-design-docs/12-rbac-authorization-model.md`):

1. **System Level**:
   - Superadmin

2. **Review Group Level**:
   - Review Group Admin (manages review groups)

3. **Namespace Level**:
   - Namespace Admin (full control over namespace)
   - Namespace Editor (create/edit content)
   - Namespace Translator (translation only)
   - Namespace Reviewer (review/comment only)

4. **Project Level**:
   - Project Lead
   - Project Manager
   - Project Member
   - Project Contributor

## Implementation Tasks

### Task 1: Update Type Definitions and Schemas

**File**: `apps/admin/src/lib/schemas/auth.schema.ts`

**Changes Required**:
```typescript
// Update SystemRoleSchema to only include superadmin
export const SystemRoleSchema = z.enum(['superadmin']).optional();

// Keep ReviewGroupRoleSchema as is (already correct)
export const ReviewGroupRoleSchema = z.object({
  reviewGroupId: z.string(),
  role: z.enum(['admin']), // Review Group Admin
});

// Add NamespaceRoleSchema (currently missing)
export const NamespaceRoleSchema = z.object({
  namespaceId: z.string(),
  role: z.enum(['admin', 'editor', 'translator', 'reviewer']),
  reviewGroup: z.string(), // Which review group this is under
});

// Update TeamRoleSchema to include all project roles
export const TeamRoleSchema = z.object({
  teamId: z.string(),
  role: z.enum(['lead', 'manager', 'member', 'contributor']),
  projectId: z.string(),
  namespaces: z.array(z.string()), // Which namespaces the project can access
});

// Update UserRolesSchema
export const UserRolesSchema = z.object({
  systemRole: SystemRoleSchema,
  reviewGroups: z.array(ReviewGroupRoleSchema).default([]),
  namespaces: z.array(NamespaceRoleSchema).default([]), // Add this
  teams: z.array(TeamRoleSchema).default([]),
  translations: z.array(TranslationAssignmentSchema).default([]),
});
```

### Task 2: Update Authorization Logic

**File**: `apps/admin/src/lib/authorization.ts`

**Changes Required**:

1. Remove the simplified ROLES constant
2. Update `canPerformAction()` to handle hierarchical permissions:
   - Superadmin can do everything
   - Review Group Admin can manage all namespaces in their review group
   - Namespace Admin can manage their specific namespace
   - Namespace-scoped roles have permissions within their namespace
   - Project roles have permissions based on project scope

3. Implement permission inheritance:
```typescript
function getEffectivePermissions(user: AuthContext, resource: ResourceType, namespaceId?: string) {
  // 1. Check system role (superadmin)
  if (user.roles.systemRole === 'superadmin') return ALL_PERMISSIONS;
  
  // 2. Check review group admin for namespace
  if (namespaceId) {
    const namespace = getNamespace(namespaceId);
    const isRGAdmin = user.roles.reviewGroups.some(
      rg => rg.reviewGroupId === namespace.reviewGroup && rg.role === 'admin'
    );
    if (isRGAdmin) return REVIEW_GROUP_ADMIN_PERMISSIONS;
  }
  
  // 3. Check namespace-specific roles
  const nsRole = user.roles.namespaces?.find(ns => ns.namespaceId === namespaceId);
  if (nsRole) {
    return getNamespaceRolePermissions(nsRole.role);
  }
  
  // 4. Check project/team roles
  // ... etc
}
```

### Task 3: Update withAuth Middleware

**File**: `apps/admin/src/lib/middleware/withAuth.ts`

**Changes Required**:

1. Update to extract namespace from request context
2. Pass namespace context to permission checks
3. Handle the new role structure in `getAuthContext()`

### Task 4: Update API Routes

**Files**: All files in `apps/admin/src/app/api/`

**Pattern to Update**:
```typescript
// OLD (incorrect)
const userRole = sessionClaims?.publicMetadata?.role;
const canRead = checkUserPermission(userRole, 'vocabulary', 'read');

// NEW (correct)
const authContext = await getAuthContext();
const namespaceId = params.namespace; // or from request
const canRead = await canPerformAction('vocabulary', 'read', { namespaceId });
```

### Task 5: Create Migration Script

**File**: `scripts/migrate-rbac-roles.ts`

**Purpose**: Migrate existing users from old role structure to new

```typescript
// Pseudo-code for migration
async function migrateUserRoles() {
  const users = await clerk.users.list();
  
  for (const user of users) {
    const oldRole = user.publicMetadata?.role;
    const newMetadata = {
      systemRole: oldRole === 'superadmin' ? 'superadmin' : undefined,
      reviewGroups: [],
      namespaces: mapOldRoleToNamespaceRoles(oldRole),
      teams: [],
      translations: []
    };
    
    await clerk.users.updateUserMetadata(user.id, {
      publicMetadata: newMetadata
    });
  }
}
```

### Task 6: Update Permission Check Hooks

**File**: `apps/admin/src/hooks/usePermissions.ts`

**Changes Required**:
- Update to use new role structure
- Add namespace context to permission checks
- Handle hierarchical permissions

### Task 7: Testing

**Files to Create/Update**:
1. `apps/admin/src/lib/__tests__/authorization.unit.test.ts` - Update existing tests
2. `apps/admin/src/lib/__tests__/rbac-hierarchy.test.ts` - New tests for hierarchy
3. `apps/admin/src/app/api/**/__tests__/*.test.ts` - Update API route tests

**Test Cases**:
- Superadmin can access everything
- Review Group Admin can manage all namespaces in their group
- Namespace Admin can manage only their namespace
- Namespace Editor can edit but not admin
- Project roles respect project boundaries
- Permission inheritance works correctly

## Validation Checklist

- [ ] All role types from specification are implemented
- [ ] Permission hierarchy matches specification
- [ ] Namespace-level authorization works correctly
- [ ] Review Group → Namespace inheritance works
- [ ] Project roles are properly scoped
- [ ] API routes use correct permission checks
- [ ] Migration script handles existing users
- [ ] All tests pass
- [ ] No references to simplified roles remain

## Implementation Order

1. **Phase 1**: Update type definitions (Task 1)
2. **Phase 2**: Update authorization logic (Task 2-3)
3. **Phase 3**: Update API routes (Task 4)
4. **Phase 4**: Create migration script (Task 5)
5. **Phase 5**: Update frontend hooks (Task 6)
6. **Phase 6**: Testing and validation (Task 7)

## Notes

- The specification in `system-design-docs/12-rbac-authorization-model.md` and `13-permission-matrix-detailed.md` is authoritative
- All vocabularies and element sets inherit permissions from their namespace (no vocabulary-specific permissions)
- The withAuth middleware pattern is correct, just needs updated permission logic
- Clerk publicMetadata is the correct storage location for roles