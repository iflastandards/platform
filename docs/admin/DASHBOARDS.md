# Admin App Dashboard Documentation

## Overview

The IFLA Standards Admin App features a sophisticated, role-based dashboard system designed to provide different levels of access and functionality based on user permissions. This document details the architecture, features, and implementation of each dashboard type.

### Key Concept: Sites as Namespaces

**Important**: In our system, each site represents a namespace. All 'site' functions are actually namespace-related operations. This means:
- Site management = Namespace management
- Site roles = Namespace-specific permissions
- Site dashboards = Namespace dashboards

**Special Cases**: 
- **Portal**: Not a standard namespace - it's the main IFLA standards portal managed exclusively by superadmins
- **Newtest**: Not a standard namespace - it's a development/testing environment managed exclusively by superadmins

## Table of Contents

1. [Dashboard Architecture](#dashboard-architecture)
2. [Dashboard Types](#dashboard-types)
3. [Role-Based Access Control](#role-based-access-control)
4. [Implementation Details](#implementation-details)
5. [Navigation Flow](#navigation-flow)
6. [API Integration](#api-integration)

## Dashboard Architecture

The dashboard system follows a hierarchical structure with progressive disclosure based on user roles:

```
/dashboard (RoleBasedDashboard) ← Universal entry point
├── /dashboard/admin (AdminDashboard) ← Super admins only
├── /dashboard/rg (ReviewGroupDashboard) ← Review group admins
└── /dashboard/[siteKey] (SiteManagementDashboard) ← Namespace-specific roles
    ├── /dashboard/portal ← Special case: superadmin-only portal management
    ├── /dashboard/isbdm ← Standard namespace dashboard
    ├── /dashboard/lrm ← Standard namespace dashboard
    └── ... (other namespace dashboards)

/namespaces/[namespace] (NamespaceDashboard) ← Direct namespace management
```

## Dashboard Types

### 1. RoleBasedDashboard (`/dashboard`)

**Purpose**: Main entry dashboard that adapts content based on user role

**File Location**: `/apps/admin/src/app/dashboard/RoleBasedDashboard.tsx`

**Access**: All authenticated users

**Key Features**:
- Dynamic content based on `user.publicMetadata.iflaRole`
- Personalized welcome message with user's name and roles
- Namespace cards showing user's accessible namespaces
- Admin-only sections for system statistics and activity feeds
- Tabbed interface with role-appropriate content

**Component Structure**:
```typescript
interface RoleBasedDashboardProps {
  userRoles: string[];
  userName?: string;
  userEmail?: string;
  userNamespaces: Array<{
    id: string;
    name: string;
    // ... other namespace properties
  }>;
}
```

### 2. AdminDashboard (`/dashboard/admin`)

**Purpose**: System-wide control center for super administrators

**File Location**: `/apps/admin/src/app/dashboard/AdminDashboard.tsx`

**Access Requirement**: 
```typescript
user.publicMetadata.iflaRole === 'admin'
```

**Key Features**:
- Full administrative sidebar navigation
- System statistics cards:
  - Total Users
  - Active Projects
  - Total Vocabularies
- Real-time system status monitoring:
  - GitHub API status
  - Cerbos PDP status
  - Vocabulary Server status
  - Build System status
- Complete activity feed across all namespaces
- Quick administrative actions
- Dark/light theme toggle

**Navigation Structure**:
```typescript
const sidebarItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard/admin' },
  { key: 'users', label: 'User Management', icon: <PeopleIcon />, href: '/dashboard/admin/users' },
  { key: 'projects', label: 'All Projects', icon: <AssignmentIcon />, href: '/dashboard/admin/projects' },
  { key: 'vocabularies', label: 'Vocabularies', icon: <LocalLibraryIcon />, href: '/dashboard/admin/vocabularies' },
  { key: 'github', label: 'GitHub Integration', icon: <GitHubIcon />, href: '/dashboard/admin/github' },
  { key: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, href: '/dashboard/admin/analytics' },
  { key: 'settings', label: 'System Settings', icon: <SettingsIcon />, href: '/dashboard/admin/settings' },
];
```

### 3. ReviewGroupDashboard (`/dashboard/rg`)

**Purpose**: Dashboard for Review Group administrators to manage their teams and namespaces

**File Location**: `/apps/admin/src/app/dashboard/rg/ReviewGroupDashboard.tsx`

**Access Requirement**:
```typescript
user.publicMetadata.reviewGroupAdmin?.length > 0
```

**Key Features**:
- Review group identification display
- Statistics specific to managed namespaces:
  - My Namespaces count
  - Active Projects
  - Team Members
- Namespace cards with detailed statistics:
  - Elements and concepts count
  - Translation languages
  - Contributors
  - Version and publication status
- Recent activity feed filtered for review groups
- Quick actions for project and team management

**Review Groups**:
- **ISBD**: International Standard Bibliographic Description
- **BCM**: Bibliographic Conceptual Models
- **ICP**: International Cataloguing Principles
- **PUC**: Permanent UNIMARC Committee

### 4. SiteManagementDashboard (`/dashboard/[siteKey]`)

**Purpose**: Namespace-specific management interface for users with namespace roles

**File Location**: `/apps/admin/src/app/dashboard/[siteKey]/page.tsx`

**Important**: Despite the naming convention using 'site', this dashboard manages namespaces. Each siteKey corresponds to a namespace.

**Access Patterns**:

```typescript
// Namespace-specific roles follow the pattern:
// {namespace}-admin | {namespace}-editor | {namespace}-contributor

// Examples:
isbdm-admin, isbdm-editor, isbdm-contributor  // Standard namespace roles
lrm-admin, lrm-editor, lrm-contributor        // Standard namespace roles

// Special cases (superadmin-only):
portal-admin  // Only superadmins can have portal roles
newtest-admin // Only superadmins can have newtest roles
```

**Supported Namespaces**:
| Namespace Key | Full Name | Description | Type |
|---------------|-----------|-------------|------|
| portal | IFLA Portal | Main IFLA standards portal | Special (superadmin-only) |
| newtest | Test Site | Development and testing | Special (superadmin-only) |
| isbdm | ISBD Manifestation | ISBD for manifestations | Standard namespace |
| lrm | Library Reference Model | Conceptual reference model | Standard namespace |
| frbr | FRBR | Functional Requirements for Bibliographic Records | Standard namespace |
| isbd | ISBD | International Standard Bibliographic Description | Standard namespace |
| muldicat | Multilingual Dictionary | Cataloguing terms dictionary | Standard namespace |
| unimarc | UNIMARC | Universal MARC format | Standard namespace |

### 5. NamespaceDashboard (`/namespaces/[namespace]`)

**Purpose**: Direct namespace management interface (alternative to site dashboard)

**File Location**: `/apps/admin/src/app/namespaces/[namespace]/NamespaceDashboard.tsx`

**Note**: This provides the same namespace management functionality as SiteManagementDashboard but with a clearer URL structure that reflects the actual resource being managed.

**Key Features**:
- Namespace header with description and metadata
- Status bar showing:
  - Editorial Cycle progress
  - Latest Build status
  - Open Issues count
  - Active Imports
- Tabbed interface:
  - GitHub Issues (with filtering)
  - Recent Activity
  - Projects
  - Metrics (coming soon)
- Real-time refresh capability
- Issue management with action menu

## Role-Based Access Control

### User Role Hierarchy

```typescript
interface UserPublicMetadata {
  iflaRole?: 'member' | 'staff' | 'admin';
  systemRole?: 'superadmin';
  reviewGroupAdmin?: string[];
  externalContributor?: boolean;
  sites?: Record<string, 'admin' | 'editor' | 'contributor'>; // Actually namespace permissions
}
```

### Access Control Matrix

| Dashboard | Super Admin | RG Admin | Site Roles | Regular Member |
|-----------|-------------|----------|------------|----------------|
| RoleBasedDashboard | ✅ Full features | ✅ Enhanced | ✅ Standard | ✅ Basic view |
| AdminDashboard | ✅ | ❌ | ❌ | ❌ |
| ReviewGroupDashboard | ✅ | ✅ (if assigned) | ❌ | ❌ |
| SiteManagementDashboard | ✅ | ✅ (if site in RG) | ✅ (if has role) | ❌ |
| NamespaceDashboard | ✅ | ✅ (if NS in RG) | ✅ (if access) | ✅ (if member) |

### Example User Configurations

```typescript
// Super Administrator
{
  id: "user-admin-1",
  publicMetadata: {
    iflaRole: 'admin',
    systemRole: 'superadmin',
    reviewGroupAdmin: ['isbd', 'bcm']
  }
}

// Review Group Administrator
{
  id: "user-isbd-rg-admin",
  publicMetadata: {
    iflaRole: 'staff',
    reviewGroupAdmin: ['isbd']
  }
}

// Namespace Editor (referred to as 'site' for historical reasons)
{
  id: "user-isbd-editor",
  publicMetadata: {
    iflaRole: 'member',
    sites: { isbdm: 'editor' }  // This grants editor access to the isbdm namespace
  }
}

// Regular Member
{
  id: "user-member",
  publicMetadata: {
    iflaRole: 'member'
  }
}
```

## Implementation Details

### Authentication Flow

1. **Sign In**: User authenticates via Clerk at `/sign-in`
2. **Callback**: OAuth callback processes at `/api/auth/callback`
3. **GitHub Sync**: If GitHub auth, syncs profile data and checks org ownership
4. **Role Detection**: `getDefaultDashboardRoute()` determines landing page
5. **Dashboard Routing**: User redirected to appropriate dashboard

### Route Protection

```typescript
// Middleware protection (middleware.ts)
export default clerkMiddleware(async (auth, req) => {
  const protectedRoutes = ['/dashboard', '/api/admin'];
  
  if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    await auth.protect();
  }
});
```

### Dashboard Route Resolution

```typescript
export function getDefaultDashboardRoute(user: User, isDemo: boolean = false): string {
  const demoParam = isDemo ? '?demo=true' : '';

  // Super Admin
  if (user.publicMetadata.iflaRole === 'admin') {
    return addBasePath(`/dashboard/admin${demoParam}`);
  }

  // Review Group Admin
  if (user.publicMetadata.reviewGroupAdmin?.length) {
    return addBasePath(`/dashboard/rg${demoParam}`);
  }

  // Regular users
  return addBasePath(`/dashboard${demoParam}`);
}
```

## Navigation Flow

### User Journey

```mermaid
graph TD
    A[User Login] --> B{Authentication}
    B -->|Success| C[/api/auth/callback]
    C --> D{Check User Role}
    
    D -->|Admin| E[/dashboard/admin]
    D -->|RG Admin| F[/dashboard/rg]
    D -->|Site Role| G[/dashboard]
    D -->|Member| G
    
    G --> H{User Action}
    H -->|Select Namespace (via site)| I[/dashboard/siteKey]
    H -->|Select Namespace (direct)| J[/namespaces/namespace]
    
    E --> K[Full Admin Features]
    F --> L[RG Management Features]
    I --> M[Site Management Features]
    J --> N[Namespace Features]
```

### Component Hierarchy

```typescript
// Layout structure
<RootLayout>
  <ClerkProvider>
    <ThemeProvider>
      <DashboardLayout>
        {/* Dashboard-specific content */}
        <RoleBasedDashboard />
        {/* or */}
        <AdminDashboard />
        {/* or */}
        <ReviewGroupDashboard />
        {/* etc. */}
      </DashboardLayout>
    </ThemeProvider>
  </ClerkProvider>
</RootLayout>
```

## API Integration

### Mock Data Structure

The dashboards currently use mock data from:
- `/src/lib/mock-data/users.ts` - User profiles and roles
- `/src/lib/mock-data/namespaces-extended.ts` - Namespace data
- `/src/lib/mock-data/activity.ts` - Activity feed data
- `/src/lib/mock-data/auth.ts` - Authentication mock data

### Future API Endpoints

```typescript
// Planned API structure
GET /api/admin/dashboard/stats - System statistics
GET /api/admin/users - User management
GET /api/admin/activity - Activity feed
GET /api/rg/:rgId/stats - Review group statistics
GET /api/rg/:rgId/namespaces - RG namespaces
GET /api/sites/:siteKey/dashboard - Namespace dashboard data (via site key)
GET /api/namespaces/:namespace/stats - Namespace statistics (direct access)
```

## Best Practices

### Performance Optimization
- Use React.memo for dashboard components
- Implement virtual scrolling for large activity feeds
- Cache dashboard data with SWR or React Query
- Lazy load dashboard sections

### Security Considerations
- Always validate user permissions server-side
- Use Clerk's auth() in API routes
- Implement rate limiting for dashboard APIs
- Audit log all administrative actions

### Accessibility
- Ensure keyboard navigation for all dashboard features
- Provide ARIA labels for dashboard statistics
- Support screen readers for activity feeds
- Maintain proper heading hierarchy

### Responsive Design
- Mobile-first approach for dashboard layouts
- Collapsible sidebar for smaller screens
- Touch-friendly action buttons
- Responsive data tables and cards

## Building New Dashboards

### Key Guidelines

1. **Namespace-Centric Design**: Always remember that sites = namespaces. Design with namespace management in mind.

2. **Role Hierarchy**: 
   - Superadmins: Full access to all namespaces + special portal/newtest management
   - Review Group Admins: Manage multiple related namespaces
   - Namespace Admins/Editors/Contributors: Specific namespace permissions

3. **Special Cases**:
   - Portal and newtest are NOT standard namespaces
   - They should have restricted UI and superadmin-only access
   - Don't expose portal/newtest management to regular namespace admins

4. **URL Structure**:
   - Use `/dashboard/[namespace]` for namespace-specific dashboards
   - Use `/namespaces/[namespace]` for direct namespace management
   - Keep special cases (`/dashboard/admin`, `/dashboard/rg`) separate

5. **Component Reuse**:
   - Use shared components for namespace statistics
   - Implement consistent permission checking
   - Follow the established dashboard layout patterns

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live activity feeds
2. **Customizable Dashboards**: User-configurable widget layouts
3. **Advanced Analytics**: Integration with analytics platforms
4. **Notification Center**: In-app notification system
5. **Dashboard Templates**: Pre-configured layouts for common roles
6. **Export Capabilities**: Dashboard data export to PDF/Excel
7. **Collaborative Features**: Real-time collaboration indicators
8. **Performance Metrics**: Page load and interaction metrics
9. **Namespace Migration**: Clearer separation between portal/newtest and standard namespaces

---

*Last Updated: January 2025*
*Version: 1.0.0*