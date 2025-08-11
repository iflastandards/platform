# IFLA Standards Platform - Comprehensive Project Index

## 🏗️ Project Overview

The IFLA Standards Platform is a comprehensive documentation and vocabulary management system for the International Federation of Library Associations (IFLA). This monorepo hosts multiple standards including ISBD, LRM, FRBR, UNIMARC, and other cataloguing standards.

### Key Features
- Multi-site documentation with individual Docusaurus sites for each IFLA standard
- Next.js admin portal with GitHub OAuth authentication
- RDF vocabulary generation, validation, and distribution
- Nx monorepo architecture with pnpm workspace
- Comprehensive testing with Vitest and Playwright
- Role-based access control with Cerbos
- Multi-environment support (local, preview, development, production)

### Technology Stack
- **Build System**: Nx 21.2.2 monorepo with pnpm workspace
- **Frontend**: React 19.1.0, Docusaurus 3.8+ (documentation) + Next.js 15.2.5 (admin portal)
- **Language**: TypeScript 5.7 with strict configuration
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Authentication**: Clerk + NextAuth.js 5.0
- **Authorization**: Cerbos RBAC system
- **Database**: Supabase (operational data)
- **Data**: Google Sheets API + Git (source of truth) + File system
- **Styling**: Tailwind CSS, shadcn/ui
- **CI/CD**: GitHub Actions + Nx Cloud

---

## 📁 Project Structure

### Core Applications

#### **`apps/admin/`** - Next.js Admin Portal
- **Framework**: Next.js 15.2.5 with App Router
- **Purpose**: Administrative interface for managing vocabularies and standards
- **Key Features**:
  - GitHub OAuth authentication
  - Role-based access control
  - Vocabulary management dashboards
  - Cross-site session sharing
- **Critical**: Uses `/admin` basePath - requires `addBasePath()` for all API calls and assets
- **Port**: 3007
- **URLs**:
  - Production: https://admin.iflastandards.info
  - Preview: https://iflastandards.github.io/platform/admin/

#### **`portal/`** - Main Documentation Portal
- **Framework**: Docusaurus 3.8+
- **Purpose**: Central hub for all IFLA standards documentation
- **Port**: 3000
- **URLs**:
  - Production: https://www.iflastandards.info
  - Preview: https://iflastandards.github.io/platform/

### Standards Sites (`standards/`)

| Site | Key | Port | Production URL | Purpose |
|------|-----|------|----------------|---------|
| ISBDM | isbdm | 3001 | isbdm.iflastandards.info | ISBD Manifestation |
| LRM | lrm | 3002 | lrm.iflastandards.info | Library Reference Model |
| FRBR | frbr | 3003 | frbr.iflastandards.info | Functional Requirements |
| ISBD | isbd | 3004 | isbd.iflastandards.info | International Standard Bibliographic Description |
| MulDiCat | muldicat | 3005 | muldicat.iflastandards.info | Multilingual Dictionary of Cataloguing Terms |
| UNIMARC | unimarc | 3006 | unimarc.iflastandards.info | UNIMARC formats |

### System Design Documentation (`system-design-docs/`)

Comprehensive architectural documentation for the platform:

#### **Core Architecture Documents**
1. **`00-executive-summary.md`** - High-level overview for stakeholders
2. **`01-system-architecture-overview.md`** - Technology stack and design principles
3. **`02-data-architecture.md`** - Data storage strategy and flow patterns
4. **`03-configuration-architecture.md`** - Site configuration and routing
5. **`04-development-workflow.md`** - Standards development lifecycle
6. **`05-api-architecture.md`** - API design and integration patterns
7. **`06-testing-strategy.md`** - Five-phase testing approach
8. **`07-subsystems-architecture.md`** - Detailed subsystem specifications
9. **`08-architecture-evolution.md`** - Architecture history and decisions
10. **`09-collaboration-architecture.md`** - Team collaboration patterns
11. **`10-implementation-strategy.md`** - Implementation roadmap
12. **`11-design-system-ui-patterns.md`** - Complete design system and UI patterns

#### **Supplementary Documents (Archived)**
- Additional documentation has been consolidated into the core documents above
- Archived documents can be found in `archive-supplementary-docs/`
- Topics covered include:
  - TinaCMS integration (see Document 09)
  - Translation workflows (see Document 04)
  - Vocabulary server requirements (see Document 02)
  - API specifications (see Document 05)
  - Design system and UI patterns (see Document 11)
  - MVP timeline and planning (see Document 01)
  - Implementation examples (see Document 04)

### Shared Packages (`packages/`)

#### **`packages/theme/`**
- Shared Docusaurus theme and components
- Centralized configuration system
- Cross-site navigation utilities
- Common UI components (VocabularyTable, SiteLink, etc.)

#### **`packages/ui/`**
- Shared UI components library
- Design system components
- TypeScript interfaces and types

#### **`packages/standards-cli/`**
- Command-line tools for managing standards
- Vocabulary processing utilities
- Build and deployment scripts

### Scripts & Tools

#### **`scripts/`**
- Site scaffolding tools (`scaffold-site.ts`, `page-template-generator.ts`)
- Build and deployment scripts
- Validation and testing utilities
- Performance optimization scripts
- RDF conversion tools

#### **`tools/`**
- **`tools/python/`**: Language detection, quality assurance tools
- **`tools/sheet-sync/`**: Google Sheets synchronization
- **`tools/typescript/`**: Site generators, vocabulary tools

### Testing Infrastructure

#### **`e2e/`**
- End-to-end tests using Playwright
- Cross-site authentication tests
- Visual regression tests
- Performance testing

### Documentation

#### **`docs/`**
- Platform architecture documentation
- API specifications
- Workflow documentation
- Admin portal guides

#### **`developer_notes/`**
- **Key Documents**:
  - `TESTING_STRATEGY.md` - Comprehensive testing approach
  - `NEXTJS_CODING_STANDARDS.MD` - Critical Next.js patterns
  - `current-scaffolding-plan.md` - Site scaffolding system
  - `admin-architecture-implementation-plan.md` - Admin portal architecture
  - `site-configuration-architecture.md` - Configuration system
  - `NX_AFFECTED_TEST_OPTIMIZATION.md` - Nx optimization guide
  - `VITEST_CONFIGURATION.md` - Vitest setup documentation
- Technical implementation guides
- Development workflows
- Troubleshooting documentation

---

## 🚀 Quick Start Commands

### Development
```bash
# Install dependencies
pnpm install

# Start Nx daemon for faster builds
pnpm nx:daemon:start

# Run health check
pnpm health

# Start specific site
nx start portal
nx dev admin --turbopack

# Start with port cleanup
nx run portal:start:robust
```

### Building
```bash
# Build all sites
pnpm build:all

# Build specific site
nx build portal
nx build admin

# Test builds
pnpm test:builds:affected
```

### Testing
```bash
# Run affected tests (recommended)
pnpm test

# Run comprehensive tests
pnpm test:comprehensive

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Performance Optimization
```bash
# Optimize Nx
pnpm nx:optimize

# Clear cache
pnpm nx:cache:clear

# View dependency graph
pnpm nx:graph
```

---

## 🔧 Key Configuration Files

### Root Configuration
- `nx.json` - Nx workspace configuration
- `package.json` - Root package scripts and dependencies
- `.npmrc` - pnpm configuration with optimizations
- `tsconfig.base.json` - TypeScript base configuration

### Environment Configuration
- **Centralized in**: `packages/theme/src/config/siteConfig.ts`
- **No `.env` files** - Uses TypeScript configuration matrix
- **Environment detection**: Automatic based on deployment context

### Testing Configuration
- `.precommitrc.json` - Pre-commit test behavior
- `.prepushrc.json` - Pre-push test behavior
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration

---

## 🚨 Critical Development Rules

### Admin App (`apps/admin`)
1. **NEVER hardcode `/admin`** in paths - Next.js adds it automatically
2. **ALWAYS use `addBasePath()`** for API calls: `fetch(addBasePath('/api/route'))`
3. **Import utility**: `import { addBasePath } from '@ifla/theme/utils';`

### Testing Strategy
1. **Always use `nx affected`** for development testing
2. **Target times**: Pre-commit <60s, Pre-push <180s
3. **Parallel execution**: Use `--parallel=3` for performance
4. **Check placement guide** before writing new tests

### Code Development
1. **Check MCP servers** (Context7, MUI) for examples before writing code
2. **Run typecheck and lint** after writing code
3. **Use pnpm** - never npm or yarn
4. **Run from root** - all commands execute from project root

---

## 🔗 Important Resources

### Documentation
- **Main Portal**: https://www.iflastandards.info
- **Admin Portal Guide**: `docs/admin-portal.md`
- **Architecture Overview**: `system-design-docs/01-system-architecture-overview.md`
- **Testing Strategy**: `developer_notes/TESTING_STRATEGY.md`

### Key Architectural Decisions
- Git as single source of truth for all vocabulary data
- Distributed storage across multiple systems
- Five-phase progressive testing strategy
- Centralized TypeScript configuration matrix
- Role-based workflow governance
- Environment-aware basePath handling

### GitHub
- **Repository**: https://github.com/iflastandards/platform
- **Issues**: https://github.com/iflastandards/platform/issues

### Deployment
- **Preview Branch**: `preview` → https://iflastandards.github.io/platform/
- **Production Branch**: `main` → https://www.iflastandards.info/

---

## 📊 Project Statistics

- **TypeScript Files**: 445+ with strict type checking
- **Documentation Sites**: 7 individual standards sites
- **Admin Features**: 44+ TypeScript files with complete functionality
- **Test Coverage**: Unit tests, integration tests, E2E tests
- **Build Performance**: Nx Cloud enabled with 6-8 distributed agents

---

## 🛠️ Development Workflows

### Adding a New Site
1. Use scaffolding: `pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard"`
2. Generate pages: `pnpm tsx scripts/page-template-generator.ts --namespace=newsite`
3. Add to configuration matrix in `packages/theme/src/config/siteConfig.ts`
4. Test locally before deployment

### Working with Vocabularies
1. RDF vocabulary generation and validation
2. CSV to RDF conversion with DCTAP extensions
3. Google Sheets integration for collaborative editing
4. Version control and deployment automation

### Contributing
1. Fork repository and create feature branch from `preview`
2. Follow test-driven development approach
3. Ensure all tests pass: `pnpm test`
4. Submit PR to `preview` branch

---

## 📚 Navigation Guide

### For New Developers
1. Start with `system-design-docs/01-system-architecture-overview.md`
2. Review `developer_notes/TESTING_STRATEGY.md`
3. Check `developer_notes/NEXTJS_CODING_STANDARDS.MD` for admin development
4. Read `CLAUDE.md` for AI assistant guidelines

### For Architects
1. Review all documents in `system-design-docs/`
2. Focus on data architecture and API design
3. Check integration patterns and security architecture

### For Operations
1. See `system-design-docs/06-testing-strategy.md`
2. Review deployment architecture documentation
3. Check CI/CD configuration in GitHub Actions

---

This index provides a comprehensive overview of the IFLA Standards Platform project structure, key components, and development workflows. For detailed information on specific topics, refer to the documentation files referenced throughout this index.
