# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Development Workflows

### Essential Commands
- **Package manager**: Always use `pnpm` (never npm or yarn)
- **Build**: `nx build {site}` (e.g., `nx build portal`, `nx build admin-portal`)
- **Dev server**: `nx start {site}` or `nx run {site}:start:robust` (port cleanup)
- **Next.js dev**: `nx dev admin-portal`
- **Serve built**: `nx serve {site}` or `nx run {site}:serve:robust`
- **Testing**: `pnpm test` (nx affected parallel)
- **Type check**: `pnpm typecheck` (nx affected parallel)
- **Lint**: `pnpm lint` (nx affected parallel)

### Site Scaffolding
- **Create site**: `pnpm tsx scripts/scaffold-site.ts --siteKey=newsite --title="New Standard" --tagline="A new IFLA standard"`
- **Template**: `scripts/scaffold-template/` with ISBD-matching structure
- **Docs**: See `developer_notes/current-scaffolding-plan.md`

### Testing Strategy (5 Groups)

#### Group 1: Selective Tests (Development)
- **Unit**: `nx test {project}` or `nx affected --target=test`
- **E2E**: `nx run standards-dev:e2e` or site-specific `nx run {site}:e2e`
- **Debug**: `nx test --ui`, `nx run standards-dev:e2e:ui`

#### Group 2: Comprehensive Tests
- **Full**: `pnpm test:comprehensive` (typecheck + lint + test + build + E2E)
- **Targets**: unit, integration, e2e, builds

#### Group 3: Pre-Commit (Auto < 60s)
- TypeScript, ESLint, unit tests, config validation
- Manual: `pnpm test:pre-commit`

#### Group 4: Pre-Push (Branch-aware < 180s)
- Feature branches: Fast validation only
- Protected branches: Full testing + builds

#### Group 5: CI Tests (Environment focus)
- `pnpm test:ci` - deployment-critical only

### Test Placement Decision Tree

```
Unit Tests (pre-commit + comprehensive)
├── Location: packages/theme/src/tests/components/
└── Pure logic, no external deps

Integration Tests (comprehensive only)
├── Location: packages/theme/src/tests/scripts/
└── External APIs, file system, CLI

E2E Tests (comprehensive + CI)
├── Location: /e2e/ or standards/{site}/e2e/
└── Browser automation, user workflows
```

**Key Questions**:
1. Network calls/external APIs? → Integration test
2. Browser/user flows? → E2E test
3. Component logic only? → Unit test

### Build Configuration (CRITICAL)
**Required in every `docusaurus.config.ts`**:
```typescript
future: {
  v4: true,
  experimental_faster: true,  // Fixes static state contamination
},
```

## Project Architecture

### Monorepo Structure
- `apps/admin-portal/` - Next.js admin with GitHub OAuth
- `portal/` - Main IFLA portal
- `standards/{site}/` - Individual standards (ISBDM, LRM, FRBR, isbd, muldicat, unimarc)
- `packages/theme/` - Shared Docusaurus theme
- `scripts/` - Build automation

### Configuration System
- **Source**: `packages/theme/src/config/siteConfig.ts`
- **Environment**: `DOCS_ENV` (local, preview, development, production)
- **Navigation**: Use `SiteLink` component, never hardcode URLs

### Admin Portal (Next.js)
- **Stack**: Next.js 15.2.5, NextAuth.js v4.24.11, TypeScript
- **Auth**: GitHub OAuth + cross-site session tracking
- **Dev**: `nx dev admin-portal` (port 4200)
- **Test**: `nx test admin-portal`, `nx run standards-dev:e2e:admin-portal`
- **Architecture**: See `developer_notes/admin-portal-authentication-architecture.md`

## Development Guidelines

### Testing Before Commits
- Pre-commit hooks run automatically
- Tests must pass before committing
- Use `workspaceUtils` in integration tests, not `process.cwd()`

### Scaffolding and Templates
- **CRITICAL**: Update templates when changing all-site configs
- Template: `scripts/scaffold-template/`
- Script: `scripts/scaffold-site.ts`

### Port Management
**Port Mappings**:
- Portal: 3000, ISBDM: 3001, LRM: 3002, FRBR: 3003
- ISBD: 3004, MulDiCat: 3005, UniMARC: 3006, NewTest: 3008
- Admin Portal: 4200

**Commands**:
- Kill all: `pnpm ports:kill`
- Robust start: `nx run {site}:start:robust`
- All sites: `nx run standards-dev:start-all:robust`

## Testing Infrastructure

### Unit Tests (Vitest)
```bash
nx test                      # All projects
nx test @ifla/theme         # Specific project
nx affected --target=test   # Only affected
nx test --watch            # Watch mode
nx test --ui              # Vitest UI
```

### E2E Tests (Playwright)
```bash
nx run standards-dev:e2e              # Full suite
nx run standards-dev:e2e:fail-fast    # Stop on first failure
nx run {site}:e2e                     # Site-specific
npx playwright test --ui              # Interactive UI
```

### Git Hooks
**Pre-commit** (< 60s):
- TypeScript, ESLint, unit tests, config validation

**Pre-push** (branch-aware):
- Protected branches: Full regression + E2E
- Feature branches: Fast validation only

## Dual CI Architecture

### Development Fork (jonphipps/standards-dev)
- Remote: `fork`
- Workflow: `nx-optimized-ci.yml`
- Purpose: Full testing with Nx Cloud
- Command: `git push-dev`

### Preview Repo (iflastandards/standards-dev)
- Remote: `origin`
- Workflow: `preview-ci.yml`
- Purpose: Deployment + GitHub Pages
- Command: `git push-preview`

**Rule**: NEVER push directly to origin/main

## RBAC with Cerbos

### Review Groups (RG)
- **ICP** (International Cataloguing Principles): MulDiCat
- **BCM** (Bibliographic Conceptual Models): LRM, FRBR, FRAD, FRBRer, FRBRoo, FRSAD
- **ISBD** (International Standard Bibliographic Description): ISBD, ISBDM, ISBDW, ISBDE, ISBDI, ISBDAP, ISBDAC, ISBDN, ISBDP, ISBDT
- **PUC** (Permanent UNIMARC Committee): UNIMARC elements (OXX, 1XX-8XX)

### Three-Tier Permissions
1. System: Global admins
2. Review group (rg): Review group roles
3. Site: Site-specific roles

### Testing Roles
```bash
pnpm test:admin:roles --role editor --rg ISBD
pnpm test:admin:roles --role admin --site isbdm
```

## API Documentation

**Docusaurus v3.8**:
- Main: https://docusaurus.io/docs
- Config API: https://docusaurus.io/docs/api/docusaurus-config
- Plugins: https://docusaurus.io/docs/api/plugins
- Themes: https://docusaurus.io/docs/api/themes

**UI Components**:
- MUI Data Grid: https://mui.com/x/react-data-grid/
- MUI Tree View: https://mui.com/x/react-tree-view/
- Base UI: https://base-ui.com/react/overview/quick-start

**Development**:
- TypeScript: https://docusaurus.io/docs/typescript-support
- MDX: https://mdxjs.com/docs/
- React: https://react.dev/reference/react
- FontAwesome: https://docs.fontawesome.com/web/use-with/react

## Quick Reference

### Nx Benefits
- Smart caching (local + cloud)
- Affected detection
- Parallel execution
- Proper dependencies (`dependsOn` rules)
- ~70% faster CI builds

### Performance Tips
- Use Nx commands for caching
- Use `:robust` variants for port cleanup
- Use `nx affected` for faster builds
- Parallel test execution

### Critical Issues
- Static state contamination → Use `experimental_faster: true`
- Port conflicts → Use `:robust` commands
- Test placement → Follow decision tree

### Search Priority
1. `/Users/jonphipps/Code/IFLA/standards-dev`
2. Git history/branches
3. `/Users/jonphipps/Code/IFLA/`

### Deployment Debugging
- Check nx-mcp deployment logs
- Verify environment URLs in `siteConfig.ts`
- Use Context7 for live code examples