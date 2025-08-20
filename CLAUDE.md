# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Test, and Development Commands

### Essential Commands
```bash
# Install dependencies and set up the project
pnpm setup

# Development servers
pnpm dev:servers                    # Start all dev servers with helper tool
pnpm dev:interactive                 # Interactive mode with Chrome browser
pnpm dev:headless                    # Headless mode (no browser windows)
pnpm nx start [site]                 # Start specific site (portal, isbd, admin, etc.)

# Building
pnpm build:all                       # Build all sites
pnpm nx build [site]                 # Build specific site (portal, isbd, admin, etc.)
pnpm build:affected                  # Build only affected projects

# Testing
pnpm test                            # Run affected tests with daemon
pnpm test:comprehensive              # Full validation suite (typecheck, lint, test, build)
pnpm test:pre-commit:robust          # Pre-commit validation (fast feedback)
pnpm test:e2e                        # Run E2E tests
pnpm test:unit                       # Run unit tests only
pnpm nx test [project]               # Test specific project

# Type checking and linting
pnpm typecheck                       # Run TypeScript type checking on affected projects
pnpm lint                            # Run ESLint on affected projects
pnpm lint:fix                        # Fix ESLint issues

# Utility commands
pnpm nx:cache:clear                  # Clear Nx build cache
pnpm ports:kill                      # Kill all development servers
pnpm health                          # System health check
pnpm check:secrets:staged            # Check for secrets in staged files
```

### Running a Single Test
```bash
# Using Vitest for unit tests
pnpm vitest run path/to/test.test.ts

# Using Playwright for E2E tests
pnpm playwright test path/to/test.spec.ts

# Run tests for a specific project
pnpm nx test [project] --testFile=path/to/test.test.ts
```

## Architecture Overview

### Monorepo Structure (Nx-based)
```
standards-dev/
├── apps/
│   └── admin/                      # Next.js admin portal (App Router)
├── portal/                         # Main documentation portal (Docusaurus)
├── standards/                      # Individual standard sites (Docusaurus)
│   ├── ISBDM/                      
│   ├── LRM/                        
│   ├── FRBR/                       
│   ├── isbd/                       
│   ├── muldicat/                   
│   └── unimarc/                    
├── packages/
│   ├── theme/                      # Shared Docusaurus theme & components
│   ├── ui/                         # Shared UI components
│   ├── dev-servers/                # Development server management
│   └── unified-spreadsheet/        # Spreadsheet processing
├── system-design-docs/             # Authoritative system architecture (00-38)
├── e2e/                            # End-to-end tests (Playwright)
└── scripts/                        # Build and utility scripts
```

### Technology Stack
- **Build System**: Nx monorepo (v21.3.11) with pnpm workspace
- **Frontend**: 
  - Docusaurus 3.8.1 for documentation sites
  - Next.js 15.4.4 (App Router) for admin portal
  - React 19.1.1 with TypeScript 5.8.3
- **Testing**: 
  - Vitest for unit tests
  - Playwright for E2E tests
  - Test files co-located with source code
- **Authentication**: Clerk with GitHub OAuth
- **Authorization**: Custom RBAC via Clerk publicMetadata
- **Data Storage**: Git as primary source of truth, Supabase for temporary data
- **Deployment**: GitHub Pages (preview/production)

### Key Architectural Decisions

1. **Git-Centric Data Management**: All vocabulary content and DCTAP profiles are version-controlled in Git. Changes require PR review, ensuring quality and traceability.

2. **Static Site Generation**: Documentation sites use Docusaurus for optimal performance with static generation, while the admin portal uses Next.js App Router for dynamic features.

3. **Shared Theme Package**: The `@ifla/theme` package contains shared Docusaurus components, configurations, and utilities used across all documentation sites.

4. **Environment-Aware Configuration**: The platform supports multiple environments (local, preview, production) with environment-specific URLs and configurations managed through TypeScript config files.

5. **Testing Strategy**: 
   - Unit tests are co-located with source files
   - Integration tests in `test/integration/` directories
   - E2E tests in root `e2e/` directory
   - Tests use tags (@unit, @integration, @critical) for selective execution

### Component Locations

#### Admin Portal (Next.js)
- **Components**: `apps/admin/src/components/`
- **API Routes**: `apps/admin/src/app/api/`
- **Tests**: `apps/admin/src/test/` and `apps/admin/src/tests/`
- **Lib/Services**: `apps/admin/src/lib/`

#### Docusaurus Sites
- **Shared Components**: `packages/theme/src/components/`
- **Site-specific**: `[site]/src/components/`
- **MDX Content**: `[site]/docs/`
- **Tests**: `packages/theme/src/tests/`

### Critical Configuration Files
- **Nx Configuration**: `nx.json` - Project dependencies and build configuration
- **TypeScript**: `tsconfig.json` - Path aliases and compiler options
- **Vitest**: `vitest.config.nx.ts` - Test runner configuration
- **Playwright**: `playwright.config.ts` - E2E test configuration
- **Site Configs**: `packages/theme/src/config/siteConfig.ts` - Multi-site URL management

### Development Workflow

1. **Feature Development**:
   - Create feature branch from `preview`
   - Write tests first (TDD approach)
   - Implement feature
   - Run `pnpm test` for affected tests
   - Run `pnpm lint:fix` to fix linting issues
   - Create PR to `preview` branch

2. **Pre-commit Hooks**:
   - Secrets detection
   - TypeScript checking (affected only)
   - Unit tests (affected only)
   - ESLint (affected only)

3. **Pre-push Hooks**:
   - Comprehensive affected tests
   - Build validation for critical sites

### Common Development Tasks

#### Adding a New Docusaurus Site
```bash
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard"
pnpm tsx scripts/page-template-generator.ts --namespace=newsite
```

#### Working with Vocabularies
```bash
# Create vocabulary sheet
pnpm vocabulary:create

# Compare vocabularies
pnpm compare:vocabulary --markdown

# Generate vocabulary sites
npx tsx scripts/generate-vocabulary-sites.ts --sites new-namespace
```

#### Performance Optimization
```bash
# Optimize Nx configuration
pnpm nx:optimize

# Clear all caches
pnpm nx:cache:clear

# View dependency graph
pnpm nx:graph
```

### Important Notes

1. **Nx Affected Commands**: Most commands use `nx affected` to only run on changed projects, significantly speeding up development.

2. **Environment Variables**: The platform uses TypeScript configuration instead of `.env` files. Configuration is centralized in `packages/theme/src/config/siteConfig.ts`.

3. **Test Exclusions**: Integration tests and server-dependent tests are excluded from pre-commit hooks for speed. They run in CI/CD.

4. **Build Artifacts**: Build outputs go to `build/` for Docusaurus sites and `.next/` for the admin portal. These are git-ignored.

5. **Port Allocation**:
   - Portal: 3000
   - ISBDM: 3001
   - LRM: 3002
   - FRBR: 3003
   - ISBD: 3004
   - MulDiCat: 3005
   - UNIMARC: 3006
   - Admin: 3007

6. **Testing Best Practices**:
   - Always run `pnpm test` before committing
   - Use `pnpm test:comprehensive` before creating PRs
   - For quick iteration, use `pnpm nx test [project] --watch`
- CRITICAL RULE: always ask permission to use --no-verify on commit and push
NEVER, EVER USE --no-verify without explicit approval or pre-instructions
FIXING TEST FAILURES IS MORE IMPORTANT THAN A SUCCESSFUL COMMIT OR PUSH
see @developer_notes/AI_TESTING_INSTRUCTIONS.md and @developer_notes/TESTING_QUICK_REFERENCE.md
- always use internal grep instead of bash grep