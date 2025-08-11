# GitHub Actions Workflows

## Active Workflows

### 🚀 Primary Deployment Pipeline

#### `nx-optimized-docs-deploy.yml`
- **Purpose**: Main deployment pipeline for documentation sites
- **Triggers**: Push to `preview` or `main` branches
- **Features**:
  - Nx affected detection for incremental builds
  - Parallel execution (4 processes)
  - Build caching with Nx
  - Admin tests excluded (documentation focus)
  - Build warnings and broken links detection
  - E2E smoke tests for deployed sites
- **Deploy Targets**: GitHub Pages (default), Netlify, Vercel

### ✅ Pull Request Validation

#### `pr-validation.yml`
- **Purpose**: Fast validation for pull requests
- **Triggers**: PR opened/synchronized on documentation paths
- **Features**:
  - Code quality checks (format, lint, typecheck)
  - Affected project testing
  - Preview builds
  - Lighthouse performance audits
  - Automated PR comments with results

### 🏥 Monitoring

#### `ci-health-check.yml`
- **Purpose**: Daily health monitoring of CI pipeline
- **Triggers**: Daily at 9 AM UTC or manual
- **Features**:
  - Workflow status monitoring
  - Dependency health checks
  - Security audits
  - Nx configuration validation

#### `check-warnings.yml`
- **Purpose**: Monitor and track code warnings
- **Triggers**: Push to main branches
- **Features**: Warning collection and reporting

### 🔧 Utilities

#### `simple-deploy.yml` (Fallback)
- **Purpose**: Minimal fallback deployment without optimizations
- **Triggers**: Manual only (requires reason)
- **Use Case**: Emergency deployments when optimized pipeline fails

## Disabled Workflows

The following workflows are disabled (`.disabled` extension) due to previous integration test issues:

- `ci-env-only.yml.disabled` - Environment-only CI tests
- `deploy-preview.yml.disabled` - Old preview deployment
- `deploy-production.yml.disabled` - Old production deployment
- `nx-optimized-preview.yml.disabled` - Original optimized preview (replaced)
- `nx-optimized-production.yml.disabled` - Original optimized production
- `nx-pr-validation.yml.disabled` - Old PR validation
- `phase-comprehensive-tests.yml.disabled` - Phase-based comprehensive tests
- `phase-integration-tests.yml.disabled` - Phase-based integration tests
- `phase-smoke-tests.yml.disabled` - Phase-based smoke tests
- `site-validation.yml.disabled` - Site validation workflow
- `smoke-tests-post-deploy.yml.disabled` - Post-deployment smoke tests

## Key Optimizations

### What's Improved
1. **Admin Exclusion**: All admin-related tests are excluded to avoid integration test failures
2. **Documentation Focus**: Workflows optimized for static site generation
3. **Incremental Builds**: Nx affected detection reduces build times
4. **Parallel Execution**: Tasks run in parallel where possible
5. **Smart Caching**: Nx cache and GitHub Actions cache reduce redundant work

### Performance Targets
- PR validation: < 10 minutes
- Documentation deployment: < 15 minutes
- E2E smoke tests: < 5 minutes

## Migration Guide

### From Old Workflows
1. **Preview Deployments**: Use `nx-optimized-docs-deploy.yml` instead of `deploy-preview.yml.disabled`
2. **PR Checks**: Use `pr-validation.yml` instead of `nx-pr-validation.yml.disabled`
3. **Integration Tests**: Excluded from CI, run locally with `pnpm test:integration`

### Running Locally
```bash
# Test what would be built
npx nx affected --target=build --base=origin/main --exclude=admin

# Run documentation tests only
npx nx run-many --target=test --projects=portal,isbd,isbdm,lrm,frbr,muldicat,unimarc,@ifla/theme

# Run PR validation locally
pnpm nx format:check
pnpm nx affected --target=lint --exclude=admin
pnpm nx affected --target=typecheck --exclude=admin
pnpm nx affected --target=test --exclude=admin
```

## Troubleshooting

### Workflow Failures
1. **Build failures**: Check Nx cache, clear with `npx nx reset`
2. **Test failures**: Run locally with `pnpm test` to debug
3. **Deployment failures**: Check GitHub Pages settings, use fallback if needed

### Common Issues
- **Admin tests running**: Ensure `--exclude=admin` is present in all nx commands
- **Slow builds**: Check if Nx cache is working, review affected detection
- **E2E failures**: These are non-blocking (continue-on-error: true)

## Environment Variables

Required secrets in GitHub:
- `NX_CLOUD_ACCESS_TOKEN` - Nx Cloud access (optional, for metrics)
- Standard GitHub Pages deployment permissions

## Maintenance

### Weekly Tasks
- Review CI health check reports
- Check for outdated dependencies
- Monitor workflow success rates

### Monthly Tasks
- Review and update disabled workflows
- Analyze build performance metrics
- Update optimization strategies based on metrics