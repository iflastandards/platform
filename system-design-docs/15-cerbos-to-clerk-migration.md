# Cerbos to Clerk Migration Strategy

**Version:** 1.0  
**Date:** January 2025  
**Status:** Migration Planning

## Executive Summary

This document outlines the detailed migration strategy for transitioning from Cerbos policy-based authorization to Clerk's organization-based RBAC system. The migration will be executed in phases to ensure zero downtime and maintain security throughout the transition.

## Migration Overview

### Current State (Cerbos)
- **Users**: ~500 active users across 4 Review Groups
- **Policies**: 15 Cerbos policies covering various resources
- **Roles**: 10 distinct roles with complex inheritance
- **Namespaces**: 11 active namespaces with varying permission models
- **Integration Points**: API middleware, frontend hooks, admin portal

### Target State (Clerk)
- **Organizations**: 4 Review Groups as primary organizations
- **Roles**: Simplified to 6 core roles with metadata extensions
- **Permissions**: Organization-based with namespace metadata
- **Integration**: Direct Clerk SDK usage throughout

## Pre-Migration Checklist

### Technical Prerequisites
- [ ] Clerk account with Organization features enabled
- [ ] Backup of all current user roles and permissions
- [ ] Complete audit of Cerbos policy usage
- [ ] Test environment with Clerk configured
- [ ] Migration scripts tested and validated
- [ ] Rollback procedures documented

### Business Prerequisites
- [ ] Stakeholder approval obtained
- [ ] Communication plan prepared
- [ ] Training materials created
- [ ] Support team briefed
- [ ] Maintenance window scheduled

## Phase 1: Analysis and Preparation (Week 0)

### 1.1 Audit Current Permissions

```typescript
// Script to export current permissions
async function auditCerbosPermissions() {
  const audit = {
    users: [],
    roles: [],
    policies: [],
    resourceMappings: []
  };
  
  // Export users with roles
  const users = await supabase
    .from('user_roles')
    .select('*')
    .order('user_id');
  
  // Map to Clerk structure
  for (const userRole of users.data) {
    audit.users.push({
      userId: userRole.user_id,
      currentRole: userRole.role,
      reviewGroup: userRole.review_group_id,
      namespace: userRole.namespace_id,
      proposedClerkRole: mapCerbosToClerkRole(userRole.role),
      proposedOrganization: mapReviewGroupToOrg(userRole.review_group_id)
    });
  }
  
  // Export to migration tracking
  await fs.writeFile('migration-audit.json', JSON.stringify(audit, null, 2));
}
```

### 1.2 Create Mapping Tables

```typescript
// Role mapping configuration
const ROLE_MAPPINGS = {
  // Global roles
  'superadmin': {
    clerkRole: null, // Use metadata instead
    globalMetadata: { superadmin: true }
  },
  
  // Review Group roles
  'review_group_admin': {
    clerkRole: 'org:admin',
    permissions: ['manage:all']
  },
  
  // Namespace roles
  'namespace_admin': {
    clerkRole: 'custom:ns_admin',
    permissions: ['namespace:manage', 'content:publish']
  },
  'namespace_editor': {
    clerkRole: 'custom:ns_editor',
    permissions: ['content:write', 'vocabulary:manage']
  },
  'namespace_translator': {
    clerkRole: 'custom:ns_translator',
    permissions: ['content:translate']
  },
  'namespace_reviewer': {
    clerkRole: 'custom:ns_reviewer',
    permissions: ['content:read', 'content:comment']
  },
  
  // Project roles
  'project_lead': {
    clerkRole: 'custom:project_lead',
    permissions: ['project:manage'],
    requiresMetadata: true
  },
  'project_manager': {
    clerkRole: 'custom:project_manager',
    permissions: ['project:coordinate'],
    requiresMetadata: true
  },
  'project_member': {
    clerkRole: 'custom:project_member',
    permissions: ['project:contribute'],
    requiresMetadata: true
  }
};
```

## Phase 2: Clerk Setup (Week 1)

### 2.1 Create Organizations

```typescript
// Setup script for Clerk organizations
import { clerkClient } from "@clerk/nextjs/server";

async function setupClerkOrganizations() {
  const organizations = [
    {
      name: "International Cataloguing Principles",
      slug: "icp",
      publicMetadata: {
        type: "review_group",
        namespaces: ["icp", "muldicat"],
        abbreviation: "ICP"
      }
    },
    {
      name: "Bibliographic Conceptual Models",
      slug: "bcm",
      publicMetadata: {
        type: "review_group",
        namespaces: ["frbr", "lrm", "frad"],
        abbreviation: "BCM"
      }
    },
    {
      name: "International Standard Bibliographic Description",
      slug: "isbd",
      publicMetadata: {
        type: "review_group",
        namespaces: ["isbd", "isbdm"],
        abbreviation: "ISBD"
      }
    },
    {
      name: "Permanent UNIMARC Committee",
      slug: "puc",
      publicMetadata: {
        type: "review_group",
        namespaces: ["unimarc", "mri"],
        abbreviation: "PUC"
      }
    }
  ];
  
  const createdOrgs = {};
  
  for (const org of organizations) {
    const created = await clerkClient.organizations.create(org);
    createdOrgs[org.slug] = created.id;
    console.log(`Created organization: ${org.name} (${created.id})`);
  }
  
  return createdOrgs;
}
```

### 2.2 Configure Custom Roles

```typescript
// Role configuration for each organization
async function configureOrganizationRoles(orgId: string) {
  const customRoles = [
    {
      name: "Namespace Administrator",
      key: "ns_admin",
      description: "Full control over assigned namespaces",
      permissions: [
        "org:namespace:manage",
        "org:content:publish",
        "org:vocabulary:manage",
        "org:team:view"
      ]
    },
    {
      name: "Namespace Editor",
      key: "ns_editor",
      description: "Create and edit content in assigned namespaces",
      permissions: [
        "org:content:write",
        "org:vocabulary:write",
        "org:content:delete"
      ]
    },
    {
      name: "Namespace Translator",
      key: "ns_translator",
      description: "Translate content in assigned namespaces",
      permissions: [
        "org:content:translate",
        "org:content:read"
      ]
    },
    {
      name: "Namespace Reviewer",
      key: "ns_reviewer",
      description: "Review and comment on content",
      permissions: [
        "org:content:read",
        "org:content:comment"
      ]
    }
  ];
  
  for (const role of customRoles) {
    await clerkClient.organizations.createRole(orgId, role);
  }
}
```

## Phase 3: Parallel Implementation (Week 2)

### 3.1 Abstraction Layer

```typescript
// Authorization abstraction layer
interface AuthorizationProvider {
  checkPermission(
    user: User,
    resource: string,
    action: string,
    context?: any
  ): Promise<boolean>;
}

class CerbosProvider implements AuthorizationProvider {
  async checkPermission(user, resource, action, context) {
    // Existing Cerbos implementation
    return this.cerbos.checkResource({
      principal: this.mapUserToPrincipal(user),
      resource: { kind: resource, ...context },
      actions: [action]
    }).isAllowed(action);
  }
}

class ClerkProvider implements AuthorizationProvider {
  async checkPermission(user, resource, action, context) {
    // New Clerk implementation
    const { sessionClaims } = user;
    
    // Check superadmin
    if (sessionClaims?.publicMetadata?.superadmin) return true;
    
    // Check organization permissions
    const permission = `${resource}:${action}`;
    return sessionClaims?.orgPermissions?.includes(permission) || false;
  }
}

// Dual-mode authorization service
class DualAuthorizationService {
  constructor(
    private cerbos: CerbosProvider,
    private clerk: ClerkProvider,
    private mode: 'cerbos' | 'clerk' | 'both' = 'both'
  ) {}
  
  async checkPermission(user, resource, action, context) {
    if (this.mode === 'both') {
      const [cerbosResult, clerkResult] = await Promise.all([
        this.cerbos.checkPermission(user, resource, action, context),
        this.clerk.checkPermission(user, resource, action, context)
      ]);
      
      // Log discrepancies
      if (cerbosResult !== clerkResult) {
        console.warn('Permission mismatch:', {
          user: user.id,
          resource,
          action,
          cerbos: cerbosResult,
          clerk: clerkResult
        });
      }
      
      // Use Cerbos as source of truth during parallel run
      return cerbosResult;
    }
    
    return this.mode === 'cerbos' 
      ? this.cerbos.checkPermission(user, resource, action, context)
      : this.clerk.checkPermission(user, resource, action, context);
  }
}
```

### 3.2 Session Enhancement

```typescript
// Enhance Clerk session with namespace permissions
export async function enhanceClerkSession(session: Session) {
  const { user, sessionClaims } = session;
  
  // Add namespace-specific permissions
  const namespacePermissions = {};
  
  for (const org of sessionClaims.organizations || []) {
    const namespaces = org.publicMetadata?.namespaces || [];
    
    for (const namespace of namespaces) {
      namespacePermissions[namespace] = {
        role: org.role,
        permissions: getNamespacePermissions(org.role, namespace),
        organization: org.id
      };
    }
  }
  
  // Handle project-based permissions
  const projectPermissions = await getProjectPermissions(user.id);
  
  return {
    ...session,
    namespacePermissions,
    projectPermissions,
    // Backward compatibility
    hasPermission: (resource, action, namespace) => {
      return checkEnhancedPermission(
        namespacePermissions,
        projectPermissions,
        resource,
        action,
        namespace
      );
    }
  };
}
```

## Phase 4: User Migration (Week 3)

### 4.1 Migration Script

```typescript
// Main user migration script
async function migrateUsers() {
  const migrationLog = [];
  const errors = [];
  
  try {
    // Get all users with roles
    const userRoles = await supabase
      .from('user_roles')
      .select(`
        *,
        users (
          id,
          email,
          name
        )
      `);
    
    // Group by user for efficient processing
    const userGroups = groupBy(userRoles.data, 'user_id');
    
    for (const [userId, roles] of Object.entries(userGroups)) {
      try {
        // Determine organizations and roles
        const clerkMemberships = mapToClerkMemberships(roles);
        
        // Update or create Clerk user
        const clerkUser = await clerkClient.users.updateOrCreate({
          externalId: userId,
          emailAddress: roles[0].users.email,
          firstName: roles[0].users.name?.split(' ')[0],
          lastName: roles[0].users.name?.split(' ')[1],
          publicMetadata: {
            migratedFrom: 'cerbos',
            migrationDate: new Date().toISOString(),
            originalRoles: roles.map(r => r.role)
          }
        });
        
        // Add to organizations
        for (const membership of clerkMemberships) {
          await clerkClient.organizations.createMembership({
            organizationId: membership.orgId,
            userId: clerkUser.id,
            role: membership.role,
            publicMetadata: membership.metadata
          });
        }
        
        migrationLog.push({
          userId,
          clerkId: clerkUser.id,
          memberships: clerkMemberships,
          status: 'success'
        });
        
      } catch (error) {
        errors.push({
          userId,
          error: error.message,
          roles
        });
      }
    }
    
    // Save migration results
    await saveMigrationResults(migrationLog, errors);
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
```

### 4.2 Validation Script

```typescript
// Validate migrated permissions
async function validateMigration() {
  const validationReport = {
    total: 0,
    matches: 0,
    mismatches: [],
    missing: []
  };
  
  // Test scenarios
  const testScenarios = [
    {
      user: 'user_123',
      resource: 'namespace',
      action: 'edit',
      namespace: 'isbd',
      expectedCerbos: true,
      expectedClerk: true
    },
    // ... more test scenarios
  ];
  
  for (const scenario of testScenarios) {
    const user = await getUser(scenario.user);
    
    const cerbosResult = await cerbosAuth.check(scenario);
    const clerkResult = await clerkAuth.check(scenario);
    
    validationReport.total++;
    
    if (cerbosResult === clerkResult && 
        cerbosResult === scenario.expectedCerbos) {
      validationReport.matches++;
    } else {
      validationReport.mismatches.push({
        ...scenario,
        cerbosResult,
        clerkResult
      });
    }
  }
  
  return validationReport;
}
```

## Phase 5: Cutover (Week 4)

### 5.1 Feature Flag Configuration

```typescript
// Progressive rollout configuration
const MIGRATION_FLAGS = {
  // Start with read operations
  'clerk_auth_read': {
    default: false,
    rollout: [
      { percent: 10, date: '2025-02-01' },
      { percent: 50, date: '2025-02-03' },
      { percent: 100, date: '2025-02-05' }
    ]
  },
  
  // Then write operations
  'clerk_auth_write': {
    default: false,
    rollout: [
      { percent: 10, date: '2025-02-07' },
      { percent: 50, date: '2025-02-09' },
      { percent: 100, date: '2025-02-11' }
    ]
  },
  
  // Finally admin operations
  'clerk_auth_admin': {
    default: false,
    rollout: [
      { percent: 10, date: '2025-02-13' },
      { percent: 100, date: '2025-02-15' }
    ]
  }
};
```

### 5.2 Monitoring Dashboard

```typescript
// Real-time migration monitoring
interface MigrationMetrics {
  authProvider: 'cerbos' | 'clerk';
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  errors: Array<{
    timestamp: Date;
    user: string;
    operation: string;
    error: string;
  }>;
  discrepancies: Array<{
    timestamp: Date;
    user: string;
    resource: string;
    action: string;
    cerbosDecision: boolean;
    clerkDecision: boolean;
  }>;
}

// Monitoring endpoint
export async function GET(req: Request) {
  const metrics = await redis.get('migration:metrics');
  const hourlyStats = await redis.zrange(
    'migration:hourly',
    Date.now() - 24 * 60 * 60 * 1000,
    Date.now()
  );
  
  return Response.json({
    current: metrics,
    hourly: hourlyStats,
    health: calculateHealthScore(metrics)
  });
}
```

## Phase 6: Cleanup (Week 5)

### 6.1 Remove Cerbos Dependencies

```bash
# Removal checklist
- [ ] Remove @cerbos/grpc package
- [ ] Remove Cerbos configuration files
- [ ] Remove Cerbos middleware
- [ ] Update environment variables
- [ ] Archive Cerbos policies
- [ ] Update documentation
```

### 6.2 Code Cleanup

```typescript
// Before (Cerbos)
import { GRPC as Cerbos } from '@cerbos/grpc';

const cerbos = new Cerbos('localhost:3592');

export async function checkPermission(req, resource, action) {
  const session = await getServerSession(authOptions);
  const decision = await cerbos.checkResource({
    principal: mapUserToPrincipal(session.user),
    resource: { kind: resource },
    actions: [action]
  });
  return decision.isAllowed(action);
}

// After (Clerk)
import { auth } from "@clerk/nextjs/server";

export async function checkPermission(resource, action) {
  const { has } = auth();
  return has({ permission: `${resource}:${action}` });
}
```

## Rollback Plan

### Immediate Rollback (< 1 hour)
1. Switch feature flags to 'cerbos' mode
2. Clear Clerk session cookies
3. Force re-authentication
4. Monitor for stability

### Full Rollback (> 1 hour)
1. Restore Cerbos configuration
2. Revert code changes via Git
3. Restore user role mappings
4. Communicate to users
5. Post-mortem analysis

## Success Criteria

### Technical Success
- [ ] All users successfully migrated
- [ ] < 0.1% permission check failures
- [ ] < 50ms latency increase
- [ ] Zero security incidents

### Business Success
- [ ] No disruption to standards work
- [ ] Positive user feedback
- [ ] Reduced support tickets
- [ ] Simplified administration

## Post-Migration Tasks

### Week 6: Optimization
- Performance tuning
- Cache optimization
- UI improvements
- Admin training

### Week 7: Documentation
- Update all documentation
- Create admin guides
- Record training videos
- Update API docs

### Week 8: Lessons Learned
- Team retrospective
- Document challenges
- Share learnings
- Plan improvements

## Risk Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Data loss | High | Low | Complete backups, validation scripts |
| Permission gaps | Medium | Medium | Parallel running, extensive testing |
| Performance degradation | Medium | Low | Monitoring, caching, optimization |
| User confusion | Low | Medium | Training, clear communication |
| Rollback needed | High | Low | Tested rollback procedures |

## Communication Plan

### Pre-Migration
- Email to all users (2 weeks before)
- Review Group admin briefing
- FAQ document published
- Support team training

### During Migration
- Status page updates
- Slack/Discord notifications
- Real-time monitoring dashboard
- Dedicated support channel

### Post-Migration
- Success announcement
- Feedback survey
- Performance report
- Future roadmap

This migration strategy ensures a smooth transition from Cerbos to Clerk while maintaining security, minimizing disruption, and providing clear rollback options throughout the process.