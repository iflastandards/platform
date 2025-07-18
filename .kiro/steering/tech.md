# Technology Stack

## Build System & Monorepo

- **Nx**: Primary build system and monorepo orchestration (v21.2.2)
- **pnpm**: Package manager (v10.12.4) with workspace support
- **TypeScript**: Primary language (v5.8.3) with strict configuration
- **Node.js**: Runtime environment (>=18.0 required)

## Frontend Frameworks

- **Docusaurus**: Documentation sites (v3.8.1) - main platform for standards sites
- **Next.js**: Admin portal (v15.2.5) with App Router
- **React**: UI library (v19.1.0) across all applications
- **Material-UI**: Component library for admin portal (v7.2.0)

## Development Tools

- **Vite**: Build tool and dev server (v6.3.5)
- **Vitest**: Unit testing framework (v3.2.4)
- **Playwright**: E2E testing (v1.54.1)
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting

## Authentication & Authorization

- **Clerk/NextJS**: Authentication provider for admin portal
- **Cerbos**: Role-based access control (RBAC) system
- **GitHub OAuth**: Primary authentication method

## Data & APIs

- **Google Sheets API**: Vocabulary management and export
- **Supabase**: Database and backend services
- **tRPC**: Type-safe API layer (v11.4.3)
- **React Query**: Data fetching and caching

## Common Commands

### Essential Commands
```bash
# Package manager (never use npm or yarn)
pnpm install

# Build single site
nx build {name}          # e.g., nx build portal, nx build isbdm, nx build admin
pnpm build:all           # Build all sites (optimized with Nx caching and parallelization)

# Start development servers
nx start {site}          # Start specific site
nx run {site}:start:robust  # Start with port cleanup
nx dev admin --turbopack  # Start Next.js dev server with Turbopack

# Serve built sites
nx serve {site}          # Serve built site
nx run {site}:serve:robust  # Serve with port cleanup

# Testing
pnpm test                # Run tests (nx affected with parallel execution)
pnpm typecheck           # Type checking (nx affected with parallel execution)
pnpm lint                # Linting (nx affected with parallel execution)

# System checks
pnpm health              # Comprehensive system check
pnpm fresh               # Clean install with cache clear
```

### Testing Commands
```bash
# Run all tests
pnpm test                # Test affected projects
pnpm test:e2e            # Run E2E tests
pnpm test:builds:affected  # Test affected site builds
pnpm test:visual         # Run visual regression tests
pnpm test:comprehensive  # Full validation for releases

# Pre-commit/Pre-push
pnpm test:pre-commit     # Fast feedback before commit
pnpm test:pre-push:flexible  # Production readiness before push

# Debugging tests
npx playwright test --headed  # Run E2E tests with browser visible
npx vitest --ui              # Open Vitest UI for debugging

# Scripts testing
pnpm test:scripts            # Run all script tests
pnpm test:scripts:affected   # Run only affected script tests
pnpm test:scripts:file <path> # Run a specific test file
pnpm test:scripts:watch      # Run tests in watch mode
pnpm test:scripts:coverage   # Run tests with coverage
```

### Performance Commands
```bash
# Nx optimization
pnpm nx:optimize         # Run performance optimization script
pnpm nx:daemon:start     # Start Nx daemon (speeds up all Nx commands)
pnpm nx:cache:clear      # Clear cache (when you need a fresh build)
pnpm nx:cache:stats      # View cache effectiveness
pnpm nx:graph            # Visualize project dependencies

# Port management
pnpm ports:kill          # Free up ports used by development servers
```

### Utilities
```bash
# Site management
pnpm scaffold           # Create new standard site
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard" --tagline="A new IFLA standard"

# Validation
pnpm validate:site-links  # Validate links across sites
pnpm validate:builds      # Validate all site builds

# Vocabulary tools
pnpm vocabulary:create    # Generate vocabulary sheets
pnpm vocab:release        # Export RDF vocabularies
```

## Environment Variables

- **DOCS_ENV**: Environment setting (local|preview|development|production)
- **NODE_ENV**: Node environment (development|production)
- Uses centralized TypeScript configuration instead of .env files