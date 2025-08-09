# Dashboard Routing Migration Guide

**Version:** 1.0  
**Date:** August 2025  
**Status:** Implementation Checklist  

## Overview

This guide provides step-by-step instructions for migrating existing dashboard components from tab-based navigation to the new nested routing architecture documented in the system design docs.

## Migration Benefits

The new nested routing architecture provides:
- **Deep Linking**: Direct URLs to specific dashboard states
- **Browser History**: Back/forward navigation support
- **Breadcrumb Navigation**: Clear navigation hierarchy
- **Improved UX**: Standard web navigation patterns
- **SEO Benefits**: Crawlable dashboard sections
- **Bookmark Support**: Users can bookmark specific dashboard views

## Current vs. New Architecture

### Current Implementation (Tab-Based)
```tsx
// ❌ OLD: Tab-based state switching
const [activeTab, setActiveTab] = useState('overview');

const renderContent = () => {
  switch (activeTab) {
    case 'overview': return <OverviewTab />;
    case 'projects': return <ProjectsTab />;
    default: return <OverviewTab />;
  }
};

return (
  <div>
    <TabList activeTab={activeTab} onChange={setActiveTab} />
    {renderContent()}
  </div>
);
```

### New Implementation (Route-Based)
```tsx
// ✅ NEW: Route-based navigation
// File: apps/admin/src/app/(authenticated)/dashboard/author/page.tsx
export default function AuthorDashboardPage() {
  return <AuthorOverviewPage />;
}

// File: apps/admin/src/app/(authenticated)/dashboard/author/projects/page.tsx
export default function AuthorProjectsPage() {
  return <AuthorProjectsPage />;
}

// File: apps/admin/src/app/(authenticated)/dashboard/author/layout.tsx
export default function AuthorDashboardLayout({ children }) {
  return (
    <StandardDashboardLayout 
      title="Author Dashboard"
      navigation={authorNavigation}
    >
      {children}
    </StandardDashboardLayout>
  );
}
```

## Step-by-Step Migration Process

### Phase 1: Create Route Structure

#### 1.1 Create Dashboard Route Directory
```bash
# For each dashboard type (author, editor, admin, reviewgroup, namespace)
mkdir -p apps/admin/src/app/\(authenticated\)/dashboard/{dashboard-type}
mkdir -p apps/admin/src/app/\(authenticated\)/dashboard/{dashboard-type}/{feature}
```

#### 1.2 Create Layout Component
```tsx
// apps/admin/src/app/(authenticated)/dashboard/{dashboard-type}/layout.tsx
import { StandardDashboardLayout } from '@/components/ui/StandardDashboardLayout';
import { {DashboardType}Navigation } from '@/lib/navigation/{dashboard-type}';

export default function {DashboardType}DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StandardDashboardLayout
      title="{DashboardType} Dashboard"
      subtitle="Dashboard Description"
      navigation={{DashboardType}Navigation}
    >
      {children}
    </StandardDashboardLayout>
  );
}
```

#### 1.3 Create Route Pages
```tsx
// apps/admin/src/app/(authenticated)/dashboard/{dashboard-type}/page.tsx
import { {DashboardType}OverviewPage } from '@/components/dashboard/{dashboard-type}/OverviewPage';

export default function {DashboardType}DashboardPage() {
  return <{DashboardType}OverviewPage />;
}

// apps/admin/src/app/(authenticated)/dashboard/{dashboard-type}/{feature}/page.tsx
import { {DashboardType}{Feature}Page } from '@/components/dashboard/{dashboard-type}/{Feature}Page';

export default function {DashboardType}{Feature}Page() {
  return <{DashboardType}{Feature}Page />;
}
```

### Phase 2: Extract Tab Components

#### 2.1 Convert Tab Content to Page Components
```tsx
// Before: Tab component inside dashboard
const ProjectsTab = ({ user }: { user: AppUser }) => {
  // Tab content
};

// After: Standalone page component
// apps/admin/src/components/dashboard/author/ProjectsPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@mui/material';

export function AuthorProjectsPage({ user }: { user: AppUser }) {
  return (
    <div>
      <h1>My Projects</h1>
      {/* Original tab content */}
    </div>
  );
}
```

#### 2.2 Update Component Imports
```tsx
// Before: All tabs in one file
import { OverviewTab, ProjectsTab, NamespacesTab } from './tabs';

// After: Separate page components
import { AuthorOverviewPage } from '@/components/dashboard/author/OverviewPage';
import { AuthorProjectsPage } from '@/components/dashboard/author/ProjectsPage';
import { AuthorNamespacesPage } from '@/components/dashboard/author/NamespacesPage';
```

### Phase 3: Update Navigation Configuration

#### 3.1 Create Navigation Configuration
```tsx
// apps/admin/src/lib/navigation/author.ts
import { DashboardNavigation } from '@/types/dashboard';

export const AuthorNavigation: DashboardNavigation = [
  {
    id: 'overview',
    label: 'Overview',
    href: '/dashboard/author',
    icon: HomeIcon,
  },
  {
    id: 'projects',
    label: 'My Projects',
    href: '/dashboard/author/projects',
    icon: FolderIcon,
    badge: (user: AppUser) => getAuthorProjectsCount(user),
  },
  {
    id: 'namespaces',
    label: 'Namespaces',
    href: '/dashboard/author/namespaces',
    icon: DatabaseIcon,
    badge: (user: AppUser) => user.accessibleNamespaces.length,
  },
  {
    id: 'tasks',
    label: 'Active Tasks',
    href: '/dashboard/author/tasks',
    icon: CheckCircleIcon,
    badge: () => 6, // Fixed for now, will be dynamic later
  },
  {
    id: 'review',
    label: 'Review Queue',
    href: '/dashboard/author/review',
    icon: EyeIcon,
    badge: () => 3, // Fixed for now
  },
  {
    id: 'translation',
    label: 'Translation Tasks',
    href: '/dashboard/author/translation',
    icon: GlobeIcon,
    badge: () => 2, // Fixed for now
  },
  {
    id: 'tools',
    label: 'Tools & Resources',
    href: '/dashboard/author/tools',
    icon: WrenchIcon,
  },
];
```

#### 3.2 Create Badge Helper Functions
```tsx
// apps/admin/src/lib/dashboard/badges.ts
import { AppUser } from '@/lib/clerk-github-auth';

export function getAuthorProjectsCount(user: AppUser): number {
  return Object.values(user.projects).filter(
    project => project.role === 'reviewer' || project.role === 'translator'
  ).length;
}

export function getEditorProjectsCount(user: AppUser): number {
  return Object.values(user.projects).filter(
    project => project.role === 'editor' || project.role === 'lead'
  ).length;
}
```

### Phase 4: Update StandardDashboardLayout

#### 4.1 Modify StandardDashboardLayout for Route-Based Navigation
```tsx
// apps/admin/src/components/ui/StandardDashboardLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@mui/material';

interface StandardDashboardLayoutProps {
  title: string;
  subtitle?: string;
  navigation: DashboardNavigation;
  children: React.ReactNode;
}

export function StandardDashboardLayout({
  title,
  subtitle,
  navigation,
  children,
}: StandardDashboardLayoutProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <div className="dashboard-layout">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb navigation">
        <ol className="breadcrumb-list">
          {breadcrumbs.map((crumb, index) => (
            <li key={crumb.href}>
              {index < breadcrumbs.length - 1 ? (
                <Link href={crumb.href}>{crumb.label}</Link>
              ) : (
                <span aria-current="page">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Header */}
      <header>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </header>

      {/* Navigation */}
      <nav aria-label="Dashboard navigation">
        <ul role="list">
          {navigation.map((item) => (
            <li key={item.id} role="listitem">
              <Button
                component={Link}
                href={item.href}
                variant={pathname === item.href ? 'contained' : 'text'}
                aria-current={pathname === item.href ? 'page' : undefined}
                startIcon={<item.icon />}
              >
                {item.label}
                {item.badge && (
                  <span className="nav-badge">{item.badge()}</span>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
```

#### 4.2 Create Breadcrumb Generation Function
```tsx
// apps/admin/src/lib/navigation/breadcrumbs.ts
export interface Breadcrumb {
  label: string;
  href: string;
}

export function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  let currentPath = '/dashboard';

  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Map segments to user-friendly labels
    const label = getBreadcrumbLabel(segment, segments.slice(0, i + 1));
    breadcrumbs.push({ label, href: currentPath });
  }

  return breadcrumbs;
}

function getBreadcrumbLabel(segment: string, fullPath: string[]): string {
  const labelMap: Record<string, string> = {
    author: 'Author',
    editor: 'Editor',
    admin: 'Admin',
    reviewgroup: 'Review Group',
    namespace: 'Namespace',
    projects: 'Projects',
    namespaces: 'Namespaces',
    tasks: 'Tasks',
    review: 'Review Queue',
    translation: 'Translation',
    tools: 'Tools & Resources',
  };

  return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}
```

### Phase 5: Add Action Pages

#### 5.1 Create Edit/Create Pages Within Dashboard Context
```tsx
// apps/admin/src/app/(authenticated)/dashboard/author/projects/edit/[id]/page.tsx
import { AuthorProjectEditPage } from '@/components/dashboard/author/ProjectEditPage';

interface Props {
  params: { id: string };
}

export default function AuthorProjectEditPage({ params }: Props) {
  return <AuthorProjectEditPage projectId={params.id} />;
}

// apps/admin/src/app/(authenticated)/dashboard/author/projects/new/page.tsx
import { AuthorProjectCreatePage } from '@/components/dashboard/author/ProjectCreatePage';

export default function AuthorProjectCreatePage() {
  return <AuthorProjectCreatePage />;
}
```

#### 5.2 Update Action Buttons to Use Routing
```tsx
// Before: Modal or tab switching
<Button onClick={() => setEditingProject(project)}>
  Edit Project
</Button>

// After: Navigation to edit route
<Button 
  component={Link}
  href={`/dashboard/author/projects/edit/${project.id}`}
>
  Edit Project
</Button>
```

### Phase 6: Create Feature-Based Data Hooks

#### 6.1 Create Dashboard-Specific Hooks
```tsx
// apps/admin/src/lib/hooks/useAuthorDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { AppUser } from '@/lib/clerk-github-auth';

export function useAuthorProjects(user: AppUser) {
  return useQuery({
    queryKey: ['author-projects', user.id],
    queryFn: () => fetchAuthorProjects(user.id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAuthorTasks(user: AppUser) {
  return useQuery({
    queryKey: ['author-tasks', user.id],
    queryFn: () => fetchAuthorTasks(user.id),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAuthorReviewQueue(user: AppUser) {
  return useQuery({
    queryKey: ['author-review-queue', user.id],
    queryFn: () => fetchAuthorReviewQueue(user.id),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
```

#### 6.2 Update Page Components to Use Hooks
```tsx
// Before: Props-based data
export function AuthorProjectsPage({ projects }: { projects: Project[] }) {
  return <div>{/* render projects */}</div>;
}

// After: Hook-based data fetching
export function AuthorProjectsPage() {
  const { user } = useUser();
  const { data: projects, isLoading, error } = useAuthorProjects(user);

  if (isLoading) return <ProjectsLoadingSkeleton />;
  if (error) return <ProjectsErrorState error={error} />;

  return <div>{/* render projects */}</div>;
}
```

### Phase 7: Update Tests

#### 7.1 Update Integration Tests for New Routes
```tsx
// Before: Tab-based test navigation
fireEvent.click(screen.getByRole('button', { name: /My Projects/ }));

// After: Route-based test navigation (if testing routing)
// Most tests will remain the same since they test component behavior
// only routing-specific tests need updates
```

#### 7.2 Add Route-Specific Tests
```tsx
// apps/admin/src/tests/integration/dashboard-routing.integration.test.ts
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthorDashboardLayout from '../app/(authenticated)/dashboard/author/layout';

describe('Dashboard Routing @integration', () => {
  it('should highlight active navigation item based on route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/author/projects']}>
        <AuthorDashboardLayout>
          <div>Projects Content</div>
        </AuthorDashboardLayout>
      </MemoryRouter>
    );

    const projectsNav = screen.getByRole('button', { name: /My Projects/ });
    expect(projectsNav).toHaveAttribute('aria-current', 'page');
  });

  it('should generate correct breadcrumbs', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/author/projects/edit/123']}>
        <AuthorDashboardLayout>
          <div>Edit Project Content</div>
        </AuthorDashboardLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
});
```

## Migration Checklist

### Pre-Migration
- [ ] Review current dashboard components and identify tab structure
- [ ] Map out desired URL structure for each dashboard section
- [ ] Identify data fetching patterns that need to be converted to hooks
- [ ] Plan action page routes (edit/create forms)

### Route Structure Creation
- [ ] Create dashboard route directories
- [ ] Create layout components for each dashboard type
- [ ] Create page components for each route
- [ ] Set up dynamic routes for actions (edit/create)

### Component Migration  
- [ ] Extract tab content into standalone page components
- [ ] Update component imports and exports
- [ ] Remove tab state management from dashboard components
- [ ] Convert prop-based data to hook-based data fetching

### Navigation Updates
- [ ] Create navigation configuration for each dashboard
- [ ] Update StandardDashboardLayout to use pathname-based navigation
- [ ] Implement breadcrumb generation
- [ ] Add badge calculation functions

### Data Layer Updates
- [ ] Create feature-specific data hooks
- [ ] Convert components to use React Query hooks
- [ ] Update API integration patterns
- [ ] Add loading and error states

### Action Pages
- [ ] Create edit/create page routes
- [ ] Update action buttons to use Next.js Link components
- [ ] Implement form submission with redirect patterns
- [ ] Add success/error handling with route navigation

### Testing Updates
- [ ] Update existing integration tests (minimal changes expected)
- [ ] Add route-specific test cases
- [ ] Test breadcrumb generation
- [ ] Test navigation state management
- [ ] Verify accessibility with new routing structure

### Final Verification
- [ ] Test deep linking to dashboard sections
- [ ] Verify browser back/forward navigation
- [ ] Test bookmarking dashboard URLs
- [ ] Confirm breadcrumb navigation works
- [ ] Validate all action flows work with routing
- [ ] Test accessibility with screen readers
- [ ] Performance check with React DevTools

## Rollout Strategy

### Phase 1: Site Management Dashboard (Pilot) 🎯
Start with the **Site Management Dashboard** (`/dashboard/[siteKey]`) as the primary pilot because it's where site administrators do most of their work:

**Current Route:** `/dashboard/[siteKey]` (e.g., `/dashboard/isbd`, `/dashboard/portal`, `/dashboard/unimarc`)  
**Component:** `apps/admin/src/app/(authenticated)/dashboard/[siteKey]/NamespaceManagementClient.tsx`

**Why This Dashboard:**
1. **Administrative Hub**: Where site/namespace administrators manage their domains
2. **High-Value Users**: Site admins are power users who will provide valuable feedback
3. **Rich Interface**: Complex UI with sidebars, multiple sections, and detailed management features
4. **Real Impact**: Affects site configuration, team management, and operational workflows
5. **Cross-Platform**: Manages both Docusaurus sites and admin portal features

**Current Interface Structure to Convert:**
Looking at the `NamespaceManagementClient.tsx`, it appears to have a sidebar-based interface with sections for:
- Site Overview & Status
- Content Management
- GitHub Integration
- Team & Access Management  
- Build & Deployment
- Settings & Configuration

**Target Nested Routes to Implement:**
```bash
/dashboard/[siteKey]                              # Site overview (landing page)
/dashboard/[siteKey]/content                      # Content management hub
/dashboard/[siteKey]/content/vocabularies         # Vocabulary management
/dashboard/[siteKey]/content/vocabularies/[id]/edit # Edit vocabulary
/dashboard/[siteKey]/content/vocabularies/new     # Create vocabulary
/dashboard/[siteKey]/content/elements             # Element set management
/dashboard/[siteKey]/content/import               # Content import workflows
/dashboard/[siteKey]/content/export               # Content export workflows
/dashboard/[siteKey]/github                       # GitHub integration status
/dashboard/[siteKey]/github/repos                 # Repository management
/dashboard/[siteKey]/github/workflows             # CI/CD workflow status
/dashboard/[siteKey]/team                         # Team management
/dashboard/[siteKey]/team/members                 # Member management
/dashboard/[siteKey]/team/permissions             # Permission management
/dashboard/[siteKey]/team/invite                  # Invite new members
/dashboard/[siteKey]/builds                       # Build & deployment status
/dashboard/[siteKey]/builds/[buildId]             # Individual build details
/dashboard/[siteKey]/settings                     # Site configuration
/dashboard/[siteKey]/settings/general             # General settings
/dashboard/[siteKey]/settings/integrations        # Integration settings
```

**Key Benefits of This Pilot:**
- **Deep linking** to specific management sections
- **Bookmarkable URLs** for common admin tasks
- **Better workflow navigation** for complex administrative processes
- **Breadcrumb support** for multi-level management tasks

### Phase 2: Editor Dashboard
Apply learnings from Namespace Dashboard pilot:
1. Follow established patterns from namespace routing
2. Leverage vocabulary management patterns
3. Test editorial workflow integration

### Phase 3: Admin & Review Group Dashboards
Expand to administrative dashboards:
1. Apply proven routing patterns
2. Handle cross-namespace navigation
3. Test administrative workflow integration

### Phase 4: Author Dashboard
Complete migration with the simplest dashboard:
1. Apply all established patterns
2. Focus on review and translation workflows
3. Final integration testing

## Troubleshooting

### Common Issues

#### Issue: Navigation not highlighting correctly
**Cause**: Pathname matching issues
**Solution**: 
```tsx
// Use exact pathname matching for navigation highlighting
const isActive = pathname === item.href || 
  (item.href !== '/dashboard' && pathname.startsWith(item.href));
```

#### Issue: Breadcrumbs not updating
**Cause**: Component not re-rendering on route change
**Solution**:
```tsx
// Ensure usePathname is called in client component
'use client';
import { usePathname } from 'next/navigation';
```

#### Issue: Data not loading on direct navigation
**Cause**: Missing data fetching in page components
**Solution**:
```tsx
// Ensure each page component handles its own data fetching
export function AuthorProjectsPage() {
  const { data: projects } = useAuthorProjects();
  // ...
}
```

#### Issue: Tests failing after migration
**Cause**: Tests expecting tab-based navigation
**Solution**:
```tsx
// Update tests to work with route-based navigation
// Most component tests should work unchanged
// Only routing-specific tests need updates
```

This migration guide provides a comprehensive pathway from the current tab-based dashboard system to the new nested routing architecture, ensuring improved user experience, better SEO, and more maintainable code structure.