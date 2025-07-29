# Role-Based Access Control (RBAC) Authorization Model

**Version:** 1.0  
**Date:** January 2025  
**Status:** Authoritative Reference  
**Purpose:** Complete RBAC specification for the IFLA Standards Platform

## Executive Summary

This document provides the authoritative reference for the Role-Based Access Control (RBAC) system implemented in the IFLA Standards Platform. It defines all roles, their hierarchical relationships, permissions, and access control mechanisms across the platform's various components.

## Core Principles

1. **Principle of Least Privilege**: Users receive only the minimum permissions necessary for their responsibilities
2. **Hierarchical Inheritance**: Higher roles inherit all permissions of lower roles within their domain
3. **Resource-Based Control**: Permissions are tied to specific resources (namespaces, projects)
4. **Time-Bounded Access**: Temporary permissions expire automatically
5. **Audit Trail**: All permission changes and privileged actions are logged

## Role Hierarchy

### System-Level Roles

```
Superadmin (Platform Authority)
    ↓
Review Group Admin (Review Group Authority)
    ↓
Namespace Admin (Namespace Authority)
    ↓
Namespace Editor (Content Authority)
    ↓
Namespace Translator (Translation Authority)
    ↓
Namespace Reviewer (Review Authority)
```

### Project-Based Roles

```
Project Lead (Project Authority)
    ↓
Project Manager (Coordination Authority)
    ↓
Project Member (Contribution Authority)
    ↓
Project Contributor (Limited Authority)
```

## Detailed Role Definitions

### 1. Superadmin

**Purpose**: Global platform administration and emergency access

**Scope**: Entire platform across all organizations, review groups, and namespaces

**Key Permissions**:
- Create/delete review groups
- Assign review group administrators
- Access all namespaces regardless of review group
- Override any permission restriction
- Access system configuration
- View all audit logs
- Emergency unlock of any resource
- Manage platform-wide settings

**Typical Users**: IFLA IT administrators, platform maintainers

### 2. Review Group Admin

**Purpose**: Manage a specific review group's resources and teams

**Scope**: All namespaces within assigned review group(s)

**Key Permissions**:
- Create/delete namespaces within review group
- Assign namespace administrators
- Charter new projects
- Manage review group teams
- Approve major releases
- Configure review group workflows
- Temporarily unlock released versions (24-hour window)
- View review group audit logs

**Typical Users**: Review group chairs, senior committee members

### 3. Namespace Admin

**Purpose**: Full control over a specific namespace

**Scope**: Single namespace and all its resources

**Key Permissions**:
- Manage namespace configuration
- Assign namespace-level roles
- Approve content for publication
- Configure namespace workflows
- Manage element sets and concept schemes
- Initiate version releases
- Export/import bulk data
- Configure namespace integrations

**Typical Users**: Namespace maintainers, technical leads

### 4. Namespace Editor

**Purpose**: Create and maintain namespace content

**Scope**: Content within assigned namespace(s)

**Key Permissions**:
- Create/update/delete vocabulary terms
- Create/update/delete documentation pages
- Manage examples and relationships
- Create draft versions
- Use TinaCMS for content editing (draft only)
- Submit content for review
- Import/export content (with approval)

**Typical Users**: Subject matter experts, content creators

### 5. Namespace Translator

**Purpose**: Manage translations for namespace content

**Scope**: Translation fields within assigned namespace(s) and language(s)

**Key Permissions**:
- Edit translation fields only
- Cannot modify core metadata (URIs, types, relationships)
- Access translation spreadsheets
- Submit translation pull requests
- Participate in translation reviews
- Flag content for retranslation

**Typical Users**: Professional translators, bilingual subject experts

### 6. Namespace Reviewer

**Purpose**: Quality assurance and content review

**Scope**: Review and comment permissions within assigned namespace(s)

**Key Permissions**:
- Comment on pull requests
- Participate in review workflows
- Suggest changes (cannot directly edit)
- Approve/reject in review workflows
- Access preview environments
- Create issues for problems found

**Typical Users**: External reviewers, quality assurance specialists

### 7. Project Lead

**Purpose**: Manage time-bounded projects across namespaces

**Scope**: All resources assigned to the project

**Key Permissions**:
- Full control over project settings
- Manage project team members
- Assign project-specific permissions
- Access all project namespaces
- Create project boards and milestones
- Archive completed projects
- Override project member permissions

**Typical Users**: Project managers, initiative leaders

### 8. Project Manager

**Purpose**: Coordinate project activities and team

**Scope**: Project coordination and team management

**Key Permissions**:
- Manage project boards and issues
- Assign tasks to team members
- Update project documentation
- Coordinate with namespace admins
- Cannot modify project charter
- Cannot change namespace permissions

**Note**: This role is a specialized subset of Project Lead with focus on coordination rather than authority

### 9. Project Member

**Purpose**: Contribute to project objectives

**Scope**: Assigned namespaces within project boundaries

**Key Permissions**:
- Read all project resources
- Write to assigned namespaces only
- Create and manage own pull requests
- Participate in project discussions
- Update assigned issues
- Cannot modify project settings

**Typical Users**: Regular contributors, team members

### 10. Project Contributor

**Purpose**: Limited participation in projects

**Scope**: Specific branches or resources within project

**Key Permissions**:
- Work on project-specific branches
- Submit pull requests
- Comment on issues
- Read project documentation
- Cannot directly modify main branches
- Cannot access sensitive project data

**Typical Users**: External contributors, temporary participants

## Permission Categories

### 1. System Permissions
- `system.admin`: Full system administration
- `system.config`: Modify system configuration
- `system.audit`: View all audit logs
- `system.emergency`: Emergency override access

### 2. Review Group Permissions
- `rg.create`: Create new namespaces
- `rg.delete`: Delete namespaces
- `rg.admin`: Administer review group
- `rg.charter`: Charter new projects

### 3. Namespace Permissions
- `ns.read`: View namespace content
- `ns.write`: Modify namespace content
- `ns.delete`: Delete namespace resources
- `ns.publish`: Publish new versions
- `ns.config`: Configure namespace settings
- `ns.team`: Manage namespace team

### 4. Content Permissions
- `content.create`: Create new content
- `content.edit`: Edit existing content
- `content.delete`: Delete content
- `content.translate`: Edit translations
- `content.review`: Review and comment
- `content.approve`: Approve for publication

### 5. Project Permissions
- `project.admin`: Full project control
- `project.manage`: Manage project activities
- `project.contribute`: Contribute to project
- `project.view`: View project resources

## Sitemanagement Component Access Control

### Namespace Management Tabs

#### 1. Overview Tab
- **Access Level**: All authenticated users with namespace access
- **Permissions Required**: `ns.read`
- **Features Available by Role**:
  - All roles: View statistics, activity feed
  - Editor+: Quick actions for content creation
  - Admin+: Administrative quick actions

#### 2. Content Tab
- **Access Level**: Namespace Editor and above
- **Permissions Required**: `content.create` OR `content.edit`
- **Features Available by Role**:
  - Editor: CRUD operations on content
  - Admin: Bulk operations, import/export
  - Translator: View-only with translation overlay

#### 3. Versions Tab
- **Access Level**: Namespace Admin and above
- **Permissions Required**: `ns.publish`
- **Features Available by Role**:
  - Admin: Create versions, publish, rollback
  - RG Admin: Emergency unlock capabilities
  - Others: View version history only

#### 4. Team Tab
- **Access Level**: Namespace Admin and above
- **Permissions Required**: `ns.team`
- **Features Available by Role**:
  - Admin: Add/remove members, change roles
  - RG Admin: Override team assignments
  - Others: View team list only

#### 5. Settings Tab
- **Access Level**: Namespace Admin and above
- **Permissions Required**: `ns.config`
- **Features Available by Role**:
  - Admin: All configuration options
  - RG Admin: Additional workflow configurations
  - Superadmin: System integration settings

### Project Management Interface

#### Project Dashboard
- **Access Control**: Based on project membership
- **Tab Visibility**:
  - Charter: Project Lead only
  - Board: All project members
  - Team: Project Lead and Manager
  - Analytics: Project Lead and Manager

## Special Permission Rules

### 1. Version Locking
- Released versions are locked by default
- Only Review Group Admin and above can unlock
- Unlock duration: 24 hours maximum
- All unlock actions are audited

### 2. Translation Workflows
- Translators work in isolated translation mode
- Cannot modify structural metadata
- English modification suggestions create review tasks
- Review Group Admin must approve English changes

### 3. External Contributors
- Must work through fork-and-PR workflow
- Cannot directly access TinaCMS
- Contributions require member approval
- Limited to public namespaces

### 4. Emergency Access
- Superadmin can override any restriction
- All emergency access is logged
- Requires additional authentication
- Time-limited to 4 hours

### 5. Delegation Rules
- Admins can delegate specific permissions
- Delegations are time-bounded
- Cannot delegate higher than own level
- Delegation chains are limited to 1 level

## Cross-Project Permissions

### Harmonization Projects
When projects span multiple namespaces:
- Project permissions overlay namespace permissions
- Most restrictive permission wins in conflicts
- Temporary elevation possible with approval
- Audit trail maintains source of permission

### Translation Coordination
For cross-namespace translation projects:
- Translator role applies across assigned namespaces
- Coordination through project interface
- Language-specific permissions possible
- Bulk operations require Project Lead approval

## Permission Conflict Resolution

### Priority Order
1. Explicit denial (blocklist)
2. System-level permissions
3. Review group permissions
4. Project permissions
5. Namespace permissions
6. Inherited permissions

### Conflict Examples
- User is Namespace Editor but Project limits to read-only → Read-only wins
- User is Project Lead but not Review Group member → Limited to project resources
- User has multiple roles → Highest applicable permission applies

## API Permission Implementation

### Permission Check Endpoint
```typescript
GET /api/admin/users/me/permissions

Response:
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "globalRole": "none|superadmin"
  },
  "permissions": {
    "system": ["system.audit"],
    "reviewGroups": {
      "rg_isbd": {
        "role": "admin",
        "permissions": ["rg.create", "rg.delete", "rg.admin", "rg.charter"]
      }
    },
    "namespaces": {
      "ns_isbd": {
        "role": "editor",
        "permissions": ["ns.read", "content.create", "content.edit"]
      }
    },
    "projects": {
      "proj_123": {
        "role": "member",
        "permissions": ["project.contribute", "project.view"],
        "namespaceAccess": ["ns_isbd", "ns_isbdm"]
      }
    }
  },
  "effectivePermissions": {
    "ns_isbd": ["ns.read", "content.create", "content.edit", "content.translate"]
  }
}
```

### Permission Checking Logic
```typescript
// Cerbos policy example
function canUserEditContent(user: User, namespace: string, content: Content): boolean {
  // Check explicit permissions
  if (user.hasSystemPermission('system.admin')) return true;
  
  // Check review group admin
  if (user.isReviewGroupAdmin(namespace.reviewGroup)) return true;
  
  // Check namespace permissions
  if (user.hasNamespacePermission(namespace, 'content.edit')) {
    // Additional checks for locked content
    if (content.isLocked && !user.hasNamespacePermission(namespace, 'ns.admin')) {
      return false;
    }
    return true;
  }
  
  // Check project permissions
  const projectAccess = user.getProjectAccess(namespace);
  if (projectAccess?.includes('content.edit')) return true;
  
  return false;
}
```

## Security Considerations

### Authentication Requirements
- All roles require GitHub organization membership
- Additional authentication for elevated actions
- Session timeout varies by role sensitivity
- MFA required for Admin roles

### Audit Requirements
- All permission changes logged
- Privileged action logging
- Failed authorization attempts tracked
- Regular permission audits required

### Data Protection
- Role assignments are encrypted at rest
- Permission caches expire after 5 minutes
- No permission data in client storage
- API tokens include permission scope

## Implementation Guidelines

### Frontend Implementation
- Tab visibility controlled by permission checks
- Buttons/actions hidden when unauthorized
- Graceful degradation for limited permissions
- Clear permission error messages

### Backend Implementation
- Cerbos policies for all endpoints
- Middleware for permission checking
- Resource-level permission validation
- Batch permission checks for performance

### Testing Requirements
- Unit tests for each permission combination
- Integration tests for permission inheritance
- E2E tests for critical workflows
- Regular permission penetration testing

## Future Enhancements

### Planned Features
1. **Custom Roles**: Organization-specific role definitions
2. **Attribute-Based Access**: Geographic or expertise-based permissions
3. **Permission Templates**: Reusable permission sets
4. **Temporary Elevation**: Request higher permissions for specific tasks
5. **Permission Analytics**: Usage and optimization reports

### Version 2.0 Considerations
- GraphQL-based permission queries
- Real-time permission updates
- Machine learning for anomaly detection
- Blockchain audit trail for critical changes

This RBAC model provides comprehensive access control for the IFLA Standards Platform while maintaining flexibility for future enhancements and special use cases.