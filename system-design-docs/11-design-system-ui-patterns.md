# Design System and UI Patterns

**Version:** 1.0  
**Date:** January 2025  
**Status:** Consolidated Reference Document

## Overview

This document consolidates the complete design system for the IFLA Standards Platform, including design tokens, component patterns, mockup references, and accessibility standards. It serves as the comprehensive reference for all UI/UX implementation across the admin interface.

## Design Tokens

### Color System

```typescript
// Primary Palette (Teal)
export const colors = {
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
```

## Navigation Components

### Global Navbar

Persistent top navigation with user context

```tsx
import { AppBar, Toolbar, IconButton, Avatar, Menu, MenuItem, Typography, Box } from '@mui/material';
import { AccountCircle, Notifications, Settings } from '@mui/icons-material';
import Link from 'next/link';
import { addBasePath } from '@ifla/theme/utils';

export function GlobalNavbar({ user }: { user: AppUser }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
        boxShadow: 1,
      }}
    >
      <Toolbar sx={{ height: 64 }}>
        {/* Logo/Brand */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          IFLA Standards
        </Typography>
        
        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* User Actions */}
        <IconButton
          aria-label="View notifications"
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={3} color="error">
            <Notifications />
          </Badge>
        </IconButton>
        
        <IconButton
          aria-label="Settings"
          component={Link}
          href="/settings"
          sx={{ mr: 2 }}
        >
          <Settings />
        </IconButton>
        
        {/* User Menu */}
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="User menu"
          aria-controls="user-menu"
          aria-haspopup="true"
        >
          <Avatar 
            alt={user.name}
            src={user.avatar}
            sx={{ width: 32, height: 32 }}
          />
        </IconButton>
        
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem component={Link} href="/profile">Profile</MenuItem>
          <MenuItem component={Link} href="/settings">Settings</MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
```

### Left Sidebar Navigation

Collapsible left sidebar with domain selection

```tsx
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, IconButton, Box } from '@mui/material';
import { ExpandLess, ExpandMore, ChevronLeft, ChevronRight } from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  selectedDomain: string;
  onDomainSelect: (domain: string) => void;
}

export function Sidebar({ open, onToggle, selectedDomain, onDomainSelect }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const drawerWidth = open ? 240 : 64;
  
  const navigationItems = [
    {
      id: 'users',
      label: 'User Management',
      icon: <People />,
      children: [
        { id: 'users-list', label: 'All Users', href: '/users' },
        { id: 'users-invite', label: 'Invite Users', href: '/users/invite' },
        { id: 'users-roles', label: 'Role Management', href: '/users/roles' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <Assignment />,
      children: [
        { id: 'projects-active', label: 'Active Projects', href: '/projects' },
        { id: 'projects-charter', label: 'Charter New', href: '/projects/new' },
        { id: 'projects-archive', label: 'Archived', href: '/projects/archived' },
      ],
    },
    // ... more navigation items
  ];
  
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          top: 64, // Below navbar
          height: 'calc(100% - 64px)',
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {/* Collapse Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={onToggle} size="small">
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>
      
      <List>
        {navigationItems.map((item) => (
          <React.Fragment key={item.id}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => item.children && toggleExpanded(item.id)}
                selected={selectedDomain === item.id}
              >
                <ListItemIcon
                  sx={{
                    minWidth: open ? 40 : 56,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <>
                    <ListItemText primary={item.label} />
                    {item.children && (
                      expandedItems.includes(item.id) ? <ExpandLess /> : <ExpandMore />
                    )}
                  </>
                )}
              </ListItemButton>
            </ListItem>
            
            {/* Child Items */}
            {open && item.children && (
              <Collapse in={expandedItems.includes(item.id)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.id}
                      component={Link}
                      href={child.href}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText primary={child.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
}
```

## Data Display Components

### DataGrid with Actions

MUI DataGrid with top and row-level actions

```tsx
import { 
  DataGrid, 
  GridColDef, 
  GridRowSelectionModel,
  GridActionsCellItem,
  GridToolbar,
} from '@mui/x-data-grid';
import { 
  Box, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import { 
  Delete, 
  Edit, 
  MoreVert, 
  Search,
  Download,
  Upload,
  FilterList,
} from '@mui/icons-material';

interface DataTableProps<T> {
  rows: T[];
  onEdit: (row: T) => void;
  onDelete: (ids: string[]) => void;
  onExport: () => void;
  onImport: () => void;
}

export function DataTable<T extends { id: string }>({ 
  rows, 
  onEdit, 
  onDelete, 
  onExport,
  onImport,
}: DataTableProps<T>) {
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<T | null>(null);
  
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'created', headerName: 'Created', width: 150 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      getActions: (params) => [
        <IconButton
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            setSelectedRow(params.row);
          }}
          aria-label={`Actions for ${params.row.name}`}
          size="small"
        >
          <MoreVert />
        </IconButton>,
      ],
    },
  ];
  
  const filteredRows = rows.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  );
  
  return (
    <Box sx={{ height: 600, width: '100%' }}>
      {/* Top Action Bar */}
      <Stack 
        direction="row" 
        spacing={2} 
        sx={{ mb: 2 }}
        alignItems="center"
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        
        {/* Bulk Actions */}
        {selectionModel.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => onDelete(selectionModel as string[])}
          >
            Delete Selected ({selectionModel.length})
          </Button>
        )}
        
        {/* Global Actions */}
        <Button
          variant="outlined"
          startIcon={<FilterList />}
        >
          Filters
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={onExport}
        >
          Export
        </Button>
        
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={onImport}
        >
          Import
        </Button>
      </Stack>
      
      {/* Data Grid */}
      <DataGrid
        rows={filteredRows}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={setSelectionModel}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
          },
          '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: 'action.selected',
            '&:hover': {
              backgroundColor: 'action.selected',
            },
          },
        }}
      />
      
      {/* Row Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          if (selectedRow) onEdit(selectedRow);
          setAnchorEl(null);
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedRow) onDelete([selectedRow.id]);
          setAnchorEl(null);
        }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}
```

### Empty State Component

Reusable empty state with customizable content

```tsx
import { Box, Typography, Button, SvgIcon } from '@mui/material';
import { Add, Search, CloudUpload } from '@mui/icons-material';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ElementType;
  };
  variant?: 'default' | 'search' | 'error' | 'offline';
}

export function EmptyState({ 
  icon: Icon = Search,
  title,
  description,
  action,
  variant = 'default'
}: EmptyStateProps) {
  const variantConfig = {
    default: { iconColor: 'text.secondary' },
    search: { iconColor: 'primary.main' },
    error: { iconColor: 'error.main' },
    offline: { iconColor: 'warning.main' },
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <SvgIcon
        component={Icon}
        sx={{
          fontSize: 64,
          color: variantConfig[variant].iconColor,
          mb: 2,
        }}
      />
      
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 600, color: 'text.primary' }}
      >
        {title}
      </Typography>
      
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, maxWidth: 400 }}
        >
          {description}
        </Typography>
      )}
      
      {action && (
        <Button
          variant="contained"
          onClick={action.onClick}
          startIcon={action.icon && <SvgIcon component={action.icon} />}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}
```

## Form Components

### Accessible Form Pattern

Fully accessible form with validation

```tsx
import { 
  TextField, 
  Button, 
  FormControl, 
  FormLabel,
  FormHelperText,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Stack,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

interface FormData {
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive';
  notifications: boolean;
}

export function AccessibleForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      role: '',
      permissions: [],
      status: 'active',
      notifications: true,
    },
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        {/* Text Input */}
        <Controller
          name="name"
          control={control}
          rules={{ 
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Name"
              required
              error={!!errors.name}
              helperText={errors.name?.message}
              aria-describedby={errors.name ? 'name-error' : 'name-helper'}
              inputProps={{
                'aria-required': true,
                'aria-invalid': !!errors.name,
              }}
            />
          )}
        />
        
        {/* Email Input */}
        <Controller
          name="email"
          control={control}
          rules={{ 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="email"
              label="Email"
              required
              error={!!errors.email}
              helperText={errors.email?.message}
              inputProps={{
                'aria-required': true,
                'aria-invalid': !!errors.email,
                'aria-describedby': errors.email ? 'email-error' : 'email-helper',
              }}
            />
          )}
        />
        
        {/* Select */}
        <Controller
          name="role"
          control={control}
          rules={{ required: 'Role is required' }}
          render={({ field }) => (
            <FormControl required error={!!errors.role}>
              <FormLabel id="role-label">Role</FormLabel>
              <Select
                {...field}
                labelId="role-label"
                label="Role"
                aria-describedby={errors.role ? 'role-error' : undefined}
              >
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
              {errors.role && (
                <FormHelperText id="role-error">{errors.role.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />
        
        {/* Radio Group */}
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormControl>
              <FormLabel id="status-label">Status</FormLabel>
              <RadioGroup
                {...field}
                aria-labelledby="status-label"
                row
              >
                <FormControlLabel 
                  value="active" 
                  control={<Radio />} 
                  label="Active" 
                />
                <FormControlLabel 
                  value="inactive" 
                  control={<Radio />} 
                  label="Inactive" 
                />
              </RadioGroup>
            </FormControl>
          )}
        />
        
        {/* Checkbox */}
        <Controller
          name="notifications"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  {...field}
                  checked={field.value}
                  inputProps={{
                    'aria-describedby': 'notifications-helper',
                  }}
                />
              }
              label="Receive email notifications"
            />
          )}
        />
        
        {/* Form Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" type="button">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
```

## Feedback Components

### Toast Notifications

Toast notification system

```tsx
import { Snackbar, Alert, AlertTitle, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

interface ToastProps {
  open: boolean;
  onClose: () => void;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  duration?: number;
  action?: React.ReactNode;
}

export function Toast({ 
  open, 
  onClose, 
  message, 
  severity, 
  title,
  duration = 5000,
  action,
}: ToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ minWidth: 300 }}
        action={
          action || (
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <Close fontSize="inherit" />
            </IconButton>
          )
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
}

// Toast provider/hook
export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);
  
  const showToast = (options: Omit<ToastProps, 'open' | 'onClose'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...options, id, open: true, onClose: () => {} }]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, options.duration || 5000);
  };
  
  return { showToast, toasts };
}
```

### Confirmation Dialog

Reusable confirmation dialog

```tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {severity && (
            <Warning 
              color={severity} 
              sx={{ fontSize: 28 }}
            />
          )}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {cancelText}
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          color={severity === 'error' ? 'error' : 'primary'}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

## Loading States

Various loading state patterns

```tsx
import { Skeleton, Box, CircularProgress, LinearProgress } from '@mui/material';

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={40} />
        ))}
      </Box>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex', gap: 2, mb: 1 }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              variant="rectangular" 
              width={`${100 / columns}%`} 
              height={52} 
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

// Card skeleton
export function CardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={40} />
      </CardContent>
    </Card>
  );
}

// Loading overlay
export function LoadingOverlay({ open }: { open: boolean }) {
  if (!open) return null;
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(2px)',
        zIndex: 9999,
      }}
    >
      <CircularProgress size={40} />
    </Box>
  );
}

// Progress bar
export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <Box sx={{ width: '100%' }}>
      {label && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(value)}%
          </Typography>
        </Box>
      )}
      <LinearProgress 
        variant="determinate" 
        value={value} 
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );
}
```

## Responsive Patterns

### Responsive Grid Layout

Responsive grid that adapts to screen size

```tsx
import { Box, Card, CardContent, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

export function ResponsiveGrid({ items }: { items: Array<{ id: string; title: string; content: string }> }) {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      {items.map((item) => (
        <Grid 
          key={item.id}
          size={{ 
            xs: 12,      // Full width on mobile
            sm: 6,       // Half width on tablet
            md: 4,       // Third width on desktop
            lg: 3,       // Quarter width on large screens
          }}
        >
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.content}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
```

### Mobile-Responsive Navigation

Navigation that adapts for mobile

```tsx
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';

export function ResponsiveNav() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" noWrap component="div">
            IFLA Standards
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isMobile ? '80%' : 240,
          },
        }}
      >
        {/* Navigation content */}
      </Drawer>
    </>
  );
}
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

## Admin Dashboard Mockup Reference
*Source: Document 29 - Admin Dashboard Mockup Reference*

### Mockup Inventory

The existing SVG mockups in `/IFLA_OMR25_link/mockups/` provide visual references for implementation:

#### Core Admin Panel
1. **admin-dashboard-mockup.svg** - Main dashboard with stats cards and navigation
2. **activities-mockup.svg** - Activity feed and audit log display

#### Entity Management (CRUD Forms)
- **namespaces/** - Namespace listing and forms
- **profiles/** - DCTAP profile management
- **projects/** - Project management interfaces
- **users/** - User management screens
- **vocabularies/** - Vocabulary listing and forms

#### Common Components
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

#### Workflow Screens
- **batch/** - Batch import/export operations
- **translation/** - Translation workflow interfaces
- **vocabulary/** - Vocabulary management workflows

### Mockup Color Mapping

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

### Mockup Layout Patterns

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

### Workflow-Specific Patterns

1. **Multi-Step Processes** (step-indicator.svg)
   - Linear progress indicator with numbered steps
   - Active step in primary color (#0F766E)
   - Completed steps with checkmark
   - Future steps in gray

2. **Validation Reports** (validation-report.svg)
   - Severity indicators (error/warning/info)
   - Expandable error details
   - Line number references
   - Suggested fixes

3. **Language Selection** (language-selector.svg)
   - Flag icons for visual recognition
   - Dropdown with search
   - Selected language highlighted
   - Language code display

4. **Batch Operations** (batch-action-picker.svg)
   - Checkbox selection pattern
   - Action toolbar appears on selection
   - Bulk action dropdown
   - Selection count display

### Implementation Guidelines from Mockups

1. **Use MUI Components**
   - Map mockup patterns to MUI components
   - Stats cards → MUI Card with custom styling
   - Navigation → MUI Drawer + List
   - Forms → MUI TextField, Select, Button
   - Tables → MUI DataGrid or Table

2. **Maintain Consistency**
   - Use exact color values from mockups
   - Match spacing and sizing
   - Preserve interaction patterns
   - Keep visual hierarchy

3. **Responsive Considerations**
   - Sidebar becomes drawer on mobile
   - Stats cards stack vertically
   - Tables become cards on small screens
   - Maintain touch-friendly tap targets

4. **Accessibility Enhancements**
   - Add ARIA labels not visible in mockups
   - Ensure color contrast meets WCAG AA
   - Provide keyboard navigation
   - Include screen reader announcements

### SVG Assets Priority

#### Priority 1 - Core Admin
- `/Admin Panel/admin-dashboard-mockup.svg`
- `/Admin Panel/activities-mockup.svg`
- `/common components/breadcrumbs.svg`
- `/common components/notification-banner.svg`

#### Priority 2 - Entity Management
- `/Admin Panel/users/index.svg`
- `/Admin Panel/users/form.svg`
- `/Admin Panel/namespaces/index.svg`
- `/Admin Panel/namespaces/form.svg`

#### Priority 3 - Workflows
- `/batch/batch-import-mockup.svg`
- `/translation/translation-workflow.svg`
- `/vocabulary/vocabulary-dashboard.svg`

#### Priority 4 - Components
- All files in `/common components/`

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

1. **Color Contrast**
   - Normal text: 4.5:1 minimum
   - Large text: 3:1 minimum
   - UI components: 3:1 minimum
   - All colors tested with design tokens

2. **Keyboard Navigation**
   - All interactive elements keyboard accessible
   - Logical tab order
   - Focus indicators visible
   - Skip links for main content

3. **Screen Reader Support**
   - Semantic HTML structure
   - Proper ARIA labels and descriptions
   - Live regions for dynamic content
   - Form validation announcements

4. **Responsive Design**
   - Mobile-first approach
   - Touch targets minimum 44x44px
   - Readable text without horizontal scroll
   - Zoom support up to 200%

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

## Implementation Best Practices

### Component Composition

```tsx
// Example of composing components properly
import { Box, Paper, Typography, Divider } from '@mui/material';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({ title, subtitle, actions, children }: PageLayoutProps) {
  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {actions && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {/* Content */}
      <Paper 
        sx={{ 
          p: { xs: 2, sm: 3 },
          backgroundColor: 'background.paper',
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}
```

### Error Boundaries

```tsx
// Error boundary component
import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };
  
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }
  
  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              p: 3,
              textAlign: 'center',
            }}
          >
            <ErrorOutline 
              sx={{ fontSize: 64, color: 'error.main', mb: 2 }} 
            />
            <Typography variant="h5" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Box>
        )
      );
    }
    
    return this.props.children;
  }
}
```

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

This consolidated design system document provides a complete reference for building consistent, accessible, and performant UI/UX across the IFLA Standards Platform admin interface.