# Clerk Authentication Setup

## Overview
The admin app uses Clerk for authentication with real users mapped to fake GitHub data in demo mode.

## Test Users
All test users use the password: `testpassword123`
Email verification code: `424242`

### 1. System Admin
- **Email**: superadmin+clerk_test@example.com
- **GitHub Username**: superadmin-demo
- **Role**: System Admin
- **Access**: All review groups as maintainer
- **Dashboard**: `/dashboard/admin`

### 2. Review Group Admin
- **Email**: rg_admin+clerk_test@example.com
- **GitHub Username**: rgadmin-demo
- **Role**: ISBD Review Group Maintainer
- **Access**: ISBD/ISBDM namespaces, 1 project lead
- **Dashboard**: `/dashboard`

### 3. Editor
- **Email**: editor+clerk_test@example.com
- **GitHub Username**: editor-demo
- **Role**: Editor on 2 projects
- **Access**: ISBD/ISBDM/CAT namespaces
- **Dashboard**: `/dashboard`

### 4. Author/Reviewer
- **Email**: author+clerk_test@example.com
- **GitHub Username**: author-demo
- **Role**: Reviewer on 1 project
- **Access**: ISBD namespace only
- **Dashboard**: `/dashboard`

### 5. Translator
- **Email**: translator+clerk_test@example.com
- **GitHub Username**: translator-demo
- **Role**: Translator (no team membership)
- **Access**: ISBD namespace (project-based)
- **Dashboard**: `/dashboard`

## Environment Configuration
```env
# Enable demo mode
IFLA_DEMO=true
NEXT_PUBLIC_IFLA_DEMO=true
```

## Authentication Flow
1. User clicks "Sign In" button
2. Clerk modal appears
3. User enters email and password
4. Email verification code is sent (use 424242)
5. User is redirected based on their role:
   - System Admin → `/dashboard/admin`
   - Users with access → `/dashboard`
   - Users without access → `/dashboard/pending`

## Key Components

### 1. `clerk-github-auth.ts`
- Maps Clerk users to GitHub structure
- Handles demo mode with fake data
- Extracts accessible namespaces

### 2. `github-mock-service.ts`
- Provides fake GitHub team/project data
- Maps email addresses to GitHub usernames
- Ready for 30 ISBD members

### 3. Dashboard Components
- `PersonalDashboard`: User-centric view showing all teams/projects
- `PendingDashboard`: Shows when user has no access
- `RoleBasedDashboard`: Legacy dashboard (still available)

## Testing
Run the integration tests:
```bash
pnpm test dashboard-routing.test.ts
```

## Next Steps
1. Add the 30 ISBD review group members to `github-mock-service.ts`
2. Create them as real Clerk users
3. Test the full workflow with production-like data