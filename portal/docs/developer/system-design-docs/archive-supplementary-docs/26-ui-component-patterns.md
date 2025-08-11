# UI Component Patterns Reference

**Version:** 1.0  
**Date:** July 2025  
**Status:** Implementation Guide

## Overview

This document provides practical implementation patterns for common UI components in the IFLA Standards Platform admin interface. Each pattern includes MUI implementation examples with proper accessibility and state handling.

## Navigation Components

### Global Navbar

```tsx
// Persistent top navigation with user context
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

```tsx
// Collapsible left sidebar with domain selection
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

### Tabbed Navigation

```tsx
// In-page tab navigation for subdomains
import { Tabs, Tab, Box, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function TabbedContent({ tabs }: { tabs: Array<{ label: string; content: React.ReactNode }> }) {
  const router = useRouter();
  const [value, setValue] = useState(0);
  
  // Persist tab state in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabIndex = parseInt(params.get('tab') || '0');
    if (tabIndex >= 0 && tabIndex < tabs.length) {
      setValue(tabIndex);
    }
  }, [tabs.length]);
  
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', newValue.toString());
    router.replace(`${window.location.pathname}?${params.toString()}`);
  };
  
  return (
    <Paper sx={{ width: '100%' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="Content tabs"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            id={`tab-${index}`}
            aria-controls={`tabpanel-${index}`}
          />
        ))}
      </Tabs>
      
      {tabs.map((tab, index) => (
        <TabPanel key={index} value={value} index={index}>
          {tab.content}
        </TabPanel>
      ))}
    </Paper>
  );
}
```

## Data Display Components

### DataGrid with Actions

```tsx
// MUI DataGrid with top and row-level actions
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

```tsx
// Reusable empty state with customizable content
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

### Loading States

```tsx
// Various loading state patterns
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

## Form Components

### Accessible Form Pattern

```tsx
// Fully accessible form with validation
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

```tsx
// Toast notification system
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

```tsx
// Reusable confirmation dialog
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

## Responsive Patterns

### Responsive Grid Layout

```tsx
// Responsive grid that adapts to screen size
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

```tsx
// Navigation that adapts for mobile
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

This component patterns reference provides practical, accessible implementations that follow the design system specifications and can be directly used in the IFLA Standards Platform admin interface.
