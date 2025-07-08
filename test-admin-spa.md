# Admin SPA Test Guide

## Setup

1. **Portal**: Running on http://localhost:3000/
2. **Admin App**: Running on http://localhost:3007/admin/
3. **Admin SPA**: Available at http://localhost:3000/admin/*

## Test URLs

### Direct namespace dashboards:
- http://localhost:3000/admin/dashboard/newtest - NewTest admin dashboard
- http://localhost:3000/admin/dashboard/isbd - ISBD admin dashboard
- http://localhost:3000/admin/editor/newtest - NewTest editor dashboard
- http://localhost:3000/admin/reviewer/isbd - ISBD reviewer dashboard

### Without namespace:
- http://localhost:3000/admin - General admin dashboard

## Authentication Flow

1. Navigate to any admin URL above
2. If not authenticated, you'll see "Login with GitHub" button
3. Click the button to redirect to: http://localhost:3007/admin/auth/signin
4. After GitHub OAuth login, you'll be redirected back to the portal admin page
5. You'll see:
   - "Hello from {namespace} dashboard!" (if namespace provided)
   - Welcome message with username
   - List of your teams
   - Navigation buttons to different dashboards

## Features

- **Dynamic Routing**: `/admin/[role]/[namespace]` pattern
- **Authentication**: Integrated with admin app's NextAuth
- **Role-based UI**: Different content for editor, reviewer, admin roles
- **Namespace Context**: Each dashboard knows its namespace

## GitHub OAuth Setup

For real GitHub authentication, ensure your admin app has valid credentials:
```env
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
```

OAuth callback URL: `http://localhost:3007/admin/api/auth/callback/github`