# Complete Implementation Plan: Portal-Based Admin UI with Simplified Authentication

## Overview
Implement a streamlined admin interface directly in the Portal (Docusaurus) site, with the admin app serving purely as an authentication and API service. This approach eliminates the double-login issue and creates a seamless user experience.

## Architecture Summary

### Current State
- **Portal site** has admin routes via plugin that render `AdminRouter` component
- **Admin app** is a full Next.js app with UI pages, causing redirect loops
- **Authentication issue**: CORS only allows `localhost:3008`, blocking portal
- **Login flow**: Confusing double-redirect between portal and admin

### Target Architecture

#### Components & URLs
- **Portal (Docusaurus)**: `http://localhost:3000/` with all admin UI
  - `/admin/login` - Login page within portal
  - `/admin/[role]/[namespace]` - Role-based dashboards
  - `/admin/[action]/[namespace]` - Action pages
- **Auth Service (Next.js)**: `http://localhost:3007` - API only
  - `/auth/signin` - OAuth handler
  - `/api/auth/*` - Auth endpoints
  - `/api/actions/*` - Workflow APIs
  - `/api/admin/*` - Data APIs
- **Individual Sites**: No direct auth integration
  - Standard Docusaurus sites without admin features
  - "Edit this page" → GitHub (standard Docusaurus flow)
  - Admin tasks require navigation to portal

#### Authentication Scope
- **Portal Only**: Authentication is exclusively through the portal
- **No Cross-Site Auth**: Individual sites (ISBDM, LRM, etc.) don't authenticate
- **Admin Navigation**: Users must go to portal for any admin tasks
- **CORS Simplification**: Only portal needs access to admin API

#### Future TinaCMS Integration
- **Authorized Users**: "Edit this page" → TinaCMS editor
- **Unauthorized Users**: "Edit this page" → GitHub (standard flow)
- **Session Check**: TinaCMS checks portal session for edit permissions

#### New Login Flow
1. User clicks login in portal navbar
2. Shows `/admin/login` page in portal (no redirect)
3. "Login with GitHub" button initiates OAuth
4. OAuth handled by admin app, returns to portal
5. User avatar appears in portal navbar only
6. Dashboard shows based on role/namespace

#### User Story Mapping

**User Story 1: Super Admin - Namespace Selection**
- **UI**: Portal `/admin/dashboard` showing all namespaces
- **Features**: Namespace cards with progress stats
- **Navigation**: Click namespace → `/admin/admin/[namespace]`
- **API**: `/api/admin/namespaces` for listing

**User Story 2: Namespace Admin - Spreadsheet Import Workflow**
- **Landing**: `/admin/admin/[namespace]` dashboard
- **Notification**: GitHub issue with spreadsheet submission
- **Action**: Click "scaffold from spreadsheet" → `/admin/scaffold-from-spreadsheet/[namespace]`
- **Process**: Verify → Confirm → Supabase queue → Completion webhook
- **API**: `/api/actions/scaffold-from-spreadsheet`

**User Story 3: Multi-Role User - Role Selection**
- **Landing**: `/admin/dashboard` with role/namespace choices
- **Example**: Admin for ISBD, Reviewer for LRM
- **Navigation**: Select role+namespace → appropriate dashboard
- **Persistence**: Remember last selection

**User Story 4: Editor - Quick Actions**
- **Dashboard**: `/admin/editor/[namespace]` with action cards
- **Actions**: Import data, export RDF, manage translations
- **Navigation**: Click action → `/admin/[action]/[namespace]`
- **API**: Action-specific endpoints

---

## Implementation Phases

### Phase 1: Fix Authentication Flow 🔐 (Immediate)
- Update CORS in admin app to allow portal URL
- Fix redirect logic in auth.ts
- Update LoginPrompt component to show login UI directly
- Test authentication flow end-to-end

### Phase 2: Implement New Routing 🛣️ (Day 1-2)
- Update AdminRouter to parse new route patterns
- Create route handlers for `/admin/[role]/[namespace]`
- Create route handlers for `/admin/[action]/[namespace]`
- Add navigation helper functions

### Phase 3: Build Dashboard Components 📊 (Day 3-5)
- Install MUI dependencies in theme package
- Create DashboardLayout component
- Build role-based dashboard components
- Create action card components
- Implement namespace selection page

### Phase 4: Create Action Pages 🎯 (Day 6-8)
- Build scaffold-from-spreadsheet page
- Create confirmation workflows
- Add progress tracking UI
- Implement error handling

### Phase 5: API Development 🔗 (Day 9-11)
- Create `/api/actions/scaffold-from-spreadsheet`
- Implement Supabase queue integration
- Add webhook endpoints
- Build namespace/role query APIs

### Phase 6: Clean Up Admin App 🧹 (Day 12-13)
- Remove all UI pages from admin app
- Keep only auth and API routes
- Update build configuration
- Test minimal admin app

### Phase 7: Testing & Polish 🧪 (Day 14-15)
- Update E2E tests for new flow
- Test all user stories
- Fix styling and responsiveness
- Document new architecture

---

## Immediate Implementation (Phase 1 Detail)

### 1.1 Fix CORS Configuration
**File**: `apps/admin/next.config.js`
```javascript
headers: [
  {
    key: 'Access-Control-Allow-Origin',
    value: process.env.NODE_ENV === 'production'
      ? 'https://www.iflastandards.info'
      : process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3008',
  },
]
```

### 1.2 Fix Auth Redirect
**File**: `apps/admin/src/app/lib/auth.ts`
```typescript
async redirect({ url, baseUrl }) {
  // Handle callbackUrl parameter properly
  const urlObj = new URL(url, baseUrl);
  const callbackUrl = urlObj.searchParams.get('callbackUrl');
  
  if (callbackUrl) {
    // Validate it's a safe redirect
    const allowedHosts = ['localhost:3000', 'localhost:3008', 'www.iflastandards.info'];
    try {
      const callbackUrlObj = new URL(callbackUrl);
      if (allowedHosts.some(host => callbackUrlObj.host.includes(host))) {
        return callbackUrl;
      }
    } catch {}
  }
  
  return url.startsWith(baseUrl) ? url : `${baseUrl}/dashboard`;
}
```

### 1.3 Update LoginPrompt
**File**: `packages/theme/src/components/AdminRouter/LoginPrompt.tsx`
```tsx
export function LoginPrompt({ currentPath }: LoginPromptProps) {
  const adminConfig = getAdminPortalConfigAuto();
  const returnUrl = `/admin/${currentPath}`.replace(/\/+/g, '/');
  const fullReturnUrl = `${window.location.origin}${returnUrl}`;
  
  return (
    <div className="container margin-vert--lg">
      <div className="row">
        <div className="col col--8 col--offset-2">
          <div className="card">
            <div className="card__header">
              <h2>IFLA Standards Administration</h2>
            </div>
            <div className="card__body">
              <p>Access restricted to authorized IFLA team members.</p>
              <p>Please sign in with your GitHub account to continue.</p>
            </div>
            <div className="card__footer">
              <a
                href={`${adminConfig.signinUrl}?callbackUrl=${encodeURIComponent(fullReturnUrl)}`}
                className="button button--primary button--lg button--block"
              >
                <i className="fab fa-github"></i> Login with GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Detailed Implementation Instructions

### 2. New Routing Implementation (Phase 2 Detail)

#### 2.1 Update AdminRouter
**File**: `packages/theme/src/components/AdminRouter/index.tsx`
```tsx
export function AdminRouter({ currentPath, navigate }: AdminRouterProps) {
  const { isAuthenticated, loading, username, teams } = useAdminSession();
  
  // Parse the current path
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  // Handle login route
  if (pathSegments[0] === 'login') {
    return <LoginPrompt currentPath={currentPath.slice(6)} />;
  }
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <LoginPrompt currentPath={currentPath} />;
  }
  
  // Route patterns:
  // /admin/dashboard - namespace selection
  // /admin/[role]/[namespace] - role-based dashboard
  // /admin/[action]/[namespace] - action page
  
  if (!pathSegments.length || pathSegments[0] === 'dashboard') {
    return <NamespaceSelection username={username} teams={teams} navigate={navigate} />;
  }
  
  // Check if first segment is a role
  const roles = ['admin', 'editor', 'reviewer', 'translator'];
  if (roles.includes(pathSegments[0])) {
    const role = pathSegments[0];
    const namespace = pathSegments[1];
    return <RoleDashboard role={role} namespace={namespace} navigate={navigate} />;
  }
  
  // Otherwise it's an action
  const action = pathSegments[0];
  const namespace = pathSegments[1];
  return <ActionPage action={action} namespace={namespace} navigate={navigate} />;
}
```

### 3. Dashboard Components (Phase 3 Detail)

#### 3.1 Namespace Selection Component
**File**: `packages/theme/src/components/AdminRouter/NamespaceSelection.tsx`
```tsx
import React from 'react';

interface NamespaceSelectionProps {
  username: string;
  teams: string[];
  navigate: (path: string) => void;
}

export function NamespaceSelection({ username, teams, navigate }: NamespaceSelectionProps) {
  // Parse teams to extract namespaces and roles
  const namespaceRoles = teams.reduce((acc, team) => {
    // Teams are formatted as "namespace-role" (e.g., "isbd-admin", "lrm-reviewer")
    const match = team.match(/^(\w+)-(admin|editor|reviewer|translator)$/);
    if (match) {
      const [, namespace, role] = match;
      if (!acc[namespace]) acc[namespace] = [];
      acc[namespace].push(role);
    }
    return acc;
  }, {} as Record<string, string[]>);
  
  const isSuperAdmin = teams.includes('system-admin') || teams.includes('ifla-admin');
  
  return (
    <div className="container margin-vert--lg">
      <h1>Welcome, {username}</h1>
      
      {isSuperAdmin && (
        <div className="card margin-bottom--lg">
          <div className="card__header">
            <h2>System Administration</h2>
          </div>
          <div className="card__body">
            <button 
              className="button button--primary button--lg"
              onClick={() => navigate('admin/system')}
            >
              Manage All Namespaces
            </button>
          </div>
        </div>
      )}
      
      <h2>Your Namespaces</h2>
      <div className="row">
        {Object.entries(namespaceRoles).map(([namespace, roles]) => (
          <div key={namespace} className="col col--4 margin-bottom--lg">
            <div className="card">
              <div className="card__header">
                <h3>{namespace.toUpperCase()}</h3>
              </div>
              <div className="card__body">
                <p>Your roles: {roles.join(', ')}</p>
                {roles.map(role => (
                  <button
                    key={role}
                    className="button button--secondary button--block margin-bottom--sm"
                    onClick={() => navigate(`${role}/${namespace}`)}
                  >
                    Open as {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 3.2 Role Dashboard Component
**File**: `packages/theme/src/components/AdminRouter/RoleDashboard.tsx`
```tsx
import React from 'react';

interface RoleDashboardProps {
  role: string;
  namespace: string;
  navigate: (path: string) => void;
}

export function RoleDashboard({ role, namespace, navigate }: RoleDashboardProps) {
  // Define actions based on role
  const actions = {
    admin: [
      { id: 'scaffold-from-spreadsheet', label: 'Import from Spreadsheet', icon: '📊' },
      { id: 'manage-team', label: 'Manage Team', icon: '👥' },
      { id: 'configure-site', label: 'Site Configuration', icon: '⚙️' },
    ],
    editor: [
      { id: 'import-data', label: 'Import Data', icon: '📥' },
      { id: 'export-rdf', label: 'Export RDF', icon: '📤' },
      { id: 'manage-translations', label: 'Translations', icon: '🌍' },
    ],
    reviewer: [
      { id: 'review-changes', label: 'Review Changes', icon: '👁️' },
      { id: 'manage-issues', label: 'Manage Issues', icon: '📝' },
    ],
    translator: [
      { id: 'translate-content', label: 'Translate Content', icon: '🌐' },
      { id: 'review-translations', label: 'Review Translations', icon: '✅' },
    ],
  };
  
  const currentActions = actions[role] || [];
  
  return (
    <div className="container margin-vert--lg">
      <div className="margin-bottom--lg">
        <button 
          className="button button--secondary"
          onClick={() => navigate('dashboard')}
        >
          ← Back to Namespaces
        </button>
      </div>
      
      <h1>{namespace.toUpperCase()} - {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h1>
      
      <div className="row margin-bottom--lg">
        <div className="col col--4">
          <div className="card">
            <div className="card__body">
              <h3>📊 Progress</h3>
              <p>75% Complete</p>
              <div className="progress-bar">
                <div className="progress-bar__fill" style={{width: '75%'}}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col col--4">
          <div className="card">
            <div className="card__body">
              <h3>🔔 New Issues</h3>
              <p className="text--large">3</p>
            </div>
          </div>
        </div>
        <div className="col col--4">
          <div className="card">
            <div className="card__body">
              <h3>👥 Team Members</h3>
              <p className="text--large">12</p>
            </div>
          </div>
        </div>
      </div>
      
      <h2>Actions</h2>
      <div className="row">
        {currentActions.map(action => (
          <div key={action.id} className="col col--4 margin-bottom--lg">
            <div 
              className="card card--full-height clickable-card"
              onClick={() => navigate(`../${action.id}/${namespace}`)}
              style={{cursor: 'pointer'}}
            >
              <div className="card__header">
                <h3>{action.icon} {action.label}</h3>
              </div>
              <div className="card__body">
                <p>Click to {action.label.toLowerCase()} for {namespace}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Action Page Implementation (Phase 4 Detail)

#### 4.1 Scaffold from Spreadsheet Action
**File**: `packages/theme/src/components/AdminRouter/actions/ScaffoldFromSpreadsheet.tsx`
```tsx
import React, { useState, useEffect } from 'react';
import { getAdminPortalConfigAuto } from '../../../config/siteConfig';

interface ScaffoldFromSpreadsheetProps {
  namespace: string;
  navigate: (path: string) => void;
}

export function ScaffoldFromSpreadsheet({ namespace, navigate }: ScaffoldFromSpreadsheetProps) {
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const adminConfig = getAdminPortalConfigAuto();
  
  // Check for GitHub issue with spreadsheet
  useEffect(() => {
    fetch(`${adminConfig.url}/api/admin/namespace/${namespace}/pending-spreadsheets`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.spreadsheetUrl) {
          setSpreadsheetUrl(data.spreadsheetUrl);
        }
      });
  }, [namespace]);
  
  const handleScaffold = async () => {
    setLoading(true);
    setStatus('processing');
    
    try {
      const response = await fetch(`${adminConfig.url}/api/actions/scaffold-from-spreadsheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          namespace,
          spreadsheetUrl,
        }),
      });
      
      if (response.ok) {
        setStatus('success');
        // Redirect after success
        setTimeout(() => navigate(`../admin/${namespace}`), 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container margin-vert--lg">
      <button 
        className="button button--secondary margin-bottom--lg"
        onClick={() => navigate(`../admin/${namespace}`)}
      >
        ← Back to Dashboard
      </button>
      
      <h1>Scaffold {namespace.toUpperCase()} from Spreadsheet</h1>
      
      <div className="card">
        <div className="card__header">
          <h2>Import Configuration</h2>
        </div>
        <div className="card__body">
          <div className="margin-bottom--md">
            <label htmlFor="spreadsheet-url">Spreadsheet URL:</label>
            <input
              id="spreadsheet-url"
              type="url"
              className="input"
              value={spreadsheetUrl}
              onChange={(e) => setSpreadsheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              disabled={loading}
            />
          </div>
          
          {status === 'processing' && (
            <div className="alert alert--info">
              <p>Processing spreadsheet... This may take a few minutes.</p>
              <div className="loader">Loading...</div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="alert alert--success">
              <p>✅ Scaffolding complete! Redirecting to dashboard...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="alert alert--danger">
              <p>❌ Error during scaffolding. Please check the logs.</p>
            </div>
          )}
        </div>
        <div className="card__footer">
          <button
            className="button button--primary button--lg"
            onClick={handleScaffold}
            disabled={!spreadsheetUrl || loading}
          >
            {loading ? 'Processing...' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 4.2 Generic Action Page Handler
**File**: `packages/theme/src/components/AdminRouter/ActionPage.tsx`
```tsx
import React from 'react';
import { ScaffoldFromSpreadsheet } from './actions/ScaffoldFromSpreadsheet';
// Import other action components as needed

interface ActionPageProps {
  action: string;
  namespace: string;
  navigate: (path: string) => void;
}

export function ActionPage({ action, namespace, navigate }: ActionPageProps) {
  switch (action) {
    case 'scaffold-from-spreadsheet':
      return <ScaffoldFromSpreadsheet namespace={namespace} navigate={navigate} />;
    
    // Add other actions here
    case 'manage-team':
      return <div>Manage Team for {namespace} (Coming Soon)</div>;
    
    case 'import-data':
      return <div>Import Data for {namespace} (Coming Soon)</div>;
    
    case 'export-rdf':
      return <div>Export RDF for {namespace} (Coming Soon)</div>;
    
    default:
      return (
        <div className="container margin-vert--lg">
          <h1>Unknown Action: {action}</h1>
          <button 
            className="button button--secondary"
            onClick={() => navigate('dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      );
  }
}
```

### 5. API Implementation (Phase 5 Detail)

#### 5.1 Scaffold from Spreadsheet API
**File**: `apps/admin/src/app/api/actions/scaffold-from-spreadsheet/route.ts`
```tsx
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { namespace, spreadsheetUrl } = await request.json();
  
  // Verify user has admin role for this namespace
  const hasAccess = session.user.roles?.includes(`${namespace}-admin`) || 
                    session.user.roles?.includes('system-admin');
  
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  try {
    // Create job in Supabase queue
    const { data, error } = await supabase
      .from('scaffold_jobs')
      .insert({
        namespace,
        spreadsheet_url: spreadsheetUrl,
        status: 'pending',
        created_by: session.user.email,
        webhook_url: `${process.env.NEXTAUTH_URL}/api/webhooks/scaffold-complete`,
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger async processing (e.g., via Vercel Edge Function)
    // This would handle the actual conversion and scaffolding
    
    return NextResponse.json({ 
      jobId: data.id,
      status: 'queued',
      message: 'Scaffolding job queued successfully' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### 5.2 Namespace Listing API
**File**: `apps/admin/src/app/api/admin/namespaces/route.ts`
```tsx
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Define all namespaces with metadata
  const allNamespaces = [
    { id: 'isbd', name: 'ISBD', description: 'International Standard Bibliographic Description' },
    { id: 'lrm', name: 'LRM', description: 'Library Reference Model' },
    { id: 'frbr', name: 'FRBR', description: 'Functional Requirements for Bibliographic Records' },
    { id: 'muldicat', name: 'MulDiCat', description: 'Multilingual Dictionary of Cataloguing' },
    { id: 'unimarc', name: 'UNIMARC', description: 'Universal MARC Format' },
  ];

  // Filter based on user's teams
  const userNamespaces = session.user.roles?.includes('system-admin')
    ? allNamespaces
    : allNamespaces.filter(ns => 
        session.user.roles?.some(role => role.startsWith(`${ns.id}-`))
      );

  return NextResponse.json({ namespaces: userNamespaces });
}
```

#### 5.3 Webhook Handler for Completion
**File**: `apps/admin/src/app/api/webhooks/scaffold-complete/route.ts`
```tsx
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  // Verify webhook signature
  const signature = request.headers.get('x-webhook-signature');
  if (!verifyWebhookSignature(signature, await request.text())) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { jobId, status, result } = await request.json();
  
  // Update job status in Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  await supabase
    .from('scaffold_jobs')
    .update({ 
      status: status,
      completed_at: new Date().toISOString(),
      result: result 
    })
    .eq('id', jobId);

  // Could send notification email here
  
  return NextResponse.json({ received: true });
}

function verifyWebhookSignature(signature: string | null, body: string): boolean {
  // Implement webhook signature verification
  return true; // Placeholder
}
```

### 6. Key Implementation Notes

#### Authentication Flow
1. User clicks login in portal navbar
2. Portal shows `/admin/login` page (no redirect to admin app)
3. "Login with GitHub" button links to admin app OAuth handler
4. Admin app handles GitHub OAuth and redirects back to portal
5. Portal shows user avatar and appropriate dashboard

#### Routing Patterns
- `/admin/login` - Login page
- `/admin/dashboard` - Namespace selection for multi-role users
- `/admin/[role]/[namespace]` - Role-specific dashboards
- `/admin/[action]/[namespace]` - Action pages

#### API Patterns
- Authentication: `http://localhost:3007/api/auth/*`
- Actions: `http://localhost:3007/api/actions/*`
- Data: `http://localhost:3007/api/admin/*`
- Webhooks: `http://localhost:3007/api/webhooks/*`

#### Supabase Integration
- Job queue for long-running processes
- Webhook notifications for completion
- Status tracking and error handling

#### Security Considerations
- Role-based access at component level
- API-level authorization checks
- CORS configuration for cross-origin requests
- Webhook signature verification

### 7. CSS Styling for Portal Admin

**File**: `portal/src/css/custom.css`
```css
/* Admin dashboard styles */
.clickable-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

.progress-bar {
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background-color: var(--ifm-color-primary);
  transition: width 0.3s ease;
}

.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 4px;
  font-size: 1rem;
}

.loader {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Summary

This implementation plan transforms the admin architecture from a confusing double-app setup to a streamlined portal-based UI with the admin app serving purely as an auth/API service. Key benefits:

1. **Simplified Login Flow**: No more redirect loops - login happens directly in portal
2. **Unified Experience**: All UI in Docusaurus, consistent with the rest of the platform
3. **Clean Separation**: Admin app becomes a minimal auth + API service
4. **Flexible Routing**: Support for role-based dashboards and action pages
5. **Scalable Architecture**: Easy to add new actions and workflows

The phased approach allows for incremental implementation while maintaining functionality throughout the migration.

---

## Task Checklist

### Phase 1: Fix Authentication Flow 🔐 (Immediate)
- [ ] Update CORS in `apps/admin/next.config.js` to allow portal URL
- [ ] Fix redirect logic in `apps/admin/src/app/lib/auth.ts`
- [ ] Update `LoginPrompt` component to show proper login UI
- [ ] Test authentication flow from portal → admin → portal

### Phase 2: Implement New Routing 🛣️ (Day 1-2)
- [ ] Update `AdminRouter` to parse new route patterns
- [ ] Add route handler for `/admin/login`
- [ ] Add route handler for `/admin/dashboard`
- [ ] Add route handlers for `/admin/[role]/[namespace]`
- [ ] Add route handlers for `/admin/[action]/[namespace]`
- [ ] Create navigation helper functions

### Phase 3: Build Dashboard Components 📊 (Day 3-5)
- [ ] Create `NamespaceSelection` component
- [ ] Create `RoleDashboard` component
- [ ] Create `ActionPage` router component
- [ ] Build action card UI components
- [ ] Add progress/stats display components
- [ ] Style with Docusaurus theme classes

### Phase 4: Create Action Pages 🎯 (Day 6-8)
- [ ] Build `ScaffoldFromSpreadsheet` component
- [ ] Create confirmation workflow UI
- [ ] Add progress tracking display
- [ ] Implement error handling UI
- [ ] Add other action components as needed

### Phase 5: API Development 🔗 (Day 9-11)
- [ ] Create `/api/actions/scaffold-from-spreadsheet`
- [ ] Create `/api/admin/namespaces` endpoint
- [ ] Create `/api/webhooks/scaffold-complete`
- [ ] Set up Supabase client and tables
- [ ] Implement job queue logic
- [ ] Add webhook signature verification

### Phase 6: Clean Up Admin App 🧹 (Day 12-13)
- [ ] Remove `/dashboard` and `/site` directories
- [ ] Remove UI components (keep auth components)
- [ ] Update `next.config.js` configuration
- [ ] Remove unused dependencies
- [ ] Test minimal admin app functionality

### Phase 7: Testing & Polish 🧪 (Day 14-15)
- [ ] Update E2E tests for new authentication flow
- [ ] Test all user stories end-to-end
- [ ] Fix styling and responsiveness issues
- [ ] Add loading states and error boundaries
- [ ] Document new architecture and flows

### Future Enhancements 🚀
- [ ] Add MUI for richer UI components
- [ ] Implement TinaCMS for content management
- [ ] Add more sophisticated data conversion tools
- [ ] Create GitHub team management UI
- [ ] Build notification system for long-running tasks

---

## Environment Variables

### Admin App (Next.js)
```bash
# GitHub OAuth
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3007
NEXTAUTH_SECRET=your_random_secret

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3008
```

### Portal (Docusaurus)
```bash
# Environment
DOCS_ENV=local
```


---

## Next Steps

1. **Start with Phase 1** - Fix the immediate authentication issues
2. **Test the flow** - Ensure login works smoothly from portal
3. **Build incrementally** - Add dashboard components one at a time
4. **Keep it simple** - Use Docusaurus styling, avoid complex dependencies initially
5. **Iterate** - Get basic functionality working, then enhance

This simplified approach gets us to a working admin interface quickly while laying the foundation for future enhancements like MUI components and advanced workflows.