# CI/CD Architecture Documentation

## Overview

This project uses a streamlined CI/CD architecture with clear environment separation. The workflow emphasizes local development and testing, direct deployment to preview environments, and controlled production releases through pull requests.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SIMPLIFIED CI/CD ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Local Development Environment                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Local Testing & Development                                         │   │
│  │ • All development happens locally                                  │   │
│  │ • Comprehensive testing before pushing                             │   │
│  │                                                                     │   │
│  │ ✅ Unit tests (475+ tests with Vitest)                             │   │
│  │ ✅ Integration tests (external services)                           │   │
│  │ ✅ E2E tests (Playwright)                                          │   │
│  │ ✅ TypeScript compilation                                          │   │
│  │ ✅ ESLint validation                                               │   │
│  │ ✅ Build validation                                                │   │
│  │ ✅ Git hooks (pre-commit, pre-push)                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      │ git push origin preview              │
│                                      ▼                                      │
│                                                                             │
│  Preview Environment (iflastandards/platform:preview)                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Preview Deployment & Validation                                     │   │
│  │ • Branch: preview                                                   │   │
│  │ • Purpose: Client review and integration testing                   │   │
│  │ • CI/CD: Automated deployment pipeline                             │   │
│  │                                                                     │   │
│  │ ✅ Build all sites                                                 │   │
│  │ ✅ Deploy to preview environment                                   │   │
│  │ ✅ Integration validation                                           │   │
│  │ ✅ Cross-site link checking                                        │   │
│  │ ✅ Client accessibility                                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      │ Pull Request                         │
│                                      ▼                                      │
│                                                                             │
│  Production Environment (iflastandards/platform:main)                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Production Deployment                                               │   │
│  │ • Branch: main (protected)                                         │   │
│  │ • Purpose: Live production site                                    │   │
│  │ • Deployment: Via approved pull requests only                      │   │
│  │                                                                     │   │
│  │ ✅ Full production build                                           │   │
│  │ ✅ Security validation                                             │   │
│  │ ✅ Performance optimization                                        │   │
│  │ ✅ CDN deployment                                                  │   │
│  │ ✅ Monitoring & alerting                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Repository Configuration

### Repository: iflastandards/platform
```bash
# Single remote for all environments
git remote -v
# origin   git@github.com:iflastandards/platform.git (fetch)
# origin   git@github.com:iflastandards/platform.git (push)
```

### Branch Structure
- **feature branches**: All development work
- **preview**: Integration and client review (protected)
- **main**: Production deployment (protected, requires PR)

## Workflow Documentation

### 1. Local Development Workflow

**Purpose**: Develop and thoroughly test all changes locally before deployment

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes
# ... edit files ...

# 3. Test locally (automated via git hooks)
pnpm test:pre-commit    # Runs on git commit
pnpm test:pre-push      # Runs on git push

# 4. Manual testing (optional but recommended)
pnpm test:comprehensive  # Full test suite
nx affected --target=test --parallel=3  # Test only changed projects
```

**Local Testing Commands:**
- `pnpm typecheck` - TypeScript validation
- `pnpm lint` - ESLint code quality
- `pnpm test` - Unit and integration tests
- `pnpm test:e2e` - End-to-end browser tests
- `nx build portal` - Build specific site
- `nx start portal` - Start dev server

### 2. Preview Deployment Workflow

**Purpose**: Deploy to preview environment for integration testing and client review

```bash
# 1. Push to preview branch (after local testing)
git push origin feature/your-feature-name:preview

# Alternative: Create PR to preview branch
git push origin feature/your-feature-name
# Then create PR on GitHub to merge into preview branch
```

**What happens:**
- Triggers automated CI/CD pipeline
- Builds all sites and the admin portal
- Deploys to preview environment
- Runs integration tests
- Validates cross-site functionality

**Preview Access:**
- URL: Configured preview URL
- Environment: `DOCS_ENV=preview`
- Purpose: Client review, integration testing

### 3. Production Deployment Workflow

**Purpose**: Deploy thoroughly tested changes to production

```bash
# 1. Ensure preview deployment is stable and approved

# 2. Create pull request from preview to main
# This MUST be done via GitHub UI or API

# 3. PR Review process:
# - Code review by team members
# - Automated CI checks must pass
# - Client approval confirmation
# - Security and performance validation

# 4. Merge PR (authorized maintainers only)
# Production deployment happens automatically
```

**Production safeguards:**
- Protected branch rules on main
- Required PR reviews
- CI/CD validation must pass
- No direct pushes allowed

## Environment Configuration

### Local Environment
```yaml
DOCS_ENV: local
Ports: 3000-3008 (Docusaurus sites), 4200 (Admin)
Purpose: Development and testing
```

### Preview Environment
```yaml
DOCS_ENV: preview
Branch: preview
URL: [Preview deployment URL]
Purpose: Integration testing, client review
```

### Production Environment
```yaml
DOCS_ENV: production
Branch: main
URL: https://www.iflastandards.info
Purpose: Live public site
```

## Testing Strategy

### Pre-commit Tests (Automatic)
**File**: `.husky/pre-commit`
- TypeScript checking
- ESLint validation
- Unit tests
- Configuration validation
- **Target**: < 60 seconds

### Pre-push Tests (Automatic)
**File**: `.husky/pre-push-optimized`
- Branch-aware testing
- Protected branches: Full validation
- Feature branches: Affected testing only
- **Target**: < 180 seconds

### Comprehensive Testing
```bash
# Full local test suite
pnpm test:comprehensive

# Includes:
# - All unit tests (475+)
# - Integration tests
# - E2E browser tests
# - Build validation
# - Link checking
```

## CI/CD Pipeline Details

### Preview Pipeline
**Trigger**: Push to preview branch
**Steps**:
1. Checkout code
2. Install dependencies
3. Run linting and type checking
4. Build theme package
5. Build all Docusaurus sites
6. Build admin portal
7. Run integration tests
8. Deploy to preview environment
9. Post-deployment validation

### Production Pipeline
**Trigger**: Merge PR to main branch
**Steps**:
1. All preview pipeline steps
2. Security scanning
3. Performance optimization
4. Production build with minification
5. Deploy to CDN
6. Cache invalidation
7. Monitoring setup
8. Notification of deployment

## Nx Workspace Optimization

### Commands
```bash
# Build affected projects only
nx affected --target=build

# Test affected projects
nx affected --target=test

# Build specific site
nx build portal

# Serve specific site
nx serve isbdm

# Run many in parallel
nx run-many --target=test --all --parallel=3
```

### Benefits
- Smart caching reduces build times
- Affected detection minimizes unnecessary work
- Parallel execution speeds up CI/CD
- Consistent tooling across all projects

## Troubleshooting

### Common Issues

#### 1. Local Tests Failing
```bash
# Clear Nx cache
nx reset

# Reinstall dependencies
pnpm install

# Run specific test
nx test @ifla/theme --watch
```

#### 2. Preview Deployment Issues
```bash
# Check git status
git status

# Ensure on correct branch
git branch -a

# Force push if needed (carefully)
git push origin preview --force-with-lease
```

#### 3. Build Failures
```bash
# Check for TypeScript errors
pnpm typecheck

# Validate configurations
node scripts/test-site-builds.js --site all --env preview

# Build single site for debugging
nx build portal --verbose
```

## Best Practices

### Development
1. **Always test locally** before pushing
2. **Use feature branches** for all work
3. **Write descriptive commit messages**
4. **Keep PRs focused** on single features/fixes

### Testing
1. **Run affected tests** frequently during development
2. **Don't skip pre-commit hooks** without good reason
3. **Add tests** for new features
4. **Update tests** when changing functionality

### Deployment
1. **Never push directly to main**
2. **Test on preview** before production
3. **Document breaking changes**
4. **Coordinate** major deployments with team

## Quick Reference

```bash
# Local Development
git checkout -b feature/my-feature
pnpm test:affected
git commit -m "feat: add new feature"
git push origin feature/my-feature

# Deploy to Preview
git push origin feature/my-feature:preview
# OR create PR to preview branch

# Deploy to Production
# Create PR from preview to main on GitHub
# Get reviews and approval
# Merge when ready

# Useful Commands
nx affected --target=test        # Test changed projects
nx build portal                  # Build single site
pnpm test:comprehensive          # Full test suite
pnpm start:robust                # Start all sites locally
```

---

*This documentation was updated on January 7, 2025, to reflect the simplified CI/CD architecture.*