# Admin Dashboard Mockup Reference

**Version:** 1.0  
**Date:** July 2025  
**Status:** Design Reference  
**Purpose:** Map existing SVG mockups to design system primitives for admin dashboard implementation

## Overview

This document maps the existing SVG mockups in `/IFLA_OMR25_link/mockups/` to our design system primitives, providing a visual reference for implementing the admin dashboard UI.

## Mockup Inventory

### Core Admin Panel
1. **admin-dashboard-mockup.svg** - Main dashboard with stats cards and navigation
2. **activities-mockup.svg** - Activity feed and audit log display

### Entity Management (CRUD Forms)
- **namespaces/** - Namespace listing and forms
- **profiles/** - DCTAP profile management
- **projects/** - Project management interfaces
- **users/** - User management screens
- **vocabularies/** - Vocabulary listing and forms

### Common Components
- **activity-feed.svg** - Real-time activity stream
- **batch-action-picker.svg** - Bulk operation selector
- **breadcrumbs.svg** - Navigation breadcrumbs
- **github-status.svg** - GitHub integration status
- **language-selector.svg** - Language switcher
- **notification-banner.svg** - System notifications
- **search-filter-component.svg** - Search and filtering
- **spreadsheet-preview.svg** - Google Sheets preview
- **step-indicator.svg** - Multi-step process indicator
- **validation-report.svg** - Validation results display
- **version-selector.svg** - Version picker

### Workflow Screens
- **batch/** - Batch import/export operations
- **translation/** - Translation workflow interfaces
- **vocabulary/** - Vocabulary management workflows

## Design System Mapping

### Color Tokens (from mockups → design system)

```typescript
// Primary Colors (from mockups)
const colorMapping = {
  // Teal (Primary actions, active states)
  mockupTeal: '#0F766E',        // → primary-600
  mockupTealLight: '#14B8A6',   // → primary-500
  
  // Grays (Text and borders)
  mockupTextPrimary: '#111827',  // → gray-900
  mockupTextSecondary: '#374151', // → gray-700
  mockupTextMuted: '#6B7280',    // → gray-500
  mockupBorder: '#E5E7EB',       // → gray-200
  mockupBackground: '#F5F7FA',    // → gray-50
  
  // Status Colors
  mockupSuccess: '#10B981',      // → success-500
  mockupError: '#EF4444',        // → error-500
  mockupWarning: '#F59E0B',      // → warning-500
  mockupInfo: '#3B82F6',         // → info-500
};
```

### Typography Patterns

```typescript
// From mockup analysis
const typographyPatterns = {
  // Page Headers
  pageTitle: {
    fontSize: '28px',     // → 1.75rem
    fontWeight: 'bold',   // → 700
    color: '#111827',     // → gray-900
  },
  
  // Section Headers
  sectionTitle: {
    fontSize: '20px',     // → 1.25rem
    fontWeight: '600',    // → 600
    color: '#111827',     // → gray-900
  },
  
  // Card Headers
  cardTitle: {
    fontSize: '16px',     // → 1rem
    fontWeight: 'bold',   // → 700
    color: '#111827',     // → gray-900
  },
  
  // Body Text
  bodyText: {
    fontSize: '14px',     // → 0.875rem
    fontWeight: 'normal', // → 400
    color: '#374151',     // → gray-700
  },
  
  // Muted Text
  mutedText: {
    fontSize: '14px',     // → 0.875rem
    fontWeight: 'normal', // → 400
    color: '#6B7280',     // → gray-500
  },
};
```

### Layout Patterns

```typescript
// Common layout dimensions from mockups
const layoutPatterns = {
  // Navigation
  topNavHeight: '60px',
  sidebarWidth: '240px',
  
  // Spacing
  pageMargin: '20px',
  cardPadding: '20px',
  sectionSpacing: '40px',
  
  // Cards and containers
  statsCardHeight: '140px',
  statsCardWidth: '280px',
  borderRadius: '5px',
  
  // Forms
  inputHeight: '40px',
  buttonHeight: '40px',
  formFieldSpacing: '20px',
};
```

### Component Patterns

#### 1. Navigation Sidebar
```typescript
// From admin-dashboard-mockup.svg
const sidebarPattern = {
  background: '#ffffff',
  border: '1px solid #E5E7EB',
  activeItem: {
    background: '#0F766E',
    text: '#ffffff',
  },
  inactiveItem: {
    background: '#ffffff',
    text: '#374151',
    hoverBackground: '#F3F4F6',
  },
};
```

#### 2. Stats Cards
```typescript
// Dashboard metric cards
const statsCardPattern = {
  container: {
    background: '#ffffff',
    border: '1px solid #E5E7EB',
    borderRadius: '5px',
    padding: '20px',
  },
  label: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#111827',
  },
  value: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#0F766E',
  },
  change: {
    fontSize: '14px',
    color: '#6B7280',
  },
};
```

#### 3. Data Tables
```typescript
// From various index.svg files
const tablePattern = {
  header: {
    background: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
    text: '#374151',
    fontWeight: '600',
  },
  row: {
    background: '#ffffff',
    borderBottom: '1px solid #E5E7EB',
    hoverBackground: '#F9FAFB',
  },
  actions: {
    color: '#0F766E',
    hoverColor: '#065F46',
  },
};
```

#### 4. Forms
```typescript
// From various form.svg files
const formPattern = {
  input: {
    height: '40px',
    border: '1px solid #E5E7EB',
    borderRadius: '4px',
    focusBorder: '#0F766E',
    background: '#ffffff',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  helpText: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '4px',
  },
};
```

#### 5. Buttons
```typescript
// Common button patterns
const buttonPatterns = {
  primary: {
    background: '#0F766E',
    text: '#ffffff',
    hoverBackground: '#065F46',
    height: '40px',
    padding: '0 20px',
    borderRadius: '4px',
  },
  secondary: {
    background: '#ffffff',
    text: '#374151',
    border: '1px solid #E5E7EB',
    hoverBackground: '#F9FAFB',
  },
  danger: {
    background: '#EF4444',
    text: '#ffffff',
    hoverBackground: '#DC2626',
  },
};
```

## Workflow-Specific Patterns

### 1. Multi-Step Processes (step-indicator.svg)
- Linear progress indicator with numbered steps
- Active step in primary color (#0F766E)
- Completed steps with checkmark
- Future steps in gray

### 2. Validation Reports (validation-report.svg)
- Severity indicators (error/warning/info)
- Expandable error details
- Line number references
- Suggested fixes

### 3. Language Selection (language-selector.svg)
- Flag icons for visual recognition
- Dropdown with search
- Selected language highlighted
- Language code display

### 4. Batch Operations (batch-action-picker.svg)
- Checkbox selection pattern
- Action toolbar appears on selection
- Bulk action dropdown
- Selection count display

## Implementation Guidelines

### 1. Use MUI Components
Map mockup patterns to MUI components:
- Stats cards → MUI Card with custom styling
- Navigation → MUI Drawer + List
- Forms → MUI TextField, Select, Button
- Tables → MUI DataGrid or Table

### 2. Maintain Consistency
- Use exact color values from mockups
- Match spacing and sizing
- Preserve interaction patterns
- Keep visual hierarchy

### 3. Responsive Considerations
- Sidebar becomes drawer on mobile
- Stats cards stack vertically
- Tables become cards on small screens
- Maintain touch-friendly tap targets

### 4. Accessibility Enhancements
- Add ARIA labels not visible in mockups
- Ensure color contrast meets WCAG AA
- Provide keyboard navigation
- Include screen reader announcements

## SVG Assets for Reference

The following SVGs should be consulted during implementation:

### Priority 1 - Core Admin
- `/Admin Panel/admin-dashboard-mockup.svg`
- `/Admin Panel/activities-mockup.svg`
- `/common components/breadcrumbs.svg`
- `/common components/notification-banner.svg`

### Priority 2 - Entity Management
- `/Admin Panel/users/index.svg`
- `/Admin Panel/users/form.svg`
- `/Admin Panel/namespaces/index.svg`
- `/Admin Panel/namespaces/form.svg`

### Priority 3 - Workflows
- `/batch/batch-import-mockup.svg`
- `/translation/translation-workflow.svg`
- `/vocabulary/vocabulary-dashboard.svg`

### Priority 4 - Components
- All files in `/common components/`

## Next Steps

1. Create Storybook stories for each component pattern
2. Build reusable component library based on mockups
3. Implement responsive behaviors
4. Add interaction states not shown in static mockups
5. Enhance with animations and transitions
