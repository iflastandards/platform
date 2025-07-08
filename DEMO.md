# Admin Services Integration Demo

This document explains how to run the demo that showcases the integration between the Portal site and the admin services.

## Quick Start

### Option 1: Simple Demo (Recommended)
```bash
pnpm demo:admin:simple
```

### Option 2: Full Demo with Shell Script
```bash
pnpm demo:admin
```

Both commands will:
1. 🧹 Clean up any existing processes on ports 3000 and 3007
2. 🚀 Start the admin services on `http://localhost:3007/services`
3. 🚀 Start the portal site on `http://localhost:3000`
4. 🌐 Automatically open both URLs in your browser
5. 📋 Display demo instructions

## What to Test

### 1. Portal Admin Navigation
- **Visit**: `http://localhost:3000`
- **Navigate to**: `/admin` or click "Admin" in navbar
- **Look for**: Login prompt with GitHub authentication

### 2. Authentication Flow
- **Click**: "Login with GitHub" button
- **Redirect**: To `http://localhost:3007/services/auth/signin`
- **Sign in**: Use your GitHub account
- **Return**: Back to portal admin interface at `http://localhost:3000/admin`

### 3. Admin Interface Features
- **Namespace selection**: Choose which standards to manage
- **Role-based dashboards**: Different views based on your permissions
- **Action pages**: Scaffold sites, manage teams, import data

### 4. Services Integration
- **Portal UI**: All admin interface at `http://localhost:3000/admin/*`
- **Auth Services**: Authentication handled by `http://localhost:3007/services`
- **API Endpoints**: All API calls go to `/services/api/*`
- **Session Sharing**: Authenticated state shared between portal and services

## Demo Features

### Portal Site (localhost:3000)
- ✅ NextAuth v5 authentication
- ✅ GitHub OAuth integration
- ✅ Role-based access control
- ✅ Site management dashboard
- ✅ Sign-out functionality

### newtest Site (localhost:3008/newtest/)
- ✅ Standard Docusaurus site
- ✅ Integrated "Manage Site" button
- ✅ Proper styling and positioning
- ✅ Opens admin portal in new tab

### Integration Points
- ✅ Navbar button integration
- ✅ Automatic site key detection
- ✅ Environment-aware URL configuration
- ✅ Cross-tab authentication flow

## Stopping the Demo

Press **Ctrl+C** in the terminal to stop both services and clean up processes.

## Troubleshooting

### Services Won't Start
```bash
# Clean up manually
pnpm ports:kill

# Try again
pnpm demo:admin:simple
```

### Browser Doesn't Open
- **Manual URLs**:
  - newtest site: `http://localhost:3008/newtest/`
  - Admin portal: `http://localhost:3007`

### "Manage Site" Button Missing
1. Check that newtest site loaded successfully
2. Look in the top-right corner of the navbar
3. Refresh the page if needed

### Authentication Issues
1. Make sure you have a GitHub account
2. Check that your GitHub username/email matches the admin configuration
3. Try signing out and back in

### Port Conflicts
```bash
# Kill processes on specific ports
lsof -ti:3007 | xargs kill -9
lsof -ti:3008 | xargs kill -9

# Or use the project script
pnpm ports:kill
```

## Manual Testing Steps

If you prefer to start services manually:

```bash
# Terminal 1: Start admin portal
nx serve admin-portal

# Terminal 2: Start newtest site  
DOCS_ENV=local nx start newtest

# Terminal 3: Open browsers
open http://localhost:3008/newtest/
open http://localhost:3007
```

## Next Steps

After testing the demo:

1. **Add to other sites**: Use the same navbar integration pattern
2. **Production setup**: Configure production URLs and environment variables
3. **User documentation**: Create guides for content managers
4. **Team training**: Show the workflow to site administrators

## Architecture Overview

```
┌─────────────────┐    Click "Manage Site"    ┌─────────────────┐
│  Docusaurus     │───────────────────────────▶│  Admin Portal   │
│  Site           │                            │                 │
│  (port 3008)    │                            │  (port 3007)    │
│                 │                            │                 │
│ • Content       │                            │ • Authentication│
│ • Navigation    │                            │ • Site Mgmt     │
│ • Manage Button │                            │ • User Roles    │
└─────────────────┘                            └─────────────────┘
```

The integration provides a seamless bridge between public documentation sites and their administrative interfaces, enabling efficient content management workflows.