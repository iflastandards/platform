# Design System Specification

**Version:** 1.0  
**Date:** January 2025  
**Status:** Implementation Ready

## Overview

This document completes the IFLA Standards Platform design system by specifying all visual design elements, component states, interaction patterns, and UI/UX guidelines needed for consistent implementation across the admin interface.

## Design Tokens

### Color System

```typescript
// Already implemented in mui-theme.ts
export const colors = {
  // Primary Palette (Teal)
  primary: {
    main: '#0F766E',
    light: '#14b8a6',
    dark: '#065f46',
    contrastText: '#ffffff',
    // Additional shades for states
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
    // Additional shades
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Semantic Colors
  error: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#991b1b',
    contrastText: '#ffffff',
  },
  
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#92400e',
    contrastText: '#ffffff',
  },
  
  info: {
    main: '#1e40af',
    light: '#3b82f6',
    dark: '#1e3a8a',
    contrastText: '#ffffff',
  },
  
  success: {
    main: '#059669',
    light: '#10b981',
    dark: '#065f46',
    contrastText: '#ffffff',
  },
  
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
  
  // Background Colors
  background: {
    default: '#f5f7fa',
    paper: '#ffffff',
    elevated: '#ffffff',
  },
  
  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#374151',
    disabled: '#9ca3af',
    hint: '#6b7280',
  },
  
  // Utility Colors
  divider: '#e5e7eb',
  focus: '#0F766E',
  hover: 'rgba(15, 118, 110, 0.04)',
  selected: 'rgba(15, 118, 110, 0.08)',
  disabled: 'rgba(0, 0, 0, 0.26)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
};
```

### Typography System

```typescript
export const typography = {
  // Font Stack
  fontFamily: {
    base: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", Monaco, Consolas, "Courier New", monospace',
  },
  
  // Font Weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Font Sizes & Line Heights
  h1: {
    fontSize: '2.5rem',    // 40px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem',      // 32px
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.75rem',   // 28px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.5rem',    // 24px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',   // 20px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',      // 16px
    fontWeight: 600,
    lineHeight: 1.5,
  },
  
  // Body Text
  body1: {
    fontSize: '1rem',      // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 400,
    lineHeight: 1.43,
  },
  
  // Utility Text
  button: {
    fontSize: '0.875rem',  // 14px
    fontWeight: 600,
    lineHeight: 1.75,
    letterSpacing: '0.02em',
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem',   // 12px
    fontWeight: 400,
    lineHeight: 1.66,
  },
  overline: {
    fontSize: '0.75rem',   // 12px
    fontWeight: 600,
    lineHeight: 2.66,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};
```

### Spacing System

```typescript
export const spacing = {
  // Base unit: 8px
  unit: 8,
  
  // Spacing scale
  scale: {
    0: 0,      // 0px
    0.5: 4,    // 4px
    1: 8,      // 8px
    1.5: 12,   // 12px
    2: 16,     // 16px
    2.5: 20,   // 20px
    3: 24,     // 24px
    4: 32,     // 32px
    5: 40,     // 40px
    6: 48,     // 48px
    7: 56,     // 56px
    8: 64,     // 64px
    9: 72,     // 72px
    10: 80,    // 80px
    12: 96,    // 96px
    16: 128,   // 128px
  },
  
  // Component-specific spacing
  component: {
    buttonPadding: '8px 16px',
    inputPadding: '8px 12px',
    cardPadding: 24,
    sectionSpacing: 48,
    pageMargin: 32,
  },
};
```

### Layout System

```typescript
export const layout = {
  // Breakpoints (MUI defaults)
  breakpoints: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
  
  // Container widths
  container: {
    xs: '100%',
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
  },
  
  // Fixed dimensions
  dimensions: {
    sidebarWidth: 240,
    sidebarCollapsedWidth: 64,
    headerHeight: 64,
    footerHeight: 56,
    mobileHeaderHeight: 56,
  },
  
  // Border radius
  borderRadius: {
    none: 0,
    sm: 4,
    default: 5,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Z-index layers
  zIndex: {
    mobileStepper: 1000,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
};
```

### Shadows & Elevation

```typescript
export const shadows = {
  // Elevation levels
  0: 'none',
  1: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  2: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
  3: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
  4: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
  5: '0 25px 50px rgba(0, 0, 0, 0.12)',
  
  // Specific use cases
  button: {
    default: 'none',
    hover: '0 1px 3px rgba(0, 0, 0, 0.1)',
    active: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  },
  
  card: {
    default: '0 1px 3px rgba(0, 0, 0, 0.1)',
    hover: '0 4px 6px rgba(0, 0, 0, 0.07)',
  },
  
  modal: '0 20px 25px rgba(0, 0, 0, 0.15)',
  
  // Focus shadows
  focus: {
    default: '0 0 0 3px rgba(15, 118, 110, 0.2)',
    error: '0 0 0 3px rgba(220, 38, 38, 0.2)',
  },
};
```

## Component States

### Interactive States

```typescript
export const states = {
  // Base states for all interactive elements
  default: {
    opacity: 1,
    cursor: 'default',
  },
  
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
    transition: 'transform 100ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  disabled: {
    opacity: 0.38,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  
  loading: {
    opacity: 0.7,
    cursor: 'wait',
    pointerEvents: 'none',
  },
};

// Component-specific states
export const componentStates = {
  button: {
    default: {
      boxShadow: 'none',
    },
    hover: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(-1px)',
    },
    active: {
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      transform: 'translateY(0)',
    },
    focus: {
      boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.2)',
    },
    disabled: {
      backgroundColor: '#e5e7eb',
      color: '#9ca3af',
    },
  },
  
  input: {
    default: {
      borderColor: '#e5e7eb',
      backgroundColor: '#ffffff',
    },
    hover: {
      borderColor: '#d1d5db',
    },
    focus: {
      borderColor: '#0F766E',
      boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.1)',
    },
    error: {
      borderColor: '#dc2626',
      boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)',
    },
    disabled: {
      backgroundColor: '#f9fafb',
      borderColor: '#e5e7eb',
      color: '#9ca3af',
    },
  },
  
  card: {
    default: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
    },
    hover: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
      transform: 'translateY(-2px)',
    },
    active: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(0)',
    },
    selected: {
      borderColor: '#0F766E',
      boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.1)',
    },
  },
};
```

### Loading States

```typescript
export const loadingStates = {
  // Skeleton loading
  skeleton: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  
  // Spinner variants
  spinner: {
    small: {
      size: 16,
      strokeWidth: 2,
    },
    default: {
      size: 24,
      strokeWidth: 3,
    },
    large: {
      size: 40,
      strokeWidth: 4,
    },
  },
  
  // Progress indicators
  progress: {
    linear: {
      height: 4,
      borderRadius: 2,
      backgroundColor: '#e5e7eb',
    },
    circular: {
      size: 40,
      strokeWidth: 4,
    },
  },
  
  // Loading overlays
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(2px)',
  },
};
```

### Empty States

```typescript
export const emptyStates = {
  // Standard empty state
  default: {
    icon: {
      size: 64,
      color: '#9ca3af',
      marginBottom: 16,
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#111827',
      marginBottom: 8,
    },
    description: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: 24,
      maxWidth: 400,
    },
    action: {
      variant: 'contained',
      color: 'primary',
    },
  },
  
  // Specific empty states
  noData: {
    icon: '📊',
    title: 'No data yet',
    description: 'Start by creating your first item',
  },
  
  noResults: {
    icon: '🔍',
    title: 'No results found',
    description: 'Try adjusting your search or filters',
  },
  
  error: {
    icon: '⚠️',
    title: 'Something went wrong',
    description: 'We couldn\'t load this content. Please try again.',
  },
  
  offline: {
    icon: '🌐',
    title: 'You\'re offline',
    description: 'Check your internet connection and try again',
  },
};
```

## Animation & Transitions

### Timing Functions

```typescript
export const animations = {
  // Easing curves
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
  
  // Durations
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    entering: 225,
    leaving: 195,
  },
  
  // Common transitions
  transitions: {
    default: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    
    // Specific properties
    color: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
```

### Animation Patterns

```typescript
export const animationPatterns = {
  // Fade animations
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 200,
  },
  
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: 150,
  },
  
  // Slide animations
  slideIn: {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' },
    duration: 300,
  },
  
  slideUp: {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: 250,
  },
  
  // Scale animations
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: 200,
  },
  
  // Skeleton pulse
  pulse: {
    keyframes: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    duration: 2000,
    iteration: 'infinite',
  },
  
  // Loading spinner
  spin: {
    keyframes: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    duration: 1000,
    iteration: 'infinite',
    timing: 'linear',
  },
};
```

## Component Specifications

### Button Variants

```typescript
export const buttonVariants = {
  // Sizes
  sizes: {
    small: {
      padding: '6px 12px',
      fontSize: '0.8125rem',
      lineHeight: 1.75,
      minHeight: 32,
    },
    medium: {
      padding: '8px 16px',
      fontSize: '0.875rem',
      lineHeight: 1.75,
      minHeight: 36,
    },
    large: {
      padding: '10px 20px',
      fontSize: '0.9375rem',
      lineHeight: 1.75,
      minHeight: 42,
    },
  },
  
  // Variants
  contained: {
    primary: {
      backgroundColor: '#0F766E',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#065f46',
      },
    },
    secondary: {
      backgroundColor: '#1e40af',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#1e3a8a',
      },
    },
    error: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#991b1b',
      },
    },
  },
  
  outlined: {
    primary: {
      borderColor: '#0F766E',
      color: '#0F766E',
      '&:hover': {
        backgroundColor: 'rgba(15, 118, 110, 0.04)',
        borderColor: '#065f46',
      },
    },
  },
  
  text: {
    primary: {
      color: '#0F766E',
      '&:hover': {
        backgroundColor: 'rgba(15, 118, 110, 0.04)',
      },
    },
  },
  
  // Icon buttons
  iconButton: {
    small: { padding: 4, fontSize: '1.25rem' },
    medium: { padding: 8, fontSize: '1.5rem' },
    large: { padding: 12, fontSize: '1.75rem' },
  },
};
```

### Form Components

```typescript
export const formComponents = {
  // Text field variants
  textField: {
    sizes: {
      small: {
        input: { padding: '6px 12px', fontSize: '0.875rem' },
        label: { fontSize: '0.875rem' },
      },
      medium: {
        input: { padding: '8px 14px', fontSize: '1rem' },
        label: { fontSize: '1rem' },
      },
    },
    
    // Density options
    density: {
      compact: { marginTop: 8, marginBottom: 4 },
      normal: { marginTop: 16, marginBottom: 8 },
      comfortable: { marginTop: 24, marginBottom: 12 },
    },
  },
  
  // Select component
  select: {
    menuMaxHeight: 300,
    optionPadding: '6px 16px',
    optionHeight: 36,
  },
  
  // Checkbox & Radio
  checkbox: {
    size: {
      small: 18,
      medium: 24,
    },
    padding: 8,
  },
  
  // Switch
  switch: {
    width: 42,
    height: 26,
    thumb: {
      size: 22,
    },
  },
};
```

### DataGrid Configuration

```typescript
export const dataGridConfig = {
  // Density options
  density: {
    compact: {
      rowHeight: 36,
      headerHeight: 40,
      fontSize: '0.8125rem',
    },
    standard: {
      rowHeight: 52,
      headerHeight: 56,
      fontSize: '0.875rem',
    },
    comfortable: {
      rowHeight: 64,
      headerHeight: 64,
      fontSize: '0.875rem',
    },
  },
  
  // Styling
  styling: {
    border: '1px solid #e5e7eb',
    borderRadius: 8,
    stripedRows: true,
    hoverRow: {
      backgroundColor: 'rgba(15, 118, 110, 0.04)',
    },
    selectedRow: {
      backgroundColor: 'rgba(15, 118, 110, 0.08)',
    },
  },
  
  // Column defaults
  columns: {
    minWidth: 50,
    flex: 1,
    headerAlign: 'left',
    align: 'left',
  },
  
  // Pagination
  pagination: {
    rowsPerPageOptions: [10, 25, 50, 100],
    defaultRowsPerPage: 25,
  },
};
```

### Modal & Dialog Sizes

```typescript
export const modalSizes = {
  small: {
    maxWidth: 400,
    margin: 16,
  },
  medium: {
    maxWidth: 600,
    margin: 32,
  },
  large: {
    maxWidth: 800,
    margin: 48,
  },
  fullWidth: {
    maxWidth: 'calc(100% - 64px)',
    margin: 32,
  },
  fullScreen: {
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    margin: 0,
    borderRadius: 0,
  },
};
```

## Feedback Patterns

### Toast Notifications

```typescript
export const toastConfig = {
  // Positions
  position: {
    topRight: { top: 24, right: 24 },
    topLeft: { top: 24, left: 24 },
    bottomRight: { bottom: 24, right: 24 },
    bottomLeft: { bottom: 24, left: 24 },
    topCenter: { top: 24, left: '50%', transform: 'translateX(-50%)' },
    bottomCenter: { bottom: 24, left: '50%', transform: 'translateX(-50%)' },
  },
  
  // Variants
  variants: {
    success: {
      backgroundColor: '#065f46',
      color: '#ffffff',
      icon: '✓',
    },
    error: {
      backgroundColor: '#991b1b',
      color: '#ffffff',
      icon: '✕',
    },
    warning: {
      backgroundColor: '#92400e',
      color: '#ffffff',
      icon: '⚠',
    },
    info: {
      backgroundColor: '#1e3a8a',
      color: '#ffffff',
      icon: 'ℹ',
    },
  },
  
  // Timing
  duration: {
    short: 3000,
    medium: 5000,
    long: 8000,
    persistent: null,
  },
};
```

### Confirmation Dialogs

```typescript
export const confirmationDialog = {
  // Standard confirmation
  default: {
    title: {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: 8,
    },
    content: {
      fontSize: '1rem',
      color: '#374151',
      marginBottom: 24,
    },
    actions: {
      cancel: {
        variant: 'outlined',
        color: 'inherit',
      },
      confirm: {
        variant: 'contained',
        color: 'primary',
      },
    },
  },
  
  // Destructive action
  destructive: {
    icon: {
      color: '#dc2626',
      size: 48,
      marginBottom: 16,
    },
    actions: {
      confirm: {
        variant: 'contained',
        color: 'error',
      },
    },
  },
};
```

## Drag and Drop

```typescript
export const dragAndDrop = {
  // Dragging state
  dragging: {
    opacity: 0.5,
    cursor: 'grabbing',
    transform: 'scale(1.02)',
  },
  
  // Drag over state
  dragOver: {
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
    borderColor: '#0F766E',
    borderStyle: 'dashed',
  },
  
  // Drop zone
  dropZone: {
    default: {
      border: '2px dashed #e5e7eb',
      borderRadius: 8,
      padding: 32,
      textAlign: 'center',
      cursor: 'pointer',
    },
    active: {
      borderColor: '#0F766E',
      backgroundColor: 'rgba(15, 118, 110, 0.04)',
    },
  },
  
  // Placeholder
  placeholder: {
    backgroundColor: '#f3f4f6',
    border: '2px dashed #d1d5db',
    borderRadius: 4,
  },
};
```

## Accessibility Enhancements

### Focus Indicators

```typescript
export const focusIndicators = {
  // Default focus ring
  default: {
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.2)',
    borderRadius: 'inherit',
  },
  
  // High contrast mode
  highContrast: {
    outline: '3px solid #0F766E',
    outlineOffset: 2,
  },
  
  // Focus visible only
  focusVisible: {
    '&:focus': {
      outline: 'none',
    },
    '&:focus-visible': {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(15, 118, 110, 0.2)',
    },
  },
};
```

### Skip Links

```typescript
export const skipLinks = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
  },
  
  link: {
    position: 'absolute',
    left: '-9999px',
    top: 0,
    padding: '8px 16px',
    backgroundColor: '#0F766E',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: 4,
    
    '&:focus': {
      left: 8,
      top: 8,
    },
  },
};
```

## Implementation Guidelines

### Using the Design System

```typescript
// Example: Creating a consistent button
import { buttonVariants, animations, colors } from '@/theme/design-system';

const StyledButton = styled(Button)(({ theme, size = 'medium', variant = 'contained' }) => ({
  ...buttonVariants.sizes[size],
  ...buttonVariants[variant].primary,
  transition: animations.transitions.default,
  
  '&:hover': {
    ...buttonVariants[variant].primary['&:hover'],
    transform: 'translateY(-1px)',
  },
  
  '&:focus-visible': {
    ...focusIndicators.default,
  },
  
  '&:disabled': {
    ...states.disabled,
  },
}));
```

### Responsive Patterns

```typescript
// Example: Responsive spacing
const ResponsiveContainer = styled(Box)(({ theme }) => ({
  padding: spacing.scale[3], // 24px default
  
  [theme.breakpoints.up('sm')]: {
    padding: spacing.scale[4], // 32px
  },
  
  [theme.breakpoints.up('md')]: {
    padding: spacing.scale[6], // 48px
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: spacing.scale[8], // 64px
  },
}));
```

### Theming Integration

```typescript
// Extend MUI theme with design system
import { createTheme } from '@mui/material/styles';
import { colors, typography, spacing, shadows } from './design-system';

export const theme = createTheme({
  palette: colors,
  typography: typography,
  spacing: spacing.unit,
  shadows: Object.values(shadows),
  shape: {
    borderRadius: layout.borderRadius.default,
  },
  // ... additional theme configuration
});
```

## Best Practices

### Consistency Guidelines

1. **Color Usage**
   - Use semantic colors for their intended purpose
   - Maintain WCAG AA contrast ratios (4.5:1 for normal text)
   - Never use color alone to convey information

2. **Typography**
   - Use the defined type scale consistently
   - Limit font weights to the defined set
   - Ensure readable line lengths (45-75 characters)

3. **Spacing**
   - Use the 8px grid system
   - Be consistent with component spacing
   - Group related elements with appropriate spacing

4. **Interactions**
   - Provide clear hover and focus states
   - Use consistent animation timing
   - Ensure all interactions are keyboard accessible

5. **Feedback**
   - Provide immediate feedback for user actions
   - Use appropriate feedback patterns (toast, dialog, inline)
   - Include loading states for async operations

### Performance Considerations

1. **Animations**
   - Use CSS transforms over position changes
   - Limit simultaneous animations
   - Respect prefers-reduced-motion

2. **Shadows**
   - Use sparingly for performance
   - Consider using borders for subtle elevation
   - Cache shadow values when possible

3. **Loading**
   - Show skeletons immediately
   - Progressive loading for large datasets
   - Optimistic UI updates where appropriate

This design system specification provides a complete reference for building consistent, accessible, and performant UI/UX across the IFLA Standards Platform admin interface.