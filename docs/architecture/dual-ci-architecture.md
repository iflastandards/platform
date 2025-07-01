# Dual CI Architecture Documentation

## Overview

This project uses a **Dual CI Architecture** to separate development testing from client preview validation. This ensures comprehensive testing during development while maintaining fast, reliable client previews.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DUAL CI ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Development Fork (jonphipps/standards-dev)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Development CI (Nx Cloud)                                           │   │
│  │ • File: .github/workflows/nx-optimized-ci.yml                      │   │
│  │ • Nx Cloud Workspace: 6857fccbb755d4191ce6fbe4                     │   │
│  │ • Triggers: Push to fork/dev, fork/main                            │   │
│  │ • Purpose: Comprehensive development testing                       │   │
│  │                                                                     │   │
│  │ ✅ Full unit tests (475+ tests)                                     │   │
│  │ ✅ Integration tests (external services)                            │   │
│  │ ✅ TypeScript compilation                                           │   │
│  │ ✅ ESLint validation                                                │   │
│  │ ✅ Theme package builds                                             │   │
│  │ ✅ Nx caching & remote execution                                    │   │
│  │ ✅ Affected project optimization                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      │ git push-dev                         │
│                                      ▼                                      │
│                                                                             │
│  Preview Repo (iflastandards/standards-dev)                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Preview CI (Deployment Validation)                                  │   │
│  │ • File: .github/workflows/preview-ci.yml                           │   │
│  │ • Triggers: Push to origin/dev                                     │   │
│  │ • Purpose: Fast deployment validation                              │   │
│  │                                                                     │   │
│  │ ✅ TypeScript compilation check                                     │   │
│  │ ✅ Theme package build                                              │   │
│  │ ✅ Basic configuration validation                                   │   │
│  │ ✅ Representative site build (portal)                               │   │
│  │ ✅ Deployment readiness verification                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      │ git push-preview                     │
│                                      ▼                                      │
│                                                                             │
│  Client Preview Deployment                                                 │
│  • GitHub Pages deployment                                                 │
│  • Environment: preview                                                    │
│  • URL: https://iflastandards.github.io/standards-dev/                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Repository Configuration

### Remote Setup
```bash
# View current remotes
git remote -v

# Expected output:
# fork     git@github.com:jonphipps/standards-dev.git (fetch)
# fork     git@github.com:jonphipps/standards-dev.git (push)
# origin   git@github.com:iflastandards/standards-dev.git (fetch)
# origin   git@github.com:iflastandards/standards-dev.git (push)
```

### Branch Tracking
```bash
# Check branch tracking
git branch -vv

# dev should track fork/dev:
# * dev    2b4bea87 [fork/dev] latest commit message
```

### Git Aliases (Configured)
```bash
# Daily development pushes
git push-dev        # Alias for: git push fork dev

# Client preview updates  
git push-preview    # Alias for: git push origin dev
```

## Workflow Documentation

### 1. Daily Development Workflow

**Purpose**: Comprehensive testing and development iteration

```bash
# 1. Make your changes
# ... edit files ...

# 2. Test locally (optional but recommended)
pnpm test:pre-commit

# 3. Commit changes
git add .
git commit -m "your changes"

# 4. Push to development fork (triggers comprehensive CI)
git push-dev
```

**What happens:**
- Triggers `Development CI (Nx Cloud)` on your fork
- Runs 475+ unit tests with Vitest
- Runs integration tests for external services
- TypeScript compilation validation
- ESLint code quality checks
- Theme package builds with tsup
- Nx caching provides ~70% faster subsequent runs
- Cost: Runs on your personal GitHub account

### 2. Client Preview Workflow

**Purpose**: Update client-facing preview site after development testing passes

```bash
# 1. Ensure development CI passed on fork
# Check: https://github.com/jonphipps/standards-dev/actions

# 2. Update preview site for client review
git push-preview
```

**What happens:**
- Triggers `Preview CI (Deployment Validation)` on preview repo
- Lightweight validation focused on deployment readiness
- TypeScript compilation check
- Basic configuration validation  
- Representative build test (portal site)
- GitHub Pages deployment to preview environment
- Cost: Runs on organization account (minimal usage)

**Client Access:**
- Preview URL: https://iflastandards.github.io/standards-dev/
- Environment: `DOCS_ENV=preview`

### 3. Sync Workflow

**Purpose**: Keep your fork up-to-date with any changes in preview repo

```bash
# Periodically sync your fork with preview repo
git fetch origin
git checkout dev
git merge origin/dev  # or git rebase origin/dev
git push fork dev
```

## CI Configuration Details

### Development CI (nx-optimized-ci.yml)

**Location**: `.github/workflows/nx-optimized-ci.yml`  
**Runs on**: Development fork (jonphipps/standards-dev)  
**Nx Cloud Workspace**: `6857fccbb755d4191ce6fbe4`

**Triggers:**
```yaml
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
  workflow_dispatch:
```

**Key Features:**
- Nx Cloud integration with remote caching
- Affected project detection
- Parallel execution (up to 3 concurrent processes)
- Environment variables for external service testing
- Skip cache option via workflow dispatch

**Environment Variables:**
```yaml
GOOGLE_SHEETS_API_KEY: ${{ secrets.GOOGLE_SHEETS_API_KEY }}
GSHEETS_SA_KEY: ${{ secrets.GSHEETS_SA_KEY }}
GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Preview CI (preview-ci.yml)

**Location**: `.github/workflows/preview-ci.yml`  
**Runs on**: Preview repo (iflastandards/standards-dev)

**Triggers:**
```yaml
on:
  push:
    branches: [dev]
  pull_request:
    branches: [dev]
  workflow_dispatch:
```

**Key Features:**
- Fast deployment validation (< 3 minutes)
- No external service dependencies
- Preview environment configuration
- Representative build testing

**Environment Variables:**
```yaml
DOCS_ENV: preview
SITE_TITLE: IFLA Standards Portal
SITE_TAGLINE: International Federation of Library Associations and Institutions
```

## Nx Cloud Configuration

### Workspace Settings
- **Workspace ID**: `6857fccbb755d4191ce6fbe4`
- **Location**: `nx.json`
- **Connected to**: Development fork (jonphipps/standards-dev)

### Features Used
- Remote caching for builds and tests
- Distributed task execution
- Affected project detection
- Build insights and analytics

### Access
- Dashboard: https://cloud.nx.app/
- Login with GitHub account connected to development fork

## Git Hook Integration

### Pre-commit Hook
**File**: `.husky/pre-commit`  
**Purpose**: Fast feedback before commits

**Runs:**
- TypeScript type checking: `pnpm typecheck`
- ESLint validation: `pnpm lint --quiet`
- Unit tests: `pnpm test --run`
- Configuration validation: `node scripts/test-site-builds.js --skip-build`

### Pre-push Hook  
**File**: `.husky/pre-push-optimized`  
**Purpose**: Comprehensive validation before sharing changes

**Branch-aware behavior:**
- **Protected branches (main/dev)**: Full regression testing
- **Feature branches**: Affected testing only

## Testing Strategy Integration

The dual CI architecture supports the project's 5-group testing strategy:

### Group 1: Selective Tests (Development CI)
- Individual unit tests: `nx test portal`, `nx test @ifla/theme`
- Affected tests: `pnpm test` (Nx-optimized)
- Browser-specific E2E: `pnpm test:e2e:chromium`

### Group 5: CI Tests (Preview CI)
- Connectivity tests: `pnpm test:ci:connectivity`
- Configuration validation: `pnpm test:ci:config`
- Deployment builds: `nx affected --target=build`

## Troubleshooting

### Common Issues

#### 1. Development CI Not Triggering
**Problem**: Push to fork doesn't trigger Nx Cloud CI

**Check:**
```bash
# Verify you're pushing to the right remote
git remote -v
git branch -vv

# Should show fork as the remote for dev branch
```

**Solution:**
```bash
# Ensure proper branch tracking
git checkout dev
git branch --set-upstream-to=fork/dev dev
git push fork dev
```

#### 2. Preview CI Not Running
**Problem**: Push to preview repo doesn't trigger deployment validation

**Check:**
```bash
# Verify preview repo has the workflow
git ls-remote origin | grep refs/heads
```

**Solution:**
```bash
# Ensure workflows are on main branch of preview repo
git fetch origin
git log origin/main --oneline -3
# Should show dual CI commit
```

#### 3. Nx Cloud Authentication Issues
**Problem**: Nx Cloud workspace not accessible

**Solution:**
1. Visit https://cloud.nx.app/
2. Sign in with GitHub account
3. Verify workspace `6857fccbb755d4191ce6fbe4` is accessible
4. Check `nx.json` contains correct `nxCloudId`

#### 4. Workflow Permissions
**Problem**: CI failing due to permission issues

**Check:**
- Fork PRs have restricted secrets access (expected)
- Preview repo has required secrets configured
- Workflow permissions are correctly set

### Performance Monitoring

#### Development CI Targets
- **Selective tests**: < 30s
- **Comprehensive suite**: < 300s
- **With Nx cache**: ~70% faster subsequent runs

#### Preview CI Targets  
- **Full validation**: < 180s
- **Deployment**: < 60s additional

### Cost Management

#### Development Fork (Your Account)
- Nx Cloud: Free tier covers most usage
- GitHub Actions: Included in free tier
- Monitor usage via Nx Cloud dashboard

#### Preview Repo (Organization Account)
- Minimal CI usage (lightweight validation only)
- Primary cost is GitHub Pages hosting (free)

## Maintenance

### Monthly Tasks
1. **Monitor Nx Cloud usage** in dashboard
2. **Review CI performance** metrics
3. **Check for outdated dependencies** in workflows
4. **Verify backup remote** (backup remote) is up-to-date

### When Adding New Sites
1. **Update both CI workflows** with new site configurations
2. **Test deployment** on preview environment
3. **Verify Nx cache** works with new projects

### Workflow Updates
When modifying workflows:
1. **Test on development fork** first
2. **Push to preview repo** main branch to register changes
3. **Verify both environments** work correctly

## Architecture Benefits

### Development Benefits
- **Fast feedback** with Nx Cloud caching
- **Comprehensive testing** before client exposure
- **Cost-effective** development iteration
- **Full IDE integration** with local development

### Client Benefits
- **Reliable previews** with deployment validation
- **Fast updates** without full CI overhead
- **Production-like environment** for review
- **Consistent deployment** process

### Maintenance Benefits
- **Clear separation** of concerns
- **Independent scaling** of each CI system
- **Reduced complexity** in each workflow
- **Future flexibility** for production deployment

---

## Quick Reference

```bash
# Daily Development
git push-dev           # Comprehensive CI on fork

# Client Previews  
git push-preview       # Lightweight CI + deployment

# Sync Fork
git pull origin dev    # Get preview repo changes
git push fork dev      # Update fork

# Local Testing
pnpm test:pre-commit   # Fast pre-commit validation
pnpm test:comprehensive # Full local test suite

# Nx Cloud
nx affected --target=test  # Test affected projects
nx run-many --target=build --all  # Build all projects
```

---

*This documentation was created on June 30, 2025, for the IFLA Standards Development dual CI architecture.*