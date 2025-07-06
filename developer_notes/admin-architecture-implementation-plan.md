# Complete Implementation Plan: Docusaurus + TinaCMS + MUI Admin Architecture

## Overview
Transform the current admin app into a minimal auth service while moving all UI to Docusaurus with TinaCMS content management and MUI interactive components.

## Architecture Summary

### Current State
- **Admin app** at `/admin` provides full admin functionality
- **Portal** at `/` with basic management page
- Authentication flows through admin app's NextAuth implementation
- Docusaurus sites can check auth status via `useAdminSession` hook

### Target Architecture

#### Components & URLs
- **Auth Service (Next.js)**: `http://localhost:3007/auth/*`, `/api/*`
- **Portal (Docusaurus)**: `http://localhost:3000/` with admin dashboards
- **TinaCMS**: `http://localhost:3000/tina` for content management
- **Role-Based Dashboards**:
  - `/dashboard` (superadmin)
  - `/admin-dashboard/[standard]` (site admin)
  - `/editor-dashboard/[standard]` (editor)
  - `/reviewer-dashboard/[standard]` (reviewer)

#### User Story Mapping

**User Story 1: Site Administrator - New Site Creation**
- **UI**: Portal `/dashboard` with MUI forms
- **API**: `/api/admin/scaffold`, `/api/admin/github`
- **Processing**: Server-side scaffolding scripts
- **Integration**: Nx workspace updates, TinaCMS schema generation

**User Story 2: Standards Site Admin - Site Management**
- **UI**: Portal `/admin-dashboard/[standard]` with TinaCMS + MUI
- **Content Management**: TinaCMS for docs, metadata, templates
- **API**: `/api/admin/teams`, `/api/admin/publish`
- **Features**: Team management, translations, project boards

**User Story 3: Editor - Content Editing & Data Conversion**
- **UI**: Portal `/editor-dashboard/[standard]` with editorial workflows
- **Content**: TinaCMS direct editing with Git integration
- **API**: `/api/editor/convert`, `/api/editor/github`
- **Processing**: Google Sheets ↔ CSV ↔ RDF ↔ Documentation

**User Story 4: Reviewer - Review & Discussion**
- **UI**: Portal `/reviewer-dashboard/[standard]` for review workflows
- **Content**: TinaCMS reviewer mode with PR-based workflow
- **API**: `/api/reviewer/pullrequests`
- **Integration**: GitHub discussions, PR management

---

## Migration Plan

### Phase 1: Foundation Setup ⚡ (Week 1-2)
- Install dependencies (MUI, TinaCMS, GitHub API)
- Configure MUI + Docusaurus theme integration
- Set up TinaCMS configuration and basic schemas
- Create protected route and dashboard layout components

### Phase 2: API Service Restructure 🔧 (Week 2-3)
- Remove UI components from admin app
- Update next.config.js and CORS settings
- Update URL configurations
- Test authentication flow

### Phase 3: Dashboard Implementation 📊 (Week 3-4)
- Create role-based dashboard pages
- Implement MUI forms and interfaces
- Add role-based access controls
- Style with IFLA theme

### Phase 4: API Development 🔗 (Week 4-5)
- Build GitHub integration APIs
- Create scaffolding and data conversion APIs
- Add error handling and validation
- Test API functionality

### Phase 5: TinaCMS Content Management 📝 (Week 5-6)
- Configure content editing schemas
- Set up Git-backed workflows
- Create custom MUI-styled components
- Implement multi-language support

### Phase 6: Data Processing Pipeline 🔄 (Week 6-7)
- Google Sheets API integration
- CSV ↔ RDF conversion scripts
- Documentation scaffolding automation
- Reverse data flow implementation

### Phase 7: GitHub Integration 🐙 (Week 7-8)
- Team and repository management
- PR workflow automation
- Notification systems
- Project board integration

### Phase 8: Testing & Documentation 🧪 (Week 8-9)
- Comprehensive testing suite
- User and developer documentation
- E2E workflow testing
- Performance optimization

### Phase 9: Migration & Deployment 🚀 (Week 9-10)
- Data migration and CI/CD updates
- Production deployment
- User training and monitoring
- Issue resolution

---

## Detailed Implementation Instructions

### 1. Dependencies Installation

```bash
# MUI Core (in theme package)
cd packages/theme
pnpm add @mui/material @emotion/react @emotion/styled
pnpm add @mui/icons-material
pnpm add @mui/x-data-grid @mui/x-tree-view

# React Hook Form for complex forms
pnpm add react-hook-form @hookform/resolvers
pnpm add zod # Already installed, but verify

# TinaCMS (in portal)
cd ../../portal
pnpm add tinacms @tinacms/cli
pnpm add @tinacms/auth

# GitHub API integration (in admin)
cd ../apps/admin
pnpm add @octokit/rest
pnpm add @octokit/webhooks
```

### 2. MUI Integration Setup

#### A. Theme Provider Setup
**File**: `packages/theme/src/components/MUIThemeProvider.tsx`
```tsx
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useColorMode } from '@docusaurus/theme-common';

const MUIThemeProvider = ({ children }) => {
  const { colorMode } = useColorMode();
  
  const theme = createTheme({
    palette: {
      mode: colorMode,
      primary: {
        main: '#4a8f5b', // IFLA green
      },
      secondary: {
        main: '#4a9d8e', // IFLA teal
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'sans-serif',
      ].join(','),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MUIThemeProvider;
```

#### B. Root Component Integration
**File**: `portal/src/theme/Root.tsx`
```tsx
import React from 'react';
import { MUIThemeProvider } from '@ifla/theme/components/MUIThemeProvider';

export default function Root({ children }) {
  return (
    <MUIThemeProvider>
      {children}
    </MUIThemeProvider>
  );
}
```

### 3. TinaCMS Setup

#### A. TinaCMS Configuration
**File**: `portal/tina/config.ts`
```tsx
import { defineConfig } from 'tinacms';

export default defineConfig({
  branch: 'main',
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  
  build: {
    basePath: 'tina',
    outputFolder: 'admin',
    publicFolder: 'static',
  },
  
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'static',
    },
  },
  
  schema: {
    collections: [
      {
        name: 'site_config',
        label: 'Site Configuration',
        path: 'config',
        format: 'json',
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Site Title',
            required: true,
          },
          {
            type: 'string',
            name: 'tagline',
            label: 'Site Tagline',
          },
          {
            type: 'object',
            name: 'vocabulary',
            label: 'Vocabulary Settings',
            fields: [
              {
                type: 'string',
                name: 'prefix',
                label: 'URI Prefix',
              },
              {
                type: 'number',
                name: 'startCounter',
                label: 'Start Counter',
              },
            ],
          },
        ],
      },
      {
        name: 'docs',
        label: 'Documentation',
        path: 'docs',
        format: 'mdx',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
      },
    ],
  },
});
```

#### B. Authentication Setup
**File**: `portal/pages/api/tina/[...routes].ts`
```tsx
import { TinaNodeBackend, LocalBackendAuthProvider } from 'tinacms';

const handler = TinaNodeBackend({
  authentication: LocalBackendAuthProvider(),
  databaseAdapter: new GitHubProvider({
    branch: 'main',
    owner: 'iflastandards',
    repo: 'standards-dev',
    token: process.env.GITHUB_TOKEN,
  }),
});

export default handler;
```

### 4. Dashboard Structure Setup

#### A. Protected Route Component
**File**: `packages/theme/src/components/ProtectedRoute.tsx`
```tsx
import React from 'react';
import { CircularProgress, Alert, Box } from '@mui/material';
import { useAdminSession } from '../hooks/useAdminSession';
import { getAdminPortalConfigAuto } from '../config/siteConfig';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredTeams?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredTeams = [],
}) => {
  const { isAuthenticated, teams, loading } = useAdminSession();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    const adminConfig = getAdminPortalConfigAuto();
    window.location.href = `${adminConfig.signinUrl}?returnUrl=${encodeURIComponent(window.location.pathname)}`;
    return null;
  }

  // Check role/team access
  const hasAccess = requiredRoles.length === 0 || 
    requiredRoles.some(role => teams?.includes(role)) ||
    requiredTeams.some(team => teams?.includes(team));

  if (!hasAccess) {
    return (
      <Alert severity="error">
        You don't have permission to access this page.
      </Alert>
    );
  }

  return <>{children}</>;
};
```

#### B. Dashboard Layout Component
**File**: `packages/theme/src/components/DashboardLayout.tsx`
```tsx
import React from 'react';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { useAdminSession } from '../hooks/useAdminSession';

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  children,
}) => {
  const { username } = useAdminSession();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2">
            Welcome, {username}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};
```

### 5. Admin App Restructure

#### A. Remove Dashboard Components
**Remove these directories:**
- `apps/admin/src/app/dashboard/`
- `apps/admin/src/app/site/`
- Most UI components (keep auth-related ones)

#### B. Update next.config.js
**File**: `apps/admin/next.config.js`
```javascript
const nextConfig = {
  // Remove basePath: '/admin'
  transpilePackages: ['next-auth'],
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production'
              ? 'https://www.iflastandards.info'
              : 'http://localhost:3000', // Portal URL
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cookie',
          },
        ],
      },
    ];
  },
};
```

### 6. API Routes Implementation

#### A. GitHub Integration API
**File**: `apps/admin/src/app/api/github/teams/route.ts`
```tsx
import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { auth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !session.user.roles?.includes('system-admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { teamName, description, members } = await request.json();
  
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  try {
    // Create team
    const team = await octokit.rest.teams.create({
      org: 'iflastandards',
      name: teamName,
      description,
      privacy: 'closed',
    });

    // Add members
    for (const member of members) {
      await octokit.rest.teams.addOrUpdateMembershipForUserInOrg({
        org: 'iflastandards',
        team_slug: team.data.slug,
        username: member.username,
        role: member.role || 'member',
      });
    }

    return NextResponse.json({ team: team.data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### B. Site Scaffolding API
**File**: `apps/admin/src/app/api/scaffold/route.ts`
```tsx
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { auth } from '@/app/lib/auth';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !session.user.roles?.includes('system-admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { siteKey, title, tagline, dataset } = await request.json();

  try {
    // Save uploaded dataset
    if (dataset) {
      // Process and save RDF/CSV file
    }

    // Run scaffolding script
    const { stdout, stderr } = await execAsync(
      `pnpm tsx scripts/scaffold-site.ts --siteKey=${siteKey} --title="${title}" --tagline="${tagline}"`,
      { cwd: process.cwd() }
    );

    return NextResponse.json({ 
      success: true, 
      output: stdout,
      siteKey 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stderr: error.stderr 
    }, { status: 500 });
  }
}
```

#### C. Data Conversion API
**File**: `apps/admin/src/app/api/convert/sheets-to-rdf/route.ts`
```tsx
import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { auth } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { spreadsheetId, worksheetName, siteKey } = await request.json();

  try {
    // Initialize Google Sheets API
    const doc = new GoogleSpreadsheet(spreadsheetId);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[worksheetName];
    const rows = await sheet.getRows();

    // Convert to RDF
    const rdfData = convertRowsToRDF(rows, siteKey);

    // Save to site directory
    const filePath = `standards/${siteKey}/data/vocabulary.ttl`;
    await fs.writeFile(filePath, rdfData);

    return NextResponse.json({ 
      success: true, 
      filePath,
      recordCount: rows.length 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

### 7. Dashboard Page Implementation

#### A. Superadmin Dashboard
**File**: `portal/src/pages/dashboard/index.tsx`
```tsx
import React, { useState } from 'react';
import Layout from '@theme/Layout';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Box 
} from '@mui/material';
import { ProtectedRoute, DashboardLayout } from '@ifla/theme/components';

const SuperAdminDashboard = () => {
  const [createSiteOpen, setCreateSiteOpen] = useState(false);
  const [siteData, setSiteData] = useState({
    siteKey: '',
    title: '',
    tagline: '',
  });

  const handleCreateSite = async () => {
    try {
      const response = await fetch('/api/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteData),
        credentials: 'include',
      });
      
      if (response.ok) {
        // Handle success
        setCreateSiteOpen(false);
      }
    } catch (error) {
      console.error('Failed to create site:', error);
    }
  };

  return (
    <ProtectedRoute requiredRoles={['system-admin', 'ifla-admin']}>
      <DashboardLayout title="System Administration">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Site Management
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => setCreateSiteOpen(true)}
                >
                  Create New Site
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Team Management
                </Typography>
                <Button variant="outlined">
                  Manage GitHub Teams
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Create Site Dialog */}
        <Dialog open={createSiteOpen} onClose={() => setCreateSiteOpen(false)}>
          <DialogTitle>Create New Site</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Site Key"
                value={siteData.siteKey}
                onChange={(e) => setSiteData({...siteData, siteKey: e.target.value})}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Title"
                value={siteData.title}
                onChange={(e) => setSiteData({...siteData, title: e.target.value})}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Tagline"
                value={siteData.tagline}
                onChange={(e) => setSiteData({...siteData, tagline: e.target.value})}
                margin="normal"
              />
              <Button onClick={handleCreateSite} sx={{ mt: 2 }}>
                Create Site
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default function Dashboard() {
  return (
    <Layout title="System Dashboard">
      <SuperAdminDashboard />
    </Layout>
  );
}
```

#### B. Editor Dashboard
**File**: `portal/src/pages/editor-dashboard/[standard].tsx`
```tsx
import React from 'react';
import { useRouter } from '@docusaurus/router';
import Layout from '@theme/Layout';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  List,
  ListItem,
  ListItemText,
  Chip 
} from '@mui/material';
import { ProtectedRoute, DashboardLayout } from '@ifla/theme/components';

const EditorDashboard = () => {
  const router = useRouter();
  const { standard } = router.query;

  const handleDataConversion = async (type: string) => {
    try {
      const response = await fetch(`/api/convert/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteKey: standard }),
        credentials: 'include',
      });
      // Handle response
    } catch (error) {
      console.error('Conversion failed:', error);
    }
  };

  return (
    <ProtectedRoute requiredTeams={[`${standard}-editors`, `${standard}-admin`]}>
      <DashboardLayout title={`Editor Dashboard - ${standard}`}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Editorial Status
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Introduction" 
                      secondary="Last edited 2 days ago"
                    />
                    <Chip label="Draft" color="warning" />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Element Definitions" 
                      secondary="Last edited 1 week ago"
                    />
                    <Chip label="Review" color="info" />
                  </ListItem>
                </List>
                <Button 
                  variant="contained" 
                  href={`/tina#/collections/docs`}
                  sx={{ mt: 2 }}
                >
                  Edit Content
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Data Conversion
                </Typography>
                <Button 
                  fullWidth 
                  variant="outlined" 
                  onClick={() => handleDataConversion('sheets-to-rdf')}
                  sx={{ mb: 1 }}
                >
                  Sheets → RDF
                </Button>
                <Button 
                  fullWidth 
                  variant="outlined"
                  onClick={() => handleDataConversion('rdf-to-docs')}
                >
                  RDF → Docs
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default function EditorDashboardPage() {
  return (
    <Layout title="Editor Dashboard">
      <EditorDashboard />
    </Layout>
  );
}
```

### 8. URL Configuration Updates

**File**: `packages/theme/src/config/siteConfig.ts`
```typescript
// Update admin portal configuration
export const ADMIN_PORTAL_CONFIG: Record<Environment, AdminPortalConfig> = {
  local: {
    url: 'http://localhost:3007',           // Auth service root
    signinUrl: 'http://localhost:3007/auth/signin',
    dashboardUrl: 'http://localhost:3000/dashboard', // Portal dashboard
    signoutUrl: 'http://localhost:3007/api/auth/signout',
    sessionApiUrl: 'http://localhost:3007/api/auth/session',
    port: 3007,
  },
  preview: {
    url: 'https://iflastandards.github.io/standards-dev',
    signinUrl: 'https://iflastandards.github.io/standards-dev/auth/signin',
    dashboardUrl: 'https://iflastandards.github.io/standards-dev/dashboard',
    signoutUrl: 'https://iflastandards.github.io/standards-dev/api/auth/signout',
    sessionApiUrl: 'https://iflastandards.github.io/standards-dev/api/auth/session',
  },
  development: {
    url: 'https://jonphipps.github.io/standards-dev',
    signinUrl: 'https://jonphipps.github.io/standards-dev/auth/signin',
    dashboardUrl: 'https://jonphipps.github.io/standards-dev/dashboard',
    signoutUrl: 'https://jonphipps.github.io/standards-dev/api/auth/signout',
    sessionApiUrl: 'https://jonphipps.github.io/standards-dev/api/auth/session',
  },
  production: {
    url: 'https://www.iflastandards.info',
    signinUrl: 'https://www.iflastandards.info/auth/signin',
    dashboardUrl: 'https://www.iflastandards.info/dashboard',
    signoutUrl: 'https://www.iflastandards.info/api/auth/signout',
    sessionApiUrl: 'https://www.iflastandards.info/api/auth/session',
  },
};
```

---

## Epics and Tasks Checklist

### Epic 1: Foundation Setup ⚡ (Week 1-2)

#### Tasks:
- [ ] **1.1** Install MUI dependencies in theme package
- [ ] **1.2** Install TinaCMS dependencies in portal
- [ ] **1.3** Install GitHub API dependencies in admin
- [ ] **1.4** Create MUI theme provider component
- [ ] **1.5** Configure Docusaurus Root with MUI integration
- [ ] **1.6** Set up TinaCMS configuration file
- [ ] **1.7** Create base TinaCMS schemas (docs, site_config)
- [ ] **1.8** Test MUI + Docusaurus theme synchronization
- [ ] **1.9** Test TinaCMS basic editing functionality

### Epic 2: Authentication & Protection 🔐 (Week 2-3)

#### Tasks:
- [ ] **2.1** Create ProtectedRoute component with MUI loading states
- [ ] **2.2** Create DashboardLayout component
- [ ] **2.3** Update admin app next.config.js (remove basePath)
- [ ] **2.4** Update CORS configuration for portal access
- [ ] **2.5** Update siteConfig.ts URLs for new structure
- [ ] **2.6** Test authentication flow from portal to admin service
- [ ] **2.7** Implement role-based redirection logic
- [ ] **2.8** Add error handling for auth failures

### Epic 3: Dashboard Pages 📊 (Week 3-4)

#### Tasks:
- [ ] **3.1** Create `/dashboard/index.tsx` (superadmin)
- [ ] **3.2** Create `/admin-dashboard/[standard].tsx`
- [ ] **3.3** Create `/editor-dashboard/[standard].tsx`
- [ ] **3.4** Create `/reviewer-dashboard/[standard].tsx`
- [ ] **3.5** Implement site creation form (MUI)
- [ ] **3.6** Implement team management interface (MUI)
- [ ] **3.7** Implement editorial status displays (MUI)
- [ ] **3.8** Test role-based access to each dashboard
- [ ] **3.9** Style dashboards with IFLA theme

### Epic 4: API Service Development 🔧 (Week 4-5)

#### Tasks:
- [ ] **4.1** Create GitHub teams API (`/api/github/teams`)
- [ ] **4.2** Create site scaffolding API (`/api/scaffold`)
- [ ] **4.3** Create data conversion APIs (`/api/convert/*`)
- [ ] **4.4** Create notification API (`/api/notifications`)
- [ ] **4.5** Implement GitHub webhook handling
- [ ] **4.6** Add error handling and validation
- [ ] **4.7** Test API routes with Postman/curl
- [ ] **4.8** Add API documentation

### Epic 5: TinaCMS Content Management 📝 (Week 5-6)

#### Tasks:
- [ ] **5.1** Configure TinaCMS schemas for each site type
- [ ] **5.2** Set up Git-backed content editing
- [ ] **5.3** Create custom TinaCMS components with MUI styling
- [ ] **5.4** Implement vocabulary editing schemas
- [ ] **5.5** Configure multi-language content support
- [ ] **5.6** Set up TinaCMS media management
- [ ] **5.7** Test content editing workflows
- [ ] **5.8** Configure TinaCMS permissions by role

### Epic 6: Data Processing Pipeline 🔄 (Week 6-7)

#### Tasks:
- [ ] **6.1** Implement Google Sheets API integration
- [ ] **6.2** Create CSV to RDF conversion scripts
- [ ] **6.3** Create RDF to documentation scaffolding
- [ ] **6.4** Implement reverse data flow (docs to RDF/CSV)
- [ ] **6.5** Add data validation and error handling
- [ ] **6.6** Create progress tracking for long conversions
- [ ] **6.7** Test full data conversion pipeline
- [ ] **6.8** Add conversion history and rollback

### Epic 7: GitHub Integration 🐙 (Week 7-8)

#### Tasks:
- [ ] **7.1** Implement team creation and management
- [ ] **7.2** Set up PR workflow automation
- [ ] **7.3** Configure GitHub discussions integration
- [ ] **7.4** Implement notification system for PR events
- [ ] **7.5** Add project board creation and management
- [ ] **7.6** Set up repository permissions automation
- [ ] **7.7** Test full GitHub workflow
- [ ] **7.8** Add GitHub webhook security

### Epic 8: Testing & Documentation 🧪 (Week 8-9)

#### Tasks:
- [ ] **8.1** Write unit tests for new components
- [ ] **8.2** Write integration tests for API routes
- [ ] **8.3** Write E2E tests for dashboard workflows
- [ ] **8.4** Update existing tests for new architecture
- [ ] **8.5** Test role-based access controls
- [ ] **8.6** Test data conversion pipelines
- [ ] **8.7** Create user documentation
- [ ] **8.8** Create developer documentation

### Epic 9: Migration & Deployment 🚀 (Week 9-10)

#### Tasks:
- [ ] **9.1** Migrate existing admin data to new structure
- [ ] **9.2** Update CI/CD pipelines for new architecture
- [ ] **9.3** Configure production environment variables
- [ ] **9.4** Test deployment to preview environment
- [ ] **9.5** Conduct user acceptance testing
- [ ] **9.6** Train users on new interface
- [ ] **9.7** Deploy to production
- [ ] **9.8** Monitor and fix any deployment issues

---

## Vercel Deployment Configuration

### Environment Variables Required:
```bash
# Auth Service (admin app)
GITHUB_ID=your_github_app_id
GITHUB_SECRET=your_github_app_secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_TOKEN=github_personal_access_token

# TinaCMS
TINA_CLIENT_ID=your_tina_client_id
TINA_TOKEN=your_tina_token

# Google Sheets API
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your_google_private_key
```

### Vercel Configuration
**File**: `vercel.json`
```json
{
  "builds": [
    {
      "src": "apps/admin/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "portal/package.json", 
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "pnpm build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "apps/admin/api/$1"
    },
    {
      "src": "/auth/(.*)",
      "dest": "apps/admin/auth/$1"
    },
    {
      "src": "/(.*)",
      "dest": "portal/$1"
    }
  ]
}
```

---

## Implementation Notes

### Key Integration Points
1. **MUI + Docusaurus**: Theme synchronization via Root component
2. **TinaCMS + Git**: Direct repository manipulation for content
3. **NextAuth + Portal**: Session sharing via CORS and localStorage
4. **API + Vercel**: Function deployment for server-side processing

### Security Considerations
- Role-based access controls at component level
- Server-side API authentication
- CORS configuration for cross-origin requests
- GitHub token management and permissions

### Performance Optimizations
- Dynamic imports for dashboard components
- Client-side caching for session data
- Nx build optimizations for development
- Static generation where possible

### Monitoring & Maintenance
- Error tracking for API failures
- Session monitoring and timeout handling
- GitHub webhook reliability
- Data conversion pipeline monitoring

---

This comprehensive plan provides a complete roadmap for implementing the new architecture with clear tasks, migration steps, and deployment configuration. Each epic builds upon the previous one, ensuring a systematic and reliable implementation process.