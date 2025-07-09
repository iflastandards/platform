# Admin Architecture: Next.js Application with /admin Base Path

## Current Architecture (January 2025)

### Decision: Next.js Admin App
After evaluation, we chose to continue with the **Next.js admin application** at `/apps/admin` rather than moving to a Docusaurus-based SPA approach. The Next.js app has substantial functionality (44 TypeScript files) and provides a solid foundation.

### URL Structure
All admin functionality is accessed via the `/admin` base path:

- **Main admin portal**: `http://localhost:3007/admin`
- **Authentication**: `http://localhost:3007/admin/auth/signin`
- **Dashboard**: `http://localhost:3007/admin/dashboard`
- **Site management**: `http://localhost:3007/admin/dashboard/[siteKey]`
- **API endpoints**: `http://localhost:3007/admin/api/auth/*`

### Key Components

#### 1. Authentication System
- **GitHub OAuth** with team role detection
- **Mock authentication** for development
- **Cross-site session sharing** with CORS for portal integration
- **Role-based access control** with Cerbos integration

#### 2. Dashboard System
- **Main dashboard** with site management cards
- **Individual site management** pages (`/admin/dashboard/[siteKey]`)
- **Role-based authorization** checks
- **Comprehensive site management** client with tabs

#### 3. API Infrastructure
- **Scaffold from spreadsheet** API (`/admin/api/actions/scaffold-from-spreadsheet`)
- **Admin APIs** for users, roles, namespaces
- **Proper authentication** middleware

### Configuration

#### Next.js Configuration
```javascript
const nextConfig = {
  basePath: '/admin',
  // ... other config
};
```

#### NextAuth Configuration
```javascript
const authConfig = {
  basePath: '/api/auth',
  pages: {
    signIn: '/auth/signin',
  },
  // ... other config
};
```

#### Environment Variables
```bash
NEXTAUTH_URL=http://localhost:3007/admin
NEXTAUTH_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
NEXT_PUBLIC_CERBOS_PDP_URL=http://localhost:3593
```

#### GitHub OAuth Setup
- **Homepage URL**: `http://localhost:3007/admin`
- **Authorization callback URL**: `http://localhost:3007/admin/api/auth/callback/github`

### Site Configuration Integration

The admin portal configuration is centralized in `packages/theme/src/config/siteConfig.ts`:

```typescript
export const ADMIN_PORTAL_CONFIG: Record<Environment, AdminPortalConfig> = {
  local: {
    url: 'http://localhost:3007/admin',
    signinUrl: 'http://localhost:3007/admin/auth/signin',
    dashboardUrl: 'http://localhost:3007/admin/dashboard',
    signoutUrl: 'http://localhost:3007/admin/api/auth/signout',
    sessionApiUrl: 'http://localhost:3007/admin/api/auth/session',
    port: 3007,
  },
  // ... preview and production configs
};
```

### Cross-Site Integration

#### Portal Integration
The portal site integrates with the admin app for authentication:
- **Login links** redirect to admin signin
- **Session checking** via admin API endpoints
- **CORS configuration** allows portal to access admin APIs

#### Individual Sites
Standard Docusaurus sites can integrate admin functionality:
- **Login prompts** redirect to admin portal
- **Session sharing** via CORS-enabled API calls
- **Role-based features** based on admin session

### Development Workflow

#### Starting the Admin App
```bash
# Start admin development server
pnpm dev:admin
# or
nx dev admin

# Access at http://localhost:3007/admin
```

#### Testing
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

### Key Features

#### 1. Role-Based Access Control
- **Site-specific roles**: `{site}-admin`, `{site}-editor`
- **Namespace roles**: `{namespace}-admin`, `{namespace}-editor`
- **System roles**: `ifla-admin`, `site-admin`
- **Cerbos integration** for policy-as-code authorization

#### 2. Site Management
- **Individual site dashboards** for each standard
- **Content management** workflows
- **Team collaboration** tools
- **GitHub integration** for repository management

#### 3. Authentication Features
- **GitHub OAuth** with organization team detection
- **Mock authentication** for development testing
- **Inactivity logout** with proper redirects
- **Session persistence** options

### Future Enhancements

#### Planned Features
1. **TinaCMS Integration** - Visual content editing
2. **Workflow Automation** - Automated content processing
3. **Advanced Role Management** - Fine-grained permissions
4. **Analytics Dashboard** - Usage and performance metrics

#### Architecture Evolution
The admin app is designed to evolve from a full application to a more focused authentication and API service, with UI components potentially moving to the portal site over time. However, the current Next.js architecture provides a solid foundation for immediate development needs.

### Troubleshooting

#### Common Issues
1. **404 on inactivity logout** - Ensure all redirects use `/admin` base path
2. **CORS errors** - Check middleware configuration for allowed origins
3. **Authentication loops** - Verify NextAuth basePath and callback URLs
4. **Port conflicts** - Use `pnpm ports:kill` to clear conflicting processes

#### Debug Commands
```bash
# Check admin app health
curl http://localhost:3007/admin

# Test authentication endpoint
curl http://localhost:3007/admin/api/auth/session

# View server logs
nx dev admin --verbose
```

This architecture provides a robust foundation for IFLA standards management while maintaining flexibility for future enhancements.