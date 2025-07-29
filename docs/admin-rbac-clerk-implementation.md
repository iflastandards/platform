# IFLA Standards Platform RBAC Implementation with Clerk Organizations

**Version:** 1.0  
**Date:** January 2025  
**Status:** Recommended Implementation  
**Purpose:** Implementation guide for Clerk Organizations-based RBAC

## Executive Summary

This document provides the implementation strategy for the IFLA Standards Platform's Role-Based Access Control (RBAC) system using Clerk Organizations instead of Cerbos. Since Cerbos has not been implemented yet, this represents the recommended path forward for a simpler, more maintainable authorization architecture.

## Architecture Decision

### Why Clerk Organizations Over Cerbos

**Current State**:
- Cerbos policies exist as specifications only
- No actual Cerbos server deployment
- Basic role checking implemented with simple logic
- Perfect opportunity to choose the right architecture

**Clerk Organizations Benefits**:
- **Single Source of Truth**: Authentication and authorization in one system
- **Natural Mapping**: Review Groups → Clerk Organizations
- **Reduced Complexity**: No separate authorization service
- **Better Performance**: Permissions cached in JWT tokens
- **Operational Simplicity**: One less service to deploy and maintain
- **Built-in Admin UI**: Organization and permission management included

## Architecture Overview

### Organization Structure

```typescript
// Review Group = Clerk Organization
interface ClerkOrganization {
  id: string;                    // "org_2abc123"
  name: string;                  // "ISBD Review Group"
  slug: string;                  // "isbd"
  publicMetadata: {
    namespaces: string[];        // ["isbd", "isbdm"]
    reviewGroupType: string;     // "standards-development"
    description: string;         // "International Standard Bibliographic Description"
  };
}

// Organization Membership = Review Group Membership
interface OrganizationMembership {
  userId: string;
  organizationId: string;
  role: 'admin' | 'basic_member';  // Clerk's built-in roles
  publicMetadata: {
    permissions: string[];         // Custom granular permissions
  };
}
```

### Permission Schema

```typescript
// Permission naming convention: {resource}:{action}:{scope}
export const PERMISSION_PATTERNS = {
  // Namespace-level permissions
  namespace: [
    'namespace:admin:{namespace}',     // Full namespace control
    'namespace:editor:{namespace}',    // Content editing
    'namespace:reviewer:{namespace}',  // Review and comment
    'namespace:translator:{namespace}:{language}' // Translation
  ],
  
  // Project-level permissions
  project: [
    'project:lead:{projectId}',        // Project leadership
    'project:editor:{projectId}',      // Project content editing
    'project:reviewer:{projectId}',    // Project review
    'project:translator:{projectId}:{language}' // Project translation
  ],
  
  // Site management permissions
  site: [
    'site:config:{namespace}',         // Site configuration
    'site:content:{namespace}',        // Content management
    'site:vocabulary:{namespace}',     // Vocabulary management
    'site:import_export:{namespace}',  // Import/export operations
    'site:translation:{namespace}',    // Translation management
    'site:publishing:{namespace}',     // Publishing & deployment
    'site:analytics:{namespace}',      // Analytics & monitoring
    'site:team:{namespace}'            // Team & collaboration
  ]
};
```

## Implementation Plan

### Phase 1: Organization Setup (Week 1)

#### 1.1 Create Clerk Organizations

```typescript
// scripts/setup-clerk-organizations.ts
import { clerkClient } from '@clerk/nextjs/server';

const REVIEW_GROUPS = [
  {
    name: 'International Cataloguing Principles',
    slug: 'icp',
    namespaces: ['icp', 'muldicat'],
    description: 'Review group for cataloguing principles and multicultural considerations'
  },
  {
    name: 'Bibliographic Conceptual Models',
    slug: 'bcm',
    namespaces: ['frbr', 'lrm', 'frad'],
    description: 'Review group for bibliographic conceptual models'
  },
  {
    name: 'International Standard Bibliographic Description',
    slug: 'isbd',
    namespaces: ['isbd', 'isbdm'],
    description: 'Review group for bibliographic description standards'
  },
  {
    name: 'Permanent UNIMARC Committee',
    slug: 'puc',
    namespaces: ['unimarc', 'mri'],
    description: 'Review group for UNIMARC format and related standards'
  }
];

export async function setupOrganizations() {
  console.log('Setting up Clerk Organizations for IFLA Review Groups...\n');
  
  for (const rg of REVIEW_GROUPS) {
    try {
      const org = await clerkClient.organizations.createOrganization({
        name: rg.name,
        slug: rg.slug,
        publicMetadata: {
          namespaces: rg.namespaces,
          reviewGroupType: 'standards-development',
          description: rg.description,
          createdAt: new Date().toISOString()
        }
      });
      
      console.log(`✅ Created: ${org.name}`);
      console.log(`   ID: ${org.id}`);
      console.log(`   Slug: ${org.slug}`);
      console.log(`   Namespaces: ${rg.namespaces.join(', ')}\n`);
      
    } catch (error: any) {
      if (error.errors?.[0]?.code === 'duplicate_record') {
        console.log(`⚠️  Organization '${rg.slug}' already exists\n`);
      } else {
        console.error(`❌ Failed to create ${rg.name}:`, error.message);
      }
    }
  }
}

// Run the setup
if (require.main === module) {
  setupOrganizations().catch(console.error);
}
```

#### 1.2 Remove Cerbos References

```bash
# Remove Cerbos files and dependencies
rm -rf cerbos/
rm -f apps/admin/src/lib/cerbos.ts

# Update package.json to remove Cerbos dependencies
# Remove: @cerbos/grpc, @cerbos/core
```

#### 1.3 Update Environment Variables

```bash
# .env.local - Remove Cerbos variables, ensure Clerk variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin/dashboard
```

### Phase 2: Authorization Logic Update (Week 1-2)

#### 2.1 Update Authorization Module

```typescript
// apps/admin/src/lib/authorization.ts
import { auth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export interface AuthContext {
  userId: string;
  email: string;
  organizationId?: string;
  organizationSlug?: string;
  organizationRole?: 'admin' | 'basic_member';
  permissions: string[];
  accessibleNamespaces: string[];
}

/**
 * Get the current user's authorization context
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const { userId, orgId, orgSlug, orgRole, has } = auth();
  
  if (!userId) return null;

  // Get user details
  const user = await clerkClient.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress || '';

  // Get organization details if user is in an organization
  let accessibleNamespaces: string[] = [];
  if (orgId) {
    const org = await clerkClient.organizations.getOrganization({
      organizationId: orgId
    });
    accessibleNamespaces = org.publicMetadata?.namespaces as string[] || [];
  }

  // Get user's custom permissions
  const permissions = user.publicMetadata?.permissions as string[] || [];

  return {
    userId,
    email,
    organizationId: orgId || undefined,
    organizationSlug: orgSlug || undefined,
    organizationRole: orgRole as 'admin' | 'basic_member' | undefined,
    permissions,
    accessibleNamespaces,
  };
}

/**
 * Check if user can perform an action on a resource
 */
export async function canPerformAction(
  resourceType: string,
  action: string,
  resourceAttributes?: Record<string, any>
): Promise<boolean> {
  const { has, orgRole, orgSlug } = auth();
  
  // Build permission string
  const permission = buildPermission(resourceType, action, resourceAttributes);
  
  // Check organization admin role first
  if (orgRole === 'admin' && resourceAttributes?.reviewGroup === orgSlug) {
    return true;
  }
  
  // Check specific permission
  return has({ permission });
}

/**
 * Build permission string from components
 */
function buildPermission(
  resourceType: string, 
  action: string, 
  attributes?: Record<string, any>
): string {
  if (attributes?.namespace) {
    return `${resourceType}:${action}:${attributes.namespace}`;
  }
  if (attributes?.projectId) {
    return `${resourceType}:${action}:${attributes.projectId}`;
  }
  return `${resourceType}:${action}`;
}

/**
 * Authorization guards for common operations
 */
export const authGuards = {
  // Namespace operations
  async canEditNamespace(namespace: string): Promise<boolean> {
    return canPerformAction('namespace', 'editor', { namespace });
  },

  async canAdminNamespace(namespace: string): Promise<boolean> {
    return canPerformAction('namespace', 'admin', { namespace });
  },

  async canTranslateNamespace(namespace: string, language?: string): Promise<boolean> {
    const permission = language 
      ? `namespace:translator:${namespace}:${language}`
      : `namespace:translator:${namespace}`;
    const { has } = auth();
    return has({ permission });
  },

  // Site management operations
  async canAccessSiteConfig(namespace: string): Promise<boolean> {
    return canPerformAction('site', 'config', { namespace });
  },

  async canAccessSiteContent(namespace: string): Promise<boolean> {
    return canPerformAction('site', 'content', { namespace });
  },

  async canAccessSiteVocabulary(namespace: string): Promise<boolean> {
    return canPerformAction('site', 'vocabulary', { namespace });
  },

  // Project operations
  async canLeadProject(projectId: string): Promise<boolean> {
    return canPerformAction('project', 'lead', { projectId });
  },

  async canEditProject(projectId: string): Promise<boolean> {
    return canPerformAction('project', 'editor', { projectId });
  },
};

/**
 * Middleware for API route authorization
 */
export function requirePermission(permission: string) {
  return async (req: Request) => {
    const { has } = auth();
    
    if (!has({ permission })) {
      return new Response(
        JSON.stringify({
          error: 'Permission denied',
          required: permission
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}

export function requireOrganizationRole(role: 'admin' | 'basic_member') {
  return async (req: Request) => {
    const { orgRole } = auth();
    
    if (orgRole !== role) {
      return new Response(
        JSON.stringify({
          error: 'Insufficient organization role',
          required: role,
          current: orgRole
        }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  };
}
```

#### 2.2 Update User Management

```typescript
// apps/admin/src/lib/clerk-github-auth.ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  systemRole?: 'admin';
  currentOrganization?: {
    id: string;
    slug: string;
    name: string;
    role: 'admin' | 'basic_member';
    namespaces: string[];
  };
  permissions: string[];
  accessibleNamespaces: string[];
  isReviewGroupAdmin: boolean;
}

/**
 * Get the current user with organization context
 */
export async function getAppUser(): Promise<AppUser | null> {
  const { userId, orgId, orgRole, orgSlug } = auth();
  
  if (!userId) return null;

  const user = await currentUser();
  if (!user) return null;

  // Get organization details
  let currentOrganization = null;
  let accessibleNamespaces: string[] = [];
  
  if (orgId && orgSlug) {
    const org = await clerkClient.organizations.getOrganization({
      organizationId: orgId
    });
    
    const namespaces = org.publicMetadata?.namespaces as string[] || [];
    accessibleNamespaces = namespaces;
    
    currentOrganization = {
      id: orgId,
      slug: orgSlug,
      name: org.name,
      role: orgRole as 'admin' | 'basic_member',
      namespaces
    };
  }

  // Get user permissions
  const permissions = user.publicMetadata?.permissions as string[] || [];

  return {
    id: userId,
    email: user.emailAddresses[0]?.emailAddress || '',
    name: user.fullName || user.firstName || 'User',
    systemRole: user.publicMetadata?.systemRole as 'admin' | undefined,
    currentOrganization,
    permissions,
    accessibleNamespaces,
    isReviewGroupAdmin: orgRole === 'admin'
  };
}

/**
 * Get user's role in a specific namespace
 */
export function getNamespaceRole(user: AppUser, namespace: string): string | null {
  // System admin always has admin role
  if (user.systemRole === 'admin') {
    return 'admin';
  }
  
  // Organization admin has admin role for org namespaces
  if (user.currentOrganization?.role === 'admin' && 
      user.currentOrganization.namespaces.includes(namespace)) {
    return 'namespace-admin';
  }
  
  // Check specific permissions
  if (user.permissions.includes(`namespace:admin:${namespace}`)) {
    return 'admin';
  }
  if (user.permissions.includes(`namespace:editor:${namespace}`)) {
    return 'editor';
  }
  if (user.permissions.includes(`namespace:reviewer:${namespace}`)) {
    return 'reviewer';
  }
  if (user.permissions.some(p => p.startsWith(`namespace:translator:${namespace}:`))) {
    return 'translator';
  }
  
  // Basic access if namespace is in their organization
  if (user.currentOrganization?.namespaces.includes(namespace)) {
    return 'member';
  }
  
  return null;
}

/**
 * Determine dashboard route based on user's highest role
 */
export function getDashboardRoute(user: AppUser): string {
  if (user.systemRole === 'admin') {
    return '/admin/dashboard/system';
  }
  
  if (user.isReviewGroupAdmin) {
    return '/admin/dashboard/review-group';
  }
  
  // Check for namespace admin permissions
  const hasNamespaceAdmin = user.permissions.some(p => p.includes(':admin:'));
  if (hasNamespaceAdmin) {
    return '/admin/dashboard/namespace';
  }
  
  // Check for editor permissions
  const hasEditor = user.permissions.some(p => p.includes(':editor:'));
  if (hasEditor) {
    return '/admin/dashboard/editor';
  }
  
  // Default to basic dashboard
  return '/admin/dashboard';
}
```

### Phase 3: User Migration (Week 2)

#### 3.1 Migrate Mock Users to Organizations

```typescript
// scripts/migrate-mock-users.ts
import { clerkClient } from '@clerk/nextjs/server';
import { getMockGitHubData } from '../apps/admin/src/lib/github-mock-service';

const MOCK_USERS = [
  'superadmin+clerk_test@example.com',
  'rg_admin+clerk_test@example.com', 
  'editor+clerk_test@example.com',
  'author+clerk_test@example.com',
  'translator+clerk_test@example.com',
  'jphipps@madcreek.com'
];

async function migrateUsersToOrganizations() {
  console.log('Migrating mock users to Clerk Organizations...\n');
  
  for (const email of MOCK_USERS) {
    try {
      await migrateUser(email);
    } catch (error) {
      console.error(`Failed to migrate ${email}:`, error);
    }
  }
}

async function migrateUser(email: string) {
  console.log(`Migrating user: ${email}`);
  
  // Get mock data
  const mockData = getMockGitHubData(email);
  
  // Find user in Clerk
  const userList = await clerkClient.users.getUserList({
    emailAddress: [email]
  });
  
  if (!userList.data.length) {
    console.log(`  ⚠️  User not found in Clerk, skipping`);
    return;
  }
  
  const user = userList.data[0];
  
  // Update system role if needed
  if (mockData.systemRole) {
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        systemRole: mockData.systemRole
      }
    });
    console.log(`  ✅ Set system role: ${mockData.systemRole}`);
  }
  
  // Add to organizations
  for (const rg of mockData.reviewGroups) {
    const orgSlug = rg.slug.replace('-review-group', '');
    
    try {
      // Get organization
      const orgList = await clerkClient.organizations.getOrganizationList();
      const org = orgList.data.find(o => o.slug === orgSlug);
      
      if (!org) {
        console.log(`  ⚠️  Organization ${orgSlug} not found`);
        continue;
      }
      
      // Add membership
      await clerkClient.organizations.createOrganizationMembership({
        organizationId: org.id,
        userId: user.id,
        role: rg.role === 'maintainer' ? 'admin' : 'basic_member'
      });
      
      console.log(`  ✅ Added to ${org.name} as ${rg.role === 'maintainer' ? 'admin' : 'member'}`);
      
      // Add namespace permissions
      const permissions: string[] = [];
      for (const namespace of rg.namespaces) {
        if (rg.role === 'maintainer') {
          permissions.push(`namespace:admin:${namespace}`);
        } else {
          permissions.push(`namespace:editor:${namespace}`);
        }
      }
      
      if (permissions.length > 0) {
        await clerkClient.users.updateUserMetadata(user.id, {
          publicMetadata: {
            ...user.publicMetadata,
            permissions: [
              ...(user.publicMetadata?.permissions as string[] || []),
              ...permissions
            ]
          }
        });
        console.log(`  ✅ Added permissions: ${permissions.join(', ')}`);
      }
      
    } catch (error: any) {
      if (error.errors?.[0]?.code === 'duplicate_record') {
        console.log(`  ⚠️  Already member of ${orgSlug}`);
      } else {
        console.error(`  ❌ Failed to add to ${orgSlug}:`, error.message);
      }
    }
  }
  
  // Add project permissions
  for (const [projectId, project] of Object.entries(mockData.projects)) {
    const permission = `project:${project.role}:${projectId}`;
    
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        permissions: [
          ...(user.publicMetadata?.permissions as string[] || []),
          permission
        ]
      }
    });
    
    console.log(`  ✅ Added project permission: ${permission}`);
  }
  
  console.log(`  ✅ Migration complete for ${email}\n`);
}

// Run migration
if (require.main === module) {
  migrateUsersToOrganizations().catch(console.error);
}
```

### Phase 4: UI Component Updates (Week 2-3)

#### 4.1 Create Permission Hooks

```typescript
// hooks/usePermissions.ts
import { useAuth, useOrganization } from '@clerk/nextjs';

export function useNamespacePermissions(namespace: string) {
  const { has, orgRole } = useAuth();
  const { organization } = useOrganization();
  
  // Check if namespace belongs to current organization
  const namespaces = organization?.publicMetadata?.namespaces as string[] || [];
  const isOrgNamespace = namespaces.includes(namespace);
  
  return {
    canAdmin: has({ permission: `namespace:admin:${namespace}` }) || 
              (orgRole === 'admin' && isOrgNamespace),
    canEdit: has({ permission: `namespace:editor:${namespace}` }) || 
             has({ permission: `namespace:admin:${namespace}` }) ||
             (orgRole === 'admin' && isOrgNamespace),
    canReview: has({ permission: `namespace:reviewer:${namespace}` }) ||
               has({ permission: `namespace:editor:${namespace}` }) ||
               has({ permission: `namespace:admin:${namespace}` }) ||
               (orgRole === 'admin' && isOrgNamespace),
    canTranslate: has({ permission: `namespace:translator:${namespace}` }),
    canRead: isOrgNamespace || has({ permission: `namespace:*:${namespace}` }),
    isOrgNamespace
  };
}

export function useSiteManagementPermissions(namespace: string) {
  const { has, orgRole } = useAuth();
  const { organization } = useOrganization();
  
  const namespaces = organization?.publicMetadata?.namespaces as string[] || [];
  const isOrgNamespace = namespaces.includes(namespace);
  const isOrgAdmin = orgRole === 'admin' && isOrgNamespace;
  
  return {
    canAccessConfig: isOrgAdmin || has({ permission: `site:config:${namespace}` }),
    canAccessContent: isOrgAdmin || has({ permission: `site:content:${namespace}` }),
    canAccessVocabulary: isOrgAdmin || has({ permission: `site:vocabulary:${namespace}` }),
    canAccessImportExport: isOrgAdmin || has({ permission: `site:import_export:${namespace}` }),
    canAccessTranslation: isOrgAdmin || has({ permission: `site:translation:${namespace}` }),
    canAccessPublishing: isOrgAdmin || has({ permission: `site:publishing:${namespace}` }),
    canAccessAnalytics: isOrgAdmin || has({ permission: `site:analytics:${namespace}` }),
    canAccessTeam: isOrgAdmin || has({ permission: `site:team:${namespace}` })
  };
}

export function useProjectPermissions(projectId: string) {
  const { has } = useAuth();
  
  return {
    canLead: has({ permission: `project:lead:${projectId}` }),
    canEdit: has({ permission: `project:editor:${projectId}` }) ||
             has({ permission: `project:lead:${projectId}` }),
    canReview: has({ permission: `project:reviewer:${projectId}` }) ||
               has({ permission: `project:editor:${projectId}` }) ||
               has({ permission: `project:lead:${projectId}` }),
    canTranslate: has({ permission: `project:translator:${projectId}` }),
    canRead: has({ permission: `project:*:${projectId}` })
  };
}
```

#### 4.2 Update Navigation Components

```typescript
// components/AdminNavigation.tsx
import { useAuth, useOrganization } from '@clerk/nextjs';
import { useNamespacePermissions } from '@/hooks/usePermissions';

export function AdminNavigation() {
  const { orgRole, orgSlug } = useAuth();
  const { organization } = useOrganization();
  
  const namespaces = organization?.publicMetadata?.namespaces as string[] || [];
  
  return (
    <nav className="admin-navigation">
      {/* System Admin Navigation */}
      {orgRole === 'admin' && (
        <NavSection title="Organization Admin">
          <NavItem href={`/admin/organizations/${orgSlug}`}>
            Manage Organization
          </NavItem>
          <NavItem href={`/admin/organizations/${orgSlug}/members`}>
            Team Members
          </NavItem>
          <NavItem href={`/admin/organizations/${orgSlug}/projects`}>
            Projects
          </NavItem>
        </NavSection>
      )}
      
      {/* Namespace Navigation */}
      {namespaces.length > 0 && (
        <NavSection title="Namespaces">
          {namespaces.map(namespace => (
            <NamespaceNavItem key={namespace} namespace={namespace} />
          ))}
        </NavSection>
      )}
    </nav>
  );
}

function NamespaceNavItem({ namespace }: { namespace: string }) {
  const { canEdit, canAdmin } = useNamespacePermissions(namespace);
  
  if (!canEdit && !canAdmin) return null;
  
  return (
    <NavItem href={`/admin/namespaces/${namespace}`}>
      {namespace.toUpperCase()}
      {canAdmin && <AdminBadge />}
    </NavItem>
  );
}
```

### Phase 5: API Route Updates (Week 3)

#### 5.1 Update API Authorization

```typescript
// Example: apps/admin/src/app/api/admin/namespaces/[nsId]/route.ts
import { requirePermission, requireOrganizationRole } from '@/lib/authorization';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  req: Request,
  { params }: { params: { nsId: string } }
) {
  // Check if user can read this namespace
  const authCheck = await requirePermission(`namespace:read:${params.nsId}`)(req);
  if (authCheck) return authCheck;
  
  // Get namespace data
  const namespace = await getNamespace(params.nsId);
  return Response.json({ namespace });
}

export async function PUT(
  req: Request,
  { params }: { params: { nsId: string } }
) {
  // Check if user can edit this namespace
  const authCheck = await requirePermission(`namespace:editor:${params.nsId}`)(req);
  if (authCheck) return authCheck;
  
  const data = await req.json();
  const updated = await updateNamespace(params.nsId, data);
  return Response.json({ namespace: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: { nsId: string } }
) {
  // Only organization admins can delete namespaces
  const orgCheck = await requireOrganizationRole('admin')(req);
  if (orgCheck) return orgCheck;
  
  // Additional check: namespace must belong to user's organization
  const { orgSlug } = auth();
  const namespace = await getNamespace(params.nsId);
  
  if (namespace.reviewGroup !== orgSlug) {
    return new Response('Namespace not in your organization', { status: 403 });
  }
  
  await deleteNamespace(params.nsId);
  return new Response(null, { status: 204 });
}
```

### Phase 6: Testing and Validation (Week 3-4)

#### 6.1 Permission Testing Suite

```typescript
// tests/permissions.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setupClerkTestingToken } from '@clerk/testing/vitest';

describe('Clerk Organizations RBAC', () => {
  beforeEach(() => {
    setupClerkTestingToken();
  });

  describe('Organization Admin Permissions', () => {
    it('should allow org admin to access all org namespaces', async () => {
      // Test org admin permissions
    });

    it('should allow org admin to manage team members', async () => {
      // Test team management
    });

    it('should allow org admin to create projects', async () => {
      // Test project creation
    });
  });

  describe('Namespace Editor Permissions', () => {
    it('should allow editor to modify assigned namespace content', async () => {
      // Test namespace editing
    });

    it('should deny editor access to other namespaces', async () => {
      // Test namespace isolation
    });
  });

  describe('Site Management Permissions', () => {
    it('should show correct tabs based on permissions', async () => {
      // Test tab visibility
    });

    it('should enforce activity-level permissions', async () => {
      // Test granular permissions
    });
  });
});
```

## Migration Checklist

### Pre-Migration
- [ ] Backup current user data and roles
- [ ] Document current permission assignments
- [ ] Test Clerk Organizations setup in development

### Migration Steps
- [ ] Create Clerk Organizations for each Review Group
- [ ] Remove Cerbos references from codebase
- [ ] Update authorization logic to use Clerk
- [ ] Migrate existing users to organizations
- [ ] Update UI components to use new permission hooks
- [ ] Update API routes with new authorization middleware
- [ ] Test all permission scenarios

### Post-Migration
- [ ] Verify all users have correct permissions
- [ ] Test all admin interface functionality
- [ ] Monitor for permission-related errors
- [ ] Update documentation
- [ ] Train administrators on new permission management

## Benefits Realized

### Development Benefits
- **Simplified Codebase**: Removed complex Cerbos integration
- **Faster Development**: No need to learn Cerbos policy language
- **Better Testing**: Simpler permission mocking and testing
- **Unified API**: Single Clerk API for auth and permissions

### Operational Benefits
- **Reduced Infrastructure**: One less service to deploy and monitor
- **Built-in Admin UI**: Clerk dashboard for managing organizations and permissions
- **Better Performance**: Permissions cached in JWT tokens
- **Enterprise Features**: Audit logs, SSO, compliance features included

### User Experience Benefits
- **Consistent Interface**: Organization management integrated with auth
- **Faster Permission Checks**: No network calls to external service
- **Better Error Messages**: Clear permission requirements in UI
- **Seamless Onboarding**: Organization invites handle auth and permissions

## Conclusion

The Clerk Organizations approach provides a significantly simpler and more maintainable RBAC implementation for the IFLA Standards Platform. By mapping Review Groups to Clerk Organizations and using a combination of organization roles and custom permissions, we achieve the same level of access control with much less complexity.

This implementation eliminates the need for Cerbos while providing better performance, easier maintenance, and a more integrated user experience. The natural mapping of Review Groups to Organizations makes the permission model intuitive for both developers and administrators.