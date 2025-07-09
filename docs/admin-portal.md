# Admin Portal Documentation

## Overview

The IFLA Standards Admin Portal is a Next.js application that provides administrative functionality for managing IFLA standards sites, users, and content workflows.

## Quick Start

### Access URLs
- **Local Development**: `http://localhost:3007/admin`
- **Preview Environment**: `https://iflastandards.github.io/platform/admin`
- **Production**: `https://www.iflastandards.info/admin`

### Starting the Admin Portal
```bash
# Start development server
pnpm dev:admin

# Or using nx directly
nx dev admin

# Access at http://localhost:3007/admin
```

## Architecture

### Application Structure
- **Location**: `/apps/admin`
- **Framework**: Next.js 15.2.5 with App Router
- **Authentication**: NextAuth.js with GitHub OAuth
- **Authorization**: Cerbos for role-based access control
- **Base Path**: `/admin` (all routes prefixed)

### Key Components
1. **Authentication System** - GitHub OAuth with team role detection
2. **Dashboard System** - Main dashboard and site-specific management
3. **API Infrastructure** - RESTful APIs for admin operations
4. **Role-Based Access Control** - Fine-grained permissions

## Authentication

### GitHub OAuth Setup
Configure your GitHub OAuth app with:
- **Homepage URL**: `http://localhost:3007/admin`
- **Authorization callback URL**: `http://localhost:3007/admin/api/auth/callback/github`

### Environment Variables
```bash
NEXTAUTH_URL=http://localhost:3007/admin
NEXTAUTH_SECRET=your-secret-here
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret
NEXT_PUBLIC_CERBOS_PDP_URL=http://localhost:3593
```

### Authentication Flow
1. User accesses admin portal
2. Redirected to `/admin/auth/signin` if not authenticated
3. GitHub OAuth flow initiated
4. User returned to dashboard after successful authentication
5. Session shared across portal and admin applications

## User Interface

### Main Dashboard (`/admin/dashboard`)
- **Site Management Cards** - Quick access to individual site management
- **User Information** - Display current user and roles
- **Quick Actions** - Links to GitHub repository, issues, and teams

### Site Management (`/admin/dashboard/[siteKey]`)
- **Site-Specific Dashboards** - Tailored for each standard (ISBDM, LRM, etc.)
- **Content Management** - Tools for managing site content
- **Team Collaboration** - User and role management
- **Workflow Actions** - Automated processes and scripts

### Authentication Pages
- **Sign In** (`/admin/auth/signin`) - GitHub OAuth and mock authentication
- **Access Denied** - Role-based access control messages

## API Endpoints

### Authentication APIs
- `GET /admin/api/auth/session` - Current user session
- `POST /admin/api/auth/signin` - Initiate authentication
- `POST /admin/api/auth/signout` - End user session

### Admin APIs
- `GET /admin/api/admin/users` - User management
- `GET /admin/api/admin/roles` - Role management
- `GET /admin/api/admin/namespace/[namespace]/pending-spreadsheets` - Content workflows

### Action APIs
- `POST /admin/api/actions/scaffold-from-spreadsheet` - Generate content from spreadsheets

## Role-Based Access Control

### Role Hierarchy
1. **System Level**: `ifla-admin`, `site-admin`
2. **Namespace Level**: `{namespace}-admin`, `{namespace}-editor`, `{namespace}-reviewer`
3. **Site Level**: `{site}-admin`, `{site}-editor`, `{site}-translator`

### Permission Model
- **Site Access**: Users need appropriate roles for site management
- **Action Permissions**: Specific actions require specific role levels
- **Cerbos Integration**: Policy-as-code authorization decisions

### Example Roles
- `ISBD-admin` - Full admin access to ISBD namespace
- `isbdm-editor` - Edit access to ISBDM site
- `LRM-reviewer` - Review access to LRM namespace

## Development

### Project Structure
```
apps/admin/
├── src/app/
│   ├── api/                 # API routes
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard pages
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilities and configuration
├── middleware.ts          # Next.js middleware
└── next.config.js        # Next.js configuration
```

### Key Files
- `src/app/lib/auth.ts` - NextAuth configuration
- `src/app/lib/role-based-routing.ts` - Role-based navigation logic
- `middleware.ts` - CORS and authentication middleware
- `next.config.js` - Base path and application configuration

### Testing
```bash
# Unit tests
nx test admin

# Type checking
nx run admin:typecheck

# Linting
nx run admin:lint

# E2E tests
nx run standards-dev:e2e:admin
```

## Integration

### Portal Integration
The admin portal integrates with the main portal site:
- **Shared Configuration** - Centralized in `packages/theme/src/config/siteConfig.ts`
- **Cross-Site Authentication** - CORS-enabled session sharing
- **Navigation Links** - Portal includes admin navigation elements

### Docusaurus Site Integration
Individual standard sites can integrate admin features:
- **Login Prompts** - Redirect to admin authentication
- **Session Checking** - Validate user permissions
- **Role-Based Features** - Show/hide based on user roles

### Configuration
Admin portal URLs are centralized in the theme configuration:

```typescript
export const ADMIN_PORTAL_CONFIG: Record<Environment, AdminPortalConfig> = {
  local: {
    url: 'http://localhost:3007/admin',
    signinUrl: 'http://localhost:3007/admin/auth/signin',
    dashboardUrl: 'http://localhost:3007/admin/dashboard',
    // ... other URLs
  },
  // ... other environments
};
```

## Troubleshooting

### Common Issues

#### 404 Errors on Redirects
**Problem**: Inactivity logout or other redirects result in 404 errors  
**Solution**: Ensure all internal redirects use relative paths (e.g., `/auth/signin` not `/admin/auth/signin`)

#### CORS Errors
**Problem**: Portal cannot access admin APIs  
**Solution**: Check middleware configuration for allowed origins in `apps/admin/middleware.ts`

#### Authentication Loops
**Problem**: Continuous redirects between signin and dashboard  
**Solution**: Verify NextAuth `basePath` and callback URL configuration

#### Port Conflicts
**Problem**: Admin server fails to start due to port conflicts  
**Solution**: Use `pnpm ports:kill` to clear conflicting processes

### Debug Commands
```bash
# Check admin app health
curl http://localhost:3007/admin

# Test authentication endpoint
curl http://localhost:3007/admin/api/auth/session

# View detailed server logs
nx dev admin --verbose

# Clear port conflicts
pnpm ports:kill
```

### Environment Issues
- Ensure `NEXTAUTH_URL` matches your deployment environment
- Verify GitHub OAuth app configuration for your domain
- Check Cerbos PDP URL for authorization functionality

## Security Considerations

### Authentication Security
- GitHub OAuth provides secure authentication
- Session tokens are HTTP-only cookies
- CSRF protection enabled by default

### Authorization Security
- Cerbos provides policy-as-code authorization
- Role-based access control at multiple levels
- API endpoints protected by authentication middleware

### CORS Security
- Restricted to specific allowed origins
- Credentials included only for authorized domains
- Preflight requests properly handled

## Deployment

### Environment Configuration
Each environment requires specific configuration:
- **Local**: Direct localhost URLs
- **Preview**: GitHub Pages URLs with `/platform` prefix
- **Production**: Custom domain URLs

### Build Process
```bash
# Build for production
nx build admin

# Serve built application
nx serve admin
```

### Environment Variables
Ensure all required environment variables are set for your deployment environment, particularly `NEXTAUTH_URL`, GitHub OAuth credentials, and Cerbos configuration.

## Support

For issues and questions:
- **GitHub Issues**: [standards-dev repository](https://github.com/iflastandards/standards-dev/issues)
- **Documentation**: See `developer_notes/` for detailed implementation guides
- **Testing**: Use `scripts/test-admin-roles.js` for role-based testing scenarios