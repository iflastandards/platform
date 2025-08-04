# Admin Routes Implementation Plan

## Overview

This document outlines a practical implementation approach for admin routes based on the comprehensive permission matrix in `system-design-docs/13-permission-matrix-detailed.md`. Since very little of the complex permission system has been implemented, this provides a simplified MVP approach that can evolve into the full system.

## Current State

- Basic authentication implemented (GitHub OAuth)
- Site-specific dashboards exist at `/admin/dashboard/[siteKey]`
- Most of the complex permission system from the design docs is not yet implemented

## Recommended MVP Route Structure

### 1. Authentication Routes (Public)
```
/admin/signin                 # Sign in page
/admin/auth/callback         # OAuth callback
/admin/signout              # Sign out (redirects to signin)
```

### 2. Main Dashboard (Authenticated)
```
/admin/dashboard            # Unified dashboard showing all accessible sites
```
Instead of separate role-specific dashboards (admin/author/editor), use a single dashboard that adapts based on user permissions.

### 3. Site/Namespace Management
```
/admin/sites                        # List all sites user can access
/admin/sites/[siteKey]             # Site overview/dashboard
/admin/sites/[siteKey]/content     # Content management
/admin/sites/[siteKey]/team        # Team members (if admin)
/admin/sites/[siteKey]/settings    # Site settings (if admin)
```

### 4. User & Team Management (Admin Only)
```
/admin/users                # User management (superadmin only)
/admin/users/[userId]       # User details/edit
/admin/teams               # Team overview
```

### 5. Profile & Settings
```
/admin/profile             # Current user's profile
/admin/settings           # Platform settings (superadmin only)
```

## Simplified Permission Model for MVP

Instead of the 8+ role system in the design docs, start with 4 basic roles:

### Core Roles

| Role | Description | Permissions |
|------|-------------|------------|
| **Superadmin** | Platform administrator | Full access to everything |
| **Site Admin** | Site/namespace administrator | Full access to assigned sites |
| **Site Editor** | Content manager | Create/edit/delete content in assigned sites |
| **Viewer** | Read-only user | View content in assigned sites |

### Permission Checks

```typescript
// Simple permission structure
interface UserPermissions {
  role: 'superadmin' | 'site_admin' | 'site_editor' | 'viewer';
  sites: string[]; // Array of siteKeys user has access to
}

// Route protection examples
const canAccessSite = (user: User, siteKey: string) => {
  return user.role === 'superadmin' || user.sites.includes(siteKey);
};

const canEditContent = (user: User, siteKey: string) => {
  return canAccessSite(user, siteKey) && 
         ['superadmin', 'site_admin', 'site_editor'].includes(user.role);
};

const canManageSite = (user: User, siteKey: string) => {
  return user.role === 'superadmin' || 
         (user.role === 'site_admin' && user.sites.includes(siteKey));
};
```

## Route Protection Implementation

### Middleware Approach

```typescript
// middleware.ts
const routePermissions = {
  '/admin/dashboard': ['authenticated'],
  '/admin/sites': ['authenticated'],
  '/admin/sites/[siteKey]': ['site.view'],
  '/admin/sites/[siteKey]/content': ['site.edit'],
  '/admin/sites/[siteKey]/team': ['site.admin'],
  '/admin/sites/[siteKey]/settings': ['site.admin'],
  '/admin/users': ['system.admin'],
  '/admin/settings': ['system.admin'],
};
```

### API Routes

Matching API routes for the UI:

```
GET    /api/admin/auth/session      # Get current session
POST   /api/admin/auth/signin       # Sign in
POST   /api/admin/auth/signout      # Sign out

GET    /api/admin/users/me          # Current user profile
GET    /api/admin/users/me/sites    # Sites user has access to

GET    /api/admin/sites             # List accessible sites
GET    /api/admin/sites/[siteKey]   # Get site details
PUT    /api/admin/sites/[siteKey]   # Update site (admin only)

GET    /api/admin/sites/[siteKey]/content     # List content
POST   /api/admin/sites/[siteKey]/content     # Create content
PUT    /api/admin/sites/[siteKey]/content/[id] # Update content
DELETE /api/admin/sites/[siteKey]/content/[id] # Delete content

GET    /api/admin/users             # List all users (superadmin)
GET    /api/admin/users/[userId]    # Get user details (superadmin)
PUT    /api/admin/users/[userId]    # Update user (superadmin)
```

## Migration Path to Full System

This MVP can evolve into the full permission system:

### Phase 1: MVP (Current Focus)
- 4 basic roles
- Site-level permissions
- Simple role checks

### Phase 2: Review Groups
- Add Review Group layer above sites
- Introduce RG Admin role
- Group multiple sites under review groups

### Phase 3: Advanced Roles
- Add specialized roles (Translator, Reviewer)
- Implement role inheritance
- Add namespace-specific permissions

### Phase 4: Projects & Collaboration
- Add project management
- Cross-site collaboration
- Temporary project-based permissions

### Phase 5: Advanced Features
- Time-based permissions
- Delegation mechanisms
- Emergency access procedures
- Audit trails

## Implementation Notes

1. **Start Simple**: The current `/admin/dashboard/[siteKey]` structure already aligns with this model
2. **Use Existing Auth**: Leverage the GitHub OAuth that's already implemented
3. **Progressive Enhancement**: Add complexity only as needed
4. **Database Considerations**: Design the permission tables to support future complexity

## Database Schema (Simplified)

```sql
-- Basic permission tables for MVP
CREATE TABLE user_roles (
  user_id VARCHAR(255) PRIMARY KEY,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_site_access (
  user_id VARCHAR(255),
  site_key VARCHAR(100),
  permission_level VARCHAR(50), -- 'admin', 'editor', 'viewer'
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, site_key)
);
```

## Next Steps

1. Implement the simplified permission model
2. Create middleware for route protection
3. Build the unified dashboard
4. Add site management pages
5. Test with different user roles
6. Plan migration to more complex permissions as needed

This approach provides a solid foundation that can grow with the platform's needs while avoiding over-engineering the initial implementation.