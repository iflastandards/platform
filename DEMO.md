# Admin Portal Integration Demo

This document explains how to run the demo that showcases the integration between Docusaurus sites and the admin portal.

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
1. 🧹 Clean up any existing processes on ports 3007 and 3008
2. 🚀 Start the admin portal on `http://localhost:3007`
3. 🚀 Start the newtest site on `http://localhost:3008/newtest/`
4. 🌐 Automatically open both URLs in your browser
5. 📋 Display demo instructions

## What to Test

### 1. Navbar Integration
- **Visit**: `http://localhost:3008/newtest/`
- **Look for**: Blue "Manage Site" button in the top-right navbar
- **Action**: Click the button

### 2. Admin Portal Access
- **Expect**: New tab opens to `http://localhost:3007/dashboard/newtest`
- **First time**: You'll be redirected to sign-in page
- **Sign in**: Use your GitHub account
- **Result**: Access to newtest site management dashboard

### 3. Authentication Flow
- **Sign-in page**: Clean, branded interface
- **GitHub OAuth**: Secure authentication
- **Role assignment**: Site owner gets automatic admin access
- **Dashboard access**: Full site management interface

### 4. Cross-Site Integration
- **Seamless transition**: From public site to admin interface
- **Context preservation**: Automatically opens correct site dashboard
- **Security**: Authentication required before access

## Demo Features

### Admin Portal (localhost:3007)
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