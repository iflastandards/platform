# IFLA Standards Testing Strategy

## Overview

This document outlines the five distinct test phases that organize all testing activities in the IFLA Standards monorepo. Our testing strategy is designed to catch issues at the earliest possible stage while minimizing CI costs, with tests progressively validating more aspects as code moves from development to deployment.

## 🎯 Implementation Status

**Phase 1 Tagging Implementation**: ✅ **COMPLETE** (2025-07-31)
- All 77 test files now have proper category tags (@unit, @integration, @e2e, @smoke)
- 44.2% have functional tags (@api, @validation, @security, etc.)
- 26.0% have priority tags (@critical, @happy-path, @error-handling)
- Tag-based test execution now available for selective testing

## Phase 1: Selective Tests (On-Demand Development)

**Purpose**: Individual testing for focused development work and TDD
**When**: During active development, debugging, feature work
**Optimization**: Uses `nx affected` heavily, smart caching
**Speed**: < 5 seconds per test file

### Unit Tests
```bash
# Individual project tests
pnpm nx test @ifla/theme                    # Theme package only
pnpm nx test portal                         # Portal site only
pnpm nx test isbdm                          # ISBDM standard only
pnpm nx test admin-portal                   # Admin portal (Next.js) only

# Affected unit tests (recommended for development)
pnpm nx affected --target=test              # Only test changed projects
pnpm nx affected --target=test --parallel=3 # Parallel execution

# All unit tests (when needed)
pnpm nx run-many --target=test --all        # All projects

# 🎯 Tag-based test selection (NEW - Phase 1 Complete)
pnpm test --grep "@unit"              # Run only unit tests
pnpm test --grep "@critical"          # Run critical tests only
pnpm test --grep "@security"          # Run security-related tests
pnpm test --grep "@api.*@validation"  # Run API validation tests
pnpm test --grep "@rbac"              # Run RBAC tests
```

### UI Tests (Playwright Multi-Browser)
```bash
# Individual browser testing
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project="Mobile Chrome"

# Specific test files
npx playwright test e2e/portal-smoke.spec.ts
npx playwright test e2e/vocabulary-functionality.spec.ts

# Admin Portal E2E tests
npx playwright test --project=admin-portal    # All admin portal E2E tests
npx playwright test e2e/admin-portal/auth.e2e.test.ts
npx playwright test e2e/admin-portal/site-management-workflow.e2e.test.ts

# 🎯 Tag-based Playwright test selection (NEW - Phase 1 Complete)
npx playwright test --grep "@smoke"          # Run smoke tests only
npx playwright test --grep "@e2e"            # Run all E2E tests
npx playwright test --grep "@critical"       # Run critical E2E tests
npx playwright test --grep "@authentication" # Run auth-related tests
npx playwright test --grep "@navigation"     # Run navigation tests
npx playwright test --grep-invert "@local-only" # Skip local-only tests

# Debug mode
npx playwright test --debug
npx playwright test --ui
```

### Regression Tests (Targeted)
```bash
# Visual regression
pnpm nx run standards-dev:regression:visual

# Performance regression
pnpm nx run standards-dev:regression:performance

# Build regression (affected only)
pnpm nx run standards-dev:regression:affected
```

## Phase 2: Pre-Commit Tests (Automated Git Hook)

**Purpose**: Fast feedback loop preventing broken commits
**When**: Automatically on every `git commit`
**Optimization**: Only affected projects, parallel execution
**Speed**: < 60 seconds for typical changes

### What Runs
```bash
# Automatically runs via Husky:
pnpm nx affected --target=typecheck --parallel=3
pnpm nx affected --target=lint --parallel=3       # Warnings allowed
pnpm nx affected --target=test --parallel=3       # Unit tests only
```

### Key Points
- Unit tests only (no integration/e2e)
- Lenient on test file linting, strict on production code
- All subsequent phases assume these passed
- Nx cache used aggressively

## Phase 3: Pre-Push Tests (Automated Git Hook)

**Purpose**: Integration tests and deployment readiness validation
**When**: Automatically on every `git push`
**Optimization**: Assumes pre-commit passed, no redundant testing
**Speed**: < 180 seconds

### What Runs
```bash
# Automatically runs via Husky:
pnpm nx affected --target=test:integration --parallel=3  # Integration tests
pnpm nx affected --target=build --parallel=3            # Production builds
pnpm nx affected --target=e2e                          # If portal/admin affected
```

### Key Points
- No need to re-run typecheck/lint/unit tests
- Focus on integration and deployment readiness
- Smart E2E triggers (auto-runs when portal/admin affected)
- Can manually enable E2E in `.prepushrc.json`

## Phase 4: Comprehensive Tests (Manual)

**Purpose**: Full validation before major releases
**When**: Release preparation, major refactoring validation
**Optimization**: Parallelized where possible, uses all available cores
**Speed**: < 300 seconds

### Full Test Suite
```bash
# Everything in parallel (recommended)
pnpm test:comprehensive

# Individual comprehensive suites
pnpm test:comprehensive:unit          # All unit tests
pnpm test:comprehensive:e2e           # All E2E tests  
pnpm test:comprehensive:builds        # All build validation
pnpm test:comprehensive:regression    # Full regression suite
```

### Implementation
```bash
# Equivalent to:
pnpm nx run-many --target=typecheck --all --parallel &&
pnpm nx run-many --target=lint --all --parallel &&
pnpm nx run-many --target=test --all --parallel &&
pnpm nx run-many --target=build --all --parallel &&
pnpm nx run standards-dev:e2e &&
pnpm nx run standards-dev:regression:full
```

## Phase 5: CI Environment Tests (Automated)

**Purpose**: Validate deployment environment, secrets, and infrastructure-specific issues ONLY
**When**: GitHub Actions CI pipeline
**Optimization**: Minimal, focused only on environment-dependent functionality

### What CI Tests
```bash
# Environment-specific tests ONLY
pnpm test:ci:env

# This runs:
# - Environment variable validation
# - API token verification
# - External service connectivity checks
# - CI-specific path and permission validation
# - Build environment configuration checks

# NO CODE TESTING - assumes Phases 1-4 passed locally
# Builds happen for deployment only, not for testing
```

### Updated CI/CD Workflows (Phase 5 Compliant)

#### Preview Deployment (`deploy-preview.yml`)
- ✅ **Environment validation**: API tokens, environment variables, service connectivity
- ✅ **Build and deploy**: GitHub Pages + Vercel (if admin affected)
- ✅ **Post-deployment validation**: Health checks on deployed sites
- ❌ **Skips**: TypeScript, ESLint, unit tests, integration tests

#### Production Deployment (`deploy-production.yml`)
- ✅ **PR validation**: Must be from preview → main branch
- ✅ **Production environment validation**: Production secrets, API tokens
- ✅ **Secure deployment**: Production GitHub Pages + Vercel
- ✅ **Production health checks**: Full production API integration validation
- ❌ **Skips**: All code quality checks (assumes local validation)

### What CI Tests Specifically
- ✅ Environment variables exist and are valid format
- ✅ API tokens can authenticate:
  - GitHub token and OAuth credentials
  - Google Sheets API key and service account
  - Supabase URL and anonymous key
  - Cerbos Hub credentials
- ✅ External services are reachable from CI environment
- ✅ File paths and permissions work in CI
- ✅ NODE_ENV is set to production (for optimized builds)
- ✅ Correct DOCS_ENV set (preview or production)
- ✅ Branch matches deployment target (preview→preview, main→production)
- ✅ Authentication secrets configured (AUTH_SECRET)

### What CI NEVER Tests (Already Validated Locally)
- ❌ TypeScript type checking (validated in pre-commit)
- ❌ ESLint (validated in pre-commit)
- ❌ Unit tests (validated in pre-commit)
- ❌ Integration tests (validated in pre-push)
- ❌ Component functionality (validated in pre-commit)
- ❌ Business logic (validated in pre-commit/pre-push)
- ❌ Code quality (validated in pre-commit)
- ❌ E2E tests (validated in pre-push when needed)

### ⚠️ CRITICAL: Local Validation Required
**The CI/CD pipeline assumes all Phases 1-4 have passed locally.** If you bypass local git hooks or push code that hasn't been validated locally, the deployment may succeed but the code may be broken.

**Developer Responsibility**: 
- ✅ Always run `pnpm test` before pushing
- ✅ Ensure pre-commit hooks are enabled
- ✅ Let pre-push hooks complete successfully
- ✅ Never use `--no-verify` unless absolutely necessary

### Speed Targets
- **Target time**: < 180 seconds total
- **Focus**: Environment-specific failures only

## Deployment Flow

### Preview Environment
- **Branch**: `preview`
- **URL**: https://iflastandards.github.io/platform/
- **Tests**: Environment tests with `DOCS_ENV=preview`
- **Triggers**: Every push to preview branch

### Production Environment
- **Branch**: `main`
- **URL**: https://www.iflastandards.info/
- **Tests**: Environment tests with `DOCS_ENV=production`
- **Triggers**: Only via PR from preview→main
- **Additional**: Security scans, full validation

## Script Organization

### Core Development Commands (Nx-Optimized)
```bash
# Primary development workflow
pnpm lint                             # pnpm nx affected --target=lint
pnpm typecheck                        # pnpm nx affected --target=typecheck  
pnpm test                             # pnpm nx affected --target=test
pnpm build:affected                   # pnpm nx affected --target=build

# Comprehensive alternatives
pnpm lint:all                         # pnpm nx run-many --target=lint --all
pnpm typecheck:all                    # pnpm nx run-many --target=typecheck --all
pnpm test:all                         # pnpm nx run-many --target=test --all
pnpm build:all                        # pnpm nx run-many --target=build --all
```

### Test Group Commands
```bash
# Group 1: Selective
pnpm test:unit:{project}              # Individual project testing
pnpm test:e2e:{browser}               # Browser-specific E2E
pnpm test:regression:{type}           # Specific regression testing

# Group 2: Comprehensive  
pnpm test:comprehensive               # Everything, parallelized
pnpm test:comprehensive:{type}        # Comprehensive subset

# Group 3: Pre-commit (automatic via git hook)
pnpm test:pre-commit                  # Manual trigger for hook equivalent

# Group 4: Pre-push (automatic via git hook)  
pnpm test:pre-push                    # Manual trigger for hook equivalent
pnpm test:pre-push:feature            # Feature branch simulation
pnpm test:pre-push:protected          # Protected branch simulation

# Group 5: CI
pnpm test:ci                          # CI environment simulation
pnpm test:ci:connectivity             # External service connectivity only
```

## Nx Optimizations Applied

### Affected Detection
- All core commands use `nx affected` instead of running everything
- Git-based change detection determines what needs testing
- Cache-aware execution prevents redundant work

### Parallel Execution
- Multi-core utilization with `--parallel=3` (or appropriate core count)
- Background job execution in git hooks
- Load balancing across available resources

### Smart Caching
- Nx cache enabled by default
- Input-based cache invalidation
- Shared cache across team members (if Nx Cloud configured)

### Dependency Management
- Projects only rebuild/test when dependencies change
- Proper dependency graph ensures correct build order
- Task pipeline optimization

## Performance Targets

| Test Group | Target Time | Fallback Time | Optimization Focus |
|------------|-------------|---------------|-------------------|
| Selective | < 30s | < 60s | Affected only, single purpose |
| Comprehensive | < 300s | < 600s | Parallelization, smart scheduling |
| Pre-commit | < 60s | < 120s | Affected, essential checks only |
| Pre-push | < 180s | < 300s | Branch-aware, representative testing |
| CI | < 180s | < 240s | Environment focus, minimal redundancy |

## Key Configuration Files

- `.husky/pre-commit`: Runs Phase 2 automatically
- `.husky/pre-push`: Runs Phase 3 automatically
- `vitest.config.nx.ts`: Optimized for nx affected tests
- `vitest.config.ci-env.ts`: Only environment-specific tests
- `.precommitrc.json`: Pre-commit configuration
- `.prepushrc.json`: Pre-push configuration (can enable E2E)

## Troubleshooting

### Tests running slowly
```bash
pnpm nx:daemon:health       # Check daemon status
pnpm nx:cache:clear        # Clear cache if stale
```

### CI tests failing but local passing
- Check environment variables
- Verify API tokens are set in GitHub secrets
- Check external service connectivity
- Review CI-specific paths

### Pre-commit taking too long
- Ensure nx daemon is running
- Check if you have uncommitted large changes
- Use `pnpm test:no-daemon` to diagnose daemon issues

## Cost Management Strategy

### Local Testing (Free)
- Comprehensive test coverage via git hooks
- Development tools validation
- Complete regression testing

### CI Testing (Paid)
- Environment-specific validation only
- Infrastructure connectivity testing
- Production configuration validation
- No redundant testing of locally-validated functionality

## Why This Strategy Works

1. **Fast Feedback**: Developers get immediate feedback during development
2. **No Skipping**: Every commit and push is validated
3. **Progressive Validation**: Each phase builds on the previous
4. **No Redundancy**: Tests never repeat between phases
5. **Cost Efficient**: CI only tests what can't be tested locally
6. **Reliable**: By the time code reaches CI, it's already been thoroughly tested
7. **Environment Aware**: CI tests validate the correct deployment environment

This approach ensures high confidence in deployments while minimizing CI compute costs through smart local validation and targeted cloud testing.

## AI Testing Guide

For AI assistants working on this project, see the [Test-First Implementation Guide](test-first-implementation-guide.md) for:
- Comprehensive test-driven development patterns
- Component testing strategies with MUI and React Testing Library
- API route testing with Next.js
- E2E testing patterns with Playwright
- Common pitfalls and debugging techniques
- Step-by-step implementation workflows
