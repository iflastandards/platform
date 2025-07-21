# Design System and UI Patterns

**Version:** 2.0  
**Date:** January 2025  
**Status:** Consolidated Reference  
**Source:** Previously documented in Docs 25, 26, and 29

## Overview

This document consolidates the complete design system specification, UI component patterns, and mockup references for the IFLA Standards Platform. It serves as the single source of truth for all visual design elements, component implementations, and UI/UX patterns across the admin interface.

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Component Patterns](#component-patterns)
3. [Mockup References](#mockup-references)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Best Practices](#best-practices)

## Design Tokens

### Color System

```typescript
// Primary Palette (Teal) - Used for primary actions and active states
export const colors = {
  primary: {
    main: '#0F766E',
    light: '#14b8a6',
    dark: '#065f46',
    contrastText: '#ffffff',
    // Full scale
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  
  // Secondary Palette (Blue)
  secondary: {
    main: '#1e40af',
    light: '#3b82f6',
    dark: '#1e3a8a',
    contrastText: '#ffffff',
  },
  
  // Semantic Colors
  error: { main: '#dc2626', light: '#ef4444', dark: '#991b1b' },
  warning: { main: '#f59e0b', light: '#fbbf24', dark: '#92400e' },
  info: { main: '#1e40af', light: '#3b82f6', dark: '#1e3a8a' },
  success: { main: '#059669', light: '#10b981', dark: '#065f46' },
  
  // Neutral Colors
  grey: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Background & Text
  background: {
    default: '#f5f7fa',
    paper: '#ffffff',
  },
  text: {
    primary: '#111827',
    secondary: '#374151',
    disabled: '#9ca3af',
  },
};
```

### Typography System

```typescript
export const typography = {
  // Font Stack
  fontFamily: {
    base: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", Monaco, Consolas, monospace',
  },
  
  // Type Scale
  h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
  h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.4 },
  h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5 },
  h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43 },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.66 },
  button: { fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.02em' },
};
```

### Spacing & Layout

```typescript
export const spacing = {
  unit: 8, // Base unit
  scale: {
    0: 0,
    0.5: 4,
    1: 8,
    2: 16,
    3: 24,
    4: 32,
    5: 40,
    6: 48,
    8: 64,
    10: 80,
  },
};

export const layout = {
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
  dimensions: {
    sidebarWidth: 240,
    sidebarCollapsedWidth: 64,
    headerHeight: 64,
  },
  borderRadius: {
    sm: 4,
    default: 5,
    md: 8,
    lg: 12,
  },
};
```

## Component Patterns

### Navigation Components

#### Global Navbar
*Source: Previously in Doc 26*

```tsx
// Persistent top navigation with user context
import { AppBar, Toolbar, IconButton, Avatar, Menu } from '@mui/material';
import { addBasePath } from '@ifla/theme/utils';

export function GlobalNavbar({ user }: { user: AppUser }) {
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ height: 64 }}>
        <Typography variant="h6">IFLA Standards</Typography>
        <Box sx={{ flexGrow: 1 }} />
        {/* User actions, notifications, menu */}
      </Toolbar>
    </AppBar>
  );
}
```

#### Left Sidebar Navigation
*Source: Previously in Doc 26*

```tsx
// Collapsible sidebar with hierarchical navigation
export function Sidebar({ open, onToggle, selectedDomain }: SidebarProps) {
  const drawerWidth = open ? 240 : 64;
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          top: 64, // Below navbar
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1)',
        },
      }}
    >
      {/* Navigation items with expand/collapse */}
    </Drawer>
  );
}
```

### Data Display Components

#### Stats Cards
*Source: Previously in Doc 26*

```tsx
interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning';
}

export function StatsCard({ title, value, change, icon, color = 'primary' }: StatsCardProps) {
  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
          {change && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {change > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
              <Typography variant="body2" color={change > 0 ? 'success.main' : 'error.main'}>
                {Math.abs(change)}%
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.main`, color: 'white' }}>
          {icon}
        </Avatar>
      </Box>
    </Card>
  );
}
```

#### Data Tables
*Source: Previously in Doc 26*

```tsx
export function StandardDataTable({ 
  data, 
  columns, 
  onRowClick,
  selectable = false,
  actions 
}: DataTableProps) {
  return (
    <DataGrid
      rows={data}
      columns={columns}
      checkboxSelection={selectable}
      onRowClick={onRowClick}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        '& .MuiDataGrid-row:hover': {
          backgroundColor: 'action.hover',
        },
      }}
      slots={{
        toolbar: () => (
          <GridToolbar>
            <GridToolbarQuickFilter />
            {actions}
          </GridToolbar>
        ),
      }}
    />
  );
}
```

### Form Components

#### Standard Form Layout
*Source: Previously in Doc 26*

```tsx
export function FormLayout({ children, onSubmit, title }: FormLayoutProps) {
  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      {title && (
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      )}
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 3 }}>
        <Stack spacing={3}>
          {children}
        </Stack>
      </Box>
    </Paper>
  );
}
```

### Feedback Components

#### Toast Notifications
*Source: Previously in Doc 25*

```typescript
export const toastConfig = {
  position: {
    topRight: { top: 24, right: 24 },
    bottomCenter: { bottom: 24, left: '50%', transform: 'translateX(-50%)' },
  },
  variants: {
    success: { backgroundColor: '#065f46', icon: '✓' },
    error: { backgroundColor: '#991b1b', icon: '✕' },
    warning: { backgroundColor: '#92400e', icon: '⚠' },
    info: { backgroundColor: '#1e3a8a', icon: 'ℹ' },
  },
  duration: {
    short: 3000,
    medium: 5000,
    long: 8000,
  },
};
```

## Mockup References
*Source: Previously in Doc 29*

### Mockup Inventory

The `/IFLA_OMR25_link/mockups/` directory contains SVG mockups that serve as visual references:

#### Core Admin Panel
- **admin-dashboard-mockup.svg** - Main dashboard with stats cards
- **activities-mockup.svg** - Activity feed and audit log

#### Entity Management
- **namespaces/** - Namespace CRUD interfaces
- **profiles/** - DCTAP profile management
- **projects/** - Project management screens
- **users/** - User management interfaces
- **vocabularies/** - Vocabulary listings and forms

#### Common Components
- **activity-feed.svg** - Real-time activity stream
- **batch-action-picker.svg** - Bulk operations
- **breadcrumbs.svg** - Navigation breadcrumbs
- **github-status.svg** - GitHub integration
- **search-filter-component.svg** - Search and filtering
- **validation-report.svg** - Validation results

### Design Token Mapping

```typescript
// Colors from mockups mapped to design system
const mockupToDesignSystem = {
  // Primary Actions (Teal)
  '#0F766E': 'primary.700',
  '#14B8A6': 'primary.500',
  
  // Text Colors
  '#111827': 'text.primary',
  '#374151': 'text.secondary',
  '#6B7280': 'text.disabled',
  
  // Backgrounds
  '#F5F7FA': 'background.default',
  '#FFFFFF': 'background.paper',
  
  // Borders
  '#E5E7EB': 'grey.200',
};
```

## Implementation Guidelines

### Component States

```typescript
export const states = {
  default: { opacity: 1, cursor: 'default' },
  hover: {
    opacity: 1,
    cursor: 'pointer',
    backgroundColor: 'rgba(15, 118, 110, 0.04)',
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  focus: {
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.2)',
  },
  active: {
    transform: 'scale(0.98)',
  },
  disabled: {
    opacity: 0.38,
    cursor: 'not-allowed',
  },
};
```

### Responsive Patterns

```typescript
// Example: Responsive container
const ResponsiveContainer = styled(Box)(({ theme }) => ({
  padding: spacing.scale[3], // 24px mobile
  [theme.breakpoints.up('sm')]: { padding: spacing.scale[4] }, // 32px
  [theme.breakpoints.up('md')]: { padding: spacing.scale[6] }, // 48px
  [theme.breakpoints.up('lg')]: { padding: spacing.scale[8] }, // 64px
}));
```

### Accessibility Requirements

1. **Focus Management**
   - All interactive elements must have visible focus indicators
   - Use `focus-visible` for keyboard-only focus
   - Maintain logical tab order

2. **Color Contrast**
   - Maintain WCAG AA compliance (4.5:1 for normal text)
   - Never use color alone to convey information
   - Provide text alternatives for icons

3. **Keyboard Navigation**
   - All functionality accessible via keyboard
   - Implement skip links for repetitive content
   - Support standard keyboard shortcuts

## Best Practices

### Design Consistency

1. **Color Usage**
   - Use semantic colors for their intended purpose
   - Apply color tokens consistently across components
   - Test with color blindness simulators

2. **Typography**
   - Use the defined type scale exclusively
   - Maintain readable line lengths (45-75 characters)
   - Ensure proper heading hierarchy

3. **Spacing**
   - Follow the 8px grid system
   - Use consistent padding/margin values
   - Group related elements with appropriate spacing

### Performance Optimization

1. **Animations**
   - Use CSS transforms over position changes
   - Respect `prefers-reduced-motion`
   - Limit simultaneous animations

2. **Loading States**
   - Show skeletons immediately
   - Implement progressive loading
   - Use optimistic UI updates

3. **Component Efficiency**
   - Lazy load heavy components
   - Memoize expensive calculations
   - Virtualize long lists

## References

- Original specifications: `archive/25-design-system-specification.md`
- Component patterns: `archive/26-ui-component-patterns.md`
- Mockup references: `archive/29-admin-dashboard-mockup-reference.md`
- Live mockups: `/IFLA_OMR25_link/mockups/`
- MUI documentation: https://mui.com/material-ui/