<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# 1. we need a dashboard page for each namespace that has several status views. And one of those views will be different for projects that are in active development. We have any combination of navbar, sidebar,

and in-page tabs. Dahsboard pages should be public. They can contain action buttons that are only available to authorized users that are hidden for public. The routes and pages would be protected, so even
forcing them to be visible wouldn't be effective.
2. We need a suite of action pages with embedded forms that let people submit instructions to the API for execution. One page per action, only displaying pages to a user that they're authorized to use.
Remember we have TinaCMS and MUI for react forms
3. We need to make sure that the route includes the namespace/standard to fetch the correct data. So /admin/dashboard/isbd /admin/team/isbd /admin/qa/isbd etc.
basically admin is an SPA

Perfect! You're building a sophisticated admin SPA within Docusaurus that combines public dashboards with protected action pages. Here's a comprehensive architecture that leverages your existing tech stack to create a seamless admin experience.

## Admin SPA Architecture Overview

Your admin section will function as a **full SPA within Docusaurus**, using dynamic routing with namespace-based data fetching. This approach gives you the flexibility to create dashboard and action pages that adapt based on user permissions and project context.

## 1. Dynamic Route Structure with Namespaces

### Custom Plugin for Dynamic Routes

Create a custom Docusaurus plugin to generate your namespace-based routes dynamically[^1][^2]:

```typescript
// plugins/admin-routes-plugin.js
module.exports = function adminRoutesPlugin(context, options) {
  return {
    name: 'admin-routes-plugin',
    async loadContent() {
      // Define your namespaces and route types
      const namespaces = ['isbd', 'healthcare', 'finance'];
      const routeTypes = ['dashboard', 'team', 'qa'];
      
      return { namespaces, routeTypes };
    },
    
    async contentLoaded({ content, actions }) {
      const { namespaces, routeTypes } = content;
      
      // Generate routes for each namespace/type combination
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
      
      // Generate action routes (protected)
      await Promise.all(
        namespaces.map(namespace =>
          actions.addRoute({
            path: `/admin/actions/${namespace}/:actionId`,
            component: require.resolve('../src/components/admin/ActionRouter.tsx'),
            exact: true,
            props: {
              namespace,
              routeData: { namespace }
            }
          })
        )
      );
    }
  };
};
```


### Main Admin Router Component

```typescript
// src/components/admin/AdminRouter.tsx
import React from 'react';
import { useLocation } from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Layout from '@theme/Layout';
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
  const isBrowser = useIsBrowser();
  const location = useLocation();

  if (!isBrowser) {
    return <Layout><div>Loading admin panel...</div></Layout>;
  }

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
    <Layout>
      <AdminLayout namespace={namespace} currentRoute={routeType}>
        {renderContent()}
      </AdminLayout>
    </Layout>
  );
}
```


## 2. Dashboard Implementation with Public/Protected Elements

### Dashboard Component with Conditional Rendering

```typescript
// src/components/admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Box, Button, Card, CardContent } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { StatusView } from './StatusView';
import { DevelopmentStatusView } from './DevelopmentStatusView';

interface DashboardProps {
  namespace: string;
}

export function Dashboard({ namespace }: DashboardProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthorized } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [namespace]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/dashboard/${namespace}`);
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <div>Loading dashboard for {namespace}...</div>;
  }

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Status Overview" />
          <Tab label="Development Status" />
          <Tab label="Quality Metrics" />
          <Tab label="Team Performance" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <StatusView 
            data={dashboardData?.statusData} 
            namespace={namespace}
            actions={
              isAuthorized(user, 'admin', namespace) ? (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => window.location.href = `/admin/actions/${namespace}/refresh-status`}
                  >
                    Refresh Status
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    sx={{ ml: 1 }}
                    onClick={() => window.location.href = `/admin/actions/${namespace}/export-data`}
                  >
                    Export Data
                  </Button>
                </Box>
              ) : null
            }
          />
        )}

        {activeTab === 1 && (
          <DevelopmentStatusView 
            data={dashboardData?.developmentData} 
            namespace={namespace}
            isActiveProject={dashboardData?.isActiveProject}
          />
        )}

        {/* Additional tab content */}
      </Box>
    </div>
  );
}
```


### Conditional Action Buttons

```typescript
// src/components/admin/StatusView.tsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface StatusViewProps {
  data: any;
  namespace: string;
  actions?: React.ReactNode;
}

export function StatusView({ data, namespace, actions }: StatusViewProps) {
  return (
    <div>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" component="h2">
            {namespace.toUpperCase()} Status Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Current system status and metrics
          </Typography>
        </CardContent>
      </Card>

      {/* Status content here */}
      
      {/* Conditionally rendered actions - only visible to authorized users */}
      {actions && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Administrative Actions
          </Typography>
          {actions}
        </Box>
      )}
    </div>
  );
}
```


## 3. Action Pages with TinaCMS and MUI Forms

### Action Router for Protected Pages

```typescript
// src/components/admin/ActionRouter.tsx
import React from 'react';
import { useLocation } from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Layout from '@theme/Layout';
import { useAuth } from '../../hooks/useAuth';
import { ActionForm } from './ActionForm';
import { UnauthorizedView } from './UnauthorizedView';

interface ActionRouterProps {
  namespace: string;
}

export default function ActionRouter({ namespace }: ActionRouterProps) {
  const isBrowser = useIsBrowser();
  const location = useLocation();
  const { user, isAuthorized } = useAuth();

  if (!isBrowser) {
    return <Layout><div>Loading...</div></Layout>;
  }

  const pathSegments = location.pathname.split('/');
  const actionId = pathSegments[pathSegments.length - 1];

  // Check authorization for this specific action
  if (!isAuthorized(user, 'action', namespace, actionId)) {
    return (
      <Layout>
        <UnauthorizedView />
      </Layout>
    );
  }

  return (
    <Layout>
      <ActionForm 
        namespace={namespace} 
        actionId={actionId}
        user={user}
      />
    </Layout>
  );
}
```


### Action Form with TinaCMS and MUI Integration

```typescript
// src/components/admin/ActionForm.tsx
import React, { useState, useEffect } from 'react';
import { useCMS } from 'tinacms';
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
  MenuItem
} from '@mui/material';

interface ActionFormProps {
  namespace: string;
  actionId: string;
  user: any;
}

export function ActionForm({ namespace, actionId, user }: ActionFormProps) {
  const cms = useCMS();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [formConfig, setFormConfig] = useState(null);

  useEffect(() => {
    loadFormConfiguration();
  }, [namespace, actionId]);

  const loadFormConfiguration = async () => {
    try {
      const response = await fetch(`/api/forms/${namespace}/${actionId}`);
      const config = await response.json();
      setFormConfig(config);
      setFormData(config.defaultValues || {});
    } catch (error) {
      console.error('Failed to load form configuration:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/actions/${namespace}/${actionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user: user.id,
          namespace,
          actionId
        })
      });

      if (response.ok) {
        // Handle success - maybe redirect or show success message
        window.location.href = `/admin/dashboard/${namespace}`;
      } else {
        throw new Error('Action submission failed');
      }
    } catch (error) {
      console.error('Action submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!formConfig) {
    return <div>Loading form...</div>;
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

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formConfig.fields.map((field: any) => (
              <div key={field.name}>
                {field.type === 'text' && (
                  <TextField
                    fullWidth
                    label={field.label}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                    multiline={field.multiline}
                    rows={field.rows || 1}
                  />
                )}
                
                {field.type === 'select' && (
                  <FormControl fullWidth>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      required={field.required}
                    >
                      {field.options.map((option: any) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </div>
            ))}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Action'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.history.back()}
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


## 4. Navigation Layout with Sidebar and Tabs

### Admin Layout Component

```typescript
// src/components/admin/AdminLayout.tsx
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
  IconButton
} from '@mui/material';
import { Dashboard, Group, BugReport, Settings } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  namespace: string;
  currentRoute: string;
  children: React.ReactNode;
}

export function AdminLayout({ namespace, currentRoute, children }: AdminLayoutProps) {
  const { user, isAuthorized } = useAuth();

  const navigationItems = [
    { 
      text: 'Dashboard', 
      icon: <Dashboard />, 
      path: `/admin/dashboard/${namespace}`,
      access: 'public'
    },
    { 
      text: 'Team Management', 
      icon: <Group />, 
      path: `/admin/team/${namespace}`,
      access: 'public'
    },
    { 
      text: 'Quality Assurance', 
      icon: <BugReport />, 
      path: `/admin/qa/${namespace}`,
      access: 'public'
    },
    { 
      text: 'Actions', 
      icon: <Settings />, 
      path: `/admin/actions/${namespace}`,
      access: 'admin'
    }
  ];

  const visibleItems = navigationItems.filter(item => 
    item.access === 'public' || isAuthorized(user, item.access, namespace)
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Admin Panel - {namespace.toUpperCase()}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {visibleItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => window.location.href = item.path}
                selected={currentRoute === item.text.toLowerCase()}
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
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
```


## 5. Authorization and Route Protection

### Authorization Hook

```typescript
// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const isAuthorized = (user: any, action: string, namespace: string, actionId?: string) => {
    if (!user) return false;
    
    // Check with your Cerbos authorization service
    // This is a simplified example
    return user.permissions?.[namespace]?.includes(action) || 
           user.permissions?.[namespace]?.includes('admin');
  };

  return {
    ...context,
    isAuthorized
  };
}
```


## 6. API Integration

Your Vercel edge functions can handle the API calls:

```typescript
// api/dashboard/[namespace].ts
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest, context: { params: { namespace: string } }) {
  const { namespace } = context.params;
  
  // Fetch data specific to the namespace
  const dashboardData = await fetchNamespaceData(namespace);
  
  return Response.json(dashboardData);
}

async function fetchNamespaceData(namespace: string) {
  // Your data fetching logic here
  // This could connect to GitHub API, databases, etc.
  return {
    statusData: {},
    developmentData: {},
    isActiveProject: true
  };
}
```


## Architecture Benefits

This approach gives you:

1. **True SPA Experience**: Seamless navigation within the admin section[^3][^4]
2. **Namespace-based Data Isolation**: Each route fetches data specific to its namespace
3. **Conditional UI**: Public dashboards with protected action buttons[^5][^6]
4. **Protected Routes**: Server-side authorization prevents unauthorized access[^7][^8]
5. **Flexible Forms**: TinaCMS + MUI integration for dynamic form creation[^9][^10]
6. **Scalable Architecture**: Easy to add new namespaces and action types

Your admin section will function as a full-featured SPA while maintaining the benefits of Docusaurus's static site generation for the public portions of your documentation site.

<div style="text-align: center">⁂</div>

[^1]: https://stackoverflow.com/questions/63271765/how-to-integrate-dynamic-routes-in-docusaurus-with-react-router

[^2]: https://www.tzeyiing.com/posts/how-to-generate-dynamic-pages-for-docusaurus/

[^3]: https://docusaurus.io/docs/advanced/routing

[^4]: https://github.com/facebook/docusaurus/blob/main/website/docs/advanced/routing.mdx?plain=1

[^5]: https://clerk.com/blog/conditional-rendering-react

[^6]: https://dev.to/sam_lukaa/conditional-rendering-in-react-2cjb

[^7]: https://iammassoud.net/blog/protect-custom-routes-in-docusaurus-using-aws-cognito

[^8]: https://github.com/levino/protected-docs-example

[^9]: https://stackoverflow.com/questions/70325369/how-to-custom-onsubmit-in-tinacms

[^10]: https://pre-beta.tina.io/docs/forms/

[^11]: https://docusaurus.io/docs/api/docusaurus-config

[^12]: https://github.com/facebook/docusaurus/issues/9990

[^13]: https://stackoverflow.com/questions/52095998/navigation-bar-for-a-spa-using-react-js

[^14]: https://stackoverflow.com/questions/54657219/load-react-spa-according-to-requested-route

[^15]: https://docusaurus.io/feature-requests/p/dynamic-routes-for-pages

[^16]: https://unpkg.com/browse/tinacms@2.2.0/dist/toolkit/tina-state.d.ts

[^17]: https://stackoverflow.com/questions/73658778/combine-topbar-and-sidebar-into-single-nav-layout-reactjs

[^18]: https://stackoverflow.com/questions/77533748/how-to-exclude-specific-controller-routes-from-spa-initially-then-redirect-to-it

[^19]: https://github.com/facebook/docusaurus/issues/4710

[^20]: https://community.auth0.com/t/conditional-rendering-based-on-user-metadata/95611

