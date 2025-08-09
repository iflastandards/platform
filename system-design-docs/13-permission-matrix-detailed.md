# Detailed Permission Matrix

**Version:** 1.0  
**Date:** July 2025  
**Status:** Authoritative Reference  
**Purpose:** Comprehensive permission mappings for all platform activities

## Overview

This document provides detailed permission matrices that map every platform activity to the roles that can perform them. It serves as the implementation reference for developers and the operational guide for administrators.

## Activity-Based Permission Matrix

### Namespace Management Activities

| Activity | Superadmin | RG Admin | NS Admin | NS Editor | NS Translator | NS Reviewer | Project Lead | Project Member |
|----------|:----------:|:--------:|:--------:|:---------:|:-------------:|:-----------:|:------------:|:--------------:|
| **Namespace Creation** |
| Create namespace | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Delete namespace | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Archive namespace | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Configure namespace | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Content Management (Namespace-Level Authorization)** |
| Create vocabulary/elementSet | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓¹ |
| Edit vocabulary/elementSet | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✓¹ |
| Delete vocabulary/elementSet | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Edit released vocabulary/elementSet | ✓ | ✓² | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Translation** |
| Edit translations | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓¹ |
| Approve translations | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Export for translation | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| Import translations | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| **Version Control** |
| Create version | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Publish version | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Rollback version | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Tag release | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Import/Export (Namespace-Level Authorization)** |
| Import vocabulary/elementSet | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Export vocabulary/elementSet | ✓ | ✓ | ✓ | ✓ | ✓³ | ✓⁴ | ✓ | ✓¹ |
| Bulk operations on namespace content | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |

**Notes:**
- ¹ Only for assigned namespaces within project scope
- ² Requires temporary unlock (24-hour window)
- ³ Translation fields only
- ⁴ Read-only export for review purposes

**IMPORTANT**: All vocabulary and element set operations are authorized at the namespace level. There are no vocabulary-specific permissions. Users with namespace access can perform actions on ALL vocabularies and element sets within that namespace according to their role level.

### Project Management Activities

| Activity | Superadmin | RG Admin | Project Lead | Project Manager | Project Member | Project Contributor |
|----------|:----------:|:--------:|:------------:|:--------------:|:--------------:|:------------------:|
| **Project Lifecycle** |
| Create project | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Archive project | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete project | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Charter Management** |
| Create charter | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Edit charter | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Approve charter | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Team Management** |
| Add team members | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Remove members | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Assign roles | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| **Board Management** |
| Create columns | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Move cards | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Create cards | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Resource Access** |
| Assign namespaces | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Set permissions | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| View analytics | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |

### User & Team Management Activities

| Activity | Superadmin | RG Admin | NS Admin | Project Lead |
|----------|:----------:|:--------:|:--------:|:------------:|
| **User Management** |
| Invite users | ✓ | ✓¹ | ✓² | ✓³ |
| Remove users | ✓ | ✓¹ | ✓² | ✓³ |
| Assign roles | ✓ | ✓¹ | ✓² | ✓³ |
| View user activity | ✓ | ✓¹ | ✓² | ✓³ |
| **Permission Management** |
| Grant system roles | ✓ | ✗ | ✗ | ✗ |
| Grant RG roles | ✓ | ✓ | ✗ | ✗ |
| Grant NS roles | ✓ | ✓ | ✓ | ✗ |
| Grant project roles | ✓ | ✓ | ✗ | ✓ |
| **Delegation** |
| Delegate permissions | ✓ | ✓ | ✓ | ✓ |
| Set time bounds | ✓ | ✓ | ✓ | ✓ |
| Revoke delegation | ✓ | ✓ | ✓ | ✓ |

**Notes:**
- ¹ Within review group scope only
- ² Within namespace scope only
- ³ Within project scope only

### System Administration Activities

| Activity | Superadmin | RG Admin | NS Admin |
|----------|:----------:|:--------:|:--------:|
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
- ¹ Review group scope only
- ² Namespace scope only
- ³ 24-hour time limit

## Tab-Level Access Control

### Namespace Detail Page (`/admin/namespaces/:nsId`)

| Tab | View Access | Edit Access | Required Permission |
|-----|-------------|-------------|-------------------|
| **Overview** | All authenticated users | N/A | `ns.read` |
| **Content** | All authenticated users | NS Editor+ | `content.edit` |
| **Versions** | All authenticated users | NS Admin+ | `ns.publish` |
| **Team** | All authenticated users | NS Admin+ | `ns.team` |
| **Settings** | NS Admin+ | NS Admin+ | `ns.config` |

### Project Detail Page (`/admin/projects/:projectId`)

| Tab | View Access | Edit Access | Required Permission |
|-----|-------------|-------------|-------------------|
| **Dashboard** | Project members | N/A | `project.view` |
| **Charter** | Project members | Project Lead | `project.admin` |
| **Board** | Project members | Project members | `project.contribute` |
| **Team** | Project members | Project Lead/Manager | `project.manage` |
| **Analytics** | Project Lead/Manager | N/A | `project.manage` |

### Review Group Page (`/admin/review-groups/:rgId`)

| Tab | View Access | Edit Access | Required Permission |
|-----|-------------|-------------|-------------------|
| **Overview** | RG members | N/A | `rg.view` |
| **Namespaces** | RG members | RG Admin | `rg.admin` |
| **Projects** | RG members | RG Admin | `rg.charter` |
| **Team** | RG members | RG Admin | `rg.admin` |
| **Settings** | RG Admin | RG Admin | `rg.admin` |

## API Endpoint Permission Mapping

### Authentication Endpoints

| Endpoint | Method | Required Permission | Notes |
|----------|--------|-------------------|-------|
| `/api/admin/auth/signin` | POST | None | Public endpoint |
| `/api/admin/auth/callback` | GET | None | OAuth callback |
| `/api/admin/auth/session` | GET | Authenticated | Any valid session |
| `/api/admin/auth/signout` | POST | Authenticated | Any valid session |
| `/api/admin/users/me` | GET | Authenticated | Returns own profile |
| `/api/admin/users/me/permissions` | GET | Authenticated | Returns own permissions |

### Namespace Management Endpoints

| Endpoint | Method | Required Permission | Notes |
|----------|--------|-------------------|-------|
| `/api/admin/namespaces` | GET | `ns.read` | Filtered by permissions |
| `/api/admin/namespaces` | POST | `rg.create` | RG Admin only |
| `/api/admin/namespaces/:id` | GET | `ns.read` | Namespace-specific |
| `/api/admin/namespaces/:id` | PUT | `ns.config` | NS Admin only |
| `/api/admin/namespaces/:id` | DELETE | `rg.delete` | RG Admin only |
| `/api/admin/namespaces/:id/vocabularies` | GET | `ns.read` | Any authorized user |
| `/api/admin/namespaces/:id/vocabularies` | POST | `content.create` | NS Editor+ |
| `/api/admin/vocabularies/:id` | GET | `ns.read` | Namespace access required |
| `/api/admin/vocabularies/:id` | PUT | `content.edit` | NS Editor+ in vocabulary's namespace |
| `/api/admin/vocabularies/:id` | DELETE | `content.delete` | NS Editor+ in vocabulary's namespace |
| `/api/admin/namespaces/:id/versions` | GET | `ns.read` | Any authorized user |
| `/api/admin/namespaces/:id/versions` | POST | `ns.publish` | NS Admin+ |
| `/api/admin/namespaces/:id/publish` | POST | `ns.publish` | NS Admin+ |
| `/api/admin/namespaces/:id/lock` | POST | `rg.admin` | RG Admin only |
| `/api/admin/namespaces/:id/unlock` | POST | `rg.admin` | RG Admin only |

### Project Management Endpoints

| Endpoint | Method | Required Permission | Notes |
|----------|--------|-------------------|-------|
| `/api/admin/projects` | GET | Authenticated | Filtered by membership |
| `/api/admin/projects` | POST | `rg.charter` | RG Admin only |
| `/api/admin/projects/:id` | GET | `project.view` | Project members |
| `/api/admin/projects/:id` | PUT | `project.admin` | Project Lead only |
| `/api/admin/projects/:id` | DELETE | `rg.admin` | RG Admin only |
| `/api/admin/projects/:id/charter` | GET | `project.view` | Project members |
| `/api/admin/projects/:id/charter` | PUT | `project.admin` | Project Lead only |
| `/api/admin/projects/:id/teams` | GET | `project.view` | Project members |
| `/api/admin/projects/:id/teams` | POST | `project.manage` | Lead/Manager |
| `/api/admin/projects/:id/board` | GET | `project.view` | Project members |
| `/api/admin/projects/:id/board` | PUT | `project.contribute` | Project members |

### Translation Management Endpoints

| Endpoint | Method | Required Permission | Notes |
|----------|--------|-------------------|-------|
| `/api/admin/translations` | GET | `ns.read` | Filtered by namespace |
| `/api/admin/translations/:nsId/export` | POST | `content.translate` | Translator+ |
| `/api/admin/translations/:nsId/import` | POST | `content.edit` | NS Editor+ |
| `/api/admin/translations/:nsId/:lang` | GET | `ns.read` | Any authorized |
| `/api/admin/translations/:nsId/:lang` | PUT | `content.translate` | Translator+ |

## Time-Based Permission Rules

### Temporary Permissions

| Permission Type | Maximum Duration | Approval Required | Auto-Expire |
|----------------|-----------------|------------------|-------------|
| Emergency unlock | 24 hours | RG Admin | Yes |
| Project membership | Project duration | Project Lead | Yes |
| Delegation | 30 days | Role owner | Yes |
| Review access | 14 days | NS Admin | Yes |
| Translation sprint | 90 days | NS Admin | Yes |

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
     ns_admin:
       can_delegate: ["content.edit", "content.create", "content.review"]
       cannot_delegate: ["ns.config", "ns.publish", "ns.team"]
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
       approval: "rg_admin"
       
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
| Namespace access | 10 minutes | Per namespace | Team change |
| Project membership | 15 minutes | Per project | Member change |
| System roles | 30 minutes | Global | Admin action |

### Cache Invalidation Events

- User role modification
- Team membership change
- Project assignment update
- Namespace configuration change
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

### Compliance Reports

1. **Daily Reports**
   - Failed authorization attempts
   - Unusual access patterns
   - Emergency access usage

2. **Weekly Reports**
   - Permission changes summary
   - Delegation status
   - Unused permissions

3. **Monthly Reports**
   - Role utilization analysis
   - Access pattern trends
   - Compliance violations

## Testing Matrix

### Permission Test Scenarios

| Scenario | Test Type | Frequency | Priority |
|----------|-----------|-----------|----------|
| Role inheritance | Unit | On change | Critical |
| Cross-namespace access | Integration | Daily | High |
| Project permissions | Integration | Daily | High |
| Emergency access | Manual | Monthly | Critical |
| Delegation chains | E2E | Weekly | Medium |
| Cache invalidation | Performance | Daily | High |
| API authorization | Security | Weekly | Critical |

This comprehensive permission matrix ensures consistent and secure access control across all platform features while maintaining flexibility for various collaboration scenarios.
