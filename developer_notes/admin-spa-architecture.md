# Admin SPA Architecture for IFLA Standards Platform

## Overview

This document outlines the architecture for implementing a sophisticated admin Single Page Application (SPA) within the Docusaurus-based IFLA Standards platform. The admin section combines public dashboards with protected action pages, using namespace-based routing and role-based access control.

## Core Concepts

### 1. Admin as SPA within Docusaurus

The admin section functions as a full SPA within Docusaurus, providing:
- Dynamic routing with namespace-based data fetching
- Public dashboards with conditional UI elements
- Protected action pages with form submissions
- Seamless navigation without page reloads

### 2. Namespace-Based Architecture

All admin functionality is organized by namespace (e.g., `isbd`, `unimarc`, `lrm`):
- Routes include namespace: `/admin/dashboard/isbd`
- Data fetching is namespace-specific
- Permissions are namespace-scoped
- UI adapts to namespace context

### 3. Public vs Protected Content

- **Public Dashboards**: Viewable by anyone, with conditional action buttons
- **Protected Actions**: Require authentication and authorization
- **Conditional UI**: Elements show/hide based on user permissions

## Technical Architecture

### Route Structure

```
/admin/dashboard/{namespace}    # Public dashboard with status views
/admin/team/{namespace}         # Team management interface
/admin/qa/{namespace}           # Quality assurance tools
/admin/actions/{namespace}/{actionId}  # Protected action forms
```

### Component Structure

```
packages/theme/src/components/admin/
├── AdminRouter.tsx             # Main router for public routes
├── ActionRouter.tsx            # Router for protected action routes
├── AdminLayout.tsx             # Shared layout with navigation
├── Dashboard/
│   ├── index.tsx              # Main dashboard component
│   ├── StatusView.tsx         # Public status with conditional actions
│   ├── DevelopmentView.tsx    # Active project views
│   └── MetricsView.tsx        # Quality and performance metrics
├── TeamView/
│   ├── index.tsx              # Team management interface
│   └── MemberList.tsx         # Team member display
├── QAView/
│   ├── index.tsx              # QA tools interface
│   └── ValidationResults.tsx  # Test results display
├── Actions/
│   ├── ActionForm.tsx         # Dynamic form renderer
│   ├── forms/                 # Form configurations
│   └── handlers/              # Action handlers
└── common/
    ├── UnauthorizedView.tsx   # Access denied component
    ├── LoadingView.tsx        # Loading states
    └── NamespaceSwitcher.tsx  # Namespace navigation
```

## Implementation Details

### 1. Custom Docusaurus Plugin for Dynamic Routes

Create a plugin that generates routes dynamically based on configured namespaces:

```javascript
// portal/plugins/admin-routes-plugin.js
module.exports = function adminRoutesPlugin(context, options) {
  return {
    name: 'admin-routes-plugin',
    
    async loadContent() {
      // Load namespaces from configuration
      const namespaces = ['isbd', 'unimarc', 'lrm', 'frbr', 'muldicat', 'newtest'];
      const routeTypes = ['dashboard', 'team', 'qa'];
      const actions = ['create-team', 'export-data', 'import-vocabulary', 'publish-version'];
      
      return { namespaces, routeTypes, actions };
    },
    
    async contentLoaded({ content, actions }) {
      const { namespaces, routeTypes, actions: actionTypes } = content;
      
      // Generate public routes for each namespace/type combination
      await Promise.all(
        routeTypes.flatMap(routeType =>
          namespaces.map(namespace =>
            actions.addRoute({
              path: `/admin/${routeType}/${namespace}`,
              component: require.resolve('../src/components/admin/AdminRouter.tsx'),
              exact: true,
              props: {
                routeType,
                namespace,
                routeData: { routeType, namespace }
              }
            })
          )
        )
      );
      
      // Generate protected action routes
      await Promise.all(
        namespaces.flatMap(namespace =>
          actionTypes.map(action =>
            actions.addRoute({
              path: `/admin/actions/${namespace}/${action}`,
              component: require.resolve('../src/components/admin/ActionRouter.tsx'),
              exact: true,
              props: {
                namespace,
                actionId: action,
                routeData: { namespace, actionId: action }
              }
            })
          )
        )
      );
      
      // Generate index route
      await actions.addRoute({
        path: '/admin',
        component: require.resolve('../src/components/admin/AdminIndex.tsx'),
        exact: true
      });
    }
  };
};
```

### 2. Main Admin Router Component

Handles routing logic for public admin pages:

```typescript
// packages/theme/src/components/admin/AdminRouter.tsx
import React from 'react';
import { useLocation } from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { AdminLayout } from './AdminLayout';
import { Dashboard } from './Dashboard';
import { TeamView } from './TeamView';
import { QAView } from './QAView';

interface AdminRouterProps {
  routeType: string;
  namespace: string;
  routeData: {
    routeType: string;
    namespace: string;
  };
}

export default function AdminRouter({ routeType, namespace }: AdminRouterProps) {
  return (
    <Layout
      title={`${namespace.toUpperCase()} ${routeType.charAt(0).toUpperCase() + routeType.slice(1)}`}
      description={`Administrative interface for ${namespace}`}>
      <BrowserOnly fallback={<div>Loading admin panel...</div>}>
        {() => <AdminRouterContent routeType={routeType} namespace={namespace} />}
      </BrowserOnly>
    </Layout>
  );
}

function AdminRouterContent({ routeType, namespace }: Omit<AdminRouterProps, 'routeData'>) {
  const renderContent = () => {
    switch (routeType) {
      case 'dashboard':
        return <Dashboard namespace={namespace} />;
      case 'team':
        return <TeamView namespace={namespace} />;
      case 'qa':
        return <QAView namespace={namespace} />;
      default:
        return <div>Route not found</div>;
    }
  };

  return (
    <AdminLayout namespace={namespace} currentRoute={routeType}>
      {renderContent()}
    </AdminLayout>
  );
}
```

### 3. Dashboard Implementation

Public dashboard with conditional action buttons:

```typescript
// packages/theme/src/components/admin/Dashboard/index.tsx
import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Button, CircularProgress } from '@mui/material';
import { useAdminSession } from '../../../hooks/useAdminSession';
import { StatusView } from './StatusView';
import { DevelopmentView } from './DevelopmentView';
import { MetricsView } from './MetricsView';
import { TeamPerformanceView } from './TeamPerformanceView';

interface DashboardProps {
  namespace: string;
}

export function Dashboard({ namespace }: DashboardProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, teams } = useAdminSession();

  // Check if user has admin permissions for this namespace
  const isNamespaceAdmin = teams?.includes(`${namespace}-admin`) || 
                          teams?.includes('system-admin') || 
                          teams?.includes('ifla-admin');

  useEffect(() => {
    fetchDashboardData();
  }, [namespace]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/${namespace}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Status Overview" />
          <Tab label="Development Status" />
          <Tab label="Quality Metrics" />
          <Tab label="Team Performance" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && (
          <StatusView 
            data={dashboardData?.statusData} 
            namespace={namespace}
            actions={
              isAuthenticated && isNamespaceAdmin ? (
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    href={`/admin/actions/${namespace}/refresh-status`}
                  >
                    Refresh Status
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    href={`/admin/actions/${namespace}/export-data`}
                  >
                    Export Data
                  </Button>
                </Box>
              ) : null
            }
          />
        )}

        {activeTab === 1 && (
          <DevelopmentView 
            data={dashboardData?.developmentData} 
            namespace={namespace}
            isActiveProject={dashboardData?.isActiveProject}
          />
        )}

        {activeTab === 2 && (
          <MetricsView 
            data={dashboardData?.metricsData} 
            namespace={namespace}
          />
        )}

        {activeTab === 3 && (
          <TeamPerformanceView 
            data={dashboardData?.teamData} 
            namespace={namespace}
          />
        )}
      </Box>
    </Box>
  );
}
```

### 4. Action Router for Protected Pages

Handles authorization and routing for action pages:

```typescript
// packages/theme/src/components/admin/ActionRouter.tsx
import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { ProtectedRoute } from '../../ProtectedRoute';
import { ActionForm } from './Actions/ActionForm';

interface ActionRouterProps {
  namespace: string;
  actionId: string;
  routeData: {
    namespace: string;
    actionId: string;
  };
}

export default function ActionRouter({ namespace, actionId }: ActionRouterProps) {
  // Map action IDs to required teams
  const getRequiredTeams = (actionId: string): string[] => {
    switch (actionId) {
      case 'create-team':
      case 'publish-version':
        return [`${namespace}-admin`, 'system-admin', 'ifla-admin'];
      case 'export-data':
      case 'import-vocabulary':
        return [`${namespace}-editor`, `${namespace}-admin`, 'system-admin', 'ifla-admin'];
      default:
        return [`${namespace}-admin`];
    }
  };

  return (
    <Layout
      title={`${actionId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${namespace.toUpperCase()}`}
      description={`Action form for ${namespace}`}>
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => (
          <ProtectedRoute requiredTeams={getRequiredTeams(actionId)}>
            <ActionForm namespace={namespace} actionId={actionId} />
          </ProtectedRoute>
        )}
      </BrowserOnly>
    </Layout>
  );
}
```

### 5. Admin Layout with Navigation

Provides consistent navigation across admin pages:

```typescript
// packages/theme/src/components/admin/AdminLayout.tsx
import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Group, 
  BugReport, 
  Settings,
  ArrowBack
} from '@mui/icons-material';
import { useAdminSession } from '../../hooks/useAdminSession';
import Link from '@docusaurus/Link';

interface AdminLayoutProps {
  namespace: string;
  currentRoute: string;
  children: React.ReactNode;
}

const AVAILABLE_NAMESPACES = [
  { value: 'isbd', label: 'ISBD' },
  { value: 'isbdm', label: 'ISBDM' },
  { value: 'lrm', label: 'LRM' },
  { value: 'frbr', label: 'FRBR' },
  { value: 'muldicat', label: 'MulDiCat' },
  { value: 'unimarc', label: 'UNIMARC' },
  { value: 'newtest', label: 'NewTest' }
];

export function AdminLayout({ namespace, currentRoute, children }: AdminLayoutProps) {
  const { isAuthenticated, teams } = useAdminSession();
  const drawerWidth = 240;

  const navigationItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: `/admin/dashboard/${namespace}`,
      route: 'dashboard'
    },
    { 
      text: 'Team Management', 
      icon: <Group />, 
      path: `/admin/team/${namespace}`,
      route: 'team'
    },
    { 
      text: 'Quality Assurance', 
      icon: <BugReport />, 
      path: `/admin/qa/${namespace}`,
      route: 'qa'
    }
  ];

  // Add actions menu for authorized users
  if (isAuthenticated && (teams?.includes(`${namespace}-admin`) || teams?.includes('system-admin'))) {
    navigationItems.push({ 
      text: 'Actions', 
      icon: <Settings />, 
      path: `/admin/actions/${namespace}/menu`,
      route: 'actions'
    });
  }

  const handleNamespaceChange = (newNamespace: string) => {
    window.location.href = `/admin/${currentRoute}/${newNamespace}`;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'var(--ifm-color-primary)'
        }}
      >
        <Toolbar>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <ArrowBack sx={{ mr: 2 }} />
          </Link>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={namespace}
              onChange={(e) => handleNamespaceChange(e.target.value)}
              sx={{ color: 'white' }}
            >
              {AVAILABLE_NAMESPACES.map(ns => (
                <MenuItem key={ns.value} value={ns.value}>
                  {ns.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            marginTop: '64px'
          },
        }}
      >
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navigationItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                component={Link}
                to={item.path}
                selected={currentRoute === item.route}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'var(--ifm-color-primary-lighter)',
                  }
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          marginTop: '64px',
          marginLeft: `${drawerWidth}px`
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
```

### 6. Dynamic Action Forms

Forms that adapt based on action configuration:

```typescript
// packages/theme/src/components/admin/Actions/ActionForm.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Box, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAdminSession } from '../../../hooks/useAdminSession';

interface ActionFormProps {
  namespace: string;
  actionId: string;
}

interface FormConfig {
  title: string;
  description: string;
  fields: FormField[];
  submitLabel?: string;
  successMessage?: string;
}

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number' | 'email';
  required?: boolean;
  options?: { value: string; label: string }[];
  multiline?: boolean;
  rows?: number;
  helperText?: string;
}

export function ActionForm({ namespace, actionId }: ActionFormProps) {
  const { username } = useAdminSession();
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadFormConfiguration();
  }, [namespace, actionId]);

  const loadFormConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In production, fetch from API
      // For now, use local configuration
      const config = getFormConfig(actionId);
      setFormConfig(config);
      setFormData(config.defaultValues || {});
    } catch (error) {
      setError('Failed to load form configuration');
      console.error('Failed to load form configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFormConfig = (actionId: string): FormConfig => {
    const configs: Record<string, FormConfig> = {
      'create-team': {
        title: 'Create GitHub Team',
        description: 'Create a new team for this namespace in the GitHub organization',
        fields: [
          {
            name: 'teamName',
            label: 'Team Name',
            type: 'text',
            required: true,
            helperText: 'Will be prefixed with namespace (e.g., isbd-editors)'
          },
          {
            name: 'description',
            label: 'Team Description',
            type: 'textarea',
            multiline: true,
            rows: 3,
            required: true
          },
          {
            name: 'privacy',
            label: 'Privacy Level',
            type: 'select',
            required: true,
            options: [
              { value: 'closed', label: 'Closed (visible to organization members)' },
              { value: 'secret', label: 'Secret (only visible to team members)' }
            ]
          }
        ],
        submitLabel: 'Create Team',
        successMessage: 'Team created successfully!'
      },
      'export-data': {
        title: 'Export Data',
        description: 'Export namespace data in various formats',
        fields: [
          {
            name: 'format',
            label: 'Export Format',
            type: 'select',
            required: true,
            options: [
              { value: 'csv', label: 'CSV' },
              { value: 'rdf-ttl', label: 'RDF (Turtle)' },
              { value: 'rdf-jsonld', label: 'RDF (JSON-LD)' },
              { value: 'json', label: 'JSON' }
            ]
          },
          {
            name: 'includeMetadata',
            label: 'Include Metadata',
            type: 'select',
            required: true,
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' }
            ]
          },
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
            helperText: 'Download link will be sent to this email'
          }
        ],
        submitLabel: 'Export Data',
        successMessage: 'Export initiated! You will receive an email with the download link.'
      },
      'import-vocabulary': {
        title: 'Import Vocabulary',
        description: 'Import vocabulary data from Google Sheets or CSV',
        fields: [
          {
            name: 'source',
            label: 'Import Source',
            type: 'select',
            required: true,
            options: [
              { value: 'google-sheets', label: 'Google Sheets' },
              { value: 'csv-url', label: 'CSV URL' },
              { value: 'csv-upload', label: 'CSV Upload' }
            ]
          },
          {
            name: 'sourceUrl',
            label: 'Source URL',
            type: 'text',
            required: true,
            helperText: 'Google Sheets URL or CSV URL'
          },
          {
            name: 'validationLevel',
            label: 'Validation Level',
            type: 'select',
            required: true,
            options: [
              { value: 'strict', label: 'Strict (fail on any error)' },
              { value: 'warnings', label: 'Warnings (import with warnings)' },
              { value: 'lenient', label: 'Lenient (fix errors automatically)' }
            ]
          }
        ],
        submitLabel: 'Import Vocabulary',
        successMessage: 'Import completed successfully!'
      },
      'publish-version': {
        title: 'Publish New Version',
        description: 'Publish a new version of this namespace',
        fields: [
          {
            name: 'versionType',
            label: 'Version Type',
            type: 'select',
            required: true,
            options: [
              { value: 'major', label: 'Major (breaking changes)' },
              { value: 'minor', label: 'Minor (new features)' },
              { value: 'patch', label: 'Patch (bug fixes)' }
            ]
          },
          {
            name: 'releaseNotes',
            label: 'Release Notes',
            type: 'textarea',
            multiline: true,
            rows: 5,
            required: true,
            helperText: 'Describe the changes in this release'
          },
          {
            name: 'publishTo',
            label: 'Publish To',
            type: 'select',
            required: true,
            options: [
              { value: 'preview', label: 'Preview Environment' },
              { value: 'production', label: 'Production (requires approval)' }
            ]
          }
        ],
        submitLabel: 'Publish Version',
        successMessage: 'Version published successfully!'
      }
    };

    return configs[actionId] || {
      title: 'Unknown Action',
      description: 'This action is not configured',
      fields: []
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/actions/${namespace}/${actionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          namespace,
          actionId,
          submittedBy: username
        })
      });

      if (!response.ok) {
        throw new Error('Action submission failed');
      }

      setSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        window.location.href = `/admin/dashboard/${namespace}`;
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!formConfig) {
    return (
      <Alert severity="error">
        Form configuration not found for action: {actionId}
      </Alert>
    );
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h1" gutterBottom>
          {formConfig.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {formConfig.description}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {formConfig.successMessage || 'Action completed successfully!'}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formConfig.fields.map((field) => (
              <div key={field.name}>
                {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                  <TextField
                    fullWidth
                    label={field.label}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    helperText={field.helperText}
                    disabled={submitting}
                  />
                ) : field.type === 'textarea' ? (
                  <TextField
                    fullWidth
                    label={field.label}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    multiline={field.multiline}
                    rows={field.rows || 3}
                    helperText={field.helperText}
                    disabled={submitting}
                  />
                ) : field.type === 'select' && field.options ? (
                  <FormControl fullWidth required={field.required} disabled={submitting}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      label={field.label}
                    >
                      {field.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {field.helperText && (
                      <Typography variant="caption" sx={{ mt: 0.5, ml: 1.75 }}>
                        {field.helperText}
                      </Typography>
                    )}
                  </FormControl>
                ) : null}
              </div>
            ))}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || success}
              >
                {submitting ? 'Submitting...' : (formConfig.submitLabel || 'Submit')}
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
                disabled={submitting}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Implementation Plan

### Phase 1: Infrastructure Setup (Week 1)

1. **Create Admin Routes Plugin**
   - Configure plugin in `docusaurus.config.ts`
   - Define namespace and route configurations
   - Test route generation

2. **Set Up Base Components**
   - Create component directory structure
   - Implement basic routing components
   - Add MUI theme integration

3. **Update Docusaurus Configuration**
   - Add plugin to configuration
   - Configure MUI CSS injection
   - Set up environment variables

### Phase 2: Core Components (Week 1-2)

1. **Build Layout Components**
   - AdminLayout with navigation
   - Namespace switcher
   - Breadcrumb navigation

2. **Implement Authentication Integration**
   - Connect to existing `useAdminSession` hook
   - Add authorization helpers
   - Test role-based access

3. **Create Base Views**
   - Dashboard shell
   - Team view shell
   - QA view shell

### Phase 3: Dashboard Implementation (Week 2-3)

1. **Status Views**
   - Public status display
   - Conditional action buttons
   - Data fetching logic

2. **Development Views**
   - Active project workflows
   - Progress tracking
   - Milestone display

3. **Metrics and Analytics**
   - Quality metrics
   - Performance indicators
   - Team statistics

### Phase 4: Action Forms (Week 3-4)

1. **Form Configuration System**
   - Dynamic form schemas
   - Validation rules
   - Default values

2. **Action Handlers**
   - API integration
   - Error handling
   - Success feedback

3. **Common Actions**
   - Team management
   - Data import/export
   - Publishing workflows

### Phase 5: Testing and Refinement (Week 4-5)

1. **Update E2E Tests**
   - Navigation tests
   - Role-based access tests
   - Form submission tests

2. **Performance Optimization**
   - Code splitting
   - Lazy loading
   - Caching strategies

3. **Documentation**
   - User guides
   - Developer documentation
   - API documentation

## Key Benefits

1. **True SPA Experience**: Seamless navigation within admin section
2. **Namespace Isolation**: Each namespace has its own data and permissions
3. **Flexible Authorization**: Mix of public and protected content
4. **Scalable Architecture**: Easy to add new namespaces and features
5. **Consistent UI**: MUI components provide professional interface
6. **Developer Friendly**: Clear component structure and patterns

## Technical Considerations

### Client-Side Rendering
- Use `BrowserOnly` wrapper for client-side features
- Implement proper loading states
- Handle SSR/CSR boundaries correctly

### Performance
- Lazy load heavy components
- Cache API responses
- Optimize bundle size

### Security
- Server-side authorization checks
- Validate all form inputs
- Sanitize user content

### Error Handling
- Graceful degradation
- User-friendly error messages
- Logging and monitoring

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live data
2. **Advanced Analytics**: More detailed metrics and visualizations
3. **Workflow Automation**: Automated tasks and triggers
4. **Mobile Optimization**: Responsive design improvements
5. **Internationalization**: Multi-language support

## Conclusion

This architecture provides a robust foundation for the admin SPA while working within Docusaurus's constraints. It offers a professional, scalable solution that can grow with the platform's needs while maintaining security and performance standards.