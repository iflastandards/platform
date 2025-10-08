# OMR25 Detailed Permission Matrix

**Version:** 2.0  
**Date:** December 2024  
**Status:** Updated with new domain model  
**Purpose:** Comprehensive permission mappings for all platform activities

## Overview

This document provides detailed permission matrices that map every platform activity to the roles that can perform them. It serves as the implementation reference for developers and the operational guide for administrators.

## Updated Domain Model

The permission system now reflects:
- **Organizations** (top-level, replacing Review Groups)
- **Teams** (permission groups within Organizations)
- **Standards** (replacing Namespaces)
- **Projects** (work coordination units within Standards)

## Activity-Based Permission Matrix

### Standard Management Activities

| Activity | Superadmin | Org Admin | Std Admin | Std Editor | Std Translator | Std Reviewer | Project Lead | Project Member | Team Role |
|----------|:----------:|:---------:|:---------:|:----------:|:--------------:|:------------:|:------------:|:--------------:|:---------:|
| **Standard Creation** |
| Create standard | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | via Team |
| Delete standard | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Archive standard | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Configure standard | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Content Management (Standard-Level Authorization)** |
| Create vocabulary/elementSet | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓¹ | via Team |
| Edit vocabulary/elementSet | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓¹ | via Team |
| Delete vocabulary/elementSet | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | via Team |
| Edit released vocabulary/elementSet | ✓ | ✓² | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Translation** |
| Edit translations | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓¹ | via Team |
| Approve translations | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | via Team |
| Export for translation | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | via Team |
| Import translations | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | via Team |
| **Version Control** |
| Create version | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓³ | ✗ | ✗ |
| Publish version | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓³ | ✗ | ✗ |
| Rollback version | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Tag release | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓³ | ✗ | ✗ |
| **Import/Export (Standard-Level Authorization)** |
| Import vocabulary/elementSet | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ | via Team |
| Export vocabulary/elementSet | ✓ | ✓ | ✓ | ✓ | ✓⁴ | ✓⁵ | ✓ | ✓¹ | via Team |
| Bulk operations on standard content | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |

**Notes:**
- ¹ Only for assigned standards within project scope
- ² Requires temporary unlock (24-hour window)
- ³ Only for release projects
- ⁴ Translation fields only
- ⁵ Read-only export for review purposes

### Organization Management Activities

| Activity | Superadmin | Org Admin | Org Manager | Org Member | Team Maintainer |
|----------|:----------:|:---------:|:-----------:|:----------:|:--------------:|
| **Organization Lifecycle** |
| Create organization | ✓ | ✗ | ✗ | ✗ | ✗ |
| Archive organization | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete organization | ✓ | ✗ | ✗ | ✗ | ✗ |
| Configure organization | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Team Management** |
| Create teams | ✓ | ✓ | ✓ | ✗ | ✗ |
| Delete teams | ✓ | ✓ | ✓ | ✗ | ✗ |
| Assign team roles | ✓ | ✓ | ✓ | ✗ | ✓¹ |
| Add team members | ✓ | ✓ | ✓ | ✗ | ✓ |
| Remove team members | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Standard Assignment** |
| Assign teams to standards | ✓ | ✓ | ✗ | ✗ | ✗ |
| Set team permissions | ✓ | ✓ | ✗ | ✗ | ✗ |
| View team assignments | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notes:**
- ¹ Team maintainers can only change member/maintainer roles within their team

### Project Management Activities

| Activity | Superadmin | Org Admin | Std Admin | Project Lead | Project Manager | Project Member | Project Contributor |
|----------|:----------:|:---------:|:---------:|:------------:|:--------------:|:--------------:|:------------------:|
| **Project Lifecycle** |
| Create project | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Archive project | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete project | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Configure project | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Team Assignment** |
| Add project teams | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Remove teams | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Assign roles | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Board Management** |
| Create columns | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Move cards | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Create cards | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Workflow Orchestration** |
| Initiate workflows | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Approve phases | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Complete project | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Resource Access** |
| View project analytics | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Export project data | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |

### Team & User Management Activities

| Activity | Superadmin | Org Admin | Org Manager | Team Maintainer | Std Admin | Project Lead |
|----------|:----------:|:---------:|:-----------:|:--------------:|:---------:|:------------:|
| **User Management** |
| Invite users to org | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Remove users from org | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Assign org roles | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| View user activity | ✓ | ✓¹ | ✗ | ✗ | ✓² | ✓³ |
| **Team Operations** |
| Create teams | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Manage team members | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Set team permissions | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Permission Management** |
| Grant system roles | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Grant org roles | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Grant standard roles | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Grant project roles | ✓ | ✓ | ✗ | ✗ | ✓ | ✓ |
| **Delegation** |
| Delegate permissions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Set time bounds | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Revoke delegation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

**Notes:**
- ¹ Within organization scope only
- ² Within standard scope only
- ³ Within project scope only

### System Administration Activities

| Activity | Superadmin | Org Admin | Std Admin |
|----------|:----------:|:---------:|:---------:|
| **Platform Configuration** |
| System settings | ✓ | ✗ | ✗ |
| Integration config | ✓ | ✗ | ✗ |
| API management | ✓ | ✗ | ✗ |
| **Monitoring** |
| View system logs | ✓ | ✗ | ✗ |
| View audit trail | ✓ | ✓¹ | ✓² |
| Performance metrics | ✓ | ✓¹ | ✓² |
| **Emergency Actions** |
| Emergency unlock | ✓ | ✓³ | ✗ |
| System maintenance | ✓ | ✗ | ✗ |
| Data recovery | ✓ | ✗ | ✗ |

**Notes:**
- ¹ Organization scope only
- ² Standard scope only
- ³ 24-hour time limit for org content

## Tab-Level Access Control

### Standard Detail Page (`/organization/:orgId/standards/:stdId`)

| Tab | View Access | Edit Access | Required Permission |
|-----|-------------|-------------|-------------------|
| **Overview** | All authenticated users | N/A | `standard.read` |
| **Content** | All authenticated users | Std Editor+ | `content.edit` |
| **Versions** | All authenticated users | Std Admin+ | `standard.publish` |
| **Projects** | All authenticated users | Std Admin+ | `project.create` |
| **Team** | All authenticated users | Std Admin+ | `standard.team` |
| **Settings** | Std Admin+ | Std Admin+ | `standard.config` |

### Project Detail Page (`/organization/:orgId/standards/:stdId/projects/:projectId`)

| Tab | View Access | Edit Access | Required Permission |
|-----|-------------|-------------|-------------------|
| **Dashboard** | Project members | N/A | `project.view` |
| **Board** | Project members | Project members | `project.contribute` |
| **Workflows** | Project members | Project Lead | `project.orchestrate` |
| **Team** | Project members | Project Lead/Manager | `project.manage` |
| **Analytics** | Project Lead/Manager | N/A | `project.manage` |

### Organization Page (`/organization/:orgId`)

| Tab | View Access | Edit Access | Required Permission |
|-----|-------------|-------------|-------------------|
| **Overview** | Org members | N/A | `org.view` |
| **Standards** | Org members | Org Admin | `org.admin` |
| **Teams** | Org members | Org Manager+ | `team.manage` |
| **Projects** | Org members | Varies | `project.view` |
| **Settings** | Org Admin | Org Admin | `org.admin` |

## API Endpoint Permission Mapping

### Authentication Endpoints

| Endpoint | Method | Required Permission | Notes |
|----------|--------|-------------------|-------|
| `/api/auth/signin` | POST | None | Public endpoint |
| `/api/auth/github/callback` | GET | None | OAuth callback |
| `/api/auth/session` | GET | Authenticated | Any valid session |
| `/api/auth/signout` | POST | Authenticated | Any valid session |
| `/api/users/me` | GET | Authenticated | Returns own profile |
| `/api/users/me/permissions` | GET | Authenticated | Returns collected permissions |

### Standard Management Endpoints

| Endpoint | Method | Required Permission | Notes |
|----------|--------|-------------------|-------|
| `/api/organizations/:orgId/standards` | GET | `standard.read` | Filtered by permissions |
| `/api/organizations/:orgId/standards` | POST | `org.create` | Org Admin only |
| `/api/standards/:id` | GET | `standard.read` | Standard-specific |
| `/api/standards/:id` | PUT | `standard.config` | Std Admin only |
| `/api/standards/:id` | DELETE | `org.delete` | Org Admin only |
| `/api/standards/:id/vocabularies` | GET | `standard.read` | Any authorized user |
| `/api/standards/:id/vocabularies` | POST | `content.create` | Std Editor+ |
| `/api/vocabularies/:id` | GET | `standard.read` | Standard access required |
| `/api/vocabularies/:id` | PUT | `content.edit` | Std Editor+ in vocabulary's standard |
| `/api/vocabularies/:id` | DELETE | `content.delete` | Std Editor+ in vocabulary's standard |
| `/api/standards/:id/versions` | GET | `standard.read` | Any authorized user |
| `/api/standards/:id/versions` | POST | `standard.publish` | Std Admin+ or Project Lead |
| `/api/standards/:id/publish` | POST | `standard.publish` | Std Admin+ or Project Lead |
| `/api/standards/:id/lock` | POST | `org.admin` | Org Admin only |
| `/api/standards/:id/unlock` | POST | `org.admin` | Org Admin only |

### Project Management Endpoints

| Endpoint | Method | Required Permission | Notes |
|----------|--------|-------------------|-------|
| `/api/standards/:stdId/projects` | GET | `project.view` | Filtered by membership |
| `/api/standards/:stdId/projects` | POST | `standard.admin` | Std Admin only |
| `/api/projects/:id` | GET | `project.view` | Project members |
| `/api/projects/:id` | PUT | `project.admin` | Project Lead only |
| `/api/projects/:id` | DELETE | `standard.admin` | Std Admin only |
| `/api/projects/:id/board` | GET | `project.view` | Project members |
| `/api/projects/:id/board` | PUT | `project.contribute` | Project members |
| `/api/projects/:id/teams` | GET | `project.view` | Project members |
| `/api/projects/:id/teams` | POST | `project.manage` | Lead/Manager |
| `/api/projects/:id/workflows` | GET | `project.view` | Project members |
| `/api/projects/:id/workflows` | POST | `project.orchestrate` | Project Lead |

### Team Management Endpoints

| Endpoint | Method | Required Permission | Notes |
|----------|--------|-------------------|-------|
| `/api/organizations/:orgId/teams` | GET | `org.view` | Org members |
| `/api/organizations/:orgId/teams` | POST | `team.create` | Org Manager+ |
| `/api/teams/:id` | GET | `team.view` | Team members |
| `/api/teams/:id` | PUT | `team.manage` | Team maintainer |
| `/api/teams/:id` | DELETE | `org.manage` | Org Manager+ |
| `/api/teams/:id/members` | GET | `team.view` | Team members |
| `/api/teams/:id/members` | POST | `team.manage` | Team maintainer |
| `/api/teams/:id/members/:userId` | DELETE | `team.manage` | Team maintainer |
| `/api/teams/:id/standards` | GET | `team.view` | Team members |
| `/api/teams/:id/standards` | POST | `org.admin` | Org Admin only |

### Translation Management Endpoints

| Endpoint | Method | Required Permission | Notes |
|----------|--------|-------------------|-------|
| `/api/translations` | GET | `standard.read` | Filtered by standard |
| `/api/translations/:stdId/export` | POST | `content.translate` | Translator+ |
| `/api/translations/:stdId/import` | POST | `content.edit` | Std Editor+ |
| `/api/translations/:stdId/:lang` | GET | `standard.read` | Any authorized |
| `/api/translations/:stdId/:lang` | PUT | `content.translate` | Translator+ |

## Permission Resolution Algorithm

### Additive Permission Collection

```yaml
User Total Permissions = 
  System Role Permissions
  + Organization Role Permissions (if org admin → all permissions)
  + Team Permissions (for each team membership)
  + Direct Standard Role Permissions (if assigned)
  + Project Role Permissions (for active projects)
  
Most Permissive Wins
```

### Resolution Order

1. **Check System Role**: Superadmin? → Full access
2. **Check Organization Role**: Org Admin? → Full org access
3. **Collect Team Permissions**: Sum all team→standard permissions
4. **Check Direct Roles**: Any direct standard assignments?
5. **Check Project Roles**: Active project memberships?
6. **Apply Most Permissive**: Take highest permission level

## Time-Based Permission Rules

### Temporary Permissions

| Permission Type | Maximum Duration | Approval Required | Auto-Expire |
|----------------|-----------------|------------------|-------------|
| Emergency unlock | 24 hours | Org Admin | Yes |
| Project membership | Project duration | Project Lead | Yes |
| Delegation | 30 days | Role owner | Yes |
| Review access | 14 days | Std Admin | Yes |
| Translation sprint | 90 days | Std Admin | Yes |

### Permission Scheduling

```yaml
scheduled_permissions:
  - type: "project_member"
    start: "2025-02-01T00:00:00Z"
    end: "2025-08-01T00:00:00Z"
    auto_revoke: true
    
  - type: "translation_access"
    start: "immediate"
    duration: "P90D"  # ISO 8601 duration
    renewable: true
    
  - type: "review_window"
    start: "2025-03-15T00:00:00Z"
    duration: "P14D"
    notification: "P2D"  # Notify 2 days before expiry
```

## Delegation Mechanisms

### Delegation Rules

1. **Delegation Hierarchy**
   - Can only delegate permissions you possess
   - Cannot delegate higher than your role
   - Delegation chains limited to 1 level

2. **Delegation Constraints**
   ```yaml
   delegation_constraints:
     std_admin:
       can_delegate: ["content.edit", "content.create", "content.review"]
       cannot_delegate: ["standard.config", "standard.publish", "standard.team"]
       max_duration: "P30D"
       
     project_lead:
       can_delegate: ["project.contribute", "project.view"]
       cannot_delegate: ["project.admin", "project.manage"]
       max_duration: "project_duration"
   ```

3. **Audit Requirements**
   - All delegations logged
   - Reason required for delegation
   - Automatic notification to role owner
   - Weekly delegation reports

## Emergency Access Procedures

### Break-Glass Protocol

1. **Activation Requirements**
   - System emergency detected
   - Normal access paths failed
   - Authorized personnel only

2. **Access Levels**
   ```yaml
   emergency_access:
     level_1:
       name: "Read-Only Emergency"
       duration: "PT4H"  # 4 hours
       permissions: ["*.read"]
       approval: "automatic"
       
     level_2:
       name: "Write Emergency"
       duration: "PT2H"  # 2 hours
       permissions: ["*.read", "*.write"]
       approval: "org_admin"
       
     level_3:
       name: "Full Emergency"
       duration: "PT1H"  # 1 hour
       permissions: ["*.*"]
       approval: "superadmin"
   ```

3. **Audit Trail**
   - Real-time logging of all actions
   - Immediate notification to administrators
   - Post-incident review required
   - Compliance report generation

## Permission Caching Strategy

### Cache Levels

| Cache Type | TTL | Scope | Invalidation |
|------------|-----|-------|--------------|
| User permissions | 5 minutes | Per user | Role change |
| Standard access | 10 minutes | Per standard | Team change |
| Project membership | 15 minutes | Per project | Member change |
| Organization roles | 30 minutes | Per org | Admin action |
| System roles | 30 minutes | Global | Admin action |

### Cache Invalidation Events

- User role modification
- Team membership change
- Project assignment update
- Standard configuration change
- Emergency access activation
- Delegation creation/revocation

## Compliance and Audit

### Required Audit Events

| Event Category | Events Logged | Retention | Alert Level |
|---------------|--------------|-----------|-------------|
| **Authentication** | Login, Logout, Failed attempts | 1 year | High on failures |
| **Authorization** | Permission checks, Denials | 1 year | High on anomalies |
| **Administration** | Role changes, Delegations | 3 years | Immediate |
| **Content** | Create, Update, Delete | 3 years | Normal |
| **Emergency** | Break-glass access | 7 years | Critical |
| **Project** | Workflow transitions | 3 years | Normal |
| **Team** | Member changes | 3 years | Normal |

### Compliance Reports

1. **Daily Reports**
   - Failed authorization attempts
   - Unusual access patterns
   - Emergency access usage

2. **Weekly Reports**
   - Permission changes summary
   - Delegation status
   - Unused permissions
   - Team membership changes

3. **Monthly Reports**
   - Role utilization analysis
   - Access pattern trends
   - Compliance violations
   - Project completion rates

## Testing Matrix

### Permission Test Scenarios

| Scenario | Test Type | Frequency | Priority |
|----------|-----------|-----------|----------|
| Role inheritance | Unit | On change | Critical |
| Team permissions | Integration | Daily | High |
| Cross-standard access | Integration | Daily | High |
| Project permissions | Integration | Daily | High |
| Organization cascading | Integration | Daily | Critical |
| Emergency access | Manual | Monthly | Critical |
| Delegation chains | E2E | Weekly | Medium |
| Cache invalidation | Performance | Daily | High |
| API authorization | Security | Weekly | Critical |

## Implementation Notes

### Laravel Implementation

```php
// Permission resolution through Gates
Gate::define('standard.edit', function (User $user, Standard $standard) {
    return $user->hasStandardPermission($standard, 'edit');
});

// Middleware for context resolution
Route::middleware([
    'auth',
    'resolve.organization',
    'resolve.standard',
    'collect.permissions',
])->group(function () {
    // Routes here
});
```

### Filament Implementation

```php
// Resource authorization
public static function can(string $action, Model $record = null): bool
{
    return match($action) {
        'viewAny' => auth()->user()->hasPermission('standard.read'),
        'create' => auth()->user()->hasPermission('standard.create'),
        'update' => auth()->user()->hasStandardPermission($record, 'edit'),
        default => false
    };
}
```

This comprehensive permission matrix ensures consistent and secure access control across all platform features while maintaining flexibility for various collaboration scenarios.