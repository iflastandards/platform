# Clerk Migration Cleanup Guide

This guide documents the actual implementation using Clerk with custom RBAC (NOT Clerk Organizations or Cerbos).

## Migration Status

### ✅ Completed
1. **Created Clerk organization setup script** - `/scripts/setup-clerk-organizations.ts`
2. **Updated auth.ts** - Proper metadata structure with backward compatibility
3. **Updated authorization.ts** - Custom RBAC implementation using publicMetadata
4. **Updated API routes** - Proper authorization checks in `/api/admin/users` and `/api/admin/roles`

### 🚧 In Progress
1. **Clerk Organizations Setup** - Run the setup script to create organizations
2. **Dead Code Cleanup** - Removed tRPC packages, updated documentation

### 📋 TODO
1. Update remaining API routes
2. Update test utilities
3. Remove documentation references to old auth systems

## New Authorization Structure

### User Metadata Schema
```typescript
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
```

### Permission Hierarchy
1. **Superadmin** - Full system access
2. **Review Group Admin** - Manage review group, projects, teams, namespaces
3. **Namespace Editor** - Create/edit/delete content within namespaces
4. **Namespace Author** - Create/edit content (no delete)
5. **Translator** - Translate content in assigned namespaces
6. **Reviewer** - Read and comment on content

## Setup Instructions

### 1. Run Organization Setup
```bash
# Ensure CLERK_SECRET_KEY is in .env.local
pnpm tsx scripts/setup-clerk-organizations.ts
```

### 2. Assign Users to Organizations
Use Clerk Dashboard or API to:
1. Add users to appropriate organizations
2. Set user metadata according to the schema above

### 3. Test Authorization
```bash
# Test API endpoints
curl -X GET http://localhost:3000/admin/api/admin/users \
  -H "Authorization: Bearer <clerk-token>"

curl -X GET http://localhost:3000/admin/api/admin/roles \
  -H "Authorization: Bearer <clerk-token>"
```

## Files to Clean Up

### High Priority (Contains Active Code)
- [ ] `/apps/admin/src/app/api/admin/namespace/[namespace]/pending-spreadsheets/route.ts`
- [ ] `/apps/admin/src/app/lib/role-based-routing.ts`
- [ ] `/apps/admin/src/lib/config.ts`

### Medium Priority (Documentation/Tests)
- [ ] Update system design docs to reflect Clerk-only approach
- [ ] Remove Cerbos references from README files
- [ ] Update test mocks to use Clerk structure

### Low Priority (Archived/Reference)
- [ ] Clean up deprecated test files
- [ ] Remove NextAuth configuration examples
- [ ] Archive Cerbos policy files

## Code Patterns to Replace

### Old Pattern (NextAuth/Cerbos)
```typescript
// Check with simple roles array
const userRoles = (user.publicMetadata?.roles as string[]) || [];
const hasAccess = userRoles.includes('admin');
```

### New Pattern (Clerk with RBAC)
```typescript
// Use authorization module
import { canPerformAction } from '@/lib/authorization';

const canEdit = await canPerformAction('namespace', 'update', {
  namespaceId: 'isbd',
  reviewGroupId: 'isbd-rg'
});
```

## Testing the New System

### 1. Unit Tests
Update test utilities to mock Clerk properly:
```typescript
// Mock Clerk user with proper metadata
const mockUser = {
  id: 'user-1',
  publicMetadata: {
    systemRole: 'superadmin',
    reviewGroups: [{ reviewGroupId: 'icp', role: 'admin' }],
    teams: [],
    translations: []
  }
};
```

### 2. Integration Tests
Test authorization flows:
- User login and metadata retrieval
- Permission checks for various resources
- Role assignment workflows

### 3. E2E Tests
Verify complete user journeys:
- Review Group Admin managing namespaces
- Editor creating/updating content
- Translator accessing translation interface

## Rollback Plan

If issues arise:
1. The old code patterns still work due to backward compatibility
2. The `extractLegacyRoles` function maintains the old roles array
3. API routes can temporarily bypass new checks by checking legacy roles

## Next Steps

1. **Immediate**: Run organization setup script
2. **This Week**: Migrate remaining API routes
3. **Next Week**: Update all documentation
4. **Future**: Remove backward compatibility after full migration