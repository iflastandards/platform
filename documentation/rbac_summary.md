# Role-Based Access Control (RBAC) System Summary for IFLA Standards Platform

## Overview
The IFLA Standards Platform employs a robust role-based access control (RBAC) system to manage permissions and access levels across various parts of the application. This document summarizes the key components and observations regarding the RBAC system currently implemented.

## Implementation Components

### 1. RBAC Implementation Plan (`developer_notes/rbac-implementation-plan.md`)
- **Permission Model**: The system uses a three-tier permission model encompassing System Level, Review Group Level, and Site Level.
- **Roles**: Key roles include system-admin, ifla-admin, review group (rg)-admin, site-admin, editors, contributors, reviewers, translators, and specialized translator roles scoped by review group or site.
- **Technology**: Utilizes Cerbos for policy management, NextAuth with GitHub OAuth for authentication, and includes role testing tools and mock authentication support.

### 2. Test Scenarios (`fixtures/test-scenarios.yaml`)
- **Test Cases**: Tests verify access permissions for various roles, confirming actions like management control, content editing, and translation permissions.
- **Role-Specific Actions**: Scenarios show detailed permission checks for roles like system admin, group admins, site admins, editors, reviewers, and translators.

### 3. Authorization Utilities (`apps/admin/src/lib/authorization.ts`)
- **User Role Structures**: Defines structures for system role, review group admin roles, team memberships, and translation roles.
- **Resource Management**: Manages permissions based on resource types such as reviewGroup, namespace, project, etc., using Cerbos policy checks.
- **Utility Functions and Middleware**: Provides functions to determine action permissions and middleware guards for API routes.

### 4. Site Management Component (`packages/theme/src/components/SiteManagement/index.tsx`)
- **UI Features**: Tabbed interface for managing site components like Overview, Content Management, Team Management, etc.
- **Role-Based Interface**: Although buttons for actions are clickable, they are disabled by default and need role-based enablement using authorization utilities.

## Roles and Authorization Observations
- **Hierarchical Role Scopes**: System-level roles encompass global permissions, while other roles manage permissions within specific scopes.
- **Resource-Specific Permissions**: Fine-grained permissions enforced by Cerbos policies allow precise control over user actions.
- **Integration with GitHub and Clerk**: GitHub teams and OAuth flow infer roles, with Clerk metadata and Cerbos for enforcement.

## Gaps and Recommendations
- **UI and Policy Integration**: Implement UI gating based on roles, enabling actions per user role as enforced by Cerbos checks.
- **Mapping Roles to UI**: Develop a matrix to align SiteManagement UI components with role-based permissions and actions.
- **Detailed Role Matrices**: Extend role matrices to cover project manager/admin roles and project-related scopes.
- **Audit and Validation**: Expand validation to ensure UI interactions align with backend permissions.

## Next Steps
- **Role-Based UI Components**: Activate SiteManagement UI actions based on Cerbos policy validations.
- **Documentation and Mapping**: Create a comprehensive document or map detailing actions, roles, and necessary permissions for UI control.
- **Policy Review and Coverage**: Examine specialized roles or exceptions in current policies, covering scenarios like language-specific roles.

## Summary
The RBAC system on IFLA's platform is sophisticated in backend configuration but requires UI-side implementation to reflect these permissions adequately. Improved documentation, role mapping, and UI enforcement will align frontend actions with established backend roles and permissions.
