# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Table of Contents

1. [Purpose & Audience](#purpose--audience)
2. [Quick-Start Commands](#quick-start-commands)
3. [Repository & Nx Monorepo Structure](#repository--nx-monorepo-structure)
4. [High-Level Architecture Patterns](#high-level-architecture-patterns)
5. [Development Workflows](#development-workflows)
6. [Testing Strategy & Nx Affected Usage](#testing-strategy--nx-affected-usage)
7. [Coding Conventions & Common Pitfalls](#coding-conventions--common-pitfalls)
8. [Troubleshooting & FAQ](#troubleshooting--faq)
9. [Reference Appendix](#reference-appendix)

---

## Purpose & Audience

The **IFLA Standards Platform** is a comprehensive documentation and vocabulary management system for international library standards including ISBD, LRM, FRBR, UNIMARC, and MulDiCat. This platform serves the global library community by providing:

- **Authoritative Documentation Sites**: Static documentation sites for each standard built with Docusaurus
- **Administrative Management Portal**: Next.js-based admin interface for content management and user workflows
- **Vocabulary Management**: Integration with Google Sheets API for bulk vocabulary editing and Git-based version control
- **Multi-Standard Support**: Extensible architecture supporting multiple library standards with shared tooling

### Target Audience for WARP.md

This document is specifically designed for **WARP (warp.dev)** AI assistant to understand:
- Repository structure and development patterns
- Essential commands and workflows
- Architecture decisions and constraints
- Testing strategies and deployment processes
- Common pitfalls and troubleshooting approaches

**Human developers** should refer to the comprehensive documentation in `developer_notes/` and `system-design-docs/` for detailed architectural guidance.

---

## Quick-Start Commands

### Package Manager & Build System
```bash
# MANDATORY: Use pnpm exclusively for package management
pnpm install                    # Install all dependencies
pnpm fresh                     # Clean install (removes node_modules, reinstalls)

# Use Nx commands via pnpm nx for monorepo management
pnpm nx:daemon:start           # Start Nx daemon for faster builds/tests
pnpm nx:daemon:stop            # Stop Nx daemon
```

### Development Servers
```bash
# Start all development servers (recommended)
pnpm dev:servers               # Auto port allocation, all sites + admin
pnpm dev:servers --sites=portal,admin  # Start selected sites only

# Individual development servers
pnpm nx dev admin --turbopack  # Admin portal with Turbopack (port 3007)
pnpm nx dev portal             # Main portal site (port 3000)
pnpm nx dev isbd               # ISBD standard site (port 3004)
```

### Testing Commands
```bash
# Selective testing (recommended for speed)
pnpm test                      # Run tests for affected projects only
pnpm nx affected --target=test # Explicit affected test command

# Comprehensive testing
pnpm test:all                  # Run all tests in monorepo
pnpm test:e2e                  # Run end-to-end Playwright tests
pnpm test:builds:affected      # Test builds for affected sites

# Quality checks
pnpm typecheck                 # TypeScript checks on affected projects
pnpm lint                      # Lint affected projects
```

### Build Commands
```bash
# Production builds
pnpm build:all                 # Build all sites in parallel
pnpm nx build admin            # Build admin portal only
pnpm nx build <site>           # Build specific site (portal, isbd, lrm, etc.)

# Serve built sites
pnpm nx serve admin            # Serve admin portal production build
pnpm nx serve <site>           # Serve specific site production build
```

### Performance & Cache Management
```bash
# Nx optimization
pnpm nx:optimize               # Optimize Nx build and test cache
pnpm nx:cache:clear            # Clear Nx cache
pnpm nx:cache:stats            # Show cache usage statistics

# Port management
pnpm ports:kill                # Kill processes using common dev ports (3000-3008)
```

### Site Management
```bash
# Scaffold new documentation site
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard" --tagline="Description"

# Import/export vocabulary data
pnpm nx run admin:import-vocab  # Import vocabulary from Google Sheets
pnpm nx run admin:export-vocab  # Export vocabulary to various formats
```

---

## Repository & Nx Monorepo Structure

### Nx 21.3.11 Monorepo Layout

This repository uses **Nx 21.3.11** as the build system and task orchestrator for a workspace containing both Next.js and Docusaurus applications. The monorepo structure is organized as follows:

```
standards-dev/
├── apps/
│   └── admin/                 # Next.js 15 Admin Portal (port 3007)
│       ├── src/app/           # App Router structure
│       ├── src/app/api/       # API routes
│       └── src/components/    # Admin-specific components
├── standards/
│   ├── portal/                # Main documentation site (port 3000)
│   ├── isbd/                  # ISBD standard site (port 3004)
│   ├── lrm/                   # LRM standard site (port 3002)
│   ├── frbr/                  # FRBR standard site (port 3003)
│   ├── muldicat/              # MulDiCat standard site (port 3005)
│   └── unimarc/               # UNIMARC standard site (port 3006)
├── packages/
│   ├── theme/                 # Shared Docusaurus theme (@ifla/theme)
│   ├── ui/                    # Shared UI components
│   └── utils/                 # Shared utilities
├── scripts/
│   ├── scaffold-site.ts       # Site generation script
│   ├── test-scripts/          # Testing utilities
│   └── build-tools/           # Build automation
├── e2e/                       # Playwright end-to-end tests
├── docs/                      # Platform documentation
├── developer_notes/           # Developer guides and instructions
└── system-design-docs/        # Architecture documentation
```

### Two-Platform System Overview

#### 1. Admin Portal (`apps/admin/`)
- **Technology**: Next.js 15 with App Router
- **Purpose**: Content management, user workflows, vocabulary editing
- **Authentication**: Clerk with GitHub OAuth
- **Database**: Supabase for operational data
- **UI Framework**: Material-UI (MUI)
- **Port**: 3007

#### 2. Documentation Sites (`standards/*`)
- **Technology**: Docusaurus 3.6.1
- **Purpose**: Static documentation sites for each standard
- **Shared Theme**: `@ifla/theme` package provides consistent styling
- **Content**: Markdown files with Git-based version control
- **Ports**: 3000-3006 (auto-allocated)

### Key Configuration Files

#### Workspace Configuration
- `nx.json` - Nx workspace configuration with task dependencies and caching
- `package.json` - Root package.json with 400+ scripts for all operations
- `tsconfig.json` - TypeScript configuration for the entire monorepo
- `vitest.config.ts` - Testing configuration using Vitest

#### Single Source of Truth
- `packages/theme/src/config/siteConfig.ts` - **Critical**: Environment-aware URLs, ports, and site metadata
- `packages/theme/src/config/navigation.ts` - Shared navigation structure
- `.env.local` - Local environment variables (not tracked)

#### Platform-Specific Configs
- `apps/admin/next.config.mjs` - Next.js configuration
- `standards/*/docusaurus.config.ts` - Individual site configurations
- `playwright.config.ts` - E2E testing configuration

---

## High-Level Architecture Patterns

### Two-Platform System Architecture

The platform uses a **dual-architecture** approach with distinct but complementary systems:

#### Admin Portal (Dynamic Platform)
- **Framework**: Next.js 15 with App Router
- **Authentication**: Clerk with GitHub OAuth integration
- **Database**: Supabase for operational data
- **UI Framework**: Material-UI (MUI) components
- **Deployment**: Render with serverless functions
- **Purpose**: User management, content workflows, vocabulary editing

#### Documentation Sites (Static Platform)
- **Framework**: Docusaurus 3.6.1 with shared theme
- **Content**: Git-based Markdown with version control
- **Styling**: Infima CSS with SASS customizations
- **Deployment**: GitHub Pages with automated builds
- **Purpose**: Public documentation, standards presentation

### Data Flow & Storage Strategy

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Git Repos     │───▶│ GitHub API   │───▶│ Admin Portal    │
│ (Source Truth)  │    │ (Metadata)   │    │ (Workflows)     │
└─────────────────┘    └──────────────┘    └─────────────────┘
         │                      │                     │
         ▼                      ▼                     ▼
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│ Static Sites    │    │ Clerk Auth   │    │ Supabase DB     │
│ (Public Docs)   │    │ (<8KB limit) │    │ (Dynamic Data)  │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

**Distributed Data Strategy**:
- **Git**: Primary source of truth for all content and vocabulary
- **Clerk**: Authentication and minimal user metadata (<8KB limit)
- **Supabase**: Operational data, workflows, and cached computations
- **GitHub API**: Project management, teams, and content authority
- **Google Sheets**: Bulk vocabulary editing interface

### Single Source of Truth: siteConfig.ts

**Critical File**: `packages/theme/src/config/siteConfig.ts`

This TypeScript configuration file serves as the **single source of truth** for:
- Environment-aware URLs and base paths
- Port allocation (3000-3008)
- Site metadata and navigation
- Cross-platform linking and routing
- Development vs production configuration

**Example Usage**:
```typescript
import { siteConfig } from '@ifla/theme/config/siteConfig';

// Environment-aware URL generation
const adminUrl = siteConfig.sites.admin.url; // Adapts to local/preview/production
const portalUrl = siteConfig.sites.portal.url;
```

### Environment Matrix

| Environment | Admin Portal | Documentation Sites | Data Sources |
|-------------|--------------|---------------------|-------------|
| **local** | localhost:3007 | localhost:3000-3006 | Local DBs, Test Clerk |
| **preview** | admin-preview.render.com | GitHub Pages staging | Preview DBs |
| **production** | admin.iflastandards.info | standards.iflastandards.info | Production DBs |

### Progressive Enhancement Strategy

1. **Core Functionality**: All features work without JavaScript
2. **Enhanced UX**: JavaScript adds interactivity and dynamic features
3. **Accessibility**: WCAG 2.1 AA compliance enforced
4. **Performance**: Static generation where possible, dynamic only when necessary
5. **Offline Support**: Service workers for documentation sites

### Security & Authentication Patterns

- **Authentication**: Clerk handles all auth flows with GitHub OAuth
- **Authorization**: Custom RBAC via Clerk user metadata
- **API Security**: Next.js middleware for protected routes
- **Content Security**: Git-based workflow with PR reviews
- **Data Encryption**: TLS in transit, encrypted at rest (Supabase)

---

## Development Workflows

### Git Workflow: Feature → Preview → Main

The platform follows a **Git Flow** strategy optimized for both platforms:

```
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│ feature/new-vocab    │───▶│ preview branch      │───▶│ main branch         │
│ (Development)       │    │ (Staging/Review)    │    │ (Production)        │
└────────────────────┘    └────────────────────┘    └────────────────────┘
         │                            │                            │
         ▼                            ▼                            ▼
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│ localhost:3000-3007 │    │ GitHub Pages        │    │ Production URLs     │
│ (Local Development) │    │ Staging Sites       │    │ iflastandards.info  │
└────────────────────┘    └────────────────────┘    └────────────────────┘
```

#### Typical Development Cycle
```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/vocabulary-updates

# 2. Develop with affected testing
pnpm test                      # Run affected tests during development
pnpm nx dev admin              # Test admin portal changes
pnpm nx dev portal             # Test documentation changes

# 3. Commit with automated hooks
git add .
git commit -m "feat: add new ISBD vocabulary terms"
# Pre-commit hooks automatically run: lint, typecheck, affected tests

# 4. Push to preview branch for staging
git push origin feature/vocabulary-updates
# Create PR to preview branch for staging deployment

# 5. After review, merge to main for production
# PR from preview → main triggers production deployment
```

### Pre-Commit & Pre-Push Hooks (Husky)

The repository uses **Husky** to enforce quality gates:

#### Pre-Commit Hook
```bash
# Automatically runs before each commit
#!/bin/sh
pnpm lint-staged               # Lint and format only staged files
pnpm nx affected --target=test # Run tests for affected projects
pnpm typecheck                 # TypeScript validation
```

#### Pre-Push Hook
```bash
# Automatically runs before each push
#!/bin/sh
pnpm test:builds:affected      # Ensure affected projects build successfully
pnpm nx affected --target=e2e  # Run E2E tests for affected projects
```

#### Bypassing Hooks (Emergency Only)
```bash
# Skip pre-commit hooks (not recommended)
git commit --no-verify -m "emergency fix"

# Skip pre-push hooks (not recommended)
git push --no-verify origin feature-branch
```

### Branch Protection & PR Requirements

#### Main Branch Protection
- **Required PR reviews**: Minimum 1 approving review
- **Required status checks**: All CI tests must pass
- **Up-to-date branches**: Must be current with main
- **No direct pushes**: All changes via PR only

#### Preview Branch Protection
- **Auto-deployment**: Preview environments on every push
- **Integration testing**: Full E2E test suite
- **Staging validation**: Manual QA review required

### 8-Phase Standards Development Lifecycle

The platform supports a comprehensive standards development process:

#### Phase 1: Research & Proposal
- **Location**: `docs/standards-development/`
- **Artifacts**: Research documents, proposal drafts
- **Tools**: Markdown files, collaborative editing

#### Phase 2: Draft Development
- **Location**: `standards/{standard}/docs/draft/`
- **Artifacts**: Working drafts, version-controlled content
- **Tools**: Git-based workflow, branch-per-version

#### Phase 3: Community Review
- **Location**: GitHub Issues and Discussions
- **Artifacts**: Review comments, change requests
- **Tools**: GitHub's collaborative features

#### Phase 4: Vocabulary Development
- **Location**: Google Sheets integration
- **Artifacts**: Controlled vocabularies, term definitions
- **Tools**: Admin portal vocabulary management

#### Phase 5: Technical Validation
- **Location**: `e2e/` tests, validation scripts
- **Artifacts**: Test suites, validation reports
- **Tools**: Automated testing pipeline

#### Phase 6: Publication Preparation
- **Location**: `standards/{standard}/docs/`
- **Artifacts**: Final documentation, formatted outputs
- **Tools**: Docusaurus build system

#### Phase 7: Official Publication
- **Location**: Production documentation sites
- **Artifacts**: Published standards, official URLs
- **Tools**: GitHub Pages deployment

#### Phase 8: Maintenance & Updates
- **Location**: Ongoing repository management
- **Artifacts**: Errata, clarifications, minor updates
- **Tools**: Issue tracking, version control

### Deployment Pipeline

#### Documentation Sites (GitHub Pages)
```yaml
# .github/workflows/deploy-docs.yml
name: Deploy Documentation Sites

on:
  push:
    branches: [main, preview]
    paths: ['standards/**', 'packages/theme/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      
      # Build affected documentation sites
      - run: pnpm install
      - run: pnpm nx affected --target=build --base=origin/main
      
      # Deploy to GitHub Pages
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Admin Portal (Render)
- **Preview Deployments**: Automatic on preview branch pushes
- **Production Deployments**: Automatic on main branch pushes
- **Environment Variables**: Managed via Render dashboard
- **Database Migrations**: Automated via Supabase

### Environment-Specific Workflows

#### Local Development
```bash
# Complete local setup
pnpm install                   # Install dependencies
pnpm nx:daemon:start          # Start Nx daemon
pnpm dev:servers              # Start all development servers

# Development cycle
pnpm test                     # Run affected tests
git add . && git commit       # Commit with hooks
pnpm nx affected --target=build # Verify builds work
```

#### Admin Portal Development Workflow
```bash
# 1. Set up mock-first development
echo "NEXT_PUBLIC_USE_MOCK=true" >> .env.local
echo "NEXT_PUBLIC_DOCS_ENV=local" >> .env.local

# 2. Start admin portal with Turbopack
pnpm nx dev admin --turbopack

# 3. Develop with real-time feedback
pnpm test --watch             # Watch mode for affected tests
# Make changes to components, schemas, or adapters
# MSW automatically intercepts API calls

# 4. Switch to live data when ready
echo "NEXT_PUBLIC_USE_MOCK=false" >> .env.local
# Add actual service credentials to .env.local
# Test with live Supabase and Clerk integration

# 5. Vocabulary management workflow
pnpm nx run admin:import-vocab # Import from Google Sheets
pnpm nx run admin:export-vocab # Export to various formats
```

#### Documentation Sites Development Workflow
```bash
# 1. Start specific documentation site
pnpm nx dev portal             # Main documentation site
pnpm nx dev isbd               # Specific standard site

# 2. Content development cycle
# Edit markdown files in standards/{site}/docs/
# Changes hot-reload automatically

# 3. Theme customization
# Edit packages/theme/src/ for shared components
# Changes affect all documentation sites

# 4. Test cross-site navigation
pnpm dev:servers              # Start all sites to test navigation
```

#### Staging (Preview Branch)
- **Auto-deployment**: Every push to preview branch
- **Integration testing**: Full E2E suite against staging
- **Manual validation**: QA team review
- **Performance testing**: Lighthouse CI audits

#### Production (Main Branch)
- **Protected deployment**: Only after preview validation
- **Zero-downtime**: Rolling deployments
- **Monitoring**: Automated health checks
- **Rollback capability**: Quick revert to previous version

### Release Management

#### Semantic Versioning
- **Major**: Breaking changes to platform or standards
- **Minor**: New features, new standards, significant updates
- **Patch**: Bug fixes, documentation updates, minor changes

#### Release Process
```bash
# 1. Prepare release branch
git checkout -b release/v2.1.0

# 2. Update version numbers and changelog
npm version minor  # Updates package.json
# Edit CHANGELOG.md with release notes

# 3. Final testing
pnpm test:all
pnpm test:e2e
pnpm build:all

# 4. Create release PR
git commit -am "chore: release v2.1.0"
git push origin release/v2.1.0
# Create PR to main branch

# 5. Post-merge: Create GitHub release
# Tag created automatically triggers production deployment
```

### Continuous Integration Matrix

#### GitHub Actions Workflow
- **Node.js versions**: 18.x, 20.x (current LTS)
- **Operating systems**: ubuntu-latest, macos-latest
- **Test matrix**: Unit, integration, E2E, accessibility
- **Build validation**: All platforms and configurations

#### Quality Gates
1. **Linting**: ESLint + Prettier compliance
2. **Type checking**: Strict TypeScript validation
3. **Unit tests**: Vitest with coverage thresholds
4. **Integration tests**: Component and API testing
5. **E2E tests**: Critical user workflows
6. **Build verification**: All sites build successfully
7. **Performance**: Bundle size and Lighthouse audits
8. **Accessibility**: WCAG 2.1 AA compliance

### Emergency Procedures

#### Hotfix Workflow
```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-auth-fix

# 2. Implement fix with minimal changes
# Make only the essential changes

# 3. Fast-track testing
pnpm nx affected --target=test
pnpm test:e2e --grep="auth"

# 4. Emergency deployment
git commit -m "fix: resolve critical auth issue"
git push origin hotfix/critical-auth-fix
# Create PR directly to main with emergency label

# 5. Post-deployment verification
# Monitor production metrics
# Backport fix to preview branch
```

#### Rollback Procedures
- **Documentation Sites**: Revert commit and re-deploy via GitHub Pages
- **Admin Portal**: Use Render's instant rollback to previous deployment
- **Database**: Supabase automatic backups with point-in-time recovery
- **DNS/CDN**: CloudFlare rollback to previous configuration

---

## Testing Strategy & Nx Affected Usage

### 5-Phase Testing Strategy

The platform uses a **layered testing approach** optimized for speed and comprehensive coverage:

#### Phase 1: Selective Testing (Development)
```bash
# ALWAYS use affected commands during development for speed
pnpm test                      # Tests only affected projects
pnpm nx affected --target=test # Explicit affected test command
pnpm typecheck                 # TypeScript checks on affected projects
pnpm lint                      # Lint affected projects only
```

#### Phase 2: Comprehensive Testing (Pre-Integration)
```bash
# Full test suite before major integrations
pnpm test:all                  # All tests in monorepo
pnpm test:builds:affected      # Test builds for affected sites
pnpm test:e2e                  # End-to-end Playwright tests
```

#### Phase 3: Pre-Commit Hooks (Automated)
- **Husky** enforces quality gates before commits
- Runs lint, typecheck, and affected tests automatically
- Prevents commits with failing tests or lint errors
- Uses Nx affected to minimize execution time

#### Phase 4: Pre-Push Hooks (Comprehensive)
- Broader test suite including integration tests
- Build validation for affected projects
- Security checks and dependency audits

#### Phase 5: CI Pipeline (GitHub Actions)
- Full test matrix across Node.js versions
- Cross-platform testing (Linux, macOS, Windows)
- E2E tests against deployed preview environments
- Performance regression testing

### Nx Affected Commands for Performance

**CRITICAL**: Always use Nx affected commands to optimize testing performance:

```bash
# Core affected commands
pnpm nx affected --target=test    # Test only changed projects
pnpm nx affected --target=build   # Build only changed projects
pnpm nx affected --target=lint    # Lint only changed projects
pnpm nx affected --target=e2e     # E2E tests for changed projects

# Advanced affected usage
pnpm nx affected --parallel=3     # Run affected tasks in parallel
pnpm nx affected --base=main      # Compare against main branch
pnpm nx affected --head=HEAD      # Use current HEAD as comparison

# Dependency graph analysis
pnpm nx graph --affected          # Visualize affected project dependencies
```

**Why Nx Affected is Critical**:
- **Speed**: Only tests projects impacted by changes
- **Accuracy**: Uses dependency graph to determine true impact
- **Cache**: Leverages Nx cache for previously tested code
- **CI Efficiency**: Dramatically reduces CI/CD execution time

### Test Organization & Placement

#### Unit Tests (Vitest)
- **Location**: Co-located with source files (`*.test.ts`, `*.spec.ts`)
- **Naming**: `ComponentName.test.tsx`, `utils.spec.ts`
- **Scope**: Individual functions, components, utilities

```bash
# Example structure
packages/theme/src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx        # Co-located unit test
├── utils/
│   ├── helpers.ts
│   └── helpers.spec.ts        # Co-located utility test
```

#### Integration Tests
- **Location**: `tests/integration/` in each project
- **Scope**: Component interactions, API integration
- **Framework**: Vitest with testing-library

#### End-to-End Tests (Playwright)
- **Location**: `e2e/` directory at repository root
- **Organization**: Site-oriented test files
- **Scope**: User workflows across both platforms

```bash
e2e/
├── admin-portal/
│   ├── auth.spec.ts           # Admin authentication flows
│   ├── vocabulary.spec.ts     # Vocabulary management
│   └── users.spec.ts          # User management
└── documentation-sites/
    ├── navigation.spec.ts     # Cross-site navigation
    ├── search.spec.ts         # Site search functionality
    └── accessibility.spec.ts  # A11y compliance
```

### Mock Service Worker (MSW) Testing

#### Admin Portal Mock Setup
```typescript
// apps/admin/src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { Job } from '@/schemas/Job.zod';

// In-memory state simulation
const jobStates = new Map<string, Job>();

export const handlers = [
  http.post('/api/jobs', async ({ request }) => {
    const body = await request.json();
    const job: Job = {
      id: crypto.randomUUID(),
      type: body.type,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    jobStates.set(job.id, job);
    return HttpResponse.json(job);
  }),
  
  http.get('/api/jobs/:id', ({ params }) => {
    const job = jobStates.get(params.id as string);
    return job ? HttpResponse.json(job) : new HttpResponse(null, { status: 404 });
  }),
];
```

#### MSW Test Integration
```typescript
// apps/admin/__tests__/jobs.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '@/mocks/server';
import JobsListPage from '@/app/jobs/page';
import { RefineTestWrapper } from '@/test-utils';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Jobs List Page', () => {
  it('should display jobs with status indicators', async () => {
    render(
      <RefineTestWrapper>
        <JobsListPage />
      </RefineTestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText('queued')).toBeInTheDocument();
    });
  });
});
```

### Authentication Testing with Clerk

#### Test User Accounts
- **Development**: Dedicated test users in Clerk development instance
- **Staging**: Separate test users for preview environment
- **Production**: No direct testing; monitored via synthetic tests

#### Auth Test Patterns
```javascript
// Example E2E auth test structure
test.describe('Admin Portal Authentication', () => {
  test('should authenticate via GitHub OAuth', async ({ page }) => {
    // Use test-specific Clerk configuration
    await page.goto('/admin/login');
    // Test auth flow with designated test user
  });
  
  test('should enforce RBAC permissions', async ({ page }) => {
    // Test role-based access control
  });
});
```

### E2E Site-Oriented Testing

#### Cross-Platform Workflows
- **User Journey**: Documentation site → Admin portal authentication
- **Content Flow**: Admin edits → Static site regeneration
- **Navigation**: Cross-site links and routing

#### Performance Testing
- **Lighthouse CI**: Automated performance audits
- **Bundle Analysis**: Size regression detection
- **Load Testing**: Stress testing with realistic traffic patterns

#### Accessibility Testing
- **Automated A11y**: axe-core integration in Playwright
- **Screen Reader**: NVDA/JAWS compatibility testing
- **Keyboard Navigation**: Tab order and focus management

### Test Execution Best Practices

1. **Local Development**: Always use affected commands
2. **PR Validation**: Run comprehensive tests before merging
3. **CI Optimization**: Leverage Nx Cloud for distributed execution
4. **Flaky Tests**: Immediate investigation and fixing
5. **Test Data**: Isolated test environments with clean state

---

## Coding Conventions & Development Patterns

### Mandatory Rules (All Platforms)

#### 1. Package Manager
```bash
# ✅ CORRECT: Use pnpm exclusively
pnpm install
pnpm add @types/node
pnpm run build

# ❌ NEVER: Do not use npm or yarn
# npm install  # This will break the workspace
# yarn add     # This will cause dependency conflicts
```

#### 2. Module System
```typescript
// ✅ CORRECT: ES modules only
import { Component } from 'react';
export const MyComponent = () => {};
export default MyComponent;

// ❌ NEVER: CommonJS modules
// const { Component } = require('react');  // Will cause build errors
// module.exports = MyComponent;           // Not compatible with build system
```

#### 3. TypeScript Strictness
```typescript
// ✅ CORRECT: Strict typing, no 'any'
interface UserData {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
}

const processUser = (user: UserData): void => {
  // Implementation with proper types
};

// ❌ NEVER: Using 'any' or loose typing
// const processUser = (user: any) => {}     // Breaks type safety
// const data = getData() as any;            // Defeats TypeScript purpose
```

### Admin Portal Development Patterns (Next.js + Refine + MUI)

#### Type-Safety First with Zod Validation
```typescript
// ✅ CORRECT: Data validated at every boundary
import { JobSchema } from '@/schemas/Job.zod';

const processJob = (rawData: unknown) => {
  const job = JobSchema.parse(rawData); // Runtime validation
  return job; // Fully typed after validation
};

// ❌ NEVER: Using 'any' types
// const processJob = (data: any) => data;

// Schema definition example
import { z } from 'zod';

export const JobSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['vocabulary_import', 'export_rdf', 'validate_terms']),
  status: z.enum(['queued', 'running', 'success', 'failed']),
  progress: z.number().min(0).max(100),
  createdAt: z.string().datetime(),
});

export type Job = z.infer<typeof JobSchema>;
```

#### Mock-First Development Pattern
```typescript
// Environment-based provider switching
// apps/admin/src/providers/dataProvider.ts
import { DataProvider } from "@refinedev/core";
import { mockDataProvider } from "./mockDataProvider";
import { liveDataProvider } from "./liveDataProvider";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
export const dataProvider: DataProvider = useMock ? mockDataProvider : liveDataProvider;
```

#### Refine.dev Provider Pattern
```typescript
// ✅ CORRECT: Use dataProvider for all data operations
const { data, isLoading } = useShow({
  resource: "jobs",
  id: jobId,
  // Real-time polling for job status
  queryOptions: {
    refetchInterval: (data) => {
      const status = data?.data?.status;
      return status === 'success' || status === 'failed' ? false : 1500;
    },
  },
});

// ❌ NEVER: Direct API calls in components
// const response = await fetch('/api/jobs/' + jobId);
```

#### MUI Component Patterns
```typescript
// ✅ CORRECT: MUI with Refine integration
import { List, useDataGrid } from "@refinedev/mui";
import { DataGrid, GridColDef, Chip } from "@mui/x-data-grid";
import { Create, useForm } from "@refinedev/mui";
import { zodResolver } from "@hookform/resolvers/zod";

// List page with status indicators
export default function JobsListPage() {
  const { dataGridProps } = useDataGrid({ resource: "jobs" });
  
  const columns: GridColDef[] = [
    {
      field: "status",
      renderCell: ({ value }) => (
        <Chip 
          label={value} 
          color={value === 'success' ? 'success' : value === 'failed' ? 'error' : 'default'}
        />
      ),
    },
  ];
  
  return (
    <List>
      <DataGrid {...dataGridProps} columns={columns} autoHeight />
    </List>
  );
}

// Form with Zod validation
export default function JobCreatePage() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(JobCreateSchema),
  });
  
  return (
    <Create>
      <TextField
        {...register("type")}
        error={!!errors.type}
        helperText={errors.type?.message}
      />
    </Create>
  );
}

// ❌ AVOID: Mixing UI frameworks or direct API calls
// import './custom.css';                    // Use MUI theming
// const data = await fetch('/api/jobs');    // Use Refine hooks
```

#### Service Adapter Pattern with Validation
```typescript
// apps/admin/src/providers/adapters/supabaseJobs.adapter.ts
import { supabase } from '@/lib/supabase';
import { JobSchema, Job } from '@/schemas/Job.zod';

export class SupabaseJobsAdapter {
  async getJob(id: string): Promise<Job> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw new Error(`Failed to fetch job: ${error.message}`);
    
    // ✅ CRITICAL: Always validate with Zod before returning
    return JobSchema.parse(data);
  }
}
```

### Documentation Sites Development Patterns (Docusaurus + Infima)

#### Component Patterns
```typescript
// ✅ CORRECT: Docusaurus component patterns
import React from 'react';
import clsx from 'clsx';
import styles from './Component.module.css';  // CSS Modules

const DocsComponent: React.FC<{ className?: string }> = ({ 
  className,
  children 
}) => {
  return (
    <div className={clsx(styles.container, className)}>
      {children}
    </div>
  );
};

// ❌ AVOID: Inline styles or non-Infima patterns
// style={{ color: 'red' }}                 // Use CSS custom properties
// import styled from '@emotion/styled';     // Not compatible with Docusaurus
```

#### Markdown/MDX Patterns
```markdown
---
title: "Standard Name"
sidebar_position: 1
tags: [vocabulary, rdf, library-science]
---

# Standard Title

import { StandardOverview } from '@site/src/components/StandardOverview';

<StandardOverview 
  standard="ISBD" 
  version="2023" 
  status="published" 
/>

## Content sections...
```

#### Theme Customization
```typescript
// packages/theme/src/theme/prism-include-languages.js
// Add syntax highlighting for library-specific formats
module.exports = function (Prism) {
  // Add MARC syntax highlighting
  Prism.languages.marc = {
    'tag': /\b\d{3}\b/,
    'indicator': /\$[a-z0-9]/,
    'subfield': /\$[a-z]/,
  };
};
```

### Environment Configuration Patterns

#### Admin Portal Environment Setup
```env
# .env.local (development with mocks)
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_DOCS_ENV=local

# .env.development (development with live services)
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_DOCS_ENV=local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### Environment-Aware Configuration
```typescript
// Use siteConfig for environment detection
import { siteConfig } from '@ifla/theme/config/siteConfig';

// Environment is automatically detected from:
// - DOCS_ENV: 'local' | 'preview' | 'production'
// - NODE_ENV: 'development' | 'production'

const isLocal = siteConfig.environment === 'local';
const isProduction = siteConfig.environment === 'production';
const adminUrl = siteConfig.sites.admin.url;  // Environment-aware
```

### BasePath Handling (Critical)

#### ✅ CORRECT: Use Path Utilities
```typescript
// Admin Portal - NO basePath hardcoding
import { siteConfig } from '@ifla/theme/config/siteConfig';
import { addBasePath } from '@ifla/theme/utils/paths';

// API calls
const response = await fetch('/api/users');           // ✅ Standard Next.js patterns
const response = await fetch('/admin/api/users');     // ❌ NEVER hardcode basePath

// Asset URLs
const logoUrl = addBasePath('/images/logo.png');      // ✅ Use utility function
const logoUrl = '/admin/images/logo.png';             // ❌ NEVER hardcode basePath

// Navigation
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');                            // ✅ Next.js handles basePath
router.push('/admin/dashboard');                      // ❌ NEVER hardcode basePath
```

#### ✅ CORRECT: Cross-Platform Linking
```typescript
// Use siteConfig for cross-platform URLs
import { siteConfig } from '@ifla/theme/config/siteConfig';

const adminUrl = siteConfig.sites.admin.url;          // ✅ Environment-aware
const portalUrl = siteConfig.sites.portal.url;       // ✅ Environment-aware

// Link between platforms
<a href={`${adminUrl}/dashboard`}>Admin Dashboard</a> // ✅ Dynamic URLs
<a href="/admin/dashboard">Admin</a>                  // ❌ Hardcoded paths
```

### Import/Export Conventions

#### File Organization
```typescript
// ✅ CORRECT: Import order and organization
// 1. Node modules
import React from 'react';
import { NextApiRequest, NextApiResponse } from 'next';

// 2. Internal packages (workspace)
import { siteConfig } from '@ifla/theme/config/siteConfig';
import { Button } from '@ifla/ui/components';

// 3. Relative imports
import { localHelper } from '../utils/helpers';
import styles from './Component.module.css';

// ❌ AVOID: Mixed import order
// import './styles.css';
// import React from 'react';
// import { helper } from '@ifla/theme';
```

#### Export Patterns
```typescript
// ✅ CORRECT: Consistent export patterns
// Named exports for utilities
export const validateEmail = (email: string): boolean => {};
export const formatDate = (date: Date): string => {};

// Default export for components
const UserProfile: React.FC<Props> = ({ user }) => {};
export default UserProfile;

// ❌ AVOID: Mixed export styles in same file
// export default validateEmail;             // Utility should be named export
// export { UserProfile };                   // Component should be default
```

### Common Mistakes & How to Avoid Them

#### 1. Port Conflicts
```bash
# ❌ Problem: "Port 3000 already in use"

# ✅ Solution: Use port management
pnpm ports:kill                               # Kill conflicting processes
pnpm dev:servers                              # Use coordinated port allocation
```

#### 2. Nx Cache Issues
```bash
# ❌ Problem: Stale builds or test results

# ✅ Solution: Cache management
pnpm nx:cache:clear                           # Clear Nx cache
pnpm nx affected --target=build --skip-nx-cache  # Skip cache for debugging
```

#### 3. TypeScript Configuration Errors
```typescript
// ❌ Problem: "Cannot find module" errors
// Usually caused by incorrect path mapping

// ✅ Solution: Use correct import paths from workspace root
import { siteConfig } from '@ifla/theme/config/siteConfig';  // ✅ Workspace reference
import { siteConfig } from '../../../packages/theme/...';    // ❌ Relative across workspace
```

#### 4. Environment Variable Issues
```typescript
// ❌ Problem: Undefined environment variables
const apiKey = process.env.API_KEY;                          // Might be undefined

// ✅ Solution: Proper environment handling
const apiKey = process.env.API_KEY ?? '';                    // Fallback
const isProduction = process.env.NODE_ENV === 'production';  // Explicit check

// ✅ Better: Use environment-aware config
import { siteConfig } from '@ifla/theme/config/siteConfig';
const apiUrl = siteConfig.api.baseUrl;                       // Environment-aware
```

#### 5. Authentication Context Errors (Admin Portal)
```typescript
// ❌ Problem: Accessing auth outside provider
const { user } = useUser();  // Error if outside ClerkProvider

// ✅ Solution: Proper auth checks
const { user, isLoaded } = useUser();
if (!isLoaded) return <Loading />;
if (!user) return <SignIn />;

// ✅ Better: Use auth middleware
// Admin portal routes automatically protected by middleware

// Refine auth provider integration
const authProvider: AuthProvider = {
  login: async () => {
    // Clerk handles OAuth flow
    return { success: true };
  },
  check: async () => {
    const { isSignedIn } = useAuth();
    return { authenticated: !!isSignedIn };
  },
};
```

#### 6. Mock/Live Data Switching Issues
```typescript
// ❌ Problem: Hard-coded API endpoints
const response = await fetch('http://localhost:3001/api/jobs');

// ✅ Solution: Environment-based switching
// MSW automatically intercepts when NEXT_PUBLIC_USE_MOCK=true
const { data } = useList({ resource: 'jobs' }); // Refine handles the switching

// ✅ Service adapter pattern
class JobsService {
  async getJobs(): Promise<Job[]> {
    // This will be mocked by MSW in development
    const response = await fetch('/api/jobs');
    return JobSchema.array().parse(await response.json());
  }
}
```

#### 7. Build Failures
```bash
# ❌ Problem: "Module not found" during build

# ✅ Solution: Check import paths and dependencies
pnpm nx graph                                 # Visualize dependencies
pnpm nx affected --target=build --verbose    # Verbose build output

# Common causes:
# - Missing package dependencies
# - Incorrect relative imports
# - TypeScript configuration issues
# - Missing environment variables

# Admin portal specific issues:
# - MSW not properly configured for build
# - Refine dependencies missing
# - Clerk environment variables not set
```

### Development Best Practices

#### Universal Best Practices
1. **Always use affected commands** for faster feedback loops
2. **Run pre-commit hooks locally** before pushing
3. **Use TypeScript strict mode** - it catches issues early
4. **Follow the single source of truth pattern** - use siteConfig.ts
5. **Validate accessibility** - use automated and manual testing
6. **Monitor bundle sizes** - use Nx build analysis tools
7. **Document breaking changes** in PR descriptions

#### Admin Portal Specific
1. **Always use Refine hooks** (`useShow`, `useList`, `useCreate`) instead of direct API calls
2. **Validate all data** with Zod schemas at service boundaries
3. **Handle all UI states**: loading (skeletons), error (alerts), empty (placeholders)
4. **Use MUI consistently** - don't mix UI frameworks
5. **Environment-based switching** for mock vs live data
6. **Real-time updates** for job status monitoring
7. **Test authentication flows** with dedicated test users
8. **Type-safe routing** with Next.js App Router patterns

#### Documentation Sites Specific
1. **Use CSS Modules** for component styling
2. **Follow Infima design tokens** for consistent theming
3. **Optimize images** and use proper alt text
4. **Test markdown rendering** across different content types
5. **Validate internal links** and cross-references
6. **Use semantic HTML** in custom components
7. **Test mobile responsiveness** for all custom components

### Code Quality Enforcement

- **ESLint**: Enforces coding standards and catches common errors
- **Prettier**: Consistent code formatting across the monorepo
- **TypeScript**: Strict type checking prevents runtime errors
- **Husky**: Git hooks prevent committing broken code
- **Nx**: Dependency graph analysis prevents circular dependencies

---

## Troubleshooting & FAQ

### Common Errors & Solutions

#### "Port already in use" (EADDRINUSE)
```bash
# Problem: Development server won't start due to port conflicts
Error: listen EADDRINUSE: address already in use :::3000

# Solutions:
# 1. Kill processes using development ports
pnpm ports:kill

# 2. Use automatic port allocation
pnpm dev:servers  # Handles port conflicts automatically

# 3. Find and kill specific processes
lsof -ti:3000 | xargs kill -9
```

#### "Module not found" Errors
```bash
# Problem: TypeScript can't resolve workspace packages
Error: Cannot find module '@ifla/theme/config/siteConfig'

# Solutions:
# 1. Rebuild workspace dependencies
pnpm install
pnpm nx reset  # Clear Nx cache

# 2. Check import paths (use workspace references, not relative paths)
# ✅ Correct: import { siteConfig } from '@ifla/theme/config/siteConfig';
# ❌ Wrong:   import { siteConfig } from '../../../packages/theme/...'

# 3. Verify tsconfig path mappings are correct
```

#### Nx Cache Issues
```bash
# Problem: Stale cache causing incorrect build/test results
# Symptoms: Tests pass locally but fail in CI, or builds seem outdated

# Solutions:
# 1. Clear all Nx cache
pnpm nx:cache:clear

# 2. Reset Nx workspace
pnpm nx reset

# 3. Skip cache for debugging
pnpm nx affected --target=test --skip-nx-cache

# 4. Check cache statistics
pnpm nx:cache:stats
```

#### Authentication Errors (Clerk)
```typescript
// Problem: "useUser must be used within ClerkProvider"
// Usually in admin portal development

// Solution: Ensure proper Clerk setup in layout.tsx
// apps/admin/src/app/layout.tsx should have:
<ClerkProvider>
  <html>
    <body>{children}</body>
  </html>
</ClerkProvider>

// Problem: User appears authenticated but API calls fail
// Check middleware configuration in apps/admin/middleware.ts
```

#### Build Failures
```bash
# Problem: Next.js build fails with "Module build failed"

# Solutions:
# 1. Clear Next.js cache
rm -rf apps/admin/.next
pnpm nx build admin

# 2. Check for circular dependencies
pnpm nx graph  # Visualize dependency graph

# 3. Verify environment variables
# Check .env.local exists and has required variables

# 4. Type check before building
pnpm typecheck
```

#### Docusaurus Site Issues
```bash
# Problem: Docusaurus dev server won't start or shows errors

# Solutions:
# 1. Clear Docusaurus cache
rm -rf standards/*/build
rm -rf standards/*/.docusaurus

# 2. Check theme package dependency
pnpm nx graph theme  # Verify theme package builds correctly

# 3. Validate markdown content
# Check for malformed frontmatter or broken MDX syntax
```

### Performance Issues

#### Slow Build Times
```bash
# Solutions:
# 1. Use Nx daemon for faster subsequent builds
pnpm nx:daemon:start

# 2. Leverage affected commands
pnpm nx affected --target=build  # Only build changed projects

# 3. Parallel execution
pnpm nx affected --target=build --parallel=3

# 4. Check for unnecessary rebuilds
pnpm nx:cache:stats  # Verify cache hit rates
```

#### Memory Issues
```bash
# Problem: Node.js out of memory errors during builds
JavaScript heap out of memory

# Solutions:
# 1. Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# 2. Build projects individually
pnpm nx build admin
pnpm nx build portal
# Instead of: pnpm build:all
```

### Development Workflow Issues

#### Git Hooks Failing
```bash
# Problem: Pre-commit hooks prevent commits

# Quick fix (not recommended for regular use):
git commit --no-verify -m "message"

# Better solution: Fix the underlying issues
pnpm lint --fix        # Auto-fix linting issues
pnpm typecheck         # Address TypeScript errors
pnpm test               # Fix failing tests
```

#### Environment Variable Issues
```bash
# Problem: Environment variables not loading

# Solutions:
# 1. Check file exists and is named correctly
ls -la .env.local

# 2. Restart development servers after changing .env
pnpm dev:servers

# 3. Use siteConfig instead of direct env vars
import { siteConfig } from '@ifla/theme/config/siteConfig';
// Instead of: process.env.NEXT_PUBLIC_SITE_URL
```

---

## Reference Appendix

### Port Allocation Table

| Service | Port | URL | Purpose |
|---------|------|-----|----------|
| Main Portal | 3000 | http://localhost:3000 | Primary documentation site |
| LRM Standard | 3002 | http://localhost:3002 | LRM standard documentation |
| FRBR Standard | 3003 | http://localhost:3003 | FRBR standard documentation |
| ISBD Standard | 3004 | http://localhost:3004 | ISBD standard documentation |
| MulDiCat Standard | 3005 | http://localhost:3005 | MulDiCat standard documentation |
| UNIMARC Standard | 3006 | http://localhost:3006 | UNIMARC standard documentation |
| Admin Portal | 3007 | http://localhost:3007 | Administrative interface |
| Reserved | 3008 | - | Future expansion |

### Essential Commands Cheat Sheet

```bash
# Package Management
pnpm install                    # Install dependencies
pnpm fresh                     # Clean install

# Development
pnpm dev:servers               # Start all development servers
pnpm nx dev admin --turbopack  # Admin portal with Turbopack
pnpm nx dev portal             # Main documentation site

# Testing (Always use affected for speed)
pnpm test                      # Test affected projects
pnpm test:all                  # Test entire monorepo
pnpm test:e2e                  # End-to-end tests
pnpm typecheck                 # TypeScript checks
pnpm lint                      # Lint affected projects

# Building
pnpm build:all                 # Build all sites in parallel
pnpm nx build admin            # Build admin portal
pnpm nx build <site>           # Build specific site

# Performance & Debugging
pnpm nx:optimize               # Optimize Nx cache
pnpm nx:cache:clear            # Clear all caches
pnpm ports:kill                # Kill port conflicts
pnpm nx graph                  # Visualize project dependencies

# Site Management
pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="Title"
```

### Environment Variables Reference

#### Required for Local Development
```bash
# .env.local (create in repository root)
NODE_ENV=development
DOCS_ENV=local

# Clerk Authentication (Admin Portal)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/admin/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/admin/sign-up

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional: Google Sheets Integration
GOOGLE_SHEETS_API_KEY=AIza...
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
```

#### Environment Detection
```typescript
// Use siteConfig for environment-aware configuration
import { siteConfig } from '@ifla/theme/config/siteConfig';

// Environment is automatically detected from:
// - DOCS_ENV: 'local' | 'preview' | 'production'
// - NODE_ENV: 'development' | 'production'

const isLocal = siteConfig.environment === 'local';
const isProduction = siteConfig.environment === 'production';
```

### Links to Deeper Documentation

#### Platform Documentation
- **Developer Guides**: `developer_notes/` directory
  - `AI_TESTING_INSTRUCTIONS.md` - Testing guidelines
  - `AUTHENTICATION_STRATEGY.md` - Clerk implementation
  - `IMPORT_EXPORT_PROCESS.md` - Data management workflows

#### Architecture Documentation
- **System Design**: `system-design-docs/` directory
  - `EXECUTIVE_SUMMARY.md` - High-level platform overview
  - `SYSTEM_ARCHITECTURE_OVERVIEW.md` - Technical architecture
  - `SITE_CONFIGURATION_GUIDE.md` - Configuration management

#### Configuration Files
- **Single Source of Truth**: `packages/theme/src/config/siteConfig.ts`
- **Nx Configuration**: `nx.json`
- **TypeScript**: `tsconfig.json`
- **Testing**: `vitest.config.ts`, `playwright.config.ts`

#### External Resources
- **Nx Documentation**: https://nx.dev/
- **Next.js Documentation**: https://nextjs.org/docs
- **Docusaurus Documentation**: https://docusaurus.io/docs
- **Clerk Authentication**: https://clerk.com/docs
- **Material-UI**: https://mui.com/material-ui/

### Project Repository Structure Quick Reference

```
📁 standards-dev/
├── 📁 apps/admin/           # Next.js Admin Portal
├── 📁 standards/            # Docusaurus Documentation Sites
│   ├── 📁 portal/          # Main site (3000)
│   ├── 📁 isbd/            # ISBD (3004)
│   ├── 📁 lrm/             # LRM (3002) 
│   ├── 📁 frbr/            # FRBR (3003)
│   ├── 📁 muldicat/        # MulDiCat (3005)
│   └── 📁 unimarc/         # UNIMARC (3006)
├── 📁 packages/
│   ├── 📁 theme/           # Shared Docusaurus theme
│   ├── 📁 ui/              # Shared UI components
│   └── 📁 utils/           # Shared utilities
├── 📁 scripts/             # Build and management scripts
├── 📁 e2e/                 # Playwright E2E tests
├── 📁 docs/                # Platform documentation
├── 📁 developer_notes/     # Developer guides
└── 📁 system-design-docs/  # Architecture documentation
```

### Support & Contact

For platform-specific issues:
1. **Check this WARP.md** for common solutions
2. **Review developer documentation** in `developer_notes/`
3. **Consult architecture docs** in `system-design-docs/`
4. **Use Nx commands** to debug dependency issues: `pnpm nx graph`
5. **Check GitHub Issues** in the repository for known issues

---

*Generated for the IFLA Standards Platform - A comprehensive documentation and vocabulary management system for international library standards.*
