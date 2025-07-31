# Admin Portal

The IFLA Standards Admin Portal is a headless Next.js service that provides authentication and API services for the platform.

## Architecture

- **Framework**: Next.js 15.2.5 (App Router)
- **Authentication**: Clerk (replacing NextAuth)
- **Authorization**: Cerbos for role-based access control
- **Database**: Supabase
- **Port**: 3007 (local development)

## Development

```bash
# Start development server
nx dev admin --turbopack

# Build for production
nx build admin

# Run tests
nx test admin
```

## Testing

### Unit & Integration Tests (Vitest)

**Purpose**: Test components, utilities, and API logic in isolation or with mocked dependencies.

**Location**: `src/test/`

**Framework**: Vitest + React Testing Library

**What's Tested**:
- API endpoint logic
- Authentication helpers
- Cerbos integration
- React component rendering
- User interaction handlers
- Custom hooks

### E2E Tests (Playwright)

**Purpose**: Test complete, role-based user workflows in a real browser.

**Location**: `e2e/admin/`

**Framework**: Playwright

**What's Tested**:
- Role-Based Access Control (RBAC)
- Authentication and Authorization flows
- Complete admin workflows
- Cross-site integration with documentation sites

### Test Commands

```bash
# Run unit tests
nx test admin

# Run integration tests
nx test:integration admin

# Run E2E tests
nx e2e admin

# Run server-dependent tests
nx test:server-dependent admin
```

### Role-Based Testing

To test different user roles without a full GitHub login for each run, we use environment variables to inject a mock user session:

- **Environment Variable**: `E2E_MOCK_USER_ROLES`
- **Format**: JSON string representing the user's roles map

Example:
```bash
E2E_MOCK_USER_ROLES='{"namespace_admin":["isbd","lrm"],"namespace_editor":["unimarc"]}' nx e2e admin
```

### Mock Authentication

For development and testing, you can enable mock authentication:

1. Set `E2E_USE_MOCK_AUTH=true` in your environment
2. Use mock users defined in `src/lib/mock-data/auth.ts`
3. Access mock login at `/api/auth/signin?mock=true`

## API Routes

### Authentication
- `/api/auth/callback` - OAuth callback
- `/api/auth/signin` - Sign in endpoint
- `/api/auth/sync-github` - GitHub sync

### Admin
- `/api/admin/namespaces` - Namespace management
- `/api/admin/roles` - Role management
- `/api/admin/users` - User management
- `/api/admin/adopt-spreadsheet` - Spreadsheet adoption
- `/api/admin/validate-spreadsheet` - Spreadsheet validation

### Actions
- `/api/actions/scaffold-from-spreadsheet` - Create site from spreadsheet

### Other
- `/api/health` - Health check
- `/api/request-invite` - Request platform access
- `/api/validate-csv` - CSV validation

## Environment Variables

Required environment variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# GitHub Integration
GITHUB_APP_ID=
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_INSTALLATION_ID=

# Cerbos
CERBOS_URL=http://localhost:3592
```

## Authorization Model

The admin portal uses Cerbos for fine-grained authorization:

### Roles
- `superadmin` - Full platform access
- `namespace_admin` - Manage specific namespaces
- `namespace_editor` - Edit content in specific namespaces
- `translator` - Translate content
- `review_group` - Review and approve changes
- `author` - Create content

### Resources
- Namespaces
- Vocabularies
- Users
- Roles
- Spreadsheets

See `src/lib/cerbos.ts` for the complete authorization logic.